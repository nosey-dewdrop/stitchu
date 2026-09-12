# A3 hakem hukmu — 2026-09-09 (taze hakem, Damla'nin 9 Eyl karari + brief §4 A3)

**HUKUM: BITMEDI** — primitif motor kuruldu ve olculdu (7/8 madde OLCULDU), ama brief'in "olcum cozucuye hedef olarak girer, celiskide olcum kazanir" maddesi hic baglanmamis: okumalarin tasidigi siluet orani hicbir CLI'ya girmiyor.

## Karar maddeleri

| madde | durum | kanit |
|---|---|---|
| (i) motor taban + emir listesi uygular, ops sonrasi cizer | OLCULDU | kabul.sh 5/5 data-ops=8/8/14/12/8, tabandan farkli; uret.mjs 60 satir, geometri 0, yalniz grafuygula/grafciz spawn |
| (ii) kume giysi adi icermez | OLCULDU | graf-v1 19 op adi geometri; vision-graf-v1 giysi kelimesi grep 0. Not: attach/reshapeEdge tr aciklamasinda ornek olarak "fiyonk/cep/volan/kusak", "yaka/etek ucu" var (op adi degil, A3 oncesinden) |
| (iii) fotograf basina op yok | OLCULDU | onbellek 5 dosya, 50 op, kume disi 0; A3'te eklenen sew/addPanel/drop/merge Damla kararinda adiyla |
| (iv-a) tamlik motordan gecti mi | OLCULDU | tamlik.py yeniden kostum: 12/12 UYGULANDI, 7/12 0 kirmizi (P1 P4 P6 P8 P9 P10 BUGRA-2), 5 kirmizili (P2=5, P3=4, P5=3, P7=13+ERR_NO_VIEW, BUGRA-1=2), eksiksiz 3/12 |
| (iv-b) eksikler geometrik adla | **SAGLANMADI** | "Eksik primitif adaylari" 26 kalem, primitif adiyla 5 (extendTo yLerp, slash&spread, resew, dart op, kenar birlestirme); kalani "kisa kol", "lastik", "wrap on", "buzgulu boyun" |
| (v) 5 foto -> kac flat, bayt farki | OLCULDU | md5 4 farkli/5; 1=2. Iki biba fotografini kendim actim: ayni elbise, ayni ON yuz — istisna kanitli. ops.json 1 ve 2 bayt-ayni |
| (vi) op'suz cizim kirmizi | OLCULDU | `grafciz --ops <<< '[]'` -> ERR_NO_OPS exit 2 |
| (vii) devirler geri, sinyal_tam ilani, donmus kume | OLCULDU | devredilen'de 2 "GERI ALINDI" kaydi; ilanliKirmizi[2] vocab_reference_check -> A6, donmusKumeyeEklenmedi; {bundle_fresh_check} degismemis; flat_ayni_insan_check 34 = tavan |

Olcumler: kabul 0 kirmizi · sema 0 · guvenli-taban 0 · grafdogrula [0,0,0,0,0] · ctest 4/4 · md5 4/5 · opsuz exit 2 · tamlik 12 motor / 7 sifir kirmizi / 3 eksiksiz.
mm (teslim 4): pens_cozum on/arka ic_pens_1 17.92 mm (cozucuden, Panel.darts); supresyon 215.00 mm, pens %33.33 (A4 tautolojisi aynen duruyor, on=arka esit); 10 dikis artik 0.00 mm.

## Kusurlar

1. **ENGEL — Olcum motora girmiyor.** Bes okumada `hedefler[]` var (bel/gogus orani 0.3815 / 0.5063 / 0.4954 / 0.4036 / 0.4654) ama `grafuygula <taban> <ops> [--id]` ve `grafdogrula --json|--md` hedef almiyor; `grep hedefler|ratioTo engine/src/*.cpp` = 0 tuketici. 1 ve 2 farkli oran, ayni flat. "Claude ne oldugunu soyler, olcum ne kadar oldugunu" cumlesinin "ne kadar" yarisi dikilebilir.md'de bir metin satiri. solver_utils zaten yumusak oran hedefi aliyor; eksik olan boru. Kok: derleyici/graf (CLI). Kapanis: `grafdogrula giris/1/graf.json gercek36 --md | grep -c siluet-orani` >= 1 (bugun 0) ve `md5 -q giris/*/flat.svg | sort -u | wc -l` = 5 (bugun 4). satisEngeli=false, buFazinKusuru=true, A3 elle.
2. **Tamlik listesi giysi adiyla.** TAMLIK.md eksik listesi 26 kalem, 5'i primitif adi; P3/BUGRA-1 kirmizilari primitif eksigi degil cozucu sirasi/supresyon kapisi (A4) — ayrilmamis. A6a bunu girdi alirsa sozluk kokar. Kapanis: iki kova (eksik PRIMITIF = op adi + args imzasi / okuma-cozucu eksigi = adim adi); `grep -cE '^- (kisa kol|lastik|wrap on|buzgulu boyun)' TAMLIK.md` = 0. buFazinKusuru=true.
3. Croquis flat giysi gibi okunmuyor (kol panelleri 45° V, kol kapagi yanda ayri, P2'de X kesisme, BUGRA-1 yatay bant). satisEngeli=true ama **A4'un isi** (flat_ayni_insan_check 34 ilanli), buFazinKusuru=false.
4. Brief'in "overlay'li kontak" teslimi 9 Eyl flat'leri icin yok (_yerel/giris altinda yalniz 8 Eyl siluet overlay'i). Telif kurali commit'i yasaklar, uretimi degil. Kapanis: `ls KOSU/ciktilar/_yerel/giris/*overlay*.png | wc -l` >= 1. buFazinKusuru=true, kusur 1 ile ayni turda.

## Reward hacking (git diff / dosya ile olculdu)

- graf_op_check.cpp: adim-A3-once'den 0 silinen satir. 4b5a660e..HEAD 2 silinen: "dartLeg turu degismez" -> "yalniz seam"; "dusen pens bacaklari" -> "IC HALKA PENS". Ayni oturumda konan kural, kararDefteri 09-09/3'te adiyla ilanli, yon sikilasma (pens kaybi -> pens korunumu). **Gevsetme degil.**
- grafdogrula.cpp: "bel dikisi yok -> pens_cozum otomatik gecti" erken cikisi kaldirildi (artik olculuyor = sikilasma); darts sayimi, onto komsuluk eklendi; esik degeri degisikligi 0. **Gevsetme yok.**
- kabul.sh (1,2) istisnasi: fotograflari kendim actim, ayni on yuz. **Kanitli istisna.** Kucuk not: istisna sha256'ya degil sira numarasina bagli; siralama degisirse yanlis cifte kayar.
- Alan disi dosya: diff'teki her dosya A3IzinListesi'nde ya da izlenmeyen KOSU/ altinda; silinen/yeniden adlandirilan 0. **Yok.**
- Uydurma sabit: "boyun bandi 1.5 x ense dususu — secildi, ADIYLA", "yama yatay yeri DOGRULANMADI, secildi", "oranAralik -> 1.0 secildi" hepsi ilanli; grafdogrula Uydurma bolumu 3 kalem basiyor. **Ilan edilmemis sabit bulamadim.**
- Alt-ajan izi: metrik.jsonl son kayit 8 Eyl 23:43; 9 Eyl elle. **Iz yok.**
- Bayat build: binary'ler 02:00, hicbir .cpp daha yeni. Teslim png/svg'ler 01:37-01:49 (son derlemeden ONCE); kabul.sh'i guncel binary ile 02:08'de kostum, grafdogrula 5/5 0 kirmizi ve md5 tablosu ayni. flat.svg'yi yeniden uretip kiyaslamadim — OLCEMEDIM.

Olcemediklerim: 0509-kapi.sh tam kosu; flat.svg bayt-ayni yeniden uretim; isci HUKUM.md (tarif geregi okunmadi).

## Gordugum resimler

giris-foto-5.png: bes satir, solda flat sagda kalip. 1 ve 2 goze birebir ayni (md5 de ayni). 3 farkli: daha cok parca (7 parca kalip: ust/alt bolunmus on beden, kol bandi, boyun bandi), flat'ta anahtar deligi yaka. 4 ve 5 (Mary Quant on/arka): bel dikissiz uzun on/arka govde, balik pensi ic cizgi olarak kalipta var; 4'te iki yama cep + yaka bandi ucgeni + cep parcasi, 5'te cep yok, boyun parcasi farkli. Kalip-36 (4): on/arka govde, kol, boyun bandi, yama — dikis payi kesik cizgi, grain oku, pens ic cizgisi; parcalar dikilebilir bir kalip gibi duruyor ama yan dikisin bel kavisi kirikli (kose kose), yuvarlak degil. Flat'ler (hepsi): kol panelleri omuzdan 45° yukari V acan iki uzun dikdortgen, kol kapagi yanda ayri yuvarlak parca, yaka onde V cukuru — bir moda flat'i degil, beden koordinatinda panel dokumu; giysi tanınmıyor (A4 isi). tamlik-kontak.png: P7 kirmizi kutu (ERR_NO_VIEW); P2'de paneller X seklinde kesisiyor; BUGRA-1 korse yatay bir bant olarak ciziliyor; P4 "kolsuz" flat'inde yanlarda kol benzeri iki blok var. Fotograflar (biba 1/2): ayni cizgili elbise, ayni on yuz, aci farki — "arka" adi yanlis, isci haklı.

Zemin sorusu: primitif motor (grafuygula + grafciz --ops + 19 op + ic halka pens) uzerine A4-A12 kurulur; ama olcum borusu takilmadan "fotograftan olcu" iddiasi hic test edilmemis kalir. Kusur 1 kapaninca ALIRDIM.

Sure: 38 dk.

---

# TUR 2 — 2026-09-09, HEAD 9bb0e9d9 (10.1: yeni kusur acilmadi, tur 1 kusurlari olculdu)

**NIHAI HUKUM: BITTI.** Tur 1'in tek ENGEL'i (olcum motora girmiyor) olculerek kapandi; kusur 2 ve 4 kapandi; kusur 3 A4'un isi. Yeni gorulenler devredilene yazildi.

| kusur | durum | kanit |
|---|---|---|
| 1 — olcum motora girmiyor (ENGEL) | **KAPANDI** | `grafdogrula --md --hedef` 'siluet-orani' satiri 5/5 = 1 (olcutum >=1). Grafta gercek etki: girth.waist ease 25 -> 0 mm bes teslimde (taban 25). kabul.sh `N_hedef_motora` 5/5 OK, sapma 0.227-0.352. Kirpma ilanli: grafciz stderr "gereken bolluk -241.14 mm, uygulanan 0 mm (onceki 25; SINIRA KIRPILDI)", dikilebilir.md 61-65 ayni satir. Sessiz yutma yok. contract cozucu.hedef easeMinMM 0 kaynakli, easeMaxKat 2.0 DOGRULANMADI etiketli. |
| 1 — "md5 5" olcutum | **GERI CEKILDI** | Fiziksel olarak yanlis olcuttu: 1 ve 2 ayni elbisenin ayni on yuzu, ayni op listesi; iki cekimin %2 olcum gurultusu (0.4954 / 0.5063) farkli kalip uretmemeli — uretseydi motor gurultuyu kaliba tasiyor olurdu. Ikisi ayni alt sinira kirpilinca ayni flat = dogru davranis. md5 4/5 kabul. |
| 2 — tamlik listesi giysi adiyla | **KAPANDI** | tamlik.py yeniden kostum (tam=3 kismi=9 red=0); `grep -cE '^- (kisa kol\|lastik\|wrap on\|buzgulu boyun)'` = 0. Uc kova. Kova 1, 7 kalem, hepsi op imzasi: extendTo{yLandmark,yLandmark2,yLerp}, slashSpread{panel,edge,ratio}, resew{seam,a,b} (P7, P8), joinEdges{panel,edgeA,edgeB}, dart{panel,mouth a/b,apexUp,apexDown}, setGrain{panel,deg}. Kova 2 (A4 cozucu/kapi) 3, kova 3 (okuma/program) 14. |
| 3 — croquis flat | bu turda olculmedi | A4, buFazinKusuru=false |
| 4 — overlay kontak | **KAPANDI** | `_yerel/giris/overlay-{1..5}.png` 5 dosya; gitignore OK, `git ls-files _yerel` = 0. overlay-4.png'yi actim: solda Mary Quant fotografi, sagda flat %55 saydam; govde/cep/yaka fotografla hizali, kol panelleri 45 derece yukari cikip fotografin disina tasiyor — A4 kusuru artik gozle gorunuyor, overlay isini yapiyor. |
| not — istisna sira numarasina bagli | **KAPANDI** | kabul.sh:52 govde = kaynak-yolu.txt dosya koku ('-arka' + uzanti atilir); :108 farkli govde ayni flat = FAIL; :109 ayni govde = BILGI. Cikti: "flat_ayni_1_2 BILGI ayni govde iki cekim (biba-O1194418-dress)". |

**Bayat build — KAPANDI.** Binary'ler ve grafop.cpp/grafop.hpp/grafdogrula-cli.cpp 02:20; daha yeni .cpp yok. `grafciz --ops --hedef` yeniden cizim md5 69533a50 == giris/4/flat.svg; `grafuygula --hedef` yeniden uretim md5 7849af3c == giris/4/graf.json. ctest hedefli 4/4.

**Yeni gorulen — DEVREDILEN (kusur acilmadi):**
1. graf.json notes'unda HEDEF kaydi YOK. grafuygula'yi `--hedef` ile kendim yeniden kostum: notes'ta 'hedef' 0. grafuygula-cli.cpp:4 yorumu ve kaynak-yolu.txt "sinir kirpmasi notes'ta" diyor — yanlis; kayit stderr/dikilebilir.md/kabul.sh'ta var, graf artefaktinda yok. Graf'i tek basina okuyan (A4+) bel bollugunun neden 0 oldugunu goremez. Kapanis: `grep -c siluet-orani giris/4/graf.json` >= 1. A3 tek satir ya da A4.
2. Hedef birimi: "bel/enGenis" siluet GENISLIK orani, girth.waist/girth.bust CEVRE orani olarak veriliyor; bes fotografta gereken bolluk yaklasik -200 mm, hepsi 0'a kirpiliyor. Boru dogru, olcum yanlis birimde: olcumun kaliba etkisi bes fotografta AYNI. Isci dikilebilir.md:65'te bunu kendi yazmis. Kapanis A6c/A4 okuma kalibrasyonu: genislik -> cevre donusumu (ya da enGenis yerine gogus hizasi genisligi) ve en az bir fotografta kirpilmamis hedef (sapma < 0.05).
3. A4 devirleri aynen duruyor: flat_ayni_insan_check 34, supresyon %33.33 tautolojisi, on=arka pens agzi 17.92/17.92.

**alirMiydim: ALIRDIM** — primitif motor (grafuygula + grafciz --ops + 19 op + ic halka pens + hedef borusu) uzerine A4-A12 kurulur: op'suz cizim kirmizi, gevsetme 0, alan disi 0, olcum artik grafi degistiriyor ve kirpildigini soyluyor. Sart: hedef birimi duzeltilmeden "fotograftan olcu" disari SOYLENMEZ — bugun bes fotografin hepsi ayni sinira dusuyor, olcumun ayirt edici etkisi henuz sifir.

Sure (tur 2): 18 dk.
