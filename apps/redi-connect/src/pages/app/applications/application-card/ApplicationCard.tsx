import classnames from 'classnames'
import moment from 'moment'
import { Columns, Content, Heading } from 'react-bulma-components'

import {
  AllConProfileFieldsFragment,
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
import { getAccessTokenFromLocalStorage } from '../../../../services/auth/auth'
import { ApplicationsPageApplicationFragment } from '../Applications.generated'
import './ApplicationCard.scss'
import { useApplicationCard } from './useApplicationCard'

interface Props {
  application: ApplicationsPageApplicationFragment
  hasReachedMenteeLimit: boolean
  currentUser?: AllConProfileFieldsFragment
}

const ApplicationCard = ({ application }: Props) => {
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
            ? 'application-card'
            : 'application-card-pending'
        }
        onClick={() => setShowDetails(!showDetails)}
      >
        <Columns vCentered>
          <Columns.Column className="application-card__avatar">
            <Avatar profile={applicationUser} />
          </Columns.Column>

          <Columns.Column size={3} textAlignment="left">
            {applicationUser && (
              <>
                <p>{applicationUser.fullName}</p>
                <p>{REDI_LOCATION_NAMES[applicationUser.rediLocation]}</p>
              </>
            )}
          </Columns.Column>

          <Columns.Column textAlignment="centered">
            <span
              className="application-card__link"
              onClick={() =>
                history.push(
                  `/app/applications/profile/${
                    applicationUser && applicationUser.id
                  }`
                )
              }
            >
              Visit Profile
            </span>
          </Columns.Column>

          <Columns.Column textAlignment="centered" tablet={{ narrow: true }}>
            From {moment(applicationDate).format('DD.MM.YYYY')}
          </Columns.Column>

          <Columns.Column
            className={
              application.status === MentorshipMatchStatus.Applied
                ? 'application-card-pending__status'
                : null
            }
            textAlignment="centered"
          >
            {MENTORSHIP_MATCH_STATUS_LABELS[application.status]}
          </Columns.Column>

          <Columns.Column className="application-card-dropdown">
            <Icon
              icon="chevronDown"
              size="small"
              className={classnames({ 'icon--rotate': showDetails })}
            />
          </Columns.Column>
        </Columns>
      </div>

      <div
        className={classnames('application-card-details', {
          'application-card-details--show': showDetails,
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
          <>
            <ConfirmMentorship
              match={application}
              hasReachedDesiredMenteeLimit={hasReachedDesiredMenteeLimit}
              menteeCountCapacity={menteeCountCapacity}
            />
            <DeclineMentorshipButton match={application} />
          </>
        ) : null}
      </div>
    </>
  )
}

export default ApplicationCard
