# Server Troubleshooting Guide

## ✅ Server Status: RUNNING

Your server is currently running successfully on port 5000!

## 🔍 How to Verify Server is Working

### **1. Check Server Status**

```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Expected output:
# TCP    0.0.0.0:5000           0.0.0.0:0              LISTENING
```

### **2. Test API Endpoints**

#### **Test Protected Endpoint (Should return 401)**

```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/me" -Method GET
# Expected: {"success":false,"error":"Not authorized, no token"}
```

#### **Test Public Endpoint**

```powershell
# Test student registration endpoint
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "test123"
    department = "Computer Science"
    studentId = "TEST123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/student/register" -Method POST -Body $body -ContentType "application/json"
```

## 🚨 Common Server Issues & Solutions

### **Issue 1: "Server Crashed" - Missing Dependencies**

**Symptoms**: Server won't start, missing module errors
**Solution**:

```bash
cd backend
npm install
npm start
```

### **Issue 2: Port Already in Use**

**Symptoms**: `EADDRINUSE` error
**Solution**:

```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change port in config.env
PORT=5001
```

### **Issue 3: Database Connection Issues**

**Symptoms**: Database connection errors
**Solution**:

1. Check MongoDB is running
2. Verify connection string in `config.env`
3. Check network connectivity

### **Issue 4: Environment Variables Missing**

**Symptoms**: JWT secret errors, email service failures
**Solution**:

1. Copy `config.env.example` to `config.env`
2. Fill in required values:
   ```
   JWT_SECRET=your-super-secret-key-here
   MONGODB_URI=mongodb://localhost:27017/job-master
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

## 🔧 Server Management Commands

### **Start Server**

```bash
cd backend
npm start
```

### **Start in Development Mode**

```bash
cd backend
npm run dev
```

### **Stop Server**

- Press `Ctrl+C` in the terminal where server is running
- Or kill the process using Task Manager

### **Restart Server**

```bash
# Stop server (Ctrl+C)
# Then start again
npm start
```

## 📊 Server Health Check

### **1. Check Server Logs**

Look for these messages in the console:

```
✅  Database connection successful
🚀 Server running on port 5000
```

### **2. Test All Major Endpoints**

```powershell
# Auth endpoints
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/me" -Method GET
Invoke-WebRequest -Uri "http://localhost:5000/api/jobs" -Method GET
Invoke-WebRequest -Uri "http://localhost:5000/api/competitions" -Method GET
```

### **3. Check Database Connection**

```bash
# Test database connection
node test-db.js
```

## 🛠️ Debugging Steps

### **Step 1: Check Dependencies**

```bash
cd backend
npm list
# Should show all packages without "UNMET DEPENDENCY"
```

### **Step 2: Check Environment Variables**

```bash
# Verify .env file exists and has required values
cat config.env
```

### **Step 3: Check Server Syntax**

```bash
# Check for syntax errors
node -c server.js
node -c middleware/validation.js
node -c config/security.js
```

### **Step 4: Check Port Availability**

```bash
# Check if port 5000 is available
netstat -ano | findstr :5000
```

## 🚀 Production Deployment

### **1. Environment Setup**

```bash
# Set production environment
export NODE_ENV=production

# Or in Windows
set NODE_ENV=production
```

### **2. Install Production Dependencies**

```bash
npm install --production
```

### **3. Start with PM2 (Recommended)**

```bash
# Install PM2 globally
npm install -g pm2

# Start server with PM2
pm2 start server.js --name "job-master-api"

# Check status
pm2 status
```

## 📞 If Server Still Won't Start

### **1. Check Error Logs**

```bash
# Look for specific error messages in console
npm start 2>&1 | tee server.log
```

### **2. Verify All Files Exist**

```bash
# Check required files
ls -la server.js
ls -la config/
ls -la middleware/
ls -la models/
ls -la routes/
```

### **3. Reset Dependencies**

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### **4. Check Node.js Version**

```bash
node --version
# Should be Node.js 18 or higher
```

## ✅ Server Status Checklist

- [ ] Server is running on port 5000
- [ ] All dependencies are installed
- [ ] Environment variables are set
- [ ] Database connection is working
- [ ] API endpoints are responding
- [ ] No syntax errors in code
- [ ] No port conflicts

---

**Last Updated**: December 2024
**Status**: ✅ Server Running Successfully
