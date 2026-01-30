import { defineEnv } from "../core/define-env.js";

export function loadServerEnv<T extends Record<string, any>>(shape: T) {
  if (typeof window !== "undefined") {
    throw new Error("Server env cannot be used in the browser");
  }

  return defineEnv(shape, process.env, {
    mode:
      process.env.NEXT_PHASE === "phase-production-build" ? "build" : "runtime",
  });
}

export function loadClientEnv<T extends Record<string, any>>(shape: T) {
  const clientEnv: Record<string, unknown> = {};

  for (const key of Object.keys(shape)) {
    if (!key.startsWith("NEXT_PUBLIC_")) {
      throw new Error(`Client env "${key}" must start with NEXT_PUBLIC_`);
    }
    clientEnv[key] = process.env[key];
  }

  return defineEnv(shape, clientEnv, {
    mode: "build",
  });
}
