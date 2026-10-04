#!/usr/bin/env bash
# Usage: npx supabase login  (once), then: bash deploy-supabase.sh
set -e
set -a; source .env; set +a
npx supabase link --project-ref "$SUPABASE_PROJECT_REF"
npx supabase db push
printf 'GEMINI_API_KEY=%s\n' "$GEMINI_API_KEY" > supabase/.env
npx supabase secrets set --env-file supabase/.env
npx supabase functions deploy ai
