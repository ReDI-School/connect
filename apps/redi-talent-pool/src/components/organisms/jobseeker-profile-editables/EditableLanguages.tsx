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
  const langaugeRecords = profile?.workingLanguages

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
            {langaugeRecords?.map(({ language, proficiencyLevelId }, idx) => (
              <p key={idx}>
                {language} -{' '}
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
    // We need to run the mutation tpJobseekerProfileLanguageRecordCreate
    const newRecords = values.workingLanguages.filter((record) =>
      record.id.includes('NEW')
    )

    // We need to run the mutation tpJobseekerProfileLanguageRecordPatch
    const existingRecords = values.workingLanguages.filter(
      (record) => !record.id.includes('NEW')
    )

    const deletedRecords = removedRecords.current

    const createRecordPromises = newRecords.map((record) => {
      return createMutation.mutateAsync({
        input: {
          language: record.language,
          proficiencyLevelId: record.proficiencyLevelId,
        },
      })
    })

    const patchRecordPromises = existingRecords.map((record) => {
      return patchMutation.mutateAsync({
        input: {
          id: record.id,
          language: record.language,
          proficiencyLevelId: record.proficiencyLevelId,
        },
      })
    })

    const deleteRecordPromises = deletedRecords.map((recordId) => {
      return deleteMutation.mutateAsync({
        input: {
          id: recordId,
        },
      })
    })

    formik.setSubmitting(true)
    await Promise.all([
      ...createRecordPromises,
      ...patchRecordPromises,
      ...deleteRecordPromises,
    ])
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
    (language: string) => {
      formik.setFieldValue(
        'workingLanguages',
        formik.values?.workingLanguages?.filter(
          (lang) => lang.language !== language
        )
      )
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
          title={item.language ? item.language : 'Click me to add details'}
          onRemove={() => onRemove(item.language)}
          closeAccordionSignalSubject={closeAllAccordionsSignalSubject.current}
        >
          <FormSelect
            name={`workingLanguages[${index}].language`}
            label="Language*"
            items={formLanguages}
            {...formik}
          />
          <FormSelect
            name={`workingLanguages[${index}].proficiencyLevelId`}
            label="Level of proficiency*"
            items={formLanguageProficiencyLevels}
            {...formik}
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
  value: label,
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
