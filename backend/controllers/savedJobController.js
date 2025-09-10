const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');

// @desc    Get user's saved jobs
// @route   GET /api/saved-jobs
// @access  Private
const getSavedJobs = async (req, res) => {
  try {
    const savedJobs = await SavedJob.find({ user: req.user._id })
      .populate('job')
      .sort('-savedAt')
      .lean();

    res.json({
      success: true,
      data: savedJobs
    });

  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Save a job
// @route   POST /api/saved-jobs
// @access  Private
const saveJob = async (req, res) => {
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

    // Check if already saved
    const existingSavedJob = await SavedJob.findOne({
      user: req.user._id,
      job: jobId
    });

    if (existingSavedJob) {
      return res.status(400).json({
        success: false,
        error: 'Job is already saved'
      });
    }

    const savedJob = new SavedJob({
      user: req.user._id,
      job: jobId,
      notes,
      priority: priority || 'medium'
    });

    await savedJob.save();
    await savedJob.populate('job');

    res.status(201).json({
      success: true,
      message: 'Job saved successfully',
      data: savedJob
    });

  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Remove saved job
// @route   DELETE /api/saved-jobs/:id
// @access  Private
const removeSavedJob = async (req, res) => {
  try {
    const savedJob = await SavedJob.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!savedJob) {
      return res.status(404).json({
        success: false,
        error: 'Saved job not found'
      });
    }

    res.json({
      success: true,
      message: 'Job removed from saved list'
    });

  } catch (error) {
    console.error('Remove saved job error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update saved job
// @route   PUT /api/saved-jobs/:id
// @access  Private
const updateSavedJob = async (req, res) => {
  try {
    const { notes, priority, applied, applicationStatus } = req.body;

    const savedJob = await SavedJob.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        notes,
        priority,
        applied,
        applicationStatus,
        ...(applied && !savedJob?.appliedAt && { appliedAt: new Date() })
      },
      { new: true }
    ).populate('job');

    if (!savedJob) {
      return res.status(404).json({
        success: false,
        error: 'Saved job not found'
      });
    }

    res.json({
      success: true,
      message: 'Saved job updated successfully',
      data: savedJob
    });

  } catch (error) {
    console.error('Update saved job error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Check if job is saved
// @route   GET /api/saved-jobs/check/:jobId
// @access  Private
const checkIfSaved = async (req, res) => {
  try {
    const savedJob = await SavedJob.findOne({
      user: req.user._id,
      job: req.params.jobId
    });

    res.json({
      success: true,
      data: {
        isSaved: !!savedJob,
        savedJob: savedJob || null
      }
    });

  } catch (error) {
    console.error('Check if saved error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  getSavedJobs,
  saveJob,
  removeSavedJob,
  updateSavedJob,
  checkIfSaved
};
