import { useLoadMyProfileQuery } from '@talent-connect/data-access'
import {
  Button,
  Heading,
} from '@talent-connect/shared-atomic-design-components'
import { getRediConnectLocationDetails } from '@talent-connect/shared-config'
import { Columns, Content, Form } from 'react-bulma-components'
import { useHistory, useParams } from 'react-router-dom'
import { Teaser } from '../../../components/molecules'
import AccountOperation from '../../../components/templates/AccountOperation'
import { getAccessTokenFromLocalStorage } from '../../../services/auth/auth'
import { SignUpPageType, SignUpPageTypes } from './signup-page.type'

export default function SignUpComplete() {
  const history = useHistory()
  const { userType } = useParams() as unknown as { userType: SignUpPageType }

  const loopbackUserId = getAccessTokenFromLocalStorage().userId
  const myProfileQuery = useLoadMyProfileQuery({ loopbackUserId })

  const locationDetails = getRediConnectLocationDetails(
    myProfileQuery.data?.conProfile.rediLocation
  )
  const isPartnershipMentor =
    myProfileQuery.data?.conProfile.mentor_isPartnershipMentor === true

  return (
    <AccountOperation>
      <Columns vCentered>
        <Columns.Column
          size={6}
          responsive={{ mobile: { hide: { value: true } } }}
        >
          <Teaser.IllustrationOnly />
        </Columns.Column>
        <Columns.Column size={5} offset={1}>
          <Heading border="bottomLeft">Sign-up complete!</Heading>
          <Content size="large" renderAs="div">
            {userType === SignUpPageTypes.mentor &&
              (isPartnershipMentor ? (
                <>
                  <p style={{ textAlign: 'justify' }}>
                    Thank you for signing up!{' '}
                  </p>
                  <p>
                    Please go to your account and{' '}
                    <strong>complete your profile information</strong>.
                  </p>
                </>
              ) : (
                <>
                  <p style={{ textAlign: 'justify' }}>
                    Thank you for signing up!{' '}
                  </p>
                  <p style={{ textAlign: 'justify' }}>
                    Please click on <strong>"Continue to your profile"</strong>{' '}
                    and complete all the steps from the stepper at the top of
                    your profile page.
                  </p>
                  <p style={{ textAlign: 'justify' }}>
                    After sending your profile for review and having an
                    onboarding call with our Mentorship Program Manager, your
                    profile will become visible to mentees.
                  </p>
                </>
              ))}

            {userType === SignUpPageTypes.mentee && (
              <>
                <p style={{ textAlign: 'justify' }}>
                  Your next step is to watch a short onboarding tutorial to get
                  a good overview of the mentorship program and how our matching
                  platform ReDI Connect works.
                </p>
                <p>
                  <a
                    href="https://www.youtube.com/watch?v=M3nwS3QfdMM"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      style={{ width: '100%' }}
                      src="https://redi-connect-email-assets.s3.eu-west-1.amazonaws.com/redi-connect-sign-up-video-thumbnail.jpeg"
                      alt=""
                    />
                  </a>
                </p>

                <p style={{ textAlign: 'justify' }}>
                  After watching the video, click{' '}
                  <strong>"Continue to your profile"</strong> and complete the
                  steps in the top stepper. Once you've sent your profile for
                  review, our Mentorship Program Manager will approve it. Then,
                  you can find a mentor and start your journey right away.
                </p>
              </>
            )}
          </Content>
          <Form.Field className="submit-spacer">
            <Form.Control>
              <Button onClick={() => history.push('/app/me')}>
                Continue to your profile
              </Button>
            </Form.Control>
          </Form.Field>
          <Content size="small" renderAs="p">
            Do you have questions? Feel free to contact us{' '}
            <a href={`mailto:${locationDetails.contactEmail}`}>here</a> or visit
            our{' '}
            <a href={locationDetails.websiteUrl} target="__blank">
              ReDI school website
            </a>{' '}
            for more information.
          </Content>
        </Columns.Column>
      </Columns>
    </AccountOperation>
  )
}
