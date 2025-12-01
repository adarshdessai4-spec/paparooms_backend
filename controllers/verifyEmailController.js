import crypto from "crypto";
import User from "../models/User.js";
import { sendEmail } from "../middlewares/mailer.js";

const isProd = process.env.NODE_ENV === "production";

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const hashOTP = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

// ✅ SEND OTP
export const sendEmailOtp = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (user.ownerProfile?.emailVerified)
      return res.status(400).json({ success: false, message: "Email already verified" });

    const otp = generateOTP();
    const hashed = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (!user.ownerProfile) user.ownerProfile = {};
    user.ownerProfile.otp = { code: hashed, expiresAt, createdAt: new Date() };

    await user.save();

    // ✅ Resend Email
    const mailStatus = await sendEmail({
      to: user.email,
      subject: "Verify Your Email - PapRooms",
      html: `
        <h2>Email Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>Valid for 10 minutes.</p>
      `,
    });
    if (!mailStatus) {
      console.warn("Email not sent (missing API key). OTP will be returned in response for dev/testing.");
    }

    // In non-production, return OTP for local testing when email isn't sent.
    const devPayload = !isProd && !mailStatus ? { otp } : {};

    console.log("Email send status:", mailStatus ? "sent" : "skipped", devPayload);
    return res.status(200).json({
      success: true,
      message: "OTP sent to your email.",
      ...devPayload,
    });
  } catch (err) {
    console.error("sendEmailOtp error:", err);
    return res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

// ✅ VERIFY OTP
export const verifyEmailOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const saved = user.ownerProfile?.otp;
    if (!saved?.code)
      return res.status(400).json({ success: false, message: "No OTP found" });

    if (new Date() > saved.expiresAt)
      return res.status(400).json({ success: false, message: "OTP expired" });

    if (hashOTP(otp) !== saved.code)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    user.ownerProfile.emailVerified = true;
    user.ownerProfile.otp = undefined;
    user.role = "owner";
    // Normalize verified flags for frontend compatibility
    user.emailVerified = true;
    user.isVerified = true;
    user.verified = true;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        emailVerified: true,
        isVerified: true,
        verified: true,
      },
    });
  } catch (err) {
    console.error("verifyEmailOtp error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const resendEmailOtp = async (req, res) => sendEmailOtp(req, res);
