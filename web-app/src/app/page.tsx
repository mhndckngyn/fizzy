"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import SignInPage from "./sign-in";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");

    const res = await authClient.signUp.email({
      email,
      name: email,
      password,
    });

    if (res?.error) {
      setError(res.error.message || "");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto" }}>
      <h1>Sign Up</h1>

      <form onSubmit={onSubmit}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />

        <button type="submit">Create account</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <br />

      <SignInPage />
    </div>
  );
}
