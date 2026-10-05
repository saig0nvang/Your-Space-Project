# Design System Master File — YourSpace

> **LOGIC:** Khi dựng một màn cụ thể, xem `design-system/yourspace/pages/[tên-màn].md` trước.
> Nếu file đó tồn tại, quy tắc của nó **ghi đè** file Master này. Nếu không, theo đúng các quy tắc dưới đây.

---

**Project:** YourSpace
**Generated:** 2026-10-03 10:19:14 bởi ui-ux-pro-max, query `"interior design app immersive photography"`, `--variance 6`, `--persist --force` (founder đồng ý).
**Hướng:** A · Phòng trưng bày — founder chọn ngày 2026-10-03 sau khi xem preview 3 hướng (công đoạn 1). Thay hệ "Minimalism & Swiss, xám ấm + hổ phách" trước đó (bản cũ lưu ngoài repo).
**Chỉnh tay (chuyển sang native, theo preview đã duyệt):** font Cinzel / Josefin Sans → Bricolage Grotesque (tiêu đề) + font hệ thống (giao diện) vì Cinzel không có subset vietnamese; nút chính màu đen thay cho vàng đồng (vàng đồng giữ cho chữ nhấn); `muted` `#E8ECF0` → `#F4F4F5` và `mutedForeground` `#475569` → `#52525B` cho trung tính, không ám xanh; thêm `borderStrong`, `accentText`, `destructiveText`, theme tối; spec CSS → React Native; bỏ hover / cursor.
**Category:** Architecture / Interior
**Nền tảng:** React Native (Expo), iOS trước, Android chỉnh sau (xem `PRODUCT.md`). Đơn vị là pt (iOS) / dp (Android).

---

## Global Rules

### Color Tokens

Component chỉ dùng token, không ghi mã hex trực tiếp. Hai theme được thiết kế và kiểm cùng nhau.

| Token | Sáng | Tối | Dùng cho |
|-------|------|-----|----------|
| `background` | `#FFFFFF` | `#0F0F0F` | Nền màn |
| `foreground` | `#171717` | `#FAFAFA` | Chữ chính |
| `card` | `#FFFFFF` | `#1C1C1C` | Thẻ, sheet, thanh nổi |
| `cardForeground` | `#171717` | `#FAFAFA` | Chữ trên thẻ |
| `muted` | `#F4F4F5` | `#27272A` | Ô ảnh món, chip, ô nhập, nút tròn |
| `mutedForeground` | `#52525B` | `#A1A1AA` | Chữ phụ, meta |
| `primary` | `#171717` | `#FAFAFA` | Nền control nhấn (chip đang chọn, segmented đang chọn) |
| `onPrimary` | `#FFFFFF` | `#0F0F0F` | Chữ trên `primary` |
| `primaryText` | `#171717` | `#FAFAFA` | Chữ / viền nút phụ |
| `secondary` | `#404040` | `#D4D4D8` | Icon nhấn phụ |
| `onSecondary` | `#FFFFFF` | `#0F0F0F` | Chữ trên `secondary` |
| `accent` | `#171717` | `#FAFAFA` | **Hành động chính** — nền nút chính dạng viên thuốc, tối đa một nút mỗi màn |
| `onAccent` | `#FFFFFF` | `#0F0F0F` | Chữ trên `accent` |
| `accentText` | `#A16207` | `#D9A441` | Vàng đồng: giá ở danh sách, link, một điểm nhấn mỗi màn |
| `destructive` | `#DC2626` | `#F87171` | Nền hành động xóa, hủy |
| `onDestructive` | `#FFFFFF` | `#000000` | Chữ trên `destructive` |
| `destructiveText` | `#B91C1C` | `#FCA5A5` | Chữ báo lỗi |
| `border` | `#E5E5E5` | `#2A2A2A` | Đường chia mảnh (trang trí) |
| `borderStrong` | `#8A8A8A` | `#71717A` | Viền control: ô nhập, checkbox (≥ 3:1) |
| `ring` | `#171717` | `#FAFAFA` | Viền focus |
| `scrim` | đen 50% | đen 50% | Lớp phủ sau sheet |
| `onImage` | `#FFFFFF` | `#FFFFFF` | Chữ đặt trên ảnh; luôn kèm dải tối (đen 0 → 55%) phía dưới chữ, đo ≥ 4.5:1 trên vùng sáng nhất |

**Color Notes (uupm):** Minimal black + accent gold. Ở bản native, **đen là màu hành động**, **vàng đồng là màu của giá trị** (giá, điểm nhấn); không có màu nào khác trong giao diện — màu đến từ ảnh phòng và ảnh món.

#### Quy tắc dùng màu

- Chữ thường ≥ 4.5:1; viền control và icon mang nghĩa ≥ 3:1, ở **cả hai theme**.
- `accentText` (vàng đồng) chỉ đặt trên `background` hoặc `card`; **không đặt trên `muted`** (sáng 4.48:1, không đạt). Tối đa một cụm vàng đồng nổi bật mỗi màn ngoài giá trong danh sách.
- Thẻ trắng trên nền trắng không tách bằng bóng: dùng ô `muted` cho ảnh món, hoặc khoảng trắng lớn; viền `border` chỉ khi cần.
- Trạng thái (lỗi, thành công, đã mua, hết hàng) luôn có icon + chữ; không dùng màu một mình.
- Ảnh phòng, ảnh phong cách và ảnh món hiển thị như ảnh gốc, không phủ màu theme.

#### Tương phản đã kiểm (công thức WCAG 2.x)

| Cặp | Sáng | Tối |
|-----|------|-----|
| `foreground` / `background` · `muted` | 17.93 · 16.31 | 18.36 · 14.27 |
| `mutedForeground` / `background` · `card` · `muted` | 7.73 · 7.73 · 7.03 | 7.48 · 6.65 · 5.81 |
| `onAccent` / `accent` | 17.93 | 18.36 |
| `accentText` / `background` · `card` · `muted` | 4.92 · 4.92 · **4.48** | 8.52 · 7.58 · 6.62 |
| `destructiveText` / `background` · `muted` | 6.47 · 5.89 | 10.10 · 7.85 |
| `onDestructive` / `destructive` | 4.83 | 7.59 |
| `borderStrong` / `background` · `card` · `muted` | 3.45 · 3.45 · 3.14 | 3.97 · 3.53 · 3.08 |
| `ring` / `background` | 17.93 | 18.36 |

### Màu chất liệu (nội dung minh họa)

Màu của **nội dung** (giống điểm ảnh của ảnh) dùng cho chấm mẫu chất liệu và hình minh họa dự phòng khi món chưa có ảnh. **Không** dùng cho chữ, nền, viền hay trạng thái. Giống nhau ở hai theme. Chấm mẫu luôn đi kèm tên chất liệu bằng chữ.

| Token | Màu | Chất liệu |
|-------|-----|-----------|
| `oak` | `#C8A47E` | Gỗ sồi |
| `ash` | `#D9C4A2` | Gỗ tần bì |
| `walnut` | `#6E4B34` | Gỗ óc chó |
| `rattan` | `#C39B5F` | Mây |
| `paperCord` | `#CDB48B` | Dây giấy |
| `linen` | `#D8CDBE` | Vải lanh |
| `woven` | `#B7A48C` | Vải dệt |
| `velvetMoss` | `#5F6B4A` | Nhung xanh rêu |
| `leather` | `#33302D` | Da |
| `brass` | `#B48A4C` | Đồng |
| `steelBlack` | `#2E2D2B` | Thép sơn đen |
| `chrome` | `#B9BEC4` | Thép mạ crôm |
| `glass` | `#CFDDDF` | Kính |
| `frostedGlass` | `#E8E6E1` | Kính mờ |

Bóng tiếp đất dưới món đặt trên ảnh phòng: đen, gradient tỏa tròn 42% → 0 (là nội dung, như bóng trong ảnh).

### Ảnh (nhân vật chính của hướng này)

- **Ảnh dẫn dắt màn:** màn gốc của tab Khám phá và màn chi tiết phong cách mở bằng ảnh tràn chiều ngang (cao 45–55% màn), không viền, không bo ở mép màn; khối nội dung trồi lên đè mép dưới ảnh với góc trên `radius-xl`.
- **Ảnh món** là ảnh tách nền đặt trên ô `muted`, căn giữa, chừa lề 8–12%.
- Ảnh trong khối nội dung bo `radius-md`.
- Nguồn ảnh bản thử: Pexels, Unsplash (giấy phép cho dùng tự do), ghi nguồn ở tab Tôi.

### Typography

- **Chữ tiêu đề:** **Bricolage Grotesque** (Google Fonts, có subset vietnamese — kiểm trong `data/google-fonts.csv`), weight 700/800, khoảng chữ âm. Nạp bằng `@expo-google-fonts/bricolage-grotesque` (0.4.1).
- **Chữ giao diện:** font hệ thống — SF Pro trên iOS, Roboto trên Android; tự co giãn theo Dynamic Type.
- **Mood (uupm):** architecture, interior, premium, statement. Bản sinh tự động chọn Cinzel + Josefin Sans; Cinzel không có tiếng Việt nên bị loại.

**Thang chữ** (cỡ mặc định iOS; người dùng phóng to thì tất cả co giãn theo):

| Vai | Font | Cỡ / dòng | Weight | Khoảng chữ |
|-----|------|-----------|--------|------------|
| Display | Bricolage Grotesque | 44 / 48 | 800 | −1.5 |
| Large Title | Bricolage Grotesque | 34 / 40 | 800 | −1 |
| Title 1 | Bricolage Grotesque | 28 / 34 | 700 | −0.6 |
| Title 2 | Hệ thống | 22 / 28 | 600 | 0 |
| Title 3 | Hệ thống | 20 / 25 | 600 | 0 |
| Headline | Hệ thống | 17 / 22 | 600 | 0 |
| Body | Hệ thống | 17 / 22 | 400 | 0 |
| Callout | Hệ thống | 16 / 21 | 400 | 0 |
| Subheadline | Hệ thống | 15 / 20 | 400 | 0 |
| Footnote | Hệ thống | 13 / 18 | 400 | 0 |
| Caption 1 | Hệ thống | 12 / 16 | 400 | 0 |
| Caption 2 | Hệ thống | 11 / 13 | 400 | 0 |

- **Display** chỉ dùng cho câu mở của màn gốc mỗi tab và tên phong cách trên ảnh; tối đa một lần mỗi màn.
- Dòng tiêu đề Bricolage ≈ 1.09–1.21× cỡ chữ để dấu tiếng Việt chồng tầng không chạm dòng trên. Kiểm mọi style bằng câu: "Ảnh được gửi lên hệ thống để xử lý và xóa ngay sau đó."
- Giá và số tiền: `fontVariant: ['tabular-nums']`; tổng tiền ở thanh dự toán dùng Bricolage 700.
- Không tắt `allowFontScaling` cho chữ nội dung. Không dùng chữ nhỏ hơn 11.

### Spacing

Nhịp 4/8. Lề màn mặc định `space-md` (16); màn mở bằng ảnh dùng lề 22 cho khối chữ.

| Token | Giá trị | Dùng cho |
|-------|---------|----------|
| `space-xs` | 4 | Khe sát |
| `space-sm` | 8 | Khe icon–chữ, khoảng giữa các vùng chạm (tối thiểu) |
| `space-md` | 16 | Padding chuẩn, lề màn |
| `space-lg` | 24 | Padding thẻ, padding sheet |
| `space-xl` | 32 | Khoảng lớn |
| `space-2xl` | 48 | Tách nhóm nội dung |
| `space-3xl` | 64 | Khoảng đầu màn lớn |

### Radius

| Token | Giá trị | Dùng cho |
|-------|---------|----------|
| `radius-sm` | 8 | Ô nhập, chip nhỏ |
| `radius-md` | 14 | Thẻ, ô ảnh món, ảnh trong nội dung |
| `radius-lg` | 20 | Góc trên của sheet |
| `radius-xl` | 28 | Khối nội dung trồi lên đè ảnh |
| `radius-pill` | 999 | Nút chính, nút phụ, chip AI |

### Shadow / Elevation

Hướng này phẳng: tách lớp bằng khoảng trắng và ô `muted`, không bằng bóng. Bóng chỉ cho phần tử nổi trên ảnh (chip, nút tròn) và sheet. Theme tối không dựa vào bóng.

| Level | iOS (offsetY / opacity / radius) | Android `elevation` | Dùng cho |
|-------|----------------------------------|---------------------|----------|
| `shadow-sm` | 1 / 0.05 / 1 | 1 | Nâng nhẹ |
| `shadow-md` | 4 / 0.10 / 3 | 3 | Nút nổi trên ảnh |
| `shadow-lg` | 10 / 0.10 / 8 | 6 | Sheet, menu |
| `shadow-xl` | 20 / 0.15 / 12 | 10 | Phần tử nổi lớn trên ảnh |

---

## Component Specs

Dùng `Pressable` cho mọi thứ bấm được. Vùng chạm ≥ 44×44 (iOS) / 48×48 (Android); icon nhỏ thì mở rộng bằng `hitSlop`. Mọi control có `accessibilityRole`, `accessibilityLabel`, `accessibilityState` đúng.

### Buttons

**Nút chính** — tối đa một nút mỗi màn.

- Nền `accent` (đen / trắng ở theme tối), chữ `onAccent`, style Headline (17 / 600), dạng viên thuốc `radius-pill`.
- `minHeight` 54 cho nút toàn chiều ngang ở chân màn, 44 cho nút trong dòng; `paddingHorizontal` 24.
- Nhấn: phản hồi trong 100 ms (opacity 0.85 trên iOS, `android_ripple` trên Android); không đổi kích thước hay vị trí.
- Đang xử lý: giữ nguyên kích thước, spinner + chữ ngắn, không nhận bấm lần hai. Tắt: opacity 0.4 + `accessibilityState.disabled`.

**Nút phụ** — nền trong suốt, viền 1.5 `primaryText`, chữ `primaryText`, `radius-pill`, cùng kích thước và phản hồi nhấn.

**Nút chữ** — chữ `foreground` weight 600 (hoặc `accentText` cho link "Xem tất cả"), vùng chạm ≥ 44.

**Nút tròn trên ảnh** — 40–44, nền `card` (theme sáng) với `shadow-md`, icon `foreground`.

### Cards

- Không dùng thẻ có viền + bóng làm mặc định. Món: ô ảnh `muted` `radius-md` + tên (Subheadline 600) + giá (`accentText` 600) bên dưới, không khung.
- Nhóm thông tin dạng danh sách (đơn hàng, cài đặt): danh sách nhóm kiểu iOS, nền `muted`, `radius-md`.

### Inputs

- `minHeight` 44, `paddingHorizontal` 16, `paddingVertical` 12, `borderRadius` `radius-sm`, style Body (17).
- Viền 1 `borderStrong`; focus: viền 2 `ring`. Nhãn luôn hiện phía trên ô.
- Lỗi: icon + chữ `destructiveText` ngay dưới ô, nói nguyên nhân và cách sửa.
- Đúng bàn phím và autofill (`keyboardType`, `textContentType` / `autoComplete`).

### Sheets

- Sheet hệ thống (native stack `presentation: 'formSheet'` / `pageSheet`), góc trên `radius-lg`, nền `card`.
- Kéo xuống để đóng; luôn có nút Đóng rõ ràng. Có thay đổi chưa lưu thì hỏi lại trước khi đóng.
- Lớp phủ `scrim`. Không dùng blur trang trí.

### Thanh tác vụ của món (founder yêu cầu 2026-10-03, kiểu IKEA Kreativ)

- Hiện khi chạm vào một món đã đặt; nổi ngay trên món, căn giữa theo món, cách mép màn ≥ 8; ẩn khi đang kéo / chụm món. Món cao chạm vùng trên thì thanh ghim ngay dưới thanh trên + một hàng thông báo chừa sẵn (để thông báo hiện / tắt không làm thanh nhảy dưới ngón tay), đè lên đầu món — không bao giờ nằm dưới chân món (chỗ của số đo và tay cầm dời).
- Viên thuốc nền `accent`, `radius-pill`, `shadow-lg`, padding 8 ngang. Mỗi tác vụ: icon Phosphor 20 + nhãn Caption 2 / 600 màu `onAccent`, vùng chạm 58 × 52; nhãn phóng theo cỡ chữ hệ thống tối đa 1.25× để vẫn vừa ô.
- Thứ tự: **Mua** | Lật · Đổi món · Hợp với · Nhân bản · **Bỏ**. "Mua" tách bằng vạch `onAccent` 25%; "Bỏ" (phá hủy) ở cuối, chữ `destructiveText` của theme ngược màu nền (≥ 4.5:1), không hỏi lại vì có Hoàn tác.
- Món đã mua: "Mua" thành "Đã mua" (tắt), "Đổi món" tắt.
- Xuất hiện: mờ dần + trồi 6pt + phóng 0.94 → 1 trong 200 ms (ease-out mạnh); biến mất: mờ 110 ms. Reduce Motion: hiện ngay. Web (bản demo): chỉ mờ dần, vì web chỉ chạy hiệu ứng dựng sẵn của Reanimated.
- **Viền chọn bám dáng món:** quầng `onImage` theo kênh alpha của ảnh tách nền (iOS: bóng lớp không nền, bán kính 3; web: drop-shadow; Android: các bản tô màu lệch 3pt). Món chưa có ảnh dùng khung chữ nhật cũ.
- Khay đáy khi chọn món chỉ giữ thông tin (tên, giá, kích thước thật), "Đổi với" và Tỷ lệ; không lặp tác vụ của thanh.

### Số đo trên món (founder duyệt 2026-10-03, theo IKEA Kreativ)

- Hiện khi một món đang được chọn: đường kích thước `onImage` dày 1.5 có vạch 9 ở hai đầu, chạy ngay dưới chân món (rộng) và dọc cạnh bên (cao; bên phải, không đủ chỗ thì bên trái, hai bên đều chật thì bên rộng hơn), `shadow-sm` để nổi trên ảnh sáng. Đường và chip luôn nằm trong phần ảnh nhìn thấy, cách mép màn ≥ 4; bị kéo vào trong thì chip đè lên đường của nó.
- Chip trên đường: viên thuốc `accent`, Caption 1 / 600 `onAccent`, chữ số đều; "rộng 220 cm", "cao 72 cm" — luôn là **kích thước thật** của món, không đổi theo tỷ lệ hiển thị. Độ sâu ở panel món.
- Ẩn với trình đọc màn hình (số đo đã đọc ở panel món).

### Panel món đang chọn (khay đáy)

- **Cao đúng bằng khay thu gọn** (founder 2026-10-04: chạm món mà panel cao lên là che sàn, giới hạn thao tác): chạm món không làm ảnh bị che thêm hay bị nâng lên, kéo món vẫn được tới sát mép khay.
- Dòng 1: tên (Headline) · giá (`accentText`) · "rộng × sâu × cao cm" (Footnote, chữ số đều) · nút Chi tiết · "Xong".
- Hàng **"Đổi với"**: nhãn "Đổi với" (Footnote 600) đứng đầu hàng, rồi các ô ảnh món 56 trên nền `muted` + giá `accentText` canh giữa ô rộng 72, cuộn ngang, món cùng loại (cùng phong cách đứng trước); chạm là thay tại chỗ, có Hoàn tác. Món đã mua không có hàng này.
- **Không có Tỷ lệ, không chụm để phóng to / thu nhỏ** (founder quyết 2026-10-04): món luôn đúng kích thước thật, để người dùng không lầm tưởng món vừa không gian.

### Thước xoay món (founder yêu cầu 2026-10-04, theo IKEA Kreativ)

- Chỉ món 3D (món ảnh phẳng chỉ có Lật). Thước dọc rộng 44, nền `card`, `radius-pill`, `shadow-md`, ở mép trái ảnh cách mép màn 24 (ngoài dải vuốt quay lại); cao tối đa 260, nằm ở khoảng trống lớn hơn phía trên hoặc dưới thanh tác vụ để thanh không che. Ẩn khi đang kéo món.
- Thước trượt theo ngón tay, vạch giữa đứng yên: 3 pt mỗi độ; vạch ngắn mỗi 5° (`borderStrong`), vạch dài mỗi 15° (`foreground`) kèm số Caption 2 `mutedForeground`; góc hiện tại là viên thuốc `accent` / `onAccent` ("0°") cạnh vạch giữa. 0° = song song với tường (trục phòng).
- Kéo lên / xuống để xoay; đi qua 0°, ±45°, ±90°… thì rung nhẹ; thả tay trong ±5° quanh các góc đó thì hít vào. Vặn hai ngón trên ảnh cũng xoay món đang chọn. Món xoay quanh tâm của nó; xoay sát tường thì tự lùi ra, không xuyên tường. Mỗi lần thả tay là một bước hoàn tác.
- VoiceOver: "Xoay {tên món}", điều chỉnh được, mỗi nấc 15°.

### Viền đồ cũ (công cụ Xóa, founder yêu cầu 2026-10-03, theo màn Erase của IKEA Kreativ)

- Vào công cụ Xóa: AI tìm đồ trong ảnh (chip `InfoChip` có vòng quay "AI đang tìm đồ cũ trong ảnh"), xong thì **mọi món nhận ra đều có viền bám sát dáng** (mask phân đoạn, không phải khung chữ nhật) — cả đồ lớn (sofa, kệ) lẫn đồ nhỏ (đèn trần, ổ điện). Không nhãn tên, không làm tối ảnh: ảnh giữ nguyên để người dùng thấy đúng căn phòng.
- Nét viền: lõi `onImage` (trắng) ~2 pt, mép tối mảnh 40% hai bên để đọc được trên tường sáng lẫn đồ tối. Cùng màu với viền chọn món đã đặt (không dùng vàng thương hiệu IKEA). Vùng chọn theo điểm (khi AI không nhận ra món nào) dùng viền chữ nhật `radius-sm` nét 2.5 `onImage`.
- Chạm vào món là xóa (vùng chạm là khung bao của món, nới tới ≥ 44 pt với món nhỏ; món chồng nhau thì món nhỏ hơn thắng); không hỏi lại vì có Hoàn tác. Đang xóa: viền mờ 50%, giữa món có viên thuốc `accent` "Đang xóa" kèm vòng quay. Xóa xong viền biến mất (mờ dần `motion.fast`), hoàn tác thì hiện lại.
- Đầu khay: **Xóa hết** (Hide All — xóa mọi món còn viền trong một lượt) và **Hiện lại hết** (Show All — trả lại mọi món đã xóa), nút `secondary` chia đôi hàng; nút tròn 44 hình mắt "giữ để xem ảnh gốc" khi đã xóa. Cả hai đều là một bước hoàn tác.
- Viền xuất hiện mờ dần `motion.base`, lệch nhau 40 ms mỗi món; Reduce Motion: hiện ngay.
- VoiceOver: mỗi món là một nút "Xóa {tên món}", gợi ý "Chạm hai lần để xóa khỏi ảnh. Hoàn tác được."

### Đặt đồ sát tường (founder yêu cầu 2026-10-03, kiểu IKEA Kreativ)

- Chạm một món trong khay là món vào phòng: lưng áp sát chân tường ở chỗ trống trong phần ảnh nhìn thấy, tâm món cách mép màn ≥ 44 pt (dải vuốt quay lại). Món đáp xuống (chuyển động đáp sẵn có), rung nhẹ lúc chạm sàn, rồi được chọn sau 360 ms.
- Kéo: món bám sàn và không xuyên tường; trong 18 pt cuối thì hít vào tường kèm rung nhẹ (Haptics impact Light) đúng một lần. Vạch chân tường: nét `onImage` 3 pt trên viền `scrim` 35% 7 pt, đầu tròn, chạy theo đường chân tường dài hơn món 35% mỗi bên, vẽ **dưới** lớp món; hiện/ẩn mờ dần `motion.fast`.
- Vùng sàn ở C5 và ở "Chỉnh lại mặt sàn" đi theo đường chân tường thật (gãy ở góc tường), không còn là đường ngang.

### Gợi ý bước tiếp theo (trình chỉnh sửa)

- Chip `InfoChip` trên ảnh, dưới thanh trên — cùng chỗ với gợi ý của Xóa đồ cũ: món gợi ý từ trang món "{tên} · đặt sát tường, kéo để dời" + "Đặt vào phòng", "Chọn món thay cho …" + Hủy, "Món {phong cách} hợp với …", phòng trống "Chạm một món ở khay bên dưới để đặt vào phòng". Không nằm trong khay, để khay thu gọn giữ một chiều cao.
- Panel cao hơn khay thu gọn thì ảnh được nâng lên một lần khi chọn món đầu tiên rồi giữ nguyên, để món ở sàn dưới không bị che.

### Chip AI (bắt buộc sau mỗi việc AI làm)

- Viên thuốc nền `accent`, chữ `onAccent`, Footnote; icon Sparkle (Phosphor) bên trái. Nổi trên ảnh phòng ở mép trên.

---

## Style Guidelines

**Style (uupm):** Exaggerated Minimalism

**Keywords:** Bold minimalism, oversized typography, high contrast, negative space, loud minimal, statement design

**Key Effects — bản native:**

- Chữ quá khổ: Display 44 / 800 / −1.5 cho câu mở; không có chữ trang trí nào khác.
- Khoảng trắng lớn: khối chữ đầu màn cách mép 22, giữa các nhóm `space-2xl`.
- Đen / trắng tuyệt đối, một điểm vàng đồng. Không gradient, không glass, không viền trang trí.
- Phản hồi nhấn trong 100 ms; chuyển trạng thái 150–300 ms; thoát nhanh hơn vào. Chuyển màn theo kiểu hệ thống.
- Bật Reduce Motion thì thay chuyển động lớn bằng mờ dần.
- Icon: một bộ duy nhất — Phosphor (`phosphor-react-native` 3.0.6), nét Regular; trạng thái đang chọn dùng Fill.

**Page Pattern (uupm): Portfolio Grid** — hình ảnh trước, lọc theo nhóm. Áp cho Khám phá: phong cách là ảnh lớn, món là lưới ảnh; lọc bằng chip loại đồ. Không áp phần "Contact / About" của mẫu web.

---

## Anti-Patterns (Do NOT Use)

- ❌ **Poor imagery** — ảnh mờ, ảnh sai phong cách, ảnh có người hoặc logo
- ❌ **Cluttered layout** — nhiều hơn một nút chính, nhiều khối viền trên một màn
- ❌ **Emojis as icons** — chỉ dùng Phosphor
- ❌ **Mã hex trực tiếp trong component** — chỉ dùng token
- ❌ **Low contrast** — chữ < 4.5:1 hoặc viền control < 3:1 ở bất kỳ theme nào
- ❌ **Màu là tín hiệu duy nhất** của trạng thái
- ❌ **Instant state changes** — trạng thái đổi phải có chuyển tiếp 150–300 ms
- ❌ **Phản hồi nhấn làm xê dịch bố cục**
- ❌ **Điều khiển kiểu web** — thanh điều hướng tự chế, cử chỉ quay lại tự chế, chỉ dẫn dựa vào hover
- ❌ **Chặn cử chỉ vuốt mép trái để quay lại**, trừ khi đang chờ thanh toán
- ❌ **Tắt co giãn cỡ chữ** cho chữ nội dung
- ❌ **Font không có subset vietnamese**
- ❌ **Vàng đồng làm nền nút** hoặc rải nhiều chỗ trên một màn

---

## Pre-Delivery Checklist

- [ ] Không emoji làm icon; mọi icon từ Phosphor
- [ ] Component chỉ dùng token màu, không có hex trực tiếp
- [ ] Chữ ≥ 4.5:1 và viền control ≥ 3:1 ở **cả theme sáng và tối**; vàng đồng không nằm trên `muted`
- [ ] Vùng chạm ≥ 44×44 (iOS) / 48×48 (Android), khoảng cách giữa các vùng chạm ≥ 8
- [ ] Mọi thứ bấm được có phản hồi nhấn trong 100 ms và không làm xê dịch bố cục
- [ ] Trạng thái tắt nhìn rõ và có `accessibilityState`
- [ ] VoiceOver đọc đúng thứ tự nhìn; control có nhãn mô tả
- [ ] Không có gì nằm dưới tai thỏ, Dynamic Island hay thanh home; nội dung cuộn không bị thanh cố định che
- [ ] Kiểm ở cỡ chữ lớn nhất và khi bật Reduce Motion
- [ ] Tiếng Việt đủ dấu, không bị cắt dòng; kiểm bằng câu consent ở mục Typography
- [ ] Màn hẹp (iPhone SE) và màn lớn
