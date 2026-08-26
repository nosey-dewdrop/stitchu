#include "seamplan.hpp"

#include <cmath>
#include <cstdio>
#include <sstream>
#include <stdexcept>

#include "constants.gen.hpp"
#include "shellprojection.hpp"
#include "sizechart.hpp"

namespace stitchu {
namespace {

// ASSUMPTION, and the same one tools/surface-pattern.cpp and tools/shell-flat.cpp
// already carry. Named here rather than re-typed silently.
constexpr double kStatureMM = 1680.0;
constexpr double kCapMM = 60.0;

std::string num(double v, int dp = 4) {
    char buf[64];
    std::snprintf(buf, sizeof buf, "%.*f", dp, v);
    // -0.0000 and 0.0000 are the same number; printing two spellings of it puts
    // a false difference into every byte-comparison downstream.
    std::string s(buf);
    if (s.find_first_not_of("-0.") == std::string::npos) {
        for (char& c : s)
            if (c == '-') c = ' ';
        std::string t;
        for (char c : s)
            if (c != ' ') t += c;
        return t;
    }
    return s;
}

std::string quote(const std::string& s) {
    std::string out = "\"";
    for (char c : s) {
        if (c == '"' || c == '\\') out += '\\';
        out += c;
    }
    return out + "\"";
}

// FNV-1a over the plan's defining numbers. Not a security hash and not claimed
// to be one: it is an identity token for "these two outputs came out of one
// object", and a 64-bit collision on numbers this file itself formats is not a
// failure mode anybody can reach by editing a spec.
void mix(unsigned long long& h, const std::string& s) {
    for (unsigned char c : s) {
        h ^= c;
        h *= 1099511628211ULL;
    }
}

}  // namespace

// THE DRAWN SILHOUETTE, FOLDED INTO THE IDENTITY (GECE7 / F5-A, K24).
//
// MEASURED GAP, and it was the referee's mutation HM-F2, not a suspicion:
// shellprojection.cpp's `projectBack` was replaced by `projectFront` (the back
// technical drawing became literally the front one). The binary really moved
// (2ccf4bc7… -> 60ea1cde…, so this is not the stale-binary trap) and yet the
// node id did NOT move at all: it stayed 3f3869aaee8b56b1. The reason is in the
// two loops below — they hash the SHELL (rings) and the SOLVED TOP BOUNDARY,
// and the silhouette is neither. It is a THIRD thing: an orthographic
// projection of the shell, computed in another translation unit, and the flat
// SVG that ships to the user is drawn out of it.
//
// So `data-dugum` on the downloaded file said "this flat came out of this
// object" while binding none of the lines actually drawn on it. That sentence
// is now a measurement: every point of both projected half-contours, and every
// published measure of both views, goes into the token. A change to the drawn
// silhouette that leaves rings and top boundary alone — which is exactly what
// HM-F2 is — now moves the id.
//
// COST, measured rather than assumed: two projections per nodeId() call at the
// 4mm display step, i.e. the same work flatJSON already does once. H11 is
// gated at <10s and reads in milliseconds; this is not near it.
static void mixProjection(unsigned long long& h, const ShellProjection& p) {
    // The view flag itself: front and back differ by a mirror, and a back view
    // that forgot it was a back view is precisely HM-F2.
    mix(h, p.front ? "on" : "arka");
    for (const Vec2& v : p.outline) mix(h, num(v.x, 6) + "," + num(v.y, 6));
    for (const ShellMeasure& m : p.measures)
        mix(h, m.name + "@" + m.ring + "=" + num(m.mm, 6));
}

std::string SeamPlan::nodeId() const {
    unsigned long long h = 14695981039346656037ULL;
    mix(h, size);
    mix(h, sinif);
    // the shell: every ring, every dial that shapes it
    for (const GarmentSurf::Ring& r : pattern.surf.rings) {
        mix(h, r.name);
        mix(h, num(r.h, 6) + "," + num(r.a, 6) + "," + num(r.bm, 6) + "," +
                   num(r.bd, 6) + "," + num(r.d, 6));
    }
    mix(h, num(pattern.surf.blendMM, 6) + "," + num(pattern.surf.skimTopH, 6) + "," +
               num(pattern.surf.skimBaseH, 6) + "," + num(pattern.surf.hemH, 6) + "," +
               num(pattern.surf.hemScale, 6));
    // the solved top boundary: BOTH coordinates, because half a curve is not
    // an identity — x alone is unchanged by a neck drop (measured).
    for (size_t j = 0; j < pattern.topColXMM.size(); ++j)
        mix(h, num(pattern.topColXMM[j], 6) + ";" +
                   num(j < pattern.topColZMM.size() ? pattern.topColZMM[j] : 0.0, 6));
    // the DRAWN silhouette, both views (K24 — see mixProjection above)
    mixProjection(h, projectFront(pattern));
    mixProjection(h, projectBack(pattern));
    char buf[32];
    std::snprintf(buf, sizeof buf, "%016llx", h);
    return buf;
}

SeamPlan buildSeamPlan(const std::string& sizeLabel, const SheathOptions& opt) {
    const SizeChartEntry* entry = euSize(sizeLabel);
    if (!entry)
        throw std::invalid_argument("unknown size: " + sizeLabel);
    const BodySurface body(entry->body, kStatureMM, kCapMM);
    SeamPlan plan;
    plan.size = sizeLabel;
    plan.opt = opt;
    // ONE build. Everything either reading needs is downstream of this line.
    plan.pattern = buildSheathPattern(body, opt);
    return plan;
}

// ---------------------------------------------------------------------------
// KALIP — human body, real seam allowance
// ---------------------------------------------------------------------------
std::string planJSON(const SeamPlan& plan) {
    const SurfacePattern& pat = plan.pattern;
    std::ostringstream o;
    o << "{\n";
    o << "  \"okuma\": \"kalip\",\n";
    o << "  \"dugum\": " << quote(plan.nodeId()) << ",\n";
    o << "  \"beden\": " << quote(plan.size) << ",\n";
    o << "  \"sinif\": {\"garment\": " << quote(plan.garment())
      << ", \"shaping\": " << quote(plan.shaping())
      << ", \"fabric\": " << quote(plan.fabric()) << "},\n";
    // THE DECLARED TRANSFORM (§2). Stated in the output, not in a comment
    // somewhere, because a transform nobody can read is not declared.
    o << "  \"bedenlendirme\": {\n";
    o << "    \"beden_kaynagi\": \"insan — contract/tables.json draft.euSizeChart\",\n";
    o << "    \"dikis_payi_mm\": " << num(constants::kSeamAllowanceMM, 1) << ",\n";
    o << "    \"cizgi\": \"kesim (dikis cizgisi + pay)\"\n";
    o << "  },\n";
    o << "  \"halka_cevresi_mm\": " << num(pat.ringGirthMM) << ",\n";
    o << "  \"bodice_bel_mm\": " << num(pat.bodiceWaistSumMM) << ",\n";
    o << "  \"etek_bel_mm\": " << num(pat.skirtWaistSumMM) << ",\n";
    o << "  \"arka_acikligi_mm\": " << num(pat.backOpeningMM) << ",\n";
    o << "  \"omuz_tasima_mm\": " << num(pat.shoulderCarryMM) << ",\n";
    o << "  \"paneller\": [\n";
    for (size_t i = 0; i < pat.panels.size(); ++i) {
        const SurfacePanel& p = pat.panels[i];
        double per = 0.0, x0 = 1e18, x1 = -1e18, y0 = 1e18, y1 = -1e18;
        for (size_t k = 0; k < p.contour.size(); ++k) {
            const Vec2& a = p.contour[k];
            const Vec2& b = p.contour[(k + 1) % p.contour.size()];
            per += std::hypot(b.x - a.x, b.y - a.y);
            x0 = std::min(x0, a.x); x1 = std::max(x1, a.x);
            y0 = std::min(y0, a.y); y1 = std::max(y1, a.y);
        }
        o << "    {\"ad\": " << quote(p.name) << ", \"nokta\": " << p.contour.size()
          << ", \"cevre_mm\": " << num(per) << ", \"bel_mm\": " << num(p.waistLenMM)
          << ", \"pens\": " << p.darts.size()
          << ", \"kutu\": [" << num(x0) << ", " << num(x1) << ", " << num(y0)
          << ", " << num(y1) << "]"
          << ", \"kontur_gerinim_yuzde\": " << num(p.boundaryStrain * 100.0, 6)
          << "}" << (i + 1 == pat.panels.size() ? "" : ",") << "\n";
    }
    o << "  ],\n";
    o << "  \"dikis_sayisi\": " << pat.stitches.size() << ",\n";
    // The top boundary as the PATTERN holds it — the same array the flat draws.
    o << "  \"ust_sinir\": {\"sutun\": " << pat.topColXMM.size() << ", \"z_sutun\": "
      << pat.topColZMM.size() << "}\n";
    o << "}\n";
    return o.str();
}

// ---------------------------------------------------------------------------
// FLAT — the technical drawing
// ---------------------------------------------------------------------------
std::string flatJSON(const SeamPlan& plan) {
    const SurfacePattern& pat = plan.pattern;
    // NOT a rebuilt shell: the pattern's own.
    const ShellProjection f = projectFront(pat);
    const ShellProjection b = projectBack(pat);

    std::ostringstream o;
    o << "{\n";
    o << "  \"okuma\": \"flat\",\n";
    o << "  \"dugum\": " << quote(plan.nodeId()) << ",\n";
    o << "  \"beden\": " << quote(plan.size) << ",\n";
    o << "  \"sinif\": {\"garment\": " << quote(plan.garment())
      << ", \"shaping\": " << quote(plan.shaping())
      << ", \"fabric\": " << quote(plan.fabric()) << "},\n";
    // §2's second transform, DECLARED — and as of GECE7/F4 (IS 2) the open item
    // it used to print is closed. It printed "YAYIN BULUNAMADI" because there was
    // no mannequin chart at all; now there is one, it has an id, and its number
    // is OUR DECISION rather than an attribution to a publication that does not
    // exist. Zero difference is the most restrictive value available: any other
    // number would be one nobody published (§3.10). The chart, the reasoning and
    // the single place a future sourced number lands all live in
    // contract/mannequin-chart-v1.json; nothing here is a second copy of it.
    o << "  \"bedenlendirme\": {\n";
    o << "    \"beden_kaynagi\": \"manken\",\n";
    o << "    \"cizelge\": \"stitchu-manken-v1 (contract/mannequin-chart-v1.json)\",\n";
    o << "    \"dikis_payi_mm\": 0,\n";
    o << "    \"cizgi\": \"dikis (pay yok)\",\n";
    o << "    \"donusum\": \"manken := insan cizelgesi + ilan edilmis fark, dikis payi 0\",\n";
    o << "    \"fark_girth_mm\": 0.0,\n";
    o << "    \"fark_kaynagi\": \"BIZIM KARARIMIZ (GECE7 / F4), bir yayin DEGIL. Manken "
         "cevrelerinin insan cizelgesinden kac mm ince oldugunu veren otoriter bir yayin "
         "BULUNAMADI, ve sifirdan baska her deger uydurulmus bir sayi olurdu (§3.10). "
         "Gerekce + nasil degisecegi: contract/mannequin-chart-v1.json _karar blogu. "
         "Kapi: flat_convention_check bolum 1d, H6.\"\n";
    o << "  },\n";
    o << "  \"ustZ_mm\": " << num(f.topZMM) << ",\n";
    o << "  \"altZ_mm\": " << num(f.bottomZMM) << ",\n";

    // ---- 1. SILHOUETTE (what the flat always had) ----
    const ShellProjection* views[2] = {&f, &b};
    o << "  \"siluet\": [\n";
    for (int v = 0; v < 2; ++v) {
        const ShellProjection& p = *views[v];
        o << "    {\"gorunum\": " << quote(p.front ? "on" : "arka")
          << ", \"nokta\": " << p.outline.size() << ", \"seg\": " << p.segs.size()
          << ", \"olculer\": [";
        for (size_t i = 0; i < p.measures.size(); ++i)
            o << "{\"ad\": " << quote(p.measures[i].name) << ", \"halka\": "
              << quote(p.measures[i].ring) << ", \"mm\": " << num(p.measures[i].mm)
              << "}" << (i + 1 == p.measures.size() ? "" : ", ");
        o << "],\n";
        // THE CUBICS, NOT A RESAMPLED POLYLINE. The projection already fits the
        // contour with the repo's own Schneider fitter (curvefit.hpp, the same
        // one the pattern spec uses); handing out points instead would make the
        // browser re-smooth a curve that has already been fitted, i.e. a second
        // opinion about one line. Half the silhouette: the shell is symmetric
        // about x = 0 BY CONSTRUCTION, so the other half is this one negated
        // and shipping it twice would ship two spellings of one fact.
        o << "      \"yari_kontur\": [";
        for (size_t i = 0; i < p.segs.size(); ++i) {
            const CubicSeg& s = p.segs[i];
            o << "[" << num(s.p0.x) << "," << num(s.p0.y) << "," << num(s.c1.x) << ","
              << num(s.c1.y) << "," << num(s.c2.x) << "," << num(s.c2.y) << ","
              << num(s.p3.x) << "," << num(s.p3.y) << "]"
              << (i + 1 == p.segs.size() ? "" : ",");
        }
        o << "]}" << (v == 0 ? "," : "") << "\n";
    }
    o << "  ],\n";

    // ---- 2. THE INTERIOR TOP BOUNDARY — F3's actual delivery ----
    //
    // The neck edge, the shoulder line and the armhole, orthographically
    // projected: (x, z) per ring column, straight off the pattern's solved
    // boundary. This is the curve a neck drop moves, and until this
    // block existed the flat could not see it at all.
    //
    // Front view = the columns with sin(phi) >= 0, ordered by phi, which is
    // x descending from the right side seam through centre front to the left.
    // The back view is the complementary half, NOT a mirror of the front: they
    // carry different drops (SheathOptions::frontNeckDropCoefCM vs
    // backNeckDropMM) and printing one as the other would be inventing a
    // difference — or hiding one.
    const size_t n = pat.topColXMM.size();
    const size_t nz = pat.topColZMM.size();
    o << "  \"ust_sinir\": {\n";
    if (n == 0 || nz != n) {
        // An empty or half-published boundary is REFUSED, not defaulted
        // (RULES 1). A flat drawn with a silently missing neck edge is the exact
        // failure this block was written to end.
        o << "    \"hata\": \"ust sinir yayinlanmadi (x=" << n << ", z=" << nz
          << ") — sessiz varsayilan yok\"\n";
        o << "  }\n}\n";
        return o.str();
    }
    const int NR = static_cast<int>(n) - 1;
    const double kPi = 3.14159265358979323846;
    for (int half = 0; half < 2; ++half) {
        o << "    " << quote(half == 0 ? "on" : "arka") << ": [";
        bool first = true;
        double zLo = 1e18, zHi = -1e18, arc = 0.0;
        double px = 0.0, pz = 0.0;
        for (int j = 0; j <= NR; ++j) {
            const double phi = 2 * kPi * j / NR;
            const bool front = std::sin(phi) >= 0.0;
            if (front != (half == 0)) continue;
            const double x = pat.topColXMM[j], z = pat.topColZMM[j];
            if (!first) arc += std::hypot(x - px, z - pz);
            px = x; pz = z;
            zLo = std::min(zLo, z);
            zHi = std::max(zHi, z);
            if (!first) o << ", ";
            o << "[" << num(x) << ", " << num(z) << "]";
            first = false;
        }
        o << "],\n";
        o << "    " << quote(std::string(half == 0 ? "on" : "arka") + "_derinlik_mm")
          << ": " << num(zHi - zLo) << ",\n";
        o << "    " << quote(std::string(half == 0 ? "on" : "arka") + "_yay_mm")
          << ": " << num(arc) << (half == 0 ? ",\n" : "\n");
    }
    o << "  }\n";
    o << "}\n";
    return o.str();
}

}  // namespace stitchu
