const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
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

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

// Rate limiting (disabled for development)
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // limit each IP to 100 requests per windowMs
//     message: {
//         success: false,
//         error: 'Too many requests from this IP, please try again later.'
//     },
//     standardHeaders: true,
//     legacyHeaders: false,
// });

// Auth rate limiting (disabled for development)
// const authLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 20, // limit each IP to 20 auth requests per windowMs
//     message: {
//         success: false,
//         error: 'Too many authentication attempts, please try again later.'
//     },
//     standardHeaders: true,
//     legacyHeaders: false,
// });

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

// CORS middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? config.CORS_ORIGINS
        : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting (disabled for development)
// app.use(limiter); // Rate limiting disabled

// Body parsing with size limits
app.use(express.json({
    limit: '1mb', // Reduced from 10mb for security
    verify: (req, res, buf) => {
        // Additional security check
        if (buf.length > 1024 * 1024) { // 1MB limit
            throw new Error('Request body too large');
        }
    }
}));
app.use(express.urlencoded({
    extended: true,
    limit: '1mb' // Reduced from 10mb for security
}));

// Input sanitization (removed - handled by express-validator)

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
app.use('/api/contact', require('./routes/contact'));

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
