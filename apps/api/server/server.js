'use strict'
const path = require('path')
require('dotenv').config({
  path: path.resolve(__dirname, '..', '.env.' + process.env.NODE_ENV),
})
process.env.AWS_ACCESS_KEY_ID = process.env.NX_AWS_ACCESS_KEY_ID
process.env.AWS_SECRET_ACCESS_KEY = process.env.NX_AWS_SECRET_ACCESS_KEY

// required to set up logger
require('../lib/logger')

var loopback = require('loopback')
var boot = require('loopback-boot')

var http = require('http')
var https = require('https')
var sslConfig = require('./ssl-config')

const Rx = require('rxjs')
const { bindNodeCallback, from } = Rx
const { delay, switchMap, tap, map, filter, count } = require('rxjs/operators')

const { sendMenteeReminderToApplyToMentorEmail } = require('../lib/email/email')
const { default: clsx } = require('clsx')

var app = (module.exports = loopback())

app.start = function () {
  // start the web server
  return app.listen(function () {
    app.emit('started')
    var baseUrl = app.get('url').replace(/\/$/, '')
    console.log('Web server listening at: %s', baseUrl)
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath)
    }
  })
}

app.get(
  '/secret-endpoint-that-will-be-contacted-by-autocode-to-trigger-automated-reminder-emails',
  (req, res) => {
    const secretToken =
      process.env.DAILY_CRONJOB_SEND_REMINDER_EMAIL_SECRET_TOKEN
    const authToken = req.query['auth-token']
    const isDryRun = !!req.query['dry-run']

    if (authToken === secretToken) {
      sendAllReminderEmails(isDryRun)
      return res.send({ result: 'email-jobs-queued' })
    }
    return res.send({ result: 'nope, wrong pass bro' })
  }
)

// Inject current user into context
app
  .remotes()
  .phases.addBefore('invoke', 'options-from-request')
  .use(function (ctx, next) {
    if (!ctx.args || !ctx.args.options || !ctx.args.options.accessToken) {
      return next()
    }
    const RedUser = app.models.RedUser
    RedUser.findById(
      ctx.args.options.accessToken.userId,
      { include: ['redProfile', 'tpJobseekerProfile', 'tpCompanyProfile'] },
      function (err, user) {
        if (err) return next(err)
        ctx.args.options.currentUser = user.toJSON()
        next()
      }
    )
  })

app.use(
  '/s3',
  require('react-s3-uploader/s3router')({
    bucket: 'redi-connect-profile-avatars',
    region: 'eu-west-1', // optional
    signatureVersion: 'v4', // optional (use for some amazon regions: frankfurt and others)
    headers: { 'Access-Control-Allow-Origin': '*' }, // optional
    ACL: 'public-read', // this is default
    uniquePrefix: true, // (4.0.2 and above) default is true, setting the attribute to false preserves the original filename in S3
  })
)

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname)

app.start = function () {
  const server = (function buildHttpOrHttpsServer() {
    if (process.env.USE_HTTPS) {
      return https.createServer(
        {
          key: sslConfig.privateKey,
          cert: sslConfig.certificate,
        },
        app
      )
    } else {
      return http.createServer(app)
    }
  })()
  server.listen(app.get('port'), function () {
    var baseUrl =
      (process.env.USE_HTTPS ? 'https://' : 'http://') +
      app.get('host') +
      ':' +
      app.get('port')
    app.emit('started', baseUrl)
    console.log('LoopBack server listening @ %s%s', baseUrl, '/')
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath)
    }
  })
  return server
}

// start the server if `$ node server.js`
if (require.main === module) {
  app.start()
}
