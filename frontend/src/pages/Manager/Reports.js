import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAttendance, getEmployees, exportAttendance } from '../../store/slices/attendanceSlice';
import { format, subDays } from 'date-fns';
import { FiFileText, FiDownload, FiFilter, FiPieChart } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './Manager.css';

const Reports = () => {
  const dispatch = useDispatch();
  const { allAttendance, employees, loading } = useSelector((state) => state.attendance);
  const [reportFilters, setReportFilters] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    employeeId: '',
  });
  const [reportData, setReportData] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    dispatch(getEmployees());
  }, [dispatch]);

  const handleFilterChange = (e) => {
    setReportFilters({
      ...reportFilters,
      [e.target.name]: e.target.value,
    });
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      await dispatch(getAllAttendance(reportFilters));
      
      // Calculate report statistics
      const stats = {
        totalRecords: allAttendance.length,
        present: allAttendance.filter(a => a.status === 'present').length,
        late: allAttendance.filter(a => a.status === 'late').length,
        halfDay: allAttendance.filter(a => a.status === 'half-day').length,
        absent: allAttendance.filter(a => a.status === 'absent').length,
        totalHours: allAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
      };
      
      setReportData(stats);
      toast.success('Report generated successfully!');
    } catch (error) {
      toast.error('Failed to generate report');
    }
    setGenerating(false);
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (reportFilters.startDate) params.append('startDate', reportFilters.startDate);
      if (reportFilters.endDate) params.append('endDate', reportFilters.endDate);
      if (reportFilters.employeeId) params.append('employeeId', reportFilters.employeeId);

      const response = await api.get(`/attendance/export?${params}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-report-${reportFilters.startDate}-to-${reportFilters.endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully!');
    } catch (error) {
      toast.error('Failed to export report');
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
    };
    const { class: className, label } = statusMap[status] || { class: '', label: status };
    return <span className={`badge ${className}`}>{label}</span>;
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1><FiFileText /> Attendance Reports</h1>
          <p>Generate and export attendance reports</p>
        </div>
      </div>

      {/* Report Filters */}
      <div className="card report-filters">
        <h3><FiFilter /> Report Parameters</h3>
        <div className="filters-grid">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={reportFilters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              value={reportFilters.endDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="form-group">
            <label>Employee</label>
            <select
              name="employeeId"
              value={reportFilters.employeeId}
              onChange={handleFilterChange}
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp.employeeId}>
                  {emp.name} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="filter-actions">
          <button 
            className="btn btn-primary" 
            onClick={generateReport}
            disabled={generating}
          >
            <FiPieChart /> {generating ? 'Generating...' : 'Generate Report'}
          </button>
          <button className="btn btn-success" onClick={handleExport}>
            <FiDownload /> Export to CSV
          </button>
        </div>
      </div>

      {/* Report Summary */}
      {reportData && (
        <div className="report-summary">
          <h3>Report Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-value">{reportData.totalRecords}</span>
              <span className="summary-label">Total Records</span>
            </div>
            <div className="summary-item present">
              <span className="summary-value">{reportData.present}</span>
              <span className="summary-label">Present</span>
            </div>
            <div className="summary-item late">
              <span className="summary-value">{reportData.late}</span>
              <span className="summary-label">Late</span>
            </div>
            <div className="summary-item half">
              <span className="summary-value">{reportData.halfDay}</span>
              <span className="summary-label">Half Day</span>
            </div>
            <div className="summary-item hours">
              <span className="summary-value">{reportData.totalHours.toFixed(1)}h</span>
              <span className="summary-label">Total Hours</span>
            </div>
          </div>
        </div>
      )}

      {/* Report Data Table */}
      <div className="card">
        <div className="card-header">
          <h3>Attendance Data</h3>
          <span className="record-count">{allAttendance.length} records</span>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    <div className="spinner"></div>
                  </td>
                </tr>
              ) : allAttendance && allAttendance.length > 0 ? (
                allAttendance.map((record) => (
                  <tr key={record._id}>
                    <td className="emp-id">{record.userId?.employeeId || 'N/A'}</td>
                    <td>
                      <div className="emp-name">
                        <div className="emp-avatar small">
                          {record.userId?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        {record.userId?.name || 'N/A'}
                      </div>
                    </td>
                    <td>{record.userId?.department || 'N/A'}</td>
                    <td>{format(new Date(record.date), 'MMM d, yyyy')}</td>
                    <td>{formatTime(record.checkInTime)}</td>
                    <td>{formatTime(record.checkOutTime)}</td>
                    <td>{record.totalHours?.toFixed(2) || '0.00'}h</td>
                    <td>{getStatusBadge(record.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    No records found. Generate a report to see data.
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

export default Reports;
