# KART V9-B — `docs_truth_check` KAPISI (yeni mekanik test)

ETİKET: **SIRALI** (V9-A'dan SONRA, kâtip kartlarından ÖNCE)
SÜRE TAVANI: **60 dk** (tavana gelirsen o ana kadarki işi COMMIT'LE, kalanı rapora yaz)

## NE
`docs/` + `README.md` için mekanik bir doğruluk kapısı kur, `ctest`'e kaydet,
faz-öncesi ağaçta KIRMIZI düştüğünü ve mutasyonla KIRILDIĞINI kanıtla.

## GİRDİ DOSYALARI (isim isim)
- `ENV.md` · `RULES.md` (§6 ve §8 bu kapının yasasıdır)
- `GECE/V9-A.md` — §2A/§2B (gerçek ihlal ↔ yanlış pozitif), §3A/§3B (ölü hedef),
  §6B (alet adı olmayan sayısal iddia), **§7 (kapı tabanı + ZORUNLU istisna kuralı)**
- `GECE/V9-R.md` — yayınlanmış emsal + kaçış (escape) mekanizması hükmü
- `GECE/log/V9-A.links.py` · `GECE/log/V9-A.census.py` (mevcut çözücüler; YENİDEN YAZMA,
  gerekiyorsa devral — §7.5: önce grep, sonra yaz)
- `engine/CMakeLists.txt` (test kaydı için)
- Emsal olarak SADECE şu iki mevcut test dosyası okunabilir (biçim/ratchet örneği):
  `engine/tests/vocab_reference_check.sh`, `engine/tests/sleeve_cap_ease_check.mjs`

## KAPININ ÜÇ ALT DENETİMİ (üçü de tek çıktıda, tek exit kodu)

**D1 — DURAN İDDİA (hard 0 hedefli, taban ile ratchet)**
Kalıplar: `ALL PASS` · `0\.00 ?mm` · `0\.0000 ?mm` · `byte-identical` · `bayt bayt` ·
`zero issues` · `zero failures` · `zero validation issues` · `hatasız` · `bitti` ·
`hazır` · `none known` · `validator[- ]clean` · `bugs: none`
**ZORUNLU İSTİSNA (V9-A §7 — bu olmadan kapı RULES §6 ONARIMINI cezalandırır):**
hit DÜŞER eğer (a) hit backtick/tırnak içindeyse, VEYA (b) aynı satırda
`replaced|was measured|ölçüldü|bayatladı|emekli|GECE/|ctest |node engine/tools/`
kalıplarından biri + bir tarih (`\d{4}` veya `\d{1,2} (Ağu|Aug|Tem|Jul)`) varsa.
Fenced kod bloklarının (``` ... ```) içi TARANMAZ (V9-R: GitLab'ın `scope: raw`
dersi — kendi ürettiğimiz gerçek çıktıyı yasaklı iddia sanma).

**D2 — ÖLÜ REPO YOLU (hard 0 hedefli, taban ile ratchet)**
Markdown linki `[x](y)` ve backtick içindeki repo-yolu görünümlü dizeler diske
vurulur. `GECE/log/V9-A.links.py`'nin normalizasyonunu devral (satır eki `:12`
atılır, `{a,b}` açılır, glob çözülür). V9-A §3C'deki 27 yanlış pozitif sınıfı
DÜŞÜRÜLÜR: `engine/`-göreli çözüm, git DALI adları, JSON pointer, format kimliği
(`stitchu.techpack/1`), uzantı jetonu (`.cpp`), üstü çizili/"YOK" ilan edilmiş
hedef (aynı satırda `YOK|does not exist|was moved out|üretilmiyor|diskte yok`).
`docs/archive/tools/*.mjs|*.js` kapsam DIŞI (JS template literal).

**D3 — SAYISAL İDDİANIN SAĞLAYICISI (RATCHET, hard 0 DEĞİL)**
Sayı+birim taşıyan her prose satırı için: aynı satırda ya da kapsayıcı
paragrafta/tablo satırında backtick içinde bir alet/test adı
(`[a-z0-9_.-]+_check`, `*.mjs`, `*.py`, `*.js`, `*.sh`, `ctest`, `grep`, `ls -l`)
ya da bir kanıt yolu (`GECE/...`, `Logs/...`, `reports/...`) VAR MI?
Yoksa ihlal. Bu sayının BUGÜNKÜ değerini ÖLÇ ve tabanı
`engine/tests/docs-truth-baseline.json`'a yaz. Kapı: sayı tabanı AŞARSA kırmızı.
**Taban yalnız DÜŞEBİLİR** (`vocab_reference_check` emsali).
⚠ V9-A §1'in uyarısı: iddia cümlesi SAYISI bir sağlık göstergesi değildir —
D3 cümle sayısına değil, SAĞLAYICISIZ cümle sayısına eşik koyar.

## ÇIKTI (bu yollar, başkası değil)
- `engine/tests/docs_truth_check.mjs` — kapı (node, bağımlılık YOK).
  Başlıkta: ne ölçtüğü, istisna kuralının GEREKÇESİ (V9-A §2B), V9-R'den
  alınan emsal adı.
- `engine/tests/docs-truth-baseline.json` — D3 tabanı (+ D1/D2 tabanı 0 değilse).
- `engine/CMakeLists.txt` — `docs_truth_check` adıyla ctest kaydı.
  ⚠ RULES 9: BU AD DIŞINDA yeni kırmızı ad doğurmayacaksın.
- `GECE/log/V9-B.red-before.txt` — **§4.2 BİRİNCİL USUL KANITI**: kapıyı
  faz-öncesi (bugünkü, ONARIMSIZ) `docs/`+`README.md` ağacına karşı koştur;
  **EXIT 1 ve ihlal listesi** basmalı. Derleme hatası "kırmızı düştü" SAYILMAZ.
  Kırmızı DÜŞMÜYORSA test BOŞTUR: durma, kalıbı sıkılaştır ya da raporda
  "docs zaten temiz, kanıtı şu" diye ÖLÇÜMLE yaz.
- `GECE/log/V9-B.mutasyon.txt` — **§4.5 KANITI**: geçici bir `.md` dosyasına
  ya da mevcut bir docs satırına KASITLI duran-iddia ekle (ör.
  `The matrix is ALL PASS and the draft is byte-identical.`) → kapı KIRILMALI
  (exit 1, ihlal o satırı ADIYLA göstermeli); geri alınca YEŞİLE dönmeli.
  İki koşunun da çıktısı log'a. Aynısını D2 için de yap (olmayan bir yola
  backtick referansı ekle). Kırılamayan kapı SÜSTÜR.
- `GECE/V9-B.md` — kısa tutanak: üç alt denetimin bugünkü sayıları + taban
  değerleri + iki kanıt log'unun yolu + bilinen zaafı (ne YAKALAMAZ).

## YASAKLAR
- `docs/` ve `README.md`'nin İÇERİĞİNİ ONARMA. Bu kart KAPI kurar, metin
  düzeltmez (onarım V9-C/D/E'nin işi). Mutasyon için yaptığın geçici
  değişikliği MUTLAKA geri al ve geri aldığını log'la kanıtla.
- `web/`, `contract/`, `engine/src/`, `engine/tools/` altındaki mevcut
  dosyaları DEĞİŞTİRME. Mevcut hiçbir testi değiştirme (§4.2 yasağı).
- Yeni bağımlılık kurma (npm install YOK). Node yerleşikleri yeter.
- Eşik/tolerans UYDURMA: her sayı ya V9-A'nın ölçtüğü tabandır ya V9-R'nin
  bulduğu yayınlanmış pratiktir; ikisi de yoksa "yayın YOK, taban şu
  ölçümden" diye başlıkta yazılır (§5.1, §7.6).
- `GECE/arsiv/`, `KOSU.md`, diğer kartlar AÇILMAZ.

## RAPOR
yapılan (dosya yolu + commit hash) · ölçülen (sayı + onu basan komut) ·
yapılamayan (sebep) · kart dışı fark edilen.
`ctest --test-dir engine/build -R docs_truth_check --output-on-failure`
çıktısını rapora yapıştır.
İşini KENDİ COMMIT'İNLE bitir (lowercase ingilizce mesaj, co-author YOK).
