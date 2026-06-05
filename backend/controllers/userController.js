import User from '../models/User.js';
import Expense from '../models/Expense.js';
import EmailVerification from '../models/EmailVerification.js';
import bcrypt from 'bcrypt';
import generateToken from '../utils/generateToken.js';
import { sendVerificationEmail } from '../utils/sendEmail.js';
import {
  generateVerificationCode,
  hashVerificationCode,
  compareVerificationCode,
  getVerificationExpiry,
  MAX_ATTEMPTS,
} from '../utils/verificationHelpers.js';

const APP_NAME = 'Hisaab';

const PURPOSE_LABELS = {
  registration: 'complete your registration and verify your email',
  password_change: 'change your password',
  account_delete: 'permanently delete your account',
};

const PURPOSE_SUBJECTS = {
  registration: `${APP_NAME} — Verify your email`,
  password_change: `${APP_NAME} — Password change verification`,
  account_delete: `${APP_NAME} — Account deletion verification`,
};

const buildVerificationEmail = (purpose, code, userName) => {
  const actionLabel = PURPOSE_LABELS[purpose] || 'verify your request';

  const text = `Hello ${userName},

You requested to ${actionLabel} on ${APP_NAME}.

Your verification code is: ${code}

This code expires in 15 minutes. If you did not make this request, ignore this email and your account will stay secure.

— ${APP_NAME} Team`;

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">${APP_NAME} — Verify your request</h2>
      <p>Hello ${userName},</p>
      <p>Please use this code to <strong>${actionLabel}</strong>.</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #111827;">${code}</p>
      <p style="color: #6b7280; font-size: 14px;">This code expires in 15 minutes.</p>
      <p style="color: #6b7280; font-size: 14px;">If you did not make this request, you can safely ignore this email.</p>
    </div>
  `;

  return { text, html, subject: PURPOSE_SUBJECTS[purpose] };
};

const findValidVerificationByEmail = async (email, purpose, code) => {
  const normalizedEmail = email.toLowerCase().trim();
  const record = await EmailVerification.findOne({
    email: normalizedEmail,
    purpose,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!record) {
    return { ok: false, status: 400, message: 'No active verification. Please register again.' };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await EmailVerification.deleteOne({ _id: record._id });
    return { ok: false, status: 400, message: 'Too many attempts. Please request a new code.' };
  }

  const isMatch = await compareVerificationCode(code, record.codeHash);
  if (!isMatch) {
    record.attempts += 1;
    await record.save();
    return { ok: false, status: 400, message: 'Invalid verification code.' };
  }

  return { ok: true, record };
};

const findValidVerification = async (userId, purpose, code) => {
  const record = await EmailVerification.findOne({
    user: userId,
    purpose,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!record) {
    return { ok: false, status: 400, message: 'No active verification. Please request a new code.' };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await EmailVerification.deleteOne({ _id: record._id });
    return { ok: false, status: 400, message: 'Too many attempts. Please request a new code.' };
  }

  const isMatch = await compareVerificationCode(code, record.codeHash);
  if (!isMatch) {
    record.attempts += 1;
    await record.save();
    return { ok: false, status: 400, message: 'Invalid verification code.' };
  }

  return { ok: true, record };
};

// @desc    Start registration — send email verification code
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const normalizedEmail = email?.toLowerCase().trim();

        if (!name?.trim() || !normalizedEmail || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(400).json({ message: 'An account with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const code = generateVerificationCode();
        const codeHash = await hashVerificationCode(code);

        await EmailVerification.deleteMany({ email: normalizedEmail, purpose: 'registration' });

        await EmailVerification.create({
            email: normalizedEmail,
            purpose: 'registration',
            codeHash,
            pendingName: name.trim(),
            pendingPasswordHash: hashedPassword,
            expiresAt: getVerificationExpiry(),
        });

        const { text, html, subject } = buildVerificationEmail('registration', code, name.trim());
        await sendVerificationEmail({ to: normalizedEmail, subject, html, text });

        res.status(200).json({
            message: `Verification code sent to ${normalizedEmail}`,
            email: normalizedEmail,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Confirm registration with email verification code
// @route   POST /api/users/register/confirm
// @access  Public
const confirmRegistration = async (req, res) => {
    try {
        const { email, code } = req.body;
        const normalizedEmail = email?.toLowerCase().trim();

        if (!normalizedEmail || !code) {
            return res.status(400).json({ message: 'Email and verification code are required' });
        }

        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(400).json({ message: 'An account with this email already exists' });
        }

        const result = await findValidVerificationByEmail(
            normalizedEmail,
            'registration',
            String(code).trim()
        );
        if (!result.ok) {
            return res.status(result.status).json({ message: result.message });
        }

        const user = await User.create({
            name: result.record.pendingName,
            email: normalizedEmail,
            password: result.record.pendingPasswordHash,
            emailVerified: true,
        });

        await EmailVerification.deleteMany({ email: normalizedEmail, purpose: 'registration' });

        const token = generateToken(res, user._id);
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email?.toLowerCase().trim();

        if (!normalizedEmail || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email: normalizedEmail });

        // 2. Check if user exists AND password matches the hashed password
        if (user && (await bcrypt.compare(password, user.password))) {
            const token = generateToken(res, user._id);
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token,
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });

    res.status(200).json({ message: 'User logged out successfully' });
};

// @desc    Request email verification to change password
// @route   POST /api/users/password/request-verification
// @access  Private
const requestPasswordChangeVerification = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password are required' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const passwordMatches = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatches) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const samePassword = await bcrypt.compare(newPassword, user.password);
        if (samePassword) {
            return res.status(400).json({ message: 'New password must be different from current password' });
        }

        const code = generateVerificationCode();
        const codeHash = await hashVerificationCode(code);
        const newPasswordHash = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));

        await EmailVerification.deleteMany({ user: user._id, purpose: 'password_change' });

        await EmailVerification.create({
            user: user._id,
            purpose: 'password_change',
            codeHash,
            newPasswordHash,
            expiresAt: getVerificationExpiry(),
        });

        const { text, html, subject } = buildVerificationEmail('password_change', code, user.name);
        await sendVerificationEmail({ to: user.email, subject, html, text });

        res.status(200).json({
            message: `Verification code sent to ${user.email}`,
            email: user.email,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Confirm password change with email verification code
// @route   POST /api/users/password/confirm
// @access  Private
const confirmPasswordChange = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ message: 'Verification code is required' });
        }

        const result = await findValidVerification(req.user._id, 'password_change', String(code).trim());
        if (!result.ok) {
            return res.status(result.status).json({ message: result.message });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.password = result.record.newPasswordHash;
        await user.save();
        await EmailVerification.deleteMany({ user: user._id, purpose: 'password_change' });

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Request email verification to delete account
// @route   POST /api/users/delete/request-verification
// @access  Private
const requestAccountDeletionVerification = async (req, res) => {
    try {
        const { currentPassword } = req.body;
        if (!currentPassword) {
            return res.status(400).json({ message: 'Current password is required' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const passwordMatches = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatches) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const code = generateVerificationCode();
        const codeHash = await hashVerificationCode(code);

        await EmailVerification.deleteMany({ user: user._id, purpose: 'account_delete' });

        await EmailVerification.create({
            user: user._id,
            purpose: 'account_delete',
            codeHash,
            expiresAt: getVerificationExpiry(),
        });

        const { text, html, subject } = buildVerificationEmail('account_delete', code, user.name);
        await sendVerificationEmail({ to: user.email, subject, html, text });

        res.status(200).json({
            message: `Verification code sent to ${user.email}`,
            email: user.email,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Confirm account deletion with email verification code
// @route   POST /api/users/delete/confirm
// @access  Private
const confirmAccountDeletion = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ message: 'Verification code is required' });
        }

        const result = await findValidVerification(req.user._id, 'account_delete', String(code).trim());
        if (!result.ok) {
            return res.status(result.status).json({ message: result.message });
        }

        const userId = req.user._id;
        await Expense.deleteMany({ user: userId });
        await EmailVerification.deleteMany({ user: userId });
        await User.findByIdAndDelete(userId);

        res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {
    registerUser,
    confirmRegistration,
    authUser,
    logoutUser,
    requestPasswordChangeVerification,
    confirmPasswordChange,
    requestAccountDeletionVerification,
    confirmAccountDeletion,
};