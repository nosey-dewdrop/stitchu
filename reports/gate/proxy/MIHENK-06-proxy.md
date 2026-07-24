# DAMLA-VEKİLİ TASLAK SEÇİMİ — MIHENK-06 (prenses seam ızgarası)
> B-kategori: vekil TASLAK seçer, Damla sabah mühürler. Bu PIN DEĞİL.
> Vekil = teacher-VLM rolü (görsel yargı). Geçici: yakında Damla-zevk-modeli API'siyle değişecek.

## BAĞLAM (vekile verilen)
- **Ret geçmişi:** MIHENK-01 "parantez çizgi" (rastgele bombeli quadratic, apex'i geçmeyen);
  MIHENK-02 aynı prenses kalemi üstünde kaldı — **ön uç KANCA sorunu** (seam üst ucu
  oyuntuya girerken içe kıvrılıp boyna dönük küçük kanca bırakıyor, bitmemiş kıvrım okuyor).
- **taste-lexicon:** "parantez çizgi" girişi → iç seam ANATOMİK kontrol noktalarından geçmeli
  (oyuntu-girişi → apex → bel); dikiş çizgisi kontur (2.0) ile eşit ağırlıkta olmamalı (orta
  katman 1.4). Bu ızgarada katman ayrımı ZATEN var (W_SEAM 1.4), sorun sadece seam YOLU.
- **STYLE-PIN'ler:** drawstring_babydoll + lace_vneck_70s v7 (band-top köprü, prenses seam
  içermiyor → bu ızgara pinleri ETKİLEMEZ, varsayılanlar geriye uyumlu).

## IZGARA HARİTASI (sm.top = kanca kaldıracı; küçük y = daha dik giriş = daha az kanca)
| var | top(y) | c1 ctrl | apex bow | okuma |
|-----|--------|---------|----------|-------|
| p1  | 30 (baz) | 50.7 | dar | kanca belirgin (reddedilen baz) |
| p3  | 22 | 44.9 | orta | kanca hafif kaldı |
| p4  | 30 | 49.5 | — | baz sınıfı, kanca var |
| p5  | 30 | 51.9 | geniş | apex dolgun ama kanca hâlâ var |
| p7  | 22 | 45.6 | dar | kanca çok hafif, apex zayıf |
| p8  | 30 | 50.3 | — | baz sınıfı |
| p9  | **20** | 46.9 | orta | **kanca yok — en dik/temiz giriş, apex bow okunuyor** |

(p2/p6 origin sweep'i — ön-sağ seam farklı startX; kanca kaldıracını değiştirmiyor.)

## TASLAK SEÇİM: **p9** — gerekçeli
Görsel yargı (9 varyant Chrome PNG ile bakıldı):
- **p9** seam'i oyuntuya en dik açıyla giriyor → boyna dönük içe-kıvrım (kanca) kayboldu;
  üst uç kol oyuntusu/omuz birleşimine doğal akıyor, gerçek armscye-başlangıçlı prenses hattı
  gibi okuyor.
- Aynı anda apex bow'u (göğüs noktası dışa yayı) hâlâ okunuyor → "parantez düz" değil,
  anatomik S korunuyor. Kanca giderken apex düzleşmedi.
- p7/p3 (top=22) kancayı azaltıyor ama hafif kalıntı + p7'de apex zayıflıyor; p9 ikisini
  birden çözüyor (kanca yok + apex sağlam). p5 apex dolgun ama top=30 kancası duruyor.

**HÜKÜM:** p9 taslak "kalemim" adayı. Kanca = MIHENK-02'nin tek açık maddesiydi; p9 onu
sm.top=20 + yumuşak c1 ile kapatıyor, anatomik apex'i bozmadan.

## SABAH DAMLA'YA
- p9 onayı gelirse: styles.json prenses varsayılanına `seam:{top:20, c1:...}` yaz + STYLE-PIN
  (prenses fitted flat) + style_check ctest doğ. **PIN YAZILMADI** (C-kategori).
- "değil" gelirse gerekçe → taste-lexicon + 2. düzeltme turu (top<20 veya c1 sweep).

## PROMPT LOGU (vekil çağrısı — kendim/görsel)
Bu turda harici VLM API çağrısı YAPILMADI (kredi vision işlerine ayrılmış, tavan 200/ray;
seam seçimi görsel yargı, ben teacher rolünde 9 PNG'ye baktım). Damla-zevk-modeli API'si
gelince bu adım sistematik çağrıyla değişecek (not: DEVAM-FASHION geçici-vekil maddesi).
