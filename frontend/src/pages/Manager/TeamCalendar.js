import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTodayTeamStatus, getAllAttendance } from '../../store/slices/attendanceSlice';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, isSameDay } from 'date-fns';
import { FiCalendar, FiUsers, FiUserCheck, FiUserX } from 'react-icons/fi';
import './Manager.css';

const TeamCalendar = () => {
  const dispatch = useDispatch();
  const { todayTeamStatus, allAttendance, loading } = useSelector((state) => state.attendance);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    dispatch(getTodayTeamStatus());
    dispatch(getAllAttendance({
      startDate: format(new Date(selectedYear, selectedMonth - 1, 1), 'yyyy-MM-dd'),
      endDate: format(new Date(selectedYear, selectedMonth, 0), 'yyyy-MM-dd'),
    }));
  }, [dispatch, selectedMonth, selectedYear]);

  const getAttendanceForDate = (date) => {
    return allAttendance.filter((record) => isSameDay(new Date(record.date), date));
  };

  const getTileContent = ({ date, view }) => {
    if (view === 'month') {
      const records = getAttendanceForDate(date);
      if (records.length > 0) {
        const present = records.filter(r => r.status === 'present' || r.status === 'late').length;
        return (
          <div className="tile-content">
            <span className="tile-count">{present}</span>
          </div>
        );
      }
    }
    return null;
  };

  const handleMonthChange = ({ activeStartDate }) => {
    setSelectedMonth(activeStartDate.getMonth() + 1);
    setSelectedYear(activeStartDate.getFullYear());
  };

  const selectedDateRecords = getAttendanceForDate(selectedDate);

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

  return (
    <div className="team-calendar">
      <div className="page-header">
        <div>
          <h1><FiCalendar /> Team Calendar</h1>
          <p>View team attendance in calendar view</p>
        </div>
      </div>

      {/* Today's Quick Stats */}
      <div className="quick-stats">
        <div className="quick-stat">
          <FiUsers className="stat-icon" />
          <div>
            <span className="stat-value">{todayTeamStatus?.totalEmployees || 0}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
        <div className="quick-stat success">
          <FiUserCheck className="stat-icon" />
          <div>
            <span className="stat-value">{todayTeamStatus?.present || 0}</span>
            <span className="stat-label">Present</span>
          </div>
        </div>
        <div className="quick-stat danger">
          <FiUserX className="stat-icon" />
          <div>
            <span className="stat-value">{todayTeamStatus?.absent || 0}</span>
            <span className="stat-label">Absent</span>
          </div>
        </div>
        <div className="quick-stat warning">
          <FiCalendar className="stat-icon" />
          <div>
            <span className="stat-value">{todayTeamStatus?.lateArrivals || 0}</span>
            <span className="stat-label">Late</span>
          </div>
        </div>
      </div>

      <div className="calendar-layout">
        <div className="calendar-wrapper">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={getTileContent}
            onActiveStartDateChange={handleMonthChange}
          />
        </div>

        <div className="date-details-panel card">
          <div className="panel-header">
            <h3><FiCalendar /> {format(selectedDate, 'MMMM d, yyyy')}</h3>
            <span className="record-count">{selectedDateRecords.length} records</span>
          </div>

          <div className="panel-content">
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
              </div>
            ) : selectedDateRecords.length > 0 ? (
              <div className="attendance-list">
                {selectedDateRecords.map((record) => (
                  <div key={record._id} className="attendance-item">
                    <div className="emp-avatar">
                      {record.userId?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="emp-info">
                      <span className="emp-name">{record.userId?.name || 'N/A'}</span>
                      <span className="emp-times">
                        {formatTime(record.checkInTime)} - {formatTime(record.checkOutTime)}
                      </span>
                    </div>
                    {getStatusBadge(record.status)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-records">
                <FiCalendar className="no-records-icon" />
                <p>No attendance records for this date</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCalendar;
