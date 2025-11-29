const express = require('express');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Helper function to get start of day
const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// @route   GET /api/dashboard/employee
// @desc    Get employee dashboard stats
// @access  Private (Employee)
router.get('/employee', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = getStartOfDay(new Date());
    const currentDate = new Date();
    
    // Get current month range
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

    // Today's attendance
    const todayAttendance = await Attendance.findOne({
      userId,
      date: today
    });

    // This month's attendance
    const monthAttendance = await Attendance.find({
      userId,
      date: { $gte: monthStart, $lte: monthEnd }
    });

    // Calculate monthly stats
    let present = 0, late = 0, halfDay = 0, totalHours = 0;
    monthAttendance.forEach(record => {
      switch (record.status) {
        case 'present':
          present++;
          break;
        case 'late':
          late++;
          break;
        case 'half-day':
          halfDay++;
          break;
      }
      totalHours += record.totalHours || 0;
    });

    // Calculate working days passed this month
    let workingDaysPassed = 0;
    const tempDate = new Date(monthStart);
    while (tempDate <= currentDate) {
      const dayOfWeek = tempDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDaysPassed++;
      }
      tempDate.setDate(tempDate.getDate() + 1);
    }

    const absent = Math.max(0, workingDaysPassed - (present + late + halfDay));

    // Recent attendance (last 7 days)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentAttendance = await Attendance.find({
      userId,
      date: { $gte: sevenDaysAgo, $lte: today }
    }).sort({ date: -1 });

    res.json({
      success: true,
      today: {
        date: today,
        isCheckedIn: todayAttendance?.checkInTime ? true : false,
        isCheckedOut: todayAttendance?.checkOutTime ? true : false,
        checkInTime: todayAttendance?.checkInTime || null,
        checkOutTime: todayAttendance?.checkOutTime || null,
        status: todayAttendance?.status || 'not-checked-in',
        totalHours: todayAttendance?.totalHours || 0
      },
      monthly: {
        present,
        absent,
        late,
        halfDay,
        totalHours: Math.round(totalHours * 100) / 100,
        workingDays: workingDaysPassed
      },
      recentAttendance: recentAttendance.map(record => ({
        date: record.date,
        status: record.status,
        checkInTime: record.checkInTime,
        checkOutTime: record.checkOutTime,
        totalHours: record.totalHours
      }))
    });
  } catch (error) {
    console.error('Employee dashboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/dashboard/manager
// @desc    Get manager dashboard stats
// @access  Private (Manager)
router.get('/manager', protect, authorize('manager'), async (req, res) => {
  try {
    const today = getStartOfDay(new Date());
    const currentDate = new Date();

    // Get all employees
    const allEmployees = await User.find({ role: 'employee' });
    const totalEmployees = allEmployees.length;

    // Today's attendance
    const todayAttendance = await Attendance.find({
      date: today
    }).populate('userId', 'name employeeId department');

    const presentToday = todayAttendance.filter(a => a.checkInTime).length;
    const lateToday = todayAttendance.filter(a => a.status === 'late').length;
    const checkedInIds = todayAttendance
      .filter(a => a.checkInTime)
      .map(a => a.userId?._id?.toString());

    const absentToday = allEmployees.filter(emp => 
      !checkedInIds.includes(emp._id.toString())
    );

    // Weekly attendance trend (last 7 days)
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayAttendance = await Attendance.find({
        date: getStartOfDay(date)
      });

      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        weeklyTrend.push({
          date: date.toISOString().split('T')[0],
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          present: dayAttendance.filter(a => a.status === 'present').length,
          late: dayAttendance.filter(a => a.status === 'late').length,
          absent: totalEmployees - dayAttendance.filter(a => a.checkInTime).length,
          halfDay: dayAttendance.filter(a => a.status === 'half-day').length
        });
      }
    }

    // Department-wise attendance for today
    const departmentStats = {};
    allEmployees.forEach(emp => {
      if (!departmentStats[emp.department]) {
        departmentStats[emp.department] = { total: 0, present: 0 };
      }
      departmentStats[emp.department].total++;
    });

    todayAttendance.forEach(record => {
      if (record.userId && record.checkInTime) {
        const dept = record.userId.department;
        if (departmentStats[dept]) {
          departmentStats[dept].present++;
        }
      }
    });

    // Get current month stats
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

    const monthAttendance = await Attendance.find({
      date: { $gte: monthStart, $lte: monthEnd }
    });

    const monthlyStats = {
      totalRecords: monthAttendance.length,
      present: monthAttendance.filter(a => a.status === 'present').length,
      late: monthAttendance.filter(a => a.status === 'late').length,
      halfDay: monthAttendance.filter(a => a.status === 'half-day').length
    };

    res.json({
      success: true,
      overview: {
        totalEmployees,
        presentToday,
        absentToday: absentToday.length,
        lateToday
      },
      weeklyTrend,
      departmentStats: Object.entries(departmentStats).map(([dept, stats]) => ({
        department: dept,
        total: stats.total,
        present: stats.present,
        absent: stats.total - stats.present
      })),
      absentEmployees: absentToday.map(emp => ({
        id: emp._id,
        name: emp.name,
        employeeId: emp.employeeId,
        department: emp.department
      })),
      monthlyStats
    });
  } catch (error) {
    console.error('Manager dashboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
