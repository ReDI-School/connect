import {
  Button,
  Caption,
  FormSelect,
} from '@talent-connect/shared-atomic-design-components'
import { COURSES, REDI_LOCATION_NAMES } from '@talent-connect/shared-config'
import { TpJobseekerCv, TpJobseekerProfile } from '@talent-connect/shared-types'
import {
  desiredPositions,
  desiredPositionsIdToLabelMap,
} from '@talent-connect/talent-pool/config'
import { useFormik } from 'formik'
import React, { useEffect, useMemo, useState } from 'react'
import { Element, Tag } from 'react-bulma-components'
import { UseMutationResult, UseQueryResult } from 'react-query'
import * as Yup from 'yup'
import { useTpjobseekerprofileUpdateMutation } from '../../../react-query/use-tpjobseekerprofile-mutation'
import { useTpJobseekerProfileQuery } from '../../../react-query/use-tpjobseekerprofile-query'
import { Editable } from '../../molecules/Editable'
import { EmptySectionPlaceholder } from '../../molecules/EmptySectionPlaceholder'

interface Props {
  profile?: Partial<TpJobseekerProfile>
  disableEditing?: boolean
}

export function EditableOverview({
  profile: overridingProfile,
  disableEditing,
}: Props) {
  const queryHookResult = useTpJobseekerProfileQuery({
    enabled: !disableEditing,
  })
  if (overridingProfile) queryHookResult.data = overridingProfile
  const mutationHookResult = useTpjobseekerprofileUpdateMutation()
  const { data: profile } = queryHookResult
  const [isEditing, setIsEditing] = useState(false)
  const [isFormDirty, setIsFormDirty] = useState(false)

  const isEmpty = EditableOverview.isSectionEmpty(profile)

  if (disableEditing && isEmpty) return null

  return (
    <Editable
      disableEditing={Boolean(disableEditing)}
      isEditing={isEditing}
      isFormDirty={isFormDirty}
      setIsEditing={setIsEditing}
      title="Overview"
      readComponent={
        isEmpty ? (
          <EmptySectionPlaceholder
            height="slim"
            onClick={() => setIsEditing(true)}
          >
            Add your preferred positions
          </EmptySectionPlaceholder>
        ) : (
          <>
            <Caption>Desired positions</Caption>
            <Tag.Group>
              {profile?.desiredPositions?.map((pos) => (
                <Tag key={pos}>{desiredPositionsIdToLabelMap[pos]}</Tag>
              ))}
            </Tag.Group>
          </>
        )
      }
      modalTitle="Interests & About"
      modalHeadline="Overview"
      modalBody={
        <JobseekerFormSectionOverview
          setIsEditing={setIsEditing}
          setIsFormDirty={setIsFormDirty}
          queryHookResult={queryHookResult}
          mutationHookResult={mutationHookResult}
        />
      }
    />
  )
}

EditableOverview.isSectionFilled = (profile: Partial<TpJobseekerProfile>) =>
  profile?.desiredPositions?.length > 0
EditableOverview.isSectionEmpty = (profile: Partial<TpJobseekerProfile>) =>
  !EditableOverview.isSectionFilled(profile)

const validationSchema = Yup.object({
  desiredPositions: Yup.array()
    .min(1, 'At least one desired position is required')
    .max(3, 'You can select up to three desired positions'),
})

interface JobseekerFormSectionOverviewProps {
  setIsEditing: (boolean) => void
  setIsFormDirty?: (boolean) => void
  queryHookResult: UseQueryResult<
    Partial<TpJobseekerProfile | TpJobseekerCv>,
    unknown
  >
  mutationHookResult: UseMutationResult<
    Partial<TpJobseekerProfile | TpJobseekerCv>,
    unknown,
    Partial<TpJobseekerProfile | TpJobseekerCv>,
    unknown
  >
  hideCurrentRediCourseField?: boolean
}

export function JobseekerFormSectionOverview({
  setIsEditing,
  setIsFormDirty,
  queryHookResult,
  mutationHookResult,
  hideCurrentRediCourseField,
}: JobseekerFormSectionOverviewProps) {
  const { data: profile } = queryHookResult
  const mutation = mutationHookResult
  const initialValues: Partial<TpJobseekerProfile> = useMemo(
    () => ({
      desiredPositions: profile?.desiredPositions ?? [],
      currentlyEnrolledInCourse: profile?.currentlyEnrolledInCourse ?? '',
    }),
    [profile?.currentlyEnrolledInCourse, profile?.desiredPositions]
  )

  const onSubmit = (values: Partial<TpJobseekerProfile>) => {
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
        Let's hear a little bit about what kind of jobs you're interested in.
      </Element>
      <FormSelect
        label="Desired position* (pick 1-3)"
        name="desiredPositions"
        items={formDesiredPositions}
        {...formik}
        multiselect
        placeholder="Start typing and select positions"
        closeMenuOnSelect={false}
      />
      {hideCurrentRediCourseField ? null : (
        <FormSelect
          label="Current ReDI course"
          name="currentlyEnrolledInCourse"
          items={formCourses}
          {...formik}
        />
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

const formDesiredPositions = desiredPositions.map(({ id, label }) => ({
  value: id,
  label,
}))

// TODO: merge this logic with the stuff in SignUp.tsx
const coursesWithAlumniDeduped = [
  ...COURSES.filter((c) => {
    return !c.id.includes('alumni')
  }),
  {
    id: 'alumni',
    label: `I'm a ReDI School alumni (I took a course before)`,
    location: 'berlin',
  },
]

const formCourses = coursesWithAlumniDeduped.map((course) => {
  const label =
    course.id === 'alumni'
      ? course.label
      : `(ReDI ${REDI_LOCATION_NAMES[course.location]}) ${course.label}`
  return {
    value: course.id,
    label: label,
  }
})
