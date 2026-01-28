import { z } from "zod";
import { loadDotEnv } from "../loaders/dotenv.js";
import { parseEnv } from "./parser.js";
import { createTypedProxy } from "./proxy.js";
import type { DefineEnvOptions } from "./types.js";
import { generateExample } from "./generate-example.js";

export function defineEnv<T extends z.ZodRawShape>(
  shape: T,
  options?: DefineEnvOptions,
) {
  const fileEnv = loadDotEnv(options?.path);
  const merged = { ...fileEnv, ...process.env };
  const schema = z.object(shape);

  const parsed = parseEnv(schema, merged, options?.mode ?? "runtime");

  if (options?.generateExample) {
    generateExample(schema);
  }
  return createTypedProxy(parsed as { [K in keyof T]: z.infer<T[K]> });
}
