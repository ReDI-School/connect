import { Injectable, NotFoundException } from '@nestjs/common'
import {
  JobseekerProfileStatus,
  TpJobseekerDirectoryEntryMapper,
} from '@talent-connect/common-types'
import { SfApiTpJobseekerDirectoryEntriesService } from '../salesforce-api/sf-api-tp-jobseeker-directory-entries.service'
import { FindAllVisibleTpJobseekerDirectoryEntriesArgs } from './args/find-all-visible-tp-jobseeker-directory-entries.args'
import { FindOneVisibleTpJobseekerDirectoryEntryArgs } from './args/find-one-visible-tp-jobseeker-directory-entry.args'

@Injectable()
export class TpJobseekerDirectoryEntriesService {
  constructor(
    private readonly api: SfApiTpJobseekerDirectoryEntriesService,
    private readonly mapper: TpJobseekerDirectoryEntryMapper
  ) {}

  async findAll(filter: any = {}) {
    const records = await this.api.findAllJobseekerDirectoryEntries(filter)

    const entities = records.map((source) =>
      this.mapper.fromPersistence(source)
    )

    return entities
  }

  async findOneVisibleJobseeker(
    _filter: FindOneVisibleTpJobseekerDirectoryEntryArgs
  ) {
    const filter: any = {
      Jobseeker_Profiles__r: {
        Profile_Status__c: JobseekerProfileStatus.PROFILE_APPROVED,
        Is_Visible_to_Companies__c: true,
        Id: _filter.filter.tpJobseekerProfileId,
      },
    }

    const entities = await this.findAll(filter)

    if (entities.length > 0) {
      return entities[0]
    } else {
      throw new NotFoundException(
        'TpJobseekerDirectoryEntry not found with id: ' +
          _filter.filter.tpJobseekerProfileId
      )
    }
  }

  async findAllVisibleJobseekers(
    _filter: FindAllVisibleTpJobseekerDirectoryEntriesArgs
  ) {
    const filter: any = {
      Jobseeker_Profiles__r: {
        Profile_Status__c: JobseekerProfileStatus.PROFILE_APPROVED,
        Is_Visible_to_Companies__c: true,
      },
    }
    if (_filter.filter.name) {
      filter.Name = { $like: `%${_filter.filter.name}%` }
    }
    if (_filter.filter.desiredPositions?.length > 0) {
      filter.Jobseeker_Profiles__r.Desired_Positions__c = {
        $includes: _filter.filter.desiredPositions,
      }
    }
    if (_filter.filter.employmentTypes?.length > 0) {
      filter.Jobseeker_Profiles__r.Desired_Employment_Type__c = {
        $includes: _filter.filter.employmentTypes,
      }
    }
    if (_filter.filter.skills?.length > 0) {
      filter.Jobseeker_Profiles__r.Top_Skills__c = {
        $includes: _filter.filter.skills,
      }
    }
    if (_filter.filter.federalStates?.length > 0) {
      filter.Jobseeker_Profiles__r.Federal_State__c = {
        $in: _filter.filter.federalStates,
      }
    }

    /**
     * Job Fair Boolean Field(s)
     * Uncomment & Rename (joins{Location}{Year}{Season}JobFair) the next block when there's an upcoming Job Fair
     * Duplicate if there are multiple Job Fairs coming
     */
    // if (_filter.filter.joins25WinterTalentSummit) {
    //   filter.Jobseeker_Profiles__r.ReDI_Joins_25_Winter_Talent_Summit__c =
    //     _filter.filter.joins25WinterTalentSummit
    // }

    const entities = await this.findAll(filter)

    return entities.filter((entity) => {
      const isLanguagesQueryEmpty =
        !_filter.filter.desiredLanguages ||
        _filter.filter.desiredLanguages.length === 0
      if (isLanguagesQueryEmpty) return true

      const doesJobseekerWorkingLanguagesOverlapWithLanguagesQuery =
        entity.props.workingLanguages?.some((langObj) =>
          _filter.filter.desiredLanguages.includes(langObj.language)
        )

      return doesJobseekerWorkingLanguagesOverlapWithLanguagesQuery
    })
  }

  async findOne(id: string) {
    const entities = await this.findAll({
      Id: id,
    })
    if (entities.length > 0) {
      return entities[0]
    } else {
      throw new NotFoundException(
        'TpJobseekerDirectoryEntry not found with id: ' + id
      )
    }
  }

  async findOneByUserId(userId: string) {
    const entities = await this.findAll({
      Id: userId,
    })
    if (entities.length > 0) {
      return entities[0]
    } else {
      throw new NotFoundException('TpJobseekerDirectoryEntry not found')
    }
  }
}
