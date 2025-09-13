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
        const { jobId, notes, priority } = req.body;

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
            notes,
            priority: priority || 'medium'
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
        const { notes, priority, applicationStatus } = req.body;

        const appliedJob = await AppliedJob.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            {
                notes,
                priority,
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

module.exports = {
    getAppliedJobs,
    applyToJob,
    removeAppliedJob,
    updateAppliedJob,
    checkIfApplied
};
