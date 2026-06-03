import {
  TpJobseekerCvLanguageRecord,
  useFindAllTpJobseekerCvLanguageRecordsQuery,
  useTpJobseekerCvLanguageRecordCreateMutation,
  useTpJobseekerCvLanguageRecordDeleteMutation,
  useTpJobseekerCvLanguageRecordPatchMutation,
} from '@talent-connect/data-access'
import {
  Button,
  FormDraggableAccordion,
  FormSelect,
  Icon,
} from '@talent-connect/shared-atomic-design-components'
import { LANGUAGES } from '@talent-connect/shared-config'
import { languageProficiencyLevels } from '@talent-connect/talent-pool/config'
import { useFormik } from 'formik'
import { cloneDeep } from 'lodash'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Element } from 'react-bulma-components'
import { useQueryClient } from 'react-query'
import { Subject } from 'rxjs'
import { v4 as uuidv4 } from 'uuid'
import * as Yup from 'yup'
import { useIsBusy } from '../../../hooks/useIsBusy'
import { AccordionForm } from '../../molecules/AccordionForm'
interface Props {
  tpJobseekerCvId: string
  onClose: () => void
  closeAccordionSignalSubject?: Subject<void>
}

export function AccordionFormCvLanguages({
  tpJobseekerCvId,
  closeAccordionSignalSubject,
  onClose: parentOnCloseCallback,
}: Props) {
  const onClose = () => {
    parentOnCloseCallback()
  }

  return (
    <AccordionForm
      title="Languages"
      closeAccordionSignalSubject={closeAccordionSignalSubject}
    >
      <JobseekerFormSectionLanguages
        tpJobseekerCvId={tpJobseekerCvId}
        setIsEditing={(isEditing) => {
          onClose()
        }}
      />
    </AccordionForm>
  )
}

interface JobseekerFormSectionLanguagesProps {
  tpJobseekerCvId: string
  setIsEditing: (boolean) => void
  setIsFormDirty?: (boolean) => void
}

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

type FormLanguageRecord = Omit<
  TpJobseekerCvLanguageRecord,
  'tpJobseekerCvId' | 'userId'
>

interface FormValues {
  workingLanguages: Array<FormLanguageRecord>
}

export function JobseekerFormSectionLanguages({
  tpJobseekerCvId,
  setIsEditing,
  setIsFormDirty,
}: JobseekerFormSectionLanguagesProps) {
  const queryClient = useQueryClient()
  const educationRecordsQuery = useFindAllTpJobseekerCvLanguageRecordsQuery({
    tpJobseekerCvId,
  })
  const patchMutation = useTpJobseekerCvLanguageRecordPatchMutation()
  const deleteMutation = useTpJobseekerCvLanguageRecordDeleteMutation()
  const createMutation = useTpJobseekerCvLanguageRecordCreateMutation()
  const removedRecords = useRef<Array<string>>([])
  const isBusy = useIsBusy()

  const workingLanguages =
    educationRecordsQuery.data?.tpJobseekerCvLanguageRecords

  const closeAllAccordionsSignalSubject = useRef(new Subject<void>())

  const initialValues: FormValues = useMemo(() => {
    if (!workingLanguages || workingLanguages?.length === 0) {
      return {
        workingLanguages: [buildBlankLanguageRecord()],
      }
    }
    return {
      workingLanguages: cloneDeep(workingLanguages),
    }
  }, [workingLanguages])

  const onSubmit = async (values: FormValues) => {
    // We need to run the mutation tpJobseekerCvLanguageRecordCreate
    const newRecords = values.workingLanguages.filter((record) =>
      record.id.includes('NEW')
    )

    // We need to run the mutation tpJobseekerCvLanguageRecordPatch
    const existingRecords = values.workingLanguages.filter(
      (record) => !record.id.includes('NEW')
    )

    const deletedRecords = removedRecords.current

    const createRecordPromises = newRecords.map((record) => {
      return createMutation.mutateAsync({
        input: {
          tpJobseekerCvId,
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
    (id: string) => {
      if (!id.includes('NEW')) {
        removedRecords.current.push(id)
      }
      formik.setFieldValue(
        'workingLanguages',
        formik.values?.workingLanguages?.filter((lang) => lang.id !== id)
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
