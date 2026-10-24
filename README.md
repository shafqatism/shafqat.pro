# shafqat.pro

Portfolio and lead-generation site for Shafqat Rasool, built with Next.js 16 (Cache Components), Tailwind CSS v4, shadcn/ui, Aceternity-style motion components, three.js and Supabase.

## What's inside

| Area | Where |
| --- | --- |
| Static pages: Home, About, Services, Portfolio (+42 project pages), Contact, Book a Meeting | `src/app/(site)` |
| Content (services, products, projects, case studies) | `src/lib/content.ts` |
| Runtime settings & per-page SEO (cached, refreshed on save) | `src/lib/settings.ts`, `src/lib/seo.ts` |
| Contact + booking APIs (proxy to Supabase Edge Functions) | `src/app/api/contact`, `src/app/api/booking` |
| Admin dashboard (Supabase Auth) | `src/app/admin` |
| Claude AI assistant (SEO + lead replies) | `src/app/api/ai` |
| Supabase schema, RLS, storage bucket | `supabase/migrations` |
| Edge Functions: `public-forms`, `admin-tools`, `automation` | `supabase/functions` |

Every public page is prerendered as static HTML. The contact form and the meeting booking widget run dynamically: live availability, Google Calendar sync, email and WhatsApp notifications, and Meta CAPI. Changes made in the admin dashboard, or through the automation API, refresh the cached pages right away.

## Setup

1. `cp .env.example .env.local` and fill it in. `SITE_FUNCTIONS_SECRET` must match the `site_functions_secret` row in `public.integration_secrets`.
2. `npm install && npm run dev`, then open http://localhost:3000.
3. Create your admin login: in Supabase go to **Authentication → Users → Add user** and use `info@shafqat.pro`. Any email listed in `public.admin_emails` becomes an admin when the user is created.
4. Sign in at `/admin`, then fill in **Integrations**: tracking IDs, business email, Google Calendar, WhatsApp, and the Meta Conversions API.

## Deploying (Vercel)

Set the same env vars in your host, but with `NEXT_PUBLIC_SITE_URL=https://shafqat.pro`. Then set **Admin → SEO → Site URL** to the production domain. The automation API uses that URL to refresh the live site.

## Automation with Claude

Go to **Admin → Claude & Automation** to create an API token. Claude, or any workflow tool, can then read leads and bookings, update SEO, and change tracking settings through `/functions/v1/automation`.
