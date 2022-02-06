import {
  Button,
  Caption,
  FormDatePicker,
  TextInput,
  FormSelect,
  TextArea,
  PipeList,
} from '@talent-connect/shared-atomic-design-components'
import { TpJobSeekerCv, TpJobSeekerProfile } from '@talent-connect/shared-types'
import {
  availabilityOptions,
  availabilityOptionsIdToLabelMap,
  desiredEmploymentTypeOptions,
  desiredEmploymentTypeOptionsIdToLabelMap,
  immigrationStatusOptions,
  immigrationStatusOptionsIdToLabelMap,
} from '@talent-connect/talent-pool/config'
import { mapOptions } from '@talent-connect/typescript-utilities';
import moment from 'moment'
import { useEffect, useState } from 'react'
import { Content, Element } from 'react-bulma-components'
import { UseMutationResult, UseQueryResult } from 'react-query'
import { useTpJobSeekerProfileUpdateMutation } from '../../../react-query/use-tpjobSeekerprofile-mutation'
import { useTpJobseekerProfileQuery } from '../../../react-query/use-tpjobSeekerprofile-query'
import { Editable } from '../../molecules/Editable'
import { EmptySectionPlaceholder } from '../../molecules/EmptySectionPlaceholder'
import { componentForm } from './EditableImportantDetails.form';

interface EditableImportantDetailsProps {
  profile?: Partial<TpJobSeekerProfile>
  disableEditing?: boolean
}

export function EditableImportantDetails ({
  profile: overridingProfile,
  disableEditing,
}: EditableImportantDetailsProps) {
  const queryHookResult = useTpJobseekerProfileQuery({
    enabled: !disableEditing,
  })
  if (overridingProfile) queryHookResult.data = overridingProfile
  const mutationHookResult = useTpJobSeekerProfileUpdateMutation()
  const { data: profile } = queryHookResult

  const [isEditing, setIsEditing] = useState(false)
  const [isFormDirty, setIsFormDirty] = useState(false)

  const isEmpty = EditableImportantDetails.isSectionEmpty(profile)
  
  if (disableEditing && isEmpty) return null
  
  return (
    <Editable
      title="Important details"
      modalTitle="Help employers get in touch"
      modalHeadline="Important Details"
      {...{ disableEditing, isEditing, isFormDirty, setIsEditing }}
      readComponent={
        isEmpty ? (
          <EmptySectionPlaceholder
            height="tall"
            onClick={() => setIsEditing(true)}
          >
            Add your contact details, type of employment and availability
          </EmptySectionPlaceholder>
        ) : (
          <div
            style={{
              display: 'grid',
              width: '100%',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gridColumnGap: '32px',
              gridRowGap: '32px',
            }}
          >
            {profile?.desiredEmploymentType?.length && (
              <div>
                <Caption>Type of work</Caption>
                <PipeList
                  items={profile.desiredEmploymentType.map((x) => desiredEmploymentTypeOptionsIdToLabelMap[x])}
                  overflowAllowed
                />
              </div>
            )}

            {profile?.availability && (
              <div>
                <Caption>Availability</Caption>
                <Content>
                  {profile?.availability && profile.availability !== 'date' && (
                    <p>{availabilityOptionsIdToLabelMap[profile.availability]}</p>
                  )}
                  { profile?.ifAvailabilityIsDate_date && profile.availability === 'date' && (
                      <p>{moment(profile.ifAvailabilityIsDate_date).format('DD.MM.YYYY')}</p>
                    )}
                </Content>
              </div>
            )}

            {(profile?.phoneNumber || profile?.contactEmail) && (
              <div>
                <Caption>Contact</Caption>
                <Content>
                  {[profile?.phoneNumber, profile?.contactEmail]
                     .map((contactItem) => contactItem ? <p>{contactItem}</p> : null)}
                </Content>
              </div>
            )}

            {profile?.immigrationStatus && (
              <div>
                <Caption>Immigration status</Caption>
                <Content>
                  <p>{immigrationStatusOptionsIdToLabelMap[profile.immigrationStatus]}</p>
                </Content>
              </div>
            )}

            {profile?.postalMailingAddress && (
              <div>
                <Caption>Postal mailing address</Caption>
                <Content>
                  <p>{profile?.postalMailingAddress}</p>
                </Content>
              </div>
            )}
          </div>
        )
      }
      modalBody={
        <JobSeekerFormSectionImportantDetails
          {...{ setIsEditing, queryHookResult, mutationHookResult, setIsFormDirty }}
        />
      }
      modalStyles={{ minHeight: '40rem' }}
    />
  )
}

EditableImportantDetails.isSectionFilled = (profile: Partial<TpJobSeekerProfile>) =>
  !!profile?.availability ||
  !!profile?.desiredEmploymentType?.length ||
  !!profile?.phoneNumber ||
  !!profile?.immigrationStatus ||
  !!profile?.postalMailingAddress;

EditableImportantDetails.isSectionEmpty = (profile: Partial<TpJobSeekerProfile>) =>
  !EditableImportantDetails.isSectionFilled(profile)

// ################################################################################

// const validationSchema = Yup.object({
//   desiredPositions: Yup.array()
//     .max(3, 'You can select up to three desired positions'),
// })

interface JobSeekerFormSectionImportantDetailsProps {
  setIsEditing: (boolean: boolean) => void
  setIsFormDirty?: (boolean: boolean) => void
  queryHookResult: UseQueryResult<
    Partial<TpJobSeekerProfile | TpJobSeekerCv>,
    unknown
  >
  mutationHookResult: UseMutationResult<
    Partial<TpJobSeekerProfile | TpJobSeekerCv>,
    unknown,
    Partial<TpJobSeekerProfile | TpJobSeekerCv>,
    unknown
  >
  // TODO: this is a slippery slope. When this form section is used in the
  // Profile Builder, we need all the below fields. In the CV Builder we
  // only need these "contact details" fields. Instead of "customizing"
  // from component, we should probably build a new component
  // EditableContactDetails or something. Over the longer run, we might
  // want to create one component per field and compose forms together
  // elegantly.
  hideNonContactDetailsFields?: boolean
}

export function JobSeekerFormSectionImportantDetails ({
  setIsEditing,
  setIsFormDirty,
  queryHookResult,
  mutationHookResult,
  hideNonContactDetailsFields,
}: JobSeekerFormSectionImportantDetailsProps) {
  const { data: profile } = queryHookResult

  const formik = componentForm({
    profile,
    mutationHookResult,
    setIsEditing
  });

  useEffect(() => setIsFormDirty?.(formik.dirty), [
    formik.dirty,
    setIsFormDirty,
  ])

  return (
    <>
      <Element
        renderAs="p"
        textSize={4}
        responsive={{ mobile: { textSize: { value: 5 } } }}
        className="oneandhalf-bs"
      >
        This is where employers can get the basics that they need to get in
        touch and see your work.
      </Element>
      <TextInput
        name="contactEmail"
        placeholder="awesome@gmail.com"
        label="Email*"
        {...formik}
      />
      <TextInput
        name="phoneNumber"
        placeholder="0176 01234567"
        label="Phone Number"
        {...formik}
      />
      <TextArea
        label="Postal mailing address"
        name="postalMailingAddress"
        rows={4}
        placeholder={`Max Mustermann,\nBerlinstraße 123,\n12345 Berlin,\nGermany`}
        {...formik}
      />
      {hideNonContactDetailsFields ? null : (
        <>
          <FormSelect
            label="What kind of employment are you looking for?*"
            name="desiredEmploymentType"
            items={formDesiredEmploymentType}
            {...formik}
            multiSelect
          />
          <FormSelect
            label="When are you available to start?*"
            name="availability"
            items={formAvailabilityOptions}
            {...formik}
          />
          {formik.values.availability === 'date' && (
            <FormDatePicker
              placeholder="Select your date"
              name="ifAvailabilityIsDate_date"
              dateFormat="dd MMMM yyyy"
              minDate={new Date()}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              isClearable
              {...formik}
            />
          )}
          <FormSelect
            label="What is your immigration status?"
            name="immigrationStatus"
            items={formImmigrationStatusOptions}
            {...formik}
          />
        </>
      )}

      <Button
        disabled={!formik.isValid || mutationHookResult.isLoading}
        onClick={formik.submitForm}
      >
        Save
      </Button>
      <Button
        simple
        disabled={mutationHookResult.isLoading}
        onClick={() => setIsEditing(false)}
      >
        Cancel
      </Button>
    </>
  )
}

const formAvailabilityOptions = mapOptions(availabilityOptions)

const formDesiredEmploymentType = mapOptions(desiredEmploymentTypeOptions)

const formImmigrationStatusOptions = mapOptions(immigrationStatusOptions)
