#!/bin/sh
# Installs local git hooks for this repo.
# .git/ is not committed, so run this once per clone to activate the guards.
#
#   sh scripts/install-hooks.sh
#
# Installed hooks:
#   commit-msg  - rejects any commit message containing a "Co-Authored-By" trailer.
set -e
repo_root="$(git rev-parse --show-toplevel)"
src="$repo_root/scripts/hooks/commit-msg"
dst="$repo_root/.git/hooks/commit-msg"
cp "$src" "$dst"
chmod +x "$dst"
echo "installed commit-msg hook -> $dst"
