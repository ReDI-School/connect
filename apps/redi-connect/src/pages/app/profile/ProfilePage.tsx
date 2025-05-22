import { useLoadMyProfileQuery } from '@talent-connect/data-access'
import { Loader } from '@talent-connect/shared-atomic-design-components'
import { useParams } from 'react-router-dom'
import { getAccessTokenFromLocalStorage } from '../../../services/auth/auth'
import ProfileEditor from '../profile/profile-editor/ProfileEditor'
import Profile from './Profile'

interface RouteParams {
  profileId: string
}

const ProfilePage = () => {
  const { profileId } = useParams<RouteParams>()

  const currentUserProfile = useLoadMyProfileQuery({
    loopbackUserId: getAccessTokenFromLocalStorage().userId,
  })

  if (currentUserProfile.isLoading) return <Loader loading />

  const profileIsOfCurrentUser =
    profileId === currentUserProfile.data?.conProfile?.id

  if (profileIsOfCurrentUser) return <ProfileEditor />

  return <Profile />
}

export default ProfilePage
