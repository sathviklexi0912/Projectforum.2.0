import { Link } from "react-router-dom";

/* Friendly placeholder for lists that have nothing in them yet. */
export default function EmptyState({ icon: Icon, title, text, action, to, onClick, testId }) {
  return (
    <div className="pf-empty" data-testid={testId}>
      {Icon && (
        <div className="pf-empty-icon">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <h3 className="font-display">{title}</h3>
      {text && <p>{text}</p>}
      {action && to && (
        <Link to={to} className="pf-btn-primary mt-5">{action}</Link>
      )}
      {action && !to && onClick && (
        <button type="button" onClick={onClick} className="pf-btn-secondary mt-5">{action}</button>
      )}
    </div>
  );
}
