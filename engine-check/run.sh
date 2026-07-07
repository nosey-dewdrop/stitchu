#!/bin/zsh
# Compiles the pattern engine + validator with the size-matrix harness and runs it.
# Pure numeric check, no simulator needed. Exits 1 if any invariant fails.
set -e
cd "$(dirname "$0")/.."
ENGINE=App/Stitchu/Engine
mkdir -p /tmp/stitchu-engine-check
swiftc -O -o /tmp/stitchu-engine-check/check \
  "$ENGINE/PatternGeometry.swift" \
  "$ENGINE/BodiceBlock.swift" \
  "$ENGINE/SkirtBlock.swift" \
  "$ENGINE/SleeveBlock.swift" \
  "$ENGINE/GarmentDrafter.swift" \
  "$ENGINE/PatternValidator.swift" \
  engine-check/main.swift
/tmp/stitchu-engine-check/check
