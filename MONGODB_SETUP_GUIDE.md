# 🚀 Quick MongoDB Atlas Setup (5 Minutes)

## Step 1: Create MongoDB Atlas Account

1. **Go to:** https://www.mongodb.com/cloud/atlas/register
2. **Sign up** with Google/GitHub or email (100% FREE, no credit card)
3. **Verify** your email

## Step 2: Create Free Cluster

1. After logging in, click **"Build a Database"**
2. Choose **"M0 FREE"** tier
3. Select:
   - Cloud Provider: **AWS** (or any)
   - Region: Choose closest to you (e.g., **Mumbai** if in India)
   - Cluster Name: `portfolio` (or keep default)
4. Click **"Create"** (wait 1-3 minutes for cluster creation)

## Step 3: Create Database User

1. On the **Security Quickstart** screen:
   - Username: `portfolioUser` (or anything you want)
   - Password: Click **"Autogenerate Secure Password"** → **COPY THIS!**
   - Click **"Create User"**

2. For **IP Access List:**
   - Click **"Add My Current IP Address"**
   - OR click **"Allow Access from Anywhere"** (for development)
   - Click **"Finish and Close"**

## Step 4: Get Connection String

1. On your cluster dashboard, click **"Connect"**
2. Choose **"Connect your application"**
3. Driver: **Node.js** (should be selected)
4. Version: **5.5 or later**
5. **COPY** the connection string (looks like this):
   ```
   mongodb+srv://portfolioUser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 5: Create .env File

1. In your project folder `d:\portfolio-SaikatGhosh\`
2. Create a file named **`.env`** (note the dot at the beginning!)
3. Paste this content (replace with YOUR values):

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://portfolioUser:YOUR_PASSWORD_HERE@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority

# Cloudinary (you already have these)
CLOUDINARY_CLOUD_NAME=dxzk1k4et
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=3000
NODE_ENV=development

# Admin (keep default for now)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

**IMPORTANT:** 
- Replace `YOUR_PASSWORD_HERE` with the password you copied in Step 3
- Replace the cluster URL (`cluster0.xxxxx.mongodb.net`) with YOUR actual cluster URL from Step 4

## Step 6: Restart Server

```powershell
# In your terminal where server is running:
# Press Ctrl+C to stop

# Then restart:
npm start
```

## Step 7: Verify Connection

You should see:
```
✅ MongoDB connected successfully!
```

Now add a skill in admin panel - it will be saved permanently!

---

## Quick Copy-Paste Template for .env

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/portfolio?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=dxzk1k4et
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
PORT=3000
NODE_ENV=development
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

Replace:
- `USERNAME` - your database username
- `PASSWORD` - your database password
- `CLUSTER` - your cluster URL

---

## Troubleshooting

**"MongoServerError: bad auth"**
- Double-check username and password in connection string
- Make sure you replaced `<password>` with actual password (no < >)

**"Connection timeout"**
- Check if IP is whitelisted in MongoDB Atlas
- Try "Allow Access from Anywhere" in Network Access

**"Cannot GET /"**
- Server is running! Just go to `/admin.html`

---

**THAT'S IT!** After this, your skills will save permanently! 🎉
