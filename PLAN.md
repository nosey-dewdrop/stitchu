# PLAN — stitchu, son plan (12 Eylül 2026)

> Bu tek plandır. Önceki bütün koşu düzenleri (G1-G4, altı iş, A1-A13,
> 0509-kosu.md, 1209-kosu.md) **geçersizdir**. Bu plan ileri gider; geriye
> yalnızca bir çizim hatası için dönülür, mimari için dönülmez.
> Otorite: `HEDEF.md` > bu belge.

## 0. Neden 2 ay kapanmadı — ölçülmüş sebep

12 Eyl 13:43'te senin pembe elbisen zincirden geçti. Ölçüm:

| katman | sonuç |
|---|---|
| okuma (`claude -p`) | **DOĞRU** — "boyun dibine oturan, önde fiyonkla bağlanan bant üstünde damla kesimli açıklık, kısa kollu, oturan, mini" |
| çizim | **YANLIŞ** — kol yok, yaka bandı yok, yaka biçimi V |

Sebep, mimari değil. **İki sayı:** okuma kolu `shoulderTip*1.05` diye
verdi (omuz ucunun 5% dışı = görünmez genişlik) ve çizici bunu sessizce
0-alanlı bir üçgen olarak çizdi. Elle `*1.30` yapıldı, kol çıktı. Yaka
`duz` idi, `kare` yapıldı, yaka çıktı. **İki satır.**

Yani: **okuma ile çizim arasında hiçbir denetim yok.** Okuma bir şey
söylüyor, çizim başka bir şey çiziyor, kimse karşılaştırmıyor. 2 ay boyunca
"flat çirkin" denip çizim güzelleştirildi; asıl kusur bu sessiz düşmeydi.

**Planın tek fikri: her primitif ya çizilir ya da AÇIKÇA kırmızı verir.
Sessiz düşme yasak.**

## 1. Bitiş tanımı (bu sağlanınca proje biter)

Damla bir fotoğraf yükler; 5 dakika içinde indirir:
flat.svg + flat.pdf (ön+arka) · kalip-A4.pdf (1:1, kalibrasyon kareli) ·
kalip-A0.pdf · rehber.html · kesim-plani.md — ve **çıkan flat fotoğraftaki
elbisedir**. Kanıt: 10 fotoğrafın 10'unda kör hakem "bu o elbise" der.

## 2. Fazlar — ileri, geri dönüş yok

Her faz: taze ajan, iş bitince ölür. Çıktısı tarafsız hakeme gider.
Hakem "olmamış" derse **o faz** düzeltilir; önceki fazlar açılmaz.

### F1 — SESSİZ DÜŞME BİTER  (kök sebep, en önce)
`web/lib/siluet-ciz.js` her primitifi ya çizer ya `kirmizi[]`'ye yazar.
- `default: bilinmeyen öge` yorumu → kırmızı.
- Kol alanı < 200 mm² → kırmızı ("kol okundu, çizilemeyecek kadar dar").
- Okumadaki her `ogeler[].tip` ve `kol`/`yakaBicim`, çizilen SVG'de karşılığı
  var mı diye sayılır; yoksa kırmızı.
BİTİŞ KANITI: pembe elbise koşulur, kırmızı listesi kolu ve yaka bandını
isimleriyle bildirir.

### F2 — EKSİK PRİMİTİFLER  (F1'in bildirdikleri)
Çiziciye eklenir: `yakaBandi` (stand/tie collar), `keyhole` (damla açıklık),
`fiyonk`ун banda bağlanması. Sözlük değil — **kenar+panel+dikiş** olarak.
BİTİŞ KANITI: pembe elbise sıfır kırmızı, flat fotoğrafla aynı elbise.

### F3 — OKUMA→ÇİZİM KAPISI
Okumanın ürettiği her sayı çizilebilir aralıkta mı, çizmeden önce ölçülür
(kol genişliği, yaka derinliği, etek boyu). Aralık dışıysa okuma tekrar
istenir — uydurma düzeltme yok.
BİTİŞ KANITI: `shoulderTip*1.05` gibi bir değer geldiğinde sistem kendisi
yakalar, sessizce çizmez.

### F4 — 10 FOTOĞRAF, KÖR HAKEM
`GIRDI/hedef-fotograflar*` içinden 10 farklı elbise. Her biri koşulur,
flat + fotoğraf kör hakeme verilir: "aynı elbise mi?" 10/10 olana kadar
kalan kusurlar F2'ye geri döner (tek geri dönüş noktası budur).
BİTİŞ KANITI: 10/10 tablo, her satırda fotoğraf-flat çifti.

### F5 — PAKET
İndirme düğmesi F4'ün çıktısını paketler: flat.pdf, kalip-A4.pdf (100 mm
kalibrasyon karesi ölçülür), kalip-A0.pdf, rehber.html, kesim-plani.md.
Tek beden EU36.
BİTİŞ KANITI: inen zip + kalibrasyon karesi cetvelle 100 mm.

### F6 — CANLI
`claude -p` sunucuda koşamaz. Seçenek ölçülür (yerel köprü / kuyruk / API),
karar ölçümle verilir, deploy edilir. Landing'de bayat veri silinir.
BİTİŞ KANITI: canlı URL'de yabancı biri fotoğraf yükleyip zip indirir.

### F7 — EDİT
"Şuraya fiyonk ekle", "yakayı uzat", "kolu kısalt" → op olarak uygulanır
(`docs/GRAF-IR.md` 15 op + replay zaten var, doğal dil bağlanır).
BİTİŞ KANITI: tek cümleyle değişen flat, önce/sonra.

### F8 — KUMAŞ
"Aynı elbise, iki kumaş, iki kalıp": negatif pay kumaşın esneme/toparlanma
payından hesaplanır, kalıba yansır. Rehbere kumaş bölümü girer.
BİTİŞ KANITI: aynı elbise, dokuma ve örme, iki farklı kalıp, sayı farkı.

### F9 — PROVA
Damla `kalip-A4.pdf`'i basar, ucuz kumaştan diker. 600+ saatte hiç
yapılmadı; giyilebilirliği ölçen tek kapı budur.
BİTİŞ KANITI: dikilmiş giysinin fotoğrafı.

## 3. Bu planın kuralları

1. **Faz atlanmaz, sıra değişmez.** Tek geri dönüş: F4 → F2.
2. **Yeni düzen kurulmaz.** Bu dosya yeniden yazılmaz; faz kapanınca
   yanına tek satır ölçülmüş sonuç yazılır.
3. **Damla router değildir.** Faz arası soru tarafsız ajana sorulur.
4. **Sessiz varsayılan yasak.** Çizilemeyen şey kırmızı verir.
5. Main'de çalışılır, branch açılmaz. Bir adım = bir commit.

## 4. Durum

| faz | durum |
|---|---|
| F1 sessiz düşme biter | AÇIK |
| F2 eksik primitifler | açılmadı |
| F3 okuma→çizim kapısı | açılmadı |
| F4 10 fotoğraf kör hakem | açılmadı |
| F5 paket | açılmadı |
| F6 canlı | açılmadı |
| F7 edit | açılmadı |
| F8 kumaş | açılmadı |
| F9 prova | açılmadı |

Site zincire bağlandı (12 Eyl, `f19cb94a`): fotoğraf yüklenince ekranda
flat çıkıyor. Kanıt: `KOSU/ciktilar/yerel/A1-kanit.png`.
