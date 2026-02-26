# GitHub Setup & Vercel Deployment Guide

## Step 1: Create GitHub Repository

### Option A: Create on GitHub.com (Recommended)

1. Go to https://github.com/new
2. Fill in repository details:
   - **Repository name**: `life-os-unit`
   - **Description**: "Life OS Unit - Personal Life Management System"
   - **Visibility**: Public (or Private if you prefer)
   - **Initialize with**: Leave unchecked
3. Click "Create repository"
4. Copy the repository URL (e.g., `https://github.com/YOUR_USERNAME/life-os-unit.git`)

### Option B: Create via GitHub CLI

```bash
# Install GitHub CLI if not already installed
# https://cli.github.com/

gh repo create life-os-unit --public --source=. --remote=origin --push
```

---

## Step 2: Configure Git Locally

### First Time Setup (if not already done)

```bash
# Configure your Git identity
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Verify configuration
git config --global --list
```

### Set Up SSH Keys (Recommended for easier authentication)

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your.email@example.com"

# Press Enter for default location
# Enter a passphrase (or leave empty)

# Add SSH key to ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copy public key to clipboard
# On Windows (PowerShell):
Get-Content ~/.ssh/id_ed25519.pub | Set-Clipboard

# On Mac:
pbcopy < ~/.ssh/id_ed25519.pub

# On Linux:
cat ~/.ssh/id_ed25519.pub | xclip -selection clipboard
```

Add SSH key to GitHub:
1. Go to https://github.com/settings/keys
2. Click "New SSH key"
3. Paste your public key
4. Click "Add SSH key"

---

## Step 3: Initialize Git in Your Project

Navigate to your project directory:

```bash
cd construction/unit
```

Initialize Git repository:

```bash
# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Life OS Unit MVP - Real-time checklist and inventory management system"

# Add remote repository (replace with your URL)
git remote add origin https://github.com/YOUR_USERNAME/life-os-unit.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

---

## Step 4: Verify on GitHub

1. Go to https://github.com/YOUR_USERNAME/life-os-unit
2. Verify all files are there:
   - src/ folder with all JavaScript files
   - index.html
   - styles.css
   - vercel.json (if you have it)

---

## Step 5: Deploy to Vercel

### Option A: Via Vercel Dashboard (Easiest)

1. Go to https://vercel.com
2. Sign up or log in with GitHub
3. Click "New Project"
4. Select your `life-os-unit` repository
5. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `construction/unit`
   - **Build Command**: Leave empty (static site)
   - **Output Directory**: Leave empty
6. Click "Deploy"
7. Wait for deployment to complete
8. Get your live URL (e.g., `https://life-os-unit.vercel.app`)

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from project directory
cd construction/unit
vercel

# Follow prompts:
# - Link to existing project? No
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? life-os-unit
# - Directory? ./
```

---

## Step 6: Verify Deployment

1. Visit your Vercel URL
2. Test all functionality:
   - ✅ Add items
   - ✅ Check items
   - ✅ Delete items
   - ✅ Edit items
   - ✅ Change status/qty/date
   - ✅ Navigate between boards
3. Check browser console (F12) for errors

---

## Troubleshooting

### "Repository not found" Error

**Cause**: Repository doesn't exist or wrong URL

**Solution**:
```bash
# Verify remote URL
git remote -v

# If wrong, remove and re-add
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/life-os-unit.git

# Try pushing again
git push -u origin main
```

### "Permission denied" Error

**Cause**: SSH key not set up or GitHub credentials not configured

**Solution**:
```bash
# Option 1: Use HTTPS instead of SSH
git remote set-url origin https://github.com/YOUR_USERNAME/life-os-unit.git

# Option 2: Set up SSH keys (see Step 2)

# Option 3: Use GitHub CLI
gh auth login
```

### "fatal: not a git repository" Error

**Cause**: Not in a git repository directory

**Solution**:
```bash
# Navigate to correct directory
cd construction/unit

# Initialize git if needed
git init
```

### Vercel Deployment Fails

**Check**:
1. All files committed to GitHub
2. Root directory is `construction/unit`
3. No build errors in Vercel logs
4. config.js has correct values

---

## Next Steps After Deployment

1. ✅ Verify app works on Vercel
2. ✅ Set up Google Sheets API (see DEPLOYMENT_GUIDE.md)
3. ✅ Update config.js with Google credentials
4. ✅ Push changes to GitHub
5. ✅ Vercel auto-deploys
6. ✅ Test Google Sheets integration

---

## Useful Commands

```bash
# Check git status
git status

# View commit history
git log --oneline

# Make changes and commit
git add .
git commit -m "Your message"
git push

# Create a new branch
git checkout -b feature-name

# Switch branches
git checkout main

# Delete a branch
git branch -d branch-name
```

---

## Resources

- GitHub Docs: https://docs.github.com
- Git Basics: https://git-scm.com/book/en/v2
- Vercel Docs: https://vercel.com/docs
- SSH Keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

---

## Summary

1. Create GitHub repository
2. Configure Git locally
3. Initialize Git in project
4. Push to GitHub
5. Deploy to Vercel
6. Verify deployment works
7. Set up Google Sheets (next step)

You're ready to go! 🚀
