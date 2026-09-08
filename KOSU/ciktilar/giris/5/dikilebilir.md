# 5. mary-quant-O365926-dress-arka.jpg — dikilebilir mi?

**Kaynak fotograf:** `GIRDI/hedef-fotograflar/mary-quant-O365926-dress-arka.jpg` (sha 0147b7cfc576)
**Gorunum:** arka · **Arka:** fotograf (fotograftan)
**Okuyan:** isci-A3 — dis LLM cagrisi YOK, llmCagri 0.

## Fotograftan ne okundu?

| kalem | okuma | guven |
|---|---|---|
| panel `arka_beden` | GORULDU — Dikey seersucker cizgi sirtta kesintisiz; ortada cizgi dizilimi simetrik ayrisiyor -> CB dikisi. | 0.95 |
| panel `boyun_bandi_arka` | GORULDU — Sirtta genis, DUZ BEYAZ, dikdortgene yakin yaka dilimi; alt kenari kurek hizasinda yatay bitiyor. | 0.95 |
| panel `kol` | GORULDU — Iki kol da gorunuyor; on yuzle ayni kisa duz kol, cizgiler ayni yonde. | 0.9 |
| panel `bel_bandi` | GORULDU — Belde ayni kumastan ince kemer; sirtta KESINTISIZ geciyor (toka onde). Bedene dikili degil. | 0.9 |
| panel `arka_etek` | gorulmedi (tabandan) — AYRI etek paneli YOK: cizgiler omuzdan ete kesintisiz, bel dikisi bulunmuyor. On yuzle ayni hukum. | 0.85 |
| kenar `boyun_bandi_arka/neck_back` | landmark.nape..landmark.bustLine oraninda **0.05**, duz | 0.85 |
| kenar `boyun_bandi_arka/dis_kenar` | landmark.nape..landmark.bustLine oraninda **0.55**, duz | 0.85 |
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

## Motora ne gecti? (primitif emir listesi)

Okuma dogrudan graf-v1 primitifleriyle yazilir (vision-graf-v1 yasa 9); ceviri katmani YOK.
Motor (`grafuygula`) taban grafa bu 8 emri sirayla uyguladi; cizici (`grafciz --ops`) ops SONRASI grafi cizdi.
Bir emir reddedilseydi teslim duserdi (sessiz atlama yok).

| # | primitif | args | doguran okuma kalemi |
|---|---|---|---|
| 1 | `merge` | `{"seam":"bel","panelA":"arka_beden","panelB":"arka_etek","panel":"arka_govde"}` | panel arka_etek gorulmedi: cizgiler kesintisiz, bel dikisi yok -> arka tek panel |
| 2 | `merge` | `{"seam":"bel","panelA":"on_beden","panelB":"on_etek","panel":"on_govde"}` | es fotograf (on): bel dikisi yok -> on tek panel |
| 3 | `addPanel` | `{"panel":{"id":"boyun_bandi_arka","edges":[{"id":"ic","kind":"seam","role":"neck_back","from":{"landmark":"landmark.nape","xFactor":0},"to":{"landmark":"landmar…` | panel boyun_bandi_arka gorulduMu + kenar boyun_bandi_arka/dis_kenar (oran 0.55, kavisli-dis) + katman kaydi |
| 4 | `sew` | `{"seam":"boyun_dikisi_arka","a":[{"panel":"boyun_bandi_arka","edge":"ic"}],"b":[{"panel":"arka_govde","edge":"neck_back"}],"reverse":true,"ratio":1}` | dikis boyun_bandi_arka/ic <-> arka_govde/neck_back [1.0,1.0] |
| 5 | `fitLength` | `{"panel":"boyun_bandi_arka","edge":"ic","target":{"seam":"boyun_dikisi_arka","ratio":1,"easeMM":0}}` | ic kenar boyun hattinin uzunlugunu kapatir (kisit) |
| 6 | `extendTo` | `{"panel":"arka_govde","edge":"hem_back","yLandmark":"landmark.knee","yOffsetMM":0}` | kenar arka_beden/hem: waist..ankle 0.42 -> landmark.knee |
| 7 | `extendTo` | `{"panel":"on_govde","edge":"hem_front","yLandmark":"landmark.knee","yOffsetMM":0}` | on hem arka ile ayni boyda (es fotograf) |
| 8 | `extendTo` | `{"panel":"kol","edge":"hem","yLandmark":"landmark.elbow","yOffsetMM":0}` | kenar kol/hem: shoulderTip..wrist 0.40 -> landmark.elbow |

**Cozucu hedefi** (grafa YAZILMAZ, yasa 3): 1 adet.
- girth.waist / girth.bust = 0.3815 (kaynak: siluet-orani bel/enGenis) — OLCUM ZAYIF

## Cizildi mi?

| cikti | durum | bayt |
|---|---|---|
| flat.svg | OK (data-ops=8) | 14912 |
| flat.png | OK | 79960 |
| kalip-36.svg | OK | 8895 |
| kalip-36.png | OK | 42379 |

**grafdogrula (gercek36):** KOSTU — kirmizi hukum: **1** (supresyon: foto-0147b7cf)

## Okunamayanlar (sessiz default YOK)

- arka pens mi kemer buzmesi mi (celiskiTablosu'nda)
- CB dikisinde fermuar var mi
- yaka bandinin arka/on parcalarinin ayri mi tek parca mi oldugu

## Olculmedi

- poz landmark (kaynak a): KOSULDU -> ERR_NO_POSE (arka yuz cekimi, yuz/uzuv gorunmuyor).

## Primitif kumesiyle YAZILAMAYANLAR (eksikPrimitif — kumeye eklenecek primitifin adresi)

- IC HALKA PENS (bel pensi, bel dikisi yokken): panel modeli dis halkadir; merge bel pensini dusurur (reason'da adiyla). Kumeye eklenecek primitif: pens (ic halka)
- bagimsiz parca (bel bandi): komsuluk kurali, primitif yok
- CB kapanma turu okunamadi: taban grafin fermuari duruyor (ilan)
