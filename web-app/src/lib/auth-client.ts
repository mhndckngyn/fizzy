import { emailOTPClient, jwtClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:4000/api/auth",
  plugins: [jwtClient(), emailOTPClient()],
});
