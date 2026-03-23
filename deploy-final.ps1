#!/usr/bin/env pwsh

# Echo Assistant Deployment Script with GEMINI_API_KEY
# This script handles authentication, deployment, and secret setup

Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🚀 ECHO ASSISTANT DEPLOYMENT" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# Step 1: Check if already authenticated
Write-Host "[STEP 1] Checking Supabase authentication..." -ForegroundColor Yellow
$authStatus = npx supabase status 2>&1 | Select-String "Not logged in|Logged in" | Select-Object -First 1

if ($authStatus -match "Not logged in") {
    Write-Host "Not authenticated. Starting login process..." -ForegroundColor Yellow
    npx supabase login --no-browser
    Write-Host "✓ Authentication complete" -ForegroundColor Green
} else {
    Write-Host "✓ Already authenticated" -ForegroundColor Green
}

Write-Host ""

# Step 2: Deploy function
Write-Host "[STEP 2] Deploying echo-assistant function..." -ForegroundColor Yellow
npx supabase functions deploy echo-assistant

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Deployment failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Function deployed successfully" -ForegroundColor Green

Write-Host ""

# Step 3: Set GEMINI_API_KEY secret
Write-Host "[STEP 3] Setting GEMINI_API_KEY secret..." -ForegroundColor Yellow
npx supabase secrets set GEMINI_API_KEY="AIzaSyAS1Js5bBMOy9DV6XWlO_dJ9YXZwIfGK8Q"

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Secret setup failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Secret configured" -ForegroundColor Green

Write-Host ""
Write-Host "Waiting 30 seconds for secrets to propagate..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host ""

# Step 4: Verify deployment
Write-Host "[STEP 4] Verifying deployment..." -ForegroundColor Yellow

$functions = npx supabase functions list 2>&1
if ($functions -match "echo-assistant") {
    Write-Host "✓ echo-assistant function is deployed" -ForegroundColor Green
} else {
    Write-Host "✗ Function not found" -ForegroundColor Red
}

$secrets = npx supabase secrets list 2>&1
if ($secrets -match "GEMINI_API_KEY") {
    Write-Host "✓ GEMINI_API_KEY secret is configured" -ForegroundColor Green
} else {
    Write-Host "✗ Secret not configured" -ForegroundColor Red
}

Write-Host ""
Write-Host "════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✅ DEPLOYMENT COMPLETE" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Start dev server: npm run dev" -ForegroundColor Cyan
Write-Host "  2. Open: http://localhost:8081/echo-assistant" -ForegroundColor Cyan
Write-Host "  3. Look for green banner: 'Setup complete! Echo Assistant is ready.'" -ForegroundColor Cyan
Write-Host ""
