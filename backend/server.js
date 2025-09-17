const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const config = require('./config/config');
require('dotenv').config();

const app = express();
const PORT = config.PORT;

// Connect to database
let dbConnected = false;
connectDB().then(connected => {
    dbConnected = connected;
    if (connected) {
        console.log('✅  Database connection successful');
    } else {
        console.log('⚠️  Server running without database connection');
        console.log('   Some features may not work properly');
    }
});

// Middleware
app.use(cors({
    origin: config.CORS_ORIGINS,
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database check middleware
const checkDatabase = (req, res, next) => {
    if (!dbConnected) {
        return res.status(503).json({
            success: false,
            error: 'Database connection is not available. Please check your MongoDB setup.'
        });
    }
    next();
};

// Routes
app.use('/api/auth', checkDatabase, require('./routes/auth'));
app.use('/api/jobs', checkDatabase, require('./routes/jobs'));
app.use('/api/competitions', checkDatabase, require('./routes/competitions'));
app.use('/api/certifications', checkDatabase, require('./routes/certifications'));
app.use('/api/events', checkDatabase, require('./routes/events'));
app.use('/api/notifications', checkDatabase, require('./routes/notifications'));
app.use('/api/settings', checkDatabase, require('./routes/settings'));
app.use('/api/job-preferences', checkDatabase, require('./routes/jobPreferences'));
app.use('/api/saved-jobs', checkDatabase, require('./routes/savedJobs'));
app.use('/api/applied-jobs', checkDatabase, require('./routes/appliedJobs'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Job Master API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: dbConnected ? 'connected' : 'disconnected'
    });
});

// Email configuration test endpoint
app.get('/api/test-email', async (req, res) => {
    try {
        const { testEmailConfiguration } = require('./utils/emailService');
        const isConfigured = await testEmailConfiguration();

        if (isConfigured) {
            res.json({
                success: true,
                message: 'Email configuration is working correctly',
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Email configuration test failed',
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('Email test error:', error);
        res.status(500).json({
            success: false,
            error: 'Email test failed',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: ${config.getServerUrl()}/api/health`);
    console.log(`🔐 Auth endpoints: ${config.getServerUrl()}/api/auth`);
    console.log(`💼 Job endpoints: ${config.getServerUrl()}/api/jobs`);
    console.log(`🏆 Competition endpoints: ${config.getServerUrl()}/api/competitions`);
    console.log(`🎓 Certification endpoints: ${config.getServerUrl()}/api/certifications`);
    console.log(`📅 Event endpoints: ${config.getServerUrl()}/api/events`);
    console.log(`🔔 Notification endpoints: ${config.getServerUrl()}/api/notifications`);
    console.log(`🌍 Environment: ${config.NODE_ENV}`);
    console.log(`🌐 API Base URL: ${config.API_BASE_URL}`);
    console.log(`🔗 Frontend URL: ${config.FRONTEND_URL}`);
});
