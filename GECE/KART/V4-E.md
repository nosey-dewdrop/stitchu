# KART V4-E — DÜZELTME TURU: kapının alanı seçilmiş, raglan raglan değil

ETİKET: SIRALI (tur 5; hakem KALDI dedi, faz kapanmadı)
SÜRE TAVANI: 75 dk

## NE
Bağımsız bir hakem `engine/tests/flat_expresses_spec_check.mjs`'yi ÖLÇTÜ ve
iki kusur buldu. İkisi de onarılacak. Bu kart hükmü tartışmaz, onarır.

---

## KUSUR 1 — KAPININ DEĞER ALANI ELLE SEÇİLMİŞ (asıl kusur)

Hakemin ölçümü:
- Kapının `SLEEVE_VALUES` listesi tam olarak bu gece onarılan iki değer +
  zaten ayrışan üçü. Yani kapı, geçtiği şeye göre şekillenmiş.
- Alan dışı yoklandı: **`straight` · `balloon` · `bishop` · `kimono` ·
  `dolman` · `ZZZNONSENSE`** — altısının altısı da `set` ile
  **eleman kümesi ÖZDEŞ, kontur 2705.08u, fark 0.00u**.
- ★ Ve fiilen kullanılan değerler bunlar: repodaki spec JSON'larında
  **`straight` 237 kez · `balloon` 35 kez** geçiyor; `raglan`/`puff`/`set`
  **0 kez**. Yani RULES invariant 1 ihlali en çok kullanılan değerlerde
  DURUYOR; kapı onlara hiç bakmıyor.

### ONARIM
1. **Alan elle yazılmayacak, TÜRETİLECEK.** Kapı `sleeveStyle` (ve aynı
   şekilde `collarType`/`collar`) için değer alanını kaynaktan çıkarsın:
   repodaki spec JSON'larında fiilen geçen değerler + `contract/`ta beyanlı
   değerler. Elle yazılmış liste = seçilmiş alan; hakem bunu arıyor.
   Alanı basan komutu ve sayıyı log'a yaz.
2. **Her değer iki kovadan birine düşer, üçüncüsü yok:**
   - **İFADE EDİLDİ**: aynı taban spec'te başka her değerden geometrik
     olarak FARKLI çizim (fark > 0; eşitlik/eşitsizlik, eşik uydurma yok).
   - **İFADE EDİLEMEDİ**: kalem o değeri ADIYLA damgalar
     (`data-engine-gap`) ve kapı onu **UNEXPRESSED** olarak SAYAR ve
     ADIYLA basar. Sessiz eşitlik (damgasız çökertme) = KIRMIZI.
3. **RATCHET**: `UNEXPRESSED` sayısı bugünkü ÖLÇÜLEN değerle tavanlanır ve
   yalnız DÜŞEBİLİR (emsal: V3'ün `UNMEASURED 3/6, ratchet tavanı 3`).
   Tavanı bugün ölç, test başlığına yaz. Artıran commit kapıda kırmızı düşer.
   ★ Bu kovanın adı DÜRÜSTLÜKTÜR, gevşetme değil: bugün ifade edilemeyeni
   yeşile boyamak yerine SAYIYA bağlıyoruz.
4. **Öncelik**: fiilen kullanılan `straight` (237) ve `balloon` (35) —
   en az BİRİNİ gerçekten İFADE ET (§4.7: hata bulmak iş değil, çözüm
   tasarlamak iştir). `balloon` için `contract/flat-convention-v1.json →
   croquis.sleeveLaw` zaten kanunu taşıyor (kol ağzı büzgüsü + kapak);
   sayı UYDURMA, kanunda yazanı kullan. İfade edemediğini ADIYLA
   UNEXPRESSED'e yaz — gizleme.

---

## KUSUR 2 — `raglan` BİR RAGLAN DEĞİL

Hakemin ölçümü:
- `data-part="sleeve"` path'i `set` ile **birebir aynı**, hâlâ omuz ucundan
  (`M 70.2 16.9`) başlıyor; üstüne bir dikiş EKLENİYOR.
  Commit `c993491` gövdesindeki *"instead of"* cümlesi YANLIŞ.
- O eklenen dikiş **çift aynalama yüzünden görünüm başına 4 kez** basılıyor;
  `set 10 → raglan 18` eleman artışının **8'i üst üste binen kopya**.

### ONARIM
1. **Yinelenen çizim ölür.** 4 kez basılan dikiş 1 kez basacak. Bu bir
   çizim artefaktıdır; kökü düzeltilir, kırpmayla gizlenmez (§6/V4 md.5).
2. **Raglan topolojik olacak ya da UNEXPRESSED'e düşecek.** Gerçek raglan:
   kol oyuğu dikişi yakadan koltukaltına iner, omuz ucu köşesi GÖVDE
   siluetinden çıkar ve kola geçer. Yapabiliyorsan yap; yapamıyorsan
   `raglan`'ı ADIYLA UNEXPRESSED'e yaz ve commit gövdesine "raglan
   topolojisi kurulmadı" diye yaz. **İkisi de kabul; yalan kabul değil.**
3. Commit gövdesinde `c993491`'in yanlış cümlesini AÇIKÇA düzelt
   (sessiz silme yok).

---

## ZORUNLU KANITLAR
- **RULES 9**: kırmızı AD kümesi 6'yı GEÇEMEZ. Kontrol
  `GECE/log/V4.ctest.before.txt` (contract_check · figure_check ·
  flat_artifact_census · flat_pattern_agree_check · sizechart_source_check ·
  style_check). TAM ctest koş → `GECE/log/V4-E.ctest.after.txt`.
  ⚠ `flat_geometry_sellable_check` kollu stillerin kolu ÇİZMESİNİ şart
  koşuyor (V4-B ölçtü): red = çizmemek DEĞİL, adıyla damgalamaktır.
- **§4.5 MUTASYON**: `straight`'i (ya da ifade ettiğin değeri) tekrar `set`'e
  eşitle → kapı KIRMIZI; geri al → YEŞİL. `GECE/log/V4-E.mutasyon.txt`.
- **§4.2 BOŞ TEST**: değişen kapıyı faz-öncesi (`c396fb4`) worktree'sinde
  koştur, kırmızı düştüğünü göster → `GECE/log/V4-E.bostest.txt`.
- **Ratchet**: `bash engine/tests/vocab_reference_check.sh` YEŞİL kalmalı;
  tabanı KESME.
- PNG: ifade ettiğin her yeni kol değeri için render →
  `GECE/log/V4-E.kol/` (RULES 3: yol yoksa adım yapılmamıştır).

## GİRDİ DOSYALARI
YAZARSIN: `engine/tests/flat_expresses_spec_check.mjs` ·
`engine/tools/render-garment-flat.mjs`
OKURSUN: `contract/flat-convention-v1.json` (DEĞİŞTİRME) ·
`contract/garment-spec-v2.json` (DEĞİŞTİRME) ·
`engine/tests/flat_geometry_sellable_check.mjs` ·
`engine/tests/flat_convention_check.mjs` · `GECE/V4-B.md` · ENV.md · RULES.md

## ÇIKTI
`GECE/V4-E.md` (ÖLÇÜLEN sayı+komut+hash · KAPANAN/AÇILAN KIRMIZI ·
yapılamayan · kart dışı) + yukarıdaki loglar + commit + push (hash raporda).

## YASAKLAR
- Alanı elle yazma (kusur 1'in ta kendisi).
- Eşik uydurma; `UNEXPRESSED` tavanını bugünkü ÖLÇÜMDEN al.
- Mevcut testi gevşetme, susturma; `vocab_reference_check` tabanını kesme.
- "Buğra'ya benziyor mu" kapısı kurma (§7.3).
- `patterns_real/` PDF'lerine dokunma (§7.2).
- Yeni kaynak dosya AÇMA.
- Yapamadığını yaptım deme: UNEXPRESSED dürüst bir cevaptır, yalan değildir.
