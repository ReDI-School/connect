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
  TpJobseekerCvExperienceRecord,
  useFindAllTpJobseekerCvExperienceRecordsQuery,
  useTpJobseekerCvExperienceRecordCreateMutation,
  useTpJobseekerCvExperienceRecordDeleteMutation,
  useTpJobseekerCvExperienceRecordPatchMutation,
} from '@talent-connect/data-access'
import {
  Button,
  Checkbox,
  FaqItem,
  FormDraggableAccordion,
  FormInput,
  FormSelect,
  FormTextArea,
  Icon,
} from '@talent-connect/shared-atomic-design-components'
import { formMonthsOptions } from '@talent-connect/talent-pool/config'
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
import {
  rolesAndResponsibilitiesAnswer,
  rolesAndResponsibilitiesPlaceholderText,
  rolesAndResponsibilitiesQuestion,
} from '../jobseeker-profile-editables/EditableProfessionalExperience'
interface Props {
  tpJobseekerCvId: string
  onClose: () => void
  closeAccordionSignalSubject?: Subject<void>
}

export function AccordionFormCvProfessionalExperience({
  tpJobseekerCvId,
  closeAccordionSignalSubject,
  onClose: parentOnCloseCallback,
}: Props) {
  const onClose = () => {
    parentOnCloseCallback()
  }

  return (
    <AccordionForm
      title="Work experience"
      closeAccordionSignalSubject={closeAccordionSignalSubject}
    >
      <JobseekerFormSectionProfessionalExperience
        tpJobseekerCvId={tpJobseekerCvId}
        setIsEditing={(isEditing) => {
          onClose()
        }}
      />
    </AccordionForm>
  )
}

type FormExperienceRecord = Omit<
  TpJobseekerCvExperienceRecord,
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
  experience: Array<FormExperienceRecord>
}

export interface JobseekerFormSectionProfessionalExperienceProps {
  tpJobseekerCvId: string
  setIsEditing: (boolean) => void
  setIsFormDirty?: (boolean) => void
}

export function JobseekerFormSectionProfessionalExperience({
  tpJobseekerCvId,
  setIsEditing,
  setIsFormDirty,
}: JobseekerFormSectionProfessionalExperienceProps) {
  const queryClient = useQueryClient()
  const experienceRecordsQuery = useFindAllTpJobseekerCvExperienceRecordsQuery({
    tpJobseekerCvId,
  })
  const patchMutation = useTpJobseekerCvExperienceRecordPatchMutation()
  const deleteMutation = useTpJobseekerCvExperienceRecordDeleteMutation()
  const createMutation = useTpJobseekerCvExperienceRecordCreateMutation()
  const removedRecords = useRef<Array<string>>([])
  const isBusy = useIsBusy()

  const experienceRecords =
    experienceRecordsQuery.data?.tpJobseekerCvExperienceRecords

  const closeAllAccordionsSignalSubject = useRef(new Subject<void>())

  const initialValues: FormValues = useMemo(() => {
    if (!experienceRecords || experienceRecords?.length === 0) {
      return { experience: [buildBlankExperienceRecord()] }
    }
    // TODO: we should rather use structuredClone or a polyfill thereof at some future point
    const experienceRecordsMonthsYearsAsStrings = experienceRecords?.map(
      (experienceRecord) => {
        return {
          ...experienceRecord,
          startDateMonth: experienceRecord.startDateMonth?.toString(),
          startDateYear: experienceRecord.startDateYear?.toString(),
          endDateMonth: experienceRecord.endDateMonth?.toString(),
          endDateYear: experienceRecord.endDateYear?.toString(),
        }
      }
    )
    return {
      experience: cloneDeep(experienceRecordsMonthsYearsAsStrings),
    }
  }, [experienceRecords])

  const onSubmit = async (values: FormValues) => {
    // We need to run the mutation tpJobseekerProfileExperienceRecordCreate
    const newRecords = values.experience.filter((record) =>
      record.id.includes('NEW')
    )

    // We need to run the mutation tpJobseekerProfileExperienceRecordPatch
    const existingRecords = values.experience.filter(
      (record) => !record.id.includes('NEW')
    )

    const deletedRecords = removedRecords.current

    const createRecordPromises = newRecords.map((record) => {
      return createMutation.mutateAsync({
        input: {
          tpJobseekerCvId,
          current: record.current,
          description: record.description,
          endDateMonth: parseInt(record.endDateMonth),
          endDateYear: parseInt(record.endDateYear),
          city: record.city,
          country: record.country,
          company: record.company,
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
          current: record.current,
          description: record.description,
          endDateMonth: parseInt(record.endDateMonth),
          endDateYear: parseInt(record.endDateYear),
          city: record.city,
          country: record.country,
          company: record.company,
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
    experience: Yup.array().of(
      Yup.object().shape({
        title: Yup.string().required('Please provide a job title'),
        company: Yup.string().required('Please provide a company name'),
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

  const onClickAddExperience = useCallback(() => {
    const allSortIndexes = formik.values.experience.map(
      (record) => record.sortIndex
    )
    const highestSortIndex = Math.max(...allSortIndexes)
    const newSortIndex = highestSortIndex + 1
    formik.setFieldValue('experience', [
      ...formik.values.experience,
      buildBlankExperienceRecord(newSortIndex),
    ])

    closeAllAccordionsSignalSubject.current.next()
  }, [formik])

  const onDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) return

      const activeId = active.id.toString()
      const overId = over.id.toString()

      const sourceIndex = formik.values.experience.findIndex(
        (record) => record.id === activeId
      )
      const destinationIndex = formik.values.experience.findIndex(
        (record) => record.id === overId
      )

      if (sourceIndex < 0 || destinationIndex < 0) return

      const reorderedExperience = reorder(
        formik.values.experience,
        sourceIndex,
        destinationIndex
      )

      const withCorrectSortIndexes = reorderedExperience.map(
        (record, index) => ({
          ...record,
          sortIndex: index,
        })
      )

      formik.setFieldValue('experience', withCorrectSortIndexes)
    },
    [formik]
  )

  const onRemove = useCallback(
    (id: string) => {
      if (!id.includes('NEW')) {
        removedRecords.current.push(id)
      }
      formik.setFieldValue(
        'experience',
        formik.values?.experience?.filter((item) => item.id !== id)
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
        Add your relevant experience.
      </Element>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <SortableContext
          items={formik.values.experience.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div>
            {formik?.values?.experience.map((item, index) => (
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
                          name={`experience[${index}].title`}
                          placeholder="Junior Frontend Developer"
                          label="Title of your position*"
                          {...formik}
                        />
                        <FormInput
                          name={`experience[${index}].company`}
                          placeholder="Microsoft"
                          label="Company*"
                          {...formik}
                        />
                        <FormInput
                          name={`experience[${index}].city`}
                          placeholder="Berlin"
                          label="City"
                          {...formik}
                        />
                        <FormInput
                          name={`experience[${index}].country`}
                          placeholder="Germany"
                          label="Country"
                          {...formik}
                        />
                        <FormTextArea
                          label="Roles & Responsibilities"
                          name={`experience[${index}].description`}
                          rows={7}
                          placeholder={rolesAndResponsibilitiesPlaceholderText}
                          formik={formik}
                        />
                        <FaqItem
                          question={rolesAndResponsibilitiesQuestion}
                          answer={rolesAndResponsibilitiesAnswer}
                        />

                        <Checkbox.Form
                          name={`experience[${index}].current`}
                          checked={formik.values.experience[index].current}
                          {...formik}
                        >
                          I currently work here
                        </Checkbox.Form>

                        <Columns>
                          <Columns.Column size={6}>
                            <FormSelect
                              name={`experience[${index}].startDateMonth`}
                              label="Started in month*"
                              items={formMonthsOptions}
                              formik={formik}
                            />
                          </Columns.Column>
                          <Columns.Column size={6}>
                            <FormInput
                              name={`experience[${index}].startDateYear`}
                              label="Started in year*"
                              {...formik}
                            />
                          </Columns.Column>
                        </Columns>

                        {!formik.values.experience[index].current ? (
                          <Columns>
                            <Columns.Column size={6}>
                              <FormSelect
                                name={`experience[${index}].endDateMonth`}
                                label="Ended in month*"
                                items={formMonthsOptions}
                                formik={formik}
                              />
                            </Columns.Column>
                            <Columns.Column size={6}>
                              <FormInput
                                name={`experience[${index}].endDateYear`}
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
        onClick={() => onClickAddExperience()}
      >
        <Icon
          icon="tpPlus"
          style={{ width: '36px', height: '36px', marginRight: '20px' }}
        />
        Add position
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

export function buildBlankExperienceRecord(
  sortIndex = 1
): FormExperienceRecord {
  return {
    id: `NEW-${uuidv4()}`,
    title: '',
    company: '',
    city: '',
    country: '',
    description: '',
    startDateMonth: undefined,
    startDateYear: undefined,
    endDateMonth: undefined,
    endDateYear: undefined,
    current: false,
    sortIndex,
  }
}
