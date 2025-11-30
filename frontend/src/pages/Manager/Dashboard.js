import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getManagerDashboard } from '../../store/slices/dashboardSlice';
import { format } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { FiUsers, FiUserCheck, FiUserX, FiClock, FiTrendingUp } from 'react-icons/fi';
import './Manager.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { managerData, loading } = useSelector((state) => state.dashboard);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getManagerDashboard());
  }, [dispatch]);

  if (loading && !managerData) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  const { overview, weeklyTrend, departmentStats, absentEmployees, monthlyStats } = managerData || {};

  // Weekly Trend Chart Data
  const weeklyChartData = {
    labels: weeklyTrend?.map((d) => d.dayName) || [],
    datasets: [
      {
        label: 'Present',
        data: weeklyTrend?.map((d) => d.present) || [],
        backgroundColor: '#10b981',
      },
      {
        label: 'Late',
        data: weeklyTrend?.map((d) => d.late) || [],
        backgroundColor: '#f59e0b',
      },
      {
        label: 'Absent',
        data: weeklyTrend?.map((d) => d.absent) || [],
        backgroundColor: '#ef4444',
      },
    ],
  };

  const weeklyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  // Department Chart Data
  const departmentChartData = {
    labels: departmentStats?.map((d) => d.department) || [],
    datasets: [
      {
        data: departmentStats?.map((d) => d.present) || [],
        backgroundColor: [
          '#4f46e5',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#06b6d4',
          '#ec4899',
          '#f97316',
        ],
      },
    ],
  };

  const departmentChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  return (
    <div className="manager-dashboard">
      <div className="page-header">
        <div>
          <h1>Manager Dashboard</h1>
          <p>Welcome back, {user?.name}! Here's your team overview.</p>
        </div>
        <div className="header-date">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <FiUsers />
          </div>
          <div className="stat-content">
            <h4>Total Employees</h4>
            <p className="stat-number">{overview?.totalEmployees || 0}</p>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">
            <FiUserCheck />
          </div>
          <div className="stat-content">
            <h4>Present Today</h4>
            <p className="stat-number">{overview?.presentToday || 0}</p>
          </div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon">
            <FiUserX />
          </div>
          <div className="stat-content">
            <h4>Absent Today</h4>
            <p className="stat-number">{overview?.absentToday || 0}</p>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">
            <FiClock />
          </div>
          <div className="stat-content">
            <h4>Late Today</h4>
            <p className="stat-number">{overview?.lateToday || 0}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="card chart-card">
          <div className="card-header">
            <h3><FiTrendingUp /> Weekly Attendance Trend</h3>
          </div>
          <div className="chart-container">
            <Bar data={weeklyChartData} options={weeklyChartOptions} />
          </div>
        </div>

        <div className="card chart-card">
          <div className="card-header">
            <h3><FiUsers /> Department-wise Attendance (Today)</h3>
          </div>
          <div className="chart-container doughnut">
            {departmentStats && departmentStats.length > 0 ? (
              <Doughnut data={departmentChartData} options={departmentChartOptions} />
            ) : (
              <div className="no-data">No department data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bottom-grid">
        {/* Absent Employees */}
        <div className="card">
          <div className="card-header">
            <h3><FiUserX /> Absent Employees Today</h3>
            <span className="badge badge-absent">{absentEmployees?.length || 0}</span>
          </div>
          <div className="absent-list">
            {absentEmployees && absentEmployees.length > 0 ? (
              absentEmployees.map((emp) => (
                <div key={emp.id} className="absent-item">
                  <div className="absent-avatar">
                    {emp.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="absent-info">
                    <span className="absent-name">{emp.name}</span>
                    <span className="absent-dept">{emp.department}</span>
                  </div>
                  <span className="absent-id">{emp.employeeId}</span>
                </div>
              ))
            ) : (
              <div className="no-absent">
                <FiUserCheck className="no-absent-icon" />
                <p>All employees are present today!</p>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="card">
          <div className="card-header">
            <h3><FiTrendingUp /> This Month's Summary</h3>
          </div>
          <div className="monthly-stats">
            <div className="monthly-stat-item">
              <div className="monthly-stat-label">Total Records</div>
              <div className="monthly-stat-value">{monthlyStats?.totalRecords || 0}</div>
            </div>
            <div className="monthly-stat-item present">
              <div className="monthly-stat-label">Present Days</div>
              <div className="monthly-stat-value">{monthlyStats?.present || 0}</div>
            </div>
            <div className="monthly-stat-item late">
              <div className="monthly-stat-label">Late Arrivals</div>
              <div className="monthly-stat-value">{monthlyStats?.late || 0}</div>
            </div>
            <div className="monthly-stat-item half">
              <div className="monthly-stat-label">Half Days</div>
              <div className="monthly-stat-value">{monthlyStats?.halfDay || 0}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
