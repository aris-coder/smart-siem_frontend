function Sidebar({ activePage, currentUser, navItems, onNavigate, onLogout }) {
  return (
    <aside className="sidebar" aria-label="Navigation principale">
      <div className="brand d-flex align-items-center gap-2 mb-4">
        <span className="brand-logo" aria-hidden="true"><i className="bi bi-shield-lock-fill" /></span>
        <div>
          <strong className="d-block">SIEM Intelligent</strong>
          <small className="text-muted">Opérations sécurité</small>
        </div>
      </div>

      <nav className="nav nav-pills flex-column gap-2 mb-auto">
        {navItems.map((item) => (
          <button
            className={`nav-link text-start d-flex align-items-center gap-2 ${activePage === item.id ? 'active' : ''}`}
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            aria-current={activePage === item.id ? 'page' : undefined}
          >
            <i className={`bi ${item.icon} nav-icon`} aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer border-top pt-3 mt-3">
        <div className="role-card">
          <span className="avatar">{currentUser.initials}</span>
          <div>
            <strong>{currentUser.role}</strong>
            <small>{currentUser.name}</small>
          </div>
        </div>
        <button className="btn btn-light btn-sm d-flex align-items-center gap-2 w-100" type="button">
          <i className="bi bi-question-circle" aria-hidden="true" />
          Assistance
        </button>
        <button className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2 w-100" type="button" onClick={onLogout}>
          <i className="bi bi-box-arrow-right" aria-hidden="true" />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
