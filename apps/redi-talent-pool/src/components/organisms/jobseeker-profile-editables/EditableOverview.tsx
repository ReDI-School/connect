import {
  TpJobseekerDirectoryEntry,
  useMyTpDataQuery,
  useTpJobseekerProfilePatchMutation,
} from '@talent-connect/data-access'
import {
  Button,
  Caption,
  Chip,
  FormSelect,
} from '@talent-connect/shared-atomic-design-components'
import {
  desiredPositions,
  desiredPositionsIdToLabelMap,
} from '@talent-connect/talent-pool/config'
import { useFormik } from 'formik'
import { useEffect, useMemo, useState } from 'react'
import { Element } from 'react-bulma-components'
import { useQueryClient } from 'react-query'
import * as Yup from 'yup'
import { useIsBusy } from '../../../hooks/useIsBusy'
import { Editable } from '../../molecules/Editable'
import { EmptySectionPlaceholder } from '../../molecules/EmptySectionPlaceholder'
import { EditableOverviewProfilePropFragment } from './EditableOverview.generated'

interface Props {
  profile?: EditableOverviewProfilePropFragment
  disableEditing?: boolean
}

export function EditableOverview({ profile, disableEditing }: Props) {
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
            <div className="tw-flex tw-items-center tw-flex-row tw-gap-2 tw-flex-wrap">
              {profile?.desiredPositions?.map((pos) => (
                <Chip key={pos} chip={desiredPositionsIdToLabelMap[pos]} />
              ))}
            </div>
          </>
        )
      }
      modalTitle="Interests & About"
      modalHeadline="Overview"
      modalBody={
        <JobseekerFormSectionOverview
          setIsEditing={setIsEditing}
          setIsFormDirty={setIsFormDirty}
        />
      }
    />
  )
}

EditableOverview.isSectionFilled = (
  profile: Pick<TpJobseekerDirectoryEntry, 'desiredPositions'>
) => profile?.desiredPositions?.length > 0
EditableOverview.isSectionEmpty = (
  profile: Pick<TpJobseekerDirectoryEntry, 'desiredPositions'>
) => !EditableOverview.isSectionFilled(profile)

const validationSchema = Yup.object({
  desiredPositions: Yup.array()
    .min(1, 'At least one desired position is required')
    .max(3, 'You can select up to three desired positions'),
})

interface JobseekerFormSectionOverviewProps {
  setIsEditing: (boolean) => void
  setIsFormDirty?: (boolean) => void
}

function JobseekerFormSectionOverview({
  setIsEditing,
  setIsFormDirty,
}: JobseekerFormSectionOverviewProps) {
  const queryClient = useQueryClient()
  const myData = useMyTpDataQuery()
  const profile = myData.data?.tpCurrentUserDataGet?.tpJobseekerDirectoryEntry
  const tpJobsekerProfileMutation = useTpJobseekerProfilePatchMutation()
  const isBusy = useIsBusy()

  const initialValues: EditableOverviewProfilePropFragment = useMemo(
    () => ({
      desiredPositions: profile?.desiredPositions ?? [],
    }),
    [profile?.desiredPositions]
  )

  const onSubmit = async (values: EditableOverviewProfilePropFragment) => {
    formik.setSubmitting(true)
    await tpJobsekerProfileMutation.mutateAsync({
      input: {
        desiredPositions: values.desiredPositions,
      },
    })
    queryClient.invalidateQueries()
    formik.setSubmitting(false)
    setIsEditing(false)
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
        formik={formik}
        multiselect
        placeholder="Start typing and select positions"
        closeMenuOnSelect={false}
      />
      <Button disabled={!formik.isValid || isBusy} onClick={formik.submitForm}>
        Save
      </Button>
      <Button simple disabled={isBusy} onClick={() => setIsEditing(false)}>
        Cancel
      </Button>
    </>
  )
}

const formDesiredPositions = desiredPositions.map(({ id, label }) => ({
  value: id,
  label,
}))
