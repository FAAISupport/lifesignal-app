@echo off
setlocal enabledelayedexpansion

REM ============================
REM LifeSignal - Push to Vercel
REM Production deploy
REM ============================

REM 1) Ensure we're in the folder where this BAT lives (repo root)
cd /d "%~dp0"

echo.
echo =========================================
echo  LifeSignal: Vercel PROD Deploy
echo =========================================
echo  Repo: %CD%
echo.

REM 2) Check for Vercel CLI
where vercel >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Vercel CLI not found.
  echo Installing Vercel CLI globally...
  echo.
  npm i -g vercel
  if errorlevel 1 (
    echo [ERROR] Failed to install Vercel CLI. Make sure Node/NPM are installed.
    pause
    exit /b 1
  )
)

REM 3) Check for Git
where git >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Git not found. Install Git for Windows first.
  pause
  exit /b 1
)

REM 4) Show current branch/status
echo.
echo --- Git status ---
git status
echo.

REM 5) Commit & push to main (safe even if nothing changed)
set msg=LifeSignal deploy %date% %time%
echo Committing with message: "%msg%"
git add -A
git commit -m "%msg%" >nul 2>nul

echo Pushing to origin main...
git push origin main
if errorlevel 1 (
  echo [WARN] Git push failed (maybe branch isn't main or remote not set).
  echo You can fix and rerun. Continuing to Vercel deploy anyway...
)

REM 6) Link project if needed
echo.
echo --- Vercel link ---
if not exist ".vercel" (
  echo No .vercel folder found. Linking this folder to a Vercel project...
  vercel link
  if errorlevel 1 (
    echo [ERROR] Vercel link failed.
    pause
    exit /b 1
  )
) else (
  echo .vercel detected. Project already linked.
)

REM 7) Pull env vars (optional but recommended)
echo.
echo --- Pulling Vercel env vars to .env.local ---
vercel env pull .env.local
echo (If you don't use .env.local locally, you can ignore this.)

REM 8) Deploy to production
echo.
echo --- Deploying to Vercel (PRODUCTION) ---
vercel --prod
if errorlevel 1 (
  echo [ERROR] Vercel deploy failed.
  pause
  exit /b 1
)

echo.
echo ✅ DONE: Production deploy complete.
pause
endlocal
