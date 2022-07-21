import React from 'react'
import AccountOperation from '../../../components/templates/AccountOperation'
import { ReactComponent as WelcomeIllustration } from '../../../assets/images/welcome-user.svg'
import { Columns, Form, Content } from 'react-bulma-components'
import { useHistory, useParams } from 'react-router'
import { UserType } from '@talent-connect/shared-types'
import {
  Heading,
  Button,
} from '@talent-connect/shared-atomic-design-components'
import { UserType } from '@talent-connect/data-access'

type RouteParams = {
  userType: UserType
}

export default function SignUpComplete() {
  const history = useHistory()
  const { userType } = useParams<RouteParams>() as RouteParams
  // TODO: Fix the weird layout issue, and make sure we only show the left-hand side illustration
  // as on initial sign up page, but withhout the sign up link.
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
          <Heading border="bottomLeft">Meet the team</Heading>
          <Content size="large" renderAs="div">
            <p>Your email address was successfully verified!</p>
            {userType === 'MENTOR' && (
              <p>
                Now, we would like to get to know you better. We regularly
                organize mentor onboardings in small groups.{' '}
                <a href="https://calendly.com/johanna-redi-team/redi-connect-mentors-onboarding">
                  <strong>
                    Please book yourself in for one of the open 30-minute slots.
                  </strong>
                </a>
              </p>
            )}
            {userType === 'MENTEE' && (
              <>
                <p>
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

                <p>
                  Your <strong>final step</strong> after watching this video
                  will be your activation call with our team.
                </p>
                <p>
                  <a
                    href="https://calendly.com/johanna-redi-team/redi-connect-mentee-activation"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Schedule your activation call now
                  </a>
                  .
                </p>
              </>
            )}
          </Content>
          <Form.Field className="submit-spacer">
            <Form.Control>
              <Button onClick={() => history.push('/home')}>
                Return to ReDI Connect Website
              </Button>
            </Form.Control>
          </Form.Field>
          <Content size="small" renderAs="p">
            Do you have questions? Feel free to contact our team{' '}
            <a href="mailto:career@redi-school.org">here</a> or visit our{' '}
            <a href="https://www.redi-school.org/" target="__blank">
              ReDI school website
            </a>{' '}
            for more information.
          </Content>
        </Columns.Column>
      </Columns>
    </AccountOperation>
  )
}
