import {
  Caption,
  CardTags,
  CardTagsProps,
  Placeholder,
} from '@talent-connect/shared-atomic-design-components'
import { FIELDS_OF_EXPERTISE } from '@talent-connect/shared-config'
import { RedProfile } from '@talent-connect/shared-types'
import React from 'react'
import { connect } from 'react-redux'
import { RootState } from '../../redux/types'

interface ReadMentoringProps {
  profile: RedProfile
  caption?: boolean
}

export const ProfileTags = ({ items, shortList }: CardTagsProps) => (
  <CardTags
    items={items}
    shortList={shortList}
    formatter={(item: string) => FIELDS_OF_EXPERTISE[item]}
  />
)

const ReadProfessionalExperienceFields = ({
  profile,
  caption,
}: ReadMentoringProps) => {
  const { mentor_professionalExperienceFields: professionalExperienceFields } =
    profile

  if (!professionalExperienceFields?.length && !caption)
    return <Placeholder>Select your fields of expertise</Placeholder>

  return (
    <>
      {caption && <Caption>Professional experience</Caption>}
      <ProfileTags items={professionalExperienceFields} />
    </>
  )
}

const mapStateToProps = (state: RootState) => ({
  profile: state.user.profile as RedProfile,
})

export default {
  Me: connect(mapStateToProps, {})(ReadProfessionalExperienceFields),
  Some: ({ profile }: ReadMentoringProps) => (
    <ReadProfessionalExperienceFields profile={profile} caption />
  ),
  Tags: ({ items, shortList }: CardTagsProps) => (
    <ProfileTags items={items} shortList />
  ),
}
