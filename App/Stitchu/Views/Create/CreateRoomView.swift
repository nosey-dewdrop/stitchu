import SwiftUI
import PhotosUI

struct CreateRoomView: View {
    @State private var photoItem: PhotosPickerItem?
    @State private var photoData: Data?
    @State private var showPhotoFlow = false

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 16) {
                PhotosPicker(selection: $photoItem, matching: .images) {
                    pathCard(
                        icon: "camera.fill",
                        tint: Palette.blue,
                        tintLight: Palette.blueLight,
                        title: "from a photo",
                        subtitle: "upload a garment you love — we'll read it and draft your pattern",
                        badge: nil
                    )
                }
                pathCard(
                    icon: "slider.horizontal.3",
                    tint: Palette.sage,
                    tintLight: Palette.sageLight,
                    title: "design it yourself",
                    subtitle: "pick a neckline, sleeves, skirt — watch it come together",
                    badge: "soon"
                )
                pathCard(
                    icon: "sparkles",
                    tint: Palette.lavender,
                    tintLight: Palette.lavenderLight,
                    title: "describe your dream",
                    subtitle: "tell us what you imagine, we'll show it and pattern it",
                    badge: "premium · soon"
                )
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 32)
        }
        .onChange(of: photoItem) {
            guard let photoItem else { return }
            Task {
                if let data = try? await photoItem.loadTransferable(type: Data.self) {
                    photoData = data
                    showPhotoFlow = true
                }
            }
        }
        .navigationDestination(isPresented: $showPhotoFlow) {
            if let photoData {
                PhotoAnalysisView(photoData: photoData)
            }
        }
    }

    private func pathCard(icon: String, tint: Color, tintLight: Color, title: String, subtitle: String, badge: String?) -> some View {
        HStack(spacing: 16) {
            RoundedRectangle(cornerRadius: 16)
                .fill(tintLight)
                .frame(width: 62, height: 62)
                .overlay(
                    Image(systemName: icon)
                        .font(.system(size: 24))
                        .foregroundStyle(tint)
                )
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 8) {
                    Text(title)
                        .font(Quicksand.bold(18))
                        .foregroundStyle(Palette.ink)
                    if let badge {
                        Text(badge)
                            .font(Quicksand.semiBold(11))
                            .foregroundStyle(Palette.blueDark)
                            .padding(.vertical, 3)
                            .padding(.horizontal, 8)
                            .background(Palette.blueLight, in: Capsule())
                    }
                }
                Text(subtitle)
                    .font(Quicksand.regular(14))
                    .foregroundStyle(Palette.inkSecondary)
                    .multilineTextAlignment(.leading)
            }
            Spacer(minLength: 0)
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Palette.card, in: RoundedRectangle(cornerRadius: 22))
        .stitchedBorder(cornerRadius: 22)
    }
}
