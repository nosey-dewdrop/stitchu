import re, sys
satirlar = open(sys.argv[1]).read().split("\n")
sizan = []
for i, s in enumerate(satirlar):
    if not re.match(r"\s*(ctest|node|python3)\s", s):
        continue
    if re.search(r"\$\(|^\s*\w+=", s):      # degiskene aliniyor
        continue
    blok = "\n".join(satirlar[i:i+20])
    if "$LOG" in blok:                       # cagri blogunda log yonlendirmesi var
        continue
    sizan.append("%d: %s" % (i + 1, s.strip()[:70]))
print("\n".join(sizan))
