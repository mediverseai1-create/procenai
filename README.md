# ProcenAI

AI procurement platform for commerce businesses — React + Vite + Tailwind v4 frontend, Supabase backend (Auth, Postgres with RLS, Edge Functions), Gemini for AI.

## Pages
- `/` marketing site (hero composer, how it works, platform, teams, business controls, pricing, demo CTA)
- `/auth`, `/reset-password`, `/onboarding`
- App: `/dashboard`, `/workspace` (AI chat + online research + landed-cost calculator), `/copywriter`, `/design-studio`, `/saved`, `/settings`

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Run `supabase/migrations/0001_init.sql` in the Supabase SQL editor.
4. Deploy the AI function (the Gemini key stays server-side):
   ```bash
   supabase link --project-ref YOUR_REF
   supabase secrets set GEMINI_API_KEY=your-gemini-key
   supabase functions deploy ai
   ```
5. `npm run dev`

In Supabase Auth settings, add your site URL and `/reset-password` as redirect URLs.

## Payments
Paid plan buttons link to the Selar checkout pages in `src/pages/Landing.tsx`. To switch plan automatically after payment, point a payment webhook at an edge function that updates `profiles.plan` with the service role (users cannot change their own plan; see `protect_plan` trigger).
