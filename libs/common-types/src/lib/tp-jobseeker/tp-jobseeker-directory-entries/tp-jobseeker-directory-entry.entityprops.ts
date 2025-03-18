import { Field, ID, ObjectType } from '@nestjs/graphql'
import { EntityProps } from '../../base-interfaces-types-classes'
import {
  FederalState,
  ImmigrationStatus,
  TpDesiredPosition,
  TpEmploymentType,
  TpTechnicalSkill,
} from '../../common-objects'
import { TpAvailabilityOption } from '../../tp-common-objects'
import { TpJobseekerProfileEducationRecordEntityProps } from '../common-objects/tp-jobseeker-profile-education-record.entityprops'
import { TpJobseekerProfileExperienceRecordEntityProps } from '../common-objects/tp-jobseeker-profile-experience-record.entityprops'
import { TpJobseekerProfileLanguageRecordEntityProps } from '../common-objects/tp-jobseeker-profile-language-record.entityprops'
import { JobseekerProfileStatus } from '../enums'

@ObjectType('TpJobseekerDirectoryEntry')
export class TpJobseekerDirectoryEntryEntityProps implements EntityProps {
  @Field((type) => ID)
  id: string

  userId: string
  email: string
  loopbackUserId: string
  firstName: string
  lastName: string

  personalWebsite?: string
  githubUrl?: string
  linkedInUrl?: string
  twitterUrl?: string
  behanceUrl?: string
  stackOverflowUrl?: string
  dribbbleUrl?: string

  postalMailingAddress?: string
  telephoneNumber?: string

  genderPronouns?: string

  location?: string

  rediLocation?: string
  profileAvatarImageS3Key?: string
  @Field((type) => [TpDesiredPosition])
  desiredPositions?: Array<TpDesiredPosition>
  @Field((type) => [TpEmploymentType])
  desiredEmploymentType?: Array<TpEmploymentType>
  @Field((type) => TpAvailabilityOption)
  availability?: TpAvailabilityOption
  ifAvailabilityIsDate_date?: Date
  aboutYourself?: string
  @Field((type) => [TpTechnicalSkill])
  topSkills?: Array<TpTechnicalSkill>
  @Field((type) => JobseekerProfileStatus)
  state: JobseekerProfileStatus
  /**
   * Job Fair Boolean Field(s)
   * Uncomment & Rename (joins{Location}{Year}{Season}JobFair) the next field when there's an upcoming Job Fair
   * Duplicate if there are multiple Job Fairs coming
   */
  // joins25WinterTalentSummit?: boolean
  isProfileVisibleToCompanies: boolean
  @Field((type) => FederalState)
  federalState?: FederalState
  willingToRelocate: boolean
  @Field((type) => ImmigrationStatus)
  immigrationStatus?: ImmigrationStatus
  isSubscribedToTPMarketingEmails: boolean

  @Field((type) => [TpJobseekerProfileExperienceRecordEntityProps])
  experience?: Array<TpJobseekerProfileExperienceRecordEntityProps>
  @Field((type) => [TpJobseekerProfileEducationRecordEntityProps])
  education?: Array<TpJobseekerProfileEducationRecordEntityProps>

  @Field((type) => [TpJobseekerProfileLanguageRecordEntityProps])
  workingLanguages?: Array<TpJobseekerProfileLanguageRecordEntityProps>

  createdAt: Date
  updatedAt: Date

  // The next ones are computed fields in Salesforce
  fullName: string
}
