import { NotFoundException, UseGuards } from '@nestjs/common'
import { Query, ResolveField, Resolver } from '@nestjs/graphql'
import {
  TpCompanyRepresentativeRelationshipEntityProps,
  TpCompanyRepresentativeRelationshipStatus,
  TpJobListingEntityProps,
  TpJobseekerDirectoryEntryEntityProps,
  UserContactEntityProps,
} from '@talent-connect/common-types'
import { CurrentUser } from '../auth/current-user.decorator'
import { CurrentUserInfo } from '../auth/current-user.interface'
import { GqlJwtAuthGuard } from '../auth/gql-jwt-auth.guard'
import { TpCompanyRepresentativeRelationshipsService } from '../tp-company-profiles/tp-company-representative-relationships.service'
import { TpJobListingsService } from '../tp-job-listings/tp-job-listings.service'
import { TpJobseekerDirectoryEntriesService } from '../tp-jobseeker-directory-entries/tp-jobseeker-directory-entries.service'
import { TpCurrentUserData } from './dto/find-current-user-data.dto'
@UseGuards(GqlJwtAuthGuard)
@Resolver(() => TpCurrentUserData)
export class TpCurrentUserDataResolver {
  constructor(
    private readonly tpCompanyRepresentativeRelationshipsService: TpCompanyRepresentativeRelationshipsService,
    private readonly jobseekerDirectoryEntriesService: TpJobseekerDirectoryEntriesService,
    private readonly jobListingsService: TpJobListingsService
  ) {}

  @Query(() => TpCurrentUserData, { name: 'tpCurrentUserDataGet' })
  async getCurrentUserData() {
    return new TpCurrentUserData()
  }

  @ResolveField(() => TpCompanyRepresentativeRelationshipEntityProps)
  async representedCompany(@CurrentUser() currentUser: CurrentUserInfo) {
    try {
      const entity =
        await this.tpCompanyRepresentativeRelationshipsService.findCompanyRepresentedByUser(
          currentUser.userId
        )
      return entity.props
    } catch (err) {
      if (err instanceof NotFoundException) return null
      else throw err
    }
  }

  @ResolveField((of) => TpCompanyRepresentativeRelationshipEntityProps)
  async companyRepresentativeRelationship(
    @CurrentUser() currentUser: CurrentUserInfo
  ) {
    try {
      const entity =
        await this.tpCompanyRepresentativeRelationshipsService.findCompanyRepresentativeRelationshipByUser(
          currentUser.userId
        )
      return entity.props
    } catch (err) {
      if (err instanceof NotFoundException) return null
      else throw err
    }
  }

  @ResolveField((of) => TpJobseekerDirectoryEntryEntityProps)
  async tpJobseekerDirectoryEntry(@CurrentUser() currentUser: CurrentUserInfo) {
    try {
      const entity =
        await this.jobseekerDirectoryEntriesService.findOneByUserId(
          currentUser.userId
        )
      return entity.props
    } catch (err) {
      if (err instanceof NotFoundException) return null
      else throw err
    }
  }

  @ResolveField((of) => [TpJobListingEntityProps])
  async jobListings(@CurrentUser() currentUser: CurrentUserInfo) {
    const [representativeRelationship, companyProfile] = await Promise.all([
      this.companyRepresentativeRelationship(currentUser),
      this.representedCompany(currentUser),
    ])
    if (!representativeRelationship || !companyProfile) return []
    if (
      representativeRelationship.status ===
      TpCompanyRepresentativeRelationshipStatus.APPROVED
    ) {
      const jobListings =
        await this.jobListingsService.findAllBelongingToCompany(
          companyProfile.id
        )
      const props = jobListings.map((jobListing) => jobListing.props)

      return props
    }
  }

  @ResolveField((of) => UserContactEntityProps)
  async userContact(@CurrentUser() currentUser: CurrentUserInfo) {
    return currentUser.userProps
  }

  @ResolveField((of) => String)
  async dummyField() {
    return 'test'
  }
}
