# KART F10-B — landing_truth_check kapisini kur (isci-motor)

## NE
`web/index.html` uzerinde MEKANIK bir dogruluk kapisi kur: sayfadaki her sayisal
iddia repoda var olan bir test/alet dosyasina baglanmis olacak, VIZYON bolumleri
simdiki zamanla yazilmayacak, olu ic baglanti 0 olacak. Kapi bugunku sayfada
KIRMIZI dusmek zorunda (dusmuyorsa kapi bostur ve isin cope gider).

## CIKTI
1. `engine/tests/landing_truth_check.sh` — calistirilabilir (chmod +x), model
   CAGIRMAZ, agdan bir sey CEKMEZ, 5 saniyeden kisa kosar, exit 1 ile duser.
2. `web/landing-claims.json` — beyan dosyasi. Sayfadaki her sayisal iddia icin
   tek kayit: `{"claim":"<sayfadaki metin parcasi birebir>",
   "provenBy":"<repoda var olan bir dosya yolu>", "note":"<tek cumle>"}`.
   `provenBy` diskte YOKSA kapi kirmizi duser.
3. `engine/CMakeLists.txt`'e tek `add_test` satiri (adi `landing_truth_check`).
4. `GECE/F10-B.md` — tutanak.
5. `GECE/log/F10B.gate.before.txt` — kapinin BUGUNKU sayfada verdigi cikti
   (EXIT kodu dosyanin son satirinda yazacak).

## KAPININ UC KURALI (baskasini ekleme)
- **A · sayi beyansiz olamaz.** index.html'in GORUNEN metninden (style/script/svg
  cikarilmis) cekilen her sayi-tasiyan iddia (`\d[\d.,]*\s*(mm|mm²|%|\$|cm|piece|
  size|draft|EU\d+)` ve `EU34–52` gibi aralik ifadeleri) `web/landing-claims.json`
  icinde bir kayitla eslesecek ve o kaydin `provenBy` yolu diskte VAR olacak.
- **B · vizyon simdiki zamanla konusamaz.** `data-vizyon` niteligi tasiyan her
  elemanin metninde su kaliplar YASAK: ` is `, ` are `, ` does `, ` exports `,
  ` runs `, ` publishes `, ` drafts `, ` matches `, `already`, `today`.
  (Vizyon bolumu gelecek zamanla ya da "will / planned / not yet" ile yazilir.)
  `data-vizyon` tasiyan eleman HIC yoksa bu kural sessizce gecer.
- **C · olu baglanti 0.** `node engine/tools/site-health.mjs` exit 0 vermeli.

## SIRA (bu sirayla, atlamadan)
1. ONCE kapiyi yaz, `web/` sayfasina DOKUNMADAN kostur, ciktisini
   `GECE/log/F10B.gate.before.txt`'ye yaz. **EXIT 0 gelirse kapi bostur:**
   kurali sertlestir, tekrar kostur, ta ki bugunku sayfa DUSENE kadar.
   Kac ihlal saydigini tutanaga YAZ (kural A kac, kural B kac, kural C kac).
2. `web/landing-claims.json`'i BUGUNKU sayfa icin doldurma — DOLDURMA. Onu
   F10-C isciisi yeni sayfayi yazarken dolduracak. Sen sadece bos bir iskelet
   birak: `{"claims": []}` + dosyanin basina sema aciklamasi.
3. `engine/CMakeLists.txt`'e testi kaydet ve `ctest -R landing_truth_check`
   ile kostugunu KANITLA (ciktiyi tutanaga yapistir).

## ONCE GREP
- `sed -n '85,100p' engine/CMakeLists.txt` — var olan `add_test` bicimini kopyala.
- `ls engine/tests/*.sh` — kabuk-testi ornegi var mi, varsa birini oku ve ayni
  iskeleti kullan (cikis kodu, PROJE KOKU bulma bicimi).
- `head -40 engine/tools/site-health.mjs` — nasil cagriliyor, exit kodu ne.

## YASAKLAR
- `web/index.html`'i DEGISTIRME. Bu kartin isi kapi, sayfa degil.
- Var olan hicbir `engine/tests/*` dosyasini degistirme/silme (kapi K6 oldurur).
- `engine/CMakeLists.txt` disinda mevcut hicbir `engine/` ya da `contract/`
  dosyasina dokunma; dokunursan ekledigin satirda su kelimeler GECMEYECEK:
  `tolerance` `threshold` `EPS` `epsilon` `gate` `kapi` (kapi K4 oldurur).
- `contract/generated-paths.sha256`'daki uretilmis dosyalarin HICBIRINI elle
  duzenleme (§0.15, kapi K9 oldurur).
- HEDEF.md · DAMLA-KUYRUK.md · devlog.md · linkedin.md · ANAYASA.md · GECE/KOSU.md
  dosyalarini Read ile ACMA.
- Commit ATMA.
- `GECE/F10-B.md`'de andigin her dosya yolu diskte gercekten var olacak.

## SURE TAVANI
60 tur.
