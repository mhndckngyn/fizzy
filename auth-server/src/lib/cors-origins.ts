const DEFAULT_CORS_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:8081",
  "fizzy://",
  "exp://",
];

/** Shared by server.ts (Fastify CORS) and auth.ts (better-auth trustedOrigins) so the two
 * allow-lists can't drift apart. Comma-separated via CORS_ORIGINS, e.g. set from compose.yaml. */
export function getCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS;
  if (!raw) return DEFAULT_CORS_ORIGINS;

  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}
