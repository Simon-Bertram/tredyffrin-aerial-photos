# tredyffrin-aerial-photos

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines Astro, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **Astro** - The web framework for content-driven websites
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Turborepo** - Optimized monorepo build system

## Getting Started

Use **Bun 1.3.12** (see [`.bun-version`](.bun-version)). Prefer the pinned
install at `~/.bun/bin/bun`, or put it first on your `PATH`.

First, install the dependencies:

```bash
bun install
```

After changing any `package.json`, run `bun install` again and commit the
updated `bun.lock` in the same change. CI runs `bun install --frozen-lockfile`.

Then, run the development server:

```bash
bun run dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser to see the web application.

## Deployment (Cloudflare via Alchemy)

Use **Bun 1.3.12** (see [`.bun-version`](.bun-version)). Copy
[`packages/infra/.env.example`](packages/infra/.env.example) to `packages/infra/.env`
and set `PUBLIC_SERVER_URL`, `ALCHEMY_STAGE`, and Cloudflare credentials.

- Preflight: `bun run deploy:preflight`
- Deploy (with prerender checks): `bun run deploy:safe`
- Deploy only: `bun run deploy`
- Infra dev: `bun run dev:infra`
- Destroy: `bun run destroy`

For more details, see the guide on [Deploying to Cloudflare with Alchemy](https://www.better-t-stack.dev/docs/guides/cloudflare-alchemy).

## Project Structure

```
tredyffrin-aerial-photos/
├── apps/
│   ├── web/         # Frontend application (Astro)
```

## Available Scripts

- `bun run dev`: Start all applications in development mode
- `bun run build`: Build all applications
- `bun run dev:web`: Start only the web application
- `bun run check-types`: Check TypeScript types across all apps
