# Vexa 🏁

Petrol and diesel car and motorcycle encyclopedia for Windows, macOS, Android and iOS — **made by Tv Man**

## Download

Latest release: **[Releases](https://github.com/tvman78/Vexa/releases/latest)**

| Platform | File | Updates |
|---|---|---|
| Windows 10/11 | `Vexa-Setup-<version>.exe` | Updates itself inside the app |
| Android | `Vexa-Android-<version>.apk` | App finds the new version and opens its download |
| macOS | `Vexa-macOS-<version>.dmg` | App finds the new version and opens its download |
| iPhone / iPad | `Vexa-iOS-unsigned-<version>.ipa` | Install with AltStore or Sideloadly |

> The apps are unsigned, so the system may show a warning. On Windows choose **More info › Run anyway**. On macOS, if the app will not open, run `xattr -cr /Applications/Vexa.app`.

## Features

- **9,204 car models from 858 brands** and **2,020 motorcycle models from 139 brands**, from the earliest years to today
- **No electric vehicles:** electric, plug-in and hybrid models are filtered out
- Real photos from Wikimedia Commons, with author and license credits
- Real brand logos for 606 car and motorcycle brands
- 120 detailed cars with engine, performance, dimensions, interior and exterior data
- Common mechanical faults with symptoms and solutions
- Full part lists: engine, fuel, cooling, exhaust, transmission, brakes, suspension, electrical, body and interior
- Motorcycle brands arranged from economy to mid-range, premium and exotic
- Browse models by decade, search, compare cars and save favorites
- In-app updates, a Help center with frequently asked questions, and a redesigned side menu
- 11 languages: English, Türkçe, Deutsch, Français, Español, Italiano, Português, Русский, العربية, 中文, 日本語

## What's new

### 1.1.3

- 184 more brand logos, for 606 in total: Ducati, Harley-Davidson, Aprilia, MV Agusta, Moto Guzzi, Royal Enfield, Bajaj, Husqvarna, Vespa, KYMCO, Indian, Borgward, Austin-Healey and more
- Every logo was checked by hand; images that showed a vehicle instead of a logo were removed

### 1.1.2

- Real brand logos on the Brands and Motorcycles pages: 422 car and motorcycle brands, including BMW, Mercedes-Benz, Ford, Toyota, Ferrari, Tofaş, Honda, Yamaha and KTM
- Brands without a verified logo keep the colored letter badge; more logos will follow in later updates
- Logos are stored inside the app, so they also work offline

### 1.1.1

- The Engine, Interior and Exterior tabs now show the matching photo for cars and motorcycles
- Motorcycles get Engine, Cockpit and Exterior tabs
- Photos are matched by brand, model and generation; if no verified photo exists, the app says so instead of showing a different vehicle

### 1.1.0

- Replaced the 3D viewer with real car photos
- Added the all-era car catalog and the motorcycle section
- Added fault guides and complete part lists for cars and motorcycles
- Added in-app updates under Settings
- Added the Help center and the Tv Man credit
- Redesigned the side menu with custom icons, including a new garage-style Home button

### 1.0.0

- First release for Windows, macOS, Android and iOS

## Data and limitations

- Catalog data comes from [Wikidata](https://www.wikidata.org/) (CC0) and Wikipedia. It is broad but not a complete list of every vehicle ever built.
- About half of the catalog models have a known production year. Models without one are listed last.
- Engine, interior and cockpit photos are searched on Wikimedia Commons when a tab is opened, so they need internet and are not available for every model.
- Full specifications exist for the 120 detailed cars. Other catalog models show a general fault and parts guide.
- Figures are approximate. Check the manufacturer's documents before buying parts, and use a qualified mechanic for brakes, steering, fuel and safety systems.
- Photos belong to their authors and keep their original licenses. Brand names and logos are trademarks of their owners and are shown only to identify each brand; Vexa is not affiliated with any manufacturer. Logo sources are listed in `src/data/logos.json`.

## Developer notes

- `Guncelleme-Yayinla.bat` — bumps the version and publishes to GitHub; Android, iOS and macOS builds are then made by GitHub Actions (`.github/workflows/build.yml`)
- `scripts/fetch-catalog.mjs` — rebuilds the car and motorcycle catalog
- `scripts/fetch-photos.mjs`, `fix-photos.mjs`, `prune-photos.mjs` — download and clean the bundled photos
