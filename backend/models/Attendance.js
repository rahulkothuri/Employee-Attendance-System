const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkInTime: {
    type: Date,
    default: null
  },
  checkOutTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day'],
    default: 'present'
  },
  totalHours: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

// Calculate total hours when checking out
attendanceSchema.methods.calculateTotalHours = function() {
  if (this.checkInTime && this.checkOutTime) {
    const diff = this.checkOutTime - this.checkInTime;
    this.totalHours = Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
  }
  return this.totalHours;
};

// Determine status based on check-in time
attendanceSchema.methods.determineStatus = function() {
  if (!this.checkInTime) {
    this.status = 'absent';
    return;
  }
  
  const checkInHour = this.checkInTime.getHours();
  const checkInMinute = this.checkInTime.getMinutes();
  
  // Define late threshold (9:00 AM)
  const lateHour = 9;
  const lateMinute = 0;
  
  // Define half-day threshold (12:00 PM)
  const halfDayHour = 12;
  
  if (checkInHour > halfDayHour || (checkInHour === halfDayHour && checkInMinute > 0)) {
    this.status = 'half-day';
  } else if (checkInHour > lateHour || (checkInHour === lateHour && checkInMinute > lateMinute)) {
    this.status = 'late';
  } else {
    this.status = 'present';
  }
};

module.exports = mongoose.model('Attendance', attendanceSchema);
