// solver_utils.cpp — iteratif yay-kutle gevsetmesi (0509 A2a). Basligi solver_utils.hpp okur.
//
// BIR ITERASYON (sirasi ONEMLI, dikte edilen algoritma):
//   1. YUMUSAK: her yumusak hedef bir yay kuvveti uretir; kuvvetler toplanir, adimBoyu ile
//      olceklenip uygulanir. (Birakilmis hedefler kuvvet uretmez.)
//   2. SERT PROJEKSIYON: sert uzunluk kisitlari ve kapaliliklar Gauss-Seidel tarzi sirayla
//      projekte edilir (her kisit kendi iki dugumunu hedefe tam oturtur; sabit dugum oynamaz).
//      Bir projeksiyon turu obur kisiti bozabildigi icin tur icinde icProjeksiyon (contract) kez
//      tekrarlanir — bu yakinsamayi hizlandirir, esik gevsetmez.
//   3. OLCEK PROJEKSIYONU (olcekKisiti ise): sinir kutusu yuksekligi [olcekMin, olcekMax]
//      disinda ise butun serbest dugumler merkez etrafinda araliga geri OLCEKLENIR. Bu SERT bir
//      kisittir: cozucu olcegi bozup dikisi kapatamaz.
//   4. YAKINSAMA: en buyuk sert artik yakinsamaMM altina indiyse OK.
//
// DURUS: maxIter dolduysa ya da sureTavaniMS gectiyse yumusak hedefler ADIYLA birakilir ve
// son bir sert projeksiyon turu kosulur. Bundan sonra sert artik hala yakinsamaMM ustunde ise
// ERR_UNSOLVABLE (+ en yakin cozum + gevsetilmesi gereken kisit).
#include "solver_utils.hpp"

#include <chrono>
#include <cmath>
#include <cstdio>
#include <string>
#include <vector>

#include "graf.hpp"

namespace stitchu {
namespace solver {

using graf::JVal;

namespace {
// Sert projeksiyonun bir iterasyonda kac kez tekrarlandigi ARTIK KODDA DEGIL: A2c/KARAR 3 ile
// contract/graf-v1.json cozucu.gevsetme.icProjeksiyon'a tasindi ve SolverCtx.icProjeksiyon
// alanindan okunur. Kodda olcu/arama sabiti kalmadi.

bool sonlu(double v) { return std::isfinite(v); }
bool sonlu(const Point& p) { return sonlu(p.x) && sonlu(p.y); }

double uzaklik(const Point& a, const Point& b) {
    const double dx = a.x - b.x, dy = a.y - b.y;
    return std::sqrt(dx * dx + dy * dy);
}

// Sozlesmeden {"deger": n} okur. Alan yoksa / sayi degilse / NaN ise false ve hata ADIYLA.
bool degerOku(const JVal* blok, const char* ad, double& out, std::string& hata) {
    if (!blok || !blok->isObj()) { hata = std::string("cozucu.gevsetme.") + ad + ": blok yok"; return false; }
    const JVal* alan = blok->get(ad);
    if (!alan) { hata = std::string("cozucu.gevsetme.") + ad + ": alan yok"; return false; }
    const JVal* d = alan->isObj() ? alan->get("deger") : alan;
    if (!d || !d->isNum() || !sonlu(d->n)) { hata = std::string("cozucu.gevsetme.") + ad + ": sayi degil"; return false; }
    out = d->n;
    return true;
}

// Iki dugumu hedef uzakliga TAM oturtur (sert projeksiyon). Sabit dugum oynamaz; ikisi de
// sabitse kisit projekte EDILEMEZ ve artik oldugu gibi kalir (ERR_UNSOLVABLE'a dusen yol).
void projekteUzunluk(std::vector<Point>& P, const std::vector<Dugum>& D,
                     std::size_t i, std::size_t j, double hedefMM) {
    const bool si = D[i].sabit, sj = D[j].sabit;
    if (si && sj) return;
    double dx = P[j].x - P[i].x, dy = P[j].y - P[i].y;
    double d = std::sqrt(dx * dx + dy * dy);
    if (d < 1e-9) {
        // Dugumler CAKISIK: yon vektoru yok. hedef 0 ise kisit zaten saglandi (kapalilik),
        // dokunma. Hedef > 0 ise ayirmak icin deterministik bir yon sec (+x): rastgele yon
        // determinizmi bozardi.
        if (hedefMM <= 0.0) return;
        dx = 1.0; dy = 0.0; d = 1e-9;
    }
    const double fark = d - hedefMM;
    const double ux = dx / d, uy = dy / d;
    if (si) {          // yalniz j oynar
        P[j].x -= fark * ux; P[j].y -= fark * uy;
    } else if (sj) {   // yalniz i oynar
        P[i].x += fark * ux; P[i].y += fark * uy;
    } else {           // ikisi de yariyi alir
        const double h = fark * 0.5;
        P[i].x += h * ux; P[i].y += h * uy;
        P[j].x -= h * ux; P[j].y -= h * uy;
    }
}

// Halkanin ilk ve son dugumunu cakistirir (kapalilik).
void projekteKapalilik(std::vector<Point>& P, const std::vector<Dugum>& D, const SertKapalilik& k) {
    const std::size_t i = k.halka.front(), j = k.halka.back();
    if (i == j) return;
    projekteUzunluk(P, D, i, j, 0.0);
}

double sertArtik(const std::vector<Point>& P, const Problem& pr, std::string& enKotuAd) {
    double enBuyuk = 0.0;
    enKotuAd.clear();
    for (const SertUzunluk& s : pr.sertUzunluklar) {
        const double artik = std::fabs(uzaklik(P[s.i], P[s.j]) - s.hedefMM);
        if (artik > enBuyuk) { enBuyuk = artik; enKotuAd = s.ad; }
    }
    for (const SertKapalilik& k : pr.sertKapaliliklar) {
        const std::size_t i = k.halka.front(), j = k.halka.back();
        if (i == j) continue;
        const double artik = uzaklik(P[i], P[j]);
        if (artik > enBuyuk) { enBuyuk = artik; enKotuAd = k.ad; }
    }
    return enBuyuk;
}

// Sinir kutusu yuksekligi araligin disinda ise butun SERBEST dugumleri merkez etrafinda
// araliga olcekler. true = olcek duzeltildi (bir sey degisti).
bool projekteOlcek(std::vector<Point>& P, const std::vector<Dugum>& D, const SolverCtx& ctx) {
    if (P.empty()) return false;
    double yMin = P[0].y, yMax = P[0].y;
    for (const Point& p : P) { if (p.y < yMin) yMin = p.y; if (p.y > yMax) yMax = p.y; }
    const double h = yMax - yMin;
    if (h >= ctx.olcekMinMM && h <= ctx.olcekMaxMM) return false;
    if (h < 1e-9) return false;                       // sifir yukseklik olceklenemez
    const double hedef = (h < ctx.olcekMinMM) ? ctx.olcekMinMM : ctx.olcekMaxMM;
    const double k = hedef / h;
    double cx = 0, cy = 0;
    for (const Point& p : P) { cx += p.x; cy += p.y; }
    cx /= static_cast<double>(P.size()); cy /= static_cast<double>(P.size());
    for (std::size_t n = 0; n < P.size(); ++n) {
        if (D[n].sabit) continue;
        P[n].x = cx + (P[n].x - cx) * k;
        P[n].y = cy + (P[n].y - cy) * k;
    }
    return true;
}

void sertTur(std::vector<Point>& P, const Problem& pr, const SolverCtx& ctx) {
    for (int t = 0; t < ctx.icProjeksiyon; ++t) {
        for (const SertUzunluk& s : pr.sertUzunluklar) projekteUzunluk(P, pr.dugumler, s.i, s.j, s.hedefMM);
        for (const SertKapalilik& k : pr.sertKapaliliklar) projekteKapalilik(P, pr.dugumler, k);
    }
    if (pr.olcekKisiti) projekteOlcek(P, pr.dugumler, ctx);
}
}  // namespace

const char* durumAdi(Durum d) {
    switch (d) {
        case Durum::OK: return "OK";
        case Durum::YUMUSAK_BIRAKILDI: return "YUMUSAK_BIRAKILDI";
        case Durum::ERR_UNSOLVABLE: return "ERR_UNSOLVABLE";
        case Durum::ERR_SOLVER_NO_CONTRACT: return "ERR_SOLVER_NO_CONTRACT";
        case Durum::ERR_PROBLEM_BOZUK: return "ERR_PROBLEM_BOZUK";
    }
    return "BILINMEYEN";
}

SolverCtx SolverCtx::fromContract(const JVal& grafContract, const JVal& bodyContract, std::string& hata) {
    SolverCtx c;
    hata.clear();
    const JVal* cz = grafContract.get("cozucu");
    const JVal* gv = cz ? cz->get("gevsetme") : nullptr;
    double maxIter = 0;
    if (!degerOku(gv, "maxIter", maxIter, hata)) return c;
    if (!degerOku(gv, "sureTavaniMS", c.sureTavaniMS, hata)) return c;
    if (!degerOku(gv, "adimBoyu", c.adimBoyu, hata)) return c;
    if (!degerOku(gv, "yakinsamaMM", c.yakinsamaMM, hata)) return c;
    double icProj = 0;
    if (!degerOku(gv, "icProjeksiyon", icProj, hata)) return c;
    if (!(icProj >= 1.0)) { hata = "cozucu.gevsetme.icProjeksiyon < 1"; return c; }
    c.icProjeksiyon = static_cast<int>(icProj);
    if (maxIter < 1) { hata = "cozucu.gevsetme.maxIter < 1"; return c; }
    if (!(c.adimBoyu > 0.0 && c.adimBoyu <= 1.0)) { hata = "cozucu.gevsetme.adimBoyu araligi (0,1] disinda"; return c; }
    if (!(c.sureTavaniMS > 0.0)) { hata = "cozucu.gevsetme.sureTavaniMS <= 0"; return c; }
    if (!(c.yakinsamaMM > 0.0)) { hata = "cozucu.gevsetme.yakinsamaMM <= 0"; return c; }
    c.maxIter = static_cast<int>(maxIter);

    // MUTLAK INSAN OLCEGI: body-v1 olcekAraligi.giysiYuksekligiMM {min, max}
    const JVal* oa = bodyContract.get("olcekAraligi");
    const JVal* gy = oa ? oa->get("giysiYuksekligiMM") : nullptr;
    const JVal* mn = gy ? gy->get("min") : nullptr;
    const JVal* mx = gy ? gy->get("max") : nullptr;
    if (!mn || !mn->isNum() || !mx || !mx->isNum() || !sonlu(mn->n) || !sonlu(mx->n)) {
        hata = "body-v1 olcekAraligi.giysiYuksekligiMM {min,max} okunamadi";
        return c;
    }
    c.olcekMinMM = mn->n;
    c.olcekMaxMM = mx->n;
    if (!(c.olcekMinMM > 0.0 && c.olcekMaxMM > c.olcekMinMM)) { hata = "olcekAraligi.giysiYuksekligiMM araligi bozuk"; return c; }
    c.dolu = true;
    return c;
}

Sonuc coz(const Problem& pr, const SolverCtx& ctx) {
    Sonuc R;
    if (!ctx.dolu) {
        R.durum = Durum::ERR_SOLVER_NO_CONTRACT;
        R.hata = "cozucu sozlesmesi yuklenmedi (contract/graf-v1.json cozucu.gevsetme + body-v1 olcekAraligi)";
        return R;
    }
    const std::size_t n = pr.dugumler.size();
    if (n == 0) { R.durum = Durum::ERR_PROBLEM_BOZUK; R.hata = "dugum yok"; return R; }

    // --- girdi denetimi: indis tasmasi, NaN, bos halka, negatif hedef -> ADIYLA ret
    for (std::size_t i = 0; i < n; ++i) {
        if (!sonlu(pr.dugumler[i].p)) { R.durum = Durum::ERR_PROBLEM_BOZUK; R.hata = "dugum NaN/Inf: " + pr.dugumler[i].ad; return R; }
    }
    for (const SertUzunluk& s : pr.sertUzunluklar) {
        if (s.i >= n || s.j >= n) { R.durum = Durum::ERR_PROBLEM_BOZUK; R.hata = "sert kisit indis tasmasi: " + s.ad; return R; }
        if (!sonlu(s.hedefMM) || s.hedefMM < 0.0) { R.durum = Durum::ERR_PROBLEM_BOZUK; R.hata = "sert kisit hedefi gecersiz: " + s.ad; return R; }
    }
    for (const SertKapalilik& k : pr.sertKapaliliklar) {
        if (k.halka.size() < 2) { R.durum = Durum::ERR_PROBLEM_BOZUK; R.hata = "kapalilik halkasi < 2 dugum: " + k.ad; return R; }
        for (std::size_t idx : k.halka) if (idx >= n) { R.durum = Durum::ERR_PROBLEM_BOZUK; R.hata = "kapalilik indis tasmasi: " + k.ad; return R; }
    }
    for (const YumusakHedef& y : pr.yumusakHedefler) {
        if (y.i >= n || y.j >= n) { R.durum = Durum::ERR_PROBLEM_BOZUK; R.hata = "yumusak hedef indis tasmasi: " + y.ad; return R; }
        if (!sonlu(y.hedefMM) || y.hedefMM < 0.0 || !(y.agirlik > 0.0)) { R.durum = Durum::ERR_PROBLEM_BOZUK; R.hata = "yumusak hedef gecersiz: " + y.ad; return R; }
    }

    std::vector<Point> P(n);
    for (std::size_t i = 0; i < n; ++i) P[i] = pr.dugumler[i].p;

    const auto t0 = std::chrono::steady_clock::now();
    auto gecenMS = [&t0]() {
        return std::chrono::duration<double, std::milli>(std::chrono::steady_clock::now() - t0).count();
    };

    bool yumusakBirakildi = false;
    // Yakinsama enum KARSILASTIRMASIYLA degil bool ile tasinir: durum kodu bir cikti
    // etiketidir, akis degiskeni degil (enum dallanma circiri, engine/tests/enum_dallanma_check.sh).
    bool yakinsadi = false;
    int it = 0;
    for (; it < ctx.maxIter; ++it) {
        // 1. YUMUSAK: yay kuvvetleri (birakilmadiysa)
        if (!yumusakBirakildi && !pr.yumusakHedefler.empty()) {
            std::vector<Point> kuvvet(n, Point{0.0, 0.0});
            for (const YumusakHedef& y : pr.yumusakHedefler) {
                double dx = P[y.j].x - P[y.i].x, dy = P[y.j].y - P[y.i].y;
                double d = std::sqrt(dx * dx + dy * dy);
                if (d < 1e-9) continue;
                const double fark = d - y.hedefMM;
                const double ux = dx / d * fark * y.agirlik * 0.5, uy = dy / d * fark * y.agirlik * 0.5;
                kuvvet[y.i].x += ux; kuvvet[y.i].y += uy;
                kuvvet[y.j].x -= ux; kuvvet[y.j].y -= uy;
            }
            for (std::size_t i = 0; i < n; ++i) {
                if (pr.dugumler[i].sabit) continue;
                P[i].x += ctx.adimBoyu * kuvvet[i].x;
                P[i].y += ctx.adimBoyu * kuvvet[i].y;
            }
        }
        // 2-3. SERT projeksiyon (+ olcek)
        sertTur(P, pr, ctx);

        // 4. yakinsama
        std::string enKotu;
        const double artik = sertArtik(P, pr, enKotu);
        if (artik <= ctx.yakinsamaMM) {
            yakinsadi = true;
            R.durum = Durum::OK;
            R.enBuyukSertArtikMM = artik;
            R.enKotuSertKisit = enKotu;
            break;
        }
        // sure tavani: ASLA ASILI KALMAZ
        if (gecenMS() >= ctx.sureTavaniMS) { ++it; break; }
    }

    // --- tavan dolduysa: yumusak hedefleri BIRAK, sert kisitlari son bir turla koru
    if (!yakinsadi) {
        yumusakBirakildi = true;
        for (const YumusakHedef& y : pr.yumusakHedefler) R.birakilanHedefler.push_back(y.ad);
        // sert kisitlarin kendi butcesi: yumusak kuvvet olmadan tekrar projekte et.
        // Ayni iki tavan gecerlidir (asili kalma yok).
        for (int k = 0; k < ctx.maxIter && gecenMS() < ctx.sureTavaniMS; ++k) {
            sertTur(P, pr, ctx);
            std::string enKotu;
            if (sertArtik(P, pr, enKotu) <= ctx.yakinsamaMM) break;
        }
        std::string enKotu;
        const double artik = sertArtik(P, pr, enKotu);
        R.enBuyukSertArtikMM = artik;
        R.enKotuSertKisit = enKotu;
        const bool yumusakVardi = !pr.yumusakHedefler.empty();
        if (artik <= ctx.yakinsamaMM) {
            R.durum = yumusakVardi ? Durum::YUMUSAK_BIRAKILDI : Durum::OK;
            if (yumusakVardi) {
                R.hata = "tavan doldu, yumusak hedefler birakildi; sert kisitlar saglandi";
            } else {
                R.birakilanHedefler.clear();
            }
        } else {
            R.durum = Durum::ERR_UNSOLVABLE;
            R.gevsetilmesiGereken = enKotu;
            char buf[96];
            std::snprintf(buf, sizeof buf, "%.4f", artik);
            R.hata = "sert kisitlar saglanamadi (en kotu artik " + std::string(buf) + " mm): " + enKotu +
                     " — bu kisit gevsetilmeli; olcek siniri (body-v1 olcekAraligi) SERT ve gevsetilmez";
        }
    }

    R.iterasyon = it;
    R.sureMS = gecenMS();
    R.noktalar = P;   // her durumda EN YAKIN COZUM
    return R;
}

}  // namespace solver
}  // namespace stitchu
