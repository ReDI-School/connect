import React from 'react'
import { Content } from 'react-bulma-components'
import { RedProfile } from '@talent-connect/shared-types'
import { connect } from 'react-redux'
import { RootState } from '../../redux/types'
import { REDI_LOCATION_NAMES } from '@talent-connect/shared-config'

interface Props {
  profile: RedProfile
}

const Me = ({ profile }: Props) => {
  const {
    menteeCountCapacity,
    optOutOfMenteesFromOtherRediLocation,
    rediLocation,
  } = profile

  return (
    <Content>
      {menteeCountCapacity && <p>{menteeCountCapacity}</p>}
      {!optOutOfMenteesFromOtherRediLocation && (
        <p>
          Let mentees in my location ({REDI_LOCATION_NAMES[rediLocation]}) AND
          other locations apply for mentorship
        </p>
      )}
      {optOutOfMenteesFromOtherRediLocation && (
        <p>
          Only let mentees from my own location (
          {REDI_LOCATION_NAMES[rediLocation]}) apply for mentorship
        </p>
      )}
    </Content>
  )
}

const mapStateToProps = (state: RootState) => ({
  profile: state.user.profile as RedProfile,
})

export default {
  Me: connect(mapStateToProps, {})(Me),
}
