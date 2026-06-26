# CHAMPIONS logs Setup Guide - Next.js v15

This guide will walk you through getting all required credentials and setting up your project.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git (for version control)
- A code editor (VS Code recommended)

---

## Step 1: Database Setup (PostgreSQL)

### Option A: Local PostgreSQL

1. **Install PostgreSQL** from https://www.postgresql.org/download/
2. **Create a database**:
   ```bash
   createdb CHAMPIONSlogs_db
   ```
3. **Set DATABASE_URL**:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/CHAMPIONSlogs_db"
   ```

### Option B: Neon (Recommended - Free Cloud Database)

1. Go to https://neon.tech
2. Sign up with GitHub or email
3. Create a new project
4. Copy the connection string from the "Connection string" section
5. Set `DATABASE_URL` to this connection string

### Option C: Railway or Supabase

- **Railway**: https://railway.app
- **Supabase**: https://supabase.com (also includes PostgreSQL)

---

## Step 2: Authentication Setup

### A. Generate AUTH_SECRET

Run this command in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and set it as `AUTH_SECRET` in your `.env.local`

---

### B. GitHub OAuth

1. Go to https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill in the form:
   - **Application name**: CHAMPIOSBlogs
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy **Client ID** and generate a new **Client Secret**
6. Set in `.env.local`:
   ```
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```

---

### C. Google OAuth

1. Go to https://console.cloud.google.com
2. Create a new project or select existing one
3. Enable **Google+ API**:
   - Click "APIs & Services" → "Library"
   - Search "Google+ API"
   - Click "Enable"
4. Create OAuth Credentials:
   - Click "Create Credentials" → "OAuth client ID"
   - Select "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000`
     - `http://localhost:3000/api/auth/callback/google`
5. Copy **Client ID** and **Client Secret**
6. Set in `.env.local`:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

---

## Step 3: Email Service (Resend)

1. Go to https://resend.com
2. Sign up with your email
3. Verify your email
4. Go to "API Keys" section
5. Copy the API key
6. Set in `.env.local`:
   ```
   RESEND_API_KEY=your_api_key
   ```

---

## Step 4: File Storage (EdgeStore)

1. Go to https://edgestore.dev
2. Sign up with GitHub
3. Create a new bucket/project
4. Go to API Keys section
5. Copy **Access Key** and **Secret Key**
6. Set in `.env.local`:
   ```
   EDGE_STORE_ACCESS_KEY=your_access_key
   EDGE_STORE_SECRET_KEY=your_secret_key
   ```

---

## Step 5: Project Configuration

### 1. Clone/Navigate to Project

```bash
cd c:\Users\Champion\Documents\Jobs\wchampionslogs
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Create `.env.local` File

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Or create it manually with all credentials you gathered above.

### 4. Set BASE_URL

```
BASE_URL=http://localhost:3000
```

(Change to your production URL when deploying)

### 5. Setup Database Schema

Run Prisma migrations:

```bash
npx prisma migrate dev
# or
npm run db:push
```

### 6. Generate Prisma Client

```bash
npx prisma generate
```

---

## Step 6: Running the Project

### Development Mode

```bash
npm run dev
# or
yarn dev
```

The project will start at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

---

## Step 7: Production Deployment

### Update .env for Production

When deploying to services like Vercel, Render, or Railway:

1. **Update OAuth Redirect URIs** (GitHub & Google):

   ```
   https://yourdomain.com/api/auth/callback/github
   https://yourdomain.com/api/auth/callback/google
   ```

2. **Set Production URLs**:

   ```
   BASE_URL=https://yourdomain.com
   AUTH_TRUST_HOST=https://yourdomain.com
   NEXTAUTH_URL=https://yourdomain.com
   ```

3. **Update DATABASE_URL** to production database

### Vercel Deployment

1. Push code to GitHub
2. Go to https://vercel.com
3. Connect your GitHub repository
4. Add environment variables in "Settings" → "Environment Variables"
5. Deploy

### Render Deployment

1. Go to https://render.com
2. Create new "Web Service"
3. Connect GitHub repository
4. Add environment variables
5. Deploy

---

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000
```

### Database Connection Issues

- Check `DATABASE_URL` is correct
- Ensure database server is running
- For cloud databases, whitelist your IP in security settings

### OAuth Errors

- Verify redirect URIs match exactly (http vs https, trailing slashes)
- Check Client IDs and Secrets are correct
- Make sure APIs are enabled in respective dashboards

### Email Not Sending

- Verify `RESEND_API_KEY` is correct
- Check domain verification in Resend

### File Upload Issues

- Verify EdgeStore keys are correct
- Check API key permissions

---

## Environment Variables Summary

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Auth
AUTH_SECRET=<generated_secret>
GITHUB_CLIENT_ID=<github_client_id>
GITHUB_CLIENT_SECRET=<github_client_secret>
GOOGLE_CLIENT_ID=<google_client_id>
GOOGLE_CLIENT_SECRET=<google_client_secret>

# Email
RESEND_API_KEY=<resend_api_key>

# File Storage
EDGE_STORE_ACCESS_KEY=<edgestore_access_key>
EDGE_STORE_SECRET_KEY=<edgestore_secret_key>

# URLs
BASE_URL=http://localhost:3000
# AUTH_TRUST_HOST=https://yourdomain.com (for production)
# NEXTAUTH_URL=https://yourdomain.com (for production)
```

---

## Next Steps

1. ✅ Set up database
2. ✅ Get OAuth credentials
3. ✅ Set up email service
4. ✅ Get file storage keys
5. ✅ Configure environment
6. ✅ Install dependencies
7. ✅ Run migrations
8. ✅ Start development server

Once these are complete, your project is ready to develop!
