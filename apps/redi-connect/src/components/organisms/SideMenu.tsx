import {
  ConnectProfileStatus,
  MentorshipMatchStatus,
  useLoadMyProfileQuery,
  UserType,
} from '@talent-connect/data-access'
import { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { ReactComponent as Applications } from '../../assets/images/applications.svg'
import { ReactComponent as MentorHub } from '../../assets/images/mentor-hub.svg'
import { ReactComponent as Mentorship } from '../../assets/images/mentorship.svg'
import { ReactComponent as Profile } from '../../assets/images/profile.svg'
import { getAccessTokenFromLocalStorage } from '../../services/auth/auth'
import './SideMenu.scss'

interface MenuItemProps {
  url: string
  children: ReactNode
}

const MenuItem = ({ url, children }: MenuItemProps) => (
  <li className="side-menu__item">
    <NavLink
      to={url}
      className="side-menu__item__link"
      activeClassName="side-menu__item__link--active"
    >
      <>{children}</>
    </NavLink>
  </li>
)

const SideMenu = () => {
  const loopbackUserId = getAccessTokenFromLocalStorage().userId
  const myProfileQuery = useLoadMyProfileQuery({ loopbackUserId })
  const profile = myProfileQuery.data?.conProfile

  const isMentor = profile?.userType === UserType.Mentor
  const isMentee = profile?.userType === UserType.Mentee

  const isActivated = profile?.profileStatus === ConnectProfileStatus.Approved
  const isNotDrafting =
    profile?.profileStatus !== ConnectProfileStatus.DraftingProfile

  const isActivatedMentor = isMentor && isActivated

  const hasActiveMentorship = profile?.mentorshipMatches?.some(
    (match) => match.status === MentorshipMatchStatus.Accepted
  )
  const hasNoActiveMentorship = !hasActiveMentorship
  const firstActiveMentorshipId = profile?.mentorshipMatches?.find(
    (match) => match.status === MentorshipMatchStatus.Accepted
  )?.id

  const pendingApplicationsCount = profile?.mentorshipMatches?.filter(
    (match) => match.status === MentorshipMatchStatus.Applied
  ).length

  return (
    <ul className="side-menu">
      <MenuItem url="/app/me">
        <Profile className="side-menu__icon" />
        My Profile
      </MenuItem>

      {isMentee && isActivated && hasNoActiveMentorship && (
        <MenuItem url="/app/find-a-mentor/">
          <Mentorship className="side-menu__icon" />
          Find a mentor
        </MenuItem>
      )}

      {isMentor && isActivated && (
        <MenuItem url="/app/mentorships/">
          <Mentorship className="side-menu__icon" />
          My Mentorship
        </MenuItem>
      )}
      {isMentee && hasActiveMentorship && (
        <MenuItem url={`/app/mentorships/${firstActiveMentorshipId}`}>
          <Mentorship className="side-menu__icon" />
          My Mentorship
        </MenuItem>
      )}
      {isActivated && (
        <MenuItem url="/app/applications">
          <div className="badge">
            <Applications className="side-menu__icon" />
            {/* A badge with the number of pending applications is displayed only for mentors */}
            {isActivatedMentor && pendingApplicationsCount > 0 && (
              <span className="badge__item--mobile">
                {pendingApplicationsCount}
              </span>
            )}
            Applications
            {isActivatedMentor && pendingApplicationsCount > 0 && (
              <span className="badge__item">{pendingApplicationsCount}</span>
            )}
          </div>
        </MenuItem>
      )}
      {isMentor && isActivated && (
        <MenuItem url="/app/mentor-hub">
          <MentorHub className="side-menu__icon" />
          Mentor Hub
        </MenuItem>
      )}
    </ul>
  )
}

export default SideMenu
