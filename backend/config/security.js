const crypto = require('crypto');

// Security configuration
const securityConfig = {
    // JWT Configuration
    jwt: {
        secret: process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
        expiresIn: '24h',
        algorithm: 'HS256'
    },

    // Password requirements
    password: {
        minLength: 6,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false
    },

    // Rate limiting (disabled for development)
    rateLimit: {
        enabled: false, // Set to true for production
        general: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // requests per window
        },
        auth: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 20 // auth requests per window
        },
        passwordReset: {
            windowMs: 60 * 60 * 1000, // 1 hour
            max: 3 // password reset requests per hour
        }
    },

    // OTP Configuration
    otp: {
        length: 6,
        expiryMinutes: 5,
        maxAttempts: 3
    },

    // Session security
    session: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict'
    },

    // CORS Configuration
    cors: {
        origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
        credentials: true,
        optionsSuccessStatus: 200
    },

    // Security headers
    headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
};

// Generate a secure JWT secret if not provided
if (!process.env.JWT_SECRET) {
    console.warn('⚠️  JWT_SECRET not found in environment variables. Using generated secret.');
    console.warn('   For production, set JWT_SECRET in your environment variables.');
    console.warn(`   Generated secret: ${securityConfig.jwt.secret}`);
}

module.exports = securityConfig;
