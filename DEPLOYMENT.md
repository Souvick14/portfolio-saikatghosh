# Portfolio Deployment Guide

## Pre-Deployment Checklist ✅

Your portfolio is ready to deploy! Here's what's already configured:

- ✅ Backend API (Express.js + MongoDB)
- ✅ MongoDB Atlas connected
- ✅ Admin panel working
- ✅ Frontend integrated with backend
- ✅ Environment variables template (`.env.example`)
- ✅ `.gitignore` configured

---

## Step 1: Initialize Git Repository

Run these commands in your project directory (`d:\portfolio-SaikatGhosh`):

```powershell
# Initialize Git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Full-stack portfolio with MongoDB backend"
```

---

## Step 2: Create GitHub Repository (On Your Other Account)

1. **Log in to your target GitHub account** (the one you want to use for this project)
2. Go to https://github.com/new
3. **Repository settings:**
   - Name: `portfolio-website` (or any name you prefer)
   - Description: "Professional portfolio website with admin panel"
   - Visibility: **Public** (required for free Vercel hosting)
   - ❌ **Do NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**

---

## Step 3: Connect Local Repository to GitHub

GitHub will show you commands. Use these (replace `YOUR-USERNAME` and `REPO-NAME` with your actual values):

```powershell
# Add remote (use YOUR GitHub username and repository name)
git remote add origin https://github.com/YOUR-USERNAME/REPO-NAME.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Example:**
```powershell
git remote add origin https://github.com/johndoe/portfolio-website.git
git branch -M main
git push -u origin main
```

You may need to authenticate:
- Enter your GitHub username
- For password, use a **Personal Access Token** (not your password)
  - Create one at: https://github.com/settings/tokens
  - Select scope: `repo` (full control of private repositories)

---

## Step 4: Deploy to Vercel

### 4.1: Create Vercel Account
1. Go to https://vercel.com/signup
2. **Sign up with your GitHub account** (the same one you just pushed to)
3. Authorize Vercel to access your repositories

### 4.2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Select your portfolio repository
3. Click **"Import"**

### 4.3: Configure Project Settings

**Framework Preset:** Other (or leave as detected)

**Root Directory:** `./` (leave as is)

**Build Command:**
```
npm install
```

**Output Directory:**
```
documentation
```

**Install Command:**
```
npm install
```

### 4.4: Add Environment Variables

Click **"Environment Variables"** and add these:

| Name | Value | Where to get it |
|------|-------|----------------|
| `NODE_ENV` | `production` | Type as shown |
| `MONGODB_URI` | `mongodb+srv://sg9585438_db_user:Portfolio2024@cluster0.9m8fua9.mongodb.net/?appName=Cluster0` | Your MongoDB connection string |
| `PORT` | `3000` | Type as shown |
| `ALLOWED_ORIGINS` | Leave empty for now (will configure after deployment) | |

**Important:** Add these to the **PRODUCTION** environment

### 4.5: Deploy!
1. Click **"Deploy"**
2. Wait 1-2 minutes for build to complete
3. You'll get a URL like: `https://your-project.vercel.app`

---

## Step 5: Configure CORS for Production

After deployment:

1. Note your Vercel URL (e.g., `https://portfolio-abc123.vercel.app`)
2. Go to Vercel → Your Project → Settings → Environment Variables
3. Update `ALLOWED_ORIGINS`:
   ```
   https://portfolio-abc123.vercel.app,https://www.your-custom-domain.com
   ```
4. Redeploy (Vercel → Deployments → Click "..." → Redeploy)

---

## Step 6: Update Admin Credentials (Recommended)

For security, update your admin panel credentials:

1. In Vercel → Settings → Environment Variables, add:
   ```
   ADMIN_USERNAME=your_secure_username
   ADMIN_PASSWORD=your_secure_password
   ```
2. Redeploy

---

## Step 7: Test Your Live Site!

1. Visit `https://your-project.vercel.app`
2. Test main portfolio pages
3. Visit `/admin.html` and log in
4. Add content through admin panel
5. Verify it appears on the main site

---

## Optional: Custom Domain

1. Buy a domain (Namecheap, GoDaddy, Google Domains)
2. In Vercel: Settings → Domains → Add Domain
3. Follow Vercel's DNS configuration instructions
4. Wait for DNS propagation (up to 48 hours)

---

## Troubleshooting

### Build Failed on Vercel
- Check Vercel build logs
- Make sure all dependencies are in `package.json`
- Verify Node version compatibility

### Can't Connect to MongoDB
- Check MongoDB Atlas → Network Access → Allow access from anywhere (0.0.0.0/0)
- Verify `MONGODB_URI` environment variable is correct
- Check MongoDB Atlas user permissions

### Admin Panel Not Working
- Verify `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables
- Clear browser cache
- Check browser console for errors

### CORS Errors
- Update `ALLOWED_ORIGINS` in Vercel environment variables
- Include `https://` in the origin URL
- Redeploy after changing environment variables

---

## Environment Variables Reference

Here's what each variable does:

```env
# Server Configuration
PORT=3000                                    # Server port
NODE_ENV=production                          # Environment mode

# Database
MONGODB_URI=mongodb+srv://...               # MongoDB Atlas connection string

# Security
ADMIN_USERNAME=admin                         # Admin panel username
ADMIN_PASSWORD=secure_password              # Admin panel password
ALLOWED_ORIGINS=https://your-site.com       # CORS allowed origins
SESSION_SECRET=random_secret_string         # Session encryption key

# Optional: YouTube API
YOUTUBE_API_KEY=your_youtube_api_key        # For video view counts

# Optional: Email Service
EMAIL_SERVICE=gmail                          # Email provider
EMAIL_USER=your@email.com                   # Sender email
EMAIL_PASS=app_password                     # App-specific password
EMAIL_FROM=hello@yoursite.com               # From address
CONTACT_FORM_TO=you@email.com              # Contact form recipient
```

---

## Need Help?

If you encounter any issues:
1. Check the troubleshooting section above
2. Review Vercel build logs
3. Check MongoDB Atlas connection
4. Verify all environment variables are set correctly

**Your portfolio is ready to go live! 🚀**
