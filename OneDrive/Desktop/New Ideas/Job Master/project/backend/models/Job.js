const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Job location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Job type is required'],
    enum: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance']
  },
  remote: {
    type: Boolean,
    default: false
  },
  skills: [{
    type: String,
    trim: true,
    maxlength: [50, 'Skill name cannot exceed 50 characters']
  }],
  deadline: {
    type: Date,
    required: [true, 'Application deadline is required']
  },
  applyLink: {
    type: String,
    required: [true, 'Application link is required'],
    validate: {
      validator: function (v) {
        // Allow URLs, email addresses, and phone numbers
        const urlRegex = /^https?:\/\/.+/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;

        return urlRegex.test(v) || emailRegex.test(v) || phoneRegex.test(v);
      },
      message: 'Please enter a valid URL, email address, or phone number'
    }
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  requirements: {
    type: String,
    maxlength: [1000, 'Requirements cannot exceed 1000 characters']
  },
  benefits: {
    type: String,
    maxlength: [500, 'Benefits cannot exceed 500 characters']
  },
  salary: {
    min: {
      type: Number,
      min: [0, 'Minimum salary cannot be negative']
    },
    max: {
      type: Number,
      min: [0, 'Maximum salary cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
    },
    period: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly']
    }
  },
  experience: {
    type: String,
    enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Executive']
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
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  category: {
    type: String,
    enum: [
      'Software Development',
      'Data Science',
      'Design',
      'Marketing',
      'Sales',
      'Customer Service',
      'Finance',
      'Human Resources',
      'Operations',
      'Research',
      'Education',
      'Healthcare',
      'Other'
    ]
  }
}, {
  timestamps: true
});

// Indexes for better query performance
jobSchema.index({ title: 'text', company: 'text', description: 'text' });
jobSchema.index({ type: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ isActive: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ deadline: 1 });
jobSchema.index({ createdAt: -1 });

// Virtual for checking if job is expired
jobSchema.virtual('isExpired').get(function () {
  return new Date() > this.deadline;
});

// Virtual for formatted salary range
jobSchema.virtual('salaryRange').get(function () {
  if (!this.salary || !this.salary.min) return null;

  const min = this.salary.min.toLocaleString();
  const max = this.salary.max ? this.salary.max.toLocaleString() : null;
  const currency = this.salary.currency || 'USD';
  const period = this.salary.period || 'yearly';

  if (max) {
    return `${currency} ${min} - ${max} ${period}`;
  }
  return `${currency} ${min}+ ${period}`;
});

// Ensure virtuals are included in JSON output
jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Job', jobSchema);
