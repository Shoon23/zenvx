import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { z } from "zod";
import { tx, defineEnv } from "../src/index.js";
import { generateExample } from "../src/core/generate-example.js";
import fs from "fs";

// Mock loaders to avoid reading actual .env files
vi.mock("../src/loaders/dotenv.js", () => ({
  loadDotEnv: () => ({}),
}));

// -------------------- TX Validators --------------------
describe("tx validators", () => {
  describe("tx.number", () => {
    it("coerces string numbers to integers", () => {
      const schema = tx.number();
      expect(schema.parse("123")).toBe(123);
      expect(schema.parse("0")).toBe(0);
    });

    it("fails on non-numeric strings with correct message", () => {
      const schema = tx.number();
      expect(() => schema.parse("abc")).toThrow("Must be a number");
    });

    it("rejects Infinity and NaN", () => {
      const schema = tx.number();
      expect(() => schema.parse("Infinity")).toThrow("Must be a number");
      expect(() => schema.parse("NaN")).toThrow("Must be a number");
    });
  });

  describe("tx.port", () => {
    it("accepts valid ports", () => {
      const schema = tx.port();
      expect(schema.parse("3000")).toBe(3000);
      expect(schema.parse("80")).toBe(80);
    });

    it("rejects out-of-range ports with correct messages", () => {
      const schema = tx.port();
      expect(() => schema.parse("0")).toThrow();
      expect(() => schema.parse("70000")).toThrow();
    });

    it("rejects garbage input", () => {
      const schema = tx.port();
      expect(() => schema.parse("not-a-port")).toThrow(/1–65535/);
    });
  });

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

    it("rejects invalid booleans", () => {
      const schema = tx.bool();
      expect(() => schema.parse("yes")).toThrow();
      expect(() => schema.parse("no")).toThrow();
      expect(() => schema.parse("on")).toThrow();
    });
  });

  describe("tx.string", () => {
    it("accepts non-numeric text", () => {
      expect(tx.string().parse("hello")).toBe("hello");
      expect(tx.string().parse("abc123")).toBe("abc123");
    });

    it("rejects numeric-only strings", () => {
      expect(() => tx.string().parse("12345")).toThrow(/text/);
    });

    it("trims whitespace", () => {
      expect(tx.string().parse("  hello  ")).toBe("hello");
    });
  });

  describe("tx.url", () => {
    it("accepts valid URLs", () => {
      expect(tx.url().parse("https://google.com")).toBe("https://google.com");
    });

    it("rejects invalid URLs", () => {
      expect(() => tx.url().parse("someurl")).toThrow();
    });
  });

  describe("tx.email", () => {
    it("validates correct emails", () => {
      expect(tx.email().parse("test@example.com")).toBe("test@example.com");
    });

    it("rejects invalid emails", () => {
      expect(() => tx.email().parse("not-an-email")).toThrow();
    });
  });

  describe("tx.json", () => {
    it("parses stringified JSON into an object", () => {
      const jsonString = '{"foo": "bar"}';
      const result = tx.json().parse(jsonString);
      expect(result).toEqual({ foo: "bar" });
    });

    it("throws on malformed JSON", () => {
      expect(() => tx.json().parse("{foo: bad}")).toThrow(/JSON/);
    });

    it("supports typed JSON", () => {
      const schema = tx.json<{ foo: string }>();
      const result = schema.parse('{"foo":"bar"}');
      expect(result.foo).toBe("bar");
    });
  });
});

// -------------------- defineEnv --------------------
describe("defineEnv", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it("reads from process.env and validates correctly", () => {
    process.env.API_PORT = "8080";
    process.env.DEBUG_MODE = "true";
    process.env.SERVICE_URL = "https://api.example.com";

    const config = defineEnv(
      {
        API_PORT: tx.port(),
        DEBUG_MODE: tx.bool(),
        SERVICE_URL: tx.url(),
      },
      process.env,
    );

    expect(config.API_PORT).toBe(8080);
    expect(config.DEBUG_MODE).toBe(true);
    expect(config.SERVICE_URL).toBe("https://api.example.com");
  });

  it("throws error when env var is missing/invalid", () => {
    process.env.API_PORT = "not-a-number";

    expect(() => {
      defineEnv({ API_PORT: tx.port() }, process.env);
    }).toThrow();
  });
});

// -------------------- Runtime mode tests --------------------
describe("defineEnv runtime mode", () => {
  let exitMock: any;

  beforeEach(() => {
    exitMock = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
  });

  afterEach(() => {
    exitMock.mockRestore();
  });

  it("should exit process on invalid env", () => {
    process.env.PORT = "not-a-number";

    expect(() => {
      defineEnv({ PORT: tx.port() }, process.env, { mode: "runtime" });
    }).toThrow("process.exit called");

    expect(exitMock).toHaveBeenCalledWith(1);
  });

  it("should parse valid env correctly", () => {
    process.env.PORT = "3000";

    const config = defineEnv({ PORT: tx.port() }, process.env, {
      mode: "runtime",
    });
    expect(config.PORT).toBe(3000);
  });
});

// -------------------- Build mode tests --------------------
describe("defineEnv build mode", () => {
  it("should throw error on invalid env", () => {
    process.env.PORT = "not-a-number";

    expect(() =>
      defineEnv({ PORT: tx.port() }, process.env, { mode: "build" }),
    ).toThrowError(/Must be a valid port/);
  });

  it("should parse valid env correctly", () => {
    process.env.PORT = "8080";

    const config = defineEnv({ PORT: tx.port() }, process.env, {
      mode: "build",
    });
    expect(config.PORT).toBe(8080);
  });
});

// -------------------- generateExample tests --------------------
describe("generateExample", () => {
  const schema = {
    PORT: tx.port().default(3000),
    API_KEY: tx.string().default("example-key"),
    DEBUG: tx.bool().default(false),
  };

  it("generates .env.example correctly", () => {
    defineEnv(schema, process.env, { mode: "build", generateExample: true });

    // Ensure file exists
    expect(fs.existsSync(".env.example")).toBe(true);

    // Read content
    const content = fs.readFileSync(".env.example", "utf-8");

    expect(content).toContain("PORT=3000");
    expect(content).toContain("API_KEY");
    expect(content).toContain("DEBUG=false");
  });
});
