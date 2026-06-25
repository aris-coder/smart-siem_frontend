function Header({ activePage, currentUser, navItems }) {
  const currentPage = navItems.find((item) => item.id === activePage) || navItems[0];
  const searchPlaceholder = currentUser.roleId === 'reader'
    ? 'Rechercher journaux des dernières 24 h...'
    : 'Rechercher journaux, utilisateurs, IP...';

  return (
    <header className="app-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center px-4 py-3 mb-4 bg-white border-bottom shadow-sm">
      <div className="mb-3 mb-md-0">
        <p className="text-uppercase text-muted small mb-1">{currentPage.eyebrow}</p>
        <h1 className="h4 mb-1">{currentPage.label}</h1>
        <code className="text-muted">{currentPage.endpoint}</code>
      </div>

      <div className="header-actions d-flex flex-column flex-sm-row gap-2 align-items-stretch align-items-sm-center w-100 w-md-auto">
        <div className="input-group input-group-sm flex-grow-1">
          <span className="input-group-text bg-white border-end-0"><i className="bi bi-search" aria-hidden="true" /></span>
          <input className="form-control border-start-0" aria-label="Recherche globale" placeholder={searchPlaceholder} />
        </div>
        <button className="btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center" type="button" aria-label="Notifications">
          <span className="position-relative me-2">
            <i className="bi bi-bell" aria-hidden="true" />
            <span className="notification-dot" />
          </span>
          Notifications
        </button>
        <button className="btn btn-outline-primary btn-sm rounded-pill d-flex align-items-center gap-2" type="button">
          <span className="avatar bg-primary text-white">{currentUser.initials}</span>
          <span>{currentUser.role}</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
