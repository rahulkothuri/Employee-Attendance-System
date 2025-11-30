import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyHistory, getMySummary } from '../../store/slices/attendanceSlice';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, isSameDay } from 'date-fns';
import { FiCalendar, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import './Employee.css';

const MyAttendance = () => {
  const dispatch = useDispatch();
  const { history, summary, loading } = useSelector((state) => state.attendance);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'table'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    dispatch(getMyHistory({ month: selectedMonth, year: selectedYear }));
    dispatch(getMySummary({ month: selectedMonth, year: selectedYear }));
  }, [dispatch, selectedMonth, selectedYear]);

  const getAttendanceForDate = (date) => {
    return history.find((record) => isSameDay(new Date(record.date), date));
  };

  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
      const attendance = getAttendanceForDate(date);
      if (attendance) {
        return `status-${attendance.status}`;
      }
    }
    return '';
  };

  const getSelectedDateAttendance = () => {
    return getAttendanceForDate(selectedDate);
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
    };
    const { class: className, label } = statusMap[status] || { class: '', label: status };
    return <span className={`badge ${className}`}>{label}</span>;
  };

  const handleMonthChange = ({ activeStartDate }) => {
    setSelectedMonth(activeStartDate.getMonth() + 1);
    setSelectedYear(activeStartDate.getFullYear());
  };

  const selectedDateData = getSelectedDateAttendance();

  return (
    <div className="my-attendance">
      <div className="page-header">
        <div>
          <h1>My Attendance History</h1>
          <p>View your attendance records and statistics</p>
        </div>
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            <FiCalendar /> Calendar
          </button>
          <button
            className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            <FiClock /> Table
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card present">
          <FiCheckCircle className="summary-icon" />
          <div>
            <span className="summary-number">{summary?.summary?.present || 0}</span>
            <span className="summary-label">Present</span>
          </div>
        </div>
        <div className="summary-card absent">
          <FiXCircle className="summary-icon" />
          <div>
            <span className="summary-number">{summary?.summary?.absent || 0}</span>
            <span className="summary-label">Absent</span>
          </div>
        </div>
        <div className="summary-card late">
          <FiClock className="summary-icon" />
          <div>
            <span className="summary-number">{summary?.summary?.late || 0}</span>
            <span className="summary-label">Late</span>
          </div>
        </div>
        <div className="summary-card hours">
          <FiClock className="summary-icon" />
          <div>
            <span className="summary-number">{summary?.summary?.totalHours?.toFixed(1) || 0}h</span>
            <span className="summary-label">Total Hours</span>
          </div>
        </div>
      </div>

      <div className="attendance-content">
        {viewMode === 'calendar' ? (
          <div className="calendar-view">
            <div className="calendar-container">
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileClassName={getTileClassName}
                onActiveStartDateChange={handleMonthChange}
              />
              <div className="calendar-legend">
                <div className="legend-item">
                  <span className="legend-dot present"></span> Present
                </div>
                <div className="legend-item">
                  <span className="legend-dot absent"></span> Absent
                </div>
                <div className="legend-item">
                  <span className="legend-dot late"></span> Late
                </div>
                <div className="legend-item">
                  <span className="legend-dot half-day"></span> Half Day
                </div>
              </div>
            </div>

            <div className="date-details-card">
              <h3>
                <FiCalendar /> {format(selectedDate, 'MMMM d, yyyy')}
              </h3>
              {selectedDateData ? (
                <div className="date-details">
                  <div className="detail-row">
                    <span>Status:</span>
                    {getStatusBadge(selectedDateData.status)}
                  </div>
                  <div className="detail-row">
                    <span>Check In:</span>
                    <strong>{formatTime(selectedDateData.checkInTime)}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Check Out:</span>
                    <strong>{formatTime(selectedDateData.checkOutTime)}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Total Hours:</span>
                    <strong>{selectedDateData.totalHours?.toFixed(2) || 0} hours</strong>
                  </div>
                </div>
              ) : (
                <div className="no-data">
                  <p>No attendance record for this date</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center">
                        <div className="spinner"></div>
                      </td>
                    </tr>
                  ) : history && history.length > 0 ? (
                    history.map((record) => (
                      <tr key={record._id || record.date}>
                        <td>{format(new Date(record.date), 'MMM d, yyyy')}</td>
                        <td>{format(new Date(record.date), 'EEEE')}</td>
                        <td>{formatTime(record.checkInTime)}</td>
                        <td>{formatTime(record.checkOutTime)}</td>
                        <td>{record.totalHours?.toFixed(2) || '0.00'}h</td>
                        <td>{getStatusBadge(record.status)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">
                        No attendance records found for this month
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAttendance;
