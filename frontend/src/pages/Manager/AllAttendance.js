import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAttendance, getEmployees } from '../../store/slices/attendanceSlice';
import { format } from 'date-fns';
import { FiSearch, FiFilter, FiDownload, FiUsers } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './Manager.css';

const AllAttendance = () => {
  const dispatch = useDispatch();
  const { allAttendance, employees, loading } = useSelector((state) => state.attendance);
  const [filters, setFilters] = useState({
    startDate: format(new Date(new Date().setDate(1)), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    status: '',
    employeeId: '',
    department: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(getEmployees());
    dispatch(getAllAttendance(filters));
  }, [dispatch]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const applyFilters = () => {
    dispatch(getAllAttendance(filters));
  };

  const resetFilters = () => {
    const defaultFilters = {
      startDate: format(new Date(new Date().setDate(1)), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      status: '',
      employeeId: '',
      department: '',
    };
    setFilters(defaultFilters);
    dispatch(getAllAttendance(defaultFilters));
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.employeeId) params.append('employeeId', filters.employeeId);

      const response = await api.get(`/attendance/export?${params}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-${filters.startDate}-to-${filters.endDate}.csv`);
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

  const departments = [...new Set(employees.map((e) => e.department))].filter(Boolean);

  return (
    <div className="all-attendance">
      <div className="page-header">
        <div>
          <h1><FiUsers /> All Employees Attendance</h1>
          <p>View and manage attendance records</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => setShowFilters(!showFilters)}>
            <FiFilter /> Filters
          </button>
          <button className="btn btn-primary" onClick={handleExport}>
            <FiDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="filters-card card">
          <div className="filters-grid">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="">All Status</option>
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="half-day">Half Day</option>
                <option value="absent">Absent</option>
              </select>
            </div>
            <div className="form-group">
              <label>Employee</label>
              <select name="employeeId" value={filters.employeeId} onChange={handleFilterChange}>
                <option value="">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp.employeeId}>
                    {emp.name} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Department</label>
              <select name="department" value={filters.department} onChange={handleFilterChange}>
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="filter-actions">
            <button className="btn btn-primary" onClick={applyFilters}>
              <FiSearch /> Apply Filters
            </button>
            <button className="btn btn-secondary" onClick={resetFilters}>
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="card">
        <div className="card-header">
          <h3>Attendance Records</h3>
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
                        <div className="emp-avatar">
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

export default AllAttendance;
