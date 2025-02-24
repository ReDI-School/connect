import {
  AllTpJobListingFieldsFragment,
  useMyTpDataQuery,
  useTpJobListingCreateMutation,
  useTpJobListingDeleteMutation,
  useTpJobListingPatchMutation,
} from '@talent-connect/data-access'
import {
  Button,
  Checkbox,
  FormInput,
  FormSelect,
  Heading,
  Icon,
  LightModal,
  Modal,
  showNotification,
  TextEditor,
} from '@talent-connect/shared-atomic-design-components'
import { TALENT_POOL_URL } from '@talent-connect/shared-config'
import { TpJobListing } from '@talent-connect/shared-types'
import {
  desiredPositions,
  employmentTypes,
  germanFederalStates,
  topSkills,
} from '@talent-connect/talent-pool/config'
import { objectEntries } from '@talent-connect/typescript-utilities'
import { formatDistance } from 'date-fns'
import { useFormik } from 'formik'
import { defaults, pick } from 'lodash'
import { useCallback, useState } from 'react'
import { Columns, Element } from 'react-bulma-components'
import { useQueryClient } from 'react-query'
import * as Yup from 'yup'
import { CardContextMenu } from '../../../components/molecules/CardContextMenu'
import { EmptySectionPlaceholder } from '../../molecules/EmptySectionPlaceholder'
import { JobListingCard } from '../JobListingCard'
import { useLoadModalFormJobListingDataQuery } from './EditableJobPostings.generated'
import JobPlaceholderCardUrl from './job-placeholder-card.svg'

export function EditableJobPostings({ jobListings }) {
  const [isEditing, setIsEditing] = useState(false)
  const [idOfTpJobListingBeingEdited, setIdOfTpJobListingBeingEdited] =
    useState<string | null>(null) // null = "new"
  const startAdding = useCallback(() => {
    setIdOfTpJobListingBeingEdited(null) // means "new"
    setIsEditing(true)
  }, [])
  const startEditing = useCallback((id: string) => {
    setIdOfTpJobListingBeingEdited(id)
    setIsEditing(true)
  }, [])

  const isEmpty = !jobListings || jobListings.length === 0

  return (
    <>
      <div className="profile-section">
        <div className="profile-section--title is-flex is-flex-direction-row">
          <Element
            renderAs="h4"
            textSize={4}
            responsive={{ mobile: { textSize: { value: 5 } } }}
            className="is-flex-grow-1"
            style={{ flexGrow: 1 }}
          >
            Job postings
          </Element>
          <div className="icon__button" onClick={startAdding}>
            <Icon icon="plus" />
          </div>
        </div>

        <div className="profile-section--body">
          {isEmpty ? (
            <EmptySectionPlaceholder
              height="none"
              onClick={() => setIsEditing(true)}
              style={{ padding: '0.7rem 1.2rem 1.7rem 1.2rem' }}
            >
              <div
                style={{
                  backgroundImage: `url(${JobPlaceholderCardUrl})`,
                  backgroundRepeat: 'x-repeat',
                  backgroundSize: 'contain',
                  height: '13rem',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #58ADC4',
                    color: '#58ADC4',
                    padding: '0.5rem 5rem',
                  }}
                >
                  Add your job postings
                </div>
              </div>
            </EmptySectionPlaceholder>
          ) : (
            <JobListingCards
              jobListings={jobListings}
              startEditing={startEditing}
            />
          )}
        </div>
      </div>
      <ModalForm
        tpJobListingId={idOfTpJobListingBeingEdited}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
      />
    </>
  )
}

const MIN_CHARS_COUNT = 200
const MAX_CHARS_COUNT = 255

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Please provide a job title'),
  location: Yup.string().required('Please provide a location'),
  summary: Yup.string()
    .required('Please provide job description')
    .min(MIN_CHARS_COUNT),
  relatesToPositions: Yup.array().min(
    1,
    'Please select at least one related position'
  ),
  idealTechnicalSkills: Yup.array()
    .min(1, 'Please select at least one relevant technical skill')
    .max(6, 'Please select up to six skills'),
  employmentType: Yup.mixed().required('Please select an employment type'),
  languageRequirements: Yup.string().required(
    'Please specify the language requirement(s)'
  ),
  salaryRange: Yup.string()
    .nullable()
    .label('Salary Range')
    .max(MAX_CHARS_COUNT),
  contactFirstName: Yup.string().required('First name is required'),
  contactLastName: Yup.string().required('Last name is required'),
  contactPhoneNumber: Yup.string().nullable(),
  contactEmailAddress: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
})

interface ModalFormProps {
  tpJobListingId: string
  isEditing: boolean
  setIsEditing: (boolean) => void
}

function JobListingCards({ jobListings, startEditing }) {
  const queryClient = useQueryClient()

  const [deleteModalOpenForJobPostingId, setDeleteModalOpenForJobPostingId] =
    useState<string | null>(null)
  const handleDeleteModalClose = useCallback(
    () => setDeleteModalOpenForJobPostingId(null),
    []
  )
  const deleteMutation = useTpJobListingDeleteMutation()
  const handleDelete = useCallback(
    (id: string) => {
      handleDeleteModalClose()
      deleteMutation.mutate(
        { input: { id } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries()
          },
        }
      )
    },
    [deleteMutation, handleDeleteModalClose, queryClient]
  )

  const copyUrl = useCallback((id: string) => {
    // Keep in sync with routes__logged-in.tsx:
    // TODO: use a shared function/constant
    window.navigator.clipboard.writeText(
      TALENT_POOL_URL + '/app/job-listing/' + id
    )
    showNotification('Link copied to clipboard')
  }, [])

  return (
    <Columns>
      {jobListings?.map((jobListing) => (
        <Columns.Column size={12} key={jobListing.id}>
          <JobListingCard
            jobListing={jobListing}
            timestamp={renderTimestamp(jobListing.expiresAt)}
            renderCTA={() => (
              <CardContextMenu
                menuItems={[
                  {
                    label: 'Edit',
                    onClick: () => startEditing(jobListing.id),
                    icon: 'editLightGrey',
                  },
                  {
                    label: 'Copy link',
                    onClick: () => copyUrl(jobListing.id),
                    icon: 'link',
                  },
                  {
                    label: 'Delete',
                    onClick: () =>
                      setDeleteModalOpenForJobPostingId(jobListing.id),
                    icon: 'delete',
                  },
                ]}
              >
                <LightModal
                  isOpen={deleteModalOpenForJobPostingId === jobListing.id}
                  handleClose={handleDeleteModalClose}
                  headline="Delete job posting?"
                  message="You will lose all the information entered for this job posting."
                  ctaLabel="Delete"
                  ctaOnClick={() => handleDelete(jobListing.id)}
                  cancelLabel="Keep it"
                />
              </CardContextMenu>
            )}
          />
        </Columns.Column>
      ))}
    </Columns>
  )
}

function ModalForm({
  isEditing,
  setIsEditing,
  tpJobListingId,
}: ModalFormProps) {
  const queryClient = useQueryClient()
  const jobListingToBeEditedQuery = useLoadModalFormJobListingDataQuery(
    { id: tpJobListingId },
    { enabled: Boolean(tpJobListingId) && isEditing }
  )
  const myDataQuery = useMyTpDataQuery()
  const userContact = myDataQuery.data?.tpCurrentUserDataGet.userContact
  const companyData = myDataQuery.data?.tpCurrentUserDataGet.representedCompany

  const createMutation = useTpJobListingCreateMutation()
  const updateMutation = useTpJobListingPatchMutation()

  let jobListing = null
  if (isEditing) {
    if (tpJobListingId && jobListingToBeEditedQuery.isSuccess) {
      jobListing = jobListingToBeEditedQuery.data.tpJobListing
    }
    if (!tpJobListingId) {
      jobListing = buildBlankJobListing(
        myDataQuery.data.tpCurrentUserDataGet.representedCompany.id
      )
    }
  }

  const onSubmit = (
    values: Partial<AllTpJobListingFieldsFragment>,
    { resetForm }
  ) => {
    console.log({ values })
    if (tpJobListingId === null) {
      // create new
      formik.setSubmitting(true)
      createMutation.mutate(
        { input: values },
        {
          onSettled: () => {
            formik.setSubmitting(false)
          },
          onSuccess: () => {
            setIsEditing(false)
            resetForm()
            queryClient.invalidateQueries()
          },
        }
      )
    } else {
      // update existing
      formik.setSubmitting(true)
      updateMutation.mutate(
        { input: { id: tpJobListingId, ...values } },
        {
          onSettled: () => {
            formik.setSubmitting(false)
          },
          onSuccess: () => {
            setIsEditing(false)
            resetForm()
            queryClient.invalidateQueries()
          },
        }
      )
    }
  }

  const initialValues = pick(
    jobListing,
    'title',
    'location',
    'summary',
    'relatesToPositions',
    'idealTechnicalSkills',
    'employmentType',
    'languageRequirements',
    'isRemotePossible',
    'federalState',
    'salaryRange',
    'contactFirstName',
    'contactLastName',
    'contactPhoneNumber',
    'contactEmailAddress'
  )

  /**
   * Setting initial values for contact details from user contact.
   * Note: Since 'defaults' function doesn't work with null values,
   * we need to also set initial values for these values to empty strings
   * in the net step.
   */
  defaults(initialValues, {
    contactFirstName: userContact?.firstName,
    contactLastName: userContact?.lastName,
    contactPhoneNumber: companyData.telephoneNumber,
    contactEmailAddress: userContact?.email,
  })

  /**
   * Need to set initial values for these values to empty strings
   * Initial values for a new joblisting will be an empty string but
   * for an existing joblisting it will be null, which will break the
   * formik form validation
   */
  initialValues.contactFirstName = initialValues.contactFirstName ?? ''
  initialValues.contactLastName = initialValues.contactLastName ?? ''
  initialValues.contactPhoneNumber = initialValues.contactPhoneNumber ?? ''
  initialValues.contactEmailAddress = initialValues.contactEmailAddress ?? ''

  const formik = useFormik({
    initialValues,
    onSubmit,
    validationSchema,
    enableReinitialize: true,
  })

  if (!formik.values) return null

  console.log(formik)

  return (
    <Modal
      title=""
      show={isEditing}
      stateFn={setIsEditing}
      confirm={formik.dirty}
    >
      {formik.values && (
        <Modal.Body>
          <Element
            renderAs="h4"
            textTransform="uppercase"
            textSize={6}
            className="oneandhalf-bs"
          >
            Publish job postings on Talent Pool
          </Element>
          <Heading size="medium" border="bottomLeft">
            Job Posting
          </Heading>
          <Element
            renderAs="p"
            textSize={4}
            responsive={{ mobile: { textSize: { value: 5 } } }}
            className="oneandhalf-bs"
          >
            Add the job postings you want to publish to jobseekers at ReDI
            School.
          </Element>
          <FormInput
            name="title"
            placeholder="Junior Frontend Developer"
            label="Job Title*"
            {...formik}
          />
          <FormInput
            name="location"
            placeholder="Where is the position based"
            label="Location*"
            {...formik}
          />
          <FormSelect
            name="federalState"
            label="Location (Federal State in Germany)"
            items={federalStatesOptions}
            placeholder="Select federal states"
            formik={formik}
          />
          <Checkbox.Form
            name="isRemotePossible"
            checked={formik.values?.isRemotePossible}
            {...formik}
          >
            Remote working is possible for this job listing
          </Checkbox.Form>
          <TextEditor
            name="summary"
            label="Job Summary*"
            placeholder="Tell us a bit about the position, expectations & ideal candidate."
            minChar={MIN_CHARS_COUNT}
            formik={formik}
          />
          <Element
            renderAs="p"
            textSize={6}
            responsive={{ mobile: { textSize: { value: 5 } } }}
            className="oneandhalf-bs"
          >
            We use a standardised list of skills and positions to help with the
            matching process of our candidates. Please select the top 6 skills
            you think are necessary for succeeding in this job, and up to 3
            position titles that match this job. We will use those to suggest
            potential matches.
          </Element>
          <FormSelect
            label="Related positions*"
            name="relatesToPositions"
            items={formRelatedPositions}
            formik={formik}
            multiselect
            placeholder="Start typing and select positions"
            closeMenuOnSelect={false}
          />
          <FormSelect
            label="Ideal technical skills*"
            name="idealTechnicalSkills"
            items={formTopSkills}
            formik={formik}
            multiselect
            placeholder="Start typing and select skills"
            closeMenuOnSelect={false}
          />
          <FormSelect
            label="Employment type*"
            name="employmentType"
            items={formEmploymentType}
            formik={formik}
          />
          <FormInput
            name="languageRequirements"
            placeholder="German C1, English B2, French B1..."
            label="Language requirements*"
            {...formik}
          />
          <FormInput
            label="Salary range"
            placeholder="€40K - €52K"
            name="salaryRange"
            {...formik}
          />
          <Element
            renderAs="h4"
            textTransform="uppercase"
            textSize={8}
            className="oneandhalf-bs"
          >
            Point of Contact for this role
          </Element>
          <FormInput
            label="First Name*"
            placeholder="John"
            name="contactFirstName"
            {...formik}
          />
          <FormInput
            label="Last Name*"
            placeholder="Doe"
            name="contactLastName"
            {...formik}
          />
          <FormInput
            label="Email*"
            placeholder="johndoe@example.com"
            name="contactEmailAddress"
            {...formik}
          />
          <FormInput
            label="Phone Number"
            placeholder="0049123456789"
            name="contactPhoneNumber"
            {...formik}
          />
          <div style={{ height: '30px' }} />

          <div style={{ display: 'flex' }}>
            <div style={{ flexGrow: 1 }}>
              <Button
                disabled={!formik.isValid || updateMutation.isLoading}
                onClick={formik.handleSubmit}
              >
                Save
              </Button>
              <Button
                simple
                disabled={updateMutation.isLoading}
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      )}
    </Modal>
  )
}

function buildBlankJobListing(
  tpCompanyProfileId: string
): Partial<TpJobListing> {
  return {
    title: '',
    location: '',
    summary: '',
    relatesToPositions: [],
    idealTechnicalSkills: [],
    employmentType: '',
    languageRequirements: '',
    salaryRange: '',
    tpCompanyProfileId,
  }
}

const formTopSkills = topSkills.map(({ id, label }) => ({
  value: id,
  label,
}))

const formEmploymentType = employmentTypes.map(({ id, label }) => ({
  value: id,
  label,
}))

const formRelatedPositions = desiredPositions.map(({ id, label }) => ({
  value: id,
  label,
}))

const federalStatesOptions = objectEntries(germanFederalStates).map(
  ([value, label]) => ({
    value,
    label,
  })
)

const renderTimestamp = (expiresAt) =>
  `Expires ${formatDistance(new Date(expiresAt), new Date(), {
    addSuffix: true,
  })}`
