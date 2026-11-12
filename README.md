# Tivva

Tivva is a global short-video social platform. The project is being built in stages for web, Android and iOS, with a shared backend.

## Current stage

- Supabase browser client configured using public environment variables
- Email/password signup and login wired to Supabase Auth

The first web foundation is being prepared:
- Responsive discovery/feed interface
- Creator cards and video-preview placeholders
- Initial signup/login interface mockup
- Responsive mobile navigation

**Important:** Email/password signup and login are connected to Supabase Auth once the two environment variables below are set. Email confirmation may be required by the Supabase Auth settings. Real video uploads, persistent likes/follows, moderation and creator payouts are not connected yet. The preview cards are sample interface content, not real user videos.

## Planned architecture

- Web: Next.js and TypeScript
- Mobile: React Native with Expo (planned)
- Shared authentication and database: Supabase (to be configured)
- Video storage and streaming: managed video platform (to be selected and configured)

## Supabase environment variables

Set these in Vercel for Production, Preview and Development:

- `NEXT_PUBLIC_SUPABASE_URL` — the Tivva Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — the Supabase publishable key (safe for browser use; never use a secret/service-role key here)

See `.env.example` for the variable names. Never commit real keys or passwords.

## Run locally

1. Install Node.js (LTS).
2. Run `npm install`.
3. Run `npm run dev`.
4. Open http://localhost:3000.

Never commit passwords, API secrets, service-role keys, or private user data.