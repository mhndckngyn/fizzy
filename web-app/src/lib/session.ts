import { createCipheriv, createDecipheriv, scryptSync } from "crypto";
import { cookies } from "next/headers";

const PENDING_AUTH_COOKIE = "_pending_auth";
const PENDING_AUTH_EXPIRATION =
  Number(process.env.PENDING_AUTH_EXPIRATION) || 15 * 60; // 15 minutes in seconds

const SECRET_KEY = scryptSync(process.env.SESSION_SECRET!, "salt", 32);
const ALGORITHM = "aes-256-cbc";
const IV = Buffer.alloc(16, 0);

function encrypt(text: string) {
  const cipher = createCipheriv(ALGORITHM, SECRET_KEY, IV);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

function decrypt(text: string) {
  try {
    const decipher = createDecipheriv(ALGORITHM, SECRET_KEY, IV);
    let decrypted = decipher.update(text, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return null;
  }
}

export async function setPendingAuthSession(email: string) {
  const encryptedEmail = encrypt(email);
  const cookieStore = await cookies();
  cookieStore.set(PENDING_AUTH_COOKIE, encryptedEmail, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: PENDING_AUTH_EXPIRATION,
    expires: Date.now() + PENDING_AUTH_EXPIRATION * 1000,
  });
}

export async function getPendingAuthEmail() {
  const cookieStore = await cookies();
  const session = cookieStore.get(PENDING_AUTH_COOKIE)?.value;
  if (!session) return null;
  return decrypt(session);
}

export async function clearPendingAuthSession() {
  const cookieStore = await cookies();
  cookieStore.delete(PENDING_AUTH_COOKIE);
}
