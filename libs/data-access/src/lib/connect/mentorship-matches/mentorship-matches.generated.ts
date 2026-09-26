// THIS FILE IS GENERATED, DO NOT EDIT!
import * as Types from '@talent-connect/data-access';

import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from 'react-query';
import { fetcher } from '@talent-connect/data-access';
export type MyMatchesQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.FindMentorshipMatchesArgsFilter>;
}>;


export type MyMatchesQuery = { __typename?: 'Query', conMentorshipMatches: Array<{ __typename?: 'ConMentorshipMatch', id: string, applicationText?: string | null, expectationText?: string | null, mentorReplyMessageOnAccept?: string | null, hasMenteeDismissedMentorshipApplicationAcceptedNotification?: boolean | null, status: Types.MentorshipMatchStatus, createdAt: any, mentee: { __typename?: 'ConProfile', id: string, fullName: string, firstName: string, lastName: string, languages?: Array<Types.Language> | null, categories: Array<Types.MentoringTopic>, rediLocation: Types.RediLocation, profileAvatarImageS3Key?: string | null }, mentor: { __typename?: 'ConProfile', id: string, fullName: string, firstName: string, lastName: string, languages?: Array<Types.Language> | null, categories: Array<Types.MentoringTopic>, rediLocation: Types.RediLocation, profileAvatarImageS3Key?: string | null } }> };

export type FindMatchQueryVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type FindMatchQuery = { __typename?: 'Query', conMentorshipMatch: { __typename?: 'ConMentorshipMatch', id: string, applicationText?: string | null, expectationText?: string | null, status: Types.MentorshipMatchStatus, mentee: { __typename?: 'ConProfile', userId: string, id: string, fullName: string, firstName: string, lastName: string, email: string, languages?: Array<Types.Language> | null, categories: Array<Types.MentoringTopic>, rediLocation: Types.RediLocation, profileAvatarImageS3Key?: string | null, telephoneNumber?: string | null, linkedInProfileUrl?: string | null, slackUsername?: string | null }, mentor: { __typename?: 'ConProfile', userId: string, id: string, fullName: string, firstName: string, lastName: string, email: string, languages?: Array<Types.Language> | null, categories: Array<Types.MentoringTopic>, rediLocation: Types.RediLocation, profileAvatarImageS3Key?: string | null, telephoneNumber?: string | null, linkedInProfileUrl?: string | null, slackUsername?: string | null }, mentoringSessions: Array<{ __typename?: 'ConMentoringSession', id: string, date: any, minuteDuration: Types.MentoringSessionDuration, meetingNotes?: string | null }> } };

export type ConProfileFieldsFragment = { __typename?: 'ConProfile', userId: string, id: string, fullName: string, firstName: string, lastName: string, email: string, languages?: Array<Types.Language> | null, categories: Array<Types.MentoringTopic>, rediLocation: Types.RediLocation, profileAvatarImageS3Key?: string | null, telephoneNumber?: string | null, linkedInProfileUrl?: string | null, slackUsername?: string | null };

export type ConMatchMarkMentorshipAcceptedNotificationDismissedMutationVariables = Types.Exact<{
  id: Types.Scalars['String'];
}>;


export type ConMatchMarkMentorshipAcceptedNotificationDismissedMutation = { __typename?: 'Mutation', conMatchMarkMentorshipAcceptedNotificationDismissed: { __typename?: 'OkResponseMutationOutputDto', ok: boolean } };

export const ConProfileFieldsFragmentDoc = `
    fragment conProfileFields on ConProfile {
  userId
  id
  fullName
  firstName
  lastName
  email
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
    query myMatches($filter: FindMentorshipMatchesArgsFilter) {
  conMentorshipMatches(filter: $filter) {
    id
    applicationText
    expectationText
    mentee {
      id
      fullName
      firstName
      lastName
      languages
      categories
      rediLocation
      profileAvatarImageS3Key
    }
    mentor {
      id
      fullName
      firstName
      lastName
      languages
      categories
      rediLocation
      profileAvatarImageS3Key
    }
    mentorReplyMessageOnAccept
    hasMenteeDismissedMentorshipApplicationAcceptedNotification
    status
    createdAt
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
      meetingNotes
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

export const ConMatchMarkMentorshipAcceptedNotificationDismissedDocument = `
    mutation conMatchMarkMentorshipAcceptedNotificationDismissed($id: String!) {
  conMatchMarkMentorshipAcceptedNotificationDismissed(conMentorshipMatchId: $id) {
    ok
  }
}
    `;
export const useConMatchMarkMentorshipAcceptedNotificationDismissedMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ConMatchMarkMentorshipAcceptedNotificationDismissedMutation, TError, ConMatchMarkMentorshipAcceptedNotificationDismissedMutationVariables, TContext>) =>
    useMutation<ConMatchMarkMentorshipAcceptedNotificationDismissedMutation, TError, ConMatchMarkMentorshipAcceptedNotificationDismissedMutationVariables, TContext>(
      ['conMatchMarkMentorshipAcceptedNotificationDismissed'],
      (variables?: ConMatchMarkMentorshipAcceptedNotificationDismissedMutationVariables) => fetcher<ConMatchMarkMentorshipAcceptedNotificationDismissedMutation, ConMatchMarkMentorshipAcceptedNotificationDismissedMutationVariables>(ConMatchMarkMentorshipAcceptedNotificationDismissedDocument, variables)(),
      options
    );