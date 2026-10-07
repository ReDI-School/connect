import { Injectable } from '@nestjs/common'
import {
  ConMentoringSessionEntity,
  ConMentoringSessionEntityProps,
  ConMentoringSessionRecord,
  ConMentoringSessionRecordProps,
  Mapper,
  MentoringSessionDuration,
} from '@talent-connect/common-types'

@Injectable()
export class ConMentoringSessionMapper
  implements Mapper<ConMentoringSessionEntity, ConMentoringSessionRecord>
{
  fromPersistence(raw: ConMentoringSessionRecord): ConMentoringSessionEntity {
    const props = new ConMentoringSessionEntityProps()

    props.id = raw.props.Id
    props.date = raw.props.Date__c

    props.minuteDuration =
      MentoringSessionDuration[
        `MIN${raw.props.Durations_in_Minutes__c as Duration}`
      ]
    props.mentorId = raw.props.Mentor__c
    props.menteeId = raw.props.Mentee__c
    props.meetingNotes = raw.props.Meeting_Notes__c
    props.mentorshipMatchId = raw.props.Mentorship_Match__c
    props.createdAt = raw.props.CreatedDate
    props.updatedAt = raw.props.LastModifiedDate

    const entity = ConMentoringSessionEntity.create(props)

    return entity
  }

  public toPersistence(
    source: ConMentoringSessionEntity
  ): ConMentoringSessionRecord {
    const props = new ConMentoringSessionRecordProps()
    const srcProps = source.props
    props.Date__c = srcProps.date
    props.Durations_in_Minutes__c = parseInt(
      srcProps.minuteDuration.replace('MIN', '')
    )
    props.Meeting_Notes__c = srcProps.meetingNotes
    props.Mentor__c = srcProps.mentorId
    props.Mentee__c = srcProps.menteeId
    props.Mentorship_Match__c = srcProps.mentorshipMatchId

    const record = ConMentoringSessionRecord.create(props)

    return record
  }
}

type Duration = 15 | 30 | 45 | 60 | 75 | 90 | 105 | 120
