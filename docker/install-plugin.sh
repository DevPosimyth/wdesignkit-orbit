#!/bin/bash
# =============================================================================
# WDesignKit QA — Install Plugin from ZIP
# Usage: bash docker/install-plugin.sh /path/to/wdesignkit.x.x.x.zip
# =============================================================================

ZIP_FILE="$1"

if [ -z "$ZIP_FILE" ]; then
  echo ""
  echo "Usage: bash docker/install-plugin.sh /path/to/wdesignkit.x.x.x.zip"
  echo ""
  echo "Example:"
  echo "  bash docker/install-plugin.sh ~/Downloads/wdesignkit.2.2.10.zip"
  echo ""
  exit 1
fi

if [ ! -f "$ZIP_FILE" ]; then
  echo "ERROR: File not found: $ZIP_FILE"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_DEST="$SCRIPT_DIR/plugins"

echo ""
echo "========================================="
echo " Installing WDesignKit Plugin"
echo " Source: $ZIP_FILE"
echo " Dest  : $PLUGIN_DEST"
echo "========================================="

# Clear existing plugin files
rm -rf "$PLUGIN_DEST"
mkdir -p "$PLUGIN_DEST"

# Extract zip — handle both wdesignkit/ subfolder and flat structure
TMP_DIR=$(mktemp -d)
unzip -q "$ZIP_FILE" -d "$TMP_DIR"

# Check if zip contains a wdesignkit/ subfolder
if [ -d "$TMP_DIR/wdesignkit" ]; then
  cp -r "$TMP_DIR/wdesignkit/." "$PLUGIN_DEST/"
  echo "Extracted from wdesignkit/ subfolder."
else
  cp -r "$TMP_DIR/." "$PLUGIN_DEST/"
  echo "Extracted flat structure."
fi

rm -rf "$TMP_DIR"

# Verify main plugin file exists
if [ -f "$PLUGIN_DEST/wdesignkit.php" ]; then
  PLUGIN_VERSION=$(grep "Version:" "$PLUGIN_DEST/wdesignkit.php" | head -1 | awk '{print $NF}')
  echo ""
  echo "Plugin installed successfully!"
  echo "Version: $PLUGIN_VERSION"
  echo ""
  echo "Next steps:"
  echo "  1. docker compose up -d          (start / restart environment)"
  echo "  2. Wait ~30s for setup to complete"
  echo "  3. npx playwright test tests/plugin/login.spec.js --project=plugin-desktop"
  echo ""
else
  echo "WARNING: wdesignkit.php not found in extracted files."
  echo "Contents of $PLUGIN_DEST:"
  ls "$PLUGIN_DEST"
fi
