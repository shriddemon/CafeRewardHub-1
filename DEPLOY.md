# Deploying to Vercel

This guide provides step-by-step instructions for deploying the Cafe Rewards Platform on Vercel.

## Prerequisites

1. A Vercel account
2. A PostgreSQL database (recommended: Neon.tech)

## Setting Up PostgreSQL on Neon.tech

1. Create an account on [Neon.tech](https://neon.tech)
2. Create a new project
3. Get your connection string which will look like:
   ```
   postgres://[user]:[password]@[host]/[database]
   ```

## Deploying to Vercel

### Step 1: Prepare Your Repository

1. Make sure your repository contains:
   - `vercel.json` (already created)
   - Proper build scripts in `package.json` (already set up)

### Step 2: Connect to Vercel

1. Sign up or log in to [Vercel](https://vercel.com)
2. Click "Add New..." > "Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Other
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Step 3: Set Environment Variables

Add these environment variables:

- `DATABASE_URL` - Your PostgreSQL connection string from Neon.tech
- `SESSION_SECRET` - Any random string for session security
- `PORT` - Leave this to Vercel to manage

### Step 4: Deploy

1. Click "Deploy"
2. Vercel will build and deploy your application
3. When complete, click the deployment URL to view your site

## Post-Deployment

### Seeding the Database

After deployment, you need to seed the database:

1. Clone the repository locally
2. Set up the same DATABASE_URL locally 
3. Run:
   ```bash
   npm run db:push
   npm run db:seed
   ```

### Troubleshooting

If you encounter issues:

1. Check Vercel logs from your project dashboard
2. Ensure your DATABASE_URL is correct and accessible from Vercel
3. Verify that your database tables were created properly
4. Check that session management is working correctly

## Environment Variables Reminder

Remember these are required:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Random string for session security