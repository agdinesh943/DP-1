# Environment Switching Guide

This guide explains how to easily switch between local development and production environments for your Job Master backend.

## 🎯 Quick Switch Commands

### Switch to Local Development

Edit `backend/config/config.js`:

- **Comment out** the production config block (lines 44-77)
- **Uncomment** the local config block (lines 7-38)
- Restart server: `npm start`

### Switch to Production Configuration

Edit `backend/config/config.js`:

- **Comment out** the local config block (lines 7-38)
- **Uncomment** the production config block (lines 44-77)
- Restart server: `npm start`

## 📁 Configuration Files

- **`config/config.js`** - Centralized configuration system (main switching file)
- **`config.env.local`** - Local development settings (optional)
- **`config.env.production`** - Production deployment settings (optional)
- **`.env`** - Environment variables (optional override)

## 🔧 What Gets Switched

### Local Development (`NODE_ENV=development`)

- **API Base URL**: `http://localhost:5000/api`
- **Server Base URL**: `http://localhost:5000`
- **Frontend URL**: `http://localhost:5173`
- **Database**: Local MongoDB (`mongodb://localhost:27017/job-master`)
- **CORS Origins**: Local development URLs

### Production (`NODE_ENV=production`)

- **API Base URL**: `https://dp-1-1.onrender.com/api`
- **Server Base URL**: `https://dp-1-1.onrender.com`
- **Frontend URL**: `https://job-master-07.netlify.app`
- **Database**: MongoDB Atlas
- **CORS Origins**: Production deployment URLs

## 🚀 How It Works

1. **Centralized Config**: All environment-specific settings are in `config/config.js`
2. **Environment Detection**: Automatically detects `NODE_ENV` from `.env` file
3. **Automatic Switching**: Server automatically uses correct URLs and settings
4. **Helper Functions**: Easy access to URLs via `config.getApiUrl()` and `config.getServerUrl()`

## 📝 Example Usage

```javascript
// In your backend code
const config = require("./config/config");

// Get API URL
const apiUrl = config.getApiUrl("/auth/login");
// Local: http://localhost:5000/api/auth/login
// Production: https://dp-1-1.onrender.com/api/auth/login

// Check environment
if (config.isDevelopment()) {
  console.log("Running in development mode");
}

// Get configuration
const dbUri = config.MONGODB_URI;
const corsOrigins = config.CORS_ORIGINS;
```

## 🔄 Frontend Coordination

To switch your entire application (frontend + backend):

### 1. Switch Backend

Edit `backend/config/config.js`:

- Comment/uncomment the appropriate config block
- Restart: `npm start`

### 2. Switch Frontend

Update `frontend/src/config/api.ts`:

```typescript
// For local development
BASE_URL: 'http://localhost:5000/api',
// BASE_URL: 'https://dp-1-1.onrender.com/api',

// For production
// BASE_URL: 'http://localhost:5000/api',
BASE_URL: 'https://dp-1-1.onrender.com/api',
```

And `frontend/src/services/api.ts`:

```typescript
// For local development
const API_BASE_URL = "http://localhost:5000/api";
// const API_BASE_URL = 'https://dp-1-1.onrender.com/api';

// For production
// const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = "https://dp-1-1.onrender.com/api";
```

## 🛠️ Advanced Usage

### Custom Environment

You can create custom environments by adding them to `config/config.js`:

```javascript
staging: {
    PORT: 5000,
    NODE_ENV: 'staging',
    API_BASE_URL: 'https://staging.dp-1-1.onrender.com/api',
    // ... other settings
}
```

### Environment Variables Override

Environment variables in `.env` will override default values:

```bash
# .env
NODE_ENV=development
PORT=3000  # Overrides default port 5000
```

## ✅ Benefits

- ✅ **Single Source of Truth**: All URLs in one place
- ✅ **Easy Switching**: Copy config file and restart
- ✅ **No Hardcoded URLs**: Everything is centralized
- ✅ **Environment Detection**: Automatic configuration based on NODE_ENV
- ✅ **Consistent Setup**: Same process for all environments
- ✅ **Type Safety**: Helper functions for URL generation
