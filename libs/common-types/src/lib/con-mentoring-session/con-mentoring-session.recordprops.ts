import { plainToClass, Type } from 'class-transformer'
import { RecordProps } from '../base-interfaces-types-classes'

export class ConMentoringSessionRecordProps implements RecordProps {
  Id: string

  @Type(() => Date)
  Date__c: Date
  Durations_in_Minutes__c: number
  Meeting_Notes__c?: string

  Mentor__c: string
  Mentee__c: string
  Mentorship_Match__c: string

  @Type(() => Date)
  CreatedDate: Date
  @Type(() => Date)
  LastModifiedDate: Date

  public static create(rawProps: any) {
    return plainToClass(ConMentoringSessionRecordProps, rawProps, {})
  }
}
