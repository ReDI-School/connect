'use strict'

import { buildFrontendUrl } from '../build-frontend-url'

const aws = require('aws-sdk')
const Rx = require('rxjs')
const mjml2html = require('mjml')
const nodemailer = require('nodemailer')
const fs = require('fs')
const path = require('path')

const config = {
  accessKeyId: process.env.NX_EMAILER_AWS_ACCESS_KEY,
  secretAccessKey: process.env.NX_EMAILER_AWS_SECRET_KEY,
  region: process.env.NX_EMAILER_AWS_REGION,
}

const ses = new aws.SES(config)

const transporter = nodemailer.createTransport({
  SES: ses,
})

const isProductionOrDemonstration = () =>
  ['production', 'demonstration', 'staging'].includes(process.env.NODE_ENV)

export const sendEmail = Rx.bindNodeCallback(ses.sendEmail.bind(ses))
export const sendMjmlEmail = Rx.bindNodeCallback(
  transporter.sendMail.bind(transporter)
)

// TODO: I'm a duplicate of getSenderDetails in apps/api/lib/email/email.js, keep me in sync
const getSenderDetails = (rediLocation) => {
  const isMalmoLocation = rediLocation === 'MALMO'
  const senderName = isMalmoLocation
    ? 'ReDI Malmö Team'
    : 'ReDI Talent Success Team'
  const senderEmail = isMalmoLocation
    ? 'career.sweden@redi-school.org'
    : 'career@redi-school.org'
  return { senderName, senderEmail }
}

export const sendEmailFactory = (to, subject, body, rediLocation) => {
  let toSanitized = isProductionOrDemonstration() ? to : ''
  if (process.env.NX_DEV_MODE_EMAIL_RECIPIENT) {
    toSanitized = process.env.NX_DEV_MODE_EMAIL_RECIPIENT
  }

  const { senderName, senderEmail } = getSenderDetails(rediLocation)

  return sendEmail({
    Source: `${senderName} <${senderEmail}>`,
    Destination: {
      ToAddresses: [toSanitized],
      BccAddresses: [`${senderName} <${senderEmail}>`],
    },
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: body,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: buildSubjectLine(subject, process.env.NODE_ENV),
      },
    },
  })
}

export const sendMjmlEmailFactory = ({ to, subject, html, rediLocation }) => {
  let toSanitized = isProductionOrDemonstration() ? to : ''
  if (process.env.NX_DEV_MODE_EMAIL_RECIPIENT) {
    toSanitized = process.env.NX_DEV_MODE_EMAIL_RECIPIENT
  }

  const { senderName, senderEmail } = getSenderDetails(rediLocation)

  return sendMjmlEmail({
    from: `${senderName} <${senderEmail}>`,
    to: toSanitized,
    bcc: [`${senderName} <${senderEmail}>`],
    subject: buildSubjectLine(subject, process.env.NODE_ENV),
    html: html,
  })
}

function buildSubjectLine(subject, env) {
  switch (env) {
    case 'production':
      return subject

    case 'demonstration':
      return `[DEMO ENVIRONMENT] ${subject}`

    default:
      return `[DEV ENVIRONMENT] ${subject}`
  }
}

const convertTemplateToHtml = (rediLocation, templateString) => {
  if (rediLocation) rediLocation = rediLocation.toLowerCase()
  const defaultTemplateFileName = `${templateString}.mjml`
  const locationSpecificTemplateFileName = `${templateString}.${rediLocation}.mjml`
  const template = getMostSpecificTemplate(
    locationSpecificTemplateFileName,
    defaultTemplateFileName
  )
  const parsedTemplate = mjml2html(template, {
    filePath: path.resolve(__dirname, 'assets', 'email', 'templates'),
  })
  return parsedTemplate.html
}

const getMostSpecificTemplate = (
  locationSpecificTemplateFileName,
  defaultTemplateFileName
) => {
  try {
    return getTemplateContentsOrFail(locationSpecificTemplateFileName)
  } catch (error) {
    return getTemplateContentsOrFail(defaultTemplateFileName)
  }
}

const getTemplateContentsOrFail = (templateFileName) => {
  return fs.readFileSync(
    path.resolve(__dirname, 'assets', 'email', 'templates', templateFileName),
    'utf-8'
  )
}

const sendReportProblemEmailTemplate = fs.readFileSync(
  path.resolve(
    __dirname,
    'assets',
    'email',
    'templates',
    'send-problem-report.mjml'
  ),
  'utf-8'
)
const sendReportProblemEmailParsed = mjml2html(sendReportProblemEmailTemplate, {
  filePath: path.resolve(__dirname, 'assets', 'email', 'templates'),
})

export const sendReportProblemEmail = ({
  sendingUserEmail,
  message,
  rediLocation,
}) => {
  const { senderEmail, senderName } = getSenderDetails(rediLocation)
  const careerTeamEmail = `${senderName} <${senderEmail}>`

  const html = sendReportProblemEmailParsed.html
    .replace(/\${sendingUserEmail}/g, sendingUserEmail)
    .replace(/\${message}/g, message)
  return sendMjmlEmailFactory({
    to: careerTeamEmail,
    subject: 'New problem report',
    html: html,
    rediLocation,
  })
}

export const sendPendingReviewDeclinedEmail = ({
  recipient,
  firstName,
  rediLocation,
}) => {
  const sendPendingReviewDeclinedEmailParsed = convertTemplateToHtml(
    rediLocation,
    'pending-review-declined-email'
  )

  const html = sendPendingReviewDeclinedEmailParsed.replace(
    /\${firstName}/g,
    firstName
  )
  return sendMjmlEmailFactory({
    to: recipient,
    subject: 'ReDI Connect: Your user registration was declined',
    html: html,
    rediLocation,
  })
}

export const sendNotificationToMentorThatPendingApplicationExpiredSinceOtherMentorAccepted =
  ({ recipient, mentorName, menteeName, rediLocation }) => {
    const sendMenteePendingReviewAcceptedEmailParsed = convertTemplateToHtml(
      rediLocation,
      'expired-notification-application'
    )
    const html = sendMenteePendingReviewAcceptedEmailParsed
      .replace(/\${mentorName}/g, mentorName)
      .replace(/\${menteeName}/g, menteeName)
    return sendMjmlEmailFactory({
      to: recipient,
      subject: `${menteeName}’s mentee application to you has expired!`,
      html: html,
      rediLocation,
    })
  }

export const sendMenteePendingReviewAcceptedEmail = ({
  recipient,
  firstName,
  rediLocation,
}) => {
  const loginPageUrl = `${buildFrontendUrl(
    process.env.NODE_ENV,
    rediLocation
  )}/front/login/`
  const faqPageUrl = `${buildFrontendUrl(
    process.env.NODE_ENV,
    rediLocation
  )}/faq/`

  const html = convertTemplateToHtml(rediLocation, 'welcome-to-redi-mentee')
    .replace(/\${firstName}/g, firstName)
    .replace(/\${loginPageUrl}/g, loginPageUrl)
    .replace(/\${faqPageUrl}/g, faqPageUrl)

  return sendMjmlEmailFactory({
    to: recipient,
    subject: 'Your ReDI Connect profile is now activated!',
    html: html,
    rediLocation,
  })
}

export const sendMentorPendingReviewAcceptedEmail = ({
  recipient,
  firstName,
  rediLocation,
}) => {
  const loginPageUrl = `${buildFrontendUrl(
    process.env.NODE_ENV,
    rediLocation
  )}/front/login/`
  const sendMentorPendingReviewAcceptedEmailParsed = convertTemplateToHtml(
    rediLocation,
    'welcome-to-redi-mentor'
  )
  const html = sendMentorPendingReviewAcceptedEmailParsed
    .replace(/\${firstName}/g, firstName)
    .replace(/\${loginPageUrl}/g, loginPageUrl)
  return sendMjmlEmailFactory({
    to: recipient,
    subject: 'Your ReDI Connect profile is now activated!',
    html: html,
    rediLocation,
  })
}

export const sendMenteeSignupCompleteEmail = ({
  recipient,
  firstName,
  rediLocation,
}) => {
  const loginPageUrl = `${buildFrontendUrl(
    process.env.NODE_ENV,
    rediLocation
  )}/front/login/`

  const html = convertTemplateToHtml(rediLocation, 'signup-complete-mentee')
    .replace(/\${firstName}/g, firstName)
    .replace(/\${loginPageUrl}/g, loginPageUrl)
  return sendMjmlEmailFactory({
    to: recipient,
    subject: 'Sign-up complete!',
    html,
    rediLocation,
  })
}

export const sendMentorSignupCompleteEmail = ({
  recipient,
  firstName,
  isPartnershipMentor,
  rediLocation,
}) => {
  const loginPageUrl = `${buildFrontendUrl(
    process.env.NODE_ENV,
    rediLocation
  )}/front/login/`

  const templateFile =
    isPartnershipMentor === true
      ? 'signup-complete-mentor-partnership'
      : 'signup-complete-mentor'

  const html = convertTemplateToHtml(rediLocation, templateFile)
    .replace(/\${firstName}/g, firstName)
    .replace(/\${loginPageUrl}/g, loginPageUrl)
  return sendMjmlEmailFactory({
    to: recipient,
    subject: 'Sign-up complete!',
    html,
    rediLocation,
  })
}

export const sendMentoringSessionLoggedEmail = ({
  recipient,
  mentorName,
  menteeFirstName,
  rediLocation,
}) => {
  const loginUrl = `${buildFrontendUrl(
    process.env.NODE_ENV,
    rediLocation
  )}/front/login`
  const sendMentoringSessionLoggedEmailParsed = convertTemplateToHtml(
    rediLocation,
    'mentoring-session-logged-email'
  )
  const html = sendMentoringSessionLoggedEmailParsed
    .replace(/\${mentorName}/g, mentorName)
    .replace(/\${menteeFirstName}/g, menteeFirstName)
    .replace(/\${loginUrl}/g, loginUrl)
  return sendMjmlEmailFactory({
    to: recipient,
    subject:
      'Thank you for logging your session(s) with ${menteeFirstName}!'.replace(
        /\${menteeFirstName}/g,
        menteeFirstName
      ),
    html: html,
    rediLocation,
  })
}

export const sendMentorCancelledMentorshipNotificationEmail = ({
  recipient,
  firstName,
  rediLocation,
}) => {
  const sendMentorCancelledMentorshipNotificationEmailParsed =
    convertTemplateToHtml(rediLocation, 'mentorship-cancelation-email-mentee')
  const html = sendMentorCancelledMentorshipNotificationEmailParsed.replace(
    /\${firstName}/g,
    firstName
  )
  return sendMjmlEmailFactory({
    to: recipient,
    subject: 'Important Update: ReDI Mentorship Cancellation',
    html: html,
    rediLocation,
  })
}

export const sendToMentorConfirmationOfMentorshipCancelled = ({
  recipient,
  mentorFirstName,
  menteeFullName,
  rediLocation,
}) => {
  const sendMentorCancelledMentorshipNotificationEmailParsed =
    convertTemplateToHtml(rediLocation, 'mentorship-cancelation-email-mentor')
  const html = sendMentorCancelledMentorshipNotificationEmailParsed
    .replace(/\${mentorFirstName}/g, mentorFirstName)
    .replace(/\${menteeFullName}/g, menteeFullName)
  return sendMjmlEmailFactory({
    to: recipient,
    subject: `Important Update: ReDI Mentorship Cancellation`,
    html: html,
    rediLocation,
  })
}

export const sendMentorshipCompletionEmailToMentor = ({
  recipient,
  mentorFirstName,
  menteeFirstName,
  rediLocation,
}) => {
  const sendMentorshipCompletionEmailToMentorParsed = convertTemplateToHtml(
    rediLocation,
    'complete-mentorship-for-mentor'
  )
  const html = sendMentorshipCompletionEmailToMentorParsed
    .replace(/\${mentorFirstName}/g, mentorFirstName)
    .replace(/\${menteeFirstName}/g, menteeFirstName)
  return sendMjmlEmailFactory({
    to: recipient,
    subject: `Your mentorship with ${menteeFirstName} is completed!`,
    html: html,
    rediLocation,
  })
}

export const sendMentorshipCompletionEmailToMentee = ({
  recipient,
  mentorFirstName,
  menteeFirstName,
  rediLocation,
}) => {
  const sendMentorshipCompletionEmailToMenteeParsed = convertTemplateToHtml(
    rediLocation,
    'complete-mentorship-for-mentee'
  )
  const html = sendMentorshipCompletionEmailToMenteeParsed
    .replace(/\${mentorFirstName}/g, mentorFirstName)
    .replace(/\${menteeFirstName}/g, menteeFirstName)
  return sendMjmlEmailFactory({
    to: recipient,
    subject: `Your mentorship with ${mentorFirstName} is completed!`,
    html: html,
    rediLocation,
  })
}

export const sendMentorshipRequestReceivedEmail = ({
  recipient,
  mentorName,
  menteeFullName,
  menteeRediLocation,
  rediLocation,
  applicationText,
}) => {
  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
  }

  const truncatedApplicationText = truncateText(applicationText, 250)

  const applicationsPageUrl = `${buildFrontendUrl(
    process.env.NODE_ENV,
    rediLocation
  )}/app/applications`

  const sendMentorshipRequestReceivedEmailParsed = convertTemplateToHtml(
    rediLocation,
    'mentorship-request-email'
  )
  const html = sendMentorshipRequestReceivedEmailParsed
    .replace(
      /\${locationNameFormatted}/g,
      formatLocationName(menteeRediLocation)
    )
    .replace(/\${mentorName}/g, mentorName)
    .replace(/\${menteeFullName}/g, menteeFullName)
    .replace(/\${applicationsPageUrl}/g, applicationsPageUrl)
    .replace(/\${menteeApplicationText}/g, truncatedApplicationText)
  return sendMjmlEmailFactory({
    to: recipient,
    subject: `You have received an application from ${menteeFullName}!`,
    html: html,
    rediLocation,
  })
}

export const sendMentorshipAcceptedEmail = ({
  recipient,
  mentorFirstName,
  mentorFullName,
  mentorEmail,
  menteeName,
  mentorReplyMessageOnAccept,
  rediLocation,
}) => {
  const sendMentorshipAcceptedEmailParsed = convertTemplateToHtml(
    rediLocation,
    'mentorship-acceptance-email'
  )
  const html = sendMentorshipAcceptedEmailParsed
    .replace(/\${mentorFirstName}/g, mentorFirstName)
    .replace(/\${mentorFullName}/g, mentorFullName)
    .replace(/\${mentorEmail}/g, mentorEmail)
    .replace(/\${menteeName}/g, menteeName)
    .replace(/\${mentorReplyMessageOnAccept}/g, mentorReplyMessageOnAccept)
  return sendMjmlEmailFactory({
    to: recipient,
    subject: `Congratulations! Mentor ${mentorFullName} has accepted your application, ${menteeName}!`,
    html: html,
    rediLocation,
  })
}

// TODO: I'm a duplicate of libs/shared-config/src/lib/config.ts, keep me in sync
const mentorDeclinesMentorshipReasonForDecliningOptions = [
  {
    id: 'notEnoughTimeNowToBeMentor',
    label: "I don't have enough time right now to be a mentor",
  },
  { id: 'notRightExpertise', label: "I don't have the right expertise" },
  {
    id: 'anotherMentorMoreSuitable',
    label: 'I think another mentor would be more suitable',
  },
  { id: 'other', label: 'Other' },
]

export const sendMentorshipDeclinedEmail = ({
  recipient,
  mentorName,
  menteeName,
  ifDeclinedByMentor_chosenReasonForDecline,
  ifDeclinedByMentor_ifReasonIsOther_freeText,
  ifDeclinedByMentor_optionalMessageToMentee,
  rediLocation,
}) => {
  let reasonForDecline = mentorDeclinesMentorshipReasonForDecliningOptions.find(
    (option) => option.id === ifDeclinedByMentor_chosenReasonForDecline
  ).label
  if (ifDeclinedByMentor_chosenReasonForDecline === 'other') {
    ifDeclinedByMentor_chosenReasonForDecline =
      ifDeclinedByMentor_ifReasonIsOther_freeText
  }

  const sendMentorshipDeclinedEmailParsed = convertTemplateToHtml(
    rediLocation,
    'mentorship-decline-email'
  )
  const html = sendMentorshipDeclinedEmailParsed
    .replace(/\${mentorName}/g, mentorName)
    .replace(/\${menteeName}/g, menteeName)
    .replace(/\${reasonForDecline}/g, reasonForDecline)
    .replace(
      /\${optionalMessageToMentee}/g,
      ifDeclinedByMentor_optionalMessageToMentee
    )
  return sendMjmlEmailFactory({
    to: recipient,
    subject: `This time it wasn't a match`.replace(
      /\${mentorName}/g,
      mentorName
    ),
    html: html,
    rediLocation,
  })
}

const formatLocationName = (locationIdentifier) => {
  return {
    BERLIN: 'Berlin',
    HAMBURG: 'Hamburg',
    MALMO: 'Malmö',
    MUNICH: 'Munich',
    NRW: 'NRW',
    CYBERSPACE: 'Cyberspace',
  }[locationIdentifier]
}
