import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { 
  FiHome, 
  FiClock, 
  FiCalendar, 
  FiUser, 
  FiLogOut, 
  FiUsers, 
  FiFileText,
  FiMenu,
  FiX
} from 'react-icons/fi';
import './Layout.css';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const employeeLinks = [
    { to: '/employee/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/employee/attendance', icon: <FiClock />, label: 'Mark Attendance' },
    { to: '/employee/history', icon: <FiCalendar />, label: 'My Attendance' },
    { to: '/employee/profile', icon: <FiUser />, label: 'Profile' },
  ];

  const managerLinks = [
    { to: '/manager/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/manager/attendance', icon: <FiUsers />, label: 'All Attendance' },
    { to: '/manager/calendar', icon: <FiCalendar />, label: 'Team Calendar' },
    { to: '/manager/reports', icon: <FiFileText />, label: 'Reports' },
    { to: '/manager/profile', icon: <FiUser />, label: 'Profile' },
  ];

  const links = user?.role === 'manager' ? managerLinks : employeeLinks;

  return (
    <div className="layout">
      {/* Mobile menu button */}
      <button 
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1>📊 EAS</h1>
          <span>Employee Attendance</span>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
