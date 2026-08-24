import axios from 'axios'

import {
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
  removeTokens,
} from '../utils/token'


const api = axios.create({
  baseURL: '/api',

  headers: {
    'Content-Type': 'application/json',
  },
})


/*
 * 모든 API 요청 전에 Access Token이 있으면
 * Authorization 헤더에 자동으로 넣는다.
 */
api.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken()

    if (accessToken) {
      config.headers.Authorization =
        `Bearer ${accessToken}`
    }

    return config
  },

  (error) => {
    return Promise.reject(error)
  },
)


let refreshPromise = null


/*
 * Access Token이 만료된 경우:
 *
 * 1. Refresh Token으로 /api/auth/refresh 호출
 * 2. 새 Access Token 저장
 * 3. 실패했던 원래 API 요청 다시 실행
 */
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    const errorCode =
      error.response?.data?.error?.code

    /*
     * Access Token 만료가 아니면
     * 일반 오류이므로 그대로 전달한다.
     */
    if (errorCode !== 'TOKEN_EXPIRED') {
      return Promise.reject(error)
    }

    /*
     * 이미 한 번 재시도한 요청이면
     * 또 Refresh하지 않는다.
     */
    if (originalRequest?._retry) {
      return Promise.reject(error)
    }

    const refreshToken = getRefreshToken()

    /*
     * Refresh Token도 없다면
     * 더 이상 로그인 상태를 유지할 수 없다.
     */
    if (!refreshToken) {
      removeTokens()

      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      /*
       * 여러 API가 동시에 만료되어도
       * Refresh 요청은 한 번만 보내도록 한다.
       */
      if (!refreshPromise) {
        refreshPromise = axios
          .post(
            '/api/auth/refresh',
            {},
            {
              headers: {
                Authorization:
                  `Bearer ${refreshToken}`,
              },
            },
          )
          .then((response) => {
            const newAccessToken =
              response.data?.data?.access_token

            if (!newAccessToken) {
              throw new Error(
                '새 Access Token을 받지 못했습니다.',
              )
            }

            saveAccessToken(newAccessToken)

            return newAccessToken
          })
          .finally(() => {
            refreshPromise = null
          })
      }

      const newAccessToken =
        await refreshPromise

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`

      /*
       * 새 토큰으로 실패했던 요청 다시 실행
       */
      return api(originalRequest)
    } catch (refreshError) {
      /*
       * Refresh Token도 만료됐거나
       * 무효화됐다면 로그인 정보를 지운다.
       */
      removeTokens()

      return Promise.reject(refreshError)
    }
  },
)


export async function signup(
  username,
  password,
  nickname,
) {
  const response = await api.post(
    '/auth/signup',
    {
      username,
      password,
      nickname,
    },
  )

  return response.data
}


export async function login(
  username,
  password,
) {
  const response = await api.post(
    '/auth/login',
    {
      username,
      password,
    },
  )

  return response.data
}


export async function refreshAccessToken() {
  const refreshToken =
    getRefreshToken()

  if (!refreshToken) {
    throw new Error(
      'Refresh Token이 없습니다.',
    )
  }

  const response = await axios.post(
    '/api/auth/refresh',
    {},
    {
      headers: {
        Authorization:
          `Bearer ${refreshToken}`,
      },
    },
  )

  const newAccessToken =
    response.data?.data?.access_token

  if (!newAccessToken) {
    throw new Error(
      '새 Access Token을 받지 못했습니다.',
    )
  }

  saveAccessToken(newAccessToken)

  return response.data
}


export async function logout() {
  const response = await api.post(
    '/auth/logout',
    {},
  )

  return response.data
}


export async function socialLogin(
  provider,
  code,
) {
  const response = await api.post(
    `/auth/${provider}`,
    {
      code,
    },
  )

  return response.data
}


export async function socialSignup(
  socialSignupToken,
  username,
) {
  const response = await api.post(
    '/auth/social/signup',
    {
      social_signup_token:
        socialSignupToken,

      username,
    },
  )

  return response.data
}


export default api