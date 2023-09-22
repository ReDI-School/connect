import { Injectable } from '@nestjs/common'
import { ConProfileRecord, UserType } from '@talent-connect/common-types'
import { omit } from 'lodash'
import { SfApiRepository } from './sf-api.repository'

@Injectable()
export class SfApiConProfilesService {
  constructor(private readonly repository: SfApiRepository) {}
  // constructor(private readonly repository: SalesforceApiRepository) {}
  async getAllConProfiles(filter: any = {}): Promise<ConProfileRecord[]> {
    const rawRecords = await this.repository.findRecordsOfObject({
      objectName: ConProfileRecord.metadata.SALESFORCE_OBJECT_NAME,
      objectFields: ConProfileRecord.metadata.SALESFORCE_OBJECT_FIELDS,
      filter,
      orderBy: ConProfileRecord.metadata.SALESFORCE_ORDER_BY,
    })
    const conProfilesRecord = rawRecords.map((rawRecord) =>
      ConProfileRecord.create(rawRecord)
    )
    return conProfilesRecord
  }

  async getConProfile(id: string): Promise<ConProfileRecord> {
    const conProfilesRecord = await this.getAllConProfiles({ Id: id })
    return conProfilesRecord[0]
  }

  async createConProfileForSignUp(data: {
    userId: string
    rediLocation: string
    profileStatus: string
    loopbackUserId: string
    userType: UserType
    menteeCountCapacity: number
    mentor_isPartnershipMentor?: boolean
    mentor_workPlace?: string
  }) {
    const recordTypeId = await this.repository.findRecordIdOfObject(
      ConProfileRecord.metadata.SALESFORCE_OBJECT_NAME,
      data.userType
    )
    const insertConProfileResult = await this.repository.findUpdateOrInsert(
      ConProfileRecord.metadata.SALESFORCE_OBJECT_NAME,
      { Contact__c: data.userId },
      {
        Contact__c: data.userId,
        Profile_Status__c: data.profileStatus,
        ReDI_Location__c: data.rediLocation,
        RecordTypeId: recordTypeId,
        total_mentee_capacity__c: data.menteeCountCapacity,
        Partnership_Mentor__c: data.mentor_isPartnershipMentor,
        Work_Place__c: data.mentor_workPlace,
      }
    )

    return insertConProfileResult.id
  }

  async updateConProfile(record: ConProfileRecord): Promise<ConProfileRecord> {
    const conProfileProps = record.props
    const contactProps = conProfileProps.Contact__r

    const cleanConProfileProps = omit(conProfileProps, [
      'Contact__r',
      'CreatedDate',
      'LastModifiedDate',
    ])

    const updateContactResult = await this.repository.updateRecord(
      'Contact',
      contactProps
    )
    const updateConProfileResult = await this.repository.updateRecord(
      ConProfileRecord.metadata.SALESFORCE_OBJECT_NAME,
      cleanConProfileProps
    )
    const updatedConProfile = await this.getConProfile(conProfileProps.Id)

    return updatedConProfile
  }
}
