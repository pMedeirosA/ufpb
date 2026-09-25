# ============================================================
# servir.ps1 — servidor HTTP local para o site
# (sem instalar Node/Python/NPM)
#
# Como rodar:
#   1. Abra o Windows PowerShell (menu Iniciar → "PowerShell")
#   2. Navegue até esta pasta:
#        cd C:\Users\asluc\OneDrive\Documents\ufpb
#   3. Rode:
#        .\servir.ps1
#
# Depois abra no navegador:
#   http://localhost:8080/estrutura/admin.html
#   http://localhost:8080/biografias.html
# (Ctrl+C no PowerShell para parar)
# ============================================================

$ErrorActionPreference = 'Stop'

$root = Join-Path $PSScriptRoot 'site'
$port = 8080
$url = "http://localhost:$port/"

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($url)
$listener.Start()

Write-Host ""
Write-Host "  Servindo o site em: $url" -ForegroundColor Green
Write-Host "  Admin:    http://localhost:$port/estrutura/admin.html" -ForegroundColor Yellow
Write-Host "  Biografias: http://localhost:$port/biografias.html" -ForegroundColor Yellow
Write-Host "  Ctrl+C para parar." -ForegroundColor DarkGray
Write-Host ""

$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css'
  '.js'   = 'text/javascript'
  '.svg'  = 'image/svg+xml'
  '.png'  = 'image/png'
  '.ico'  = 'image/x-icon'
  '.json' = 'application/json'
  '.otf'  = 'font/otf'
  '.ttf'  = 'font/ttf'
  '.woff' = 'font/woff'
  '.woff2'= 'font/woff2'
}

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    try {
      $path = $context.Request.Url.LocalPath.TrimStart('/')
      if ([string]::IsNullOrEmpty($path)) { $path = 'index.html' }

      $file = Join-Path $root $path
      if (Test-Path -LiteralPath $file) {
        $ext = [System.IO.Path]::GetExtension($file).ToLowerInvariant()
        $context.Response.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
        $context.Response.StatusCode = 200
        $bytes = [System.IO.File]::ReadAllBytes($file)
        $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      } else {
        $context.Response.StatusCode = 404
      }
    } catch {
      $context.Response.StatusCode = 500
    } finally {
      $context.Response.Close()
    }
  }
} finally {
  $listener.Stop()
  $listener.Close()
}