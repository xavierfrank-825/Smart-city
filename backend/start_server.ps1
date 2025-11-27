Write-Host "Starting Django Backend Server..." -ForegroundColor Green
Write-Host ""
Set-Location $PSScriptRoot

# Check if virtual environment exists and activate it
if (Test-Path "venv\Scripts\Activate.ps1") {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & "venv\Scripts\Activate.ps1"
} else {
    Write-Host "No virtual environment found, using system Python..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Installing/checking dependencies..." -ForegroundColor Cyan
python -m pip install -q djangorestframework django-cors-headers whitenoise

Write-Host ""
Write-Host "Starting server..." -ForegroundColor Green
python manage.py runserver

