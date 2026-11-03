import { Injectable } from '@nestjs/common'
import {
  ConMentorshipMatchRecord,
  SalesforceMutationIdResult,
} from '@talent-connect/common-types'
import { omit } from 'lodash'
import { SfApiRepository } from './sf-api.repository'

@Injectable()
export class SfApiConMentorshipMatchesService {
  constructor(private readonly repository: SfApiRepository) {}
  // constructor(private readonly repository: SalesforceApiRepository) {}
  async getAll(
    filter: any = {},
    options: { skipCache?: boolean } = {}
  ): Promise<ConMentorshipMatchRecord[]> {
    const rawRecords = await this.repository.findRecordsOfObject({
      objectName: ConMentorshipMatchRecord.metadata.SALESFORCE_OBJECT_NAME,
      objectFields: ConMentorshipMatchRecord.metadata.SALESFORCE_OBJECT_FIELDS,
      filter,
      skipCache: options.skipCache,
    })
    const conMentorshipMatchesRecord = rawRecords.map((rawRecord) =>
      ConMentorshipMatchRecord.create(rawRecord)
    )
    return conMentorshipMatchesRecord
  }

  async get(id: string): Promise<ConMentorshipMatchRecord> {
    const conMentorshipMatchRecords = await this.getAll({
      Id: id,
    })
    return conMentorshipMatchRecords[0]
  }

  async create(
    record: ConMentorshipMatchRecord
  ): Promise<SalesforceMutationIdResult> {
    const conMentorshipMatchRecordProps = record.props

    return await this.repository.createRecord(
      ConMentorshipMatchRecord.metadata.SALESFORCE_OBJECT_NAME,
      conMentorshipMatchRecordProps
    )
  }

  async update(
    record: ConMentorshipMatchRecord
  ): Promise<SalesforceMutationIdResult> {
    const conMentorshipMatchProps = record.props

    const cleanConMentorshipMatchProps = omit(conMentorshipMatchProps, [
      'CreatedDate',
      'LastModifiedDate',
      'Mentor__c',
    ])

    return await this.repository.updateRecord(
      ConMentorshipMatchRecord.metadata.SALESFORCE_OBJECT_NAME,
      cleanConMentorshipMatchProps
    )
  }
}
