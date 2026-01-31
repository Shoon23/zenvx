# Changelog

## [0.1.3] - 2026-01-21

### Fixed / Improved

- Removed unnecessary `.catch()` in `port` validator.
- Improved `bool` validator to accept both strings ("true"/"false"/"1"/"0") and booleans.
- `positiveNumber` now uses `.gt(0)` for cleaner validation.
- `nonEmptyString` now trims whitespace before validation.
- Improved error messages and consistency across validators.
- General code cleanup and refactor for safer environment variable handling.

## [0.2.0] - 2026-01-28

### Added

- **.env.example auto-generation** from Zod schemas
  - Automatically extracts key names, default values, and validation messages
  - Can optionally add comments describing expected format
  - Example:
    ```env
    DATABASE_URL=
    PORT=3000
    DEBUG=
    ```
- **Runtime vs Build-time validation** for `defineEnv()`
  - `mode: "runtime"` (default): Fail fast and exit process on invalid env
  - `mode: "build"`: Throw errors without exiting, suitable for CI/build-time checks
- Improved `tx.bool()` parsing:
  - Correctly handles `"true"`, `"false"`, `"1"`, `"0"` strings and boolean values
  - Throws on invalid boolean inputs
- `.env.example` placeholder handling:
  - Only shows default values if provided, otherwise blank
  - Comments always show type or message

### Fixed

- `getZodTypeName()` now unwraps `ZodEffects` to detect correct type for transformed schemas

## [0.2.1] - 2026-01-30

### Added

- **Framework adapters** for Node.js, Vite, and Next.js
  - Node: `process.env` + optional `loadDotEnv()`
  - Vite: `import.meta.env` support
  - Next.js: SSR-safe server/client adapters
- `defineEnv()` now accepts a **source object** (`process.env` / `import.meta.env`) as the second argument, making it framework-agnostic
- TypeScript-friendly adapter usage with proper typings for `process.env` and `import.meta.env`
- `.env.example` generation works with new adapter-aware `defineEnv()`
- Core `tx` validators fully compatible with adapters

### Changed / Improved

- `defineEnv()` refactored for **source-agnostic parsing**
- Runtime/build-time mode preserved and fully compatible with adapters
- Tests updated for new signature (`defineEnv(schema, source, options?)`)
- Exports updated for **adapter-specific imports** (`zenvx/node`, `zenvx/vite`, `zenvx/next`)
- Documentation updated for adapter usage examples

### Fixed

- TypeScript errors in Vite (`Property 'env' does not exist on type 'ImportMeta'`) resolved via `ImportMeta` type declaration
- Next.js `process.env` type errors fixed via `NodeJS.ProcessEnv` declaration

## [0.2.2] - 2026-01-30

### Fixed

- Removed `process.exit(1)` from `createTypedProxy` to prevent forced
  process termination when accessing undefined environment variables.
- Improves compatibility with build-time environments (Vite, Next.js)
  and non-Node runtimes.

# Changelog

## 1.0.0 – Stable Release 🎉

This release simplifies zenvx to focus on **native Zod validation only**.

### ⚠️ Breaking Changes

- Removed `tx` helper utilities
- Removed opinionated coercion and strict string rules
- `defineEnv` now requires the Zod instance to be passed explicitly
- Validation behavior is fully controlled by user-defined Zod schemas
- **Next.js and Vite adapters have been removed**
  - Only Node.js environment loading is supported now

### ✅ Added

- Explicit Zod instance injection (`defineEnv(z, schema)`)
- Clear separation of runtime vs build-time validation
- Improved type safety and downstream compatibility
- Cleaner, more predictable environment handling

### 🔄 Changed

- API keys and IDs are now treated as strings by default
- Boolean, number, and port coercion must be explicitly defined using Zod

### ❌ Removed

- `tx.string`, `tx.number`, `tx.bool`, `tx.port`, and all `tx.*` helpers
- Implicit validation and coercion logic
- Next.js and Vite adapters

### 💡 Why

- Prevents accidental type mismatches (e.g., API keys becoming numbers)
- Avoids hidden magic and surprising behavior
- Keeps zenvx lightweight and future-proof
- Aligns closely with native Zod usage

---
