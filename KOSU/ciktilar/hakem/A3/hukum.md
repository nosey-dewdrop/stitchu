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
