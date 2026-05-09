# Trading Journal - P&L Tracker

A full-stack paper trading journal to track your win rate across 100 orders and determine readiness for live trading (65% win rate goal).

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database:** Neon (free serverless PostgreSQL)
- **ORM:** Drizzle ORM
- **Charts:** Recharts
- **Excel Export:** exceljs
- **Deployment:** Vercel (free Hobby plan)

## Local Development

1. Clone the repository
2. Copy `.env.example` to `.env.local` and add your Neon database URL
3. Install dependencies:
   ```bash
   npm install
   ```
4. Push the database schema to Neon:
   ```bash
   npx drizzle-kit push
   ```
5. Start the dev server:
   ```bash
   npm run dev
   ```

## Deployment to Vercel (Free)

### Step 1 - Set up the Neon database

Go to [neon.tech](https://neon.tech), create a free account, create a new project, and copy the connection string provided (it looks like `postgresql://user:password@host/dbname?sslmode=require`).

### Step 2 - Push code to GitHub

Initialize a Git repository, commit all files, and push to a new GitHub repository:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/trading-journal.git
git push -u origin main
```

### Step 3 - Deploy to Vercel

Go to [vercel.com](https://vercel.com), log in with your GitHub account, click "New Project," and import the GitHub repository. Vercel will auto-detect Next.js and configure the build settings automatically.

### Step 4 - Add the environment variable

In the Vercel project settings, go to "Environment Variables" and add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string from Step 1 |

### Step 5 - Run database migrations

In your local terminal (with `DATABASE_URL` set in `.env.local`), run:

```bash
npx drizzle-kit push
```

This creates the `trades` table in your Neon database.

### Step 6 - Redeploy

Trigger a redeployment from the Vercel dashboard. The application will be live at `https://your-project-name.vercel.app` within two minutes - completely free with no credit card required.

## Features

- Trade entry form with validation and auto P&L calculation
- Paginated, sortable journal table with color-coded results
- Win rate progress tracker with 65% target marker
- Analytics dashboard with equity curve, strategy/emotion charts
- Auto-generated insights from trading patterns
- Readiness checklist (6 criteria for live trading)
- Excel export with color-coded rows and summary statistics
- Dark/light mode toggle
- Indian Rupee formatting
- Responsive design for mobile and desktop
