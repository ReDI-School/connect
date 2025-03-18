import { ArgsType, Field, InputType } from '@nestjs/graphql'
import {
  FederalState,
  Language,
  TpDesiredPosition,
  TpEmploymentType,
  TpTechnicalSkill,
} from '@talent-connect/common-types'

@ArgsType()
export class FindAllVisibleTpJobseekerDirectoryEntriesArgs {
  filter: FindAllVisibleTpJobseekerDirectoryEntriesFilter
}

@InputType('FindAllVisibleTpJobseekerDirectoryEntriesFilter')
class FindAllVisibleTpJobseekerDirectoryEntriesFilter {
  name?: string
  @Field((type) => [Language])
  desiredLanguages?: Language[]
  @Field((type) => [TpDesiredPosition])
  desiredPositions?: TpDesiredPosition[]
  @Field((type) => [TpEmploymentType])
  employmentTypes?: TpEmploymentType[]
  @Field((type) => [TpTechnicalSkill])
  skills?: TpTechnicalSkill[]
  @Field((type) => [FederalState])
  federalStates?: FederalState[]

  /**
   * Job Fair Boolean Field(s)
   * Uncomment & Rename (joins{Location}{Year}{Season}JobFair) the next field when there's an upcoming Job Fair
   * Duplicate if there are multiple Job Fairs coming
   */
  // joins25WinterTalentSummit?: boolean
}
