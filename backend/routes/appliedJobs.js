const express = require('express');
const router = express.Router();
const {
    getAppliedJobs,
    applyToJob,
    removeAppliedJob,
    updateAppliedJob,
    checkIfApplied
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

module.exports = router;
