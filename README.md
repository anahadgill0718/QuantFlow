# QuantFlow — Smart Budget & Expense Analytics

An interactive personal finance dashboard built with React and Recharts, styled around a "quant terminal meets paper ledger" identity. Goes beyond simple tracking with pace-adjusted budget signals, month-end spend projections, and live spending insights — all computed from your actual data, not decorative. Installable as a PWA on iOS and Android.

## Live demo

**[quantflowapp.com](https://quantflowapp.com)**

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
- Edit or delete any transaction inline
- Undo toast after deleting a transaction
- Search/filter the transaction log by merchant or category
- Month tabs automatically roll forward with the calendar, and picking a date outside the visible window shifts the tabs to match
- Sample data preloads on first use and clears automatically once you add a real transaction (with a "Reset to sample data" option to bring it back)

**Data portability**
- Export all transactions across all months as a CSV file
- Import a CSV to restore or merge in transaction history
- Data persists in the browser via localStorage between sessions

## Tech stack

- React
- Recharts (data visualization)
- Tailwind CSS (styling)
- Progressive Web App (installable on iOS & Android)
- Vercel Analytics
- Deployed on Vercel

## Getting started

```bash
npm install
npm run dev
```

## Data

The app starts with sample data for the current month and the two before it. Add your first real transaction and the sample data clears automatically. All data (transactions and budget limits) is saved to your browser's localStorage, so it persists between visits on the same device and browser. Use the Export CSV button to back up your data, and Import CSV to restore it elsewhere.

## Roadmap

- Add real persistence (e.g. Firebase, Supabase, or a small Express + database backend) so data syncs across devices instead of living in one browser
- Recurring transactions (e.g. auto-add rent each month)
- Multi-user support with authentication
- Native App Store / Google Play release



## Screenshot
<img width="1512" height="982" alt="Screenshot 2026-07-31 at 6 19 41 PM" src="https://github.com/user-attachments/assets/c19369ac-6fde-436c-a31d-4cbd4d86a3cc" />
<img width="1512" height="982" alt="Screenshot 2026-07-31 at 6 19 57 PM" src="https://github.com/user-attachments/assets/0bf3c259-9951-41b8-9b2d-ada7f383f6ad" />
<img width="1512" height="982" alt="Screenshot 2026-07-31 at 6 20 04 PM" src="https://github.com/user-attachments/assets/86e15f1f-d40c-409e-b893-f268c99c5c8b" />



## Author

Created by Anahad Gill

