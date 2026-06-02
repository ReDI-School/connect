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
  TpJobseekerProfileExperienceRecord,
  useMyTpDataQuery,
  useTpJobseekerProfileExperienceRecordCreateMutation,
  useTpJobseekerProfileExperienceRecordDeleteMutation,
  useTpJobseekerProfileExperienceRecordPatchMutation,
} from '@talent-connect/data-access'
import {
  Button,
  Caption,
  Checkbox,
  FaqItem,
  FormDraggableAccordion,
  FormInput,
  FormSelect,
  FormTextArea,
  Icon,
  LightModal,
} from '@talent-connect/shared-atomic-design-components'
import { formMonthsOptions } from '@talent-connect/talent-pool/config'
import { reorder } from '@talent-connect/typescript-utilities'
import { useFormik } from 'formik'
import { cloneDeep, isNumber } from 'lodash'
import moment from 'moment'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Columns, Content, Element } from 'react-bulma-components'
import ReactMarkdown from 'react-markdown'
import { useQueryClient } from 'react-query'
import { Subject } from 'rxjs'
import { v4 as uuidv4 } from 'uuid'
import * as Yup from 'yup'
import { useIsBusy } from '../../../hooks/useIsBusy'
import { Editable } from '../../molecules/Editable'
import { EmptySectionPlaceholder } from '../../molecules/EmptySectionPlaceholder'
import { Location } from '../../molecules/Location'
import { SortableItem } from '../../molecules/SortableItem'
import { EditableProfessionalExperienceProfilePropFragment } from './EditableProfessionalExperience.generated'
interface Props {
  profile?: EditableProfessionalExperienceProfilePropFragment
  disableEditing?: boolean
}
export function EditableProfessionalExperience({
  profile,
  disableEditing,
}: Props) {
  const experienceRecords = profile?.experience

  const [isEditing, setIsEditing] = useState(false)
  const [isFormDirty, setIsFormDirty] = useState(false)

  const isEmpty = EditableProfessionalExperience.isSectionEmpty(profile)

  if (disableEditing && isEmpty) return null

  return (
    <Editable
      disableEditing={disableEditing}
      isEditing={isEditing}
      isFormDirty={isFormDirty}
      setIsEditing={setIsEditing}
      title="Professional experience"
      readComponent={
        isEmpty ? (
          <EmptySectionPlaceholder
            height="tall"
            onClick={() => setIsEditing(true)}
          >
            Add your experience
          </EmptySectionPlaceholder>
        ) : (
          experienceRecords?.map((item) => (
            <div key={item.id} style={{ marginBottom: '2.8rem' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Caption>{item?.title}</Caption>
                {/* TODO: put this color (and all places it is used) into gloal css */}
                <span style={{ color: '#979797' }}>
                  {formatDate(item.startDateMonth, item.startDateYear)} -{' '}
                  {item.current
                    ? 'Present'
                    : formatDate(item.endDateMonth, item.endDateYear)}
                </span>
              </div>
              <Content style={{ marginTop: '-0.5rem' }}>
                <Location
                  institution={item?.company}
                  city={item?.city}
                  country={item?.country}
                />
                {item.description ? (
                  <ReactMarkdown
                    components={{
                      p: ({ children, index }) => (
                        <p key={index} style={{ marginBottom: '0' }}>
                          {children}
                        </p>
                      ),
                    }}
                  >
                    {item.description.replace(/\n/g, `\n\n`)}
                  </ReactMarkdown>
                ) : null}
              </Content>
            </div>
          ))
        )
      }
      modalTitle="Work history"
      modalHeadline="Professional experience"
      modalBody={
        <JobseekerFormSectionProfessionalExperience
          setIsEditing={setIsEditing}
          setIsFormDirty={setIsFormDirty}
        />
      }
      modalStyles={{ minHeight: 700 }}
    />
  )
}

EditableProfessionalExperience.isSectionFilled = (
  profile: EditableProfessionalExperienceProfilePropFragment
) => profile?.experience?.length > 0
EditableProfessionalExperience.isSectionEmpty = (
  profile: EditableProfessionalExperienceProfilePropFragment
) => !EditableProfessionalExperience.isSectionFilled(profile)

function formatDate(month?: number, year?: number): string {
  if (isNumber(year) && !isNumber(month)) return String(year)
  if (isNumber(year) && isNumber(month))
    return moment().month(month).year(year).format('MMMM YYYY')
  if (!isNumber(year) && isNumber(month))
    return moment().month(month).format('MMMM')
  return ''
}

export interface JobseekerFormSectionProfessionalExperienceProps {
  setIsEditing: (boolean) => void
  setIsFormDirty?: (boolean) => void
}

type FormExperienceRecord = Omit<
  TpJobseekerProfileExperienceRecord,
  | 'createdAt'
  | 'updatedAt'
  | 'tpJobseekerProfileId'
  | 'userId'
  | 'startDateMonth'
  | 'startDateYear'
  | 'endDateMonth'
  | 'endDateYear'
> & {
  startDateMonth?: string
  startDateYear?: string
  endDateMonth?: string
  endDateYear?: string
}
interface FormValues {
  experience: Array<FormExperienceRecord>
}

export function JobseekerFormSectionProfessionalExperience({
  setIsEditing,
  setIsFormDirty,
}: JobseekerFormSectionProfessionalExperienceProps) {
  const queryClient = useQueryClient()
  const myData = useMyTpDataQuery()
  const patchMutation = useTpJobseekerProfileExperienceRecordPatchMutation()
  const deleteMutation = useTpJobseekerProfileExperienceRecordDeleteMutation()
  const createMutation = useTpJobseekerProfileExperienceRecordCreateMutation()
  const removedRecords = useRef<Array<string>>([])
  const isBusy = useIsBusy()

  const [experienceIdToRemove, setExperienceIdToRemove] = useState<
    string | undefined
  >()

  const closeAllAccordionsSignalSubject = useRef(new Subject<void>())

  const experienceRecords =
    myData?.data?.tpCurrentUserDataGet?.tpJobseekerDirectoryEntry?.experience

  const initialValues: FormValues = useMemo(() => {
    if (!experienceRecords || experienceRecords.length === 0) {
      return {
        experience: [buildBlankExperienceRecord()],
      }
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

    for (const record of newRecords) {
      await createMutation.mutateAsync({
        input: {
          city: record.city,
          company: record.company,
          country: record.country,
          current: record.current,
          description: record.description,
          endDateMonth: parseInt(record.endDateMonth),
          endDateYear: parseInt(record.endDateYear),
          sortIndex: record.sortIndex,
          startDateMonth: parseInt(record.startDateMonth),
          startDateYear: parseInt(record.startDateYear),
          title: record.title,
        },
      })
    }

    for (const record of existingRecords) {
      await patchMutation.mutateAsync({
        input: {
          id: record.id,
          city: record.city,
          company: record.company,
          country: record.country,
          current: record.current,
          description: record.description,
          endDateMonth: parseInt(record.endDateMonth),
          endDateYear: parseInt(record.endDateYear),
          sortIndex: record.sortIndex,
          startDateMonth: parseInt(record.startDateMonth),
          startDateYear: parseInt(record.startDateYear),
          title: record.title,
        },
      })
    }

    for (const recordId of deletedRecords) {
      await deleteMutation.mutateAsync({
        input: {
          id: recordId,
        },
      })
    }

    formik.setSubmitting(true)
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
      setExperienceIdToRemove(undefined)
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
                        onRemove={() => setExperienceIdToRemove(item.id)}
                        closeAccordionSignalSubject={
                          closeAllAccordionsSignalSubject.current
                        }
                        entryCategory="professional"
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
        <LightModal
          isOpen={Boolean(experienceIdToRemove)}
          handleClose={() => setExperienceIdToRemove(undefined)}
          headline="Delete professional experience?"
          message="You will lose all the information entered for this professional experience."
          ctaLabel="Delete"
          ctaOnClick={() => onRemove(experienceIdToRemove)}
          cancelLabel="Keep it"
        />
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

export const rolesAndResponsibilitiesPlaceholderText = `Example:

• Supported the Visual Studio Team by creating wireframes using storyboarding and customer mapping.
• Validated design decisions by conducting remote usability, resulted in an increase of conversion rate by 10%.`

export const rolesAndResponsibilitiesQuestion =
  'Our tips for writing Roles and Responsibilities'
export const rolesAndResponsibilitiesAnswer = `• Write a list of 2-3 bullet points.<br />
• Begin sentences with action verbs, such as designed, created, provided, resolved, etc.<br />
• Focus on skills and accomplishments.<br />
• Quantify as much information as you can. (Example: Resolved customer complaints. --> Resolved customer complaints, answering approximately 200 calls per week.`
