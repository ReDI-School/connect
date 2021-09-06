import { useMutation, useQueryClient } from 'react-query'
import { updateCurrentUserTpJobListing } from '../services/api/api'

export function useTpJobListingUpdateMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation(updateCurrentUserTpJobListing, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(['allTpJobListings'])
      queryClient.invalidateQueries(['oneTpJobListing', data.id])
    },
  })
}
