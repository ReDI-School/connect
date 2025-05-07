import { UserType } from '@talent-connect/data-access'
import {
  Button,
  Checkbox,
  FormInput,
  FormSelect,
  Heading,
} from '@talent-connect/shared-atomic-design-components'
import { REDI_LOCATION_NAMES } from '@talent-connect/shared-config'
import { toPascalCaseAndTrim } from '@talent-connect/shared-utils'
import { objectEntries } from '@talent-connect/typescript-utilities'
import { FormikHelpers as FormikActions, FormikValues, useFormik } from 'formik'
import { useState } from 'react'
import { Columns, Content, Form, Notification } from 'react-bulma-components'
import { Link, useParams } from 'react-router-dom'
import * as Yup from 'yup'
import Teaser from '../../../components/molecules/Teaser'
import AccountOperation from '../../../components/templates/AccountOperation'
import { signUpLoopback } from '../../../services/api/api'
import { history } from '../../../services/history/history'
import { SignUpPageType } from './signup-page.type'

const formRediLocations = objectEntries(REDI_LOCATION_NAMES).map(
  ([id, label]) => ({
    value: id,
    label,
  })
)

export const validationSchema = Yup.object({
  firstName: Yup.string()
    .transform(toPascalCaseAndTrim)
    .required('Your first name is required')
    .max(255),
  lastName: Yup.string()
    .transform(toPascalCaseAndTrim)
    .required('Your last name is required')
    .max(255),
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Your email is required')
    .label('Email')
    .max(255),
  password: Yup.string()
    .min(8, 'Password must contain at least 8 characters')
    .required('Please set a password')
    .label('Password'),
  passwordConfirm: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password')], 'Passwords do not match'),
  rediLocation: Yup.string()
    .required()
    .oneOf(formRediLocations.map((loc) => loc.value))
    .label('Current ReDI Location'),
  agreesWithCodeOfConduct: Yup.boolean().required().oneOf([true]),
  gaveGdprConsent: Yup.boolean().required().oneOf([true]),
  mentor_isPartnershipMentor: Yup.boolean(),
  mentor_workPlace: Yup.string().when('mentor_isPartnershipMentor', {
    is: true,
    then: (schema) => schema.required('Please enter the company name').max(255),
  }),
})

export interface SignUpFormValues {
  userType: UserType
  gaveGdprConsent: boolean
  email: string
  password: string
  passwordConfirm: string
  firstName: string
  lastName: string
  agreesWithCodeOfConduct: boolean
  mentor_isPartnershipMentor?: boolean
  mentor_workPlace?: string
}

export default function SignUp() {
  const { type } = useParams() as unknown as { type: SignUpPageType }

  const initialValues: SignUpFormValues = {
    userType: type.toUpperCase() as UserType,
    gaveGdprConsent: false,
    email: '',
    password: '',
    passwordConfirm: '',
    firstName: '',
    lastName: '',
    agreesWithCodeOfConduct: false,
    mentor_isPartnershipMentor: false,
  }

  const [loopbackSubmitError, setLoopbackSubmitError] = useState<string | null>(
    null
  )
  const submitForm = async (
    values: FormikValues,
    actions: FormikActions<SignUpFormValues>
  ) => {
    setLoopbackSubmitError(null)
    try {
      await signUpLoopback(values.email, values.password, {
        firstName: values.firstName,
        lastName: values.lastName,
        userType: type.toUpperCase() as UserType,
        rediLocation: values.rediLocation,
        productSignupSource: 'CON',
        ...(type === 'mentor'
          ? {
              mentor_isPartnershipMentor: values.mentor_isPartnershipMentor,
              mentor_workPlace: values.mentor_workPlace,
            }
          : {}),
      })
      actions.setSubmitting(false)
      history.push(`/front/signup-email-verification`)
    } catch (error) {
      actions.setSubmitting(false)
      if (
        error?.response?.data?.error?.details?.codes?.email.includes(
          'uniqueness'
        )
      ) {
        setLoopbackSubmitError('user-already-exists')
      } else {
        setLoopbackSubmitError('generic')
      }
    }
  }

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initialValues,
    validationSchema,
    onSubmit: submitForm,
  })

  const isPartnershipMentor = formik.values.mentor_isPartnershipMentor === true

  return (
    <AccountOperation>
      <Columns vCentered>
        <Columns.Column
          size={6}
          responsive={{ mobile: { hide: { value: true } } }}
        >
          <Teaser.SignIn />
        </Columns.Column>

        <Columns.Column size={5} offset={1}>
          <Heading border="bottomLeft">Sign-up</Heading>
          {type === 'mentee' && (
            <Content size="small" renderAs="p">
              Got a ReDI Talent Pool user account? You can log in with the same
              username and password <Link to="/front/login">here</Link>.
            </Content>
          )}
          {loopbackSubmitError === 'user-already-exists' ? (
            <Notification color="info" className="is-light">
              You already have an account. Please{' '}
              <Link to="/front/login">log in</Link>.
            </Notification>
          ) : null}

          <form onSubmit={(e) => e.preventDefault()} className="form">
            <FormInput
              name="firstName"
              placeholder="Your first name"
              {...formik}
            />

            <FormInput
              name="lastName"
              placeholder="Your last name"
              {...formik}
            />

            <FormInput
              name="email"
              type="email"
              placeholder="Your Email"
              {...formik}
            />

            <FormInput
              name="password"
              type="password"
              placeholder="Your password"
              {...formik}
            />

            <FormInput
              name="passwordConfirm"
              type="password"
              placeholder="Repeat your password"
              {...formik}
            />

            <FormSelect
              label="Current ReDI Location"
              name="rediLocation"
              placeholder="Choose your ReDI Location"
              items={formRediLocations}
              formik={formik}
            />

            {type === 'mentor' && (
              <Checkbox.Form
                name="mentor_isPartnershipMentor"
                checked={formik.values.mentor_isPartnershipMentor}
                className="submit-spacer"
                {...formik}
              >
                I am participating in a mentorship event with my company
              </Checkbox.Form>
            )}
            {type === 'mentor' && isPartnershipMentor && (
              <FormInput
                name="mentor_workPlace"
                placeholder="Which company are you working for?"
                {...formik}
              />
            )}

            <Checkbox.Form
              name="agreesWithCodeOfConduct"
              checked={formik.values.agreesWithCodeOfConduct}
              {...formik}
            >
              I agree to the{' '}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="/assets/downloadeables/redi-connect-code-of-conduct.pdf"
              >
                Code of Conduct
              </a>{' '}
              of ReDI School
            </Checkbox.Form>

            <Checkbox.Form
              name="gaveGdprConsent"
              checked={formik.values.gaveGdprConsent}
              {...formik}
            >
              I give permission to the ReDI School Terms stated in the{' '}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.redi-school.org/data-privacy-policy"
              >
                Data Protection
              </a>
            </Checkbox.Form>
            {loopbackSubmitError !== 'user-already-exists' &&
            loopbackSubmitError ? (
              <Form.Help color="danger" className="help--show">
                An error occurred, please try again.
              </Form.Help>
            ) : null}

            <Form.Field>
              <Form.Control>
                <Button
                  fullWidth
                  onClick={() => formik.handleSubmit()}
                  disabled={!(formik.dirty && formik.isValid)}
                >
                  submit
                </Button>
              </Form.Control>
            </Form.Field>
          </form>
        </Columns.Column>
      </Columns>
    </AccountOperation>
  )
}
