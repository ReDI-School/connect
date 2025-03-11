import { useTpJobseekerDirectoryEntriesFindOneVisibleQuery } from '@talent-connect/data-access'
import { Loader } from '@talent-connect/shared-atomic-design-components'
import { Columns } from 'react-bulma-components'
import { useHistory, useParams } from 'react-router-dom'
import ProfileDownloadButton from '../../../components/molecules/ProfileDownloadButton'
import { EditableEducation } from '../../../components/organisms/jobseeker-profile-editables/EditableEducation'
import { EditableImportantDetails } from '../../../components/organisms/jobseeker-profile-editables/EditableImportantDetails'
import { EditableLanguages } from '../../../components/organisms/jobseeker-profile-editables/EditableLanguages'
import { EditableLinks } from '../../../components/organisms/jobseeker-profile-editables/EditableLinks'
import { EditableNamePhotoLocation } from '../../../components/organisms/jobseeker-profile-editables/EditableNamePhotoLocation'
import { EditableOverview } from '../../../components/organisms/jobseeker-profile-editables/EditableOverview'
import { EditableProfessionalExperience } from '../../../components/organisms/jobseeker-profile-editables/EditableProfessionalExperience'
import { EditableSummary } from '../../../components/organisms/jobseeker-profile-editables/EditableSummary'
import { LoggedIn } from '../../../components/templates'

export function JobseekerProfileForCompanyEyes() {
  const { tpJobseekerProfileId }: { tpJobseekerProfileId: string } = useParams()
  const jobseekerProfileQuery =
    useTpJobseekerDirectoryEntriesFindOneVisibleQuery({
      input: { tpJobseekerProfileId },
    })
  const history = useHistory()

  if (jobseekerProfileQuery.isLoading) return <Loader loading />

  const tpJobseekerProfileNotFound =
    jobseekerProfileQuery.error &&
    (jobseekerProfileQuery.error as any)?.response?.errors?.some(
      (err) => err?.extensions?.response?.statusCode === 404
    )

  if (
    tpJobseekerProfileNotFound ||
    !jobseekerProfileQuery?.data?.tpJobseekerDirectoryEntryVisible
  ) {
    history.replace('/app/404')
    return null
  }

  const jobseekerProfile =
    jobseekerProfileQuery?.data?.tpJobseekerDirectoryEntryVisible

  return (
    <LoggedIn>
      <Columns className="is-6 is-variable">
        <Columns.Column mobile={{ size: 12 }} tablet={{ size: 'three-fifths' }}>
          <EditableNamePhotoLocation
            profile={jobseekerProfile}
            disableEditing
          />
          <EditableOverview profile={jobseekerProfile} disableEditing />
          <EditableSummary profile={jobseekerProfile} disableEditing />
          <EditableProfessionalExperience
            profile={jobseekerProfile}
            disableEditing
          />
          <EditableEducation profile={jobseekerProfile} disableEditing />
        </Columns.Column>
        <Columns.Column mobile={{ size: 12 }} tablet={{ size: 'two-fifths' }}>
          <EditableImportantDetails profile={jobseekerProfile} disableEditing />
          <EditableLanguages profile={jobseekerProfile} disableEditing />
          <EditableLinks profile={jobseekerProfile} disableEditing />
        </Columns.Column>
        <ProfileDownloadButton profile={jobseekerProfile} />
      </Columns>
    </LoggedIn>
  )
}

export default JobseekerProfileForCompanyEyes
