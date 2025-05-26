import {
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material'
import StepConnector, {
  stepConnectorClasses,
} from '@mui/material/StepConnector'
import { styled } from '@mui/material/styles'
import { RediLocation } from '@talent-connect/data-access'
import { Content, Notification } from 'react-bulma-components'
import { CurrentStepType } from '../OnboardingSteps'
import { CustomStepIconFunction } from './HorizontalStepper'
import './VerticalStepper.scss'

const CustomStepConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.lineVertical}`]: {
      borderColor: '#84c5d2',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.lineVertical}`]: {
      borderColor: '#84c5d2',
    },
  },
  [`& .${stepConnectorClasses.lineVertical}`]: {
    borderColor: '#dadada',
    borderLeftWidth: 4,
    marginLeft: 2,
    minHeight: 32,
    marginTop: '-7px',
  },
}))

type Step = {
  name: string
  message: {
    mentee: (rediLocation: RediLocation) => React.ReactNode
    mentor: (rediLocation: RediLocation) => React.ReactNode
    corporateMentor?: React.ReactNode
  }
}

interface VerticalStepperProps {
  currentStep: CurrentStepType
  isMentor: boolean
  isCorporateMentor: boolean
  rediLocation: RediLocation
  customStepIcon: CustomStepIconFunction
  steps: Step[]
}

const VerticalStepper = ({
  currentStep,
  isMentor,
  isCorporateMentor,
  rediLocation,
  customStepIcon,
  steps,
}: VerticalStepperProps) => {
  return (
    <Stepper
      activeStep={currentStep}
      connector={<CustomStepConnector />}
      orientation="vertical"
    >
      {steps.map((step, index) => (
        <Step key={step.name} className="vertical--step">
          <StepLabel
            StepIconComponent={customStepIcon}
            sx={{
              padding: 0,
            }}
            className="vertical--label"
          >
            <Typography
              sx={{
                color: '#a0a0a0',
                fontSize: 12,
                fontFamily: 'Avenir LT Std',
              }}
            >
              {index === 3 ? 'Done!' : `Step ${index + 1}`}
            </Typography>
            {step.name}
          </StepLabel>
          <StepContent
            sx={{
              borderLeft: '4px solid #84c5d2',
              marginLeft: '14px',
              paddingRight: 0,
              marginTop: '-7px',
              '&.MuiStepContent-last': {
                borderLeft: 'none',
              },
            }}
          >
            <Notification className="vertical--message">
              {isMentor ? (
                <>
                  {isCorporateMentor &&
                  steps[currentStep].message.corporateMentor ? (
                    <Content size="small" renderAs="p">
                      {steps[currentStep].message.corporateMentor}
                    </Content>
                  ) : (
                    <Content size="small" renderAs="p">
                      {steps[currentStep].message.mentor(rediLocation)}
                    </Content>
                  )}
                </>
              ) : (
                <Content size="small" renderAs="p">
                  {steps[currentStep].message.mentee(rediLocation)}
                </Content>
              )}
            </Notification>
          </StepContent>
        </Step>
      ))}
    </Stepper>
  )
}

export default VerticalStepper
