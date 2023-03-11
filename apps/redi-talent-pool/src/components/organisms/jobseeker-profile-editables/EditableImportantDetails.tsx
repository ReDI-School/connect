import { useFormik } from 'formik'
import isNil from 'lodash/isNil'
import moment from 'moment'
import { useEffect, useMemo, useState } from 'react'
import { Content, Element } from 'react-bulma-components'
import { UseMutationResult, UseQueryResult } from 'react-query'
import * as Yup from 'yup'

import { TpJobseekerProfileEntityProps } from '@talent-connect/common-types'
import {
  Button,
  Caption,
  FormDatePicker,
  FormInput,
  FormSelect,
  FormTextArea,
  PipeList,
} from '@talent-connect/shared-atomic-design-components'
import { TpJobseekerCv } from '@talent-connect/shared-types'
import {
  availabilityOptions,
  availabilityOptionsIdToLabelMap,
  employmentTypes,
  employmentTypesIdToLabelMap,
  immigrationStatusOptions,
  immigrationStatusOptionsIdToLabelMap,
} from '@talent-connect/talent-pool/config'
import { useTpjobseekerprofileUpdateMutation } from '../../../react-query/use-tpjobseekerprofile-mutation'
import { Editable } from '../../molecules/Editable'
import { EmptySectionPlaceholder } from '../../molecules/EmptySectionPlaceholder'

interface Props {
  profile?: Partial<TpJobseekerProfileEntityProps>
  disableEditing?: boolean
  showFullAddress?: boolean
}

export function EditableImportantDetails({
  profile: overridingProfile,
  disableEditing,
  showFullAddress,
}: Props) {
  const queryHookResult = useTpJobseekerProfileEntityPropsQuery({
    enabled: !disableEditing,
  })
  if (overridingProfile) queryHookResult.data = overridingProfile
  const mutationHookResult = useTpjobseekerprofileUpdateMutation()
  const { data: profile } = queryHookResult
  const [isEditing, setIsEditing] = useState(false)
  const [isFormDirty, setIsFormDirty] = useState(false)

  const isEmpty = EditableImportantDetails.isSectionEmpty(profile)

  if (disableEditing && isEmpty) return null

  return (
    <Editable
      disableEditing={disableEditing}
      isEditing={isEditing}
      isFormDirty={isFormDirty}
      setIsEditing={setIsEditing}
      title="Important details"
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
            {profile &&
            profile.desiredEmploymentType &&
            profile.desiredEmploymentType.length > 0 ? (
              <div>
                <Caption>Type of work</Caption>
                <PipeList
                  items={profile.desiredEmploymentType.map(
                    (x) => employmentTypesIdToLabelMap[x]
                  )}
                  overflowAllowed
                />
              </div>
            ) : null}

            {profile?.availability ? (
              <div>
                <Caption>Availability</Caption>
                <Content>
                  {profile?.availability && profile.availability !== 'date' && (
                    <p>
                      {availabilityOptionsIdToLabelMap[profile?.availability]}
                    </p>
                  )}
                  {profile?.availability &&
                    profile.availability === 'date' &&
                    profile.ifAvailabilityIsDate_date && (
                      <p>
                        {moment(profile.ifAvailabilityIsDate_date).format(
                          'DD.MM.YYYY'
                        )}
                      </p>
                    )}
                </Content>
              </div>
            ) : null}

            {profile?.phoneNumber || profile?.contactEmail ? (
              <div>
                <Caption>Contact</Caption>
                <Content>
                  {[profile?.phoneNumber, profile?.contactEmail].map(
                    (contactItem) => (contactItem ? <p>{contactItem}</p> : null)
                  )}
                </Content>
              </div>
            ) : null}

            {profile?.immigrationStatus ? (
              <div>
                <Caption>Immigration status</Caption>
                <Content>
                  <p>
                    {
                      immigrationStatusOptionsIdToLabelMap[
                        profile?.immigrationStatus
                      ]
                    }
                  </p>
                </Content>
              </div>
            ) : null}

            {showFullAddress && profile?.postalMailingAddress ? (
              <div>
                <Caption>Postal mailing address</Caption>
                <Content>
                  <p>{profile?.postalMailingAddress}</p>
                </Content>
              </div>
            ) : null}

            {!isNil(profile?.willingToRelocate) ? (
              <div>
                <Caption>Willing to relocate</Caption>
                <Content>
                  <p>{profile?.willingToRelocate ? 'Yes' : 'No'}</p>
                </Content>
              </div>
            ) : null}
          </div>
        )
      }
      modalTitle="Help employers get in touch"
      modalHeadline="Important Details"
      modalBody={
        <JobseekerFormSectionImportantDetails
          setIsEditing={setIsEditing}
          setIsFormDirty={setIsFormDirty}
          queryHookResult={queryHookResult}
          mutationHookResult={mutationHookResult}
        />
      }
      modalStyles={{ minHeight: '40rem' }}
    />
  )
}

EditableImportantDetails.isSectionFilled = (
  profile: Partial<TpJobseekerProfileEntityProps>
) =>
  profile?.availability ||
  profile?.desiredEmploymentType?.length > 0 ||
  profile?.phoneNumber ||
  profile?.immigrationStatus ||
  profile?.postalMailingAddress
EditableImportantDetails.isSectionEmpty = (
  profile: Partial<TpJobseekerProfileEntityProps>
) => !EditableImportantDetails.isSectionFilled(profile)

const validationSchema = Yup.object({
  desiredPositions: Yup.array().max(
    3,
    'You can select up to three desired positions'
  ),
})

interface JobseekerFormSectionImportantDetailsProps {
  setIsEditing: (boolean) => void
  setIsFormDirty?: (boolean) => void
  queryHookResult: UseQueryResult<
    Partial<TpJobseekerProfileEntityProps | TpJobseekerCv>,
    unknown
  >
  mutationHookResult: UseMutationResult<
    Partial<TpJobseekerProfileEntityProps | TpJobseekerCv>,
    unknown,
    Partial<TpJobseekerProfileEntityProps | TpJobseekerCv>,
    unknown
  >
  // TODO: this is a slippery slope. When this form section is used in the
  // Profiile Builder, we need all the below fields. In the CV Builder we
  // only need these "contact details" fields. Instead of "customizing"
  // from component, we should probably build a new component
  // EditableContactDetails or something. Over the longer run, we might
  // want to create one component per field and compose forms together
  // elegantly.
  hideNonContactDetailsFields?: boolean
}

export function JobseekerFormSectionImportantDetails({
  setIsEditing,
  setIsFormDirty,
  queryHookResult,
  mutationHookResult,
  hideNonContactDetailsFields,
}: JobseekerFormSectionImportantDetailsProps) {
  const { data: profile } = queryHookResult
  const mutation = mutationHookResult
  const initialValues: Partial<TpJobseekerProfileEntityProps> = useMemo(
    () => ({
      availability: profile?.availability ?? '',
      desiredEmploymentType: profile?.desiredEmploymentType ?? [],
      contactEmail: profile?.contactEmail ?? '',
      phoneNumber: profile?.phoneNumber ?? '',
      postalMailingAddress: profile?.postalMailingAddress ?? '',
      ifAvailabilityIsDate_date: profile?.ifAvailabilityIsDate_date
        ? new Date(profile.ifAvailabilityIsDate_date)
        : null,
      immigrationStatus: profile?.immigrationStatus ?? '',
      willingToRelocate: profile?.willingToRelocate,
    }),
    [
      profile?.availability,
      profile?.contactEmail,
      profile?.desiredEmploymentType,
      profile?.ifAvailabilityIsDate_date,
      profile?.immigrationStatus,
      profile?.phoneNumber,
      profile?.postalMailingAddress,
      profile?.willingToRelocate,
    ]
  )
  const onSubmit = (values: Partial<TpJobseekerProfileEntityProps>) => {
    formik.setSubmitting(true)
    mutation.mutate(values, {
      onSettled: () => {
        formik.setSubmitting(false)
      },
      onSuccess: () => {
        setIsEditing(false)
      },
    })
  }
  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit,
    validateOnMount: true,
  })
  useEffect(
    () => setIsFormDirty?.(formik.dirty),
    [formik.dirty, setIsFormDirty]
  )

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
      <FormInput
        name="contactEmail"
        placeholder="awesome@gmail.com"
        label="Email*"
        {...formik}
      />
      <FormInput
        name="phoneNumber"
        placeholder="0176 01234567"
        label="Phone Number"
        {...formik}
      />
      <FormTextArea
        label="Postal mailing address"
        name="postalMailingAddress"
        rows={4}
        placeholder={`Max Mustermann,\nBerlinstraße 123,\n12345 Berlin,\nGermany`}
        formik={formik}
      />
      {hideNonContactDetailsFields ? null : (
        <>
          <FormSelect
            label="What kind of employment are you looking for?*"
            name="desiredEmploymentType"
            items={formEmploymentTypes}
            {...formik}
            multiselect
            placeholder="Select desired employment types"
            closeMenuOnSelect={false}
          />
          <FormSelect
            label="When are you available to start?*"
            name="availability"
            items={formAvailabilityOptions}
            {...formik}
          />
          {formik.values.availability === 'date' ? (
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
          ) : null}
          <FormSelect
            label="What is your immigration status?"
            name="immigrationStatus"
            items={formImmigrationStatusOptions}
            {...formik}
          />
        </>
      )}

      <Button
        disabled={!formik.isValid || mutation.isLoading}
        onClick={formik.submitForm}
      >
        Save
      </Button>
      <Button
        simple
        disabled={mutation.isLoading}
        onClick={() => setIsEditing(false)}
      >
        Cancel
      </Button>
    </>
  )
}

const formAvailabilityOptions = availabilityOptions.map(({ id, label }) => ({
  value: id,
  label,
}))

const formEmploymentTypes = employmentTypes.map(({ id, label }) => ({
  value: id,
  label,
}))

const formImmigrationStatusOptions = immigrationStatusOptions.map(
  ({ id, label }) => ({
    value: id,
    label,
  })
)
