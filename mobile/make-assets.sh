#!/usr/bin/env bash
# 由 apps/web/public/favicon.svg 生成 App 图标与启动图（需要 rsvg-convert 与 ImageMagick）
set -euo pipefail
cd "$(dirname "$0")"
SVG=../apps/web/public/favicon.svg
mkdir -p assets
TMP=$(mktemp -d)
sed 's/rx="14" //' "$SVG" > "$TMP/full.svg"
sed 's#<rect width="64" height="64" rx="14" fill="\#1f5c4f"/>##' "$SVG" > "$TMP/glyph.svg"
rsvg-convert -w 1024 -h 1024 "$TMP/full.svg" -o assets/icon-only.png
rsvg-convert -w 600 -h 600 "$TMP/glyph.svg" -o "$TMP/glyph.png"
convert "$TMP/glyph.png" -background none -gravity center -extent 1024x1024 assets/icon-foreground.png
convert -size 1024x1024 xc:'#1f5c4f' assets/icon-background.png
rsvg-convert -w 560 -h 560 "$SVG" -o "$TMP/logo.png"
convert -size 2732x2732 xc:'#f4f1ea' "$TMP/logo.png" -gravity center -composite assets/splash.png
cp assets/splash.png assets/splash-dark.png
