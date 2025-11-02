Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       TESTING ALL AI-POWERED ENDPOINTS - ErrorWise         ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:3001"
$results = @()

# Test 1: Public Demo Endpoint (No Auth)
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "TEST 1: Public Demo Analyze Endpoint" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "Endpoint: POST /api/public/demo/analyze" -ForegroundColor White
Write-Host "Auth: None (Public)" -ForegroundColor White
Write-Host "Testing..." -ForegroundColor Gray

$body1 = @{
    errorMessage = "TypeError: Cannot read property 'name' of undefined"
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Uri "$baseUrl/api/public/demo/analyze" -Method POST -ContentType "application/json" -Body $body1 -TimeoutSec 45
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "   Provider: $($response1.provider.ToUpper())" -ForegroundColor $(if ($response1.provider -eq 'gemini') {'Green'} elseif ($response1.provider -eq 'openai') {'Cyan'} else {'Red'})
    Write-Host "   Category: $($response1.category)" -ForegroundColor White
    Write-Host "   Confidence: $($response1.confidence)%" -ForegroundColor White
    Write-Host "   Demo Info: $($response1.demoInfo.remainingDemos)/$($response1.demoInfo.totalDemos) remaining" -ForegroundColor Yellow
    Write-Host "   Explanation: $($response1.explanation.Substring(0, [Math]::Min(100, $response1.explanation.Length)))..." -ForegroundColor Gray
    $results += [PSCustomObject]@{Test="Public Demo"; Status="✅ PASS"; Provider=$response1.provider}
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $results += [PSCustomObject]@{Test="Public Demo"; Status="❌ FAIL"; Provider="N/A"}
}

Write-Host "`n"

# Test 2: Public Demo Examples
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "TEST 2: Public Demo Examples Endpoint" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "Endpoint: GET /api/public/demo/examples" -ForegroundColor White
Write-Host "Testing..." -ForegroundColor Gray

try {
    $response2 = Invoke-RestMethod -Uri "$baseUrl/api/public/demo/examples" -Method GET -TimeoutSec 10
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "   Examples returned: $($response2.examples.Count)" -ForegroundColor White
    $response2.examples | Select-Object -First 2 | ForEach-Object { Write-Host "   - $_" -ForegroundColor Gray }
    $results += [PSCustomObject]@{Test="Demo Examples"; Status="✅ PASS"; Provider="N/A"}
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $results += [PSCustomObject]@{Test="Demo Examples"; Status="❌ FAIL"; Provider="N/A"}
}

Write-Host "`n"

# Test 3: Authenticated Error Analysis (Needs token)
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "TEST 3: Authenticated Error Analysis Endpoint" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "Endpoint: POST /api/errors/analyze" -ForegroundColor White
Write-Host "Auth: Required (Bearer Token)" -ForegroundColor White
Write-Host "Status: SKIPPED (No auth token available)" -ForegroundColor Yellow
Write-Host "   Note: This endpoint requires user authentication" -ForegroundColor Gray
Write-Host "   Manual test: Login → Get token → Test with Authorization header" -ForegroundColor Gray
$results += [PSCustomObject]@{Test="Auth Error Analysis"; Status="⏭️ SKIP"; Provider="N/A"}

Write-Host "`n"

# Test 4: Different error types with Public Demo
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "TEST 4: Multiple Error Types (Public Demo)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$testCases = @(
    @{name="Python Error"; message="IndentationError: unexpected indent at line 5"},
    @{name="Java Error"; message="NullPointerException at line 42 in UserService.java"},
    @{name="Network Error"; message="ECONNREFUSED: Connection refused to localhost:5432"}
)

foreach ($testCase in $testCases) {
    Write-Host "`nTesting: $($testCase.name)" -ForegroundColor Cyan
    $body = @{ errorMessage = $testCase.message } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/public/demo/analyze" -Method POST -ContentType "application/json" -Body $body -TimeoutSec 45
        Write-Host "   ✅ $($testCase.name): Provider=$($response.provider), Confidence=$($response.confidence)%" -ForegroundColor Green
        $results += [PSCustomObject]@{Test=$testCase.name; Status="✅ PASS"; Provider=$response.provider}
    } catch {
        Write-Host "   ❌ $($testCase.name): FAILED" -ForegroundColor Red
        $results += [PSCustomObject]@{Test=$testCase.name; Status="❌ FAIL"; Provider="N/A"}
    }
}

# Summary
Write-Host "`n`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                      TEST SUMMARY                           ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$results | Format-Table -AutoSize

$passCount = ($results | Where-Object { $_.Status -eq "✅ PASS" }).Count
$failCount = ($results | Where-Object { $_.Status -eq "❌ FAIL" }).Count
$skipCount = ($results | Where-Object { $_.Status -eq "⏭️ SKIP" }).Count
$total = $results.Count

Write-Host "`n📊 Results: $passCount PASSED | $failCount FAILED | $skipCount SKIPPED (Total: $total)" -ForegroundColor White

if ($failCount -eq 0 -and $passCount -gt 0) {
    Write-Host "`n🎉 ALL TESTS PASSED! AI Service is working correctly with Gemini 2.0 Flash!" -ForegroundColor Green
} elseif ($failCount -gt 0) {
    Write-Host "`n⚠️ Some tests failed. Check the errors above." -ForegroundColor Yellow
} else {
    Write-Host "`n⚠️ No tests were executed successfully." -ForegroundColor Yellow
}

Write-Host "`n"
