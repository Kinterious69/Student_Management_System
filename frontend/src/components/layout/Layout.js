import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', icon: 'bi-speedometer2', label: 'Dashboard', adminOnly: false },
    { to: '/students', icon: 'bi-people', label: 'Students', adminOnly: true },
    { to: '/courses', icon: 'bi-book', label: 'Courses', adminOnly: false },
    { to: '/enrollments', icon: 'bi-journal-check', label: 'Enrollments', adminOnly: true },
  ];

  return (
    <div className={`d-flex flex-column bg-dark text-white ${collapsed ? '' : ''}`}
      style={{ width: collapsed ? 70 : 240, minHeight: '100vh', transition: 'width 0.2s' }}>
      {/* Logo */}
      <div className="d-flex align-items-center px-3 py-3 border-bottom border-secondary">
        <div className="bg-primary rounded d-flex align-items-center justify-content-center"
          style={{ width: 36, height: 36, minWidth: 36 }}>
          <i className="bi bi-mortarboard-fill text-white"></i>
        </div>
        {!collapsed && (
          <div className="ms-2 overflow-hidden">
            <div className="fw-bold text-white text-truncate" style={{ fontSize: 15 }}>UniSMS</div>
            <div className="text-secondary" style={{ fontSize: 11 }}>Student Management</div>
          </div>
        )}
        <button className="btn btn-sm btn-outline-secondary ms-auto border-0"
          onClick={() => setCollapsed(!collapsed)}>
          <i className={`bi bi-${collapsed ? 'chevron-right' : 'chevron-left'}`}></i>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-grow-1 py-2">
        {navLinks.filter(l => !l.adminOnly || isAdmin).map(link => (
          <NavLink key={link.to} to={link.to}
            className={({ isActive }) =>
              `d-flex align-items-center px-3 py-2 text-decoration-none rounded mx-2 mb-1 ${isActive
                ? 'bg-primary text-white'
                : 'text-secondary hover-white'}`
            }
            style={{ fontSize: 14 }}
          >
            <i className={`bi ${link.icon} fs-5`} style={{ minWidth: 24 }}></i>
            {!collapsed && <span className="ms-2">{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="border-top border-secondary p-3">
        {!collapsed && (
          <div className="mb-2">
            <div className="d-flex align-items-center">
              <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 32, height: 32, minWidth: 32 }}>
                <i className="bi bi-person-fill text-white" style={{ fontSize: 14 }}></i>
              </div>
              <div className="ms-2 overflow-hidden">
                <div className="text-white fw-medium text-truncate" style={{ fontSize: 13 }}>{user?.name}</div>
                <span className={`badge ${user?.role === 'admin' ? 'bg-warning text-dark' : 'bg-info text-dark'}`}
                  style={{ fontSize: 10 }}>{user?.role}</span>
              </div>
            </div>
          </div>
        )}
        <button className="btn btn-sm btn-outline-danger w-100" onClick={handleLogout}
          title="Logout">
          <i className="bi bi-box-arrow-right"></i>
          {!collapsed && <span className="ms-1">Logout</span>}
        </button>
      </div>
    </div>
  );
};

const Layout = ({ children }) => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar />
      <main className="flex-grow-1 bg-light overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
