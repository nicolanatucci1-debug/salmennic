# Interactive script to create or update backend/.env from .env.example securely
# Usage: run this in PowerShell in the backend folder.
# It will prompt for the API key (hidden) and write the .env file.

param()

$examplePath = Join-Path (Get-Location) '.env.example'
if (-not (Test-Path $examplePath)) {
  Write-Error ".env.example not found in the current folder. Run this script from the backend folder."
  exit 1
}

Write-Host "This script will create or update a .env file from .env.example in the current folder."

# Read secure input
Write-Host "Enter AI API key (input will be hidden). Press Enter when done."
$secure = Read-Host -AsSecureString "AI API key"
try {
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  $plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto($ptr)
} finally {
  if ($ptr) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}

if ([string]::IsNullOrWhiteSpace($plain)) {
  Write-Error "No key entered. Aborting."
  exit 1
}

$envPath = Join-Path (Get-Location) '.env'
$exampleText = Get-Content $examplePath -Raw
if ($exampleText -match "AI_API_KEY=.*") {
  $newText = $exampleText -replace "AI_API_KEY=.*", "AI_API_KEY=$plain"
} else {
  $newText = $exampleText + "`nAI_API_KEY=$plain`n"
}

# Write .env (overwrite)
Set-Content -Path $envPath -Value $newText -NoNewline -Encoding UTF8
Write-Host ".env file written to $envPath. Keep it private and do NOT commit it to source control." -ForegroundColor Green
