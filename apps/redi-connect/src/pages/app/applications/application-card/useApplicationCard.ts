import {
  AllConProfileFieldsFragment,
  MentorshipMatchStatus,
  UserType,
} from '@talent-connect/data-access'
import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { ChipVariant } from '../../../../../../../libs/shared-atomic-design-components/src/lib/atoms/Chip'
import { ApplicationCardApplicationPropFragment } from '../../../../components/organisms/ApplicationCard.generated'

interface ApplicationCardProps {
  application: ApplicationCardApplicationPropFragment
  currentUser: AllConProfileFieldsFragment
}

export const useApplicationCard = ({
  application,
  currentUser,
}: ApplicationCardProps) => {
  const history = useHistory()
  const [showDetails, setShowDetails] = useState<boolean>(false)
  const applicationDate = new Date(application.createdAt || '')
  const applicationUser =
    currentUser.userType === UserType.Mentee
      ? application.mentor
      : application.mentee
  const currentUserIsMentor = currentUser?.userType === UserType.Mentor

  const getChipVariant = (status: MentorshipMatchStatus): ChipVariant => {
    switch (status) {
      case MentorshipMatchStatus.Applied:
        return 'pending'
      case MentorshipMatchStatus.Accepted:
      case MentorshipMatchStatus.Completed:
        return 'default'
      case MentorshipMatchStatus.Cancelled:
      case MentorshipMatchStatus.DeclinedByMentor:
      case MentorshipMatchStatus.InvalidatedAsOtherMentorAccepted:
        return 'neutral'
      default:
        return 'default'
    }
  }

  const chipVariant = getChipVariant(application.status)

  return {
    history,
    showDetails,
    setShowDetails,
    applicationUser,
    applicationDate,
    currentUserIsMentor,
    chipVariant,
  }
}
