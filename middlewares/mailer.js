import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();
const hasResendKey = Boolean(process.env.RESEND_API_KEY);
const resend = hasResendKey ? new Resend(process.env.RESEND_API_KEY) : null;

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!hasResendKey || !resend) {
    console.warn("📭 RESEND_API_KEY missing; email send skipped.");
    return false;
  }

  try {
    const response = await resend.emails.send({
      from: "PapRooms <no-reply@paprooms.com>",
      to,
      subject,
      html,
      text,
    });

    console.log("✅ Email sent:", response);
    return true;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    return false;
  }
};
