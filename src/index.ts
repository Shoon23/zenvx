import { z } from "zod";
import { loadDotEnv } from "./loaders/dotenv.js";
import { parseEnv } from "./core/parser.js";
import { createTypedProxy } from "./core/proxy.js";
interface DefineEnvOptions {
  path?: string;
}
export const tx = {
  /**
   * STRICT STRING:
   * Rejects purely numeric strings (e.g. "12345").
   * Good for API Keys.
   */
  string: (message?: string) =>
    z.string().refine((val) => !/^\d+$/.test(val), {
      error: message || "Value should be text, but looks like a number.",
    }),

  /**
   * SMART NUMBER:
   * Automatically converts "3000" -> 3000.
   * Fails if the value is not a valid number (e.g. "abc").
   */
  number: (message?: string) =>
    z.coerce.number({ error: message || "Must be a number" }),

  /**
   * PORT VALIDATOR:
   * Coerces to number and ensures it is between 1 and 65535.
   */
  port: (message?: string) =>
    z.coerce
      .number()
      .min(1)
      .max(65535)
      .catch((ctx) => {
        // Catch allows us to customize the error if the coercion fails completely
        ctx.error; // re-throw internal error logic
        return -1; // dummy return (Zod handles the failure)
      })
      .refine((val) => val >= 1 && val <= 65535, {
        error: message || "Must be a valid port (1-65535).",
      }),

  /**
   * SMART BOOLEAN:
   * Handles "true", "TRUE", "1" -> true
   * Handles "false", "FALSE", "0" -> false
   * Throws error on anything else.
   */
  bool: (message?: string) =>
    z.string().transform((val, ctx) => {
      const v = val.toLowerCase();
      if (v === "true" || v === "1") return true;
      if (v === "false" || v === "0") return false;

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        error: message || "Must be a boolean (true/false or 1/0).",
      });
      return z.NEVER;
    }),

  /**
   * URL:
   * Strict URL checking.
   */
  url: (message?: string) =>
    z.url({ error: message || "Must be a valid URL (e.g. https://...)" }),

  /**
   * EMAIL:
   * Strict Email checking.
   */
  email: (message?: string) =>
    z.email({ error: message || "Must be a valid email address." }),
  positiveNumber: (message?: string) =>
    z.coerce
      .number()
      .refine((val) => val > 0, { error: message || "Must be > 0" }),
  nonEmptyString: (message?: string) =>
    z.string().min(1, { error: message || "Cannot be empty" }),
  semver: (message?: string) =>
    z.string().refine((val) => /^\d+\.\d+\.\d+(-[0-9A-Za-z-.]+)?$/.test(val), {
      error: message || "Must be valid semver",
    }),
  path: (message?: string) =>
    z.string().min(1, { error: message || "Must be a valid path" }),
  enum: <T extends readonly [string, ...string[]]>(
    values: T,
    message?: string
  ) =>
    z.string().refine((val) => values.includes(val), {
      error: message || `Must be one of: ${values.join(", ")}`,
    }),
  json: (message?: string) =>
    z.string().transform((val, ctx) => {
      try {
        return JSON.parse(val);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: message || "Must be valid JSON",
        });
        return z.NEVER;
      }
    }),
};

export function defineEnv<T extends z.ZodRawShape>(
  shape: T,
  options?: DefineEnvOptions
) {
  const fileEnv = loadDotEnv(options?.path);
  const merged = { ...fileEnv, ...process.env };
  const schema = z.object(shape);

  const parsed = parseEnv(schema, merged);
  return createTypedProxy(parsed as { [K in keyof T]: z.infer<T[K]> });
}
