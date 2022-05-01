import * as Types from '@talent-connect/data-access';

import { useQuery, UseQueryOptions } from 'react-query';
import { fetcher } from '@talent-connect/data-access';
export type MyMatchesQueryVariables = Types.Exact<{
  status?: Types.InputMaybe<Types.MentorshipMatchStatus>;
}>;


export type MyMatchesQuery = { __typename?: 'Query', conMentorshipMatches: Array<{ __typename?: 'ConMentorshipMatch', id: string, applicationText?: string | null, expectationText?: string | null, mentee: { __typename?: 'ConProfile', id: string, firstName: string, lastName: string, languages?: Array<Types.ConnectProfileLanguage> | null, categories: Array<Types.MentoringTopic>, rediLocation: Types.RediLocation, profileAvatarImageS3Key?: string | null } }> };

export type FindMatchQueryVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type FindMatchQuery = { __typename?: 'Query', conMentorshipMatch: { __typename?: 'ConMentorshipMatch', id: string, applicationText?: string | null, expectationText?: string | null, status: Types.MentorshipMatchStatus, mentee: { __typename?: 'ConProfile', _contactId: string, id: string, firstName: string, lastName: string, languages?: Array<Types.ConnectProfileLanguage> | null, categories: Array<Types.MentoringTopic>, rediLocation: Types.RediLocation, profileAvatarImageS3Key?: string | null, email: string, telephoneNumber?: string | null, linkedInProfileUrl?: string | null, slackUsername?: string | null }, mentor: { __typename?: 'ConProfile', _contactId: string, id: string, firstName: string, lastName: string, languages?: Array<Types.ConnectProfileLanguage> | null, categories: Array<Types.MentoringTopic>, rediLocation: Types.RediLocation, profileAvatarImageS3Key?: string | null, email: string, telephoneNumber?: string | null, linkedInProfileUrl?: string | null, slackUsername?: string | null }, mentoringSessions: Array<{ __typename?: 'ConMentoringSession', id: string, date: any, minuteDuration: Types.MentoringSessionDuration }> } };

export type ConProfileFieldsFragment = { __typename?: 'ConProfile', _contactId: string, id: string, firstName: string, lastName: string, languages?: Array<Types.ConnectProfileLanguage> | null, categories: Array<Types.MentoringTopic>, rediLocation: Types.RediLocation, profileAvatarImageS3Key?: string | null, email: string, telephoneNumber?: string | null, linkedInProfileUrl?: string | null, slackUsername?: string | null };

export const ConProfileFieldsFragmentDoc = `
    fragment conProfileFields on ConProfile {
  _contactId
  id
  firstName
  lastName
  languages
  categories
  rediLocation
  profileAvatarImageS3Key
  email
  telephoneNumber
  linkedInProfileUrl
  slackUsername
}
    `;
export const MyMatchesDocument = `
    query myMatches($status: MentorshipMatchStatus) {
  conMentorshipMatches(status: $status) {
    id
    applicationText
    expectationText
    mentee {
      id
      firstName
      lastName
      languages
      categories
      rediLocation
      profileAvatarImageS3Key
    }
  }
}
    `;
export const useMyMatchesQuery = <
      TData = MyMatchesQuery,
      TError = unknown
    >(
      variables?: MyMatchesQueryVariables,
      options?: UseQueryOptions<MyMatchesQuery, TError, TData>
    ) =>
    useQuery<MyMatchesQuery, TError, TData>(
      variables === undefined ? ['myMatches'] : ['myMatches', variables],
      fetcher<MyMatchesQuery, MyMatchesQueryVariables>(MyMatchesDocument, variables),
      options
    );

useMyMatchesQuery.getKey = (variables?: MyMatchesQueryVariables) => variables === undefined ? ['myMatches'] : ['myMatches', variables];
;

export const FindMatchDocument = `
    query findMatch($id: ID!) {
  conMentorshipMatch(id: $id) {
    id
    applicationText
    expectationText
    status
    mentee {
      ...conProfileFields
    }
    mentor {
      ...conProfileFields
    }
    mentoringSessions {
      id
      date
      minuteDuration
    }
  }
}
    ${ConProfileFieldsFragmentDoc}`;
export const useFindMatchQuery = <
      TData = FindMatchQuery,
      TError = unknown
    >(
      variables: FindMatchQueryVariables,
      options?: UseQueryOptions<FindMatchQuery, TError, TData>
    ) =>
    useQuery<FindMatchQuery, TError, TData>(
      ['findMatch', variables],
      fetcher<FindMatchQuery, FindMatchQueryVariables>(FindMatchDocument, variables),
      options
    );

useFindMatchQuery.getKey = (variables: FindMatchQueryVariables) => ['findMatch', variables];
;