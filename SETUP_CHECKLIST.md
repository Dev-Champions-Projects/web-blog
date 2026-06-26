# Setup Checklist

Use this checklist to track your setup progress.

## Credentials Collection

- [ ] **DATABASE_URL**
  - [ ] Created PostgreSQL database (local or cloud)
  - [ ] Copied connection string
  - [ ] Tested connection

- [ ] **AUTH_SECRET**
  - [ ] Generated secure secret
  - [ ] Saved to `.env.local`

- [ ] **GitHub OAuth**
  - [ ] Created OAuth App at https://github.com/settings/developers
  - [ ] Set redirect URI: `http://localhost:3000/api/auth/callback/github`
  - [ ] Copied Client ID
  - [ ] Copied Client Secret

- [ ] **Google OAuth**
  - [ ] Created project in Google Cloud Console
  - [ ] Enabled Google+ API
  - [ ] Created OAuth credentials
  - [ ] Set redirect URIs
  - [ ] Copied Client ID
  - [ ] Copied Client Secret

- [ ] **Resend API Key**
  - [ ] Created account at https://resend.com
  - [ ] Verified email
  - [ ] Copied API key

- [ ] **EdgeStore Keys**
  - [ ] Created account at https://edgestore.dev
  - [ ] Created bucket/project
  - [ ] Copied Access Key
  - [ ] Copied Secret Key

## Project Setup

- [ ] Navigated to project directory
- [ ] Created `.env.local` file from `.env.example`
- [ ] Added all credentials to `.env.local`
- [ ] Ran `npm install`
- [ ] Ran `npx prisma migrate dev`
- [ ] Ran `npx prisma generate`

## Testing

- [ ] Started dev server with `npm run dev`
- [ ] Accessed `http://localhost:3000`
- [ ] Tested email signup
- [ ] Tested GitHub login
- [ ] Tested Google login
- [ ] Tested blog creation with image upload
- [ ] Tested comment functionality

## Production Prep (When Ready)

- [ ] Updated OAuth redirect URIs for production domain
- [ ] Updated `.env` for production
- [ ] Deployed to hosting platform (Vercel/Render/Railway)
- [ ] Set environment variables on hosting platform
- [ ] Tested production URLs
- [ ] Verified email service in production
