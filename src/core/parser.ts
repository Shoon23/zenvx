import { z } from "zod";
import type { ZodObject, ZodRawShape } from "zod";

export function parseEnv<T extends ZodRawShape>(
  schema: ZodObject<T>,
  source: Record<string, string | undefined>
): z.infer<ZodObject<T>> {
  const result = schema.safeParse(source);

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `❌ ${i.path.join(".")}: ${i.message}`)
      .join("\n");

    throw new Error(
      [
        "",
        "┌──────────────────────────────────────────────┐",
        "│  ❌ INVALID ENVIRONMENT VARIABLES DETECTED   │",
        "└──────────────────────────────────────────────┘",
        issues,
        "",
      ].join("\n")
    );
  }

  return result.data;
}
