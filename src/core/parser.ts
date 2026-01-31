import type * as z from "zod";
import type { ValidationMode } from "./types.js";

export function parseEnv<TSchema extends z.ZodObject<z.ZodRawShape>>(
  schema: TSchema,
  source: Record<string, unknown>,

  options?: {
    exitOnFail?: boolean;
    mode?: ValidationMode;
  },
): z.infer<TSchema> {
  const mode = options?.mode ?? "runtime";
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
    }

    console.warn(box);
    if (options?.exitOnFail ?? true) {
      process.exit(1);
    }
  }

  return result.data as z.infer<TSchema>;
}
