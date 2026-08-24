import Header from './Header'

function PageShell({ eyebrow, title, description, actions, children }) {
  return (
    <div>
      <Header />
      <main className="service-page">
        <div className="service-container">
          <div className="service-heading">
            <div>
              <span className="eyebrow">{eyebrow}</span>
              <h1>{title}</h1>
              {description && <p>{description}</p>}
            </div>
            {actions && <div className="heading-actions">{actions}</div>}
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}

export default PageShell
