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
