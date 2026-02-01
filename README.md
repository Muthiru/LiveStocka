# LiveStocka - Cattle Tracking App

A comprehensive cattle tracking solution for farmers and ranchers.

## Project Structure

- `apps/web/` - Nuxt 3 web application
- `apps/mobile/` - Capacitor mobile application
- `packages/shared/` - Shared types and utilities
- `packages/database/` - Database schemas and migrations
- `docs/` - Documentation

## Setup Instructions

1. **Supabase Setup**:
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to SQL Editor and run the script in `packages/database/setup.sql`
   - Copy your project URL and anon key from Settings > API

2. **Environment Variables**:
   - Create `.env` file in `apps/web/`:
     ```
     SUPABASE_URL=your_supabase_url
     SUPABASE_ANON_KEY=your_anon_key
     ```

3. **Install Dependencies**:
   ```bash
   cd apps/web && npm install
   cd ../mobile && npm install
   ```

4. **Run Development Servers**:
   ```bash
   cd apps/web && npm run dev  # http://localhost:3000
   cd ../mobile && npm run dev # http://localhost:5173
   ```

## Deployment

- **Web**: Deploy to Vercel (free tier)
  1. Sign up at vercel.com
  2. Connect your GitHub repo
  3. Deploy the `apps/web` directory
  4. Set environment variables: SUPABASE_URL, SUPABASE_ANON_KEY

- **Mobile**: Build with Capacitor and deploy to app stores
  1. Add Capacitor: `npx cap add android` and `npx cap add ios`
  2. Build: `npm run build && npx cap sync`
  3. Open in Android Studio/XCode and deploy

- **Database**: Use Supabase (free tier)
  1. Sign up at supabase.com
  2. Create a new project
  3. Run SQL migrations from `packages/database/`
  4. Copy URL and anon key to Vercel env vars

## Requirements

See [REQUIREMENTS.md](REQUIREMENTS.md) for detailed specifications.