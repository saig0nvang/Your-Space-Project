---
derives_from: [D2@499c7e4d]
---
[Quay lại PRD YourSpace](../../PRD.md)

# E08 Đơn hàng & hậu mãi

Epic này giữ lời hứa "mua an toàn" sau khi người dùng đã trả tiền: họ thấy từng đơn đang ở đâu, thấy khoản thanh toán đang được giữ tại đối tác thanh toán được cấp phép, và chỉ khi họ xác nhận đã nhận hàng thì nhà cung cấp mới nhận tiền. Có sự cố thì khoản thanh toán tiếp tục được giữ và nhà cung cấp chịu bồi hoàn, không phải YourSpace (D2). Mục tiêu là escrow trở thành thứ người dùng nhìn thấy và kiểm soát được, không chỉ là một câu trên màn thanh toán.

## Version Control

| Version | Date | Updated by | Note |
| --- | --- | --- | --- |
| 1.0 | 02 Oct 2026 | Phạm Việt Anh | Tạo epic từ PRD v2.0 và flow chốt 02/10/2026. |

## Scope

- **Trong phạm vi** — Danh sách đơn trong tab Tôi (08-1); chi tiết đơn và dòng thời gian giữ tiền (08-2); xác nhận đã nhận hàng sau checklist (08-3); báo sự cố (08-4); theo dõi khiếu nại (08-5); đánh giá từng món (08-6); nhắc xác nhận nhận hàng ở thông báo (10-2) và trong Tôi.
- **Ngoài phạm vi** — Thanh toán và tách đơn (E07); cổng quản lý đơn cho nhà cung cấp; quy trình nội bộ xử lý khiếu nại và hợp đồng, SLA với nhà cung cấp (`Governance-and-Risk/`); đổi trả ngoài phạm vi một khiếu nại.
- **Theo mốc** — M1: không có (M1 chưa có thanh toán; người dùng mua trên trang bên bán, D5). · M2: toàn bộ epic (D2). · M2+: không có thay đổi đã chốt.

## User Stories

## E8-US1 — Danh sách đơn hàng trong Tôi

 Là Young Aesthetes đã mua hàng, tôi muốn xem mọi đơn của mình ở một chỗ, biết đơn nào đang chờ mình xác nhận, để không bỏ sót đơn nào.

**Status:** Draft

**Mốc:** M2 · **Priority:** P2 · **Effort:** S

**Màn:** 08-1 (danh sách đơn) trong tab Tôi (12-1); 10-2 (thông báo).

**Pre-condition:** Người dùng đã xác minh SĐT và có ít nhất một lần thanh toán thành công (E07).

**Post-condition:** Người dùng mở được chi tiết đơn cần xem.

#### Acceptance Criteria

- AC1: Mỗi đơn là một nhà cung cấp; một lần thanh toán tách thành nhiều đơn thì hiện nhiều dòng, có ghi chúng thuộc cùng một lần thanh toán.
- AC2: Mỗi dòng hiện tên nhà cung cấp, ảnh các món, tổng tiền theo định dạng `12.400.000 ₫` và trạng thái bằng icon + chữ (đã thanh toán, đang giao, đã nhận, đang khiếu nại).
- AC3: Đơn đã giao nhưng chưa được xác nhận hiện ở đầu danh sách với nhắc "Xác nhận đã nhận hàng"; cùng nhắc này có trong thông báo (10-2) và trên mục Tôi.
- AC4: Chạm một dòng mở chi tiết đơn 08-2.

#### Corner Cases

- CC1: Chưa có đơn nào (13-4) — màn trống nói đơn sẽ hiện ở đây sau khi mua và dẫn về Phòng của tôi.
- CC2: Mất mạng (13-1) — hiện danh sách lần cập nhật gần nhất kèm ghi chú; các nút cần mạng báo trạng thái riêng.
- CC3: Người dùng đổi máy chưa xác minh SĐT — danh sách trống kèm lời mời xác minh SĐT để xem đơn cũ.

## E8-US2 — Chi tiết đơn và dòng thời gian giữ tiền

 Là Young Aesthetes, tôi muốn thấy đơn đang ở bước nào và khoản thanh toán của mình đang nằm ở đâu, để yên tâm trong lúc chờ hàng.

**Status:** Draft

**Mốc:** M2 · **Priority:** P2 · **Effort:** M

**Màn:** 08-2 (chi tiết + dòng thời gian giữ tiền).

**Pre-condition:** Người dùng mở một đơn từ 08-1, từ thông báo, hoặc từ nút phụ của 07-7.

**Post-condition:** Người dùng biết bước hiện tại và việc mình cần làm tiếp, nếu có.

#### Acceptance Criteria

- AC1: Dòng thời gian có các bước: đã thanh toán (khoản được giữ tại đối tác), đang giao, đã nhận (nhà cung cấp nhận tiền); bước hiện tại được đánh dấu bằng icon + chữ.
- AC2: Màn nhắc câu escrow: "YourSpace không cầm tiền của bạn. Khoản thanh toán được giữ tại đối tác thanh toán được cấp phép đến khi bạn nhận hàng." Khối này dùng màu sage theo `DESIGN.md`.
- AC3: Hiện danh sách món, ngày giao và lịch lắp đặt đã chọn ở 07-3, địa chỉ giao hàng và cách liên hệ nhà cung cấp.
- AC4: Khi đơn ở bước đang giao hoặc đã giao, màn có một nút chính "Xác nhận đã nhận hàng" và một lựa chọn phụ "Báo sự cố".

#### Corner Cases

- CC1: Nhà cung cấp dời ngày giao — dòng thời gian hiện ngày mới và ngày cũ; người dùng nhận thông báo (10-2).
- CC2: Mất mạng (13-1) — hiện trạng thái lần cập nhật gần nhất kèm ghi chú; không cho bấm xác nhận khi chưa có mạng.
- CC3: Không đọc được trạng thái giữ tiền từ đối tác — hiện "Đang kiểm tra trạng thái thanh toán", không đoán trạng thái.

## E8-US3 — Xác nhận đã nhận hàng sau checklist

 Là Young Aesthetes vừa nhận hàng, tôi muốn kiểm tra hàng theo một checklist rồi mới xác nhận, để chỉ chuyển tiền cho nhà cung cấp khi hàng đúng như đã thấy.

**Status:** Draft

**Mốc:** M2 · **Priority:** P2 · **Effort:** M

**Màn:** 08-3 (xác nhận nhận hàng).

**Pre-condition:** Đơn ở bước đang giao hoặc đã giao; người dùng bấm "Xác nhận đã nhận hàng" ở 08-2 hoặc từ thông báo.

**Post-condition:** Đơn ở bước đã nhận; đối tác thanh toán chuyển khoản tiền cho nhà cung cấp; người dùng được mời đánh giá (08-6).

#### Acceptance Criteria

- AC1: 08-3 hiện checklist cho từng món (đúng món, đúng chất liệu, đúng kích thước, không hư hỏng, đã lắp đặt nếu có lịch lắp). Nút xác nhận chỉ bật khi người dùng đã đi qua checklist.
- AC2: Trước khi xác nhận, màn nói rõ: sau khi xác nhận, khoản thanh toán được chuyển cho nhà cung cấp.
- AC3: Có lối "Báo sự cố" ngay trên 08-3 cho món không đạt checklist; chọn lối này thì không chuyển tiền (E8-US4).
- AC4: Xác nhận xong, dòng thời gian ở 08-2 chuyển sang "Đã nhận" và nhắc trong thông báo, trong Tôi biến mất.

#### Corner Cases

- CC1: Người dùng bấm xác nhận hai lần — chỉ ghi nhận một lần.
- CC2: Mất mạng (13-1) khi bấm xác nhận — không ghi nhận cho tới khi gửi được; báo trạng thái, không báo thành công giả.
- CC3: Người dùng không xác nhận cũng không báo sự cố — nhắc ở thông báo; hạn chờ và việc có tự chuyển tiền cho nhà cung cấp khi hết hạn hay không: chưa chốt (spec M2 §7, PRD §8; mock dùng 3 ngày làm giá trị tạm).
- CC4: Đơn có nhiều món, chỉ một món lỗi — cách xử lý tách một phần khoản giữ tiền phụ thuộc đối tác thanh toán: chưa chốt, xem PRD §8.

## E8-US4 — Báo sự cố, khoản thanh toán tiếp tục được giữ

 Là Young Aesthetes nhận hàng có vấn đề, tôi muốn báo sự cố ngay trong app và biết tiền của mình chưa bị chuyển đi, để không phải tự đòi tiền với nhà cung cấp.

**Status:** Draft

**Mốc:** M2 · **Priority:** P2 · **Effort:** M

**Màn:** 08-4 (báo sự cố).

**Pre-condition:** Đơn ở bước đang giao hoặc đã giao và chưa được xác nhận nhận hàng.

**Post-condition:** Một khiếu nại được tạo; khoản thanh toán tiếp tục được giữ tại đối tác; người dùng theo dõi được ở 08-5.

#### Acceptance Criteria

- AC1: Người dùng chọn món gặp sự cố, chọn loại sự cố (giao thiếu, sai món, hư hỏng, sai kích thước hoặc chất liệu, không giao), mô tả ngắn và đính kèm ảnh.
- AC2: Gửi xong, màn nói rõ khoản thanh toán tiếp tục được giữ tại đối tác thanh toán được cấp phép và nhà cung cấp chưa nhận tiền.
- AC3: Đơn chuyển trạng thái "Đang khiếu nại" ở 08-1 và 08-2; nút "Xác nhận đã nhận hàng" ẩn cho tới khi khiếu nại kết thúc.
- AC4: Màn nói rõ trách nhiệm bồi hoàn thuộc nhà cung cấp theo thỏa thuận với YourSpace (D2).

#### Corner Cases

- CC1: Báo sự cố sau khi hạn báo đã qua — hạn báo sự cố: chưa chốt (spec M2 §7, PRD §8; mock dùng 3 ngày). Khi chốt, màn phải hiện hạn còn lại trước khi hết.
- CC2: Mất mạng (13-1) giữa lúc gửi — giữ nội dung và ảnh đã chọn, cho gửi lại; không tạo khiếu nại trùng.
- CC3: Ảnh đính kèm quá lớn — thu nhỏ trên máy trước khi gửi; ảnh khiếu nại là bằng chứng nên được lưu trên máy chủ, và màn nói rõ điều đó.

## E8-US5 — Theo dõi khiếu nại đến khi xong

 Là Young Aesthetes đã báo sự cố, tôi muốn theo dõi khiếu nại đi tới đâu và kết quả là gì, để biết khi nào được hoàn tiền hoặc nhận hàng thay.

**Status:** Draft

**Mốc:** M2 · **Priority:** P2 · **Effort:** M

**Màn:** 08-5 (theo dõi khiếu nại); 10-2 (thông báo).

**Pre-condition:** Người dùng đã gửi một báo sự cố (E8-US4).

**Post-condition:** Khiếu nại kết thúc với một kết quả: hoàn tiền từ khoản đang giữ, giao bù hoặc đổi món rồi người dùng xác nhận nhận hàng, hoặc người dùng rút khiếu nại.

#### Acceptance Criteria

- AC1: 08-5 hiện dòng thời gian khiếu nại: đã gửi, nhà cung cấp phản hồi, đang xử lý, đã kết thúc; mỗi bước có thời điểm.
- AC2: Mỗi lần trạng thái đổi, người dùng nhận thông báo (10-2).
- AC3: Khi kết quả là hoàn tiền, khoản hoàn lấy từ khoản đang giữ tại đối tác hoặc do nhà cung cấp chịu; YourSpace không tự bỏ tiền hoàn (D2). Màn nói rõ tiền về đâu.
- AC4: Người dùng nhắn được thêm thông tin và ảnh vào khiếu nại cho tới khi khiếu nại kết thúc.

#### Corner Cases

- CC1: Nhà cung cấp không phản hồi — thời hạn phản hồi và mức phạt theo SLA nằm trong hợp đồng với nhà cung cấp (D2), chưa chốt con số; màn chỉ hiện trạng thái thật, không hứa thời hạn khi chưa có.
- CC2: Mất mạng (13-1) — hiện trạng thái lần cập nhật gần nhất kèm ghi chú.
- CC3: Người dùng rút khiếu nại — hỏi xác nhận, đưa đơn về bước đã giao để người dùng đi lại checklist 08-3.

## E8-US6 — Đánh giá từng món sau khi nhận

 Là Young Aesthetes đã nhận hàng, tôi muốn đánh giá từng món mình mua, để người mua sau biết món đó ngoài đời có giống trong ảnh phòng không.

**Status:** Draft

**Mốc:** M2 · **Priority:** P2 · **Effort:** S

**Màn:** 08-6 (đánh giá).

**Pre-condition:** Đơn ở bước đã nhận (E8-US3).

**Post-condition:** Mỗi món được đánh giá có điểm và nhận xét gắn với món đó.

#### Acceptance Criteria

- AC1: Người dùng chấm điểm và viết nhận xét cho từng món, không phải cho cả đơn.
- AC2: Chỉ người đã xác nhận nhận hàng mới đánh giá được món đó; đánh giá có nhãn "Đã mua qua YourSpace".
- AC3: Đánh giá là tùy chọn; bỏ qua không ảnh hưởng gì tới đơn hay khoản thanh toán.
- AC4: Người dùng sửa hoặc xóa được đánh giá của mình.

#### Corner Cases

- CC1: Món đã ngừng bán — vẫn đánh giá được; đánh giá gắn với món đó trong lịch sử.
- CC2: Mất mạng (13-1) khi gửi — giữ nội dung đã viết và gửi lại khi có mạng.
- CC3: Đánh giá vi phạm (lăng mạ, thông tin cá nhân) — quy tắc kiểm duyệt đánh giá: chưa chốt, cần bổ sung vào PRD §8.
