import {
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import Header from '../components/Header'
import { showToast } from '../components/Toast'

import {
  socialSignup,
} from '../api/auth'

import {
  saveTokens,
} from '../utils/token'


function SocialSignupPage() {
  const navigate =
    useNavigate()

  const socialSignupToken =
    sessionStorage.getItem(
      'social_signup_token',
    )

  const socialNickname =
    sessionStorage.getItem(
      'social_nickname',
    ) || ''

  const socialProvider =
    sessionStorage.getItem(
      'social_provider',
    )


  const [
    username,
    setUsername,
  ] = useState('')

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  const [
    loading,
    setLoading,
  ] = useState(false)


  const providerName =
    socialProvider === 'GOOGLE'
      ? 'Google'
      : socialProvider === 'KAKAO'
        ? 'Kakao'
        : '소셜'


  const handleSignup =
    async (event) => {
      event.preventDefault()


      if (
        !socialSignupToken ||
        !socialProvider
      ) {
        setErrorMessage(
          '소셜 회원가입 정보를 찾을 수 없습니다.',
        )

        return
      }


      if (
        !username.trim()
      ) {
        setErrorMessage(
          '사용할 아이디를 입력해주세요.',
        )

        return
      }


      try {
        setLoading(true)
        setErrorMessage('')

        const response =
          await socialSignup(
            socialSignupToken,
            username,
          )

        saveTokens(
          response.data.access_token,
          response.data.refresh_token,
          socialProvider,
        )


        sessionStorage.removeItem(
          'social_signup_token',
        )

        sessionStorage.removeItem(
          'social_nickname',
        )

        sessionStorage.removeItem(
          'social_provider',
        )


        showToast(
          '소셜 회원가입이 완료되었습니다.',
        )

        navigate('/')
      } catch (error) {
        const message =
          error.response
            ?.data
            ?.error
            ?.message ||
          '소셜 회원가입 중 오류가 발생했습니다.'

        setErrorMessage(
          message,
        )
      } finally {
        setLoading(false)
      }
    }


  return (
    <div>
      <Header />

      <main className="auth-page">

        <section className="auth-card">

          <div className="auth-card-header">

            <span className="card-label">
              {providerName.toUpperCase()}
            </span>

            <h1>
              소셜 회원가입
            </h1>

            <p>
              서비스에서 사용할 아이디를
              설정해주세요.
            </p>

          </div>


          {socialNickname && (
            <div className="social-profile-info">

              <span>
                소셜 프로필
              </span>

              <strong>
                {socialNickname}
              </strong>

            </div>
          )}


          <form
            className="auth-form"
            onSubmit={handleSignup}
          >

            <div className="form-group">

              <label htmlFor="social-username">
                아이디
              </label>

              <input
                id="social-username"
                type="text"
                placeholder="4~20자의 아이디"
                value={username}
                onChange={(event) =>
                  setUsername(
                    event.target.value,
                  )
                }
              />

              <p className="field-hint">
                서비스에서 로그인 식별에 사용할
                아이디입니다.
              </p>

            </div>


            {errorMessage && (
              <p className="error-message">
                {errorMessage}
              </p>
            )}


            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading
                ? '가입 중...'
                : '가입 완료'}
            </button>

          </form>

        </section>

      </main>

    </div>
  )
}


export default SocialSignupPage
