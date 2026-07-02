import SwiftUI
import SwiftData

struct ClosetRoomView: View {
    @Query(sort: \SavedPattern.createdAt, order: .reverse) private var patterns: [SavedPattern]
    @Environment(\.modelContext) private var modelContext

    var body: some View {
        Group {
            if patterns.isEmpty {
                emptyState
            } else {
                ScrollView {
                    LazyVStack(spacing: 14) {
                        ForEach(patterns) { pattern in
                            NavigationLink(value: pattern.persistentModelID) {
                                row(pattern)
                            }
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.bottom, 32)
                }
                .navigationDestination(for: PersistentIdentifier.self) { id in
                    if let pattern = patterns.first(where: { $0.persistentModelID == id }), let draft = pattern.draft {
                        PatternResultView(draft: draft, existing: pattern)
                    }
                }
            }
        }
    }

    private func row(_ pattern: SavedPattern) -> some View {
        HStack(spacing: 14) {
            RoundedRectangle(cornerRadius: 12)
                .fill(Palette.blueLight)
                .frame(width: 56, height: 56)
                .overlay(
                    Image(systemName: "scissors")
                        .foregroundStyle(Palette.blueDark)
                )
            VStack(alignment: .leading, spacing: 4) {
                Text(pattern.name)
                    .font(Quicksand.semiBold(17))
                    .foregroundStyle(Palette.ink)
                Text(pattern.createdAt.formatted(date: .abbreviated, time: .omitted))
                    .font(Quicksand.regular(13))
                    .foregroundStyle(Palette.inkSecondary)
            }
            Spacer()
            Image(systemName: "chevron.right")
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(Palette.inkSecondary)
        }
        .padding(14)
        .background(Palette.card, in: RoundedRectangle(cornerRadius: 18))
        .stitchedBorder(cornerRadius: 18)
        .contextMenu {
            Button(role: .destructive) {
                modelContext.delete(pattern)
            } label: {
                Label("Delete pattern", systemImage: "trash")
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Spacer()
            Image("DoodleCloset")
                .resizable()
                .scaledToFit()
                .frame(maxHeight: 200)
                .padding(.horizontal, 48)
            Text("your closet is waiting")
                .font(Quicksand.bold(22))
                .foregroundStyle(Palette.ink)
            Text("every pattern you create lives here,\nready to sew again anytime")
                .font(Quicksand.regular(15))
                .foregroundStyle(Palette.inkSecondary)
                .multilineTextAlignment(.center)
            Spacer()
            Spacer()
        }
    }
}
