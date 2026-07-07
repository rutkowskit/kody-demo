param(
    [switch]$Force
)

$repoRoot = Split-Path $PSScriptRoot -Parent
$androidDir = Join-Path $repoRoot "android"
$sourceDir = Join-Path $PSScriptRoot "runConfigurations"
$targetDir = Join-Path $androidDir ".idea\runConfigurations"

if (-not (Test-Path (Join-Path $androidDir "gradlew.bat"))) {
    Write-Error "Brak android\gradlew.bat. Uruchom najpierw: npm run prebuild:android"
    exit 1
}

New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

Get-ChildItem -Path $sourceDir -Filter "*.xml" | ForEach-Object {
    $dest = Join-Path $targetDir $_.Name
    if ((Test-Path $dest) -and -not $Force) {
        Write-Host "Pomijam (juz istnieje): $($_.Name)"
        return
    }
    Copy-Item -Path $_.FullName -Destination $dest -Force
    Write-Host "Skopiowano: $($_.Name)"
}

Write-Host ""
Write-Host "Gotowe. Otworz ponownie projekt android\ w Android Studio lub:"
Write-Host "  Run -> Edit Configurations -> wybierz Kody demo (debug)"