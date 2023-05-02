import { Injectable, NotFoundException } from '@nestjs/common'
import {
  TpCompanyProfileEntity,
  TpCompanyProfileMapper,
} from '@talent-connect/common-types'
import { deleteUndefinedProperties } from '@talent-connect/shared-utils'
import { CurrentUserInfo } from '../auth/current-user.interface'
import { SfApiTpCompanyProfilesService } from '../salesforce-api/sf-api-tp-company-profiles.service'
import { TpCompanyProfilePatchInput } from './dtos/tp-company-profile-patch.entityinput'

@Injectable()
export class TpCompanyProfilesService {
  constructor(
    private readonly sfService: SfApiTpCompanyProfilesService,
    private readonly mapper: TpCompanyProfileMapper
  ) {}

  async findAll(filter: any = {}) {
    const records = await this.sfService.getAllTpEnabledAccounts(filter)

    const entities: TpCompanyProfileEntity[] = records.map((source) =>
      this.mapper.fromPersistence(source)
    )

    return entities
  }

  async findOneById(id: string) {
    const entities = await this.findAll({
      Id: id,
    })
    if (entities.length > 0) {
      return entities[0]
    } else {
      throw new NotFoundException('TpCompanyProfile not found')
    }
  }

  async patch(
    updateTpCompanyProfileInput: TpCompanyProfilePatchInput,
    currentUser: CurrentUserInfo
  ) {
    const existingEntity = await this.findCompanyRepresentedByUser(
      currentUser.userId
    )
    const props = existingEntity.props
    const updatesSanitized = deleteUndefinedProperties(
      updateTpCompanyProfileInput
    )
    Object.entries(updatesSanitized).forEach(([key, value]) => {
      props[key] = value
    })
    const entityToPersist = TpCompanyProfileEntity.create(props)
    await this.sfService.updateTpCompanyProfile(
      this.mapper.toPersistence(entityToPersist)
    )
  }

  // TODO: this same method exists in TpCompanyRepresentativesService.
  // We can't use that class as a dependency here because it would
  // create a circular dependency. Refactor to solve for that.
  async findCompanyRepresentedByUser(userId: string) {
    const record = await this.sfService.getCompanyRepresentedByUser(userId)

    const entity = this.mapper.fromPersistence(record)

    return entity
  }
}
