import { Record, RecordMetadata } from '../base-interfaces-types-classes'
import { AccountContactRecordProps } from './account-contact.recordprops'

export class AccountContactRecord extends Record<AccountContactRecordProps> {
  props: AccountContactRecordProps

  private constructor(props: AccountContactRecordProps) {
    super(props)
  }

  public static create(rawProps: AccountContactRecordProps) {
    const props = AccountContactRecordProps.create(rawProps)
    return new AccountContactRecord(props)
  }

  public static metadata: RecordMetadata = {
    SALESFORCE_OBJECT_NAME: 'AccountContactRelation',
    SALESFORCE_OBJECT_FIELDS: [
      'Id',
      'CreatedDate',
      'LastModifiedDate',
      'AccountId',
      'ContactId',
      'Roles',
      'ReDI_Company_Representative_Status__c',
    ],
  }
}