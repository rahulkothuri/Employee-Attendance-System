const express = require('express');
const { Parser } = require('json2csv');
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

// Helper function to get end of day
const getEndOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

// @route   POST /api/attendance/checkin
// @desc    Check in for the day
// @access  Private (Employee)
router.post('/checkin', protect, async (req, res) => {
  try {
    const today = getStartOfDay(new Date());
    
    // Check if already checked in today
    let attendance = await Attendance.findOne({
      userId: req.user.id,
      date: today
    });

    if (attendance && attendance.checkInTime) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const checkInTime = new Date();

    if (attendance) {
      attendance.checkInTime = checkInTime;
    } else {
      attendance = new Attendance({
        userId: req.user.id,
        date: today,
        checkInTime
      });
    }

    attendance.determineStatus();
    await attendance.save();

    res.json({
      success: true,
      message: 'Checked in successfully',
      attendance
    });
  } catch (error) {
    console.error('Check in error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/attendance/checkout
// @desc    Check out for the day
// @access  Private (Employee)
router.post('/checkout', protect, async (req, res) => {
  try {
    const today = getStartOfDay(new Date());
    
    const attendance = await Attendance.findOne({
      userId: req.user.id,
      date: today
    });

    if (!attendance || !attendance.checkInTime) {
      return res.status(400).json({ message: 'You need to check in first' });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    attendance.checkOutTime = new Date();
    attendance.calculateTotalHours();
    await attendance.save();

    res.json({
      success: true,
      message: 'Checked out successfully',
      attendance
    });
  } catch (error) {
    console.error('Check out error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/today
// @desc    Get today's attendance status
// @access  Private (Employee)
router.get('/today', protect, async (req, res) => {
  try {
    const today = getStartOfDay(new Date());
    
    const attendance = await Attendance.findOne({
      userId: req.user.id,
      date: today
    });

    res.json({
      success: true,
      attendance: attendance || null,
      isCheckedIn: attendance?.checkInTime ? true : false,
      isCheckedOut: attendance?.checkOutTime ? true : false
    });
  } catch (error) {
    console.error('Get today error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/my-history
// @desc    Get user's attendance history
// @access  Private (Employee)
router.get('/my-history', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let query = { userId: req.user.id };
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(100);

    res.json({
      success: true,
      count: attendance.length,
      attendance
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/my-summary
// @desc    Get user's monthly attendance summary
// @access  Private (Employee)
router.get('/my-summary', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const attendance = await Attendance.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });

    const summary = {
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      totalHours: 0
    };

    attendance.forEach(record => {
      switch (record.status) {
        case 'present':
          summary.present++;
          break;
        case 'absent':
          summary.absent++;
          break;
        case 'late':
          summary.late++;
          break;
        case 'half-day':
          summary.halfDay++;
          break;
      }
      summary.totalHours += record.totalHours || 0;
    });

    // Calculate working days in month (excluding weekends)
    let workingDays = 0;
    const tempDate = new Date(startDate);
    while (tempDate <= endDate && tempDate <= currentDate) {
      const dayOfWeek = tempDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      tempDate.setDate(tempDate.getDate() + 1);
    }

    // Calculate absent days (working days - recorded days)
    const recordedDays = summary.present + summary.late + summary.halfDay;
    summary.absent = Math.max(0, workingDays - recordedDays);

    res.json({
      success: true,
      month: targetMonth + 1,
      year: targetYear,
      workingDays,
      summary
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== MANAGER ROUTES ====================

// @route   GET /api/attendance/all
// @desc    Get all employees attendance
// @access  Private (Manager)
router.get('/all', protect, authorize('manager'), async (req, res) => {
  try {
    const { startDate, endDate, status, employeeId, department } = req.query;
    
    let query = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: getStartOfDay(new Date(startDate)),
        $lte: getEndOfDay(new Date(endDate))
      };
    }
    
    if (status) {
      query.status = status;
    }

    let attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 });

    // Filter by employeeId if provided
    if (employeeId) {
      attendance = attendance.filter(a => 
        a.userId && a.userId.employeeId === employeeId
      );
    }

    // Filter by department if provided
    if (department) {
      attendance = attendance.filter(a => 
        a.userId && a.userId.department === department
      );
    }

    res.json({
      success: true,
      count: attendance.length,
      attendance
    });
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/employee/:id
// @desc    Get specific employee's attendance
// @access  Private (Manager)
router.get('/employee/:id', protect, authorize('manager'), async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let query = { userId: req.params.id };
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 });

    const user = await User.findById(req.params.id);

    res.json({
      success: true,
      employee: user ? {
        id: user._id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        department: user.department
      } : null,
      count: attendance.length,
      attendance
    });
  } catch (error) {
    console.error('Get employee attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/summary
// @desc    Get team attendance summary
// @access  Private (Manager)
router.get('/summary', protect, authorize('manager'), async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const attendance = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('userId', 'name employeeId department');

    const summary = {
      totalRecords: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      halfDay: attendance.filter(a => a.status === 'half-day').length
    };

    // Group by department
    const departmentStats = {};
    attendance.forEach(record => {
      if (record.userId) {
        const dept = record.userId.department;
        if (!departmentStats[dept]) {
          departmentStats[dept] = { present: 0, absent: 0, late: 0, halfDay: 0 };
        }
        switch (record.status) {
          case 'present':
            departmentStats[dept].present++;
            break;
          case 'absent':
            departmentStats[dept].absent++;
            break;
          case 'late':
            departmentStats[dept].late++;
            break;
          case 'half-day':
            departmentStats[dept].halfDay++;
            break;
        }
      }
    });

    res.json({
      success: true,
      month: targetMonth + 1,
      year: targetYear,
      summary,
      departmentStats
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/today-status
// @desc    Get who's present today
// @access  Private (Manager)
router.get('/today-status', protect, authorize('manager'), async (req, res) => {
  try {
    const today = getStartOfDay(new Date());

    const attendance = await Attendance.find({
      date: today
    }).populate('userId', 'name email employeeId department');

    const allEmployees = await User.find({ role: 'employee' });
    
    const presentEmployees = attendance.filter(a => a.checkInTime);
    const checkedInIds = presentEmployees.map(a => a.userId?._id?.toString());
    
    const absentEmployees = allEmployees.filter(emp => 
      !checkedInIds.includes(emp._id.toString())
    );

    res.json({
      success: true,
      date: today,
      totalEmployees: allEmployees.length,
      present: presentEmployees.length,
      absent: absentEmployees.length,
      lateArrivals: attendance.filter(a => a.status === 'late').length,
      presentList: presentEmployees.map(a => ({
        id: a.userId?._id,
        name: a.userId?.name,
        employeeId: a.userId?.employeeId,
        department: a.userId?.department,
        checkInTime: a.checkInTime,
        checkOutTime: a.checkOutTime,
        status: a.status
      })),
      absentList: absentEmployees.map(emp => ({
        id: emp._id,
        name: emp.name,
        employeeId: emp.employeeId,
        department: emp.department
      }))
    });
  } catch (error) {
    console.error('Get today status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/export
// @desc    Export attendance report as CSV
// @access  Private (Manager)
router.get('/export', protect, authorize('manager'), async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    
    let query = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: getStartOfDay(new Date(startDate)),
        $lte: getEndOfDay(new Date(endDate))
      };
    }

    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (user) {
        query.userId = user._id;
      }
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 });

    const data = attendance.map(record => ({
      Date: record.date.toISOString().split('T')[0],
      EmployeeID: record.userId?.employeeId || 'N/A',
      Name: record.userId?.name || 'N/A',
      Department: record.userId?.department || 'N/A',
      CheckIn: record.checkInTime ? record.checkInTime.toLocaleTimeString() : 'N/A',
      CheckOut: record.checkOutTime ? record.checkOutTime.toLocaleTimeString() : 'N/A',
      Status: record.status,
      TotalHours: record.totalHours.toFixed(2)
    }));

    const fields = ['Date', 'EmployeeID', 'Name', 'Department', 'CheckIn', 'CheckOut', 'Status', 'TotalHours'];
    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment('attendance-report.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/employees
// @desc    Get all employees list
// @access  Private (Manager)
router.get('/employees', protect, authorize('manager'), async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' })
      .select('name email employeeId department createdAt')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: employees.length,
      employees
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
