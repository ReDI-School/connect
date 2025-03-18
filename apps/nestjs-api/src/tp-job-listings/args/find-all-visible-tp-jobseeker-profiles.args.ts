import { ArgsType, Field, InputType } from '@nestjs/graphql'
import {
  FederalState,
  TpDesiredPosition,
  TpEmploymentType,
  TpTechnicalSkill,
} from '@talent-connect/common-types'

@ArgsType()
export class FindAllVisibleTpJobListingsArgs {
  filter: FindAllVisibleTpJobListingsArgsFilter
}

@InputType('FindAllVisibleTpJobListingsArgsFilter')
class FindAllVisibleTpJobListingsArgsFilter {
  @Field((type) => [TpDesiredPosition])
  relatesToPositions?: TpDesiredPosition[]

  @Field((type) => [TpTechnicalSkill])
  skills?: TpTechnicalSkill[]

  @Field((type) => [TpEmploymentType])
  employmentTypes?: TpEmploymentType[]

  @Field((type) => [FederalState])
  federalStates?: FederalState[]

  isRemotePossible?: boolean

  datePosted?: string

  /**
   * Job Fair Boolean Field(s)
   * Uncomment & Rename (joins{Location}{Year}{Season}JobFair) the next field when there's an upcoming Job Fair
   * Duplicate if there are multiple Job Fairs coming
   */
  // joins25WinterTalentSummit?: boolean
}
