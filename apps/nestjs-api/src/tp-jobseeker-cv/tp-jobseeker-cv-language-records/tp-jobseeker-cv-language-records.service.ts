import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import {
  TpJobseekerCvLanguageRecordEntity,
  TpJobseekerCvLanguageRecordEntityProps,
  TpJobseekerCvLanguageRecordMapper,
} from '@talent-connect/common-types'
import { deleteUndefinedProperties } from '@talent-connect/shared-utils'
import { CurrentUserInfo } from '../../auth/current-user.interface'
import { SfApiTpJobseekerCvLanguageRecordsService } from '../../salesforce-api/sf-api-tp-jobseeker-cv-language-records.service'
import { TpJobseekerCvReadService } from '../tp-jobseeker-cv.read.service'
import { TpJobseekerCvLanguageRecordCreateInput } from './dtos/tp-jobseeker-cv-language-record-create.entityinput'
import { TpJobseekerCvLanguageRecordDeleteInput } from './dtos/tp-jobseeker-cv-language-record-delete.entityinput'
import { TpJobseekerCvLanguageRecordPatchInput } from './dtos/tp-jobseeker-cv-language-record-patch.entityinput'

@Injectable()
export class TpJobseekerCvLanguageRecordsService {
  constructor(
    private readonly api: SfApiTpJobseekerCvLanguageRecordsService,
    private readonly mapper: TpJobseekerCvLanguageRecordMapper,
    private readonly cvReadService: TpJobseekerCvReadService
  ) {}

  async findAll(filter: any = {}) {
    const records = await this.api.getAll(filter)

    const entities = records.map((source) =>
      this.mapper.fromPersistence(source)
    )

    return entities
  }

  async findOne(id: string) {
    const entities = await this.findAll({
      Id: id,
    })
    if (entities.length > 0) {
      return entities[0]
    } else {
      throw new NotFoundException(
        'TpJobseekerCvLanguageRecord not found with id: ' + id
      )
    }
  }

  async createFromInput(
    input: TpJobseekerCvLanguageRecordCreateInput,
    currentUser: CurrentUserInfo
  ) {
    const cv = await this.cvReadService.findOne(input.tpJobseekerCvId)
    if (cv.props.userId !== currentUser.userId) {
      throw new UnauthorizedException(
        'You are not authorized to create a TpJobseekerCvLanguageRecord for this CV'
      )
    }

    const props = new TpJobseekerCvLanguageRecordEntityProps()
    Object.assign(props, input)

    const entityToPersist = TpJobseekerCvLanguageRecordEntity.create(props)

    return await this.create(entityToPersist)
  }

  async create(entity: TpJobseekerCvLanguageRecordEntity) {
    const recordToPersist = this.mapper.toPersistence(entity)
    return await this.api.create(recordToPersist)
  }

  async patch(
    input: TpJobseekerCvLanguageRecordPatchInput,
    currentUser: CurrentUserInfo
  ) {
    const existingEntity = await this.findOne(input.id)

    if (existingEntity.props.userId !== currentUser.userId) {
      throw new UnauthorizedException(
        'You are not authorized to update this TpJobseekerCvLanguageRecord'
      )
    }

    const props = existingEntity.props
    const updatesSanitized = deleteUndefinedProperties(input)
    Object.entries(updatesSanitized).forEach(([key, value]) => {
      props[key] = value
    })
    const entityToPersist = TpJobseekerCvLanguageRecordEntity.create(props)
    await this.api.update(this.mapper.toPersistence(entityToPersist))
  }

  async delete(
    input: TpJobseekerCvLanguageRecordDeleteInput,
    currentUser: CurrentUserInfo
  ) {
    const existingEntity = await this.findOne(input.id)

    if (existingEntity.props.userId !== currentUser.userId) {
      throw new UnauthorizedException(
        'You are not authorized to update this TpJobseekerCvLanguageRecord'
      )
    }

    const recordToDelete = this.mapper.toPersistence(existingEntity)
    await this.api.delete(recordToDelete)
  }
}
