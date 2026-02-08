import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { jwt } from "better-auth/plugins";
import { expo } from "@better-auth/expo";

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
  emailAndPassword: {
    enabled: true,
  },
  plugins: [jwt(), expo()],
});
