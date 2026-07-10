#!/bin/zsh
# Builds the golden-dump variant of the engine harness (Swift side) and prints
# CSV to stdout. Pair with engine/build/golden_dump (C++ side) + golden-diff.py.
set -e
cd "$(dirname "$0")/.."
ENGINE=App/Stitchu/Engine
WORK=/tmp/stitchu-golden-dump
mkdir -p "$WORK"
cp engine-check/dump.swift "$WORK/main.swift"
swiftc -O -o "$WORK/dump" \
  "$ENGINE/PatternGeometry.swift" \
  "$ENGINE/BodiceBlock.swift" \
  "$ENGINE/SkirtBlock.swift" \
  "$ENGINE/SleeveBlock.swift" \
  "$ENGINE/GarmentDrafter.swift" \
  "$ENGINE/PatternValidator.swift" \
  "$WORK/main.swift"
"$WORK/dump"
