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

```javascript
import { defineEnv, tx } from "zenvx";

export const env = defineEnv({
  // 1. Smart Coercion
  PORT: tx.port(), // Coerces "3000" -> 3000
  DEBUG: tx.bool(), // Coerces "true"/"1" -> true

  // 2. Strict Validation
  DATABASE_URL: tx.url(), // Must be a valid URL
  API_KEY: tx.string(), // "12345" will FAIL (Must be text)

  // 3. Native Zod Support (optional)
  NODE_ENV: tx.enum(["development", "production"]),
});
```

Now use it anywhere in your app:

```javascript
import { env } from "./env";

console.log(`Server running on port ${env.PORT}`);
// TypeScript knows env.PORT is a number!
```

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

# The `tx` Validator Helper

`zenvx` provides a `tx` object with pre-configured Zod schemas optimized for `.env` files.

| Validator        | Description                                                        | Example Input (.env) | Result (JS)     |
| ---------------- | ------------------------------------------------------------------ | -------------------- | --------------- |
| `tx.string()`    | Strict string. Rejects purely numeric values (prevents lazy keys). | `abc_key`            | `"abc_key"`     |
| `tx.number()`    | Coerces string to number.                                          | `"50"`               | `50`            |
| `tx.bool()`      | Smart boolean. Accepts true, false, 1, 0.                          | `"true"`, `"1"`      | `true`          |
| `tx.port()`      | Validates port range (1-65535).                                    | `"3000"`             | `3000`          |
| `tx.url()`       | Strict URL validation.                                             | `"https://site.com"` | `"https://..."` |
| `tx.email()`     | Valid email address.                                               | `"admin@app.com"`    | `"admin@..."`   |
| `tx.json()`      | Parses a JSON string into an Object.                               | `{"foo":"bar"}`      | `{foo: "bar"}`  |
| `tx.enum([...])` | Strict allow-list.                                                 | `"PROD"`             | `"PROD"`        |
| `tx.ip()`        | Validates IPv4 format.                                             | `"192.168.1.1"`      | `"192..."`      |

## Customizing Error Messages

Every tx validator accepts an optional custom error message.

```javascript
export const env = defineEnv({
  API_KEY: tx.string("Please provide a REAL API Key, not just numbers!"),
  PORT: tx.port("Port is invalid or out of range"),
});
```

## Advanced Configuration

Custom .env Path

By default, zenvx looks for .env in your project root. You can change this:

```javascript
export const env = defineEnv(
  {
    PORT: tx.port(),
  },
  {
    path: "./config/.env.production",
  },
);
```

## Mixing with Standard Zod

You can mix tx helpers with standard Zod schemas if you need specific logic.

```javascript
import { defineEnv, tx } from "zenvx";
import { z } from "zod";

export const env = defineEnv({
  PORT: tx.port(),

  // Standard Zod Schema
  APP_NAME: z.string().min(5).default("My Super App"),
});
```
