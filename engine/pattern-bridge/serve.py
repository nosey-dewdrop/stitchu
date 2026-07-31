# ============================================================================
# serve.py — local atolye pattern service (stdlib only).
#
#   GET  /api/health   -> {"ok": true}
#   POST /api/pattern  -> body: atolye state JSON, or (M3) the wrapped form
#                         {"state": {...}, "flatSvg": "<svg..."}.
#                         runs generate.py (mapping -> GarmentCode -> walk
#                         -> printpack) in a subprocess and answers with a
#                         zip: specification.json, pattern.svg, pattern.png,
#                         print PDF, print-a0.pdf, print-a4.pdf,
#                         print-report.txt, seam-report.json/.txt,
#                         mapping-notes.json, design.yaml, body.yaml
#                         + (only when flatSvg came) flat.svg and flat.png:
#                         the professional technical drawing rendered from the
#                         SAME state by the SAME page — pattern and flat from
#                         one source. A bare-state (old) client still gets the
#                         original 12-member zip, byte-compatible behaviour.
#   everything else    -> static files from web/ (atolye.html lives there)
#
# Run through scripts/atolye-serve.sh (it picks the GarmentCode venv python).
# Generation runs in a subprocess on purpose: GarmentCode chdirs into its own
# repo root, and a threaded server must not have its cwd yanked around.
# ============================================================================
import argparse
import io
import json
import subprocess
import sys
import tempfile
import zipfile
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
WEB_DIR = REPO / 'web'
GC_ROOT = REPO / 'core' / 'third_party' / 'garmentcode'
VENV_PY = GC_ROOT / '.venv' / 'bin' / 'python'
GENERATE = HERE / 'generate.py'

ZIP_MEMBERS = [  # (output file name, name inside the zip)
    ('stitchu_specification.json', 'specification.json'),
    ('stitchu_pattern.svg', 'pattern.svg'),
    ('stitchu_pattern.png', 'pattern.png'),
    ('stitchu_print_pattern.pdf', 'print-pattern.pdf'),
    ('print-a0.pdf', 'print-a0.pdf'),
    ('print-a4.pdf', 'print-a4.pdf'),
    ('print-report.txt', 'print-report.txt'),
    ('seam-report.json', 'seam-report.json'),
    ('seam-report.txt', 'seam-report.txt'),
    ('mapping-notes.json', 'mapping-notes.json'),
    ('design.yaml', 'design.yaml'),
    ('body.yaml', 'body.yaml'),
]


class AtolyeHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.rstrip('/') == '/api/health':
            self._json(200, {'ok': True})
            return
        super().do_GET()

    def do_POST(self):
        if self.path.rstrip('/') != '/api/pattern':
            self._json(404, {'error': 'unknown endpoint'})
            return
        try:
            length = int(self.headers.get('Content-Length', 0))
            state = json.loads(self.rfile.read(length) or b'{}')
        except (ValueError, json.JSONDecodeError):
            self._json(400, {'error': 'body must be atolye state JSON'})
            return

        # M3: new clients wrap the state and ship the flat drawing along.
        # Old clients POST the bare state — behaviour unchanged (12 members).
        flat_svg = None
        if isinstance(state, dict) and 'state' in state and 'flatSvg' in state:
            flat_svg = state.get('flatSvg')
            state = state.get('state') or {}

        with tempfile.TemporaryDirectory(prefix='stitchu-pattern-') as tmp:
            tmp = Path(tmp)
            state_path = tmp / 'state.json'
            out_dir = tmp / 'out'
            state_path.write_text(json.dumps(state))
            proc = subprocess.run(
                [str(VENV_PY), str(GENERATE), str(state_path), str(out_dir)],
                capture_output=True, text=True, timeout=300)
            if proc.returncode != 0:
                sys.stderr.write(proc.stdout + proc.stderr)
                self._json(500, {'error': 'pattern generation failed',
                                 'detail': (proc.stderr or proc.stdout)[-2000:]})
                return

            buf = io.BytesIO()
            with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as z:
                for src, arc in ZIP_MEMBERS:
                    p = out_dir / src
                    if p.exists():
                        z.write(p, arc)
                if flat_svg:
                    # pattern + flat from ONE source: the zip carries the
                    # technical drawing next to the sewing pattern (members
                    # 13-14). PNG via cairosvg (already a generate.py dep);
                    # if it ever fails the svg still ships.
                    z.writestr('flat.svg', flat_svg)
                    try:
                        import cairosvg
                        z.writestr('flat.png', cairosvg.svg2png(
                            bytestring=flat_svg.encode('utf-8'),
                            output_width=1600, background_color='white'))
                    except Exception as e:  # noqa: BLE001 — png is a bonus, svg is the record
                        sys.stderr.write('[atolye-serve] flat.png atlandi: %s\n' % e)
            data = buf.getvalue()

        self.send_response(200)
        self.send_header('Content-Type', 'application/zip')
        self.send_header('Content-Disposition',
                         'attachment; filename="stitchu-kalip.zip"')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _json(self, code, obj):
        data = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, fmt, *args):
        sys.stderr.write('[atolye-serve] %s\n' % (fmt % args))


def main():
    ap = argparse.ArgumentParser(description='atolye local pattern service')
    ap.add_argument('--port', type=int, default=8137)
    ap.add_argument('--bind', default='127.0.0.1')
    args = ap.parse_args()

    if not VENV_PY.exists():
        sys.exit(f'GarmentCode venv missing: {VENV_PY}\n'
                 'run scripts/setup-garmentcode.sh first')

    handler = partial(AtolyeHandler, directory=str(WEB_DIR))
    server = ThreadingHTTPServer((args.bind, args.port), handler)
    print(f'atolye service: http://{args.bind}:{args.port}/atolye.html '
          f'(web/ static + /api/pattern)')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == '__main__':
    main()
