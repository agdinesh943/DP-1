const mongoose = require('mongoose');

const savedJobSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: [true, 'Job is required']
    },
    savedAt: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    applied: {
        type: Boolean,
        default: false
    },
    appliedAt: {
        type: Date
    },
    applicationStatus: {
        type: String,
        enum: ['pending', 'submitted', 'reviewing', 'interviewed', 'accepted', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Compound index to ensure a user can only save a job once
savedJobSchema.index({ user: 1, job: 1 }, { unique: true });

// Indexes for better query performance
savedJobSchema.index({ user: 1, savedAt: -1 });
savedJobSchema.index({ user: 1, applied: 1 });
savedJobSchema.index({ user: 1, priority: 1 });

module.exports = mongoose.model('SavedJob', savedJobSchema);
