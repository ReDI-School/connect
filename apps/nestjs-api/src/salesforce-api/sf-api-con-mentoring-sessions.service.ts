import { Injectable } from '@nestjs/common'
import { ConMentoringSessionRecord } from '@talent-connect/common-types'
import { pick } from 'lodash'
import { SfApiRepository } from './sf-api.repository'

@Injectable()
export class SfApiConMentoringSessionsService {
  constructor(private readonly repository: SfApiRepository) {}
  // constructor(private readonly repository: SalesforceApiRepository) {}
  async getAll(filter: any = {}): Promise<ConMentoringSessionRecord[]> {
    const rawRecords = await this.repository.findRecordsOfObject({
      objectName: ConMentoringSessionRecord.metadata.SALESFORCE_OBJECT_NAME,
      objectFields: ConMentoringSessionRecord.metadata.SALESFORCE_OBJECT_FIELDS,
      filter,
      orderBy: ConMentoringSessionRecord.metadata.SALESFORCE_ORDER_BY,
    })
    const conMentoringSessionsRecord = rawRecords.map((rawRecord) =>
      ConMentoringSessionRecord.create(rawRecord)
    )
    return conMentoringSessionsRecord
  }

  async get(id: string): Promise<ConMentoringSessionRecord> {
    const entities = await this.getAll({ Id: id })
    return entities[0]
  }

  async create(record: ConMentoringSessionRecord) {
    const cleanProps = pick(record.props, [
      'Date__c',
      'Durations_in_Minutes__c',
      'Meeting_Notes__c',
      'Mentor__c',
      'Mentee__c',
      'Mentorship_Match__c',
    ])

    const createResult = await this.repository.createRecord(
      ConMentoringSessionRecord.metadata.SALESFORCE_OBJECT_NAME,
      cleanProps
    )

    return createResult
  }
}
