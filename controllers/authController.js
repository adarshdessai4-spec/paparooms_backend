import jwt from "jsonwebtoken";
const { sign } = jwt;
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { sendEmail } from "../middlewares/mailer.js";



// Generate JWT token
const generateToken = (userId) => {
  return sign(
    { id: userId, _id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
      algorithm: "HS256",
    }
  );
};

const isProd = process.env.NODE_ENV === 'production';
const setCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,                 // allow localhost over http in dev
    sameSite: isProd ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};


// ==================== SIGNUP USER ====================
export const signupUser = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    const existingUser = await User.findOne({ email });

    // ✅ Case: Google-only user adding password
    if (existingUser && existingUser.authProvider === "google" && !existingUser.password) {
      existingUser.password = password;
      existingUser.phone = phone || existingUser.phone;
      existingUser.name = name || existingUser.name;
      existingUser.authProvider = "both";
      existingUser.lastLogin = new Date();
      await existingUser.save();

      const token = generateToken(existingUser._id);
      setCookie(res, token);

      return res.status(200).json({
        success: true,
        message: "Password added successfully",
        wasLinked: true,
        user: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          phone: existingUser.phone,
          role: existingUser.role,
          authProvider: existingUser.authProvider,
          profilePicture: existingUser.profilePicture,
        },
      });
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
        errors: [{ field: "email", message: "Email is already registered" }],
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || "guest",
      authProvider: "local",
      isVerified: false,
      resetPassword: { otp, expiresAt },
      lastLogin: new Date(),
    });

    // ✅ Send welcome email via Resend
    await sendEmail({
      to: email,
      subject: "Welcome to PapRooms!", 
      html: `
      <h2>Welcome to PapRooms!</h2>
      <p>Hi ${name},</p>
      <p>Thank you for creating an account with us. We're excited to have you on board!</p>
      <p>Best regards,<br>The PapRooms Team</p>
      `,
    });

    const token = generateToken(user._id);
    setCookie(res, token);
    res.setHeader('x-auth-token',token);

    return res.status(201).json({
      success: true,
      message: "Account created. OTP sent to email.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: "Error creating account" });
  }
};
// ==================== GOOGLE AUTH LOGIN ====================
export const googleAuthLogin = async (req, res) => {
  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const { token } = req.body;
    
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture, sub: googleId } = ticket.getPayload();

    // Check if user exists
    let user = await User.findOne({ email });
    let isNewUser = false;
    let wasLinked = false;
    
    if (!user) {
      // Brand new user signing up with Google
      user = await User.create({
        name,
        email,
        googleId,
        profilePicture: picture,
        authProvider: 'google',
        isVerified: true,
        lastLogin: new Date(),
      });
      isNewUser = true;
      console.log('✅ New Google user created:', email);
      
    } else {
      // User exists - check authentication provider
      
      if (user.authProvider === 'local' && !user.googleId) {
        // ✅ SCENARIO B: Local user adding Google
        console.log('🔗 Linking Google account to existing local user:', email);
        
        user.googleId = googleId;
        user.profilePicture = picture || user.profilePicture;
        user.authProvider = 'both';  // ⚠️ CRITICAL LINE!
        user.isVerified = true;
        wasLinked = true;
        
      } else if (user.authProvider === 'google') {
        // Google user logging in again
        console.log('✅ Existing Google user logging in:', email);
        
      } else if (user.authProvider === 'both') {
        // User with both methods logging in
        console.log('✅ User with both auth methods logging in:', email);
      }
      
      user.lastLogin = new Date();
      await user.save();
    }

    // Generate JWT token
    const accessToken = generateToken(user._id);
    
    // Set HTTP-only cookie
    setCookie(res, accessToken);
    console.log('✅ Google auth successful, cookie set for user:', accessToken);
    res.setHeader('x-auth-token',accessToken);
    
    // Determine message
    let message = 'Login successful';
    if (isNewUser) {
      message = 'Account created successfully with Google';
    } else if (wasLinked) {
      message = 'Google account linked successfully! You can now login with both methods.';
    }
    
    res.status(200).json({
      success: true,
      message,
      isNewUser,
      wasLinked,
      token: accessToken,
      user: { 
        id: user._id,
        name: user.name, 
        email: user.email, 
        profilePicture: user.profilePicture || picture,
        role: user.role,
        authProvider: user.authProvider,  // Should be 'both' if linked
      },
    });
    
  } catch (err) {
    console.error("❌ Google auth error:", err);
    
    if (err.message?.includes('Token used too late')) {
      return res.status(400).json({ 
        success: false, 
        message: "Google token has expired. Please try again.",
      });
    }
    
    if (err.message?.includes('Invalid token')) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid Google token. Please try again.",
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Google authentication failed. Please try again.",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ==================== LOGIN USER ====================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        errors: [{ field: 'email', message: 'No account found with this email' }]
      });
    }

    // ⚠️ Check if user is Google-only (no password set)
    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account was created with Google. Please login with Google or sign up to set a password.',
        hint: 'use_google_login',
        errors: [{ field: 'auth', message: 'Google authentication required' }]
      });
    }

    // Verify password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        errors: [{ field: 'password', message: 'Incorrect password' }]
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);
    console.log('✅ User logged in:', user.email);

    // Set cookie
    setCookie(res, token);
    res.setHeader('x-auth-token',token);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        authProvider: user.authProvider,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ==================== GET CURRENT USER ====================
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('✅ Fetching profile for user:', user.email);
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        authProvider: user.authProvider,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('❌ Fetch profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
};

// ==================== UPDATE USER ====================
export const updateUser = async (req, res) => {
  try {
    const { name, phone, profilePicture } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (profilePicture) updateData.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('✅ Profile updated for user:', user.email);
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
        role: user.role,
        authProvider: user.authProvider
      }
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



export const logoutUser = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict'
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
}


// ==================== FORGOT PASSWORD ====================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.resetPassword = { otp, expiresAt };
    await user.save();

    // ✅ Send OTP using Resend
    await sendEmail({
      to: email,
      subject: "Password Reset OTP",
      html: `
        <h2>Password Reset</h2>
        <p>Your OTP:</p>
        <h1>${otp}</h1>
        <p>Valid for 10 minutes.</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent to email",
    });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==================== RESET PASSWORD ====================
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (
      !user.resetPassword ||
      user.resetPassword.otp !== otp ||
      user.resetPassword.expiresAt < new Date()
    ) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPassword = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("resetPassword error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}



