# Bàn giao prototype UI/UX — 2026-10-03

Prototype app iOS (React Native + Expo SDK 57), **thuần giả lập**, đủ 32 màn MVP trong [`docs/screens.md`](../../docs/screens.md) và một màn "Giả lập trạng thái" cho người review. Màu, chữ, spacing, bo góc lấy từ token của [`design-system/yourspace/MASTER.md`](../../design-system/yourspace/MASTER.md).

## Đợt nâng UI theo quy trình 5 công đoạn (2026-10-03)

Mục tiêu founder: UI đủ để launch, quảng cáo, pitching. Quy trình ghi trong `CLAUDE.md` · phân vai.

1. **Hệ nhìn (ui-ux-pro-max):** founder chọn hướng **A · Phòng trưng bày** trong 3 hướng preview. MASTER.md ghi lại (`--persist --force`, founder đồng ý) rồi chuyển sang native: đen/trắng, vàng đồng `#A16207` cho giá, Bricolage Grotesque cho tiêu đề, ảnh dẫn dắt màn. Override riêng: `pages/capture-camera.md` (camera luôn tối).
2. **Áp vào app:** token màu sáng/tối, font, thang chữ (thêm Display 44), bo góc (viên thuốc cho nút), thẻ phẳng nền `muted`, chip AI đen; màn mở đầu mở bằng ảnh phòng mẫu đã đặt đồ; màn phong cách ảnh tràn màn; giá vàng đồng; tổng tiền chữ Bricolage.
3. **Màn chủ lực (impeccable):** `distill` trình chỉnh sửa (tab phong cách dạng chữ, nút mũi tên thay "Khay đồ", ô "Tất cả", gợi ý chỉ khi cần); `layout` (ảnh phòng lấp tới mép trên, thanh trên nổi); `bolder` Phòng của tôi (ảnh cảnh thật lớn, tên Bricolage).
4. **Chuyển động (impeccable `animate`):** món vừa đặt đáp xuống sàn (rơi 16pt, bóng lan ra) kèm rung nhẹ lúc chạm sàn.
5. **Kiểm chất lượng:** critique lần 2 = **28/40** (lần 1: 26/40). Đã sửa theo critique:
   - trình chỉnh sửa: không còn dải trắng giữa ảnh và khay; đặt món xong không tự bung panel; nút "Lật" thay cho xoay từng góc (ảnh phẳng bị bóp méo); tỷ lệ ghi "To hơn / Nhỏ hơn …%"; bóng tiếp đất đậm hơn; món chỉ hiện khi ảnh phòng đã tải;
   - Xóa đồ cũ: chạm trúng đồ cũ trong ảnh mẫu thì chọn đúng vật thể (đã đo sẵn), lớp lấp lấy tường phía trên và sàn phía dưới thay cho ô xám; gợi ý ngay trên ảnh;
   - nhất quán: giá vàng đồng ở trang món và khay; mũi tên quay lại màu chữ chính; header trong suốt thật ở màn phong cách; segmented cao 36; nhãn tab không còn bị cắt trên web;
   - nút / khối giả lập ẩn mặc định (bật ở Tôi → Giả lập trạng thái → "Hiện nút giả lập trên màn");
   - tên phòng mặc định theo ảnh ("Phòng khách sáng 03/10"); mô tả sự cố điền sẵn không còn phủ định kép; bước Thanh toán báo trước "chọn cách trả trên trang của đối tác".
   Chưa làm được trên máy này: `audit` bản native (VoiceOver, Dynamic Type, iPhone SE, Dark Mode) cần iOS Simulator hoặc máy thật.
6. **`polish` trình chỉnh sửa sau khi thêm thanh tác vụ, số đo, "Đổi với" (impeccable, 2026-10-03):**
   - chọn món lần đầu không còn làm cả ảnh nhảy lên rồi để lại dải trắng sau khi bỏ chọn: ảnh neo theo khay thu gọn; panel món phủ lên đáy ảnh và chỉ khi chân món bị che thì cảnh nâng lên vừa đủ, bỏ chọn thì về chỗ;
   - gợi ý bước tiếp theo ("Chạm lên sàn để đặt…", "Chọn món thay cho…") chuyển từ khay lên ảnh, cùng chỗ với gợi ý của Xóa đồ cũ, để khay thu gọn giữ một chiều cao;
   - "Hợp với" có chip nói rõ đang xem món hợp với món nào; "Đổi món" mở đúng phong cách còn món để đổi (trước đây có lúc chỉ thấy chính món đang đổi);
   - "Nhân bản" đặt bản sao ngay cạnh món, cách một bề ngang, không còn đè gần hết lên món gốc;
   - thanh tác vụ không còn đè thông báo "Hoàn tác" và không nhảy chỗ khi thông báo tắt; món cao chạm thanh trên thì thanh ghim dưới thanh trên thay vì nằm đè lên số đo dưới chân món;
   - chip "cao … cm" không còn tràn ra ngoài màn khi món sát mép; ô "Đổi với" vuông, cách đều; nhãn thanh tác vụ và chip số đo không bị cắt khi tăng cỡ chữ;
   - bản web: hiệu ứng đặt món và thanh tác vụ chạy được (trước đây bị bỏ qua kèm cảnh báo console).
7. **Xóa đồ cũ theo màn Erase của IKEA Kreativ (founder yêu cầu 2026-10-03, có ảnh tham chiếu; quyết định theo ui-ux-pro-max `--domain ux` + `--stack react-native`):** vào công cụ Xóa là AI tìm đồ rồi **viền bám sát dáng mọi món** (cả đèn trần, ổ điện), ảnh không tối đi; chạm vào món nào là xóa món đó, có chip "Đã xóa … · Hoàn tác" (uupm khuyên hỏi xác nhận; ở đây hoàn tác được nên dùng Hoàn tác thay hộp hỏi lại); "Xóa hết" / "Hiện lại hết" như Hide All / Show All. Bỏ bước chọn nhiều rồi bấm "Xóa N vật thể" (lệch E5-US2 AC2, ghi ở `docs/screens.md`). Bản thử: 21 món trong 3 ảnh mẫu được tách bằng SAM (Segment Anything), từ mask dựng sẵn nét viền bám dáng và mảng lấp bằng LaMa (mô hình inpainting) — script `scripts/sample-objects/build.py`, kết quả ở `assets/rooms/objects` và `src/data/roomObjects.ts`. Khi lấp một món, mọi món khác trong phòng cũng được che khỏi ngữ cảnh để xóa nhiều món chồng nhau vẫn khớp. Phần lấp là dựng sẵn ở máy dev, chưa phải AI chạy thật lúc dùng.
8. **Đặt đồ sát tường kiểu IKEA (founder yêu cầu 2026-10-03; ui-ux-pro-max `--domain ux` + `--stack react-native`: rung chỉ khi xác nhận, kéo phải có cách thay bằng một lần chạm):** chạm món trong khay là món tự vào chỗ trống, lưng áp chân tường, tránh đồ thật trong ảnh, rồi được chọn sẵn; kéo thì bám sàn, không xuyên tường, tới gần tường thì hít vào kèm rung + vạch sáng ở chân tường. Chân tường của 3 ảnh mẫu lần theo mask sàn tách bằng SAM; bước xác nhận sàn vẽ vùng sàn theo chân tường. Hạn chế: món là ảnh phẳng nên chưa xoay theo tường xiên; chưa che khuất theo độ sâu với đồ thật (rủi ro #1, spike M1).
9. **Bước 1 của bản thử đặt đồ 3D kiểu IKEA (founder duyệt 2026-10-04, chạy trên web):** 3 món 3D (Bàn trà tròn chân thép, Ghế nhung cam, Đèn sàn thân xoắn — đuôi "(3D)", ở đầu phong cách Japandi) dựng bằng React-Three-Fiber trên máy ảo khớp ảnh phòng (`features/editor/roomCamera.ts`, `Room3D.web.tsx`): đúng góc nhìn, độ cao máy, trục tường, có bóng đổ lên sàn thật và ánh sáng theo phía cửa sổ. Máy ảnh của 3 ảnh mẫu đo từ điểm tụ (ảnh có kệ tivi: tiêu cự ước lượng). Kiểm khớp: thêm `?grid3d=1` vào địa chỉ hoặc bật "Hiện lưới sàn 3D" ở Tôi → Giả lập. Trên máy (kể cả Expo Go) lớp 3D là DOM component của Expo (`Room3DView.tsx`, 'use dom'): cùng đoạn code three.js chạy trong WebView nền trong suốt, nên giống hệt bản web; ảnh thu nhỏ (Lưu, Phòng của tôi, Đặt hàng xong) vẽ món 3D bằng ảnh để không mở nhiều WebView. Mô hình: Poly Haven, Khronos glTF Sample Assets (CC0, CC-BY 4.0), ghi công ở tab Tôi. Xóa món 3D: bỏ 3 mục `3d-…` trong `data/catalog.ts`, `data/productModels.ts`, `data/productImages.ts` và file trong `assets/models`, `assets/products`.
10. **Xoay món 3D, bỏ phóng to (founder 2026-10-04):** thước xoay kiểu IKEA ở mép trái ảnh + vặn hai ngón; món 3D xoay quanh tâm, va tường thật (mặt phẳng dựng từ chân tường) nên xoay / kéo sát tường không xuyên tường. Bỏ chụm và Tỷ lệ cho mọi món — món luôn đúng kích thước thật (lệch E4-US4 "chỉnh kích thước"). Panel món gọn bằng khay thu gọn.

Ảnh món/phòng/phong cách: Pexels, Unsplash (giấy phép tự do), tách nền bằng rembg; tên, chất liệu, kích thước món đã chỉnh cho khớp ảnh. Nguồn ảnh ở tab Tôi.

## Đã kiểm

| Kiểm tra | Kết quả |
|---|---|
| `npx tsc --noEmit` | 0 lỗi |
| `npx expo lint` (gồm luật React Compiler) | 0 lỗi, 0 cảnh báo |
| `npx expo-doctor` | 21/21 mục đạt |
| `npx expo export` iOS · Android · web | Build được cả ba (5.094 / 5.191 / 4.573 module) |
| Soát code tự động | Không có mã màu, cỡ chữ, font ghi cứng; không emoji, không dấu chấm than; các file có 2 nút chính đều là 2 nhánh trạng thái khác nhau |
| Chạy thật trên trình duyệt (bản web, khung 390 × 844) | Đi hết vòng lõi: Khám phá → xin quyền → camera → xem lại + consent → quét → xác nhận sàn → đặt món → xóa đồ cũ → Mua → SĐT → OTP → thanh toán (một bước) → đặt hàng xong → đơn hàng → xác nhận nhận hàng. Không lỗi console (trừ cảnh báo web về `pointerEvents`, xem Hạn chế) |

**Chưa kiểm:** chạy trên iOS Simulator / iPhone thật / Android emulator (máy này là Linux, không có Xcode, không cài Android SDK). Cử chỉ kéo, chụm, vuốt mép, sheet native, VoiceOver và Dynamic Type cần xem trên máy thật.

## Cách xem

```bash
nvm use 24                      # Expo SDK 57 cần Node ≥ 22.13
pnpm install                    # ở gốc repo
cd apps/mobile
npx expo start                  # iPhone: quét QR bằng Expo Go · Android emulator: nhấn a · trình duyệt: nhấn w
```

- Bản web chỉ để xem nhanh trên máy Linux: sheet và modal hiển thị khác iOS, xác nhận dùng hộp thoại trình duyệt.
- **Dữ liệu mẫu để review nhanh:** tab Tôi → Giả lập trạng thái → thêm không gian mẫu / không gian ảnh hỏng / 2 đơn hàng mẫu.
- **Mã OTP thử:** `123456`. Bước Thanh toán tự xác nhận sau ~8 giây, hoặc bấm "Giả lập: đối tác xác nhận".

## Việc cần bạn kiểm trên máy thật

**Khám phá (K1–K4)**
- K1: tiêu đề 2 dòng không bị tai thỏ che; chỉ một nút hổ phách; khối "Tiếp tục" sau khi lưu một không gian.
- K3: bật chip có dấu chọn; lọc ra màn trống rồi "Bỏ lọc"; cuộn, mở món, quay lại còn nguyên bộ lọc và vị trí cuộn.
- K4: kéo ngang và hai nút xoay (chỉ quanh trục đứng); mở từ khay trình chỉnh sửa thì nút chính thấy ngay ở detent 75%.

**Luồng chụp (C1–C7)**
- Lần đầu vào C1, lần sau vào thẳng camera. Bật "Từ chối quyền camera" để xem trạng thái bị từ chối.
- C3: câu consent luôn hiện ngay trên nút "Đồng ý và tiếp tục" (chỉ ở lần đầu).
- C4 với từng kịch bản AI: bình thường → C5; "Ảnh khó" → C7 (lần sau vào thẳng chế độ tự đặt); "AI tạm ngưng" → trình chỉnh sửa chế độ tự đặt.
- C6: kéo đường chân trời, nhắc khi tới mép; vuốt mép trái để quay lại vẫn chạy.
- Nút X ở mọi bước về đúng nơi đã mở luồng chụp.

**Trình chỉnh sửa (E1–E3)**
- Chọn món → khay thu lại → chạm sàn → chip "Đã tự căn theo mặt sàn · kéo để chỉnh"; chạm tường → món bám xuống sàn.
- Kéo, chụm, xoay, chỉnh cỡ, Bỏ khỏi phòng, Hoàn tác / Làm lại hơn 10 bước. Cỡ món đổi theo xa gần có hợp lý không.
- Công cụ Xóa với các cờ: xóa thất bại, AI tạm ngưng, mất mạng, không gian từ chối consent.
- Quay lại / vuốt mép khi còn thay đổi chưa lưu → 3 lựa chọn. Chạm trong dải 20 pt mép trái không đặt món.
- Bật "Máy yếu" để xem chế độ 2D.

**Mua và thanh toán (M1–TT7)**
- TT3: bàn phím không che ô Địa chỉ và nút Thanh toán (điểm cần kiểm nhất).
- TT3 với từng kịch bản: hết hàng, đổi giá, thất bại; hủy khi đang chờ.
- TT3: đóng sheet khi đang chờ đối tác rồi xem Đơn hàng sau ~8 giây.
- TT7: "Về không gian" thấy nhãn "Đã mua"; "Xem đơn hàng" mở tab Tôi; không quay lại được bước thanh toán.

**Phòng, Tôi, Đơn hàng**
- P1: menu thẻ (Đổi tên / Xóa), thẻ ảnh hỏng, màn trống.
- DH2: đẩy trạng thái bằng nút giả lập; ngày giao bị dời; mất mạng thì nút xác nhận tắt kèm lý do.
- DH3: tick hết mới bật nút; xác nhận xong badge tab Tôi mất.
- DH4 → DH5: báo sự cố, gửi thêm thông tin, giả lập tới khi kết thúc, rút khiếu nại.
- Theme tối, Reduce Motion, cỡ chữ lớn nhất, iPhone SE.

## Chờ bạn duyệt

Theo quy tắc trong CLAUDE.md, mọi chỗ lệch khỏi MASTER.md là **đề xuất**. Code hiện làm theo MASTER.md, trừ hai chỗ (1) và (2) đã áp dụng vì lý do an toàn dữ liệu và tiền.

1. **Đã áp dụng — khóa cử chỉ quay lại khi có rủi ro mất dữ liệu / trả tiền hai lần.** TT3 khóa vuốt quay lại trong lúc chờ đối tác xác nhận; chỉ thoát qua "Hủy thanh toán" có xác nhận. E1 chặn rời màn khi còn thay đổi chưa lưu và hỏi 3 lựa chọn (đúng E1-US4 CC1). MASTER cấm "chặn cử chỉ vuốt mép trái" nhưng chưa nói tới hai trường hợp này. Đề xuất thêm ngoại lệ vào MASTER.md.
2. **Đã áp dụng — câu consent ở C3 nằm trong thanh nút dưới.** Trước đó câu này bị cuộn khuất dưới nút "Đồng ý"; đây là sửa lỗi theo E3-US3 AC1, không lệch MASTER.
3. `pages/capture-camera.md`: màn camera (C2, tuỳ chọn C4) luôn ở theme tối, chỉ dùng cột Tối của MASTER.
4. `pages/tt6-vietqr.md`: khối mã QR luôn vẽ ở theme sáng (mã tối trên nền sáng) để app ngân hàng đọc được.
5. `pages/trinh-chinh-sua.md`: lớp lấp giả lập của vùng đã xóa dùng ảnh làm mờ (blur có chức năng, không trang trí).
6. `pages/phong-cua-toi.md`, `pages/don-hang.md`: thẻ trong lưới 2 cột và thẻ đơn dùng padding 16 thay 24 vì thẻ hẹp.
7. `pages/kham-pha.md`: thêm token chấm mẫu vật liệu (epic E01 yêu cầu, MASTER chưa có); K1 dùng tiêu đề tự vẽ thay large title native vì câu dài bị cắt.

## Việc còn lại cho phần nền (chưa làm)

- Gộp các cờ giả lập rải rác (`cameraBusy`, `noTiltSensor` trong C2; `slowLoad`, `escrowUnknown`, `wipeFails` trong `features/me/reviewFlags.ts`) vào `store/devFlags.ts`.
- `ScreenScroll`: prop màu nền `card` cho sheet; bỏ khoảng `insets.bottom` thừa khi nằm trong tab.
- `SegmentedControl`: cho phép tắt một lựa chọn; nhãn dài xuống 2 dòng ở màn hẹp.
- `Checkbox`: chuyển trạng thái có chuyển động 150–300 ms (MASTER); `ErrorState` cho đổi nhãn nút; `Banner` có nút đóng; `ListGroup.footer` nhận ReactNode.
- `PlacedItem` lưu giá lúc đặt để báo "đổi giá" ở P1 (E6-US3 CC2).
- Catalog chưa có món ngừng bán / hết hàng nên chưa xem được các nhãn đó.
- Chưa gắn sự kiện đo lường E11.

## Hạn chế đã biết (do giả lập)

- Món trên ảnh là ảnh mẫu đã tách nền (Pexels, Unsplash; 3 tấm là ảnh dựng 3D), không phải ảnh hay mô hình của nhà cung cấp; tên, chất liệu, kích thước đã chỉnh cho khớp ảnh. Xoay trục Y chỉ là nghiêng ảnh phẳng; không có che khuất theo độ sâu. Trang món hiện ảnh đứng yên, không xoay. Xóa đồ cũ là lớp ảnh làm mờ, không phải inpainting.
- Không có hộp thoại quyền thật, camera thật, thư viện ảnh thật, thông báo thật, lưu ảnh thật; các nút đó hiện toast "Bản thử".
- Lịch sử hoàn tác mất khi rời trình chỉnh sửa (E4-US7 CC3 còn mở). Bản nháp trống tự xóa khi rời màn.
- Bản web báo cảnh báo `props.pointerEvents is deprecated` (29 chỗ). Trên iOS / Android prop này vẫn đúng; đổi sang `style.pointerEvents` khi dọn code.
