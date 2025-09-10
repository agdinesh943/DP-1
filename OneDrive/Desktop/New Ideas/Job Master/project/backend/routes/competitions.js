const express = require('express');
const router = express.Router();
const competitionController = require('../controllers/competitionController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', competitionController.getAllCompetitions);
router.get('/:id', competitionController.getCompetitionById);

// Protected routes (require authentication)
router.post('/', protect, competitionController.createCompetition);
router.put('/:id', protect, competitionController.updateCompetition);
router.delete('/:id', protect, competitionController.deleteCompetition);
router.get('/user/:userId', protect, competitionController.getCompetitionsByUser);
router.patch('/:id/toggle-status', protect, competitionController.toggleCompetitionStatus);

module.exports = router;
