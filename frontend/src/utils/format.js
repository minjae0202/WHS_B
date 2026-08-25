export const won = (value) => `${Number(value || 0).toLocaleString('ko-KR')}원`
export const rate = (value) => `${Number(value || 0).toFixed(2)}%`
export const shortDate = (value) => value ? value.slice(0, 10) : '-'