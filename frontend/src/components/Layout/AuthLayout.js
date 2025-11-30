import React from 'react';
import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

const AuthLayout = () => {
  return (
    <div className="auth-layout">
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
