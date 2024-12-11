import { Injectable, NotFoundException } from '@nestjs/common'
import {
  ConMentorshipMatchEntity,
  ConMentorshipMatchEntityProps,
  ConMentorshipMatchMapper,
  MentorshipMatchStatus,
} from '@talent-connect/common-types'
import { DateTime } from 'luxon'
import { ConProfilesService } from '../con-profiles/con-profiles.service'
import { EmailService } from '../email/email.service'
import { SfApiConMentorshipMatchesService } from '../salesforce-api/sf-api-con-mentorship-matches.service'
import { ConMentorshipMatchesAcceptMentorshipInputDto } from './dto/con-mentorship-matches-accept-mentorship.mutation-dtos'
import { ConMentorshipMatchesApplyForMentorshipInputDto } from './dto/con-mentorship-matches-apply-for-mentorship.mutation-dtos'
import { ConMentorshipMatchesCompleteMentorshipInputDto } from './dto/con-mentorship-matches-complete-mentorship.mutation-dtos'
import { ConMentorshipMatchesDeclineMentorshipInputDto } from './dto/con-mentorship-matches-decline-mentorship.mutation-dtos'
import { ConMentorshipMatchesMarkAsDismissedInputDto } from './dto/con-mentorship-matches-mark-as-dismissed.mutation-dtos'

@Injectable()
export class ConMentorshipMatchesService {
  constructor(
    private readonly api: SfApiConMentorshipMatchesService,
    private readonly conProfilesServices: ConProfilesService,
    private readonly mapper: ConMentorshipMatchMapper,
    private readonly emailService: EmailService
  ) {}

  // create(createConMentorshipMatchInput: CreateConMentorshipMatchInput) {
  //   return 'This action adds a new conMentorshipMatch'
  // }

  async findAll(filter: any = {}) {
    const persistedEntities = await this.api.getAll(filter)

    const entities: ConMentorshipMatchEntity[] = persistedEntities.map(
      (source) => this.mapper.fromPersistence(source)
    )

    return entities
  }

  async findOne(filter: any = {}) {
    const persistedEntities = await this.findAll(filter)
    if (persistedEntities.length > 0) {
      return persistedEntities[0]
    } else {
      throw new NotFoundException('ConMentorshipMatch not found')
    }
  }

  async findOneById(id: string) {
    const persistedEntity = await this.findOne({ Id: id })
    return persistedEntity
  }

  async patch(
    conMentorshipMatchId: string,
    updates: Partial<ConMentorshipMatchEntityProps>
  ) {
    const existingEntity = await this.findOne({ Id: conMentorshipMatchId })
    const pendingEntityProps = Object.assign(
      {},
      existingEntity.props,
      updates
    ) as ConMentorshipMatchEntityProps
    const pendingEntity = ConMentorshipMatchEntity.create(pendingEntityProps)
    await this.api.update(this.mapper.toPersistence(pendingEntity))
  }

  remove(id: number) {
    return `This action removes a #${id} conMentorshipMatch`
  }

  async acceptMentorship(input: ConMentorshipMatchesAcceptMentorshipInputDto) {
    // TODO: enforce auth
    const mentorshipMatch = await this.findOneById(input.mentorshipMatchId)

    if (mentorshipMatch.props.status !== MentorshipMatchStatus.APPLIED) {
      throw new Error(
        'Mentorship match is not in APPLIED state and cannot be accepted.'
      )
    }

    const [menteeProfile, mentorProfile] = await Promise.all([
      this.conProfilesServices.findOne({
        'Contact__r.Id': mentorshipMatch.props.menteeId,
      }),
      this.conProfilesServices.findOne({
        'Contact__r.Id': mentorshipMatch.props.mentorId,
      }),
    ])

    const entity = await this.findOne({ Id: input.mentorshipMatchId })

    entity.props.status = MentorshipMatchStatus.ACCEPTED
    entity.props.matchMadeActiveOn = DateTime.utc().toString()
    entity.props.mentorReplyMessageOnAccept = input.mentorReplyMessageOnAccept

    const result = await this.api.update(this.mapper.toPersistence(entity))

    this.emailService.sendMentorshipAcceptedEmail({
      recipient: [menteeProfile.props.email, mentorProfile.props.email],
      mentorFirstName: mentorProfile.props.firstName,
      mentorFullName: mentorProfile.props.fullName,
      menteeName: menteeProfile.props.firstName,
      mentorReplyMessageOnAccept: input.mentorReplyMessageOnAccept,
      rediLocation: menteeProfile.props.rediLocation,
      mentorEmail: mentorProfile.props.email,
    })

    const menteePendingMenteeApplications = await this.findAll({
      Mentee__c: menteeProfile.props.userId,
      Status__c: MentorshipMatchStatus.APPLIED,
    })

    menteePendingMenteeApplications.forEach(async (match) => {
      match.props.status =
        MentorshipMatchStatus.INVALIDATED_AS_OTHER_MENTOR_ACCEPTED
      this.api.update(this.mapper.toPersistence(match))
      const [menteeProfile, mentorProfile] = await Promise.all([
        this.conProfilesServices.findOne({
          'Contact__r.Id': match.props.menteeId,
        }),
        this.conProfilesServices.findOne({
          'Contact__r.Id': match.props.mentorId,
        }),
      ])
      this.emailService.sendNotificationToMentorThatPendingApplicationExpiredSinceOtherMentorAccepted(
        {
          recipient: mentorProfile.props.email,
          mentorName: mentorProfile.props.firstName,
          menteeName: menteeProfile.props.fullName,
          rediLocation: mentorProfile.props.rediLocation,
        }
      )
    })

    return result
  }

  async declineMentorship(
    input: ConMentorshipMatchesDeclineMentorshipInputDto
  ) {
    // TODO: enforce auth
    const mentorshipMatch = await this.findOneById(input.mentorshipMatchId)
    const [menteeProfile, mentorProfile] = await Promise.all([
      this.conProfilesServices.findOne({
        'Contact__r.Id': mentorshipMatch.props.menteeId,
      }),
      this.conProfilesServices.findOne({
        'Contact__r.Id': mentorshipMatch.props.mentorId,
      }),
    ])

    const entity = await this.findOne({ Id: input.mentorshipMatchId })
    entity.props.status = MentorshipMatchStatus.DECLINED_BY_MENTOR
    entity.props.ifDeclinedByMentor_chosenReasonForDecline =
      input.ifDeclinedByMentor_chosenReasonForDecline
    entity.props.ifDeclinedByMentor_ifReasonIsOther_freeText =
      input.ifDeclinedByMentor_ifReasonIsOther_freeText
    entity.props.ifDeclinedByMentor_optionalMessageToMentee =
      input.ifDeclinedByMentor_optionalMessageToMentee
    entity.props.ifDeclinedByMentor_dateTime = DateTime.utc().toString()
    const result = await this.api.update(this.mapper.toPersistence(entity))

    this.emailService.sendMentorshipDeclinedEmail({
      recipient: menteeProfile.props.email,
      mentorName: mentorProfile.props.firstName,
      menteeName: menteeProfile.props.firstName,
      ifDeclinedByMentor_chosenReasonForDecline:
        input.ifDeclinedByMentor_chosenReasonForDecline,
      ifDeclinedByMentor_ifReasonIsOther_freeText:
        input.ifDeclinedByMentor_ifReasonIsOther_freeText,
      ifDeclinedByMentor_optionalMessageToMentee:
        input.ifDeclinedByMentor_optionalMessageToMentee,
      rediLocation: menteeProfile.props.rediLocation,
    })

    return result
  }

  async completeMentorship(
    input: ConMentorshipMatchesCompleteMentorshipInputDto
  ) {
    // TODO: enforce auth
    const mentorshipMatch = await this.findOneById(input.mentorshipMatchId)
    const [menteeProfile, mentorProfile] = await Promise.all([
      this.conProfilesServices.findOne({
        'Contact__r.Id': mentorshipMatch.props.menteeId,
      }),
      this.conProfilesServices.findOne({
        'Contact__r.Id': mentorshipMatch.props.mentorId,
      }),
    ])

    const entity = await this.findOne({ Id: input.mentorshipMatchId })
    entity.props.status = MentorshipMatchStatus.COMPLETED
    entity.props.mentorMessageOnComplete = input.mentorMessageOnComplete
    const result = await this.api.update(this.mapper.toPersistence(entity))

    this.emailService.sendMentorshipCompletionEmailToMentor({
      recipient: mentorProfile.props.email,
      mentorFirstName: mentorProfile.props.firstName,
      menteeFirstName: menteeProfile.props.firstName,
      rediLocation: mentorProfile.props.rediLocation,
    })

    this.emailService.sendMentorshipCompletionEmailToMentee({
      recipient: menteeProfile.props.email,
      mentorFirstName: mentorProfile.props.firstName,
      menteeFirstName: menteeProfile.props.firstName,
      rediLocation: menteeProfile.props.rediLocation,
    })

    return result
  }

  async applyForMentorship(
    requestingMenteeUserId: string,
    input: ConMentorshipMatchesApplyForMentorshipInputDto
  ) {
    // TODO: enforce following rules
    // 1. Requesting user must be a mentee
    // 2. Requested mentor must be an actual mentor
    // 3. Requested mentor must have free mentoring spots
    // 4. There must not be an existing RedMatch between requesting mentee and requested mentor

    const [menteeProfile, mentorProfile] = await Promise.all([
      this.conProfilesServices.findOne({
        'Contact__r.Id': requestingMenteeUserId,
      }),
      this.conProfilesServices.findOneById(input.mentorId),
    ])

    const entityProps = {
      menteeId: menteeProfile.props.userId,
      mentorId: mentorProfile.props.userId,
      status: MentorshipMatchStatus.APPLIED,
      applicationText: input.applicationText,
      expectationText: input.expectationText,
    } as ConMentorshipMatchEntityProps
    const entity = ConMentorshipMatchEntity.create(entityProps)
    const record = this.mapper.toPersistence(entity)

    const result = await this.api.create(record)

    this.emailService.sendMentorshipRequestReceivedEmail({
      recipient: mentorProfile.props.email,
      mentorName: mentorProfile.props.firstName,
      menteeFullName: menteeProfile.props.fullName,
      menteeRediLocation: menteeProfile.props.rediLocation,
      rediLocation: mentorProfile.props.rediLocation,
      applicationText: input.applicationText,
    })

    return result
  }

  async markAsDismissed(input: ConMentorshipMatchesMarkAsDismissedInputDto) {
    // TODO: enforce auth at this level or at resolver level

    const entity = await this.findOne({ Id: input.conMentorshipMatchId })
    entity.props.hasMenteeDismissedMentorshipApplicationAcceptedNotification =
      true
    const result = this.api.update(this.mapper.toPersistence(entity))

    return result
  }

  async cancelMentorshipFromProblemReport(
    mentorUserId: string,
    menteeUserId: string
  ) {
    const entity = await this.findOne({
      Mentor__c: mentorUserId,
      Mentee__c: menteeUserId,
    })
    entity.props.status = MentorshipMatchStatus.CANCELLED
    const result = await this.api.update(this.mapper.toPersistence(entity))
    return result
  }
}
