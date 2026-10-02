import { ConfigService } from '@nestjs/config'
import { RediLocation, UserType } from '@talent-connect/common-types'
import nodemailer from 'nodemailer'
import { ConMentoringSessionsService } from '../con-mentoring-sessions/con-mentoring-sessions.service'
import { ConMentorshipMatchesService } from '../con-mentorship-matches/con-mentorship-matches.service'
import { ConProfilesService } from '../con-profiles/con-profiles.service'
import { SfApiEmailTemplatesService } from '../salesforce-api/sf-api-email-templates.service'
import { ReminderEmailsController } from './reminder-emails.controller'
import { ReminderEmailsService } from './reminder-emails.service'

jest.mock('nodemailer', () => ({ createTransport: jest.fn() }))
jest.mock('../con-mentoring-sessions/con-mentoring-sessions.service', () => ({
  ConMentoringSessionsService: jest.fn(),
}))
jest.mock('../con-mentorship-matches/con-mentorship-matches.service', () => ({
  ConMentorshipMatchesService: jest.fn(),
}))
jest.mock('../con-profiles/con-profiles.service', () => ({
  ConProfilesService: jest.fn(),
}))
jest.mock('../salesforce-api/sf-api-email-templates.service', () => ({
  SfApiEmailTemplatesService: jest.fn(),
}))

type Role = 'mentor' | 'mentee'
type ReminderEndpoint = keyof ReminderEmailsController

const reminders: { endpoint: ReminderEndpoint; recipients: Role[] }[] = [
  { endpoint: 'sendMentorCompleteProfileReminders', recipients: ['mentor'] },
  { endpoint: 'sendMenteeCompleteProfileReminders', recipients: ['mentee'] },
  {
    endpoint: 'sendMenteeApplyToMentorReminders',
    recipients: ['mentee', 'mentee'],
  },
  {
    endpoint: 'sendMentorshipFollowUpReminders',
    recipients: ['mentee', 'mentor'],
  },
  { endpoint: 'sendUnmatchedMenteesReminder', recipients: ['mentee'] },
  { endpoint: 'sendPendingMenteeApplicationReminder', recipients: ['mentor'] },
  {
    endpoint: 'sendMentoringSessionsLoggingReminder',
    recipients: ['mentee', 'mentor', 'mentee', 'mentor'],
  },
]

describe('reminder email recipient locations', () => {
  const originalNodeEnv = process.env.NODE_ENV
  const sendMail = jest.fn()
  let controller: ReminderEmailsController
  let profilesService: { findAll: jest.Mock }
  let matchesService: { findAll: jest.Mock }

  beforeEach(() => {
    process.env.NODE_ENV = 'production'
    sendMail.mockReset().mockResolvedValue({})
    ;(nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail })
    jest.spyOn(console, 'log').mockImplementation(() => undefined)

    profilesService = { findAll: jest.fn() }
    matchesService = { findAll: jest.fn() }
    const service = new ReminderEmailsService(
      {
        getEmailTemplate: jest.fn().mockResolvedValue({
          Subject: 'Reminder for ${menteeFullName}',
          HtmlValue: 'Hello {{{Recipient.FirstName}}}',
        }),
      } as unknown as SfApiEmailTemplatesService,
      profilesService as unknown as ConProfilesService,
      matchesService as unknown as ConMentorshipMatchesService,
      {
        findAll: jest.fn().mockResolvedValue([]),
      } as unknown as ConMentoringSessionsService,
      new ConfigService({ NX_DEV_MODE_EMAIL_RECIPIENT: 'dev@example.org' })
    )
    controller = new ReminderEmailsController(service)
  })

  afterEach(() => {
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV
    else process.env.NODE_ENV = originalNodeEnv
    jest.restoreAllMocks()
  })

  function setEligibleRecipients(
    endpoint: ReminderEndpoint,
    mentorLocation: RediLocation,
    menteeLocation: RediLocation
  ) {
    const profiles = [
      {
        props: {
          userId: 'mentor',
          userType: UserType.MENTOR,
          email: 'mentor@example.org',
          firstName: 'Mentor',
          fullName: 'Mentor Example',
          rediLocation: mentorLocation,
        },
      },
      {
        props: {
          userId: 'mentee',
          userType: UserType.MENTEE,
          email: 'mentee@example.org',
          firstName: 'Mentee',
          fullName: 'Mentee Example',
          rediLocation: menteeLocation,
        },
      },
    ]
    profilesService.findAll.mockImplementation(async (filter) =>
      profiles.filter(
        (profile) =>
          !filter['RecordType.DeveloperName'] ||
          profile.props.userType === filter['RecordType.DeveloperName']
      )
    )
    const hasMatch = ![
      'sendMenteeApplyToMentorReminders',
      'sendUnmatchedMenteesReminder',
    ].includes(endpoint)
    matchesService.findAll.mockResolvedValue(
      hasMatch
        ? [
            {
              props: {
                id: 'match',
                mentorId: 'mentor',
                menteeId: 'mentee',
                createdAt: new Date('2026-01-01T12:00:00Z'),
                matchMadeActiveOn: new Date('2026-01-02T12:00:00Z'),
              },
            },
          ]
        : []
    )
  }

  async function triggerReminder(endpoint: ReminderEndpoint) {
    await controller[endpoint]()
    // The endpoints launch asynchronous sends without awaiting their loops.
    await new Promise<void>((resolve) => setImmediate(resolve))
  }

  describe.each(reminders)('$endpoint', ({ endpoint, recipients }) => {
    it.each([
      ...Object.values(RediLocation).map((location) => [location, location]),
      [RediLocation.COPENHAGEN, RediLocation.BERLIN],
      [RediLocation.BERLIN, RediLocation.COPENHAGEN],
    ])(
      'sends only to eligible recipients with mentor in %s and mentee in %s',
      async (mentorLocation, menteeLocation) => {
        setEligibleRecipients(endpoint, mentorLocation, menteeLocation)
        await triggerReminder(endpoint)

        const locations = { mentor: mentorLocation, mentee: menteeLocation }
        const expectedEmails = recipients
          .filter((role) => locations[role] !== RediLocation.COPENHAGEN)
          .map((role) => `${role}@example.org`)
        expect(sendMail.mock.calls.map(([mail]) => mail.to).sort()).toEqual(
          expectedEmails.sort()
        )
      }
    )

    it.each(['test', 'demonstration', 'staging'])(
      'does not send Copenhagen reminders or BCCs in %s',
      async (environment) => {
        process.env.NODE_ENV = environment
        setEligibleRecipients(
          endpoint,
          RediLocation.COPENHAGEN,
          RediLocation.COPENHAGEN
        )
        await triggerReminder(endpoint)
        expect(sendMail).not.toHaveBeenCalled()
      }
    )
  })
})
