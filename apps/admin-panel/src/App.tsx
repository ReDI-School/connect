import React, { FC, useCallback, useEffect, useState } from 'react'
import { get, mapValues, keyBy, groupBy } from 'lodash'
import {
  Admin,
  Resource,
  List,
  Tab,
  Create,
  Pagination,
  Filter,
  Datagrid,
  TabbedForm,
  FunctionField,
  TabbedShowLayout,
  TextField,
  ReferenceInput,
  AutocompleteInput,
  DateField,
  TextInput,
  BooleanInput,
  NullableBooleanInput,
  NumberField,
  FormTab,
  NumberInput,
  Show,
  ShowButton,
  LongTextInput,
  CardActions,
  DateInput,
  EditButton,
  SelectInput,
  Edit,
  SimpleForm,
  ArrayField,
  BooleanField,
  SimpleShowLayout,
  SelectArrayInput,
  downloadCSV,
  ReferenceField,
  Labeled,
  ReferenceManyField,
  SearchInput,
} from 'react-admin'
import classNames from 'classnames'
import { unparse as convertToCSV } from 'papaparse/papaparse.min'
import { createStyles, withStyles } from '@material-ui/core'
import { Person as PersonIcon } from '@material-ui/icons'
import Button from '@material-ui/core/Button'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import DateFnsUtils from '@date-io/date-fns'

import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers'

import {
  REDI_LOCATION_NAMES,
  LANGUAGES,
  CATEGORY_GROUPS,
  CATEGORIES,
  COURSES,
  GENDERS,
  MENTORING_SESSION_DURATION_OPTIONS,
  RED_MATCH_STATUSES,
} from '@talent-connect/shared-config'

import { calculateAge } from '@talent-connect/shared-utils'

import { howDidHearAboutRediOptions } from '@talent-connect/talent-pool/config'

import loopbackClient, { authProvider } from './lib/react-admin-loopback/src'
import { ApproveButton } from './components/ApproveButton'
import { DeclineButton } from './components/DeclineButton'
import { TpJobSeekerProfileApproveButton } from './components/TpJobSeekerProfileApproveButton'
import { TpJobSeekerProfileDeclineButton } from './components/TpJobSeekerProfileDeclineButton'
import { TpCompanyProfileApproveButton } from './components/TpCompanyProfileApproveButton'

import { API_URL } from './config'
import {
  TpJobSeekerProfileState,
  TpCompanyProfileState,
} from '@talent-connect/shared-types'

import { objectEntries, objectValues, mapOptionsObject } from '@talent-connect/typescript-utilities'

/** REFERENCE DATA */

const rediLocations = mapOptionsObject(REDI_LOCATION_NAMES)

const categoriesFlat = CATEGORIES.map((cat) => ({
  ...cat,
  labelClean: cat.label,
  label: `${cat.label} (${cat.group})`,
}))

const coursesByLocation = groupBy(COURSES, 'location')
const coursesFlat = [
  ...coursesByLocation.berlin.map((cat) =>
    Object.assign(cat, { label: `Berlin: ${cat.label}` })
  ),
  ...coursesByLocation.munich.map((cat) =>
    Object.assign(cat, { label: `Munich: ${cat.label}` })
  ),
  ...coursesByLocation.nrw.map((cat) =>
    Object.assign(cat, { label: `NRW: ${cat.label}` })
  ),
]

const categoriesIdToLabelCleanMap =
  mapValues(keyBy(categoriesFlat, 'id'), 'labelClean')

const categoriesIdToGroupMap =
  mapValues(keyBy(categoriesFlat, 'id'), 'group')

const genders = [
  ...objectEntries(GENDERS).map((id, name) => ({ id, name })),
  { id: '', name: 'Prefers not to answer' },
]

const languages = LANGUAGES.map((lang) => ({ id: lang, name: lang }))

const courseIdToLabelMap = mapValues(keyBy(coursesFlat, 'id'), 'label')
const AWS_PROFILE_AVATARS_BUCKET_BASE_URL =
  'https://s3-eu-west-1.amazonaws.com/redi-connect-profile-avatars/'

export const formRedMatchStatuses = objectEntries(RED_MATCH_STATUSES).map(
  ([key, value]) => ({ id: key, name: value })
)

/** START OF SHARED STUFF */

interface RecordProps {
  addLabel?: boolean;
  label?: string
}

const RecordCreatedAt: FC<RecordProps> = ({ addLabel = true, label = 'Record created at' }) => {
  return (
    <DateField source="createdAt" {...{ addLabel, label }} />
  );
}

const RecordUpdatedAt: FC<RecordProps> = ({ addLabel = true, label = 'Record updated at' }) => {
  return (
    <DateField source="updatedAt" {...{ addLabel, label }} />
  )
}

const LanguageList: FC<{ data?: Record<string, string> }> = ({ data }) => {
  return <span>{data ? Object.values(data).join(', ') : null}</span>
}

const CategoryList: FC<{ data: any }> = ({ data }) => {
  const categoriesGrouped = groupBy(
    data,
    (catId) => categoriesIdToGroupMap[catId]
  )
  return (
    <>
      {Object.keys(categoriesGrouped).map((groupId, index) => (
        <React.Fragment key={index}>
          <span>
            <strong>{CATEGORY_GROUPS[groupId]}:</strong>{' '}
            {categoriesGrouped[groupId]
              .map((catId) => categoriesIdToLabelCleanMap[catId])
              .join(', ')}
          </span>
          <br />
        </React.Fragment>
      ))}
    </>
  )
}

const styles = createStyles({
  avatarImage: {
    width: '500px',
    height: '500px',
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
  },
})

const Avatar = withStyles(styles)(({ record, className, classes, style }) => (
  <>
    {!record && (
      <PersonIcon
        className={classNames(classes.avatarImage, className)}
        color="primary"
      />
    )}
    {record?.profileAvatarImageS3Key && (
      <div
        id="yalla"
        style={{
          backgroundImage: `url(${
            AWS_PROFILE_AVATARS_BUCKET_BASE_URL + record.profileAvatarImageS3Key
          })`,
          ...style,
        }}
        className={classNames(classes.avatarImage, className)}
      />
    )}
  </>
))

/** END OF SHARED STUFF */
const AllModelsPagination: FC = (props) => (
  <Pagination
    rowsPerPageOptions={[10, 25, 50, 100, 250, 500, 1000]}
    {...props}
  />
)

const RedProfileList: FC = (props) => {
  return (
    <List
      {...props}
      filters={<RedProfileListFilters />}
      pagination={<AllModelsPagination />}
      aside={<FreeMenteeSpotsPerLocationAside />}
    >
      <Datagrid expand={<RedProfileListExpandPane />}>
        <TextField source="rediLocation" label="City" />
        <TextField source="firstName" />
        <TextField source="lastName" />
        <FunctionField
          source="userType"
          label="User type"
          render={userTypeToEmoji}
        />
        ;
        <TextField
          source="currentFreeMenteeSpots"
          label="Free spots"
          sortable={false}
        />
        <TextField
          source="currentMenteeCount"
          label="Current mentee count"
          sortable={false}
        />
        <TextField
          source="activeMentorMatchesCount"
          label="Current mentor count"
          sortable={false}
        />
        <TextField
          source="menteeCountCapacity"
          label="Total mentee capacity"
          sortable={false}
        />
        <TextField
          source="totalRedMatchCount"
          label="RedMatch #"
          sortable={false}
        />
        <BooleanField source="userActivated" />
        <DateField
          showTime
          source="lastLoginDateTime"
          label="Last Login"
          {...props}
          sortable={false}
        />
        <RecordCreatedAt />
        <ShowButton />
        <EditButton />
      </Datagrid>
    </List>
  )
}

const FreeMenteeSpotsPerLocationAside: FC = () => {
  const [mentorsList, setMentorsList] = useState([])

  useEffect(() => {
    dataProvider('GET_LIST', 'redProfiles', {
      pagination: { page: 1, perPage: 0 },
      sort: {},
      filter: { userType: 'mentor' },
    }).then(({ data }) => setMentorsList(data))
  }, [])

  function getFreeSpotsCount (location) {
    return mentorsList
      .filter(({ rediLocation }) => rediLocation === location)
      .filter(({ userActivated }) => userActivated)
      .reduce((acc, curr) => acc + curr.currentFreeMenteeSpots, 0)
  }

  const totalFreeMenteeSpotsBerlin = getFreeSpotsCount('berlin')
  const totalFreeMenteeSpotsMunich = getFreeSpotsCount('munich')
  const totalFreeMenteeSpotsNRW = getFreeSpotsCount('nrw')

  return (
    <div>
      <Card style={{ width: 270, marginLeft: '1em' }}>
        <CardContent style={{ paddingBottom: '16px' }}>
          <Typography gutterBottom>Free Mentee Spots Per Location</Typography>
          <Typography variant="body2" gutterBottom>
            Berlin: {totalFreeMenteeSpotsBerlin} mentoring spots available
          </Typography>
          <Typography variant="body2" gutterBottom>
            Munich: {totalFreeMenteeSpotsMunich} mentoring spots available
          </Typography>
          <Typography variant="body2">
            NRW: {totalFreeMenteeSpotsNRW} mentoring spots available
          </Typography>
        </CardContent>
      </Card>
    </div>
  )
}

const RedProfileListExpandPane: FC = (props) => {
  return (
    <Show {...props} title="">
      <SimpleShowLayout>
        <ArrayField source="categories">
          <CategoryList data={{}}/>
        </ArrayField>
        <MenteeEnrolledInCourseField />
        <TextField source="contactEmail" />
        <RecordCreatedAt />
        <RecordUpdatedAt />
      </SimpleShowLayout>
    </Show>
  )
}

const RedProfileListFilters: FC = (props) => (
  <Filter {...props}>
    <TextInput label="Search by name" source="q" />
    <SelectInput
      source="categories"
      choices={categoriesFlat.map(({ id, label }) => ({ id, name: label }))}
    />
    <SelectInput
      source="userType"
      choices={[
        { id: 'mentor', name: 'mentor' },
        { id: 'mentee', name: 'mentee' },
        {
          id: 'public-sign-up-mentor-pending-review',
          name: 'Mentor pending review (signed up via public sign-up form)',
        },
        {
          id: 'public-sign-up-mentee-pending-review',
          name: 'Mentee pending review (signed up via public sign-up form)',
        },
        { id: 'public-sign-up-mentor-rejected', name: 'Rejected mentor' },
        { id: 'public-sign-up-mentee-rejected', name: 'Rejected mentee' },
      ]}
    />
    <SelectInput
      source="rediLocation"
      choices={rediLocations.map(({ id, label }) => ({ id, name: label }))}
    />
    <SelectInput
      source="mentee_currentlyEnrolledInCourse"
      choices={coursesFlat.map(({ id, label }) => ({ id, name: label }))}
    />
    <NullableBooleanInput
      label="User activated yes/no"
      source="userActivated"
    />
  </Filter>
)
function userTypeToEmoji({ userType }) {
  const emoji = {
    mentor: '🎁 Mentor',
    mentee: '💎 Mentee',
    'public-sign-up-mentor-pending-review': '💣 Mentor (pending review)',
    'public-sign-up-mentee-pending-review': '🧨 Mentee (pending review)',
    'public-sign-up-mentor-rejected': '❌🎁 Mentor (rejected)',
    'public-sign-up-mentee-rejected': '❌💎Mentee (rejected)',
  }[userType]
  return emoji ?? userType
}

const RedProfileShow: FC = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TabbedShowLayout>
        <Tab label="Profile">
          <TextField source="rediLocation" label="ReDI City" />
          <TextField source="userType" />
          <BooleanField source="userActivated" />
          <Avatar />
          <TextField source="firstName" />
          <TextField source="lastName" />
          <TextField source="gender" />
          <FunctionField
            label="Age"
            render={(person) => calculateAge(person.birthDate)}
          />
          <DateField
            source="birthDate"
            label="Date of birth"
            options={{ year: 'numeric', month: 'long', day: '2-digit' }}
          />
          <ArrayField source="languages">
            <LanguageList />
          </ArrayField>
          <TextField source="otherLanguages" />
          <TextField source="personalDescription" />
          <TextField source="expectations" />
          <TextField source="contactEmail" />
          <TextField source="linkedInProfileUrl" />
          <TextField source="githubProfileUrl" />
          <TextField source="slackUsername" />
          <TextField source="telephoneNumber" />

          <ArrayField source="categories">
            <CategoryList data={{}}/>
          </ArrayField>
          <ReferenceManyField
            label="Mentees (applied/accepted/completed/cancelled)"
            reference="redMatches"
            target="mentorId"
          >
            <Datagrid>
              <FullName
                sourcePrefix="mentee."
                record={{}}
              />
              <TextField source="status" />
              <ShowButton />
            </Datagrid>
          </ReferenceManyField>
          <ReferenceManyField
            label="Mentors (applied/accepted/completed/cancelled)"
            reference="redMatches"
            target="menteeId"
          >
            <Datagrid>
              <FullName
                sourcePrefix="mentor."
                record={{}}
              />
              <TextField source="status" />
              <ShowButton />
            </Datagrid>
          </ReferenceManyField>
          <h4>Mentor-specific fields:</h4>
          <TextField source="mentor_occupation" label="Occupation" />
          <TextField source="mentor_workPlace" label="Place of work" />
          <NumberField
            source="menteeCountCapacity"
            label="Total mentee count capacity"
          />
          <h4>Mentee-specific fields:</h4>
          <TextField
            source="mentee_occupationCategoryId"
            label="Type of occupation"
          />
          <TextField
            source="mentee_occupationJob_placeOfEmployment"
            label="If occupation = job, place of employment"
          />
          <TextField
            source="mentee_occupationJob_position"
            label="If occupation = job, position"
          />
          <TextField
            source="mentee_occupationStudent_studyPlace"
            label="If occupation = student, place of study"
          />
          <TextField
            source="mentee_occupationStudent_studyName"
            label="If occupation = student, name of study"
          />
          <TextField
            source="mentee_occupationLookingForJob_what"
            label="If occupation = looking for a job, description of what"
          />
          <TextField
            source="mentee_occupationOther_description"
            label="If occupation = other, description of what"
          />
          <TextField
            source="mentee_highestEducationLevel"
            label="Highest education level"
          />
          <MenteeEnrolledInCourseField />
          <h4>Record information</h4>
          <RecordCreatedAt />
          <RecordUpdatedAt />
          <DateField
            showTime
            source="lastLoginDateTime"
            label="Last Login"
            {...props}
            sortable={false}
          />
          <h4>
            Typeform information (for mentors/mentees originally signed up via
            typeform)
          </h4>
          <TextField
            source="mentor_ifTypeForm_submittedAt"
            label="Typeform: submitted at"
          />
          <TextField source="mentee_ifTypeForm_additionalComments" />
          <TextField
            source="ifTypeForm_additionalComments"
            label="Typeform: additional comments"
          />
        </Tab>
        <Tab label="Internal comments">
          <TextField
            source="administratorInternalComment"
            style={{ whiteSpace: 'pre-wrap' }}
          />
        </Tab>
      </TabbedShowLayout>
    </SimpleShowLayout>
  </Show>
)

const RedProfileEditActions: FC = (props) => {
  const userType = props.data?.userType
  if (
    ![
      'public-sign-up-mentor-pending-review',
      'public-sign-up-mentee-pending-review',
    ].includes(userType)
  ) return null
  return (
    <CardActions>
      User is pending. Please
      <ApproveButton {...props} /> or
      <DeclineButton {...props} />
    </CardActions>
  )
}

const RedProfileEdit: FC = (props) => (
  <Edit {...props} actions={<RedProfileEditActions />}>
    <TabbedForm>
      <FormTab label="Profile">
        <TextField source="userType" />
        <BooleanInput source="userActivated" />
        <TextInput
          source="profileAvatarImageS3Key"
          label="Photo file name"
          helperText="Empty this field to clear the user's photo"
        />
        <TextInput source="firstName" />
        <TextInput source="lastName" />
        <SelectInput source="gender" choices={genders} />
        <DateInput source="birthDate" label="Date of birth" />
        <SelectArrayInput source="languages" choices={languages} />
        <TextInput source="otherLanguages" />
        <TextInput source="personalDescription" multiline />
        <TextInput source="expectations" multiline />
        <TextInput source="contactEmail" />
        <TextInput source="linkedInProfileUrl" />
        <TextInput source="githubProfileUrl" />
        <TextInput source="slackUsername" />
        <TextInput source="telephoneNumber" />
        <CategoriesInput />
        <MenteeEnrolledInCourseInput />
        <NumberInput source="menteeCountCapacity" />
        <BooleanInput source="optOutOfMenteesFromOtherRediLocation" />
      </FormTab>
      <FormTab label="Internal comments">
        <LongTextInput source="administratorInternalComment" />
      </FormTab>
    </TabbedForm>
  </Edit>
)

const CategoriesInput: FC = (props) => {
  const categories = categoriesFlat
  return (
    <SelectArrayInput
      {...props}
      source="categories"
      label="Categories"
      choices={categories.map(({ id, label }) => ({ id, name: label }))}
    />
  )
}

const MenteeEnrolledInCourseField: FC<{ record: any }> = (props) => {
  return (
    <Labeled label="Currently enrolled in course">
      <span>
        {courseIdToLabelMap[props.record.mentee_currentlyEnrolledInCourse]}
      </span>
    </Labeled>
  )
}

const MenteeEnrolledInCourseInput: FC<{ record: any }> = (props) => {
  const courses = coursesByLocation[props.record.rediLocation]
  return (
    <SelectInput
      {...props}
      source="mentee_currentlyEnrolledInCourse"
      label={`Course (ONLY for ${props.record.rediLocation})  `}
      choices={courses.map(({ id, label }) => ({ id, name: label }))}
    />
  )
}

interface FullNameProps {
  sourcePrefix: 'mentee' | 'mentor' | '';
  record: Record<string, string> // TODO
}

const FullName: FC<FullNameProps> = ({ record, sourcePrefix: source = '' }) => {
  return (
    <span>
      {get(record, `${source}firstName`)}{' '}
      {get(record, `${source}lastName`)}
    </span>
  )
}

const RedMatchList: FC = (props) => (
  <List
    {...props}
    sort={{ field: 'createdAt', order: 'DESC' }}
    pagination={<AllModelsPagination />}
    filters={<RedMatchListFilters />}
  >
    <Datagrid>
      <TextField source="rediLocation" label="City" />
      <DateField source="createdAt" label="Record created at" />
      <ReferenceField label="Mentee" source="menteeId" reference="redProfiles">
        <FullName
          sourcePrefix="mentee"
          record={{}}
        />
      </ReferenceField>
      <ReferenceField label="Mentor" source="mentorId" reference="redProfiles">
        <FullName
          sourcePrefix="mentor"
          record={{}}
        />
      </ReferenceField>
      <TextField source="status" />
      <ShowButton />
      <EditButton />
    </Datagrid>
  </List>
)
const RedMatchListFilters: FC = (props) => (
  <Filter {...props}>
    <SelectInput source="status" choices={formRedMatchStatuses} />
    <SelectInput
      source="rediLocation"
      choices={rediLocations.map(({ id, label }) => ({ id, name: label }))}
    />
  </Filter>
)
const RedMatchShow: FC = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="status" />
      <ReferenceField label="Mentee" source="menteeId" reference="redProfiles">
        <FullName
          sourcePrefix="mentee"
          record={{}}
        />
      </ReferenceField>
      <ReferenceField label="Mentor" source="mentorId" reference="redProfiles">
        <FullName
          sourcePrefix="mentor"
          record={{}}
        />
      </ReferenceField>

      <TextField
        source="applicationText"
        label="Application text"
        helperText="Field contains the application text that a mentee as an application to a mentor when asking for mentorship."
      />
      <TextField
        source="expectationText"
        label="Expectation text"
        helperText="Field contains the expectation text that a mentee as an application to a mentor when asking for mentorship."
      />
      <TextField
        source="mentorReplyMessageOnAccept"
        label="Mentor's reply message to mentee's application (on accepting the application)"
        helperText="This field contains the message a mentor sends to his mentee when accepting the mentee's application"
      />
      <TextField
        source="mentorMessageOnComplete"
        label="Mentor's reply to our 'Is there anything you would like us to know about the mentorship match?' question on marking the mentorship as complete"
        helperText="This field contains the message a mentor on completion the mentee's mentorship"
      />
      <BooleanField
        source="hasMenteeDismissedMentorshipApplicationAcceptedNotification"
        valueLabelTrue="Mentee has seen the notification"
        valueLabelFalse="Mentee has not seen the notification"
      />
      <TextField
        source="matchMadeActiveOn"
        label="If match is/was active, when was it made active?"
      />
      <RecordCreatedAt />
      <RecordUpdatedAt />
      <h3>Information about a mentor declining the mentorship</h3>
      <TextField
        source="ifDeclinedByMentor_chosenReasonForDecline"
        label="Reason chosen for decline"
      />
      <TextField
        source="ifDeclinedByMentor_ifReasonIsOther_freeText"
        label="If reason was other, free text field"
      />
      <TextField
        source="ifDeclinedByMentor_optionalMessageToMentee"
        label="Optional message by mentor to mentee written on moment of decline"
        helperText="This field shows the date and time of when a mentor declined this mentorship application from the mentee"
      />
      <DateField
        source="ifDeclinedByMentor_dateTime"
        label="When did the mentor decline?"
      />

      <RedMatchShow_RelatedMentoringSessions record={{}} />
    </SimpleShowLayout>
  </Show>
)
const RedMatchShow_RelatedMentoringSessions: FC<{ record: any }> = ({ // TODO:  type
  record: { mentorId, menteeId },
}) => {
  const [mentoringSessions, setMentoringSessions] = useState([])
  useEffect(() => {
    dataProvider('GET_LIST', 'redMentoringSessions', {
      pagination: { page: 1, perPage: 0 },
      sort: { field: 'date', order: 'ASC' },
      filter: { mentorId, menteeId },
    }).then(({ data }) => setMentoringSessions(data))
  }, [])
  const totalDuration = mentoringSessions.reduce(
    (acc, curr) => acc + curr.minuteDuration,
    0
  )
  if (!mentoringSessions?.length) {
    return <h3>NO mentoring sessions registerd yet.</h3>
  }

  return (
    mentoringSessions?.length && (
      <>
        <h3>Mentoring sessions registered</h3>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Table size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell align="right">Date</TableCell>
                <TableCell align="right">Duration in minutes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mentoringSessions.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell align="right">
                    {new Date(row.date).toLocaleDateString('de-DE')}
                  </TableCell>
                  <TableCell align="right">{row.minuteDuration}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell />
                <TableCell align="right">
                  <strong>Total</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>{totalDuration}</strong>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </>
    )
  )
}

const RedMatchCreate: FC = (props) => (
  <Create {...props}>
    <SimpleForm>
      <SelectInput
        source="status"
        choices={[
          { id: 'applied', name: 'Applied' },
          { id: 'accepted', name: 'Accepted' },
          { id: 'completed', name: 'Completed' },
          { id: 'cancelled', name: 'Cancelled' },
        ]}
      />
      <ReferenceInput
        label="Mentor"
        source="mentorId"
        reference="redProfiles"
        perPage={0}
        filter={{ userType: 'mentor' }}
      >
        <AutocompleteInput
          optionText={(op) => `${op.firstName} ${op.lastName}`}
        />
      </ReferenceInput>
      <ReferenceInput
        label="Mentee"
        source="menteeId"
        reference="redProfiles"
        perPage={0}
        filter={{ userType: 'mentee' }}
      >
        <AutocompleteInput
          optionText={(op) => `${op.firstName} ${op.lastName}`}
        />
      </ReferenceInput>
      <LongTextInput
        source="applicationText"
        label="Application text"
        helperText="Field contains the text that a mentee as an application to a mentor when asking for mentorship."
      />
      <TextInput
        source="matchMadeActiveOn"
        label="If match is/was active, when was it made active?"
      />
    </SimpleForm>
  </Create>
)

const RedMatchEdit: FC = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <SelectInput source="status" choices={formRedMatchStatuses} />
      <ReferenceInput
        label="Mentor"
        source="mentorId"
        reference="redProfiles"
        perPage={0}
        filter={{ userType: 'mentor' }}
      >
        <AutocompleteInput
          optionText={(op) => `${op.firstName} ${op.lastName}`}
        />
      </ReferenceInput>
      <ReferenceInput
        label="Mentee"
        source="menteeId"
        reference="redProfiles"
        perPage={0}
        filter={{ userType: 'mentee' }}
      >
        <AutocompleteInput
          optionText={(op) => `${op.firstName} ${op.lastName}`}
        />
      </ReferenceInput>
      <LongTextInput
        source="applicationText"
        label="Application text"
        helperText="Field contains the application text that a mentee as an application to a mentor when asking for mentorship."
      />
      <LongTextInput
        source="expectationText"
        label="Expectation text"
        helperText="Field contains the expectation text that a mentee as an application to a mentor when asking for mentorship."
      />
      <LongTextInput
        source="mentorReplyMessageOnAccept"
        label="Mentor's reply message to mentee's application (on accepting the application)"
        helperText="This field contains the message a mentor sends to his mentee when accepting the mentee's application"
      />
      <LongTextInput
        source="mentorMessageOnComplete"
        label="Mentor's reply to our 'Is there anything you would like us to know about the mentorship match?' question on marking the mentorship as complete"
        helperText="This field contains the message a mentor on completion the mentee's mentorship"
      />
      <TextInput
        source="matchMadeActiveOn"
        label="If match is/was active, when was it made active?"
      />
      <h3>Information about a mentor declining the mentorship</h3>
      <TextInput
        source="ifDeclinedByMentor_chosenReasonForDecline"
        label="Reason chosen for decline"
      />
      <TextInput
        source="ifDeclinedByMentor_ifReasonIsOther_freeText"
        label="If reason was other, free text field"
      />
      <TextInput
        source="ifDeclinedByMentor_optionalMessageToMentee"
        label="Optional message by mentor to mentee written on moment of decline"
        helperText="This field shows the date and time of when a mentor declined this mentorship application from the mentee"
      />
      <TextInput
        source="ifDeclinedByMentor_dateTime"
        label="If watch was declined by mentor, when?"
        helperText="This field shows the date and time of when a mentor declined this mentorship application from the mentee"
      />
    </SimpleForm>
  </Edit>
)

const exporter = async (mentoringSessions, fetchRelatedRecords) => {
  const mentors = await fetchRelatedRecords(
    mentoringSessions,
    'mentorId',
    'redProfiles'
  )
  const mentees = await fetchRelatedRecords(
    mentoringSessions,
    'menteeId',
    'redProfiles'
  )
  const data = mentoringSessions.map((session) => {
    const mentor = mentors[session.mentorId]
    const mentee = mentees[session.menteeId]
    if (mentor) session.mentorName = `${mentor.firstName} ${mentor.lastName}`
    if (mentee) session.menteeName = `${mentee.firstName} ${mentee.lastName}`
    return session
  })
  const csv = convertToCSV({
    data,
    fields: [
      'id',
      'date',
      'minuteDuration',
      'mentorName',
      'menteeName',
      'createdAt',
      'updatedAt',
    ],
  })
  downloadCSV(csv, 'yalla')
}

const RedMentoringSessionList: FC = (props) => (
  <List
    {...props}
    exporter={exporter}
    pagination={<AllModelsPagination />}
    aside={<RedMentoringSessionListAside />}
    filters={<RedMentoringSessionListFilters />}
  >
    <Datagrid>
      <TextField source="rediLocation" label="City" />
      <ReferenceField label="Mentee" source="menteeId" reference="redProfiles">
        <FullName
          sourcePrefix="mentee"
          record={{}} />
      </ReferenceField>
      <ReferenceField label="Mentor" source="mentorId" reference="redProfiles">
        <FullName
          sourcePrefix="mentor"
          record={{}}
        />
      </ReferenceField>
      <DateField source="date" />
      <NumberField source="minuteDuration" />
      <ShowButton />
      <EditButton />
    </Datagrid>
  </List>
)
const RedMentoringSessionListFilters: FC = (props) => (
  <Filter {...props}>
    <SelectInput
      source="rediLocation"
      choices={rediLocations.map(({ value, label }) => ({ id: value, name: label }))}
    />
  </Filter>
)
const RedMentoringSessionListAside: FC = () => {
  const [fromDate, setFromDate] = useState(null)
  const [toDate, setToDate] = useState(null)
  const [rediLocation, setRediLocation] = useState(undefined)
  const [loadState, setLoadState] = useState('pending')
  const [result, setResult] = useState(null)
  const [step, setStep] = useState(0)
  const increaseStep = () => setStep((step) => step + 1)

  const picker = (getter, setter, label) => (
    <KeyboardDatePicker
      disableToolbar
      variant="inline"
      format="MM/dd/yyyy"
      margin="normal"
      id="date-picker-inline"
      label={label}
      value={getter}
      onChange={setter}
      disabled={result === 'loading'}
      KeyboardButtonProps={{
        'aria-label': 'change date',
      }}
    />
  )

  const valid = fromDate && toDate && toDate > fromDate
  const doLoad = useCallback(() => (async () => {  
      if (!valid) return
    
      setLoadState('loading')
      setStep(0)
      const { data } = await dataProvider(
        'GET_LIST',
        'redMentoringSessions',
        {
          pagination: { page: 1, perPage: 0 },
          sort: {},
          filter: { date: { gte: fromDate, lte: toDate }, rediLocation },
        }
      )
      setLoadState('success')
      setResult(data.reduce((acc, curr) => acc + curr.minuteDuration, 0))
    })(),
    []
  )

  return (
    <div style={{ width: 200, margin: '1em' }}>
      <Typography>Isabelle Calculator</Typography>
      <Typography variant="body1" />
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        {picker(fromDate, setFromDate, 'From date')}
        {picker(toDate, setToDate, 'To date')}
      </MuiPickersUtilsProvider>
      <FormControl style={{ width: '100%' }}>
        <InputLabel>City</InputLabel>
        <Select
          value={rediLocation}
          onChange={(e) => setRediLocation(e.target.value)}
        >
          <MenuItem value={undefined}>All cities</MenuItem>
          <MenuItem value="berlin">Berlin</MenuItem>
          <MenuItem value="munich">Munich</MenuItem>
          <MenuItem value="nrw">NRW</MenuItem>
        </Select>
      </FormControl>
      <div>
        <Button onClick={doLoad} disabled={!valid && loadState !== 'loading'}>
          Load
        </Button>
      </div>
      <div>
        {loadState === 'success' && step < 10 && (
          <Button onClick={increaseStep}>
            Are you{' '}
            {new Array(step)
              .fill(null)
              .map(() => 'really')
              .join(' ')}{' '}
            ReDI?
          </Button>
        )}
      </div>
      {step === 10 && (
        <Typography>
          Total: {result} minutes! That's {Math.floor(result / 60)} hours and{' '}
          {result % 60} minutes
        </Typography>
      )}
    </div>
  )
}
const RedMentoringSessionShow: FC = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="status" />
      <ReferenceField label="Mentee" source="menteeId" reference="redProfiles">
        <FullName
          sourcePrefix="mentee"
          record={{}}
        />
      </ReferenceField>
      <ReferenceField label="Mentor" source="mentorId" reference="redProfiles">
        <FullName
          sourcePrefix="mentor"
          record={{}}
        />
      </ReferenceField>
      <TextField label="Date of mentoring session" source="date" />
      <TextField source="minuteDuration" />
      <RecordCreatedAt />
      <RecordUpdatedAt />
    </SimpleShowLayout>
  </Show>
)

const RedMentoringSessionCreate: FC = (props) => (
  <Create {...props}>
    <SimpleForm>
      <SelectInput
        source="rediLocation"
        choices={rediLocations.map(({ value, label }) => ({ id: value, name: label }))}
      />
      <ReferenceInput
        label="Mentor"
        source="mentorId"
        reference="redProfiles"
        perPage={0}
        filter={{ userType: 'mentor' }}
      >
        <AutocompleteInput
          optionText={(op) => `${op.firstName} ${op.lastName}`}
        />
      </ReferenceInput>
      <ReferenceInput
        label="Mentee"
        source="menteeId"
        reference="redProfiles"
        perPage={0}
        filter={{ userType: 'mentee' }}
      >
        <AutocompleteInput
          optionText={(op) => `${op.firstName} ${op.lastName}`}
        />
      </ReferenceInput>
      <DateInput label="Date of mentoring session" source="date" />
      <SelectInput
        source="minuteDuration"
        choices={MENTORING_SESSION_DURATION_OPTIONS.map((duration) => ({
          id: duration,
          name: duration,
        }))}
      />
    </SimpleForm>
  </Create>
)
const RedMentoringSessionEdit: FC = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <ReferenceInput
        label="Mentor"
        source="mentorId"
        reference="redProfiles"
        perPage={0}
        filter={{ userType: 'mentor' }}
      >
        <AutocompleteInput
          optionText={(op) => `${op.firstName} ${op.lastName}`}
        />
      </ReferenceInput>
      <ReferenceInput
        label="Mentee"
        source="menteeId"
        reference="redProfiles"
        perPage={0}
        filter={{ userType: 'mentee' }}
      >
        <AutocompleteInput
          optionText={(op) => `${op.firstName} ${op.lastName}`}
        />
      </ReferenceInput>
      <DateInput label="Date of mentoring session" source="date" />
      <SelectInput
        source="minuteDuration"
        choices={MENTORING_SESSION_DURATION_OPTIONS.map((duration) => ({
          id: duration,
          name: duration,
        }))}
      />
    </SimpleForm>
  </Edit>
)

const TpJobSeekerProfileList: FC = (props) => {
  return (
    <>
      <List
        {...props}
        exporter={tpJobSeekerProfileListExporter}
        filters={<TpJobSeekerProfileListFilters />}
        pagination={<AllModelsPagination />}
      >
        <Datagrid expand={<TpJobSeekerProfileListExpandPane />}>
          <TextField source="firstName" />
          <TextField source="lastName" />
          <TextField source="state" />
          <RecordCreatedAt />
          <ShowButton />
          {/* <EditButton /> */}
        </Datagrid>
      </List>
      <p>
        A quick note regard <strong>state</strong>:
      </p>
      <ol>
        <li style={{ marginBottom: '12px' }}>
          <strong>drafting-profile</strong>: the very first state. The jobseeker
          has just signed up and his drafting their profile.
        </li>
        <li style={{ marginBottom: '12px' }}>
          <strong>submitted-for-review</strong>: the jobseeker has provided at
          least as much information as Talent Pool requires. Their profile has
          been submitted to ReDI for review. Click Show &gt; Edit to find two
          buttons to Approve/Decline their profile.
        </li>
        <li style={{ marginBottom: '12px' }}>
          <strong>profile-approved-awaiting-job-preferences</strong>: the
          jobseeker's profile was approved, and we're now waiting for them to
          provide their job preferences/priorities
        </li>
        <li style={{ marginBottom: '12px' }}>
          <strong>
            job-preferences-shared-with-redi-awaiting-interview-match
          </strong>
          : the jobseeker has provided their job preferences, and are now
          waiting to be matched against companies/jobs for interview(s)
        </li>
        <li style={{ marginBottom: '12px' }}>
          <strong>matched-for-interview</strong>: matched for interview
        </li>
      </ol>
    </>
  )
}

const TpJobSeekerProfileListExpandPane: FC = (props) => {
  return (
    <Show {...props} title="">
      <SimpleShowLayout>
        <TextField source="contactEmail" />
        <RecordCreatedAt />
        <RecordUpdatedAt />
      </SimpleShowLayout>
    </Show>
  )
}

const TpJobSeekerProfileListFilters: FC = (props) => (
  <Filter {...props}>
    <TextInput label="Search by name" source="q" />
    <SelectInput
      source="state"
      choices={objectValues(TpJobSeekerProfileState).map((val) => ({ id: val, name: val }))}
    />
  </Filter>
)

function tpJobSeekerProfileListExporter(profiles, fetchRelatedRecords) {
  const data = profiles.map((profile) => {
    let { hrSummit2021JobFairCompanyJobPreferences } = profile
    hrSummit2021JobFairCompanyJobPreferences =
      hrSummit2021JobFairCompanyJobPreferences?.map(({ jobPosition, jobId, companyName }) => {
          return `${jobPosition}${jobId ? ` (${jobId})` : ''} --- ${companyName}`
        }
      )
    delete profile.hrSummit2021JobFairCompanyJobPreferences

    const {
      firstName,
      lastName,
      contactEmail,
      createdAt,
      state,
      jobseeker_currentlyEnrolledInCourse,
      currentlyEnrolledInCourse,
      loopbackComputedDoNotSetElsewhere__forAdminSearch__fullName,
      updatedAt,
      lastLoginDateTime,
      postalMailingAddress,
    } = profile

    return {
      firstName,
      lastName,
      contactEmail,
      createdAt,
      state,
      jobseeker_currentlyEnrolledInCourse,
      currentlyEnrolledInCourse,
      loopbackComputedDoNotSetElsewhere__forAdminSearch__fullName,
      updatedAt,
      lastLoginDateTime,
      postalMailingAddress,
      jobPreference1: hrSummit2021JobFairCompanyJobPreferences?.[0],
      jobPreference2: hrSummit2021JobFairCompanyJobPreferences?.[1],
      jobPreference3: hrSummit2021JobFairCompanyJobPreferences?.[2],
      jobPreference4: hrSummit2021JobFairCompanyJobPreferences?.[3],
    }
  })

  const csv = convertToCSV(
    data
    // {
    //   fields: [
    //     'id',
    //     'firstName',
    //     'lastName',
    //     'contactEmail',
    //     'hrSummit2021JobFairCompanyJobPreferences',
    //     'createdAt',
    //     'updatedAt',
    //   ],
    //   }
  )
  downloadCSV(csv, 'yalla')
}

const TpJobSeekerProfileShow: FC = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TabbedShowLayout>
        <Tab label="Profile">
          <TextField source="state" />
          <BooleanField source="isProfileVisibleToCompanies" />
          <Avatar />
          <TextField source="firstName" />
          <TextField source="lastName" />
          <TextField source="contactEmail" />
          <TextField source="postalMailingAddress" />

          <TextField source="currentlyEnrolledInCourse" />
          <FunctionField
            label="desiredPositions"
            render={(record) => record?.desiredPositions?.join(', ')}
          />
          <TextField source="profileImage" />
          <TextField source="phoneNumber" />
          <TextField source="location" />
          <TextField source="personalWebsite" />
          <TextField source="githubUrl" />
          <TextField source="linkedInUrl" />
          <TextField source="twitterUrl" />
          <TextField source="behanceUrl" />
          <TextField source="stackOverflowUrl" />
          <TextField source="dribbbleUrl" />
          <ArrayField source="workingLanguages" fieldKey="uuid">
            <Datagrid>
              <TextField source="language" />
              <TextField source="proficiencyLevelId" />
            </Datagrid>
          </ArrayField>
          <TextField source="yearsOfRelevantExperience" />
          {/* <ArrayField source="desiredEmploymentType" /> */}
          <TextField source="availability" />
          <DateField source="ifAvailabilityIsDate_date" />
          <TextField source="aboutYourself" />
          <FunctionField
            label="Top Skills"
            render={(record) => record?.topSkills?.join(', ')}
          />
          <ArrayField source="experience" fieldKey="uuid">
            <Datagrid>
              <TextField source="title" />
              <TextField source="company" />
              <TextField
                source="description"
                label="Roles & responsibilities"
              />
              <FunctionField
                label="Start date month"
                render={(record) =>
                  record?.startDateMonth
                    ? parseInt(record.startDateMonth) + 1
                    : null
                }
              />
              <NumberField source="startDateYear" />
              <FunctionField
                label="End date month"
                render={(record) =>
                  record?.startDateMonth
                    ? parseInt(record.endDateMonth) + 1
                    : null
                }
              />
              <NumberField source="endDateYear" />
              <BooleanField source="current" />
            </Datagrid>
          </ArrayField>
          <ArrayField source="education" fieldKey="uuid">
            <Datagrid>
              <TextField source="title" />
              <TextField source="institutionName" />
              <TextField source="certificationType" />
              <TextField source="description" label="Description" />
              <FunctionField
                label="Start date month"
                render={(record) =>
                  record?.startDateMonth
                    ? parseInt(record.startDateMonth) + 1
                    : null
                }
              />
              <NumberField source="startDateYear" />
              <FunctionField
                label="End date month"
                render={(record) =>
                  record?.startDateMonth
                    ? parseInt(record.endDateMonth) + 1
                    : null
                }
              />
              <NumberField source="endDateYear" />
              <BooleanField source="current" />
            </Datagrid>
          </ArrayField>
          {/* <ArrayField source="projects" /> */}
          <ArrayField
            source="hrSummit2021JobFairCompanyJobPreferences"
            fieldKey="uuid"
          >
            <Datagrid>
              <TextField source="jobPosition" />
              <TextField source="jobId" />
              <TextField source="companyName" />
            </Datagrid>
          </ArrayField>

          <ReferenceManyField
            label="HR Summit 2021 Interview Matches"
            reference="tpJobfair2021InterviewMatches"
            target="intervieweeId"
          >
            <Datagrid>
              <TextField label="Company name" source="company.companyName" />
              <ShowButton />
              <EditButton />
            </Datagrid>
          </ReferenceManyField>

          <h4>Record information</h4>
          <RecordCreatedAt />
          <RecordUpdatedAt />
          <DateField
            showTime
            source="lastLoginDateTime"
            label="Last Login"
            {...props}
            sortable={false}
          />
        </Tab>
        <Tab label="Internal comments">
          <TextField
            source="administratorInternalComment"
            style={{ whiteSpace: 'pre-wrap' }}
          />
        </Tab>
      </TabbedShowLayout>
    </SimpleShowLayout>
  </Show>
)

const TpJobSeekerProfileEdit: FC = (props) => (
  // <Edit {...props} actions={<TpJobSeekerProfileEditActions />}>
  <Edit {...props} actions={<TpJobSeekerProfileEditActions />}>
    <TabbedForm>
      <FormTab label="Profile">
        <TextField source="state" />
        <BooleanInput source="isProfileVisibleToCompanies" />
        {/* <Avatar /> */}
        <TextInput source="firstName" />
        <TextInput source="lastName" />
        <TextInput source="contactEmail" />
        <TextInput source="postalMailingAddress" />

        <TextField source="currentlyEnrolledInCourse" />
        <FunctionField
          label="desiredPositions"
          render={(record) => record?.desiredPositions?.join(', ')}
        />
        <TextField source="profileImage" />
        <TextInput source="phoneNumber" />
        <TextInput source="location" />
        <TextInput source="personalWebsite" />
        <TextInput source="githubUrl" />
        <TextInput source="linkedInUrl" />
        <TextInput source="twitterUrl" />
        <TextInput source="behanceUrl" />
        <TextInput source="stackOverflowUrl" />
        <TextInput source="dribbbleUrl" />
        <ArrayField source="workingLanguages" fieldKey="uuid">
          <Datagrid>
            <TextField source="language" />
            <TextField source="proficiencyLevelId" />
          </Datagrid>
        </ArrayField>
        <TextInput source="yearsOfRelevantExperience" />
        <FunctionField
          label="desiredEmploymentType"
          render={(record) => record?.desiredEmploymentType?.join(', ')}
        />
        <TextField source="availability" />
        <DateField source="ifAvailabilityIsDate_date" />
        <TextInput multiline source="aboutYourself" />
        <FunctionField
          label="Top Skills"
          render={(record) => record?.topSkills?.join(', ')}
        />
        <ArrayField source="experience" fieldKey="uuid">
          <Datagrid>
            <TextField source="title" />
            <TextField source="company" />
            <TextField source="description" label="Roles & responsibilities" />
            <FunctionField
              label="Start date month"
              render={(record) =>
                record?.startDateMonth
                  ? parseInt(record.startDateMonth) + 1
                  : null
              }
            />
            <NumberField source="startDateYear" />
            <FunctionField
              label="End date month"
              render={(record) =>
                record?.startDateMonth
                  ? parseInt(record.endDateMonth) + 1
                  : null
              }
            />
            <NumberField source="endDateYear" />
            <BooleanField source="current" />
          </Datagrid>
        </ArrayField>
        <ArrayField source="education" fieldKey="uuid">
          <Datagrid>
            <TextField source="title" />
            <TextField source="institutionName" />
            <TextField source="certificationType" />
            <TextField source="description" label="Description" />
            <FunctionField
              label="Start date month"
              render={(record) =>
                record?.startDateMonth
                  ? parseInt(record.startDateMonth) + 1
                  : null
              }
            />
            <NumberField source="startDateYear" />
            <FunctionField
              label="End date month"
              render={(record) =>
                record?.startDateMonth
                  ? parseInt(record.endDateMonth) + 1
                  : null
              }
            />
            <NumberField source="endDateYear" />
            <BooleanField source="current" />
          </Datagrid>
        </ArrayField>
        {/* <ArrayField source="projects" /> */}
        <ArrayField
          source="hrSummit2021JobFairCompanyJobPreferences"
          fieldKey="uuid"
        >
          <Datagrid>
            <TextField source="jobPosition" />
            <TextField source="jobId" />
            <TextField source="companyName" />
          </Datagrid>
        </ArrayField>

        <ReferenceManyField
          label="HR Summit 2021 Interview Matches"
          reference="tpJobfair2021InterviewMatches"
          target="intervieweeId"
        >
          <Datagrid>
            <TextField label="Company name" source="company.companyName" />
            <ShowButton />
            <EditButton />
          </Datagrid>
        </ReferenceManyField>

        <h4>Record information</h4>
        <RecordCreatedAt />
        <RecordUpdatedAt />
        <DateField
          showTime
          source="lastLoginDateTime"
          label="Last Login"
          {...props}
          sortable={false}
        />
      </FormTab>
      <FormTab label="Internal comments">
        <LongTextInput source="administratorInternalComment" />
      </FormTab>
    </TabbedForm>
  </Edit>
)

const TpJobSeekerProfileEditActions: FC<{ data?: { state: string }}> = (props) => {
  if (props.data?.state !== 'submitted-for-review') return null

  return (
    <CardActions>
      User is pending. Please <TpJobSeekerProfileApproveButton {...props} /> or
      <TpJobSeekerProfileDeclineButton {...props} />
    </CardActions>
  )
}

const TpCompanyProfileEditActions: FC<{ data?: { state: string }}> = (props) => {
  if (props.data?.state === 'profile-approved') return null

  return (
    <CardActions style={{ display: 'flex', alignItems: 'center' }}>
      Company profile needs to be approved before becoming active. Please{' '}
      <TpCompanyProfileApproveButton {...props} />
    </CardActions>
  )
}

const TpCompanyProfileList: FC = (props) => {
  return (
    <>
      <List
        {...props}
        pagination={<AllModelsPagination />}
        filters={<TpCompanyProfileListFilters />}
      >
        <Datagrid>
          <TextField source="companyName" />
          <TextField source="firstName" />
          <TextField source="lastName" />
          <TextField source="state" />
          <RecordCreatedAt />
          <ShowButton />
          <EditButton />
        </Datagrid>
      </List>
      <p>
        A quick note regard <strong>state</strong>:
      </p>
      <ol>
        <li style={{ marginBottom: '12px' }}>
          <strong>drafting-profile</strong>: the very first state. The company
          has just signed up and his drafting their profile.
        </li>
        <li style={{ marginBottom: '12px' }}>
          <strong>submitted-for-review</strong>: the company has provided at
          least as much information as Talent Pool requires. Their profile has
          been submitted to ReDI for review. Click Show &gt; Edit to find two
          buttons to Approve/Decline their profile.
        </li>
        <li style={{ marginBottom: '12px' }}>
          <strong>profile-approved</strong>: the company's profile is approved
        </li>
      </ol>
    </>
  )
}

const TpCompanyProfileListFilters: FC = (props) => (
  <Filter {...props}>
    <SearchInput label="Search by company name" source="q" />
    <SelectInput
      source="state"
      choices={objectValues(TpCompanyProfileState).map((val) => ({ id: val, name: val }))}
    />
  </Filter>
)

const ConditionalTpCompanyProfileHowDidHearAboutRediOtherTextFieldShow: FC<{ record?: any }> = (props) => { // TODO: type props
  return props.record?.howDidHearAboutRediKey === 'other' &&
    props.record?.howDidHearAboutRediOtherText ? (
    <Labeled label="How They Heard about ReDI Talent Pool (If selected Other)">
      <TextField source="howDidHearAboutRediOtherText" {...props} />
    </Labeled>
  ) : null
}

const ConditionalTpCompanyProfileHowDidHearAboutRediOtherTextFieldEdit: FC<{ record?: any }> = (props) => {
  return props.record?.howDidHearAboutRediKey === 'other' &&
    props.record?.howDidHearAboutRediOtherText ? (
    <TextInput
      label="How They Heard about ReDI Talent Pool (If selected Other)"
      source="howDidHearAboutRediOtherText"
      {...props}
    />
  ) : null
}

const TpCompanyProfileShow: FC = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TabbedShowLayout>
        <Tab label="Profile">
          <Avatar />
          <TextField source="companyName" />
          <TextField source="firstName" />
          <TextField source="lastName" />
          <TextField source="contactEmail" />
          <TextField source="location" />
          <TextField source="tagline" />
          <TextField source="industry" />
          <TextField source="website" />
          <TextField source="linkedInUrl" />
          <TextField source="phoneNumber" />
          <TextField source="about" />
          <FunctionField
            label="How They Heard about ReDI Talent Pool"
            render={(record) =>
              howDidHearAboutRediOptions[record.howDidHearAboutRediKey]
            }
          />
          <ConditionalTpCompanyProfileHowDidHearAboutRediOtherTextFieldShow />
          <ReferenceManyField
            label="Job Listings"
            reference="tpJobListings"
            target="tpCompanyProfileId"
          >
            <Datagrid>
              <TextField source="title" />
              <TextField source="location" />
              <TextField source="summary" />
              <TextField source="proficiencyLevelId" />
              <FunctionField
                label="idealTechnicalSkills"
                render={(record) => record?.idealTechnicalSkills?.join(', ')}
              />
              <FunctionField
                label="relatesToPositions"
                render={(record) => record?.relatesToPositions?.join(', ')}
              />
              <TextField source="employmentType" />
              <TextField source="languageRequirements" />
              <TextField source="desiredExperience" />
              <TextField source="salaryRange" />
              <ShowButton />
              <EditButton />
            </Datagrid>
          </ReferenceManyField>

          <ReferenceManyField
            label="HR Summit 2021 Interview Matches"
            reference="tpJobfair2021InterviewMatches"
            target="companyId"
          >
            <Datagrid>
              <FullName sourcePrefix="interviewee." />
              <ShowButton />
              <EditButton />
            </Datagrid>
          </ReferenceManyField>

          {/* <ArrayField source="jobListings" fieldKey="uuid">
            <Datagrid></Datagrid>
          </ArrayField> */}
        </Tab>
        <Tab label="Internal comments">
          <TextField
            source="administratorInternalComment"
            style={{ whiteSpace: 'pre-wrap' }}
          />
        </Tab>
      </TabbedShowLayout>
    </SimpleShowLayout>
  </Show>
)

const TpCompanyProfileEdit: FC = (props) => (
  <Edit {...props} actions={<TpCompanyProfileEditActions />}>
    <TabbedForm>
      <FormTab label="Profile">
        <Avatar />
        <TextInput source="companyName" />
        <TextInput source="firstName" />
        <TextInput source="lastName" />
        <TextInput source="contactEmail" />
        <TextInput source="location" />
        <TextInput source="tagline" />
        <TextInput source="industry" />
        <TextInput source="website" />
        <TextInput source="linkedInUrl" />
        <TextInput source="phoneNumber" />
        <TextInput source="about" />
        <SelectInput
          label="How They Heard about ReDI Talent Pool"
          source="howDidHearAboutRediKey"
          choices={objectEntries(howDidHearAboutRediOptions).map(([id, name]) => ({ id, name }))}
        />
        <ConditionalTpCompanyProfileHowDidHearAboutRediOtherTextFieldEdit />

        <ReferenceManyField
          label="Job Listings"
          reference="tpJobListings"
          target="tpCompanyProfileId"
        >
          <Datagrid>
            <TextField source="title" />
            <TextField source="location" />
            <TextField source="summary" />
            <TextField source="proficiencyLevelId" />
            <FunctionField
              label="idealTechnicalSkills"
              render={(record) => record?.idealTechnicalSkills?.join(', ')}
            />
            <FunctionField
              label="relatesToPositions"
              render={(record) => record?.relatesToPositions?.join(', ')}
            />
            <TextField source="employmentType" />
            <TextField source="languageRequirements" />
            <TextField source="desiredExperience" />
            <TextField source="salaryRange" />
            <ShowButton />
            <EditButton />
          </Datagrid>
        </ReferenceManyField>
        <ReferenceManyField
          label="HR Summit 2021 Interview Matches"
          reference="tpJobfair2021InterviewMatches"
          target="companyId"
        >
          <Datagrid>
            <FullName sourcePrefix="interviewee." />
            <ShowButton />
            <EditButton />
          </Datagrid>
        </ReferenceManyField>
      </FormTab>
      <FormTab label="Internal comments">
        <LongTextInput source="administratorInternalComment" />
      </FormTab>
    </TabbedForm>
  </Edit>
)

const TpJobListingList: FC = (props) => {
  return (
    <List
      {...props}
      pagination={<AllModelsPagination />}
      exporter={tpJobListingListExporter}
    >
      <Datagrid>
        <TextField source="title" />
        <TextField source="location" />
        <ReferenceField
          label="Company"
          source="tpCompanyProfileId"
          reference="tpCompanyProfiles"
        >
          <TextField source="companyName" />
        </ReferenceField>
        <RecordCreatedAt />
        <ShowButton />
        <EditButton />
      </Datagrid>
    </List>
  )
}

function tpJobListingListExporter(jobListings, fetchRelatedRecords) {
  const data = jobListings.map(({
    title,
    location,
    tpCompanyProfile: { companyName },
    employmentType,
    languageRequirements,
    desiredExperience,
    salaryRange,
  }) => {
    return {
      title,
      location,
      companyName,
      employmentType,
      languageRequirements,
      desiredExperience,
      salaryRange,
    }
  })

  const csv = convertToCSV(
    data
    // {
    //   fields: [
    //     'id',
    //     'firstName',
    //     'lastName',
    //     'contactEmail',
    //     'hrSummit2021JobFairCompanyJobPreferences',
    //     'createdAt',
    //     'updatedAt',
    //   ],
    //   }
  )
  downloadCSV(csv, 'Are you ReDI? Yalla habibi')
}

const TpJobListingShow: FC = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <ReferenceField
        label="Company"
        source="tpCompanyProfileId"
        reference="tpCompanyProfiles"
      >
        <TextField source="companyName" />
      </ReferenceField>
      <TextField source="title" />
      <TextField source="location" />
      <TextField source="summary" />
      <TextField source="proficiencyLevelId" />
      <FunctionField
        label="idealTechnicalSkills"
        render={(record) => record?.idealTechnicalSkills?.join(', ')}
      />
      <FunctionField
        label="relatesToPositions"
        render={(record) => record?.relatesToPositions?.join(', ')}
      />
      <TextField source="employmentType" />
      <TextField source="languageRequirements" />
      <TextField source="desiredExperience" />
      <TextField source="salaryRange" />
    </SimpleShowLayout>
  </Show>
)

const TpJobListingEdit: FC = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <ReferenceField
        label="Company"
        source="tpCompanyProfileId"
        reference="tpCompanyProfiles"
      >
        <TextField source="companyName" />
      </ReferenceField>
      <TextInput source="title" />
      <TextInput source="location" />
      <TextInput source="summary" multiline />
      <TextInput source="proficiencyLevelId" />
      <FunctionField
        label="idealTechnicalSkills"
        render={(record) => record?.idealTechnicalSkills?.join(', ')}
      />
      <FunctionField
        label="relatesToPositions"
        render={(record) => record?.relatesToPositions?.join(', ')}
      />
      <TextInput source="employmentType" />
      <TextInput source="languageRequirements" />
      <TextInput source="desiredExperience" />
      <TextInput source="salaryRange" />
    </SimpleForm>
  </Edit>
)

const TpJobFair2021InterviewMatchList: FC = (props) => {
  return (
    <List
      {...props}
      pagination={<AllModelsPagination />}
      exporter={tpJobFair2021InterviewMatchListExporter}
    >
      <Datagrid>
        <ReferenceField
          label="Interviewee"
          source="intervieweeId"
          reference="tpJobSeekerProfiles"
        >
          <FullName sourcePrefix="" />
        </ReferenceField>
        <ReferenceField
          label="Company"
          source="companyId"
          reference="tpCompanyProfiles"
        >
          <TextField source="companyName" />
        </ReferenceField>
        <ReferenceField
          label="Job Listing"
          source="jobListingId"
          reference="tpJobListings"
        >
          <TextField source="title" />
        </ReferenceField>
        <RecordCreatedAt />
        <ShowButton />
        <EditButton />
      </Datagrid>
    </List>
  )
}

function tpJobFair2021InterviewMatchListExporter(matches, fetchRelatedRecords) {
  const data = matches.map(({ company = {}, interviewee = {} }) => {
    const {
      companyName,
      location: companyLocation,
      firstName: companyPersonFirstName,
      lastName: companyPersonLastName,
      contactEmail: companyPersonContactEmail,
    } = company
    
    const {
      currentlyEnrolledInCourse: intervieweeCurrentRediCourse,
      firstName: intervieweeFirstName,
      lastName: intervieweeLastName,
      contactEmail: intervieweeContactEmail,
    } = interviewee

    return {
      companyName,
      companyLocation,
      companyPersonFirstName,
      companyPersonLastName,
      companyPersonContactEmail,
      intervieweeFirstName,
      intervieweeLastName,
      intervieweeContactEmail,
      intervieweeCurrentRediCourse,
    }
  })

  const csv = convertToCSV(
    data
    // {
    //   fields: [
    //     'id',
    //     'firstName',
    //     'lastName',
    //     'contactEmail',
    //     'hrSummit2021JobFairCompanyJobPreferences',
    //     'createdAt',
    //     'updatedAt',
    //   ],
    //   }
  )
  downloadCSV(csv, 'Company-interviewee matches')
}

const TpJobFair2021InterviewMatchShow: FC = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <ReferenceField
        label="Interviewee"
        source="intervieweeId"
        reference="tpJobSeekerProfiles"
      >
        <FullName sourcePrefix="" />
      </ReferenceField>
      <ReferenceField
        label="Company"
        source="companyId"
        reference="tpCompanyProfiles"
      >
        <TextField source="companyName" />
      </ReferenceField>
      <ReferenceField
        label="Job Listing"
        source="jobListingId"
        reference="tpJobListings"
      >
        <TextField source="title" />
      </ReferenceField>
    </SimpleShowLayout>
  </Show>
)

const TpJobFair2021InterviewMatchCreate: FC = (props) => (
  <Create {...props}>
    <SimpleForm>
      <ReferenceInput
        label="Interviewee"
        source="intervieweeId"
        reference="tpJobSeekerProfiles"
        perPage={0}
        sort={{ field: 'firstName', order: 'ASC' }}
      >
        <AutocompleteInput
          optionText={(op) => `${op.firstName} ${op.lastName}`}
        />
      </ReferenceInput>
      <ReferenceInput
        label="Company"
        source="companyId"
        reference="tpCompanyProfiles"
        perPage={0}
        sort={{ field: 'companyName', order: 'ASC' }}
      >
        <AutocompleteInput optionText={(op) => `${op.companyName}`} />
      </ReferenceInput>
      <ReferenceInput
        label="Job Listing"
        source="jobListingId"
        reference="tpJobListings"
        perPage={0}
      >
        <AutocompleteInput
          optionText={(op) => {
            if (!op.tpCompanyProfile || !op.tpCompanyProfile.companyName) {
              console.log(op)
            }
            return `${op.tpCompanyProfile.companyName} --- ${op.title}`
          }}
        />
      </ReferenceInput>
    </SimpleForm>
  </Create>
)

const TpJobFair2021InterviewMatchEdit: FC = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <ReferenceInput
        label="Interviewee"
        source="intervieweeId"
        reference="tpJobSeekerProfiles"
        perPage={0}
        sort={{ field: 'firstName', order: 'ASC' }}
      >
        <AutocompleteInput
          optionText={(op) => `${op.firstName} ${op.lastName}`}
        />
      </ReferenceInput>
      <ReferenceInput
        label="Company"
        source="companyId"
        reference="tpCompanyProfiles"
        perPage={0}
        sort={{ field: 'firstName', order: 'ASC' }}
      >
        <AutocompleteInput optionText={(op) => `${op.companyName}`} />
      </ReferenceInput>
      <ReferenceInput
        label="Job Listing"
        source="jobListingId"
        reference="tpJobListings"
        perPage={0}
      >
        <AutocompleteInput
          optionText={(op) =>
            `${op.tpCompanyProfile.companyName} --- ${op.title}`
          }
        />
      </ReferenceInput>
    </SimpleForm>
  </Edit>
)

const buildDataProvider = (normalDataProvider) => (verb, resource, params) => {
  if (verb === 'GET_LIST' && params.filter) {
    const filter = params.filter;
    const q = filter.q;
    delete filter.q;
    const newFilter = { and: [filter] };

    if (q) {
      if (resource === 'tpJobSeekerProfiles' || resource === 'redProfiles') {
          const andConditions = q.split(' ').map((word) => ({
            loopbackComputedDoNotSetElsewhere__forAdminSearch__fullName: {
              like: word,
              options: 'i',
            },
          }))
          newFilter.and = [...newFilter.and, ...andConditions]
      }
      if (resource === 'tpCompanyProfiles') {
        const andConditions = q.split(' ').map((word) => ({
          companyName: {
            like: word,
            options: 'i',
          },
        }))
        newFilter.and = [...newFilter.and, ...andConditions]
      }
    }
    params.filter = newFilter
  }
  return normalDataProvider(verb, resource, params)
}

const dataProvider = buildDataProvider(loopbackClient(API_URL))

function App() {
  return (
    <div className="App">
      <Admin
        dataProvider={dataProvider}
        authProvider={authProvider(`${API_URL}/redUsers/login`)}
      >
        <Resource
          name="redProfiles"
          show={RedProfileShow}
          list={RedProfileList}
          edit={RedProfileEdit}
        />
        <Resource
          name="redMatches"
          show={RedMatchShow}
          list={RedMatchList}
          create={RedMatchCreate}
          edit={RedMatchEdit}
        />
        <Resource
          name="redMentoringSessions"
          show={RedMentoringSessionShow}
          list={RedMentoringSessionList}
          create={RedMentoringSessionCreate}
          edit={RedMentoringSessionEdit}
        />
        <Resource
          name="tpJobSeekerProfiles"
          show={TpJobSeekerProfileShow}
          list={TpJobSeekerProfileList}
          edit={TpJobSeekerProfileEdit}
        />
        <Resource
          name="tpCompanyProfiles"
          show={TpCompanyProfileShow}
          list={TpCompanyProfileList}
          edit={TpCompanyProfileEdit}
        />
        <Resource
          name="tpJobListings"
          show={TpJobListingShow}
          list={TpJobListingList}
          edit={TpJobListingEdit}
        />
        <Resource
          name="tpJobfair2021InterviewMatches"
          create={TpJobFair2021InterviewMatchCreate}
          show={TpJobFair2021InterviewMatchShow}
          list={TpJobFair2021InterviewMatchList}
          edit={TpJobFair2021InterviewMatchEdit}
        />
      </Admin>
    </div>
  )
}

export default App