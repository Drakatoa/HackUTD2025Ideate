# PowerShell script to restart Next.js dev server with clean cache
Write-Host "Stopping any running Node processes..."
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "Clearing Next.js cache..."
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✅ Cleared .next cache"
} else {
    Write-Host "ℹ️ No .next cache to clear"
}

Write-Host "`n✅ Ready to start dev server"
Write-Host "Run: npm run dev"
Write-Host "`nOr press any key to start it automatically..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host "`nStarting dev server..."
npm run dev

