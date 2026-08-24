import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import {
  socialLogin,
} from '../api/auth'

import {
  withdrawSocialAccount,
} from '../api/users'

import {
  removeTokens,
  saveTokens,
} from '../utils/token'

import {
  clearOAuthAction,
  getOAuthAction,
  verifyOAuthState,
} from '../utils/oauth'


function OAuthCallbackPage({
  provider,
}) {
  const location =
    useLocation()

  const navigate =
    useNavigate()

  const processingRef =
    useRef(false)

  const [
    message,
    setMessage,
  ] = useState(
    '소셜 계정을 확인하고 있습니다...',
  )


  useEffect(() => {
    if (
      processingRef.current
    ) {
      return
    }

    processingRef.current =
      true


    const processOAuth =
      async () => {
        const params =
          new URLSearchParams(
            location.search,
          )

        const code =
          params.get('code')

        const state =
          params.get('state')

        const oauthError =
          params.get('error')


        if (oauthError) {
          clearOAuthAction()

          setMessage(
            '소셜 인증이 취소되었습니다.',
          )

          return
        }


        if (!code) {
          clearOAuthAction()

          setMessage(
            '인증 코드를 확인할 수 없습니다.',
          )

          return
        }


        if (
          !verifyOAuthState(
            state,
          )
        ) {
          clearOAuthAction()

          setMessage(
            '인증 요청 정보를 확인할 수 없습니다.',
          )

          return
        }


        const action =
          getOAuthAction()

        const backendProvider =
          provider === 'google'
            ? 'GOOGLE'
            : 'KAKAO'


        if (
          action === 'withdraw'
        ) {
          try {
            setMessage(
              '회원탈퇴를 처리하고 있습니다...',
            )

            await withdrawSocialAccount(
              backendProvider,
              code,
            )

            clearOAuthAction()
            removeTokens()

            alert(
              '회원탈퇴가 완료되었습니다.',
            )

            navigate(
              '/',
              {
                replace: true,
              },
            )

            return
          } catch (error) {
            clearOAuthAction()

            const errorMessage =
              error.response
                ?.data
                ?.error
                ?.message ||
              '소셜 회원탈퇴 중 오류가 발생했습니다.'

            setMessage(
              errorMessage,
            )

            return
          }
        }


        try {
          const response =
            await socialLogin(
              provider,
              code,
            )

          const data =
            response.data


          if (
            data.signup_required
          ) {
            sessionStorage.setItem(
              'social_signup_token',
              data.social_signup_token,
            )

            sessionStorage.setItem(
              'social_nickname',
              data.nickname || '',
            )

            sessionStorage.setItem(
              'social_provider',
              backendProvider,
            )

            clearOAuthAction()

            navigate(
              '/social-signup',
              {
                replace: true,
              },
            )

            return
          }


          if (
            data.access_token &&
            data.refresh_token
          ) {
            saveTokens(
              data.access_token,
              data.refresh_token,
              backendProvider,
            )

            clearOAuthAction()

            alert(
              '로그인에 성공했습니다.',
            )

            navigate(
              '/',
              {
                replace: true,
              },
            )

            return
          }


          clearOAuthAction()

          setMessage(
            '로그인 결과를 확인할 수 없습니다.',
          )
        } catch (error) {
          clearOAuthAction()

          const errorMessage =
            error.response
              ?.data
              ?.error
              ?.message ||
            '소셜 로그인 중 오류가 발생했습니다.'

          setMessage(
            errorMessage,
          )
        }
      }


    processOAuth()
  }, [
    location.search,
    navigate,
    provider,
  ])


  return (
    <main className="oauth-callback-page">

      <div className="oauth-callback-card">

        <span className="card-label">
          SOCIAL AUTH
        </span>

        <h1>
          소셜 인증
        </h1>

        <p>
          {message}
        </p>

      </div>

    </main>
  )
}


export default OAuthCallbackPage