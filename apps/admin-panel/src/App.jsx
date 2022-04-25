import DateFnsUtils from '@date-io/date-fns'
import { createStyles, withStyles } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography'
import { Clear, Person as PersonIcon } from '@material-ui/icons'
import Done from '@material-ui/icons/Done'
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers'
import {
  CATEGORIES,
  CATEGORY_GROUPS,
  COURSES,
  GENDERS,
  LANGUAGES,
  MENTORING_SESSION_DURATION_OPTIONS,
  REDI_LOCATION_NAMES,
  RED_MATCH_STATUSES,
} from '@talent-connect/shared-config'
import {
  TpCompanyProfileState,
  TpJobseekerProfileState,
} from '@talent-connect/shared-types'
import { calculateAge } from '@talent-connect/shared-utils'
import {
  germanFederalStates,
  howDidHearAboutRediOptions,
} from '@talent-connect/talent-pool/config'
import { objectEntries } from '@talent-connect/typescript-utilities'
import classNames from 'classnames'
import { ca } from 'date-fns/locale'
import { get, groupBy, keyBy, mapValues } from 'lodash'
import { unparse as convertToCSV } from 'papaparse/papaparse.min'
import React, { useEffect } from 'react'
import {
  Admin,
  ArrayField,
  AutocompleteInput,
  BooleanField,
  BooleanInput,
  CardActions,
  Create,
  Datagrid,
  DateField,
  DateInput,
  downloadCSV,
  Edit,
  EditButton,
  Filter,
  FormTab,
  FunctionField,
  Labeled,
  List,
  LongTextInput,
  NullableBooleanInput,
  NumberField,
  NumberInput,
  Pagination,
  ReferenceField,
  ReferenceInput,
  ReferenceManyField,
  Resource,
  SearchInput,
  SelectArrayInput,
  SelectInput,
  Show,
  ShowButton,
  SimpleForm,
  SimpleShowLayout,
  Tab,
  TabbedForm,
  TabbedShowLayout,
  TextField,
  TextInput,
} from 'react-admin'
import { ApproveButton } from './components/ApproveButton'
import { DeclineButton } from './components/DeclineButton'
import { TpCompanyProfileApproveButton } from './components/TpCompanyProfileApproveButton'
import { TpJobseekerProfileApproveButton } from './components/TpJobseekerProfileApproveButton'
import { TpJobseekerProfileDeclineButton } from './components/TpJobseekerProfileDeclineButton'
import { API_URL } from './config'
import loopbackClient, { authProvider } from './lib/react-admin-loopback/src'
import { redMatchesCsvExporter } from './utils/csvExport'

/** REFERENCE DATA */

const rediLocations = objectEntries(REDI_LOCATION_NAMES).map(([id, label]) => ({
  id,
  label,
}))

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
  ...coursesByLocation.hamburg.map((cat) =>
    Object.assign(cat, { label: `Hamburg: ${cat.label}` })
  ),
  ...coursesByLocation.munich.map((cat) =>
    Object.assign(cat, { label: `Munich: ${cat.label}` })
  ),
  ...coursesByLocation.nrw.map((cat) =>
    Object.assign(cat, { label: `NRW: ${cat.label}` })
  ),
]

const categoriesIdToLabelCleanMap = mapValues(
  keyBy(categoriesFlat, 'id'),
  'labelClean'
)
const categoriesIdToGroupMap = mapValues(keyBy(categoriesFlat, 'id'), 'group')

const genders = [
  ...Object.entries(GENDERS).map((key, value) => ({ id: key, name: value })),
  { id: '', name: 'Prefers not to answer' },
]

const languages = LANGUAGES.map((lang) => ({ id: lang, name: lang }))

const courseIdToLabelMap = mapValues(keyBy(coursesFlat, 'id'), 'label')
const AWS_PROFILE_AVATARS_BUCKET_BASE_URL =
  'https://s3-eu-west-1.amazonaws.com/redi-connect-profile-avatars/'

export const formRedMatchStatuses = Object.entries(RED_MATCH_STATUSES).map(
  ([key, value]) => ({ id: key, name: value })
)

/** START OF SHARED STUFF */

const RecordCreatedAt = (props) => <DateField source="createdAt" {...props} />
RecordCreatedAt.defaultProps = {
  addLabel: true,
  label: 'Record created at',
}

const RecordUpdatedAt = (props) => <DateField source="updatedAt" {...props} />
RecordUpdatedAt.defaultProps = {
  addLabel: true,
  label: 'Record updated at',
}

const LanguageList = (props) => {
  return <span>{props.data ? Object.values(props.data).join(', ') : null}</span>
}

const CategoryList = (props) => {
  const categoriesGrouped = groupBy(
    props.data,
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
    {record && record.profileAvatarImageS3Key && (
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
const AllModelsPagination = (props) => (
  <Pagination
    rowsPerPageOptions={[10, 25, 50, 100, 250, 500, 1000]}
    {...props}
  />
)

const RedProfileList = (props) => {
  return (
    <List
      {...props}
      filters={<RedProfileListFilters />}
      pagination={<AllModelsPagination />}
      aside={<FreeMenteeSpotsPerLocationAside />}
      exporter={redProfileListExporter}
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

function redProfileListExporter(profiles) {
  const properties = [
    'id',
    'userType',
    'rediLocation',
    'firstName',
    'lastName',
    'gender',
    'age',
    'birthDate',
    'userActivated',
    'userActivatedAt',
    'mentor_occupation',
    'mentor_workPlace',
    'expectations',
    'mentor_ifTypeForm_submittedAt',
    'mentee_ifTypeForm_preferredMentorSex',
    'mentee_currentCategory',
    'mentee_occupationCategoryId',
    'mentee_occupationJob_placeOfEmployment',
    'mentee_occupationJob_position',
    'mentee_occupationStudent_studyPlace',
    'mentee_occupationStudent_studyName',
    'mentee_occupationLookingForJob_what',
    'mentee_occupationOther_description',
    'mentee_highestEducationLevel',
    'mentee_currentlyEnrolledInCourse',
    'profileAvatarImageS3Key',
    'languages',
    'otherLanguages',
    'personalDescription',
    'contactEmail',
    'linkedInProfileUrl',
    'githubProfileUrl',
    'slackUsername',
    'telephoneNumber',
    'categories',
    'favouritedRedProfileIds',
    'optOutOfMenteesFromOtherRediLocation',
    'signupSource',
    'currentApplicantCount',
    'menteeCountCapacity',
    'currentMenteeCount',
    'currentFreeMenteeSpots',
    'ifUserIsMentee_hasActiveMentor',
    'ifUserIsMentee_activeMentor',
    'ifTypeForm_additionalComments',
    'createdAt',
    'updatedAt',
    'gaveGdprConsentAt',
    'administratorInternalComment',
  ]

  const data = profiles.map((profile) => {
    return Object.fromEntries(properties.map((prop) => [prop, profile[prop]]))
  })

  const csv = convertToCSV(data)
  downloadCSV(csv, 'yalla')
}

const FreeMenteeSpotsPerLocationAside = () => {
  const [mentorsList, setMentorsList] = React.useState([])

  useEffect(() => {
    dataProvider('GET_LIST', 'redProfiles', {
      pagination: { page: 1, perPage: 0 },
      sort: {},
      filter: { userType: 'mentor' },
    }).then(({ data }) => setMentorsList(data))
  }, [])

  const getFreeSpotsCount = (location) =>
    mentorsList
      .filter((mentor) => mentor.rediLocation === location)
      .filter((mentor) => mentor.userActivated)
      .reduce((acc, curr) => acc + curr.currentFreeMenteeSpots, 0)

  const totalFreeMenteeSpotsBerlin = getFreeSpotsCount('berlin')
  const totalFreeMenteeSpotsHamburg = getFreeSpotsCount('hamburg')
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
            Hamburg: {totalFreeMenteeSpotsHamburg} mentoring spots available
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

const RedProfileListExpandPane = (props) => {
  return (
    <Show {...props} title="">
      <SimpleShowLayout>
        <ArrayField source="categories">
          <CategoryList />
        </ArrayField>
        <MenteeEnrolledInCourseField />
        <TextField source="contactEmail" />
        {props.record.userType === 'mentor' && (
          <FunctionField
            render={({ optOutOfMenteesFromOtherRediLocation }) =>
              optOutOfMenteesFromOtherRediLocation ? <Done /> : <Clear />
            }
            label="Mentor has opted out of receiving applications from mentees from other redi locations"
          />
        )}
        <RecordCreatedAt />
        <RecordUpdatedAt />
      </SimpleShowLayout>
    </Show>
  )
}

const RedProfileListFilters = (props) => (
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
    ></SelectInput>
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

const RedProfileShow = (props) => (
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
            <CategoryList />
          </ArrayField>
          <ReferenceManyField
            label="Mentees (applied/accepted/completed/cancelled)"
            reference="redMatches"
            target="mentorId"
          >
            <Datagrid>
              <FullName sourcePrefix="mentee." />
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
              <FullName sourcePrefix="mentor." />
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
          <FunctionField
            render={({ optOutOfMenteesFromOtherRediLocation }) =>
              optOutOfMenteesFromOtherRediLocation ? <Done /> : <Clear />
            }
            label="Mentor has opted out of receiving applications from mentees from other redi locations"
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

const RedProfileEditActions = (props) => {
  const userType = props && props.data && props.data.userType
  if (
    ![
      'public-sign-up-mentor-pending-review',
      'public-sign-up-mentee-pending-review',
    ].includes(userType)
  ) {
    return null
  }
  return (
    <CardActions>
      User is pending. Please
      <ApproveButton {...props} /> or
      <DeclineButton {...props} />
    </CardActions>
  )
}

const RedProfileEdit = (props) => (
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
        <BooleanInput
          source="optOutOfMenteesFromOtherRediLocation"
          label="Mentor has opted out of receiving applications from mentees from other redi locations"
        />
      </FormTab>
      <FormTab label="Internal comments">
        <LongTextInput source="administratorInternalComment" />
      </FormTab>
    </TabbedForm>
  </Edit>
)

const CategoriesInput = (props) => {
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

const MenteeEnrolledInCourseField = (props) => {
  return (
    <Labeled label="Currently enrolled in course">
      <span>
        {courseIdToLabelMap[props.record.mentee_currentlyEnrolledInCourse]}
      </span>
    </Labeled>
  )
}
const MenteeEnrolledInCourseInput = (props) => {
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

const FullName = ({ record, sourcePrefix }) => {
  return (
    <span>
      {get(record, `${sourcePrefix}firstName`)}{' '}
      {get(record, `${sourcePrefix}lastName`)}
    </span>
  )
}
FullName.defaultProps = {
  sourcePrefix: '',
  label: 'Full name',
}

const redMatchStyles = {
  list: {
    '& th, & td': {
      padding: '0 6px',
    },
  },
}

const RedMatchList = withStyles(redMatchStyles)(({ classes, ...props }) => (
  <List
    {...props}
    sort={{ field: 'createdAt', order: 'DESC' }}
    pagination={<AllModelsPagination />}
    filters={<RedMatchListFilters />}
    exporter={redMatchesCsvExporter}
    className={classes.list}
  >
    <Datagrid>
      <TextField source="rediLocation" label="City" />
      <DateField source="createdAt" label="Record created at" />
      <ReferenceField label="Mentee" source="menteeId" reference="redProfiles">
        <FullName source="mentee" />
      </ReferenceField>
      <ReferenceField label="Mentor" source="mentorId" reference="redProfiles">
        <FullName source="mentor" />
      </ReferenceField>
      <FunctionField
        label="Status"
        render={(record) =>
          record?.status
            .replace('invalidated-as-other-mentor-accepted', 'invalidated')
            .replace('declined-by-mentor', 'declined')
        }
      />
      <DateField source="matchCompletedOn" label="Completed on" />
      <RedMatchListRelatedMentoringSessionsNumber label="Number of sessions" />
      <ShowButton />
      <EditButton />
    </Datagrid>
  </List>
))
const RedMatchListRelatedMentoringSessionsNumber = ({
  record: { mentorId, menteeId },
}) => {
  const [mentoringSessions, setMentoringSessions] = React.useState([])
  useEffect(() => {
    dataProvider('GET_LIST', 'redMentoringSessions', {
      pagination: { page: 1, perPage: 0 },
      sort: { field: 'date', order: 'ASC' },
      filter: { mentorId, menteeId },
    }).then(({ data }) => setMentoringSessions(data))
  }, [mentorId, menteeId])
  return `${mentoringSessions.length}`
}

const RedMatchListFilters = (props) => (
  <Filter {...props}>
    <SelectInput source="status" choices={formRedMatchStatuses} />
    <SelectInput
      source="rediLocation"
      choices={rediLocations.map(({ id, label }) => ({ id, name: label }))}
    />
  </Filter>
)
const RedMatchShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="status" />
      <ReferenceField label="Mentee" source="menteeId" reference="redProfiles">
        <FullName source="mentee" />
      </ReferenceField>
      <ReferenceField label="Mentor" source="mentorId" reference="redProfiles">
        <FullName source="mentor" />
      </ReferenceField>

      <TextField
        source="applicationText"
        label="Application text"
        helperText="Field contains the aplication text that a mentee as an application to a mentor when asking for mentorship."
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
      <DateField source="matchCompletedOn" label="Completed on" />
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

      <RedMatchShowRelatedMentoringSessions />
    </SimpleShowLayout>
  </Show>
)
const RedMatchShowRelatedMentoringSessions = ({
  record: { mentorId, menteeId },
}) => {
  const [mentoringSessions, setMentoringSessions] = React.useState([])
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
  if (mentoringSessions && mentoringSessions.length === 0) {
    return <h3>NO mentoring sessions registered yet.</h3>
  }
  return (
    mentoringSessions &&
    mentoringSessions.length > 0 && (
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
const RedMatchCreate = (props) => (
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
const RedMatchEdit = (props) => (
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
      <DateInput
        source="matchCompletedOn"
        parse={(d) => (d === '' ? null : d)}
        label="Completed on"
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
        label="If match was declined by mentor, when?"
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
  const data = mentoringSessions.map((x) => {
    const mentor = mentors[x.mentorId]
    const mentee = mentees[x.menteeId]
    if (mentor) {
      x.mentorName = `${mentor.firstName} ${mentor.lastName}`
    }
    if (mentee) {
      x.menteeName = `${mentee.firstName} ${mentee.lastName}`
    }
    return x
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

const RedMentoringSessionList = (props) => (
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
        <FullName source="mentee" />
      </ReferenceField>
      <ReferenceField label="Mentor" source="mentorId" reference="redProfiles">
        <FullName source="mentor" />
      </ReferenceField>
      <DateField source="date" />
      <NumberField source="minuteDuration" />
      <ShowButton />
      <EditButton />
    </Datagrid>
  </List>
)
const RedMentoringSessionListFilters = (props) => (
  <Filter {...props}>
    <SelectInput
      source="rediLocation"
      choices={rediLocations.map(({ id, label }) => ({ id, name: label }))}
    />
  </Filter>
)
const RedMentoringSessionListAside = () => {
  const [fromDate, setFromDate] = React.useState(null)
  const [toDate, setToDate] = React.useState(null)
  const [rediLocation, setRediLocation] = React.useState(undefined)
  const [loadState, setLoadState] = React.useState('pending')
  const [result, setResult] = React.useState(null)
  const [step, setStep] = React.useState(0)
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
  const doLoad = React.useCallback(() =>
    (async () => {
      console.log('hello')
      if (valid) {
        setLoadState('loading')
        setStep(0)
        const sessions = await dataProvider(
          'GET_LIST',
          'redMentoringSessions',
          {
            pagination: { page: 1, perPage: 0 },
            sort: {},
            filter: { date: { gte: fromDate, lte: toDate }, rediLocation },
          }
        )
        setLoadState('success')
        setResult(
          sessions.data.reduce((acc, curr) => acc + curr.minuteDuration, 0)
        )
      }
    })()
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
          <MenuItem value="hamburg">Hamburg</MenuItem>
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
              .fill()
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
const RedMentoringSessionShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="status" />
      <ReferenceField label="Mentee" source="menteeId" reference="redProfiles">
        <FullName source="mentee" />
      </ReferenceField>
      <ReferenceField label="Mentor" source="mentorId" reference="redProfiles">
        <FullName source="mentor" />
      </ReferenceField>
      <TextField label="Date of mentoring session" source="date" />
      <TextField source="minuteDuration" />
      <RecordCreatedAt />
      <RecordUpdatedAt />
    </SimpleShowLayout>
  </Show>
)

const RedMentoringSessionCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <SelectInput
        source="rediLocation"
        choices={rediLocations.map(({ id, label }) => ({ id, name: label }))}
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
const RedMentoringSessionEdit = (props) => (
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

const TpJobseekerProfileList = (props) => {
  return (
    <>
      <List
        {...props}
        exporter={tpJobseekerProfileListExporter}
        filters={<TpJobseekerProfileListFilters />}
        pagination={<AllModelsPagination />}
      >
        <Datagrid expand={<TpJobseekerProfileListExpandPane />}>
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
          <strong>profile-approved</strong>: the jobseeker's profile is approved
        </li>
      </ol>
    </>
  )
}

const TpJobseekerProfileListExpandPane = (props) => {
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

const TpJobseekerProfileListFilters = (props) => (
  <Filter {...props}>
    <TextInput label="Search by name" source="q" />
    <SelectInput
      source="state"
      choices={Object.values(TpJobseekerProfileState).map((val) => ({
        id: val,
        name: val,
      }))}
    />
  </Filter>
)

function tpJobseekerProfileListExporter(profiles, fetchRelatedRecords) {
  const data = profiles.map((profile) => {
    let { hrSummit2021JobFairCompanyJobPreferences } = profile
    hrSummit2021JobFairCompanyJobPreferences =
      hrSummit2021JobFairCompanyJobPreferences?.map(
        ({ jobPosition, jobId, companyName }) => {
          return `${jobPosition}${
            jobId ? ` (${jobId})` : ''
          } --- ${companyName}`
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
      genderPronouns,
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
      genderPronouns,
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

const TpJobseekerProfileShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TabbedShowLayout>
        <Tab label="Profile">
          <TextField source="state" />
          <BooleanField source="isProfileVisibleToCompanies" />
          <BooleanField initialValue={false} source="isHired" />
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
          <FunctionField
            label="Location (Federal State)"
            render={(record) => germanFederalStates[record?.federalState]}
          />
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
              <TextField source="city" />
              <TextField source="country" />
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
              <TextField source="institutionCity" />
              <TextField source="institutionCountry" />
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

const TpJobseekerProfileEdit = (props) => (
  // <Edit {...props} actions={<TpJobseekerProfileEditActions />}>
  <Edit {...props} actions={<TpJobseekerProfileEditActions />}>
    <TabbedForm>
      <FormTab label="Profile">
        <TextField source="state" />
        <BooleanInput source="isProfileVisibleToCompanies" />
        <BooleanInput initialValue={false} source="isHired" />
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
        <SelectInput
          label="Location (Federal State)"
          source="federalState"
          choices={Object.entries(germanFederalStates).map(([id, name]) => ({
            id,
            name,
          }))}
        />
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

const TpJobseekerProfileEditActions = (props) => {
  if (props?.data?.state !== 'submitted-for-review') return null

  return (
    <CardActions>
      User is pending. Please <TpJobseekerProfileApproveButton {...props} /> or
      <TpJobseekerProfileDeclineButton {...props} />
    </CardActions>
  )
}

const TpCompanyProfileEditActions = (props) => {
  if (props?.data?.state === 'profile-approved') return null

  return (
    <CardActions style={{ display: 'flex', alignItems: 'center' }}>
      Company profile needs to be approved before becoming active. Please{' '}
      <TpCompanyProfileApproveButton {...props} />
    </CardActions>
  )
}

const TpCompanyProfileList = (props) => {
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

const TpCompanyProfileListFilters = (props) => (
  <Filter {...props}>
    <SearchInput label="Search by company name" source="q" />
    <SelectInput
      source="state"
      choices={Object.values(TpCompanyProfileState).map((val) => ({
        id: val,
        name: val,
      }))}
    />
  </Filter>
)

const ConditionalTpCompanyProfileHowDidHearAboutRediOtherTextFieldShow = (
  props
) => {
  return props.record?.howDidHearAboutRediKey === 'other' &&
    props.record?.howDidHearAboutRediOtherText ? (
    <Labeled label="How They Heard about ReDI Talent Pool (If selected Other)">
      <TextField source="howDidHearAboutRediOtherText" {...props} />
    </Labeled>
  ) : null
}

const ConditionalTpCompanyProfileHowDidHearAboutRediOtherTextFieldEdit = (
  props
) => {
  return props.record?.howDidHearAboutRediKey === 'other' &&
    props.record?.howDidHearAboutRediOtherText ? (
    <TextInput
      label="How They Heard about ReDI Talent Pool (If selected Other)"
      source="howDidHearAboutRediOtherText"
      {...props}
    />
  ) : null
}

const TpCompanyProfileShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TabbedShowLayout>
        <Tab label="Profile">
          <Avatar />
          <BooleanField source="isProfileVisibleToJobseekers" />
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

const TpCompanyProfileEdit = (props) => (
  <Edit {...props} actions={<TpCompanyProfileEditActions />}>
    <TabbedForm>
      <FormTab label="Profile">
        <Avatar />
        <BooleanInput source="isProfileVisibleToJobseekers" />
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
          choices={Object.entries(howDidHearAboutRediOptions).map(
            ([id, name]) => ({ id, name })
          )}
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

const TpJobListingList = (props) => {
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
  const data = jobListings.map((job) => {
    const {
      title,
      location,
      tpCompanyProfile: { companyName },
      employmentType,
      languageRequirements,
      salaryRange,
    } = job

    return {
      title,
      location,
      companyName,
      employmentType,
      languageRequirements,
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

const TpJobListingShow = (props) => (
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
      <TextField source="salaryRange" />
    </SimpleShowLayout>
  </Show>
)

const TpJobListingEdit = (props) => (
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
      <TextInput source="salaryRange" />
    </SimpleForm>
  </Edit>
)

const TpJobFair2021InterviewMatchList = (props) => {
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
          reference="tpJobseekerProfiles"
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
  const data = matches.map((match) => {
    const {
      company: {
        companyName,
        location: companyLocation,
        firstName: companyPersonFirstName,
        lastName: companyPersonLastName,
        contactEmail: companyPersonContactEmail,
      } = {},
      interviewee: {
        currentlyEnrolledInCourse: intervieweeCurrentRediCourse,
        firstName: intervieweeFirstName,
        lastName: intervieweeLastName,
        contactEmail: intervieweeContactEmail,
      } = {},
    } = match

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

const TpJobFair2021InterviewMatchShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <ReferenceField
        label="Interviewee"
        source="intervieweeId"
        reference="tpJobseekerProfiles"
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

const TpJobFair2021InterviewMatchCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <ReferenceInput
        label="Interviewee"
        source="intervieweeId"
        reference="tpJobseekerProfiles"
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

const TpJobFair2021InterviewMatchEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <ReferenceInput
        label="Interviewee"
        source="intervieweeId"
        reference="tpJobseekerProfiles"
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
  if (verb === 'GET_LIST' && resource === 'redProfiles') {
    if (params.filter) {
      const filter = params.filter
      const q = filter.q
      delete filter.q
      const newFilter = { and: [filter] }
      if (q) {
        const andConditions = q.split(' ').map((word) => ({
          loopbackComputedDoNotSetElsewhere__forAdminSearch__fullName: {
            like: word,
            options: 'i',
          },
        }))
        newFilter.and = [...newFilter.and, ...andConditions]
      }
      params.filter = newFilter
    }
  }
  if (verb === 'GET_LIST' && resource === 'tpJobseekerProfiles') {
    if (params.filter) {
      const filter = params.filter
      const q = filter.q
      delete filter.q
      const newFilter = { and: [filter] }
      if (q) {
        const andConditions = q.split(' ').map((word) => ({
          loopbackComputedDoNotSetElsewhere__forAdminSearch__fullName: {
            like: word,
            options: 'i',
          },
        }))
        newFilter.and = [...newFilter.and, ...andConditions]
      }
      params.filter = newFilter
    }
  }
  if (verb === 'GET_LIST' && resource === 'tpCompanyProfiles') {
    if (params.filter) {
      const filter = params.filter
      const q = filter.q
      delete filter.q
      const newFilter = { and: [filter] }
      if (q) {
        const andConditions = q.split(' ').map((word) => ({
          companyName: {
            like: word,
            options: 'i',
          },
        }))
        newFilter.and = [...newFilter.and, ...andConditions]
      }
      params.filter = newFilter
    }
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
          name="tpJobseekerProfiles"
          show={TpJobseekerProfileShow}
          list={TpJobseekerProfileList}
          edit={TpJobseekerProfileEdit}
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
