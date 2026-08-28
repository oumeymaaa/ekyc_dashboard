import './EmptyState.css'

export default function EmptyState({ icon = '📭', title, subtitle, children }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      {title && <p className="empty-state-title">{title}</p>}
      {subtitle && <p className="empty-state-sub">{subtitle}</p>}
      {children && <div className="empty-state-actions">{children}</div>}
    </div>
  )
}