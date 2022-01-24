import { RedMatch } from './RedMatch'
import { RedMentoringSession } from './RedMentoringSession'
import { UserType } from './UserType'
import { SignupSource } from './SignupSource'
import { RediLocation } from './RediLocation'
import {
  CategoryKey,
  CourseKey,
  EducationLevelKey,
  GenderKey,
  Language,
  MenteeOccupationCategoryKey,
} from '@talent-connect/shared-config'
import { Timestamp } from './Timestamp';

export type RedProfile =
  Timestamp & {
  id: string
  userType: UserType
  rediLocation: RediLocation
  signupSource: SignupSource
  mentor_occupation: string
  mentor_workPlace: string
  expectations: string // Field was used in Mentor typeform, as of today 14.05.2019 not asked in sign-up flow
  mentor_ifTypeForm_submittedAt: Date
  mentee_ifTypeForm_preferredMentorSex: 'male' | 'female' | 'none'
  ifTypeForm_additionalComments: string
  mentee_currentCategory: 'student' | 'rediAlumnus'
  mentee_occupationCategoryId: MenteeOccupationCategoryKey // TODO: do TS magic to make this a union type
  mentee_occupationJob_placeOfEmployment: string
  mentee_occupationJob_position: string
  mentee_occupationStudent_studyPlace: string
  mentee_occupationStudent_studyName: string
  mentee_occupationLookingForJob_what: string
  mentee_occupationOther_description: string
  mentee_highestEducationLevel: EducationLevelKey
  mentee_currentlyEnrolledInCourse: CourseKey
  profileAvatarImageS3Key: string
  firstName: string
  lastName: string
  gender: GenderKey
  age: number
  birthDate: Date
  languages: Language[]
  otherLanguages: string
  personalDescription: string
  contactEmail: string
  linkedInProfileUrl: string
  githubProfileUrl: string
  slackUsername: string
  telephoneNumber: string
  categories: CategoryKey[]
  favouritedRedProfileIds: string[]
  optOutOfMenteesFromOtherRediLocation: boolean

  userActivated?: boolean
  userActivatedAt?: Date
  gaveGdprConsentAt: Date

  // Computed properties returned by loopback
  currentApplicantCount: number
  menteeCountCapacity: number
  currentMenteeCount: number
  currentFreeMenteeSpots: number
  numberOfPendingApplicationWithCurrentUser: number
  redMatchesWithCurrentUser: RedMatch[]
  redMentoringSessionsWithCurrentUser: RedMentoringSession[]
  ifUserIsMentee_hasActiveMentor: boolean
  ifUserIsMentee_activeMentor: RedProfile
}
