// Centralized Backend Configuration
// Comment/Uncomment the configuration you want to use

// ========================================
// LOCAL DEVELOPMENT CONFIGURATION
// ========================================
// const config = {
//     // Server Configuration
//     PORT: process.env.PORT || 5000,
//     NODE_ENV: 'development',

//     // Database Configuration
//     MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/job-master',

//     // JWT Configuration
//     JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-in-production',
//     JWT_EXPIRES_IN: '7d',

//     // Email Configuration
//     EMAIL_USER: process.env.EMAIL_USER || 'your-email@gmail.com',
//     EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || 'your-app-password',

//     // Frontend Configuration
//     FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

//     // CORS Origins
//     CORS_ORIGINS: [
//         'http://localhost:5173',
//         'http://localhost:3000',
//         'http://localhost:4173'
//     ],

//     // API Base URL
//     API_BASE_URL: 'http://localhost:5000/api',

//     // Server Base URL
//     SERVER_BASE_URL: 'http://localhost:5000'
// };

// ========================================





// PRODUCTION CONFIGURATION (COMMENTED OUT)
// ========================================
// Uncomment the lines below and comment out the config above to use production

const config = {
    // Server Configuration
    PORT: process.env.PORT || 5000,
    NODE_ENV: 'production',

    // Database Configuration
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/job-master',

    // JWT Configuration
    JWT_SECRET: process.env.JWT_SECRET || 'your-production-jwt-secret-here',
    JWT_EXPIRES_IN: '7d',

    // Email Configuration
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,

    // Frontend Configuration
    FRONTEND_URL: process.env.FRONTEND_URL || 'https://job-master-07.netlify.app',

    // CORS Origins
    CORS_ORIGINS: [
        'https://thriving-pasca-ce1f0a.netlify.app',
        'https://job-master-07.netlify.app',
        'https://dp-1-1.onrender.com',
    ],

    // API Base URL
    API_BASE_URL: 'https://dp-1-1.onrender.com/api',

    // Server Base URL
    SERVER_BASE_URL: 'https://dp-1-1.onrender.com'
};


// Helper functions
const getConfig = () => config;
const getApiUrl = (endpoint = '') => `${config.API_BASE_URL}${endpoint}`;
const getServerUrl = (endpoint = '') => `${config.SERVER_BASE_URL}${endpoint}`;
const isProduction = () => config.NODE_ENV === 'production';
const isDevelopment = () => config.NODE_ENV === 'development';

module.exports = {
    ...config,
    getConfig,
    getApiUrl,
    getServerUrl,
    isProduction,
    isDevelopment,
    environment: config.NODE_ENV
};
