const mongoose = require('mongoose');

const problemStatementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Problem title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Problem description is required'],
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    objectives: {
        type: String,
        required: [true, 'Objectives are required'],
        trim: true,
        maxlength: [1000, 'Objectives cannot exceed 1000 characters']
    },
    requirements: {
        type: String,
        required: [true, 'Requirements are required'],
        trim: true,
        maxlength: [1000, 'Requirements cannot exceed 1000 characters']
    },
    deadline: {
        type: Date,
        required: false // Optional as per requirements
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'completed'],
        default: 'active'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for better query performance
problemStatementSchema.index({ status: 1, createdAt: -1 });
problemStatementSchema.index({ createdBy: 1 });

// Virtual for checking if deadline has passed
problemStatementSchema.virtual('isExpired').get(function () {
    if (!this.deadline) return false;
    return new Date() > this.deadline;
});

// Virtual for days remaining
problemStatementSchema.virtual('daysRemaining').get(function () {
    if (!this.deadline) return null;
    const now = new Date();
    const diffTime = this.deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

// Ensure virtual fields are serialized
problemStatementSchema.set('toJSON', { virtuals: true });
problemStatementSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ProblemStatement', problemStatementSchema);
