@echo off
title Memorias da Poesia Popular - Iniciar site
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0iniciar-site.ps1"
pause