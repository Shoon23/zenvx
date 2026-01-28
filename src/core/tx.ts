import { z } from "zod";
const SEMVER_REGEX = /^\d+\.\d+\.\d+(-[0-9A-Za-z-.]+)?$/;

export const tx = {
  /**
   * STRICT STRING:
   * Rejects purely numeric strings (e.g. "12345").
   * Good for API Keys.
   */
  string: (message = "Value should be text, but looks like a number.") =>
    z
      .string()
      .trim()
      .regex(/^(?!\d+$).+$/, { error: message })
      .describe("Non-numeric string"),

  /**
   * SMART NUMBER:
   * Automatically converts "3000" -> 3000.
   * Fails if the value is not a valid number (e.g. "abc").
   */
  number: (message = "Must be a number") =>
    z.coerce.number({ error: message }).finite().describe("Numeric value"),

  /**
   * PORT VALIDATOR:
   * Coerces to number and ensures it is between 1 and 65535.
   */
  port: (message = "Must be a valid port (1–65535)") =>
    z.coerce
      .number({ error: message })
      .int()
      .min(1)
      .max(65535)
      .describe("TCP/UDP port number (1–65535)"),
  /**
   * SMART BOOLEAN:
   * Handles "true", "TRUE", "1" -> true
   * Handles "false", "FALSE", "0" -> false
   * Throws error on anything else.
   */
  bool: (message?: string) => {
    return z.union([z.string(), z.boolean()]).transform((val, ctx) => {
      if (typeof val === "boolean") return val;

      const v = val.toLowerCase();
      if (v === "true" || v === "1") return true;
      if (v === "false" || v === "0") return false;

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: message || 'Must be a boolean ("true"/"false"/"1"/"0")',
      });
      return z.NEVER;
    });
  },

  /**
   * URL:
   * Strict URL checking.
   */
  url: (message = "Must be a valid URL (e.g. https://...)") =>
    z.url({ error: message }).describe("A valid URL including protocol"),

  email: (message = "Must be a valid email address") =>
    z.email({ error: message }).describe("A valid email address"),

  positiveNumber: (message = "Must be > 0") =>
    z.coerce.number().gt(0, { error: message }).describe("A positive number"),

  nonEmptyString: (message = "Cannot be empty") =>
    z.string().trim().min(1, { error: message }).describe("A non-empty string"),

  semver: (message = "Must be valid semver") =>
    z
      .string()
      .regex(SEMVER_REGEX, { error: message })
      .describe("Semantic version (x.y.z)"),

  path: (message = "Must be a valid path") =>
    z.string().trim().min(1, { error: message }).describe("Filesystem path"),

  enum: <T extends readonly [string, ...string[]]>(
    values: T,
    message = `Must be one of: ${values.join(", ")}`,
  ) =>
    z.enum(values, { error: message }).describe(`One of: ${values.join(", ")}`),

  json: <T = unknown>(message = "Must be valid JSON") =>
    z
      .string()
      .transform<T>((val, ctx) => {
        try {
          return JSON.parse(val);
        } catch {
          ctx.addIssue({
            code: "custom",
            error: message,
          });
          return z.NEVER;
        }
      })
      .describe("JSON-encoded value"),
};
