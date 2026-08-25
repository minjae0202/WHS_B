import { useEffect, useState } from 'react'
import PageShell from '../components/PageShell'
import { Loading, Notice } from '../components/Ui'
import { won } from '../utils/format'
import {
  getAccount, getApiError, getSimulationSettings, payMonthlyIncome,
  resetSimulation, setInitialAsset, updateSimulationSettings,
} from '../api/finance'

const currentMonth = new Date().toISOString().slice(0, 7)

async function fetchAccountData() {
  const [accountResult, settingsResult] = await Promise.all([
    getAccount(), getSimulationSettings(),
  ])

  return {
    account: accountResult.data,
    settings: settingsResult.data,
  }
}

function AccountPage() {
  const [account, setAccount] = useState(null)
  const [settings, setSettings] = useState(null)
  const [initialAsset, setInitialAssetValue] = useState('')
  const [monthlyIncome, setMonthlyIncome] = useState('')
  const [monthlyExpense, setMonthlyExpense] = useState('')
  const [yearMonth, setYearMonth] = useState(currentMonth)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = async () => {
    try {
      const result = await fetchAccountData()

      setAccount(result.account)
      setSettings(result.settings)
      setMonthlyIncome(String(result.settings.monthly_income ?? 0))
      setMonthlyExpense(String(result.settings.monthly_expense ?? 0))
    } catch (loadError) {
      setError(getApiError(loadError))
    }
  }

  useEffect(() => {
    let ignore = false

    fetchAccountData()
      .then((result) => {
        if (ignore) return

        setAccount(result.account)
        setSettings(result.settings)
        setMonthlyIncome(String(result.settings.monthly_income ?? 0))
        setMonthlyExpense(String(result.settings.monthly_expense ?? 0))
      })
      .catch((loadError) => {
        if (!ignore) {
          setError(getApiError(loadError))
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  const run = async (action) => {
    setBusy(true); setError(''); setMessage('')
    try {
      const result = await action()
      setMessage(result.message || '요청이 완료되었습니다.')
      await load()
    } catch (actionError) {
      setError(getApiError(actionError))
    } finally {
      setBusy(false)
    }
  }

  if (!account || !settings) {
    return <PageShell eyebrow="내 계정" title="가상 자산 관리"><Notice type="error">{error}</Notice><Loading /></PageShell>
  }

  return (
    <PageShell eyebrow="내 계정" title="가상 자산 관리" description="시뮬레이션에 사용할 자산과 매월 현금 흐름을 설정하세요.">
      <Notice type="success">{message}</Notice>
      <Notice type="error">{error}</Notice>

      <section className="account-overview">
        <div><span>가상 계좌</span><strong>{account.account_number}</strong></div>
        <div><span>현재 잔액</span><strong>{won(account.balance)}</strong></div>
        <div><span>통화</span><strong>{account.currency}</strong></div>
      </section>

      <div className="service-grid two-columns">
        <section className="service-card">
          <span className="card-label">초기 설정</span>
          <h2>초기 자산</h2>
          <p>시뮬레이션을 시작할 가상 자산을 한 번 설정할 수 있습니다.</p>
          {settings.is_initial_asset_set ? (
            <div className="setting-result"><span>설정된 초기 자산</span><strong>{won(settings.initial_asset)}</strong></div>
          ) : (
            <form onSubmit={(event) => { event.preventDefault(); run(() => setInitialAsset(Number(initialAsset))) }}>
              <label className="field-label">초기 자산</label>
              <div className="input-with-unit"><input type="number" min="0" max="100000000" value={initialAsset} onChange={(event) => setInitialAssetValue(event.target.value)} required /><span>원</span></div>
              <button className="service-primary-button" disabled={busy}>초기 자산 설정</button>
            </form>
          )}
        </section>

        <section className="service-card">
          <span className="card-label">월간 설정</span>
          <h2>예상 수입과 지출</h2>
          <p>월 예상 지출은 월 정기 수입을 초과할 수 없습니다.</p>
          <form onSubmit={(event) => { event.preventDefault(); run(() => updateSimulationSettings(Number(monthlyIncome), Number(monthlyExpense))) }}>
            <div className="compact-fields">
              <div><label className="field-label">월 정기 수입</label><input type="number" min="0" max="10000000" value={monthlyIncome} onChange={(event) => setMonthlyIncome(event.target.value)} required /></div>
              <div><label className="field-label">월 예상 지출</label><input type="number" min="0" max="10000000" value={monthlyExpense} onChange={(event) => setMonthlyExpense(event.target.value)} required /></div>
            </div>
            <button className="service-primary-button" disabled={busy}>월간 설정 저장</button>
          </form>
        </section>

        <section className="service-card">
          <span className="card-label">현금 흐름</span>
          <h2>월 정기 수입 지급</h2>
          <p>선택한 달의 정기 수입을 가상 계좌로 지급합니다.</p>
          <div className="inline-action"><input type="month" value={yearMonth} onChange={(event) => setYearMonth(event.target.value)} /><button onClick={() => run(() => payMonthlyIncome(yearMonth))} disabled={busy}>수입 지급</button></div>
        </section>

        <section className="service-card danger-card">
          <span className="card-label danger-label">초기화</span>
          <h2>시뮬레이션 초기화</h2>
          <p>가상 계좌와 시뮬레이션 설정을 초기 상태로 되돌립니다.</p>
          <button className="outline-danger-button" disabled={busy} onClick={() => window.confirm('시뮬레이션 데이터를 초기화할까요?') && run(resetSimulation)}>전체 초기화</button>
        </section>
      </div>
    </PageShell>
  )
}

export default AccountPage