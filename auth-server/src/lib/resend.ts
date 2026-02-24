import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTPLogin(email: string, otp: string) {
  try {
    const data = await resend.emails.send({
      from: "onboarding@zapmail.io.vn",
      to: email,
      subject: "Login OTP Code",
      html: `<p>Your OTP code is <strong>${otp}</strong></p>`,
    });
    return data;
  } catch (error) {
    throw error;
  }
}

export async function sendOTPVerification(email: string, otp: string) {
  try {
    const data = await resend.emails.send({
      from: "onboarding@zapmail.io.vn",
      to: email,
      subject: "Verify OTP Code",
      html: `<p>Your OTP code is <strong>${otp}</strong></p>`,
    });
    return data;
  } catch (error) {
    throw error;
  }
}
