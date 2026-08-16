# DAMLA-KUYRUK

Bana değil **Damla'ya** düşen kararlar. Buraya satır olarak düşer, cevaplanınca satır kapanır (`[x]` + cevap + tarih).
**BLOKE ETMEZ** — kuyruk beklerken paralel halkalar koşmaya devam eder.

---

## AÇIK

### [ ] K1 — `patterns_real/` ve public repo · ACİL · 2026-08-16
**Ölçülen durum:** `git ls-files patterns_real/ | wc -l` → **49 dosya takipli**. `.gitignore` içinde `patterns_real` girdisi **YOK** (grep boş döndü) — yani dosyalar kazayla değil, bilerek commit'lenmiş. İçinde satın alınmış **Buğra kalıp PDF'leri** var. Repo bugün **public** açıldı.
**Damla private'a çekiyor** (kendi sözü).
**Soru:** Geçmişten `git filter-repo` ile kazınsın mı?
- Kazınırsa: geçmiş yeniden yazılır, tüm commit hash'leri değişir, fork/klon varsa kopar.
- Kazınmazsa: repo bir gün tekrar public olursa PDF'ler geçmişte durmaya devam eder.
**Ben yapmıyorum — geçmiş yeniden yazmak Damla'nın kararı.**
**Cevap:**

### [ ] K2 — beden cevabı · 2026-08-16
H1'in dikileceği beden hangisi? Motor EU34–EU48 üretiyor, paket 8 bedende hazır.
**Cevap:**

### [ ] K3 — kapak adayları (H1.3) · 2026-08-16
Listing vitrini için kapak + tek line drawing. Adaylar üretilince buraya PNG yolu düşer, Damla seçer.
Şartname zaten sabitliyor: ön+arka flat tek karo, 3 katman çizgi hiyerarşisi, navy `#1f3a5f` gövde / `#5c7aa0` seam.
**Cevap:**

### [ ] K4 — zevk hükümleri (H1.3, H3.4) · 2026-08-16
Zevk kapısının hakemi Damla. Süre taahhüt edilemez; raporlarda `zevk turu N` diye sayılır.
**Cevap:**

### [ ] K5 — dünya kapısı ne demek? · T5'i BLOKE EDER · 2026-08-16
`HEDEF.md` T4 satırı "dünya-kapısı sicili" diye bir taban halkası açıyor ama terimin tanımı repoda **hiçbir yerde yok**. Aradığım yerler ve sonuç:
- `git grep -i -E "d[uü]nya[ -]?kap|world[ -]?gate|global gate"` **tüm revizyonlarda** (`git rev-list --all`) → **2 isabet**, ikisi de halkanın kendisi: `HEDEF.md:40` ve `.vardiya/state.json:28`. İkisi de dün `bc0c63b` ile yazıldı.
- Tüm commit gövdeleri (`git log --all --format=%B`) → **0 isabet**.
- Diskteki takipsiz/gitignore'lu dosyalar dahil ağaç geneli → aynı 2 isabet.
- Tek tek okundu, geçmiyor: `ANAYASA.md`, `DERSLER.md`, `ROADMAP.md`, `CLAUDE.md`, `RULES.md`, `README.md`, `ENV.md`, `docs/`, `reports/`, `reports/gate/` (`NABIZ.md` + 8 `MIHENK-*.json` dahil).
- Yakın ama BAŞKA terimler: **TEK KAPI** (= Damla'nın gözü, `ROADMAP.md:22`), `KAPI 0` (= dikilebilirlik, `atlas.py`), `H0/H3b/H3c` (= harness kapıları), `pushGate` (= rabadon).

**Tanımı UYDURMADIM.** T5 açık bırakıldı; sicil kurulmadı, çünkü neyin sicili olduğu belli değil.
**Soru:** "dünya kapısı" hangi kapı — (a) giysinin dış dünyaya çıktığı kapı (= listeleme/satış), (b) TEK KAPI'nın başka adı, (c) motorun dışarıdan gelen rastgele isteği kabul/red kapısı (bitiş tanımındaki "10 cümle"), yoksa (d) bambaşka bir şey mi? Sicil neyi saymalı?
**Cevap:**

### [ ] K6 — "iki include düzeltmesi" neydi? · T1'i kapatır · 2026-08-16
Bunu HEDEF.md'ye senin metninden yazdım, repoda karşılığı yok. Arandı: tüm revizyonlar, tüm commit gövdeleri, `docs/`, `reports/`, `flatten-research/FINDINGS.md`, `ANAYASA/DERSLER/ROADMAP/RULES/README/ENV` → **0 isabet**.
Ampirik kontrol: 52 başlık tek tek `-fsyntax-only` ile derlendi, **0 başarısız** — yani `#include` kastediliyorsa ortada kusur yok.
**T1'i "yok hükmünde" yazdım, uydurmadım.** Başka bir şey kastettiysen söyle, halka geri açılır.
**Cevap:**

### [ ] K7 — README public'te bayat sayı söylüyor · 2026-08-16
`README.md:45` dışarıya **"the engine drafts 27 of 54 real garment photos … (37/54 under the older, looser count)"**, `:40` **"77/77 green"** diyor.
Üçü de `ANAYASA.md`'nin hükümsüz ilan ettiği 2026-07-21 rejiminden. Bugünün gerçeği: **ctest 88 test, 1 kırmızı**; 8 bedenin 3'ü h3c'den düşüyor.
Silmedim — README dört otorite dosyasından biri değil, senin anlatı yüzeyin, tek taraflı yeniden yazmak bana düşmez.
**Ama bu sayıyı dışarıda söylersen yanlış söylersin.** Düzelteyim mi, sen mi yazacaksın?
**Cevap:**

### [ ] K8 — 12 Ağustos paketleri sadece bayat değil, BAŞKA BİR GİYSİ · 2026-08-17
`Logs/surface-2026-08-12/pack-*` (8 beden) spec'inde `openings` anahtarı **hiç yok** (`None`).
Yani o elbisenin arka açıklığı da fermuarı da yok — **kafadan geçmeyen kapalı bir tüp**.
`CLAUDE.md`'deki "8 bedenin tam paketi diskte duruyor" cümlesi ürün olarak sayılamaz; bugünden itibaren öyle söylenmiyor.
Ayrıca dizin adı tutarsız: `pack-eu38` küçük harf, diğer 7'si `pack-EU34..48` büyük. Script kırabilir.
**Silinsin mi, arşive mi?** Düzeltmek bayat çıktıyı meşrulaştırır diye dokunmadım.
**Cevap:**

---

## KAPANDI

_(henüz yok)_
