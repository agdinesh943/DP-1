const express = require('express');
const { body } = require('express-validator');
const { sendContactMessage, testContactEndpoint } = require('../controllers/contactController');

const router = express.Router();

// Validation middleware for contact form
const contactValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),

    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('message')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Message must be between 10 and 1000 characters')
        .escape() // Prevent XSS attacks
];

// Test endpoint
router.get('/test', testContactEndpoint);

// Send contact message
router.post('/send', contactValidation, sendContactMessage);

module.exports = router;
