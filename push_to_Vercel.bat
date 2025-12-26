@echo off
setlocal enabledelayedexpansion

REM ============================
REM LifeSignal - Vercel PROD Deploy (Verbose)
REM ============================

cd /d "%~dp0"

echo.
echo =========================================
echo  LifeSignal: Vercel PRODUCTION Deploy
echo =========================================
echo  Repo path: %CD%
echo  Time: %DATE% %TIME%
echo =========================================
echo.

REM ----------------------------
REM Check tools
REM ----------------------------
where git >nul 2>nul || (
  echo [FATAL] Git is not installed.
  goto :END
)

where vercel >nul 2>nul || (
  echo [INFO] Vercel CLI not found. Installing...
  npm i -g vercel
  if errorlevel 1 (
    echo [FATAL] Failed to install Vercel CLI.
    goto :END
  )
)

REM ----------------------------
REM Git status
REM ----------------------------
echo.
echo ---------- GIT STATUS ----------
git status
echo --------------------------------
echo.

REM ----------------------------
REM Commit + push
REM ----------------------------
set COMMIT_MSG=LifeSignal deploy %DATE% %TIME%
echo [STEP] Git add + commit
git add -A

git commit -m "%COMMIT_MSG%"
if errorlevel 1 (
  echo [INFO] No new changes to commit.
)

echo.
echo [STEP] Git push origin main
git push origin main
if errorlevel 1 (
  echo [WARN] Git push failed or branch not main.
)

echo.
echo Latest commit:
git log -1 --oneline
echo.

REM ----------------------------
REM Vercel project link
REM ----------------------------
if not exist ".vercel" (
  echo [STEP] Linking Vercel project...
  vercel link
  if errorlevel 1 (
    echo [FATAL] Vercel link failed.
    goto :END
  )
) else (
  echo [OK] Vercel project already linked.
)

REM ----------------------------
REM Pull env vars (optional)
REM ----------------------------
echo.
echo [STEP] Pulling Vercel env vars to .env.local
vercel env pull .env.local

REM ----------------------------
REM Deploy
REM ----------------------------
echo.
echo [STEP] Deploying to Vercel (PRODUCTION)
echo -----------------------------------------
vercel --prod
if errorlevel 1 (
  echo.
  echo ❌ DEPLOY FAILED
  goto :END
)

REM ----------------------------
REM Success summary
REM ----------------------------
echo.
echo =========================================
echo ✅ DEPLOY COMPLETE
echo =========================================
echo ✔ Git committed and pushed
echo ✔ Vercel production deploy succeeded
echo.
echo 🌐 Your site should now be live at:
echo 👉 https://lifesignal.app
echo.
echo ⏱ Finished at: %DATE% %TIME%
echo =========================================

:END
echo.
echo Press any key to close this window...
pause >nul
endlocal
