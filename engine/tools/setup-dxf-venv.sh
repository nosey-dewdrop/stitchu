#!/bin/sh
# setup-dxf-venv — recreate the ezdxf venv the dxf_check ctest needs.
# ezdxf is the STANDARD CAD library that opens the motor's DXF export and proves
# layer + mm parity (PIPELINE Aşama 5). The venv is gitignored (pip binaries are
# not pushed); this script rebuilds it on a fresh clone. Without it, dxf_check
# FAILS loudly (system python3 has no ezdxf) — it never silently skips.
# run from engine/:  sh tools/setup-dxf-venv.sh
set -eu
HERE="$(cd "$(dirname "$0")/.." && pwd)"   # engine/
VENV="$HERE/.venv-dxf"
python3 -m venv "$VENV"
"$VENV/bin/pip" install --quiet ezdxf matplotlib
"$VENV/bin/python" -c "import ezdxf; from ezdxf.addons.drawing import matplotlib; print('ezdxf', ezdxf.__version__, '+ matplotlib backend OK')"
