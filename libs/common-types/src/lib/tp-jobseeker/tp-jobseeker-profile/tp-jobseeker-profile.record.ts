import { Record, RecordMetadata } from '../../base-interfaces-types-classes'
import { TpJobseekerProfileRecordProps } from './tp-jobseeker-profile.recordprops'

export class TpJobseekerProfileRecord extends Record<TpJobseekerProfileRecordProps> {
  props: TpJobseekerProfileRecordProps

  private constructor(props: TpJobseekerProfileRecordProps) {
    super(props)
  }

  public static create(rawProps: TpJobseekerProfileRecordProps) {
    const props = TpJobseekerProfileRecordProps.create(rawProps)
    return new TpJobseekerProfileRecord(props)
  }

  public static metadata: RecordMetadata = {
    SALESFORCE_OBJECT_NAME: 'Jobseeker_Profile__c',
    SALESFORCE_OBJECT_FIELDS: [
      'Id',
      'CreatedDate',
      'LastModifiedDate',
      'Name',
      'ReDI_Location__c',
      'Avatar_Image_URL__c',
      'Desired_Positions__c',
      'Location__c',
      'Desired_Employment_Type__c',
      'Availability__c',
      'Availability_Date__c',
      'About_Yourself__c',
      'Top_Skills__c',
      'Profile_Status__c',
      'ReDI_Joins_25_Winter_Talent_Summit__c',
      'Is_Visible_to_Companies__c',
      'Federal_State__c',
      'Willing_to_Relocate__c',
      'Immigration_Status__c',
      'Subscribed_to_TP_Marketing_Emails__c',
      'Contact__c',
    ],
  }
}
