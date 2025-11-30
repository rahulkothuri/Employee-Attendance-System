import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getEmployeeDashboard } from '../../store/slices/dashboardSlice';
import { checkIn, checkOut } from '../../store/slices/attendanceSlice';
import { toast } from 'react-toastify';
import { FiClock, FiCalendar, FiTrendingUp, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { format } from 'date-fns';
import './Employee.css';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { employeeData, loading } = useSelector((state) => state.dashboard);
  const { loading: attendanceLoading } = useSelector((state) => state.attendance);

  useEffect(() => {
    dispatch(getEmployeeDashboard());
  }, [dispatch]);

  const handleCheckIn = async () => {
    const result = await dispatch(checkIn());
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Checked in successfully!');
      dispatch(getEmployeeDashboard());
    } else {
      toast.error(result.payload || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    const result = await dispatch(checkOut());
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Checked out successfully!');
      dispatch(getEmployeeDashboard());
    } else {
      toast.error(result.payload || 'Check-out failed');
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'hh:mm a');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      present: { class: 'badge-present', label: 'Present' },
      absent: { class: 'badge-absent', label: 'Absent' },
      late: { class: 'badge-late', label: 'Late' },
      'half-day': { class: 'badge-half-day', label: 'Half Day' },
      'not-checked-in': { class: 'badge-absent', label: 'Not Checked In' },
    };
    const { class: className, label } = statusMap[status] || statusMap['not-checked-in'];
    return <span className={`badge ${className}`}>{label}</span>;
  };

  if (loading && !employeeData) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  const { today, monthly, recentAttendance } = employeeData || {};

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Welcome, {user?.name}! 👋</h1>
          <p>Here's your attendance overview for today</p>
        </div>
        <div className="header-badge">
          <span className="badge badge-employee">{user?.employeeId}</span>
        </div>
      </div>

      {/* Today's Status Card */}
      <div className="today-card">
        <div className="today-info">
          <h3>Today's Status</h3>
          <p className="today-date">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          <div className="today-status">
            {getStatusBadge(today?.status)}
          </div>
          <div className="today-times">
            <div className="time-item">
              <FiClock />
              <span>Check In: {formatTime(today?.checkInTime)}</span>
            </div>
            <div className="time-item">
              <FiClock />
              <span>Check Out: {formatTime(today?.checkOutTime)}</span>
            </div>
            {today?.totalHours > 0 && (
              <div className="time-item">
                <FiTrendingUp />
                <span>Hours: {today.totalHours.toFixed(2)}h</span>
              </div>
            )}
          </div>
        </div>
        <div className="today-action">
          {!today?.isCheckedIn ? (
            <button
              className="btn btn-success btn-lg"
              onClick={handleCheckIn}
              disabled={attendanceLoading}
            >
              <FiCheckCircle />
              {attendanceLoading ? 'Checking In...' : 'Check In'}
            </button>
          ) : !today?.isCheckedOut ? (
            <button
              className="btn btn-danger btn-lg"
              onClick={handleCheckOut}
              disabled={attendanceLoading}
            >
              <FiXCircle />
              {attendanceLoading ? 'Checking Out...' : 'Check Out'}
            </button>
          ) : (
            <div className="completed-status">
              <FiCheckCircle className="completed-icon" />
              <span>Today's attendance completed!</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card present">
          <div className="stat-icon">
            <FiCheckCircle />
          </div>
          <div className="stat-content">
            <h4>Present</h4>
            <p className="stat-number">{monthly?.present || 0}</p>
            <span>days this month</span>
          </div>
        </div>
        <div className="stat-card absent">
          <div className="stat-icon">
            <FiXCircle />
          </div>
          <div className="stat-content">
            <h4>Absent</h4>
            <p className="stat-number">{monthly?.absent || 0}</p>
            <span>days this month</span>
          </div>
        </div>
        <div className="stat-card late">
          <div className="stat-icon">
            <FiClock />
          </div>
          <div className="stat-content">
            <h4>Late</h4>
            <p className="stat-number">{monthly?.late || 0}</p>
            <span>days this month</span>
          </div>
        </div>
        <div className="stat-card hours">
          <div className="stat-icon">
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <h4>Total Hours</h4>
            <p className="stat-number">{monthly?.totalHours?.toFixed(1) || 0}</p>
            <span>hours this month</span>
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="card">
        <div className="card-header">
          <h3>Recent Attendance (Last 7 Days)</h3>
          <Link to="/employee/history" className="view-all">
            View All <FiCalendar />
          </Link>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAttendance && recentAttendance.length > 0 ? (
                recentAttendance.map((record) => (
                  <tr key={record.date}>
                    <td>{format(new Date(record.date), 'MMM d, yyyy')}</td>
                    <td>{formatTime(record.checkInTime)}</td>
                    <td>{formatTime(record.checkOutTime)}</td>
                    <td>{record.totalHours?.toFixed(2) || '0.00'}h</td>
                    <td>{getStatusBadge(record.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
