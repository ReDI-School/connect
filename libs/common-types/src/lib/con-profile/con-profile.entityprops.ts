import { Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { EntityProps } from '../base-interfaces-types-classes'
import { ConMentoringSessionEntityProps } from '../con-mentoring-session'
import {
  ConnectProfileLanguage,
  EducationLevel,
  OccupationCategory,
  RediCourse,
  RediLocation,
  UserType,
} from './enums'
import { Gender } from './enums/gender.enum'
import { MentoringTopic } from './enums/mentoring-topic.enum'

@ObjectType('ConProfile')
export class ConProfileEntityProps implements EntityProps {
  @Field((type) => ID)
  id: string
  _contactId: string
  @Field((type) => UserType)
  userType: UserType
  @Field((type) => RediLocation)
  rediLocation: RediLocation
  mentor_occupation?: string
  mentor_workPlace?: string
  expectations?: string
  @Field((type) => OccupationCategory)
  mentee_occupationCategoryId?: OccupationCategory
  mentee_occupationJob_placeOfEmployment?: string
  mentee_occupationJob_position?: string
  mentee_occupationStudent_studyPlace?: string
  mentee_occupationStudent_studyName?: string
  mentee_occupationLookingForJob_what?: string
  mentee_occupationOther_description?: string
  @Field((type) => EducationLevel)
  mentee_highestEducationLevel?: EducationLevel
  @Field((type) => RediCourse)
  mentee_currentlyEnrolledInCourse: RediCourse
  profileAvatarImageS3Key?: string
  firstName: string
  lastName: string
  @Field((type) => Gender)
  gender?: Gender
  birthDate?: Date
  @Field((type) => [ConnectProfileLanguage])
  languages?: Array<ConnectProfileLanguage>
  personalDescription?: string
  linkedInProfileUrl?: string
  githubProfileUrl?: string
  slackUsername?: string
  telephoneNumber?: string
  @Field((type) => [MentoringTopic])
  categories: Array<MentoringTopic>
  // favouritedRedProfileIds: Array<string> //! REPLACED BY NEW JUNCTION OBJECT
  optOutOfMenteesFromOtherRediLocation: boolean
  @Field((type) => [ConMentoringSessionEntityProps])
  mentoringSessions: ConMentoringSessionEntityProps[]
  loopbackUserId: string
  createdAt: Date
  updatedAt: Date
  // userActivated?: boolean //! REINSTATE, COMPLEX CASE
  userActivatedAt?: Date
}
