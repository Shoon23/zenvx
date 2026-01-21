import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { z } from "zod";
import { tx, defineEnv } from "../src/index.js";

// Mock the internal loaders to avoid reading actual .env files from disk during tests
vi.mock("./loaders/dotenv.js", () => ({
  loadDotEnv: () => ({}), // Return empty object for file load
}));

describe("tx validators", () => {
  // --- NUMBER & PORT ---
  describe("tx.number", () => {
    it("coerces string numbers to integers", () => {
      const schema = tx.number();
      expect(schema.parse("123")).toBe(123);
      expect(schema.parse("0")).toBe(0);
    });

    it("fails on non-numeric strings", () => {
      const schema = tx.number();
      expect(() => schema.parse("abc")).toThrow();
    });
  });

  describe("tx.port", () => {
    it("accepts valid ports", () => {
      const schema = tx.port();
      expect(schema.parse("3000")).toBe(3000);
      expect(schema.parse("80")).toBe(80);
    });

    it("rejects out of range ports", () => {
      const schema = tx.port();
      expect(() => schema.parse("0")).toThrow(); // Min is 1
      expect(() => schema.parse("70000")).toThrow(); // Max is 65535
    });

    it("rejects garbage input", () => {
      const schema = tx.port();
      expect(() => schema.parse("not-a-port")).toThrow();
    });
  });

  // --- BOOLEAN ---
  describe("tx.bool", () => {
    it("parses true variants", () => {
      const schema = tx.bool();
      expect(schema.parse("true")).toBe(true);
      expect(schema.parse("TRUE")).toBe(true);
      expect(schema.parse("1")).toBe(true);
    });

    it("parses false variants", () => {
      const schema = tx.bool();
      expect(schema.parse("false")).toBe(false);
      expect(schema.parse("FALSE")).toBe(false);
      expect(schema.parse("0")).toBe(false);
    });

    it("throws on invalid booleans", () => {
      const schema = tx.bool();
      expect(() => schema.parse("yes")).toThrow();
      expect(() => schema.parse("no")).toThrow();
    });
  });

  // --- STRING UTILS ---
  describe("tx.string (Strict)", () => {
    it("accepts text", () => {
      expect(tx.string().parse("hello")).toBe("hello");
    });

    it("rejects numeric strings", () => {
      // Assuming you kept the strict regex check !/^\d+$/
      expect(() => tx.string().parse("12345")).toThrow();
    });
  });

  describe("tx.url", () => {
    it("accepts valid URLs", () => {
      expect(tx.url().parse("https://google.com")).toBe("https://google.com");
    });

    it("rejects invalid URLs", () => {
      expect(() => z.url().parse("someurl")).toThrow();
    });
  });

  describe("tx.email", () => {
    it("validates emails", () => {
      expect(tx.email().parse("test@example.com")).toBe("test@example.com");
      expect(() => tx.email().parse("not-an-email")).toThrow();
    });
  });

  // --- JSON ---
  describe("tx.json", () => {
    it("parses stringified JSON into an object", () => {
      const jsonString = '{"foo": "bar"}';
      const result = tx.json().parse(jsonString);
      expect(result).toEqual({ foo: "bar" });
    });

    it("throws on malformed JSON", () => {
      expect(() => tx.json().parse("{foo: bad}")).toThrow();
    });
  });
});

// --- INTEGRATION TEST ---
describe("defineEnv", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    vi.resetModules(); // clears cache
    process.env = { ...ORIGINAL_ENV }; // Reset env vars
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV; // Restore original env
  });

  it("reads from process.env and validates correctly", () => {
    // Setup Env
    process.env.API_PORT = "8080";
    process.env.DEBUG_MODE = "true";
    process.env.SERVICE_URL = "https://api.example.com";

    // Define Schema
    const config = defineEnv({
      API_PORT: tx.port(),
      DEBUG_MODE: tx.bool(),
      SERVICE_URL: tx.url(),
    });

    // Assertions
    expect(config.API_PORT).toBe(8080);
    expect(config.DEBUG_MODE).toBe(true);
    expect(config.SERVICE_URL).toBe("https://api.example.com");
  });

  it("throws error when env var is missing/invalid", () => {
    process.env.API_PORT = "not-a-number";

    expect(() => {
      defineEnv({
        API_PORT: tx.port(),
      });
    }).toThrow();
  });
});
