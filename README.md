# zenvx

**Type-safe environment variables with Zen-like peace of mind.**

`zenvx` is a lightweight wrapper around **Zod** and **dotenv** designed to fix the common headaches of environment variables in Node.js / TypeScript. It provides strict validation (blocking `"123"` as an API Key), smart coercion, and beautiful, human-readable error reporting.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/built%20with-TypeScript-blue)
![NPM](https://img.shields.io/npm/v/zenvx)

---

## Why zenvx?

Standard Zod is great, but environment variables are always strings. This leads to common pitfalls:

- `z.string()` accepts `"12345"`, which is usually a mistake for API keys
- `z.boolean()` fails on `"true"` strings
- Validation errors are often ugly JSON dumps that clog your terminal

**zenvx solves this:**

1. **Strict Validators** – `tx.string()` ensures values are text, not just numbers
2. **Smart Coercion** – Automatically handles ports, numbers, and booleans
3. **Beautiful Errors** – Formatting that tells you exactly what to fix

---

## Features

- ✅ Type-safe environment variables
- ✅ Smart coercion for numbers, booleans, and ports
- ✅ Strict validation for strings, URLs, emails, JSON, enums
- ✅ Beautiful, human-readable error reporting
- ✅ Seamless TypeScript integration
- ✅ `.env.example` auto-generation
- ✅ Runtime **and** build-time validation modes

## Installation

```bash
npm install zenvx zod
# or
pnpm add zenvx zod
# or
yarn add zenvx zod
```

> Note: Zod is a peer dependency, so you must have it installed.

## Quick Start

Create a file (e.g., src/env.ts) and export your configuration:

```ts
import { defineEnv } from "zenvx";
import z from "zod";

const schema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535),
  DEBUG: z.preprocess((v) => v === "true" || v === "1", z.boolean()),
  DATABASE_URL: z.string().url(),
  CLOUDINARY_API_KEY: z.string(),
});

export const env = defineEnv(schema);
```

Now use it anywhere in your app:

```ts
import { env } from "./env";

console.log(`Server running on port ${env.PORT}`);
// TypeScript knows env.PORT is a number!
```

## .env.example Auto-Generation

zenvx can automatically generate a .env.example file from your schema — keeping your documentation always in sync.

```ts
defineEnv(schema, { generateExample: true });
```

This produces:

```
# Example environment variables
# Copy this file to .env and fill in the values

DATABASE_URL=  #string
PORT=3000  # number
DEBUG_MODE=  # boolean

```

No more forgotten or outdated .env.example files.

## Runtime vs Build-Time Validation

Different environments need different failure behavior. zenvx supports both.

### Runtime Validation (default)

In runtime mode, environment variables are validated as soon as your application starts.

```ts
defineEnv(schema, { mode: "runtime" });
```

Behavior:

- Environment variables are loaded and validated immediately
- If validation fails:
  - A formatted error message is printed to the console
  - The process exits using process.exit(1)
- Prevents the application from running with invalid configuration

This mode ensures misconfigured environments are caught early and stop execution entirely.

### Build-Time Validation

IIn build-time mode, validation errors are thrown instead of terminating the process.

```ts
defineEnv(schema, { mode: "build" });
```

Behavior:

- Environment variables are validated during execution
- If validation fails:
  - An error is thrown
  - process.exit() is not called
- Allows the calling environment (bundler, test runner, or script) to handle the failure

This mode avoids hard exits and lets external tooling decide how to respond to configuration errors.

## Beautiful Error Handling

If your .env file is missing values or has invalid types, zenvx stops the process immediately and prints a clear message:

```
┌──────────────────────────────────────────────┐
│ ❌ INVALID ENVIRONMENT VARIABLES DETECTED │
└──────────────────────────────────────────────┘
PORT: Must be a valid port (1-65535)
API_KEY: Value should be text, but looks like a number.
DATABASE_URL: Must be a valid URL
```
