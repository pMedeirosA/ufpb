# ============================================================
# iniciar-site.ps1 — sobe o servidor local e abre o navegador.
# Use pela "iniciar-site.bat" (duplo clique). Sem instalacoes.
# ============================================================

$ErrorActionPreference = 'SilentlyContinue'

$urlTest  = 'http://localhost:8080/estrutura/index.html'
$urlSite  = $urlTest
$urlAdmin = 'http://localhost:8080/estrutura/admin.html'
$scriptDir = $PSScriptRoot

# Já existe um servidor na porta 8080? Se sim, não sobe outro.
$servidorAtivo = $false
try {
  $r = Invoke-WebRequest -Uri $urlTest -UseBasicParsing -TimeoutSec 2
  $servidorAtivo = ($r.StatusCode -eq 200)
} catch {
  $servidorAtivo = $false
}

if (-not $servidorAtivo) {
  Write-Host '  Subindo o servidor...'
  $scriptPath = Join-Path $scriptDir 'servir.ps1'
  Start-Process powershell -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',"`"$scriptPath`"") -WindowStyle Hidden
  Start-Sleep -Seconds 2
}

Write-Host ''
Write-Host '  =============================================='
Write-Host '   Memorias da Poesia Popular'
Write-Host "   Site:   $urlSite"
Write-Host "   Painel: $urlAdmin"
Write-Host '   (fechar tudo e clicar no .bat de novo para'
Write-Host '    reiniciar o servidor)'
Write-Host '  =============================================='
Write-Host ''

Start-Process $urlSite