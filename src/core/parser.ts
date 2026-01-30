import { z } from "zod";
import type { ZodObject, ZodRawShape } from "zod";
import type { ValidationMode } from "./types.js";

export function parseEnv<T extends ZodRawShape>(
  schema: ZodObject<T>,
  source: Record<string, unknown>,
  mode: ValidationMode = "runtime",
): z.infer<ZodObject<T>> {
  const result = schema.safeParse(source);

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `❌ ${i.path.join(".")}: ${i.message}`)
      .join("\n");

    const header =
      mode === "build"
        ? [
            "┌──────────────────────────────────────────────┐",
            "│  ❌ INVALID ENVIRONMENT VARIABLES DETECTED   │",
            "└──────────────────────────────────────────────┘",
          ]
        : [
            "┌──────────────────────────────────────────────┐",
            "│ ⚠ WARNING INVALID ENVIRONMENT VARIABLES ⚠  │",
            "└──────────────────────────────────────────────┘",
          ];

    const box = ["", ...header, issues, ""].join("\n");

    if (mode === "build") {
      throw new Error(box);
    } else {
      console.warn(box);
      process.exit(1);
    }
  }

  return result.success ? result.data : ({} as z.infer<ZodObject<T>>);
}
