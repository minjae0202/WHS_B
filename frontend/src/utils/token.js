const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const AUTH_PROVIDER_KEY = 'auth_provider'

const AUTH_CHANGE_EVENT = 'auth-change'


function notifyAuthChange() {
  window.dispatchEvent(
    new Event(AUTH_CHANGE_EVENT),
  )
}


export function saveTokens(
  accessToken,
  refreshToken,
  provider = 'LOCAL',
) {
  localStorage.setItem(
    ACCESS_TOKEN_KEY,
    accessToken,
  )

  localStorage.setItem(
    REFRESH_TOKEN_KEY,
    refreshToken,
  )

  localStorage.setItem(
    AUTH_PROVIDER_KEY,
    provider,
  )

  notifyAuthChange()
}


export function saveAccessToken(
  accessToken,
) {
  localStorage.setItem(
    ACCESS_TOKEN_KEY,
    accessToken,
  )
}


export function getAccessToken() {
  return localStorage.getItem(
    ACCESS_TOKEN_KEY,
  )
}


export function getRefreshToken() {
  return localStorage.getItem(
    REFRESH_TOKEN_KEY,
  )
}


export function getAuthProvider() {
  return localStorage.getItem(
    AUTH_PROVIDER_KEY,
  )
}


export function removeTokens() {
  localStorage.removeItem(
    ACCESS_TOKEN_KEY,
  )

  localStorage.removeItem(
    REFRESH_TOKEN_KEY,
  )

  localStorage.removeItem(
    AUTH_PROVIDER_KEY,
  )

  notifyAuthChange()
}


export function isLoggedIn() {
  return Boolean(
    getAccessToken(),
  )
}


export function subscribeAuthChange(
  callback,
) {
  window.addEventListener(
    AUTH_CHANGE_EVENT,
    callback,
  )

  window.addEventListener(
    'storage',
    callback,
  )

  return () => {
    window.removeEventListener(
      AUTH_CHANGE_EVENT,
      callback,
    )

    window.removeEventListener(
      'storage',
      callback,
    )
  }
}