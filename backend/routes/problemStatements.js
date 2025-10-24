const express = require('express');
const router = express.Router();
const {
    createProblemStatement,
    getAllProblemStatements,
    getProblemStatement,
    updateProblemStatement,
    deleteProblemStatement,
    getAdminProblemStatements
} = require('../controllers/problemStatementController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllProblemStatements);
router.get('/:id', getProblemStatement);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), createProblemStatement);
router.put('/:id', protect, authorize('admin'), updateProblemStatement);
router.delete('/:id', protect, authorize('admin'), deleteProblemStatement);
router.get('/admin/all', protect, authorize('admin'), getAdminProblemStatements);

module.exports = router;
