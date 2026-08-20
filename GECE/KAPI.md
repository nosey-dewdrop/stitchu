# KAPI — fazlar arası kapı sonuçları

Protokol: her fazın sonunda 4 alt kapı koşar. Kapı kırmızıysa faz kapanmaz ve
sonraki faz AÇILMAZ.

---

## F0 KAPISI — 2026-08-20 · SONUÇ: **YEŞİL** (hakem düzeltmeleri işlendikten sonra)

### 1. Makine kapısı — **UYGULANMADI, gerekçesiyle**
F0 bir ÖLÇÜM fazıdır, kod değiştirmez ve yeni test eklemez. Bu yüzden "yeni test
faz öncesi commit'te kırmızı düşüyor mu" sorusunun konusu yok.
Bunun yerine ctest'in **devralınan durumu ölçüldü**: `95 test · 89 yeşil · 6 kırmızı`
(`/tmp/f0_ctest.txt`, 232.84 sn). Bu 6 kırmızı F0'ın doğurduğu değil, devralınandır
ve `KOSU.md`'de açık kırmızı olarak duruyor.

### 2. Kanıt kapısı — **YEŞİL**
Raporda geçen 22 dosya yolu `test -f` ile tek tek doğrulandı: **var=22 · yok=0.**
Ayrıca raporun "yok" dediği iki dosyanın gerçekten yok olduğu doğrulandı
(`engine/STYLE-PIN`, `patterns_real/geometry/ring-trace-locket-front-38.json`).

### 3. Hakem kapısı (ayrı oturum, brief'i görmedi) — **KIRMIZI → düzeltildi → YEŞİL**
Hakeme 5 iddia verildi, çürütmesi istendi. Üçü kısmen çürütüldü:

| iddia | hakem hükmü | ne yapıldı |
|---|---|---|
| 1 · sicil 9/1/5 | DOĞRU | — |
| 2 · sevk edilen yolda detay yok | DOĞRU (`nm` ile sembol düzeyinde kanıtladı) | kanıt F0.md'ye eklendi |
| 3 · damar %0 | **KISMEN** — gerekçe delik: ANAYASA'nın üyelik testi bir ÇİZİM testi, kalıba uygulanmaz; flat bu primitifleri gerçekten çiziyor | gerekçe silindi, sonuç üç yeni bacağa oturtuldu; cümle düzeltildi |
| 4 · flat ölçeksiz | DOĞRU, ve daha sert kanıt buldu (`contract/tables.json` `flat._layer` bunu **beyan ediyor**) | kanıt F0.md'ye eklendi |
| 5 · tek croquis | **KISMEN** — `_engine-full.mjs:256`'da 2 stil-pinli kaçış var; kol/yaka/askı/peplum ayrı üreticilerde | cümle düzeltildi |

Hakemin sorulmamış 5 ek bulgusundan 4'ü rapora işlendi (`zipperPiece` damara uygun →
"5 eksik" sayımı yanlış · `skirtSurface`/`skirtFamily` isim tuzağı · binary 17 Ağu
tarihli · veri modelleri ayrık). 5.'si (`shoulderSeam` kodu var mı) **DOĞRULANMADI**
olarak işaretlendi ve Damla'ya düşenlere yazıldı.

**Hakemin asıl sorusuna cevabı:** çıktı bir testi geçmek için şekillendirilmiş değil
— F0 hiçbir test eklemedi ve iki ölçüm aletinden biri kendi ürettiği üç sayıyı
(göğüs/omuz/yaka) yöntemi çürük olduğu için **sildi**, yanlış sayı raporlamadı.

### 4. Yazma kapısı — **YEŞİL**
`GECE/F0.md` (tutanak) · `GECE/KOSU.md` (canlı durum) · `GECE/INDEX.md` ·
`GECE/KAPI.md` (bu dosya) yazıldı, commit atıldı.

### Faz maliyeti
Yeni kaynak dosya: **2** (`f0-measure-pattern.py`, `f0-measure-flat.mjs`) — sınır 3.
