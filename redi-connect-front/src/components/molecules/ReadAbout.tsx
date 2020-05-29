import React from 'react'
import { Content } from 'react-bulma-components'
import { RedProfile } from '../../types/RedProfile'
import { connect } from 'react-redux'
import { RootState } from '../../redux/types'
import { Caption } from '../atoms'

interface Props {
  profile: RedProfile
}

const Placeholder = () => <Content italic>Please tell us a bit about yourself</Content>

const Me = ({ profile }: Props) => {
  const {
    personalDescription,
    expectations,
    menteeCountCapacity
  } = profile

  if (!personalDescription && !expectations && !menteeCountCapacity) return <Placeholder />

  return (
    <Content>
      {personalDescription && <p>{personalDescription}</p>}
      {expectations && <p>{expectations}</p>}
      {menteeCountCapacity && <p>{menteeCountCapacity}</p>}
    </Content>
  )
}

const Some = ({ profile }: Props) => {
  const {
    firstName,
    lastName,
    personalDescription,
    expectations
  } = profile

  return <>
    <Caption>About {firstName} {lastName}</Caption>
    <Content>
      {personalDescription && <p>{personalDescription}</p>}
      {expectations && <p>{expectations}</p>}
    </Content>
  </>
}

const mapStateToProps = (state: RootState) => ({
  profile: state.user.profile as RedProfile
})

export default {
  Me: connect(mapStateToProps, {})(Me),
  Some: ({ profile }: Props) => <Some profile={profile} />
}
