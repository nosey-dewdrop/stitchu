import Foundation
import CoreGraphics

/// Set-in sleeve block. The cap is fitted with the verified iterative
/// convergence technique (FreeSewing engine philosophy): scale the cap width
/// until the drafted cap curve length matches the bodice armhole length plus
/// cap ease, within 1mm.
///
/// ASSUMPTION: biceps is not measured; estimated as bust * 0.30 with Brian's
/// verified 15% biceps ease. The guide's muslin warning covers this.
enum SleeveStyle: String, CaseIterable, Identifiable {
    case none, straight, balloon

    var id: String { rawValue }
    var title: String {
        switch self {
        case .none: "sleeveless"
        case .straight: "straight"
        case .balloon: "balloon"
        }
    }
}

enum SleeveLength: String, CaseIterable, Identifiable {
    case short, elbow, long

    var id: String { rawValue }
}

struct SleeveBlock {
    static let bicepsRatio = 0.30       // ASSUMPTION (anthropometric)
    static let bicepsEase = 0.15        // verified Brian default
    static let capEase = 0.04           // classic 3-5% cap ease for setting in
    static let convergenceTolerance = 0.5

    /// Returns the sleeve pieces (sleeve + cuff for balloon).
    static func draft(
        measurements m: BodyMeasurementsSnapshot,
        style: SleeveStyle,
        length: SleeveLength,
        armholeLength: Double,
        armholeDepth: Double
    ) -> [PatternPiece] {
        guard style != .none else { return [] }

        let bicepsEstimate = m.bustMM * bicepsRatio * (1 + bicepsEase)
        let capHeight = armholeDepth * 0.75
        let targetCapLength = armholeLength * (1 + capEase)

        // Converge cap width so the cap curve length matches the armhole.
        // Cap length grows monotonically with width, so bisect: a fixed-step
        // multiplicative walk oscillates and can miss the tolerance.
        var lo = 60.0
        var hi = max(bicepsEstimate, 200) * 3
        while capCurveLength(width: hi, capHeight: capHeight) < targetCapLength && hi < 8000 {
            hi *= 1.5
        }
        var width = max(bicepsEstimate, 200)
        for _ in 0..<60 {
            width = (lo + hi) / 2
            let delta = capCurveLength(width: width, capHeight: capHeight) - targetCapLength
            if abs(delta) <= convergenceTolerance { break }
            if delta > 0 { hi = width } else { lo = width }
        }

        let sleeveLength = totalLength(for: length, armLengthMM: m.armLengthCM * 10, capHeight: capHeight)
        let balloon = style == .balloon

        let hemY = sleeveLength
        let hemHalf = balloon ? width * 0.52 : width * 0.40
        let midBulge = balloon ? width * 0.62 : width * 0.46

        let capLeft = CGPoint(x: -width / 2, y: capHeight)
        let capRight = CGPoint(x: width / 2, y: capHeight)
        let top = CGPoint(x: 0, y: 0)
        let hemLeft = CGPoint(x: -hemHalf, y: hemY)
        let hemRight = CGPoint(x: hemHalf, y: hemY)

        var commands: [PathCommand] = [.move(capLeft)]
        commands += capCurve(from: capLeft, to: top, front: true)
        commands += capCurve(from: top, to: capRight, front: false)
        // underarm seams (bowed out for balloon)
        commands.append(.curve(to: hemRight,
                               cp1: CGPoint(x: midBulge, y: capHeight + (hemY - capHeight) * 0.4),
                               cp2: CGPoint(x: hemHalf * 1.05, y: hemY - (hemY - capHeight) * 0.2)))
        commands.append(.line(hemLeft))
        commands.append(.curve(to: capLeft,
                               cp1: CGPoint(x: -hemHalf * 1.05, y: hemY - (hemY - capHeight) * 0.2),
                               cp2: CGPoint(x: -midBulge, y: capHeight + (hemY - capHeight) * 0.4)))
        commands.append(.close)

        // Gather notches on the cap; balloon also gathers into the hem.
        var markings: [PathCommand] = [
            .move(CGPoint(x: -width * 0.18, y: capHeight * 0.18)),
            .line(CGPoint(x: -width * 0.18, y: capHeight * 0.05)),
            .move(CGPoint(x: width * 0.18, y: capHeight * 0.18)),
            .line(CGPoint(x: width * 0.18, y: capHeight * 0.05)),
        ]
        if balloon {
            markings.append(.move(CGPoint(x: -hemHalf, y: hemY - 25)))
            markings.append(.line(CGPoint(x: hemHalf, y: hemY - 25)))
        }

        let sleeve = PatternPiece(
            name: balloon ? "Balloon Sleeve" : "Sleeve",
            cutInstruction: "cut 2",
            commands: commands,
            markings: markings,
            grainline: Grainline(from: CGPoint(x: 0, y: capHeight * 0.4), to: CGPoint(x: 0, y: hemY - 40)),
            seamAllowance: 15
        )

        guard balloon else { return [sleeve] }

        // Cuff band: wrist-ish circumference derived from biceps estimate.
        let cuffLength = bicepsEstimate * 0.62 + 20
        let cuffHeight: Double = 60
        let cuff = PatternPiece(
            name: "Sleeve Cuff",
            cutInstruction: "cut 2, interface",
            commands: [
                .move(.zero),
                .line(CGPoint(x: cuffLength, y: 0)),
                .line(CGPoint(x: cuffLength, y: cuffHeight)),
                .line(CGPoint(x: 0, y: cuffHeight)),
                .close,
            ],
            markings: [.move(CGPoint(x: 0, y: cuffHeight / 2)), .line(CGPoint(x: cuffLength, y: cuffHeight / 2))],
            grainline: Grainline(from: CGPoint(x: 20, y: cuffHeight / 2), to: CGPoint(x: cuffLength - 20, y: cuffHeight / 2)),
            seamAllowance: 10
        )
        return [sleeve, cuff]
    }

    /// Classic S-shaped half cap: hollow near the underarm, full near the top.
    private static func capCurve(from: CGPoint, to: CGPoint, front: Bool) -> [PathCommand] {
        let dx = to.x - from.x
        let dy = to.y - from.y
        let hollow: CGFloat = front ? 0.24 : 0.18
        return [.curve(
            to: to,
            cp1: CGPoint(x: from.x + dx * hollow, y: from.y + dy * 0.02),
            cp2: CGPoint(x: from.x + dx * 0.55, y: from.y + dy * 0.98)
        )]
    }

    private static func capCurveLength(width: Double, capHeight: Double) -> Double {
        let left = CGPoint(x: -width / 2, y: capHeight)
        let right = CGPoint(x: width / 2, y: capHeight)
        let top = CGPoint(x: 0, y: 0)
        var cmds: [PathCommand] = [.move(left)]
        cmds += capCurve(from: left, to: top, front: true)
        cmds += capCurve(from: top, to: right, front: false)
        return pathLength(of: cmds)
    }

    private static func totalLength(for length: SleeveLength, armLengthMM: Double, capHeight: Double) -> Double {
        switch length {
        case .short: capHeight + 90
        case .elbow: capHeight + armLengthMM * 0.35
        case .long: armLengthMM * 0.96
        }
    }
}
