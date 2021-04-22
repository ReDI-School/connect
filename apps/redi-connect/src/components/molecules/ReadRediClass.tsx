import React from 'react'
import { Content } from 'react-bulma-components'
import { RedProfile } from '../../types/RedProfile'
import { connect } from 'react-redux'
import { RootState } from '../../redux/types'
import { Caption } from '../atoms'
import { courseIdToLabelMap } from '../../config/config'

interface Props {
  profile: RedProfile
  shortInfo?: boolean
}

const ReadRediClass = ({ profile, shortInfo }: Props) => {
  const {
    mentee_currentlyEnrolledInCourse
  } = profile

  return <>
    {shortInfo && <Caption>Redi Class</Caption> }
    <Content>{mentee_currentlyEnrolledInCourse && <p>{courseIdToLabelMap[mentee_currentlyEnrolledInCourse]}</p>}</Content>
  </>
}

const mapStateToProps = (state: RootState) => ({
  profile: state.user.profile as RedProfile
})

export default {
  Me: connect(mapStateToProps, {})(ReadRediClass),
  Some: ({ profile }: Props) => <ReadRediClass profile={profile} shortInfo/>
}
