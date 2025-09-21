const Job = require('../models/Job');
const SavedJob = require('../models/SavedJob');
const Notification = require('../models/Notification');
const User = require('../models/User');
const UserSettings = require('../models/UserSettings'); // Added UserSettings import

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      location,
      category,
      remote,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query = { isActive: true };

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    if (type) query.type = type;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (category) query.category = category;
    if (remote !== undefined) query.remote = remote === 'true';

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const jobs = await Job.find(query)
      .populate('postedBy', 'name department')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await Job.countDocuments(query);

    // Add saved status for authenticated users
    if (req.user) {
      const savedJobIds = await SavedJob.find({ user: req.user._id })
        .distinct('job');

      jobs.forEach(job => {
        job.isSaved = savedJobIds.includes(job._id.toString());
      });
    }

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name department')
      .lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Increment views
    await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    // Add saved status for authenticated users
    if (req.user) {
      const savedJob = await SavedJob.findOne({
        user: req.user._id,
        job: req.params.id
      });
      job.isSaved = !!savedJob;
    }

    res.json({
      success: true,
      data: job
    });

  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Create job (Admin only)
// @route   POST /api/jobs
// @access  Private (Admin)
const createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      type,
      remote,
      skills,
      deadline,
      applyLink,
      description,
      requirements,
      benefits,
      salary,
      experience,
      tags,
      category
    } = req.body;

    const job = await Job.create({
      title,
      company,
      location,
      type,
      remote: remote || false,
      skills: Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()),
      deadline,
      applyLink,
      description,
      requirements,
      benefits,
      salary,
      experience,
      tags: Array.isArray(tags) ? tags : tags ? tags.split(',').map(s => s.trim()) : [],
      category,
      postedBy: req.user._id
    });

    // Create enhanced notifications for students based on their preferences
    const { createJobNotifications, sendNotifications } = require('../utils/notificationMatcher');

    const notifications = await createJobNotifications(job);
    const sentCount = await sendNotifications(notifications);

    console.log(`📊 Job "${job.title}" created with ${sentCount} notifications sent`);

    const populatedJob = await Job.findById(job._id)
      .populate('postedBy', 'name department');

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      data: populatedJob
    });

  } catch (error) {
    console.error('Create job error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: errors.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update job (Admin only)
// @route   PUT /api/jobs/:id
// @access  Private (Admin)
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Check if user is the one who posted the job
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this job'
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('postedBy', 'name department');

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: updatedJob
    });

  } catch (error) {
    console.error('Update job error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: errors.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete job (Admin only)
// @route   DELETE /api/jobs/:id
// @access  Private (Admin)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Check if user is the one who posted the job
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this job'
      });
    }

    // Delete related saved jobs
    await SavedJob.deleteMany({ job: req.params.id });

    // Delete related notifications
    await Notification.deleteMany({ jobId: req.params.id });

    // Delete the job
    await Job.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });

  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get jobs by admin
// @route   GET /api/jobs/admin/my-jobs
// @access  Private (Admin)
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id })
      .sort('-createdAt')
      .lean();

    res.json({
      success: true,
      data: jobs
    });

  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Save job (Student only)
// @route   POST /api/jobs/:id/save
// @access  Private (Student)
const saveJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user._id;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Check if already saved
    const existingSave = await SavedJob.findOne({ user: userId, job: jobId });
    if (existingSave) {
      return res.status(400).json({
        success: false,
        error: 'Job already saved'
      });
    }

    // Save job
    await SavedJob.create({
      user: userId,
      job: jobId
    });

    res.json({
      success: true,
      message: 'Job saved successfully'
    });

  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Unsave job (Student only)
// @route   DELETE /api/jobs/:id/save
// @access  Private (Student)
const unsaveJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user._id;

    const savedJob = await SavedJob.findOneAndDelete({ user: userId, job: jobId });

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
    console.error('Unsave job error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get saved jobs (Student only)
// @route   GET /api/jobs/saved
// @access  Private (Student)
const getSavedJobs = async (req, res) => {
  try {
    const savedJobs = await SavedJob.find({ user: req.user._id })
      .populate({
        path: 'job',
        populate: { path: 'postedBy', select: 'name department' }
      })
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

module.exports = {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
  saveJob,
  unsaveJob,
  getSavedJobs
};
