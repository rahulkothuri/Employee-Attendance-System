import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTodayStatus, checkIn, checkOut } from '../../store/slices/attendanceSlice';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { FiClock, FiCheckCircle, FiXCircle, FiSun, FiMoon } from 'react-icons/fi';
import './Employee.css';

const MarkAttendance = () => {
  const dispatch = useDispatch();
  const { todayStatus, loading } = useSelector((state) => state.attendance);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getTodayStatus());
  }, [dispatch]);

  const handleCheckIn = async () => {
    const result = await dispatch(checkIn());
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Checked in successfully! Have a great day!');
    } else {
      toast.error(result.payload || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    const result = await dispatch(checkOut());
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Checked out successfully! See you tomorrow!');
    } else {
      toast.error(result.payload || 'Check-out failed');
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    return format(new Date(dateString), 'hh:mm:ss a');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', icon: <FiSun /> };
    if (hour < 18) return { text: 'Good Afternoon', icon: <FiSun /> };
    return { text: 'Good Evening', icon: <FiMoon /> };
  };

  const greeting = getGreeting();

  return (
    <div className="mark-attendance">
      <div className="page-header">
        <div>
          <h1>{greeting.icon} {greeting.text}, {user?.name?.split(' ')[0]}!</h1>
          <p>Mark your attendance for today</p>
        </div>
      </div>

      <div className="attendance-container">
        <div className="attendance-clock-card">
          <div className="current-time">
            <FiClock className="clock-icon" />
            <div className="time-display">
              {format(new Date(), 'hh:mm:ss a')}
            </div>
            <div className="date-display">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </div>
          </div>
        </div>

        <div className="attendance-actions-card">
          <div className="attendance-status">
            <h3>Today's Attendance</h3>
            
            <div className="status-items">
              <div className={`status-item ${todayStatus?.isCheckedIn ? 'completed' : ''}`}>
                <div className="status-icon">
                  {todayStatus?.isCheckedIn ? (
                    <FiCheckCircle className="check-icon" />
                  ) : (
                    <div className="pending-icon">1</div>
                  )}
                </div>
                <div className="status-info">
                  <h4>Check In</h4>
                  <p>{todayStatus?.isCheckedIn ? formatTime(todayStatus?.attendance?.checkInTime) : 'Not yet'}</p>
                </div>
              </div>

              <div className="status-connector">
                <div className={`connector-line ${todayStatus?.isCheckedIn ? 'active' : ''}`}></div>
              </div>

              <div className={`status-item ${todayStatus?.isCheckedOut ? 'completed' : ''}`}>
                <div className="status-icon">
                  {todayStatus?.isCheckedOut ? (
                    <FiCheckCircle className="check-icon" />
                  ) : (
                    <div className="pending-icon">2</div>
                  )}
                </div>
                <div className="status-info">
                  <h4>Check Out</h4>
                  <p>{todayStatus?.isCheckedOut ? formatTime(todayStatus?.attendance?.checkOutTime) : 'Not yet'}</p>
                </div>
              </div>
            </div>

            {todayStatus?.attendance?.totalHours > 0 && (
              <div className="total-hours">
                <span>Total Hours Today:</span>
                <strong>{todayStatus.attendance.totalHours.toFixed(2)} hours</strong>
              </div>
            )}
          </div>

          <div className="action-buttons">
            {!todayStatus?.isCheckedIn ? (
              <button
                className="btn btn-check-in"
                onClick={handleCheckIn}
                disabled={loading}
              >
                <FiCheckCircle />
                {loading ? 'Processing...' : 'Check In Now'}
              </button>
            ) : !todayStatus?.isCheckedOut ? (
              <button
                className="btn btn-check-out"
                onClick={handleCheckOut}
                disabled={loading}
              >
                <FiXCircle />
                {loading ? 'Processing...' : 'Check Out Now'}
              </button>
            ) : (
              <div className="day-complete">
                <FiCheckCircle className="complete-icon" />
                <h4>Today's Attendance Complete!</h4>
                <p>You've worked {todayStatus?.attendance?.totalHours?.toFixed(2)} hours today</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="attendance-tips">
        <h3>📝 Attendance Guidelines</h3>
        <ul>
          <li>Regular work hours: 9:00 AM - 6:00 PM</li>
          <li>Check-in after 9:00 AM will be marked as <strong>Late</strong></li>
          <li>Check-in after 12:00 PM will be marked as <strong>Half Day</strong></li>
          <li>Remember to check out at the end of your work day</li>
        </ul>
      </div>
    </div>
  );
};

export default MarkAttendance;
