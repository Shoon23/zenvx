import dotenv from "dotenv";
import fs from "fs";

export function loadDotEnv(path = ".env"): Record<string, string> {
  if (!fs.existsSync(path)) {
    throw new Error(
      `[envx] .env file not found at path "${path}"
Tip: Set { dotenv: false } if you manage environment variables yourself.`
    );
  }

  const result = dotenv.config({ path });

  if (result.error) {
    throw result.error;
  }

  return result.parsed ?? {};
}
