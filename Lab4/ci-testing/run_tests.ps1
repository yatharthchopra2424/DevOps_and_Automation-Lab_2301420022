# run_tests.ps1 — Run pytest tests for Lab4 CI testing task
Write-Host "=== Lab4 CI/CD Automated Testing ===" -ForegroundColor Cyan
Write-Host ""

# Install dependencies
Write-Host "Installing test dependencies..." -ForegroundColor Yellow
pip install flask pytest --quiet

Write-Host ""
Write-Host "Running tests with pytest..." -ForegroundColor Yellow
Write-Host ""

Set-Location ci-testing
python -m pytest test_app.py -v --tb=short
$exitCode = $LASTEXITCODE
Set-Location ..

if ($exitCode -eq 0) {
    Write-Host "" 
    Write-Host "All tests PASSED!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Some tests FAILED!" -ForegroundColor Red
}

exit $exitCode
