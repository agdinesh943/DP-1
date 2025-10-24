const UserSettings = require('../models/UserSettings');
const User = require('../models/User');

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
const getUserSettings = async (req, res) => {
  try {
    let settings = await UserSettings.findOne({ user: req.user._id });
    
    if (!settings) {
      // Create default settings if none exist
      settings = new UserSettings({ user: req.user._id });
      await settings.save();
    }

    res.json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('Get user settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update user settings
// @route   PUT /api/settings
// @access  Private
const updateUserSettings = async (req, res) => {
  try {
    const { notifications, display, privacy, jobPreferences, emailPreferences } = req.body;

    let settings = await UserSettings.findOne({ user: req.user._id });
    
    if (!settings) {
      settings = new UserSettings({ user: req.user._id });
    }

    // Update only the fields that are provided
    if (notifications) {
      settings.notifications = { ...settings.notifications, ...notifications };
    }
    
    if (display) {
      settings.display = { ...settings.display, ...display };
    }
    
    if (privacy) {
      settings.privacy = { ...settings.privacy, ...privacy };
    }
    
    if (jobPreferences) {
      settings.jobPreferences = { ...settings.jobPreferences, ...jobPreferences };
    }
    
    if (emailPreferences) {
      settings.emailPreferences = { ...settings.emailPreferences, ...emailPreferences };
    }

    await settings.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });

  } catch (error) {
    console.error('Update user settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update specific setting section
// @route   PATCH /api/settings/:section
// @access  Private
const updateSettingSection = async (req, res) => {
  try {
    const { section } = req.params;
    const updateData = req.body;

    let settings = await UserSettings.findOne({ user: req.user._id });
    
    if (!settings) {
      settings = new UserSettings({ user: req.user._id });
    }

    // Validate section exists
    if (!settings.schema.paths[section]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid setting section'
      });
    }

    // Update the specific section
    settings[section] = { ...settings[section], ...updateData };
    await settings.save();

    res.json({
      success: true,
      message: `${section} settings updated successfully`,
      data: settings[section]
    });

  } catch (error) {
    console.error('Update setting section error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Reset user settings to defaults
// @route   POST /api/settings/reset
// @access  Private
const resetUserSettings = async (req, res) => {
  try {
    await UserSettings.findOneAndDelete({ user: req.user._id });
    
    // Create new default settings
    const settings = new UserSettings({ user: req.user._id });
    await settings.save();

    res.json({
      success: true,
      message: 'Settings reset to defaults successfully',
      data: settings
    });

  } catch (error) {
    console.error('Reset user settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get user profile settings (public info)
// @route   GET /api/settings/profile
// @access  Private
const getProfileSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('name email department role profilePicture phone');
    const settings = await UserSettings.findOne({ user: req.user._id }).select('privacy display');

    res.json({
      success: true,
      data: {
        user,
        settings: settings || {}
      }
    });

  } catch (error) {
    console.error('Get profile settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  getUserSettings,
  updateUserSettings,
  updateSettingSection,
  resetUserSettings,
  getProfileSettings
};
