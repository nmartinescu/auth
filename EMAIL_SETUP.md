# Email Setup Guide for Password Reset

This guide explains how to configure email sending for password reset functionality.

## Option 1: Gmail with App Password (Recommended for Development)

### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account settings
2. Navigate to "Security"
3. Enable "2-Step Verification" if not already enabled

### Step 2: Generate App Password

1. In Google Account settings, go to "Security"
2. Under "2-Step Verification", click "App passwords"
3. Select "Mail" and "Other (custom name)"
4. Enter "OS Sim Backend" as the name
5. Copy the generated 16-character password

### Step 3: Update Environment Variables

Update your `backend/.env` file:

```env
# Email Configuration
EMAIL_USER=your-actual-email@gmail.com
EMAIL_APP_PASSWORD=your-16-character-app-password
FRONTEND_URL=http://localhost:5173
```

### Step 4: Test the Setup

1. Start your backend server
2. Use the forgot password feature
3. Check your email for the reset link

## Option 2: SendGrid (Recommended for Production)

### Step 1: Install SendGrid

```bash
npm install @sendgrid/mail
```

### Step 2: Get SendGrid API Key

1. Sign up at <https://sendgrid.com>
2. Go to Settings > API Keys
3. Create a new API key with "Mail Send" permissions

### Step 3: Create SendGrid Email Service

Create `backend/services/sendgridService.js`:

```javascript
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const msg = {
      to: email,
      from: {
        email: process.env.FROM_EMAIL,
        name: 'OS Sim'
      },
      subject: 'Password Reset Request - OS Sim',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a>
        <p>This link expires in 1 hour.</p>
      `
    };

    const result = await sgMail.send(msg);
    return { success: true, messageId: result[0].headers['x-message-id'] };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = { sendPasswordResetEmail };
```

### Step 4: Update Environment Variables

```env
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com
```

## Option 3: Resend (Modern Alternative)

### Step 1: Install Resend

```bash
npm install resend
```

### Step 2: Get Resend API Key

1. Sign up at <https://resend.com>
2. Get your API key from the dashboard

### Step 3: Create Resend Email Service

Create `backend/services/resendService.js`:

```javascript
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const result = await resend.emails.send({
      from: 'OS Sim <noreply@yourdomain.com>',
      to: email,
      subject: 'Password Reset Request - OS Sim',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a>
        <p>This link expires in 1 hour.</p>
      `
    });

    return { success: true, messageId: result.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = { sendPasswordResetEmail };
```

## Switching Email Services

To switch between email services, update the import in `backend/routes/auth.js`:

```javascript
// For Gmail
const { sendPasswordResetEmail } = require("../services/emailService");

// For SendGrid
const { sendPasswordResetEmail } = require("../services/sendgridService");

// For Resend
const { sendPasswordResetEmail } = require("../services/resendService");
```

## Testing Email Functionality

### Development Testing

1. Use a real email address you can access
2. Check both inbox and spam folders
3. Verify the reset link works correctly

### Production Considerations

1. Use a professional email service (SendGrid, Resend, etc.)
2. Set up proper DNS records (SPF, DKIM, DMARC)
3. Use a custom domain for sender address
4. Monitor email delivery rates
5. Remove the `resetToken` from API responses

## Troubleshooting

### Gmail Issues

- **"Less secure app access"**: Use App Password instead
- **"Authentication failed"**: Check email and app password
- **"Daily limit exceeded"**: Gmail has sending limits

### General Issues

- **Emails in spam**: Set up proper DNS records
- **Network errors**: Check firewall settings
- **Token expired**: Tokens expire in 1 hour

## Security Best Practices

1. **Never log sensitive data** (passwords, tokens)
2. **Use HTTPS** for reset links in production
3. **Rate limit** password reset requests
4. **Validate email format** before sending
5. **Use secure token generation**
6. **Set appropriate token expiration**

## Environment Variables Summary

```env
# Required for all email services
FRONTEND_URL=http://localhost:5173

# Gmail
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password

# SendGrid
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@yourdomain.com

# Resend
RESEND_API_KEY=your-resend-key
```
