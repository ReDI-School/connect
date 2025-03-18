// THIS FILE IS GENERATED, DO NOT EDIT!
import * as Types from '@talent-connect/data-access';

import { AllTpJobseekerDirectoryEntryFieldsFragmentDoc } from '../jobseeker-profiles/tp-jobseeker-profile.fragment.generated';
import { useQuery, UseQueryOptions } from 'react-query';
import { fetcher } from '@talent-connect/data-access';
export type TpJobseekerDirectoryEntriesFindAllVisibleQueryVariables = Types.Exact<{
  input: Types.FindAllVisibleTpJobseekerDirectoryEntriesFilter;
}>;


export type TpJobseekerDirectoryEntriesFindAllVisibleQuery = { __typename?: 'Query', tpJobseekerDirectoryEntriesVisible: Array<{ __typename?: 'TpJobseekerDirectoryEntry', aboutYourself?: string | null, federalState?: Types.FederalState | null, firstName: string, fullName: string, genderPronouns?: string | null, githubUrl?: string | null, id: string, ifAvailabilityIsDate_date?: any | null, availability?: Types.TpAvailabilityOption | null, isProfileVisibleToCompanies: boolean, isSubscribedToTPMarketingEmails: boolean, lastName: string, linkedInUrl?: string | null, location?: string | null, loopbackUserId: string, personalWebsite?: string | null, postalMailingAddress?: string | null, profileAvatarImageS3Key?: string | null, rediLocation?: string | null, behanceUrl?: string | null, stackOverflowUrl?: string | null, state: Types.JobseekerProfileStatus, telephoneNumber?: string | null, topSkills?: Array<Types.TpTechnicalSkill> | null, twitterUrl?: string | null, updatedAt: any, userId: string, willingToRelocate: boolean, createdAt: any, desiredEmploymentType?: Array<Types.TpEmploymentType> | null, desiredPositions?: Array<Types.TpDesiredPosition> | null, dribbbleUrl?: string | null, email: string, immigrationStatus?: Types.ImmigrationStatus | null, experience?: Array<{ __typename?: 'TpJobseekerProfileExperienceRecord', city?: string | null, sortIndex: number, company?: string | null, country?: string | null, current?: boolean | null, description?: string | null, endDateMonth?: number | null, endDateYear?: number | null, startDateMonth?: number | null, startDateYear?: number | null, title?: string | null, createdAt: any, id: string, tpJobseekerProfileId: string, updatedAt: any, userId: string }> | null, workingLanguages?: Array<{ __typename?: 'TpJobseekerProfileLanguageRecord', id: string, userId: string, language: Types.Language, proficiencyLevelId: Types.LanguageProficiencyLevel }> | null, education?: Array<{ __typename?: 'TpJobseekerProfileEducationRecord', certificationType?: Types.TpEducationCertificationType | null, title?: string | null, sortIndex: number, current?: boolean | null, description?: string | null, endDateMonth?: number | null, endDateYear?: number | null, institutionCity?: string | null, institutionCountry?: string | null, institutionName?: string | null, startDateMonth?: number | null, startDateYear?: number | null, createdAt: any, id: string, tpJobseekerProfileId: string, updatedAt: any, userId: string }> | null }> };


export const TpJobseekerDirectoryEntriesFindAllVisibleDocument = `
    query tpJobseekerDirectoryEntriesFindAllVisible($input: FindAllVisibleTpJobseekerDirectoryEntriesFilter!) {
  tpJobseekerDirectoryEntriesVisible(filter: $input) {
    ...AllTpJobseekerDirectoryEntryFields
  }
}
    ${AllTpJobseekerDirectoryEntryFieldsFragmentDoc}`;
export const useTpJobseekerDirectoryEntriesFindAllVisibleQuery = <
      TData = TpJobseekerDirectoryEntriesFindAllVisibleQuery,
      TError = unknown
    >(
      variables: TpJobseekerDirectoryEntriesFindAllVisibleQueryVariables,
      options?: UseQueryOptions<TpJobseekerDirectoryEntriesFindAllVisibleQuery, TError, TData>
    ) =>
    useQuery<TpJobseekerDirectoryEntriesFindAllVisibleQuery, TError, TData>(
      ['tpJobseekerDirectoryEntriesFindAllVisible', variables],
      fetcher<TpJobseekerDirectoryEntriesFindAllVisibleQuery, TpJobseekerDirectoryEntriesFindAllVisibleQueryVariables>(TpJobseekerDirectoryEntriesFindAllVisibleDocument, variables),
      options
    );

useTpJobseekerDirectoryEntriesFindAllVisibleQuery.getKey = (variables: TpJobseekerDirectoryEntriesFindAllVisibleQueryVariables) => ['tpJobseekerDirectoryEntriesFindAllVisible', variables];
;
