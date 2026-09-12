#!/usr/bin/env python3
# 0509 A1a karar tablosu -> SVG + PNG. Girdi: KOSU/0509-state.json (uydurma sayi yok).
import json, subprocess, sys, os, html
os.chdir(subprocess.run(['git','rev-parse','--show-toplevel'],capture_output=True,text=True).stdout.strip())
s=json.load(open('KOSU/0509-state.json'))
rows=[]
for k in s.get('ilanliKirmizi',[]):
    rows.append((k['gecit']+(('/'+k['alt']) if k.get('alt') else ''), str(k['sayi']),
                 'ILANLI KIRMIZI', k['kapanacakAdim'],
                 ('tavan '+str(k['tavan'])) if k.get('tavan') else 'alt kume dondu: '+', '.join(k.get('kirmiziAltTestKumesi',[]))))
W,H=1000,150+70*len(rows)+160
cols=[36,430,520,690]
def esc(t): return html.escape(t)
svg=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">',
     f'<rect width="{W}" height="{H}" fill="#faf8f5"/>',
     f'<text x="36" y="56" font-family="Helvetica,Arial" font-size="26" font-weight="700" fill="#1b1b1b">0509 kosusu — A1a karar tablosu</text>',
     f'<text x="36" y="86" font-family="Helvetica,Arial" font-size="15" fill="#666">kaynak: KOSU/0509-state.json · adim {esc(s["adim"])} · A1a GECTI, A1b ACIK · devredilen ilanli kirmizi {len(rows)}</text>']
hdr=['gecit','sayi','durum','kapanacak']
y=130
for x,t in zip(cols,hdr):
    svg.append(f'<text x="{x}" y="{y}" font-family="Helvetica,Arial" font-size="14" font-weight="700" fill="#444">{esc(t)}</text>')
svg.append(f'<line x1="36" y1="{y+12}" x2="{W-36}" y2="{y+12}" stroke="#ccc"/>')
y+=46
for r in rows:
    svg.append(f'<rect x="30" y="{y-26}" width="{W-60}" height="58" fill="#fdeceb" rx="4"/>')
    for x,t in zip(cols,r[:4]):
        w='700' if x==cols[0] else '400'
        c='#b3261e' if x==cols[2] else '#222'
        svg.append(f'<text x="{x}" y="{y}" font-family="Helvetica,Arial" font-size="14" font-weight="{w}" fill="{c}">{esc(t)}</text>')
    svg.append(f'<text x="{cols[0]}" y="{y+20}" font-family="Helvetica,Arial" font-size="12.5" fill="#7a4a46">{esc(r[4])}</text>')
    y+=70
y+=18
for line in ['KARAR 3: engine/CMakeLists.txt kilide ALINMAZ, IZLEMEYE alinir (--kilit-diff alani + satir yonu).',
             "silinen '-' add_test( / add_executable( satiri = KILIT_IHLALI (izin listesinde olsa bile); ekleme '+' temiz.",
             'uygulama A1b teslimi: KOSU/0509-kosu.js A1 tarifi madde 11.']:
    svg.append(f'<text x="36" y="{y}" font-family="Helvetica,Arial" font-size="14" fill="#333">{esc(line)}</text>'); y+=24
svg.append('</svg>')
open('KOSU/ciktilar/0509-kapi/karar-tablosu.svg','w').write('\n'.join(svg))
if True:
    r=subprocess.run(['qlmanage','-t','-s','1000','-o','KOSU/ciktilar/0509-kapi','KOSU/ciktilar/0509-kapi/karar-tablosu.svg'],capture_output=True,text=True)
    if os.path.exists('KOSU/ciktilar/0509-kapi/karar-tablosu.svg.png'):
        os.replace('KOSU/ciktilar/0509-kapi/karar-tablosu.svg.png','KOSU/ciktilar/0509-kapi/karar-tablosu.png')
print('svg+png yazildi', os.path.exists('KOSU/ciktilar/0509-kapi/karar-tablosu.png'))
