const UserSettings = require('../models/UserSettings');
const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * Enhanced job matching algorithm for notifications
 * @param {Object} job - The job object
 * @returns {Array} Array of notifications to be created
 */
const createJobNotifications = async (job) => {
    try {
        console.log('🔔 Creating notifications for job:', job.title);

        // Get all active students
        const students = await User.find({ role: 'student', isActive: true });

        if (students.length === 0) {
            console.log('📭 No active students found');
            return [];
        }

        // Get all user settings for students
        const userSettings = await UserSettings.find({
            user: { $in: students.map(s => s._id) }
        });

        const notifications = [];
        const jobData = {
            title: job.title.toLowerCase(),
            type: job.type,
            location: (job.location || '').toLowerCase(),
            skills: (job.skills || []).map(s => s.toLowerCase()),
            company: job.company,
            category: job.category
        };

        console.log(`👥 Checking ${students.length} students for job matches`);

        for (const student of students) {
            const studentSettings = userSettings.find(s =>
                s.user.toString() === student._id.toString()
            );

            if (!studentSettings) {
                console.log(`⚠️  No settings found for student: ${student.email}`);
                continue;
            }

            // Check if student wants new posting notifications
            const wantsNotifications = (
                studentSettings.notifications?.email?.newPostings ||
                studentSettings.notifications?.push?.newPostings
            );

            if (!wantsNotifications) {
                console.log(`🔕 Student ${student.email} has notifications disabled`);
                continue;
            }

            // Check if student has job preferences set
            const jobPreferences = studentSettings.jobPreferences;
            if (!jobPreferences || !jobPreferences.preferredJobTitles ||
                jobPreferences.preferredJobTitles.length === 0) {
                console.log(`📝 Student ${student.email} has no job preferences set`);
                continue;
            }

            // Enhanced matching logic
            const matchResult = checkJobMatch(jobData, jobPreferences);

            if (matchResult.shouldNotify) {
                const notification = {
                    user: student._id,
                    type: 'new_posting',
                    title: '🎯 New Job Match!',
                    message: createNotificationMessage(job, matchResult),
                    jobId: job._id,
                    actionUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/jobs/${job._id}`,
                    actionText: 'View Job',
                    isImportant: matchResult.matchScore >= 3, // High match score = important
                    metadata: {
                        matchScore: matchResult.matchScore,
                        matchReasons: matchResult.matchReasons,
                        jobTitle: job.title,
                        company: job.company
                    }
                };

                notifications.push(notification);
                console.log(`✅ Match found for ${student.email}: ${matchResult.matchReasons.join(', ')}`);
            } else {
                console.log(`❌ No match for ${student.email}: ${matchResult.reason}`);
            }
        }

        console.log(`📊 Created ${notifications.length} notifications for ${job.title}`);
        return notifications;

    } catch (error) {
        console.error('❌ Error creating job notifications:', error);
        return [];
    }
};

/**
 * Check if a job matches student preferences
 * @param {Object} jobData - Processed job data
 * @param {Object} jobPreferences - Student's job preferences
 * @returns {Object} Match result with score and reasons
 */
const checkJobMatch = (jobData, jobPreferences) => {
    const matchReasons = [];
    let matchScore = 0;

    // Title matching (most important - 3 points)
    if (jobPreferences.preferredJobTitles && jobPreferences.preferredJobTitles.length > 0) {
        const titleMatch = jobPreferences.preferredJobTitles.some(preferred => {
            const preferredLower = preferred.toLowerCase();
            return jobData.title.includes(preferredLower) ||
                preferredLower.includes(jobData.title) ||
                // Check for partial word matches
                jobData.title.split(' ').some(word =>
                    preferredLower.split(' ').some(prefWord =>
                        word.includes(prefWord) || prefWord.includes(word)
                    )
                );
        });

        if (titleMatch) {
            matchReasons.push('Job title matches your preferences');
            matchScore += 3;
        }
    }

    // Job type matching (2 points)
    if (jobPreferences.preferredJobTypes && jobPreferences.preferredJobTypes.length > 0) {
        if (jobPreferences.preferredJobTypes.includes(jobData.type)) {
            matchReasons.push('Job type matches your preferences');
            matchScore += 2;
        }
    }

    // Location matching (2 points)
    if (jobPreferences.preferredLocations && jobPreferences.preferredLocations.length > 0) {
        const locationMatch = jobPreferences.preferredLocations.some(preferred => {
            const preferredLower = preferred.toLowerCase();
            return jobData.location.includes(preferredLower) ||
                preferredLower.includes(jobData.location);
        });

        if (locationMatch) {
            matchReasons.push('Location matches your preferences');
            matchScore += 2;
        }
    }

    // Skills matching (1 point per skill match)
    if (jobPreferences.skillPreferences && jobPreferences.skillPreferences.length > 0 && jobData.skills) {
        const skillMatches = jobPreferences.skillPreferences.filter(preferred => {
            const preferredLower = preferred.toLowerCase();
            return jobData.skills.some(skill =>
                skill.includes(preferredLower) || preferredLower.includes(skill)
            );
        });

        if (skillMatches.length > 0) {
            matchReasons.push(`Skills match: ${skillMatches.join(', ')}`);
            matchScore += skillMatches.length;
        }
    }

    // Remote preference matching (1 point)
    if (jobPreferences.remotePreference && jobPreferences.remotePreference !== 'any') {
        const jobIsRemote = jobData.location.toLowerCase().includes('remote') ||
            jobData.location.toLowerCase().includes('work from home');

        if ((jobPreferences.remotePreference === 'remote' && jobIsRemote) ||
            (jobPreferences.remotePreference === 'onsite' && !jobIsRemote) ||
            (jobPreferences.remotePreference === 'hybrid' && jobData.location.toLowerCase().includes('hybrid'))) {
            matchReasons.push('Remote preference matches');
            matchScore += 1;
        }
    }

    // Determine if should notify (at least title must match)
    const shouldNotify = matchScore >= 3; // Minimum 3 points (title match)

    return {
        shouldNotify,
        matchScore,
        matchReasons,
        reason: shouldNotify ? 'Job matches your preferences' : 'Job does not match your preferences'
    };
};

/**
 * Create personalized notification message
 * @param {Object} job - Job object
 * @param {Object} matchResult - Match result
 * @returns {String} Notification message
 */
const createNotificationMessage = (job, matchResult) => {
    const { company, type, title } = job;
    const { matchReasons } = matchResult;

    let message = `A new ${type} position at ${company} matches your preferences!`;

    if (matchReasons.length > 1) {
        message += ` (${matchReasons.slice(0, 2).join(', ')})`;
    }

    return message;
};

/**
 * Send notifications to students
 * @param {Array} notifications - Array of notification objects
 * @returns {Number} Number of notifications created
 */
const sendNotifications = async (notifications) => {
    try {
        if (notifications.length === 0) {
            return 0;
        }

        const result = await Notification.insertMany(notifications);
        console.log(`📨 Sent ${result.length} notifications`);
        return result.length;

    } catch (error) {
        console.error('❌ Error sending notifications:', error);
        return 0;
    }
};

module.exports = {
    createJobNotifications,
    checkJobMatch,
    createNotificationMessage,
    sendNotifications
};

