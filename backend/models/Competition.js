const mongoose = require('mongoose');

const competitionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Competition title is required'],
        trim: true,
        maxlength: [100, 'Competition title cannot exceed 100 characters']
    },
    type: {
        type: String,
        required: [true, 'Competition type is required'],
        enum: ['hackathon', 'ideathon', 'competition']
    },
    organizingBy: {
        type: String,
        required: [true, 'Organizing by is required'],
        trim: true,
        maxlength: [100, 'Organizing by cannot exceed 100 characters']
    },
    deadline: {
        type: Date,
        required: [true, 'Deadline is required']
    },
    maxParticipants: {
        type: String,
        trim: true,
        maxlength: [20, 'Max participants cannot exceed 20 characters']
    },
    prizePool: {
        type: String,
        trim: true,
        maxlength: [100, 'Prize pool cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Competition description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    registrationLink: {
        type: String,
        required: [true, 'Registration link is required'],
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
    registrations: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for better query performance
competitionSchema.index({ type: 1, isActive: 1 });
competitionSchema.index({ deadline: 1 });
competitionSchema.index({ postedBy: 1 });

// Virtual for checking if competition is still open
competitionSchema.virtual('isOpen').get(function () {
    return new Date() < this.deadline;
});

// Ensure virtual fields are serialized
competitionSchema.set('toJSON', { virtuals: true });
competitionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Competition', competitionSchema);
