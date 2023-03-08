import {
  InputType,
  IntersectionType,
  PartialType,
  PickType,
} from '@nestjs/graphql'
import { TpCompanyProfileEntityProps } from '@talent-connect/common-types'

@InputType({ isAbstract: true })
class _TpCompanyProfileEntityProps extends TpCompanyProfileEntityProps {}

@InputType('TpCompanyProfilePatchInput')
export class TpCompanyProfilePatchInput extends IntersectionType(
  PickType(_TpCompanyProfileEntityProps, ['id'] as const),
  PartialType(
    PickType(_TpCompanyProfileEntityProps, [
      // TODO: companies should not be able to change state directly - that should be done via a proper use case mutation
      'state',
      'about',
      'companyName',
      'industry',
      'isJobFair2023Participant',
      'isProfileVisibleToJobseekers',
      'linkedInUrl',
      'location',
      'phoneNumber',
      'profileAvatarImageS3Key',
      'tagline',
      'website',
    ] as const)
  )
) {}
