# TypeScript module resolution notes

## What looked confusing

Two errors appeared close together:

1. `Cannot find type definition file for 'node'`
2. `Cannot find module 'alchemy/cloudflare/astro' or its corresponding type declarations`

They look related, but they come from different layers of TypeScript resolution.

## Why each error happened

### 1) Missing global type library (`node`)

The shared base config (`packages/config/tsconfig.base.json`) includes:

- `"types": ["node", "@cloudflare/workers-types"]`

That tells TypeScript to load Node's ambient types globally.
If `@types/node` is not installed in the workspace, TypeScript fails before
normal code checking and reports:

- `Cannot find type definition file for 'node'`

**Fix used**

- Add/install `@types/node` in the repo root dev dependencies.

## 2) Missing declaration for a specific subpath import

In `apps/web/astro.config.mjs`, we import:

- `alchemy/cloudflare/astro`

The package exports that runtime subpath, but TypeScript still needs
declaration info for it when checking JS with `// @ts-check`.
If the package does not expose matching `.d.ts` for that subpath in a way TS
can consume, you get:

- `Cannot find module 'alchemy/cloudflare/astro' or its corresponding type declarations`

**Fix used**

- Add a local ambient declaration:
  - `apps/web/src/types/alchemy-cloudflare-astro.d.ts`

## Why this can happen even when runtime works

Runtime module resolution and TypeScript type resolution are related but not
identical:

- Runtime: "Can Node/Bun/Vite load this JS module?"
- TypeScript: "Can I find type metadata for this module shape?"

So a module can be executable at runtime and still fail type-checking.

## Quick diagnostics next time

1. If error mentions `type definition file` and a library name:
   - check `compilerOptions.types`
   - ensure corresponding `@types/*` package is installed
2. If error mentions `Cannot find module ... or its corresponding type declarations`:
   - verify package/subpath exists in package `exports`
   - if runtime path exists but types do not, add a local `declare module` shim

## Verification commands used

```sh
bunx tsc -p tsconfig.json --noEmit
bunx tsc -p apps/web/tsconfig.json --noEmit --ignoreDeprecations 6.0
```

Note: the second command includes `--ignoreDeprecations 6.0` because this repo
currently uses `baseUrl`, which TS 6 flags as deprecated.
