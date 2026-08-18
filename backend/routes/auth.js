const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const router = express.Router();

// Email helper function
const sendEmail = async (to, subject, text, html) => {
  try {
    // Build transporter from env variables (Gmail or any SMTP)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // false for port 587 (STARTTLS)
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false, // allow self-signed certs in dev
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM || `"CivicWatch Support" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email] Sent successfully to ${to} | MessageId: ${info.messageId}`);
      return { success: true };
    } else {
      // No SMTP configured — log to console only
      console.log('\n================ EMAIL (NO SMTP CONFIGURED) ================');
      console.log(`To:      ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body:    ${text}`);
      console.log('=============================================================\n');
      return { success: false, reason: 'no_smtp' };
    }
  } catch (err) {
    console.error('[Email] Sending error:', err.message);
    // Log it so dev can see OTP in console
    console.log('\n================ EMAIL (SEND FAILED - FALLBACK) ================');
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:    ${text}`);
    console.log('================================================================\n');
    return { success: false, reason: err.message };
  }
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, adminCode } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'CivicWatch user already exists' });
    }

    // Determine role — default is 'citizen'
    let assignedRole = 'citizen';
    if (role === 'admin') {
      const expectedCode = process.env.ADMIN_SECRET_CODE || 'CIVIC_ADMIN_2024';
      if (!adminCode || adminCode.trim() !== expectedCode) {
        return res.status(400).json({ message: 'Invalid admin secret code. Please contact your system administrator.' });
      }
      assignedRole = 'admin';
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      role: assignedRole
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('CivicWatch server error');
  }
});


// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('CivicWatch server error');
  }
});

// Forgot Password - Send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'No account found with this email address' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    console.log(`[OTP] Generated for ${email}: ${otp}`);

    // Build email content
    const subject = 'Your Password Reset OTP — CivicWatch';
    const text = `Hello ${user.name},\n\nYour OTP for resetting your CivicWatch password is:\n\n${otp}\n\nThis OTP is valid for 10 minutes. Do not share it with anyone.\n\nRegards,\nCivicWatch Team`;
    const html = `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #2563eb, #06b6d4); padding: 12px 24px; border-radius: 12px;">
            <h1 style="margin: 0; color: white; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">CivicWatch</h1>
          </div>
        </div>
        <h2 style="color: #1e293b; font-size: 22px; font-weight: 700; margin-bottom: 8px;">Password Reset OTP</h2>
        <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">Hello <strong>${user.name}</strong>, use the OTP below to reset your password.</p>
        <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 2px solid #93c5fd; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 2px;">Your OTP Code</p>
          <p style="margin: 0; font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #1d4ed8; font-family: 'Courier New', monospace;">${otp}</p>
          <p style="margin: 12px 0 0 0; font-size: 12px; color: #64748b;">Valid for <strong>10 minutes</strong></p>
        </div>
        <p style="color: #dc2626; font-size: 12px; font-weight: 600; text-align: center; margin-bottom: 16px;">⚠️ Never share this OTP with anyone.</p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 16px 0;" />
        <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">CivicWatch — Community Infrastructure Platform</p>
      </div>
    `;

    const emailResult = await sendEmail(email, subject, text, html);

    if (emailResult.success) {
      // Email sent successfully — do NOT return OTP in response (security)
      return res.json({ message: `OTP sent to ${email}. Please check your inbox and spam folder.` });
    } else {
      // Email failed — return OTP in response for demo/dev purposes
      console.warn('[OTP] Email delivery failed, returning OTP in response for dev mode');
      return res.json({
        message: 'Email delivery unavailable. OTP shown below for demo purposes.',
        otp, // Only sent when email fails — remove in production
        demo: true
      });
    }
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ message: 'Server error while sending OTP' });
  }
});

// Verify OTP & Reset Password
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP and new password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Verify OTP & Expiry
    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.resetOtpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Reset password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Clear OTP
    user.resetOtp = null;
    user.resetOtpExpires = null;

    await user.save();

    // Send notification email
    const subject = 'Password Changed Successfully - CivicWatch';
    const text = `Hello ${user.name},\n\nYour CivicWatch account password has been changed successfully.\n\nIf you did not make this change, please contact support immediately.\n\nRegards,\nCivicWatch Team`;
    const html = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #10b981;">Password Changed Successfully</h2>
        <p>Hello <strong>${user.name}</strong>,</p>
        <p>Your CivicWatch account password has been changed successfully. You can now login using your new password.</p>
        <p style="color: #dc2626; font-weight: bold; font-size: 13px;">If you did not perform this change, please contact support immediately.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 11px;">CivicWatch Community Infrastructure Platform</p>
      </div>
    `;

    await sendEmail(email, subject, text, html);

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Verify OTP error:', err.message);
    res.status(500).json({ message: 'Server error while resetting password' });
  }
});

module.exports = router;
