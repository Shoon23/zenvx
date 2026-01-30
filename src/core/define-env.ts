import { z } from "zod";
import { parseEnv } from "./parser.js";
import { createTypedProxy } from "./proxy.js";
import type { DefineEnvOptions } from "./types.js";
import { generateExample } from "./generate-example.js";

export function defineEnv<T extends z.ZodRawShape>(
  shape: T,
  source: Record<string, unknown>,
  options?: DefineEnvOptions,
) {
  const schema = z.object(shape);

  const parsed = parseEnv(schema, source, options?.mode ?? "runtime");
  if (options?.generateExample) {
    generateExample(schema);
  }
  return createTypedProxy(parsed as { [K in keyof T]: z.infer<T[K]> });
}
