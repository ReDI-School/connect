// THIS FILE IS GENERATED, DO NOT EDIT!
import * as Types from '@talent-connect/data-access';

import { AllCompanyRepresentativeRelationshipFieldsFragmentDoc } from '../company-representative-relationship/company-representative-relationship.fragment.generated';
import { AllTpCompanyProfileFieldsFragmentDoc } from '../company-profiles/tp-company-profile.fragment.generated';
import { AllTpJobseekerDirectoryEntryFieldsFragmentDoc } from '../jobseeker-profiles/tp-jobseeker-profile.fragment.generated';
import { AllTpJobListingFieldsFragmentDoc } from '../job-listings/tp-job-listing.fragment.generated';
import { AllUserContactFieldsFragmentDoc } from '../../common/user-contact.generated';
import { useQuery, UseQueryOptions } from 'react-query';
import { fetcher } from '@talent-connect/data-access';
export type MyTpDataQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type MyTpDataQuery = { __typename?: 'Query', tpCurrentUserDataGet: { __typename?: 'TpCurrentUserData', companyRepresentativeRelationship?: { __typename?: 'TpCompanyRepresentativeRelationship', id: string, tpCompanyProfileId: string, userId: string, status: Types.TpCompanyRepresentativeRelationshipStatus, createdAt: any, updatedAt: any } | null, representedCompany?: { __typename?: 'TpCompanyProfile', id: string, profileAvatarImageS3Key?: string | null, companyName: string, location?: string | null, tagline?: string | null, industry?: string | null, website?: string | null, linkedInUrl?: string | null, telephoneNumber?: string | null, about?: string | null, state: Types.CompanyTalentPoolState, isProfileVisibleToJobseekers: boolean, isCareerPartner: boolean, createdAt: any, updatedAt: any } | null, tpJobseekerDirectoryEntry?: { __typename?: 'TpJobseekerDirectoryEntry', aboutYourself?: string | null, federalState?: Types.FederalState | null, firstName: string, fullName: string, genderPronouns?: string | null, githubUrl?: string | null, id: string, ifAvailabilityIsDate_date?: any | null, availability?: Types.TpAvailabilityOption | null, isProfileVisibleToCompanies: boolean, isSubscribedToTPMarketingEmails: boolean, lastName: string, linkedInUrl?: string | null, location?: string | null, loopbackUserId: string, personalWebsite?: string | null, postalMailingAddress?: string | null, profileAvatarImageS3Key?: string | null, rediLocation?: string | null, behanceUrl?: string | null, stackOverflowUrl?: string | null, state: Types.JobseekerProfileStatus, telephoneNumber?: string | null, topSkills?: Array<Types.TpTechnicalSkill> | null, twitterUrl?: string | null, updatedAt: any, userId: string, willingToRelocate: boolean, createdAt: any, desiredEmploymentType?: Array<Types.TpEmploymentType> | null, desiredPositions?: Array<Types.TpDesiredPosition> | null, dribbbleUrl?: string | null, email: string, immigrationStatus?: Types.ImmigrationStatus | null, experience?: Array<{ __typename?: 'TpJobseekerProfileExperienceRecord', city?: string | null, sortIndex: number, company?: string | null, country?: string | null, current?: boolean | null, description?: string | null, endDateMonth?: number | null, endDateYear?: number | null, startDateMonth?: number | null, startDateYear?: number | null, title?: string | null, createdAt: any, id: string, tpJobseekerProfileId: string, updatedAt: any, userId: string }> | null, workingLanguages?: Array<{ __typename?: 'TpJobseekerProfileLanguageRecord', id: string, userId: string, language: Types.Language, proficiencyLevelId: Types.LanguageProficiencyLevel }> | null, education?: Array<{ __typename?: 'TpJobseekerProfileEducationRecord', certificationType?: Types.TpEducationCertificationType | null, title?: string | null, sortIndex: number, current?: boolean | null, description?: string | null, endDateMonth?: number | null, endDateYear?: number | null, institutionCity?: string | null, institutionCountry?: string | null, institutionName?: string | null, startDateMonth?: number | null, startDateYear?: number | null, createdAt: any, id: string, tpJobseekerProfileId: string, updatedAt: any, userId: string }> | null } | null, jobListings?: Array<{ __typename?: 'TpJobListing', createdAt: any, expiresAt?: any | null, status?: Types.TpJobListingStatus | null, title?: string | null, updatedAt: any, employmentType?: Types.TpEmploymentType | null, id: string, idealTechnicalSkills?: Array<Types.TpTechnicalSkill> | null, isRemotePossible?: boolean | null, languageRequirements?: string | null, location?: string | null, relatesToPositions?: Array<Types.TpDesiredPosition> | null, salaryRange?: string | null, summary?: string | null, companyProfileId: string, companyName: string, profileAvatarImageS3Key?: string | null, federalState?: Types.FederalState | null, contactFirstName?: string | null, contactLastName?: string | null, contactEmailAddress?: string | null, contactPhoneNumber?: string | null, isFromCareerPartner: boolean }> | null, userContact: { __typename?: 'UserContact', id: string, behanceUrl?: string | null, lastName: string, linkedInProfileUrl?: string | null, loopbackUserId: string, personalDescription?: string | null, personalWebsite?: string | null, postalMailingAddress?: string | null, slackUsername?: string | null, stackOverflowUrl?: string | null, telephoneNumber?: string | null, birthDate?: any | null, twitterUrl?: string | null, updatedAt: any, createdAt: any, dribbbleUrl?: string | null, email: string, firstName: string, gender?: Types.Gender | null, githubProfileUrl?: string | null, howDidHearAboutRediKey?: Types.FirstPointOfTpContactOption | null, howDidHearAboutRediOtherText?: string | null } } };


export const MyTpDataDocument = `
    query myTpData {
  tpCurrentUserDataGet {
    companyRepresentativeRelationship {
      ...AllCompanyRepresentativeRelationshipFields
    }
    representedCompany {
      ...AllTpCompanyProfileFields
    }
    tpJobseekerDirectoryEntry {
      ...AllTpJobseekerDirectoryEntryFields
    }
    jobListings {
      ...AllTpJobListingFields
    }
    userContact {
      ...AllUserContactFields
    }
  }
}
    ${AllCompanyRepresentativeRelationshipFieldsFragmentDoc}
${AllTpCompanyProfileFieldsFragmentDoc}
${AllTpJobseekerDirectoryEntryFieldsFragmentDoc}
${AllTpJobListingFieldsFragmentDoc}
${AllUserContactFieldsFragmentDoc}`;
export const useMyTpDataQuery = <
      TData = MyTpDataQuery,
      TError = unknown
    >(
      variables?: MyTpDataQueryVariables,
      options?: UseQueryOptions<MyTpDataQuery, TError, TData>
    ) =>
    useQuery<MyTpDataQuery, TError, TData>(
      variables === undefined ? ['myTpData'] : ['myTpData', variables],
      fetcher<MyTpDataQuery, MyTpDataQueryVariables>(MyTpDataDocument, variables),
      options
    );

useMyTpDataQuery.getKey = (variables?: MyTpDataQueryVariables) => variables === undefined ? ['myTpData'] : ['myTpData', variables];
;
