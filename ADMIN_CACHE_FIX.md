# Admin Panel - Cache Clearing Guide

Your admin panel has been fully updated, but you may be seeing old cached versions. Follow these steps to force your browser to load the latest changes:

## Method 1: Hard Refresh (Recommended)

### Chrome/Edge:
1. Open admin panel: http://localhost:3000/admin.html
2. Press **Ctrl + Shift + Delete** (Windows) or **Cmd + Shift + Delete** (Mac)
3. Select **"Cached images and files"**
4. Click **"Clear data"**
5. Close and reopen the browser tab
6. Navigate to admin panel again

OR simply press **Ctrl + Shift + R** multiple times

### Firefox:
1. Press **Ctrl + Shift + Delete**
2. Select **"Cache"**
3. Click **"Clear Now"**
4. Reload the page

## Method 2: Disable Cache in DevTools

1. Open admin panel
2. Press **F12** to open Developer Tools
3. Go to **Network** tab
4. Check **"Disable cache"**
5. Keep DevTools open and refresh the page

## Method 3: Incognito/Private Mode

1. Open **Incognito Window** (Ctrl + Shift + N)
2. Navigate to http://localhost:3000/admin.html
3. Log in (admin/admin123)
4. Test all features

## What Should Work After Cache Clear:

✅ **Instagram Reels**
- "Add Instagram Reel" button opens modal
- Preview reel functionality works
- Can save and delete reels

✅ **Blogs Management**
- "Add New Blog" button opens modal with Quill rich text editor
- Can add/edit/delete blog posts
- Cover image upload works
- Tags and categories available

✅ **Contact Settings**
- Form loads with all fields (Email, Phone, YouTube, Instagram, Twitter, LinkedIn)
- Data saves correctly

✅ **About Section**  
- Form loads with all fields (Heading, Content, Projects, Clients, Experience)
- Data saves correctly

## Quick Test Checklist:

After clearing cache, verify:
- [ ] Login works
- [ ] All 7 tabs visible (Skills, Instagram Reels, Reels, Blogs, Commercial, Contact, About)
- [ ] Instagram Reels "Add" button opens modal
- [ ] Blogs "Add New Blog" opens modal with Quill editor
- [ ] Contact Settings form has all social media fields
- [ ] About Section form has statistics fields
- [ ] No console errors (F12 -> Console tab)

## If Issues Persist:

1. **Restart the server:**
   ```bash
   # In terminal, press Ctrl+C to stop
   npm start
   ```

2. **Check console for errors:**
   - Press F12
   - Go to Console tab
   - Look for red error messages
   - Share screenshot with developer

3. **Verify JavaScript files loaded:**
   - Press F12 -> Network tab
   - Refresh page
   - Look for these files (should show 200 status):
     - admin-script.js
     - admin-extensions.js
     - admin-blog.js
     - admin-image-upload.js

## Server Restart (If Needed):

```powershell
# Stop server (Ctrl+C in terminal where npm start is running)
# Then restart:
npm start
```

Wait for "Server running on port 3000" message, then test again.
