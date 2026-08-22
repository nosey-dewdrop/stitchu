# KART F11-B — GECENİN İŞİ NEREDE? ADLİ ÖLÇÜM (isci-motor)

## NE
Bu gece F0/F6/F9/F10'un ürettiği KODUN ana dalda neden hiç olmadığını kök
sebebe indir, kurtarılabilir olup olmadığını ÖLÇ, ve `gece.sh`'e ölçülmüş bir
düzeltme adayı tasarla (uygulama, yaz).

## BAĞLAM (ölçülmüş, sana veriliyor — yeniden ölçmene gerek yok ama doğrula)
- `git status --porcelain | grep -v '^?? GECE/'` → **BOŞ**. Ağaçta sıfır kod değişikliği.
- `engine/tests/docs_truth_check.sh`, `engine/tests/landing_truth_check.sh`,
  `engine/tests/sleeve_armhole_agree_check.cpp` → **ÜÇÜ DE DİSKTE YOK**.
- `engine/src/sleeve.cpp:104` hâlâ `capSpreadFrac(cap) * width` — F6'nın
  "genişlik değil YAY" düzeltmesi ağaçta YOK.
- `git branch` → sadece `gece/F1-reddedildi` (v2'den). F6/F9/F10 dalı YOK.

## GİRDİ DOSYALARI
- `GECE/gece.sh`  (özellikle satır 69-171: `faz_kos`, `DUR()`, kapı/commit sırası)
- `GECE/log/gece.txt`, `GECE/STOP.md`
- `GECE/F6.md`, `GECE/F9.md`, `GECE/F10.md` ve `GECE/F10-*.md`, `GECE/F9-*.md`

## ÇIKTI
- `GECE/F11-B.md` — tutanak
- `GECE/log/F11B.kurtarma.txt` — kurtarma denemelerinin ham çıktısı

## ÖNCE GREP
`grep -n "reset --hard\|git clean\|git branch -f\|git checkout --" GECE/gece.sh`

## CEVAPLANACAK SORULAR (her biri bir komut çıktısıyla)
1. **KÖK SEBEP.** `gece.sh:158` kapıyı, `:165` commit'i çalıştırıyor — yani
   kapı KIRMIZI olduğunda HEAD hep `$ONCE`'a eşit. Bu durumda `DUR()`
   satır 82'deki `if` **hangi dala** giriyor? `git branch -f gece/$F-reddedildi`
   satırı bir kapı-kırmızısında HİÇ çalışabilir mi? Koşturarak ya da satır
   satır izleyerek KANITLA. Eğer çalışamıyorsa: §3.1'in *"reddedilen iş
   `gece/F#-reddedildi` dalına alınır, ana dal temiz kalır"* sözü
   TUTULMUYOR demektir — bunu açıkça yaz.
2. **KİM SİLDİ.** `gece.sh:93-94` (`git checkout -- .` + `git clean -fdq --
   engine contract web knowledge docs vision-student`) hangi fazda ateşledi?
   `GECE/log/gece.txt` zaman çizelgesiyle eşle. F9'un 17:08 kapı-kırmızısı
   kendinden ÖNCEKİ fazların (F0, F6) birikmiş işini de sildi mi? Ağaçta
   biriken iş fazlar arası taşındığı için bu mümkün — ÖLÇ.
3. **NEDEN GECE/ SAĞ KALDI.** `git clean` yol listesinde `GECE/` yok. Yani
   tutanaklar yaşıyor, kod öldü. Doğrula ve yaz.
4. **KURTARILABİLİR Mİ?** Şunların HEPSİNİ dene ve ham çıktıyı kaydet:
   - `git fsck --lost-found --unreachable --dangling`
   - `git stash list` (2 stash var — İÇLERİNE BAKMA, sadece tarih/başlık yaz;
     `stash@{0}` Damla'nın kararını bekleyen "onceki oturum artigi")
   - `ls -la .git/lost-found/ 2>/dev/null`
   - Editör/OS yedeği: `ls -la engine/src/*.orig engine/src/*~ 2>/dev/null`
   - `/tmp` altında kapı worktree'si kalmış mı: `ls -d /private/tmp/*gece* /private/tmp/*kapi* 2>/dev/null`
   Sonuç NE ise onu yaz. `git clean -fd` git nesnesi bırakmaz — kurtarma
   çıkmazsa "KURTARILAMAZ" de, umut satma.
5. **NE YENİDEN İNŞA EDİLEBİLİR?** Tutanaklar yaşıyor. `GECE/F6.md`,
   `GECE/F9.md`, `GECE/F10.md` içinde bir sonraki koşunun sıfırdan
   başlamaması için yeterli tarif var mı? Her faz için tek satır:
   "yeniden inşa için elde olan: <dosya yolu> · eksik olan: <ne>".
   Özellikle F6'nın `capSpreadFrac` kök sebebi tutanakta yazılı mı?

## DÜZELTME ADAYI (§0.4 — kırmızı raporu tek başına iş değildir)
`GECE/F11-B.md` sonunda **ölçülmüş** bir `gece.sh` yaması öner (DİFF olarak
yaz, UYGULAMA). En az şunu çözsün: kapı kırmızısında işin dalda saklanması.
İpucu yönü (doğrulamadan kabul etme, kendin ölç): commit'i kapıdan ÖNCE
atıp kapı kırmızısında `git reset --hard $ONCE` yapmak, ya da `DUR()` içinde
dal açmadan önce `git add -A && git commit` ile geçici bir kayıt almak.
Seçtiğin yolun BU repoda çalıştığını sahte bir fazla koşturarak göster.

## YASAKLAR
- **`GECE/gece.sh`'i DEĞİŞTİRME.** Yama DİFF olarak tutanağa yazılır, uygulanmaz.
- `GECE/kapi.sh` ve `GECE/mutasyon.sh` mühürlü — DOKUNMA (`GECE/kapi.sha`).
- Stash'lerin İÇİNİ açma, pop etme, drop etme. `stash@{0}` Damla'nın kararında.
- `engine/ contract/ web/` altında dosya oluşturma/değiştirme.
- Silinen işi "hatırlayıp" yeniden yazmaya KALKIŞMA — bu kart ölçüm kartı.
- Commit ATMA.

## SÜRE TAVANI
maxTurns 40.
