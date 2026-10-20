<#
Push delle env di produzione su Vercel da .env.vercel.local.
Prerequisiti: `npx vercel login` completato e accesso al progetto.
Uso:
  powershell -ExecutionPolicy Bypass -File scripts/push-vercel-env.ps1 -Project dbyoung.it
#>
param(
  [string]$Project = "dbyoung.it",
  [string]$EnvFile = ".env.vercel.local"
)

$ErrorActionPreference = "Stop"
if (-not (Test-Path $EnvFile)) { throw "File $EnvFile non trovato" }

$entries = Get-Content $EnvFile | Where-Object { $_ -match '^([A-Z0-9_]+)=(.*)$' } | ForEach-Object {
  $null = $_ -match '^([A-Z0-9_]+)=(.*)$'
  [pscustomobject]@{ Name = $matches[1]; Value = $matches[2] }
}

Write-Host "Invio $($entries.Count) variabili al progetto Vercel '$Project' (production)..." -ForegroundColor Cyan
foreach ($e in $entries) {
  if ([string]::IsNullOrWhiteSpace($e.Value)) {
    Write-Host "skip $($e.Name) (vuota)" -ForegroundColor DarkGray
    continue
  }
  Write-Host "→ $($e.Name)" -ForegroundColor Yellow
  npx vercel env add $e.Name production --value $e.Value --force --yes --project $Project | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Errore su $($e.Name)" }
}
Write-Host "Fatto. Ora esegui un redeploy: npx vercel --prod --project $Project" -ForegroundColor Green
