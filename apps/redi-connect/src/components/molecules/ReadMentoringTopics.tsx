import React from 'react'
import { Tag } from 'react-bulma-components'
import { connect } from 'react-redux'
import { RootState } from '../../redux/types'
import {
  Caption,
  CardTags,
  Placeholder,
} from '@talent-connect/shared-atomic-design-components'
import { categoriesIdToLabelMap } from '@talent-connect/shared-config'
import { RedProfile } from '@talent-connect/shared-types'
import { CardTagsProps } from 'libs/shared-atomic-design-components/src/lib/atoms/CardTags'

interface ReadMentoringProps {
  profile: RedProfile
  caption?: boolean
}

export const ProfileTags = ({ items, shortList }: CardTagsProps) => (
  <CardTags
    items={items}
    shortList={shortList}
    formatter={(item: string) => categoriesIdToLabelMap[item]}
  />
)

const ReadMentoringTopics = ({ profile, caption }: ReadMentoringProps) => {
  const { categories } = profile

  if (!categories?.length && !caption)
    return <Placeholder>Please pick up to three mentoring topics.</Placeholder>

  return (
    <>
      {caption && <Caption>{'Mentoring Topics'}</Caption>}
      <ProfileTags items={categories} />
    </>
  )
}

const mapStateToProps = (state: RootState) => ({
  profile: state.user.profile as RedProfile,
})

export default {
  Me: connect(mapStateToProps, {})(ReadMentoringTopics),
  Some: ({ profile }: ReadMentoringProps) => (
    <ReadMentoringTopics profile={profile} caption />
  ),
  Tags: ({ items, shortList }: CardTagsProps) => (
    <ProfileTags items={items} shortList />
  ),
}
