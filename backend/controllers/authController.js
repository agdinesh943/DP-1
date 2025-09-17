const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendPasswordResetEmail, sendPasswordResetSuccessEmail } = require('../utils/emailService');
const { sendOTPEmail, sendWelcomeEmail, generateOTP } = require('../utils/otpEmailService');

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

        // Generate 6-digit OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

        // Create temporary user record (not fully saved to database)
        const tempUser = {
            name,
            email,
            password,
            department,
            studentId,
            role: 'student',
            emailVerified: false,
            otp,
            isTemporary: true // Flag to indicate this is temporary
        };

        // Store temporary data in memory or temporary collection
        // For now, we'll create a minimal user record that will be completed after verification
        const user = await User.create({
            name,
            email,
            password,
            department,
            studentId,
            role: 'student',
            emailVerified: false,
            otp,
            otpExpiry,
            isActive: false // Set to inactive until verified
        });

        // Send OTP email
        try {
            await sendOTPEmail(email, otp, name, 'student');
        } catch (emailError) {
            console.error('Failed to send OTP email:', emailError);
            // Don't fail the signup if email fails, but log it
        }

        res.status(201).json({
            success: true,
            message: 'Please check your email for verification code to complete registration.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                emailVerified: user.emailVerified
            }
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

        // Generate 6-digit OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

        // Create user with email verification pending (inactive until verified)
        const user = await User.create({
            name,
            email,
            password,
            department,
            facultyId,
            role: 'admin',
            emailVerified: false,
            otp,
            otpExpiry,
            isActive: false // Set to inactive until verified
        });

        // Send OTP email
        try {
            await sendOTPEmail(email, otp, name, 'admin');
        } catch (emailError) {
            console.error('Failed to send OTP email:', emailError);
            // Don't fail the signup if email fails, but log it
        }

        res.status(201).json({
            success: true,
            message: 'Please check your email for verification code to complete registration.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                emailVerified: user.emailVerified
            }
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


        // Check if user is active (verified)
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Please verify your email to activate your account. Check your email for verification code.',
                requiresVerification: true,
                email: user.email
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

// @desc    Verify OTP and activate user account
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Validate required fields
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                error: 'Email and OTP are required'
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Check if user is already verified
        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                error: 'Email is already verified'
            });
        }

        // Check if OTP exists
        if (!user.otp) {
            return res.status(400).json({
                success: false,
                error: 'No OTP found. Please request a new verification code.'
            });
        }

        // Check OTP expiry (5 minutes)
        if (user.otpExpiry && new Date() > user.otpExpiry) {
            return res.status(400).json({
                success: false,
                error: 'OTP has expired. Please request a new verification code.'
            });
        }

        // Verify OTP
        if (user.otp !== otp) {
            return res.status(400).json({
                success: false,
                error: 'Invalid OTP code'
            });
        }

        // Update user as verified, activate account, and clear OTP
        user.emailVerified = true;
        user.isActive = true; // Activate the account
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        // Generate JWT token
        const token = generateToken(user._id, user.role);

        // Create welcome notification
        await Notification.create({
            user: user._id,
            type: 'system',
            title: 'Welcome to Job Master!',
            message: 'Your email has been verified successfully. Welcome to Job Master!',
            isImportant: true
        });

        // Send welcome email
        try {
            await sendWelcomeEmail(email, user.name, user.role);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail verification if welcome email fails
        }

        res.json({
            success: true,
            message: 'Email verified successfully! Welcome to Job Master!',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                emailVerified: user.emailVerified
            },
            token
        });

    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
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
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Check if user is already verified
        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                error: 'Email is already verified'
            });
        }

        // Check if user can resend OTP (30 second cooldown)
        const now = new Date();
        const lastResendTime = user.lastResendTime || new Date(0);
        const timeSinceLastResend = now - lastResendTime;
        const cooldownPeriod = 30 * 1000; // 30 seconds

        if (timeSinceLastResend < cooldownPeriod) {
            const remainingTime = Math.ceil((cooldownPeriod - timeSinceLastResend) / 1000);
            return res.status(429).json({
                success: false,
                error: `Please wait ${remainingTime} seconds before requesting a new OTP.`
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        // const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now - COMMENTED OUT

        // Update user with new OTP and resend time
        user.otp = otp;
        user.lastResendTime = now;
        // user.otpExpiry = otpExpiry; // COMMENTED OUT
        await user.save();

        // Send OTP email
        try {
            await sendOTPEmail(email, otp, user.name, user.role);
        } catch (emailError) {
            console.error('Failed to send OTP email:', emailError);
            return res.status(500).json({
                success: false,
                error: 'Failed to send verification email. Please try again.'
            });
        }

        res.json({
            success: true,
            message: 'New verification code sent to your email'
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};


module.exports = {
    registerStudent,
    registerAdmin,
    verifyOTP,
    resendOTP,
    login,
    getMe,
    updateProfile,
    changePassword,
    logout,
    forgotPassword,
    resetPassword,
    verifyResetToken
};
