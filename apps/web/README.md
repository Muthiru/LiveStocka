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

For OAuth login:
- In production, set `NUXT_PUBLIC_APP_URL` to the deployed site URL (for example `https://livestocka.vercel.app`).
- In local development, set `NUXT_PUBLIC_APP_URL` to `http://localhost:3000` (especially if you access the dev server via a LAN IP).
- In Supabase Auth settings, add both `https://livestocka.vercel.app/auth/callback` and `http://localhost:3000/auth/callback` to the redirect allowlist.

### Edge Functions in local dev

Most create/update/delete flows call Supabase Edge Functions. If Edge Functions are not deployed (or temporarily unreachable),
the app will attempt a direct PostgREST fallback for deletes. For full functionality, deploy functions to your Supabase project:

```bash
supabase functions deploy cowService
supabase functions deploy healthRecordService
```

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
