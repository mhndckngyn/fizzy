import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { emailOTP, jwt } from "better-auth/plugins";
import { expo } from "@better-auth/expo";
import { sendOTPLogin, sendOTPVerification } from "./resend";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:8081",
    "fizzy://",
    "exp://",
  ],
  // emailAndPassword: {
  //   enabled: true,
  // },
  plugins: [
    jwt({
      jwt: {
        audience: "http://localhost:5278",
      },
      jwks: {
        keyPairConfig: {
          alg: "RS256",
        },
      },
    }),
    expo(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        console.log("verifying");
        if (type === "sign-in") {
          await sendOTPLogin(email, otp);
        } else if (type === "email-verification") {
          await sendOTPVerification(email, otp);
        } else {
          // Send the OTP for password reset
        }
      },
      sendVerificationOnSignUp: true,
    }),
  ],
});
