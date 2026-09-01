const AUTH_PROVIDER_KEY = 'auth_provider'

const AUTH_CHANGE_EVENT = 'auth-change'


function notifyAuthChange() {
  window.dispatchEvent(
    new Event(AUTH_CHANGE_EVENT),
  )
}


export function saveAuthSession(
  provider = 'LOCAL',
) {
  localStorage.setItem(
    AUTH_PROVIDER_KEY,
    provider,
  )

  notifyAuthChange()
}


export function getAuthProvider() {
  return localStorage.getItem(
    AUTH_PROVIDER_KEY,
  )
}


export function removeTokens() {
  localStorage.removeItem(
    AUTH_PROVIDER_KEY,
  )

  notifyAuthChange()
}


export function isLoggedIn() {
  return Boolean(
    getAuthProvider(),
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
