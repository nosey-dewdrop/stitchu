# 5. mary-quant-O365926-dress-arka.jpg — dikilebilir mi?

**Kaynak fotograf:** `GIRDI/hedef-fotograflar/mary-quant-O365926-dress-arka.jpg` (sha 0147b7cfc576)
**Gorunum:** arka · **Arka:** fotograf (fotograftan)
**Okuyan:** isci-A3 — dis LLM cagrisi YOK, llmCagri 0.

## Fotograftan ne okundu?

| kalem | okuma | guven |
|---|---|---|
| panel `arka_beden` | GORULDU — Dikey seersucker cizgi sirtta kesintisiz; ortada cizgi dizilimi simetrik ayrisiyor -> CB dikisi. | 0.95 |
| panel `yaka_bandi_arka` | GORULDU — Sirtta genis, DUZ BEYAZ, dikdortgene yakin yaka dilimi; alt kenari kurek hizasinda yatay bitiyor. | 0.95 |
| panel `kol` | GORULDU — Iki kol da gorunuyor; on yuzle ayni kisa duz kol, cizgiler ayni yonde. | 0.9 |
| panel `kemer` | GORULDU — Belde ayni kumastan ince kemer; sirtta KESINTISIZ geciyor (toka onde). Bedene dikili degil. | 0.9 |
| panel `arka_etek` | gorulmedi (tabandan) — AYRI etek paneli YOK: cizgiler omuzdan ete kesintisiz, bel dikisi bulunmuyor. On yuzle ayni hukum. | 0.85 |
| kenar `yaka_bandi_arka/neck_back` | landmark.nape..landmark.bustLine oraninda **0.05**, duz | 0.85 |
| kenar `yaka_bandi_arka/dis_kenar` | landmark.nape..landmark.bustLine oraninda **0.55**, duz | 0.85 |
| kenar `arka_beden/cb` | landmark.nape..landmark.waist oraninda **1**, duz | 0.8 |
| kenar `arka_beden/hem` | landmark.waist..landmark.ankle oraninda **0.42**, duz | 0.8 |
| kenar `kol/hem` | landmark.shoulderTip..landmark.wrist oraninda **0.4**, duz | 0.85 |
| dikis `cb_dikisi` | arka_beden/cb.1 ↔ arka_beden/cb.2, oran [1,1] | 0.8 |
| dikis `bel_pensi_arka` | arka_beden/waist_dart ↔ arka_beden/waist_dart, oran [1,1] | 0.6 |
| dikis `kol_oyugu` | kol/cap ↔ arka_beden/armhole, oran [1,1.05] | 0.8 |
| dikis `omuz` | on_beden/shoulder ↔ arka_beden/shoulder, oran [1,1] (GORUNMUYOR, cikarim) | 0.6 |
| kapanma | arka_orta / okunamadi | 0.4 |
| simetri | cfAyna true, cbAyna true | 0.9 |

## Olcum ne dedi? (celiski tablosu)

Yasa 5: celiskide **olcum kazanir**. Bos tablo "celiski yok" demek degildir.

| kalem | Claude (ne) | olcum (ne kadar) | kazanan | sonuc |
|---|---|---|---|---|
| arka bel pensi | Kemerin altinda iki yanda pens OLABILIR (cizgiler yakinsiyor), ama kemer buzmesi de ayni izi birakir | siluet profilinde bel bandinda daralma var (bel/enGenis 0.3815) ama siluet pensi kemer buzmesinden AYIRAMAZ — ikisi de ayni dis hatti verir | **olcum** (siluet-orani) | Olcum bu ayrimi YAPAMIYOR ve bunu soyluyor. Pens op'a GIRMEDI; dikis kaydinda guven 0.6 ile duruyor ve okunamayanlar'da adiyla yazili. Sessiz 'pens ekle' yapilmadi. |
| giysi boyu (on/arka tutarliligi) | On ve arka ayni boyda: iki fotografta da bel-ayakbilegi orani ~0.42 | siluet boy/omuz on 2.5061, arka 2.1736 — %15 fark | **olcum** (siluet-orani) | Fark giysiden DEGIL: iki cekimde manken ayakligi ve kadraj farkli (on cekimde parke zemin daha cok giriyor). Ayni giysinin on ve arkasi ayni boyda olmak ZORUNDA, o yuzden bu olcum ciftinin farki dogrudan KADRAJ HATASI olculmus oluyor: %15. Op'a semantik 0.42 girdi. |
| cbAyna | On yuzden cikarim: simetrik olmali | bu fotografta DOGRUDAN gorunuyor, CB ekseninde ayna | **olcum** (siluet-orani) | Cikarim DOGRULANDI. On yuzun guveni 0.9'dan bu fotografla desteklendi. |

## Motora ne gecti?

Okuma dili (fotograf) ile motorun op sozlugu ayni sey degil. Ceviri ve **cevrilemeyenler**:

| okuma op'u | motor op'u | not |
|---|---|---|

| `splitPanel` | **YOK** | motorun op sozlugunde karsiligi yok (contract/graf-v1.json oplar) — dogduran okuma: kenar arka_beden/cb + dikis cb_dikisi |
| `addPanel` | **YOK** | motorun op sozlugunde karsiligi yok (contract/graf-v1.json oplar) — dogduran okuma: panel yaka_bandi_arka + kenar dis_kenar |
| `setHemLength` | **YOK** | kenar yok: arka_beden/hem — dogduran okuma: kenar arka_beden/hem |
| `mergeSeam` | **YOK** | motorun op sozlugunde karsiligi yok (contract/graf-v1.json oplar) — dogduran okuma: panel arka_etek gorulmedi: cizgiler kesintisiz, bel dikisi yok |

**Cozucu hedefi** (grafa YAZILMAZ, contract yasa 3): 1 adet.
- girth.waist / girth.bust = 0.3815 (kaynak: siluet-orani bel/enGenis) — OLCUM ZAYIF

**Landmark kaybi** (motor ara noktaya baglanamiyor, en yakin landmark secildi):
- yok

## Cizildi mi?

| cikti | durum | bayt |
|---|---|---|
| flat.svg | OK | 21422 |
| flat.png | OK | 82695 |
| kalip-36.svg | OK | 12734 |
| kalip-36.png | OK | 41871 |

**grafdogrula (gercek36):** KOSTU — kirmizi hukum: **0**

## Okunamayanlar (sessiz default YOK)

- arka pens mi kemer buzmesi mi (celiskiTablosu'nda)
- CB dikisinde fermuar var mi
- yaka bandinin arka/on parcalarinin ayri mi tek parca mi oldugu

## Olculmedi

- poz landmark (kaynak a): KOSULDU -> ERR_NO_POSE (arka yuz cekimi, yuz/uzuv gorunmuyor).

## Motorun op sozlugunde KARSILIGI OLMAYANLAR

- yatik/denizci yakasinin arka dilimi: graf-v1'de yaka arka profili yok
- kemer: ayri parca, karsiligi yok
