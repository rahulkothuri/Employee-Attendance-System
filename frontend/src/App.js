import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser, setInitialLoadingComplete } from './store/slices/authSlice';

// Layouts
import Layout from './components/Layout/Layout';
import AuthLayout from './components/Layout/AuthLayout';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Employee Pages
import EmployeeDashboard from './pages/Employee/Dashboard';
import MarkAttendance from './pages/Employee/MarkAttendance';
import MyAttendance from './pages/Employee/MyAttendance';
import Profile from './pages/Employee/Profile';

// Manager Pages
import ManagerDashboard from './pages/Manager/Dashboard';
import AllAttendance from './pages/Manager/AllAttendance';
import TeamCalendar from './pages/Manager/TeamCalendar';
import Reports from './pages/Manager/Reports';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, initialLoading } = useSelector((state) => state.auth);

  if (initialLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={user?.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard'} replace />;
  }

  return children;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(loadUser());
    } else {
      dispatch(setInitialLoadingComplete());
    }
  }, [dispatch]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to={user?.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard'} replace />
            ) : (
              <Login />
            )
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? (
              <Navigate to={user?.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard'} replace />
            ) : (
              <Register />
            )
          } 
        />
      </Route>

      {/* Employee Routes */}
      <Route 
        path="/employee" 
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="attendance" element={<MarkAttendance />} />
        <Route path="history" element={<MyAttendance />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Manager Routes */}
      <Route 
        path="/manager" 
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<ManagerDashboard />} />
        <Route path="attendance" element={<AllAttendance />} />
        <Route path="calendar" element={<TeamCalendar />} />
        <Route path="reports" element={<Reports />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Redirect root */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <Navigate to={user?.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
