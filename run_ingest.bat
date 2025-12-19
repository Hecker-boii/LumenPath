@echo off
REM Run ingestion using the project's virtual environment (Windows CMD)
SET VENV=%~dp0.venv\Scripts\python.exe
IF EXIST "%VENV%" (
  "%VENV%" -m scripts.ingest_oulad
) ELSE (
  echo Virtualenv python not found at %VENV% — falling back to system python
  python -m scripts.ingest_oulad
)
