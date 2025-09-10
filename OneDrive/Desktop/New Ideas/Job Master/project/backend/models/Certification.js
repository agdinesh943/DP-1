const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Certification title is required'],
        trim: true,
        maxlength: [100, 'Certification title cannot exceed 100 characters']
    },
    provider: {
        type: String,
        required: [true, 'Provider/Organization is required'],
        trim: true,
        maxlength: [100, 'Provider cannot exceed 100 characters']
    },
    type: {
        type: String,
        required: [true, 'Certification type is required'],
        enum: ['technical', 'professional', 'academic', 'industry', 'skill-based']
    },
    duration: {
        type: String,
        trim: true,
        maxlength: [50, 'Duration cannot exceed 50 characters']
    },
    cost: {
        type: String,
        trim: true,
        maxlength: [100, 'Cost cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    applicationLink: {
        type: String,
        required: [true, 'Application link is required'],
        validate: {
            validator: function (v) {
                const urlRegex = /^https?:\/\/.+/;
                return urlRegex.test(v);
            },
            message: 'Please enter a valid URL'
        }
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Posted by user is required']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    },
    applications: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for better query performance
certificationSchema.index({ type: 1, isActive: 1 });
certificationSchema.index({ provider: 1 });
certificationSchema.index({ postedBy: 1 });

// Ensure virtual fields are serialized
certificationSchema.set('toJSON', { virtuals: true });
certificationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Certification', certificationSchema);
