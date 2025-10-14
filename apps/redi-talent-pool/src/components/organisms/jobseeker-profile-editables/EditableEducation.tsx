import {
  TpJobseekerProfileEducationRecord,
  useMyTpDataQuery,
  useTpJobseekerProfileEducationRecordCreateMutation,
  useTpJobseekerProfileEducationRecordDeleteMutation,
  useTpJobseekerProfileEducationRecordPatchMutation,
} from '@talent-connect/data-access'
import {
  Button,
  Caption,
  Checkbox,
  FormDraggableAccordion,
  FormInput,
  FormSelect,
  FormTextArea,
  Icon,
  LightModal,
} from '@talent-connect/shared-atomic-design-components'
import {
  certificationTypes,
  formMonthsOptions,
} from '@talent-connect/talent-pool/config'
import { reorder } from '@talent-connect/typescript-utilities'
import { useFormik } from 'formik'
import { cloneDeep, isNumber } from 'lodash'
import moment from 'moment'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
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
import { EditableEducationProfilePropFragment } from './EditableEducation.generated'

interface Props {
  profile?: EditableEducationProfilePropFragment
  disableEditing?: boolean
}

export function EditableEducation({ profile, disableEditing }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [isFormDirty, setIsFormDirty] = useState(false)

  const isEmpty = EditableEducation.isSectionEmpty(profile)

  if (disableEditing && isEmpty) return null

  const educationRecords = profile?.education

  return (
    <Editable
      disableEditing={disableEditing}
      isEditing={isEditing}
      isFormDirty={isFormDirty}
      setIsEditing={setIsEditing}
      title="Education"
      readComponent={
        isEmpty ? (
          <EmptySectionPlaceholder
            height="tall"
            onClick={() => setIsEditing(true)}
          >
            Add your education
          </EmptySectionPlaceholder>
        ) : (
          educationRecords?.map((item) => (
            <div key={item.id} style={{ marginBottom: '2.8rem' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Caption>{item?.title}</Caption>
                <span style={{ color: '#979797' }}>
                  {formatDate(item.startDateMonth, item.startDateYear)} -{' '}
                  {item.current
                    ? 'Present'
                    : formatDate(item.endDateMonth, item.endDateYear)}
                </span>
              </div>
              <Content style={{ marginTop: '-0.5rem' }}>
                <Location
                  institution={item?.institutionName}
                  city={item?.institutionCity}
                  country={item?.institutionCountry}
                />
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p style={{ marginBottom: '0' }}>{children}</p>
                    ),
                  }}
                >
                  {item.description?.replace(/\n/g, `\n\n`)}
                </ReactMarkdown>
              </Content>
            </div>
          ))
        )
      }
      modalTitle="Study, certifications, courses"
      modalHeadline="Education"
      modalBody={
        <JobseekerFormSectionEducation
          setIsEditing={setIsEditing}
          setIsFormDirty={setIsFormDirty}
        />
      }
      modalStyles={{ minHeight: 700 }}
    />
  )
}

EditableEducation.isSectionFilled = (
  profile: EditableEducationProfilePropFragment
) => profile?.education?.length > 0
EditableEducation.isSectionEmpty = (
  profile: EditableEducationProfilePropFragment
) => !EditableEducation.isSectionFilled(profile)

function formatDate(month?: number, year?: number): string {
  if (isNumber(year) && !isNumber(month)) return String(year)
  if (isNumber(year) && isNumber(month))
    return moment().month(month).year(year).format('MMMM YYYY')
  if (!isNumber(year) && isNumber(month))
    return moment().month(month).format('MMMM')
  return ''
}

interface JobseekerFormSectionEducationProps {
  setIsEditing: (boolean) => void
  setIsFormDirty?: (boolean) => void
}
type FormEducationRecord = Omit<
  TpJobseekerProfileEducationRecord,
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
  education: Array<FormEducationRecord>
}

function JobseekerFormSectionEducation({
  setIsEditing,
  setIsFormDirty,
}: JobseekerFormSectionEducationProps) {
  const [educationIdToRemove, setEducationIdToRemove] = useState<
    string | undefined
  >()

  const queryClient = useQueryClient()
  const myData = useMyTpDataQuery()
  const patchMutation = useTpJobseekerProfileEducationRecordPatchMutation()
  const deleteMutation = useTpJobseekerProfileEducationRecordDeleteMutation()
  const createMutation = useTpJobseekerProfileEducationRecordCreateMutation()
  const removedRecords = useRef<Array<string>>([])
  const isBusy = useIsBusy()

  const closeAllAccordionsSignalSubject = useRef(new Subject<void>())

  const educationRecords =
    myData?.data?.tpCurrentUserDataGet?.tpJobseekerDirectoryEntry?.education

  const initialValues: FormValues = useMemo(() => {
    if (!educationRecords || educationRecords?.length === 0) {
      return {
        education: [buildBlankEducationRecord()],
      }
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

    for (const record of newRecords) {
      await createMutation.mutateAsync({
        input: {
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
    }

    for (const record of existingRecords) {
      await patchMutation.mutateAsync({
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
    (result: any) => {
      if (!result.destination) return

      const reorderedEducation = reorder(
        formik.values.education,
        result.source.index,
        result.destination.index
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
      setEducationIdToRemove(undefined)
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
        Add your relevant education.
      </Element>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="id">
          {(provided, snapshot) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {formik?.values?.education.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <FormDraggableAccordion
                        title={
                          item.title ? item.title : 'Click me to add details'
                        }
                        onRemove={() => setEducationIdToRemove(item.id)}
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
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        <LightModal
          isOpen={Boolean(educationIdToRemove)}
          handleClose={() => setEducationIdToRemove(undefined)}
          headline="Delete education entry?"
          message="You will lose all the information entered for this education entry."
          ctaLabel="Delete"
          ctaOnClick={() => onRemove(educationIdToRemove)}
          cancelLabel="Keep it"
        />
      </DragDropContext>

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

function buildBlankEducationRecord(sortIndex: number = 1): FormEducationRecord {
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
