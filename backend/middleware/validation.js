const { body, validationResult } = require('express-validator');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};

// User registration validation
const validateUserRegistration = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('department')
        .isIn([
            'Computer Science', 'Information Technology', 'Electronics & Communication',
            'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering',
            'Chemical Engineering', 'Biotechnology', 'Business Administration',
            'Economics', 'Psychology', 'English Literature', 'Mathematics',
            'Physics', 'Chemistry', 'Biology', 'Other'
        ])
        .withMessage('Please select a valid department'),
    body('studentId')
        .optional()
        .isLength({ min: 3, max: 20 })
        .withMessage('Student ID must be between 3 and 20 characters'),
    body('facultyId')
        .optional()
        .isLength({ min: 3, max: 20 })
        .withMessage('Faculty ID must be between 3 and 20 characters'),
    body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number')
];

// Login validation
const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// OTP validation
const validateOTP = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('otp')
        .isLength({ min: 6, max: 6 })
        .isNumeric()
        .withMessage('OTP must be a 6-digit number')
];

// Password reset validation
const validatePasswordReset = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address')
];

const validateNewPassword = [
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Password confirmation does not match password');
            }
            return true;
        })
];

module.exports = {
    validateUserRegistration,
    validateLogin,
    validateOTP,
    validatePasswordReset,
    validateNewPassword,
    handleValidationErrors
};
