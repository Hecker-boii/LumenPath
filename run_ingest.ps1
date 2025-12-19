# Run ingestion using the project's virtual environment (PowerShell)
# Usage: .\run_ingest.ps1
$venv = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
if (Test-Path $venv) {
    & $venv -m scripts.ingest_oulad
} else {
    Write-Host "Virtualenv python not found at $venv — falling back to system 'python'"
    python -m scripts.ingest_oulad
}
