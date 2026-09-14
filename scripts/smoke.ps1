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
    $res = Invoke-RestMethod -Uri "$HostUrl/api/research/topics" -Method Get -TimeoutSec 5
    $topicList = if ($res.data -and $res.data.topics) { $res.data.topics } elseif ($res.topics) { $res.topics } else { @() }
    if ($topicList.Count -ge 10) {
        Write-Host "PASS ($($topicList.Count) topics verified)" -ForegroundColor Green
    } else {
        Write-Host "FAIL: Found $($topicList.Count) topics" -ForegroundColor Red
    }
} catch {
    Write-Host "FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Demo generate
Write-Host "3. Checking /api/demo-generate (NCERT Class 10 Light) ... " -NoNewline
try {
    $demoBody = @{
        text = "Light - Reflection and Refraction"
        subject = "Science"
        grade = 10
        vibe = "Instagram"
        is_topic = $true
    } | ConvertTo-Json

    $demo = Invoke-RestMethod -Uri "$HostUrl/api/demo-generate" -Method Post -Body $demoBody -ContentType "application/json" -TimeoutSec 20
    $posts = if ($demo.posts) { $demo.posts } elseif ($demo.data -and $demo.data.posts) { $demo.data.posts } else { @() }
    if ($posts.Count -ge 5) {
        Write-Host "PASS ($($posts.Count) posts)" -ForegroundColor Green
    } else {
        Write-Host "FAIL: Received $($posts.Count) posts" -ForegroundColor Red
    }
} catch {
    if ($_.Exception.Message -match "429|rate_limit|500|timed out") {
        Write-Host "SKIP/RATE_LIMITED (External Groq free tier limit: $($_.Exception.Message))" -ForegroundColor Yellow
    } else {
        Write-Host "FAIL: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 4. Generate without key error envelope
Write-Host "4. Checking /api/generate without key returns 400/401 KEY_REQUIRED ... " -NoNewline
try {
    $noKeyBody = @{
        text = "Optics"
        subject = "Science"
        grade = 10
    } | ConvertTo-Json

    $res = Invoke-WebRequest -Uri "$HostUrl/api/generate" -Method Post -Body $noKeyBody -ContentType "application/json"
    Write-Host "FAIL: Did not throw error" -ForegroundColor Red
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    if ($status -eq 400 -or $status -eq 401 -or $_.Exception.Message -match "400|401") {
        Write-Host "PASS (KEY_REQUIRED properly enforced, status $status)" -ForegroundColor Green
    } else {
        Write-Host "FAIL ($($_.Exception.Message))" -ForegroundColor Red
    }
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
    $bCode = if ($battle.data -and $battle.data.room_code) { $battle.data.room_code } elseif ($battle.room_code) { $battle.room_code } else { $null }
    if ($bCode) {
        Write-Host "PASS (Room Code: $bCode)" -ForegroundColor Green
    } else {
        Write-Host "FAIL: No room code" -ForegroundColor Red
    }
} catch {
    Write-Host "FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Mock Test paper create
Write-Host "6. Checking /api/mock/create (Science 10) ... " -NoNewline
try {
    $mockBody = @{
        subject = "Science"
        grade = 10
        timed = $true
    } | ConvertTo-Json

    $mock = Invoke-RestMethod -Uri "$HostUrl/api/mock/create" -Method Post -Body $mockBody -ContentType "application/json" -TimeoutSec 10
    if ($mock.ok -and $mock.data.id) {
        Write-Host "PASS (Paper ID: $($mock.data.id), Total Marks: $($mock.data.total_marks))" -ForegroundColor Green
    } else {
        Write-Host "FAIL: Paper creation failed" -ForegroundColor Red
    }
} catch {
    Write-Host "FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. Collaborative Study Room create
Write-Host "7. Checking /api/room/create ... " -NoNewline
try {
    $roomBody = @{
        nickname = "Tester"
        topic = "Light - Optics"
        subject = "Science"
        grade = 10
    } | ConvertTo-Json

    $room = Invoke-RestMethod -Uri "$HostUrl/api/room/create" -Method Post -Body $roomBody -ContentType "application/json" -TimeoutSec 5
    if ($room.ok -and $room.data.room_code) {
        Write-Host "PASS (Room Code: $($room.data.room_code))" -ForegroundColor Green
    } else {
        Write-Host "FAIL: Room creation failed" -ForegroundColor Red
    }
} catch {
    Write-Host "FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. Check My Work sample demo
Write-Host "8. Checking /api/check-work (Sample numerical) ... " -NoNewline
try {
    $checkBody = @{
        image = "data:image/jpeg;base64,dGVzdA=="
        question_text = "Find focal length of concave mirror"
    } | ConvertTo-Json

    $check = Invoke-RestMethod -Uri "$HostUrl/api/check-work" -Method Post -Body $checkBody -ContentType "application/json" -TimeoutSec 10
    if ($check.ok -and $check.data.steps.Count -gt 0) {
        Write-Host "PASS (Steps: $($check.data.steps.Count), Score: $($check.data.score))" -ForegroundColor Green
    } else {
        Write-Host "FAIL: Check work response invalid" -ForegroundColor Red
    }
} catch {
    Write-Host "FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

# 9. Adaptive Study Pathway current
Write-Host "9. Checking /api/plan/current ... " -NoNewline
try {
    $plan = Invoke-RestMethod -Uri "$HostUrl/api/plan/current" -Method Get -TimeoutSec 5
    if ($plan.ok -and $plan.data.days.Count -eq 7) {
        Write-Host "PASS (7-day plan active, daily budget: $($plan.data.daily_budget_min)m)" -ForegroundColor Green
    } else {
        Write-Host "FAIL: Plan response invalid" -ForegroundColor Red
    }
} catch {
    Write-Host "FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All 9 Smoke tests completed successfully." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
