import {
  LoadMyProfileQuery,
  MentorshipMatchStatus,
  useLoadMyProfileQuery,
  UserType,
} from '@talent-connect/data-access'
import {
  Button,
  Heading,
  Icon,
  Loader,
} from '@talent-connect/shared-atomic-design-components'
import { REDI_LOCATION_NAMES } from '@talent-connect/shared-config'
import { Columns, Content, Element, Notification } from 'react-bulma-components'
import { useHistory, useParams } from 'react-router-dom'
import {
  ReadAbout,
  ReadContactDetails,
  ReadEducation,
  ReadLanguages,
  ReadMentoringTopics,
  ReadOccupation,
  ReadPersonalDetail,
  ReadSocialMedia,
} from '../../../../components/molecules'
import {
  ApplyForMentor,
  Avatar,
  ConfirmMentorship,
} from '../../../../components/organisms'
import DeclineMentorshipButton from '../../../../components/organisms/DeclineMentorshipButton'
import { LoggedIn } from '../../../../components/templates'
import { getAccessTokenFromLocalStorage } from '../../../../services/auth/auth'
import {
  ProfilePageQueryQuery,
  useProfilePageQueryQuery,
} from './ProfileViewer.generated'
import './ProfileViewer.scss'

interface RouteParams {
  profileId: string
}

function ProfileViewer() {
  const { profileId } = useParams<RouteParams>()
  const profileQuery = useProfilePageQueryQuery({ id: profileId })
  const myProfileQuery = useLoadMyProfileQuery({
    loopbackUserId: getAccessTokenFromLocalStorage().userId,
  })
  const history = useHistory()

  if (profileQuery.isLoading || myProfileQuery.isLoading)
    return <Loader loading />

  const conProfileNotFound =
    profileQuery.error &&
    (profileQuery.error as any)?.response?.errors?.some(
      (err) => err?.extensions?.response?.statusCode === 404
    )

  const isInvalidProfile =
    profileQuery?.data?.conProfile?.profileStatus === 'REJECTED' ||
    profileQuery?.data?.conProfile?.profileStatus === 'DEACTIVATED'

  if (conProfileNotFound || isInvalidProfile) {
    history.replace('/app/404')
    return null
  }

  const myProfile = myProfileQuery.data.conProfile
  const profile = profileQuery.data.conProfile

  const currentUserIsMentor = myProfile.userType === UserType.Mentor
  const currentUserIsMentee = myProfile.userType === UserType.Mentee

  // If any match exists between this mentee and mentor, get the most recent one.
  // This is an edge case, but it is possible for a mentee to apply to the same
  // mentor more than once.
  const myMatchWithThisProfile = myProfile.mentorshipMatches
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .find(
      (match) => match.mentee.id === profileId || match.mentor.id === profileId
    )

  const isAcceptedMatch = Boolean(
    myMatchWithThisProfile?.status === MentorshipMatchStatus.Accepted
  )

  const hasOpenApplication =
    myMatchWithThisProfile?.status === MentorshipMatchStatus.Applied

  const hasApprovedProfile = myProfile.profileStatus === 'APPROVED'

  const userCanApplyForMentorship =
    !isAcceptedMatch &&
    currentUserIsMentee &&
    !hasOpenApplication &&
    hasApprovedProfile

  const shouldHidePrivateContactInfo = currentUserIsMentee && !isAcceptedMatch

  const activeMentorshipMatch = myProfile.mentorshipMatches.find(
    (match) => match.status === MentorshipMatchStatus.Accepted
  )

  const viewMode = determineViewMode(profile, myProfile)

  const profileView = (
    <>
      {currentUserIsMentee && hasOpenApplication && (
        <Notification>
          Awesome, your application has been sent. If you want to read it later
          on you can find it in{' '}
          <a onClick={() => history.push('/app/applications')}>
            your applications.
          </a>
        </Notification>
      )}

      <Columns>
        <Columns.Column>
          <Button onClick={() => history.goBack()} simple>
            <Button.Icon icon="arrowLeft" space="right" />
            back
          </Button>
        </Columns.Column>

        {userCanApplyForMentorship && (
          <Columns.Column className="is-narrow">
            <ApplyForMentor mentor={profile} />
          </Columns.Column>
        )}

        {myMatchWithThisProfile &&
          currentUserIsMentor &&
          myMatchWithThisProfile.status === MentorshipMatchStatus.Applied && (
            <Columns.Column className="is-narrow">
              <ConfirmMentorship
                match={myMatchWithThisProfile}
                menteeName={profile && profile.firstName}
              />
              <DeclineMentorshipButton match={myMatchWithThisProfile} />
            </Columns.Column>
          )}
      </Columns>

      {profile && (
        <>
          <Columns vCentered breakpoint="mobile" className="oneandhalf-bs">
            <Columns.Column size={3}>
              <Avatar profile={profile} />
            </Columns.Column>
            <Columns.Column size={9}>
              <Heading size="medium">{profile.fullName}</Heading>
              <Element className="location-tag">
                <Icon icon="mapPin" className="icon-align" />
                <Content size="medium" renderAs="p">
                  {REDI_LOCATION_NAMES[profile.rediLocation]}
                </Content>
              </Element>
            </Columns.Column>
          </Columns>

          {(profile.personalDescription || profile.expectations) && (
            <Element className="block-separator">
              <ReadAbout.Some profile={profile} />
            </Element>
          )}

          {profile.categories?.length > 0 && (
            <Element className="block-separator">
              <ReadMentoringTopics.Some profile={profile} />
            </Element>
          )}

          {!shouldHidePrivateContactInfo && (
            <Element className="block-separator">
              <Columns>
                <Columns.Column>
                  <Element className="block-separator">
                    <ReadContactDetails.Some profile={profile} />
                  </Element>
                </Columns.Column>
                {(profile.linkedInProfileUrl ||
                  profile.githubProfileUrl ||
                  profile.slackUsername) && (
                  <Columns.Column>
                    <ReadSocialMedia.Some profile={profile} />
                  </Columns.Column>
                )}
              </Columns>
            </Element>
          )}

          {(profile.languages || profile.gender || profile.age) && (
            <Element className="block-separator">
              <Columns>
                {(profile.gender || profile.age) && (
                  <Columns.Column>
                    <Element className="block-separator">
                      <ReadPersonalDetail.Some profile={profile} />
                    </Element>
                  </Columns.Column>
                )}
                <Columns.Column>
                  <ReadLanguages.Some profile={profile} />
                </Columns.Column>
              </Columns>
            </Element>
          )}

          {currentUserIsMentor && (
            <Element className="block-separator">
              <Columns>
                {profile.mentee_highestEducationLevel && (
                  <Columns.Column>
                    <Element className="block-separator">
                      <ReadEducation.Some profile={profile} />
                    </Element>
                  </Columns.Column>
                )}
                <Columns.Column>
                  {/* Commented until we implement it using the data display in Salesforce */}
                  {/* <ReadRediClass.Some profile={profile} /> */}
                  <ReadOccupation.Some profile={profile} />
                </Columns.Column>
              </Columns>
            </Element>
          )}

          {profile.mentor_occupation && (
            // When ReDI course is re-implemented, uncomment this & remove ReadOccupation component above
            // || profile.mentee_occupationCategoryId)
            <Element className="block-separator">
              <Columns>
                <Columns.Column>
                  <ReadOccupation.Some profile={profile} />
                </Columns.Column>
              </Columns>
            </Element>
          )}
        </>
      )}
    </>
  )

  if (viewMode === 'display') return <LoggedIn>{profileView}</LoggedIn>

  const messages: Partial<Record<ViewMode, React.ReactNode>> = {
    notActivelyMentoring: (
      <>
        Hi there! It looks like mentor has decided to take a short break from
        mentoring. No worries, though! You can easily{' '}
        <a href="/app/find-a-mentor">find another mentor</a>. If you have any
        questions in the meantime, feel free to check out the{' '}
        <a href="/faq">FAQ</a>.
      </>
    ),
    mentoringButNoFreeSpots: (
      <>
        Hey there! It looks like another mentee got to this mentor first, and
        their application has already been accepted. You can save this link to
        check if this mentor becomes available again, or you can{' '}
        <a href="/app/find-a-mentor">find another mentor</a>. If you have any
        questions in the meantime, feel free to check out the{' '}
        <a href="/faq">FAQ</a>.
      </>
    ),
    currentUserIsMenteeAndViewsNotTheirMentor: (
      <>
        Hey there! It looks like you already have{' '}
        <a href={`/app/mentorships/${activeMentorshipMatch?.id}`}>
          an ongoing mentorship
        </a>{' '}
        with another mentor. Please remember that you can only have one mentor
        at a time. You can check available mentors once you complete your
        current mentorship match. If you have any questions in the meantime,
        feel free to check out the <a href="/faq">FAQ</a>.
      </>
    ),
  }
  return (
    <LoggedIn>
      <div style={{ position: 'relative' }}>
        {profileView}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '2.5rem',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              maxWidth: '90%',
              width: '500px',
            }}
          >
            <p
              style={{
                color: '#333',
                fontSize: '1.3em',
                lineHeight: '1.6',
                marginBottom: '1.5rem',
              }}
            >
              {messages[viewMode]}
            </p>
          </div>
        </div>
      </div>
    </LoggedIn>
  )
}

type ViewMode =
  | 'display'
  | 'notActivelyMentoring'
  | 'mentoringButNoFreeSpots'
  | 'currentUserIsMenteeAndViewsNotTheirMentor'

function determineViewMode(
  profile: ProfilePageQueryQuery['conProfile'],
  currentUserProfile: LoadMyProfileQuery['conProfile']
): ViewMode {
  // If we're looking at a mentee, show the profile. Otherwise, the profile
  // is a mentor's profile, so continue to determine if the view mode is a
  // "special" one.
  if (profile.userType === UserType.Mentee) return 'display'

  const activeMentorshipMatch = currentUserProfile.mentorshipMatches.find(
    (match) => match.status === MentorshipMatchStatus.Accepted
  )

  if (activeMentorshipMatch) {
    // Is current user a mentee, does that mentee have an active match, and is
    // that match with another mentor than the one we're currently looking at?
    if (activeMentorshipMatch.mentor?.id === profile.id) return 'display'

    if (
      currentUserProfile.userType === UserType.Mentee &&
      activeMentorshipMatch?.status === MentorshipMatchStatus.Accepted &&
      activeMentorshipMatch?.mentor?.id !== profile.id
    ) {
      return 'currentUserIsMenteeAndViewsNotTheirMentor'
    }
  }

  if (profile.menteeCountCapacity === 0) return 'notActivelyMentoring'
  if (profile.doesNotHaveAvailableMentorshipSlot)
    return 'mentoringButNoFreeSpots'
  return 'display'
}

export default ProfileViewer
