#!/usr/bin/env python3
"""V9-A dead-link / dead-reference scan.

Scope: every PROSE file under docs/** (*.md, *.html, archive included) + README.md.
Code files under docs/archive/tools/ (*.mjs, *.js) are listed as SKIPPED-CODE:
their backticks are javascript template literals ("</g>", "stroke-linejoin=..."),
not repo references. Binary (png/pdf/svg) skipped too.

Two probes per line:
  (a) MDLINK  — every markdown link  [text](target)
  (b) TICK    — every backtick span that LOOKS like a repo path

Normalisation before the disk probe (each step is a REAL form used in the docs):
  - trailing  :12  /  :12-17  /  :68,75,80   line references are stripped
  - brace sets  a.{hpp,cpp}  are expanded and ALL members must exist
  - globs  engine/src/geometry.*  are resolved with glob()
  - a candidate with no "/" is a BASENAME: resolved by searching the repo
    (build/, node_modules/, .git/, .venv/ excluded) for a file of that name

Verdict per candidate: VAR / YOK, with the resolved evidence path when VAR.
"""
import re, os, glob, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
os.chdir(ROOT)

MD_LINK = re.compile(r'\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)')
TICK = re.compile(r'`([^`\n]+)`')
LINEREF = re.compile(r':\d+(?:[-,]\d+)*$')
BRACE = re.compile(r'^(.*)\{([^}]*)\}(.*)$')
SUFFIX = ('.md', '.json', '.cpp', '.hpp', '.py', '.mjs', '.js', '.html', '.svg',
          '.png', '.csv', '.sh', '.txt', '.yaml', '.yml', '.sql', '.pdf', '.xml')
SKIPPRE = ('http://', 'https://', 'mailto:', '#', '-', '$', '/tmp/', '~', '/')
PRUNE = {'.git', 'node_modules', 'build', 'build-wasm', '.venv', '__pycache__',
         'third_party', 'emsdk'}

# ---- basename index -------------------------------------------------------
BASENAMES = {}
for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in PRUNE]
    for fn in filenames:
        BASENAMES.setdefault(fn, os.path.relpath(os.path.join(dirpath, fn), ROOT))

def pathlike(s):
    if not s or ' ' in s or s.startswith(SKIPPRE):
        return False
    if any(c in s for c in '<>="\'|()'):      # xml / shell noise
        return False
    core = LINEREF.sub('', s)
    return '/' in core or core.endswith(SUFFIX) or BRACE.match(core)

def expand(t):
    m = BRACE.match(t)
    if not m:
        return [t]
    pre, body, post = m.groups()
    return [x for part in body.split(',') for x in expand(pre + part.strip() + post)]

def resolve(target, base):
    """-> (True, evidence) | (False, None)"""
    t = LINEREF.sub('', target.split('#')[0].split('?')[0])
    if not t:
        return False, None
    hits = []
    for member in expand(t):
        got = None
        if '*' in member:
            for anchor in (ROOT, base):
                g = glob.glob(str(anchor / member))
                if g:
                    got = os.path.relpath(g[0], ROOT); break
        elif '/' in member:
            for anchor in (ROOT, base):
                if os.path.exists(anchor / member):
                    got = os.path.relpath(anchor / member, ROOT); break
        else:
            got = BASENAMES.get(member)
        if got is None:
            return False, None
        hits.append(got)
    return True, hits[0]

files = sorted([p for p in pathlib.Path('docs').rglob('*') if p.is_file()]
               + [pathlib.Path('README.md')])
prose = [p for p in files if p.suffix.lower() in ('.md', '.html')]
skipped = [p for p in files if p not in prose]

rows, seen = [], set()
for p in prose:
    text = p.read_text(encoding='utf-8', errors='replace')
    base = (ROOT / p).parent
    for i, line in enumerate(text.splitlines(), 1):
        cands = [(m.group(1), 'MDLINK') for m in MD_LINK.finditer(line)]
        cands += [(m.group(1), 'TICK') for m in TICK.finditer(line)
                  if pathlike(m.group(1))]
        for tgt, kind in cands:
            if tgt.startswith(('http://', 'https://', 'mailto:', '#')):
                continue
            if kind == 'MDLINK' and not pathlike(tgt) and '/' not in tgt:
                continue
            key = (str(p), i, tgt)
            if key in seen:
                continue
            seen.add(key)
            ok, ev = resolve(tgt, base)
            rows.append((f'{p}:{i}', tgt, kind, 'VAR' if ok else 'YOK', ev or ''))

w = max(len(r[0]) for r in rows)
for f, t, k, v, ev in rows:
    print(f'{f:<{w}}  {t:<52}  {k:<6}  {v:<3}  {ev}')

dead = [r for r in rows if r[3] == 'YOK']
print()
print(f'--- SCOPE: {len(files)} files under docs/** + README.md; '
      f'{len(prose)} prose files scanned, {len(skipped)} skipped ---')
for p in skipped:
    print(f'    SKIPPED  {p}  ({"code" if p.suffix in (".mjs",".js",".py") else "binary/data"})')
print(f'--- REFS: {len(rows)} checked · VAR {len(rows)-len(dead)} · YOK {len(dead)} ---')
print(f'--- DEAD by kind: MDLINK {len([r for r in dead if r[2]=="MDLINK"])} · '
      f'TICK {len([r for r in dead if r[2]=="TICK"])} ---')
print('--- DEAD LIST ---')
for f, t, k, v, ev in dead:
    print(f'    {f:<{w}}  {t}  [{k}]')
