import { Injectable, NotFoundException } from '@nestjs/common'
import {
  ConProfileEntity,
  ConProfileMapper,
  ConnectProfileStatus,
  UserType,
} from '@talent-connect/common-types'
import { getRediLocationMatchingPool } from '@talent-connect/shared-config'
import { deleteUndefinedProperties } from '@talent-connect/shared-utils'
import { groupBy } from 'lodash'
import { CurrentUserInfo } from '../auth/current-user.interface'
import { SfApiConProfilesService } from '../salesforce-api/sf-api-con-profiles.service'
import { FindConProfilesArgs } from './args/find-con-profiles.args'
import { ConProfileSignUpInput } from './dtos/con-profile-sign-up.entityinput'
import { PatchConProfileInput } from './dtos/patch-con-profile.entityinput'

@Injectable()
export class ConProfilesService {
  constructor(
    private readonly api: SfApiConProfilesService,
    private readonly mapper: ConProfileMapper
  ) {}

  async signUp(
    input: ConProfileSignUpInput,
    user: CurrentUserInfo
  ): Promise<string> {
    return await this.api.createConProfileForSignUp({
      userId: user.userId,
      loopbackUserId: user.loopbackUserId,
      profileStatus: ConnectProfileStatus.DRAFTING_PROFILE,
      rediLocation: input.rediLocation,
      userType: input.userType,
      menteeCountCapacity: input.userType === UserType.MENTOR ? 1 : 0,
      mentor_isPartnershipMentor: input.mentor_isPartnershipMentor,
      mentor_workPlace: input.mentor_workPlace,
    })
  }

  async findAll(filter: any = {}) {
    const persistedRecords = await this.api.getAllConProfiles(filter)

    let entities: ConProfileEntity[] = persistedRecords.map((source) =>
      this.mapper.fromPersistence(source)
    )

    entities = this.selectLatestActiveProfilePerUser(entities)

    return entities
  }

  selectLatestActiveProfilePerUser(profiles: ConProfileEntity[]) {
    const groupedProfiles = groupBy(profiles, (profile) => profile.props.userId)
    const selectedProfiles: ConProfileEntity[] = []

    for (const key in groupedProfiles) {
      const profileGroup = groupedProfiles[key].sort(
        (a, b) =>
          new Date(b.props.createdAt).getTime() -
          new Date(a.props.createdAt).getTime()
      )

      const selectedProfile =
        profileGroup.find(
          (profile) =>
            profile.props.profileStatus !== ConnectProfileStatus.DEACTIVATED
        ) || profileGroup[0]

      selectedProfiles.push(selectedProfile)
    }

    return selectedProfiles
  }

  async findAllAvailableMentors(
    _filter: FindConProfilesArgs,
    currentUser: CurrentUserInfo
  ) {
    const currentUserConProfile = await this.findOneByLoopbackUserId(
      currentUser.loopbackUserId
    )

    const filter: any = {
      'RecordType.DeveloperName': UserType.MENTOR,
      Available_Mentorship_Slots__c: { $gte: 1 },
      Profile_Status__c: ConnectProfileStatus.APPROVED,
    }
    if (_filter.filter.name)
      filter['Contact__r.Name'] = { $like: `%${_filter.filter.name}%` }
    if (_filter.filter.categories?.length > 0)
      filter.Mentoring_Topics__c = { $includes: _filter.filter.categories }
    if (_filter.filter.languages?.length > 0)
      filter.Languages__c = { $includes: _filter.filter.languages }

    const matchingPool = getRediLocationMatchingPool(
      currentUserConProfile.props.rediLocation
    )
    if (!matchingPool) {
      throw new Error(
        'ConProfilesService:findAllAvailableMentors(): ' +
          "Couldn't categorize current user's Connect " +
          'profile into a ReDI location matching pool.'
      )
    }

    const requestedLocations =
      _filter.filter.locations?.length > 0
        ? _filter.filter.locations
        : matchingPool
    const allowedLocations = requestedLocations.filter((location) =>
      (matchingPool as readonly string[]).includes(location)
    )
    if (allowedLocations.length === 0) return []

    filter.ReDI_Location__c = {
      $in: allowedLocations,
    }

    return this.findAll(filter)
  }

  async findOneById(id: string) {
    const entities = await this.findAll({
      Id: id,
    })
    if (entities.length > 0) {
      return entities[0]
    } else {
      throw new NotFoundException('ConProfile not found with id: ' + id)
    }
  }

  async findOne(filter: any = {}) {
    const entities = await this.findAll(filter)
    if (entities.length > 0) {
      return entities[0]
    } else {
      throw new NotFoundException(
        'ConProfile not found with filter: ' + JSON.stringify(filter)
      )
    }
  }

  async findOneByLoopbackUserId(loopbackUserId: string) {
    const entities = await this.findAll({
      'Contact__r.Loopback_User_ID__c': loopbackUserId,
    })
    if (entities.length > 0) {
      return entities[0]
    } else {
      throw new NotFoundException('ConProfile not found')
    }
  }

  async patch(
    updateConProfileInput: PatchConProfileInput,
    currentUser: CurrentUserInfo
  ) {
    const existingEntity = await this.findOneByLoopbackUserId(
      currentUser.loopbackUserId
    )
    const props = existingEntity.props
    const updatesSanitized = deleteUndefinedProperties(updateConProfileInput)
    Object.entries(updatesSanitized).forEach(([key, value]) => {
      props[key] = value
    })
    const entityToPersist = ConProfileEntity.create(props)

    return this.update(entityToPersist)
  }

  async update(entity: ConProfileEntity) {
    const persistedObject = await this.api.updateConProfile(
      this.mapper.toPersistence(entity)
    )
    const updatedEntity = this.mapper.fromPersistence(persistedObject)

    return updatedEntity
  }

  async submitForReview(currentUser: CurrentUserInfo) {
    const existingEntity = await this.findOneByLoopbackUserId(
      currentUser.loopbackUserId
    )
    const props = existingEntity.props

    if (
      existingEntity.props.profileStatus ===
      ConnectProfileStatus.DRAFTING_PROFILE
    ) {
      props.profileStatus = ConnectProfileStatus.SUBMITTED_FOR_REVIEW
    }

    const entityToPersist = ConProfileEntity.create(props)

    return this.update(entityToPersist)
  }
}
