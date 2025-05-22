import { Tooltip } from '@mui/material'
import {
  Button,
  Checkbox,
  Heading,
  Icon,
} from '@talent-connect/shared-atomic-design-components'
import { Columns, Content, Element } from 'react-bulma-components'
import { useQueryClient } from 'react-query'
import {
  Avatar,
  EditableAbout,
  EditableContactDetails,
  EditableEducation,
  EditableLanguages,
  EditableMenteeCount,
  EditableMentoringTopics,
  EditableOccupation,
  EditablePersonalDetail,
  EditableSocialMedia,
} from '../../../../components/organisms'

import { LoggedIn } from '../../../../components/templates'
import {
  getAccessTokenFromLocalStorage,
  purgeAllSessionData,
} from '../../../../services/auth/auth'

import {
  ConnectProfileStatus,
  UserType,
  useConProfileSubmitForReviewMutation,
  useLoadMyProfileQuery,
  usePatchMyProfileMutation,
} from '@talent-connect/data-access'
import { REDI_LOCATION_NAMES } from '@talent-connect/shared-config'
import { useLoading } from '../../../../hooks/WithLoading'
// CHECK OUT THE LOADER
import { useHistory } from 'react-router-dom'
import OnboardingSteps from './OnboardingSteps'
import './ProfileEditor.scss'

function ProfileEditor() {
  const queryClient = useQueryClient()
  const submitProfileForReviewMutation = useConProfileSubmitForReviewMutation()
  const patchMyProfileMutation = usePatchMyProfileMutation()
  const { Loading, isLoading } = useLoading()
  const history = useHistory()

  const myProfileResult = useLoadMyProfileQuery(
    {
      loopbackUserId: getAccessTokenFromLocalStorage().userId,
    },
    {
      onSuccess: (profile) => {
        if (
          profile?.conProfile?.profileStatus ===
            ConnectProfileStatus.Rejected ||
          profile?.conProfile?.profileStatus ===
            ConnectProfileStatus.Deactivated
        ) {
          purgeAllSessionData()
          history.push('/front/login-result')
        }
      },
    }
  )

  // TODO: insert proper error handling here and elsewhere. We should cover cases where we
  // get values usch as myProfileResult.isError. Perhaps we-ure the error boundary logic
  // that Eric has been looking into.

  const conProfile = myProfileResult?.data?.conProfile
  if (!conProfile) return <Loading />

  const {
    userType,
    firstName,
    lastName,
    mentor_isPartnershipMentor,
    profileStatus,
    personalDescription,
    languages,
    mentee_occupationCategoryId,
    categories,
    menteeCountCapacity,
    mentor_workPlace,
    rediLocation,
  } = conProfile

  const loopbackUserId = getAccessTokenFromLocalStorage().userId

  const onSubscribeToMarketingEmailsChange = async () => {
    const mutationResult = await patchMyProfileMutation.mutateAsync({
      input: {
        isSubscribedToCONMarketingEmails:
          !conProfile?.isSubscribedToCONMarketingEmails,
      },
    })
    queryClient.setQueryData(
      useLoadMyProfileQuery.getKey({
        loopbackUserId,
      }),
      { conProfile: mutationResult.patchConProfile }
    )
  }

  const isMentee = userType === UserType.Mentee
  const isMentor = userType === UserType.Mentor
  const isCorporateMentor = isMentor && mentor_isPartnershipMentor

  const isMenteeProfileComplete =
    isMentee &&
    personalDescription !== null &&
    categories.length > 0 &&
    languages !== null &&
    mentee_occupationCategoryId !== null

  const isMentorProfileComplete =
    isMentor &&
    personalDescription !== null &&
    categories.length > 0 &&
    languages !== null &&
    menteeCountCapacity !== null &&
    mentor_workPlace !== null

  const isReadyToSubmit = isMenteeProfileComplete || isMentorProfileComplete
  const isDraftingProfile =
    profileStatus === ConnectProfileStatus.DraftingProfile

  const currentStep = defineCurrentStep(profileStatus, isReadyToSubmit)

  const submitProfileForReview = async () => {
    if (!window.confirm('Would you like to submit your profile for review?'))
      return

    const mutationResult = await submitProfileForReviewMutation.mutateAsync({})
    queryClient.setQueryData(
      useLoadMyProfileQuery.getKey({
        loopbackUserId: getAccessTokenFromLocalStorage().userId,
      }),
      {
        conProfile: mutationResult.conProfileSubmitForReview,
      }
    )
  }

  return (
    <LoggedIn>
      <Columns vCentered breakpoint="mobile" className="oneandhalf-bs">
        <Columns.Column size={3}>
          <Avatar.Editable />
        </Columns.Column>
        <Columns.Column size={8}>
          <Heading size="medium">
            {firstName} {lastName}
          </Heading>
          <Element className="location-tag">
            <Icon icon="mapPin" className="icon-align" />
            <Content size="medium" renderAs="p">
              {REDI_LOCATION_NAMES[rediLocation]}
            </Content>
          </Element>
        </Columns.Column>
      </Columns>
      <Element>
        <OnboardingSteps
          currentStep={currentStep}
          profile={conProfile}
          isMentor={isMentor}
          isCorporateMentor={isCorporateMentor}
        />
      </Element>
      <Element className="block-separator">
        <EditableAbout />
      </Element>

      <Element className="block-separator">
        <EditableMentoringTopics />
      </Element>
      {isMentor && (
        <Element className="block-separator">
          <Columns>
            <Columns.Column size={12}>
              <EditableMenteeCount />
            </Columns.Column>
          </Columns>
        </Element>
      )}

      <Element className="block-separator">
        <Columns>
          <Columns.Column size={6}>
            <Element className="block-separator">
              <EditableContactDetails />
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

      {isMentee && (
        <Element className="block-separator">
          <Columns>
            <Columns.Column size={6}>
              <Element className="block-separator">
                <EditableEducation />
              </Element>
            </Columns.Column>
            <Columns.Column size={6}>
              {/* Commented until we implement it using the data available in Salesforce */}
              {/* <ReadRediClass.Me /> */}
              <EditableOccupation />
            </Columns.Column>
          </Columns>
        </Element>
      )}

      {/* When ReDI course is re-implemented, remove isMentor condition from here & EditableOccupation component above */}
      {isMentor && (
        <Element className="block-separator">
          <Columns>
            <Columns.Column size={6}>
              <EditableOccupation />
            </Columns.Column>
          </Columns>
        </Element>
      )}

      {isMentee && (
        <Element className="block-separator">
          <Checkbox
            checked={conProfile?.isSubscribedToCONMarketingEmails}
            customOnChange={onSubscribeToMarketingEmailsChange}
          >
            <Tooltip
              title={
                <span className="tooltip-text">
                  By selecting this option, you'll receive notifications about
                  new mentors (if unmatched) and a check-in email for
                  mentorships lasting over 3 months.
                </span>
              }
              placement="top-start"
            >
              <span>Receive mentee updates</span>
            </Tooltip>
          </Checkbox>
        </Element>
      )}

      {isMentor && (
        <Element className="block-separator">
          <Checkbox
            checked={conProfile?.isSubscribedToCONMarketingEmails}
            customOnChange={onSubscribeToMarketingEmailsChange}
          >
            <Tooltip
              title={
                <span className="tooltip-text">
                  By selecting this option, you'll receive a check-in email for
                  mentorships lasting over 3 months.
                </span>
              }
              placement="top-start"
            >
              <span>Receive mentor updates</span>
            </Tooltip>
          </Checkbox>
        </Element>
      )}

      {isDraftingProfile && (
        <Element className="block-separator" textAlignment="right">
          <Button
            onClick={submitProfileForReview}
            disabled={!isReadyToSubmit}
            style={!isReadyToSubmit ? { pointerEvents: 'none' } : null}
          >
            Send profile to review
          </Button>
        </Element>
      )}
    </LoggedIn>
  )
}

export default ProfileEditor

// We controll the stepper by passing the current step index (zero-based) as the activeStep prop
const defineCurrentStep = (
  profileStatus: ConnectProfileStatus,
  isProfileComplete: boolean
) => {
  switch (profileStatus) {
    case ConnectProfileStatus.DraftingProfile:
      return isProfileComplete ? 1 : 0
    case ConnectProfileStatus.SubmittedForReview:
      return 2
    case ConnectProfileStatus.Approved:
      return 3
    default:
      return 0
  }
}
