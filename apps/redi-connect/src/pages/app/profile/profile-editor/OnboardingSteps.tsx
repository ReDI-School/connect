import { useMediaQuery, useTheme } from '@mui/material'
import { ConProfile, ConnectProfileStatus } from '@talent-connect/data-access'
import { Icon } from '@talent-connect/shared-atomic-design-components'
import { useState } from 'react'
import { Element } from 'react-bulma-components'

import './OnboardingSteps.scss'
import { ONBOARDING_STEPS } from './onboarding-steps-config'
import HorizontalStepper from './stepper-card/HorizontalStepper'
import VerticalStepper from './stepper-card/VerticalStepper'

const getCustomStepIcon = ({ active, completed, currentStep }) => {
  if (active)
    return currentStep === 3 ? (
      <Icon icon="stepDone" size="large" />
    ) : (
      <Icon icon="stepProgress" size="large" />
    )

  return completed ? (
    <Icon icon="stepDone" size="large" />
  ) : (
    <Icon icon="stepDisabled" size="large" />
  )
}

export type CurrentStepType = 0 | 1 | 2 | 3

interface OnboardingStepsProps {
  currentStep: CurrentStepType
  profile: Pick<ConProfile, 'profileStatus' | 'firstName' | 'rediLocation'>
  isMentor: boolean
  isCorporateMentor: boolean
}

const OnboardingSteps = ({
  currentStep,
  profile,
  isMentor,
  isCorporateMentor,
}: OnboardingStepsProps) => {
  const [isStepperHidden, setIsStepperHidden] = useState(
    localStorage.getItem('isStepperHidden') || false
  )
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const isApprovedProfile =
    profile.profileStatus === ConnectProfileStatus.Approved

  const rediLocation = profile.rediLocation

  const hideStepper = () => {
    setIsStepperHidden(true)
    localStorage.setItem('isStepperHidden', 'true')
  }

  const stepperProps = {
    currentStep,
    isMentor,
    isCorporateMentor,
    rediLocation,
    customStepIcon: ({ active, completed }) =>
      getCustomStepIcon({ active, completed, currentStep }),
    steps: ONBOARDING_STEPS,
  }

  return (
    !isStepperHidden && (
      <div className="stepper-card">
        <div className="stepper-card--header-wrapper">
          <div className="stepper-card--header">
            <Element
              renderAs="h3"
              textSize={isMobile ? 6 : 5}
              textWeight="bold"
              textTransform="uppercase"
            >
              Hi, {profile.firstName}! Let's complete these steps:
            </Element>
          </div>

          {isApprovedProfile && (
            <div className="icon__button-small" onClick={hideStepper}>
              <Icon icon="cancel" size="small" />
            </div>
          )}
        </div>

        <div className="stepper-card--steps">
          {isMobile ? (
            <VerticalStepper {...stepperProps} />
          ) : (
            <HorizontalStepper {...stepperProps} />
          )}
        </div>
      </div>
    )
  )
}

export default OnboardingSteps
