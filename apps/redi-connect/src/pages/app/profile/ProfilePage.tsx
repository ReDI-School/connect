import { useLoadMyProfileQuery } from '@talent-connect/data-access'
import { Loader } from '@talent-connect/shared-atomic-design-components'
import { useParams } from 'react-router-dom'
import { getAccessTokenFromLocalStorage } from '../../../services/auth/auth'
import Me from '../me/Me'
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

  if (profileIsOfCurrentUser) return <Me />

  return <Profile />
}

export default ProfilePage
