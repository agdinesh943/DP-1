const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    unique: true
  },
  notifications: {
    email: {
      jobMatches: { type: Boolean, default: true },
      newPostings: { type: Boolean, default: true },
      applicationUpdates: { type: Boolean, default: true },
      systemAnnouncements: { type: Boolean, default: true },
      deadlineReminders: { type: Boolean, default: true }
    },
    push: {
      jobMatches: { type: Boolean, default: true },
      newPostings: { type: Boolean, default: true },
      applicationUpdates: { type: Boolean, default: true },
      systemAnnouncements: { type: Boolean, default: true },
      deadlineReminders: { type: Boolean, default: true }
    },
    frequency: {
      type: String,
      enum: ['immediate', 'daily', 'weekly'],
      default: 'immediate'
    }
  },
  display: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY'
    }
  },
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'private', 'connections'],
      default: 'public'
    },
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false },
    allowMessages: { type: Boolean, default: true }
  },
  jobPreferences: {
    preferredJobTypes: [{
      type: String,
      enum: ['Full-time', 'Internship', 'Part-time']
    }],
    preferredJobTitles: [String], // Array of preferred job titles/keywords
    preferredLocations: [String],
    remotePreference: {
      type: String,
      enum: ['remote', 'onsite', 'hybrid', 'any'],
      default: 'any'
    },
    salaryRange: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'USD' }
    },
    skillPreferences: [String]
  },
  emailPreferences: {
    marketing: { type: Boolean, default: false },
    newsletter: { type: Boolean, default: true },
    partnerOffers: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
userSettingsSchema.index({ user: 1 });

// Ensure virtuals are included in JSON output
userSettingsSchema.set('toJSON', { virtuals: true });
userSettingsSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('UserSettings', userSettingsSchema);
