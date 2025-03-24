'use strict'

const Rx = require('rxjs')
const mjml2html = require('mjml')
const fs = require('fs')
const path = require('path')
const { EmailClient } = require('@azure/communication-email')

const { buildFrontendUrl } = require('../build-frontend-url')
const { buildBackendUrl } = require('../build-backend-url')

const connectionString =
  process.env.AZURE_COMMUNICATION_CONNECTION_STRING ||
  'endpoint=https://red-platform-email-sending.germany.communication.azure.com/;accesskey=A49CnzJqxCFl6YZNidtQpj1wKNutAY66nhKaAU8S8lENpE13Y7FZJQQJ99BAACULyCpc62JTAAAAAZCS8U4P'
const emailClient = new EmailClient(connectionString)

const formatRecipients = (emailAddresses) => {
  if (!emailAddresses) return []
  if (typeof emailAddresses === 'string') return [{ address: emailAddresses }]
  return emailAddresses.map((email) => ({ address: email }))
}

const isProductionOrDemonstration = () =>
  ['production', 'demonstration', 'staging'].includes(process.env.NODE_ENV)

export const sendMjmlEmail = (emailParams) =>
  Rx.from(
    (async function iifeSendEmail() {
      const emailMessage = {
        senderAddress: 'career@redi-school.org',
        content: {
          subject: emailParams.subject,
          html: emailParams.html,
        },
        recipients: {
          to: formatRecipients(emailParams.to),
          bcc: formatRecipients(emailParams.bcc),
        },
      }

      const poller = await emailClient.beginSend(emailMessage)
      const result = await poller.pollUntilDone()
      return result
    })()
  )

// TODO: I'm a duplicate of getSenderDetails in apps/nestjs-api/src/email/lib/email/email.js, keep me in sync
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

const sendMjmlEmailFactory = ({ to, subject, html, rediLocation }) => {
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

const sendResetPasswordEmailTemplate = fs.readFileSync(
  path.resolve(__dirname, 'templates', 'reset-password.mjml'),
  'utf-8'
)
const sendResetPasswordEmailParsed = mjml2html(sendResetPasswordEmailTemplate, {
  filePath: path.resolve(__dirname, 'templates'),
})

const sendResetPasswordEmail = ({ recipient, accessToken, rediLocation }) => {
  const resetPasswordUrl = `${buildFrontendUrl(
    process.env.NODE_ENV
  )}/front/reset-password/set-new-password/${accessToken}`

  const { senderEmail, senderName } = getSenderDetails(rediLocation)

  const html = sendResetPasswordEmailParsed.html
    .replace(/\${resetPasswordUrl}/g, resetPasswordUrl)
    .replace(/\${rediEmailAddress}/g, senderEmail)
    .replace(/\${emailAddress}/g, recipient)
    .replace(/\${rediSignature}/g, senderName)
  return sendMjmlEmailFactory({
    to: recipient,
    subject: 'Password Reset for ReDI Connect',
    html: html,
    rediLocation: rediLocation,
  })
}

const sendVerificationEmailTemplate = fs.readFileSync(
  path.resolve(__dirname, 'templates', 'validate-email-address.mjml'),
  'utf-8'
)
const sendVerificationEmailTemplateParsed = mjml2html(
  sendVerificationEmailTemplate,
  {
    filePath: path.resolve(__dirname, 'templates'),
  }
)
const sendConVerificationEmail = ({
  recipient,
  redUserId,
  firstName,
  verificationToken,
  rediLocation,
}) => {
  const verificationSuccessPageUrl = `${buildFrontendUrl(
    process.env.NODE_ENV
  )}/front/signup-email-verification-success/`

  const verificationUrl = `${buildBackendUrl(
    process.env.NODE_ENV
  )}/api/redUsers/confirm?uid=${redUserId}&token=${verificationToken}&redirect=${encodeURI(
    verificationSuccessPageUrl
  )}`

  const { senderName } = getSenderDetails(rediLocation)

  const html = sendVerificationEmailTemplateParsed.html
    .replace(/\${firstName}/g, firstName)
    .replace(/\${verificationUrl}/g, verificationUrl)
    .replace(/\${rediSignature}/g, senderName)
  return sendMjmlEmailFactory({
    to: recipient,
    subject: 'Verify your email address!',
    html: html,
    rediLocation: rediLocation,
  })
}

module.exports = {
  sendResetPasswordEmail,
  sendMjmlEmailFactory,
  sendConVerificationEmail,
}
