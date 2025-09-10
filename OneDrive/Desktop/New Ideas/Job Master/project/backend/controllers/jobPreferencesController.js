const UserSettings = require('../models/UserSettings');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Job = require('../models/Job');

// @desc    Get user job preferences
// @route   GET /api/job-preferences
// @access  Private
const getJobPreferences = async (req, res) => {
    try {
        let settings = await UserSettings.findOne({ user: req.user._id });

        if (!settings) {
            // Create default settings if none exist
            settings = new UserSettings({ user: req.user._id });
            await settings.save();
        }

        res.json({
            success: true,
            data: {
                jobPreferences: settings.jobPreferences || {
                    preferredJobTypes: [],
                    preferredJobTitles: [],
                    preferredLocations: [],
                    remotePreference: 'any',
                    salaryRange: { min: 0, max: 0, currency: 'USD' },
                    skillPreferences: []
                },
                notifications: settings.notifications || {
                    email: { newPostings: true },
                    push: { newPostings: true }
                }
            }
        });

    } catch (error) {
        console.error('Get job preferences error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Update user job preferences
// @route   PUT /api/job-preferences
// @access  Private
const updateJobPreferences = async (req, res) => {
    try {
        const {
            preferredJobTypes,
            preferredJobTitles,
            preferredLocations,
            remotePreference,
            salaryRange,
            skillPreferences,
            notifications
        } = req.body;

        // Validate required fields
        if (!preferredJobTitles || preferredJobTitles.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'At least one preferred job title is required to receive notifications'
            });
        }

        let settings = await UserSettings.findOne({ user: req.user._id });

        if (!settings) {
            settings = new UserSettings({ user: req.user._id });
        }

        // Update job preferences
        settings.jobPreferences = {
            preferredJobTypes: preferredJobTypes || [],
            preferredJobTitles: preferredJobTitles || [],
            preferredLocations: preferredLocations || [],
            remotePreference: remotePreference || 'any',
            salaryRange: salaryRange || { min: 0, max: 0, currency: 'USD' },
            skillPreferences: skillPreferences || []
        };

        // Update notification preferences if provided
        if (notifications) {
            settings.notifications = {
                ...settings.notifications,
                ...notifications
            };
        }

        await settings.save();

        res.json({
            success: true,
            message: 'Job preferences updated successfully',
            data: {
                jobPreferences: settings.jobPreferences,
                notifications: settings.notifications
            }
        });

    } catch (error) {
        console.error('Update job preferences error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Test job preferences matching
// @route   POST /api/job-preferences/test-match
// @access  Private
const testJobMatch = async (req, res) => {
    try {
        const { jobTitle, jobType, location, skills } = req.body;

        if (!jobTitle) {
            return res.status(400).json({
                success: false,
                error: 'Job title is required for testing'
            });
        }

        const settings = await UserSettings.findOne({ user: req.user._id });

        if (!settings || !settings.jobPreferences) {
            return res.json({
                success: true,
                data: {
                    matches: false,
                    reason: 'No job preferences set'
                }
            });
        }

        const { jobPreferences } = settings;
        const matches = {
            titleMatch: false,
            typeMatch: false,
            locationMatch: false,
            skillsMatch: false,
            overallMatch: false
        };

        // Check title match
        if (jobPreferences.preferredJobTitles && jobPreferences.preferredJobTitles.length > 0) {
            const jobTitleLower = jobTitle.toLowerCase();
            matches.titleMatch = jobPreferences.preferredJobTitles.some(preferred => {
                const preferredLower = preferred.toLowerCase();
                return jobTitleLower.includes(preferredLower) || preferredLower.includes(jobTitleLower);
            });
        }

        // Check type match
        if (jobPreferences.preferredJobTypes && jobPreferences.preferredJobTypes.length > 0) {
            matches.typeMatch = jobPreferences.preferredJobTypes.includes(jobType);
        }

        // Check location match
        if (jobPreferences.preferredLocations && jobPreferences.preferredLocations.length > 0) {
            const jobLocationLower = (location || '').toLowerCase();
            matches.locationMatch = jobPreferences.preferredLocations.some(preferred => {
                const preferredLower = preferred.toLowerCase();
                return jobLocationLower.includes(preferredLower) || preferredLower.includes(jobLocationLower);
            });
        }

        // Check skills match
        if (jobPreferences.skillPreferences && jobPreferences.skillPreferences.length > 0 && skills) {
            const jobSkillsLower = skills.map(s => s.toLowerCase());
            matches.skillsMatch = jobPreferences.skillPreferences.some(preferred => {
                const preferredLower = preferred.toLowerCase();
                return jobSkillsLower.some(skill =>
                    skill.includes(preferredLower) || preferredLower.includes(skill)
                );
            });
        }

        // Overall match (at least title must match)
        matches.overallMatch = matches.titleMatch;

        res.json({
            success: true,
            data: {
                matches,
                jobPreferences: settings.jobPreferences,
                testJob: { jobTitle, jobType, location, skills }
            }
        });

    } catch (error) {
        console.error('Test job match error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Get notification statistics
// @route   GET /api/job-preferences/notification-stats
// @access  Private
const getNotificationStats = async (req, res) => {
    try {
        const settings = await UserSettings.findOne({ user: req.user._id });

        if (!settings) {
            return res.json({
                success: true,
                data: {
                    totalNotifications: 0,
                    unreadNotifications: 0,
                    jobMatchNotifications: 0,
                    preferencesSet: false
                }
            });
        }

        const totalNotifications = await Notification.countDocuments({ user: req.user._id });
        const unreadNotifications = await Notification.countDocuments({
            user: req.user._id,
            isRead: false
        });
        const jobMatchNotifications = await Notification.countDocuments({
            user: req.user._id,
            type: { $in: ['job_match', 'new_posting'] }
        });

        res.json({
            success: true,
            data: {
                totalNotifications,
                unreadNotifications,
                jobMatchNotifications,
                preferencesSet: !!(settings.jobPreferences?.preferredJobTitles?.length > 0),
                lastUpdated: settings.updatedAt
            }
        });

    } catch (error) {
        console.error('Get notification stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

module.exports = {
    getJobPreferences,
    updateJobPreferences,
    testJobMatch,
    getNotificationStats
};
