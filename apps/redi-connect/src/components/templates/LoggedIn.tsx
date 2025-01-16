import {
  ConnectProfileStatus,
  MentorshipMatchStatus,
  useConMatchMarkMentorshipAcceptedNotificationDismissedMutation,
  useLoadMyProfileQuery,
  useMyMatchesQuery,
} from '@talent-connect/data-access'
import {
  Button,
  Icon,
  Modal,
} from '@talent-connect/shared-atomic-design-components'
import React, { ReactNode, useEffect } from 'react'
import {
  Columns,
  Container,
  Content,
  Notification,
  Section,
} from 'react-bulma-components'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from 'react-query'
import { useHistory, useLocation } from 'react-router-dom'
import { getAccessTokenFromLocalStorage } from '../../services/auth/auth'
import { Navbar, SideMenu } from '../organisms'
import Footer from '../organisms/Footer'

interface Props {
  hideNavigation?: boolean
  children?: ReactNode
}

const RediNotification: React.FC = ({ children }) => (
  <Notification className="account-not-active double-bs">
    <Icon
      className="account-not-active__icon"
      icon="mail"
      size="large"
      space="right"
    />
    <Content dangerouslySetInnerHTML={{ __html: children }} />
  </Notification>
)

function LoggedIn({ children }: Props) {
  const queryClient = useQueryClient()
  const loopbackUserId = getAccessTokenFromLocalStorage().userId
  const myProfileQuery = useLoadMyProfileQuery({ loopbackUserId })
  const myMatchesQuery = useMyMatchesQuery()
  const conMatchMarkMentorshipAcceptedNotificationDismissedMutation =
    useConMatchMarkMentorshipAcceptedNotificationDismissedMutation()

  const history = useHistory()

  const location = useLocation()

  useEffect(() => {
    queryClient.invalidateQueries()
  }, [location])

  const match =
    myMatchesQuery.isSuccess &&
    myMatchesQuery.data?.conMentorshipMatches.length > 0 &&
    myMatchesQuery.data?.conMentorshipMatches.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0]
  const profile = myProfileQuery.data?.conProfile

  const { t } = useTranslation()

  const isNewAcceptedMatch =
    profile?.userType === 'MENTEE' &&
    match &&
    !match?.hasMenteeDismissedMentorshipApplicationAcceptedNotification &&
    match.status === MentorshipMatchStatus.Accepted

  const handleModalClose = async (redMatchId: string) => {
    await conMatchMarkMentorshipAcceptedNotificationDismissedMutation.mutateAsync(
      {
        id: redMatchId,
      }
    )
    queryClient.invalidateQueries()
    history.push(`/app/mentorships/${redMatchId}`)
  }

  return (
    <>
      <Navbar />
      <Section className="section--bottom-large-spaceing color-half-tablet section--separator">
        <Container className="color-side-menu">
          <Columns>
            <Columns.Column desktop={{ size: 2 }} className="column--side-menu">
              <SideMenu />
            </Columns.Column>
            <Columns.Column
              desktop={{ size: 9, offset: 1 }}
              className="column--main-content"
            >
              {profile?.userType === 'MENTEE' &&
                profile?.profileStatus === ConnectProfileStatus.Deactivated && (
                  <RediNotification>
                    {t('loggedInArea.profile.notification.deactivatedMentee', {
                      name: profile.firstName,
                      email:
                        '<a href="mailto:career@redi-school.org">career@redi-school.org</a>',
                    })}
                  </RediNotification>
                )}
              {profile?.userType === 'MENTOR' &&
                profile?.profileStatus === ConnectProfileStatus.Deactivated && (
                  <RediNotification>
                    {t('loggedInArea.profile.notification.deactivatedMentor', {
                      name: profile?.firstName,
                      email:
                        '<a href="mailto:career@redi-school.org">career@redi-school.org</a>',
                    })}
                  </RediNotification>
                )}
              {match && isNewAcceptedMatch && (
                <Modal
                  show={isNewAcceptedMatch}
                  confirm
                  title="You've got a mentor match!"
                >
                  <Modal.Body>
                    <Content>
                      Hey{' '}
                      <strong>{match.mentee && match.mentee.firstName}</strong>,
                      good news!
                      <strong>
                        {match.mentor && ` ${match.mentor.fullName} `}
                      </strong>
                      accepted your application. Here are already a few welcome
                      words from your new mentor.
                    </Content>
                    <Content italic>
                      "{match.mentorReplyMessageOnAccept}"
                    </Content>
                  </Modal.Body>
                  <Modal.Foot>
                    <Button
                      onClick={() => handleModalClose(match.id as string)}
                    >
                      Go to Mentorship
                    </Button>
                  </Modal.Foot>
                </Modal>
              )}
              {children}
            </Columns.Column>
          </Columns>
        </Container>
      </Section>
      <Footer />
    </>
  )
}

export default LoggedIn
