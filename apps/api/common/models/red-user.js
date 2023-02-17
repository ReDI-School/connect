'use strict'

const {
  sendResetPasswordEmail,
  sendMenteeRequestAppointmentEmail,
  sendMentorRequestAppointmentEmail,
} = require('../../lib/email/email')

const {
  sendTpJobseekerEmailVerificationSuccessfulEmail,
  sendTpCompanyEmailVerificationSuccessfulEmail,
  sendTpResetPasswordEmail,
} = require('../../lib/email/tp-email')

const jwt = require('jsonwebtoken')
const { CONTEXT } = require('@nestjs/graphql')

module.exports = function (RedUser) {
  RedUser.observe('before save', function updateTimestamp(ctx, next) {
    if (ctx.instance) {
      if (ctx.isNewInstance) ctx.instance.createdAt = new Date()
      ctx.instance.updatedAt = new Date()
    } else {
      ctx.data.updatedAt = new Date()
    }
    next()
  })

  // Hook for sending verification email
  RedUser.observe('after save', async function (context, next) {
    if (process.env.NODE_ENV === 'seeding') return next()
    // Onky continue if this is a brand new user
    if (!context.isNewInstance) return next()
  })

  RedUser.afterRemote('confirm', async function (ctx, inst, next) {
    const redUserInst = await RedUser.findById(ctx.args.uid, {
      include: ['redProfile', 'tpJobseekerProfile', 'tpCompanyProfile'],
    })
    const redUser = redUserInst.toJSON()

    const userSignedUpWithCon = !!redUser.redProfile
    const userSignedUpWithTpAndIsJobseeker = !!redUser.tpJobseekerProfile
    const userSignedUpWithTpAndIsCompany = !!redUser.tpCompanyProfile

    if (userSignedUpWithCon) {
      const userType = redUser.redProfile.userType

      switch (userType) {
        case 'public-sign-up-mentee-pending-review':
          await sendMenteeRequestAppointmentEmail({
            recipient: redUser.email,
            firstName: redUser.redProfile.firstName,
            rediLocation: redUser.redProfile.rediLocation,
          }).toPromise()
          return

        case 'public-sign-up-mentor-pending-review':
          await sendMentorRequestAppointmentEmail({
            recipient: redUser.email,
            firstName: redUser.redProfile.firstName,
            rediLocation: redUser.redProfile.rediLocation,
          }).toPromise()
          return

        default:
          throw new Error('Invalid user type')
      }
    }

    if (userSignedUpWithTpAndIsJobseeker) {
      await sendTpJobseekerEmailVerificationSuccessfulEmail({
        recipient: redUser.email,
        firstName: redUser.tpJobseekerProfile.firstName,
      }).toPromise()
    }

    if (userSignedUpWithTpAndIsCompany) {
      await sendTpCompanyEmailVerificationSuccessfulEmail({
        recipient: redUser.email,
        firstName: redUser.tpCompanyProfile.firstName,
      }).toPromise()
    }
  })

  RedUser.requestResetPasswordEmail = function (body, cb) {
    const email = body.email
    const redproduct = body.redproduct
    RedUser.resetPassword(
      {
        email,
        redproduct,
      },
      function (err) {
        if (err) return cb(err)
        cb(null)
      }
    )
  }

  RedUser.remoteMethod('requestResetPasswordEmail', {
    accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
    returns: { arg: 'resp', type: 'object', root: true },
  })

  RedUser.on('resetPasswordRequest', async function (info) {
    const accessToken = encodeURIComponent(JSON.stringify(info.accessToken))
    const email = info.user.email
    const redproduct = info.options.redproduct

    const redUserInst = await RedUser.findById(info.user.id, {
      include: ['redProfile', 'tpJobseekerProfile', 'tpCompanyProfile'],
    })
    const redUser = redUserInst.toJSON()

    const userSignedUpWithCon = !!redUser.redProfile
    const userSignedUpWithTpAndIsJobseeker = !!redUser.tpJobseekerProfile
    const userSignedUpWithTpAndIsCompany = !!redUser.tpCompanyProfile

    let firstName
    let rediLocation

    if (userSignedUpWithCon) {
      firstName = redUser.redProfile.firstName
      rediLocation = redUser.redProfile.rediLocation
    }
    if (userSignedUpWithTpAndIsJobseeker) {
      firstName = redUser.tpJobseekerProfile.firstName
    }
    if (userSignedUpWithTpAndIsCompany) {
      firstName = redUser.tpCompanyProfile.firstName
    }

    if (redproduct === 'CON') {
      sendResetPasswordEmail({
        recipient: email,
        firstName,
        accessToken,
        rediLocation,
      }).subscribe()
    } else if (redproduct === 'TP') {
      sendTpResetPasswordEmail({
        recipient: email,
        firstName,
        accessToken,
      }).subscribe()
    }
  })

  /******************
   * Special post-login hook:
   * When a user logs into one of our products (CON and TP), it's possible they don't
   * have a product profile. For example, a user can have signed up in TP initially
   * and created a TP profile (TpJobseekerProfile). Then, they log into CON but don't
   * have a CON profile (RedProfile) yet. Or vice versa (CON-only user logging into
   * TP).
   * This hook detects when one of these two cases occur, and creates the appropriate
   * product profile.
   */
  RedUser.afterRemote('login', async function (ctx, loginOutput, next) {
    const email = ctx.req.body.email
    const jwtToken = jwt.sign(
      { ...loginOutput.toJSON(), email },
      process.env.NX_JWT_SECRET,
      {
        expiresIn: '7d',
      }
    )
    ctx.result.jwtToken = jwtToken

    const redProduct = ctx.req.headers.redproduct // either CON or TP
    switch (redProduct) {
      case 'CON':
        return loginHook_caseLoginIntoConnect(ctx, next)
      case 'TP':
        return loginHook_caseLoginIntoTalentPool(ctx, next)
      default:
        return next()
    }
  })

  async function loginHook_caseLoginIntoConnect(context, next) {
    const redUserInst = await loginHook_getRedUser(context)
    const redUser = redUserInst.toJSON()

    const userAlreadyHasConProfile = Boolean(redUser.redProfile)
    const userDoesNotHaveTpJobseekerProfile = !Boolean(
      redUser.tpJobseekerProfile
    )

    if (userAlreadyHasConProfile || userDoesNotHaveTpJobseekerProfile)
      return next()

    const conProfile = tpJobseekerProfileToConRedProfile(
      redUser.tpJobseekerProfile
    )

    await redUserInst.redProfile.create(conProfile)

    return next()
  }

  async function loginHook_caseLoginIntoTalentPool(context, next) {
    const redUserInst = await loginHook_getRedUser(context)
    const redUser = redUserInst.toJSON()

    const userAlreadyHasTalentPoolProfile = Boolean(
      redUser.tpJobseekerProfile || redUser.tpCompanyProfile
    )
    const userDoesNotHaveConnectProfile = !redUser.redProfile

    if (userAlreadyHasTalentPoolProfile || userDoesNotHaveConnectProfile) {
      return next()
    }

    const tpJobseekerProfile = conRedProfileToTpJobseekerProfile(
      redUser.redProfile
    )

    await redUserInst.tpJobseekerProfile.create(tpJobseekerProfile)

    return next()
  }

  async function loginHook_getRedUser(context) {
    const redUserId = context.result.toJSON().userId.toString()
    const redUserInst = await RedUser.findById(redUserId, {
      include: ['redProfile', 'tpJobseekerProfile', 'tpCompanyProfile'],
    })

    return redUserInst
  }

  function conRedProfileToTpJobseekerProfile(redProfile) {
    const tpJobseekerProfile = {
      firstName: redProfile.firstName,
      lastName: redProfile.lastName,
      contactEmail: redProfile.contactEmail,
      currentlyEnrolledInCourse: redProfile.mentee_currentlyEnrolledInCourse,
      state: 'drafting-profile',
      gaveGdprConsentAt: redProfile.gaveGdprConsentAt,
    }

    return tpJobseekerProfile
  }

  function tpJobseekerProfileToConRedProfile(tpJobseekerProfile) {
    let rediLocation = determineRediLocationByCourse(
      tpJobseekerProfile.currentlyEnrolledInCourse
    )

    const conRedProfile = {
      firstName: tpJobseekerProfile.firstName,
      lastName: tpJobseekerProfile.lastName,
      contactEmail: tpJobseekerProfile.contactEmail,
      mentee_currentlyEnrolledInCourse:
        tpJobseekerProfile.currentlyEnrolledInCourse,
      userType: 'public-sign-up-mentee-pending-review',
      gaveGdprConsentAt: tpJobseekerProfile.gaveGdprConsentAt,
      signupSource: 'existing-user-with-tp-profile-logging-into-con',
      rediLocation: rediLocation ?? 'berlin',
      administratorInternalComment:
        rediLocation === null
          ? "SYSTEM NOTE: This user first signed up in Talent Pool. They then logged into Connect. Their ReDI Location has been set to BERLIN by default since we don't know which location they belong to, and there is no information available about what course they are currently taking. Make sure to figure out if they should be changed to Hamburg, Munich or NRW. If so, request Eric or Anil to do the change"
          : undefined,
      userActivated: false,
    }

    return conRedProfile
  }
}

function determineRediLocationByCourse(course) {
  if (course.includes('MUNICH')) {
    return 'munich'
  }
  if (course.includes('HAMBURG')) {
    return 'hamburg'
  }
  if (course.includes('NRW')) {
    return 'nrw'
  }
  if (course.includes('alumni')) {
    return null
  }
  return 'berlin'
}
