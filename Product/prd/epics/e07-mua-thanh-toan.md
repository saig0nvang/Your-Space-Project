---
derives_from: [D2@499c7e4d, D5@15cdc73a, D6@b921ed46, D7@96011236, D10@4b681365]
---
[Quay lại PRD YourSpace](../../PRD.md)

# E07 Mua & thanh toán giữ tiền

Epic này đưa người dùng từ "thấy đồ hợp trong phòng mình" đến "đã mua", mua lẻ hoặc cả bộ trong cùng một sheet. Ở M1, "mua" dẫn ra link affiliate từng món hoặc để lại SĐT nhờ tư vấn: đây là bước đo Click-to-Buy (≥ 15%), chỉ số chính của RAT, nên nút mua không bao giờ bị chặn bằng đăng nhập (D5, D7). Ở M2, người dùng xác minh SĐT một lần, thanh toán một lần cho nhiều nhà cung cấp, hệ thống tách đơn theo nhà cung cấp, và khoản thanh toán được giữ tại đối tác thanh toán được cấp phép đến khi người dùng nhận hàng (D2). Mua xong người dùng quay về đúng nơi xuất phát. Doanh thu của YourSpace là take-rate 8% trên GMV (D6), thu từ phía nhà cung cấp và không hiện cho người dùng.

## Version Control

| Version | Date | Updated by | Note |
| --- | --- | --- | --- |
| 1.0 | 02 Oct 2026 | Phạm Việt Anh | Tạo epic từ PRD v2.0 và flow chốt 02/10/2026. |

## Scope

- **Trong phạm vi** — Sheet mua gồm dự toán theo nhà cung cấp (06-1) và giỏ (06-2), mở từ trình chỉnh sửa hoặc từ thiết kế có sẵn; mua lẻ hoặc cả bộ; M1 link affiliate và thu lead; M2 xác minh SĐT (07-1, 07-2), giao hàng và lịch lắp đặt (07-3), chọn phương thức (07-4), trả góp 0% qua đối tác (07-5), VietQR (07-6), thành công (07-7); nhãn "Đã mua"; quay về nơi xuất phát.
- **Ngoài phạm vi** — Theo dõi đơn, xác nhận nhận hàng, báo sự cố, đánh giá (E08); đặt lịch chuyên gia (E10); thanh toán khi nhận hàng (COD) và đặt cọc (spec M2 §1); YourSpace tự giữ tiền trong tài khoản của mình (D2); cổng quản lý cho nhà cung cấp.
- **Theo mốc** — M1: sheet mua + link affiliate từng món + để lại SĐT nhờ tư vấn; chưa tài khoản, chưa thanh toán (D5, D7). · M2: OTP lần đầu, thanh toán giữ tiền, tách đơn, trả góp, VietQR. · M2+: mở sheet mua từ Phòng mẫu và Nhà hàng xóm (D10).

## User Stories

### Dùng chung M1 và M2

## E7-US1 — Sheet mua: mua lẻ hoặc cả bộ

 Là Young Aesthetes, tôi muốn thấy mọi món trong không gian gom vào một sheet, nhóm theo nhà cung cấp, để chọn mua cả bộ hoặc chỉ vài món mà không phải đi tìm từng món.

**Status:** Draft

**Mốc:** M1 (từ trình chỉnh sửa) · M2 (thêm ngày giao) · M2+ (từ thiết kế có sẵn) · **Priority:** P0 · **Effort:** M

**Màn:** 06-1 (dự toán theo nhà cung cấp), 06-2 (giỏ); mở từ thanh dự toán ở 05-1 hoặc từ 15-2; web M1: `EstimatePanel`.

**Pre-condition:** Không gian có ít nhất một món, hoặc người dùng đang xem chi tiết một thiết kế có sẵn.

**Post-condition:** Người dùng đã chọn tập món muốn mua và đi tiếp sang bước mua của mốc tương ứng.

#### Acceptance Criteria

- AC1: Sheet mở từ nút Mua trên thanh dự toán của trình chỉnh sửa; ở M2+ mở thêm từ nút "Mua cả bộ" của 15-2.
- AC2: Mặc định mọi món đang có trong không gian (hoặc trong thiết kế) được chọn. Bỏ chọn một món để mua lẻ; tổng tiền cập nhật ngay theo định dạng `12.400.000 ₫`.
- AC3: Món được nhóm theo nhà cung cấp, mỗi nhóm có tạm tính riêng. M2: mỗi nhóm hiện ngày giao dự kiến của nhà cung cấp đó.
- AC4: Giá trong sheet luôn là giá hiện tại, không phải giá lúc lưu không gian hay lúc người đăng bày thiết kế.
- AC5: Món đã mua trước đó hiện nhãn "Đã mua" và không được chọn sẵn.
- AC6: Sheet không hiện phí hay hoa hồng của YourSpace; giá người dùng thấy là giá của nhà cung cấp (D6).

#### Corner Cases

- CC1: Mua từ không gian là bản sao của người khác, nhánh "dùng cả không gian" (M2+) — sheet nhắc đo lại phòng mình trước khi mua: cùng layout chưa chắc cùng kích thước; nhắc kèm kích thước từng món dạng `101 × 119 × 117 cm`.
- CC2: Người dùng bỏ chọn hết — nút chính bị vô hiệu kèm chữ "Chọn ít nhất một món".
- CC3: Một món đã ngừng bán — hiện nhãn "Ngừng bán", không chọn được, không tính vào tổng.
- CC4: Mất mạng (13-1) — sheet hiện giá lần cập nhật gần nhất kèm ghi chú; bước mua tiếp theo báo cần mạng.
- CC5: Không gian chưa có món nào (13-4) — nút Mua trên thanh dự toán không hiện; thanh dự toán gợi ý thêm đồ.

### Mốc M1

## E7-US2 — Mua từng món qua link affiliate (M1)

 Là Young Aesthetes dùng bản web M1, tôi muốn bấm mua một món và được đưa tới trang bán món đó, để mua ngay mà không phải tự tìm trên sàn thương mại điện tử.

**Status:** Draft

**Mốc:** M1 · **Priority:** P0 · **Effort:** S

**Màn:** 06-1 (nút affiliate); web M1: `EstimatePanel`, `checkout/AffiliateCheckout`.

**Pre-condition:** Người dùng đã mở sheet mua với ít nhất một món được chọn.

**Post-condition:** Trang bán món đó mở ở tab mới; sự kiện `BuyClicked` được ghi; không gian giữ nguyên ở tab YourSpace.

#### Acceptance Criteria

- AC1: Mỗi món trong sheet có nút "Mua" dẫn ra link affiliate của món đó. Không có bước đăng nhập, nhập SĐT hay tạo tài khoản nào chặn trước nút này.
- AC2: Trạng thái không gian được lưu trước khi mở link (E6-US4); link mở ở tab mới.
- AC3: Mỗi lần bấm phát đúng một sự kiện `BuyClicked` kèm mã món, giá, phong cách và nguồn mở sheet (E11).
- AC4: Cạnh nút có chữ nói rõ người dùng sẽ mua trên trang của bên bán, không phải trong YourSpace.

#### Corner Cases

- CC1: Link affiliate hết hạn hoặc trả lỗi — món vẫn hiện trong sheet; nút đổi thành "Để lại SĐT để được tư vấn" (E7-US3).
- CC2: Trình duyệt chặn mở tab mới — mở link ngay trong tab hiện tại sau khi trạng thái đã được ghi vào URL, để quay lại bằng nút Back vẫn dựng lại được không gian.
- CC3: Người dùng bấm hai lần liên tiếp — chỉ mở một tab và chỉ ghi một sự kiện.
- CC4: Đích của link affiliate (sàn nào, tài khoản nào): chưa chốt, xem PRD §8.

## E7-US3 — Mua cả bộ ở M1: danh sách link và để lại SĐT (M1)

 Là Young Aesthetes dùng bản web M1, tôi muốn mua cả bộ đồ đã thử, hoặc nhờ người tư vấn giúp, để không phải tự xử lý nhiều đơn ở nhiều nơi.

**Status:** Draft

**Mốc:** M1 · **Priority:** P0 · **Effort:** M

**Màn:** 06-1 (nút để lại SĐT); web M1: `EstimatePanel`, `LeadCapture`, `/api/lead`.

**Pre-condition:** Người dùng bấm "Mua cả bộ" trong sheet mua với ít nhất hai món được chọn.

**Post-condition:** Người dùng có danh sách link mua từng món, và/hoặc đã để lại SĐT; sự kiện `LeadSubmitted` được ghi khi gửi SĐT.

#### Acceptance Criteria

- AC1: "Mua cả bộ" ở M1 hiện danh sách link mua của từng món đã chọn, nhóm theo nơi bán, kèm tổng tiền. Không hứa một link nạp nhiều món vào giỏ sàn thương mại điện tử: khả năng này chưa được xác nhận.
- AC2: Ngay trong danh sách đó có lựa chọn "Để lại SĐT để được tư vấn" (D7); form chỉ hỏi SĐT và có thể kèm tên, ghi rõ SĐT dùng để làm gì.
- AC3: Gửi SĐT lưu lead kèm danh sách món và phong cách của không gian (không kèm ảnh phòng), rồi phát sự kiện `LeadSubmitted`.
- AC4: Gửi xong người dùng ở lại sheet, không gian giữ nguyên; màn xác nhận nói ai sẽ liên hệ và qua kênh nào.

#### Corner Cases

- CC1: SĐT sai định dạng — báo lỗi ngay dưới ô nhập bằng icon + chữ; không gửi.
- CC2: Mất mạng (13-1) khi gửi lead — giữ nội dung đã nhập, báo trạng thái và cho gửi lại; không mất SĐT người dùng đã gõ.
- CC3: Người dùng gửi SĐT nhiều lần cho cùng một không gian — chỉ lưu một lead, cập nhật danh sách món mới nhất.
- CC4: Lead được gửi về đâu (Supabase, email) và ai gọi lại: chưa chốt, xem PRD §8.

### Mốc M2

## E7-US4 — Xác minh SĐT bằng OTP, chỉ lần đầu (M2)

 Là Young Aesthetes mua lần đầu trong app, tôi muốn xác minh SĐT ngay trong luồng mua thay vì tạo tài khoản, để đi tiếp thanh toán nhanh mà cửa hàng vẫn có số để giao hàng.

**Status:** Draft

**Mốc:** M2 · **Priority:** P0 · **Effort:** M

**Màn:** 07-1 (SĐT), 07-2 (OTP).

**Pre-condition:** Người dùng bấm nút chính trong sheet mua và chưa từng xác minh SĐT trên máy này.

**Post-condition:** SĐT đã xác minh gắn với các đơn; người dùng ở màn giao hàng 07-3.

#### Acceptance Criteria

- AC1: Không có form tạo tài khoản, mật khẩu hay email. Chỉ một ô SĐT (07-1) và một ô mã OTP (07-2).
- AC2: Xác minh chỉ xảy ra ở lần mua đầu; các lần sau người dùng đi thẳng từ sheet mua sang 07-3.
- AC3: 07-1 nói vì sao cần SĐT: để giao hàng và để giữ khoản thanh toán đến khi nhận hàng.
- AC4: Xác minh xong, người dùng quay về đúng luồng mua với đúng tập món đã chọn.

#### Corner Cases

- CC1: OTP sai hoặc hết hạn — báo lỗi bằng icon + chữ, cho gửi lại mã; số lần thử và thời hạn mã: chưa chốt, cần bổ sung vào PRD §8.
- CC2: Mất mạng (13-1) lúc chờ OTP — giữ SĐT đã nhập, cho gửi lại khi có mạng.
- CC3: SĐT đã được xác minh trước đó khi đặt lịch chuyên gia hoặc đăng thiết kế (D10) — không hỏi lại.

## E7-US5 — Thanh toán một lần, giữ tiền, tách đơn theo nhà cung cấp (M2)

 Là Young Aesthetes, tôi muốn thanh toán một lần cho cả bộ đồ đến từ nhiều nhà cung cấp và biết tiền của mình được giữ an toàn đến khi nhận hàng, để dám mua món nội thất đắt tiền online.

**Status:** Draft

**Mốc:** M2 · **Priority:** P0 · **Effort:** L

**Màn:** 07-3 (giao hàng & lịch lắp đặt), 07-4 (chọn phương thức), 07-5 (trả góp), 07-6 (VietQR).

**Pre-condition:** Người dùng đã xác minh SĐT và có ít nhất một món trong sheet mua.

**Post-condition:** Một khoản thanh toán thành công được giữ tại đối tác thanh toán được cấp phép; hệ thống tạo một đơn cho mỗi nhà cung cấp.

#### Acceptance Criteria

- AC1: 07-3 nhận một địa chỉ giao hàng chung và cho chọn lịch lắp đặt theo từng nhà cung cấp, vì mỗi bên giao một ngày khác.
- AC2: Người dùng thanh toán đúng MỘT lần cho mọi món đã chọn; sau khi thanh toán, hệ thống tách thành một đơn cho mỗi nhà cung cấp.
- AC3: 07-4 chỉ có hai nhóm phương thức: trả đủ qua đối tác thanh toán được cấp phép (gồm VietQR ở 07-6) và trả góp 0% qua đối tác (07-5), trong đó đối tác trả góp trả đủ vào khoản giữ tiền. Không có COD, không có đặt cọc.
- AC4: Câu escrow hiện trên 07-4 và trên màn xác nhận trước khi trả: "YourSpace không cầm tiền của bạn. Khoản thanh toán được giữ tại đối tác thanh toán được cấp phép đến khi bạn nhận hàng." Câu này dùng màu sage (niềm tin) theo `DESIGN.md`.
- AC5: Không có màn nào trong luồng hiện tên hay logo đối tác thanh toán khi đối tác chưa chốt; không hiện phí hay hoa hồng của YourSpace.
- AC6: Mỗi màn có tối đa một nút đặc màu terracotta; vùng chạm ≥ 44px.

#### Corner Cases

- CC1: Thanh toán thất bại hoặc người dùng hủy ở 07-6 — không đơn nào được tạo; quay về 07-4 với lựa chọn cũ, báo lý do bằng icon + chữ.
- CC2: Mất mạng (13-1) sau khi người dùng đã chuyển tiền qua VietQR — màn chờ xác nhận không cho thanh toán lần hai; khi có mạng thì kiểm tra trạng thái với đối tác trước khi cho làm gì tiếp.
- CC3: Một món hết hàng giữa lúc thanh toán — chặn trước khi trả tiền, báo món nào, cho bỏ món đó và đi tiếp với phần còn lại.
- CC4: Đối tác trả góp từ chối hồ sơ — quay về 07-4, giữ nguyên giỏ, gợi ý trả đủ.
- CC5: Đối tác thanh toán giữ tiền và đối tác trả góp cụ thể: chưa chốt, xem PRD §8 và spec M2 §7.

## E7-US6 — Mua xong quay về đúng nơi xuất phát (M2)

 Là Young Aesthetes vừa đặt hàng xong, tôi muốn quay về đúng chỗ mình đang làm, thấy món đã mua được đánh dấu, để mua tiếp hoặc chỉnh tiếp phần còn lại.

**Status:** Draft

**Mốc:** M2 · M2+ (quay về thiết kế có sẵn) · **Priority:** P1 · **Effort:** S

**Màn:** 07-7 (thành công), 05-1 (canvas), 15-1 (thiết kế có sẵn), 08-1 (danh sách đơn).

**Pre-condition:** Thanh toán thành công và đơn đã được tách theo nhà cung cấp.

**Post-condition:** Người dùng ở đúng không gian hoặc đúng tab thiết kế đã mở sheet mua; các món đã mua mang nhãn "Đã mua".

#### Acceptance Criteria

- AC1: 07-7 nói số đơn đã tạo và số nhà cung cấp, và nhắc lại rằng khoản thanh toán được giữ tại đối tác đến khi người dùng xác nhận đã nhận hàng.
- AC2: Nút chính trên 07-7: mở sheet mua từ không gian → "Về không gian" mở lại đúng không gian đó; mở sheet mua từ thiết kế có sẵn → "Về thiết kế" mở lại đúng tab đang xem (Phòng mẫu hoặc Nhà hàng xóm).
- AC3: Nút phụ "Xem đơn hàng" mở 08-1 (E08).
- AC4: Trong không gian, mỗi món vừa mua mang nhãn "Đã mua"; các món còn lại giữ nguyên để mua tiếp; không gian được lưu tự động với trạng thái này (E6-US2).

#### Corner Cases

- CC1: Không gian xuất phát đã bị xóa trong lúc thanh toán — nút chính đổi thành "Về Phòng của tôi"; đơn không bị ảnh hưởng.
- CC2: Thiết kế xuất phát bị ẩn chờ xem xét hoặc bị gỡ (E09) — quay về danh sách của tab đó; đơn không bị ảnh hưởng.
- CC3: Máy yếu (13-3) — quay về không gian ở chế độ xem 2D, nhãn "Đã mua" vẫn hiện.
- CC4: Mua từ thiết kế có sẵn mà người dùng chưa có không gian nào — không tự tạo không gian mới; món đã mua chỉ hiện trong đơn hàng (08-1).
