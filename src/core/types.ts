export type ValidationMode = "runtime" | "build";
export interface DefineEnvOptions {
  path?: string;
  mode?: ValidationMode;
  generateExample?: boolean;
}
