$hookSrc = Join-Path $PSScriptRoot "hooks\prepare-commit-msg"
$hookDst = Join-Path (git rev-parse --git-dir) "hooks\prepare-commit-msg"

Copy-Item -Force $hookSrc $hookDst
Write-Host "Hook instalado: $hookDst"
