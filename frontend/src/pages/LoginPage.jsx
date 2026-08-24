import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import Header from '../components/Header'

import {
  login,
} from '../api/auth'

import {
  isLoggedIn,
  saveTokens,
} from '../utils/token'

import {
  startGoogleLogin,
  startKakaoLogin,
} from '../utils/oauth'


function LoginPage() {
  const navigate =
    useNavigate()

  const [
    username,
    setUsername,
  ] = useState('')

  const [
    password,
    setPassword,
  ] = useState('')

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  const [
    loading,
    setLoading,
  ] = useState(false)


  useEffect(() => {
    if (isLoggedIn()) {
      navigate(
        '/',
        {
          replace: true,
        },
      )
    }
  }, [navigate])


  const handleLogin =
    async (event) => {
      event.preventDefault()

      if (
        !username.trim() ||
        !password
      ) {
        setErrorMessage(
          '아이디와 비밀번호를 입력해주세요.',
        )

        return
      }


      try {
        setLoading(true)
        setErrorMessage('')

        const response =
          await login(
            username,
            password,
          )

        saveTokens(
          response.data.access_token,
          response.data.refresh_token,
          'LOCAL',
        )

        alert(
          '로그인에 성공했습니다.',
        )

        navigate('/')
      } catch (error) {
        const message =
          error.response
            ?.data
            ?.error
            ?.message ||
          '로그인 중 오류가 발생했습니다.'

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

            <h1>
              로그인
            </h1>

            <p>
              아이디 또는 소셜 계정으로
              로그인할 수 있습니다.
            </p>

          </div>


          <form
            className="auth-form"
            onSubmit={handleLogin}
          >

            <div className="form-group">

              <label htmlFor="username">
                아이디
              </label>

              <input
                id="username"
                type="text"
                placeholder="아이디를 입력하세요"
                value={username}
                onChange={(event) =>
                  setUsername(
                    event.target.value,
                  )
                }
                autoComplete="username"
              />

            </div>


            <div className="form-group">

              <label htmlFor="password">
                비밀번호
              </label>

              <input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
                }
                autoComplete="current-password"
              />

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
                ? '로그인 중...'
                : '로그인'}
            </button>

          </form>


          <div className="auth-footer">

            <span>
              계정이 없으신가요?
            </span>

            <Link to="/signup">
              회원가입
            </Link>

          </div>


          <div className="social-divider">
            <span>
              또는 소셜 계정으로 로그인
            </span>
          </div>


          <div className="social-buttons">

            <button
              type="button"
              className="google-button"
              onClick={startGoogleLogin}
            >
              Google로 로그인
            </button>


            <button
              type="button"
              className="kakao-button"
              onClick={startKakaoLogin}
            >
              Kakao로 로그인
            </button>

          </div>

        </section>

      </main>

    </div>
  )
}


export default LoginPage