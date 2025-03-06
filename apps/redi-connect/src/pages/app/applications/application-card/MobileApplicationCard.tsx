import classnames from 'classnames'
import moment from 'moment'
import { Columns, Content, Heading } from 'react-bulma-components'

import {
  MentorshipMatchStatus,
  useLoadMyProfileQuery,
} from '@talent-connect/data-access'
import { Icon } from '@talent-connect/shared-atomic-design-components'
import {
  MENTORSHIP_MATCH_STATUS_LABELS,
  REDI_LOCATION_NAMES,
} from '@talent-connect/shared-config'
import {
  Avatar,
  ConfirmMentorship,
  DeclineMentorshipButton,
} from '../../../../components/organisms'
import { ApplicationCardApplicationPropFragment } from '../../../../components/organisms/ApplicationCard.generated'
import { getAccessTokenFromLocalStorage } from '../../../../services/auth/auth'
import './MobileApplicationCard.scss'
import { useApplicationCard } from './useApplicationCard'

interface Props {
  application: ApplicationCardApplicationPropFragment
}

function MobileApplicationCard({ application }: Props) {
  const loopbackUserId = getAccessTokenFromLocalStorage().userId
  const myProfileQuery = useLoadMyProfileQuery({ loopbackUserId })

  const hasReachedDesiredMenteeLimit =
    myProfileQuery.data.conProfile.doesNotHaveAvailableMentorshipSlot

  const menteeCountCapacity = myProfileQuery.data.conProfile.menteeCountCapacity

  const currentUser = myProfileQuery.data.conProfile

  const {
    history,
    showDetails,
    setShowDetails,
    applicationUser,
    applicationDate,
    currentUserIsMentor,
  } = useApplicationCard({
    application,
    currentUser,
  })

  return (
    <>
      <div
        className={
          application.status !== MentorshipMatchStatus.Applied
            ? 'mobile-application-card'
            : 'mobile-application-card-pending'
        }
        onClick={() => setShowDetails(!showDetails)}
      >
        <Columns breakpoint="mobile" multiline={false} vCentered>
          <Columns.Column className="mobile-application-card__avatar">
            <Avatar profile={applicationUser} />
          </Columns.Column>
          <Columns.Column className="mobile-column">
            {applicationUser && (
              <span
                className="mobile-application-card__link"
                onClick={() =>
                  history.push(
                    `/app/applications/profile/${
                      applicationUser && applicationUser.id
                    }`
                  )
                }
              >
                <p>{applicationUser.fullName}</p>
              </span>
            )}
            {applicationUser && (
              <p>{REDI_LOCATION_NAMES[applicationUser.rediLocation]}</p>
            )}
          </Columns.Column>
          <Columns.Column
            className="mobile-column"
            textAlignment="right"
            narrow
            textSize={6}
          >
            <p
              className={
                application.status === MentorshipMatchStatus.Applied
                  ? 'application-card-pending__status'
                  : null
              }
            >
              {MENTORSHIP_MATCH_STATUS_LABELS[application.status]}
            </p>
            <p>{moment(applicationDate).format('DD.MM.YYYY')}</p>
          </Columns.Column>
          <Columns.Column className="mobile-application-card-dropdown">
            <Icon
              icon="chevronDown"
              size="small"
              className={classnames({ 'icon--rotate': showDetails })}
            />
          </Columns.Column>
        </Columns>
      </div>

      <div
        className={classnames('mobile-application-card-details', {
          'mobile-application-card-details--show': showDetails,
        })}
      >
        <Heading
          size={6}
          weight="normal"
          renderAs="h3"
          subtitle
          textTransform="uppercase"
        >
          Motivation
        </Heading>
        <Content className="oneandhalf-bs">
          {application.applicationText}
        </Content>

        {application.expectationText && (
          <>
            <Heading
              size={6}
              weight="normal"
              renderAs="h3"
              subtitle
              textTransform="uppercase"
            >
              Expectation
            </Heading>
            <Content>{application.expectationText}</Content>
          </>
        )}
        {currentUserIsMentor &&
        application.status === MentorshipMatchStatus.Applied ? (
          <div className="action-buttons">
            <div>
              <ConfirmMentorship
                match={application}
                hasReachedDesiredMenteeLimit={hasReachedDesiredMenteeLimit}
                menteeCountCapacity={menteeCountCapacity}
              />
              <DeclineMentorshipButton match={application} />
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}

export default MobileApplicationCard
