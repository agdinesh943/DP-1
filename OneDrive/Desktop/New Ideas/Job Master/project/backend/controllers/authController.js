const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendPasswordResetEmail, sendPasswordResetSuccessEmail } = require('../utils/emailService');

// Generate JWT Token
const generateToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
        // { expiresIn: '30d' }
    );
};

// @desc    Register student
// @route   POST /api/auth/student/register
// @access  Public
const registerStudent = async (req, res) => {
    try {
        const { name, email, password, department, studentId } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Email already registered'
            });
        }

        // Check if student ID already exists
        const existingStudentId = await User.findOne({ studentId });
        if (existingStudentId) {
            return res.status(400).json({
                success: false,
                error: 'Student ID already registered'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            department,
            studentId,
            role: 'student'
        });

        // Generate token
        const token = generateToken(user._id, user.role);

        // Create welcome notification
        await Notification.create({
            user: user._id,
            type: 'system',
            title: 'Welcome to Job Master!',
            message: 'Your account has been created successfully. Start exploring job opportunities!',
            isImportant: true
        });

        res.status(201).json({
            success: true,
            message: 'Student registered successfully',
            user,
            token
        });

    } catch (error) {
        console.error('Student registration error:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: errors.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Register admin
// @route   POST /api/auth/admin/register
// @access  Public
const registerAdmin = async (req, res) => {
    try {
        const { name, email, password, department, facultyId, adminCode } = req.body;

        // Validate admin code
        const validAdminCodes = ['ADMIN2024', 'FACULTY2024', 'MASTER2024'];
        if (!validAdminCodes.includes(adminCode)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid admin authorization code'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Email already registered'
            });
        }

        // Check if faculty ID already exists
        const existingFacultyId = await User.findOne({ facultyId });
        if (existingFacultyId) {
            return res.status(400).json({
                success: false,
                error: 'Faculty ID already registered'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            department,
            facultyId,
            role: 'admin'
        });

        // Generate token
        const token = generateToken(user._id, user.role);

        // Create welcome notification
        await Notification.create({
            user: user._id,
            type: 'system',
            title: 'Welcome to Job Master Admin!',
            message: 'Your admin account has been created successfully. You can now post and manage job opportunities.',
            isImportant: true
        });

        res.status(201).json({
            success: true,
            message: 'Admin registered successfully',
            user,
            token
        });

    } catch (error) {
        console.error('Admin registration error:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: errors.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Account is deactivated'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id, user.role);

        res.json({
            success: true,
            message: 'Login successful',
            user,
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        res.json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const { name, phone, department, profilePicture } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Update fields
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (department) user.department = department;
        if (profilePicture) user.profilePicture = profilePicture;

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user
        });

    } catch (error) {
        console.error('Update profile error:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: errors.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Check current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                error: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: errors.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
    try {
        // In a real application, you might want to blacklist the token
        // For now, we'll just return a success message
        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            // For security reasons, don't reveal if email exists or not
            return res.json({
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save reset token to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = resetTokenExpiry;
        await user.save();

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

        // Send email
        try {
            await sendPasswordResetEmail(email, resetToken, resetUrl);

            res.json({
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent'
            });
        } catch (emailError) {
            // If email fails, remove the reset token
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            console.error('Email sending failed:', emailError);
            return res.status(500).json({
                success: false,
                error: 'Failed to send reset email. Please try again.'
            });
        }

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'New password must be at least 6 characters long'
            });
        }

        // Find user by reset token and check if it's expired
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired reset token'
            });
        }

        // Update password
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        // Send success email
        try {
            await sendPasswordResetSuccessEmail(user.email, user.name);
        } catch (emailError) {
            console.error('Failed to send success email:', emailError);
            // Don't fail the request if success email fails
        }

        // Create notification
        await Notification.create({
            user: user._id,
            type: 'system',
            title: 'Password Reset Successful',
            message: 'Your password has been successfully reset. If you did not perform this action, please contact support immediately.',
            isImportant: true
        });

        res.json({
            success: true,
            message: 'Password has been reset successfully'
        });

    } catch (error) {
        console.error('Reset password error:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: errors.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Verify reset token
// @route   GET /api/auth/verify-reset-token/:token
// @access  Public
const verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;

        // Find user by reset token and check if it's expired
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired reset token'
            });
        }

        res.json({
            success: true,
            message: 'Reset token is valid',
            email: user.email
        });

    } catch (error) {
        console.error('Verify reset token error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

module.exports = {
    registerStudent,
    registerAdmin,
    login,
    getMe,
    updateProfile,
    changePassword,
    logout,
    forgotPassword,
    resetPassword,
    verifyResetToken
};
