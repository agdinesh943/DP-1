const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
  saveJob,
  unsaveJob,
  getSavedJobs
} = require('../controllers/jobController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Public routes (with optional auth for saved status)
router.get('/', optionalAuth, getJobs);
router.get('/:id', optionalAuth, getJob);

// Protected routes
router.use(protect);

// Student routes
router.post('/:id/save', authorize('student'), saveJob);
router.delete('/:id/save', authorize('student'), unsaveJob);
router.get('/saved/list', authorize('student'), getSavedJobs);

// Admin routes
router.post('/', authorize('admin'), createJob);
router.put('/:id', authorize('admin'), updateJob);
router.delete('/:id', authorize('admin'), deleteJob);
router.get('/admin/my-jobs', authorize('admin'), getMyJobs);

module.exports = router;
