import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';
import './AuthLayout.css';

const AuthLayout = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="auth-layout">
      <button className="auth-theme-toggle" onClick={toggleTheme} title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
        {isDarkMode ? <FiSun /> : <FiMoon />}
      </button>
      <div className="auth-sidebar">
        <div className="auth-sidebar-content">
          <h1>📊 Employee Attendance System</h1>
          <p>Track and manage employee attendance efficiently</p>
          <div className="features">
            <div className="feature">
              <span className="feature-icon">✓</span>
              <span>Easy check-in/check-out</span>
            </div>
            <div className="feature">
              <span className="feature-icon">✓</span>
              <span>Real-time attendance tracking</span>
            </div>
            <div className="feature">
              <span className="feature-icon">✓</span>
              <span>Comprehensive reports</span>
            </div>
            <div className="feature">
              <span className="feature-icon">✓</span>
              <span>Team management</span>
            </div>
          </div>
        </div>
      </div>
      <div className="auth-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
