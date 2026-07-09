import { Record, RecordMetadata } from '../base-interfaces-types-classes'
import { ConMentoringSessionRecordProps } from './con-mentoring-session.recordprops'

export class ConMentoringSessionRecord extends Record<ConMentoringSessionRecordProps> {
  props: ConMentoringSessionRecordProps

  private constructor(props: ConMentoringSessionRecordProps) {
    super(props)
  }

  public static create(rawProps: ConMentoringSessionRecordProps) {
    const props = ConMentoringSessionRecordProps.create(rawProps)
    return new ConMentoringSessionRecord(props)
  }

  public static metadata: RecordMetadata = {
    SALESFORCE_OBJECT_NAME: 'Mentoring_Session__c',
    SALESFORCE_OBJECT_FIELDS: [
      'Id',
      'Date__c',
      'Durations_in_Minutes__c',
      'Meeting_Notes__c',
      'Mentee__c',
      'Mentor__c',
      'Mentorship_Match__c',
      'CreatedDate',
      'LastModifiedDate',
    ],
    SALESFORCE_ORDER_BY: ['Date__c', 'ASC'],
  }
}
