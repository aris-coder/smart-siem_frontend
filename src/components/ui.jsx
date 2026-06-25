export function Badge({ children, tone = 'muted' }) {
  return <span className={`app-badge tone-${tone}`}>{children}</span>;
}

export function SectionHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="section-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && <div className="section-action">{action}</div>}
    </div>
  );
}

const statIcons = {
  danger: 'bi-shield-fill-exclamation',
  warning: 'bi-exclamation-triangle',
  success: 'bi-check2-circle',
  info: 'bi-activity',
  notice: 'bi-stars',
  muted: 'bi-circle',
};

export function StatCard({ label, value, helper, tone = 'info' }) {
  return (
    <article className={`stat-card tone-${tone}`}>
      <div className="stat-icon" aria-hidden="true">
        <i className={`bi ${statIcons[tone] || statIcons.info}`} />
      </div>
      <p>{label}</p>
      <strong>{value}</strong>
      <small>{helper}</small>
    </article>
  );
}

export function DataTable({ columns, rows }) {
  return (
    <div className="table-shell table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead>
          <tr>
            {columns.map((column) => (
              <th scope="col" key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MiniBarChart({ data }) {
  const max = Math.max(...data.flatMap((point) => [point.safe, point.alert]));

  return (
    <div className="mini-chart" aria-label="Graphique activité sécurité">
      {data.map((point) => (
        <div className="mini-chart-point" key={point.label}>
          <div className="mini-chart-bars">
            <span className="safe-bar" style={{ height: `${(point.safe / max) * 100}%` }} />
            <span className="alert-bar" style={{ height: `${(point.alert / max) * 100}%` }} />
          </div>
          <small>{point.label}</small>
        </div>
      ))}
    </div>
  );
}

export function DonutChart({ value, label }) {
  return (
    <div className="donut-wrap">
      <div className="donut" style={{ '--value': `${value * 3.6}deg` }}>
        <span>{value}%</span>
      </div>
      <strong>{label}</strong>
    </div>
  );
}

export function ProgressBar({ value, label, meta }) {
  return (
    <div className="progress-row">
      <div>
        <strong>{label}</strong>
        <small>{meta}</small>
      </div>
      <div className="progress progress-track" role="progressbar" aria-label={`${label} ${value}%`} aria-valuenow={value} aria-valuemin="0" aria-valuemax="100">
        <span className="progress-bar" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function AccessNote({ title = 'Accès limité', children }) {
  return (
    <div className="access-note">
      <i className="bi bi-lock" aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}
