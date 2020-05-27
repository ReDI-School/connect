import React, { useEffect } from 'react'
import { Content, Element } from 'react-bulma-components'
import Heading from '../../../components/atoms/Heading'
import { ApplicationCard } from '../../../components/organisms/ApplicationCard'
import LoggedIn from '../../../components/templates/LoggedIn'
import { RootState } from '../../../redux/types'
import { getApplicants } from '../../../redux/matches/selectors'
import { connect } from 'react-redux'
import { matchesFetchStart } from '../../../redux/matches/actions'
import { FullScreenCircle } from '../../../hooks/WithLoading'
import { RedMatch } from '../../../types/RedMatch'
import { useHistory } from 'react-router-dom'
import { getRedProfile } from '../../../services/auth/auth'

interface Props {
  loading: boolean
  applicants: RedMatch[]
  matchesFetchStart: Function
}

// TODO: add type to Props
function Applications ({ loading, applicants, matchesFetchStart }: Props) {
  const history = useHistory()
  const profile = getRedProfile()

  useEffect(() => {
    matchesFetchStart()
  }, [matchesFetchStart])

  return (
    <LoggedIn>
      <FullScreenCircle loading={loading} />
      <Heading subtitle size="small" className="double-block-space">Your pending applications</Heading>
      {applicants.length === 0 && <>
        <Element textTransform="uppercase" className="double-block-space">
            0 applicantions
        </Element>
        {profile.userType === 'mentee' &&
          <Content italic>
            You have not applied for a mentor yet. <a onClick={() => history.push('/app/dashboard') }>Find your mentor here.</a>
          </Content>
        }
      </>}
      {applicants.length > 0 && <>
        { applicants.map((application: RedMatch) => (
          <ApplicationCard key={application.id} application={application} />
        ))}
      </>}
    </LoggedIn>
  )
}

const mapDispatchToProps = (dispatch: any) => ({
  matchesFetchStart: () => dispatch(matchesFetchStart())
})

const mapStateToProps = (state: RootState) => ({
  loading: state.matches.loading,
  applicants: getApplicants(state.matches)
})

export default connect(mapStateToProps, mapDispatchToProps)(Applications)
