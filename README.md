# Employee Attendance System

A full-stack web application for managing employee attendance with role-based access control. Built with React, Redux Toolkit, Node.js, Express, and MongoDB.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-green.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## 📋 Features

### Employee Features
- ✅ Mark daily attendance (Check-in/Check-out)
- ✅ View attendance history with filters
- ✅ Dashboard with attendance statistics
- ✅ Monthly attendance summary
- ✅ Profile management

### Manager Features
- ✅ View all team members' attendance
- ✅ Filter by employee, date range, and status
- ✅ Interactive dashboard with charts
- ✅ Team calendar view
- ✅ Generate and export reports (CSV)
- ✅ Attendance analytics and trends

## 🛠️ Tech Stack

### Frontend
- React 18.2.0
- Redux Toolkit (State Management)
- React Router DOM (Routing)
- Axios (HTTP Client)
- Recharts (Data Visualization)
- Date-fns (Date Formatting)
- React Icons

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs (Password Hashing)
- json2csv (CSV Export)

## 📁 Project Structure

```
Employee-Attendance-System/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Attendance.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── attendance.js
│   │   └── dashboard.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout/
│   │   ├── pages/
│   │   │   ├── Auth/
│   │   │   ├── Employee/
│   │   │   └── Manager/
│   │   ├── store/
│   │   │   └── slices/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 16.0.0
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Employee-Attendance-System.git
   cd Employee-Attendance-System
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables**
   
   Create a `.env` file in the backend directory:
   ```env
   PORT=8008
   MONGODB_URI=mongodb://localhost:27017/employee-attendance
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Server runs on `http://localhost:8008`

3. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm start
   ```
   Application runs on `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |

### Attendance Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/attendance/checkin` | Check in | Employee |
| POST | `/api/attendance/checkout` | Check out | Employee |
| GET | `/api/attendance/history` | Get attendance history | Employee |
| GET | `/api/attendance/summary` | Get monthly summary | Employee |
| GET | `/api/attendance/today` | Get today's status | Employee |
| GET | `/api/attendance/all` | Get all attendance | Manager |
| GET | `/api/attendance/export` | Export as CSV | Manager |

### Dashboard Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/dashboard/employee` | Employee dashboard stats | Employee |
| GET | `/api/dashboard/manager` | Manager dashboard stats | Manager |

## 🔐 User Roles

### Employee
- Can mark their own attendance
- View personal attendance history
- Access personal dashboard

### Manager
- All employee permissions
- View all team members' attendance
- Access manager dashboard with analytics
- Export attendance reports

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (employee/manager),
  employeeId: String (unique),
  department: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Attendance Model
```javascript
{
  userId: ObjectId (ref: User),
  date: Date,
  checkInTime: Date,
  checkOutTime: Date,
  status: String (present/absent/half-day/late),
  totalHours: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 Screenshots

### Employee Dashboard
- Overview statistics
- Recent attendance records
- Quick check-in/out buttons

### Manager Dashboard
- Team attendance overview
- Charts and analytics
- Employee performance metrics

### Attendance History
- Filterable attendance records
- Date range selection
- Export functionality

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- React Team for the amazing framework
- MongoDB for the database
- All contributors who helped with the project

---

⭐ Star this repo if you find it helpful!