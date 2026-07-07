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

## Poprawne wyświetlanie kodów przy wymuszonym trybie ciemnym (MIUI / Xiaomi i inne)

Na wielu telefonach z **systemowym trybem ciemnym** (szczególnie **MIUI na Xiaomi**) kody kreskowe i QR renderowane przez **SVG** (`react-native-svg`) mogą wyglądać źle: odwrócone kolory (białe paski na ciemnym tle), szare „wyprane” kody itp. Dzieje się tak mimo jawnego ustawienia `#000000` / `#ffffff` w JavaScript.

Przyczyną jest mechanizm Androida **Force Dark** (od API 29, Android 10): system próbuje automatycznie „przyciemnić” widoki, które uznaje za jasne — w tym ścieżki SVG generowane przez biblioteki kodów.

Aplikacja **Kody demo** rozwiązuje ten problem warstwowo. Poniżej opis elementów, które łącznie zapewniają **zawsze czarny foreground na białym tle** w obszarze kodów, niezależnie od motywu systemowego i niezależnie od przełącznika motywu aplikacji (Jasny / Ciemny / System).

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