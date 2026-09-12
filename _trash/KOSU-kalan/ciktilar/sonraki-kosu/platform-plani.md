# PLATFORM KATMANI — MİMARİ PLAN

> Kaynak şart: `DEVIR.md` §7.5. Bu dosya o şartların uygulanabilir karşılığı.
> **Kod yazılmadı, hiçbir dosya değiştirilmedi.** Tarih: 4 Eylül 2026.
> Fiyat/mevzuat sayıları canlı sayfalardan çekildi, kaynak URL'ler satır içinde.
> Doğrulayamadığım her şey **DOĞRULANMADI** / **BULUNAMADI** diye işaretli.

---

## 0. EN ÖNEMLİ ÜÇ BULGU (gerisi bunların üstüne kuruluyor)

**(1) Kota bugün teknik olarak sayılamaz, çünkü ürün sunucuya hiç uğramıyor.**
Tarayıcı motoru kendi içinde koşturuyor: `web/js/engine.js:55-67` `loadEngine()`
`web/vendor/stitchu-engine.js`'i `<script>` ile yüklüyor, `flatDrawing()`
(`web/js/engine.js:415`) ve `draftJSON` tamamen istemcide dönüyor. PDF/DXF/SVG de
istemcide yazılıyor (`web/js/download.js:153` `makePdfCore`, `web/js/download.js:194`
`patternDXF`). Yani "2 hak" diye sayılacak olay **hiçbir sunucu isteği üretmiyor**.
Ne KV ne D1 — sayacak bir olay yok. Bu, plandaki en büyük tek yapısal iş.

**(2) Ama motorun sunucu kopyası ZATEN VAR ve aynı kaynaktan derleniyor.**
`backend/draft.js:17-19` aynı C++ motoru Worker içinde wasm olarak koşturuyor,
`backend/wrangler.toml:7-9` `CompiledWasm` kuralıyla. `engine/build-wasm.sh:160`
ve `:192-193` iki hedefi **tek koşuda** basıyor. Yani sunucu tarafına taşıma
"yeni motor yazmak" değil, mevcut `/api/draft`'ı kullanmak.

**(3) "Motor sürümü" diye aranan şey zaten üretiliyor, sadece runtime'da okunmuyor.**
`engine/build-wasm.sh:28-32` `src_stamp()` = `sha256(engine/src + engine/wasm +
build-wasm.sh)`, ilk 16 hane. Bugün canlı değer **`24d4ca4e4f850140`** ve
`web/vendor/stitchu-engine.js` ile `backend/engine/stitchu-worker.js`'in **1.
satırında aynı**. Deterministik (aynı kaynak → aynı damga), commit sha'ya bağlı
değil. Gardırop için aranan "motor sürümü" budur; tek eksik onu bir JS yorumundan
çalışma-zamanı değerine çıkarmak.

Buna ek: `patternDugum()` (`web/js/engine.js:387-402`) çizilen kalıbın JSON
metninin FNV-1a 64-bit özeti. Yani **çıktı kimliği** de zaten var
(`web/lib/flat-from-pattern.js:2248` `data-dugum` olarak SVG'ye yazılıyor).

---

## 1. MEVCUT ENVANTER — ne yeniden kullanılır

| Var olan | Yer | Platform katmanında rolü |
|---|---|---|
| Turnstile (bot filtresi) | `backend/guard.js:69-84`, `web/js/config.js:23` | **Aynen kalır** — kayıt formuna da takılır, bedava (Turnstile Free: sınırsız challenge, 20 widget/hesap — [docs](https://developers.cloudflare.com/turnstile/plans/)) |
| Origin filtresi | `backend/guard.js:57-63` | Kalır, ama iOS istemcisinde Origin yok → §2.5'e bak |
| IP dk/gün sayacı (KV) | `backend/worker.js:243-260` | **Kalır, ama para sayacı OLARAK KULLANILMAZ** (§3) |
| Günlük harcama tavanı | `backend/guard.js:91-100` | Kalır. Anthropic faturası hesaptan bağımsız tavana bağlı kalmalı |
| Sabit sırlı app-token | `backend/worker.js:196-199` | **Ölür** — tek paylaşımlı sır çok-kullanıcılıya çevrilemez. iOS bunun yerine oturum token'ı taşır |
| Sunucu-taraflı motor | `backend/draft.js`, `/api/draft` (`worker.js:103`) | **Kotanın dayandığı yer.** Paket üretimi buraya taşınır |
| `patternDugum` | `web/js/engine.js:387` | Gardırop kaydının çıktı parmak izi |
| source-stamp | `engine/build-wasm.sh:28`, canlı `24d4ca4e4f850140` | Gardırop kaydının motor sürümü |
| Köken kaydı | `web/js/provenance.js`, `download.js:43,169` | Gardırop şemasına **olduğu gibi** JSON olarak girer |
| localStorage gardırop | `web/js/store.js:64-89` (40 kayıt tavanı) | **Cache olur, kaynak olmaz.** Anonim→hesap göçünün girdisi |
| Ölçü profilleri | `web/js/store.js:37-62` (30 profil) | Hesaba taşınır, aynı şema |
| KV namespace | `backend/wrangler.toml:41-43` id `2927eef…` | Kalır: throttle + tek-kullanımlık kodlar |
| API sözleşmesi | `backend/API.md` | iOS'un tükettiği doküman; auth bölümü yeniden yazılır |

**Yeniden kullanılamayacak tek şey:** `web/js/closet.js` bugünün UI'ı olarak
kalabilir ama veri kaynağı `store.js` yerine API olur — `loadCloset()` çağrısı
(`closet.js:31`) tek değişim noktası, dosyanın gerisi aynı.

---

## 2. KİMLİK — seçenekler ve karar

### 2.1 Karşılaştırma (canlı fiyatlar, 4 Eyl 2026)

| Seçenek | Bedava sınır / fiyat | iOS | Kilitlenme | KVKK/GDPR | Karar |
|---|---|---|---|---|---|
| **Cloudflare Access / Zero Trust** | Free 50 **kullanıcı**, sonra kişi başı ücret | — | — | — | **ELE**. Ürünün kendi tanımı "workforce": *"Govern connections between your **workforce**… secures **employees and contractors**"* ([cloudflare.com](https://www.cloudflare.com/zero-trust/products/access/)). Tüketici kayıt akışı yok, koltuk başı faturalanıyor — 1000 müşteri = 1000 koltuk. ($7/kullanıcı/ay rakamı yalnız 3. taraf kaynakta, **DOĞRULANMADI**; resmi fiyat sayfası açılmıyor.) |
| **Auth0** | Free 25.000 MAU; ilk ücretli **$35/ay @500 MAU**, 20k MAU = **$1.400/ay** ([auth0.com/pricing](https://auth0.com/pricing)) | var | yüksek | AB bölgesi var | **ELE**. Bedava katman cömert ama üstündeki uçurum saçma; bu ürün için gereksiz ağır. |
| **Clerk** | Hobby **50.000 MRU** bedava; Pro **$25/ay** ([clerk.com/pricing](https://clerk.com/pricing)) | iOS SDK v1, Şub 2026 ([changelog](https://clerk.com/changelog/2026-02-10-ios-android-sdk-v1)) | orta-yüksek: kullanıcı tablosu onlarda | AB veri bölgesi var | **İKİNCİ SIRA.** Uyarı: Hobby'de **MFA, passkey, SMS, Clerk logosunu kaldırma YOK** — hepsi $25/ay Pro'dan başlıyor. Yani "bedava" rakamı yanıltıcı. |
| **Supabase** | Free 50k MAU ama **2 aktif proje + 1 hafta hareketsizlikte proje duraklatılır**; Pro **$25/ay**, 100k MAU ([supabase.com/pricing](https://supabase.com/pricing)) | `supabase-swift` var | yüksek (Postgres + Auth + ikinci bulut) | AB bölgesi var | **ELE.** Canlı bir sitede "hareketsizlikte duraklat" kabul edilemez; ayrıca Cloudflare'in yanına ikinci bir bulut daha sokmak, bu iş için ödenmesi gereksiz bir karmaşıklık. Worker'dan JWT doğrulaması dokümante ([JWKS](https://supabase.com/docs/guides/auth/jwts)) yani teknik engel yok — sebep mimari. |
| **Kendi auth'umuz (D1 + KV)** | Workers Paid **$5/ay** (zaten gerekli) + D1 free katmanı: 5M satır okuma/gün, 100k satır yazma/gün, 5 GB ([D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)) + Resend Free 3.000 e-posta/ay ([resend.com/pricing](https://resend.com/pricing)) | doğrudan HTTP, SDK yok | **sıfır** (SQLite dışa aktarılır) | veri tek yerde, tek işleyen | **SEÇİLEN** |

### 2.2 ÖNERİ: kendi auth'umuz, **e-posta + 6 haneli kod**, D1 + KV üstünde

**Gerekçe — 5 madde, hepsi ölçülebilir:**

1. **Kullanıcı satırı hangi seçenekte olursa olsun D1'de duracak.** Kredi bakiyesi,
   gardırop, sipariş — bunlar hiçbir auth sağlayıcısının tablosunda duramaz.
   Yani D1 + user tablosu **zorunlu**. Dışarıdan auth almak, var olan tabloya
   bir de dış `provider_user_id` kolonu ve bir de ikinci arıza kaynağı eklemek
   demek. Kazandırdığı tek şey kimlik bilgisi yönetimi.
2. **Kimlik bilgisi yönetimini zaten sıfıra indiriyoruz: parola yok.** E-posta →
   6 haneli kod → oturum. Parola tablosu yok, hash seçimi yok, "şifremi unuttum"
   akışı yok, sızabilecek parola yok. Yazılacak güvenlik kodu bu yüzden küçük ve
   sınırlı: kodun tek kullanımlık olması, 10 dk TTL, deneme sayacı, sabit-zamanlı
   karşılaştırma (`backend/worker.js:233-240` `matchesSecret` **zaten var**).
3. **Kod, linkten iyi — özellikle iOS yüzünden.** Magic *link*, iOS'ta Universal
   Links kurulumu, e-posta istemcisinin linki başka tarayıcıda açması ve cihaz
   değiştirme sorunlarını getirir. 6 haneli kod web'de ve iOS'ta **aynı iki
   çağrıdır**: `POST /api/auth/start` → `POST /api/auth/verify`. Tek akış, tek
   kod yolu, `backend/API.md` tek sözleşme.
4. **Kilitlenme sıfır.** D1 SQLite'tır; `wrangler d1 export` ile veri elde.
   Clerk'ten çıkmak = kullanıcı taşıma projesi.
5. **Maliyet gerçekten $5/ay.** Workers Paid zaten gerekiyor (Free katmanda
   günde 100k istek ve KV'de günde **1.000 yazma** sınırı var, oturum yazmaları
   bunu yakar — [KV pricing](https://developers.cloudflare.com/kv/platform/pricing/)).
   D1 ve Resend bu ölçekte bedava.

**Karşı-argüman, dürüstçe:** kendi auth'unu yazmak yeni bir güvenlik yüzeyi
açar. Bu riski kabul etmemin sebebi yukarıdaki 2. madde: parolasız + kodlu
tasarımda yazılacak kod ~150 satır ve tamamı denetlenebilir. Eğer bir gün
passkey, MFA, SSO gerekirse **o zaman** Clerk'e geçilir; user tablosu bizde
kaldığı için geçiş bir kolon eklemektir.

### 2.3 Oturum tasarımı (somut)

```
POST /api/auth/start   { email, turnstileToken }
  → Turnstile doğrula (guard.js:69 aynen)
  → 6 haneli kod üret (crypto.getRandomValues)
  → KV: auth:code:<sha256(email)>  = {hash(kod), deneme:0}  TTL 600s
  → Resend ile e-posta
  → 200 { sent: true }          // e-posta kayıtlı mı, ASLA söyleme (kullanıcı sayımı)

POST /api/auth/verify  { email, code }
  → KV'den al, deneme++ (5'te sil), sabit-zamanlı karşılaştır
  → D1: users satırı yoksa aç (credits = 2)  ← ilk hak burada doğar
  → refresh token = 32 bayt rastgele; D1'de SADECE sha256'sı durur
  → 200 + Set-Cookie: sb_rt=<token>; HttpOnly; Secure; SameSite=Lax; Max-Age=90g
        + body { accessToken (JWT, 15 dk), user }   ← iOS bunu Keychain'e yazar

POST /api/auth/refresh → yeni access token, refresh token DÖNDÜRÜLÜR (rotation)
POST /api/auth/logout  → refresh token satırı silinir
```

Access token: HS256 JWT, sır `wrangler secret`, Web Crypto `crypto.subtle` ile
imzalanır. Doğrulama Worker'da kütüphanesiz yapılabilir (~30 satır).

### 2.4 Bugünkü sabit sırlı `x-app-token` ne olacak?

`backend/worker.js:196-199`'daki tek paylaşımlı sır, "B2B API müşterisi" tier'ı
için doğru, "bizim iOS uygulamamız" için yanlış — uygulamayı sökn kişi sırrı alır.
Plan: `x-app-token` **B2B API tier'ı olarak kalır**, iOS ona geçmez, iOS de web
gibi `Authorization: Bearer <accessToken>` taşır.

### 2.5 Origin filtresi ve iOS

`guard.js:57-63` Origin yoksa **reddediyor**. iOS istemcisi Origin göndermez.
Çözüm: yeni kural — *"geçerli `Authorization: Bearer` varsa Origin şartı aranmaz"*.
Bearer, forge edilemediği için Origin'den zaten güçlü. Origin filtresi yalnızca
**anonim demo** yolunda (oturumsuz `/api/draft`) kalır.

### 2.6 KVKK / GDPR notları

- Toplanan kişisel veri **sadece e-posta + ölçüler**. Ölçü verisi GDPR'da özel
  nitelikli veri değil ama hassas; açık rıza metni ve silme hakkı gerekir.
- D1 veritabanı oluşturulurken **konum (location hint)** seçilir; AB müşterisi
  varsa `weur`. Bir kez seçilir, sonradan taşımak zahmetlidir — baştan doğru seç.
- `DELETE /api/account` **gerçekten silen** bir uç olacak (users + wardrobe +
  sessions), 30 gün gecikmeli değil. Bir solo ürün için en ucuz uyum bu.
- Fotoğrafın Anthropic API'ye gittiği bilgisi sitede zaten yazıyor (DEVIR §7.5).
  Hesap açılışında da **kayıt formunda** tekrar edilmeli.
- KVKK VERBİS kayıt yükümlülüğü eşikleri (çalışan sayısı / mali bilanço) bu
  ölçekte muhtemelen doğmaz ama **DOĞRULANMADI** — bunu SMMM'ye sorması gerek,
  ben mevzuat eşiğini doğrulamadım.

---

## 3. KOTA — "hesap başına 2 hak" nerede sayılır

### 3.1 Sorunun kendisi

İstemcide sayılamaz (localStorage silinir, DevTools açılır). Ama bugün
sunucu tarafında sayılacak bir **olay da yok** (§0.1). Yani problem
"sayacı nereye koyalım" değil, **"hangi olayı ücretlendiriyoruz"**.

### 3.2 Karar: ÖNİZLEME BEDAVA VE YEREL, **PAKET SUNUCUDAN**

- Tarayıcıdaki wasm motoru **kalır**. Kullanıcı prompt/foto verir, flat'i ve
  kalıbı ekranda 3–12 ms'de görür. Bu bedava, hesapsız, hızlı — demo bu.
- **İndirilebilir paket (A4/A0 PDF + DXF + SVG + rehber) yalnızca sunucudan
  gelir:** yeni uç `POST /api/pack`. Oturum + kredi ister, D1'de bakiyeyi
  atomik düşürür, motoru Worker içinde koşturur (`backend/draft.js` zaten orada),
  baytları döner.
- Bunun sonucu: `web/js/download.js`'in PDF/DXF üreten yarısı **sevk edilen
  paketten çıkar**. Kalan: `patternSVG` önizleme için (filigranlı), `saveBlob`
  sunucudan gelen baytı diske yazmak için.

**Neden ekranda gösterip indirmeyi ücretlendiriyoruz?** Çünkü satılan nesne
budur. Ekrandaki çizim satılamaz; kesilip dikilen A0 PDF satılır. Ayrıca
demo değeri korunuyor: yabancı siteye girer, gerçek çıktısını görür, sonra
hesap açar. "Bedava kullanım yok" kuralı **teslimatta** uygulanıyor, vitrinde değil.

**Dürüst sınır:** `web/js/` açık kaynak gibi okunabilir. JS'i okuyup
`pdf-core.js`'i kendi eliyle çağıran biri paketi üretebilir. Bu **engellenemez**
ve engellemeye çalışmak (obfuscation, DRM) zaman israfıdır. Kabul edilebilir
bant: normal alıcının önündeki tek yol sunucu; kodu okuyan %0.1 zaten müşteri
değildi. Uzun vadeli kalıcı çözüm bu değil — kalıcı çözüm paketin içindeki
**rehber + beden serisi + destek**, yani kopyalanamayan kısım.

### 3.3 KV mi D1 mi? — **para D1'de, gürültü KV'de**

`backend/worker.js:263-265`'te zaten yazılı: *"KV read-modify-write has a small
race window under simultaneous writes"*. Duvarda bir dikiş kaybetmek görünmez;
**bir kredi kaybetmek paradır.** KV ayrıca uçlar arası nihai tutarlı — iki POP'a
paralel giden 5 istek, 2 kredili hesabı 5 kez harcatabilir.

| Sayaç | Nerede | Neden |
|---|---|---|
| Kredi bakiyesi, hak düşümü | **D1** | Atomik `UPDATE ... WHERE credits > 0`, `meta.changes` kontrolü |
| Abonelik dönemi / hak yenileme | **D1** | Sorgulanabilir, faturaya bağlı |
| IP dakika/gün throttle | KV (bugünkü hâli) | Yarış maliyeti sıfır, mevcut kod aynen kalır |
| Anthropic günlük harcama tavanı | KV (`guard.js:91`) | Yarış maliyeti birkaç sent; hesaptan bağımsız kalması **doğru** |
| Tek kullanımlık giriş kodu | KV + TTL | TTL semantiği tam olarak KV'nin işi |

Atomik düşüm:

```sql
UPDATE users SET credits = credits - 1, updated_at = ?2
 WHERE id = ?1 AND credits > 0;
-- meta.changes === 0  →  402 payment_required, motor HİÇ koşturulmaz
```

Sıra önemli: **önce düş, sonra üret.** Üretim hata verirse telafi satırı yazılır
(`credit_ledger` tablosu, §4.3), bakiye geri eklenir. Ters sıra (üret-sonra-düş)
paralel isteklerde bedava paket dağıtır.

### 3.4 Anonim → hesap geçişi

Demo çıktısı bugün `store.js:71` ile localStorage'a yazılıyor. Plan:

1. Anonim kullanıcıya ilk ziyarette `anon_id` (UUID) verilir, localStorage'da.
2. Demo paketleri lokalde `{spec, fabric, size, koken, motorDamgasi, dugum}`
   olarak durur — bugünkü `saveToCloset` (`create.js:1216`) şeması buna çok yakın.
3. Kayıt sonrası `POST /api/wardrobe/import { items: [...] }` — sunucu spec'i
   **yeniden doğrular** (`backend/spec-core.js` `validateDraftRequest` zaten var),
   geçerli olanları hesaba yazar. En fazla 40 kayıt (bugünkü tavan).
4. **Kredi taşınmaz.** Anonim demoda üretilmiş şeyler gardıroba girer ama
   "2 hak" hesabın açılışında doğar. Aksi hâli hakları çoğaltır.

### 3.5 Çift hesap istismarı — dürüst cevap

**Tamamen engellenemez.** E-posta bedava ve sınırsız. Yapılabilecekler,
maliyet/fayda sırasıyla:

| Önlem | Maliyet | Yakaladığı |
|---|---|---|
| Turnstile kayıt formunda (zaten var) | 0 | Otomatik bot çiftliği |
| E-posta kod doğrulaması (zaten tasarımda) | 0 | Rastgele/yanlış adres |
| Tek-kullanımlık e-posta domain listesi | ~1 saat + aylık bakım | Gündelik istismarın büyük kısmı (mail.tm, guerrillamail…). Oran ölçülmedi, tahmin etmiyorum |
| IP/ASN başına 24 saatte N kayıt yumuşak sınırı (KV) | ~1 saat | Aynı makineden seri hesap. **Yan etkisi var**: yurt, ofis, CGNAT arkasındaki gerçek kullanıcılar. Bu yüzden **engelleme değil, yavaşlatma** olmalı (kayıt yine olsun, hakları 2 yerine 0 doğsun ve "hakkını açmak için doğrula" densin) |
| Ödeme yöntemi doğrulaması (1 TL provizyon) | orta | Neredeyse tamamı — ama dönüşümü öldürür, demo fikrini iptal eder |

**Kabul edilebilir bant, açık sayı olarak:** teslim edilen paketlerin **%5'inden
azı** çiftlik hesaplarından çıkıyorsa **daha fazla mühendislik yapma**. Bunu
ölçmenin yolu var: `signup_ip`, `signup_asn` kolonları + aynı IP'den 3+ hesap
sorgusu. Önce **ölç**, önlemi sonra ekle. Baştan üç katmanlı anti-fraud kurmak
bu planın en net fazla-mühendislik tuzağı.

---

## 4. GARDIROP VERİ MODELİ

### 4.1 Kritik içgörü, netleştirilmiş

Motor deterministik (DEVIR §7.5): aynı spec + aynı beden + aynı motor = aynı
çıktı. `patternDugum` (`engine.js:387`) bunun kanıtını taşıyor. O yüzden
**PDF saklanmaz, spec saklanır** — bir kayıt ~2 KB, PDF ~2 MB.

Ama bu doğru cümlenin bir kuyruğu var: **motor değişirse aynı spec farklı çıktı
verir.** Motor bu repoda haftada birkaç kez değişiyor. O yüzden §4.4.

### 4.2 Depolama seçimi

| | D1 | KV | R2 |
|---|---|---|---|
| "Bu kullanıcının tüm kalıpları" sorgusu | ✅ `WHERE user_id=?` | ❌ prefix listeleme, sayfalama acı | ❌ |
| Bakiye/sipariş tutarlılığı | ✅ transaction | ❌ yarış | ❌ |
| ~2 KB JSON metin | ✅ | ✅ | aşırı |
| Teslim edilmiş ~2 MB PDF | ❌ | ❌ (25 MB değer sınırı ama yanlış araç) | ✅ $0.015/GB-ay, **egress $0** ([R2 pricing](https://developers.cloudflare.com/r2/pricing/)) |

**Karar: D1 birincil kayıt, R2 sadece teslim edilmiş dosya arşivi, KV yalnız
throttle/TTL.** KV gardıropta hiç kullanılmaz.

### 4.3 Şema (D1 / SQLite)

```sql
CREATE TABLE users (
  id            TEXT PRIMARY KEY,        -- uuid
  email         TEXT UNIQUE NOT NULL,
  email_norm    TEXT UNIQUE NOT NULL,    -- lowercase, +etiket ayıklanmış
  credits       INTEGER NOT NULL DEFAULT 2,   -- ★ "her hesaba 2 hak" burada doğar
  plan          TEXT NOT NULL DEFAULT 'free', -- free | credit | sub_monthly | sub_yearly
  plan_until    INTEGER,                 -- abonelik bitişi (unix ms), NULL = yok
  locale        TEXT NOT NULL DEFAULT 'tr',
  signup_ip     TEXT, signup_asn TEXT,   -- §3.5 ölçümü için, silme talebinde silinir
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);

CREATE TABLE sessions (
  token_sha     TEXT PRIMARY KEY,        -- refresh token'ın SADECE sha256'sı
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at    INTEGER NOT NULL,
  expires_at    INTEGER NOT NULL,
  ua_hint       TEXT                     -- "iOS 18 / Safari" gibi, kullanıcı görsün diye
);
CREATE INDEX idx_sessions_user ON sessions(user_id);

-- ★ GARDIROP: PDF DEĞİL, SPEC.
CREATE TABLE wardrobe_items (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,           -- "puf kollu mini elbise"
  garment       TEXT NOT NULL,           -- spec.garment, listeleme/filtre için kolon
  spec_json     TEXT NOT NULL,           -- ★ TAM SPEC (contract/garment-spec ile geçerli)
  fabric_id     TEXT NOT NULL,           -- contract/fabric-catalog-v1.json anahtarı
  size_label    TEXT NOT NULL,           -- 'EU38' | 'custom'
  body_json     TEXT,                    -- size='custom' ise ölçüler; değilse NULL
  koken_json    TEXT NOT NULL,           -- ★ web/js/provenance.js kaydı, aynen
  motor_damgasi TEXT NOT NULL,           -- ★ build-wasm.sh src_stamp, bugün 24d4ca4e4f850140
  dugum         TEXT NOT NULL,           -- ★ patternDugum(draftJSON metni), FNV-1a 64bit
  spec_semasi   TEXT NOT NULL,           -- 'garment-spec/2' — contract/garment-spec-v2.json:4
  parent_id     TEXT REFERENCES wardrobe_items(id), -- bölgesel edit zinciri
  origin        TEXT NOT NULL,           -- 'prompt' | 'photo' | 'edit' | 'import'
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL,
  deleted_at    INTEGER                  -- yumuşak silme; DELETE /api/account gerçekten siler
);
CREATE INDEX idx_wardrobe_user ON wardrobe_items(user_id, created_at DESC);

-- ★ TESLİM EDİLMİŞ PAKET: değişmez. Satın alınan şey budur.
CREATE TABLE deliveries (
  id            TEXT PRIMARY KEY,
  item_id       TEXT NOT NULL REFERENCES wardrobe_items(id),
  user_id       TEXT NOT NULL REFERENCES users(id),
  motor_damgasi TEXT NOT NULL,           -- teslim ANINDAKİ motor
  dugum         TEXT NOT NULL,           -- teslim ANINDAKİ çıktı parmak izi
  r2_prefix     TEXT NOT NULL,           -- 'deliveries/<user>/<delivery_id>/'
  files_json    TEXT NOT NULL,           -- [{name,bytes,sha256}] — a4.pdf, a0.pdf, .dxf, flat.svg, rehber.pdf
  credit_cost   INTEGER NOT NULL,
  created_at    INTEGER NOT NULL
);

CREATE TABLE credit_ledger (            -- bakiye TÜREV, defter kaynak
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id),
  delta         INTEGER NOT NULL,        -- +10 satın alma, -1 paket, +1 telafi
  reason        TEXT NOT NULL,           -- 'signup' | 'purchase' | 'pack' | 'refund' | 'sub_renew'
  ref           TEXT,                    -- delivery_id veya ödeme sağlayıcı event id
  created_at    INTEGER NOT NULL
);
CREATE INDEX idx_ledger_user ON credit_ledger(user_id, created_at DESC);

CREATE TABLE payment_events (           -- webhook idempotency
  provider_event_id TEXT PRIMARY KEY,   -- ★ UNIQUE = aynı webhook iki kez krediye dönüşemez
  provider      TEXT NOT NULL,
  user_id       TEXT,
  kind          TEXT NOT NULL,
  raw_json      TEXT NOT NULL,
  processed_at  INTEGER NOT NULL
);

CREATE TABLE measurement_profiles (     -- store.js:37-62'nin sunucu karşılığı
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, body_json TEXT NOT NULL, updated_at INTEGER NOT NULL
);
```

Not: `credits` kolonu ile `credit_ledger` çift kayıt. Kolon hızlı okuma için,
defter gerçek. `SELECT SUM(delta)` ile tutarlılık kontrolü yapılabilir olmalı —
bir gün "kredim kayboldu" şikayeti geldiğinde tek kanıt bu.

### 4.4 Eski motor sürümü problemi — **çözüm: değişmezi ayır**

Yanlış çözümler (ikisini de **yapma**):
- Eski wasm binary'lerini saklayıp sürüm sürüm koşturmak. Her motor sürümü için
  ~1.5 MB binary + yönlendirme + test yükü. Ayda birkaç sürümde bu bir müze olur.
- Sessizce yeni motorla yeniden çizmek. "Kalıbım değişti" şikayeti tam bu.

**Doğru ayrım — iki farklı nesne var, karıştırılmamalı:**

1. **Satın alınan teslimat = DONMUŞ BAYT.** `/api/pack` ürettiği anda dosyaları
   R2'ye yazar (`deliveries.r2_prefix`). O paket bir daha asla yeniden
   üretilmez, arşivden verilir. Motor 50 kez değişse de kullanıcının kestiği
   kağıt aynı kalır. Maliyet: paket başına ~3 MB × $0.015/GB-ay ≈ **1000 paket
   için ayda $0.045**. Bedava katman zaten 10 GB. Bu, mühendislik değil, muhasebe.
2. **Gardıroptaki spec = CANLI.** Düzenlenebilir, yeniden çizilir, bugünkü
   motorla. Ama açılışta karşılaştırma yapılır:

```
item.motor_damgasi !== BUGUNKU_DAMGA
  → yeniden çiz, yeni dugum hesapla
  → dugum aynı  : hiçbir şey deme, motor_damgasi'nı sessizce güncelle
                  (motor değişti ama BU kalıba dokunmadı — çok yaygın durum)
  → dugum farklı: ekranda ilan et —
      "Bu kalıp <tarih> tarihli motorla çizildi. Motor o günden beri güncellendi
       ve bu kalıbın geometrisi değişti. İndirdiğin paket <arşivde duruyor>.
       Yeni sürümü görmek ister misin? [Eskiyi indir] [Yeniyi çiz]"
```

Bu, `dugum`'un zaten var olması sayesinde ~20 satırlık iş. Ve `patternDugum`
girdi spec'inin değil **çizilen kalıp JSON'ının** özeti olduğu için tam doğru
soruyu cevaplıyor: "çıktı değişti mi?" — "motor değişti mi?" değil.

**Runtime'da damgayı okumak (tek eksik parça):** `src_stamp` bugün glue
dosyasının 1. satırında JS yorumu. Yapılacak: `engine/build-wasm.sh`'e
`export const SOURCE_STAMP = '<stamp>'` satırı ekleyen bir üretilmiş modül
(`engine/dist/stamp.gen.js` → hem `web/js/` hem `backend/`). Tek kaynak korunur,
`bundle_fresh_check` bozulmaz.

---

## 5. ÖDEME

### 5.1 Sert gerçek: **Stripe Türkiye'de yok**

[stripe.com/global](https://stripe.com/global) desteklenen ülke listesinde
Türkiye **hiç geçmiyor** — "invite only" veya "coming soon" da değil, listede yok.
Preview olarak sadece Hindistan ve Endonezya var. Yani **Türkiye'de kurulu bir
tüzel kişi Stripe hesabı açamaz.** Görevdeki "Stripe entegrasyonu" varsayımı
Damla'nın şirketi TR'de olduğu sürece geçersiz.

### 5.2 Seçenekler (doğrulanmış)

| Yol | Komisyon | Abonelik | Worker uyumu | Engel |
|---|---|---|---|---|
| **iyzico** (PayU/Prosus iştiraki) | Kurumsal **%4,29 + 0,25 TL**; şahıs %4,49'dan ([iyzico.com/fiyatlandirma](https://www.iyzico.com/fiyatlandirma)) | Var, ama **eklenti: 3 ay bedava sonra 199 TL/ay** ([docs](https://docs.iyzico.com/en/products/subscription.md)) | ✅ **Tam uyumlu.** Auth = `IYZWSv2` + `HMACSHA256(randomKey+path+body, secretKey)` + base64 — hepsi Web Crypto'da var, Node bağımlılığı yok ([docs](https://docs.iyzico.com/en/getting-started/preliminaries/authentication/hmacsha256-auth.md)) | AB müşterisine KDV'yi **sen** yönetirsin |
| **PayTR** | Yeni üyeye %2,19; kadın girişimciye **%0 komisyon** duyurusu (paytr.com ana sayfa) | "Abonelik Yönetimi" ürünü var | **DOĞRULANMADI** — geliştirici dokümanına erişilemedi | Kamuya açık fiyat kartı yok (`/sanal-pos/komisyon-oranlari` 404) |
| **Paddle** (merchant of record) | **%5 + 50¢** ([paddle.com/pricing](https://www.paddle.com/pricing)) | Var | ✅ webhook HMAC | Türkiye yasaklı ülke listesinde **yok** ([destek sayfası](https://www.paddle.com/help/start/intro-to-paddle/which-countries-are-supported-by-paddle)) ama Paddle "**software businesses**" diyor — dikiş kalıbı PDF'i kabul edilir mi **DOĞRULANMADI**. Sözleşme öncesi sorulmalı |
| **Lemon Squeezy** | Stripe satın aldı (Tem 2024), hâlâ çalışıyor | Var | ✅ | Türk satıcı kabulü **BULUNAMADI** — destek sayfası 403 döndü |
| **Gumroad** | %10 + $0,50 (kendi linkin) | Sınırlı | — | **ELE.** Ödeme rayları PayPal/Stripe Connect; **PayPal 2016'dan beri Türkiye'de çalışmıyor** (BDDK lisans reddi) |
| **Stripe Atlas** (ABD LLC) | **$500** kuruluş + **$100/yıl** ([stripe.com/atlas](https://stripe.com/atlas)) | Stripe Billing: işlem %2,9+30¢ **artı Billing hacminin %0,7'si** ([stripe.com/pricing](https://stripe.com/pricing)) | ✅ | ABD vergi beyanı yükü (Form 5472/1120) Stripe'ın sayfasında yazmıyor, **BULUNAMADI**. Gelir yokken yapılacak iş değil |

### 5.3 ÖNERİ

**Sağlayıcıyı şimdi seçme — arayüzü seç.** Sebep: doğru sağlayıcı alıcının
nerede olduğuna bağlı ve bu **henüz bilinmiyor** (DEVIR §4.2: hiçbir çıktı
kumaşa kesilmedi, tek bir satış yok). Sağlayıcıyı önce seçmek, satmadan önce
mimari kararı vermek olur.

Yapılacak: ödeme katmanı iki fonksiyonun arkasında dursun.

```js
// backend/payments/index.js  — sağlayıcıdan bağımsız
export async function checkoutUrl(env, { userId, packId, locale }) { … }
export async function handleWebhook(env, request, provider) {
  const raw = await request.text();              // ★ İMZA HAM GÖVDEDEN doğrulanır
  const ok  = await verifySignature(provider, raw, request.headers, env);
  if (!ok) return new Response('bad signature', { status: 400 });
  const ev  = JSON.parse(raw);
  // ★ idempotency: aynı event iki kez krediye dönemez
  const ins = await env.DB.prepare(
    'INSERT OR IGNORE INTO payment_events (provider_event_id, provider, kind, raw_json, processed_at) VALUES (?,?,?,?,?)'
  ).bind(ev.id, provider, ev.type, raw, Date.now()).run();
  if (ins.meta.changes === 0) return new Response('duplicate, ok', { status: 200 });
  await grantCredits(env, ev);                   // tek yazma noktası
  return new Response('ok', { status: 200 });
}
```

**İlk sağlayıcı: iyzico.** Gerekçe — (a) TR'de kurulu bir kişi bugün gerçekten
kullanabilir, (b) HMAC-SHA256 auth Worker'da kütüphanesiz koşar, (c) tek seferlik
kredi paketi için **abonelik eklentisinin 199 TL/ay'ını ödemeye gerek yok**.
İlk sürüm **sadece kredi paketi** satsın; abonelik, tekrarlayan gelir kanıtlanınca
eklensin (o zaman 199 TL/ay bir sorun değildir).

Alıcıların çoğunluğu TR dışı çıkarsa (İngilizce site + dikiş topluluğu ABD/İngiltere
ağırlıklı olduğu için ihtimal yüksek) **Paddle'a geçilir** — çünkü asıl mesele
komisyon değil, **AB dijital ürün KDV'si**: AB tüketicisine PDF satmak varış-ülkesi
KDV'si + OSS kaydı demektir ve bunu tek kişilik bir ürünün kendi yönetmesi hatadır.
Merchant of record bunu üstlenir. (Bu KDV yükümlülüğünün tam kapsamı **DOĞRULANMADI**;
mali müşavir sorusudur, ama sağlayıcı kararını belirleyen değişken budur.)

### 5.4 Stripe teknik notu (Atlas yolu seçilirse geçerli)

Worker'da webhook imzası: `stripe.webhooks.constructEventAsync(body, sig, secret,
undefined, Stripe.createSubtleCryptoProvider())`. Cloudflare bunu duyurdu
([blog](https://blog.cloudflare.com/announcing-stripe-support-in-workers)), resmi
örnek repo var ([stripe-samples/stripe-node-cloudflare-worker-template](https://github.com/stripe-samples/stripe-node-cloudflare-worker-template)).
Uyarı: `createSubtleCryptoProvider` **docs.stripe.com'da dokümante değil**.
Bağımlılıksız yol da tamamen mümkün ve tercih edilebilir: `Stripe-Signature`
başlığından `t=` ve `v1=` ayıkla, `t + "." + rawBody` üzerinde HMAC-SHA256,
sabit-zamanlı karşılaştır, 5 dk tolerans ([docs.stripe.com/webhooks](https://docs.stripe.com/webhooks)).
Bu ~25 satır ve `matchesSecret` (`worker.js:233`) zaten repoda.

### 5.5 İade politikası — hukuki zemin (doğrulandı)

- **Türkiye:** Mesafeli Sözleşmeler Yönetmeliği (RG 27/11/2014, 29188)
  **m.9/1** 14 gün cayma hakkı verir; **m.15/1-(ğ)** *"tüketiciye anında teslim
  edilen gayrimaddi mallara ilişkin sözleşmeler"*de cayma hakkını kaldırır.
  Anında indirilen PDF kalıp buraya girer (m.4/1-d "gayrimaddi mal" tanımı).
  **AMA şartlı:** m.5/1-(h) cayma hakkının kullanılamayacağının **ön
  bilgilendirmede** yazmasını, m.6/2 bunun "ödeme yükümlülüğü altına girmesinden
  hemen önce açık şekilde ayrıca" gösterilmesini şart koşuyor. Yani **onay
  kutusu dekoratif değil, muafiyetin şartı.**
- **AB:** 2011/83/EU m.16(m), 2019/2161 ile **üç parçalı** teste dönüştü:
  (i) açık ön onay, (ii) cayma hakkını kaybettiğinin kabulü, (iii) **m.7(2)/8(7)
  uyarınca kalıcı veri saklayıcıda teyit**. Yani **onay e-postası da testin
  parçası** ([legislation.gov.uk 2019/2161 m.4](https://www.legislation.gov.uk/eudr/2019/2161/article/4)).
- **Fiziksel giysi bu muafiyetin DIŞINDA** — 14 gün tam geçerli.

Pratik politika: dijital paket iadesi yok (yukarıdaki iki şart yerine getirilerek),
**ama motorun kendi kusuru** (kalıp kapanmıyor, dosya bozuk) durumunda kredi geri
verilir — `credit_ledger` `reason='refund'`. Bu ticari bir karar, hukuki zorunluluk
değil, ve dikiş topluluğunda itibar bundan yürür.

### 5.6 Fiziksel giysi = **ayrı akış, ayrı tablo, ayrı hukuk**

Kredi defterine **asla** bağlanmaz. Gerekçeler:
- 14 günlük cayma hakkı tam geçerli → iade/kargo/stok akışı gerekir.
- Teslimat adresi = yeni kişisel veri sınıfı (KVKK açısından ayrı aydınlatma).
- ETBİS kaydı, mesafeli satış sözleşmesi, kargo süresi taahhüdü.
- DEVIR §7.5: fiziksel satılan model **Damla'nın kendi tasarımı** olacak; yani
  kullanıcının gardırobundan çıkan bir şey değil, **katalog ürünü**.

Şema ayrı: `products` (Damla'nın tasarımları, beden, stok) + `orders`
(adres, kargo, durum). `wardrobe_items` ile ilişkisi **yok**.
Bu, planın **en son** adımı; öncesinde bir toile bile dikilmemiş durumda (DEVIR §4.2).

---

## 6. GÖÇ YOLU — 9 adım, her biri tek başına sevk edilebilir

Kural: hiçbir adım bir sonrakini beklemez, her adım canlıya çıkabilir,
her adımın kanıtı **koşulabilir bir komut**.

**Adım 0 — Motor damgasını çalışma zamanına çıkar.** (½ gün)
`engine/build-wasm.sh` `stamp.gen.js` üretsin; `web/js/engine.js` ve
`backend/draft.js` import etsin; `/api/version` uçu dönsün.
*Kabul:* `curl .../api/version` bugünkü `24d4ca4e4f850140`'ı döner **ve**
`head -1 web/vendor/stitchu-engine.js` ile birebir aynıdır. `bundle_fresh_check` yeşil.

**Adım 1 — D1 + şema, hiçbir davranış değişmeden.** (1 gün)
`wrangler d1 create stitchu`, migration dosyası, binding. Kod hiçbir yerde
D1'i okumaz henüz.
*Kabul:* `wrangler d1 execute stitchu --command "SELECT name FROM sqlite_master"`
tabloları listeler; canlı sitenin davranışı **bayt-aynı** (deploy kanıt zinciri yeşil).

**Adım 2 — Auth (kod ile giriş), hiçbir kapı arkasında hiçbir şey yok.** (2 gün)
`/api/auth/{start,verify,refresh,logout,me}` + Resend. Site "Giriş yap" gösterir,
ama giriş yapmak henüz bir şey açmaz.
*Kabul:* iki tarayıcıda kayıt → `SELECT count(*) FROM users` = 2;
yanlış kod 5 kez → 429 ve KV kaydı silinmiş; `sessions.token_sha` tablosunda
düz token **hiç geçmiyor** (`grep`'le kanıt). Turnstile'siz istek 403.

**Adım 3 — Gardırop okuma/yazma, kota YOK.** (2 gün)
`/api/wardrobe` CRUD + `/api/wardrobe/import`. `closet.js:31`'deki `loadCloset()`
API'ye bağlanır, çıkışta localStorage'a geri düşer.
*Kabul:* A cihazında kaydet → B cihazında aynı hesapla aç → **aynı `dugum`**.
Anonim demoda 3 kayıt üret, hesap aç, import et → 3'ü de gardıropta, `origin='import'`.

**Adım 4 — `/api/pack`: paket sunucudan, ama kredi HÂLÂ düşmüyor.** (2-3 gün)
Worker `backend/draft.js` motoruyla A4/A0/DXF/SVG üretir, R2'ye yazar,
`deliveries` satırı açar. İstemci indirici sunucudan gelen baytı yazar.
*Kabul:* Sunucudan inen A4 PDF'in sha256'sı, aynı spec için istemcinin ürettiğiyle
**birebir aynı** (`engine/tests/indir_check.mjs` zaten pure builder'ları koşuyor —
kapı buna genişletilir). Blocked draft (`issues` dolu) → 422, dosya yazılmaz.

**Adım 5 — KOTA. Hak sayacı devreye girer.** (1 gün)
Atomik `UPDATE ... WHERE credits > 0`, `credit_ledger` yazımı, 402 cevabı.
İstemcideki PDF/DXF üreticileri sevk edilen paketten çıkarılır.
*Kabul:* Yeni hesap → 3. paket denemesi **402**, `SELECT SUM(delta)` = 0.
**Paralel kanıt:** 2 kredili hesaba aynı anda 10 istek (`xargs -P10 curl`) →
tam **2** delivery satırı, 8 tanesi 402. (KV ile bu test kırmızı olurdu; D1 kararının
kanıtı budur.) `grep -r "makePdfCore\|dxfSpec" web/js/create.js` → 0 satır.

**Adım 6 — Ödeme: kredi paketi (iyzico).** (3 gün)
Checkout + webhook + `grantCredits`. Yalnız tek seferlik paket; abonelik yok.
Yasal metinler yayında: cayma hakkı istisnası (m.15/1-ğ) ödeme butonunun
**hemen üstünde**, onay e-postası kalıcı teyit olarak.
*Kabul:* Sandbox ödeme → kredi arttı. **Aynı webhook 3 kez POST edildiğinde
kredi bir kez artar** (`payment_events` UNIQUE kanıtı). Bozuk imzalı webhook → 400,
`payment_events`'te satır yok. Ödeme sayfasının HTML'inde cayma metni geçiyor.

**Adım 7 — Abonelik.** (2 gün, gelir kanıtlandıktan sonra)
`plan`, `plan_until`, yenilemede kredi tazeleme, iptal.
*Kabul:* Yenileme webhook'u → `plan_until` ileri gitti, ledger'da `sub_renew`.
Süresi geçmiş abonelik → `plan='free'`, paket 402.

**Adım 8 — Fiziksel satış.** (ayrı proje, toile dikildikten sonra)
*Kabul:* DEVIR §4.2 kalkmadan bu adım **başlamaz**.

**Sıra notu:** DEVIR §7.5'in önerdiği sıra (hesap → gardırop → ödeme → SEO →
fiziksel) korunuyor. Tek fark, **Adım 0 ve Adım 4'ün öne alınması**: motor
damgası ve sunucu-taraflı paket, kotanın ve gardırobun **ön şartı**; sonradan
eklenirse ikisi de yeniden yazılır.

Programatik SEO bu plana bilerek girmedi: `gen-sitemap.mjs` / `site-health.mjs`
boru hattı ondan bağımsız ve bu katmana hiç dokunmuyor. Paralel yürütülebilir.

---

## 7. RİSKLER, MALİYETLER, GERİ DÖNÜŞLER

| Karar | Maliyet | Yanlışsa geri dönüş | Risk |
|---|---|---|---|
| Kendi auth'umuz | ~2 gün + süregelen güvenlik sorumluluğu | **Kolay**: user tablosu bizde kalır, Clerk `provider_user_id` kolonuyla üstüne biner | Oturum/rotasyon hatası. Azaltıcı: parola yok, kod TTL'li, refresh token'ın yalnız hash'i saklanıyor |
| D1 birincil depo | 1 gün şema | **Kolay**: SQLite dışa aktarılır | D1 bölge seçimi **tek seferlik** — AB müşterisi olacaksa baştan `weur` |
| Paket sunucudan | 2-3 gün + Worker CPU | **Orta**: istemci üreticileri git geçmişinde | Worker CPU limiti. `draftJSON` 3-12 ms; PDF yazımı ölçülmedi — **Adım 4'te ölç**, 30M CPU-ms/ay dahil |
| Kredi sayacı D1'de | ½ gün | — | Yok. KV'de olsa yarış = bedava paket |
| Teslimatı R2'de dondurma | ½ gün, ~$0,05/ay/1000 paket | **Kolay**: silinir | Yok. Motor sürüm probleminin **tek** dürüst çözümü |
| iyzico ilk sağlayıcı | 3 gün | **Kolay** — soyut arayüz sayesinde | Komisyon %4,29; AB KDV'si Damla'da kalır |
| Stripe Atlas | **$500 + $100/yıl + ABD beyanı** | **ZOR, pahalı** | Gelir yokken **yapma** |

### Fazla mühendislik tuzakları — açıkça

1. **Eski motor sürümlerini saklamak.** Yapma. R2'de donmuş teslimat baytı bunu
   çözüyor ve iş yükü sıfıra yakın (§4.4).
2. **Baştan üç katmanlı anti-fraud.** Yapma. Önce `signup_ip`/`signup_asn`
   kolonunu koy ve **ölç**; §3.5'teki %5 bandının altındaysa dokunma.
3. **Kendi ödeme soyutlamanı 5 sağlayıcıya genellemek.** İki fonksiyon yeter:
   `checkoutUrl` + `handleWebhook`. Üçüncü sağlayıcı geldiğinde genelleştir.
4. **JS'i obfuscate edip paketi "korumak".** Kaybedilen zaman, kazanılan sıfır.
5. **Stripe Atlas'ı satış öncesi kurmak.** $500 + yıllık ABD beyanı, sıfır gelirle.
6. **Abonelik'i krediyle aynı anda kurmak.** iyzico abonelik eklentisi 199 TL/ay;
   tekrar eden gelir kanıtlanmadan gider.
7. **Gardırop için ayrı bir "sürüm geçmişi" motoru yazmak.** `parent_id` zinciri
   + `dugum` yeter; edit motoru zaten bölgesel ve deterministik.
8. **Anonim demoda kredi/oturum yönetmek.** Anonim = kimliksiz, IP throttle yeter
   (`worker.js:114-117` zaten var).

### Ölçülmemiş / doğrulanmamış — bunlara güvenerek karar verme

- Worker'da PDF üretiminin CPU süresi **ölçülmedi**. 30M CPU-ms/ay dahil ama
  bir A0 PDF'in kaç ms sürdüğü bilinmiyor. Adım 4'ün ilk işi bu ölçüm.
- `web/vendor/stitchu-engine.js` (SINGLE_FILE, base64 gömülü wasm) ile
  `backend/engine/stitchu-worker.wasm`'ın **çıktı eşitliği doğrudan ölçülmedi**;
  aynı kaynaktan ve aynı damgayla derleniyorlar (`build-wasm.sh:160,193`) ve
  `dxf_wasm_parity` kapısı var, ama "tarayıcı PDF'i = sunucu PDF'i" iddiası
  Adım 4'ün kabul kriteriyle **ilk kez** ölçülecek.
- iyzico'nun kendi sayfası %4,29 diyor; bloglar %1,95 yazıyor. Birincil kaynak
  %4,29. Dışarıya sayı söylenecekse %4,29 denir.
- PayTR'ın REST API'sinin Worker uyumu **DOĞRULANMADI**.
- Paddle'ın "software businesses" ifadesinin dikiş kalıbını kapsayıp kapsamadığı
  **DOĞRULANMADI**.
- Lemon Squeezy'nin Türk satıcı kabulü **BULUNAMADI** (destek sayfası 403).
- KVKK VERBİS kayıt eşiği bu ölçekte doğuyor mu **DOĞRULANMADI**.
- AB dijital ürün KDV/OSS yükümlülüğünün tam kapsamı **DOĞRULANMADI** — ama
  sağlayıcı kararını belirleyen ana değişken bu; mali müşavire sorulmalı.
- Apple App Store 4.8 ("Sign in with Apple" zorunluluğu) e-posta-kod tabanlı
  girişi tetikliyor mu **DOĞRULANMADI**. Üçüncü taraf giriş (Google/Facebook)
  eklenmediği sürece tetiklememesi bekleniyor, ama Xcode projesi açılmadan
  bunu doğrulamanın anlamı yok.

---

## 8. TEK PARAGRAF ÖZET

Bugünkü mimari platform katmanını **ucuza** kaldırabiliyor, çünkü üç kritik parça
zaten yerinde: motor Worker içinde koşuyor (`backend/draft.js`), çıktının
parmak izi hesaplanıyor (`patternDugum`), ve motorun sürüm damgası deterministik
olarak üretiliyor (`build-wasm.sh:28`). Eksik olan tek yapısal şey, **satılan
nesnenin sunucuya uğramaması**: bugün tarayıcı her şeyi kendi yapıyor, o yüzden
sayılacak bir olay yok. Plan bunu tek bir yerde çözüyor — önizleme yerel ve
bedava kalır, indirilebilir paket `/api/pack`'ten çıkar, kredi orada D1'de atomik
düşer. Kimlik için kendi parolasız auth'umuz (D1+KV, e-posta kodu) öneriliyor;
çünkü kullanıcı tablosu hangi seçenekte olursa olsun D1'de duracak ve parolasız
tasarım yazılacak güvenlik kodunu ~150 satıra indiriyor. Ödeme sağlayıcısı
**şimdi seçilmiyor** — Stripe TR'de yok (doğrulandı), doğru alternatif alıcının
nerede olduğuna bağlı ve henüz tek satış yok; onun yerine iki fonksiyonluk bir
arayüz kuruluyor ve ilk sağlayıcı olarak iyzico (Worker'da kütüphanesiz koşan
HMAC auth) bağlanıyor. Motor sürüm sorununun cevabı eski binary'leri saklamak
değil, **satın alınan baytı R2'de dondurmak** ve gardıroptaki spec'i canlı
tutmak; ikisi arasındaki farkı `dugum` karşılaştırması ilan ediyor.
