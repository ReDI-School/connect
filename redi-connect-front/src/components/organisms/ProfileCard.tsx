import React from 'react'
import { Card, Element, Tag } from 'react-bulma-components'
import { useHistory } from 'react-router-dom'
// import { LogMentoringSessionBtn } from '../../components/LogMentoringSessionBtn'
import PipeList from '../../components/molecules/PipeList'
import {
  AWS_PROFILE_AVATARS_BUCKET_BASE_URL,
  categoriesIdToLabelMap
} from '../../config/config'

import './ProfileCard.scss'

import { RedProfile } from '../../types/RedProfile'

export const ProfileCard = ({ profile }: { profile: RedProfile }) => {
  const history = useHistory()

  return <Card className="profile-card" onClick={() => history.push(`/app/profile/${profile.id}`)}>
    {/* The avatar component may replace this image but for now it's a working solution */}
    <Card.Image className="profile-card__image" src={`${AWS_PROFILE_AVATARS_BUCKET_BASE_URL}${profile.profileAvatarImageS3Key}`} alt="" />
    <Card.Content>
      <Element renderAs="h3" textWeight="bold" textSize={4}>
        {profile.firstName} {profile.lastName}
      </Element>
      <PipeList items={profile.languages} />
      <Tag.Group className="profile-card__tags">
        {profile.categories.map(catId => (
          <Tag key={catId} size="large" rounded>
            {categoriesIdToLabelMap[catId]}
          </Tag>
        ))}
      </Tag.Group>
      {/* need a solution for displaying the button for loggin a sessioin
      <LogMentoringSessionBtn menteeId={mentee.id} /> */}
    </Card.Content>
  </Card>
}
