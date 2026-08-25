import re,html,pathlib,collections
ASSERT=re.compile(r'(\b\d[\d,\.]*\s*(mm|cm|%|KB|pages?|pieces?|drafts?|sizes?|steps?)\b'
  r'|\bbyte-identical\b|\bzero (issues|failures)\b|\bvalidator[- ]clean\b|\bALL PASS\b'
  r'|\b(never|always|every|only|free|proven|deterministic|exact)\b)',re.I)
files=sorted(set(list(pathlib.Path('docs').rglob('*.md'))
  +[pathlib.Path('README.md')]))
per=collections.Counter(); uniq=collections.Counter()
for p in files:
    s=p.read_text(encoding='utf-8',errors='replace')
    if p.suffix=='.html':
        s=re.sub(r'(?s)<script.*?</script>|<style.*?</style>','',s)
        s=html.unescape(re.sub(r'<[^>]*>',' ',s))
    for t in re.split(r'(?<=[.!?])\s+|\n',s):
        t=' '.join(t.split())
        if len(t)>=25 and ASSERT.search(t): per[str(p)]+=1; uniq[t]+=1
print(len(files),sum(per.values()),len(uniq),len(per))
for f,c in per.most_common(): print(c,f)
