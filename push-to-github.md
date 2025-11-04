# 🚀 Push to GitHub - Authentication Guide

## Option 1: GitHub CLI (Easiest)

1. **Install GitHub CLI:**
   ```powershell
   winget install --id GitHub.cli
   ```

2. **Login:**
   ```powershell
   gh auth login
   ```

3. **Push:**
   ```powershell
   git push origin main
   ```

## Option 2: Personal Access Token

1. **Create Personal Access Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scopes: `repo` (all)
   - Copy the token

2. **Update remote URL with token:**
   ```powershell
   git remote set-url origin https://YOUR_TOKEN@github.com/Getgingee/errorwise-backend.git
   ```

3. **Push:**
   ```powershell
   git push origin main
   ```

## Option 3: SSH Key

1. **Generate SSH key:**
   ```powershell
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. **Add to GitHub:**
   - Copy key: `Get-Content ~/.ssh/id_ed25519.pub | clip`
   - Go to: https://github.com/settings/keys
   - Click "New SSH key" and paste

3. **Update remote:**
   ```powershell
   git remote set-url origin git@github.com:Getgingee/errorwise-backend.git
   ```

4. **Push:**
   ```powershell
   git push origin main
   ```

## Quick Fix (Use GitHub Desktop)

1. Download: https://desktop.github.com/
2. Sign in with GitHub account
3. Add repository: File → Add Local Repository
4. Select: `C:\Users\panka\Getgingee\errorwise-backend`
5. Click "Push origin"

---

## After Authentication, run:

```powershell
# Backend
cd C:\Users\panka\Getgingee\errorwise-backend
git push origin main

# Frontend
cd C:\Users\panka\Getgingee\errorwise-frontend
git push origin main
```
