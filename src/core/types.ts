export type ValidationMode = "runtime" | "build";
export interface DefineEnvOptions {
  mode?: ValidationMode;
  generateExample?: boolean;
  exitOnFail?: boolean;
}
