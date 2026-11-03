import { ConflictException, Logger } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import {
  ConMentorshipMatchMapper,
  ConMentorshipMatchRecord,
  MentorshipMatchStatus,
} from '@talent-connect/common-types'
import { ConProfilesService } from '../con-profiles/con-profiles.service'
import { EmailService } from '../email/email.service'
import { SfApiConMentorshipMatchesService } from '../salesforce-api/sf-api-con-mentorship-matches.service'
import { ConMentorshipMatchesService } from './con-mentorship-matches.service'

// Keep the service and mapper real while isolating Salesforce and email delivery.
jest.mock('../con-profiles/con-profiles.service', () => ({
  ConProfilesService: jest.fn(),
}))
jest.mock('../email/email.service', () => ({ EmailService: jest.fn() }))
jest.mock('../salesforce-api/sf-api-con-mentorship-matches.service', () => ({
  SfApiConMentorshipMatchesService: jest.fn(),
}))

function deferred<T>() {
  let resolve: (value: T) => void
  let reject: (error: Error) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('ConMentorshipMatchesService.acceptMentorship', () => {
  let service: ConMentorshipMatchesService
  let records: Map<string, ConMentorshipMatchRecord>
  let api: { getAll: jest.Mock; update: jest.Mock }
  let profiles: { findOne: jest.Mock }
  let emails: {
    sendMentorshipAcceptedEmail: jest.Mock
    sendNotificationToMentorThatPendingApplicationExpiredSinceOtherMentorAccepted: jest.Mock
  }
  let logError: jest.SpyInstance

  const input = {
    mentorshipMatchId: 'application-a',
    mentorReplyMessageOnAccept: 'Welcome to your mentorship!',
  }
  const expiryNotification = () =>
    emails.sendNotificationToMentorThatPendingApplicationExpiredSinceOtherMentorAccepted

  function addMatch(
    id: string,
    status = MentorshipMatchStatus.APPLIED,
    menteeId = 'mentee'
  ) {
    records.set(
      id,
      ConMentorshipMatchRecord.create({
        Id: id,
        Mentee__c: menteeId,
        Mentor__c: 'mentor-' + id,
        Status__c: status,
        CreatedDate: new Date('2026-10-01T00:00:00Z'),
        LastModifiedDate: new Date('2026-10-01T00:00:00Z'),
      })
    )
  }

  function persist(record: ConMentorshipMatchRecord) {
    records.set(record.props.Id, record)
    return { id: record.props.Id, success: true, errors: [] }
  }

  function delayInvalidations() {
    const pendingB = deferred<void>()
    const pendingC = deferred<void>()
    const allStarted = deferred<void>()
    let started = 0
    api.update.mockImplementation(async (record) => {
      if (record.props.Id !== 'application-a') {
        if (++started === 2) allStarted.resolve()
        await (record.props.Id === 'application-b'
          ? pendingB.promise
          : pendingC.promise)
      }
      return persist(record)
    })
    const settled = jest.fn()
    const acceptance = service.acceptMentorship(input)
    acceptance.then(settled, settled)
    return { pendingB, pendingC, allStarted, settled, acceptance }
  }

  beforeEach(async () => {
    records = new Map()
    addMatch('application-a')
    addMatch('application-b')
    addMatch('application-c')
    api = {
      getAll: jest.fn(async (filter) =>
        Array.from(records.values()).filter((record) =>
          Object.entries(filter).every(
            ([key, value]) => record.props[key] === value
          )
        )
      ),
      update: jest.fn(async (record) => persist(record)),
    }
    profiles = {
      findOne: jest.fn(async (filter) => {
        const userId = filter['Contact__r.Id']
        return {
          props: {
            userId,
            firstName: userId,
            fullName: userId,
            email: userId + '@example.com',
            rediLocation: 'BERLIN',
          },
        }
      }),
    }
    emails = {
      sendMentorshipAcceptedEmail: jest.fn(),
      sendNotificationToMentorThatPendingApplicationExpiredSinceOtherMentorAccepted:
        jest.fn(),
    }
    logError = jest.spyOn(Logger.prototype, 'error').mockImplementation()

    const module = await Test.createTestingModule({
      providers: [
        ConMentorshipMatchesService,
        ConMentorshipMatchMapper,
        { provide: SfApiConMentorshipMatchesService, useValue: api },
        { provide: ConProfilesService, useValue: profiles },
        { provide: EmailService, useValue: emails },
      ],
    }).compile()
    service = module.get(ConMentorshipMatchesService)
  })

  afterEach(() => jest.restoreAllMocks())

  it("accepts one application and invalidates only the same mentee's other pending applications", async () => {
    addMatch('completed', MentorshipMatchStatus.COMPLETED)
    addMatch('declined', MentorshipMatchStatus.DECLINED_BY_MENTOR)
    addMatch('unrelated', MentorshipMatchStatus.APPLIED, 'another-mentee')

    await expect(service.acceptMentorship(input)).resolves.toMatchObject({
      id: 'application-a',
      success: true,
    })

    expect(records.get('application-a').props).toMatchObject({
      Status__c: MentorshipMatchStatus.ACCEPTED,
      Mentor_Acceptance_Message__c: input.mentorReplyMessageOnAccept,
    })
    for (const id of ['application-b', 'application-c']) {
      expect(records.get(id).props.Status__c).toBe(
        MentorshipMatchStatus.INVALIDATED_AS_OTHER_MENTOR_ACCEPTED
      )
    }
    expect(records.get('completed').props.Status__c).toBe(
      MentorshipMatchStatus.COMPLETED
    )
    expect(records.get('declined').props.Status__c).toBe(
      MentorshipMatchStatus.DECLINED_BY_MENTOR
    )
    expect(records.get('unrelated').props.Status__c).toBe(
      MentorshipMatchStatus.APPLIED
    )
    expect(api.update).toHaveBeenCalledTimes(3)
    expect(emails.sendMentorshipAcceptedEmail).toHaveBeenCalledTimes(1)
    expect(expiryNotification()).toHaveBeenCalledTimes(2)
    expect(
      api.getAll.mock.calls.every(([, options]) => options.skipCache)
    ).toBe(true)
  })

  it('rejects acceptance when the mentee has an accepted mentorship, even if the cache says otherwise', async () => {
    addMatch('existing-mentorship', MentorshipMatchStatus.ACCEPTED)
    const getAll = api.getAll.getMockImplementation()
    api.getAll.mockImplementation((filter, options) => {
      if (
        filter.Status__c === MentorshipMatchStatus.ACCEPTED &&
        !options?.skipCache
      ) {
        return Promise.resolve([])
      }
      return getAll(filter, options)
    })

    await expect(service.acceptMentorship(input)).rejects.toThrow(
      'This mentee already has an accepted mentorship.'
    )

    expect(api.update).not.toHaveBeenCalled()
    expect(profiles.findOne).not.toHaveBeenCalled()
    expect(emails.sendMentorshipAcceptedEmail).not.toHaveBeenCalled()
    expect(expiryNotification()).not.toHaveBeenCalled()
  })

  it('allows acceptance when a different mentee has an accepted mentorship', async () => {
    addMatch('unrelated', MentorshipMatchStatus.ACCEPTED, 'another-mentee')
    await expect(service.acceptMentorship(input)).resolves.toMatchObject({
      id: 'application-a',
    })
  })

  it('continues to reject an application that is no longer pending', async () => {
    addMatch(
      'application-a',
      MentorshipMatchStatus.INVALIDATED_AS_OTHER_MENTOR_ACCEPTED
    )
    await expect(service.acceptMentorship(input)).rejects.toThrow(
      'Mentorship match is not in APPLIED state and cannot be accepted.'
    )
    expect(api.update).not.toHaveBeenCalled()
  })

  it('accepts when there are no other pending applications', async () => {
    records.delete('application-b')
    records.delete('application-c')
    await expect(service.acceptMentorship(input)).resolves.toMatchObject({
      id: 'application-a',
    })
    expect(api.update).toHaveBeenCalledTimes(1)
    expect(expiryNotification()).not.toHaveBeenCalled()
  })

  it('waits for every invalidation and notifies mentors only after their updates succeed', async () => {
    const { pendingB, pendingC, allStarted, settled, acceptance } =
      delayInvalidations()
    await allStarted.promise
    expect(settled).not.toHaveBeenCalled()
    expect(expiryNotification()).not.toHaveBeenCalled()

    pendingB.resolve()
    await new Promise(setImmediate)
    expect(settled).not.toHaveBeenCalled()
    expect(expiryNotification()).toHaveBeenCalledTimes(1)
    expect(expiryNotification()).toHaveBeenCalledWith(
      expect.objectContaining({
        recipient: 'mentor-application-b@example.com',
      })
    )

    pendingC.resolve()
    await expect(acceptance).resolves.toMatchObject({ id: 'application-a' })
    expect(expiryNotification()).toHaveBeenCalledTimes(2)
  })

  it('waits for remaining updates after failure and blocks later acceptance of the leftover application', async () => {
    const { pendingB, pendingC, allStarted, settled, acceptance } =
      delayInvalidations()
    await allStarted.promise
    pendingB.reject(new Error('Salesforce update failed after retries'))
    await new Promise(setImmediate)
    expect(settled).not.toHaveBeenCalled()
    expect(expiryNotification()).not.toHaveBeenCalled()

    pendingC.resolve()
    await expect(acceptance).rejects.toThrow(
      'The mentorship was accepted, but cleanup of its other applications failed.'
    )
    expect(records.get('application-a').props.Status__c).toBe(
      MentorshipMatchStatus.ACCEPTED
    )
    expect(records.get('application-b').props.Status__c).toBe(
      MentorshipMatchStatus.APPLIED
    )
    expect(records.get('application-c').props.Status__c).toBe(
      MentorshipMatchStatus.INVALIDATED_AS_OTHER_MENTOR_ACCEPTED
    )
    expect(expiryNotification()).toHaveBeenCalledTimes(1)
    expect(expiryNotification()).toHaveBeenCalledWith(
      expect.objectContaining({ recipient: 'mentor-application-c@example.com' })
    )
    expect(logError).toHaveBeenCalledWith(
      expect.stringContaining(
        'application-b after accepting mentorship application-a'
      ),
      expect.stringContaining('Salesforce update failed after retries')
    )

    api.update.mockClear()
    await expect(
      service.acceptMentorship({ ...input, mentorshipMatchId: 'application-b' })
    ).rejects.toBeInstanceOf(ConflictException)
    expect(api.update).not.toHaveBeenCalled()
  })
})
