# Employee Attendance System

A full-stack web application for managing employee attendance with role-based access control. Built with React, Redux Toolkit, Node.js, Express, and MongoDB. Features **Dark/Light theme support** and deployed on AWS cloud infrastructure.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-green.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)
![AWS](https://img.shields.io/badge/AWS-Amplify%20%7C%20EC2-orange.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)

## 🌐 Live Demo

- **Frontend:** [https://main.d37h5qumkynh8u.amplifyapp.com](https://main.d37h5qumkynh8u.amplifyapp.com)
- **Backend API:** Hosted on AWS EC2 via API Gateway

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

### UI/UX Features
- 🌙 **Dark Mode Support** - Toggle between light and dark themes
- ☀️ **Light Mode Support** - Clean, professional light theme
- 💾 **Theme Persistence** - Theme preference saved in localStorage
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## 🛠️ Tech Stack

### Frontend
- React 18.2.0
- Redux Toolkit (State Management)
- React Router DOM (Routing)
- React Context API (Theme Management)
- Axios (HTTP Client)
- Chart.js & React-Chartjs-2 (Data Visualization)
- Date-fns (Date Formatting)
- React Icons
- React Toastify (Notifications)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs (Password Hashing)
- json2csv (CSV Export)
- CORS (Cross-Origin Resource Sharing)

### Cloud Infrastructure (AWS)
- **Frontend Hosting:** AWS Amplify
- **Backend Hosting:** AWS EC2 (Amazon Linux 2023)
- **API Gateway:** AWS API Gateway (HTTPS proxy)
- **Database:** MongoDB Atlas
- **Process Manager:** PM2
- **Reverse Proxy:** Nginx

## Screenshots

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
│   │   ├── context/
│   │   │   └── ThemeContext.js
│   │   ├── pages/
│   │   │   ├── Auth/
│   │   │   ├── Employee/
│   │   │   └── Manager/
│   │   ├── store/
│   │   │   └── slices/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 16.0.0
- MongoDB Atlas account (or local MongoDB)
- npm or yarn
- Git

### Local Development Setup

#### 1. Clone the repository
```bash
git clone https://github.com/rahulkothuri/Employee-Attendance-System.git
cd Employee-Attendance-System
```

#### 2. Backend Setup
```bash
cd backend
npm install
```

#### 3. Configure Backend Environment Variables

Create a `.env` file in the `backend` directory:
```env
PORT=8008
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/employee-attendance?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

#### 4. Frontend Setup
```bash
cd ../frontend
npm install
```

#### 5. Configure Frontend Environment Variables (Optional)

Create a `.env` file in the `frontend` directory:
```env
REACT_APP_API_URL=http://localhost:8008/api
```

### Running Locally

#### Start Backend Server
```bash
cd backend
npm run dev
# or
node server.js
```
Server runs on `http://localhost:8008`

#### Start Frontend Development Server
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

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check server status |

## 🔐 User Roles

### Employee
- Can mark their own attendance
- View personal attendance history
- Access personal dashboard
- Toggle dark/light theme

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

## 🎨 Theme Support

The application supports both dark and light themes:

### Using Theme Toggle
- Click the theme toggle button in the navigation bar
- Theme preference is automatically saved to localStorage
- System preference is detected on first visit



### Backend (EC2)
```bash
pm2 status                    # Check app status
pm2 logs attendance-backend   # View logs
pm2 restart attendance-backend # Restart app
pm2 stop attendance-backend   # Stop app
sudo systemctl status nginx   # Check Nginx status
```

### Frontend (Local)
```bash
npm start     # Start development server
npm run build # Build for production
npm test      # Run tests
```


