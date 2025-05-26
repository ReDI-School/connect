import { useLoadMyProfileQuery } from '@talent-connect/data-access'
import { Loader } from '@talent-connect/shared-atomic-design-components'
import { Redirect } from 'react-router-dom'
import { getAccessTokenFromLocalStorage } from '../../../services/auth/auth'

const RedirectToOwnProfile = () => {
  const currentUserProfile = useLoadMyProfileQuery({
    loopbackUserId: getAccessTokenFromLocalStorage().userId,
  })
  const currentUserProfileId = currentUserProfile.data?.conProfile?.id

  if (currentUserProfile.isLoading) return <Loader loading />

  return <Redirect to={`/app/profile/${currentUserProfileId}`} />
}

export default RedirectToOwnProfile
