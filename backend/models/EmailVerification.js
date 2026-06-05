import mongoose from 'mongoose';

const emailVerificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    pendingName: {
      type: String,
      default: null,
    },
    pendingPasswordHash: {
      type: String,
      default: null,
    },
    purpose: {
      type: String,
      required: true,
      enum: ['registration', 'password_change', 'account_delete'],
    },
    codeHash: {
      type: String,
      required: true,
    },
    newPasswordHash: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const EmailVerification = mongoose.model('EmailVerification', emailVerificationSchema);
export default EmailVerification;
