'use strict'
const { DateTime } = require('luxon')
const fs = require('fs')
const app = require('../server/server.js')
const nodemailer = require('nodemailer')
const Rx = require('rxjs')
const path = require('path')
const mjml2html = require('mjml')
const { bindNodeCallback, from } = Rx
const aws = require('aws-sdk')
const jsforce = require('jsforce')
const _ = require('lodash')
const { ConsoleLogger } = require('@nestjs/common')
const { connect } = require('http2')

const USERNAME = 'eric@redi-school.org.local'
const PASSWORD = 'P;JR2d.KmqzM$~Q,B.hzw6EJ9NU7Q^'
const SECURITY_TOKEN = 'KwGRXbhpAXpH2rv9LpnFDwrs'
const LOGIN_URL = 'https://redischool--local.my.salesforce.com'
const CLIENT_ID =
  '3MVG9r_yMkYxwhkhe93YHPwED2H06d8Z1zYgRHAgkljlSq2x8XtnqpP4GdpS4.GDeqEgOVLfi2E1YNLxk4WaZ'
const CLIENT_SECRET =
  'C41F3552AA09D4F8E375E3854D9C73A5EE769B8476915022FC68436523C6CA9A'

const {
  RedUser,
  RedProfile,
  RedMatch,
  RedMentoringSession,
  TpCompanyProfile,
  TpJobListing,
  TpJobseekerProfile,
  TpJobseekerCv,
} = app.models

const conn = new jsforce.Connection({
  loginUrl: LOGIN_URL,
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
})

let REDPROFILE_SFCONTACT = {}
let REDPROFILE_SFCONNECTPROFILE = {}

const MENTOR = '0129X0000001EXBQA2'
const MENTEE = '0129X0000001EYnQAM'

const {
  scan,
  concatMap,
  take,
  skip,
  map,
  switchMap,
  retry,
  tap,
  throwError,
  filter,
  retryWhen,
  delay,
  mergeMap,
  startWith,
  count,
} = require('rxjs/operators')

const { of } = require('rxjs')

const LANGUAGES = require('./languages')
const { merge } = require('lodash')

const DELAY = 2500
const RETRIES = 10
const CONCURRENCY = 10

function retryWithDelay(delayTime, count = 1) {
  return (input) =>
    input.pipe(
      retryWhen((errors) =>
        errors.pipe(
          scan((acc, error) => ({ count: acc.count + 1, error }), {
            count: 0,
            error: undefined,
          }),
          tap((current) => {
            if (current.count > count) {
              throw current.error
            }
          }),
          delay(delayTime)
        )
      )
    )
}

async function insertContactFn(p) {
  const result = await conn.sobject('Contact').create({
    // AccountId: '0019X000002URWKQA4',
    RecordTypeId: '0121i000000HMq9AAG',
    Loopback_User_ID__c: p.redUserId,
    FirstName: `${p.firstName}`,
    LastName: `${p.lastName}`,
    redi_Contact_Gender__c: p.gender ? p.gender.toUpperCase() : 'OTHER',
    ReDI_Birth_Date__c: p.birthDate,
    LinkedIn_Profile__c: p.linkedInProfileUrl,
    ReDI_GitHub_Profile__c: p.githubProfileUrl,
    ReDI_Slack_Username__c: p.slackUsername,
    MobilePhone: p.telephoneNumber,
  })
  return { ...p, sfContactId: result.id }
}

function insertContact(p) {
  return of(p).pipe(
    switchMap((x) => from(insertContactFn(p))),
    retryWithDelay(DELAY, RETRIES)
  )
}
async function insertConnectProfileFn(p) {
  const result = await conn.sobject('ReDI_Connect_Profile__c').create({
    Contact__c: p.sfContactId,
    RecordTypeId: p.userType.indexOf('mentor') !== -1 ? MENTOR : MENTEE,
    Profile_Status__c: redProfileToProfileStatus(p),
    ReDI_Location__c: p.rediLocation,
    Occupation__c: p.mentor_occupation,

    Work_Place__c: p.mentor_workPlace,
    Expectations__c: p.expectations
      ? p.expectations.substr(0, 1000)
      : undefined,
    Occupation_Category__c: p.mentee_occupationCategoryId,
    Place_of_Employment__c: p.mentee_occupationJob_placeOfEmployment,
    Job_Title__c: p.mentee_occupationJob_position,
    Study_Place__c: p.mentee_occupationStudent_studyPlace,
    Study_Name__c: p.mentee_occupationStudent_studyName,
    Desired_Job__c: p.mentee_occupationLookingForJob_what,
    Main_Occupation_Other__c: p.mentee_occupationOther_description,
    Education__c: p.mentee_highestEducationLevel,
    ReDI_Course__c: p.mentee_currentlyEnrolledInCourse || 'alumni',
    Avatar_Image_URL__c: p.profileAvatarImageS3Key,
    Personal_Description__c: p.personalDescription
      ? p.personalDescription.substr(0, 600)
      : undefined,
    Languages__c: p.languages
      ? p.languages.map((langLabel) => LANGUAGES[langLabel]).join(';')
      : undefined,
    Opt_Out_Mentees_From_Other_Locations__c:
      p.optOutOfMenteesFromOtherRediLocation,
    Profile_First_Approved_At__c: p.userActivatedAt,
    // CreatedDate: p.createdAt, //! Use Jonida trick
    // LastModifiedDate: p.updatedAt, //! Use Jonida trick
  })
  return { ...p, sfConnectProfileId: result.id }
}
function insertConnectProfile(p) {
  return of(p).pipe(
    switchMap((x) => from(insertConnectProfileFn(p))),
    retryWithDelay(DELAY, RETRIES)
  )
}

async function insertMentoringSessionFn(p) {
  console.log('trying to insert mentoring session', p.id)
  const result = await conn.sobject('Mentoring_Session__c').create({
    Date__c: p.date,
    Mentee__c: REDPROFILE_SFCONTACT[p.menteeId],
    Mentor__c: REDPROFILE_SFCONTACT[p.mentorId],
    Durations_in_Minutes__c: p.minuteDuration,
  })
  return { ...p, sfId: result.id }
}
function insertMentoringSession(p) {
  return of(p).pipe(
    switchMap((x) => from(insertMentoringSessionFn(p))),
    retryWithDelay(DELAY, RETRIES)
  )
}

async function insertMatchFn(p) {
  console.log('trying to insert match', p.id)
  const result = await conn.sobject('Mentorship_Match__c').create({
    Acceptance_Notification_Dismissed__c:
      p.hasMenteeDismissedMentorshipApplicationAcceptedNotification,
    Application_Accepted_On__c: p.matchMadeActiveOn,
    Application_Text__c: p.applicationText,
    Decline_Message__c: p.ifDeclinedByMentor_optionalMessageToMentee
      ? p.ifDeclinedByMentor_optionalMessageToMentee.substr(0, 1000)
      : undefined,
    Decline_Reason__c: p.ifDeclinedByMentor_chosenReasonForDecline,
    Decline_Reason_Other__c: p.ifDeclinedByMentor_ifReasonIsOther_freeText,
    Declined_On__c: p.ifDeclinedByMentor_dateTime,
    Expectations__c: p.expectationText,
    Mentor_Acceptance_Message__c: p.mentorReplyMessageOnAccept,
    Mentor_Completion_Message__c: p.mentorMessageOnComplete
      ? p.mentorMessageOnComplete.substr(0, 1000)
      : undefined,
    Status__c: p.status,
    Mentee__c: REDPROFILE_SFCONTACT[p.menteeId],
    Mentor__c: REDPROFILE_SFCONTACT[p.mentorId],
  })
  return { ...p, sfId: result.id }
}
function insertMatch(p) {
  return of(p).pipe(
    switchMap((x) => from(insertMatchFn(p))),
    retryWithDelay(DELAY, RETRIES)
  )
}

let usersWithTwoProfiles = 0

function buildContact(redUser) {
  const u = redUser

  const fields = {
    conProfile: [
      'firstName',
      'lastName',
      'contactEmail',
      'gender',
      'birthDate',
      'linkedInProfileUrl',
      'githubProfileUrl',
      'slackUsername',
      'telephoneNumber',
      'createdAt',
      'updatedAt',
    ],
    tpJobseekerProfile: [
      'firstName',
      'lastName',
      'contactEmail',
      'genderPronouns',
      'telephoneNumber', // remapped
      'postalMailingAddress',
      'linkedInProfileUrl', // name remapped
      'githubProfileUrl', // name remapped
      'postalMailingAddress',
      'personalWebsite',
      'twitterUrl',
      'behanceUrl',
      'stackOverflowUrl',
      'dribbbleUrl',
      'immigrationStatus',
      'createdAt',
      'updatedAt',
    ],
    tpCompanyProfile: [
      'howDidHearAboutRediKey',
      'howDidHearAboutRediOtherText',
      'firstName',
      'lastName',
      'createdAt',
      'updatedAt',
    ],
  }

  if (u.redProfile) u.redProfile.is = 'conProfile'
  if (u.tpJobseekerProfile) u.tpJobseekerProfile.is = 'tpJobseekerProfile'
  if (u.tpCompanyProfile) u.tpCompanyProfile.is = 'tpCompanyProfile'

  const profiles = [u.redProfile, u.tpJobseekerProfile, u.tpCompanyProfile]
    .filter((p) => p)
    .sort((a, b) => {
      return Date.parse(a.updatedAt) - Date.parse(b.updatedAt)
    })

  redUser.contact = {}
  profiles.forEach((profile) => {
    const profileType = profile.is
    const fieldsToAssignToContactFromProfile = fields[profileType]
    const fieldsAndValues = _.pick(profile, fieldsToAssignToContactFromProfile)
    redUser.contact = Object.assign({}, redUser.contact, fieldsAndValues)
  })

  if (profiles.length >= 2) {
    console.log(redUser)
  }

  return redUser
}

;(async () => {
  const allUsers = await RedUser.find({
    include: [
      'redProfile',
      'tpJobseekerProfile',
      'tpJobseekerCv',
      'tpCompanyProfile',
      'tpJobListings',
    ],
  })
    .map((u) => u.toJSON())
    .map((u) => {
      if (
        u.conProfile &&
        u.conProfile.mentee_currentlyEnrolledInCourse ===
          'munich_frontendDevelopment'
      ) {
        u.conProfile.json.mentee_currentlyEnrolledInCourse = 'munich_frontend1'
      }
      return u
    })
    .map((u) => {
      if (u.tpCompanyProfile) {
        u.tpCompanyProfile.telephoneNumber = u.tpCompanyProfile.phoneNumber
        delete u.tpCompanyProfile.phoneNumber
      }
      return u
    })
    .map((u) => {
      if (u.tpJobseekerProfile) {
        u.tpJobseekerProfile.telephoneNumber = u.tpJobseekerProfile.phoneNumber
        delete u.tpJobseekerProfile.phoneNumber
        u.tpJobseekerProfile.linkedInProfileUrl =
          u.tpJobseekerProfile.linkedInUrl
        delete u.tpJobseekerProfile.linkedInUrl
        u.tpJobseekerProfile.githubProfileUrl = u.tpJobseekerProfile.githubUrl
        delete u.tpJobseekerProfile.githubUrl
      }
      return u
    })
    .filter((u) => u.redProfile || u.tpJobseekerProfile || u.tpCompanyProfile)
    .map(buildContact)
  const allConMatches = await RedMatch.find().map((p) => p.toJSON())
  const allConMentoringSessions = await RedMentoringSession.find().map((p) =>
    p.toJSON()
  )
  const allTpJobseekerCvs = await TpJobseekerCv.find().map((p) => p.toJSON())

  console.log('We have:')
  console.log('users', allUsers.length)

  // console.log('conProfiles', allConProfiles.length)
  // console.log('conMatches', allConMatches.length)
  // console.log('conMentoringSessions', allConMentoringSessions.length)
  // console.log('tpCompanyProfiles', allTpCompanyProfiles.length)
  // console.log('tpJobListings', allTpJobListings.length)
  // console.log('tpJobsekeerProfiles', allTpJobseekerProfiles.length)
  // console.log('tpJobseekerCvs', allTpJobseekerCvs.length)

  // const someConProfiles = _.take(allConProfiles, 50)

  // await conn.login(USERNAME, `${PASSWORD}${SECURITY_TOKEN}`)

  // await from(allConProfiles)
  //   .pipe(
  //     filter((p) => p['signup-source'] != 'manual-import-via-script'),
  //     map((p) => {
  //       if (
  //         p.mentee_currentlyEnrolledInCourse === 'munich_frontendDevelopment'
  //       ) {
  //         p.mentee_currentlyEnrolledInCourse = 'munich_frontend1'
  //       }
  //       return p
  //     }),
  //     mergeMap((p) => insertContact(p), CONCURRENCY),
  //     tap((p) => console.log('Inserted Contact #', p.sfContactId)),
  //     mergeMap((p) => insertConnectProfile(p), CONCURRENCY),
  //     tap((p) => console.log('Inserted ConProfile #', p.sfConnectProfileId)),
  //     tap(({ id, sfContactId, sfConnectProfileId }) => {
  //       REDPROFILE_SFCONTACT[id] = sfContactId
  //       REDPROFILE_SFCONNECTPROFILE[id] = sfConnectProfileId
  //     }),
  //     scan((acc, curr) => acc + 1, 0),
  //     tap(console.log)
  //   )
  //   .toPromise()

  // fs.writeFileSync('./map.json', JSON.stringify(REDPROFILE_SFCONTACT))

  // const json = fs.readFileSync('./map.json')

  // REDPROFILE_SFCONTACT = JSON.parse(json)

  // await from(allConMentoringSessions)
  //   .pipe(
  //     filter((p) => p.mentorId && p.menteeId),
  //     filter(
  //       (p) =>
  //         REDPROFILE_SFCONTACT[p.mentorId] && REDPROFILE_SFCONTACT[p.menteeId]
  //     ),
  //     mergeMap((p) => insertMentoringSession(p), CONCURRENCY / 2),
  //     tap((p) => console.log('Inserted Mentoring Session #', p.sfId)),
  //     scan((acc, curr) => acc + 1, 0),
  //     tap(console.log)
  //   )
  //   .toPromise()

  // await from(allConMatches)
  //   .pipe(
  //     filter((p) => p.mentorId && p.menteeId),
  //     filter(
  //       (p) =>
  //         REDPROFILE_SFCONTACT[p.mentorId] && REDPROFILE_SFCONTACT[p.menteeId]
  //     ),
  //     mergeMap((p) => insertMatch(p), CONCURRENCY / 2),
  //     tap((p) => console.log('Inserted Match #', p.sfId)),
  //     scan((acc, curr) => acc + 1, 0),
  //     tap(console.log)
  //   )
  //   .toPromise()
})()

function redProfileToProfileStatus(redProfile) {
  const userType = redProfile.userType
  if (userType.indexOf('pending') !== -1) return 'PENDING'

  if (userType.indexOf('rejected') !== -1) return 'REJECTED'

  if (!redProfile.userActivated) return 'DEACTIVATED'

  return 'APPROVED'
}
