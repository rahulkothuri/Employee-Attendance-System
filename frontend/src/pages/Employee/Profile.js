import React from 'react';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { FiUser, FiMail, FiHash, FiBriefcase, FiCalendar, FiShield } from 'react-icons/fi';
import './Employee.css';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>View and manage your profile information</p>
      </div>

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-avatar-large">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2>{user?.name}</h2>
          <span className={`badge ${user?.role === 'manager' ? 'badge-manager' : 'badge-employee'}`}>
            {user?.role}
          </span>
        </div>

        <div className="profile-details-card">
          <h3>Profile Information</h3>
          <div className="profile-info-grid">
            <div className="profile-info-item">
              <div className="info-icon">
                <FiUser />
              </div>
              <div className="info-content">
                <label>Full Name</label>
                <p>{user?.name}</p>
              </div>
            </div>

            <div className="profile-info-item">
              <div className="info-icon">
                <FiMail />
              </div>
              <div className="info-content">
                <label>Email Address</label>
                <p>{user?.email}</p>
              </div>
            </div>

            <div className="profile-info-item">
              <div className="info-icon">
                <FiHash />
              </div>
              <div className="info-content">
                <label>Employee ID</label>
                <p>{user?.employeeId}</p>
              </div>
            </div>

            <div className="profile-info-item">
              <div className="info-icon">
                <FiBriefcase />
              </div>
              <div className="info-content">
                <label>Department</label>
                <p>{user?.department}</p>
              </div>
            </div>

            <div className="profile-info-item">
              <div className="info-icon">
                <FiShield />
              </div>
              <div className="info-content">
                <label>Role</label>
                <p className="capitalize">{user?.role}</p>
              </div>
            </div>

            <div className="profile-info-item">
              <div className="info-icon">
                <FiCalendar />
              </div>
              <div className="info-content">
                <label>Member Since</label>
                <p>{user?.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
