// stitchu core — geometry primitives.
//
// TASARIM KARARI (Seamly2D'nin hatasindan): egri UZUNLUGU asla poligonlastirarak
// olculmez. Seamly2D her egriyi sabit 0.5 piksel toleransla poligona ceviriyor ve
// dikis payini onun uzerinden aliyor; test toleranslari 1mm. Couture icin bu bir
// olcum degil, duman testi. Burada uzunluk ADAPTIF GAUSS-LEGENDRE ile, ~1e-12
// bagil hassasiyetle hesaplanir.
#pragma once
#include <cmath>
#include <array>
#include <vector>
#include <cstddef>

namespace stitchu {

struct Vec2 {
    double x{0}, y{0};
    Vec2() = default;
    Vec2(double x_, double y_) : x(x_), y(y_) {}
    Vec2 operator+(const Vec2& o) const { return {x + o.x, y + o.y}; }
    Vec2 operator-(const Vec2& o) const { return {x - o.x, y - o.y}; }
    Vec2 operator*(double s) const { return {x * s, y * s}; }
    double dot(const Vec2& o) const { return x * o.x + y * o.y; }
    double cross(const Vec2& o) const { return x * o.y - y * o.x; }
    double norm() const { return std::sqrt(x * x + y * y); }
    Vec2 unit() const { double n = norm(); return n > 1e-15 ? Vec2{x / n, y / n} : Vec2{0, 0}; }
    Vec2 perp() const { return {-y, x}; }
};

// 8 noktali Gauss-Legendre dugum/agirliklari ([-1,1] araligi).
namespace gl8 {
inline constexpr std::array<double, 8> kNode = {
    -0.9602898564975363, -0.7966664774136267, -0.5255324099163290, -0.1834346424956498,
     0.1834346424956498,  0.5255324099163290,  0.7966664774136267,  0.9602898564975363};
inline constexpr std::array<double, 8> kWeight = {
    0.1012285362903763, 0.2223810344533745, 0.3137066458778873, 0.3626837833783620,
    0.3626837833783620, 0.3137066458778873, 0.2223810344533745, 0.1012285362903763};
}  // namespace gl8

// Kubik Bezier. Kontrol noktalari MUTLAK; goreli (kiris cerceveli) saklama
// model katmaninda yapilir (GarmentCode dersi: kiris gerilince egri sekli korunur).
struct Cubic {
    Vec2 p0, c0, c1, p1;

    Vec2 at(double t) const {
        const double u = 1 - t;
        return p0 * (u * u * u) + c0 * (3 * u * u * t) + c1 * (3 * u * t * t) + p1 * (t * t * t);
    }
    Vec2 deriv(double t) const {
        const double u = 1 - t;
        return (c0 - p0) * (3 * u * u) + (c1 - c0) * (6 * u * t) + (p1 - c1) * (3 * t * t);
    }

    // [t0,t1] araliginin yay uzunlugu, tek 8-nokta GL panelinde.
    double glPanel(double t0, double t1) const {
        const double h = 0.5 * (t1 - t0), m = 0.5 * (t0 + t1);
        double s = 0;
        for (std::size_t i = 0; i < 8; ++i) s += gl8::kWeight[i] * deriv(m + h * gl8::kNode[i]).norm();
        return s * h;
    }

    // Adaptif: panel ikiye bolununce degismiyorsa yakinsamistir.
    double arcLength(double t0, double t1, double tol = 1e-10, int depth = 0) const {
        const double whole = glPanel(t0, t1);
        const double mid = 0.5 * (t0 + t1);
        const double halves = glPanel(t0, mid) + glPanel(mid, t1);
        if (depth >= 20 || std::fabs(halves - whole) <= tol * std::fabs(halves) + 1e-13) {
            return halves;
        }
        return arcLength(t0, mid, tol, depth + 1) + arcLength(mid, t1, tol, depth + 1);
    }
    double length() const { return arcLength(0.0, 1.0); }
};

// Kubik zincir, dugumler arasi G1 sureklilik INSA YOLUYLA saglanir:
// her dugumde tek bir teget yonu vardir, iki tarafin tutamak UZUNLUKLARI ayri.
// (Valentina'nin VSpline'i de boyle: uc noktalari + aci + tutamak uzunlugu.)
struct CubicChain {
    std::vector<Vec2> node;       // n+1 dugum
    std::vector<Vec2> tangent;    // n+1 birim teget
    std::vector<double> handleIn;  // dugume gelen tutamak uzunlugu (node[0] icin kullanilmaz)
    std::vector<double> handleOut; // dugumden cikan tutamak uzunlugu (node[n] icin kullanilmaz)

    std::size_t segmentCount() const { return node.empty() ? 0 : node.size() - 1; }

    Cubic segment(std::size_t i) const {
        Cubic c;
        c.p0 = node[i];
        c.p1 = node[i + 1];
        c.c0 = node[i] + tangent[i] * handleOut[i];
        c.c1 = node[i + 1] - tangent[i + 1] * handleIn[i + 1];
        return c;
    }
    double segmentLength(std::size_t i) const { return segment(i).length(); }
    double length() const {
        double s = 0;
        for (std::size_t i = 0; i < segmentCount(); ++i) s += segmentLength(i);
        return s;
    }
    // [a,b] dugum araligi (kapali) — centikler dugum olarak modellenir, boylece
    // bolge uzunlugu tam olarak segment uzunluklarinin toplamidir.
    double zoneLength(std::size_t a, std::size_t b) const {
        double s = 0;
        for (std::size_t i = a; i < b; ++i) s += segmentLength(i);
        return s;
    }

    // Catmull-Rom benzeri teget: komsu dugumleri baglayan yon. Uclarda tek komsu.
    void retangent() {
        const std::size_t n = node.size();
        for (std::size_t i = 0; i < n; ++i) {
            if (i == 0)          tangent[i] = (node[1] - node[0]).unit();
            else if (i + 1 == n) tangent[i] = (node[n - 1] - node[n - 2]).unit();
            else                 tangent[i] = (node[i + 1] - node[i - 1]).unit();
        }
    }
};

}  // namespace stitchu
