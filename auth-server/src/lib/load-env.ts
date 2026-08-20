import dotenv from "dotenv";

// Locally this loads ./.env (bun dev's default). In Compose, SECRETS_FILE_PATH is
// overridden to point at a mounted Docker secret instead — mirrors api-app's
// SECRETS_FILE_PATH convention (see api-app/Feature/Program.cs).
dotenv.config({ path: process.env.SECRETS_FILE_PATH || ".env" });
