import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Check in
export const checkIn = createAsyncThunk(
  'attendance/checkIn',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/attendance/checkin');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Check-in failed');
    }
  }
);

// Check out
export const checkOut = createAsyncThunk(
  'attendance/checkOut',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/attendance/checkout');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Check-out failed');
    }
  }
);

// Get today's status
export const getTodayStatus = createAsyncThunk(
  'attendance/getTodayStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/attendance/today');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get today status');
    }
  }
);

// Get my history
export const getMyHistory = createAsyncThunk(
  'attendance/getMyHistory',
  async ({ month, year } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      const response = await api.get(`/attendance/my-history?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get history');
    }
  }
);

// Get my summary
export const getMySummary = createAsyncThunk(
  'attendance/getMySummary',
  async ({ month, year } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      const response = await api.get(`/attendance/my-summary?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get summary');
    }
  }
);

// Manager: Get all attendance
export const getAllAttendance = createAsyncThunk(
  'attendance/getAllAttendance',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await api.get(`/attendance/all?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get attendance');
    }
  }
);

// Manager: Get employee attendance
export const getEmployeeAttendance = createAsyncThunk(
  'attendance/getEmployeeAttendance',
  async ({ id, month, year }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      const response = await api.get(`/attendance/employee/${id}?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get employee attendance');
    }
  }
);

// Manager: Get team summary
export const getTeamSummary = createAsyncThunk(
  'attendance/getTeamSummary',
  async ({ month, year } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      const response = await api.get(`/attendance/summary?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get team summary');
    }
  }
);

// Manager: Get today's status
export const getTodayTeamStatus = createAsyncThunk(
  'attendance/getTodayTeamStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/attendance/today-status');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get today status');
    }
  }
);

// Manager: Get employees list
export const getEmployees = createAsyncThunk(
  'attendance/getEmployees',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/attendance/employees');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get employees');
    }
  }
);

// Manager: Export CSV
export const exportAttendance = createAsyncThunk(
  'attendance/exportAttendance',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await api.get(`/attendance/export?${params}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance-report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to export attendance');
    }
  }
);

const initialState = {
  todayStatus: null,
  history: [],
  summary: null,
  allAttendance: [],
  employees: [],
  teamSummary: null,
  todayTeamStatus: null,
  loading: false,
  error: null,
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check In
      .addCase(checkIn.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkIn.fulfilled, (state, action) => {
        state.loading = false;
        state.todayStatus = {
          attendance: action.payload.attendance,
          isCheckedIn: true,
          isCheckedOut: false,
        };
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Check Out
      .addCase(checkOut.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkOut.fulfilled, (state, action) => {
        state.loading = false;
        state.todayStatus = {
          attendance: action.payload.attendance,
          isCheckedIn: true,
          isCheckedOut: true,
        };
      })
      .addCase(checkOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Today Status
      .addCase(getTodayStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTodayStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.todayStatus = action.payload;
      })
      .addCase(getTodayStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // My History
      .addCase(getMyHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMyHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload.attendance;
      })
      .addCase(getMyHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // My Summary
      .addCase(getMySummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMySummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(getMySummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // All Attendance
      .addCase(getAllAttendance.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.allAttendance = action.payload.attendance;
      })
      .addCase(getAllAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Employees
      .addCase(getEmployees.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload.employees;
      })
      .addCase(getEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Team Summary
      .addCase(getTeamSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTeamSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.teamSummary = action.payload;
      })
      .addCase(getTeamSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Today Team Status
      .addCase(getTodayTeamStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTodayTeamStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.todayTeamStatus = action.payload;
      })
      .addCase(getTodayTeamStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Export
      .addCase(exportAttendance.pending, (state) => {
        state.loading = true;
      })
      .addCase(exportAttendance.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(exportAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = attendanceSlice.actions;
export default attendanceSlice.reducer;
