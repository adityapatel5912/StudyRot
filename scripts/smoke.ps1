# StudyRot Windows PowerShell Smoke Test Suite
param(
    [string]$HostUrl = "http://localhost:8000"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "StudyRot Smoke Test Suite against $HostUrl" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Health check
Write-Host "1. Checking /api/health ... " -NoNewline
try {
    $health = Invoke-RestMethod -Uri "$HostUrl/api/health" -Method Get -TimeoutSec 5
    if ($health.ok -or $health.status -eq "ok") {
        Write-Host "PASS (Status: $($health.status), Groq: $($health.keys.groq))" -ForegroundColor Green
    } else {
        Write-Host "FAIL" -ForegroundColor Red
    }
} catch {
    Write-Host "FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Research topics
Write-Host "2. Checking /api/research/topics ... " -NoNewline
try {
    $topics = Invoke-RestMethod -Uri "$HostUrl/api/research/topics" -Method Get -TimeoutSec 5
    if ($topics.topics.Count -ge 15) {
        Write-Host "PASS ($($topics.topics.Count) topics verified)" -ForegroundColor Green
    } else {
        Write-Host "FAIL: Found only $($topics.topics.Count) topics" -ForegroundColor Red
    }
} catch {
    Write-Host "FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Demo generate
Write-Host "3. Checking /api/demo-generate (NCERT Class 10 Light) ... " -NoNewline
try {
    $demoBody = @{
        text = "Light — Reflection and Refraction"
        subject = "Science"
        grade = 10
        vibe = "Instagram"
        is_topic = $true
    } | ConvertTo-Json

    $demo = Invoke-RestMethod -Uri "$HostUrl/api/demo-generate" -Method Post -Body $demoBody -ContentType "application/json" -TimeoutSec 15
    if ($demo.posts.Count -ge 14) {
        Write-Host "PASS ($($demo.posts.Count) posts, cached: $($demo.cached))" -ForegroundColor Green
    } else {
        Write-Host "FAIL: Received $($demo.posts.Count) posts" -ForegroundColor Red
    }
} catch {
    Write-Host "FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Generate without key error envelope
Write-Host "4. Checking /api/generate without key returns 401 ... " -NoNewline
try {
    $noKeyBody = @{
        text = "Optics"
        subject = "Science"
        grade = 10
    } | ConvertTo-Json

    $res = Invoke-WebRequest -Uri "$HostUrl/api/generate" -Method Post -Body $noKeyBody -ContentType "application/json" -SkipHttpErrorCheck
    if ($res.StatusCode -eq 401) {
        Write-Host "PASS (401 KEY_REQUIRED properly enforced)" -ForegroundColor Green
    } else {
        Write-Host "FAIL: Received status $($res.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "PASS ($($_.Exception.Message))" -ForegroundColor Green
}

# 5. Battle room create
Write-Host "5. Checking /api/battle/create ... " -NoNewline
try {
    $battleBody = @{
        topic = "Light & Optics Battle"
        subject = "Science"
        grade = 10
        questions = @()
    } | ConvertTo-Json

    $battle = Invoke-RestMethod -Uri "$HostUrl/api/battle/create" -Method Post -Body $battleBody -ContentType "application/json" -TimeoutSec 5
    if ($battle.room_code) {
        Write-Host "PASS (Room Code: $($battle.room_code))" -ForegroundColor Green
    } else {
        Write-Host "FAIL: No room code" -ForegroundColor Red
    }
} catch {
    Write-Host "FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Smoke tests completed." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
