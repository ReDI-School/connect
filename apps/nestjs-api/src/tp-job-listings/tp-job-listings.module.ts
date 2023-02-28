import { Module } from '@nestjs/common'
import {
  TpJobListingMapper,
  TpJobseekerProfileMapper,
} from '@talent-connect/common-types'
import { SfApiModule } from '../salesforce-api/sf-api.module'
import { TpJobListingsResolver } from './tp-job-listings.resolver'
import { TpJobListingsService } from './tp-job-listings.service'

@Module({
  providers: [
    TpJobListingMapper,
    TpJobListingsResolver,
    TpJobListingsService,
    TpJobseekerProfileMapper,
  ],
  imports: [SfApiModule],
  exports: [TpJobListingsService],
})
export class TpJobListingsModule {}