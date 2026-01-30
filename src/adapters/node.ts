import { defineEnv } from "../core/define-env.js";

export function loadNodeEnv<T extends Record<string, any>>(shape: T) {
  return defineEnv(shape, process.env, {
    mode: "runtime",
    generateExample: true,
  });
}
