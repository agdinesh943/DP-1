const mongoose = require('mongoose');

const appliedJobSchema = new mongoose.Schema({
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
    appliedAt: {
        type: Date,
        default: Date.now
    },
    applicationStatus: {
        type: String,
        enum: ['pending', 'submitted', 'reviewing', 'interviewed', 'accepted', 'rejected'],
        default: 'submitted'
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    }
}, {
    timestamps: true
});

// Compound index to ensure a user can only apply to a job once
appliedJobSchema.index({ user: 1, job: 1 }, { unique: true });

// Indexes for better query performance
appliedJobSchema.index({ user: 1, appliedAt: -1 });
appliedJobSchema.index({ user: 1, applicationStatus: 1 });
appliedJobSchema.index({ user: 1, priority: 1 });

module.exports = mongoose.model('AppliedJob', appliedJobSchema);
