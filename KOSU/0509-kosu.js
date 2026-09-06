export const meta = {
  name: 'stitchu-0509',
  description: 'stitchu 0509 kosusu: fotograf/prompt -> graf -> kalip + flat; adimlar A1b-A12, taze isci + taze hakem + karar ajani, geçit scripti, butce, tag, DURDU.md',
  phases: [
    { title: 'A1 Gecit', detail: 'kapi.sh, emsal olcum, sessiz regresyon seti, state.json, fotograf hatti saglik' },
    { title: 'A2 Ilk gecis', detail: 'tek cumle -> graf -> kalip-36 + flat, kotu de olsa' },
    { title: 'A3 Fotograf', detail: 'foto -> graf; landmark + siluet + Claude; arka ilan; hat yerelde' },
    { title: 'A4 Cizim', detail: 'flat croquis emsal yaninda mm; kalip sayfasi standardi; 34-44' },
    { title: 'A5 Duzeltme', detail: '8 edit = op; bolge disi bayt-ayni; onizleme + duzeltme kutusu' },
    { title: 'A6 Her giysi', detail: 'enum 0, prompt-parse/vision spec kalkar, kol kapisi, eski bloklar silinir, edge case' },
    { title: 'A7 Kumas', detail: 'bolluk alani, pervaz/tela, en bolme, malzeme, kesim plani, rehber' },
    { title: 'A8 Bugra', detail: 'iki satin alinmis kalip graf-v1 ile; EU38 bindirme mm' },
    { title: 'A9 Paket', detail: 'Damla satarim dedikten sonra: paket-03, A4 PDF, worker, prova listesi' },
    { title: 'A10 Deploy', detail: 'tam ctest, landing, canli ekran' },
    { title: 'A11 Tur', detail: 'dikisci / tasarimci / saldirgan -> onarici -> hakem; iki temiz tur, tavan 8' },
    { title: 'A12 Yuzey3B', detail: 'ikinci panel kaynagi, kendi kapilari; gecerse A10 tekrar' },
  ],
}

// ====================================================================================================
// 0509 kosucusu. Mekanik: ~/Desktop/stitchu-kosu-yol-a.js (fazKos / fazVeyaDur / hakem / karar) aynen;
// uzerine: el() mekanik ajani (koşucunun dosya/shell erişimi yok: geçit, tag, bütçe, state.json,
// ilerleme.md, DURDU.md hep el() ile), 8.1 (olen isci deneme yakmaz), 9.4 (yarim isci resume),
// 8.5/8.25 (butce), 8.27 (tag), 8.29 (DURDU.md), 11.7 (yeniden ac), A9 oncesi Damla hukmu (args.satarim).
// Kuru kosu: args.kuru=true -> ajan cagrilmaz, faz listesi + brief kelime sayilari basilir.
// Baslat: args.baslat='A4' -> onceki adimlar atlanir (commit'li). Prova: args.satarim=true A9'i acar.
// ====================================================================================================

const REPO = '/Users/damummyphus/damla_projects_2026/stitchu'
const DOC = `${REPO}/0509-kosu.md`
const STATE = 'KOSU/0509-state.json'
const ILERLEME = 'KOSU/0509-ilerleme.md'
const DURDU = 'KOSU/0509-DURDU.md'
const KAPI = 'engine/tests/0509-kapi.sh'
const BUTCE_COMMIT = 12, BUTCE_SAAT = 5, TUR_MAX = 8

// ============================================================ 15 SATIR KURAL (9.1) ============================================================
const ORTAK = `
stitchu 0509 kosusunda TAZE bir ajansin; isin bitince olursun, her sey dosyaya ve commit'e. Repo: ${REPO}. Ilk komut: cd ${REPO} && git pull --rebase origin main && git status --short && git log --oneline -8.
HEDEF: fotograf veya prompt -> dikilebilir kalip + satilir flat; Midjourney gibi ama cikan piksel degil kalip. Giysi = panel/kenar/dikis grafi (contract/graf-v1.json); sozluk yok. Ayni graf gercek36'da kalip, croquis36'da flat.
KURALLAR (biri kirilirsa is reddedilir):
 1. KANIT = dosya yolu + komut ciktisi. "Baktim/calisiyor" yasak. Teslim ekranda bakilacak png/pdf; gorselsiz adim bitmemis.
 2. Esik gevsetme, test degistirme, ozel-durum if'i, uydurma sabit, Bugra'ya sabit, hakemden once golden pin, JS'e kacan geometri, alan disi dosya = reward hacking, faz duser. Sayi contract'tan; kaynak yoksa DOGRULANMADI.
 3. REFERANS KILIDI: contract/, engine/tests/**, ${KAPI}, engine/golden-reference.csv, engine/src/grafdogrula.*, engine/src/solver_utils.* isletim sistemi seviyesinde salt okunur (chmod); yalniz brief'teki IZIN LISTESI acik. Izin disina dokunursan (git diff tag..HEAD) REWARD_HACKING: deneme duser, diff geri alinir. Degistirmen gerekiyorsa yapma, acikSorular'a yaz.
 4. Sessiz default yok: bilinmeyen -> adiyla ret ("absent" / hata kodu) + yapilabilir en yakin op. Baska giysiye donmek yasak.
 5. ALT-AJAN YOK (Agent/Task araci kullanma). Tek basinasin.
 6. Ayni engel icin 3 commit ya da ayni dosyaya 5 dokunus = DUR, raporda "yanlis seyi onariyorum" + kok katman (vision/prompt-parse/JSON okuyucu/derleyici/graf/degerleme/flat/pdf). Arac iki kez engellediyse araci onar, "arac onarimi" diye ayir.
 6b. ONCE DERLE: kod yazdiktan sonra cmake --build engine/build -j2 YESIL olmadan test/olcum/commit yok. Yalniz derleme/link/syntax kapatan commit'in mesaji 'fix(build):' ile baslar; bunlar mantik butcesine sayilmaz (kendi tavani 6, asilirsa 'derleme cukuru' adiyla durur). Mantik butceni sozdizimine yakma.
 6c. ERR_UNSOLVABLE / ERR_SCALE_MISMATCH alirsan COZUCUYU DEGISTIRME (engine/src/solver_utils.* kilitli, A2a'nin isi): girdiyi duzelt (kompozisyon JSON'u, hedef oranlar, eksik op) ya da kompozisyonu 'absent' adiyla devret. Kok neden gercekten cozucudeyse acikSorular'a yaz (karar ajani 11.7 ile A2a'yi yeniden acar), kendi basina acma.
 6d. Gecit ciktisi CTEST_CRASH_OR_INVALID_JSON ise: ${KAPI} bozuk ya da bir alt surec cokmus (KOSU/0509-kapi.log son 40 satir). Once ARACI onar (8.3), bunu 'arac onarimi' diye ayir; esik gevsetme degildir.
 7. BUTCE: ${BUTCE_COMMIT} commit ya da ${BUTCE_SAAT} saat (fix(build): commit'leri haric). Asarsan dur, commit at, yarim=true ile raporla. Context'in doluyorsa (ayni dosyayi ikinci kez okuyorsun, %70 gectin) ayni sey: commit, KOSU/0509-devir-notu.md'ye iki satir (ne yapmaya calisiyordum; hangi yolu neden biraktim, kaldigim satir), yarim=true, ol. Resume isen ILK IS o notu oku. Yarim birakmak hata degil.
 8. Makine MacBook Air 8GB: build -j2, ctest hedefli -j1, tek Chrome (timeout 90, izole --user-data-dir, bitince kendi sureclerini oldur), arka plan surec yok. Motor degistiyse: cmake --build engine/build -j2 VE bash engine/build-wasm.sh (web/vendor + engine/dist taze, ls -la ile).
 9. Repoyu butun okuma: rg ile hedefli, satir araligiyla oku, bir dosyayi iki kez okuma; build/test ciktisi son 40 satir.
10. LLM yalniz fotograf/cumle/edit okumada; cikti her zaman graf-v1 JSON, sema + dogrulayici; cizim deterministik. Ayni girdi KOSU/onbellek/<sha>.json'dan okunur, yeniden odenmez. Cagri sayisini raporla (llmCagri).
11. Yalniz DOSYA ALANINA yaz; ortak dosyalarda (CMakeLists, contract/*.json) yalniz ekleme. GIRDI/ ve patterns_real/ okunur, degismez, commit edilmez; onlardan turemis her gorsel KOSU/ciktilar/_yerel/ altina (gitignore'lu).
12. Git: main, branch yok; her anlamli adimda commit + git push origin main; mesaj kucuk harf Ingilizce, co-author yok. git clean/stash/reset --hard yasak. Silme ayri commit, rg kaniti mesajda.
13. Damla'ya soru yok. Karar gereken sey acikSorular'a; yapilabilen kismi yap. Kararsizlikta en zoru/dogruyu sec.
14. Ikinci deneme isen is buyuk olcude yapilmis: git log + KOSU/ciktilar'a bak, sifirdan yapma, yalniz ENGEL'leri kapat, savunma yazma, yeni is acma.
15. Bittiginde StructuredOutput: kanit ve gorselCiktilar bos olamaz; kabulKomutu tek satir, deterministik, exit 0/1.
16. METRIK IZI: her commit'ten sonra bash ${KAPI} --kisa >> KOSU/0509-metrik.jsonl (tek satir JSON: commit, ana sapma mm, enum, kirmizi sayisi). Kosucu ivmeye bakar: 3 commit'te sapma %20 kapanmiyorsa kesilirsin (8.4), yaklasimi kokten degistirmen istenir.
TUZAKLAR (hepsi yasandi): wasm derleme yolu engine/build-wasm.sh; rebuild -DCMAKE_BUILD_TYPE=Release; aciklanamayan SEGFAULT = bayat build; deploy scripts/deploy.sh git fetch'te asilir (pgrep -P, pkill -f 'git fetch origin main'); vocab_reference_check kizarirsa once git diff -- engine/vocab.json (bayt-ayniysa prose, tabani --baseline ile kes; gercekten buyuduyse KESME, madde 9 ihlali); 4 ilanli kirmizi: flat_artifact_census, style_check, sizechart_source_check, figure_check; backend /api/draft ve /api/analyze ACIK (Turnstile + IP limiti); .gitignore KOSU/ciktilar/*.png'yi (yalniz kok) yok sayar, teslim png'ler alt klasore.
`

const HAKEM_ORTAK = `
stitchu 0509 kosusunda TARAFSIZ HAKEMSIN (10.1). Isi yapan ajan oldu; beyani KANIT DEGILDIR, savunmasi okunmaz. Repo: ${REPO}. Once cd ${REPO} && git pull --rebase origin main && git log --oneline -15.
Yaptigin: (1) teslim png/pdf'leri KENDIN ac (Read); (2) kabul komutlarini ve bash ${KAPI} KENDIN kos; (3) gecit ve kabul komutlarinin KODUNU oku: bu adimda esik gevsetilmis, ozel-durum if'i, test degismis mi (git log --since tag adim-<no>-once -- engine/tests ${KAPI} contract) — degistiyse reward hacking; (4) contract sayilarina ve emsale karsi mm olc; (5) kok katmani yaz: vision / prompt-parse / JSON okuyucu / derleyici / graf / degerleme / flat / pdf; (6) 3.7 listesi: esik gevsetme, test degistirme, ozel-durum if'i, uydurma sabit, Bugra'ya sabit, erken golden pin, JS'e kacan geometri, alan disi dosya, alt-ajan izi.
Yapmadigin: isciyle konusmazsin, dosya degistirmezsin (ekran goruntulerin KOSU/ciktilar/hakem/<adim>/ altina), tarif disi yeni is istemezsin (alan disi bulgu buFazinKusuru=false ile devredilir), IKINCI DENEMEDE YENI KUSUR ACMAZSIN (yalniz kendi yazdigin ENGEL'lerin kapanip kapanmadigina bakarsin; yeni gordugunu devredilene yaz), Damla'ya soru sormazsin, alt-ajan dogurmazsin.
Hukum: BITTI/BITMEDI = adimin tarifi eksiksiz ve olculerek kapandi mi. Kusur: nerede, ne yanlis, kok katman, kapanis olcutu SAYIYLA (komut + beklenen deger; veremiyorsan kusur degil, devret), satisEngeli, buFazinKusuru. rewardHacking alanina yalniz git diff / dosya ile kanitladigin girer (tek bulgu adimi dusurur).
"ALIR MIYDIM" sorusu yalniz URUN SORUSU: EVET yazan adimlarda (A9, A11) sorulur; digerlerinde alirMiydim'i adimin isine sor ("bu zemin ustune kurulacak urun saglam mi") ve BITTI ise ALIRDIM yaz. Kusur listesini kisa tut: ENGEL'ler + gercekten bu adimin isi olanlar; 4+ ENGEL yaziyorsan en buyuk 2'sini sec.
Makine: ctest hedefli -j1 (TAM ctest yalniz A10 hakemi), tek Chrome timeout 90, sonra kendi sureclerini oldur; build yapma (isci yapti; bayat build supheni yaz). Kendi zaman tavanin 60 dakika: olcemedigini 'OLCEMEDIM' diye yaz, uydurma. Beyanla gercek celisirse gercek kazanir ve yazilir.
`

const KARAR_ORTAK = `
stitchu 0509 kosusunda TARAFSIZ KARAR AJANISIN (10.2). Damla router degil; sorular sana gelir. Gordugun: hakem hukmu JSON, isci raporu JSON, HEDEF (${REPO}/HEDEF.md §0-1), defter (${DOC} §5). Kod ve png gormezsin; olcum yapmazsin; hakemin hukmunu curutmezsin.
Yetkin: DEVAM/DUR; iscinin acik sorularini HEDEF'e baglayarak TEK uygulanabilir kararla cevaplamak; 2.13'e gore bir karar degisikligini onaylamak/reddetmek (eski sebep okunur, olculmus gerekce yazilir; onaysiz degisiklik geri alinir); kok neden onceki bir adimdaysa "YENIDEN AC 4.x" demek (11.7).
Yetkin olmayan: mimariyi degistirmek, butceyi artirmak, deneme tavanini asmak, Damla'ya soru sormak, yeni faz acmak. DEVAM ancak kalan kusurlar sonraki adimin isiyle kapaniyorsa VE her ENGEL icin kapanacagi adim adiyla (4.x) yazilmissa; adi yazilmamis ENGEL varsa DEVAM gecersizdir, DUR de. Titizlik ugruna DUR deme, cekirdek curukse DEVAM deme. Kararsizlikta en zoru/dogruyu sec; menu eklemeyi, esik gevsetmeyi, "sonra" demeyi secme. Her karar gerekceli; defter satiri (5.5, tarihli) olarak yazilabilecek kadar kisa. Alt-ajan yok, dosya degistirme.
`

const EL_ORTAK = `
stitchu 0509 kosusunun MEKANIK ELISIN. Yargi vermezsin, kod yazmazsin, onarmazsin; yalniz verilen komutlari kosar, dosyalari yazar ve sonucu SAYIYLA raporlarsin. Repo: ${REPO}; once cd ${REPO} && git pull --rebase origin main. Alt-ajan yok. Komut ciktisinin son 30 satirini oku, yorum ekleme. Bir komut yoksa (ornek ${KAPI} henuz yazilmadi) "yok" de, uydurma. Bitince commit + push (yalniz KOSU/0509-* ve ${DOC} §5 degisiklikleri). Hizli ol.
`

// ============================================================ SEMALAR ============================================================
const ISCI_SEMA = {
  type: 'object',
  properties: {
    ozet: { type: 'string', description: 'ne yapildi, 5-10 cumle, iddiasiz' },
    kanit: { type: 'array', items: { type: 'string' }, description: 'dosya yolu + komut + cikti ozeti, her iddia icin bir satir' },
    commitler: { type: 'array', items: { type: 'string' } },
    gorselCiktilar: { type: 'array', items: { type: 'string' }, description: 'Damla gozuyle gorecegi png/svg/pdf yollari' },
    kabulKomutu: { type: 'string', description: 'bu adimin tek satirlik deterministik kabul komutu (exit 0/1); sonraki adimlar bunu da kosar' },
    kapananMaddeler: { type: 'array', items: { type: 'string' }, description: 'HEDEF maddesi + kanit; bos olabilir' },
    acikSorular: { type: 'array', items: { type: 'string' } },
    atlananlar: { type: 'array', items: { type: 'string' }, description: 'yapilamayan adim + neden, adiyla' },
    aracOnarimi: { type: 'array', items: { type: 'string' }, description: '8.3: onarilan arac + neden; bos olabilir' },
    llmCagri: { type: 'number', description: '8.26: bu turda odenen LLM cagri sayisi (onbellek disi)' },
    yarim: { type: 'boolean', description: '9.4/8.5: is yarim kaldi (context/butce); kaldigin yer ozet\'te' },
    makine: { type: 'boolean', description: '8.17: makine sisti, beklemek gerekti' },
  },
  required: ['ozet', 'kanit', 'commitler', 'gorselCiktilar', 'kabulKomutu', 'kapananMaddeler', 'acikSorular', 'atlananlar', 'aracOnarimi', 'llmCagri', 'yarim', 'makine'],
}

const HAKEM_SEMA = {
  type: 'object',
  properties: {
    olduMuBittiMi: { type: 'string', enum: ['BITTI', 'BITMEDI'] },
    alirMiydim: { type: 'string', enum: ['ALIRDIM', 'ALMAZDIM'] },
    urunGucu: { type: 'string' },
    neden: { type: 'string' },
    kusurlar: { type: 'array', items: { type: 'object', properties: {
      nerede: { type: 'string', description: 'tur dongusunde onceki turda da acik olan kusur "TEKRAR: " ile baslar (8.16)' }, neYanlis: { type: 'string' }, kokSebep: { type: 'string', description: 'katman adiyla (3.6)' },
      kapanisOlcutu: { type: 'string' }, satisEngeli: { type: 'boolean' },
      buFazinKusuru: { type: 'boolean', description: 'true = bu adimin tarifi bunu kapatmakla yukumluydu; false = devredilen (yine yaz, adimi dusurmez)' } },
      required: ['nerede', 'neYanlis', 'kokSebep', 'kapanisOlcutu', 'satisEngeli', 'buFazinKusuru'] } },
    kendiKanitim: { type: 'array', items: { type: 'string' } },
    rewardHacking: { type: 'array', items: { type: 'string' } },
    sonrakiFazaNot: { type: 'string' },
  },
  required: ['olduMuBittiMi', 'alirMiydim', 'urunGucu', 'neden', 'kusurlar', 'kendiKanitim', 'rewardHacking', 'sonrakiFazaNot'],
}

const KARAR_SEMA = {
  type: 'object',
  properties: { kararlar: { type: 'array', items: { type: 'object', properties: {
    soru: { type: 'string' }, karar: { type: 'string' }, gerekce: { type: 'string' } },
    required: ['soru', 'karar', 'gerekce'] } } },
  required: ['kararlar'],
}

const EL_SEMA = {
  type: 'object',
  properties: {
    gecitYesil: { type: 'boolean', description: 'kapi.sh + onceki kabul komutlari + sapma metrikleri hepsi yesil' },
    kirmizilar: { type: 'array', items: { type: 'string' }, description: 'kizaran gecit/komut adi + sayi + esik' },
    commitSayisi: { type: 'number', description: 'adim tag\'inden bu yana commit' },
    saat: { type: 'number', description: 'adim tag\'inden bu yana saat (ondalik)' },
    regresyonFarki: { type: 'array', items: { type: 'string' }, description: 'sessiz regresyon setinde onceki adima gore degisen ciktilar' },
    yapilan: { type: 'array', items: { type: 'string' }, description: 'kosulan komutlar + yazilan dosyalar' },
    yok: { type: 'array', items: { type: 'string' }, description: 'bulunamayan script/dosya' },
    kilitIhlali: { type: 'array', items: { type: 'string' }, description: 'izin listesi disinda dokunulan contract/engine/tests/golden dosyalari (bos = temiz)' },
    yerelMinimum: { type: 'boolean', description: '8.4: KOSU/0509-metrik.jsonl son 3 commit\'te ana sapma %20 kapanmadi' },
    metrikSerisi: { type: 'string', description: 'son 3 commit ana sapma degerleri, kisa; metrik yoksa "yok"' },
    derlemeCommit: { type: 'number', description: 'fix(build): ile baslayan commit sayisi (mantik butcesine sayilmaz)' },
    kapiBozuk: { type: 'boolean', description: 'kapi.sh gecerli JSON basmadi ya da exit 3 (CTEST_CRASH_OR_INVALID_JSON)' },
    kabulKomutlari: { type: 'array', items: { type: 'string' }, description: 'yukle: state.json kabulKomutlari' },
    devredilen: { type: 'array', items: { type: 'string' }, description: 'yukle: state.json devredilen' },
    banned: { type: 'array', items: { type: 'string' }, description: 'yukle: state.json banned, "4.x|satir" bicimi' },
  },
  required: ['gecitYesil', 'kirmizilar', 'commitSayisi', 'saat', 'regresyonFarki', 'yapilan', 'yok', 'kilitIhlali', 'yerelMinimum', 'metrikSerisi', 'derlemeCommit', 'kapiBozuk', 'kabulKomutlari', 'devredilen', 'banned'],
}

// ============================================================ ADIMLAR (A1b - A12) ============================================================
const A40 = {
  no: 'A1', urunSorusu: false, effort: 'high',
  ad: 'A1 Gecit',
  alan: `${KAPI} (yeni), engine/tests/0509-emsal-olcum.mjs (yeni), engine/tests/0509-wasm-sanity.mjs (yeni), KOSU/regresyon/ (yeni: girdiler + beklenen ciktilar), ${STATE} (yeni), ${ILERLEME} (yeni), KOSU/0509-devir-notu.md (yeni), KOSU/onbellek/ (yeni, .gitignore'a GIRMEZ, commit edilir), .gitignore (yalniz ekleme), CMakeLists (yalniz add_test ekleme), contract/body-v1.json (YALNIZ olcek araligi ekleme, kaynakli)`,
  izin: 'engine/tests/0509-* contract/body-v1.json engine/CMakeLists.txt',
  izinAlt: { 'A1a KAPI + KILIT + METRIK': 'engine/tests/0509-kapi.sh engine/CMakeLists.txt', 'A1b EMSAL + REGRESYON + WASM + ONBELLEK': 'engine/tests/0509-* contract/body-v1.json engine/CMakeLists.txt' },
  tarif: `
ADIM A1 — GECIT ALTYAPISI. Kosucu (0509-kosu.js) zaten uyarlandi. Iki isci (ALT ADIM satirina bak): A1a = madde 1, 4, 9, 10 (kapi.sh iskeleti + kilit + metrik + state + devir notu); A1b = madde 2, 3, 5, 6, 7, 8 (emsal olcum, regresyon seti, wasm sanity, olcek, onbellek, saglik). URUN DEGISMEZ; motor koduna dokunma. Her alt adim kendi butcesiyle.
 1. ${KAPI}: TEK deterministik script, stdout'a YALNIZ final JSON basar (her gecit: ad, gecti/kalmadi, sayi, esik, esigin kaynagi contract satiri) ve exit 0/1. KATI KURAL: icindeki her alt surec (ctest, node, python, cmake) stdout+stderr'i KOSU/0509-kapi.log'a yonlendirir (>> ... 2>&1); tek bir warning satiri sizarsa JSON bozulur. BOS DEGISKEN YASAGI: her sayi "\${DEGER:-null}" ile yazilir; alt surec cokerse (segfault, exit != 0) o gecit {"ad":..., "durum":"CRASH", "sayi":null, "log":"KOSU/0509-kapi.log:<satir>"} olur; script ASLA yarim JSON basmaz. Script kendi ciktisini basmadan once python3 -m json.tool ile dogrular; gecmezse tek satir {"hata":"KAPI_BOZUK_JSON"} basar ve exit 3. set -u kullan, set -e KULLANMA (kizaran gecit scripti oldurmemeli). Kostugu gecitler (hepsi bugun var; adlari ctest/CMakeLists'te): enum_dallanma_check (--measure; taban 436, yalniz duser), graf_ir_check, graf_op_check, graf_dikilebilir_check, flat_convention_check, parca_sayisi_check, edit_locality_check, flat_ayni_insan_check, edge_case_supurme_check, graf JSON sema dogrulama (contract/graf-v1.json), bash KOSU/sinyal.sh tam (DEVIR KABUL zinciri; sinyal.sh'a DOKUNMA, muhurlu), emsal mm olcumu (madde 2). Henuz olculemeyen gecit (ornek: graf'tan cizim yokken flat_ayni_insan) "henuz-yok" durumuyla basilir, kirmizi sayilmaz; ilk yesil oldugu adimdan sonra kirmizi sayilir (state.json'da "ilkYesil" alani).
 2. engine/tests/0509-emsal-olcum.mjs: SVG/piksel uzerinden bel-gogus-kalca hiza cizgileri, oranlar, dugum sayisi, emsale mm sapma. Emsal: KOSU/ciktilar/flat-secim.md'deki 5 cizim (K5), sayilari KOSU/ciktilar/flat-olcum.json + contract/flat-convention-v1.json. Esikler contract'tan okunur, koda gomulmez. KOSU/flat-olcum.py'yi oku ve kullan; yeniden yazma.
 3. SESSIZ REGRESYON SETI KOSU/regresyon/: sabit girdiler, topolojisi farkli en az 3 giysi: (a) GIRDI/hedef-fotograflar/biba-O1194418-dress.jpg (+ -arka.jpg: on-arka cifti; kapali ust + genisleyen etek), (b) keskin koseli yaka tarifi (prompt), (c) ayrik panelli/buzgulu kol tarifi (prompt); mevcut kompozisyonlardan K2 prenses+roba ve K5 kup korse (KOSU/ciktilar/primitif-DUSEN-*.txt) + 3 prompt daha. Girdi listesi KOSU/regresyon/girdiler.json (fotograflar yalniz YOL olarak; dosya kopyalanmaz, GIRDI/ gitignore'lu). Kosum: bash ${KAPI} --regresyon [--taban]: --taban verilirse mevcut ciktilar YENI TABAN olarak yazilir (A2/A4/A6/A7 gibi ciktiyi kasten degistiren adimlarin kapanisinda kosucu boyle cagirir), verilmezse karsilastirir. Her girdi uctan uca kosulur (bugun kosabilen hat ne ise o: prompt-parse/analyze -> draft -> flat), ciktilar KOSU/regresyon/cikti/<adim>/<girdi>/ altina (flat.svg, kalip.svg, dikilebilir.json; png degil, svg deterministik), onceki adimin ciktisiyla diff; fark varsa listelenir. Ilk kosum (A1b) taban olur. Kosmayan girdi "kosmadi: neden" ile listelenir, sessiz atlanmaz.
 4. ${STATE}: {adim, durum, deneme, butce:{commit,saat}, banned:[], devredilen:[], ilkYesil:{}, kabulKomutlari:[]} — ilk hal. ${ILERLEME}: baslik + ilk satir.
 5. FOTOGRAF OKUMA HATTI (Damla karari 6 Eyl: anahtar YOK): fotograf okumasini ISCI KENDISI yapar — Read ile fotografa bakar, contract/graf-v1.json semasinda tarifi yazar, KOSU/onbellek/<sha256(dosya)>.json'a kaydeder (alanlar: girdi yolu, sha, sema surumu, tarif, guven puanlari, okuyan: 'isci-A1b', tarih). Backend yolu (worker.js /api/analyze) yazili kalir ama kosu ONBELLEKTEN beslenir; KOSU/onbellek/README.md ilan eder: 'tarifler koşu işçisi tarafından okundu, canlı worker değil'. Saglik: 1 fotograf (biba-O1194418-dress.jpg) okunur, grafdogrula'dan gecer (CLI varsa; yoksa sema). Canli worker denemesi A10'da, yalniz Damla kredi verirse. llmCagri = 0 (dis cagri yok).
 6. KOSU/onbellek/ girdi hash'iyle saklanir, commit edilir (kabul komutlari ve testler oradan okur, ayni girdi yeniden odenmez). .gitignore'a "!KOSU/onbellek/" eklemen gerekiyorsa ekle.
 7. OLCEK GECIDI (v2): giysi grafinin gercek36'da degerlenmis mutlak sinir kutusu contract'taki insan araligi disindaysa (elbise boyu 400-1800 mm gibi; sayilar contract/body-v1.json'a kaynakli eklenir, izin listesinde) ERR_SCALE_MISMATCH; topoloji yesil olsa da kirmizi. Bugun graftan cizim yokken "henuz-yok".
 8. WASM_SANITY GECIDI (v2): regresyon seti native yaninda bellek limitli Node worker'inda (--max-old-space-size, worker_threads resourceLimits) wasm olarak da kosar; trap, panic, bellek asimi ya da native ile cikti farki kirmizi. Bugun graf wasm binding'i yoksa "henuz-yok".
 9. REFERANS KILIDI (v2): bash ${KAPI} --kilit <izin listesi> => contract/, engine/tests/**, engine/golden-reference.csv, engine/src/grafdogrula.*, engine/src/solver_utils.* altindaki DOSYALAR chmod a-w (find -type f; DIZINLER yazilabilir kalir, yeni 0509-* dosya acilabilsin), izin listesi (glob) u+w; --kilit-ac hepsini u+w; bash ${KAPI} --kilit-diff <tag> => git diff --name-only <tag>..HEAD ile bu alanlarda izin disi dokunulan dosyalari basar (bos = temiz). bash ${KAPI} --kisa => UCUZ (<60 s, ctest yok): tek satir JSON (commit, ana sapma mm [emsal olcum varsa; yoksa null], enum sayisi, hizli kirmizi sayisi) — iscinin her commit sonrasi KOSU/0509-metrik.jsonl'a ekledigi metrik izi. bash ${KAPI} --ivme => son 3 satirdan yerel minimum hukmu, YALNIZ SAYISAL metrikler uzerinden (emsal mm, sanal dikis mm, enum sayisi); boolean/string donen gecitler ivmeden MUAF; tek sayisal metrik yoksa false doner, asla NaN/exception degil.
10. KOSU/0509-devir-notu.md: bos sablon (iki satir basligi). Yarim kalan isci buraya yazar, sonraki isci ilk bunu okur (9.4).
11. CMAKELISTS IZLEME (karar 6 Eyl, A1b teslimi): engine/CMakeLists.txt kilide ALINMAZ (chmod a-w yok, yazilabilir kalir) ama --kilit-diff'in taradigi alan listesine EKLENIR. Ek sert kural, SATIR YONU: git diff <tag>..HEAD -- engine/CMakeLists.txt ciktisinda silinen ('-' ile baslayan) bir add_test( ya da add_executable( satiri varsa cikti KILIT_IHLALI olarak basilir, dosya izin listesinde olsa BILE; yalniz ekleme ('+') temiz sayilir. Gerekce: kirmiziya duen bir gecidin add_test satirini silmek gecidi sessizce 'yesil' yapar; test EKLEMEK serbest kalir, test SILMEK yakalanir ve ilan sarti olur.
TESLIM: bash ${KAPI} ciktisi (JSON, tum gecitler listeli) + KOSU/regresyon/cikti/A1/ taban + saglik raporu KOSU/ciktilar/0509-saglik.md (anahtar var/yok, worker kostu/kosmadi, hata). Degisen satirlarin diff'i raporda (git show --stat).
KIRILMA: kosucu mekanigi degisikligi gerekiyorsa YAPMA, acikSorular'a yaz; kosu A2'e gecmez.
`}

const A41 = {
  tabanKurar: true,
  no: 'A2', urunSorusu: false, effort: 'high',
  ad: 'A2 Ilk gecis',
  izin: 'engine/tests/0509-* contract/graf-v1.json engine/CMakeLists.txt engine/src/solver_utils.* engine/src/grafdogrula.*',
  izinAlt: { 'A2a SOLVER_UTILS': 'engine/tests/0509-* contract/graf-v1.json engine/CMakeLists.txt engine/src/solver_utils.*', 'A2b GRAF -> PANELLER': 'engine/tests/0509-* contract/graf-v1.json engine/CMakeLists.txt engine/src/grafdogrula.*', 'A2c KATMANLAR + KOPRU + SERI': 'engine/tests/0509-* engine/CMakeLists.txt' },
  alan: 'engine/src/solver_utils.*, engine/src/grafdogrula.* (yalniz topoloji kurallari ekleme), engine/src/grafdegerle.*, engine/src/panelkaynak.*, engine/src/flatsvg.*, engine/src/kalipsvg.*, engine/src/grafciz-cli.cpp (CLI: engine/build/grafciz <graf.json> <bodyId> flat|kalip; engine/build/grafdogrula <graf.json> <bodyId>), engine/wasm/bindings.cpp (yalniz yeni binding), backend/** (yalniz prompt -> graf-v1 ucu), contract/graf-v1.json (yalniz ekleme), KOSU/ciktilar/graf-ilk/, CMakeLists (ekleme)',
  tarif: `
ADIM A2 — ILK UCTAN UCA GECIS, KOTU DE OLSA. Madde 1, 3, 9.
Girdi TEK CUMLE: "bel dikisli, kolsuz, yuvarlak yakali, etek ucu genisleyen, arkadan kapanan elbise". Claude cumleyi panel-kenar-dikis tarifine cevirir (contract/graf-v1.json semasi; semaya uymayan cevap kabul edilmez, hata mesaji prompta eklenip en fazla 2 kez yeniden istenir, yine uymuyorsa "okunamadi"); motor grafi gercek36'da degerleyip kalip, croquis36'da degerleyip flat cikarir.
Once oku (satir araligiyla): engine/src/graf.hpp, grafop.hpp, grafdogrula.hpp; docs/GRAF-IR.md ("F2b kapilari" bolumu bu adimin isidir); engine/src/body.hpp; contract/body-v1.json, flat-convention-v1.json, pattern-sheet-v1.json; bodice.cpp/skirt.cpp/sleeve.cpp FORMUL kaynagi (dallanma degil, iyi hesaplari tasi, enum'u tasima); web/lib/flat-from-pattern.js'teki konvansiyon kurallari C++'a tasinir.
Kosucu bu adimi iki isciye verir (ALT ADIM satirina bak):
A2a SOLVER_UTILS: engine/src/solver_utils.hpp/.cpp — KISIT COZUCU ISKELETI, algoritma DIKTE (matematik icat etme): iteratif yay-kutle gevsetme; hedef oranlar YUMUSAK (yay); dikis cifti uzunluk esitligi ve panel kapalilik SERT (her iterasyonda projeksiyonla zorlanir); MAX_ITER ve sure tavani contract/graf-v1.json'dan (izin listesinde, kaynakli); tavan asilinca yumusak hedefler birakilir, sert kisitlar kalir, hangi hedefin birakildigi doner; MUTLAK INSAN OLCEGI (contract'taki sinir kutusu araligi) SERT kisittir, yumusak degil: cozucu olcegi bozup dikisi kapatamaz, ERR_UNSOLVABLE atar (A1 ERR_SCALE_MISMATCH ile pinpon olmaz); cozum yoksa ERR_UNSOLVABLE + en yakin cozum + hangi kisit gevsetilmeli; asla asili kalmaz (sure tavani). Kendi birim testi engine/tests/0509-solver_check.cpp (ucgen/dortgen panel cifti, uzunluk esitligi, kapalilik, tavan davranisi, ERR_UNSOLVABLE). A2a bitmeden A2b baslamaz.
A2b GRAF -> PANELLER (cizim asgari): girdi KOSU/ciktilar/graf-ilk/graf.json (F2a'da yazilmis taban graf; cumle -> graf cevirisini bu adimda Claude'a ODETME: anahtar yok, isci cumleyi kendisi graf-v1'e yazip KOSU/onbellek/'e koyar, A6c hattin kendisini kurar). Bu alt adimin sonunda kotu de olsa flat.png + kalip-36.png commit'te.
 1. panelkaynak.hpp: PanelKaynak { paneller(graf, body) -> 2B paneller } takilabilir arayuz; ilk uygulama Halka2B (grafdegerle.cpp): halka cevreleri + landmark'lardan 2B ilk tahmin, sonra solver_utils ile kisitlar cozulur (isci yalniz oranlari ve kisitlari baglar); pens bel/gogus halka farkindan; kol oyugu ve kol kapagi ayni Seam, esleme yapica. (A12 Yuzey3B ayni arayuzu doldurur.)
 1b. grafdogrula'ya TOPOLOJIK MANTIK (12.31): kenar rolu uyumlulugu, dikis cifti benzersizligi, kapanma zorunlulugu, panel komsuluk grafi bagli; ihlal ERR_IMPOSSIBLE_TOPOLOGY + hangi kural + hangi kenar; Claude tarifi buradan gecmeden cizilmez, yeniden istemede hata prompta eklenir. OLCEK: gercek36 sinir kutusu contract araligi disinda ise ERR_SCALE_MISMATCH.
 2. flatsvg ASGARI (outline + seams) ve kalipsvg ASGARI (parca konturu + etiket); iki CLI (grafciz, grafdogrula) — KOSU/sinyal.sh kabul_P1 bu CLI adlarini bekler. Native derle, png uret, commit.
A2c KATMANLAR + KOPRU + SERI:
 2b. flatsvg tam: katmanli <g id="outline|seams|topstitch|details">, on + arka; kalipsvg tam: pattern-sheet-v1 stiliyle etiket, grain, notch, kat, kesim/dikis cizgisi.
 3. PatternPiece koprusu: graf -> DraftedPattern (nest/dxf/pdf/rehber degismeden). wasm binding: grafDraft, flatSVG, kalipSVG; wasm = native (ayni JSON ayni SVG, bayt-ayni).
 4. Contract'taki giysi tipine bagli sabit (rg ile bul: pufKol, garment type anahtarli bandlar) kaldirilir; sabit ya beden/konvansiyon ozelligine baglanir ya da gider.
TESLIM SIRASI ZORUNLU: ILK SAATTE kotu de olsa KOSU/ciktilar/graf-ilk/flat.png + kalip-36.png commit'te; sonra iyilestir, ayni png'ler yeniden uretilir.
KABUL: 3.8 (sema, round-trip bayt-ayni, ayni JSON ayni cikti, wasm = native), sanal dikis (halkalar kapaniyor mu, mm; graf_dikilebilir_check), parca_sayisi_check, bash KOSU/sinyal.sh kabul P1.
TESLIM: KOSU/ciktilar/graf-ilk/{graf.json, flat.svg, flat.png, kalip-36.svg, kalip-36.png, seri.png (34-44 yeniden degerleme, olcekleme degil), dikilebilir.md (her dikis cifti iki taraf mm)}.
KIRILMA: kol oyugu/pervaz eslesmez -> kapanmayan giysi teslim degil; kapanmayan seam adiyla dikilebilir.md'de, adim BITMEDI.
`}

const A42 = {
  no: 'A3', urunSorusu: false, effort: 'high',
  ad: 'A3 Fotograf',
  izin: 'engine/tests/0509-* contract/vision-graf-v1.json',
  alan: 'web/js/vision-bridge.js, web/js/vision-landmark.js (yeni), web/js/vision-siluet.js (yeni), web/vendor/ (model dosyalari), backend/analyze-core.js, backend/worker.js (analyze ucu), contract/vision-graf-v1.json (yeni; graf-v1 + guven puani + celiski tablosu), engine/tests/0509-foto_*.mjs (yeni), KOSU/onbellek/, KOSU/ciktilar/giris/, KOSU/ciktilar/_yerel/giris/',
  tarif: `
ADIM A3 — FOTOGRAF DA OKUNSUN. Madde 1, 8, 11. A2'deki cumlenin fotograf hali: Claude fotografa bakar, AYNI semada (graf-v1) tarif yazar: isim degil geometri (paneller, kenarlar landmark + oran, seam ratio, buzgu araligi, kapanma yeri, katman, simetri); bilinen isim yalniz kisaltma, cozumu op demeti. Guven puani kalem basina. 37 eksenli spec ciktisi bu adimda YENI KOD ALMAZ (A6'te kalkar).
Uc kaynak: (a) tarayicida poz landmark'i (MediaPipe Tasks Vision pose landmarker ya da esdegeri; sec, gerekce docs'a; model self-host web/vendor; headless Chrome'da da yuklenmeli); (b) giysi silueti -> oranlar (etek boyu, kol boyu, genislik; landmark'a gore ORAN, sayi degil); (c) Claude semantigi. Claude NE oldugunu soyler, olcum NE KADAR oldugunu; celiskide OLCUM kazanir, celiski tabloya (onizleme A5'te gosterir). Oranlar grafa DOGRUDAN YAZILMAZ: A2 kisit cozucusune hedef olarak girer; etek ucu orani bel dikisini koparamaz, cozucu dikis esitligini koruyarak en yakin orani bulur, sapma onizlemeye.
GUVENLI TABAN (8.8): tarif semaya uyuyor ama ERR_IMPOSSIBLE_TOPOLOGY iki yeniden istemede de kalkmiyorsa ret DEGIL: A2'in en sade dikilebilir giysi GRAFI yuklenir, siluet oranlari cozucuye hedef, onizlemede acikca "fotografin tam okunamadi, sade bir tabandan basladim, yaziyla duzelt"; ERR_FALLBACK_BASE, test guvenli-taban.
Arka: ikinci fotograf alani; yoksa en sade dikilebilir arka (duz, orta arka kapanma) + gorunur ilan + neden (arka_koken_check yesil).
ANAHTAR YOK (Damla, 6 Eyl): (c) semantigi ISCI KENDISI yapar — Read ile fotografa bakar, graf-v1 tarifini KOSU/onbellek/<sha256>.json'a yazar (okuyan: 'isci-A3'); backend/analyze-core.js + worker.js ayni semayi uretecek sekilde YAZILIR ama cagrilmaz; hat onbellekten beslenir (vision-bridge once onbellege bakar); KOSU/onbellek/README.md ilan. Ayni girdi ikinci kez okunmaz. llmCagri = 0. Canli worker denemesi A10'da, yalniz kredi varsa.
Sema disi cevap: 8.8 — en fazla 2 yeniden isteme, sonra "okunamadi" + edge case tablosuna satir.
TESLIM: 5 fotograf (GIRDI/hedef-fotograflar; biri on+arka cifti: biba-O1194418-dress + -arka) -> her biri icin KOSU/ciktilar/giris/<n>/{kaynak-yolu.txt, graf.json, flat.png, kalip-36.svg, dikilebilir.md}; kontak KOSU/ciktilar/giris/giris-foto-5.png (yalniz flat + kalip; fotograf yok); overlay'ler (landmark/siluet fotograf ustunde) KOSU/ciktilar/_yerel/giris/ (telifli, commit yok).
KABUL: her graf.json sema + grafdogrula 0 kirmizi; 5/5 flat.png var ve >=400px; onbellek 5 dosya; celiski tablosu en az bir fotografta dolu ya da "celiski yok" olculmus.
KIRILMA: (a)/(b) kurulamazsa yalniz isci okumasiyla devam, "OLCULMEDI" ilaniyla, acikSorular'a. Onbellek dosyasi olmayan fotograf teslim degildir; sessiz "promptla devam" YOK.
`}

const A43 = {
  tabanKurar: true,
  no: 'A4', urunSorusu: false, effort: 'high',
  ad: 'A4 Cizim',
  izin: 'contract/flat-convention-v1.json contract/pattern-sheet-v1.json contract/body-v1.json engine/tests/0509-*',
  alan: 'engine/src/flatsvg.*, engine/src/kalipsvg.*, engine/src/grafdegerle.* (yalniz cizim kalitesi), contract/flat-convention-v1.json ve contract/pattern-sheet-v1.json (yalniz ekleme, kaynakli), engine/tests/0509-emsal-olcum.mjs (SALT OKUNUR; degismesi gerekiyorsa acikSorular), KOSU/ciktilar/cizim/',
  tarif: `
ADIM A4 — CIZIM GUZELLESSIN. Madde 4, 5, 11, 14.
Emsal: KOSU/ciktilar/flat-secim.md'deki 5 cizim (K5; Damla'nin isaret ettigi emsal budur), sayilar flat-olcum.json + flat-convention-v1.json. Flat croquis36'da, kalip gercek36'da, ayni graf; 34-44 graded bedende YENIDEN DEGERLEME. Kalip cizimi standardi (parca etiketi, grain, notch, kat, kesim/dikis cizgisi, tipografi) pattern-sheet-v1.json'dan; eksik bir sey varsa kaynagiyla ekle (ASTM D6673, ticari indie kalip PDF'leri; patterns_real/ Bugra sayfalari yalniz OLCULUR).
Her turda bir png: KOSU/ciktilar/cizim/tur-<k>.png = yeni flat ile emsal yan yana, AYNI olcekte, bel/gogus/kalca hizali, farklar mm (node engine/tests/0509-emsal-olcum.mjs ciktisiyla). Kalip sayfasi: KOSU/ciktilar/_yerel/cizim/kalip-vs-bugra.png (Bugra'nin bir sayfasiyla ayni cerceve; telifli, commit yok) + commit'li KOSU/ciktilar/cizim/kalip-36.png.
Kapi hakemin mm olcumu; kosu Damla'yi beklemez. En fazla 6 tur (her tur bir commit + bir png); 6 turda emsale yaklasmiyorsa DUR, acikSorular'a "kok neden croquis mi (contract/body-v1.json croquis36) konvansiyon contract'i mi" diye olcumle yaz (8.12), karar ajani yazar.
A2 ve A3 ciktilari (graf-ilk/, giris/) bu adimda ayni adlarla yeniden uretilir; sessiz regresyon farki BEKLENIR ve gerekcelenir (raporda "regresyon farki: cizim konvansiyonu uygulandi, mm tablosu: ...").
KABUL: 0509-emsal-olcum.mjs esik icinde (contract'tan), flat_ayni_insan_check tum flat'lerde (graf-ilk + giris/1-5 + regresyon seti) tolerans icinde, flat_convention_check yesil, seri 34-44 dogrulayici 0 kirmizi.
TESLIM: cizim/tur-<son>.png, cizim/kalip-36.png, cizim/seri.png, cizim/mm-tablosu.md.
`}

const A44 = {
  no: 'A5', urunSorusu: false, effort: 'high',
  ad: 'A5 Duzeltme',
  izin: 'contract/edit-v1.json contract/hata-v1.json engine/tests/0509-*',
  alan: 'engine/src/editparse.* (yeni; dogal dil -> op, TR+EN), backend/** (yalniz edit LLM ucu), contract/edit-v1.json (yeni), contract/hata-v1.json (yeni, 12.0 semasi), web/js/create.js, web/create.html (onizleme + duzeltme kutusu + gecmis + geri al), web/js/i18n.js (yalniz ekleme), engine/tests/0509-edit_*.mjs (yeni), KOSU/ciktilar/edit/',
  tarif: `
ADIM A5 — DUZELTME. Madde 2. Kullanici yazar; Claude ya da deterministik parcalayici yaziyi op'a cevirir (once deterministik editparse C++; yetmezse backend LLM, cikti YINE op JSON contract/edit-v1.json); op grafa uygulanir; iki cikti yenilenir; LOCALITY: op YALNIZ hedef kenari ve eylemi tasir ({target:'omuz', action:'uzat', ...}); etkilenen panel kumesini LLM TAHMIN ETMEZ — kume grafop.cpp icinde dikis grafinda BFS ile CALISMA ZAMANINDA hesaplanir (omuz -> kol oyugu -> kol kapagi -> pervaz zinciri, 12.24) ve KOSU/ciktilar/edit/etkilenen-<op>.json'a yazilir; test bu dosyayi referans alir; edit_locality_check o dosyayi okuyup yalniz kumenin DISINI olcer ve BAYT degil GEOMETRIK tolerans kullanir (dugum koordinati sapmasi < 1e-4 mm, contract/edit-v1.json'dan; cozucunun kayar nokta gurultusu testi kirmasin); listede olmayan bir panel toleransi asarsa op hatali; edit gecmisi op listesi olarak saklanir (geri al = son op'u dusur; gardirop hazirligi: ayni liste ayni cikti).
8 edit, once/sonra: "etek 8 cm uzasin", "etek ucuna firfir", "yaka V olsun", "kol kisalsin" (A2 elbisesi kolsuz: bu edit icin once "kol ekle" op'u; ikisi de gecmiste gorunur), "bele fiyonk", "yan cep", "kol basina buzgu", "yaka 2 cm derinlessin".
Belirsiz niteleyici (12.30): "biraz/cok" contract'ta sabit kategorik eslemedir (az/orta/cok -> oran); Claude serbest sayi uretmez, kategori secer; her kategorinin CIPASI C++ parcalayicida sabittir: uzat/kisalt = ilgili panelin Y sinir kutusunun yuzdesi, daralt/genislet = ilgili kenar uzunlugunun yuzdesi, derinlestir = yaka kenarinin panel boyuna orani; hangi panel oldugu op'ta acik yazilir, Claude cipa secmez; eslenemeyen ERR_FUZZY_MODIFIER + "kac cm?".
Hata sozlesmesi (12.0): contract/hata-v1.json tek sema — kod (tipli enum C++'ta: ERR_UNKNOWN_EDIT, ERR_EDIT_CONFLICT, ERR_DEGENERATE_GEOMETRY, ERR_FUZZY_MODIFIER, ERR_SCHEMA, ERR_LLM ... 12.0 listesi), kullanici cumlesi TR + EN, yapilabilir adim, guveni dusuk kalemler. Bilinmeyen edit ("kanat ekle") -> adiyla ret + en yakin yapilabilir op; geometri cokerse (yaka derinligi panel boyunu asiyor) ERR_DEGENERATE_GEOMETRY + hangi kenar hangi siniri asti + en yakin deger; onaysiz uygulanmaz.
ONIZLEME EKRANI (create.html): motorun okudugu tarif DUZ CUMLELERLE ("kolsuz, yuvarlak yaka, bel dikisi, genisleyen etek, arka fermuar (uyduruldu)"), flat, duzeltme kutusu, guveni dusuk kalemler isaretli, fotografla celiski (A3 tablosu) gosterilir, ikinci (arka) fotograf alani. Iki dilde.
TESLIM: KOSU/ciktilar/edit/kontak.png (8 edit once/sonra, kalip + flat) + edit/ekran-{okudu,duzelttim,yenilendi}.png (yerel sunucu + headless Chrome) + edit/ret-3.png (3 bilinmeyen/dejenere edit: ret ekrani).
KABUL: edit_locality_check tum 8 edit'te bolge disi tolerans icinde (< 1e-4 mm); flat_ayni_insan_check BU ADIMDA YUMUSAK (12.32): zemin cizgileri (bel/gogus/kalca y, omuz ucu x) ayni yerden gecmeli, giysi silueti kasitli sapabilir (oversize, dusuk omuz) — sapma onizlemede gosterilir; 0509-edit_check: op listesi replay = ayni SVG; hata-v1 semasi 3 ret'te dogrulanir; sanal dikis 8 edit sonrasi kapaniyor (firfir boyu = etek ucu x oran otomatik turetilir, 12.24).
`}

const A45 = {
  tabanKurar: true,
  no: 'A6', urunSorusu: false, effort: 'high',
  ad: 'A6 Her giysi',
  izin: 'engine/tests/0509-* engine/CMakeLists.txt contract/hata-v1.json contract/vocab-resolution-v1.json',
  izinAlt: { 'A6e SILME + PIN': 'engine/tests/** engine/CMakeLists.txt engine/golden-reference.csv' },
  alan: 'engine/src/** (graf*, grafop*, grafdogrula*, grafdegerle*, panelkaynak*, flatsvg*, kalipsvg*, editparse* dahil), engine/wasm/**, engine/tests/** (YALNIZ ekleme; silme yalniz A6e), web/js/prompt-parse.js, web/js/engine.js, web/lib/flat-from-pattern.js, web/lib/flat-geom.js, backend/analyze-core.js, KOSU/uret.mjs, KOSU/ciktilar/{her-giysi/, edge-case-tablosu.md, silinenler.md}, CMakeLists',
  tarif: `
ADIM A6 — HER GIYSI, TEK HAT. Madde 7, 9, 13, 14. Tek isciye sigmaz; kosucu A6a-e alt adimlarini ayri iscilere verir, her biri kendi butcesiyle (2.5), eski enum hatti YANINDA dururken; brief'in basindaki ALT ADIM satirina bak, yalniz onu yap. Parite eski enum ciktisina degil GECITLERE (madde 14).
A6a GRAFDERLE KOPRUSU: engine/src/grafderle.hpp/.cpp — GarmentSpec -> op dizisi -> graf (contract/vocab-resolution-v1.json tarif ediyorsa oradan). Ilk 3 kompozisyon (01, 03, 07) graftan gecitlerden gecer (grafdogrula, sanal dikis, olcek, flat_ayni_insan). Enum hattina dokunma.
A6b KALAN KOMPOZISYONLAR + KOL KAPISI: 9 kompozisyonun kalani + prompt-01..03 graftan, her biri gecitten. Kol kapisi (Temmuz G5): kol oyugu ve kol kapagi ayni seam, kapanma contract toleransinda; gecmeyen kompozisyon "absent" adiyla + eksik op (KOSU/ciktilar/her-giysi/eksik-op.md), sessiz atlama yok. K2 prenses+roba, K5 kup korse dahil.
A6c GIRISLER DOGRUDAN GRAF: backend/analyze-core.js (vision) ve web/js/prompt-parse.js dogrudan graf-v1 tarifi uretir; 37 eksenli spec ciktisi ve enum alanlari gider; spec katmani yalniz gecis. ANAHTAR YOK: 10 fotografin okumasini isci kendisi yapar ve KOSU/onbellek/'e yazar (okuyan: 'isci-A6c'); vision hatti onbellekten beslenir, README'de ilan; llmCagri = 0. Edge case'ler adiyla (12.1-12.31; edge_case_supurme_check her satir icin girdi verir, donenin contract/hata-v1.json semasina uydugunu ve dogru kodu tasidigini test eder; yakalanmayan istisna = kirmizi): bulanik, giysi degil, coklu, kismi, celiskili prompt, uc beden, strec asimi, dar en, prompt-kisa, sozluk-disi, prompt-olcu, iki giysi, manken, desenli, katmanli, poz, aksesuar, guvenli-taban, topoloji.
A6d TEK HAT: A6a-c yesilse garment.cpp switch'leri ve enum'a bakan post-pass'ler TEK commit'te kalkar; draft = giris -> graf -> dogrula -> degerle -> PatternPiece; flat = flatsvg. bash engine/tests/enum_dallanma_check.sh --measure => cpp.dallanma 0. Golden pinler (golden_check, recipe_golden_*) KIZARIR, beklenen; DOKUNMA. Baska yeni kirmizi ad yok.
A6e SILME + PIN (hakem A6d'yi gectikten sonra, ayri commit'ler): eski blok dosyalari (engine/src'de enum dallanmali 40+ .cpp/.hpp), web/lib/flat-from-pattern.js + flat-geom.js, recipe hatti sevk yolunda degilse; her biri rg kanitli ("hicbir yerden cagrilmiyor": bindings, tests, tools, web); cagrilan tek yer varsa SILME, "kaldi: cunku". CMakeLists'ten olu testler (bu alt adimda engine/tests silme IZINLI, hakem diff'i satir satir okur). KOSU/ciktilar/silinenler.md (dosya, satir, wasm boyutu once/sonra). Sonra golden yeniden pin: once fark raporu (KOSU/ciktilar/golden-fark.md), scripts/repin-golden.sh, tek commit, gerekce mesajda; aciklanamayan fark varsa DUR, acikSorular.
TESLIM: KOSU/ciktilar/her-giysi/kontak.png = 10 fotograf (2 on+arka) + 10 prompt (4 sozluk disi: "bel hizasinda fiyonklu tek omuz asimetrik elbise", "kimono kollu wrap", "korse ustlu balon etek", "keyhole yakali dropped waist") -> flat + kalip; bel/gogus/kalca cizgisi hepsinde ayni yerden (flat_ayni_insan_check); edge-case-tablosu.md guncel (her 12.x satiri: girdi, kod, cumle TR/EN); silinenler.md.
KIRILMA: cizilemeyen kompozisyon -> adiyla "absent" + eksik op; devredilen kusur (8.11), engel degil.
`}

const A46 = {
  tabanKurar: true,
  no: 'A7', urunSorusu: false, effort: 'high',
  ad: 'A7 Kumas',
  izin: 'contract/fabric-catalog-v1.json contract/terzilik-v1.json engine/tests/0509-*',
  alan: 'contract/fabric-catalog-v1.json (ekleme, kaynakli), contract/terzilik-v1.json (yeni), engine/src/bolluk.*, engine/src/pervaz.*, engine/src/enbolme.*, engine/src/malzeme.*, engine/src/rehber.hpp, engine/src/fabricease.hpp, engine/pattern-bridge/{cutplan,seamrules,instructions}.py, web/js/guide-tr.js, engine/tests/0509-kumas_*.mjs (yeni), KOSU/ciktilar/kumas-farki/',
  tarif: `
ADIM A7 — KUMAS VE REHBER. Madde 6, 7, 10. "Ayni elbise, iki kumas, iki kalip."
Once oku: fabric-catalog-v1.json, fabricease.hpp, engine/pattern-bridge/cutplan.py, seamrules.py, rehber.hpp, kumas_kalip_check, parca_sayisi_check, rehber_kaynak_check, contract/guide-sources.json. Arastir (30 dk, kaynakli; once knowledge/, sonra web): orgu negatif pay (esneme % -> pay, toparlanma), kumas eni standartlari (110/140/150), en asan parcanin bolunmesi, kumasa gore dikis payi ve turu (fransiz/overlok/temiz kenar), pervaz ve tela kurallari, igne/iplik/dikis boyu, on-yikama/cekme, fermuar boyu kurali.
Yap: (1) BOLLUK ALANI: kumas -> Body ustunde bolge bazli offset (gogus/bel/kalca/kol/otur); dokuma +, orgu - (1 - 1/strec, toparlanma); graf offset bedende degerlenir; ayni graf iki kumas -> iki kalip, fark rehbere sayiyla. (2) PERVAZ/TELA graftan turetilir (kenar ofseti, contract derinligi), dogrulayiciya girer (pervazsiz yaka = dikilebilir degil). (3) EN BOLME yalniz zorunluysa: split op + grain + notch + rehber cumlesi (12.19). (4) STREC ASIMI adiyla ret + alternatif (12.18; hata-v1). (5) MALZEME listesi graftan (fermuar boyu, dugme, tela, iplik). (6) KESIM PLANI ve kumas ihtiyaci (cutplan kumas enine gore). (7) REHBER TR + EN, dikis sirasi graftan (seam bagimlilik sirasi), puf noktalari kumas basina, kaynakli (rehber_kaynak_check). Seffaf/kaygan kumas: dikis turu ve pay rehberde degisir (12.20).
TESLIM: KOSU/ciktilar/kumas-farki/kumas-farki.png (ayni elbise cotton-lawn / cotton-modal-jersey / viscose-crepe -> 3 kalip yan yana; flat AYNI), fark-tablosu.md (bolge bazli mm), kesim-plani.png (3 kumas), malzeme.md, rehber-tr.md + rehber-en.md.
KABUL: kumas_kalip_check + 0509-kumas_check (3 kalip ikiser ikiser farkli, flat.svg bayt-ayni; pervaz parcalari dogrulayicida; strec asimi ret semaya uyar), rehber_kaynak_check, parca_sayisi_check (en bolme yalniz zorunlu girdide).
`}

const A47 = {
  no: 'A8', urunSorusu: false, effort: 'high',
  ad: 'A8 Bugra',
  izin: 'engine/tests/0509-*',
  alan: 'KOSU/ciktilar/bugra/ (graf JSON + rapor.md), KOSU/ciktilar/_yerel/bugra/ (bindirme png, telifli), engine/tools/bugra-blind-compare.mjs (varsa oku; yoksa yaz), engine/src/grafop.* (YALNIZ yeni op ekleme; eksik op yol haritasina), engine/tests/0509-bugra_check.mjs (yeni)',
  tarif: `
ADIM A8 — BUGRA. Madde 12 (referans, ayar hedefi degil; Bugra'ya sabit = reward hacking, K13).
Iki satin alinmis kalip (patterns_real/: Locket Top ve Buttoned Corset Bustier; geometry-full.json, seamgraph.json okunur) graf-v1'de YAZILABILIYOR MU: parca sayisi, dikis topolojisi, pens/buzgu yerleri op dizisi olarak (KOSU/ciktilar/bugra/<ad>.graf.json). Yazilamayan parca -> eksik op adiyla KOSU/ciktilar/her-giysi/eksik-op.md yol haritasina; op eklemek serbest (genel op, Bugra'ya ozel degil).
EU38 degerlemesi ile Bugra kalibinin bindirmesi: mm tablosu (parca basina kenar uzunluklari, halka cevreleri; en kotu sapma) KOSU/ciktilar/bugra/rapor.md; png KOSU/ciktilar/_yerel/bugra/bindirme-<ad>.png (telifli, commit yok). Sabit yok; "yaklasti" icin hicbir katsayi eklenmez. Onceki olcumler (29 Tem: Bugra armhole 42.5-47.5cm, cap ease +18.66mm EU38, arka omuz standarttan siki) knowledge/ ve docs/DERSLER.md'de; onlari tekrar arastirma, oku.
TESLIM: bugra/rapor.md (mm tablosu + ifade edilemeyen parcalar + eksik op) + _yerel bindirme png yolu.
KABUL: iki graf.json sema + grafdogrula 0 kirmizi; 0509-bugra_check: parca sayisi ve seam sayisi Bugra ile esit ya da fark "absent" satiriyla aciklanmis; rapor.md'de en kotu sapma sayi olarak var.
`}

const A48 = {
  no: 'A9', urunSorusu: true, effort: 'high',
  ad: 'A9 Paket',
  alan: 'engine/tools/**, engine/pattern-bridge/printpack.py, web/js/pack.js, web/js/download.js, web/js/worker.js (yeni; wasm WebWorker), web/create.html, KOSU/ciktilar/paket-03/, KOSU/ciktilar/{eski ciktilar: git rm}, KOSU-v8/GECE7/engine-check/vision-student (rg kanitli silme, ayri commit)',
  tarif: `
ADIM A9 — PAKET VE PROVA. Madde 10, 13, 14. Damla "satarim" dedi (kosucu args.satarim ile acti); "satmam" olsaydi bu adim baslamazdi.
Kosucu bunu A9a/A9b olarak iki isciye verir (9.7); ALT ADIM satirina bak.
A9a PAKET-03 = Damla'nin dikecegi. Koken FOTOGRAF (A3 hattindan; GIRDI/hedef-fotograflar'dan tek katli, astarsiz, ev makinesinde dikilebilir elbise; secim + neden + fotografin YOLU README'de, fotograf pakete konmaz), EU36, cotton-lawn (poplin). Icerik: A4 PDF (10x10 test karesi, sayfa no, birlestirme isaretleri, kesim ve dikis cizgisi AYRI, grain, notch, kat, pervazlar; pattern-sheet-v1 stili), flat svg (katmanli) + png, rehber TR + EN, dikilebilirlik tablosu (her dikis cifti iki taraf mm, fark; sanal dikis kapanma), malzeme, kumas ihtiyaci, beden tablosu, PROVA KONTROL LISTESI (gogus ucu yeri, bel hizasi, kol oyugu rahatligi, etek boyu, fermuar — her kalemde beklenen SAYI; Damla'nin dikisi veri olur), arka ilani kapakta, fotograf okumasinin kaynagi kapakta ('tarif kosu iscisi tarafindan okundu, onbellek <sha>'; bu PROMPT KOKENLI degildir, Damla 6 Eyl karari), graf JSON + kumas + beden + edit listesi + motor surumu damgasi (ayni JSON ayni paket). pdf-verify + techpack-verify (tech_pack_check, printpack_sheet_check). Turkce glyph subset'ini kontrol et (DERSLER: g/i/s uc kez kirildi). Eski ciktilar (KOSU/ciktilar/0*-*.svg, paket-02, puf, primitif-DUSEN-*) silinip ayni adlarla graftan yeniden uretilir ya da git rm (madde 14), ayri commit.
A9b TARAYICI + TEMIZLIK (Chrome timeout bu adimda 300 s, 3.4 istisnasi: 6 beden x 3 kumas x PDF+SVG 90 s'ye sigmaz): wasm motoru WebWorker icinde kosar; 34-44 serisi, 3 kumas, PDF ve SVG uretimi ana akisi kilitlemez, ilerleme olayi gonderir (bu paketin indirme kosuludur; indir_check). Siteyi yabanci gibi kullan (yerel sunucu + headless Chrome): prompt, fotograf (on+arka), onizleme, bir duzeltme, kumas, beden, indir -> KOSU/ciktilar/paket-03/ekran-*.png. Olu klasorler (KOSU-v8 kalintilari, GECE7, engine-check, vision-student, sevk disi arastirma hatti) rg kanitiyla AYRI commit'lerde silinir; GIRDI/ ve patterns_real/ dokunulmaz.
TESLIM: KOSU/ciktilar/paket-03/ (tamami) + paket-03/once-sonra.png (zemin-once.png yanina yeni kontak) + ekran-*.png.
KABUL: tech_pack_check, printpack_sheet_check, indir_check, al_dene_check, arka_koken_check, ios_zemin_check; paket README'de "PROMPT KOKENLI" YOK (varsa satis engeli, 8.7); pdf iki kosumda sha256 ayni.
KIRILMA: fotograf hatti kosmadiysa kapakta "PROMPT KOKENLI — <sebep>" ve hakem satis engeli yazar; adim gecmez. Damla diker, prova listesini doldurur; sonraki kosunun ilk girdisi.
`}

const A49 = {
  no: 'A10', urunSorusu: false, effort: 'high',
  ad: 'A10 Deploy',
  alan: 'scripts/**, web/index.html + landing ureteci (engine/tools/gen-landing*), web/blog* ve patch-notes (silme, rg kanitli), KOSU/ciktilar/{canli-ekran.png, kosu-yol-a.md}',
  tarif: `
ADIM A10 — DEPLOY VE LANDING. Madde 13.
 1. cmake --build engine/build -j2 && bash engine/build-wasm.sh; TAM ctest (-j2, ~25 dk, baska agir is yok). 4 ilanli kirmizi (flat_artifact_census, style_check, sizechart_source_check, figure_check) disinda kirmiziyla deploy YOK; kaynagi duzelt. Silinen hatlarin testleri CMakeLists'ten kalkmis olmali.
 2. LANDING: bayat veri, eski blog, patch-notes silinir (rg kanitli, ayri commit); fiyat/satis cumlesi YOK (K11, toile'e kadar); iddia "fotografini at, oku, duzelt, indir; dikilebilirligi geometriyle kanitli"; kanit canli uretilen ornegin dikilebilirlik tablosu MOTORDAN (elle sayi yok) + uc ekran goruntusu (okudu -> duzelttim -> indirdim). landing_truth_check, docs_truth_check, vitrin_gercek_check yesil. Dil Ingilizce (8.30).
 3. STITCHU_MOTOR_PROOF=done bash scripts/deploy.sh. Asilirsa pgrep -P ile alt surec, git fetch'i oldur, bir kez daha; yine duserse raporla (kosucu turu yine kosar, deploy tur sonunda tekrar).
 4. Canli: curl + headless Chrome ile create.html'de prompt -> KOSU/ciktilar/canli-ekran.png. Canli FOTOGRAF denemesi yalniz worker anahtarinin kredisi varsa (Damla verir; yoksa acikSorular'a 'canli foto denenmedi: kredi yok', landing'de foto akisi onbellek orneğiyle gosterilir ve ilan edilir).
 5. KOSU/ciktilar/kosu-yol-a.md: ne degisti (enum 0, graf, iki beden, yuzey karari), kapi tablosu (bash ${KAPI} ciktisi), acik kalanlar, silinenler.
TESLIM: canli site + canli-ekran.png + kosu-yol-a.md.
KABUL: tam ctest ilanli 4 disinda 0 kirmizi; canli curl 200 + wasm damgasi HEAD ile ayni (bundle_fresh_check).
`}

const A411 = {
  no: 'A12', urunSorusu: false, effort: 'high',
  ad: 'A12 Yuzey3B',
  izin: 'engine/tests/0509-yuzey* contract/yuzey-v1.json engine/CMakeLists.txt',
  alan: 'engine/yuzey/** (yeni), engine/tests/0509-yuzey_*.cpp (yeni), contract/yuzey-v1.json (yeni), docs/YUZEY.md, KOSU/ciktilar/yuzey/; gecerse: contract kaynak secimi, wasm, KOSU/ciktilar yeniden uretim',
  tarif: `
ADIM A12 — TAVAN DENEMESI, URUN CANLIYKEN. Madde 8. Yuzey3B ikinci PanelKaynak; kendi klasoru; MIMARI DEGISMEZ (graf ayni, arayuz ayni).
Oku: engine/src/flatten.cpp (sertifikali ARAP), surfacepattern.cpp, bodysurface.cpp, drape.cpp, flatten-research/, knowledge/ (garment-flattening MIT C++ varsa kullan, lisansa uy). Temmuz blokoru G5: omuz/kol oyugu/yaka yuzeyden cikmiyordu — ilk is o.
Yap: (1) Body -> ucgen yuzey (halkalar arasi loft; omuz, kol oyugu, boyun dahil; kol icin silindirik yuzey, omuzda birlesir). (2) Panel siniri yuzey uzerinde egri (graf Edge'lerinin 3B degerlemesi). (3) Duzlestirme (ARAP/LSCM/garment-flattening; gerekce docs/YUZEY.md). (4) PanelKaynak arayuzunu Yuzey3B ile doldur.
KAPILAR (contract/yuzey-v1.json; HEPSI gecmeli): NaN yok; EU36 elbise < 500 ms native; dikis kenari 3B yay = 2B uzunluk (<= 0.5 mm); kol ve yaka yuzeyden geliyor; dikilebilirlik tablosu Halka2B'den kotu degil.
TESLIM: KOSU/ciktilar/yuzey/yuzey-vs-halka.png (taban elbisenin iki kaynaktan kalibi ust uste, farklar mm, 34-44), yuzey/kapi.md (her kapinin ciktisi).
Gecerse: contract'ta kaynak = Yuzey3B, wasm derle, paket-03 ve kontak sayfalari yeniden uret, A10 tekrarlanir (kosucu yapar). Gecmezse 2B kalir, neden sayiyla kapi.md'de, KOD SILINMEZ.
`}

// ============================================================ MOTOR (yol-a mekanigi; degisen satirlar "0509:" ile isaretli) ============================================================
const gecmisKabuller = []
const gunluk = []
const devredilenKusurlar = []
const banned = {}           // 0509 (11.8): adim -> ["yaklasim -> gecit -> sebep"], en fazla 10, isciye <=300 kelime
const kararDefteri = []     // 0509 (5.5): karar ajani kararlari, deftere el() yazar
const KURU = !!(typeof args === 'object' && args && args.kuru)
const SATARIM = !!(typeof args === 'object' && args && args.satarim)
const BASLAT = (typeof args === 'object' && args && args.baslat) || ''
// Damla karari 6 Eyl: bir oturum = bir/iki adim. args.sadece='A1,A2' -> yalniz bunlar kosar, bitince DURUR.
const SADECE = ((typeof args === 'object' && args && args.sadece) || '').split(',').map(x => x.trim()).filter(Boolean)

function kabulBlok() {
  if (!gecmisKabuller.length) return ''
  return `\n# ONCEKI ADIMLARIN KABUL KOMUTLARI — hepsini KOS, biri kizarirsa ilerleme yok (compounding error)\n` +
    gecmisKabuller.map((k, i) => `${i + 1}. ${k}`).join('\n') + '\n'
}
function bannedBlok(adim) {
  const b = banned[adim.no] || []
  if (!b.length) return ''
  const goster = b.slice(0, 10).join('\n- ')
  const fazla = b.length > 10 ? `\n- +${b.length - 10} benzer` : ''
  return `\n# DENENDI, PATLADI — aynisini deneme (11.8)\n- ${goster}${fazla}\n`
}
function birlestir(hs) {
  hs = hs.filter(Boolean)
  return {
    olduMuBittiMi: hs.every(h => h.olduMuBittiMi === 'BITTI') ? 'BITTI' : 'BITMEDI',
    alirMiydim: hs.every(h => h.alirMiydim === 'ALIRDIM') ? 'ALIRDIM' : 'ALMAZDIM',
    urunGucu: hs.map(h => h.urunGucu).join(' | '),
    neden: hs.map(h => h.neden).filter(Boolean).join(' | '),
    kusurlar: hs.flatMap(h => h.kusurlar || []),
    kendiKanitim: hs.flatMap(h => h.kendiKanitim || []),
    rewardHacking: hs.flatMap(h => h.rewardHacking || []),
    sonrakiFazaNot: hs.map(h => h.sonrakiFazaNot).filter(Boolean).join(' | '),
  }
}

// 0509: mekanik el — kosucunun dosya/shell erisimi yok; gecit, tag, butce, state, ilerleme, DURDU hep buradan
async function el(gorev, adim, ek) {
  if (KURU) { log(`[kuru] el: ${gorev} ${adim ? adim.ad : ''}`); return { gecitYesil: true, kirmizilar: [], commitSayisi: 0, saat: 0, regresyonFarki: [], yapilan: [], yok: [] } }
  const _adimGercek = adim
  if (!adim) adim = { ad: 'kosu (adimsiz)', no: 'kosu' }   // 0509 fix: el('yukle', null) — gorev metinleri adim.ad/adim.no okuyor
  const stateOzet = JSON.stringify({ adim: _adimGercek ? _adimGercek.no : null, kabulKomutlari: gecmisKabuller, devredilen: devredilenKusurlar.slice(-30), banned: Object.entries(banned).flatMap(([no, l]) => l.map(x => `${no}|${x}`)), kararDefteri: kararDefteri.slice(-10) }, null, 0)
  const gorevler = {
    basla: `ADIM BASLANGICI ${adim.ad} (11.5):
 1. git tag -f adim-${adim.no}-once (yeniden acilis/tekrar ise tag ILERI tasinir: butce bu acilistan sayilir); git push -f origin --tags. REFERANS KILIDI: bash ${KAPI} --kilit ${JSON.stringify(ek && ek.izin || '')} (yoksa: chmod -R a-w contract engine/tests engine/golden-reference.csv engine/src/grafdogrula.* engine/src/solver_utils.* 2>/dev/null; izin listesindekilere chmod u+w). Faz yolu ${STATE}.yol dizisine eklenir (11.7 makro-ABA).
 2. bash ${KAPI} (DOSYA YOKSA: gecitYesil=true, yok listesine 'kapi.sh henuz yazilmadi (A1a)' — kapi yoklugu KIRMIZI DEGILDIR, hata firlatma); onceki adimlarin kabul komutlarini SIRAYLA kos: ${gecmisKabuller.length ? gecmisKabuller.map((k, i) => `(${i + 1}) ${k}`).join(' ; ') : '(yok)'}; sapma metrikleri: bash engine/tests/enum_dallanma_check.sh --measure (cpp.dallanma; taban ${STATE} icindeki taban, yuksekse kirmizi), bash ${KAPI} --regresyon (fark listesi).
 3. ${STATE} guncelle: adim=${adim.no}, durum=ISCI, deneme=${ek && ek.deneme || 1}, butce sifirla, tag adi; ilerleme satiri ${ILERLEME}'ye: tarih-saat (date), adim, BASLADI.
 4. Commit + push. gecitYesil = (2)'de hicbir sey kirmizi degilse.`,
    yukle: `RESUME YUKLEME: ${STATE} oku ve kabulKomutlari, devredilen, banned ("4.x|satir" bicimi) alanlarini AYNEN dondur; dosya yoksa bos diziler. Ayrica bash ${KAPI} (varsa) kos, gecitYesil. Hicbir sey yazma.`,
    olc: `BUTCE OLCUMU ${adim.ad} (8.25): commitSayisi = git rev-list --count adim-${adim.no}-once..HEAD -- . ':!KOSU/0509-*' EKSI derlemeCommit (git log --oneline adim-${adim.no}-once..HEAD | grep -c '^[0-9a-f]* fix(build):'); derlemeCommit'i ayri dondur (mantik butcesine sayilmaz, kendi tavani 6); saat = (date +%s - git log -1 --format=%ct adim-${adim.no}-once)/3600. Ayrica bash ${KAPI} kos: cikti gecerli JSON degilse ya da exit 3 ise kapiBozuk=true ve kirmizilar'a 'CTEST_CRASH_OR_INVALID_JSON: <KOSU/0509-kapi.log son satir>' (kendin JSON.parse deneme, python3 -m json.tool ile bak). bash ${KAPI} --regresyon (regresyonFarki; ${(ek && ek.tabanKurar) ? 'BU ADIM TABAN KURAR: fark HATA DEGIL, listele ve gec' : 'fark kirmizidir'}). KILIT: bash ${KAPI} --kilit-diff adim-${adim.no}-once (yoksa: git diff --name-only adim-${adim.no}-once..HEAD -- contract engine/tests engine/golden-reference.csv engine/src/grafdogrula.hpp engine/src/grafdogrula.cpp engine/src/solver_utils.hpp engine/src/solver_utils.cpp), izin listesi ${JSON.stringify(ek && ek.izin || '')} disindakiler kilitIhlali'na. IVME (8.4): bash ${KAPI} --ivme (yoksa: KOSU/0509-metrik.jsonl son 3 satir; ana sapma 3 commit'te %20 kapanmadiysa yerelMinimum=true; metrik yoksa, null ise ya da metrikler sayisal degilse (boolean/string) yerelMinimum=false, metrikSerisi='yok'; NaN hesabi yapma), metrikSerisi'ne sayilar. ${STATE} butce alanini yaz. Commit + push.`,
    kapat: `ADIM KAPANISI ${adim.ad} (11.2): bash ${KAPI} + tum kabul komutlari + --regresyon son kez; ${STATE}: durum=GECTI, kabulKomutlari += ${JSON.stringify(ek && ek.kabulKomutu || '')}, devredilen, ilkYesil guncelle; ${ILERLEME} satiri: tarih-saat, adim, GECTI, commit sayisi, saat, hakem tek cumle: ${JSON.stringify((ek && ek.hukum) || '')}; ${DOC} §5 defterini guncelle: 5.1 kapanan maddeler += ${JSON.stringify((ek && ek.kapananMaddeler) || [])}, 5.2 acik, 5.3 acik sorular, 5.4 devredilen, 5.5 karar degisiklikleri (kararDefteri). bash ${KAPI} --regresyon --taban (hakem gecti: bu adimin ciktilari yeni regresyon tabani; yoksa KOSU/regresyon/cikti/<adim>/ -> taban isareti state.json'da). git tag -f adim-${adim.no}-gecti. Commit + push.`,
    durdu: `KOSU DURDU (8.29): once bash ${KAPI} --kilit-ac (yoksa chmod -R u+w contract engine/tests engine/src/grafdogrula.* engine/src/solver_utils.*). ${DURDU} yaz: hangi adim (${adim.ad}), hangi kusur, hangi katman, ne denendi (banned + hakem hukmu asagida), ne denenmedi, resume komutu: Workflow scriptPath=KOSU/0509-kosu.js args={"baslat":"${adim.no}"} (isci "kaldigin yerden, git log'a bak" ile baslar). Soru icermez. ${STATE}: durum=DURDU; ${ILERLEME} satiri. ${DOC} §5 guncelle. Commit + push.\n# SEBEP\n${ek && ek.sebep || ''}`,
    geriAl: `KILIT IHLALI GERI ALINIYOR (v2 referans kilidi): ${adim.ad} iscisi izin disi dosyalara dokundu: ${JSON.stringify(ek && ek.dosyalar || [])}. Her biri icin git checkout adim-${adim.no}-once -- <dosya>; commit "revert reference-lock violation in ${adim.no}: <dosyalar>"; push. ${STATE} banned += "izin disi dokunus: <dosyalar>". Baska hicbir seye dokunma.`,
    provaBekle: `A9 ONCESI DAMLA HUKMU (8.13, 10.6): kosu A9'e geldi, Damla'nin "satarim/satmam" hukmu bekleniyor. ${DURDU} yaz (baslik "A9 PROVA HUKMU BEKLIYOR"): A8'ye kadar ne var (${ILERLEME}'den), Damla'nin bakacagi png'ler (KOSU/ciktilar/cizim/, her-giysi/kontak.png, kumas-farki/, bugra/rapor.md), resume: "satarim" ise Workflow args={"baslat":"A9","satarim":true}; "satmam" ise cumlesi ${DOC} §5.5'e yazilir ve kosu A4'ten yeniden acilir. Soru cumlesi yok, iki komut var. ${STATE} durum=PROVA-BEKLIYOR. Commit + push.`,
    yenidenAcGecit: `YENIDEN AC (11.7): ${adim.ad} yeniden acildi ve onarildi. Aradaki adimlarin gecitlerini sirayla yeniden kos: ${ek && ek.aradakiler || ''} — her biri icin o adimin kabul komutu + bash ${KAPI}; kizaran adim adini kirmizilar'a yaz. ${ILERLEME} satiri. Commit + push.`,
    bitti: `KOSU BITTI (8.23-8.24): bash ${KAPI} --kilit-ac (yoksa chmod -R u+w contract engine/tests engine/src/grafdogrula.* engine/src/solver_utils.*; Damla'nin elle duzenlemesi icin kilit acilir; DURDU'da da ayni). ${DOC} §0 devir promptu ve §5 defter guncel; ${ILERLEME} son satir; ${STATE} durum=BITTI. Damla'ya tek mesaj metni KOSU/ciktilar/kosu-yol-a.md icinde: ne degisti, kapi tablosu (bash ${KAPI}), acik kalanlar, silinenler. Commit + push.\n# OZET\n${ek && ek.ozet || ''}`,
  }
  const prompt = EL_ORTAK + `\n# DURUM (makine okunur)\n${stateOzet}\n# GOREV\n${gorevler[gorev]}\n`
  const r1 = await agent(prompt, { label: `${_adimGercek ? _adimGercek.ad : 'kosu'} el:${gorev}`, phase: _adimGercek ? _adimGercek.ad : 'A1 Gecit', schema: EL_SEMA, effort: 'low' })
  if (r1) return r1
  gunluk.push(`el:${gorev} oldu, bir kez daha`)
  return agent(prompt + '\n# (ikinci cagri; ilk el ajani oldu)\n', { label: `${_adimGercek ? _adimGercek.ad : 'kosu'} el:${gorev}#2`, phase: _adimGercek ? _adimGercek.ad : 'A1 Gecit', schema: EL_SEMA, effort: 'low' })
}

async function fazKos(faz, ekNot, altAdim) {
  let hakemNotu = ekNot || ''
  let kararNotu = ''
  let sonIsci = null, sonHukum = null
  const alanBlok = `\n# DOSYA ALANIN\n${faz.alan}\n`
  const altBlok = altAdim ? `\n# ALT ADIM: ${altAdim}\n` : ''
  const MAX_DENEME = faz.maxDeneme || 2
  let olum = 0, yarim = 0
  for (let deneme = 0; deneme < MAX_DENEME; deneme++) {
    if (KURU) { log(`[kuru] ${faz.ad}${altAdim ? ' ' + altAdim : ''}: isci brief ${(ORTAK + faz.tarif).split(/\s+/).length} kelime, hakem ${HAKEM_ORTAK.split(/\s+/).length}, karar ${KARAR_ORTAK.split(/\s+/).length}`); return { gecti: true, isci: { kabulKomutu: `bash ${KAPI} --adim ${faz.no}`, kapananMaddeler: [] }, hukum: { neden: 'kuru' } } }
    const isci = await agent(
      ORTAK + kabulBlok() + bannedBlok(faz) + `\n# ADIMIN BRIEF'I\n` + faz.tarif + altBlok + alanBlok +
      `\n# URUN SORUSU: ${faz.urunSorusu ? 'EVET (hakem urunu yargilar: alir miydim)' : 'HAYIR (hakem adimin isini yargilar)'}\n` +
      (devredilenKusurlar.length ? `\n# DEVREDILEN KUSURLAR — senin alanina dusen varsa KAPAT\n- ${devredilenKusurlar.slice(-15).join('\n- ')}\n` : '') +
      (deneme > 0 ? `\n# TUR ${deneme + 1} — KAPSAM KILIDI: yeni is ekleme, yalniz asagidaki ENGEL'leri kapat, savunma yazma.\n# ONCEKI DENEMENIN HAKEM HUKMU\n${hakemNotu}\n` : (hakemNotu ? `\n# NOT\n${hakemNotu}\n` : '')) +
      (kararNotu ? `\n# KARAR AJANININ KARARLARI — uygula\n${kararNotu}\n` : '') +
      `\nBittiginde StructuredOutput ile raporla. kanit ve gorselCiktilar bos olamaz.`,
      { label: `${faz.ad}${altAdim ? ' ' + altAdim : ''} isci#${deneme + 1}`, phase: faz.ad, schema: ISCI_SEMA, effort: faz.effort || undefined })
    if (!isci) {   // 0509 (8.1): olen isci deneme yakmaz; uc kez ust uste -> altyapi, dur
      olum++; gunluk.push(`${faz.ad}: isci #${deneme + 1} oldu (null) [${olum}/3]`)
      if (olum >= 3) return { gecti: false, isci: null, hukum: { neden: 'ALTYAPI: isci uc kez ust uste oldu (API/session)', kusurlar: [], rewardHacking: [] }, altyapi: true }
      deneme--; continue
    }
    olum = 0
    sonIsci = isci
    if (isci.yarim || isci.makine) {   // 0509 (9.4, 8.17): yarim/makine -> ayni adim resume, deneme sayilmaz (tavan 4)
      yarim++; gunluk.push(`${faz.ad}: isci yarim/makine (${yarim}/4): ${isci.ozet.slice(0, 160)}`)
      if (yarim >= 4) return { gecti: false, isci, hukum: { neden: 'dort kez yarim kaldi; adim cok buyuk ya da makine', kusurlar: [], rewardHacking: [] } }
      hakemNotu = `RESUME: onceki isci yarim birakti (commit'li). ILK IS: KOSU/0509-devir-notu.md oku (9.4). Kaldigi yer: ${isci.ozet}\nAtlananlar: ${(isci.atlananlar || []).join('; ')}`
      deneme--; continue
    }
    if (isci.acikSorular && isci.acikSorular.length) {
      const karar = await agent(
        KARAR_ORTAK + `\n# ADIM\n${faz.tarif}\n# ISCININ OZETI\n${isci.ozet}\n# SORULAR\n` +
        isci.acikSorular.map((s, i) => `${i + 1}. ${s}`).join('\n'),
        { label: `${faz.ad} karar`, phase: faz.ad, schema: KARAR_SEMA, effort: 'high' })
      if (karar) { kararNotu = karar.kararlar.map(k => `- SORU: ${k.soru}\n  KARAR: ${k.karar}\n  GEREKCE: ${k.gerekce}`).join('\n'); kararDefteri.push(...karar.kararlar.map(k => `[${faz.no}] ${k.soru} -> ${k.karar} (${k.gerekce})`)) }
      if (karar) {
        const uygula = await agent(
          ORTAK + `\n# GOREV — KARARLARI UYGULA (${faz.ad}). Isci bitirdi ve su sorulari sordu; karar ajani cevapladi.
Yalniz bu kararlari uygula, gerekirse ilgili kapilari kos, commit + push, her karar icin kanit (dosya:satir / git show). Baska is yapma.
# ISCININ OZETI\n${isci.ozet}\n# KARARLAR\n${kararNotu}\n` + alanBlok,
          { label: `${faz.ad} uygula#${deneme + 1}`, phase: faz.ad, schema: ISCI_SEMA })
        if (uygula) { isci.kanit = [...(isci.kanit || []), ...(uygula.kanit || []).map(k => '[uygula] ' + k)]; isci.commitler = [...(isci.commitler || []), ...(uygula.commitler || [])] }
      }
    }

    const izin = (faz.izinAlt && altAdim && faz.izinAlt[altAdim]) || faz.izin || ''
    // 13.22-5: acik soru varsa bu tur olcum/kapi kosulmaz ve DENEME YAKILMAZ; akis karar ajanina + 'uygula' turuna gider
    const soruTuru = !!(isci.acikSorular && isci.acikSorular.length && !kararNotu)
    const olcum = soruTuru ? null : await el('olc', faz, { izin, tabanKurar: !!faz.tabanKurar })   // 0509 (8.25): butce/kilit/ivme olcumu isci VE uygula bittikten sonra (kosucu ajani kesemez; isci kendini keser, 7. kural)
    if (!soruTuru && olcum && (olcum.commitSayisi > BUTCE_COMMIT || olcum.saat > BUTCE_SAAT || (olcum.derlemeCommit || 0) > 6)) {
      const sebep = (olcum.derlemeCommit || 0) > 6 ? `DERLEME CUKURU: ${olcum.derlemeCommit} fix(build) commit (tavan 6) — kod derlenmiyor, mantiga sira gelmedi` : `BUTCE ASILDI: ${olcum.commitSayisi} mantik commit, ${olcum.saat} saat (8.5: protokol hatasi sinyali)`
      gunluk.push(`${faz.ad}: ${sebep}`)
      return { gecti: false, isci, hukum: { neden: sebep, kusurlar: [], rewardHacking: [] }, butce: true }
    }
    if (olcum && olcum.kapiBozuk) {   // 13.21-2: kapi bozuk -> arac onarimi, kosucu dusmez
      hakemNotu = `ARAC ONARIMI (8.3): ${KAPI} gecerli JSON basmadi (CTEST_CRASH_OR_INVALID_JSON). Once araci onar: KOSU/0509-kapi.log son 40 satir, bos degisken (\${DEGER:-null}), coken alt surec durum:"CRASH", cikti json.tool'dan gecmeli. Esik gevsetme degil, arac onarimi diye ayir.\n` + hakemNotu
      gunluk.push(`${faz.ad}: kapi bozuk, deneme ${deneme + 1} arac onarimina gitti`); continue
    }
    if (olcum && olcum.kilitIhlali && olcum.kilitIhlali.length) {   // v2 referans kilidi: isci kesilir, diff geri alinir, deneme duser
      await el('geriAl', faz, { dosyalar: olcum.kilitIhlali })
      banned[faz.no] = banned[faz.no] || []; banned[faz.no].push(`izin disi dokunus -> referans kilidi -> ${olcum.kilitIhlali.join(', ')}`)
      hakemNotu = `REWARD_HACKING (referans kilidi): onceki isci izin listesi disinda su dosyalara dokundu, geri alindi: ${olcum.kilitIhlali.join(', ')}. Bu dosyalara DOKUNMA; gereken degisiklik varsa acikSorular'a yaz.`
      gunluk.push(`${faz.ad}: kilit ihlali, deneme ${deneme + 1} dustu: ${olcum.kilitIhlali.join(', ')}`); continue
    }
    if (olcum && olcum.yerelMinimum) {   // v2 8.4: ivme yok -> BANNED + karar ajani 'kokten degistir'
      banned[faz.no] = banned[faz.no] || []; banned[faz.no].push(`${(isci.ozet || '').slice(0, 60)} -> ivme (8.4) -> sapma 3 commit'te %20 kapanmadi: ${olcum.metrikSerisi}`)
      const kk = await agent(KARAR_ORTAK + `\n# DURUM (8.4 yerel minimum)\n${faz.ad}: son 3 commit'te ana sapma %20 kapanmadi (${olcum.metrikSerisi}). Isci ozeti: ${isci.ozet}\n# SORU\nYaklasimi KOKTEN degistiren tek bir karar ver (hangi katman, hangi yontem, neden); ayni yolu incelterek devam etme secenegi YOK.`, { label: `${faz.ad} karar-ivme`, phase: faz.ad, schema: KARAR_SEMA, effort: 'high' })
      kararNotu = kk && kk.kararlar[0] ? `- (8.4 yerel minimum) ${kk.kararlar[0].karar}\n  GEREKCE: ${kk.kararlar[0].gerekce}` : kararNotu
      if (kk) kararDefteri.push(...kk.kararlar.map(k => `[${faz.no}] 8.4 -> ${k.karar} (${k.gerekce})`))
      hakemNotu = `YEREL MINIMUM (8.4): onceki yaklasim kesildi (${olcum.metrikSerisi}). Karar ajaninin kokten-degistir karari yukarida; onu uygula.`
      gunluk.push(`${faz.ad}: yerel minimum, deneme ${deneme + 1} kesildi`); continue
    }

    if (soruTuru) { deneme--; hakemNotu = `KARAR AJANI CEVAPLADI (7.4) — bu tur deneme sayilmadi. Uygulanacak kararlar:\n${kararNotu}\nOnceki iscinin yaptigi is duruyor (git log), sifirdan yapma.`; gunluk.push(`${faz.ad}: acik soru turu, deneme yakilmadi`); continue }
    const govde = kabulBlok() + `\n# TUR ${deneme + 1}${deneme > 0 ? ' — KAPSAM KILIDI AKTIF: yeni kusur acma, yalniz onceki ENGEL kapandi mi bak' : ''}\n# URUN SORUSU: ${faz.urunSorusu ? 'EVET' : 'HAYIR'}\n# ADIM TAGI: adim-${faz.no}-once\n# ADIMIN TARIFI (isciye verilen)\n${faz.tarif}${altBlok}\n# ISCININ RAPORU (kanit degil)\n` +
      JSON.stringify(isci, null, 1) + (kararNotu ? `\n# KARAR AJANININ KARARLARI (isci uygulamis olmali; uygulanmamis karar ENGEL)\n${kararNotu}\n` : '') + (olcum ? `\n# EL OLCUMU\n${JSON.stringify(olcum)}\n` : '')
    const hTerzi = await agent(HAKEM_ORTAK + `\n# MERCEGIN: TERZI + GEOMETRI. Dikis uzunluklari, pens/egrilik, pervaz/tela, grain, notch, kat, bolluk; sayilar contract'tan mi; enum/menu kacagi; JS'e kacan geometri; matematik; beden serisi.\n` + govde, { label: `${faz.ad} hakem-terzi#${deneme + 1}`, phase: faz.ad, schema: HAKEM_SEMA, effort: 'high' })
    const terziEngel = hTerzi && (hTerzi.kusurlar || []).some(k => k.satisEngeli && k.buFazinKusuru !== false)
    const hAlici = (terziEngel || !faz.urunSorusu) ? null : await agent(HAKEM_ORTAK + `\n# MERCEGIN: ALICI. Evde diken, Etsy'den kalip ve flat alan biri: indirir miydim, basar miydim, flat'e para verir miydim, rehber yeter mi. Hukmun de OLCULEBILIR kusur olarak yazilir, begeni olarak degil.\n` + govde, { label: `${faz.ad} hakem-alici#${deneme + 1}`, phase: faz.ad, schema: HAKEM_SEMA, effort: 'high' })
    const hs = [hTerzi, hAlici]
    if (!hs.filter(Boolean).length) {   // 0509 (8.2): hakem oldu -> bir kez daha; yine olurse hukumsuz, dur
      const h2 = await agent(HAKEM_ORTAK + `\n# MERCEGIN: TERZI + GEOMETRI (ikinci cagri; ilk hakem oldu).\n` + govde, { label: `${faz.ad} hakem-terzi#${deneme + 1}b`, phase: faz.ad, schema: HAKEM_SEMA, effort: 'high' })
      if (!h2) return { gecti: false, isci, hukum: { neden: 'HUKUMSUZ: hakem iki kez oldu (8.2)', kusurlar: [], rewardHacking: [] }, hukumsuz: true }
      hs[0] = h2
    }
    const hukum = birlestir(hs)
    sonHukum = hukum
    const engel = hukum.kusurlar.filter(k => k.satisEngeli && k.buFazinKusuru !== false)
    const disKusur = hukum.kusurlar.filter(k => k.buFazinKusuru === false)
    if (disKusur.length) devredilenKusurlar.push(...disKusur.map(k => `[${faz.ad} hakemi] ${k.nerede}: ${k.neYanlis} | kok: ${k.kokSebep}`))
    const gecti = hukum.olduMuBittiMi === 'BITTI' && (!faz.urunSorusu || hukum.alirMiydim === 'ALIRDIM') && engel.length === 0 && hukum.rewardHacking.length === 0
    log(`${faz.ad} deneme ${deneme + 1}: ${hukum.olduMuBittiMi} / ${hukum.alirMiydim} / engel ${engel.length} (dis ${disKusur.length}) / rh ${hukum.rewardHacking.length}`)
    if (gecti) {
      if (isci.kabulKomutu) gecmisKabuller.push(isci.kabulKomutu)
      gunluk.push(`${faz.ad}: GECTI deneme ${deneme + 1}. ${hukum.urunGucu}`)
      return { gecti: true, isci, hukum }
    }
    // 0509 (11.8): BANNED tek satir
    banned[faz.no] = banned[faz.no] || []
    banned[faz.no].push(...engel.slice(0, 5).map(k => `${(isci.ozet || '').slice(0, 60)} -> ${k.nerede} -> ${k.neYanlis.slice(0, 80)}`))
    hakemNotu = `Hukum: ${hukum.olduMuBittiMi}/${hukum.alirMiydim}. Neden: ${hukum.neden}\nKusurlar:\n` +
      hukum.kusurlar.map(k => `- [${k.satisEngeli ? 'ENGEL' : 'kusur'}] ${k.nerede}: ${k.neYanlis} | kok: ${k.kokSebep} | kapanis: ${k.kapanisOlcutu}`).join('\n') +
      (hukum.rewardHacking.length ? `\nReward hacking bulgulari (HEPSI geri alinacak):\n- ${hukum.rewardHacking.join('\n- ')}` : '') +
      `\nHakem notu: ${hukum.sonrakiFazaNot}`
  }
  gunluk.push(`${faz.ad}: ${MAX_DENEME} denemede GECMEDI. Son hukum: ${sonHukum ? sonHukum.neden : 'yok'}`)
  return { gecti: false, isci: sonIsci, hukum: sonHukum }
}

// 0509 (7.3, 3.3): iki deneme gecmedi -> karar ajani DEVAM / DUR / YENIDEN AC 4.x. Ucuncu deneme YOK.
async function fazVeyaDur(faz, ekNot, altAdim) {
  const r = await fazKos(faz, ekNot, altAdim)
  if (r.gecti || r.altyapi || r.butce || r.hukumsuz || KURU) return r
  const karar = await agent(
    KARAR_ORTAK + `\n# DURUM\n${faz.ad} iki denemede hakemden gecmedi.\nSon hukum: ${JSON.stringify(r.hukum, null, 1)}\nSon isci raporu: ${JSON.stringify(r.isci, null, 1)}\n` +
    `# SORU\nUc secenek, cevap bunlardan biriyle BASLASIN: "DEVAM" (kalan kusurlar sonraki adimin isiyle kapaniyorsa; hangi adimda kapanacagini yaz), "DUR" (cekirdek curuk; neyin onarilacagini tam yaz), "YENIDEN AC 4.x" (kok neden onceki bir adimdaysa, hakemin yazdigi katmana gore).`,
    { label: `${faz.ad} devam-karari`, phase: faz.ad, schema: KARAR_SEMA, effort: 'high' })
  const k = karar && karar.kararlar[0] ? karar.kararlar[0].karar : 'DUR'
  gunluk.push(`${faz.ad}: karar = ${k.slice(0, 200)}`)
  kararDefteri.push(`[${faz.no}] devam karari -> ${k.slice(0, 200)}`)
  if (/^\s*DEVAM/i.test(k)) return { ...r, devamKarari: true }
  const ya = /^\s*YENIDEN\s*AC\s*(4\.\d+)/i.exec(k)
  if (ya) return { ...r, yenidenAc: ya[1], kararMetni: k }
  return { ...r, kararMetni: k }
}

// ============================================================ AKIS (SIRALI) ============================================================
const SIRA = [A40, A41, A42, A43, A44, A45, A46, A47, A48, A49]
const ALT = { 'A1': ['A1a KAPI + KILIT + METRIK', 'A1b EMSAL + REGRESYON + WASM + ONBELLEK'], 'A2': ['A2a SOLVER_UTILS', 'A2b GRAF -> PANELLER', 'A2c KATMANLAR + KOPRU + SERI'], 'A6': ['A6a GRAFDERLE KOPRUSU', 'A6b KALAN KOMPOZISYONLAR + KOL KAPISI', 'A6c GIRISLER DOGRUDAN GRAF', 'A6d TEK HAT', 'A6e SILME + PIN'], 'A9': ['A9a PAKET-03', 'A9b TARAYICI + TEMIZLIK'] }   // 9.7, v2
const sonuclar = []
const kaydet = (ad, r) => sonuclar.push({ faz: ad, gecti: !!(r && r.gecti), devamKarari: !!(r && r.devamKarari), hukum: r && r.hukum && r.hukum.neden })
const ilerle = r => r && (r.gecti || r.devamKarari)
const notu = r => (r && r.hukum && r.hukum.sonrakiFazaNot) || ''
const yenidenAcildi = {}   // 0509 (11.7): ayni adim ikinci kez -> zincirleme, dur

// --- ilanli kirmizi (karar 6 Eyl): kaynak state.json ilanliKirmizi[]; kod icinde sabit gecit adi YOK
function ilanliKayitlar() {
  try { const j = JSON.parse(require('fs').readFileSync(STATE, 'utf8')); return Array.isArray(j.ilanliKirmizi) ? j.ilanliKirmizi : [] } catch (e) { return [] }
}
function ilanliKirmiziKumesi() { return new Set(ilanliKayitlar().map(r => r.gecit)) }
function ilanliAd(k) { return String(k).split(/[\s:(\/]/)[0] }   // "sinyal_tam (3/27)" -> "sinyal_tam"
function ilanliKayit(ad) { return ilanliKayitlar().find(r => r.gecit === ad) || null }

async function adimKos(faz, ekNot) {
  const bas = await el('basla', faz, { izin: faz.izin || '' })
  if (!bas) return { gecti: false, isci: null, hukum: { neden: 'ALTYAPI: el (basla) iki kez oldu', kusurlar: [], rewardHacking: [] }, altyapi: true }
  // karar 6 Eyl: ILANLI KIRMIZI (state.json ilanliKirmizi[]) "once onar" listesinden DUSULUR — kapanacagi adim adiyla yazili,
  // o adimda kabul sarti olur. Susturma degil: adiyla ilan edilir, tavani/kumesi hatirlatilir. Ilanli olmayan kirmizi aynen onarilir.
  {
    const ilanli = ilanliKirmiziKumesi()
    const ilanliGorulen = (bas.kirmizilar || []).filter(k => ilanli.has(ilanliAd(k)))
    const gercekKirmizi = (bas.kirmizilar || []).filter(k => !ilanli.has(ilanliAd(k)))
    if (gercekKirmizi.length) ekNot = `ONCE ONAR (7.5): adim baslamadan onceki kabul komutlari/gecitler KIRMIZI: ${gercekKirmizi.join('; ')}. Bunlari kok sebepten onar (bu onarim bu adimin butcesinden duser), sonra adimin isine gec.\n` + (ekNot || '')
    if (ilanliGorulen.length) ekNot = `ILANLI KIRMIZI (onarma, kapanacagi adim yazili): ${ilanliGorulen.map(k => { const r = ilanliKayit(ilanliAd(k)); return `${k} -> ${r ? r.kapanacakAdim : '?'}${r && r.tavan ? ` (tavan ${r.tavan}, ASILAMAZ)` : ''}${r && r.kirmiziAltTestKumesi ? ` (alt kume dondu: ${r.kirmiziAltTestKumesi.join(',')}; yeni ad eklenirse ilan gecersiz)` : ''}` }).join(' ; ')}. Bu adimda BUNLARA DOKUNMA; sayi artarsa adim duser.\n` + (ekNot || '')
  }
  if (ALT[faz.no]) {   // 9.7: buyuk adim, alt adim basina isci; hakem her alt adimi olcer
    let son = null
    for (const alt of ALT[faz.no]) {
      son = await fazVeyaDur(faz, ekNot, alt)
      if (!ilerle(son)) return son
    }
    return son
  }
  return fazVeyaDur(faz, ekNot)
}

let oncekiNot = ''
let durdu = false, deployAcik = false
let atla = !!BASLAT
if ((BASLAT || SADECE.length) && !KURU) {   // resume/tek-adim: kosucu hafizasi bos, state.json'dan yukle (kabul komutlari, devredilen, banned)
  const y = await el('yukle', null)
  if (y) { gecmisKabuller.push(...(y.kabulKomutlari || [])); devredilenKusurlar.push(...(y.devredilen || [])); for (const b of (y.banned || [])) { const [no, ...rest] = b.split('|'); (banned[no] = banned[no] || []).push(rest.join('|')) } }
  gunluk.push(`resume ${BASLAT || SADECE.join(',')}: ${gecmisKabuller.length} kabul, ${devredilenKusurlar.length} devredilen yuklendi`)
  if (SADECE.length) {   // atlama yasagi: acilan adimdan oncekiler GECTI olmali (A1 haric)
    const ilk = SIRA.findIndex(a => a.no === SADECE[0])
    const eksik = SIRA.slice(0, ilk < 0 ? 0 : ilk).map(a => a.no).filter(no => !gecmisKabuller.some(k => k.includes(no)))
    if (eksik.length) { log(`DUR: ${SADECE[0]} acilamaz, once su adimlar GECTI olmali: ${eksik.join(', ')} (state.json kabulKomutlari bos)`); return { sonuclar: [], gunluk: [`atlama yasagi: eksik ${eksik.join(', ')}`], devredilenKusurlar, banned, kararDefteri, kabulKomutlari: gecmisKabuller } }
  }
}
const YENIDEN = (typeof args === 'object' && args && args.yenidenAc) || ''   // 'satmam' yolu: once o adim yeniden acilir (2 deneme), sonra BASLAT'tan devam
if (YENIDEN && !KURU) {
  const h = SIRA.find(a => a.no === YENIDEN)
  if (h) { phase(h.ad); const rh = await adimKos(h, `YENIDEN AC (Damla karari, 8.13/2.13): bu adim yeniden aciliyor; gerekce ${DOC} §5.5'te. Iki deneme.`); kaydet(h.ad + ' (yeniden)', rh); if (!ilerle(rh)) { await el('durdu', h, { sebep: `yeniden acilan ${h.ad} gecmedi` }); return { sonuclar, gunluk, devredilenKusurlar, banned, kararDefteri, kabulKomutlari: gecmisKabuller } } await el('kapat', h, { kabulKomutu: rh.isci && rh.isci.kabulKomutu, hukum: rh.hukum && rh.hukum.neden, kapananMaddeler: rh.isci && rh.isci.kapananMaddeler }) }
}
if (KURU) log(`KURU KOSU: ${SIRA.length + 2} adim: ${SIRA.map(a => a.ad).join(' -> ')} -> A11 Tur -> A12 Yuzey3B`)

for (let i = 0; i < SIRA.length; i++) {
  const faz = SIRA[i]
  if (SADECE.length && !SADECE.includes(faz.no)) {
    if (sonuclar.some(x => x.gecti)) { gunluk.push(`${faz.ad}: bu oturumun kapsamı disinda (args.sadece=${SADECE.join(',')}), kosu DURUYOR`); break }
    gunluk.push(`${faz.ad}: bu oturumun kapsami disinda, atlandi`); continue
  }
  if (atla) { if (faz.no === BASLAT || faz.ad.startsWith(BASLAT)) atla = false; else { gunluk.push(`${faz.ad}: onceki kosuda gecti (commit'li), atlandi`); continue } }
  if (faz === A48 && !SATARIM) { await el('provaBekle', faz); gunluk.push('A9: Damla hukmu bekleniyor (args.satarim yok)'); durdu = true; break }
  phase(faz.ad)
  const ekNot = [oncekiNot ? `Onceki adimin hakem notu: ${oncekiNot}` : ''].filter(Boolean).join('\n')
  const r = await adimKos(faz, ekNot)
  kaydet(faz.ad, r)
  if (r.yenidenAc) {   // 0509 (11.7)
    const hedef = SIRA.find(a => a.no === r.yenidenAc)
    if (!hedef || yenidenAcildi[r.yenidenAc]) { await el('durdu', faz, { sebep: `zincirleme: ${r.yenidenAc} ikinci kez yeniden acildi ya da bulunamadi. ${r.kararMetni}` }); durdu = true; break }
    yenidenAcildi[r.yenidenAc] = true
    phase(hedef.ad)
    await el('basla', hedef, { izin: hedef.izin || '' })
    const r2 = await fazKos({ ...hedef, maxDeneme: 1 }, `YENIDEN AC (11.7): ${faz.ad} hakemi kok nedeni bu adimda buldu. Karar: ${r.kararMetni}. Tek deneme; yalniz bu kok nedeni onar; aradaki is silinmez, git reset yok.`)
    if (!r2.gecti) { await el('durdu', hedef, { sebep: `yeniden acilan ${hedef.ad} gecmedi: ${r2.hukum && r2.hukum.neden}` }); durdu = true; break }
    const ara = SIRA.filter(a => a.no > hedef.no && a.no < faz.no).map(a => a.no).join(', ')
    const g = await el('yenidenAcGecit', hedef, { aradakiler: ara })
    if (g && g.kirmizilar.length) { await el('durdu', hedef, { sebep: `yeniden ac sonrasi aradaki gecitler kirmizi: ${g.kirmizilar.join('; ')} (siradaki oturum kizaran adimi sirayla yeniden acar)` }); durdu = true; break }
    i--; continue   // kalinan adima don
  }
  if (!ilerle(r)) {
    if (faz === A49) { gunluk.push('A10 deploy gecmedi; canli eski surumde. Tur yerelde kosar, deploy tur sonunda tekrar.'); deployAcik = true; continue }
    await el('durdu', faz, { sebep: `${r.hukum && r.hukum.neden}\nKusurlar: ${JSON.stringify(r.hukum && r.hukum.kusurlar)}\nKarar: ${r.kararMetni || ''}` })
    durdu = true; break
  }
  await el('kapat', faz, { kabulKomutu: r.isci && r.isci.kabulKomutu, hukum: r.hukum && r.hukum.neden, kapananMaddeler: r.isci && r.isci.kapananMaddeler })
  oncekiNot = notu(r)
}
if (durdu) return { sonuclar, gunluk, devredilenKusurlar, banned, kararDefteri, kabulKomutlari: gecmisKabuller }

// ============================================================ A11 TUR ============================================================
if (SADECE.length && !SADECE.includes('A11')) { gunluk.push('A11 Tur: kapsam disinda, oturum bitti'); return { sonuclar, gunluk, devredilenKusurlar, banned, kararDefteri, kabulKomutlari: gecmisKabuller } }
phase('A11 Tur')
const TUR = { no: 'A11', ad: 'A11 Tur', urunSorusu: true, alan: 'kusurun katmani' }
let temizArtArda = 0
const turlar = []
let oncekiTurKusurlar = []
const MERCEKLER = [
  { ad: 'dikisci', m: "Evde diken dikisci: paketi indir, PDF'i ac ve bas, dikilebilir mi, rehber yeter mi, malzeme listesi dogru mu, beden tablosu anlasilir mi." },
  { ad: 'tasarimci', m: "Flat alan tasarimci: flat'ler ayni insana mi (kontak png), SVG katmanlari Illustrator'da ise yarar mi, konvansiyon (kol acisi, yaka, cizgi hiyerarsisi), Etsy rafinda durur mu." },
  { ad: 'saldirgan', m: "Sozluk-disi saldirgan: 5 sozlukte olmayan tarif ('bel hizasinda fiyonklu tek omuz asimetrik elbise', 'kimono kollu wrap', 'korse ustlu balon etek', 'off-shoulder buzgulu bluz', 'keyhole yakali dropped waist') + 3 edit + 2 zor fotograf (desenli/karanlik, manken). Sessizce baska seye dondu mu, adiyla ret mi, dogru mu? Estetik: flat ve kalip png'lerini emsalin (KOSU/ciktilar/flat-secim.md) yanina koy — 'cirkin' okunan tek sey var mi (kanat, kutu, blob, titrek cizgi, amator etiket)? Hukmun olculebilir kusur olarak yazilir." },
]
if (!KURU) for (let t = 0; t < TUR_MAX && temizArtArda < 2; t++) {
  await el('basla', { ...TUR, no: `A11-${t + 1}`, ad: `A11 Tur ${t + 1}` })
  const dens = []
  for (const mk of MERCEKLER) dens.push(await agent(
    HAKEM_ORTAK + kabulBlok() + `
# GOREV — DENETCI (${mk.ad}), TUR ${t + 1} (10.3). URUN SORUSU: EVET.
Urunu bir YABANCI gibi KULLAN: yerel sunucu (kendi portun) + headless Chrome (timeout 90, izole user-data-dir, sonra kendi sureclerini oldur) ve canli site (https://stitchu.noseydewdrop.com${deployAcik ? ' — DIKKAT: deploy gecmedi, canli ESKI surum; yalniz yerelde yargila' : ''}). ${mk.m}
Kod okumazsin. Kusur gorunce kok nedeni zincirin her yerinde ara (3.6) ve kokSebep'e katmani yaz. Ekranlarini KOSU/ciktilar/tur-${t + 1}/${mk.ad}/ altina kaydet. Kusurlari satisEngeli bayragiyla yaz.
${oncekiTurKusurlar.length ? `# ONCEKI TURUN KUSURLARI — hala aciksa "nerede" alanini "TEKRAR: " ile basla (8.16)\n${oncekiTurKusurlar.join('\n')}\n` : ''}`,
    { label: `tur${t + 1} denetci-${mk.ad}`, phase: 'A11 Tur', schema: HAKEM_SEMA, effort: 'high' }))
  const denetci = birlestir(dens)
  if (!dens.filter(Boolean).length) { gunluk.push(`tur ${t + 1}: denetciler oldu`); continue }
  const engel = denetci.kusurlar.filter(k => k.satisEngeli)
  const tekrar = denetci.kusurlar.filter(k => /^TEKRAR:/i.test(k.nerede))
  const temiz = denetci.alirMiydim === 'ALIRDIM' && engel.length === 0   // 0509: temiz = satis engeli 0 + alirdim; engel olmayan kusurlar devredilene (K-0509-3)
  log(`tur ${t + 1}: ${denetci.alirMiydim}, engel ${engel.length}, kusur ${denetci.kusurlar.length}, tekrar ${tekrar.length}`)
  if (tekrar.length) {   // 8.16: ayni kusur iki turda kapanmadi -> dur
    await el('durdu', { ...TUR, no: `A11-${t + 1}`, ad: `A11 Tur ${t + 1}` }, { sebep: `8.16: ayni kusur iki turda kapanmadi:\n${tekrar.map(k => `${k.nerede}: ${k.neYanlis} | kok: ${k.kokSebep}`).join('\n')}` })
    durdu = true; break
  }
  if (temiz) { temizArtArda++; turlar.push({ tur: t + 1, temiz: true }); devredilenKusurlar.push(...denetci.kusurlar.map(k => `[tur ${t + 1}] ${k.nerede}: ${k.neYanlis}`)); oncekiTurKusurlar = []; continue }
  temizArtArda = 0
  oncekiTurKusurlar = engel.map(k => `- ${k.nerede}: ${k.neYanlis} | kok: ${k.kokSebep} | kapanis: ${k.kapanisOlcutu}`)
  const onarici = await agent(
    ORTAK + kabulBlok() + `
# GOREV — ONARICI, TUR ${t + 1} (10.4)
Uc denetci urunu yabanci gibi kullandi ve su kusurlari yazdi. Her birini KOK SEBEPTEN kapat (yama degil; ozel-durum if'i degil; esik gevsetme degil). ENGEL olanlar once. "Kusur degildi" diyorsan OLCUMLE kanitla. Motor degistiyse native + wasm derle. Kabul komutlari + bash ${KAPI} yesil. Commit + push. Dosya alanin: kusurun bulundugu katman.
# DENETCI HUKMU
${JSON.stringify(denetci.kusurlar, null, 1)}
`, { label: `tur${t + 1} onarici`, phase: 'A11 Tur', schema: ISCI_SEMA })
  if (!onarici) { gunluk.push(`tur ${t + 1}: onarici oldu`); continue }
  const tOlc = await el('olc', { ...TUR, no: `A11-${t + 1}`, ad: `A11 Tur ${t + 1}` }, { izin: '' })
  if (tOlc && (tOlc.commitSayisi > BUTCE_COMMIT || tOlc.saat > BUTCE_SAAT || (tOlc.kilitIhlali && tOlc.kilitIhlali.length))) {
    if (tOlc.kilitIhlali && tOlc.kilitIhlali.length) await el('geriAl', { ...TUR, no: `A11-${t + 1}`, ad: `A11 Tur ${t + 1}` }, { dosyalar: tOlc.kilitIhlali })
    await el('durdu', { ...TUR, no: `A11-${t + 1}`, ad: `A11 Tur ${t + 1}` }, { sebep: `tur onaricisi: butce ${tOlc.commitSayisi} commit / ${tOlc.saat} saat ya da kilit ihlali ${JSON.stringify(tOlc.kilitIhlali)}` })
    durdu = true; break
  }
  const hakem = await agent(
    HAKEM_ORTAK + kabulBlok() + `
# GOREV — HAKEM, TUR ${t + 1}
Denetcilerin kusurlari ile onaricinin raporunu karsilastir. Her kusur: kapandi mi (KENDIN olc), kok sebepten mi yama mi, yeni bir sey bozuldu mu (kabul komutlari, bash ${KAPI}, --regresyon, flat png'ler, dikilebilir tablo). "Kusur degildi" denen kalemlerde olcumu kendin tekrarla.
# DENETCI
${JSON.stringify(denetci.kusurlar, null, 1)}
# ONARICI RAPORU
${JSON.stringify(onarici, null, 1)}
`, { label: `tur${t + 1} hakem`, phase: 'A11 Tur', schema: HAKEM_SEMA, effort: 'high' })
  turlar.push({ tur: t + 1, temiz: false, engel: engel.length, kusur: denetci.kusurlar.length, hakem: hakem ? `${hakem.olduMuBittiMi}/${hakem.alirMiydim}: ${hakem.neden}` : 'oldu' })
  await el('kapat', { ...TUR, no: `A11-${t + 1}`, ad: `A11 Tur ${t + 1}` }, { kabulKomutu: '', hukum: hakem ? hakem.neden : 'hakem oldu', kapananMaddeler: [] })
  gunluk.push(`tur ${t + 1}: engel ${engel.length}; hakem ${hakem ? hakem.alirMiydim : 'oldu'}`)
}
if (durdu) return { sonuclar, turlar, gunluk, devredilenKusurlar, banned, kararDefteri, kabulKomutlari: gecmisKabuller }
if (!KURU && temizArtArda < 2) {
  await el('durdu', TUR, { sebep: `tur dongusu ${TUR_MAX} turda iki ust uste temiz tura ulasmadi (8.16 tavan); acik kusurlar son turun hukmunde: ${JSON.stringify(turlar.slice(-1))}` })
  return { sonuclar, turlar, gunluk, devredilenKusurlar, banned, kararDefteri, kabulKomutlari: gecmisKabuller }
}
if (deployAcik && !KURU) {
  phase('A10 Deploy')
  const r9b = await adimKos(A49, 'Ilk deploy denemesi gecmemisti; tur dongusu bitti, simdi tekrar. Onceki hukum gunlukte.')
  kaydet(A49.ad + ' (tekrar)', r9b)
}

// ============================================================ A12 YUZEY3B ============================================================
if (SADECE.length && !SADECE.includes('A12')) { gunluk.push('A12: kapsam disinda, oturum bitti'); return { sonuclar, turlar, gunluk, devredilenKusurlar, banned, kararDefteri, kabulKomutlari: gecmisKabuller } }
phase('A12 Yuzey3B')
const r11 = await adimKos(A411, 'Tur dongusu temiz kapandi; urun canli. Acik/devredilen kusurlara dokunma, yalniz yuzey isi.')
kaydet(A411.ad, r11)
if (r11.gecti && !KURU) {
  await el('kapat', A411, { kabulKomutu: r11.isci.kabulKomutu, hukum: r11.hukum.neden, kapananMaddeler: r11.isci.kapananMaddeler })
  phase('A10 Deploy')
  const r9c = await adimKos(A49, 'Yuzey3B kapilari gecti, kaynak Yuzey3B oldu; paket ve kontaklar yeniden uretildi. Deploy tekrar (A12).')
  kaydet(A49.ad + ' (yuzey3B)', r9c)
}
gunluk.push(`A12 Yuzey3B: ${r11.gecti ? 'GECTI — kaynak Yuzey3B, yeniden uretildi ve deploy edildi' : 'gecmedi — Halka2B kaldi, neden KOSU/ciktilar/yuzey/kapi.md'}`)
if (!KURU) await el('bitti', A411, { ozet: gunluk.join('\n') })
return { sonuclar, turlar, temizArtArda, yuzey3B: !!r11.gecti, gunluk, devredilenKusurlar, banned, kararDefteri, kabulKomutlari: gecmisKabuller }
