# Password Reset Setup Guide

## Overview

This guide explains how to set up the password reset functionality for the Job Master application.

## Required Dependencies

The following packages have been added to `package.json`:

- `nodemailer`: For sending emails
- `crypto`: For generating secure reset tokens

## Environment Variables

Add the following to your `.env` file:

```env
# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## Gmail Setup Instructions

### 1. Enable 2-Factor Authentication

- Go to your Google Account settings
- Navigate to Security
- Enable 2-Step Verification

### 2. Generate App Password

- Go to Security > 2-Step Verification
- Click on "App passwords"
- Generate a new app password for "Mail"
- Use this app password in your EMAIL_PASSWORD environment variable

### 3. Alternative Email Services

You can modify `backend/utils/emailService.js` to use other email services:

#### SendGrid

```javascript
const transporter = nodemailer.createTransporter({
  host: "smtp.sendgrid.net",
  port: 587,
  auth: {
    user: "apikey",
    pass: process.env.SENDGRID_API_KEY,
  },
});
```

#### AWS SES

```javascript
const transporter = nodemailer.createTransporter({
  host: "email-smtp.us-east-1.amazonaws.com",
  port: 587,
  auth: {
    user: process.env.AWS_ACCESS_KEY_ID,
    pass: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
```

## API Endpoints

### 1. Forgot Password

- **POST** `/api/auth/forgot-password`
- **Body**: `{ "email": "user@example.com" }`
- **Response**: Success message (doesn't reveal if email exists)

### 2. Reset Password

- **POST** `/api/auth/reset-password/:token`
- **Body**: `{ "newPassword": "newpassword123" }`
- **Response**: Success message

### 3. Verify Reset Token

- **GET** `/api/auth/verify-reset-token/:token`
- **Response**: Token validity and user email

## Security Features

### Token Security

- Reset tokens are 32-byte random hex strings
- Tokens expire after 10 minutes
- Tokens are cleared after use or expiration
- Tokens are hashed and stored securely

### Email Security

- Generic success messages (don't reveal user existence)
- Secure token generation using crypto.randomBytes()
- Automatic token cleanup on email failure
- Success notifications sent to user

### Database Updates

- Password is automatically hashed using bcrypt
- Reset tokens are cleared after password change
- User notifications are created for security awareness

## Frontend Integration

### 1. Update Login Pages

The login pages now include "Forgot Password?" links that open modals.

### 2. Create Reset Password Page

Create a page at `/reset-password/:token` that:

- Verifies the token using `/api/auth/verify-reset-token/:token`
- Allows users to enter a new password
- Submits the new password to `/api/auth/reset-password/:token`

### 3. Handle Email Responses

- Show loading states during email sending
- Display success/error messages
- Redirect users appropriately after password reset

## Testing

### 1. Test Email Sending

```bash
# Test forgot password endpoint
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 2. Test Token Verification

```bash
# Test token verification (use token from email)
curl http://localhost:5000/api/auth/verify-reset-token/YOUR_TOKEN_HERE
```

### 3. Test Password Reset

```bash
# Test password reset
curl -X POST http://localhost:5000/api/auth/reset-password/YOUR_TOKEN_HERE \
  -H "Content-Type: application/json" \
  -d '{"newPassword": "newpassword123"}'
```

## Troubleshooting

### Common Issues

1. **Email not sending**

   - Check EMAIL_USER and EMAIL_PASSWORD in .env
   - Verify Gmail app password is correct
   - Check if 2FA is enabled on Gmail account

2. **Token not working**

   - Ensure token hasn't expired (10 minutes)
   - Check if token was already used
   - Verify token format in database

3. **Database errors**
   - Check MongoDB connection
   - Verify User model has resetPasswordToken fields
   - Check for validation errors

### Debug Mode

Enable debug logging by adding to your .env:

```env
DEBUG=email:*
```

## Production Considerations

1. **Email Service**: Use professional email services (SendGrid, AWS SES, Mailgun)
2. **Rate Limiting**: Implement rate limiting for forgot password requests
3. **Monitoring**: Add logging and monitoring for security events
4. **HTTPS**: Ensure all endpoints use HTTPS in production
5. **Token Storage**: Consider using Redis for token storage in high-traffic scenarios
