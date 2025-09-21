const { sendContactEmail } = require('../utils/emailService');
const { validationResult } = require('express-validator');

// Send contact form email
const sendContactMessage = async (req, res) => {
    try {
        console.log('📧 Contact form submission received:', {
            body: req.body,
            timestamp: new Date().toISOString()
        });

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ Validation errors:', errors.array());
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { name, email, message } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: 'Name, email, and message are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format',
                message: 'Please provide a valid email address'
            });
        }

        // Send contact email
        await sendContactEmail({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            message: message.trim()
        });

        console.log('✅ Contact email sent successfully');

        res.status(200).json({
            success: true,
            message: 'Your message has been sent successfully! We will get back to you soon.',
            data: {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Error sending contact email:', error);

        // Handle specific email errors
        if (error.message.includes('Email authentication failed')) {
            return res.status(500).json({
                success: false,
                error: 'Email service temporarily unavailable',
                message: 'Please try again later or contact us directly'
            });
        }

        if (error.message.includes('Email connection failed')) {
            return res.status(500).json({
                success: false,
                error: 'Email service temporarily unavailable',
                message: 'Please try again later or contact us directly'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to send message',
            message: 'An unexpected error occurred. Please try again later.'
        });
    }
};

// Test contact endpoint
const testContactEndpoint = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Contact endpoint is working',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error testing contact endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Contact endpoint test failed',
            message: error.message
        });
    }
};

module.exports = {
    sendContactMessage,
    testContactEndpoint
};
