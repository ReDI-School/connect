import React, { ReactNode, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import { RootState } from '../../redux/types'
import {
  Button,
  Icon,
  Loader,
} from '@talent-connect/shared-atomic-design-components'
import { Modal } from '@talent-connect/shared-atomic-design-components'
import { Navbar, SideMenu } from '../organisms'
import {
  Container,
  Section,
  Columns,
  Content,
  Notification,
} from 'react-bulma-components'
import { getRedProfileFromLocalStorage } from '../../services/auth/auth'
import {
  matchesFetchStart,
  matchesMarkAsDismissed,
} from '../../redux/matches/actions'
import { useTranslation } from 'react-i18next'
import Footer from '../organisms/Footer'
import { RedMatch } from '@talent-connect/shared-types'

interface Props {
  loading: boolean
  children?: ReactNode
  matches: RedMatch[]
  matchesFetchStart: () => void
  matchesMarkAsDismissed: (redMatchId: string) => void
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

const LoggedIn = ({
  loading,
  children,
  matches,
  matchesFetchStart,
  matchesMarkAsDismissed,
}: Props) => {
  const profile = getRedProfileFromLocalStorage()
  const history = useHistory()
  const match = matches && matches.find((match) => match.status === 'accepted')

  const { t } = useTranslation()

  const isNewMatch =
    profile.userType === 'mentee' &&
    match &&
    !match.hasMenteeDismissedMentorshipApplicationAcceptedNotification

  useEffect(() => {
    matchesFetchStart()
  }, [])

  const handleModalClose = (redMatchId: string) => {
    matchesMarkAsDismissed(redMatchId)
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
              <Loader loading={loading} />
              {profile.userType === 'public-sign-up-mentee-pending-review' && (
                <RediNotification>
                  {t('loggedInArea.profile.notification.pendingMentee')}
                </RediNotification>
              )}
              {profile.userType === 'public-sign-up-mentor-pending-review' && (
                <RediNotification>
                  {t('loggedInArea.profile.notification.pendingMentor')}
                </RediNotification>
              )}
              {profile.userType === 'mentee' && !profile.userActivated && (
                <RediNotification>
                  {t('loggedInArea.profile.notification.deactivatedMentee', {
                    name: profile.firstName,
                    email:
                      '<a href="mailto:paulina@redi-school.org">paulina@red-school.org</a>',
                  })}
                </RediNotification>
              )}
              {profile.userType === 'mentor' && !profile.userActivated && (
                <RediNotification>
                  {t('loggedInArea.profile.notification.deactivatedMentor', {
                    name: profile.firstName,
                    email:
                      '<a href="mailto:miriam@redi-school.org">miriam@red-school.org</a>',
                  })}
                </RediNotification>
              )}
              {match && isNewMatch && (
                <Modal
                  show={isNewMatch}
                  confirm
                  title="You’ve got a mentor match!"
                >
                  <Modal.Body>
                    <Content>
                      Hey{' '}
                      <strong>{match.mentee && match.mentee.firstName}</strong>,
                      good news!
                      <strong>
                        {match.mentor &&
                          ` ${match.mentor.firstName} ${match.mentor.lastName} `}
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
              {!loading && children}
            </Columns.Column>
          </Columns>
        </Container>
      </Section>
      <Footer />
    </>
  )
}

const mapDispatchToProps = (dispatch: any) => ({
  matchesFetchStart: () => dispatch(matchesFetchStart()),
  matchesMarkAsDismissed: (redMatchId: string) =>
    dispatch(matchesMarkAsDismissed(redMatchId)),
})

const mapStateToProps = (state: RootState) => ({
  matches: state.matches.matches,
  loading:
    state.user.loading || state.profiles.loading || state.matches.loading,
})

export default connect(mapStateToProps, mapDispatchToProps)(LoggedIn)
