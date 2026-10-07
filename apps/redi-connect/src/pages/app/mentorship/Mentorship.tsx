import {
  MentorshipMatchStatus,
  useFindMatchQuery,
  useLoadMyProfileQuery,
  useMyMatchesQuery,
  UserType,
} from '@talent-connect/data-access'
import {
  Button,
  Heading,
} from '@talent-connect/shared-atomic-design-components'
import { Columns, Content } from 'react-bulma-components'
import { useHistory, useParams } from 'react-router-dom'
import {
  CompleteMentorship,
  ConUserProfileCard,
  MContacts,
  MSessions,
  ReportProblem,
} from '../../../components/organisms'
import { LoggedIn } from '../../../components/templates'
import { getAccessTokenFromLocalStorage } from '../../../services/auth/auth'

export interface MentorshipRouteParams {
  matchId: string
}

function Mentorship() {
  const myAcceptedMatchesQuery = useMyMatchesQuery({
    filter: { status: MentorshipMatchStatus.Accepted },
  })
  const loopbackUserId = getAccessTokenFromLocalStorage().userId
  const myProfileQuery = useLoadMyProfileQuery({ loopbackUserId })

  const { matchId } = useParams<MentorshipRouteParams>()
  const findMatchQuery = useFindMatchQuery({ id: matchId })
  const history = useHistory()

  if (!findMatchQuery.isSuccess) return null
  if (!myProfileQuery.isSuccess) return null
  if (!myAcceptedMatchesQuery.isSuccess) return null

  const myProfile = myProfileQuery.data.conProfile
  const myUserType = myProfile.userType
  const viewMatch = findMatchQuery.data.conMentorshipMatch
  const myActiveMatches = myAcceptedMatchesQuery.data.conMentorshipMatches

  const currentUserIsMentee = myUserType === UserType.Mentee
  const currentUserIsMentor = myUserType === UserType.Mentor
  const currentMatch = findMatchQuery.data.conMentorshipMatch
  const viewProfile = currentMatch[currentUserIsMentor ? 'mentee' : 'mentor']
  const pageHeading = currentUserIsMentor
    ? `Mentorship with ${viewProfile.fullName}`
    : 'My Mentorship'

  return (
    <LoggedIn>
      {myActiveMatches.length > 1 && currentUserIsMentor && (
        <Columns>
          <Columns.Column>
            <Button onClick={() => history.push('/app/mentorships/')} simple>
              <Button.Icon icon="arrowLeft" space="right" />
              Back to mentee overview
            </Button>
          </Columns.Column>
        </Columns>
      )}

      <Columns>
        <Columns.Column>
          <Heading subtitle size="small" className="double-bs">
            {pageHeading}
          </Heading>
        </Columns.Column>

        <Columns.Column className="is-narrow">
          {viewMatch.status === MentorshipMatchStatus.Accepted &&
            currentUserIsMentor && (
              <CompleteMentorship mentorshipMatchId={currentMatch.id} />
            )}
        </Columns.Column>
      </Columns>
      {currentUserIsMentee && (
        <Content
          size="medium"
          renderAs="p"
          responsive={{ mobile: { hide: { value: true } } }}
        >
          Below you can see your ongoing mentorship with your mentor{' '}
          <strong>{viewProfile.fullName}</strong>.
        </Content>
      )}

      <Columns>
        <Columns.Column size={4}>
          <ConUserProfileCard
            profile={viewProfile}
            linkTo={`/app/mentorships/profile/${viewProfile.id}`}
          />
          <ReportProblem
            type={myProfile.userType}
            redProfileId={viewProfile.id}
          />
        </Columns.Column>
        <Columns.Column size={8}>
          <MContacts profile={viewProfile} className="is-hidden-mobile" />
          <MContacts profile={viewProfile} className="is-hidden-tablet" />
          <MSessions
            sessions={viewMatch.mentoringSessions}
            menteeId={viewProfile.userId}
            editable={currentUserIsMentor}
            mentorshipMatchId={matchId}
          />
        </Columns.Column>
      </Columns>
    </LoggedIn>
  )
}

export default Mentorship
