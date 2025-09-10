const express = require('express');
const router = express.Router();
const {
    getJobPreferences,
    updateJobPreferences,
    testJobMatch,
    getNotificationStats
} = require('../controllers/jobPreferencesController');
const { protect } = require('../middleware/auth');

// All job preferences routes require authentication
router.use(protect);

// Job preferences routes
router.get('/', getJobPreferences);
router.put('/', updateJobPreferences);
router.post('/test-match', testJobMatch);
router.get('/notification-stats', getNotificationStats);

module.exports = router;

