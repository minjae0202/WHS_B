import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PageShell from '../components/PageShell'
import { Loading, Notice } from '../components/Ui'
import { rate, shortDate, won } from '../utils/format'
import {
  createDeposit, createSaving, getApiError, getProduct,
  simulateDeposit, simulateSaving,
} from '../api/finance'
import useAuth from '../hooks/useAuth'

function ProductDetailPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { loggedIn } = useAuth()
  const [product, setProduct] = useState(null)
  const [optionId, setOptionId] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentDay, setPaymentDay] = useState('10')
  const [conditionIds, setConditionIds] = useState([])
  const [simulation, setSimulation] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    getProduct(productId).then((result) => {
      setProduct(result.data)
      const first = result.data.options.find((option) => option.is_active)
      if (first) {
        setOptionId(String(first.option_id))
        setConditionIds([])
        setSimulation(null)
      }
    }).catch((loadError) => setError(getApiError(loadError)))
  }, [productId])

  const selectedOption = useMemo(() => product?.options.find((option) => String(option.option_id) === optionId), [product, optionId])

  const changeOption = (nextOptionId) => {
    if (nextOptionId === optionId) return

    setOptionId(nextOptionId)
    setConditionIds([])
    setSimulation(null)
  }

  const payload = () => product.product_type === 'DEPOSIT'
    ? { option_id: Number(optionId), principal: Number(amount), selected_condition_ids: conditionIds }
    : { option_id: Number(optionId), monthly_amount: Number(amount), payment_day: Number(paymentDay), selected_condition_ids: conditionIds }

  const perform = async (mode) => {
    if (!loggedIn) { navigate('/login'); return }
    setBusy(true); setError(''); setMessage('')
    try {
      const isDeposit = product.product_type === 'DEPOSIT'
      const result = mode === 'simulate'
        ? await (isDeposit ? simulateDeposit(payload()) : simulateSaving(payload()))
        : await (isDeposit ? createDeposit(payload()) : createSaving(payload()))
      if (mode === 'simulate') setSimulation(result.data)
      else {
        setMessage(`${product.product_name} 가입이 완료되었습니다.`)
        setTimeout(() => navigate('/my-products'), 700)
      }
    } catch (actionError) { setError(getApiError(actionError)) }
    finally { setBusy(false) }
  }

  if (!product) return <PageShell eyebrow="상품 상세" title="상품 정보를 불러오는 중"><Notice type="error">{error}</Notice><Loading /></PageShell>

  return (
    <PageShell eyebrow={product.product_type === 'DEPOSIT' ? '정기예금' : '정기적금'} title={product.product_name} description={`${product.bank_name} · ${product.join_target || '가입 대상은 상품 설명을 확인하세요.'}`} actions={<Link className="service-secondary-button" to="/products">목록으로</Link>}>
      <Notice type="success">{message}</Notice><Notice type="error">{error}</Notice>
      <div className="detail-layout">
        <section className="service-card product-description-card">
          <span className="card-label">상품 안내</span><h2>상품 정보</h2>
          <p className="long-description">{product.description || '금융감독원에서 제공한 상품 정보입니다.'}</p>
          <div className="option-list">
            {product.options.map((option) => <button type="button" disabled={!option.is_active} className={`option-row ${optionId === String(option.option_id) ? 'selected' : ''}`} key={option.option_id} onClick={() => changeOption(String(option.option_id))}>
              <span><strong>{option.term_months}개월</strong><small>{option.interest_method === 'COMPOUND' ? '월복리' : '단리'}</small></span>
              <span>기본 {rate(option.base_interest_rate)}</span><strong>최고 {rate(option.max_interest_rate)}</strong>
            </button>)}
          </div>
        </section>

        <section className="service-card join-card">
          <span className="card-label">가입 시뮬레이션</span><h2>{product.product_type === 'DEPOSIT' ? '예치 조건 입력' : '납입 조건 입력'}</h2>
          {selectedOption && <>
            <label className="field-label">{product.product_type === 'DEPOSIT' ? '예치 원금' : '월 납입금'}</label>
            <div className="input-with-unit"><input type="number" min={selectedOption.min_amount} max={selectedOption.max_amount} value={amount} onChange={(event) => setAmount(event.target.value)} placeholder={String(selectedOption.min_amount)} /><span>원</span></div>
            <p className="field-hint">가입 가능 금액 {won(selectedOption.min_amount)} ~ {won(selectedOption.max_amount)}</p>
            {product.product_type === 'SAVING' && <><label className="field-label field-spaced">자동이체일</label><select className="full-select" value={paymentDay} onChange={(event) => setPaymentDay(event.target.value)}>{Array.from({ length: 28 }, (_, index) => <option value={index + 1} key={index + 1}>매월 {index + 1}일</option>)}</select></>}
            {selectedOption.preference_conditions?.length > 0 && <div className="condition-box"><strong>해당하는 우대 조건을 선택하세요</strong>{selectedOption.preference_conditions.map((condition) => <label key={condition.condition_id}><input type="checkbox" checked={conditionIds.includes(condition.condition_id)} onChange={(event) => setConditionIds(event.target.checked ? [...conditionIds, condition.condition_id] : conditionIds.filter((id) => id !== condition.condition_id))} /><span><b>{condition.condition_name}</b><small>{condition.description}</small></span><em>+{rate(condition.additional_interest_rate)}</em></label>)}</div>}
            <div className="button-row"><button className="service-secondary-button" disabled={busy || !amount} onClick={() => perform('simulate')}>예상금액 계산</button><button className="service-primary-button" disabled={busy || !amount} onClick={() => perform('join')}>가입하기</button></div>
          </>}
        </section>
      </div>

      {simulation && <section className="result-panel"><div><span>적용 금리</span><strong>{rate(simulation.applied_interest_rate)}</strong></div><div><span>예상 이자</span><strong>{won(simulation.expected_interest)}</strong></div><div><span>예상 세금</span><strong>{won(simulation.expected_tax)}</strong></div><div><span>세후 만기금액</span><strong>{won(simulation.expected_maturity_amount)}</strong></div><div><span>예상 만기일</span><strong>{shortDate(simulation.maturity_date)}</strong></div></section>}
    </PageShell>
  )
}

export default ProductDetailPage