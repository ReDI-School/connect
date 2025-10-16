import {
  TpJobseekerDirectoryEntry,
  useMyTpDataQuery,
  usePatchUserContactMutation,
  useTpJobseekerProfilePatchMutation,
} from '@talent-connect/data-access'
import {
  Button,
  Caption,
  Chip,
  FaqItem,
  FormSelect,
  FormTextArea,
} from '@talent-connect/shared-atomic-design-components'
import {
  topSkills,
  topSkillsIdToLabelMap,
} from '@talent-connect/talent-pool/config'
import { useFormik } from 'formik'
import { useEffect, useMemo, useState } from 'react'
import { Content, Element } from 'react-bulma-components'
import { useQueryClient } from 'react-query'
import * as Yup from 'yup'
import { useIsBusy } from '../../../hooks/useIsBusy'
import { Editable } from '../../molecules/Editable'
import { EmptySectionPlaceholder } from '../../molecules/EmptySectionPlaceholder'
import { EditableSummaryProfilePropFragment } from './EditableSummary.generated'

interface Props {
  profile?: EditableSummaryProfilePropFragment
  disableEditing?: boolean
}

export function EditableSummary({ profile, disableEditing }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [isFormDirty, setIsFormDirty] = useState(false)

  if (disableEditing && EditableSummary.isSectionEmpty(profile)) return null

  return (
    <Editable
      disableEditing={disableEditing}
      isEditing={isEditing}
      isFormDirty={isFormDirty}
      setIsEditing={setIsEditing}
      title="Summary"
      readComponent={
        <>
          <Caption>About</Caption>
          <Content>
            {profile?.aboutYourself ? (
              <p>{profile.aboutYourself}</p>
            ) : (
              <EmptySectionPlaceholder
                height="tall"
                onClick={() => setIsEditing(true)}
              >
                Tell us about yourself
              </EmptySectionPlaceholder>
            )}
          </Content>
          <Caption>Top skills</Caption>
          {profile?.topSkills?.length > 0 ? (
            <div className="tw-flex tw-items-center tw-flex-row tw-gap-2 tw-flex-wrap">
              {profile?.topSkills?.map((skill) => (
                <Chip key={skill} chip={topSkillsIdToLabelMap[skill]} />
              ))}
            </div>
          ) : (
            <EmptySectionPlaceholder
              height="slim"
              onClick={() => setIsEditing(true)}
            >
              Add your top skills
            </EmptySectionPlaceholder>
          )}
        </>
      }
      modalTitle="About you"
      modalHeadline="Summary"
      modalBody={
        <JobseekerFormSectionSummary
          setIsEditing={setIsEditing}
          setIsFormDirty={setIsFormDirty}
        />
      }
      modalStyles={{ minHeight: 700 }}
    />
  )
}

EditableSummary.isSectionFilled = (
  profile: Pick<TpJobseekerDirectoryEntry, 'aboutYourself' | 'topSkills'>
) => !!profile?.aboutYourself && profile?.topSkills?.length > 0
EditableSummary.isSectionEmpty = (
  profile: Pick<TpJobseekerDirectoryEntry, 'aboutYourself' | 'topSkills'>
) => !EditableSummary.isSectionFilled(profile)

const formTopSkills = topSkills.map(({ id, label }) => ({
  value: id,
  label,
}))

const MIN_CHARS_COUNT = 100
const MAX_CHARS_COUNT = 600

const validationSchema = Yup.object({
  topSkills: Yup.array()
    .min(1, 'Pick at least one top technical skill')
    .max(5, "Your profile can't contain too many skills - five at most"),
  aboutYourself: Yup.string()
    .required()
    .min(MIN_CHARS_COUNT)
    .max(MAX_CHARS_COUNT),
})

interface JobseekerFormSectionSummaryProps {
  setIsEditing: (boolean) => void
  setIsFormDirty?: (boolean) => void
}

function JobseekerFormSectionSummary({
  setIsEditing,
  setIsFormDirty,
}: JobseekerFormSectionSummaryProps) {
  const queryClient = useQueryClient()
  const myData = useMyTpDataQuery()
  const profile = myData.data?.tpCurrentUserDataGet?.tpJobseekerDirectoryEntry
  const tpJobsekerProfileMutation = useTpJobseekerProfilePatchMutation()
  const userContactMutation = usePatchUserContactMutation()
  const isBusy = useIsBusy()

  const initialValues: EditableSummaryProfilePropFragment = useMemo(
    () => ({
      aboutYourself: profile?.aboutYourself ? profile.aboutYourself : '',
      topSkills: profile?.topSkills ?? [],
    }),
    [profile?.aboutYourself, profile?.topSkills]
  )
  const onSubmit = async (values: EditableSummaryProfilePropFragment) => {
    formik.setSubmitting(true)
    await tpJobsekerProfileMutation.mutateAsync({
      input: {
        aboutYourself: values.aboutYourself,
        topSkills: values.topSkills,
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
        Tell us a bit about yourself. This is a chance to introduce yourself and
        what you’re passionate about in your field.
      </Element>
      <FormSelect
        label="Your top technical skills (pick 1-5 skills)"
        name="topSkills"
        items={formTopSkills}
        formik={formik}
        multiselect
        placeholder="Start typing and select skills"
        closeMenuOnSelect={false}
      />
      <FormTextArea
        label="About you* (100-600 characters)"
        name="aboutYourself"
        rows={7}
        placeholder="Example: UX Designer with an academic background in Psychology. Experienced in negotiating with different kinds of clients and resolving customer complaints with a high level of empathy. Committed to understanding the human mind and designing impactful products by leveraging a strong sense of analytical and critical thinking."
        minChar={MIN_CHARS_COUNT}
        maxLength={MAX_CHARS_COUNT}
        formik={formik}
      />
      <FaqItem
        question="Our tips for writing your Summary"
        answer={summaryTips}
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

export const summaryTips = `Write not more than 3-4 sentences.
<br /><br />
Make sure you talk about:<br />
1. Who are you? - Include your professional title and past relevant experiences or education with key functions.
<br /><br />
2. What do you have to offer? - Emphasize your strengths and skills that matter in your desired job, mention notable achievements, projects.
<br /><br />
3. What is your goal? - Explain how you want to add value and how you approach problems you are passionate about solving.`
