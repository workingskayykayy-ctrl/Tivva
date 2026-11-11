# Tivva

Tivva is a global short-video social platform. The project is being built in stages for web, Android and iOS, with a shared backend.

## Current stage

The first web foundation is being prepared:
- Responsive discovery/feed interface
- Creator cards and video-preview placeholders
- Initial signup/login interface mockup
- Responsive mobile navigation

**Important:** Authentication, real video uploads, persistent likes/follows, moderation and creator payouts are not connected yet. The preview cards are sample interface content, not real user videos.

## Planned architecture

- Web: Next.js and TypeScript
- Mobile: React Native with Expo (planned)
- Shared authentication and database: Supabase (to be configured)
- Video storage and streaming: managed video platform (to be selected and configured)

## Run locally

1. Install Node.js (LTS).
2. Run `npm install`.
3. Run `npm run dev`.
4. Open http://localhost:3000.

Never commit passwords, API secrets, service-role keys, or private user data.