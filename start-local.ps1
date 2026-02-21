#!/usr/bin/env pwsh
# CardWise local development startup script
# Usage: pwsh start-local.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting CardWise local development..." -ForegroundColor Cyan

# Check Docker/PostgreSQL
$dbRunning = docker ps --filter "name=docker-db-1" --format "{{.Status}}" 2>$null
if (-not $dbRunning) {
    Write-Host "📦 Starting PostgreSQL..." -ForegroundColor Yellow
    Push-Location "$PSScriptRoot/infra/docker"
    docker compose up -d db
    Pop-Location
    Start-Sleep -Seconds 5
}
Write-Host "✅ PostgreSQL running" -ForegroundColor Green

# Start backend
Write-Host "🔧 Starting backend on port 3001..." -ForegroundColor Yellow
Push-Location "$PSScriptRoot/backend"
$backendJob = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -NoNewWindow
Pop-Location
Start-Sleep -Seconds 4

# Verify backend
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -TimeoutSec 5
    Write-Host "✅ Backend running (health: $($health.status))" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend failed to start!" -ForegroundColor Red
    exit 1
}

# Start frontend
Write-Host "🎨 Starting frontend on port 5173..." -ForegroundColor Yellow
Push-Location "$PSScriptRoot/frontend"
$frontendJob = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -NoNewWindow
Pop-Location
Start-Sleep -Seconds 3

# Verify frontend
try {
    $resp = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Frontend running (status: $($resp.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend failed to start!" -ForegroundColor Red
    exit 1
}

# Verify login works
try {
    $loginResp = Invoke-WebRequest -Uri "http://localhost:5173/api/auth/login" -Method POST -ContentType "application/json" -Body '{"password":"testpassword"}' -UseBasicParsing -TimeoutSec 5
    $cookie = $loginResp.Headers['Set-Cookie']
    if ($cookie -match 'connect.sid') {
        Write-Host "✅ Login & session cookies working" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Login succeeds but no session cookie!" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Login test failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CardWise is running!" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:3001" -ForegroundColor White
Write-Host "  Password: testpassword" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop..." -ForegroundColor Gray

# Keep script alive — when user hits Ctrl+C, stop both
try {
    Wait-Process -Id $backendJob.Id
} finally {
    if (!$backendJob.HasExited) { Stop-Process -Id $backendJob.Id -Force }
    if (!$frontendJob.HasExited) { Stop-Process -Id $frontendJob.Id -Force }
    Write-Host "Stopped all services." -ForegroundColor Yellow
}
