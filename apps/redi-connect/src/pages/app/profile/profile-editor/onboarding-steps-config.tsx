import { RediLocation } from '@talent-connect/data-access'
import { getRediConnectLocationDetails } from '@talent-connect/shared-config'

export const ONBOARDING_STEPS = [
  {
    name: `Fill out your profile`,
    message: {
      mentee: (rediLocation?: RediLocation) => (
        <>
          <strong>Go ahead and fill out your profile below.</strong> Make sure
          you complete all the required fields (everything but the optional
          ones). This helps potential mentors know you better and find the
          perfect match.
        </>
      ),
      mentor: (rediLocation?: RediLocation) => (
        <>
          <strong>Go ahead and fill out your profile below.</strong> Make sure
          you complete all the required fields (everything but the optional
          ones). This helps potential mentees know you better and find the
          perfect match.
        </>
      ),
    },
  },
  {
    name: `Send profile for review`,
    message: {
      mentee: (rediLocation?: RediLocation) => (
        <>
          <strong>Awesome!</strong> You've completed all the required fields.
          Click the button at the bottom of this page to submit your profile.
          Don't worry, you can always edit and update your profile information
          later.
        </>
      ),
      mentor: (rediLocation?: RediLocation) => (
        <>
          <strong>Awesome!</strong> You've completed all the required fields.
          Click the button at the bottom of this page to submit your profile.
          Don't worry, you can always edit and update your profile information
          later.
        </>
      ),
    },
  },
  {
    name: `Await profile approval`,
    message: {
      mentee: (rediLocation?: RediLocation) => (
        <>
          <strong>Thanks for sending us your profile!</strong> We are reviewing
          it and will email you once it's done. After the profile approval,
          you'll be able to find a mentor.
        </>
      ),
      mentor: (rediLocation?: RediLocation) => {
        const locationDetails = getRediConnectLocationDetails(rediLocation)
        return (
          <>
            <strong>Thanks for sending us your profile!</strong> We're reviewing
            it and will email you once it's done. While you're waiting,{' '}
            {locationDetails.mentorOnboardingCalendarUrl ? (
              <>
                pick a time for your{' '}
                <a
                  href={locationDetails.mentorOnboardingCalendarUrl}
                  target="__blank"
                >
                  onboarding call
                </a>
              </>
            ) : (
              <>
                contact us at{' '}
                <a href={`mailto:${locationDetails.contactEmail}`}>
                  {locationDetails.contactEmail}
                </a>{' '}
                to arrange your onboarding call
              </>
            )}
            . After the call and profile approval, students can apply to be your
            mentee!
          </>
        )
      },
      corporateMentor: (
        <>
          <strong>Thanks for sending us your profile!</strong> We are reviewing
          it and will email you once it's done. After the profile approval,
          students can apply to be your mentee!
        </>
      ),
    },
  },
  {
    name: `You're all set!`,
    message: {
      mentee: (rediLocation: RediLocation) => {
        const locationDetails = getRediConnectLocationDetails(rediLocation)
        return (
          <>
            <strong>Congratulations!</strong> Your profile has been approved.
            You are now ready to{' '}
            <a href="/app/find-a-mentor/" target="_blank" rel="noreferrer">
              find a mentor
            </a>
            . If you have questions, please check our{' '}
            <a href="/faq" target="_blank" rel="noreferrer">
              FAQ
            </a>
            {locationDetails.menteeSupportCalendarUrl ? (
              <>
                ,{' '}
                <a href={`mailto:${locationDetails.contactEmail}`}>
                  contact us
                </a>{' '}
                or{' '}
                <a
                  href={locationDetails.menteeSupportCalendarUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  book a call
                </a>{' '}
                with our Mentorship Program Manager.
              </>
            ) : (
              <>
                , or contact our Mentorship Program Manager at{' '}
                <a href={`mailto:${locationDetails.contactEmail}`}>
                  {locationDetails.contactEmail}
                </a>
                .
              </>
            )}
          </>
        )
      },
      mentor: (rediLocation?: RediLocation) => (
        <>
          <strong>Congratulations!</strong> Your profile has been approved.
          Students can now apply to be your mentee. You're all set to make a
          difference as a mentor! Make sure you keep your profile up to date.
        </>
      ),
    },
  },
]
