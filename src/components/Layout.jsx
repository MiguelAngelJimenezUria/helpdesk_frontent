import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function getInitials(user) {
  if (!user) return '?';
  const first = user.first_name?.[0] || '';
  const last = user.last_name?.[0] || '';
  return (first + last).toUpperCase() || user.username?.[0]?.toUpperCase() || '?';
}

function getDisplayName(user) {
  if (user.first_name || user.last_name) {
    return `${user.first_name} ${user.last_name}`.trim();
  }
  return user.username;
}

const NAV_ITEMS_COMMON = [
  { to: '/dashboard', icon: 'bi-grid-1x2', label: 'Inicio' },
  { to: '/tickets', icon: 'bi-ticket-detailed', label: 'Tickets' },
];

const NAV_ITEMS_AGENT = [
  { to: '/tickets/new', icon: 'bi-plus-circle', label: 'Nuevo Ticket' },
];

const NAV_ITEMS_CLIENT = [
  { to: '/tickets/new', icon: 'bi-plus-circle', label: 'Abrir Ticket' },
];

const NAV_ITEMS_ADMIN = [
  { to: '/admin/users', icon: 'bi-people', label: 'Usuarios' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  const isAgent = user?.role === 'agent';
  const isClient = user?.role === 'client';

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-wrapper">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <i className="bi bi-headset" style={{ fontSize: 16, color: 'white' }} />
          </div>
          <div>
            <div className="sidebar-brand-name">HelpDesk</div>
            <div className="sidebar-brand-sub">Portal de Soporte</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Principal</div>

          {NAV_ITEMS_COMMON.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-nav-item${isActive ? ' active' : ''}`
              }
              onClick={closeSidebar}
            >
              <i className={`bi ${item.icon} nav-icon`} />
              {item.label}
            </NavLink>
          ))}

          {isClient &&
            NAV_ITEMS_CLIENT.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-nav-item${isActive ? ' active' : ''}`
                }
                onClick={closeSidebar}
              >
                <i className={`bi ${item.icon} nav-icon`} />
                {item.label}
              </NavLink>
            ))}

          {(isAgent || isAdmin) &&
            NAV_ITEMS_AGENT.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-nav-item${isActive ? ' active' : ''}`
                }
                onClick={closeSidebar}
              >
                <i className={`bi ${item.icon} nav-icon`} />
                {item.label}
              </NavLink>
            ))}

          {isAdmin && (
            <>
              <div className="sidebar-section-label" style={{ marginTop: 8 }}>
                Administración
              </div>
              {NAV_ITEMS_ADMIN.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `sidebar-nav-item${isActive ? ' active' : ''}`
                  }
                  onClick={closeSidebar}
                >
                  <i className={`bi ${item.icon} nav-icon`} />
                  {item.label}
                </NavLink>
              ))}
            </>
          )}

          <div className="sidebar-section-label" style={{ marginTop: 8 }}>
            Cuenta
          </div>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `sidebar-nav-item${isActive ? ' active' : ''}`
            }
            onClick={closeSidebar}
          >
            <i className="bi bi-person nav-icon" />
            Mi Perfil
          </NavLink>
        </nav>

        {/* User footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{getInitials(user)}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{getDisplayName(user)}</div>
              <div className="sidebar-user-role">
                {user?.role === 'admin' ? 'Administrador' :
                 user?.role === 'agent' ? 'Agente' : 'Cliente'}
              </div>
            </div>
            <button
              className="sidebar-logout-btn"
              onClick={handleLogout}
              title="Cerrar sesión"
            >
              <i className="bi bi-box-arrow-right" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Top header */}
        <header className="top-header">
          <button
            className="btn btn-sm d-md-none me-2"
            style={{ padding: '4px 8px', border: '1px solid #e2e8f0' }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className="bi bi-list" />
          </button>
          <div style={{ flex: 1 }} />
          <div className="header-user">
            <div className="header-avatar">{getInitials(user)}</div>
            <span className="d-none d-sm-inline">{getDisplayName(user)}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
