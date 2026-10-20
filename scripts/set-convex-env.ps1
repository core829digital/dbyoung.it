<#
Imposta le env Convex necessarie leggendole da .env.local (mai stamparle).
Prerequisiti: `npx convex login` completato (o CONVEX_DEPLOY_KEY impostata).
Uso: powershell -ExecutionPolicy Bypass -File scripts/set-convex-env.ps1
#>
$ErrorActionPreference = "Stop"
$envFile = ".env.local"
if (-not (Test-Path $envFile)) { throw ".env.local non trovato" }

$map = @{}
Get-Content $envFile | ForEach-Object {
  if ($_ -match '^([A-Z0-9_]+)=(.*)$') { $map[$matches[1]] = $matches[2] }
}

$required = @("ADMIN_ACTION_SECRET", "TOTP_ENCRYPTION_KEY", "ADMIN_EMAILS")
foreach ($k in $required) {
  if (-not $map.ContainsKey($k) -or [string]::IsNullOrWhiteSpace($map[$k])) {
    throw "Manca $k in .env.local"
  }
}

foreach ($k in $required) {
  Write-Host "→ Convex env: $k" -ForegroundColor Yellow
  npx convex env set $k $map[$k] | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Errore impostando $k" }
}
Write-Host "Env Convex impostate. Verifica con: npx convex env list" -ForegroundColor Green
