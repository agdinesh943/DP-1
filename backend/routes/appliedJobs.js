const express = require('express');
const router = express.Router();
const {
    getAppliedJobs,
    applyToJob,
    removeAppliedJob,
    updateAppliedJob,
    checkIfApplied,
    getAllApplicants,
    getUserProfiles,
    getUserApplications
} = require('../controllers/appliedJobController');
const { protect } = require('../middleware/auth');

// All applied job routes require authentication
router.use(protect);

// Get and manage applied jobs
router.get('/', getAppliedJobs);
router.post('/', applyToJob);
router.put('/:id', updateAppliedJob);
router.delete('/:id', removeAppliedJob);

// Check if a specific job is applied
router.get('/check/:jobId', checkIfApplied);

// Admin route to get all applicants
router.get('/admin/all', getAllApplicants);

// Admin route to get user profiles with application counts
router.get('/admin/user-profiles', getUserProfiles);

// Admin route to get applications by specific user
router.get('/admin/user/:userId', getUserApplications);

module.exports = router;
