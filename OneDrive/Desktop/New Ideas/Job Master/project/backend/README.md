# Job Master - Full Stack Application

A comprehensive job portal application with separate interfaces for students and faculty administrators.

## 🚀 Features

### For Students:
- Browse and search job postings
- Save favorite jobs
- Real-time notifications for new job postings
- Profile management and settings
- Responsive design with modern UI

### For Faculty/Admins:
- Post new job opportunities
- Manage existing job postings (edit/delete)
- View job statistics and reports
- Admin registration with authorization codes

## 🛠️ Tech Stack

### Frontend:
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Framer Motion for animations
- React Router for navigation
- React Hot Toast for notifications

### Backend:
- Node.js with Express.js
- JWT for authentication
- bcryptjs for password hashing
- CORS enabled for cross-origin requests

## 📦 Installation & Setup

### Prerequisites:
- Node.js (v16 or higher)
- npm or yarn

### 1. Clone and Install Dependencies:
```bash
cd project
npm install
```

### 2. Start the Backend Server:
```bash
# Start the server
npm run server

# Or for development with auto-restart
npm run dev:server
```

The server will start on `http://localhost:5000`

### 3. Start the Frontend Development Server:
```bash
# In a new terminal
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🔐 Admin Registration Endpoint

### Endpoint Details:
- **URL**: `POST http://localhost:5000/api/admin/register`
- **Content-Type**: `application/json`

### Request Body:
```json
{
  "name": "Faculty Name",
  "email": "faculty@university.edu",
  "password": "securePassword123",
  "department": "Computer Science",
  "facultyId": "FAC001",
  "adminCode": "ADMIN2024"
}
```

### Valid Admin Codes:
- `ADMIN2024`
- `FACULTY2024`
- `MASTER2024`

### Response:
```json
{
  "success": true,
  "message": "Admin registered successfully",
  "user": {
    "id": "1234567890",
    "name": "Faculty Name",
    "email": "faculty@university.edu",
    "role": "admin",
    "department": "Computer Science",
    "facultyId": "FAC001",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🔌 API Endpoints

### Authentication:
- `POST /api/admin/register` - Admin registration
- `POST /api/student/register` - Student registration
- `POST /api/login` - User login

### Jobs:
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Add new job (Admin only)
- `PUT /api/jobs/:id` - Update job (Admin only)
- `DELETE /api/jobs/:id` - Delete job (Admin only)

### Notifications:
- `GET /api/notifications` - Get all notifications

### Health Check:
- `GET /api/health` - Server health status

## 👥 Demo Credentials

### Student Account:
- **Email**: `student@demo.com`
- **Password**: `password`

### Admin Account:
- **Email**: `admin@demo.com`
- **Password**: `password`

## 🔧 Development

### Available Scripts:
- `npm run dev` - Start frontend development server
- `npm run server` - Start backend server
- `npm run dev:server` - Start backend with auto-restart
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure:
```
project/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── contexts/      # React contexts
│   ├── services/      # API services
│   └── ...
├── server.js          # Express.js backend
├── package.json       # Dependencies and scripts
└── README.md         # This file
```

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Admin authorization codes
- Input validation and sanitization
- CORS configuration

## 🚀 Deployment

### Backend Deployment:
1. Set environment variables (JWT_SECRET, PORT)
2. Install production dependencies
3. Start server with `npm run server`

### Frontend Deployment:
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service

## 📝 Environment Variables

Create a `.env` file in the project root:
```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.
