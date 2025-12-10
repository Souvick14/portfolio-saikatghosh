# Complete Setup Guide - Portfolio Website

## 🚀 Quick Start (5 Minutes)

Your portfolio is already running! Here's what you need to complete the setup:

---

## 📋 Table of Contents
1. [MongoDB Setup](#1-mongodb-setup-required)
2. [Instagram Reels Setup](#2-instagram-reels-setup)
3. [Cloudinary Setup](#3-cloudinary-setup-optional)
4. [Email Setup](#4-email-setup-optional)
5. [Customization Guide](#5-customization-guide)
6. [Deployment](#6-deployment)

---

## 1. MongoDB Setup (Required)

**Why?** Store your portfolio data persistently (skills, projects, contact info)

### Option A: MongoDB Atlas (Recommended - Free Forever)

1. **Sign up** at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Create a free cluster** (M0 tier)
3. **Create a database user**:
   - Username: `portfolio_user`
   - Password: Generate a strong password
4. **Whitelist your IP**: Add `0.0.0.0/0` to allow access from anywhere
5. **Get connection string**: Click "Connect" → "Connect your application"
6. **Copy to .env**:
   ```env
   MONGODB_URI=mongodb+srv://portfolio_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/portfolio
   ```

### Option B: Local MongoDB (Development Only)

1. **Install MongoDB**: [Download](https://www.mongodb.com/try/download/community)
2. **Start MongoDB service**
3. **Add to .env**:
   ```env
   MONGODB_URI=mongodb://localhost:27017/portfolio
   ```

### ✅ Verify MongoDB Connection
```bash
npm start
# Look for: "✅ MongoDB connected successfully"
```

---

## 2. Instagram Reels Setup

**Current Issue:** Mock Instagram URLs are invalid (showing "removed" error)

### Fix Instagram Reels:

**Option 1: Add Your Real Reels (Recommended)**

1. Open `documentation/assets/js/data-manager.js`
2. Find lines 23-47 (instagramReels section)
3. Replace URLs with YOUR Instagram reel links:

```javascript
instagramReels: [
    {
        id: 1,
        reelUrl: 'https://www.instagram.com/reel/YOUR_REEL_ID/', // ← Change this
        title: 'My Latest Edit',
        timestamp: Date.now()
    }
]
```

**How to get your reel URLs:**
- Go to your Instagram profile
- Click on a reel
- Copy the URL from browser
- Make sure reel is PUBLIC

**Option 2: Hide Instagram Section Temporarily**

If you don't have Instagram reels yet:

Edit `documentation/index.html` (line 100):
```html
<section class="section carousel-section" id="instagram-reels" style="display: none;">
```

---

## 3. Cloudinary Setup (Optional)

**Why?** Upload and manage images for skills, projects, etc.

See `CLOUDINARY_SETUP.md` for detailed instructions.

**Quick Setup:**
1. Sign up at [Cloudinary](https://cloudinary.com/users/register/free)
2. Get your credentials from Dashboard
3. Add to `.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

---

## 4. Email Setup (Optional)

**Why?** Receive messages from the contact form

### Gmail Setup (Easiest):

1. **Enable 2-Step Verification** in your Google Account
2. **Create App Password**:
   - Go to [Google Account](https://myaccount.google.com)
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Add to .env**:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password-here
   EMAIL_FROM=your-email@gmail.com
   CONTACT_FORM_TO=your-email@gmail.com
   ```

---

## 5. Customization Guide

### A. Update About Section
1. Go to Admin Panel: `http://localhost:3000/admin.html`
2. Click "About Section"
3. Edit your bio, statistics, and upload profile image

### B. Add Your Skills
1. Admin Panel → "Skills"
2. Add skills with:
   - Name (e.g., "Adobe Premiere Pro")
   - Icon (FontAwesome class)
   - Proficiency percentage
   - Featured projects

### C. Add YouTube Videos
1. Admin Panel → Click the new "YouTube" section (coming in next update)
2. Or manually add to database via MongoDB

### D. Add Instagram Reels
1. Admin Panel → "Instagram Reels"
2. Add your real Instagram reel URLs

### E. Update Contact Information
1. Admin Panel → "Contact Settings"
2. Update email, phone, location
3. Add social media links

---

## 6. Deployment

### Deploy to Render (Free)

1. **Push to GitHub** (already done!)
2. **Go to [Render](https://render.com)**
3. **Create New Web Service**
4. **Connect your GitHub repo**: `Souvick14/portfolio-saikatghosh`
5. **Configure**:
   - Build Command: `npm install`
   - Start Command: `npm start`
6. **Add Environment Variables**: Copy all from `.env`
7. **Deploy!**

### Deploy to Vercel (Alternative)

```bash
npm install -g vercel
vercel login
vercel
```

---

## 📝 Checklist

- [ ] MongoDB configured and connected
- [ ] Instagram reels added or section hidden
- [ ] About section customized
- [ ] Skills added
- [ ] Contact information updated
- [ ] Cloudinary configured (optional)
- [ ] Email configured (optional)
- [ ] YouTube videos added
- [ ] Tested locally
- [ ] Deployed to production

---

## 🆘 Troubleshooting

### "Failed to load" errors in admin panel
✅ **Fixed!** Restart server: `npm start`

### Instagram reels show "removed"
📖 See [Instagram Reels Setup](#2-instagram-reels-setup)

### Cannot upload images
📖 Configure Cloudinary in [CLOUDINARY_SETUP.md](CLOUDINARY_SETUP.md)

### Contact form not sending emails
📖 See [Email Setup](#4-email-setup-optional)

---

## 🎨 Next Steps

1. **Customize your content** using the admin panel
2. **Add your real Instagram reels**
3. **Deploy to production**
4. **Share your portfolio!**

---

## 📚 Documentation Files

- `README.md` - Project overview
- `CLOUDINARY_SETUP.md` - Image upload setup
- `INSTAGRAM_REELS_SETUP.md` - Fix Instagram reels
- `.env.example` - Environment variables template
- `walkthrough.md` - Recent changes documentation

---

## 💡 Tips

- Use the admin panel for easy content management
- Keep MongoDB backups
- Test changes locally before deploying
- Check browser console (F12) for errors
- MongoDB Atlas free tier is sufficient for most portfolios

---

## 🎯 Your Portfolio Features

✅ **Horizontal scrolling Instagram reels** with card design
✅ **YouTube videos section** with grid layout
✅ **Dynamic skills** with flip cards and proficiency indicators
✅ **Blog posts** with beautiful carousel
✅ **Commercial work showcase**
✅ **Responsive design** for all devices
✅ **Dark theme** with purple/cyan gradients
✅ **Admin panel** for easy content management

---

Need help? Check the documentation files or contact support!
