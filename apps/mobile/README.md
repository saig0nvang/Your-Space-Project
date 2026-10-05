# YourSpace — app mobile (prototype UI/UX)

Prototype giao diện cho app iOS (React Native + Expo). **Thuần giả lập:** không backend, không camera thật, không AI thật, không thanh toán thật. Mục đích: review flow và trạng thái trên máy ảo hoặc Expo Go.

- Kế hoạch màn và điều hướng: [`docs/screens.md`](../../docs/screens.md)
- Hệ thiết kế (nguồn sự thật cho màu, chữ, spacing, component): [`design-system/yourspace/MASTER.md`](../../design-system/yourspace/MASTER.md)
- Bối cảnh sản phẩm: [`PRODUCT.md`](../../PRODUCT.md)
- Bàn giao, việc cần kiểm, đề xuất chờ duyệt: [`REVIEW.md`](REVIEW.md)

## Chạy

Cần **Node 22.13+ hoặc 24.3+** (Expo SDK 57). Máy dev đã có Node 24.19 qua nvm:

```bash
nvm use 24            # hoặc: export PATH=$HOME/.nvm/versions/node/v24.19.0/bin:$PATH
pnpm install          # ở gốc repo
cd apps/mobile
npx expo start        # quét QR bằng Expo Go trên điện thoại, hoặc nhấn i / a
```

- **iOS Simulator** cần macOS + Xcode. Trên Linux: dùng Expo Go trên iPhone thật, Android emulator (nhấn `a`), hoặc xem nhanh trên trình duyệt (nhấn `w`; sheet và modal hiển thị khác iOS).
- App chỉ dùng module có sẵn trong Expo Go, nên không cần development build.

## Kiểm tra

```bash
npx tsc --noEmit                                       # typecheck
npx expo lint                                          # lint
npx expo export --platform ios --platform android --platform web   # build bundle JS (kiểm tra build)
```

## Giả lập trạng thái

Tab **Tôi → Giả lập trạng thái** (chỉ hiện ở bản dev) bật/tắt: AI tạm ngưng, ảnh khó phân tích, từ chối quyền camera, xóa đồ cũ thất bại, mất mạng, máy yếu (xem 2D), thanh toán thất bại / hết hàng / đổi giá. Mã OTP thử: `123456`. Ở chi tiết đơn có nút giả lập chuyển trạng thái đơn và khiếu nại.

## Cấu trúc

```
src/
  app/            route (Expo Router): (tabs)/(explore), (tabs)/rooms, (tabs)/me, capture, editor, buy, save, product-sheet
  features/       màn và component theo nhóm: explore, capture, editor, buy, rooms, me, orders
  components/ui/  component dùng chung theo MASTER.md
  theme/          token (tokens.ts chép từ MASTER.md), useTheme, kiểu header
  data/           catalog mẫu, ảnh phòng mẫu (assets/rooms, nguồn trong samplePhotos.ts)
  services/       AI, thanh toán, OTP, đơn hàng, lead — tất cả là giả lập
  store/          dữ liệu trên máy (zustand + AsyncStorage), phiên chụp, cờ giả lập
  flows/          điều hướng xuyên nhóm màn
  lib/            câu chữ bắt buộc, định dạng tiền/ngày/SĐT, xác nhận
```

Mọi màu, chữ, spacing, bo góc lấy từ `src/theme/tokens.ts` (chép đúng MASTER.md). Câu bắt buộc (consent ảnh, giữ tiền, chip AI) ở `src/lib/copy.ts`.
