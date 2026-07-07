import Foundation
import CoreGraphics

/// Numeric validation of drafted patterns. Pure Foundation + CoreGraphics so it
/// runs both inside the app (safety net before showing/exporting a pattern) and
/// in the engine-check harness across the whole size matrix.
///
/// Invariants checked:
/// - every coordinate finite, every piece has a positive, printable bounding box
/// - no self-intersecting outlines
/// - no kinks inside any outline curve (flattened turning angle per step)
/// - bodice front/back side seam lengths equal (they get sewn together)
/// - bodice chest width matches the eased bust/underbust target
/// - dart intake + seam take-in sums exactly to the drafted waist reduction
/// - sleeve cap seam length within ease tolerance of the armhole it sets into
/// - dress skirt waist seam matches the bodice waist seam it attaches to
/// - standalone skirt waist matches its waistband
/// - dress skirt back carries a center back seam so the zipper can continue
/// - dart markings live inside their piece
struct ValidationIssue: CustomStringConvertible, Equatable {
    var rule: String
    var piece: String
    var detail: String

    var description: String { "[\(rule)] \(piece): \(detail)" }
}

enum PatternValidator {
    // Tolerances in mm unless noted.
    static let pairedSeamTolerance = 3.0
    static let waistJoinTolerance = 12.0     // absorbable by easing while sewing
    static let dartSumTolerance = 2.0
    static let chestWidthTolerance = 1.5
    static let capLengthTolerance = 2.5
    static let capEaseRange = 0.01...0.09    // sane set-in ease window
    static let kinkAngleDegrees = 25.0       // max turn per flattened curve step
    static let maxPieceSpan = 3000.0         // sanity cap for tiled A4 printing
    static let markingSlack = 8.0

    static func issues(
        spec: GarmentSpec,
        measurements m: BodyMeasurementsSnapshot,
        draft: DraftedPattern
    ) -> [ValidationIssue] {
        var issues: [ValidationIssue] = []

        if draft.pieces.isEmpty {
            issues.append(.init(rule: "pieces", piece: draft.garment, detail: "no pieces drafted"))
            return issues
        }
        if !draft.fabricMeters140.isFinite || draft.fabricMeters140 <= 0 || draft.fabricMeters140 > 30 {
            issues.append(.init(rule: "fabric", piece: draft.garment, detail: "fabric estimate \(draft.fabricMeters140) m is not sane"))
        }

        for piece in draft.pieces {
            issues += geometryIssues(piece: piece)
        }

        switch spec.garment {
        case .skirt:
            issues += skirtIssues(spec: spec, measurements: m, draft: draft, waistEase: SkirtBlock.waistEase, bodice: nil)
        case .dress:
            let bodice = BodiceBlock.draft(measurements: m, neckline: spec.neckline)
            issues += bodiceIssues(bodice: bodice, measurements: m)
            issues += sleeveIssues(spec: spec, measurements: m, draft: draft, bodice: bodice)
            issues += skirtIssues(spec: spec, measurements: m, draft: draft, waistEase: BodiceBlock.waistEase, bodice: bodice)
        case .top:
            let bodice = BodiceBlock.draft(measurements: m, neckline: spec.neckline)
            issues += bodiceIssues(bodice: bodice, measurements: m)
            issues += sleeveIssues(spec: spec, measurements: m, draft: draft, bodice: bodice)
            issues += topIssues(spec: spec, measurements: m, draft: draft, bodice: bodice)
        }
        return issues
    }

    // MARK: - Per piece geometry

    static func geometryIssues(piece: PatternPiece) -> [ValidationIssue] {
        var issues: [ValidationIssue] = []

        for point in allPoints(of: piece.commands) + allPoints(of: piece.markings) where !point.x.isFinite || !point.y.isFinite {
            issues.append(.init(rule: "finite", piece: piece.name, detail: "non-finite coordinate \(point)"))
            return issues // everything downstream would be noise
        }

        let box = piece.boundingBox
        if box.width <= 0 || box.height <= 0 {
            issues.append(.init(rule: "print", piece: piece.name, detail: "empty bounding box — the PDF exporter would silently skip this piece"))
            return issues
        }
        if Double(max(box.width, box.height)) > maxPieceSpan {
            issues.append(.init(rule: "print", piece: piece.name, detail: String(format: "piece spans %.0f mm, beyond the %.0f mm tiled print sanity cap", Double(max(box.width, box.height)), maxPieceSpan)))
        }

        issues += kinkIssues(piece: piece)
        issues += selfIntersectionIssues(piece: piece)
        issues += markingIssues(piece: piece, box: box)
        return issues
    }

    private static func allPoints(of commands: [PathCommand]) -> [CGPoint] {
        commands.flatMap { cmd -> [CGPoint] in
            switch cmd {
            case .move(let p), .line(let p): [p]
            case .curve(let to, let cp1, let cp2): [to, cp1, cp2]
            case .close: []
            }
        }
    }

    /// A single bezier in an outline must not fold back on itself: the turning
    /// angle between consecutive flattened segments stays under tolerance.
    private static func kinkIssues(piece: PatternPiece) -> [ValidationIssue] {
        var issues: [ValidationIssue] = []
        var current = CGPoint.zero
        for (index, cmd) in piece.commands.enumerated() {
            switch cmd {
            case .move(let p), .line(let p):
                current = p
            case .curve(let to, let cp1, let cp2):
                let samples = flatten(from: current, to: to, cp1: cp1, cp2: cp2, steps: 24)
                var previousDirection: CGVector?
                for i in 1..<samples.count {
                    let dx = samples[i].x - samples[i - 1].x
                    let dy = samples[i].y - samples[i - 1].y
                    guard hypot(dx, dy) > 0.3 else { continue } // skip degenerate steps
                    let direction = CGVector(dx: dx, dy: dy)
                    if let prev = previousDirection {
                        let turn = angleDegrees(prev, direction)
                        if turn > kinkAngleDegrees {
                            issues.append(.init(rule: "kink", piece: piece.name, detail: String(format: "curve %d turns %.0f deg in one step (max %.0f)", index, turn, kinkAngleDegrees)))
                            break
                        }
                    }
                    previousDirection = direction
                }
                current = to
            case .close:
                break
            }
        }
        return issues
    }

    private static func selfIntersectionIssues(piece: PatternPiece) -> [ValidationIssue] {
        let segments = flattenOutline(piece.commands)
        guard segments.count > 3 else { return [] }
        for i in 0..<(segments.count - 2) {
            for j in (i + 2)..<segments.count {
                // Skip neighbours (shared endpoints), incl. the closing wrap.
                if i == 0 && j == segments.count - 1 { continue }
                if segmentsCross(segments[i], segments[j]) {
                    return [.init(rule: "selfintersect", piece: piece.name, detail: "outline crosses itself near \(segments[i].0)")]
                }
            }
        }
        return []
    }

    private static func markingIssues(piece: PatternPiece, box: CGRect) -> [ValidationIssue] {
        let expanded = box.insetBy(dx: -markingSlack, dy: -markingSlack)
        for point in allPoints(of: piece.markings) where !expanded.contains(point) {
            return [.init(rule: "marking", piece: piece.name, detail: "marking point \(point) falls outside the piece")]
        }
        return []
    }

    // MARK: - Bodice

    private static func bodiceIssues(bodice: BodiceDraft, measurements m: BodyMeasurementsSnapshot) -> [ValidationIssue] {
        var issues: [ValidationIssue] = []

        let seamDelta = abs(bodice.frontSideSeam - bodice.backSideSeam)
        if seamDelta > pairedSeamTolerance {
            issues.append(.init(rule: "sideseam", piece: "Bodice", detail: String(format: "front side seam %.1f vs back %.1f differ by %.1f mm (max %.1f)", bodice.frontSideSeam, bodice.backSideSeam, seamDelta, pairedSeamTolerance)))
        }

        let underbust = max(m.bustMM - BodiceBlock.underbustOffset, m.waistMM)
        let expectedFrontChest = (m.bustMM / 4) * (1 + BodiceBlock.chestEase)
        let expectedBackChest = (underbust / 4) * (1 + BodiceBlock.chestEase)
        if abs(bodice.frontChestWidth - expectedFrontChest) > chestWidthTolerance {
            issues.append(.init(rule: "chest", piece: "Bodice Front", detail: String(format: "chest width %.1f, expected %.1f — bust ease is being eaten", bodice.frontChestWidth, expectedFrontChest)))
        }
        if abs(bodice.backChestWidth - expectedBackChest) > chestWidthTolerance {
            issues.append(.init(rule: "chest", piece: "Bodice Back", detail: String(format: "chest width %.1f, expected %.1f", bodice.backChestWidth, expectedBackChest)))
        }

        // Dart + seam take-in must reproduce the waist target exactly.
        let frontTarget = (m.waistMM * (1 - BodiceBlock.backWaistShare) / 2) * (1 + BodiceBlock.waistEase)
        let backTarget = (m.waistMM * BodiceBlock.backWaistShare / 2) * (1 + BodiceBlock.waistEase)
        if abs(bodice.frontStraightWaist - frontTarget) > dartSumTolerance {
            issues.append(.init(rule: "dartsum", piece: "Bodice Front", detail: String(format: "sewn waist span %.1f vs target %.1f — dart intake inconsistent with waist reduction", bodice.frontStraightWaist, frontTarget)))
        }
        if abs(bodice.backStraightWaist - backTarget) > dartSumTolerance {
            issues.append(.init(rule: "dartsum", piece: "Bodice Back", detail: String(format: "sewn waist span %.1f vs target %.1f — dart intake inconsistent with waist reduction", bodice.backStraightWaist, backTarget)))
        }

        if bodice.armholeLength <= 0 || !bodice.armholeLength.isFinite {
            issues.append(.init(rule: "armhole", piece: "Bodice", detail: "armhole length \(bodice.armholeLength) is not sane"))
        }
        return issues
    }

    // MARK: - Sleeve

    private static func sleeveIssues(
        spec: GarmentSpec,
        measurements m: BodyMeasurementsSnapshot,
        draft: DraftedPattern,
        bodice: BodiceDraft
    ) -> [ValidationIssue] {
        guard spec.sleeveStyle != .none else { return [] }
        guard let sleeve = draft.pieces.first(where: { $0.name.contains("Sleeve") && !$0.name.contains("Cuff") }) else {
            return [.init(rule: "sleeve", piece: draft.garment, detail: "sleeve requested but no sleeve piece drafted")]
        }
        // Cap = move(capLeft) + the two cap curves, a stable layout of SleeveBlock.
        guard sleeve.commands.count >= 3,
              case .move(let capLeft) = sleeve.commands[0],
              case .curve = sleeve.commands[1],
              case .curve = sleeve.commands[2] else {
            return [.init(rule: "sleeve", piece: sleeve.name, detail: "unexpected sleeve command layout, cannot measure cap")]
        }
        let capLength = pathLength(of: [.move(capLeft), sleeve.commands[1], sleeve.commands[2]])
        let target = bodice.armholeLength * (1 + SleeveBlock.capEase)
        let ease = capLength / bodice.armholeLength - 1
        var issues: [ValidationIssue] = []
        if abs(capLength - target) > capLengthTolerance {
            issues.append(.init(rule: "cap", piece: sleeve.name, detail: String(format: "cap seam %.1f vs target %.1f (armhole %.1f + %.0f%% ease) — convergence missed by %.1f mm", capLength, target, bodice.armholeLength, SleeveBlock.capEase * 100, abs(capLength - target))))
        }
        if !capEaseRange.contains(ease) {
            issues.append(.init(rule: "cap", piece: sleeve.name, detail: String(format: "cap ease %.1f%% outside the %.0f-%.0f%% window", ease * 100, capEaseRange.lowerBound * 100, capEaseRange.upperBound * 100)))
        }
        return issues
    }

    // MARK: - Skirt (standalone or attached to a dress bodice)

    private static func skirtIssues(
        spec: GarmentSpec,
        measurements m: BodyMeasurementsSnapshot,
        draft: DraftedPattern,
        waistEase: Double,
        bodice: BodiceDraft?
    ) -> [ValidationIssue] {
        var issues: [ValidationIssue] = []
        let skirtPieces = draft.pieces.filter { piece in
            let n = piece.name
            return n == "Front" || n == "Back" || n.hasPrefix("Skirt")
        }
        guard !skirtPieces.isEmpty else {
            return [.init(rule: "skirt", piece: draft.garment, detail: "no skirt pieces found")]
        }

        // Sewn waist (dart intake excluded) totalled over the full garment.
        // Every skirt piece is a half of front/back (on fold or cut 2), so x2.
        var sewnWaist = 0.0
        for piece in skirtPieces {
            guard let waist = skirtWaistLength(piece: piece, style: spec.skirtStyle) else {
                issues.append(.init(rule: "skirt", piece: piece.name, detail: "unexpected command layout, cannot measure waist"))
                continue
            }
            sewnWaist += (waist - dartIntake(of: piece)) * 2
        }
        // Two identical gathered/half-circle panels drafted as one piece list
        // are already both in skirtPieces; quarter pieces (Front+Back) too.

        if spec.skirtStyle == .gathered {
            // Gathered panels only need to be comfortably wider than the waist.
            let reference = bodiceSewnWaist(bodice) ?? m.waistMM * (1 + waistEase)
            if sewnWaist < reference * 1.3 {
                issues.append(.init(rule: "waistjoin", piece: "Skirt", detail: String(format: "gathered panels %.0f mm give less than 1.3x the waist %.0f", sewnWaist, reference)))
            }
        } else if let bodice {
            let bodiceWaist = bodiceSewnWaist(bodice) ?? 0
            if abs(sewnWaist - bodiceWaist) > waistJoinTolerance {
                issues.append(.init(rule: "waistjoin", piece: "Skirt", detail: String(format: "skirt waist %.1f vs bodice waist %.1f differ by %.1f mm (max %.1f)", sewnWaist, bodiceWaist, abs(sewnWaist - bodiceWaist), waistJoinTolerance)))
            }
        } else {
            let target = m.waistMM * (1 + waistEase)
            if abs(sewnWaist - target) > waistJoinTolerance {
                issues.append(.init(rule: "waist", piece: "Skirt", detail: String(format: "skirt waist %.1f vs eased body waist %.1f differ by %.1f mm", sewnWaist, target, abs(sewnWaist - target))))
            }
            if let band = draft.pieces.first(where: { $0.name == "Waistband" }) {
                let bandLength = Double(band.boundingBox.width)
                let bandTotal = bandLength * 2 - 60 // 30mm button stand per half
                if abs(bandTotal - sewnWaist) > waistJoinTolerance {
                    issues.append(.init(rule: "waistband", piece: "Waistband", detail: String(format: "band %.1f vs skirt waist %.1f differ by %.1f mm", bandTotal, sewnWaist, abs(bandTotal - sewnWaist))))
                }
            }
        }

        // Quarter skirts: front and back side seams must match.
        if spec.skirtStyle == .aLine || spec.skirtStyle == .straight {
            let front = skirtPieces.first { $0.name.hasSuffix("Front") }
            let back = skirtPieces.first { $0.name.hasSuffix("Back") }
            if let front, let back,
               let f = skirtSideSeamLength(piece: front), let b = skirtSideSeamLength(piece: back) {
                if abs(f - b) > pairedSeamTolerance {
                    issues.append(.init(rule: "sideseam", piece: "Skirt", detail: String(format: "front side seam %.1f vs back %.1f", f, b)))
                }
            }
        }

        // A dress zipper runs through bodice and skirt: the skirt back (or a
        // half-circle panel) must be cut 2 so a center back seam exists.
        if spec.garment == .dress {
            let zipCarrier = skirtPieces.first { $0.name.hasSuffix("Back") } ?? skirtPieces.first
            if let zipCarrier, !zipCarrier.cutInstruction.contains("cut 2") {
                issues.append(.init(rule: "zipper", piece: zipCarrier.name, detail: "dress skirt back is '\(zipCarrier.cutInstruction)' — no center back seam for the zipper to continue into"))
            }
        }
        return issues
    }

    /// Full-garment bodice sewn waist: front + back halves, darts excluded,
    /// measured along the drafted waist curves. Both halves count twice
    /// (front on fold, back cut 2).
    private static func bodiceSewnWaist(_ bodice: BodiceDraft?) -> Double? {
        guard let bodice else { return nil }
        return (bodice.frontSewnWaist + bodice.backSewnWaist) * 2
    }

    private static func dartIntake(of piece: PatternPiece) -> Double {
        // Dart marking layout: move(legA), line(tip), line(legB).
        var intake = 0.0
        var index = 0
        while index + 2 < piece.markings.count {
            if case .move(let a) = piece.markings[index],
               case .line = piece.markings[index + 1],
               case .line(let b) = piece.markings[index + 2] {
                let width = abs(b.x - a.x)
                let drop = abs(b.y - a.y)
                if width > 2, drop < width { // darts are near-horizontal pairs; skip fold/gather lines
                    intake += width
                    index += 3
                    continue
                }
            }
            index += 1
        }
        return intake
    }

    /// Waist edge length of a skirt piece, measured along the drafted curve.
    private static func skirtWaistLength(piece: PatternPiece, style: SkirtStyle) -> Double? {
        guard piece.commands.count >= 2, case .move(let start) = piece.commands[0] else { return nil }
        switch style {
        case .aLine, .straight, .halfCircle:
            // Quarter pieces and circle panels both open with the waist edge.
            return pathLength(of: [.move(start), piece.commands[1]])
        case .gathered:
            guard case .line(let p) = piece.commands[1] else { return nil }
            return Double(abs(p.x - start.x))
        }
    }

    /// Quarter-skirt side seam: waist-to-hip curve + hip-to-hem line.
    private static func skirtSideSeamLength(piece: PatternPiece) -> Double? {
        guard piece.commands.count >= 4,
              case .curve(let sideWaistEnd, _, _) = piece.commands[1],
              case .curve = piece.commands[2],
              case .line = piece.commands[3] else { return nil }
        return pathLength(of: [.move(sideWaistEnd), piece.commands[2], piece.commands[3]])
    }

    // MARK: - Top

    private static func topIssues(
        spec: GarmentSpec,
        measurements m: BodyMeasurementsSnapshot,
        draft: DraftedPattern,
        bodice: BodiceDraft
    ) -> [ValidationIssue] {
        var issues: [ValidationIssue] = []
        let extra = spec.topLength.belowWaist
        guard let front = draft.pieces.first(where: { $0.name == "Top Front" }),
              let back = draft.pieces.first(where: { $0.name == "Top Back" }) else {
            return [.init(rule: "top", piece: draft.garment, detail: "top front/back pieces missing")]
        }
        // Guard against the hem extension silently not applying.
        let expectedFront = bodice.frontLength + extra
        let expectedBack = bodice.backLength + extra
        if Double(front.boundingBox.height) < expectedFront - 15 {
            issues.append(.init(rule: "top", piece: front.name, detail: String(format: "height %.0f, expected about %.0f — hem extension did not apply", Double(front.boundingBox.height), expectedFront)))
        }
        if Double(back.boundingBox.height) < expectedBack - 15 {
            issues.append(.init(rule: "top", piece: back.name, detail: String(format: "height %.0f, expected about %.0f — hem extension did not apply", Double(back.boundingBox.height), expectedBack)))
        }
        if extra > 0, let f = topSideSeamLength(piece: front), let b = topSideSeamLength(piece: back) {
            if abs(f - b) > pairedSeamTolerance {
                issues.append(.init(rule: "sideseam", piece: "Top", detail: String(format: "front side seam %.1f vs back %.1f", f, b)))
            }
        }
        return issues
    }

    /// Extended top layout tail: ..., armhole curve, side curve to hem,
    /// hem curve to center, center line, close.
    private static func topSideSeamLength(piece: PatternPiece) -> Double? {
        let count = piece.commands.count
        guard count >= 5,
              case .curve(let armholeBottom, _, _) = piece.commands[count - 5],
              case .curve = piece.commands[count - 4] else { return nil }
        return pathLength(of: [.move(armholeBottom), piece.commands[count - 4]])
    }

    // MARK: - Geometry helpers

    private static func flatten(from: CGPoint, to: CGPoint, cp1: CGPoint, cp2: CGPoint, steps: Int) -> [CGPoint] {
        var points: [CGPoint] = [from]
        for i in 1...steps {
            let t = CGFloat(i) / CGFloat(steps)
            let mt = 1 - t
            let x = mt*mt*mt*from.x + 3*mt*mt*t*cp1.x + 3*mt*t*t*cp2.x + t*t*t*to.x
            let y = mt*mt*mt*from.y + 3*mt*mt*t*cp1.y + 3*mt*t*t*cp2.y + t*t*t*to.y
            points.append(CGPoint(x: x, y: y))
        }
        return points
    }

    private static func angleDegrees(_ a: CGVector, _ b: CGVector) -> Double {
        let dot = Double(a.dx * b.dx + a.dy * b.dy)
        let magnitudes = Double(hypot(a.dx, a.dy) * hypot(b.dx, b.dy))
        guard magnitudes > 0 else { return 0 }
        let cosine = min(1, max(-1, dot / magnitudes))
        return acos(cosine) * 180 / .pi
    }

    private static func flattenOutline(_ commands: [PathCommand]) -> [(CGPoint, CGPoint)] {
        var segments: [(CGPoint, CGPoint)] = []
        var current = CGPoint.zero
        var subpathStart = CGPoint.zero
        for cmd in commands {
            switch cmd {
            case .move(let p):
                current = p; subpathStart = p
            case .line(let p):
                if hypot(p.x - current.x, p.y - current.y) > 0.01 { segments.append((current, p)) }
                current = p
            case .curve(let to, let cp1, let cp2):
                let samples = flatten(from: current, to: to, cp1: cp1, cp2: cp2, steps: 16)
                for i in 1..<samples.count where hypot(samples[i].x - samples[i-1].x, samples[i].y - samples[i-1].y) > 0.01 {
                    segments.append((samples[i - 1], samples[i]))
                }
                current = to
            case .close:
                if hypot(subpathStart.x - current.x, subpathStart.y - current.y) > 0.01 {
                    segments.append((current, subpathStart))
                }
                current = subpathStart
            }
        }
        return segments
    }

    /// Proper crossing test (shared endpoints between neighbours excluded by caller).
    private static func segmentsCross(_ s1: (CGPoint, CGPoint), _ s2: (CGPoint, CGPoint)) -> Bool {
        // If the segments share an endpoint (curve joins), that's not a crossing.
        let eps: CGFloat = 0.01
        let endpointsTouch = [s1.0, s1.1].contains { a in [s2.0, s2.1].contains { b in hypot(a.x - b.x, a.y - b.y) < eps } }
        if endpointsTouch { return false }

        func orientation(_ p: CGPoint, _ q: CGPoint, _ r: CGPoint) -> Double {
            Double((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x))
        }
        let d1 = orientation(s2.0, s2.1, s1.0)
        let d2 = orientation(s2.0, s2.1, s1.1)
        let d3 = orientation(s1.0, s1.1, s2.0)
        let d4 = orientation(s1.0, s1.1, s2.1)
        return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
    }
}
