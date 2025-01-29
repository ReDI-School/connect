import { Controller, Get, UseGuards } from '@nestjs/common'
import { UserType } from '@talent-connect/common-types'
import { CronjobAuthGuard } from '../auth/cronjob-auth.guard'
import { ReminderEmailsService } from './reminder-emails.service'

@Controller('reminder-emails')
@UseGuards(CronjobAuthGuard)
export class ReminderEmailsController {
  constructor(private readonly reminderEmailsService: ReminderEmailsService) {}

  @Get('/s3cr3t-3ndp01nt-t0-tr1gg3r-r3m1nd3r5/mentors-complete-profile')
  async sendMentorCompleteProfileReminders() {
    const mentorsWithDraftingProfile =
      await this.reminderEmailsService.getDraftingConProfiles({
        userType: UserType.MENTOR,
      })

    if (mentorsWithDraftingProfile.length > 0) {
      // send reminder emails
      mentorsWithDraftingProfile.forEach(async (mentor) => {
        await this.reminderEmailsService.sendCompleteProfileReminder({
          userType: UserType.MENTOR,
          email: mentor.props.email,
          firstName: mentor.props.firstName,
        })
      })
    }

    return {
      message: `Complete Profile Reminder Emails sent to Mentors: ${mentorsWithDraftingProfile.length}`,
    }
  }

  @Get('/s3cr3t-3ndp01nt-t0-tr1gg3r-r3m1nd3r5/mentees-complete-profile')
  async sendMenteeCompleteProfileReminders() {
    const menteesWithDrafingProfile =
      await this.reminderEmailsService.getDraftingConProfiles({
        userType: UserType.MENTEE,
      })

    if (menteesWithDrafingProfile.length > 0) {
      // send reminder emails
      menteesWithDrafingProfile.forEach(async (mentee) => {
        await this.reminderEmailsService.sendCompleteProfileReminder({
          userType: UserType.MENTEE,
          email: mentee.props.email,
          firstName: mentee.props.firstName,
        })
      })
    }

    return {
      message: `Complete Profile Reminder Emails Sent to Mentees: ${menteesWithDrafingProfile.length}`,
    }
  }

  @Get('/s3cr3t-3ndp01nt-t0-tr1gg3r-r3m1nd3r5/mentees-apply-to-mentor')
  async sendMenteeApplyToMentorReminders() {
    const firstReminderMentees =
      await this.reminderEmailsService.getApprovedMenteesWithNoMentorApplicationsByDays(
        {
          daysAgo: '7d',
        }
      )

    if (firstReminderMentees.length > 0) {
      // send reminder emails
      firstReminderMentees.forEach(async (mentee) => {
        await this.reminderEmailsService.sendApplyToMentorReminder({
          email: mentee.props.email,
          firstName: mentee.props.firstName,
        })
      })
    }

    const secondReminderMentees =
      await this.reminderEmailsService.getApprovedMenteesWithNoMentorApplicationsByDays(
        {
          daysAgo: '14d',
        }
      )

    if (secondReminderMentees.length > 0) {
      // send reminder emails
      secondReminderMentees.forEach(async (mentee) => {
        await this.reminderEmailsService.sendApplyToMentorReminder({
          email: mentee.props.email,
          firstName: mentee.props.firstName,
          isSecondReminder: true,
        })
      })
    }

    return {
      message: `Apply To a Mentor Reminder Emails sent: ${firstReminderMentees.length} first reminders, ${secondReminderMentees.length} second reminders`,
    }
  }

  @Get('/s3cr3t-3ndp01nt-t0-tr1gg3r-r3m1nd3r5/mentorship-follow-up')
  async sendMentorshipFollowUpReminders() {
    const threeMonthsOldMentorshipMatches =
      await this.reminderEmailsService.getThreeMonthsOldMentorshipMatches()

    if (Object.keys(threeMonthsOldMentorshipMatches).length > 0) {
      Object.keys(threeMonthsOldMentorshipMatches).forEach(async (match) => {
        // Send reminder email to mentee
        await this.reminderEmailsService.sendMentorshipFollowUpReminder({
          userType: UserType.MENTEE,
          email: threeMonthsOldMentorshipMatches[match].menteeEmail,
          firstName: threeMonthsOldMentorshipMatches[match].menteeFirstName,
          menteeOrMentorFirstName:
            threeMonthsOldMentorshipMatches[match].mentorFirstName,
        })

        // Send reminder email to mentor
        await this.reminderEmailsService.sendMentorshipFollowUpReminder({
          userType: UserType.MENTOR,
          email: threeMonthsOldMentorshipMatches[match].mentorEmail,
          firstName: threeMonthsOldMentorshipMatches[match].mentorFirstName,
          menteeOrMentorFirstName:
            threeMonthsOldMentorshipMatches[match].menteeFirstName,
        })
      })
    }

    return {
      message: `Mentorship Follow-up Reminder Emails Sent: ${
        Object.keys(threeMonthsOldMentorshipMatches).length
      }`,
    }
  }

  @Get('/s3cr3t-3ndp01nt-t0-tr1gg3r-r3m1nd3r5/mentees-platform-and-new-mentors')
  async sendUnmatchedMenteesReminder() {
    const unmatchedMenteesFor45Days =
      await this.reminderEmailsService.getUnmatchedMenteesFor45Days()

    if (Object.keys(unmatchedMenteesFor45Days).length > 0) {
      unmatchedMenteesFor45Days.forEach(async (mentee) => {
        // Send reminder email to mentee
        await this.reminderEmailsService.sendMenteesPlatformAndNewMentorsReminder(
          {
            email: mentee.props.email,
            firstName: mentee.props.firstName,
          }
        )
      })
    }

    return {
      message: `Platform Update Reminder Emails Sent to Mentees: ${unmatchedMenteesFor45Days.length}`,
    }
  }

  @Get('/s3cr3t-3ndp01nt-t0-tr1gg3r-r3m1nd3r5/pending-mentorships')
  async sendPendingMenteeApplicationReminder() {
    const pendingMenteeApplications =
      await this.reminderEmailsService.getPendingMenteeApplications()

    if (Object.keys(pendingMenteeApplications).length > 0) {
      Object.keys(pendingMenteeApplications).forEach(async (match) => {
        // Send reminder email to mentor
        await this.reminderEmailsService.sendMentorPendingApplicationReminder({
          match: pendingMenteeApplications[match],
        })
      })
    }

    return {
      message: `Pending Mentee Applications Reminder emails sent to Mentors: ${
        Object.keys(pendingMenteeApplications).length
      }`,
    }
  }

  @Get('/s3cr3t-3ndp01nt-t0-tr1gg3r-r3m1nd3r5/mentoring-sessions-logging')
  async sendMentoringSessionsLoggingReminder() {
    const mentorshipMatchesWithMentorAndMenteeDetails_2weeks =
      await this.reminderEmailsService.getMentorsAndMenteesWithoutMentoringSessionsLogged(
        { mentorshipMatchAgeInDays: 14 }
      )

    const mentorshipMatchesWithMentorAndMenteeDetails_4weeks =
      await this.reminderEmailsService.getMentorsAndMenteesWithoutMentoringSessionsLogged(
        { mentorshipMatchAgeInDays: 28 }
      )

    if (
      Object.keys(mentorshipMatchesWithMentorAndMenteeDetails_2weeks).length > 0
    ) {
      // send reminder emails
      Object.keys(mentorshipMatchesWithMentorAndMenteeDetails_2weeks).forEach(
        async (key) => {
          await this.reminderEmailsService.sendLogMentoringSessionsReminder(
            mentorshipMatchesWithMentorAndMenteeDetails_2weeks[key],
            14
          )
        }
      )
    }

    if (
      Object.keys(mentorshipMatchesWithMentorAndMenteeDetails_4weeks).length > 0
    ) {
      // send reminder emails
      Object.keys(mentorshipMatchesWithMentorAndMenteeDetails_4weeks).forEach(
        async (key) => {
          await this.reminderEmailsService.sendLogMentoringSessionsReminder(
            mentorshipMatchesWithMentorAndMenteeDetails_4weeks[key],
            28
          )
        }
      )
    }

    return {
      message: `Mentoring Session Loggging Reminder emails sent: 1st: ${
        Object.keys(mentorshipMatchesWithMentorAndMenteeDetails_2weeks).length
      }, 2nd: ${
        Object.keys(mentorshipMatchesWithMentorAndMenteeDetails_4weeks).length
      }`,
    }
  }
}
