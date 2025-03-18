import { InputType, PartialType, PickType } from '@nestjs/graphql'
import { TpJobseekerProfileEntityProps } from '@talent-connect/common-types'

@InputType({ isAbstract: true })
class _TpJobseekerProfileEntityProps extends TpJobseekerProfileEntityProps {}

@InputType('TpJobseekerProfilePatchInput')
export class TpJobseekerProfilePatchInput extends PartialType(
  PickType(_TpJobseekerProfileEntityProps, [
    'aboutYourself',
    'availability',
    'desiredEmploymentType',
    'desiredPositions',
    'federalState',
    'ifAvailabilityIsDate_date',
    /**
     * Job Fair Boolean Field(s)
     * Uncomment & Rename (joins{Location}{Year}{Season}JobFair) the next field when there's an upcoming Job Fair
     * Duplicate if there are multiple Job Fairs coming
     */
    // 'joins25WinterTalentSummit',
    'isProfileVisibleToCompanies',
    'location',
    'profileAvatarImageS3Key',
    'rediLocation',
    'state',
    'topSkills',
    'willingToRelocate',
    'immigrationStatus',
    'isSubscribedToTPMarketingEmails',
  ] as const)
) {}
