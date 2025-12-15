# LifeSignal Demo MVP (Advertiser Package)

This is a **downloadable, self-contained demo** you can run locally to show an advertiser:
- a polished marketing homepage
- a beta landing page with a working signup form
- a **mock backend** that stores signups to `data/beta-signups.json`
- an invite-link experience for referrals (demo)

> This is **not** the production backend. It is intentionally mocked so you can run it with **zero credentials**.

## Quick start (Windows PowerShell)

```powershell
cd lifesignal-demo-mvp
npm install
npm run dev
```

Open:
- http://localhost:3000  (Homepage)
- http://localhost:3000/beta  (Beta signup)

## Where signups go

On submit, records are written to:

`data/beta-signups.json`

## How the “invite link” works

After signup, the server returns:
`http://localhost:3000/beta?ref=<referralCode>`

In production, swap this for real referral codes tied to user accounts.

## Next production step (when you’re ready)

Replace the mock API route:

`app/api/beta-signups/route.ts`

with:
- Supabase insert into `beta_signups`
- optional email/SMS confirmation
- promotion workflow to create production accounts

Generated: 2025-12-13
