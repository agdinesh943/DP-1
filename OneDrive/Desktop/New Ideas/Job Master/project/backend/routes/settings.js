const express = require('express');
const router = express.Router();
const {
    getUserSettings,
    updateUserSettings,
    updateSettingSection,
    resetUserSettings,
    getProfileSettings
} = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

// All settings routes require authentication
router.use(protect);

// Get and update user settings
router.get('/', getUserSettings);
router.put('/', updateUserSettings);

// Update specific setting section
router.patch('/:section', updateSettingSection);

// Reset settings to defaults
router.post('/reset', resetUserSettings);

// Get profile settings
router.get('/profile', getProfileSettings);

module.exports = router;
