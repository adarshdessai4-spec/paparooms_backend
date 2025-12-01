import { Router } from "express";
import {
  registerUserSchema,
  loginUserSchema,
  googleAuthSchema, // Add this
  updateUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validations/user.js";
import validateRequest from "../middlewares/validateRequest.js";
import protect from "../middlewares/auth.js";
import {
  loginUser,
  signupUser,
  getCurrentUser,
  updateUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  googleAuthLogin,
} from "../controllers/authController.js";


const router = Router();

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post("/signup", validateRequest(registerUserSchema), signupUser);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", validateRequest(loginUserSchema), loginUser);

// @route   POST /api/auth/google
// @desc    Google OAuth login/signup
// @access  Public
router.post("/google", validateRequest(googleAuthSchema), googleAuthLogin);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get("/me", protect, getCurrentUser);

// @route   PUT /api/auth/update
// @desc    Update user profile
// @access  Private
router.put("/update", protect, validateRequest(updateUserSchema), updateUser);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post("/logout", protect, logoutUser);

// @route   POST /api/auth/forgot-password
// @desc    Send OTP for password reset
// @access  Public
router.post(
  "/forgot-password",
  validateRequest(forgotPasswordSchema),
  forgotPassword
);

// @route   POST /api/auth/reset-password
// @desc    Reset password using OTP
// @access  Public
router.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  resetPassword
);

export default router;
