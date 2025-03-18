// THIS FILE IS GENERATED, DO NOT EDIT!
import * as Types from '@talent-connect/data-access';

import { AllTpJobseekerProfileExperienceRecordFieldsFragmentDoc } from './experience-records/tp-jobseeker-profile-experience-record.fragment.generated';
import { AllTpJobseekerProfileLanguageRecordFieldsFragmentDoc } from './language-records/tp-jobseeker-profile-language-record.fragment.generated';
import { AllTpJobseekerProfileEducationRecordFieldsFragmentDoc } from './education-records/tp-jobseeker-profile-education-record.fragment.generated';
export type AllTpJobseekerDirectoryEntryFieldsFragment = { __typename?: 'TpJobseekerDirectoryEntry', aboutYourself?: string | null, federalState?: Types.FederalState | null, firstName: string, fullName: string, genderPronouns?: string | null, githubUrl?: string | null, id: string, ifAvailabilityIsDate_date?: any | null, availability?: Types.TpAvailabilityOption | null, isProfileVisibleToCompanies: boolean, isSubscribedToTPMarketingEmails: boolean, lastName: string, linkedInUrl?: string | null, location?: string | null, loopbackUserId: string, personalWebsite?: string | null, postalMailingAddress?: string | null, profileAvatarImageS3Key?: string | null, rediLocation?: string | null, behanceUrl?: string | null, stackOverflowUrl?: string | null, state: Types.JobseekerProfileStatus, telephoneNumber?: string | null, topSkills?: Array<Types.TpTechnicalSkill> | null, twitterUrl?: string | null, updatedAt: any, userId: string, willingToRelocate: boolean, createdAt: any, desiredEmploymentType?: Array<Types.TpEmploymentType> | null, desiredPositions?: Array<Types.TpDesiredPosition> | null, dribbbleUrl?: string | null, email: string, immigrationStatus?: Types.ImmigrationStatus | null, experience?: Array<{ __typename?: 'TpJobseekerProfileExperienceRecord', city?: string | null, sortIndex: number, company?: string | null, country?: string | null, current?: boolean | null, description?: string | null, endDateMonth?: number | null, endDateYear?: number | null, startDateMonth?: number | null, startDateYear?: number | null, title?: string | null, createdAt: any, id: string, tpJobseekerProfileId: string, updatedAt: any, userId: string }> | null, workingLanguages?: Array<{ __typename?: 'TpJobseekerProfileLanguageRecord', id: string, userId: string, language: Types.Language, proficiencyLevelId: Types.LanguageProficiencyLevel }> | null, education?: Array<{ __typename?: 'TpJobseekerProfileEducationRecord', certificationType?: Types.TpEducationCertificationType | null, title?: string | null, sortIndex: number, current?: boolean | null, description?: string | null, endDateMonth?: number | null, endDateYear?: number | null, institutionCity?: string | null, institutionCountry?: string | null, institutionName?: string | null, startDateMonth?: number | null, startDateYear?: number | null, createdAt: any, id: string, tpJobseekerProfileId: string, updatedAt: any, userId: string }> | null };

export const AllTpJobseekerDirectoryEntryFieldsFragmentDoc = `
    fragment AllTpJobseekerDirectoryEntryFields on TpJobseekerDirectoryEntry {
  aboutYourself
  experience {
    ...AllTpJobseekerProfileExperienceRecordFields
  }
  federalState
  firstName
  fullName
  genderPronouns
  githubUrl
  id
  ifAvailabilityIsDate_date
  availability
  isProfileVisibleToCompanies
  isSubscribedToTPMarketingEmails
  lastName
  linkedInUrl
  location
  loopbackUserId
  personalWebsite
  postalMailingAddress
  profileAvatarImageS3Key
  rediLocation
  behanceUrl
  stackOverflowUrl
  state
  telephoneNumber
  topSkills
  twitterUrl
  updatedAt
  userId
  willingToRelocate
  workingLanguages {
    ...AllTpJobseekerProfileLanguageRecordFields
  }
  createdAt
  desiredEmploymentType
  desiredPositions
  dribbbleUrl
  education {
    ...AllTpJobseekerProfileEducationRecordFields
  }
  email
  immigrationStatus
}
    ${AllTpJobseekerProfileExperienceRecordFieldsFragmentDoc}
${AllTpJobseekerProfileLanguageRecordFieldsFragmentDoc}
${AllTpJobseekerProfileEducationRecordFieldsFragmentDoc}`;