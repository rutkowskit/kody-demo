# Kody demo

Aplikacja mobilna (Expo / React Native) do podglądu kodu paskowego **CODE128** i kodu **QR** dla dowolnego numeru 6-cyfrowego. Projekt powstał na podstawie analizy aplikacji `pl.resident.gorzow.wielkopolski` i odwzorowuje parametry renderowania kodów z oryginału.

## Wymagania

- **Node.js** (LTS)
- **Android SDK** (m.in. platform-tools z `adb`)
- **Java / Gradle** — obsługiwane przez projekt Android (`android/`)
- Na Windows zalecana **krótka ścieżka projektu** (np. `E:\kody-demo`) — unikasz limitu 260 znaków w ścieżkach natywnych bibliotek

W skrypcie `build-android.ps1` domyślna lokalizacja SDK to `E:\Projects\Android\Sdk`. Jeśli SDK jest gdzie indziej, zaktualizuj ścieżkę w tym pliku oraz w `android/local.properties`.

## Instalacja zależności

```powershell
cd E:\kody-demo
npm install
```

Katalog `android/` nie jest w repozytorium (generowany przez Expo). Przy pierwszym buildzie `build-android.ps1` uruchomi `npm run prebuild:android` automatycznie. Możesz też wygenerować go wcześniej:

```powershell
npm run prebuild:android
```

---

## Uruchomienie aplikacji

### Ważne: jaki build instalować?

| Cel | Architektura APK | Plik w `dist\` |
|-----|------------------|----------------|
| Telefon fizyczny (ARM) | `arm64-v8a`, `armeabi-v7a` | `kody-demo-phone.apk` |
| Emulator x86_64 | `x86_64` | `kody-demo-emulator.apk` |
| Oba | wszystkie | `kody-demo-all.apk` |

**Nie instaluj** APK zbudowanego pod emulator na telefonie — dostaniesz błąd `INSTALL_FAILED_NO_MATCHING_ABIS`.

**Nie używaj** `npm run android:dev` / `expo run:android` na telefonie bez działającego Metro — aplikacja pokaże biały ekran. Do testów na urządzeniu służy **release APK z wbudowanym bundle JS** (skrypt `build-android.ps1`).

### Telefon fizyczny (USB)

1. Włącz **Opcje deweloperskie** i **Debugowanie USB** na telefonie.
2. Podłącz kabel USB i zaakceptuj autoryzację `adb`.
3. Sprawdź, czy urządzenie jest widoczne:

```powershell
adb devices -l
```

4. Zbuduj i zainstaluj (jedno podłączone urządzenie):

```powershell
cd E:\kody-demo
.\build-android.ps1 -Target phone -Install
```

5. Gdy podłączone są **dwa lub więcej** urządzeń (np. telefon + emulator), podaj **serial**:

```powershell
adb devices -l
# przykład:
.\build-android.ps1 -Target phone -Device 4e5ee43e0406 -Install
```

6. Instalacja ręczna (bez przebudowy):

```powershell
adb -s <serial> install -r "E:\kody-demo\dist\kody-demo-phone.apk"
```

Możesz też skopiować plik `kody-demo-phone.apk` na telefon i zainstalować z menedżera plików.

### Emulator Android

1. Uruchom emulator w Android Studio (lub `emulator -avd <nazwa>`).
2. Sprawdź połączenie:

```powershell
adb devices -l
# emulator-5554 ...
```

3. Zbuduj i zainstaluj:

```powershell
cd E:\kody-demo
.\build-android.ps1 -Target emulator -Install
```

Przy wielu urządzeniach:

```powershell
.\build-android.ps1 -Target emulator -Device emulator-5554 -Install
```

### Skróty npm

```powershell
npm run android          # auto: wykrywa urządzenie, buduje i instaluje
npm run android:phone    # telefon (ARM)
npm run android:emulator # emulator (x86_64)
npm run android:all      # uniwersalny APK (~większy rozmiar)
```

### Szybka przebudowa (bez `clean`)

```powershell
.\build-android.ps1 -Target phone -Device <serial> -Install -SkipClean
```

### Gdzie jest gotowy APK?

Po każdym buildzie release kopia trafia do:

```
dist/kody-demo-<phone|emulator|all>.apk
```

Plik `android/app/build/outputs/apk/release/app-release.apk` jest nadpisywany przy kolejnych buildach — do dystrybucji używaj katalogu **`dist\`**.

### Tryb deweloperski (Metro)

Tylko gdy świadomie uruchamiasz serwer bundlera:

```powershell
npm run android:dev
```

Wymaga działającego Metro i połączenia telefonu z komputerem (USB lub ta sama sieć).

---

## Android Studio

Android Studio buduje i instaluje warstwę natywną z katalogu `android/`. Kod JavaScript w trybie **debug** nadal wymaga działającego **Metro** — bez niego aplikacja pokaże biały ekran.

### Przygotowanie (jednorazowo)

```powershell
cd E:\kody-demo
npm install
npm run prebuild:android
.\android-studio\install.ps1
```

Skrypt `install.ps1` kopiuje gotowe konfiguracje Run do `android\.idea\runConfigurations\` (katalog `android/` jest generowany i nie trafia do git).

### Otwarcie projektu

W Android Studio wybierz **Open** i wskaż folder:

```
E:\kody-demo\android
```

Nie otwieraj katalogu głównego repozytorium — Gradle i moduł `app` są w `android/`.

### Ustawienia IDE

**Settings → Languages & Frameworks → Android SDK**

Zainstaluj:

| Komponent | Wersja w projekcie |
|-----------|-------------------|
| Android SDK Platform | **36** |
| Android SDK Build-Tools | najnowsze dostępne |
| NDK | **27.1.12297006** |
| Android SDK Platform-Tools | (adb) |

Ścieżka SDK — domyślnie `E:\Projects\Android\Sdk`. Jeśli masz inną, ustaw ją w Android Studio **oraz** w `android/local.properties`:

```properties
sdk.dir=E\:\\Projects\\Android\\Sdk
```

**Settings → Build, Execution, Deployment → Build Tools → Gradle**

- **Gradle JDK:** 17 lub 21
- Gradle wrapper projektu: **9.3.1** (pobierany automatycznie)

**Node.js w PATH** — Gradle wywołuje `node` przy synchronizacji i buildzie. W terminalu Android Studio sprawdź:

```powershell
node --version
```

Jeśli polecenie nie działa, dodaj Node do PATH systemowego i zrestartuj Android Studio.

### Emulator (zalecany do codziennej pracy)

**Device Manager → Create Device**

- Urządzenie: np. Pixel 6
- System image: **x86_64**, API 34–36 (nie ARM)
- Uruchom emulator przed kliknięciem Run

### Konfiguracje Run (po `install.ps1`)

W Android Studio (dropdown obok zielonej strzałki) pojawią się:

| Konfiguracja | Do czego służy |
|--------------|----------------|
| **Metro (Expo)** | Uruchamia `npm run android:dev` z katalogu nadrzędnego — **odpal najpierw** |
| **Kody demo (debug)** | Build debug + instalacja na emulatorze/telefonie |
| **Kody demo (release APK)** | `app:assembleRelease` — bundle JS wbudowany, bez Metro |

Jeśli konfiguracji nie widać: **Run → Edit Configurations** — powinny być na liście. Przy pierwszym uruchomieniu debug wybierz moduł **`app`**, jeśli IDE poprosi o wskazanie modułu.

Aby przeinstalować konfiguracje po ponownym `prebuild`:

```powershell
.\android-studio\install.ps1 -Force
```

### Typowy workflow (debug)

1. Uruchom emulator (Device Manager) lub podłącz telefon (`adb devices`).
2. W Android Studio wybierz **Metro (Expo)** → Run (otworzy się terminal z bundlerem).
3. Poczekaj, aż Metro wystartuje.
4. Wybierz **Kody demo (debug)** → Run na tym samym urządzeniu.
5. Build Variant: **debug** (Build → Select Build Variant → `debug`).

Alternatywa bez Android Studio — jedno polecenie z katalogu głównego:

```powershell
npx expo run:android
```

### Release z Android Studio (bez Metro)

1. Build Variant: **release**
2. Wybierz **Kody demo (release APK)** → Run  
   albo **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. APK: `android\app\build\outputs\apk\release\app-release.apk`

Do dystrybucji wygodniej użyć skryptu (kopiuje też do `dist\`):

```powershell
.\build-android.ps1 -Target emulator -Install
```

### Typowe problemy w Android Studio

| Objaw | Rozwiązanie |
|-------|-------------|
| Gradle sync: `node` not found | Node w PATH, restart IDE |
| Biały ekran po Run | Najpierw uruchom **Metro (Expo)** |
| `INSTALL_FAILED_NO_MATCHING_ABIS` | Emulator x86_64 albo APK `phone` na telefon ARM |
| Brak urządzenia na liście | SDK Platform-Tools, debugowanie USB, `adb devices` |
| Sync/build bardzo wolny lub błędy ścieżek | Krótka ścieżka projektu (`E:\kody-demo`) |

---

## Poprawne wyświetlanie kodów przy wymuszonym trybie ciemnym (MIUI / Xiaomi i inne)

Na wielu telefonach z **systemowym trybem ciemnym** (szczególnie **MIUI na Xiaomi**) kody kreskowe i QR renderowane przez **SVG** (`react-native-svg`) mogą wyglądać źle: odwrócone kolory (białe paski na ciemnym tle), szare „wyprane” kody itp. Dzieje się tak mimo jawnego ustawienia `#000000` / `#ffffff` w JavaScript.

Przyczyną jest mechanizm Androida **Force Dark** (od API 29, Android 10): system próbuje automatycznie „przyciemnić” widoki, które uznaje za jasne — w tym ścieżki SVG generowane przez biblioteki kodów.

Aplikacja **Kody demo** rozwiązuje ten problem warstwowo. Poniżej opis elementów, które łącznie zapewniają **zawsze czarny foreground na białym tle** w obszarze kodów, niezależnie od motywu systemowego i niezależnie od przełącznika motywu aplikacji (Jasny / Ciemny / System).

Poprawki natywne są w **`plugins/withForceLightCodes.js`** i stosowane automatycznie przy `expo prebuild` (nie giną po `prebuild --clean`).

### 1. Wyłączenie Force Dark na poziomie okna (`MainActivity.kt`)

W `onCreate`, **po** `super.onCreate()`:

```kotlin
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
    window.decorView.isForceDarkAllowed = false
}
```

To najważniejsza i najprostsza poprawka: wyłącza automatyczną inwersję kolorów dla **całego okna aktywności**, więc SVG z kodem paskowym i QR nie są już „poprawiane” przez system na ciemny motyw.

Działa na całym oknie (nie tylko wokół kodów), co w tej aplikacji jest akceptowalne — reszta UI i tak ma kolory zdefiniowane jawnie w JS, a same kody mają stałe `#000` / `#fff`.

### 2. Motyw Androida w `styles.xml`

```xml
<style name="AppTheme" parent="Theme.AppCompat.Light.NoActionBar">
    <item name="android:forceDarkAllowed">false</item>
    ...
</style>
```

- **`Theme.AppCompat.Light`** — bazowy jasny motyw natywny (bez `DayNight`, który podążałby za systemem na warstwie Android resources).
- **`android:forceDarkAllowed=false`** — dodatkowe wyłączenie Force Dark na poziomie motywu (współgra z punktem 1).

### 3. Jawne kolory kodów w JavaScript (`src/CodeDisplay.tsx`)

Kody **nie** korzystają z dynamicznej palety motywu aplikacji. Stałe:

```ts
const CODE_BG = '#ffffff';  // tło kodu
const CODE_FG = '#000000';  // kreski / moduły QR
```

Są przekazywane do:

- **`@kichiyaki/react-native-barcode-generator`** — `lineColor`, `background` (CODE128),
- **`react-native-qrcode-styled`** — `color`, `outerEyesOptions.color`, `innerEyesOptions.color`, `style.backgroundColor`.

Kontener kodu (`codeBox`) ma `backgroundColor: CODE_BG`. Dzięki temu nawet gdy użytkownik włączy **ciemny motyw aplikacji**, sama grafika kodu pozostaje **skanowalna** (wysoki kontrast czarny na białym).

Etykiety („Kod paskowy”, „Kod QR”) i podpis pod kodem używają kolorów z motywu aplikacji — to tylko tekst, nie wpływa na odczyt skanera.

### 4. Przełącznik motywu aplikacji a kody

W aplikacji jest przełącznik **System / Jasny / Ciemny** (`ThemeSwitch`, `ThemeContext`). Zmienia kolory tła, pól tekstowych i napisów przez `Appearance.setColorScheme` i palety w `src/theme.ts`.

**Nie zmienia** renderowania samych kodów — warstwy z punktów 1–3 nadal wymuszają jasne tło i czarny kod.

### 5. Czego świadomie nie używamy (uproszczenie)

Wcześniejsza wersja miała dedykowany natywny wrapper `ForceLightSurface` na pojedyncze widoki. Okazał się zbędny — na urządzeniach Xiaomi wystarczy **`decorView.isForceDarkAllowed = false`** plus motyw i stałe kolory w JS.

### Podsumowanie — checklist dla poprawnych kodów na MIUI

| Element | Plik | Efekt |
|---------|------|--------|
| `decorView.isForceDarkAllowed = false` | `MainActivity.kt` | Wyłącza systemową inwersję SVG |
| `android:forceDarkAllowed=false` | `styles.xml` | To samo na poziomie motywu |
| `Theme.AppCompat.Light` | `styles.xml` | Brak automatycznego DayNight w resources |
| `CODE_FG` / `CODE_BG` | `CodeDisplay.tsx` | Zawsze czarny kod na białym tle |
| Release APK z bundle JS | `build-android.ps1` | Aplikacja działa bez Metro na telefonie |

### Typowe objawy, gdy któryś element brakuje

- **Białe lub szare paski** zamiast czarnych na kodzie paskowym.
- **QR „wyblakły”** lub z odwróconym kontrastem.
- **Biały ekran** po instalacji — zwykle debug APK bez bundla JS lub zła architektura (x86 na telefonie ARM).

---

## Struktura projektu (skrót)

```
App.tsx                 — ekran główny, input 6-cyfrowy
src/CodeDisplay.tsx     — renderowanie CODE128 + QR (parametry jak w oryginale)
src/ThemeContext.tsx    — motyw aplikacji (System / Jasny / Ciemny)
src/ThemeSwitch.tsx     — przełącznik motywu
src/theme.ts            — palety kolorów
build-android.ps1       — build release + kopia do dist\
plugins/                — Expo config plugin (Force Dark / jasny motyw kodów)
android-studio/         — konfiguracje Run dla Android Studio + install.ps1
android/                — projekt natywny Android (Expo prebuild)
dist/                   — gotowe APK do instalacji
```

## Stack technologiczny

- Expo ~57, React Native 0.86, TypeScript
- `@kichiyaki/react-native-barcode-generator` (CODE128, JsBarcode + SVG)
- `react-native-qrcode-styled` + `react-native-svg` (stylowany QR)
- `@react-native-async-storage/async-storage` (zapis preferencji motywu)

## Licencja

Projekt demonstracyjny — użytek wewnętrzny / edukacyjny.