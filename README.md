# Portfolio Backend - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

**Required Configuration:**
- `MONGODB_URI` - Your MongoDB connection string
- `YOUTUBE_API_KEY` - For fetching video metadata
- `EMAIL_USER` & `EMAIL_PASS` - For contact form emails

### 3. Start Development Server
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 4. Test the API
Visit: `http://localhost:3000/api`

## API Endpoints

### Skills
- `GET /api/skills` - Get all skills
- `POST /api/skills` - Create skill
- `PUT /api/skills/:id` - Update skill
- `DELETE /api/skills/:id` - Delete skill

### Instagram Reels
- `GET /api/reels` - Get all reels
- `POST /api/reels` - Create reel
- `PUT /api/reels/:id` - Update reel
- `DELETE /api/reels/:id` - Delete reel

### Commercial Work
- `GET /api/commercial` - Get all commercial work
- `POST /api/commercial` - Create commercial work
- `POST /api/commercial/youtube-metadata` - Fetch YouTube metadata
- `PUT /api/commercial/:id` - Update commercial work
- `DELETE /api/commercial/:id` - Delete commercial work

### Contact
- `GET /api/contact` - Get contact info
- `PUT /api/contact` - Update contact info
- `POST /api/contact/send` - Send contact form email

### About
- `GET /api/about` - Get about section
- `PUT /api/about` - Update about section

## MongoDB Setup (When Ready)

**Note: We'll set this up when you're ready with your MongoDB account**

1. Create MongoDB Atlas account
2. Create a new cluster
3. Get connection string
4. Add to `.env` file

## Email Setup

Choose one:

### Option A: Gmail
1. Enable 2-Factor Authentication
2. Generate App Password
3. Add to `.env`:
```
EMAIL_SERVICE=gmail
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_app_password
```

### Option B: SendGrid
1. Create SendGrid account
2. Get API key
3. Add to `.env`:
```
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_api_key
```

## YouTube API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable YouTube Data API v3
4. Create API key
5. Add to `.env`:
```
YOUTUBE_API_KEY=your_api_key_here
```

## Deployment (Vercel)

**Note: We'll configure this when you're ready**

The project is configured for Vercel deployment with:
- `vercel.json` configuration file
- Server runs as serverless function
- Static files served from `/documentation`

## Troubleshooting

### Server won't start
- Check if port 3000 is available
- Verify Node.js version (>= 18.0.0)

### MongoDB connection fails
- Check connection string in `.env`
- Verify network access in MongoDB Atlas
- Server will run with fallback data if MongoDB unavailable

### Email not sending
- Verify email credentials in `.env`
- Check firewall/antivirus settings
- Server logs will show detailed error

## Next Steps

1. **Install dependencies**: Run `npm install`
2. **Configure .env**: Copy `.env.example` and fill values
3. **Test locally**: Run `npm run dev`
4. **Set up MongoDB**: When ready, I'll guide you
5. **Deploy to Vercel**: When ready, I'll help configure

**Remember**: Ask me when you're ready to set up MongoDB, email service, or deployment accounts!
