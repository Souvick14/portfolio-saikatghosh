# Quick Reference - Portfolio Commands & URLs

## 🚀 Server Commands

```bash
# Start the server
npm start

# Start with auto-restart (development)
npm run dev    # if nodemon is installed

# Stop the server
Ctrl + C       # in the terminal

# Check if server is running
# Windows:
Get-Process -Name node

# Kill all node processes (if needed)
# Windows:
Stop-Process -Name node -Force
```

---

## 🌐 Important URLs

### Local Development
- **Portfolio**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin.html
- **API Health**: http://localhost:3000/api/health
- **API Docs**: http://localhost:3000/api

### Admin Panel Login
- **Username**: `admin`
- **Password**: `admin123`
- ⚠️ **Change these** in your `.env` file!

---

## 📁 Quick File Locations

### Configuration
- `.env` - Environment variables (create from `.env.example`)
- `.env.example` - Template with all variables
- `server.js` - Main server file

### Frontend
- `documentation/index.html` - Main portfolio page
- `documentation/admin.html` - Admin panel
- `documentation/assets/css/` - Stylesheets
- `documentation/assets/js/` - JavaScript files

### Backend
- `routes/` - API routes
  - `skills.js` - Skills API
  - `reels.js` - Instagram Reels API
  - `youtube.js` - YouTube Videos API
  - `commercial.js` - Commercial Work API
  - `about.js` - About Section API
  - `contact.js` - Contact API
- `models/` - MongoDB models

### Documentation
- `README.md` - Project overview
- `SETUP_GUIDE.md` - Complete setup instructions
- `CLOUDINARY_SETUP.md` - Image upload setup
- `INSTAGRAM_REELS_SETUP.md` - Fix Instagram reels
- `walkthrough.md` - Recent changes

---

## 🔧 Common Tasks

### Fix Instagram Reels
Edit: `documentation/assets/js/data-manager.js` (lines 23-47)

### Update About Section
1. Open: http://localhost:3000/admin.html
2. Click: "About Section"
3. Edit and save

### Add Skills
1. Open: http://localhost:3000/admin.html
2. Click: "Skills"
3. Add new skill

### Update Contact Info
1. Open: http://localhost:3000/admin.html
2. Click: "Contact Settings"
3. Edit and save

---

## 🗄️ Database Commands

### Check MongoDB Connection
```bash
# Look for this in console when starting server:
# ✅ MongoDB connected successfully
```

### MongoDB Atlas
- Dashboard: https://cloud.mongodb.com
- Free tier: M0 (512 MB)

---

## 🎨 Customization Files

### Colors & Theme
- `documentation/assets/css/portfolio-style.css`
- CSS variables at the top

### Instagram Cards
- `documentation/assets/css/instagram-carousel.css`

### YouTube Section
- `documentation/assets/css/youtube-section.css`

### Skills Cards
- `documentation/assets/css/portfolio-style.css` (skills section)

---

## 📡 API Endpoints

### GET Requests
- `GET /api/skills` - Get all skills
- `GET /api/reels` - Get Instagram reels
- `GET /api/youtube` - Get YouTube videos
- `GET /api/commercial` - Get commercial work
- `GET /api/about` - Get about section
- `GET /api/contact` - Get contact info

### POST Requests
- `POST /api/skills` - Add skill
- `POST /api/reels` - Add Instagram reel
- `POST /api/youtube` - Add YouTube video
- `POST /api/commercial` - Add commercial work

### PUT Requests
- `PUT /api/skills/:id` - Update skill
- `PUT /api/about` - Update about section
- `PUT /api/contact` - Update contact info

### DELETE Requests
- `DELETE /api/skills/:id` - Delete skill
- `DELETE /api/reels/:id` - Delete reel
- `DELETE /api/youtube/:id` - Delete video

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### Can't Save to Database
- Check MongoDB connection in `.env`
- Verify MongoDB Atlas IP whitelist

### Images Not Uploading
- Configure Cloudinary in `.env`
- See `CLOUDINARY_SETUP.md`

### Email Not Sending
- Configure email in `.env`
- Enable Gmail App Passwords

---

## 📦 Deployment

### Render.com
1. Push to GitHub
2. Create Web Service on Render
3. Connect GitHub repo
4. Add environment variables
5. Deploy

### Vercel
```bash
vercel login
vercel
```

---

## 🔑 Environment Variables Checklist

```
✅ PORT=3000
✅ MONGODB_URI=mongodb+srv://...
⬜ CLOUDINARY_CLOUD_NAME=...
⬜ CLOUDINARY_API_KEY=...
⬜ CLOUDINARY_API_SECRET=...
⬜ EMAIL_USER=...
⬜ EMAIL_PASS=...
```

---

## 📞 Quick Help

- 🐛 Bugs: Check browser console (F12)
- 📖 Setup: See `SETUP_GUIDE.md`
- 🔧 Config: Check `.env.example`
- 📝 Changes: See `walkthrough.md`

---

**Made with ❤️ for your awesome portfolio!**
