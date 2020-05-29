import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { RootState } from '../../../redux/types'
import { profileFetchStart } from '../../../redux/user/actions'
import { Columns, Content, Element } from 'react-bulma-components'
import { Heading } from '../../../components/atoms'
import {
  Avatar,
  EditableAbout,
  EditableContacts,
  EditableLanguages,
  EditableMentoring,
  EditableOccupation,
  EditablePersonalDetail,
  EditableRediClass,
  EditableSocialMedia
} from '../../../components/organisms'

import { LoggedIn } from '../../../components/templates'
// CHECK OUT THE LOADER
// import { FullScreenCircle } from '../../../hooks/WithLoading'

const Me = ({ loading, saveResult, profileFetchStart, profile }: any) => {
  // not sure if this is really needed since the profile is loaded when the user is logged in
  useEffect(() => {
    profileFetchStart()
  }, [profileFetchStart])

  return (
    <LoggedIn>
      {loading && 'page loading...'}
      {saveResult === 'error' && <><br /><br /><br />An error occurred, please try again.</>}
      {!loading &&
        <>
          {saveResult === 'submitting' && 'part of the page loading...'}

          <Columns vCentered breakpoint="mobile">
            <Columns.Column size={3}>
              <Avatar.Editable />
            </Columns.Column>
            <Columns.Column size={8}>
              <Heading>Hi, {profile.firstName}</Heading>
              <Content size="medium" renderAs="p" responsive={{ mobile: { hide: { value: true } } }}>
                You have completed 15% of your profile. Let potential mentors know a little bit more about you, so you can find the perfect fit.
              </Content>
            </Columns.Column>
          </Columns>
          <Element className="block-separator" responsive={{ tablet: { hide: { value: true } } }}>
            <Content size="medium" renderAs="p">
              You have completed 15% of your profile. Let potential mentors know a little bit more about you, so you can find the perfect fit.
            </Content>
          </Element>
          <Element className="block-separator">
            <EditableAbout />
          </Element>

          <Element className="block-separator">
            <EditableMentoring />
          </Element>

          <Element className="block-separator">
            <Columns>
              <Columns.Column size={6}>
                <Element className="block-separator">
                  <EditableContacts />
                </Element>
              </Columns.Column>
              <Columns.Column size={6}>
                <EditableSocialMedia />
              </Columns.Column>
            </Columns>
          </Element>

          <Element className="block-separator">
            <Columns>
              <Columns.Column size={6}>
                <Element className="block-separator">
                  <EditablePersonalDetail />
                </Element>
              </Columns.Column>
              <Columns.Column size={6}>
                <EditableLanguages />
              </Columns.Column>
            </Columns>
          </Element>

          <Element className="block-separator">
            <Columns>
              <Columns.Column size={6}>
                <Element className="block-separator">
                  <EditableOccupation />
                </Element>
              </Columns.Column>
              <Columns.Column size={6}>
                {profile.userType === 'mentee' && <EditableRediClass />}
              </Columns.Column>
            </Columns>
          </Element>
        </>
      }
    </LoggedIn>
  )
}

const mapStateToProps = (state: RootState) => ({
  saveResult: state.user.saveResult,
  loading: state.user.loading,
  profile: state.user.profile
})

const mapDispatchToProps = (dispatch: any) => ({
  profileFetchStart: () => dispatch(profileFetchStart())
})

export default connect(mapStateToProps, mapDispatchToProps)(Me)
