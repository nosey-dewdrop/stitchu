// Geometry core tests. Plain assert harness, no framework dependency.
#include "../src/geometry.hpp"

#include <cmath>
#include <cstdio>
#include <cstdlib>

using namespace stitchu;

static int failures = 0;

static void check(bool ok, const char* what) {
    if (!ok) {
        std::printf("FAIL: %s\n", what);
        ++failures;
    }
}

static void checkNear(double actual, double expected, double tol, const char* what) {
    if (std::fabs(actual - expected) > tol) {
        std::printf("FAIL: %s — got %.4f, expected %.4f (tol %.4f)\n", what, actual, expected, tol);
        ++failures;
    }
}

int main() {
    // straight line: 3-4-5 triangle
    checkNear(pathLength({PathCommand::move({0, 0}), PathCommand::line({3, 4})}),
              5.0, 1e-9, "line length 3-4-5");

    // move alone adds nothing
    checkNear(pathLength({PathCommand::move({100, 100})}), 0.0, 1e-9, "move adds no length");

    // close returns to subpath start
    checkNear(pathLength({PathCommand::move({0, 0}),
                          PathCommand::line({10, 0}),
                          PathCommand::line({10, 10}),
                          PathCommand::close()}),
              10 + 10 + std::hypot(10.0, 10.0), 1e-9, "close returns to start");

    // degenerate cubic with control points on the chord == straight distance
    checkNear(pathLength({PathCommand::move({0, 0}),
                          PathCommand::curve({30, 40}, {10, 40.0 / 3}, {20, 80.0 / 3})}),
              50.0, 1e-6, "collinear cubic equals chord");

    // quarter circle via kappa: length ~ pi/2 * r (flattening + kappa error well under 0.1%)
    const double r = 100.0, k = 0.5523;
    checkNear(pathLength({PathCommand::move({r, 0}),
                          PathCommand::curve({0, r}, {r, r * k}, {r * k, r})}),
              M_PI_2 * r, 0.15, "quarter circle arc length");

    // flattening is deterministic and matches the Swift step convention
    const auto samples = flattenCubic({0, 0}, {24, 0}, {8, 0}, {16, 0}, 24);
    check(samples.size() == 25, "flattenCubic returns steps+1 points");
    checkNear(samples[12].x, 12.0, 1e-9, "uniform-t midpoint of linear cubic");

    // bounding box includes control points (Swift semantics)
    const Rect box = boundingBox({PathCommand::move({0, 0}),
                                  PathCommand::curve({10, 10}, {-5, 3}, {15, 7})});
    checkNear(box.x, -5.0, 1e-9, "bbox includes cp1");
    checkNear(box.width, 20.0, 1e-9, "bbox spans cp extremes");

    // degenerate box is zero
    const Rect zero = boundingBox({PathCommand::move({5, 5})});
    check(zero.width == 0.0 && zero.height == 0.0, "single point gives zero box");

    if (failures == 0) {
        std::printf("geometry tests: all passed\n");
        return EXIT_SUCCESS;
    }
    std::printf("geometry tests: %d failure(s)\n", failures);
    return EXIT_FAILURE;
}
