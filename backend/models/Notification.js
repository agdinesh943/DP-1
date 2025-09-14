const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    type: {
        type: String,
        required: [true, 'Notification type is required'],
        enum: [
            'job_match',
            'new_posting',
            'application_update',
            'system',
            'profile_update',
            'deadline_reminder',
            'application_status'
        ]
    },
    title: {
        type: String,
        required: [true, 'Notification title is required'],
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    message: {
        type: String,
        required: [true, 'Notification message is required'],
        maxlength: [500, 'Message cannot exceed 500 characters']
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isImportant: {
        type: Boolean,
        default: false
    },
    actionUrl: {
        type: String,
        match: [/^https?:\/\/.+/, 'Please enter a valid URL']
    },
    actionText: {
        type: String,
        maxlength: [50, 'Action text cannot exceed 50 characters']
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ isImportant: 1 });

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function () {
    const now = new Date();
    const diffInMinutes = Math.floor((now - this.createdAt) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return this.createdAt.toLocaleDateString();
});

// Ensure virtuals are included in JSON output
notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Notification', notificationSchema);
