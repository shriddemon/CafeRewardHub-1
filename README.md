# Cafe Rewards Platform

A SaaS platform for cafe reward management with gamification, WhatsApp integration, and dual portals for owners and customers.

## Features

- 🏪 Cafe owner dashboard for managing rewards, customers, and games
- 👤 Customer portal for playing games and earning rewards
- 🎮 Multiple game types: Spin wheel, Scratch card, Memory card, Quiz, Word scramble
- 📱 WhatsApp integration for notifications
- 📊 Analytics and reporting for cafe owners
- 💰 Points system with reward redemption

## Deploying to Vercel

### Prerequisites

1. A Vercel account
2. PostgreSQL database (we recommend using Neon.tech)

### Step 1: Set up your environment variables

Make sure to add the following environment variables in your Vercel project settings:

- `DATABASE_URL`: Your PostgreSQL connection string
- `SESSION_SECRET`: A random string for session encryption

### Step 2: Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Select the repository in Vercel dashboard
3. Configure the project with the following settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Deploy your project

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
export DATABASE_URL=your_database_url
export SESSION_SECRET=your_session_secret

# Run migrations
npm run db:push

# Seed the database
npm run db:seed

# Start the development server
npm run dev
```

## Tech Stack

- Frontend: React, TailwindCSS, Shadcn UI
- Backend: Express.js, Passport.js 
- Database: PostgreSQL with Drizzle ORM
- Authentication: Express Session + Passport.js
- API: REST
- WebSockets: For real-time notifications