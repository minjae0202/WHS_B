import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/PageShell'
import { Empty, Loading, Notice } from '../components/Ui'
import { rate, won } from '../utils/format'
import { getApiError, getProducts } from '../api/finance'

async function fetchProducts(filters) {
  const params = { is_active: true, size: 100 }

  if (filters.product_type) params.product_type = filters.product_type
  if (filters.bank_name) params.bank_name = filters.bank_name

  const result = await getProducts(params)

  return result.data.items
}

function ProductsPage() {
  const [filters, setFilters] = useState({ product_type: '', bank_name: '' })
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async (nextFilters = filters) => {
    setLoading(true); setError('')

    try {
      const items = await fetchProducts(nextFilters)
      setProducts(items)
    } catch (loadError) {
      setError(getApiError(loadError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false

    fetchProducts({ product_type: '', bank_name: '' })
      .then((items) => {
        if (ignore) return

        setProducts(items)
        setLoading(false)
      })
      .catch((loadError) => {
        if (ignore) return

        setError(getApiError(loadError))
        setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  const changeProductType = (productType) => {
    const nextFilters = {
      ...filters,
      product_type: productType,
    }

    setFilters(nextFilters)
    load(nextFilters)
  }

  return (
    <PageShell eyebrow="금융상품 체험" title="예·적금 상품" description="실제 금융상품 데이터를 비교하고 예상 만기금액을 확인해보세요." actions={<Link className="service-secondary-button" to="/my-products">내 예·적금</Link>}>
      <form className="filter-bar" onSubmit={(event) => { event.preventDefault(); load() }}>
        <select value={filters.product_type} onChange={(event) => changeProductType(event.target.value)}><option value="">예금·적금 전체</option><option value="DEPOSIT">예금</option><option value="SAVING">적금</option></select>
        <input placeholder="은행명으로 검색" value={filters.bank_name} onChange={(event) => setFilters({ ...filters, bank_name: event.target.value })} />
        <button>상품 검색</button>
      </form>
      <Notice type="error">{error}</Notice>
      {loading ? <Loading /> : products.length === 0 ? <Empty>조건에 맞는 상품이 없습니다.</Empty> : (
        <div className="product-grid">
          {products.map((product) => {
            const activeOptions = product.options.filter((option) => option.is_active)
            const bestRate = activeOptions.reduce((best, option) => Math.max(best, Number(option.max_interest_rate)), 0)
            const minAmount = activeOptions.reduce((minimum, option) => Math.min(minimum, option.min_amount), Infinity)
            return <Link className="product-card" to={`/products/${product.product_id}`} key={product.product_id}>
              <div className="product-card-top"><span className="type-chip">{product.product_type === 'DEPOSIT' ? '예금' : '적금'}</span><span>{product.bank_name}</span></div>
              <h2>{product.product_name}</h2>
              <p>{product.description || '상품 상세에서 가입 조건과 기간별 금리를 확인하세요.'}</p>
              <div className="product-metrics"><div><span>최고 금리</span><strong>{rate(bestRate)}</strong></div><div><span>최소 금액</span><strong>{Number.isFinite(minAmount) ? won(minAmount) : '-'}</strong></div></div>
              <span className="detail-link">상품 자세히 보기 →</span>
            </Link>
          })}
        </div>
      )}
    </PageShell>
  )
}

export default ProductsPage