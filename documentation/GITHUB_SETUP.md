# GitHub Setup Guide

## Option 1: Install Git and Push (Recommended)

### Step 1: Install Git
1. Download Git from: https://git-scm.com/download/win
2. Run the installer with default settings
3. Restart your terminal/PowerShell

### Step 2: Configure Git
Open PowerShell and run:
```bash
git config --global user.name "Saikat9874"
git config --global user.email "your-email@example.com"
```

### Step 3: Initialize and Push Repository
```bash
# Navigate to portfolio folder
cd f:\portfolio\documentation

# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit: Dynamic Influencer Portfolio"

# Create repository on GitHub first (see below), then:
git remote add origin https://github.com/Saikat9874/influencer-portfolio.git
git branch -M main
git push -u origin main
```

## Option 2: Manual Upload via GitHub Website

### Step 1: Create Repository on GitHub
1. Go to: https://github.com/new
2. Repository name: `influencer-portfolio`
3. Description: "Dynamic influencer portfolio with YouTube and Google Drive integration"
4. Choose Public or Private
5. **DO NOT** initialize with README (we already have one)
6. Click "Create repository"

### Step 2: Upload Files
1. On the new repository page, click "uploading an existing file"
2. Drag and drop ALL files from `f:\portfolio\documentation\`
3. Or click "choose your files" and select all
4. Add commit message: "Initial commit: Dynamic Influencer Portfolio"
5. Click "Commit changes"

## Option 3: GitHub Desktop (Easiest)

### Step 1: Install GitHub Desktop
1. Download from: https://desktop.github.com/
2. Install and sign in with:
   - Username: Saikat9874
   - Password: Saikat@9874

### Step 2: Create Repository
1. Click "File" → "New repository"
2. Name: influencer-portfolio
3. Local path: f:\portfolio\documentation
4. Click "Create repository"

### Step 3: Publish
1. Click "Publish repository"
2. Choose public or private
3. Uncheck "Keep this code private" if you want it public
4. Click "Publish repository"

## Files to Commit

All files in `f:\portfolio\documentation\`:
```
├── index.html
├── README.md
├── .gitignore
├── assets/
│   ├── css/
│   │   ├── portfolio-style.css
│   │   └── carousel.css
│   ├── js/
│   │   ├── config.js
│   │   ├── data-manager.js
│   │   ├── api-handler.js
│   │   └── portfolio-script.js
│   ├── images/
│   │   ├── favicon.png
│   │   ├── white-logo.svg
│   │   └── portfolio/
│   └── fonts/
│       └── ElegantIcons.*
```

## Security Note

⚠️ **IMPORTANT**: After pushing, consider changing your GitHub password since you shared it here. Go to:
https://github.com/settings/security

## Recommended Repository Settings

After creating the repository:

1. **Enable GitHub Pages** (to host your portfolio):
   - Go to Settings → Pages
   - Source: Deploy from branch
   - Branch: main / root
   - Save
   - Your site will be at: `https://saikat9874.github.io/influencer-portfolio/`

2. **Add Topics** (for discoverability):
   - Click ⚙️ next to "About"
   - Add topics: `portfolio`, `influencer`, `youtube`, `content-creator`

3. **Update Description**:
   - "Dynamic influencer portfolio with YouTube API integration and auto-loop carousels"

## After Pushing

Your portfolio will be available at:
- Repository: https://github.com/Saikat9874/influencer-portfolio
- Live Site (after enabling Pages): https://saikat9874.github.io/influencer-portfolio/

## Updating Your Portfolio

After making changes:
```bash
git add .
git commit -m "Description of changes"
git push
```

Or use GitHub Desktop: Commit → Push
