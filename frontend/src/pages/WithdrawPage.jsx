import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import Header from '../components/Header'
import { confirmAction, showToast } from '../components/Toast'

import {
  withdrawLocalAccount,
} from '../api/users'

import {
  getAuthProvider,
  isLoggedIn,
  removeTokens,
} from '../utils/token'

import {
  startGoogleWithdraw,
  startKakaoWithdraw,
} from '../utils/oauth'


function WithdrawPage() {
  const navigate =
    useNavigate()

  const provider =
    getAuthProvider()

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState('')

  const [
    confirmed,
    setConfirmed,
  ] = useState(false)

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


  const checkConfirmed = () => {
    if (!confirmed) {
      setErrorMessage(
        '회원탈퇴 안내 내용을 확인해주세요.',
      )

      return false
    }

    setErrorMessage('')

    return true
  }


  const handleLocalWithdraw =
    async (event) => {
      event.preventDefault()


      if (!currentPassword) {
        setErrorMessage(
          '현재 비밀번호를 입력해주세요.',
        )

        return
      }


      if (!checkConfirmed()) {
        return
      }


      const result =
        await confirmAction(
          '정말 회원탈퇴하시겠습니까?\n탈퇴 후 되돌릴 수 없습니다.',
        )


      if (!result) {
        return
      }


      try {
        setLoading(true)
        setErrorMessage('')

        await withdrawLocalAccount(
          currentPassword,
        )

        removeTokens()

        showToast(
          '회원탈퇴가 완료되었습니다.',
        )

        navigate(
          '/',
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
          '회원탈퇴 중 오류가 발생했습니다.'

        setErrorMessage(
          message,
        )
      } finally {
        setLoading(false)
      }
    }


  const handleGoogleWithdraw = async () => {
    if (!checkConfirmed()) {
      return
    }

    if (
      await confirmAction(
        'Google 계정을 다시 인증한 후 회원탈퇴를 진행합니다.',
      )
    ) {
      startGoogleWithdraw()
    }
  }


  const handleKakaoWithdraw = async () => {
    if (!checkConfirmed()) {
      return
    }

    if (
      await confirmAction(
        'Kakao 계정을 다시 인증한 후 회원탈퇴를 진행합니다.',
      )
    ) {
      startKakaoWithdraw()
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
              회원탈퇴
            </h1>

            <p>
              탈퇴하기 전에 아래 내용을
              확인해주세요.
            </p>

          </div>


          <div className="withdraw-warning">

            <strong>
              탈퇴 시 주의사항
            </strong>

            <p>
              회원탈퇴 시 관련 금융 데이터가
              삭제되며 현재 로그인 상태도
              함께 해제됩니다.
            </p>

          </div>


          <label className="checkbox-row">

            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) =>
                setConfirmed(
                  event.target.checked,
                )
              }
            />

            <span>
              회원탈퇴 안내 내용을 확인했습니다.
            </span>

          </label>


          {errorMessage && (
            <p className="error-message">
              {errorMessage}
            </p>
          )}


          {provider === 'LOCAL' && (
            <form
              className="auth-form withdraw-form"
              onSubmit={
                handleLocalWithdraw
              }
            >

              <div className="form-group">

                <label>
                  현재 비밀번호
                </label>

                <input
                  type="password"
                  placeholder="현재 비밀번호를 입력하세요"
                  value={currentPassword}
                  onChange={(event) =>
                    setCurrentPassword(
                      event.target.value,
                    )
                  }
                  autoComplete="current-password"
                />

              </div>


              <button
                type="submit"
                className="danger-button"
                disabled={loading}
              >
                {loading
                  ? '처리 중...'
                  : '회원탈퇴'}
              </button>

            </form>
          )}


          {provider === 'GOOGLE' && (
            <div className="social-withdraw-box">

              <p>
                가입한 Google 계정을
                다시 인증해야 합니다.
              </p>

              <button
                type="button"
                className="google-button"
                onClick={
                  handleGoogleWithdraw
                }
              >
                Google 재인증 후 탈퇴
              </button>

            </div>
          )}


          {provider === 'KAKAO' && (
            <div className="social-withdraw-box">

              <p>
                가입한 Kakao 계정을
                다시 인증해야 합니다.
              </p>

              <button
                type="button"
                className="kakao-button"
                onClick={
                  handleKakaoWithdraw
                }
              >
                Kakao 재인증 후 탈퇴
              </button>

            </div>
          )}


          {!provider && (
            <div className="provider-warning">

              <p>
                현재 로그인 방식을 확인할 수 없습니다.
              </p>

              <p>
                로그아웃 후 다시 로그인해주세요.
              </p>

            </div>
          )}


          <div className="auth-footer">

            <Link to="/">
              취소하고 돌아가기
            </Link>

          </div>

        </section>

      </main>

    </div>
  )
}


export default WithdrawPage
