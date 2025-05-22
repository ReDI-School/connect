// THIS FILE IS GENERATED, DO NOT EDIT!
import * as Types from '@talent-connect/data-access'

import { fetcher } from '@talent-connect/data-access'
import { useQuery, UseQueryOptions } from 'react-query'
import { AllConProfileFieldsFragmentDoc } from '../../../../../../../libs/data-access/src/lib/connect/con-profiles/con-profile.fragment.generated'
export type ProfilePageQueryQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']
}>

export type ProfilePageQueryQuery = {
  __typename?: 'Query'
  conProfile: {
    __typename?: 'ConProfile'
    userId: string
    age?: number | null
    birthDate?: any | null
    categories: Array<Types.MentoringTopic>
    createdAt: any
    doesNotHaveAvailableMentorshipSlot: boolean
    email: string
    expectations?: string | null
    firstName: string
    fullName: string
    gender?: Types.Gender | null
    githubProfileUrl?: string | null
    id: string
    languages?: Array<Types.Language> | null
    lastName: string
    linkedInProfileUrl?: string | null
    loopbackUserId: string
    menteeCountCapacity?: number | null
    mentee_highestEducationLevel?: Types.EducationLevel | null
    mentee_occupationCategoryId?: Types.OccupationCategory | null
    mentee_occupationJob_placeOfEmployment?: string | null
    mentee_occupationJob_position?: string | null
    mentee_occupationLookingForJob_what?: string | null
    mentee_occupationOther_description?: string | null
    mentee_occupationStudent_studyName?: string | null
    mentee_occupationStudent_studyPlace?: string | null
    mentor_isPartnershipMentor?: boolean | null
    mentor_occupation?: string | null
    mentor_workPlace?: string | null
    optOutOfMenteesFromOtherRediLocation: boolean
    personalDescription?: string | null
    profileAvatarImageS3Key?: string | null
    profileStatus: Types.ConnectProfileStatus
    rediLocation: Types.RediLocation
    slackUsername?: string | null
    telephoneNumber?: string | null
    updatedAt: any
    userActivatedAt?: any | null
    userType: Types.UserType
    isSubscribedToCONMarketingEmails: boolean
  }
}

export const ProfilePageQueryDocument = `
    query ProfilePageQuery($id: ID!) {
  conProfile(id: $id) {
    ...AllConProfileFields
  }
}
    ${AllConProfileFieldsFragmentDoc}`
export const useProfilePageQueryQuery = <
  TData = ProfilePageQueryQuery,
  TError = unknown
>(
  variables: ProfilePageQueryQueryVariables,
  options?: UseQueryOptions<ProfilePageQueryQuery, TError, TData>
) =>
  useQuery<ProfilePageQueryQuery, TError, TData>(
    ['ProfilePageQuery', variables],
    fetcher<ProfilePageQueryQuery, ProfilePageQueryQueryVariables>(
      ProfilePageQueryDocument,
      variables
    ),
    options
  )

useProfilePageQueryQuery.getKey = (
  variables: ProfilePageQueryQueryVariables
) => ['ProfilePageQuery', variables]
