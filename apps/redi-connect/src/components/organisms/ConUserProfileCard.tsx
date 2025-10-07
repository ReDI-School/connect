import { ProfileCard } from '@talent-connect/shared-atomic-design-components'
import {
  CATEGORIES_MAP,
  REDI_LOCATION_NAMES,
} from '@talent-connect/shared-config'
import placeholderImage from '../../assets/images/img-placeholder.png'
import { ConUserProfileCardProfilePropFragment } from './ConUserProfileCard.generated'
import './ConUserProfileCard.scss'

interface ConUserProfileCardProps {
  profile: ConUserProfileCardProfilePropFragment
  linkTo?: string
  isFavorite?: boolean
  toggleFavorite?: (id: string) => void
}

const ConUserProfileCard = ({
  profile,
  toggleFavorite,
  linkTo,
  isFavorite,
}: ConUserProfileCardProps) => {
  const {
    id,
    profileAvatarImageS3Key,
    fullName,
    rediLocation,
    languages,
    categories,
  } = profile
  const tags = categories.map((category) => CATEGORIES_MAP[category])
  const location = `${REDI_LOCATION_NAMES[rediLocation]}`
  const avatar = profileAvatarImageS3Key || placeholderImage

  return (
    <div className="profile-card-wrapper">
      <ProfileCard
        profile={{ id, avatar, fullName, location, languages }}
        tags={tags}
        linkTo={linkTo}
        toggleFavorite={toggleFavorite}
        isFavorite={isFavorite}
      />
    </div>
  )
}

export default ConUserProfileCard
