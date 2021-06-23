/* Keep me in sync with redi-connect-front/src/lib/build-frontend-url.ts */

module.exports = {
  buildTpFrontendUrl: function (env, rediLocation) {
    if (env === 'production') {
      return 'https://talent-pool.redi-school.org'
    } else if (env === 'demonstration') {
      return 'https://app.demo.talent-pool.redi-school.org'
    } else if (env === 'staging') {
      return 'https://app.staging.talent-pool.redi-school.org'
    } else if (env === 'development') {
      return 'http://127.0.0.1:2999'
    } else if (env === 'development') {
      return 'http://127.0.0.1:2999'
    } else {
      return 'http://127.0.0.1:2999'
    }
  },
}