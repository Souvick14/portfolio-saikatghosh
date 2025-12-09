# Cloudinary Setup Guide

## What is Cloudinary?

Cloudinary is a free cloud service for storing and managing images. It's perfect for your portfolio because:
- ✅ **Free tier**: 25GB storage, 25GB bandwidth/month 
- ✅ **Permanent storage**: Images never disappear
- ✅ **Automatic optimization**: Resizes and compresses images
- ✅ **CDN delivery**: Fast loading worldwide
- ✅ **Works with Render**: Perfect for deployment

---

## Step 1: Create Cloudinary Account

1. Go to: **https://cloudinary.com/users/register_free**
2. Sign up with your email or GitHub
3. Verify your email

---

## Step 2: Get Your Credentials

After logging in:

1. You'll see your **Dashboard**
2. Find the **"Account Details"** section
3. You'll see three important values:

```
Cloud Name: de1a2b3c4
API Key: 123456789012345
API Secret: abcdefghijklmnopqrstuvwxyz1234
```

**⚠️ Keep API Secret private!** Don't share it publicly.

---

## Step 3: Add to Your .env File

Open `d:\portfolio-SaikatGhosh\.env` and add:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=de1a2b3c4
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz1234
```

Replace with YOUR actual values from the dashboard.

---

## Step 4: Restart Your Server

```powershell
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## Step 5: Test Image Upload

1. Go to http://localhost:3000/admin.html
2. Login
3. Edit a skill or add a new one
4. Click "Choose File" and select an image
5. Save the skill
6. Check Cloudinary dashboard - you'll see the uploaded image!
7. Visit main site - image displays from Cloudinary!

---

## For Production (Render Deployment)

Add the same variables in Render:

1. Go to Render Dashboard
2. Your service → **Environment** tab
3. Add:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. Save and redeploy

---

## Cloudinary Features You Get

**Automatic Image Optimization:**
- Images resize to max 800x600 (configured in code)
- Format conversion (WebP for modern browsers)
- Compression without quality loss

**Image Management:**
- View all images in Cloudinary dashboard
- Delete old images manually if needed
- Set up folders: images go to `portfolio/skills/`

**Free Tier Limits:**
- 25GB storage
- 25GB bandwidth/month  
- 25,000 transformations/month

This is more than enough for a portfolio!

---

## Your Credentials (From Dashboard)

After you sign up, copy your credentials here:

```
Cloud Name: ________________
API Key: ________________
API Secret: ________________
```

Then add them to your `.env` file!

---

## Need Help?

- Cloudinary Docs: https://cloudinary.com/documentation
- Dashboard: https://cloudinary.com/console
- Support: https://support.cloudinary.com

**Ready to get your Cloudinary credentials?** Sign up now! 🚀
