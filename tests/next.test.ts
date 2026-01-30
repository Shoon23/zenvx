import { describe, it, expect } from "vitest";
import { loadServerEnv, loadClientEnv } from "../src/adapters/next.js";
import { tx } from "../src/index.js";

describe("Next.js Adapter", () => {
  it("loads server env correctly", () => {
    process.env.DATABASE_URL = "postgres://user:pass@localhost:5432/db";
    process.env.DEBUG = "true";

    const env = loadServerEnv({
      DATABASE_URL: tx.string(),
      DEBUG: tx.bool(),
    });

    expect(env.DATABASE_URL).toBe("postgres://user:pass@localhost:5432/db");
    expect(env.DEBUG).toBe(true);
  });

  it("loads client env correctly", () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";

    const env = loadClientEnv({
      NEXT_PUBLIC_API_URL: tx.string(),
    });

    expect(env.NEXT_PUBLIC_API_URL).toBe("https://api.example.com");
  });

  it("throws when client env uses non-public key", () => {
    process.env.SECRET_KEY = "123";
    expect(() =>
      loadClientEnv({
        SECRET_KEY: tx.string(),
      }),
    ).toThrow();
  });
});
describe("Next.js Adapter - client env", () => {
  it("parses NEXT_PUBLIC_* variables correctly", () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
    const env = loadClientEnv({
      NEXT_PUBLIC_API_URL: tx.string(),
    });
    expect(env.NEXT_PUBLIC_API_URL).toBe("https://api.example.com");
  });

  it("throws error if a non-NEXT_PUBLIC variable is accessed", () => {
    process.env.SECRET_KEY = "123";
    expect(() =>
      loadClientEnv({
        SECRET_KEY: tx.string(),
      }),
    ).toThrow(/must start with NEXT_PUBLIC_/i);
  });

  it("ignores variables without NEXT_PUBLIC_ prefix in client env", () => {
    process.env.API_KEY = "abc123"; // not NEXT_PUBLIC_

    expect(() =>
      loadClientEnv({
        API_KEY: tx.string(),
      }),
    ).toThrowError(/Client env "API_KEY" must start with NEXT_PUBLIC_/);
  });
});
