const Rx = require('rxjs')
const { bindNodeCallback, from } = Rx
const { filter, mergeMap, count, tap, switchMap } = require('rxjs/operators')

const app = require('../server/server')

const { RedProfile } = app.models

const findRedProfile = bindNodeCallback(RedProfile.find.bind(RedProfile))
const updateRedProfileAttribute = redProfileInst => bindNodeCallback(redProfileInst.updateAttribute.bind(redProfileInst))

findRedProfile()
  .pipe(
    switchMap(redProfiles => from(redProfiles)),
    filter(profile => profile.toJSON().userType),
    mergeMap(redProfileInst => {
      const propName = 'loopbackComputedDoNotSetElsewhere__forAdminSearch__fullName'
      const toJson = redProfileInst.toJSON()
      const firstName = toJson.firstName
      const lastName = toJson.lastName
      const fullName = (firstName ? `${firstName} ` : '') + (lastName || '')
      return updateRedProfileAttribute(redProfileInst)(propName, fullName)
    }),
    tap(console.log),
    count()
  )
  .subscribe(console.log)
