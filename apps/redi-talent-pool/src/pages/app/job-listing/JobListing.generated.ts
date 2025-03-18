// THIS FILE IS GENERATED, DO NOT EDIT!
import * as Types from '@talent-connect/data-access';

import { AllTpJobListingFieldsFragmentDoc } from '../../../../../../libs/data-access/src/lib/tp/job-listings/tp-job-listing.fragment.generated';
import { AllTpCompanyProfileFieldsFragmentDoc } from '../../../../../../libs/data-access/src/lib/tp/company-profiles/tp-company-profile.fragment.generated';
import { AllUserContactFieldsFragmentDoc } from '../../../../../../libs/data-access/src/lib/common/user-contact.generated';
import { useQuery, UseQueryOptions } from 'react-query';
import { fetcher } from '@talent-connect/data-access';
export type FindOneJobListingQueryVariables = Types.Exact<{
  filter: Types.FindOneTpJobListingArgsFilter;
}>;


export type FindOneJobListingQuery = { __typename?: 'Query', tpJobListing: { __typename?: 'TpJobListing', createdAt: any, expiresAt?: any | null, status?: Types.TpJobListingStatus | null, title?: string | null, updatedAt: any, employmentType?: Types.TpEmploymentType | null, id: string, idealTechnicalSkills?: Array<Types.TpTechnicalSkill> | null, isRemotePossible?: boolean | null, languageRequirements?: string | null, location?: string | null, relatesToPositions?: Array<Types.TpDesiredPosition> | null, salaryRange?: string | null, summary?: string | null, companyProfileId: string, companyName: string, profileAvatarImageS3Key?: string | null, federalState?: Types.FederalState | null, contactFirstName?: string | null, contactLastName?: string | null, contactEmailAddress?: string | null, contactPhoneNumber?: string | null, isFromCareerPartner: boolean, companyProfile: { __typename?: 'TpCompanyProfile', id: string, profileAvatarImageS3Key?: string | null, companyName: string, location?: string | null, tagline?: string | null, industry?: string | null, website?: string | null, linkedInUrl?: string | null, telephoneNumber?: string | null, about?: string | null, state: Types.CompanyTalentPoolState, isProfileVisibleToJobseekers: boolean, isCareerPartner: boolean, createdAt: any, updatedAt: any, companyRepresentatives: Array<{ __typename?: 'UserContact', id: string, behanceUrl?: string | null, lastName: string, linkedInProfileUrl?: string | null, loopbackUserId: string, personalDescription?: string | null, personalWebsite?: string | null, postalMailingAddress?: string | null, slackUsername?: string | null, stackOverflowUrl?: string | null, telephoneNumber?: string | null, birthDate?: any | null, twitterUrl?: string | null, updatedAt: any, createdAt: any, dribbbleUrl?: string | null, email: string, firstName: string, gender?: Types.Gender | null, githubProfileUrl?: string | null, howDidHearAboutRediKey?: Types.FirstPointOfTpContactOption | null, howDidHearAboutRediOtherText?: string | null }> } } };


export const FindOneJobListingDocument = `
    query findOneJobListing($filter: FindOneTpJobListingArgsFilter!) {
  tpJobListing(filter: $filter) {
    ...AllTpJobListingFields
    companyProfile {
      ...AllTpCompanyProfileFields
      companyRepresentatives {
        ...AllUserContactFields
      }
    }
  }
}
    ${AllTpJobListingFieldsFragmentDoc}
${AllTpCompanyProfileFieldsFragmentDoc}
${AllUserContactFieldsFragmentDoc}`;
export const useFindOneJobListingQuery = <
      TData = FindOneJobListingQuery,
      TError = unknown
    >(
      variables: FindOneJobListingQueryVariables,
      options?: UseQueryOptions<FindOneJobListingQuery, TError, TData>
    ) =>
    useQuery<FindOneJobListingQuery, TError, TData>(
      ['findOneJobListing', variables],
      fetcher<FindOneJobListingQuery, FindOneJobListingQueryVariables>(FindOneJobListingDocument, variables),
      options
    );

useFindOneJobListingQuery.getKey = (variables: FindOneJobListingQueryVariables) => ['findOneJobListing', variables];
;
