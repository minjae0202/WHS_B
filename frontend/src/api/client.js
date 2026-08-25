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

    if (errorCode !== 'TOKEN_EXPIRED') {
      return Promise.reject(error)
    }

    if (originalRequest?._retry) {
      return Promise.reject(error)
    }

    const refreshToken = getRefreshToken()

    if (!refreshToken) {
      removeTokens()

      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
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

      return api(originalRequest)

    } catch (refreshError) {
      removeTokens()

      return Promise.reject(
        refreshError
      )
    }
  },
)


export default api