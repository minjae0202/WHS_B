import { useState } from 'react'
import PageShell from '../components/PageShell'
import { Notice, won } from '../components/Ui'
import { createInvestmentOrder, getApiError, getInvestmentPrice } from '../api/finance'

function InvestmentsPage() {
  const [symbol, setSymbol] = useState('')
  const [market, setMarket] = useState('KR')
  const [quote, setQuote] = useState(null)
  const [side, setSide] = useState('BUY')
  const [quantity, setQuantity] = useState('1')
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const search = async (event) => {
    event?.preventDefault(); setBusy(true); setError(''); setOrder(null)
    try { setQuote((await getInvestmentPrice(symbol.trim().toUpperCase(), market)).data) }
    catch (searchError) { setError(getApiError(searchError)); setQuote(null) }
    finally { setBusy(false) }
  }

  const submitOrder = async (event) => {
    event.preventDefault(); setBusy(true); setError('')
    try {
      const result = await createInvestmentOrder({ symbol: symbol.trim().toUpperCase(), market, side, quantity: Number(quantity) })
      setOrder(result.data)
    } catch (orderError) { setError(getApiError(orderError)) }
    finally { setBusy(false) }
  }

  return (
    <PageShell eyebrow="가상 주식 투자" title="투자 체험" description="국내·미국 주식과 ETF의 현재가를 확인하고 가상 주문을 체결하세요.">
      <Notice type="error">{error}</Notice>
      <div className="investment-layout">
        <section className="service-card">
          <span className="card-label">종목 조회</span><h2>현재가 확인</h2>
          <form className="investment-search" onSubmit={search}><select value={market} onChange={(event) => { setMarket(event.target.value); setQuote(null) }}><option value="KR">국내</option><option value="US">미국</option></select><input value={symbol} onChange={(event) => setSymbol(event.target.value)} placeholder={market === 'KR' ? '예: 005930' : '예: AAPL'} required /><button disabled={busy}>조회</button></form>
          {!quote ? <div className="quote-placeholder">종목 코드를 입력해 현재가를 확인하세요.</div> : <div className="quote-card"><div><span>{quote.market} · {quote.asset_type}</span><h3>{quote.name}</h3><small>{quote.symbol}</small></div><div className="quote-price"><strong>{quote.currency === 'KRW' ? won(quote.price) : `$${Number(quote.price).toLocaleString()}`}</strong>{quote.price_krw && <span>약 {won(quote.price_krw)}</span>}<em className={quote.is_tradable ? 'tradable' : ''}>{quote.is_tradable ? '거래 가능' : quote.market_session}</em></div></div>}
        </section>
        <section className="service-card order-card">
          <span className="card-label">시장가 주문</span><h2>매수·매도</h2>
          <form onSubmit={submitOrder}><div className="side-selector"><button type="button" className={side === 'BUY' ? 'buy active' : 'buy'} onClick={() => setSide('BUY')}>매수</button><button type="button" className={side === 'SELL' ? 'sell active' : 'sell'} onClick={() => setSide('SELL')}>매도</button></div><label className="field-label">주문 수량</label><div className="input-with-unit"><input type="number" min="1" max="1000000" value={quantity} onChange={(event) => setQuantity(event.target.value)} /><span>주</span></div><button className={`order-submit ${side.toLowerCase()}`} disabled={busy || !quote}>{side === 'BUY' ? '매수 주문' : '매도 주문'}</button></form>
        </section>
      </div>
      {order && <section className="order-result"><span>주문 체결 완료</span><h2>{order.name} {order.quantity}주</h2><div><p>체결 금액 <strong>{won(order.settlement_amount_krw)}</strong></p><p>수수료 <strong>{won(order.fee)}</strong></p><p>거래 후 잔액 <strong>{won(order.balance_after)}</strong></p><p>보유 수량 <strong>{order.holding_quantity}주</strong></p></div></section>}
    </PageShell>
  )
}

export default InvestmentsPage
