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
    const ShellProjection f = projectFront(pat.surf);
    const ShellProjection b = projectBack(pat.surf);

    std::ostringstream o;
    o << "{\n";
    o << "  \"okuma\": \"flat\",\n";
    o << "  \"dugum\": " << quote(plan.nodeId()) << ",\n";
    o << "  \"beden\": " << quote(plan.size) << ",\n";
    o << "  \"sinif\": {\"garment\": " << quote(plan.garment())
      << ", \"shaping\": " << quote(plan.shaping())
      << ", \"fabric\": " << quote(plan.fabric()) << "},\n";
    // §2's second transform, declared — INCLUDING the part that is not done.
    o << "  \"bedenlendirme\": {\n";
    o << "    \"beden_kaynagi\": \"manken\",\n";
    o << "    \"dikis_payi_mm\": 0,\n";
    o << "    \"cizgi\": \"dikis (pay yok)\",\n";
    o << "    \"ACIK_KALEM\": \"YAYIN BULUNAMADI — yayinlanmis bir manken cizelgesi "
         "yok, uydurmak yasak (KOSU-v7 §2, contract/flat-convention-v1.json). Flat "
         "BUGUN ayni insan cizelgesine degerleniyor; ayrisma F4'un isi. Ortak ata "
         "(dugum) F3'te kuruldu, iki bedene degerleme F4'te kurulacak.\"\n";
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
