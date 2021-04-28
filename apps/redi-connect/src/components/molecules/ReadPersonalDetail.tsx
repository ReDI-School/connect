import React from 'react'
import { RedProfile } from '@talent-connect/shared-types'
import { connect } from 'react-redux'
import { RootState } from '../../redux/types'
import {
  Caption,
  Placeholder,
  PipeList,
} from '@talent-connect/shared-atomic-design-components'
import { gendersIdToLabelMap } from '@talent-connect/shared-config'

interface Props {
  profile: RedProfile
  caption?: boolean
}

const ReadPersonalDetail = ({ profile, caption }: Props) => {
  const { gender, age } = profile

  const detailsList = gender ? [gendersIdToLabelMap[gender]] : []
  if (age) detailsList.push(`${age} years old`)

  if (!gender && !age)
    return <Placeholder>Input your gender and age.</Placeholder>

  return (
    <>
      {caption && <Caption>Personal Details</Caption>}
      <PipeList items={detailsList} />
    </>
  )
}

const mapStateToProps = (state: RootState) => ({
  profile: state.user.profile as RedProfile,
})

export default {
  Me: connect(mapStateToProps, {})(ReadPersonalDetail),
  Some: ({ profile }: Props) => (
    <ReadPersonalDetail profile={profile} caption />
  ),
}
