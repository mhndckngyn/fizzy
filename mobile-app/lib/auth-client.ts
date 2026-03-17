import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { emailOTPClient, jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.API_BASE_URL,
  plugins: [
    expoClient({
      scheme: "fizzy",
      storagePrefix: "fizzy",
      storage: SecureStore,
    }),
    jwtClient(),
    emailOTPClient(),
  ],
});
