#!/bin/bash

# Strip metadata from images in the birthday folder
# This script removes EXIF data and other metadata while preserving image quality

BIRTHDAY_DIR="birthday"
BACKUP_DIR="birthday/backup"

echo "Stripping metadata from images in $BIRTHDAY_DIR..."

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Process each image file
for file in "$BIRTHDAY_DIR"/*.{jpg,jpeg,png,gif,webp,tiff}; do
    # Skip if no files match the pattern
    [ -f "$file" ] || continue
    
    filename=$(basename "$file")
    
    echo "Processing: $filename"
    
    # Create backup before processing
    cp "$file" "$BACKUP_DIR/$filename"
    
    # Strip metadata using ImageMagick
    if command -v magick >/dev/null 2>&1; then
        # Use newer ImageMagick command
        magick mogrify -strip "$file"
    elif command -v convert >/dev/null 2>&1; then
        # Use older ImageMagick command
        convert "$file" -strip "$file"
    elif command -v exiftool >/dev/null 2>&1; then
        # Use ExifTool as alternative
        exiftool -all= "$file"
    else
        echo "Error: Neither ImageMagick nor ExifTool found. Please install one of them."
        echo "  - ImageMagick: brew install imagemagick"
        echo "  - ExifTool: brew install exiftool"
        exit 1
    fi
done

echo "Metadata stripping complete!"
echo "Original files backed up to: $BACKUP_DIR"
