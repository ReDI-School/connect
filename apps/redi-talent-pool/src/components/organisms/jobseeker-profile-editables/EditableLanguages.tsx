import {
  TpJobseekerProfileLanguageRecord,
  useMyTpDataQuery,
  useTpJobseekerProfileLanguageRecordCreateMutation,
  useTpJobseekerProfileLanguageRecordDeleteMutation,
  useTpJobseekerProfileLanguageRecordPatchMutation,
} from '@talent-connect/data-access'
import {
  Button,
  FormDraggableAccordion,
  FormSelect,
  Icon,
} from '@talent-connect/shared-atomic-design-components'
import { LANGUAGES } from '@talent-connect/shared-config'
import {
  languageProficiencyLevels,
  languageProficiencyLevelsIdToLabelMap,
} from '@talent-connect/talent-pool/config'
import { useFormik } from 'formik'
import { cloneDeep } from 'lodash'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Content, Element } from 'react-bulma-components'
import { useQueryClient } from 'react-query'
import { Subject } from 'rxjs'
import { v4 as uuidv4 } from 'uuid'
import * as Yup from 'yup'
import { useIsBusy } from '../../../hooks/useIsBusy'
import { Editable } from '../../molecules/Editable'
import { EmptySectionPlaceholder } from '../../molecules/EmptySectionPlaceholder'
import { EditableLanguagesProfilePropFragment } from './EditableLanguages.generated'

interface Props {
  profile?: EditableLanguagesProfilePropFragment
  disableEditing?: boolean
}

export function EditableLanguages({ profile, disableEditing }: Props) {
  const languageRecords = profile?.workingLanguages

  const [isEditing, setIsEditing] = useState(false)
  const [isFormDirty, setIsFormDirty] = useState(false)

  const isEmpty = EditableLanguages.isSectionEmpty(profile)

  if (disableEditing && isEmpty) return null

  return (
    <Editable
      disableEditing={disableEditing}
      isEditing={isEditing}
      isFormDirty={isFormDirty}
      setIsEditing={setIsEditing}
      title="Languages"
      readComponent={
        isEmpty ? (
          <EmptySectionPlaceholder
            height="slim"
            onClick={() => setIsEditing(true)}
          >
            Add your languages
          </EmptySectionPlaceholder>
        ) : (
          <Content>
            {languageRecords?.map(({ language, proficiencyLevelId }, idx) => (
              <p key={idx}>
                {LANGUAGES[language]} -{' '}
                {languageProficiencyLevelsIdToLabelMap[proficiencyLevelId]}
              </p>
            ))}
          </Content>
        )
      }
      modalTitle="Relevant languages you can speak"
      modalHeadline="Languages"
      modalBody={
        <JobseekerFormSectionLanguages
          setIsEditing={setIsEditing}
          setIsFormDirty={setIsFormDirty}
        />
      }
      modalStyles={{ minHeight: 700 }}
    />
  )
}

EditableLanguages.isSectionFilled = (
  profile: EditableLanguagesProfilePropFragment
) => profile?.workingLanguages?.length > 0
EditableLanguages.isSectionEmpty = (
  profile: EditableLanguagesProfilePropFragment
) => !EditableLanguages.isSectionFilled(profile)

// TODO: put this one in config file
const MAX_LANGUAGES = 6

const validationSchema = Yup.object({
  workingLanguages: Yup.array()
    .min(1)
    .max(6)
    .of(
      Yup.object().shape({
        language: Yup.string().required(
          'Please select a language from the menu!'
        ),
        proficiencyLevelId: Yup.string().required(
          'Please choose your level of proficiency!'
        ),
      })
    ),
})

interface JobseekerFormSectionLanguagesProps {
  setIsEditing: (boolean) => void
  setIsFormDirty?: (boolean) => void
}

type FormLanguageRecord = Omit<TpJobseekerProfileLanguageRecord, 'userId'>

interface FormValues {
  workingLanguages: Array<FormLanguageRecord>
}

export function JobseekerFormSectionLanguages({
  setIsEditing,
  setIsFormDirty,
}: JobseekerFormSectionLanguagesProps) {
  const queryClient = useQueryClient()
  const myData = useMyTpDataQuery()
  const patchMutation = useTpJobseekerProfileLanguageRecordPatchMutation()
  const deleteMutation = useTpJobseekerProfileLanguageRecordDeleteMutation()
  const createMutation = useTpJobseekerProfileLanguageRecordCreateMutation()
  const removedRecords = useRef<Array<string>>([])
  const isBusy = useIsBusy()

  const closeAllAccordionsSignalSubject = useRef(new Subject<void>())

  const workingLanguages =
    myData?.data?.tpCurrentUserDataGet?.tpJobseekerDirectoryEntry
      ?.workingLanguages

  const initialValues: FormValues = useMemo(() => {
    if (!workingLanguages || workingLanguages?.length === 0) {
      return { workingLanguages: [buildBlankLanguageRecord()] }
    }
    // TODO: we should rather use structuredClone or a polyfill thereof at some future point
    return {
      workingLanguages: cloneDeep(workingLanguages),
    }
  }, [workingLanguages])

  const onSubmit = async (values: FormValues) => {
    const deletedRecords = removedRecords.current

    const newRecords = values.workingLanguages.filter((record) =>
      record.id.includes('NEW')
    )

    const existingRecords = values.workingLanguages.filter(
      (record) => !record.id.includes('NEW')
    )

    for (const recordId of deletedRecords) {
      await deleteMutation.mutateAsync({
        input: {
          id: recordId,
        },
      })
    }

    for (const record of newRecords) {
      await createMutation.mutateAsync({
        input: {
          language: record.language,
          proficiencyLevelId: record.proficiencyLevelId,
        },
      })
    }

    for (const record of existingRecords) {
      await patchMutation.mutateAsync({
        input: {
          id: record.id,
          language: record.language,
          proficiencyLevelId: record.proficiencyLevelId,
        },
      })
    }

    formik.setSubmitting(true)

    queryClient.invalidateQueries()
    formik.setSubmitting(false)
    setIsEditing(false)
    removedRecords.current = []
  }

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
    enableReinitialize: true,
  })
  useEffect(
    () => setIsFormDirty?.(formik.dirty),
    [formik.dirty, setIsFormDirty]
  )

  const onAddLanguage = useCallback(() => {
    if (formik.values.workingLanguages.length >= MAX_LANGUAGES)
      return alert('You can have maximum six languages in your profile')
    formik.setFieldValue('workingLanguages', [
      ...formik.values.workingLanguages,
      buildBlankLanguageRecord(),
    ])

    closeAllAccordionsSignalSubject.current.next()
  }, [formik])

  const onRemove = useCallback(
    (language: any) => {
      formik.setFieldValue(
        'workingLanguages',
        formik.values?.workingLanguages?.filter((lang) => lang.id !== language)
      )
      if (!language.includes('NEW')) {
        removedRecords.current.push(language)
      }
    },
    [formik]
  )

  return (
    <>
      <Element
        renderAs="p"
        textSize={4}
        responsive={{ mobile: { textSize: { value: 5 } } }}
        className="oneandhalf-bs"
      >
        Specify any relevant languages you speak and your level of proficiency.
        You can add up to six languages.
      </Element>
      {formik?.values?.workingLanguages?.map((item, index) => (
        <FormDraggableAccordion
          title={
            item.language ? LANGUAGES[item.language] : 'Click me to add details'
          }
          onRemove={() => onRemove(item.id)}
          closeAccordionSignalSubject={closeAllAccordionsSignalSubject.current}
          showDragHandle={false}
        >
          <FormSelect
            name={`workingLanguages[${index}].language`}
            label="Language*"
            items={formLanguages}
            formik={formik}
          />
          <FormSelect
            name={`workingLanguages[${index}].proficiencyLevelId`}
            label="Level of proficiency*"
            items={formLanguageProficiencyLevels}
            formik={formik}
          />
        </FormDraggableAccordion>
      ))}

      <div style={{ height: '30px' }} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          cursor: 'pointer',
          marginBottom: '30px',
        }}
        onClick={onAddLanguage}
      >
        <Icon
          icon="tpPlus"
          style={{ width: '36px', height: '36px', marginRight: '20px' }}
        />
        Add another language
      </div>

      <Button disabled={!formik.isValid || isBusy} onClick={formik.submitForm}>
        Save
      </Button>
      <Button simple disabled={isBusy} onClick={() => setIsEditing(false)}>
        Cancel
      </Button>
    </>
  )
}

const formLanguages = Object.entries(LANGUAGES).map(([value, label]) => ({
  value,
  label,
}))

const formLanguageProficiencyLevels = languageProficiencyLevels.map(
  ({ id, label }) => ({
    value: id,
    label,
  })
)

function buildBlankLanguageRecord(): FormLanguageRecord {
  return {
    id: `NEW-${uuidv4()}`,
    language: null,
    proficiencyLevelId: null,
  }
}
