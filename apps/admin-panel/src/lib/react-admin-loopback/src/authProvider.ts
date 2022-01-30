import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_CHECK, AUTH_ERROR } from 'react-admin'
import storage from './storage'

/* eslint-disable prefer-promise-reject-errors */

export const authProvider = (loginApiUrl, noAccessPage = '/login') => {
  return (type, params) => {
    if (params?.username && !params.email) {
      params.email = params.username
      delete params.username //TODO avoid delete
    }
    if (type === AUTH_LOGIN) {
      const request = new Request(loginApiUrl, {
        method: 'POST',
        body: JSON.stringify(params),
        headers: new Headers({ 'Content-Type': 'application/json' }),
      })
      return fetch(request)
        .then((response) => {
          if (response.status < 200 || response.status >= 300)
            throw new Error(response.statusText)
          return response.json()
        })
        .then(({ ttl, ...data }) => {
          storage.save('lbtoken', data, ttl)
        })
    }
    if (type === AUTH_LOGOUT) {
      storage.remove('lbtoken')
      return Promise.resolve()
    }
    if (type === AUTH_ERROR) {
      const { status } = params
      if (status === 401 || status === 403) {
        storage.remove('lbtoken')
        return Promise.reject()
      }
      return Promise.resolve()
    }
    if (type === AUTH_CHECK) {
      const token = storage.load('lbtoken')
      if (token?.id) return Promise.resolve()
      storage.remove('lbtoken')
      return Promise.reject({ redirectTo: noAccessPage })
    }
    return Promise.reject('Unknown method')
  }
}
