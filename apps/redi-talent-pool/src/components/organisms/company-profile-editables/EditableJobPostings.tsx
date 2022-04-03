import {
  Button,
  FormInput,
  FormSelect,
  FormTextArea,
  Heading,
  Icon,
  Modal,
  Checkbox,
} from '@talent-connect/shared-atomic-design-components'
import { TpJobListing, TpJobseekerProfile } from '@talent-connect/shared-types'
import {
  desiredPositions,
  employmentTypes,
  germanFederalStates,
  topSkills,
} from '@talent-connect/talent-pool/config'
import { useFormik } from 'formik'
import React, { useCallback, useState, useEffect } from 'react'
import { Columns, Element } from 'react-bulma-components'
import * as Yup from 'yup'
import { useTpCompanyProfileQuery } from '../../../react-query/use-tpcompanyprofile-query'
import { useTpJobListingAllQuery } from '../../../react-query/use-tpjoblisting-all-query'
import { useTpJobListingCreateMutation } from '../../../react-query/use-tpjoblisting-create-mutation'
import { useTpJobListingDeleteMutation } from '../../../react-query/use-tpjoblisting-delete-mutation'
import { useTpJobListingOneOfCurrentUserQuery } from '../../../react-query/use-tpjoblisting-one-query'
import { useTpJobListingUpdateMutation } from '../../../react-query/use-tpjoblisting-update-mutation'
import { EmptySectionPlaceholder } from '../../molecules/EmptySectionPlaceholder'
import { JobListingCard } from '../JobListingCard'
import JobPlaceholderCardUrl from './job-placeholder-card.svg'
import { get } from 'lodash'
import { objectEntries } from '@talent-connect/typescript-utilities'

export function EditableJobPostings({
  isJobPostingFormOpen,
  setIsJobPostingFormOpen,
}) {
  const { data: jobListings } = useTpJobListingAllQuery()
  const [isEditing, setIsEditing] = useState(false)
  const [idOfTpJobListingBeingEdited, setIdOfTpJobListingBeingEdited] =
    useState<string | null>(null) // null = "new"

  const hasJobListings = jobListings?.length > 0
  const isEmpty = !hasJobListings

  const startAdding = useCallback(() => {
    setIdOfTpJobListingBeingEdited(null) // means "new"
    setIsEditing(true)
  }, [])
  const startEditing = useCallback((id: string) => {
    setIdOfTpJobListingBeingEdited(id)
    setIsEditing(true)
  }, [])

  useEffect(() => {
    if (isJobPostingFormOpen) {
      setIsEditing(true)
    }
  }, [isJobPostingFormOpen])

  useEffect(() => {
    if (!isEditing) {
      setIsJobPostingFormOpen(false)
    }
  }, [isEditing, setIsJobPostingFormOpen])

  return (
    <>
      <div className="profile-section">
        <div className="profile-section--title is-flex is-flex-direction-row">
          <Element
            renderAs="h4"
            textSize={4}
            responsive={{ mobile: { textSize: { value: 7 } } }}
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
            <Columns>
              {jobListings?.map((jobListing) => (
                <Columns.Column mobile={{ size: 12 }} tablet={{ size: 6 }}>
                  <JobListingCard
                    key={jobListing.id}
                    jobListing={jobListing}
                    onClick={() => startEditing(jobListing.id)}
                  />
                </Columns.Column>
              ))}
            </Columns>
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

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Please provide a job title'),
  location: Yup.string().required('Please provide a location'),
  summary: Yup.string()
    .required('Please enter a short description of the job')
    .min(200, 'Job summary should be at least 200 characters'),
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
})

interface ModalFormProps {
  tpJobListingId: string
  isEditing: boolean
  setIsEditing: (boolean) => void
}

function ModalForm({
  isEditing,
  setIsEditing,
  tpJobListingId,
}: ModalFormProps) {
  const { data } = useTpJobListingOneOfCurrentUserQuery(tpJobListingId)
  const { data: currentUserTpCompanyProfile } = useTpCompanyProfileQuery()
  const jobListing = tpJobListingId
    ? data
    : buildBlankJobListing(currentUserTpCompanyProfile?.id)

  const createMutation = useTpJobListingCreateMutation()
  const updateMutation = useTpJobListingUpdateMutation(tpJobListingId)
  const deleteMutation = useTpJobListingDeleteMutation()

  const onSubmit = (values: Partial<TpJobseekerProfile>) => {
    if (tpJobListingId === null) {
      // create new
      formik.setSubmitting(true)
      createMutation.mutate(values, {
        onSettled: () => {
          formik.setSubmitting(false)
        },
        onSuccess: () => {
          setIsEditing(false)
        },
      })
    } else {
      // update existing
      formik.setSubmitting(true)
      updateMutation.mutate(values, {
        onSettled: () => {
          formik.setSubmitting(false)
        },
        onSuccess: () => {
          setIsEditing(false)
        },
      })
    }
  }

  const formik = useFormik({
    initialValues: jobListing,
    onSubmit,
    validationSchema,
    enableReinitialize: true,
  })

  const handleDelete = useCallback(() => {
    if (
      window.confirm('Are you certain you wish to delete this job posting?')
    ) {
      deleteMutation.mutate(tpJobListingId, {
        onSuccess: () => {
          setIsEditing(false)
        },
      })
      setIsEditing(false)
    }
  }, [deleteMutation, setIsEditing, tpJobListingId])

  return (
    <Modal
      title=""
      show={isEditing}
      stateFn={setIsEditing}
      confirm={formik.dirty}
    >
      <Modal.Body>
        <Element renderAs="h4" textTransform="uppercase" textSize={6}>
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
          Add the job postings you want to publish to jobseekers at ReDI School.
        </Element>
        <FormInput
          name={`title`}
          placeholder="Junior Frontend Developer"
          label="Job Title*"
          {...formik}
        />
        <FormInput
          name={`location`}
          placeholder="Where is the position based"
          label="Location*"
          {...formik}
        />
        <FormSelect
          name="federalState"
          label="Location (Federal State in Germany)"
          items={federalStatesOptions}
          {...formik}
        />
        <FormTextArea
          label="Job Summary*"
          name={`summary`}
          rows={7}
          placeholder="Tell us a bit about the position, expectations & ideal candidate."
          {...formik}
        />
        <Element
          renderAs="p"
          textSize={6}
          responsive={{ mobile: { textSize: { value: 5 } } }}
          className="oneandhalf-bs"
        >
          We use a standardised list of skills and positions to help with the
          matching process of our candidates. Please select the top 6 skills you
          think are necessary for succeeding in this job, and up to 3 position
          titles that match this job. We will use those to suggest potential
          matches.
        </Element>
        <FormSelect
          label="Related positions*"
          name={`relatesToPositions`}
          items={formRelatedPositions}
          {...formik}
          multiselect
        />
        <FormSelect
          label="Ideal technical skills*"
          name={`idealTechnicalSkills`}
          items={formTopSkills}
          {...formik}
          multiselect
        />
        <FormSelect
          label="Employment type*"
          name={`employmentType`}
          items={formEmploymentType}
          {...formik}
        />
        <FormInput
          name={`languageRequirements`}
          placeholder="German C1, English B2, French B1..."
          label="Language requirements*"
          {...formik}
        />
        <FormInput
          label="Salary range"
          placeholder="€40K - €52K"
          name={`salaryRange`}
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
          {tpJobListingId ? (
            <Button
              simple
              disabled={updateMutation.isLoading}
              onClick={handleDelete}
            >
              Delete
            </Button>
          ) : null}
        </div>
      </Modal.Body>
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
    desiredExperience: '',
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
