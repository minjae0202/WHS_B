const OAUTH_STATE_KEY = 'oauth_state'
const OAUTH_ACTION_KEY = 'oauth_action'


function createState() {
  const values = new Uint32Array(4)

  crypto.getRandomValues(values)

  return Array.from(values)
    .map((value) => value.toString(16))
    .join('')
}


function saveOAuthRequest(
  state,
  action,
) {
  sessionStorage.setItem(
    OAUTH_STATE_KEY,
    state,
  )

  sessionStorage.setItem(
    OAUTH_ACTION_KEY,
    action,
  )
}


export function verifyOAuthState(
  receivedState,
) {
  const savedState =
    sessionStorage.getItem(
      OAUTH_STATE_KEY,
    )

  sessionStorage.removeItem(
    OAUTH_STATE_KEY,
  )

  return Boolean(
    savedState &&
    receivedState &&
    savedState === receivedState
  )
}


export function getOAuthAction() {
  return (
    sessionStorage.getItem(
      OAUTH_ACTION_KEY,
    ) || 'login'
  )
}


export function clearOAuthAction() {
  sessionStorage.removeItem(
    OAUTH_ACTION_KEY,
  )
}


function startGoogleOAuth(
  action,
) {
  const clientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID

  if (!clientId) {
    alert(
      'Google Client ID가 설정되지 않았습니다.',
    )
    return
  }

  const redirectUri =
    `${window.location.origin}/oauth/google/callback`

  const state = createState()

  saveOAuthRequest(
    state,
    action,
  )

  const params =
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile',
      state,
    })

  window.location.href =
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}


function startKakaoOAuth(
  action,
) {
  const restApiKey =
    import.meta.env.VITE_KAKAO_REST_API_KEY

  if (!restApiKey) {
    alert(
      'Kakao REST API Key가 설정되지 않았습니다.',
    )
    return
  }

  const redirectUri =
    `${window.location.origin}/oauth/kakao/callback`

  const state = createState()

  saveOAuthRequest(
    state,
    action,
  )

  const params =
    new URLSearchParams({
      client_id: restApiKey,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'profile_nickname',
      state,
    })

  window.location.href =
    `https://kauth.kakao.com/oauth/authorize?${params.toString()}`
}


export function startGoogleLogin() {
  startGoogleOAuth('login')
}


export function startKakaoLogin() {
  startKakaoOAuth('login')
}


export function startGoogleWithdraw() {
  startGoogleOAuth('withdraw')
}


export function startKakaoWithdraw() {
  startKakaoOAuth('withdraw')
}