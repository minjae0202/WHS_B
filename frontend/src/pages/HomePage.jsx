import {
  Link,
} from 'react-router-dom'

import Header from '../components/Header'

import useAuth from '../hooks/useAuth'


function HomePage() {
  const {
    loggedIn,
    provider,
  } = useAuth()


  return (
    <div>
      <Header />

      <main className="home-page">

        <div className="home-container">

          <section className="home-hero">

            <div className="hero-text">

              <p className="eyebrow">
                가상 금융 시뮬레이션
              </p>

              <h1>
                금융을 직접 경험하며
                <br />
                나만의 목표를 만들어보세요
              </h1>

              <p className="hero-description">
                실제 돈을 사용하지 않고
                가상 자산으로 저축, 예·적금,
                주식 투자를 경험할 수 있습니다.
              </p>


              {!loggedIn && (
                <div className="hero-actions">

                  <Link
                    to="/signup"
                    className="primary-button"
                  >
                    시작하기
                  </Link>

                  <Link
                    to="/login"
                    className="secondary-button"
                  >
                    로그인
                  </Link>

                </div>
              )}


              {loggedIn && (
                <p className="hero-login-guide">
                  다양한 금융 기능을 직접 체험해보세요.
                </p>
              )}

            </div>


            <div className="hero-visual">

              <div className="visual-card">

                <span>
                  저축 목표
                </span>

                <strong>
                  목표를 세우고 관리
                </strong>

              </div>


              <div className="visual-card visual-card-two">

                <span>
                  예·적금
                </span>

                <strong>
                  금융상품 체험
                </strong>

              </div>


              <div className="visual-card">

                <span>
                  투자
                </span>

                <strong>
                  가상 주식 투자
                </strong>

              </div>

            </div>

          </section>


          <section className="home-bottom-grid">

            {loggedIn ? (
              <div className="dashboard-card">

                <span className="card-label">
                  내 계정
                </span>

                <h2>
                  금융 시뮬레이션 시작하기
                </h2>

                <p>
                  저축 목표부터 금융상품,
                  가상 투자까지 다양한 기능을
                  직접 체험해보세요.
                </p>


                <div className="account-link-row">

                  <Link to="/account">
                    내 자산 관리
                  </Link>

                  <Link to="/my-products">
                    내 예·적금
                  </Link>

                  {provider === 'LOCAL' && (
                    <Link to="/password">
                      비밀번호 변경
                    </Link>
                  )}

                  <Link to="/withdraw">
                    회원탈퇴
                  </Link>

                </div>

              </div>
            ) : (
              <div className="dashboard-card">

                <span className="card-label">
                  시작하기
                </span>

                <h2>
                  처음 이용하시나요?
                </h2>

                <p>
                  계정을 만들면 가상 자산을 이용한
                  금융 시뮬레이션을 시작할 수 있습니다.
                </p>

                <div className="account-link-row">

                  <Link to="/signup">
                    회원가입
                  </Link>

                  <Link to="/login">
                    로그인
                  </Link>

                </div>

              </div>
            )}


            <div className="feature-summary-card">

              <div>
                <strong>
                  01
                </strong>

                <span>
                  목표 설정
                </span>
              </div>


              <div>
                <strong>
                  02
                </strong>

                <span>
                  금융상품 체험
                </span>
              </div>


              <div>
                <strong>
                  03
                </strong>

                <span>
                  투자 경험
                </span>
              </div>

            </div>

          </section>

        </div>

      </main>
    </div>
  )
}


export default HomePage