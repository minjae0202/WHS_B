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
  changePassword,
} from '../api/users'

import {
  getAuthProvider,
  isLoggedIn,
  removeTokens,
} from '../utils/token'


function PasswordChangePage() {
  const navigate =
    useNavigate()

  const provider =
    getAuthProvider()

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState('')

  const [
    newPassword,
    setNewPassword,
  ] = useState('')

  const [
    newPasswordConfirm,
    setNewPasswordConfirm,
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
    if (!isLoggedIn()) {
      navigate(
        '/login',
        {
          replace: true,
        },
      )
    }
  }, [navigate])


  if (
    provider &&
    provider !== 'LOCAL'
  ) {
    return (
      <div>
        <Header />

        <main className="content-page">

          <section className="settings-card">

            <span className="card-label">
              계정 관리
            </span>

            <h1>
              비밀번호 변경
            </h1>

            <p>
              Google 또는 Kakao로 가입한 계정은
              서비스 비밀번호를 사용하지 않습니다.
            </p>

            <div className="auth-footer">
              <Link to="/">
                메인으로 돌아가기
              </Link>
            </div>

          </section>

        </main>
      </div>
    )
  }


  const handleChangePassword =
    async (event) => {
      event.preventDefault()


      if (
        !currentPassword ||
        !newPassword ||
        !newPasswordConfirm
      ) {
        setErrorMessage(
          '모든 항목을 입력해주세요.',
        )

        return
      }


      if (
        newPassword !==
        newPasswordConfirm
      ) {
        setErrorMessage(
          '새 비밀번호가 일치하지 않습니다.',
        )

        return
      }


      try {
        setLoading(true)
        setErrorMessage('')

        await changePassword(
          currentPassword,
          newPassword,
        )

        removeTokens()

        alert(
          '비밀번호가 변경되었습니다. 다시 로그인해주세요.',
        )

        navigate(
          '/login',
          {
            replace: true,
          },
        )
      } catch (error) {
        const message =
          error.response
            ?.data
            ?.error
            ?.message ||
          '비밀번호 변경 중 오류가 발생했습니다.'

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

      <main className="content-page">

        <section className="settings-card">

          <div className="auth-card-header">

            <span className="card-label">
              계정 관리
            </span>

            <h1>
              비밀번호 변경
            </h1>

            <p>
              현재 비밀번호를 확인한 뒤
              새로운 비밀번호를 설정합니다.
            </p>

          </div>


          <form
            className="auth-form"
            onSubmit={
              handleChangePassword
            }
          >

            <div className="form-group">

              <label>
                현재 비밀번호
              </label>

              <input
                type="password"
                placeholder="현재 비밀번호"
                value={currentPassword}
                onChange={(event) =>
                  setCurrentPassword(
                    event.target.value,
                  )
                }
                autoComplete="current-password"
              />

            </div>


            <div className="form-group">

              <label>
                새 비밀번호
              </label>

              <input
                type="password"
                placeholder="새 비밀번호"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(
                    event.target.value,
                  )
                }
                autoComplete="new-password"
              />

              <p className="field-hint">
                영문, 숫자, 특수문자를 포함한
                8~20자로 입력해주세요.
              </p>

            </div>


            <div className="form-group">

              <label>
                새 비밀번호 확인
              </label>

              <input
                type="password"
                placeholder="새 비밀번호를 다시 입력하세요"
                value={newPasswordConfirm}
                onChange={(event) =>
                  setNewPasswordConfirm(
                    event.target.value,
                  )
                }
                autoComplete="new-password"
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
                ? '변경 중...'
                : '비밀번호 변경'}
            </button>

          </form>


          <div className="auth-footer">
            <Link to="/">
              메인으로 돌아가기
            </Link>
          </div>

        </section>

      </main>

    </div>
  )
}


export default PasswordChangePage