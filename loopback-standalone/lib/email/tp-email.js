'use strict'

const aws = require('aws-sdk')
const Rx = require('rxjs')
const mjml2html = require('mjml')
const nodemailer = require('nodemailer')
const fs = require('fs')
const path = require('path')

const { buildTpFrontendUrl } = require('../build-tp-frontend-url')
const { buildBackendUrl } = require('../build-backend-url')

const { sendMjmlEmailFactory } = require('./email')

const sendTpResetPasswordEmailTemplate = fs.readFileSync(
  path.resolve(__dirname, 'tp-templates', 'reset-password.mjml'),
  'utf-8'
)

const sendTpResetPasswordEmailParsed = mjml2html(
  sendTpResetPasswordEmailTemplate,
  {
    filePath: path.resolve(__dirname, 'templates'),
  }
)

const sendTpResetPasswordEmail = ({ recipient, accessToken }) => {
  const resetPasswordUrl = `${buildTpFrontendUrl(
    process.env.NODE_ENV
  )}/front/reset-password/set-new-password/${accessToken}`
  const rediEmailAddress = 'career@redi-school.org'
  const html = sendTpResetPasswordEmailParsed.html
    .replace(/\${resetPasswordUrl}/g, resetPasswordUrl)
    .replace(/\${rediEmailAddress}/g, rediEmailAddress)
    .replace(/\${emailAddress}/g, recipient)
  return sendMjmlEmailFactory({
    to: recipient,
    subject: 'Password Reset for ReDI Talent Pool',
    html: html,
  })
}

const sendVerificationEmailTemplate = fs.readFileSync(
  path.resolve(__dirname, 'tp-templates', 'validate-email-address.mjml'),
  'utf-8'
)
const sendVerificationEmailTemplateParsed = mjml2html(
  sendVerificationEmailTemplate,
  {
    filePath: path.resolve(__dirname, 'templates'),
  }
)
const sendTpVerificationEmail = ({
  recipient,
  redUserId,
  firstName,
  verificationToken,
}) => {
  const verificationSuccessPageUrl = `${buildTpFrontendUrl(
    process.env.NODE_ENV
  )}/front/signup-email-verification-success/`
  const verificationUrl = `${buildBackendUrl(
    process.env.NODE_ENV
  )}/api/redUsers/confirm?uid=${redUserId}&token=${verificationToken}&redirect=${encodeURI(
    verificationSuccessPageUrl
  )}`
  const html = sendVerificationEmailTemplateParsed.html
    .replace(/\${firstName}/g, firstName)
    .replace(/\${verificationUrl}/g, verificationUrl)
  return sendMjmlEmailFactory({
    to: recipient,
    subject: 'Verify your email address!',
    html: html,
  })
}

module.exports = {
  sendTpResetPasswordEmail,
  sendTpVerificationEmail,
}
