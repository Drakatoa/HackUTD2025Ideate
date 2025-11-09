# Quick script to verify environment variables
Write-Host "Checking environment variables..." -ForegroundColor Cyan
Write-Host ""

$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$supabaseKey = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY

if ($supabaseUrl) {
    Write-Host "✓ NEXT_PUBLIC_SUPABASE_URL is set" -ForegroundColor Green
    Write-Host "  Value: $supabaseUrl" -ForegroundColor Gray
} else {
    Write-Host "✗ NEXT_PUBLIC_SUPABASE_URL is NOT set" -ForegroundColor Red
}

Write-Host ""

if ($supabaseKey) {
    Write-Host "✓ NEXT_PUBLIC_SUPABASE_ANON_KEY is set" -ForegroundColor Green
    Write-Host "  Key length: $($supabaseKey.Length) characters" -ForegroundColor Gray
    Write-Host "  Key starts with: $($supabaseKey.Substring(0, 20))..." -ForegroundColor Gray
} else {
    Write-Host "✗ NEXT_PUBLIC_SUPABASE_ANON_KEY is NOT set" -ForegroundColor Red
}

Write-Host ""
Write-Host "Note: These are the values in the current PowerShell session." -ForegroundColor Yellow
Write-Host "Next.js reads from .env.local when it starts, so restart your dev server!" -ForegroundColor Yellow

