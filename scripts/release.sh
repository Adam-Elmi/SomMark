#!/bin/bash

set -e

echo "Starting release process..."

VERSION_STRING=$(node -e "import fs from 'fs'; const pkg = JSON.parse(fs.readFileSync('./package.json')); console.log(pkg.version);" --input-type module)
IFS='.' read -r MAJOR MINOR PATCH <<< "$VERSION_STRING"
echo "Current version: $MAJOR.$MINOR.$PATCH"

read -p "Enter Major [$MAJOR]: " INPUT_MAJOR
read -p "Enter Minor [$MINOR]: " INPUT_MINOR
read -p "Enter Patch [$PATCH]: " INPUT_PATCH

update_segment() {
    local current=$1
    local input=$2
    if [[ "$input" =~ ^[0-9]+$ ]]; then
        echo "$input"
    else
        echo "$current"
    fi
}

NEW_MAJOR=$(update_segment "$MAJOR" "$INPUT_MAJOR")
NEW_MINOR=$(update_segment "$MINOR" "$INPUT_MINOR")
NEW_PATCH=$(update_segment "$PATCH" "$INPUT_PATCH")

NEW_VERSION="$NEW_MAJOR.$NEW_MINOR.$NEW_PATCH"

if [ "$VERSION_STRING" == "$NEW_VERSION" ]; then
    echo "No version changes detected. Exiting."
    exit 0
fi

echo "New version: $NEW_VERSION"

read -p "Are you sure you want to release v$NEW_VERSION? (y/n): " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "Release cancelled."
    exit 0
fi
# 4. Git Tagging
echo "Tagging release..."
git tag -a "v$NEW_VERSION" -m "version v$NEW_VERSION"

echo "Release version v$NEW_VERSION"
git push origin v$NEW_VERSION
