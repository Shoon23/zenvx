import type * as z from "zod";
import { createTypedProxy } from "./proxy.js";
import type { DefineEnvOptions } from "./types.js";
import { generateExample } from "./generate-example.js";
import { parseEnv } from "./parser.js";

export function defineEnv<TSchema extends z.ZodObject<z.ZodRawShape>>(
  schema: TSchema,
  options?: DefineEnvOptions,
): z.infer<TSchema> {
  const parsed = parseEnv(schema, process.env, {
    exitOnFail: options?.exitOnFail ?? false,
    mode: options?.mode ?? "runtime",
  });

  if (options?.generateExample) {
    generateExample(schema);
  }

  return createTypedProxy(parsed);
}
