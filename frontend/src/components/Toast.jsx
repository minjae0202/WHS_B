import { useEffect, useState } from 'react'

const TOAST_EVENT = 'seedthemoa:toast'
const CONFIRM_EVENT = 'seedthemoa:confirm'

export function showToast(message, type = 'success') {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, {
    detail: { message, type },
  }))
}

export function confirmAction(message) {
  return new Promise((resolve) => {
    window.dispatchEvent(new CustomEvent(CONFIRM_EVENT, {
      detail: { message, resolve },
    }))
  })
}

function Toast() {
  const [toasts, setToasts] = useState([])
  const [confirmation, setConfirmation] = useState(null)

  useEffect(() => {
    const handleToast = (event) => {
      const id = `${Date.now()}-${Math.random()}`
      const toast = { id, ...event.detail }

      setToasts((current) => [...current, toast])

      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id))
      }, 3000)
    }

    window.addEventListener(TOAST_EVENT, handleToast)
    const handleConfirm = (event) => setConfirmation(event.detail)
    window.addEventListener(CONFIRM_EVENT, handleConfirm)

    return () => {
      window.removeEventListener(TOAST_EVENT, handleToast)
      window.removeEventListener(CONFIRM_EVENT, handleConfirm)
    }
  }, [])

  const closeConfirmation = (result) => {
    confirmation?.resolve(result)
    setConfirmation(null)
  }

  return (
    <>
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-message toast-${toast.type}`} role="status">
          <span>{toast.type === 'error' ? '!' : '✓'}</span>
          <p>{toast.message}</p>
          <button type="button" aria-label="알림 닫기" onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}>×</button>
        </div>
      ))}
    </div>
    {confirmation && (
      <div className="confirm-backdrop" role="presentation" onMouseDown={() => closeConfirmation(false)}>
        <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message" onMouseDown={(event) => event.stopPropagation()}>
          <h2 id="confirm-title">확인이 필요합니다</h2>
          <p id="confirm-message">{confirmation.message}</p>
          <div>
            <button type="button" className="confirm-cancel" onClick={() => closeConfirmation(false)}>취소</button>
            <button type="button" className="confirm-accept" autoFocus onClick={() => closeConfirmation(true)}>확인</button>
          </div>
        </section>
      </div>
    )}
    </>
  )
}

export default Toast
