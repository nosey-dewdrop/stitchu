#!/usr/bin/env bash
# GECE/yasak.sh — PreToolUse(Bash): §0.16 yıkıcı komutları keser
CMD=$(python3 -c 'import sys,json;print(json.load(sys.stdin).get("tool_input",{}).get("command",""))')
echo "$CMD" | grep -Eq 'git (clean|stash|reset --hard|checkout -- \.|branch -D|push --force|push -f)|rm -rf +(engine|contract|web|docs|GECE|\.)' \
  && { echo "§0.16 YASAK: $CMD" >&2; exit 2; }
exit 0
