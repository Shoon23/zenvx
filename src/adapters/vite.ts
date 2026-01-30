import { defineEnv } from "../core/define-env.js";
export function loadViteEnv<T extends Record<string, any>>(shape: T) {
  return defineEnv(shape, import.meta.env, {
    mode: "build",
  });
}
