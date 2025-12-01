import { Router } from 'express';
import {
  sendEmailOtp,
  verifyEmailOtp,
  resendEmailOtp
} from '../controllers/verifyEmailController.js';
import protect from '../middlewares/auth.js';
import validateRequest from '../middlewares/validateRequest.js';
import { verifyOtp } from '../validations/verifyEmail.js';

const router = Router();

// @route   POST /api/verify-email/send
// @desc    Send OTP to verify email
// @access  Private
router.post('/send', protect, sendEmailOtp);

// @route   POST /api/verify-email/verify
// @desc    Verify email with OTP
// @access  Private
router.post('/verify', protect, validateRequest(verifyOtp), verifyEmailOtp);

// @route   POST /api/verify-email/resend
// @desc    Resend verification OTP
// @access  Private
router.post('/resend', protect, resendEmailOtp);

export default router;
