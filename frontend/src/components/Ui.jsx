export const won = (value) => `${Number(value || 0).toLocaleString('ko-KR')}원`
export const rate = (value) => `${Number(value || 0).toFixed(2)}%`
export const shortDate = (value) => value ? value.slice(0, 10) : '-'

export function Notice({ type = 'info', children }) {
  if (!children) return null
  return <div className={`notice notice-${type}`}>{children}</div>
}

export function Loading() {
  return <div className="empty-panel">정보를 불러오고 있습니다.</div>
}

export function Empty({ children = '표시할 정보가 없습니다.' }) {
  return <div className="empty-panel">{children}</div>
}

export function StatusBadge({ status }) {
  const labels = {
    ACTIVE: '운용 중', MATURED: '만기', TERMINATED: '해지',
    PAID: '납입 완료', MISSED: '미납',
  }
  return <span className={`status-badge status-${String(status).toLowerCase()}`}>{labels[status] || status}</span>
}
