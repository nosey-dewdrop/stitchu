import SwiftUI

/// Front-facing croquis used in onboarding. Same geometry as the mock's SVG.
/// Placeholder until Damla's hand-drawn silhouette replaces it.
struct BodySilhouetteView: View {
    var highlight: MeasurementField?

    private let designSize = CGSize(width: 160, height: 300)

    var body: some View {
        Canvas { context, size in
            let scale = min(size.width / designSize.width, size.height / designSize.height)
            let offset = CGPoint(
                x: (size.width - designSize.width * scale) / 2,
                y: (size.height - designSize.height * scale) / 2
            )
            var transform = CGAffineTransform(translationX: offset.x, y: offset.y).scaledBy(x: scale, y: scale)

            let body = Self.bodyPath.cgPath.copy(using: &transform) ?? Self.bodyPath.cgPath
            let head = Path(ellipseIn: CGRect(x: 66, y: 2, width: 28, height: 28)).cgPath.copy(using: &transform)!

            for shape in [body, head] {
                context.fill(Path(shape), with: .color(Palette.blueLight))
                context.stroke(Path(shape), with: .color(Palette.line), style: StrokeStyle(lineWidth: 1.5, lineJoin: .round))
            }

            if let highlight {
                let dash = StrokeStyle(lineWidth: 3, dash: [4, 3])
                let path = Self.highlightPath(for: highlight).cgPath.copy(using: &transform)!
                context.stroke(Path(path), with: .color(Palette.blue), style: dash)
            }
        }
        .accessibilityLabel(highlight.map { "Body outline highlighting \($0.title)" } ?? "Body outline")
    }

    private static func highlightPath(for field: MeasurementField) -> Path {
        var p = Path()
        switch field {
        case .bust:
            p.addEllipse(in: CGRect(x: 80 - 38, y: 85 - 8, width: 76, height: 16))
        case .waist:
            p.addEllipse(in: CGRect(x: 80 - 32, y: 130 - 6, width: 64, height: 12))
        case .hip:
            p.addEllipse(in: CGRect(x: 80 - 40, y: 168 - 8, width: 80, height: 16))
        case .shoulder:
            p.move(to: CGPoint(x: 42, y: 50)); p.addLine(to: CGPoint(x: 118, y: 50))
        case .backLength:
            p.move(to: CGPoint(x: 80, y: 30)); p.addLine(to: CGPoint(x: 80, y: 130))
        case .arm:
            p.move(to: CGPoint(x: 118, y: 50)); p.addLine(to: CGPoint(x: 140, y: 170))
        case .neck:
            p.addEllipse(in: CGRect(x: 80 - 14, y: 28 - 6, width: 28, height: 12))
        }
        return p
    }

    /// Croquis outline in a 160x300 design space (same path as mock.html).
    static let bodyPath: Path = {
        var p = Path()
        p.move(to: CGPoint(x: 72, y: 30))
        p.addCurve(to: CGPoint(x: 69, y: 41), control1: CGPoint(x: 72, y: 36), control2: CGPoint(x: 71, y: 39))
        p.addCurve(to: CGPoint(x: 44, y: 50), control1: CGPoint(x: 60, y: 44), control2: CGPoint(x: 50, y: 45))
        p.addCurve(to: CGPoint(x: 36, y: 66), control1: CGPoint(x: 40, y: 53), control2: CGPoint(x: 38, y: 58))
        p.addCurve(to: CGPoint(x: 22, y: 158), control1: CGPoint(x: 33, y: 78), control2: CGPoint(x: 28, y: 120))
        p.addCurve(to: CGPoint(x: 19, y: 174), control1: CGPoint(x: 20, y: 166), control2: CGPoint(x: 18, y: 171))
        p.addCurve(to: CGPoint(x: 26, y: 174), control1: CGPoint(x: 20, y: 178), control2: CGPoint(x: 25, y: 179))
        p.addCurve(to: CGPoint(x: 33, y: 152), control1: CGPoint(x: 28, y: 168), control2: CGPoint(x: 31, y: 160))
        p.addCurve(to: CGPoint(x: 46, y: 76), control1: CGPoint(x: 37, y: 134), control2: CGPoint(x: 41, y: 100))
        p.addCurve(to: CGPoint(x: 48, y: 70), control1: CGPoint(x: 47, y: 72), control2: CGPoint(x: 48, y: 70))
        p.addCurve(to: CGPoint(x: 46, y: 89), control1: CGPoint(x: 46, y: 78), control2: CGPoint(x: 45, y: 83))
        p.addCurve(to: CGPoint(x: 50, y: 128), control1: CGPoint(x: 48, y: 100), control2: CGPoint(x: 50, y: 115))
        p.addCurve(to: CGPoint(x: 44, y: 166), control1: CGPoint(x: 50, y: 142), control2: CGPoint(x: 45, y: 156))
        p.addCurve(to: CGPoint(x: 49, y: 206), control1: CGPoint(x: 43, y: 178), control2: CGPoint(x: 46, y: 192))
        p.addCurve(to: CGPoint(x: 55, y: 235), control1: CGPoint(x: 52, y: 218), control2: CGPoint(x: 54, y: 226))
        p.addCurve(to: CGPoint(x: 59, y: 272), control1: CGPoint(x: 56, y: 248), control2: CGPoint(x: 56, y: 260))
        p.addCurve(to: CGPoint(x: 61, y: 285), control1: CGPoint(x: 58, y: 279), control2: CGPoint(x: 57, y: 283))
        p.addCurve(to: CGPoint(x: 74, y: 283), control1: CGPoint(x: 66, y: 286), control2: CGPoint(x: 73, y: 286))
        p.addCurve(to: CGPoint(x: 72, y: 272), control1: CGPoint(x: 73, y: 278), control2: CGPoint(x: 72, y: 275))
        p.addCurve(to: CGPoint(x: 72, y: 230), control1: CGPoint(x: 71, y: 255), control2: CGPoint(x: 70, y: 242))
        p.addCurve(to: CGPoint(x: 80, y: 182), control1: CGPoint(x: 75, y: 212), control2: CGPoint(x: 78, y: 196))
        p.addCurve(to: CGPoint(x: 88, y: 230), control1: CGPoint(x: 82, y: 196), control2: CGPoint(x: 85, y: 212))
        p.addCurve(to: CGPoint(x: 88, y: 272), control1: CGPoint(x: 90, y: 242), control2: CGPoint(x: 89, y: 255))
        p.addCurve(to: CGPoint(x: 86, y: 283), control1: CGPoint(x: 88, y: 275), control2: CGPoint(x: 87, y: 278))
        p.addCurve(to: CGPoint(x: 99, y: 285), control1: CGPoint(x: 87, y: 286), control2: CGPoint(x: 94, y: 286))
        p.addCurve(to: CGPoint(x: 101, y: 272), control1: CGPoint(x: 103, y: 283), control2: CGPoint(x: 102, y: 279))
        p.addCurve(to: CGPoint(x: 105, y: 235), control1: CGPoint(x: 104, y: 260), control2: CGPoint(x: 104, y: 248))
        p.addCurve(to: CGPoint(x: 111, y: 206), control1: CGPoint(x: 106, y: 226), control2: CGPoint(x: 108, y: 218))
        p.addCurve(to: CGPoint(x: 116, y: 166), control1: CGPoint(x: 114, y: 192), control2: CGPoint(x: 117, y: 178))
        p.addCurve(to: CGPoint(x: 110, y: 128), control1: CGPoint(x: 115, y: 156), control2: CGPoint(x: 110, y: 142))
        p.addCurve(to: CGPoint(x: 114, y: 89), control1: CGPoint(x: 110, y: 115), control2: CGPoint(x: 112, y: 100))
        p.addCurve(to: CGPoint(x: 112, y: 70), control1: CGPoint(x: 115, y: 83), control2: CGPoint(x: 114, y: 78))
        p.addCurve(to: CGPoint(x: 114, y: 76), control1: CGPoint(x: 112, y: 70), control2: CGPoint(x: 113, y: 72))
        p.addCurve(to: CGPoint(x: 127, y: 152), control1: CGPoint(x: 119, y: 100), control2: CGPoint(x: 123, y: 134))
        p.addCurve(to: CGPoint(x: 134, y: 174), control1: CGPoint(x: 129, y: 160), control2: CGPoint(x: 132, y: 168))
        p.addCurve(to: CGPoint(x: 141, y: 174), control1: CGPoint(x: 135, y: 179), control2: CGPoint(x: 140, y: 178))
        p.addCurve(to: CGPoint(x: 138, y: 158), control1: CGPoint(x: 142, y: 171), control2: CGPoint(x: 140, y: 166))
        p.addCurve(to: CGPoint(x: 124, y: 66), control1: CGPoint(x: 132, y: 120), control2: CGPoint(x: 127, y: 78))
        p.addCurve(to: CGPoint(x: 116, y: 50), control1: CGPoint(x: 122, y: 58), control2: CGPoint(x: 120, y: 53))
        p.addCurve(to: CGPoint(x: 91, y: 41), control1: CGPoint(x: 110, y: 45), control2: CGPoint(x: 100, y: 44))
        p.addCurve(to: CGPoint(x: 88, y: 30), control1: CGPoint(x: 89, y: 39), control2: CGPoint(x: 88, y: 36))
        p.closeSubpath()
        return p
    }()
}
