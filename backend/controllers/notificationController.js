const Notification = require('../models/Notification');

// @desc    Create a new notification
// @route   POST /api/notifications
// @access  Private
const createNotification = async (req, res) => {
  try {
    const { type, title, message, jobId, isImportant, actionUrl, actionText, metadata } = req.body;

    // Validate required fields
    if (!type || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Type, title, and message are required'
      });
    }

    // Validate notification type
    const validTypes = [
      'job_match',
      'new_posting',
      'application_update',
      'system',
      'profile_update',
      'deadline_reminder',
      'application_status'
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid notification type'
      });
    }

    const notification = new Notification({
      user: req.user._id,
      type,
      title,
      message,
      jobId,
      isImportant: isImportant || false,
      actionUrl,
      actionText,
      metadata: metadata || {}
    });

    await notification.save();

    // Populate job details if jobId is provided
    if (jobId) {
      await notification.populate('jobId', 'title company');
    }

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification
    });

  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      unreadOnly = false
    } = req.query;

    // Build query
    const query = { user: req.user._id };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const notifications = await Notification.find(query)
      .populate('jobId', 'title company')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete all notifications
// @route   DELETE /api/notifications
// @access  Private
const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });

    res.json({
      success: true,
      message: 'All notifications deleted successfully'
    });

  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get notification count
// @route   GET /api/notifications/count
// @access  Private
const getNotificationCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false
    });

    const totalCount = await Notification.countDocuments({
      user: req.user._id
    });

    res.json({
      success: true,
      data: {
        unread: unreadCount,
        total: totalCount
      }
    });

  } catch (error) {
    console.error('Get notification count error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationCount
};
