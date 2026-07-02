import UIKit

/// Exports a drafted pattern to a print-at-home A4 PDF at true 1:1 scale.
/// Pieces are tiled across pages with glue margins and a 3 cm calibration
/// square on page 1 so the user can verify printer scale.
enum PatternPDFExporter {
    /// 1 mm in PDF points.
    static let mm: CGFloat = 72.0 / 25.4
    /// A4 in points.
    static let pageSize = CGSize(width: 210 * mm, height: 297 * mm)
    /// Printable area margin (10 mm) + tile overlap for gluing (10 mm).
    static let pageMargin: CGFloat = 10 * mm
    static let tileOverlap: CGFloat = 10 * mm

    static func export(draft: DraftedPattern) throws -> URL {
        let renderer = UIGraphicsPDFRenderer(bounds: CGRect(origin: .zero, size: pageSize))
        let safeName = draft.garment.replacingOccurrences(of: " ", with: "-")
        let url = FileManager.default.temporaryDirectory
            .appendingPathComponent("stitchu-\(safeName).pdf")

        try renderer.writePDF(to: url) { context in
            drawCoverPage(context: context, draft: draft)
            for piece in draft.pieces {
                drawPiece(piece, context: context)
            }
        }
        return url
    }

    private static func drawCoverPage(context: UIGraphicsPDFRendererContext, draft: DraftedPattern) {
        context.beginPage()
        let title = "Stitchu — \(draft.garment)"
        (title as NSString).draw(
            at: CGPoint(x: pageMargin, y: pageMargin),
            withAttributes: [
                .font: UIFont.boldSystemFont(ofSize: 24),
                .foregroundColor: UIColor(red: 0.17, green: 0.24, blue: 0.31, alpha: 1),
            ]
        )

        // Calibration square: exactly 30 x 30 mm.
        let square = CGRect(x: pageMargin, y: pageMargin + 50, width: 30 * mm, height: 30 * mm)
        let cg = context.cgContext
        cg.setStrokeColor(UIColor.black.cgColor)
        cg.setLineWidth(1)
        cg.stroke(square)
        ("this square must measure exactly 3 x 3 cm — check with a ruler before cutting" as NSString).draw(
            in: CGRect(x: square.maxX + 16, y: square.minY, width: pageSize.width - square.maxX - pageMargin - 16, height: square.height),
            withAttributes: [.font: UIFont.systemFont(ofSize: 12)]
        )

        var y = square.maxY + 30
        let info = [
            "pieces: " + draft.pieces.map(\.name).joined(separator: ", "),
            String(format: "fabric: about %.1f m of 140 cm wide fabric", draft.fabricMeters140),
            "seam allowance is NOT included — add it when cutting (see each piece).",
            "pattern pages tile left-to-right, top-to-bottom. Glue at the dashed overlap lines.",
        ]
        for line in info {
            (line as NSString).draw(
                at: CGPoint(x: pageMargin, y: y),
                withAttributes: [.font: UIFont.systemFont(ofSize: 12)]
            )
            y += 20
        }
    }

    private static func drawPiece(_ piece: PatternPiece, context: UIGraphicsPDFRendererContext) {
        let box = piece.boundingBox
        guard box.width > 0, box.height > 0 else { return }

        let usableWidth = pageSize.width - pageMargin * 2 - tileOverlap
        let usableHeight = pageSize.height - pageMargin * 2 - tileOverlap - 24 // label strip
        let pieceWidthPt = box.width * mm
        let pieceHeightPt = box.height * mm
        let columns = max(1, Int(ceil(pieceWidthPt / usableWidth)))
        let rows = max(1, Int(ceil(pieceHeightPt / usableHeight)))

        for row in 0..<rows {
            for column in 0..<columns {
                context.beginPage()
                let cg = context.cgContext

                let label = "\(piece.name) — \(piece.cutInstruction) — tile \(row + 1)\(Character(UnicodeScalar(65 + column % 26)!)) of \(rows)x\(columns)"
                (label as NSString).draw(
                    at: CGPoint(x: pageMargin, y: pageMargin - 4),
                    withAttributes: [.font: UIFont.systemFont(ofSize: 11)]
                )

                let originX = pageMargin
                let originY = pageMargin + 20
                cg.saveGState()
                cg.clip(to: CGRect(x: originX, y: originY, width: usableWidth + tileOverlap, height: usableHeight + tileOverlap))

                // Position this tile's window over the piece (mm space -> points).
                let tx = originX - (CGFloat(column) * usableWidth) - box.minX * mm
                let ty = originY - (CGFloat(row) * usableHeight) - box.minY * mm
                cg.translateBy(x: tx, y: ty)
                cg.scaleBy(x: mm, y: mm)

                cg.setStrokeColor(UIColor(red: 0.29, green: 0.53, blue: 0.71, alpha: 1).cgColor)
                cg.setLineWidth(0.6)
                cg.addPath(piece.cgPath)
                cg.strokePath()

                if !piece.markings.isEmpty {
                    let markingPiece = PatternPiece(name: "", cutInstruction: "", commands: piece.markings, seamAllowance: 0)
                    cg.setLineDash(phase: 0, lengths: [3, 2])
                    cg.addPath(markingPiece.cgPath)
                    cg.strokePath()
                    cg.setLineDash(phase: 0, lengths: [])
                }

                if let grainline = piece.grainline {
                    cg.setStrokeColor(UIColor.darkGray.cgColor)
                    cg.move(to: grainline.from)
                    cg.addLine(to: grainline.to)
                    cg.strokePath()
                }
                cg.restoreGState()

                // Overlap guide lines for gluing.
                cg.setStrokeColor(UIColor.lightGray.cgColor)
                cg.setLineDash(phase: 0, lengths: [4, 3])
                if column < columns - 1 {
                    cg.move(to: CGPoint(x: originX + usableWidth, y: originY))
                    cg.addLine(to: CGPoint(x: originX + usableWidth, y: originY + usableHeight + tileOverlap))
                }
                if row < rows - 1 {
                    cg.move(to: CGPoint(x: originX, y: originY + usableHeight))
                    cg.addLine(to: CGPoint(x: originX + usableWidth + tileOverlap, y: originY + usableHeight))
                }
                cg.strokePath()
                cg.setLineDash(phase: 0, lengths: [])
            }
        }
    }
}
