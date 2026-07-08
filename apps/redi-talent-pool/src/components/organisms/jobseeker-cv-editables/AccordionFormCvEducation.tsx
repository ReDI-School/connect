import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  TpJobseekerCvEducationRecord,
  useFindAllTpJobseekerCvEducationRecordsQuery,
  useTpJobseekerCvEducationRecordCreateMutation,
  useTpJobseekerCvEducationRecordDeleteMutation,
  useTpJobseekerCvEducationRecordPatchMutation,
} from '@talent-connect/data-access'
import {
  Button,
  Checkbox,
  FormDraggableAccordion,
  FormInput,
  FormSelect,
  FormTextArea,
  Icon,
} from '@talent-connect/shared-atomic-design-components'
import {
  certificationTypes,
  formMonthsOptions,
} from '@talent-connect/talent-pool/config'
import { reorder } from '@talent-connect/typescript-utilities'
import { useFormik } from 'formik'
import { cloneDeep } from 'lodash'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Columns, Element } from 'react-bulma-components'
import { useQueryClient } from 'react-query'
import { Subject } from 'rxjs'
import { v4 as uuidv4 } from 'uuid'
import * as Yup from 'yup'
import { useIsBusy } from '../../../hooks/useIsBusy'
import { AccordionForm } from '../../molecules/AccordionForm'
import { SortableItem } from '../../molecules/SortableItem'
interface Props {
  tpJobseekerCvId: string
  onClose: () => void
  closeAccordionSignalSubject?: Subject<void>
}

export function AccordionFormCvEducation({
  tpJobseekerCvId,
  closeAccordionSignalSubject,
  onClose: parentOnCloseCallback,
}: Props) {
  const onClose = () => {
    parentOnCloseCallback()
  }

  return (
    <AccordionForm
      title="Education"
      closeAccordionSignalSubject={closeAccordionSignalSubject}
    >
      <JobseekerFormSectionEducation
        tpJobseekerCvId={tpJobseekerCvId}
        setIsEditing={(isEditing) => {
          onClose()
        }}
      />
    </AccordionForm>
  )
}

type FormEducationRecord = Omit<
  TpJobseekerCvEducationRecord,
  | 'createdAt'
  | 'updatedAt'
  | 'tpJobseekerCvId'
  | 'startDateMonth'
  | 'startDateYear'
  | 'endDateMonth'
  | 'endDateYear'
  | 'userId'
> & {
  startDateMonth?: string
  startDateYear?: string
  endDateMonth?: string
  endDateYear?: string
}

interface FormValues {
  education: Array<FormEducationRecord>
}

interface JobseekerFormSectionEducationProps {
  tpJobseekerCvId: string
  setIsEditing: (boolean) => void
  setIsFormDirty?: (boolean) => void
}

function JobseekerFormSectionEducation({
  tpJobseekerCvId,
  setIsEditing,
  setIsFormDirty,
}: JobseekerFormSectionEducationProps) {
  const queryClient = useQueryClient()
  const educationRecordsQuery = useFindAllTpJobseekerCvEducationRecordsQuery({
    tpJobseekerCvId,
  })
  const patchMutation = useTpJobseekerCvEducationRecordPatchMutation()
  const deleteMutation = useTpJobseekerCvEducationRecordDeleteMutation()
  const createMutation = useTpJobseekerCvEducationRecordCreateMutation()
  const removedRecords = useRef<Array<string>>([])
  const isBusy = useIsBusy()

  const educationRecords =
    educationRecordsQuery.data?.tpJobseekerCvEducationRecords

  const closeAllAccordionsSignalSubject = useRef(new Subject<void>())

  const initialValues: FormValues = useMemo(() => {
    if (!educationRecords || educationRecords?.length === 0) {
      return { education: [buildBlankEducationRecord()] }
    }
    // TODO: we should rather use structuredClone or a polyfill thereof at some future point
    const educationRecordsMonthsYearsAsStrings = educationRecords?.map(
      (educationRecord) => {
        return {
          ...educationRecord,
          startDateMonth: educationRecord.startDateMonth?.toString(),
          startDateYear: educationRecord.startDateYear?.toString(),
          endDateMonth: educationRecord.endDateMonth?.toString(),
          endDateYear: educationRecord.endDateYear?.toString(),
        }
      }
    )
    return {
      education: cloneDeep(educationRecordsMonthsYearsAsStrings),
    }
  }, [educationRecords])

  const onSubmit = async (values: FormValues) => {
    // We need to run the mutation tpJobseekerProfileEducationRecordCreate
    const newRecords = values.education.filter((record) =>
      record.id.includes('NEW')
    )

    // We need to run the mutation tpJobseekerProfileEducationRecordPatch
    const existingRecords = values.education.filter(
      (record) => !record.id.includes('NEW')
    )

    const deletedRecords = removedRecords.current

    const createRecordPromises = newRecords.map((record) => {
      return createMutation.mutateAsync({
        input: {
          tpJobseekerCvId,
          certificationType: record.certificationType,
          current: record.current,
          description: record.description,
          endDateMonth: parseInt(record.endDateMonth),
          endDateYear: parseInt(record.endDateYear),
          institutionCity: record.institutionCity,
          institutionCountry: record.institutionCountry,
          institutionName: record.institutionName,
          sortIndex: record.sortIndex,
          startDateMonth: parseInt(record.startDateMonth),
          startDateYear: parseInt(record.startDateYear),
          title: record.title,
        },
      })
    })

    const patchRecordPromises = existingRecords.map((record) => {
      return patchMutation.mutateAsync({
        input: {
          id: record.id,
          certificationType: record.certificationType,
          current: record.current,
          description: record.description,
          endDateMonth: parseInt(record.endDateMonth),
          endDateYear: parseInt(record.endDateYear),
          institutionCity: record.institutionCity,
          institutionCountry: record.institutionCountry,
          institutionName: record.institutionName,
          sortIndex: record.sortIndex,
          startDateMonth: parseInt(record.startDateMonth),
          startDateYear: parseInt(record.startDateYear),
          title: record.title,
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

  const validationSchema = Yup.object().shape({
    education: Yup.array().of(
      Yup.object().shape({
        title: Yup.string().required('Please provide a title'),
        certificationType: Yup.string().required(
          'Please select a certification type'
        ),
        institutionName: Yup.string().required(
          'Please provide an institution name'
        ),
        startDateMonth: Yup.number().required('Please select the start month'),
        startDateYear: Yup.number()
          .typeError('Please enter a valid year value')
          .integer('Please enter a valid year value')
          .positive('Please enter a valid year value')
          .required('Please provide the start year')
          .max(new Date().getFullYear(), 'Please enter a valid year value')
          .min(
            new Date().getFullYear() - 100,
            'Please enter a valid year value'
          ),
        endDateMonth: Yup.number().when('current', {
          is: false,
          then: Yup.number().required('Please select the end month'),
        }),
        endDateYear: Yup.number().when('current', {
          is: false,
          then: Yup.number()
            .typeError('Please enter a valid year value')
            .integer('Please enter a valid year value')
            .positive('Please enter a valid year value')
            .required('Please provide the end year')
            .max(new Date().getFullYear(), 'Please enter a valid year value')
            .min(
              new Date().getFullYear() - 100,
              'Please enter a valid year value'
            ),
        }),
      })
    ),
  })

  const formik = useFormik({
    initialValues,
    onSubmit,
    validationSchema,
    enableReinitialize: true,
  })
  useEffect(
    () => setIsFormDirty?.(formik.dirty),
    [formik.dirty, setIsFormDirty]
  )

  const onClickAddEducation = useCallback(() => {
    const allSortIndexes = formik.values.education.map(
      (record) => record.sortIndex
    )
    const highestSortIndex = Math.max(...allSortIndexes)
    const newSortIndex = highestSortIndex + 1
    formik.setFieldValue('education', [
      ...formik.values.education,
      buildBlankEducationRecord(newSortIndex),
    ])

    closeAllAccordionsSignalSubject.current.next()
  }, [formik])

  const onDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) return

      const activeId = active.id.toString()
      const overId = over.id.toString()

      const sourceIndex = formik.values.education.findIndex(
        (record) => record.id === activeId
      )
      const destinationIndex = formik.values.education.findIndex(
        (record) => record.id === overId
      )

      if (sourceIndex < 0 || destinationIndex < 0) return

      const reorderedEducation = reorder(
        formik.values.education,
        sourceIndex,
        destinationIndex
      )

      const withCorrectSortIndexes = reorderedEducation.map(
        (record, index) => ({
          ...record,
          sortIndex: index,
        })
      )

      formik.setFieldValue('education', withCorrectSortIndexes)
    },
    [formik]
  )

  const onRemove = useCallback(
    (id: string) => {
      if (!id.includes('NEW')) {
        removedRecords.current.push(id)
      }
      formik.setFieldValue(
        'education',
        formik.values?.education?.filter((item) => item.id !== id)
      )
    },
    [formik]
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  return (
    <>
      <Element
        renderAs="p"
        textSize={4}
        responsive={{ mobile: { textSize: { value: 5 } } }}
        className="oneandhalf-bs"
      >
        Add your relevant education.
      </Element>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <SortableContext
          items={formik.values.education.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div>
            {formik?.values?.education.map((item, index) => (
              <SortableItem key={item.id} id={item.id}>
                <div>
                      <FormDraggableAccordion
                        title={
                          item.title ? item.title : 'Click me to add details'
                        }
                        onRemove={() => onRemove(item.id)}
                        closeAccordionSignalSubject={
                          closeAllAccordionsSignalSubject.current
                        }
                      >
                        <FormInput
                          name={`education[${index}].title`}
                          placeholder="Bachelor of Computer Science"
                          label="Title of your course/study/certification*"
                          {...formik}
                        />
                        <FormSelect
                          name={`education[${index}].certificationType`}
                          label="The type of certification*"
                          items={formCertificationTypes}
                          formik={formik}
                        />
                        <FormInput
                          name={`education[${index}].institutionName`}
                          placeholder="ReDI School of Digital Integration"
                          label="The institution or school*"
                          {...formik}
                        />
                        <FormInput
                          name={`education[${index}].institutionCity`}
                          placeholder="Munich"
                          label="The city of institution or school"
                          {...formik}
                        />
                        <FormInput
                          name={`education[${index}].institutionCountry`}
                          placeholder="Germany"
                          label="The country of institution or school"
                          {...formik}
                        />
                        <FormTextArea
                          label="Description (optional)"
                          name={`education[${index}].description`}
                          rows={7}
                          placeholder="Tell us a little bit about your course, what you learned and what you excelled at."
                          formik={formik}
                        />

                        <Checkbox.Form
                          name={`education[${index}].current`}
                          checked={formik.values.education[index].current}
                          {...formik}
                        >
                          I currently study here
                        </Checkbox.Form>

                        <Columns>
                          <Columns.Column size={6}>
                            <FormSelect
                              name={`education[${index}].startDateMonth`}
                              label="Started in month*"
                              items={formMonthsOptions}
                              formik={formik}
                            />
                          </Columns.Column>
                          <Columns.Column size={6}>
                            <FormInput
                              name={`education[${index}].startDateYear`}
                              label="Started in year*"
                              {...formik}
                            />
                          </Columns.Column>
                        </Columns>

                        {!formik.values.education[index].current ? (
                          <Columns>
                            <Columns.Column size={6}>
                              <FormSelect
                                name={`education[${index}].endDateMonth`}
                                label="Ended in month*"
                                items={formMonthsOptions}
                                formik={formik}
                              />
                            </Columns.Column>
                            <Columns.Column size={6}>
                              <FormInput
                                name={`education[${index}].endDateYear`}
                                label="Ended in year*"
                                {...formik}
                              />
                            </Columns.Column>
                          </Columns>
                        ) : null}
                      </FormDraggableAccordion>
                </div>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div style={{ height: '30px' }} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          cursor: 'pointer',
          marginBottom: '30px',
        }}
        onClick={() => onClickAddEducation()}
      >
        <Icon
          icon="tpPlus"
          style={{ width: '36px', height: '36px', marginRight: '20px' }}
        />
        Add education
      </div>

      <Button
        disabled={!formik.isValid || isBusy}
        onClick={formik.handleSubmit}
      >
        Save
      </Button>
      <Button simple disabled={isBusy} onClick={() => setIsEditing(false)}>
        Cancel
      </Button>
    </>
  )
}

const formCertificationTypes = certificationTypes.map(({ id, label }) => ({
  value: id,
  label,
}))

function buildBlankEducationRecord(sortIndex = 1): FormEducationRecord {
  return {
    id: `NEW-${uuidv4()}`,
    title: '',
    institutionName: '',
    description: '',
    institutionCity: '',
    institutionCountry: '',
    certificationType: undefined,
    startDateMonth: undefined,
    startDateYear: undefined,
    endDateMonth: undefined,
    endDateYear: undefined,
    current: false,
    sortIndex,
  }
}
