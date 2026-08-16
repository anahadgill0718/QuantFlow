# QuantFlow — Smart Budget & Expense Analytics

A full-stack personal finance dashboard built with React and Recharts, styled around a "quant terminal meets paper ledger" identity. Goes beyond simple tracking with pace-adjusted budget signals, month-end spend projections, automated recurring transactions, and live spending insights — all computed from your actual data, not decorative. Backed by a secure Supabase database so your data syncs across every device you sign in on. Installable as a PWA on iOS and Android.

## Live demo

**[quantflowapp.com](https://quantflowapp.com)** — opens on a marketing landing page (the site's own "quant terminal meets paper ledger" identity carried through into a scroll-driven hero) before handing off to sign-in.

## Install as an app

QuantFlow is a Progressive Web App (PWA) — install it directly to your phone's home screen, no App Store required:

**iOS (Safari):**
1. Open [quantflowapp.com](https://quantflowapp.com) in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"

**Android (Chrome):**
1. Open [quantflowapp.com](https://quantflowapp.com) in Chrome
2. Tap the menu (⋮) in the top right
3. Tap "Add to Home Screen" or "Install app"

Once installed, it opens full-screen with its own icon, just like a native app.

## Features

**Overview & insights**
- Monthly net balance with savings rate
- Smart insight banner comparing this month's spending to last month's and naming the biggest driver
- Live-updating quant stats: average monthly spend, 3-month spend volatility (standard deviation), and an overall efficiency rating (Strong / Stable / At Risk)
- Scrolling ticker strip showing each category's share of spend and its month-over-month change

**Accounts & security**
- Sign up and sign in with email and password, powered by Supabase Auth
- Self-service password reset via emailed recovery link
- Each user's data lives in its own protected database row, enforced with Postgres Row Level Security — no user can ever read or write another user's data
- Data syncs automatically across every device you sign in on

**Charts**
- Spending breakdown by category (donut chart)
- 3-month income vs. expense trend (bar chart)
- KPI cards for Income, Expenses, Savings, and Savings Rate — each with a mini trend sparkline and a ▲/▼ delta vs. last month

**Budgeting**
- Budget vs. actual per category, with pace-adjusted signals (ON PACE / WATCH / OVER) that account for how far through the month you are — not just a flat percentage
- Month-end spend projection based on your current daily burn rate
- Editable budget limits — click the ✎ next to any category to set your own number
- Add or remove custom categories with their own limits

**Transactions**
- Add income or expense transactions via an in-app form, with comma-friendly amount entry (e.g. 1,000,000)
- Mark any transaction as recurring — it automatically re-logs itself on the same day every month (e.g. rent, paycheck, subscriptions), with no manual re-entry
- View, pause, or remove recurring rules at any time
- Edit or delete any transaction inline
- Undo toast after deleting a transaction
- Search/filter the transaction log by merchant or category
- Month tabs automatically roll forward with the calendar, and picking a date outside the visible window shifts the tabs to match
- Sample data preloads on first use and clears automatically once you add a real transaction (with a "Reset to sample data" option to bring it back)

**Data portability**
- Export all transactions across all months as a CSV file
- Import a CSV to restore or merge in transaction history

## Tech stack

- React
- Recharts (data visualization)
- Tailwind CSS (styling)
- Supabase (PostgreSQL database, authentication, Row Level Security)
- Progressive Web App (installable on iOS & Android)
- Vercel Analytics
- Deployed on Vercel

## Getting started

```bash
npm install
npm run dev
```

You'll also need a Supabase project — see `supabase_schema.sql` for the database schema and Row Level Security policies, and set `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` in a `.env` file.

## Data

The app starts with sample data for the current month and the two before it. Add your first real transaction and the sample data clears automatically. All data (transactions, budgets, and recurring rules) is stored in a Supabase Postgres database, scoped to your account with Row Level Security, so it's available on any device you sign into. Use the Export CSV button to back up your data, and Import CSV to restore it elsewhere.

## Roadmap

- Native App Store / Google Play release



## Screenshot
<img width="1512" height="860" alt="Screenshot 2026-08-15 at 11 54 19 PM" src="https://github.com/user-attachments/assets/badc1462-ac3e-4149-86ce-ce7d4cc6b2ef" />
<img width="1512" height="860" alt="Screenshot 2026-08-15 at 11 54 09 PM" src="https://github.com/user-attachments/assets/d0a2cfc4-1563-46d2-8025-4144d4fdab0c" />
<img width="1497" height="860" alt="Screenshot 2026-08-15 at 11 53 51 PM" src="https://github.com/user-attachments/assets/a8be240b-a445-4ae1-89c1-46750591c3c4" />




## Author

Created by Anahad Gill
