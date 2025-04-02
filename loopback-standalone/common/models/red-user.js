'use strict'

const {
  sendResetPasswordEmail,
  sendConVerificationEmail,
} = require('../../lib/email/email')

const {
  sendTpResetPasswordEmail,
  sendTpVerificationEmail,
} = require('../../lib/email/tp-email')

const jwt = require('jsonwebtoken')
const { CONTEXT } = require('@nestjs/graphql')

module.exports = function (RedUser) {
  RedUser.observe('before save', function updateTimestamp(ctx, next) {
    const containsFirstNameAndLastName = ctx.instance && ctx.instance.firstName && ctx.instance.lastName
    if (!containsFirstNameAndLastName) return next ('missing firstname and/or lastname')

    const nameValidator = /^[\p{Letter}\s\-.,']+$/u
    const firstNameValid = nameValidator.test(ctx.instance.firstName)
    const lastNameValid = nameValidator.test(ctx.instance.lastName)
    if (!firstNameValid) return next('firstName contains illegal characters')
    if (!lastNameValid) return next('lastName contains illegal characters')

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
    // Only continue if this is a brand new user
    if (!context.isNewInstance) return next()

    const redUserInst = await RedUser.findById(context.instance.id)
    const redUser = redUserInst.toJSON()

    var verifyOptions = (() => {
      switch (redUser.productSignupSource) {
        case 'CON':
          return {
            type: 'email',
            mailer: {
              send: async (verifyOptions, context, cb) => {
                sendConVerificationEmail({
                  recipient: verifyOptions.to,
                  redUserId: redUser.id,
                  firstName: redUser.firstName,
                  verificationToken: verifyOptions.verificationToken,
                  rediLocation: redUser.rediLocation,
                }).subscribe()
              },
            },
            to: redUser.email,
            from: 'dummy@dummy.com',
          }
        case 'TP':
          return {
            type: 'email',
            mailer: {
              send: async (verifyOptions, context, cb) => {
                sendTpVerificationEmail({
                  recipient: verifyOptions.to,
                  redUserId: redUser.id,
                  firstName: redUser.firstName,
                  verificationToken: verifyOptions.verificationToken,
                }).subscribe()
              },
            },
            to: redUser.email,
            from: 'dummy@dummy.com',
          }
        default:
          throw new Error(
            'Unknown productSignupSource in RedUser.before save hook'
          )
      }
    })()

    redUserInst.verify(verifyOptions, function (err, response) {
      console.log(err)
      console.log(response)
      next()
    })
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

    const redUserInst = await RedUser.findById(info.user.id)
    const redUser = redUserInst.toJSON()

    if (redproduct === 'CON') {
      sendResetPasswordEmail({
        recipient: email,
        accessToken,
        rediLocation: redUser.rediLocation,
      }).subscribe()
    } else if (redproduct === 'TP') {
      sendTpResetPasswordEmail({
        recipient: email,
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
    const redUserId = loginOutput.userId
    const redUserInst = await RedUser.findById(redUserId)
    const redUser = redUserInst.toJSON()

    const jwtToken = generateJwtToken(redUser)
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

function generateJwtToken(redUser) {
  return jwt.sign(
    {
      loopbackUserId: redUser.id,
      email: redUser.email,
      emailVerified: redUser.emailVerified,
      firstName: redUser.firstName,
      lastName: redUser.lastName,
      rediLocation: redUser.rediLocation,
      userType: redUser.userType,
      companyIdOrName: redUser.companyIdOrName,
      howDidHearAboutRediKey: redUser.howDidHearAboutRediKey,
      howDidHearAboutRediOtherText: redUser.howDidHearAboutRediOtherText,
      isMicrosoftPartner: redUser.isMicrosoftPartner,
      firstPointOfContact: redUser.firstPointOfContact,
      firstPointOfContactOther: redUser.firstPointOfContactOther,
      operationType: redUser.operationType,
      productSignupSource: redUser.productSignupSource,
      tpSignupType: redUser.tpSignupType,
      mentor_isPartnershipMentor: redUser.mentor_isPartnershipMentor,
      mentor_workPlace: redUser.mentor_workPlace,
    },
    process.env.NX_JWT_SECRET,
    {
      expiresIn: '21d',
    }
  )
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
  if (course.includes('MALMO')) {
    return 'malmo'
  }
  if (course.includes('alumni')) {
    return null
  }
  return 'berlin'
}
