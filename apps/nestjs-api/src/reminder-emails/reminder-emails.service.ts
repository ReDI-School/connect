import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  ConnectProfileStatus,
  ConProfileEntity,
  MentorshipMatchStatus,
  UserType,
} from '@talent-connect/common-types'
import { format as formatDate } from 'date-fns'
import * as jsforce from 'jsforce'
import { filter } from 'lodash'
import difference from 'lodash/difference'
import transform from 'lodash/transform'
import nodemailer from 'nodemailer'
import { ConMentoringSessionsService } from '../con-mentoring-sessions/con-mentoring-sessions.service'
import { ConMentorshipMatchesService } from '../con-mentorship-matches/con-mentorship-matches.service'
import { ConProfilesService } from '../con-profiles/con-profiles.service'
import { SfApiEmailTemplatesService } from '../salesforce-api/sf-api-email-templates.service'

const isProductionOrDemonstration = () =>
  ['production', 'demonstration', 'staging'].includes(process.env.NODE_ENV)

const SENDER_NAME = 'ReDI Talent Success Team'
const SENDER_EMAIL = 'career@redi-school.org'

@Injectable()
export class ReminderEmailsService {
  private transporter: any

  constructor(
    private readonly emailTemplatesService: SfApiEmailTemplatesService,
    private readonly conProfilesService: ConProfilesService,
    private readonly conMentorshipMatchesService: ConMentorshipMatchesService,
    private readonly conMentoringSessionsService: ConMentoringSessionsService,
    private readonly config: ConfigService
  ) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.googlemail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'career@redi-school.org',
        pass: process.env.NX_GWORKSPACE_EMAIL_PASSWORD,
      },
    })
  }

  async getDraftingConProfiles({ userType }: { userType: UserType }) {
    const createdDate = new Date()
    createdDate.setDate(createdDate.getDate() - 14)

    return this.conProfilesService.findAll({
      'RecordType.DeveloperName': userType,
      Profile_Status__c: ConnectProfileStatus.DRAFTING_PROFILE,
      Created_Date_Without_Time__c: {
        $eq: jsforce.SfDate.toDateLiteral(createdDate),
      },
    })
  }

  async getApprovedMenteesWithNoMentorApplicationsByDays({
    daysAgo,
  }: {
    daysAgo: '7d' | '14d'
  }) {
    const approvedDate = new Date()
    approvedDate.setDate(approvedDate.getDate() - parseInt(daysAgo)) // Interestingly, parseInt is able to parse 7d and 14d to 7 and 14 respectively

    // 1st Step: Get all approved mentees from the last 7 or 14 days
    const approvedMentees = await this.conProfilesService.findAll({
      'RecordType.DeveloperName': UserType.MENTEE,
      Profile_Status__c: ConnectProfileStatus.APPROVED,
      Profile_First_Approved_At__c: {
        $eq: jsforce.SfDate.toDateLiteral(approvedDate),
      },
    })

    const approvedMenteeIds = approvedMentees.map(
      (mentee) => mentee.props.userId
    )

    if (approvedMenteeIds.length === 0) return []

    // 2nd Step: Get all mentorship matches where the mentee is one of the approved mentees above
    const mentorshipMatches = await this.conMentorshipMatchesService.findAll({
      'Mentee__r.id': {
        $in: approvedMenteeIds,
      },
    })

    const mentorshipMatchMenteeIds = mentorshipMatches.map(
      (match) => match.props.menteeId
    )

    // 3rd Step: Find approved mentees that do not have a mentorship match
    const unmatchedMenteeIds = difference(
      approvedMenteeIds,
      mentorshipMatchMenteeIds
    )

    // 4th Step: Return approved mentees that do not have a mentorship match
    if (unmatchedMenteeIds.length > 0) {
      return approvedMentees.filter((mentee) =>
        unmatchedMenteeIds.includes(mentee.props.userId)
      )
    }

    return []
  }

  async getUnmatchedMenteesFor45Days() {
    const approvedDate = new Date()
    approvedDate.setDate(approvedDate.getDate() - 45)

    // 1st Step: Get all mentees that have been approved 45 days ago
    const menteesApproved45DaysAgo = await this.conProfilesService.findAll({
      'RecordType.DeveloperName': UserType.MENTEE,
      Profile_Status__c: ConnectProfileStatus.APPROVED,
      Profile_First_Approved_At__c: {
        $eq: jsforce.SfDate.toDateLiteral(approvedDate),
      },
      Subscribed_to_CON_Marketing_Emails__c: true,
    })

    const approvedMenteeIds = menteesApproved45DaysAgo.map(
      (mentee) => mentee.props.userId
    )

    if (approvedMenteeIds.length === 0) return []

    // 2nd Step: Find all Mentees that have a mentorship match or waiting applied to extract them later
    const mentorshipMatches = await this.conMentorshipMatchesService.findAll({
      Status__c: {
        $in: [MentorshipMatchStatus.APPLIED, MentorshipMatchStatus.ACCEPTED],
      },
      'Mentee__r.id': {
        $in: approvedMenteeIds,
      },
    })

    const mentorshipMatchMenteeIds = mentorshipMatches.map(
      (match) => match.props.menteeId
    )

    // 3rd Step: Find the list of mentees we need by extracting mentees with
    // ACCEPTED or APPLIED mentorships, by extracting 2nd list from 1st list
    const unmatchedMenteeIds = difference(
      approvedMenteeIds,
      mentorshipMatchMenteeIds
    )

    // 4th Step: Get the mentee profiles of those mentee ids in the 3rd step
    if (unmatchedMenteeIds.length > 0) {
      return menteesApproved45DaysAgo.filter((mentee) =>
        unmatchedMenteeIds.includes(mentee.props.userId)
      )
    }

    return []
  }

  async getThreeMonthsOldMentorshipMatches() {
    const threeMonthsOldMentorshipMatches =
      await this.conMentorshipMatchesService.findAll({
        Status__c: MentorshipMatchStatus.ACCEPTED,
        Mentorship_Match_Age_In_Days__c: 90,
      })

    const reducedMatches = threeMonthsOldMentorshipMatches.reduce(
      (acc, match) => {
        acc[match.props.id] = {
          menteeId: match.props.menteeId,
          mentorId: match.props.mentorId,
        }

        return acc
      },
      {}
    )

    const menteeIds = threeMonthsOldMentorshipMatches.map(
      (match) => match.props.menteeId
    )
    const mentorIds = threeMonthsOldMentorshipMatches.map(
      (match) => match.props.mentorId
    )

    let matchConProfiles = []

    if ([...menteeIds, ...mentorIds].length > 0) {
      matchConProfiles = await this.conProfilesService.findAll({
        'Contact__r.Id': {
          $in: [...menteeIds, ...mentorIds],
        },
        Subscribed_to_CON_Marketing_Emails__c: true,
      })
    }

    /**
     * Some holy moly is happening here. The idea is, transforming the map of mentorship matches
     * to a map of mentorship matches with the first names and emails of the mentee and mentor.
     * See here for lodash/transform: https://lodash.com/docs/4.17.15#transform
     */
    const transformedReducedMatches = transform(
      reducedMatches,
      (result, value, key) => {
        const mentee = matchConProfiles.find(
          (profile) => profile?.props.userId === value['menteeId']
        )

        const mentor = matchConProfiles.find(
          (profile) => profile?.props.userId === value['mentorId']
        )

        result[key] = {
          menteeFirstName: mentee?.props.firstName,
          menteeEmail: mentee?.props.email,
          mentorFirstName: mentor?.props.firstName,
          mentorEmail: mentor?.props.email,
        }
      },
      []
    )

    return transformedReducedMatches
  }

  async getMentorsAndMenteesWithoutMentoringSessionsLogged({
    mentorshipMatchAgeInDays,
  }: {
    mentorshipMatchAgeInDays: number
  }) {
    // Step 1: Get all mentorship matches that are accepted and have the age of the mentorship match in days
    const mentorshipMatches = await this.conMentorshipMatchesService.findAll({
      Status__c: MentorshipMatchStatus.ACCEPTED,
      Mentorship_Match_Age_In_Days__c: mentorshipMatchAgeInDays,
    })

    const mentorshipMatchesWithSessionsCount = {} as Record<
      string,
      {
        mentorshipMatchId: string
        menteeId: string
        mentorId: string
        mentoringSessionsCount: number
        matchMadeActiveOn: Date
      }
    >
    const menteeIdsWithoutMentoringSessionsLogged = []
    const mentorIdsWithoutMentoringSessionsLogged = []

    // Step 2: Fill the needed objects/arrays for the next steps
    for (const match of mentorshipMatches) {
      // Step 2.1: Get all mentoring sessions for the mentorship match
      const mentoringSessions = await this.conMentoringSessionsService.findAll({
        Mentee__c: match.props.menteeId,
        Mentor__c: match.props.mentorId,
      })

      // Step 2.2: Fill the object with the mentorship match id as key and the mentee id, mentor id and the count of mentoring sessions
      mentorshipMatchesWithSessionsCount[match.props.id] = {
        mentorshipMatchId: match.props.id,
        menteeId: match.props.menteeId,
        mentorId: match.props.mentorId,
        mentoringSessionsCount: mentoringSessions.length,
        matchMadeActiveOn: match.props.matchMadeActiveOn,
      }

      // Step 2.3: Fill the arrays with the mentee and mentor ids that have 0 mentoring sessions
      if (mentoringSessions.length === 0) {
        menteeIdsWithoutMentoringSessionsLogged.push(match.props.menteeId)
        mentorIdsWithoutMentoringSessionsLogged.push(match.props.mentorId)
      }
    }

    let matchConProfiles = []

    // Step 3: Get the profiles of the mentees and mentors that have 0 mentoring sessions
    if (
      [
        ...menteeIdsWithoutMentoringSessionsLogged,
        ...mentorIdsWithoutMentoringSessionsLogged,
      ].length > 0
    ) {
      matchConProfiles = await this.conProfilesService.findAll({
        'Contact__r.Id': {
          $in: [
            ...menteeIdsWithoutMentoringSessionsLogged,
            ...mentorIdsWithoutMentoringSessionsLogged,
          ],
        },
      })
    }

    /**
     * Some holy moly is happening here. The idea is, to filter the mentorship matches with 0 mentoring sessions first
     * then transform the map of mentorship matches to a map of mentorship matches with the first names and emails of the mentee and mentor.
     * See here for lodash/transform: https://lodash.com/docs/4.17.15#transform
     */
    const mentorshipMatchesWithMentorAndMenteeDetails = transform(
      filter(
        mentorshipMatchesWithSessionsCount,
        (match) => match.mentoringSessionsCount === 0
      ),
      (result, value, key) => {
        const mentee = matchConProfiles.find(
          (profile) => profile?.props.userId === value['menteeId']
        )

        const mentor = matchConProfiles.find(
          (profile) => profile?.props.userId === value['mentorId']
        )

        result[key] = {
          mentorshipMatchId: value.mentorshipMatchId,
          menteeFirstName: mentee?.props.firstName,
          menteeEmail: mentee?.props.email,
          mentorFirstName: mentor?.props.firstName,
          mentorEmail: mentor?.props.email,
          matchMadeActiveOn: value.matchMadeActiveOn
            ? formatDate(value.matchMadeActiveOn, 'PPP')
            : '',
        }
      },
      []
    )

    return mentorshipMatchesWithMentorAndMenteeDetails
  }

  async getPendingMenteeApplications() {
    const pendingMentorshipApplications =
      await this.conMentorshipMatchesService.findAll({
        Mentorship_Match_Age_In_Days__c: 14,
        Status__c: MentorshipMatchStatus.APPLIED,
      })

    const reducedMatches = pendingMentorshipApplications.reduce(
      (acc, match) => {
        acc[match.props.id] = {
          matchDate: match.props.createdAt,
          menteeId: match.props.menteeId,
          mentorId: match.props.mentorId,
        }

        return acc
      },
      {}
    )

    const menteeIds = pendingMentorshipApplications.map(
      (match) => match.props.menteeId
    )
    const mentorIds = pendingMentorshipApplications.map(
      (match) => match.props.mentorId
    )

    let matchConProfiles: ConProfileEntity[] = []

    if ([...menteeIds, ...mentorIds].length > 0) {
      matchConProfiles = await this.conProfilesService.findAll({
        'Contact__r.Id': {
          $in: [...menteeIds, ...mentorIds],
        },
      })
    }

    /**
     * Some holy moly is happening here. The idea is, transforming the map of mentorship matches
     * to a map of mentorship matches with the first names and emails of the mentee and mentor.
     * See here for lodash/transform: https://lodash.com/docs/4.17.15#transform
     */
    const transformedReducedMatches = transform(
      reducedMatches,
      (result, value, key) => {
        const mentee = matchConProfiles.find(
          (profile) => profile?.props.userId === value['menteeId']
        )

        const mentor = matchConProfiles.find(
          (profile) => profile?.props.userId === value['mentorId']
        )

        result[key] = {
          mentorEmail: mentor?.props.email,
          mentorFirstName: mentor?.props.firstName,
          menteeFirstName: mentee?.props.firstName,
          menteeFullName: mentee?.props.fullName,
          matchDate: formatDate(new Date(value['matchDate']), 'PPP'),
        }
      },
      []
    )

    return transformedReducedMatches
  }

  async sendCompleteProfileReminder({
    userType,
    email,
    firstName,
  }: {
    userType: UserType
    email: string
    firstName: string
  }) {
    const sfEmailTemplateDeveloperName =
      userType === UserType.MENTOR
        ? 'Mentor_Profile_Completion_Reminder_1711714790523'
        : userType === UserType.MENTEE
        ? 'Mentee_Profile_Completion_Reminder_1695974601621'
        : null

    const template = await this.emailTemplatesService.getEmailTemplate(
      sfEmailTemplateDeveloperName
    )

    if (!template) {
      throw new Error(
        `Email template not found: ${sfEmailTemplateDeveloperName}`
      )
    }

    const sanitizedHtml = template.HtmlValue.replace(
      /{{{Recipient\.FirstName}}}/g,
      `${firstName}`
    )

    const params = {
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: isProductionOrDemonstration()
        ? email
        : this.config.get('NX_DEV_MODE_EMAIL_RECIPIENT'),
      bcc: SENDER_EMAIL,
      subject: template.Subject,
      html: sanitizedHtml,
    }

    try {
      await this.transporter.sendMail(params)
      console.log('Email sent successfully')
    } catch (err) {
      console.error('Error sending email:', err)
    }

    return { message: 'Email sent' }
  }

  async sendApplyToMentorReminder({
    email,
    firstName,
    isSecondReminder = false,
  }) {
    const sfEmailTemplateDeveloperName = !isSecondReminder
      ? 'Mentee_Apply_To_A_Mentor_Reminder_1_1695975263767'
      : 'Mentee_Apply_To_A_Mentor_Reminder_2_1695975868066'

    const template = await this.emailTemplatesService.getEmailTemplate(
      sfEmailTemplateDeveloperName
    )

    if (!template) {
      throw new Error(
        `Email template not found: ${sfEmailTemplateDeveloperName}`
      )
    }

    const sanitizedSubject = template.Subject.replace(
      /\${menteeFirstName}/g,
      `${firstName}`
    )

    const sanitizedHtml = template.HtmlValue.replace(
      /\${menteeFirstName}/g,
      `${firstName}`
    ).replace(/{{{Recipient\.FirstName}}}/g, `${firstName}`)

    const params = {
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: isProductionOrDemonstration()
        ? email
        : this.config.get('NX_DEV_MODE_EMAIL_RECIPIENT'),
      bcc: SENDER_EMAIL,
      subject: sanitizedSubject,
      html: sanitizedHtml,
    }

    try {
      await this.transporter.sendMail(params)
      console.log('Email sent successfully')
    } catch (err) {
      console.error('Error sending email:', err)
    }

    return { message: 'Email sent' }
  }

  async sendMentorshipFollowUpReminder({
    email,
    firstName,
    menteeOrMentorFirstName,
    userType,
  }) {
    const sfEmailTemplateDeveloperName =
      userType === UserType.MENTOR
        ? 'Mentor_Follow_Up_On_Long_Term_Mentorship_1711363451370'
        : 'Mentee_Follow_Up_On_The_Long_Term_Mentorship_1711363823265'

    const template = await this.emailTemplatesService.getEmailTemplate(
      sfEmailTemplateDeveloperName
    )

    if (!template) {
      throw new Error(
        `Email template not found: ${sfEmailTemplateDeveloperName}`
      )
    }

    const sanitizedHtml = template.HtmlValue.replace(
      /{{{Recipient\.FirstName}}}/g,
      firstName
    )
      .replace(/\${menteeFirstName}/g, menteeOrMentorFirstName)
      .replace(/\${mentorFirstName}/g, menteeOrMentorFirstName)

    const params = {
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: isProductionOrDemonstration()
        ? email
        : this.config.get('NX_DEV_MODE_EMAIL_RECIPIENT'),
      bcc: SENDER_EMAIL,
      subject: template.Subject,
      html: sanitizedHtml,
    }

    try {
      await this.transporter.sendMail(params)
      console.log('Email sent successfully')
    } catch (err) {
      console.error('Error sending email:', err)
    }

    return { message: 'Email sent' }
  }

  async sendMenteesPlatformAndNewMentorsReminder({ email, firstName }) {
    const sfEmailTemplateDeveloperName =
      'Mentee_Platform_And_New_Mentors_Reminder_1711367982313'

    const template = await this.emailTemplatesService.getEmailTemplate(
      sfEmailTemplateDeveloperName
    )

    if (!template) {
      throw new Error(
        `Email template not found: ${sfEmailTemplateDeveloperName}`
      )
    }

    const sanitizedHtml = template.HtmlValue.replace(
      /{{{Recipient.FirstName}}}/g,
      `${firstName}`
    )

    const params = {
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: isProductionOrDemonstration()
        ? email
        : this.config.get('NX_DEV_MODE_EMAIL_RECIPIENT'),
      bcc: SENDER_EMAIL,
      subject: template.Subject,
      html: sanitizedHtml,
    }

    try {
      await this.transporter.sendMail(params)
      console.log('Email sent successfully')
    } catch (err) {
      console.error('Error sending email:', err)
    }

    return { message: 'Email sent' }
  }

  async sendLogMentoringSessionsReminder(
    {
      mentorshipMatchId,
      menteeFirstName,
      menteeEmail,
      mentorFirstName,
      mentorEmail,
      matchMadeActiveOn,
    },
    mentorshipMatchAgeInDays
  ) {
    const sfMenteeEmailTemplateDeveloperName =
      mentorshipMatchAgeInDays === 14
        ? 'Mentee_Log_Mentoring_Sessions_Reminder_1_1711114670729'
        : 'Mentee_Log_Mentoring_Sessions_Reminder_2_1711115347143'

    const sfMentorEmailTemplateDeveloperName =
      mentorshipMatchAgeInDays === 14
        ? 'Mentor_Log_Mentoring_Sessions_Reminder_1_1711110740940'
        : 'Mentor_Log_Mentoring_Sessions_Reminder_2_1711112496532'

    const menteeTemplate = await this.emailTemplatesService.getEmailTemplate(
      sfMenteeEmailTemplateDeveloperName
    )

    const mentorTemplate = await this.emailTemplatesService.getEmailTemplate(
      sfMentorEmailTemplateDeveloperName
    )

    if (!menteeTemplate || !mentorTemplate) {
      throw new Error(
        `Email templates not found: ${sfMenteeEmailTemplateDeveloperName} - ${sfMentorEmailTemplateDeveloperName}`
      )
    }

    const menteeSanitizedSubject = menteeTemplate.Subject.replace(
      /\${mentorFirstName}/g,
      mentorFirstName
    )

    const mentorSanitizedSubject = mentorTemplate.Subject.replace(
      /\${menteeFirstName}/g,
      menteeFirstName
    )

    const menteeSanitizedHtml = menteeTemplate.HtmlValue.replace(
      /\${mentorFirstName}/g,
      mentorFirstName
    )
      .replace(/{{{Recipient.FirstName}}}/g, menteeFirstName)
      .replace(/\${matchMadeActiveOn}/g, matchMadeActiveOn)

    const mentorSanitizedHtml = mentorTemplate.HtmlValue.replace(
      /\${menteeFirstName}/g,
      menteeFirstName
    )
      .replace(/{{{Recipient.FirstName}}}/g, mentorFirstName)
      .replace(/\${matchMadeActiveOn}/g, matchMadeActiveOn)
      .replace(
        /\${logMentoringSessionUrl}/g,
        `https://connect.redi-school.org/app/mentorships/${mentorshipMatchId}`
      )

    const menteeParams = {
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: isProductionOrDemonstration()
        ? menteeEmail
        : this.config.get('NX_DEV_MODE_EMAIL_RECIPIENT'),
      bcc: SENDER_EMAIL,
      subject: menteeSanitizedSubject,
      html: menteeSanitizedHtml,
    }

    const mentorParams = {
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: isProductionOrDemonstration()
        ? mentorEmail
        : this.config.get('NX_DEV_MODE_EMAIL_RECIPIENT'),
      bcc: SENDER_EMAIL,
      subject: mentorSanitizedSubject,
      html: mentorSanitizedHtml,
    }

    try {
      await this.transporter.sendMail(menteeParams)
      console.log('Mentee email sent successfully')
    } catch (err) {
      console.error('Error sending mentee email:', err)
    }

    try {
      await this.transporter.sendMail(mentorParams)
      console.log('Mentor email sent successfully')
    } catch (err) {
      console.error('Error sending mentor email:', err)
    }

    return { message: 'Emails sent' }
  }

  async sendMentorPendingApplicationReminder({ match }) {
    const sfEmailTemplateDeveloperName =
      'Mentor_Pending_Mentorship_Application_Reminder_1711365045962'

    const template = await this.emailTemplatesService.getEmailTemplate(
      sfEmailTemplateDeveloperName
    )

    if (!template) {
      throw new Error(
        `Email template not found: ${sfEmailTemplateDeveloperName}`
      )
    }

    const sanitizedSubject = template.Subject.replace(
      /\${menteeFullName}/g,
      `${match.menteeFullName}`
    )

    const sanitizedHtml = template.HtmlValue.replace(
      /\${menteeFullName}/g,
      `${match.menteeFullName}`
    )
      .replace(/{{{Recipient.FirstName}}}/g, `${match?.mentorFirstName}`)
      .replace(/\${matchRequestedDate}/g, `${match.matchDate}`)
      .replace(/\${menteeFirstName}/g, `${match.menteeFirstName}`)

    const params = {
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: isProductionOrDemonstration()
        ? match.mentorEmail
        : this.config.get('NX_DEV_MODE_EMAIL_RECIPIENT'),
      bcc: SENDER_EMAIL,
      subject: sanitizedSubject,
      html: sanitizedHtml,
    }

    try {
      await this.transporter.sendMail(params)
      console.log('Email sent successfully')
    } catch (err) {
      console.error('Error sending email:', err)
    }

    return { message: 'Email sent' }
  }
}
