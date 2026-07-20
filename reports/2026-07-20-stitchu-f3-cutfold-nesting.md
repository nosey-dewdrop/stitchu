# F3 — CUT-ON-FOLD SİMETRİ + NESTING ANALİZİ (rapor, kod değişikliği YOK)
> 2026-07-20 gece protokolü, A-kategori (Damla gözü gerekmez). Ölçüldü, iddia edilmedi.
> Disk-güvenli mod: Chrome yok, geometri motorun draftJSON çıktısından (JSON) okundu.

## SORU (DEVAM-FASHION F3)
"Orta hattı simetrik + closure'sız parça → yarım çizim + 'cut 1 on fold' + grainline;
kasıtlı orta dikiş (cb_zip, gode) → tam/paylı; asimetrik → olduğu gibi." Motor bu kurala
uyuyor mu, yoksa foldable parçalar tam-genişlik çizilip nesting israfı mı yapıyor?

## YÖNTEM
5 temsili giysi motordan draftJSON ile draft edildi; her parçanın (a) cutInstruction'ı
(b) gerçek çizilen geometrisi (commands bbox: min-x/max-x) kıyaslandı. Fold parçası DOĞRU
çizilmişse bir kenarı fold hattında oturur (min|x| ≈ 0).

## BULGU — CUT-ON-FOLD: **0 DEFEKT** (29 parça, 7 fold-işaretli)
| giysi | parça | cut | x-aralığı | okuma |
|-------|-------|-----|-----------|-------|
| shift | Bodice Front | cut 1 on fold | [0..273] | ✓ fold@x0 (yarım) |
| shift | Bodice Back | cut 2 | [0..285] | ✓ yarım (CB seam mirror) |
| shift | Skirt Front | cut 1 on fold | [0..310] | ✓ fold@x0 |
| shift | Skirt Back | cut 2 (CB seam) | [0..310] | ✓ yarım (zip için CB dikiş) |
| shift | Sleeve | cut 2 | [-155..155] | ✓ tam-genişlik (kol fold'a kesilmez, DOĞRU) |
| princess | Bodice Center Front | cut 1 on fold | [0..217] | ✓ fold@x0 |
| princess | Side Front/Back ×2 | cut 2 | [0..126]/[0..111] | ✓ panel (prenses = seam, fold değil) |
| gore | Skirt 6-gore Panel | cut 6 | [-173..173] | ✓ tam kama (gode = kasıtlı panel, DOĞRU) |
| button-top | Top Front | cut 2 (CF opening) | [-18..273] | ✓ tam (düğme pat = closure, fold DEĞİL, DOĞRU) |
| gathered | Skirt Front | cut 1 on fold | [0..364] | ✓ fold@x0 |

**SONUÇ: motorun cut-on-fold sistemi ZATEN DOĞRU.** Her simetrik + closure'sız parça
yarım çiziliyor (fold@x0). Her tam-genişlik parça haklı gerekçeli: Sleeve (fold'a kesilmez),
Gore panel (kasıtlı kama), button-top Front (CF açıklık = closure). "küp örneği" (tişört önü
tek yarım parça) zaten sağlanıyor: Bodice Front hep [0..W] yarım. **F3 fold işi = TAMAM,
düzeltme gerektirmiyor.** DEVAM-FASHION F3'ün "yarım parçalarla nesting yeniden" ön koşulu
(fold conversion) zaten uygulanmış durumda.

## NESTING (A4 sayfa sayıları — mevcut packer, skyline+shelf)
| giysi | kağıt parça | A4 sayfa | grid |
|-------|-------------|----------|------|
| shift-dress | 5 | 20 | 7×4 |
| princess-dress | 9 | 25 | 3×10 |
| gore-dress | 3 | 14 | 4×4 |
| gathered-dress | 4 | 20 | 4×6 |
| **toplam** | — | **79** | — |

**Fold conversion'dan EK sayfa kazancı YOK** — parçalar zaten yarım. Sayfa sayısı packer'a
bağlı (CLAUDE.md: A4 strateji loop'u 456→430 zaten optimize etti, marjinal <5'te park).

## DÜRÜST NOTLAR (v1.1 aday / park)
1. **princess = 25 sayfa / 9 parça** en yüksek; DEVAM-FASHION F3 emsal bandı "elbise ≤6-8
   parça" diyor, princess 9'da (4 bodice + 4 skirt + 1 sleeve). Bu prenses konstrüksiyonunun
   DOĞASI (panel bölme = seam), defekt değil — ama emsal bandının 1 üstünde. Not: princess'i
   "6-8 parça" bandına sokmak için Side Front+Center Front birleştirme = prensesin kendisini
   iptal eder (yapılamaz). **Emsal bandı prenses için ≤9'a genişletilmeli** (v1.1 aday:
   şartname piece-band'ini shaping'e koşullu yap).
2. **Bias binding tek uzun şerit** (neckline+armhole, 470-1222mm) chalk parçası, sayfaya
   girmiyor (isChalk filtresi) — doğru, ama uzun şerit nesting'de ayrı ele alınabilir
   (park: şerit-katlama).
3. Gore panel [-173..173] tam kama cut-6 — 6 panel tek şablondan kesiliyor (nesting'de
   tek parça 6× kesim notu), sayfa verimli.

## MANDAL DURUMU
Bu analiz kod değiştirmedi → golden/pin/ctest etkilenmedi (ölçüm-only). F3 fold-simetri
maddesi PASS (0 defekt). Nesting maddesi: fold-kaynaklı kazanç yok (zaten optimize).
Kalan F3 işi (eğri cilası C1 süreklilik) ayrı — bu rapor fold+nesting kapsıyor.

## VERİ
Analiz scriptleri /tmp'de (geçici, silindi). draftJSON + web/js/sheet.js packPieces,
mevcut üretim kodundan okundu, motora dokunulmadı.
