import React from 'react'
import moment from 'moment'
import { RedProfile } from '../../types/RedProfile'
import { connect } from 'react-redux'
import { RootState } from '../../redux/types'
import PipeList from './PipeList'
import { Caption, Placeholder } from '../atoms'
import {
  gendersIdToLabelMap
} from '../../config/config'

interface Props {
  profile: RedProfile
  caption?: boolean
}

const ReadPersonalDetail = ({ profile, caption }: Props) => {
  const {
    gender,
    birthDate
  } = profile

  const age = moment().diff(birthDate, 'years');

  const detailsList = gender ? [gendersIdToLabelMap[gender]] : []
  if (age) detailsList.push(`${age} years old`)

  if (!gender && !age) return <Placeholder>Input your gender and date of birth.</Placeholder>

  return <>
    {caption && <Caption>Personal Details</Caption>}
    <PipeList items={detailsList} />
  </>
}

const mapStateToProps = (state: RootState) => ({
  profile: state.user.profile as RedProfile
})

export default {
  Me: connect(mapStateToProps, {})(ReadPersonalDetail),
  Some: ({ profile }: Props) => <ReadPersonalDetail profile={profile} caption />
}
