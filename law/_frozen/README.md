# _frozen — KANUN DEĞİL, KALINTI

Bu iki dosya ölçülmüş sabit değil; bir kere üretilip **donmuş çıktı**.
Dün çıktı klasöründeydi (`KOSU/ciktilar/giris-3/1/`, `graf-ilk/`), yani proje
bir çıktıya bağımlıydı. Bağ koparıldı, buraya alındı.

## 1309-base-topology.json — 9 op, SABİT
Hakem ölçümü: 7 koşuda md5 **bayt-aynı** (060bd677...). İçinde hardcoded:
- `drop {panel: "kol"}` → **her kalıpta kol siliniyor**
- `addPanel {cep_kapagi_on}` → her kalıba cep kapağı
- `closure {zipper}` → her kalıba arka fermuar

Sonuç: hangi fotoğrafı yüklersen yükle kalıp kolsuz + cep kapaklı + fermuarlı
çıkıyor. Okumadan kalıba geçen tek şey 4 sayı (etek boyu, kloş, bel/göğüs,
kalça/göğüs oranı). `okuma.on.kol`, `.ogeler`, `.yakaBicim` kalıba **hiç girmiyor**.

## 1309-base-graph.json — 44KB sabit iskelet
Her kalıp bunun üstüne op uygulanarak üretiliyor, yani hepsi aynı iskeletten.

## YAPILACAK
Kalıbın fotoğrafı kullanması için bu ikisi **okumadan türetilmeli**.
Koşu planında (`docs/1309-kosu.md`) bu faz var.
