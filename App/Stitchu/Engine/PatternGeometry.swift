import Foundation
import CoreGraphics

/// All engine geometry is in millimeters, same convention as FreeSewing.
/// Pieces are drawn in their own local coordinate space with origin top-left.

enum PathCommand: Codable, Equatable {
    case move(CGPoint)
    case line(CGPoint)
    case curve(to: CGPoint, cp1: CGPoint, cp2: CGPoint)
    case close

    private enum CodingKeys: String, CodingKey { case type, x, y, cp1x, cp1y, cp2x, cp2y }
    private enum Kind: String, Codable { case move, line, curve, close }

    func encode(to encoder: Encoder) throws {
        var c = encoder.container(keyedBy: CodingKeys.self)
        switch self {
        case .move(let p):
            try c.encode(Kind.move, forKey: .type)
            try c.encode(p.x, forKey: .x); try c.encode(p.y, forKey: .y)
        case .line(let p):
            try c.encode(Kind.line, forKey: .type)
            try c.encode(p.x, forKey: .x); try c.encode(p.y, forKey: .y)
        case .curve(let to, let cp1, let cp2):
            try c.encode(Kind.curve, forKey: .type)
            try c.encode(to.x, forKey: .x); try c.encode(to.y, forKey: .y)
            try c.encode(cp1.x, forKey: .cp1x); try c.encode(cp1.y, forKey: .cp1y)
            try c.encode(cp2.x, forKey: .cp2x); try c.encode(cp2.y, forKey: .cp2y)
        case .close:
            try c.encode(Kind.close, forKey: .type)
        }
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        switch try c.decode(Kind.self, forKey: .type) {
        case .move:
            self = .move(CGPoint(x: try c.decode(Double.self, forKey: .x), y: try c.decode(Double.self, forKey: .y)))
        case .line:
            self = .line(CGPoint(x: try c.decode(Double.self, forKey: .x), y: try c.decode(Double.self, forKey: .y)))
        case .curve:
            self = .curve(
                to: CGPoint(x: try c.decode(Double.self, forKey: .x), y: try c.decode(Double.self, forKey: .y)),
                cp1: CGPoint(x: try c.decode(Double.self, forKey: .cp1x), y: try c.decode(Double.self, forKey: .cp1y)),
                cp2: CGPoint(x: try c.decode(Double.self, forKey: .cp2x), y: try c.decode(Double.self, forKey: .cp2y))
            )
        case .close:
            self = .close
        }
    }
}

struct Grainline: Codable, Equatable {
    var from: CGPoint
    var to: CGPoint
}

struct PatternPiece: Codable, Identifiable, Equatable {
    var id: UUID = UUID()
    var name: String
    var cutInstruction: String
    var commands: [PathCommand]
    /// Internal markings drawn inside the piece: darts, fold lines, notch ticks.
    var markings: [PathCommand] = []
    var grainline: Grainline?
    /// Seam allowance in mm already communicated to the user; outline is the sewing line.
    var seamAllowance: Double

    var boundingBox: CGRect {
        var minX = CGFloat.greatestFiniteMagnitude, minY = CGFloat.greatestFiniteMagnitude
        var maxX = -CGFloat.greatestFiniteMagnitude, maxY = -CGFloat.greatestFiniteMagnitude
        func eat(_ p: CGPoint) {
            minX = min(minX, p.x); minY = min(minY, p.y)
            maxX = max(maxX, p.x); maxY = max(maxY, p.y)
        }
        for cmd in commands {
            switch cmd {
            case .move(let p), .line(let p): eat(p)
            case .curve(let to, let cp1, let cp2): eat(to); eat(cp1); eat(cp2)
            case .close: break
            }
        }
        guard minX < maxX, minY < maxY else { return .zero }
        return CGRect(x: minX, y: minY, width: maxX - minX, height: maxY - minY)
    }

    var cgPath: CGPath {
        let path = CGMutablePath()
        for cmd in commands {
            switch cmd {
            case .move(let p): path.move(to: p)
            case .line(let p): path.addLine(to: p)
            case .curve(let to, let cp1, let cp2): path.addCurve(to: to, control1: cp1, control2: cp2)
            case .close: path.closeSubpath()
            }
        }
        return path
    }
}

struct DraftedPattern: Codable {
    var garment: String
    var pieces: [PatternPiece]
    var fabricAdviceKey: String
    /// Estimated fabric length in meters for 140cm wide fabric.
    var fabricMeters140: Double
    var guideSteps: [String]
}
