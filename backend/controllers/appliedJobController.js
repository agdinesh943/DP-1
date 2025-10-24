const AppliedJob = require('../models/AppliedJob');
const Job = require('../models/Job');

// @desc    Get user's applied jobs
// @route   GET /api/applied-jobs
// @access  Private
const getAppliedJobs = async (req, res) => {
    try {
        const appliedJobs = await AppliedJob.find({ user: req.user._id })
            .populate('job')
            .sort('-appliedAt')
            .lean();

        res.json({
            success: true,
            data: appliedJobs
        });

    } catch (error) {
        console.error('Get applied jobs error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Apply to a job
// @route   POST /api/applied-jobs
// @access  Private
const applyToJob = async (req, res) => {
    try {
        const { jobId, notes } = req.body;

        if (!jobId) {
            return res.status(400).json({
                success: false,
                error: 'Job ID is required'
            });
        }

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        // Check if already applied
        const existingAppliedJob = await AppliedJob.findOne({
            user: req.user._id,
            job: jobId
        });

        if (existingAppliedJob) {
            return res.status(400).json({
                success: false,
                error: 'You have already applied to this job'
            });
        }

        const appliedJob = new AppliedJob({
            user: req.user._id,
            job: jobId,
            notes
        });

        await appliedJob.save();
        await appliedJob.populate('job');

        res.status(201).json({
            success: true,
            message: 'Job application submitted successfully',
            data: appliedJob
        });

    } catch (error) {
        console.error('Apply to job error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Remove applied job
// @route   DELETE /api/applied-jobs/:id
// @access  Private
const removeAppliedJob = async (req, res) => {
    try {
        const appliedJob = await AppliedJob.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!appliedJob) {
            return res.status(404).json({
                success: false,
                error: 'Applied job not found'
            });
        }

        res.json({
            success: true,
            message: 'Job application removed successfully'
        });

    } catch (error) {
        console.error('Remove applied job error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Update applied job
// @route   PUT /api/applied-jobs/:id
// @access  Private
const updateAppliedJob = async (req, res) => {
    try {
        const { notes, applicationStatus } = req.body;

        const appliedJob = await AppliedJob.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            {
                notes,
                applicationStatus
            },
            { new: true }
        ).populate('job');

        if (!appliedJob) {
            return res.status(404).json({
                success: false,
                error: 'Applied job not found'
            });
        }

        res.json({
            success: true,
            message: 'Applied job updated successfully',
            data: appliedJob
        });

    } catch (error) {
        console.error('Update applied job error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Check if job is applied
// @route   GET /api/applied-jobs/check/:jobId
// @access  Private
const checkIfApplied = async (req, res) => {
    try {
        const appliedJob = await AppliedJob.findOne({
            user: req.user._id,
            job: req.params.jobId
        });

        res.json({
            success: true,
            data: {
                isApplied: !!appliedJob,
                appliedJob: appliedJob || null
            }
        });

    } catch (error) {
        console.error('Check if applied error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Get all applicants for admin dashboard
// @route   GET /api/applied-jobs/admin/all
// @access  Private (Admin only)
const getAllApplicants = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Admin role required.'
            });
        }

        const appliedJobs = await AppliedJob.find()
            .populate('user', 'name email studentId department')
            .populate('job', 'title company location type deadline')
            .sort('-appliedAt')
            .lean();

        // Filter out applicants with missing user ID, name, or job data
        const validApplicants = appliedJobs.filter(applicant => {
            // Check if user data exists and is valid
            const hasValidUser = applicant.user &&
                applicant.user._id &&
                applicant.user.name &&
                typeof applicant.user.name === 'string' &&
                applicant.user.name.trim() !== '';

            // Check if job data exists and is valid
            const hasValidJob = applicant.job &&
                applicant.job._id &&
                applicant.job.title &&
                typeof applicant.job.title === 'string' &&
                applicant.job.title.trim() !== '';

            // Log invalid records for debugging
            if (!hasValidUser) {
                console.log('❌ Invalid user data:', {
                    hasUser: !!applicant.user,
                    hasUserId: !!(applicant.user && applicant.user._id),
                    hasUserName: !!(applicant.user && applicant.user.name),
                    userName: applicant.user?.name,
                    applicantId: applicant._id
                });
            }

            if (!hasValidJob) {
                console.log('❌ Invalid job data:', {
                    hasJob: !!applicant.job,
                    hasJobId: !!(applicant.job && applicant.job._id),
                    hasJobTitle: !!(applicant.job && applicant.job.title),
                    jobTitle: applicant.job?.title,
                    applicantId: applicant._id
                });
            }

            return hasValidUser && hasValidJob;
        });

        console.log(`📊 Filtered applicants: ${validApplicants.length} valid out of ${appliedJobs.length} total`);

        // Log sample of valid applicants for debugging
        if (validApplicants.length > 0) {
            console.log('✅ Sample valid applicant:', {
                userId: validApplicants[0].user?._id,
                userName: validApplicants[0].user?.name,
                jobId: validApplicants[0].job?._id,
                jobTitle: validApplicants[0].job?.title
            });
        }

        res.json({
            success: true,
            data: validApplicants
        });

    } catch (error) {
        console.error('Get all applicants error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Get user profiles with application counts for admin dashboard
// @route   GET /api/applied-jobs/admin/user-profiles
// @access  Private (Admin only)
const getUserProfiles = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Admin role required.'
            });
        }

        // Get all applied jobs with user and job data
        const appliedJobs = await AppliedJob.find()
            .populate('user', 'name email studentId department')
            .populate('job', 'title company location type deadline')
            .sort('-appliedAt')
            .lean();

        // Filter valid applicants
        const validApplicants = appliedJobs.filter(applicant => {
            const hasValidUser = applicant.user &&
                applicant.user._id &&
                applicant.user.name &&
                typeof applicant.user.name === 'string' &&
                applicant.user.name.trim() !== '';

            const hasValidJob = applicant.job &&
                applicant.job._id &&
                applicant.job.title &&
                typeof applicant.job.title === 'string' &&
                applicant.job.title.trim() !== '';

            return hasValidUser && hasValidJob;
        });

        // Group by user and count applications
        const userProfiles = {};
        validApplicants.forEach(applicant => {
            const userId = applicant.user._id.toString();
            if (!userProfiles[userId]) {
                userProfiles[userId] = {
                    _id: applicant.user._id,
                    name: applicant.user.name,
                    email: applicant.user.email,
                    studentId: applicant.user.studentId,
                    department: applicant.user.department,
                    applicationCount: 0,
                    applications: []
                };
            }
            userProfiles[userId].applicationCount++;
            userProfiles[userId].applications.push(applicant);
        });

        // Convert to array and sort by application count (descending)
        const profilesArray = Object.values(userProfiles).sort((a, b) => b.applicationCount - a.applicationCount);

        console.log(`📊 User profiles: ${profilesArray.length} users with ${validApplicants.length} total applications`);

        res.json({
            success: true,
            data: profilesArray
        });

    } catch (error) {
        console.error('Get user profiles error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Get applications by specific user for admin dashboard
// @route   GET /api/applied-jobs/admin/user/:userId
// @access  Private (Admin only)
const getUserApplications = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Admin role required.'
            });
        }

        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        const appliedJobs = await AppliedJob.find({ user: userId })
            .populate('user', 'name email studentId department')
            .populate('job', 'title company location type deadline')
            .sort('-appliedAt')
            .lean();

        // Filter valid applications
        const validApplications = appliedJobs.filter(applicant => {
            const hasValidUser = applicant.user &&
                applicant.user._id &&
                applicant.user.name &&
                typeof applicant.user.name === 'string' &&
                applicant.user.name.trim() !== '';

            const hasValidJob = applicant.job &&
                applicant.job._id &&
                applicant.job.title &&
                typeof applicant.job.title === 'string' &&
                applicant.job.title.trim() !== '';

            return hasValidUser && hasValidJob;
        });

        console.log(`📊 User applications for ${userId}: ${validApplications.length} applications`);

        res.json({
            success: true,
            data: validApplications
        });

    } catch (error) {
        console.error('Get user applications error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

module.exports = {
    getAppliedJobs,
    applyToJob,
    removeAppliedJob,
    updateAppliedJob,
    checkIfApplied,
    getAllApplicants,
    getUserProfiles,
    getUserApplications
};
