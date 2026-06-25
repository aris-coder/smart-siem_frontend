import Header from './Header';
import Sidebar from './Sidebar';

function AppShell({ activePage, currentUser, navItems, onNavigate, onLogout, children }) {
  return (
    <div className="app-shell d-flex">
      <Sidebar activePage={activePage} currentUser={currentUser} navItems={navItems} onNavigate={onNavigate} onLogout={onLogout} />
      <main className="main-panel flex-grow-1">
        <Header activePage={activePage} currentUser={currentUser} navItems={navItems} />
        {children}
      </main>
    </div>
  );
}

export default AppShell;
