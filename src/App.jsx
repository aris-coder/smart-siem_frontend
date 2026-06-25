import { useMemo, useState } from 'react';
import './App.css';
import AppShell from './components/AppShell';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LogsPage from './pages/LogsPage';
import SecurityAlertsPage from './pages/SecurityAlertsPage';
import ReportsAnalyticsPage from './pages/ReportsAnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import { getDefaultPageForRole, getVisibleNavItems, roles, users } from './data/siemData';

const pages = {
  dashboard: DashboardPage,
  logs: LogsPage,
  alerts: SecurityAlertsPage,
  reports: ReportsAnalyticsPage,
  settings: SettingsPage,
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('siem-auth') === 'true');
  const [currentUser, setCurrentUser] = useState(() => {
    const storedRole = sessionStorage.getItem('siem-role') || 'analyst';
    const role = roles[storedRole] || roles.analyst;

    return {
      name: role.label,
      username: `${role.id}@siem.local`,
      roleId: role.id,
      role: role.label,
      initials: role.initials,
    };
  });
  const [activePage, setActivePage] = useState('dashboard');
  const visibleNavItems = useMemo(() => getVisibleNavItems(currentUser.roleId), [currentUser.roleId]);
  const allowedPages = useMemo(() => new Set(visibleNavItems.map((item) => item.id)), [visibleNavItems]);

  function handleLogin(credentials) {
    const knownUser = users.find((user) => user.username === credentials.email);
    const roleId = knownUser?.roleId || credentials.roleId || 'analyst';
    const role = roles[roleId] || roles.analyst;
    const nextUser = knownUser || {
      name: role.label,
      username: credentials.email,
      roleId,
      role: role.label,
      initials: role.initials,
    };

    sessionStorage.setItem('siem-auth', 'true');
    sessionStorage.setItem('siem-role', roleId);
    setCurrentUser(nextUser);
    setActivePage(getDefaultPageForRole(roleId));
    setIsAuthenticated(true);
  }

  function handleLogout() {
    sessionStorage.removeItem('siem-auth');
    sessionStorage.removeItem('siem-role');
    setActivePage('dashboard');
    setIsAuthenticated(false);
  }

  function handleNavigate(pageId) {
    if (!allowedPages.has(pageId)) {
      setActivePage(getDefaultPageForRole(currentUser.roleId));
      return;
    }

    setActivePage(pageId);
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const safeActivePage = allowedPages.has(activePage) ? activePage : getDefaultPageForRole(currentUser.roleId);
  const ActivePage = pages[safeActivePage] || DashboardPage;

  return (
    <AppShell
      activePage={safeActivePage}
      currentUser={currentUser}
      navItems={visibleNavItems}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      <ActivePage currentUser={currentUser} onNavigate={handleNavigate} />
    </AppShell>
  );
}

export default App;
