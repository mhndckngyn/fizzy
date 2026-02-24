"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [flag, setFlag] = useState(false);

  const [otp, setOtp] = useState("");

  const onSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");

    const { data, error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });

    if (error) {
      setError(error.message || "");
    } else {
      setFlag(true);
    }
  };

  const onOtpSubmit = async () => {
    console.log("Submitting OTP", otp);
    console.log("For email", email);
    const { data, error } = await authClient.signIn.emailOtp({
      email,
      otp,
    });

    console.log(data);
    console.log(error);
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto" }}>
      <h1>Sign In</h1>

      <form onSubmit={onSubmit}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />

        <br />

        <button type="submit">Sign in</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <br />

      <p>Verify OTP</p>
      <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} />
      <button onClick={onOtpSubmit}>Submit</button>
    </div>
  );
}
