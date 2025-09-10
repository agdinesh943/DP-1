const express = require('express');
const router = express.Router();
const certificationController = require('../controllers/certificationController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', certificationController.getAllCertifications);
router.get('/:id', certificationController.getCertificationById);

// Protected routes (require authentication)
router.post('/', protect, certificationController.createCertification);
router.put('/:id', protect, certificationController.updateCertification);
router.delete('/:id', protect, certificationController.deleteCertification);
router.get('/user/:userId', protect, certificationController.getCertificationsByUser);
router.patch('/:id/toggle-status', protect, certificationController.toggleCertificationStatus);

module.exports = router;
