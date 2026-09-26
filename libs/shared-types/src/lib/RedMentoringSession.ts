import { MentoringSessionDurationOption } from '@talent-connect/shared-config'
import { RedProfile } from './RedProfile'

export type RedMentoringSession = {
  id?: string
  mentor?: RedProfile
  mentee?: RedProfile
  mentorId?: string
  menteeId?: string
  date: Date
  minuteDuration: MentoringSessionDurationOption
  meetingNotes?: string
}
