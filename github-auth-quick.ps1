# GitHub Authentication Quick Fix Script
# Run this in a NEW PowerShell window

Write-Host "🔧 GitHub Authentication Setup" -ForegroundColor Cyan
Write-Host ""

# Check if gh is available
$ghAvailable = Get-Command gh -ErrorAction SilentlyContinue

if ($ghAvailable) {
    Write-Host "✅ GitHub CLI found!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Starting authentication..." -ForegroundColor Yellow
    gh auth login
} else {
    Write-Host "❌ GitHub CLI not found in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "📝 Options to fix this:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1: Close this PowerShell and open a NEW one" -ForegroundColor Cyan
    Write-Host "   Then run: gh auth login" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 2: Use Personal Access Token" -ForegroundColor Cyan
    Write-Host "   1. Go to: https://github.com/settings/tokens/new" -ForegroundColor White
    Write-Host "   2. Generate token with 'repo' scope" -ForegroundColor White
    Write-Host "   3. Run: git remote set-url origin https://YOUR_TOKEN@github.com/Getgingee/errorwise-backend.git" -ForegroundColor White
    Write-Host "   4. Run: git push origin main" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 3: Use GitHub Desktop (easiest)" -ForegroundColor Cyan
    Write-Host "   1. Download: https://desktop.github.com/" -ForegroundColor White
    Write-Host "   2. Sign in to GitHub" -ForegroundColor White
    Write-Host "   3. Add this repository" -ForegroundColor White
    Write-Host "   4. Push with one click" -ForegroundColor White
    Write-Host ""
    
    # Ask user to choose
    Write-Host "Press any key to open GitHub token page..." -ForegroundColor Green
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Start-Process "https://github.com/settings/tokens/new?description=ErrorWise-Deployment&scopes=repo"
}
