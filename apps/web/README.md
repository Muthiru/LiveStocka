# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Environment Variables

This app expects Supabase env vars (both locally and on Vercel):

- `SUPABASE_URL` (or `NUXT_PUBLIC_SUPABASE_URL`)
- `SUPABASE_ANON_KEY` (or `NUXT_PUBLIC_SUPABASE_ANON_KEY`)

On Vercel, add them in **Project Settings → Environment Variables** (Vercel does not automatically load `apps/web/.env` into production).

For OAuth login, also set `NUXT_PUBLIC_APP_URL` to the deployed site URL, for example `https://livestocka.vercel.app`, and add that exact URL to Supabase Auth redirect URLs alongside `http://localhost:3000` for local development.

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
