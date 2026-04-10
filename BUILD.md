# Building Hemingway for macOS

## Requirements

⚠️ **Xcode 16.0 or later is required** to build this app.

- **macOS:** 14.0+ (Sonoma or later)
- **Xcode:** 16.0+ (includes Swift 6.0 tooling)
- **Why:** WhisperKit 0.16+ and its dependencies require Swift 6.0 compiler
- **Download Xcode 16:** https://developer.apple.com/download/

### Check your Xcode version

```bash
xcodebuild -version
# Should show: Xcode 16.0 or later
```

---

## Quick Start

```bash
# 1. Install xcodegen (one-time)
brew install xcodegen

# 2. Build DMG
./build-dmg.sh
```

The DMG will be created in `./build/Hemingway-YYYYMMDD.dmg`

---

## Manual Build Steps

### 1. Generate Xcode Project

```bash
xcodegen generate
```

This reads `project.yml` and creates `Hemingway.xcodeproj`.

### 2. Build in Xcode (Option A)

1. Open `Hemingway.xcodeproj` in Xcode
2. Select **Product → Archive**
3. Click **Distribute App → Copy App**
4. Choose destination folder

### 3. Build from Command Line (Option B)

```bash
# Debug build
xcodebuild -project Hemingway.xcodeproj -scheme Hemingway -configuration Debug

# Release build
xcodebuild -project Hemingway.xcodeproj -scheme Hemingway -configuration Release -derivedDataPath ./build
```

The app will be at: `./build/Build/Products/Release/Hemingway.app`

### 4. Create DMG

**Option A: Using create-dmg (recommended)**

```bash
brew install create-dmg

create-dmg \
  --volname "Hemingway" \
  --window-pos 200 120 \
  --window-size 600 400 \
  --icon-size 100 \
  --icon "Hemingway.app" 175 190 \
  --app-drop-link 425 190 \
  "Hemingway.dmg" \
  "./build/Build/Products/Release/Hemingway.app"
```

**Option B: Using hdiutil (built-in)**

```bash
hdiutil create -volname "Hemingway" -srcfolder "./build/Build/Products/Release/Hemingway.app" -ov -format UDZO Hemingway.dmg
```

---

## First-Time Setup

### 1. Install Xcode 16

**Download:** https://developer.apple.com/download/

After installation:
```bash
# Set Xcode 16 as active
sudo xcode-select --switch /Applications/Xcode.app

# Verify version
xcodebuild -version  # Should show Xcode 16.0 or later
```

### 2. Install Build Tools

```bash
# XcodeGen (project generation)
brew install xcodegen

# create-dmg (better DMG creation, optional)
brew install create-dmg
```

### 3. Verify Command Line Tools

```bash
xcode-select --install  # If not already installed
```

---

## Troubleshooting

### "swift-jinja contains incompatible tools version (6.0.0)"

**Error message:**
```
xcodebuild: error: Could not resolve package dependencies:
'swift-jinja' >= 2.0.0 contains incompatible tools version (6.0.0)
```

**Cause:** You're using Xcode 15.x, which includes Swift 5.10. WhisperKit requires Swift 6.0.

**Solution:** Upgrade to Xcode 16.0 or later.

```bash
# Download Xcode 16 from:
# https://developer.apple.com/download/

# After installing, set it as active:
sudo xcode-select --switch /Applications/Xcode.app

# Verify:
xcodebuild -version  # Should show Xcode 16.0+
```

### "The project 'Hemingway' cannot be opened because it is in a future Xcode project file format"

This happens if xcodegen generates a project for Xcode 16 but you're running Xcode 15.

**Solution:** Install Xcode 16 (see above).

### "xcodegen: command not found"

```bash
brew install xcodegen
```

### "Package resolution failed" (WhisperKit / LLM.swift)

1. Open `Hemingway.xcodeproj` in Xcode
2. Go to **File → Packages → Reset Package Caches**
3. Wait for Swift Package Manager to resolve dependencies

### Build fails with "Signing for Hemingway requires a development team"

1. Open `Hemingway.xcodeproj` in Xcode
2. Select project → **Signing & Capabilities**
3. Change **Team** to your Apple Developer account or select **Sign to Run Locally**

---

## Architecture

- **WhisperKit**: ~500MB download on first run (cached in `~/Library/Application Support/Hemingway/models/`)
- **LLM (Qwen2.5-2B)**: ~1.5GB download on first run
- **Total first-run download**: ~2GB
- **macOS requirement**: 14.0+ (Sonoma)

---

## Development

### Quick build for testing

```bash
xcodegen generate
xcodebuild -project Hemingway.xcodeproj -scheme Hemingway -configuration Debug
open ./build/Build/Products/Debug/Hemingway.app
```

### Run tests

```bash
xcodebuild test -project Hemingway.xcodeproj -scheme Hemingway -destination 'platform=macOS'
```
