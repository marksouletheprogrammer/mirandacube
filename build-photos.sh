#!/bin/bash
# Scans the birthday/ folder for image files and updates the photo list in script.js
# Run this after adding, removing, or renaming photos in the birthday/ folder.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BIRTHDAY_DIR="$SCRIPT_DIR/birthday"
SCRIPT_FILE="$SCRIPT_DIR/script.js"

# Find image files, extract filenames, sort alphabetically
PHOTOS=$(find "$BIRTHDAY_DIR" -maxdepth 1 -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.gif' -o -iname '*.webp' \) -exec basename {} \; | sort)

if [ -z "$PHOTOS" ]; then
    echo "No photos found in birthday/ folder."
    PHOTO_ARRAY="[]"
else
    COUNT=$(echo "$PHOTOS" | wc -l | tr -d ' ')
    echo "Found $COUNT photo(s) in birthday/:"
    echo "$PHOTOS" | while read -r f; do echo "  $f"; done

    if [ "$COUNT" -gt 9 ]; then
        echo ""
        echo "WARNING: Only the first 9 photos (alphabetically) will appear in the grid."
    fi

    # Build JS array string
    PHOTO_ARRAY="["
    FIRST=true
    while IFS= read -r file; do
        if [ "$FIRST" = true ]; then
            FIRST=false
        else
            PHOTO_ARRAY+=", "
        fi
        PHOTO_ARRAY+="'$file'"
    done <<< "$PHOTOS"
    PHOTO_ARRAY+="]"
fi

# Replace the photos array line in script.js
if grep -q "const photos = \[" "$SCRIPT_FILE"; then
    sed -i '' "s|const photos = \[.*\];|const photos = $PHOTO_ARRAY;|" "$SCRIPT_FILE"
    echo ""
    echo "Updated script.js with: const photos = $PHOTO_ARRAY;"
else
    echo "ERROR: Could not find 'const photos = [' in script.js"
    exit 1
fi
