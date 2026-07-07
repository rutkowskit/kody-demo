param(
    [ValidateSet('auto', 'phone', 'emulator', 'all')]
    [string]$Target = 'auto',
    [string]$Device,
    [switch]$Install,
    [switch]$SkipClean
)

$sdkPath = "E:\Projects\Android\Sdk"
if (-not (Test-Path $sdkPath)) {
    Write-Error "Nie znaleziono Android SDK w $sdkPath"
    exit 1
}

function Get-AdbDevices {
    $lines = adb devices -l 2>$null
    if (-not $lines) { return @() }
    return $lines | Select-String 'device\s+(product:|usb:)' | ForEach-Object {
        $serial = ($_.Line -split '\s+')[0]
        $model = if ($_.Line -match 'model:(\S+)') { $Matches[1] } else { '?' }
        $product = if ($_.Line -match 'product:(\S+)') { $Matches[1] } else { '?' }
        [PSCustomObject]@{ Serial = $serial; Model = $model; Product = $product }
    }
}

function Get-AdbArgs {
    param([string]$Serial)
    if ($Serial) { return @('-s', $Serial) }
    return @()
}

function Invoke-Adb {
    param([string[]]$AdbArgs, [string[]]$Command)
    & adb @AdbArgs @Command
}

function Get-AdbPrimaryAbi {
    param([string[]]$AdbArgs)
    $abi = Invoke-Adb -AdbArgs $AdbArgs -Command @('shell', 'getprop', 'ro.product.cpu.abi') 2>$null
    if (-not $abi) { return $null }
    return ($abi -replace '\s', '')
}

function Resolve-AdbDevice {
    param([string]$RequestedSerial)

    $devices = @(Get-AdbDevices)
    if ($devices.Count -eq 0) { return $null }

    if ($RequestedSerial) {
        $match = $devices | Where-Object { $_.Serial -eq $RequestedSerial }
        if (-not $match) {
            Write-Error "Nie znaleziono urzadzenia: $RequestedSerial"
            Write-Host ""
            Write-Host "Podlaczone urzadzenia:"
            $devices | ForEach-Object { Write-Host "  -s $($_.Serial)  ($($_.Model))" }
            exit 1
        }
        return $RequestedSerial
    }

    if ($devices.Count -eq 1) { return $devices[0].Serial }

    Write-Error "Podlaczone jest $($devices.Count) urzadzen. Podaj -Device [serial]:"
    $devices | ForEach-Object { Write-Host "  -Device $($_.Serial)  ($($_.Model))" }
    Write-Host ""
    Write-Host 'Skroty: -Device emulator-5554  (emulator)  |  -Device [id-telefonu]  (USB)'
    exit 1
}

function Resolve-BuildTarget {
    param([string]$Requested, [string[]]$AdbArgs)

    if ($Requested -ne 'auto') { return $Requested }

    $abi = Get-AdbPrimaryAbi -AdbArgs $AdbArgs
    if (-not $abi) {
        Write-Host 'Brak podlaczonego urzadzenia - buduje uniwersalny APK (all).'
        return 'all'
    }

    Write-Host "Wykryto urzadzenie: ABI=$abi"
    if ($abi -match 'x86') { return 'emulator' }
    if ($abi -match 'arm') { return 'phone' }
    return 'all'
}

function Ensure-AndroidProject {
    $androidDir = Join-Path $PSScriptRoot "android"
    $gradlew = Join-Path $androidDir "gradlew.bat"
    if (Test-Path $gradlew) { return }

    Write-Host 'Brak projektu Android (android\gradlew.bat) - uruchamiam expo prebuild...'
    Push-Location $PSScriptRoot
    try {
        & npm run prebuild:android
        if ($LASTEXITCODE -ne 0) {
            Write-Error "expo prebuild nie powiodl sie (kod $LASTEXITCODE). Uruchom recznie: npm run prebuild:android"
            exit $LASTEXITCODE
        }
    } finally {
        Pop-Location
    }

    if (-not (Test-Path $gradlew)) {
        Write-Error 'Po prebuild nadal brak android\gradlew.bat. Sprawdz logi powyzej.'
        exit 1
    }
}

$deviceSerial = $null
$adbArgs = @()
if ($Install -or $Target -eq 'auto') {
    $deviceSerial = Resolve-AdbDevice -RequestedSerial $Device
    $adbArgs = Get-AdbArgs -Serial $deviceSerial
    if ($deviceSerial) {
        $info = (Get-AdbDevices | Where-Object { $_.Serial -eq $deviceSerial } | Select-Object -First 1)
        Write-Host "Urzadzenie: $deviceSerial ($($info.Model))"
    }
}

$resolvedTarget = Resolve-BuildTarget -Requested $Target -AdbArgs $adbArgs

$arch = switch ($resolvedTarget) {
    'emulator' { 'x86_64' }
    'phone'    { 'arm64-v8a,armeabi-v7a' }
    'all'      { 'armeabi-v7a,arm64-v8a,x86,x86_64' }
}

Ensure-AndroidProject

$localProps = Join-Path $PSScriptRoot "android\local.properties"
Set-Content -Path $localProps -Value "sdk.dir=E\:\\Projects\\Android\\Sdk" -Encoding ASCII

Write-Host "Budowanie APK (release, target=$resolvedTarget, arch=$arch, JS wbudowany)..."
Push-Location (Join-Path $PSScriptRoot "android")
try {
    .\gradlew.bat --stop | Out-Null
    $gradleArgs = @('app:assembleRelease', '-x', 'lint', '-x', 'test', "-PreactNativeArchitectures=$arch", '--no-daemon')
    if (-not $SkipClean) { $gradleArgs = @('clean') + $gradleArgs }
    & .\gradlew.bat @gradleArgs
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    $apk = Join-Path $PSScriptRoot "android\app\build\outputs\apk\release\app-release.apk"
    $distDir = Join-Path $PSScriptRoot "dist"
    New-Item -ItemType Directory -Force -Path $distDir | Out-Null
    $distApk = Join-Path $distDir "kody-demo-$resolvedTarget.apk"
    Copy-Item -Path $apk -Destination $distApk -Force
    $sizeMb = [math]::Round((Get-Item $distApk).Length / 1MB, 1)
    Write-Host ""
    Write-Host "OK: $distApk ($sizeMb MB)"
    Write-Host "Gradle: $apk"

    if ($Install) {
        Write-Host "Instalacja na $deviceSerial..."
        Invoke-Adb -AdbArgs $adbArgs -Command @('install', '-r', $distApk)
        if ($LASTEXITCODE -eq 0) {
            Invoke-Adb -AdbArgs $adbArgs -Command @('shell', 'am', 'start', '-n', 'pl.demo.kody/.MainActivity') | Out-Null
            Write-Host 'Uruchomiono: Kody demo'
        }
        exit $LASTEXITCODE
    }

    Write-Host ""
    Write-Host 'Instalacja (jedno urzadzenie):'
    Write-Host "  adb install -r `"$distApk`""
    Write-Host ""
    Write-Host "Instalacja (wiele urzadzen - podaj serial z 'adb devices'):"
    Write-Host "  adb -s [serial] install -r `"$distApk`""
    Write-Host "  .\build-android.ps1 -Target $resolvedTarget -Device [serial] -Install"
    exit 0
} finally {
    Pop-Location
}