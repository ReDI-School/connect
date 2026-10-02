import { useLoadMyProfileQuery, UserType } from '@talent-connect/data-access'
import { Heading } from '@talent-connect/shared-atomic-design-components'
import { getRediConnectLocationDetails } from '@talent-connect/shared-config'
import { Content } from 'react-bulma-components'
import { LoggedIn } from '../../../components/templates'
import { getAccessTokenFromLocalStorage } from '../../../services/auth/auth'

const MentorHub = () => {
  const loopbackUserId = getAccessTokenFromLocalStorage().userId
  const myProfileQuery = useLoadMyProfileQuery({ loopbackUserId })
  const profile = myProfileQuery.data?.conProfile
  const locationDetails = getRediConnectLocationDetails(
    profile?.userType === UserType.Mentor ? profile.rediLocation : undefined
  )
  const mentorHubUrl =
    locationDetails.mentorHubUrl ||
    'https://redi-school-1.gitbook.io/mentors-resources-hub/'

  return (
    <LoggedIn>
      <Heading subtitle size="small" className="double-bs">
        Mentor Hub
      </Heading>

      <Content style={{ textAlign: 'justify' }}>
        <p>
          The <strong>ReDI Mentor Hub</strong> is your go-to guide for making a
          real impact as a volunteer mentor. Whether you're supporting a student
          in our tech bootcamps or helping a jobseeker through a career
          transition, this resource provides practical tips, mentoring
          frameworks, and tools to help you guide, challenge, and empower your
          mentee with confidence.
        </p>
        <p>Inside, you'll find:</p>
        <ul>
          {mentorHubListItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <p>
          <span aria-hidden>👉</span>{' '}
          <a href={mentorHubUrl} target="_blank" rel="noreferrer">
            Access the Mentor Hub
          </a>
        </p>
        <p>
          Thank you for supporting the next generation of tech talent!{' '}
          <span aria-hidden>💛</span>
        </p>
      </Content>
    </LoggedIn>
  )
}

export default MentorHub

const mentorHubListItems = [
  'Session tips & mentoring principles',
  'Feedback guidance & interview support',
  'Career orientation questions & tools',
  'CV, GitHub & portfolio review tips',
  'Mock interview scenarios & reflection prompts',
  'Insights into who our students are and what they need',
]
