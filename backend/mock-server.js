const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;

// Mock data storage
const users = [];
const jobs = [];
const notifications = [];

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Mock Job Master API is running',
        timestamp: new Date().toISOString(),
        environment: 'development',
        database: 'mock'
    });
});

// Student registration
app.post('/api/auth/student/register', async (req, res) => {
    try {
        const { name, email, password, department, studentId } = req.body;

        // Check if user already exists
        if (users.find(u => u.email === email)) {
            return res.status(400).json({
                success: false,
                error: 'Email already registered'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = {
            id: Date.now().toString(),
            name,
            email,
            password: hashedPassword,
            role: 'student',
            department,
            studentId,
            createdAt: new Date()
        };

        users.push(user);

        // Generate token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            'your-secret-key',
            { expiresIn: '30d' }
        );

        // Remove password from response
        const { password: _, ...userResponse } = user;

        res.status(201).json({
            success: true,
            message: 'Student registered successfully',
            user: userResponse,
            token
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// Admin registration
app.post('/api/auth/admin/register', async (req, res) => {
    try {
        const { name, email, password, department, facultyId, adminCode } = req.body;

        // Validate admin code
        const validAdminCodes = ['ADMIN2025', 'FACULTY2025', 'MASTER2025'];
        if (!validAdminCodes.includes(adminCode)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid admin authorization code'
            });
        }

        // Check if user already exists
        if (users.find(u => u.email === email)) {
            return res.status(400).json({
                success: false,
                error: 'Email already registered'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = {
            id: Date.now().toString(),
            name,
            email,
            password: hashedPassword,
            role: 'admin',
            department,
            facultyId,
            createdAt: new Date()
        };

        users.push(user);

        // Generate token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            'your-secret-key',
            { expiresIn: '30d' }
        );

        // Remove password from response
        const { password: _, ...userResponse } = user;

        res.status(201).json({
            success: true,
            message: 'Admin registered successfully',
            user: userResponse,
            token
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            'your-secret-key',
            { expiresIn: '30d' }
        );

        // Remove password from response
        const { password: _, ...userResponse } = user;

        res.json({
            success: true,
            message: 'Login successful',
            user: userResponse,
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// Get current user
app.get('/api/auth/me', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, 'your-secret-key');
        const user = users.find(u => u.id === decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not found'
            });
        }

        // Remove password from response
        const { password: _, ...userResponse } = user;

        res.json({
            success: true,
            user: userResponse
        });

    } catch (error) {
        console.error('Get me error:', error);
        res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }
});

// Mock jobs endpoints
app.get('/api/jobs', (req, res) => {
    res.json({
        success: true,
        data: jobs,
        pagination: {
            page: 1,
            limit: 10,
            total: jobs.length,
            pages: 1
        }
    });
});

// Mock notifications endpoints
app.get('/api/notifications', (req, res) => {
    res.json({
        success: true,
        data: notifications,
        unreadCount: notifications.filter(n => !n.isRead).length,
        pagination: {
            page: 1,
            limit: 20,
            total: notifications.length,
            pages: 1
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Mock server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
    console.log(`💼 Job endpoints: http://localhost:${PORT}/api/jobs`);
    console.log(`🔔 Notification endpoints: http://localhost:${PORT}/api/notifications`);
    console.log(`🌍 Environment: development (MOCK MODE)`);
});
