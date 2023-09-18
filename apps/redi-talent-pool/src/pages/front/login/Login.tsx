import {
  fetcher,
  LoadMyProfileDocument,
  LoadMyProfileQuery,
  LoadMyProfileQueryVariables,
  MyTpDataDocument,
  MyTpDataQuery,
  MyTpDataQueryVariables,
  RediLocation,
} from '@talent-connect/data-access'
import {
  Button,
  FormInput,
  Heading,
} from '@talent-connect/shared-atomic-design-components'
import { decodeJwt } from '@talent-connect/shared-utils'
import { FormikHelpers as FormikActions, FormikValues, useFormik } from 'formik'
import { useCallback, useState } from 'react'
import { Columns, Content, Form } from 'react-bulma-components'
import { Link } from 'react-router-dom'
import * as Yup from 'yup'
import TpTeaser from '../../../components/molecules/TpTeaser'
import AccountOperation from '../../../components/templates/AccountOperation'
import { login } from '../../../services/api/api'
import {
  getAccessTokenFromLocalStorage,
  saveAccessTokenToLocalStorage,
} from '../../../services/auth/auth'
import { history } from '../../../services/history/history'
import {
  useSignUpCompanyMutation,
  useSignUpJobseekerMutation,
} from '../signup/SignUp.generated'

interface LoginFormValues {
  username: string
  password: string
}

const initialValues: LoginFormValues = {
  username: '',
  password: '',
}

const validationSchema = Yup.object({
  username: Yup.string().email().required().label('Email').max(255),
  password: Yup.string().required().label('Password').max(255),
})

// This is copied directly from the file that contains the auto-codegenerated useMyTpDataQuery.
// We have a need to use the underlying data fetcher function directly. If we were to use the
// react queries directly, the logic inside of our component would be needlessly complex.
// Believe us. We tried. (Kate, Eric, 9 June 2023)
const myTpDataFetcher = fetcher<MyTpDataQuery, MyTpDataQueryVariables>(
  MyTpDataDocument
)
// Same for the useLoadMyProfileQuery that loads CON data:
const buildMyConProfileDataFetcher = () =>
  fetcher<LoadMyProfileQuery, LoadMyProfileQueryVariables>(
    LoadMyProfileDocument,
    { loopbackUserId: getAccessTokenFromLocalStorage()?.userId }
  )

export default function Login() {
  const [loginError, setLoginError] = useState<string>('')
  const tpJobseekerSignupMutation = useSignUpJobseekerMutation()
  const tpCompanySignupMutation = useSignUpCompanyMutation()

  const submitForm = useCallback(
    (values, actions) => {
      ;(async (
        values: FormikValues,
        actions: FormikActions<LoginFormValues>
      ) => {
        const formValues = values as LoginFormValues

        const accessToken = await login(
          formValues.username,
          formValues.password
        )
        saveAccessTokenToLocalStorage(accessToken)

        const handler = new PostLoginSuccessHandler({
          tpJobseekerSignupMutation,
          tpCompanySignupMutation,
        })
        await handler.handle()

        try {
          const accessToken = await login(
            formValues.username,
            formValues.password
          )
          saveAccessTokenToLocalStorage(accessToken)

          const tpUserData = await myTpDataFetcher()

          const userHasATpProfile =
            Boolean(
              tpUserData.tpCurrentUserDataGet.tpJobseekerDirectoryEntry
            ) || Boolean(tpUserData.tpCurrentUserDataGet.representedCompany)

          if (userHasATpProfile) {
            return history.push('/app/me')
          }

          // Note: we have to "build" the con profile data fetcher here because it
          // relies on the access token, which is not available until after the user
          // has logged in.
          const myConProfileDataFetcher = buildMyConProfileDataFetcher()
          const conUserData = await myConProfileDataFetcher()

          const userDoesNotHaveTpProfile = !userHasATpProfile
          const userHasConProfile = Boolean(conUserData.conProfile)

          if (userDoesNotHaveTpProfile && userHasConProfile) {
            await tpJobseekerSignupMutation.mutateAsync({
              input: {
                firstName: conUserData.conProfile.firstName,
                lastName: conUserData.conProfile.lastName,
                rediLocation: conUserData.conProfile.rediLocation,
              },
            })
            return history.push('/app/me')
          }
        } catch (err) {
          actions.setSubmitting(false)
          setLoginError('You entered an incorrect email, password, or both.')
        }
      })(values, actions)
    },
    [tpJobseekerSignupMutation]
  )

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: submitForm,
  })

  return (
    <AccountOperation>
      <Columns vCentered>
        <Columns.Column
          size={6}
          responsive={{ mobile: { hide: { value: true } } }}
        >
          <TpTeaser.SignIn />
        </Columns.Column>

        <Columns.Column size={5} offset={1}>
          <Heading border="bottomLeft">Login</Heading>
          <Content size="large" renderAs="p">
            Enter your email and password below.
          </Content>
          <Content size="small" renderAs="p">
            Got a ReDI Connect user account? You can use the same username and
            password here.
          </Content>

          <form onSubmit={(e) => e.preventDefault()}>
            <FormInput
              name="username"
              type="email"
              placeholder="Email"
              {...formik}
            />

            <FormInput
              name="password"
              type="password"
              placeholder="Password"
              {...formik}
            />

            <Form.Field>
              <Form.Help
                color="danger"
                className={loginError ? 'help--show' : ''}
              >
                {loginError && loginError}
              </Form.Help>
            </Form.Field>

            <Form.Field
              className="submit-link submit-link--pre"
              textTransform="uppercase"
            >
              <Link to="/front/reset-password/request-reset-password-email">
                Forgot your password?
              </Link>
            </Form.Field>

            <Form.Field className="submit-spacer">
              <Button
                fullWidth
                onClick={formik.submitForm}
                disabled={!(formik.dirty && formik.isValid)}
              >
                Log in
              </Button>
            </Form.Field>
          </form>
        </Columns.Column>
      </Columns>
    </AccountOperation>
  )
}

class PostLoginSuccessHandler {
  constructor(private readonly context: PostLoginSuccessHandlerContext) {}

  public async handle(): Promise<void> {
    try {
      await this.runUseCaseUserHasTpProfileOrFail()
    } catch (err) {
      // Do nothing, continue
    }

    try {
      await this.runUseCaseCreateTpProfileFromConProfileOrFail()
    } catch (err) {
      // Do nothing, continue
    }

    try {
      await this.runUseCaseUserJustSignedUpCreateTpProfileOrFail()
    } catch (err) {
      // Do nothing, continue
    }
  }

  private async runUseCaseUserHasTpProfileOrFail(): Promise<void> {
    const tpUserData = await myTpDataFetcher()
    const userHasATpProfile =
      Boolean(tpUserData.tpCurrentUserDataGet.tpJobseekerDirectoryEntry) ||
      Boolean(tpUserData.tpCurrentUserDataGet.representedCompany)

    if (userHasATpProfile) {
      return history.push('/app/me')
    }

    throw new Error('User does not have a TP profile')
  }

  private async runUseCaseCreateTpProfileFromConProfileOrFail(): Promise<void> {
    const myConProfileDataFetcher = buildMyConProfileDataFetcher()
    const conUserData = await myConProfileDataFetcher()

    const userDoesNotHaveTpProfile = true
    const userHasConProfile = Boolean(conUserData.conProfile)

    if (userDoesNotHaveTpProfile && userHasConProfile) {
      await this.context.tpJobseekerSignupMutation.mutateAsync({
        input: {
          firstName: conUserData.conProfile.firstName,
          lastName: conUserData.conProfile.lastName,
          rediLocation: conUserData.conProfile.rediLocation,
        },
      })
      return history.push('/app/me')
    }

    throw new Error('User does not have a CON profile')
  }

  private async runUseCaseUserJustSignedUpCreateTpProfileOrFail(): Promise<void> {
    const accessToken = getAccessTokenFromLocalStorage()
    const { tpSignupType, ...data } = decodeJwt(accessToken?.jwtToken) as {
      [key: string]: string
    }

    switch (tpSignupType) {
      case 'jobseeker':
        await this.context.tpJobseekerSignupMutation.mutateAsync({
          input: {
            rediLocation: data.rediLocation as RediLocation,
          },
        })
        return history.push('/app/me')

      case 'company':
        await this.context.tpCompanySignupMutation.mutateAsync({
          input: {
            companyName: data.companyName,
            rediLocation: data.rediLocation as RediLocation,
          },
        })
        return history.push('/app/me')

      default:
        throw new Error('Invalid tpSignupType')
    }

    const userHasATpJobseekerProfile = Boolean(email)
    if (userHasATpJobseekerProfile) {
      const isWrongRediLocationError = rediLocation !== envRediLocation()

      if (isWrongRediLocationError) {
        purgeAllSessionData()
        setIsWrongRediLocationError(true)
        setTpProfileLocation(rediLocation as RediLocation)
        return
      }

      await this.context.tpJobseekerSignupMutation.mutateAsync({
        input: {
          email,
          userType: UserType.Mentee,
          rediLocation: rediLocation as RediLocation,
        },
      })
      return history.push(`/front/signup-email-verification-success/mentee`)
    }

    throw new Error('User does not have a TP jobseeker profile')
  }
}
interface PostLoginSuccessHandlerContext {
  tpJobseekerSignupMutation: ReturnType<typeof useSignUpJobseekerMutation>
  tpCompanySignupMutation: ReturnType<typeof useSignUpCompanyMutation>
}
