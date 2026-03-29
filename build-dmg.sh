#!/bin/bash
set -e

echo "🔨 Building Hemingway.app for macOS..."

# Check for xcodegen
if ! command -v xcodegen &> /dev/null; then
    echo "❌ xcodegen not found. Install with:"
    echo "   brew install xcodegen"
    exit 1
fi

# 1. Generate Xcode project
echo "📦 Generating Xcode project..."
xcodegen generate

# 2. Build the app
echo "🏗️  Building Release configuration..."
xcodebuild \
    -project Hemingway.xcodeproj \
    -scheme Hemingway \
    -configuration Release \
    -derivedDataPath ./build \
    clean build

# 3. Locate the built app
APP_PATH="./build/Build/Products/Release/Hemingway.app"

if [ ! -d "$APP_PATH" ]; then
    echo "❌ Build failed - Hemingway.app not found at $APP_PATH"
    exit 1
fi

echo "✅ Build complete: $APP_PATH"

# 4. Create DMG
echo "💿 Creating DMG..."

DMG_NAME="Hemingway-$(date +%Y%m%d).dmg"
DMG_PATH="./build/$DMG_NAME"

# Remove old DMG if exists
rm -f "$DMG_PATH"

# Check if create-dmg is available (better DMG creation)
if command -v create-dmg &> /dev/null; then
    echo "   Using create-dmg for professional DMG..."
    create-dmg \
        --volname "Hemingway" \
        --window-pos 200 120 \
        --window-size 600 400 \
        --icon-size 100 \
        --icon "Hemingway.app" 175 190 \
        --hide-extension "Hemingway.app" \
        --app-drop-link 425 190 \
        --no-internet-enable \
        "$DMG_PATH" \
        "$APP_PATH"
else
    echo "   Using hdiutil (basic DMG)..."
    echo "   💡 For better DMG: brew install create-dmg"

    # Create temporary directory for DMG contents
    TMP_DIR=$(mktemp -d)
    cp -R "$APP_PATH" "$TMP_DIR/"

    # Create DMG
    hdiutil create \
        -volname "Hemingway" \
        -srcfolder "$TMP_DIR" \
        -ov \
        -format UDZO \
        "$DMG_PATH"

    # Cleanup
    rm -rf "$TMP_DIR"
fi

echo ""
echo "✅ DMG created successfully!"
echo "📍 Location: $DMG_PATH"
echo ""
echo "🚀 To install: Open the DMG and drag Hemingway.app to Applications"
