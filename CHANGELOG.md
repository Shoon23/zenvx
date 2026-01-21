# Changelog

## [0.1.3] - 2026-01-21

### Fixed / Improved

- Removed unnecessary `.catch()` in `port` validator.
- Improved `bool` validator to accept both strings ("true"/"false"/"1"/"0") and booleans.
- `positiveNumber` now uses `.gt(0)` for cleaner validation.
- `nonEmptyString` now trims whitespace before validation.
- Improved error messages and consistency across validators.
- General code cleanup and refactor for safer environment variable handling.
