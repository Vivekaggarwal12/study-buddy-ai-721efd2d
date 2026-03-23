#!/usr/bin/env pwsh

Write-Host "ECHO ASSISTANT DEPLOYMENT SCRIPT" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Authenticate
Write-Host "[STEP 1] Supabase Authentication..." -ForegroundColor Yellow
npx supabase login
Write-Host "[OK] Authenticated" -ForegroundColor Green
Write-Host ""

# Step 2: Deploy function
Write-Host "[STEP 2] Deploying echo-assistant..." -ForegroundColor Yellow
npx supabase functions deploy echo-assistant
Write-Host "[OK] Function deployed" -ForegroundColor Green
Write-Host ""

# Step 3: Set API Key
Write-Host "[STEP 3] API Key Setup" -ForegroundColor Yellow
Write-Host "Get key from:" -ForegroundColor Cyan
Write-Host "  - Google AI Studio: aistudio.google.com" -ForegroundColor Cyan
Write-Host "  - Lovable Dashboard" -ForegroundColor Cyan
Write-Host ""

$apiKey = Read-Host "Enter API key"
if ($apiKey) {
    Write-Host "Setting API key..." -ForegroundColor Yellow
    npx supabase secrets set GEMINI_API_KEY="$apiKey"
    Write-Host "[OK] API key set. Waiting 30s..." -ForegroundColor Green
    Start-Sleep -Seconds 30
}

Write-Host ""
Write-Host "DEPLOYMENT COMPLETE" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Run: npm run dev" -ForegroundColor Cyan
Write-Host "  2. Visit: http://localhost:8081/echo-assistant" -ForegroundColor Cyan
