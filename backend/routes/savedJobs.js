const express = require('express');
const router = express.Router();
const {
    getSavedJobs,
    saveJob,
    removeSavedJob,
    updateSavedJob,
    checkIfSaved
} = require('../controllers/savedJobController');
const { protect } = require('../middleware/auth');

// All saved job routes require authentication
router.use(protect);

// Get and manage saved jobs
router.get('/', getSavedJobs);
router.post('/', saveJob);
router.put('/:id', updateSavedJob);
router.delete('/:id', removeSavedJob);

// Check if a specific job is saved
router.get('/check/:jobId', checkIfSaved);

module.exports = router;
