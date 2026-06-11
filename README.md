# Commitly

Public accountability platform for ambitious college students and young professionals. Set goals, check in daily, compete on leaderboards, and hold each other accountable.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Backend / DB / Auth:** Supabase (Postgres + Auth + Storage)
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** TanStack Query (React Query)
- **Email:** Resend
- **Deployment:** Vercel

## Local Setup

### 1. Clone and install

```bash
git clone <your-repo> && cd commitly && npm install
```

### 2. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a project, then copy from **Settings → API**:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### 3. Configure environment variables

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the database migration

In Supabase dashboard → **SQL Editor**, paste and run `supabase/migrations/001_initial.sql`.

### 5. Load seed data (optional)

Run `supabase/seed.sql` in the SQL Editor.

### 6. Run locally

```bash
npm run dev
```

## Supabase Auth Setup

In **Authentication → Settings**: enable email/password, set Site URL to `http://localhost:3000`, add redirect URL `http://localhost:3000/**`.

## Deployment to Vercel

1. Push to GitHub, import at vercel.com
2. Add all env vars
3. Update `NEXT_PUBLIC_APP_URL` and Supabase redirect URLs to production domain

## Project Structure

```
src/app/(auth)/         # Login, signup, onboarding
src/app/(app)/          # Dashboard, feed, goals, profile, groups, leaderboards, admin
src/components/         # Sidebar, GoalCard, CheckInModal
src/lib/                # Supabase clients, streak logic, queries, utils
src/types/              # TypeScript types
supabase/               # DB migrations and seed data
```

## Future Roadmap

- Real-money stakes (Stripe escrow)
- AI proof verification (GPT-4V photo validation)
- Native app (React Native + push notifications)
- Campus leaderboards (verified .edu emails)
- Accountability contracts with witnesses
- Coach accounts
- Weekly email recaps via Resend + cron
- Strava / Apple Health auto check-in integrations

## Getting Started (original)

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
