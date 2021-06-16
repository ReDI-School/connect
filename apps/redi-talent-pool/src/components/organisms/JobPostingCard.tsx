import { AWS_PROFILE_AVATARS_BUCKET_BASE_URL } from '@talent-connect/shared-config'
import { RedProfile } from '@talent-connect/shared-types'
import React from 'react'
import placeholderImage from '../../assets/images/img-placeholder.png'
import './JobPostingCard.scss'

interface JobPostingCardProps {
  profile: RedProfile
  linkTo?: string
  isFavorite?: boolean
  toggleFavorite?: (id: string) => void
}

export function JobPostingCard({
  profile,
  linkTo,
  toggleFavorite,
  isFavorite,
}: JobPostingCardProps) {
  // const history = useHistory()

  const {
    firstName,
    lastName,
    languages,
    categories,
    rediLocation,
    profileAvatarImageS3Key,
  } = profile

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite && toggleFavorite(profile.id)
  }

  // const handleLinkTo = () => linkTo && history.push(linkTo)

  const imgSrc = profileAvatarImageS3Key
    ? AWS_PROFILE_AVATARS_BUCKET_BASE_URL + profileAvatarImageS3Key
    : placeholderImage

  return null

  // return (
  //   <Card
  //     className={classnames('profile-card', { 'profile-card--active': linkTo })}
  //     onClick={linkTo ? handleLinkTo : undefined}
  //   >
  //     <Card.Image
  //       className="profile-card__image"
  //       src={imgSrc}
  //       alt={`${firstName} ${lastName}`}
  //     />
  //     <Card.Content>
  //       {toggleFavorite && (
  //         <div className="profile-card__favorite" onClick={handleFavorite}>
  //           <Icon
  //             icon={isFavorite ? 'heartFilled' : 'heart'}
  //             className="profile-card__favorite__icon"
  //           />
  //         </div>
  //       )}
  //       <Element
  //         key="name"
  //         renderAs="h3"
  //         textWeight="bold"
  //         textSize={4}
  //         className="profile-card__name"
  //       >
  //         {firstName} {lastName}
  //       </Element>
  //       <Element key="location" renderAs="span" className="content">
  //         {rediLocationNames[rediLocation]}
  //       </Element>
  //       {languages && <PipeList items={languages} />}
  //       {categories && (
  //         <ReadMentoringTopics.Tags items={categories} shortList />
  //       )}
  //     </Card.Content>
  //   </Card>
  // )
}
