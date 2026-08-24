import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/PageShell'
import { Empty, Loading, Notice, StatusBadge, rate, shortDate, won } from '../components/Ui'
import {
  getApiError, getDeposit, getDeposits, getSaving, getSavingPayments,
  getSavings, terminateDeposit, terminateSaving,
} from '../api/finance'

function MyProductsPage() {
  const [tab, setTab] = useState('DEPOSIT')
  const [deposits, setDeposits] = useState([])
  const [savings, setSavings] = useState([])
  const [selected, setSelected] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const [depositResult, savingResult] = await Promise.all([
        getDeposits({ size: 100 }), getSavings({ size: 100 }),
      ])
      setDeposits(depositResult.data.items)
      setSavings(savingResult.data.items)
    } catch (loadError) { setError(getApiError(loadError)) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])
  useEffect(() => { setSelected(null); setPayments([]) }, [tab])

  const openDetail = async (item) => {
    setError('')
    try {
      if (tab === 'DEPOSIT') {
        const result = await getDeposit(item.deposit_id)
        setSelected(result.data); setPayments([])
      } else {
        const [detailResult, paymentResult] = await Promise.all([
          getSaving(item.saving_id), getSavingPayments(item.saving_id, { size: 100 }),
        ])
        setSelected(detailResult.data); setPayments(paymentResult.data.items)
      }
    } catch (detailError) { setError(getApiError(detailError)) }
  }

  const terminate = async () => {
    if (!window.confirm('중도해지하면 계약을 되돌릴 수 없습니다. 계속할까요?')) return
    setError(''); setMessage('')
    try {
      const result = tab === 'DEPOSIT'
        ? await terminateDeposit(selected.deposit_id)
        : await terminateSaving(selected.saving_id)
      setSelected(result.data)
      setMessage('중도해지가 완료되어 지급금이 가상 계좌에 입금되었습니다.')
      await load()
    } catch (terminateError) { setError(getApiError(terminateError)) }
  }

  const items = tab === 'DEPOSIT' ? deposits : savings

  return (
    <PageShell eyebrow="내 금융상품" title="내 예·적금" description="가입한 예금과 적금의 운용 상태와 납입 내역을 확인하세요." actions={<Link className="service-primary-button" to="/products">상품 둘러보기</Link>}>
      <Notice type="success">{message}</Notice><Notice type="error">{error}</Notice>
      <div className="tab-bar"><button className={tab === 'DEPOSIT' ? 'active' : ''} onClick={() => setTab('DEPOSIT')}>예금 <span>{deposits.length}</span></button><button className={tab === 'SAVING' ? 'active' : ''} onClick={() => setTab('SAVING')}>적금 <span>{savings.length}</span></button></div>
      {loading ? <Loading /> : items.length === 0 ? <Empty>가입한 {tab === 'DEPOSIT' ? '예금' : '적금'}이 없습니다.</Empty> : (
        <div className="contract-layout">
          <div className="contract-list">{items.map((item) => {
            const id = tab === 'DEPOSIT' ? item.deposit_id : item.saving_id
            return <button key={id} className={`contract-card ${selected && (selected.deposit_id === id || selected.saving_id === id) ? 'selected' : ''}`} onClick={() => openDetail(item)}>
              <div><span>{item.bank_name}</span><StatusBadge status={item.status} /></div><h3>{item.product_name}</h3><p>{item.term_months}개월 · {tab === 'DEPOSIT' ? won(item.principal) : `월 ${won(item.monthly_amount)}`}</p><strong>{rate(item.applied_interest_rate)}</strong>
            </button>
          })}</div>
          <div className="contract-detail">
            {!selected ? <Empty>상품을 선택하면 상세정보가 표시됩니다.</Empty> : <>
              <div className="detail-title"><div><span>{selected.bank_name}</span><h2>{selected.product_name}</h2></div><StatusBadge status={selected.status} /></div>
              <dl className="detail-data"><div><dt>가입일</dt><dd>{shortDate(selected.start_date)}</dd></div><div><dt>만기일</dt><dd>{shortDate(selected.maturity_date)}</dd></div><div><dt>적용 금리</dt><dd>{rate(selected.applied_interest_rate)}</dd></div><div><dt>{tab === 'DEPOSIT' ? '예치 원금' : '납입 원금'}</dt><dd>{won(tab === 'DEPOSIT' ? selected.principal : selected.total_paid_principal)}</dd></div><div><dt>세후 이자</dt><dd>{selected.net_interest == null ? '-' : won(selected.net_interest)}</dd></div><div><dt>지급 금액</dt><dd>{selected.payout_amount == null ? '-' : won(selected.payout_amount)}</dd></div></dl>
              {selected.selected_conditions?.length > 0 && <div className="selected-conditions"><strong>적용 우대조건</strong>{selected.selected_conditions.map((condition) => <span key={condition.condition_id}>{condition.condition_name} +{rate(condition.additional_interest_rate)}</span>)}</div>}
              {tab === 'SAVING' && <div className="payment-section"><div className="section-caption"><strong>납입 내역</strong><span>완료 {selected.paid_count} · 미납 {selected.missed_count}</span></div>{payments.length === 0 ? <Empty>납입 내역이 없습니다.</Empty> : <div className="payment-table">{payments.map((payment) => <div key={payment.payment_id}><span>{payment.payment_sequence}회차</span><span>{shortDate(payment.scheduled_date)}</span><strong>{won(payment.amount)}</strong><StatusBadge status={payment.status} /></div>)}</div>}</div>}
              {selected.status === 'ACTIVE' && <button className="outline-danger-button full-button" onClick={terminate}>중도해지</button>}
            </>}
          </div>
        </div>
      )}
    </PageShell>
  )
}

export default MyProductsPage
