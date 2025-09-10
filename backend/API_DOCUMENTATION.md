# Job Master API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 🔐 Authentication

#### Register Student
```http
POST /auth/student/register
```
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "department": "Computer Science",
  "studentId": "CS001"
}
```

#### Register Admin
```http
POST /auth/admin/register
```
**Body:**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123",
  "department": "Computer Science",
  "facultyId": "FAC001",
  "adminCode": "ADMIN2024"
}
```

#### Login
```http
POST /auth/login
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /auth/me
```
**Headers:** `Authorization: Bearer <token>`

#### Update Profile
```http
PUT /auth/profile
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "name": "Updated Name",
  "phone": "+1234567890",
  "department": "Information Technology",
  "profilePicture": "data:image/jpeg;base64,..."
}
```

#### Change Password
```http
PUT /auth/change-password
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

#### Logout
```http
POST /auth/logout
```
**Headers:** `Authorization: Bearer <token>`

### 💼 Jobs

#### Get All Jobs
```http
GET /jobs?page=1&limit=10&search=developer&type=Full-time&location=Bangalore&category=Software Development&remote=true&sort=-createdAt
```

#### Get Single Job
```http
GET /jobs/:id
```

#### Create Job (Admin Only)
```http
POST /jobs
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "title": "Frontend Developer",
  "company": "Tech Solutions Inc.",
  "location": "Bangalore",
  "type": "Full-time",
  "remote": true,
  "skills": ["React", "TypeScript", "Node.js"],
  "deadline": "2024-12-31",
  "applyLink": "https://example.com/apply",
  "description": "Job description here...",
  "requirements": "Job requirements here...",
  "benefits": "Job benefits here...",
  "salary": {
    "min": 800000,
    "max": 1200000,
    "currency": "INR",
    "period": "yearly"
  },
  "experience": "Mid Level",
  "category": "Software Development",
  "tags": ["frontend", "react", "typescript"]
}
```

#### Update Job (Admin Only)
```http
PUT /jobs/:id
```
**Headers:** `Authorization: Bearer <token>`
**Body:** Same as create job

#### Delete Job (Admin Only)
```http
DELETE /jobs/:id
```
**Headers:** `Authorization: Bearer <token>`

#### Get My Jobs (Admin Only)
```http
GET /jobs/admin/my-jobs
```
**Headers:** `Authorization: Bearer <token>`

#### Save Job (Student Only)
```http
POST /jobs/:id/save
```
**Headers:** `Authorization: Bearer <token>`

#### Unsave Job (Student Only)
```http
DELETE /jobs/:id/save
```
**Headers:** `Authorization: Bearer <token>`

#### Get Saved Jobs (Student Only)
```http
GET /jobs/saved/list
```
**Headers:** `Authorization: Bearer <token>`

### 🔔 Notifications

#### Get Notifications
```http
GET /notifications?page=1&limit=20&unreadOnly=false
```
**Headers:** `Authorization: Bearer <token>`

#### Mark Notification as Read
```http
PUT /notifications/:id/read
```
**Headers:** `Authorization: Bearer <token>`

#### Mark All Notifications as Read
```http
PUT /notifications/read-all
```
**Headers:** `Authorization: Bearer <token>`

#### Delete Notification
```http
DELETE /notifications/:id
```
**Headers:** `Authorization: Bearer <token>`

#### Delete All Notifications
```http
DELETE /notifications
```
**Headers:** `Authorization: Bearer <token>`

#### Get Notification Count
```http
GET /notifications/count
```
**Headers:** `Authorization: Bearer <token>`

### 📊 Health Check

#### Server Health
```http
GET /health
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## Data Models

### User
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string",
  "role": "student|admin",
  "department": "string",
  "studentId": "string (for students)",
  "facultyId": "string (for admins)",
  "profilePicture": "string",
  "phone": "string",
  "isActive": "boolean",
  "lastLogin": "Date",
  "emailVerified": "boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Job
```json
{
  "_id": "ObjectId",
  "title": "string",
  "company": "string",
  "location": "string",
  "type": "Full-time|Part-time|Internship|Contract|Freelance",
  "remote": "boolean",
  "skills": ["string"],
  "deadline": "Date",
  "applyLink": "string",
  "description": "string",
  "requirements": "string",
  "benefits": "string",
  "salary": {
    "min": "number",
    "max": "number",
    "currency": "USD|EUR|GBP|INR|CAD|AUD",
    "period": "hourly|daily|weekly|monthly|yearly"
  },
  "experience": "Entry Level|Mid Level|Senior Level|Executive",
  "postedBy": "ObjectId (ref: User)",
  "isActive": "boolean",
  "isVerified": "boolean",
  "views": "number",
  "applications": "number",
  "tags": ["string"],
  "category": "string",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Notification
```json
{
  "_id": "ObjectId",
  "user": "ObjectId (ref: User)",
  "type": "job_match|new_posting|application_update|system|profile_update|deadline_reminder|application_status",
  "title": "string",
  "message": "string",
  "jobId": "ObjectId (ref: Job)",
  "isRead": "boolean",
  "isImportant": "boolean",
  "actionUrl": "string",
  "actionText": "string",
  "metadata": "object",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### SavedJob
```json
{
  "_id": "ObjectId",
  "user": "ObjectId (ref: User)",
  "job": "ObjectId (ref: Job)",
  "savedAt": "Date",
  "notes": "string",
  "priority": "low|medium|high",
  "applied": "boolean",
  "appliedAt": "Date",
  "applicationStatus": "pending|submitted|reviewing|interviewed|accepted|rejected",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Admin Codes
- `ADMIN2024`
- `FACULTY2024`
- `MASTER2024`

## Setup Instructions

1. Install dependencies: `npm install`
2. Set up MongoDB connection
3. Start server: `npm run dev`
4. Register users through the application

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/job-master
JWT_SECRET=your-secret-key
NODE_ENV=development
```
