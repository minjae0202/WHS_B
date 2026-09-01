import axios from 'axios'

import {
  removeTokens,
} from '../utils/token'


const api = axios.create({
  baseURL: '/api',
  withCredentials: true,

  headers: {
    'Content-Type': 'application/json',
  },
})


/*
 * 상태 변경 요청에는 JWT 쿠키의 CSRF 토큰을 함께 보낸다.
 */
api.interceptors.request.use(
  (config) => {
    const method = config.method?.toLowerCase()
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      const csrfToken = document.cookie
        .split('; ')
        .find((item) => item.startsWith('csrf_access_token='))
        ?.split('=')[1]
      if (csrfToken) {
        config.headers['X-CSRF-TOKEN'] = csrfToken
      }
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
 * 2. 새 Access Token 쿠키 발급
 * 3. 실패했던 원래 API 요청 다시 실행
 */
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    const errorCode =
      error.response?.data?.error?.code

    if (![
      'AUTH_REQUIRED',
      'INVALID_TOKEN',
      'TOKEN_EXPIRED',
    ].includes(errorCode)) {
      return Promise.reject(error)
    }

    if (originalRequest?._retry) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      if (!refreshPromise) {
        const csrfToken = document.cookie
          .split('; ')
          .find((item) => item.startsWith('csrf_refresh_token='))
          ?.split('=')[1]

        refreshPromise = axios
          .post(
            '/api/auth/refresh',
            {},
            {
              withCredentials: true,
              headers: {
                'X-CSRF-TOKEN': csrfToken,
              },
            },
          )
          .then(() => true)
          .finally(() => {
            refreshPromise = null
          })
      }

      await refreshPromise

      const accessCsrfToken = document.cookie
        .split('; ')
        .find((item) => item.startsWith('csrf_access_token='))
        ?.split('=')[1]
      if (accessCsrfToken) {
        originalRequest.headers['X-CSRF-TOKEN'] = accessCsrfToken
      }

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
