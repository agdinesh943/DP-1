const nodemailer = require('nodemailer');

// Create transporter using Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASSWORD // Your Gmail App Password
    }
  });
};

/**
 * Send OTP verification email to user
 * @param {string} email - User's email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} name - User's name
 * @param {string} role - User's role (student/admin)
 * @returns {Promise<Object>} - Email sending result
 */
const sendOTPEmail = async (email, otp, name, role = 'student') => {
  try {
    const transporter = createTransporter();

    const roleText = role === 'admin' ? 'Faculty/Admin' : 'Student';
    const dashboardUrl = role === 'admin' ? '/admin' : '/dashboard';

    const mailOptions = {
      from: {
        name: 'Job Master',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: '🔐 Verify Your Email - Job Master',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification - Job Master</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .header p {
              margin: 10px 0 0 0;
              font-size: 16px;
              opacity: 0.9;
            }
            .content {
              padding: 30px;
            }
            .otp-container {
              background: #f8f9fa;
              border: 2px dashed #667eea;
              border-radius: 8px;
              padding: 25px;
              text-align: center;
              margin: 25px 0;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              color: #667eea;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
              margin: 15px 0;
            }
            .otp-label {
              color: #666;
              font-size: 14px;
              margin-bottom: 10px;
            }
            .expiry-warning {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              border-radius: 5px;
              padding: 15px;
              margin: 20px 0;
              color: #856404;
            }
            .footer {
              background: #f8f9fa;
              padding: 20px;
              text-align: center;
              border-top: 1px solid #e9ecef;
            }
            .footer p {
              margin: 0;
              color: #6c757d;
              font-size: 12px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 12px 25px;
              text-decoration: none;
              border-radius: 25px;
              font-weight: bold;
              margin: 20px 0;
            }
            .role-badge {
              background: #e3f2fd;
              color: #1976d2;
              padding: 5px 15px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              display: inline-block;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Job Master</h1>
              <p>Email Verification Required</p>
            </div>
            
            <div class="content">
              <h2>Hello ${name}!</h2>
              
              <div class="role-badge">${roleText} Account</div>
              
              <p>Thank you for signing up with Job Master! To complete your registration and access all features, please verify your email address using the OTP code below:</p>
              
              <div class="otp-container">
                <div class="otp-label">Your verification code is:</div>
                <div class="otp-code">${otp}</div>
              </div>
              
              <div class="expiry-warning">
                <strong>⏰ Important:</strong> This code will expire in 5 minutes for security reasons.
              </div>
              
              <p>Once verified, you'll be able to:</p>
              <ul>
                <li>Access your ${roleText.toLowerCase()} dashboard</li>
                <li>Browse and apply to job opportunities</li>
                <li>Save jobs and track applications</li>
                <li>Receive personalized notifications</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}${dashboardUrl}" class="button">
                  Go to Dashboard
                </a>
              </div>
            </div>
            
            <div class="footer">
              <p>If you didn't create an account with Job Master, please ignore this email.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

/**
 * Send welcome email after successful verification
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @param {string} role - User's role (student/admin)
 * @returns {Promise<Object>} - Email sending result
 */
const sendWelcomeEmail = async (email, name, role = 'student') => {
  try {
    const transporter = createTransporter();

    const roleText = role === 'admin' ? 'Faculty/Admin' : 'Student';
    const dashboardUrl = role === 'admin' ? '/admin' : '/dashboard';
    const features = role === 'admin'
      ? ['Post job opportunities', 'Manage competitions', 'Track applications', 'View analytics']
      : ['Browse job opportunities', 'Save and apply to jobs', 'Track applications', 'Receive notifications'];

    const mailOptions = {
      from: {
        name: 'Job Master',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: '🎉 Welcome to Job Master! Your account is now verified',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Job Master</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .header p {
              margin: 10px 0 0 0;
              font-size: 16px;
              opacity: 0.9;
            }
            .content {
              padding: 30px;
            }
            .success-badge {
              background: #d4edda;
              color: #155724;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
              margin: 20px 0;
              border: 1px solid #c3e6cb;
            }
            .features {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .features h3 {
              color: #495057;
              margin-top: 0;
            }
            .features ul {
              margin: 0;
              padding-left: 20px;
            }
            .features li {
              margin: 8px 0;
              color: #6c757d;
            }
            .footer {
              background: #f8f9fa;
              padding: 20px;
              text-align: center;
              border-top: 1px solid #e9ecef;
            }
            .footer p {
              margin: 0;
              color: #6c757d;
              font-size: 12px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 25px;
              font-weight: bold;
              margin: 20px 0;
            }
            .role-badge {
              background: #e3f2fd;
              color: #1976d2;
              padding: 5px 15px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              display: inline-block;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Job Master!</h1>
              <p>Your account is now verified and ready to use</p>
            </div>
            
            <div class="content">
              <h2>Hello ${name}!</h2>
              
              <div class="role-badge">${roleText} Account</div>
              
              <div class="success-badge">
                <strong>✅ Email Verified Successfully!</strong><br>
                Your ${roleText.toLowerCase()} account is now active and ready to use.
              </div>
              
              <p>Congratulations! You can now access all the features of Job Master:</p>
              
              <div class="features">
                <h3>🚀 What you can do now:</h3>
                <ul>
                  ${features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}${dashboardUrl}" class="button">
                  Go to Your Dashboard
                </a>
              </div>
              
              <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
                Thank you for choosing Job Master for your career journey. We're excited to help you find the perfect opportunities!
              </p>
            </div>
            
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>© 2024 Job Master. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

/**
 * Generate a 6-digit OTP
 * @returns {string} - 6-digit OTP code
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
  generateOTP
};
