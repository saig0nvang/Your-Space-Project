---
derives_from: [D1@d0d780f3, D2@499c7e4d, D10@4b681365]
---
[Quay lại PRD YourSpace](../../PRD.md)

# E02 Thiết kế có sẵn: Phòng mẫu & Nhà hàng xóm

Epic này mô tả mục Thiết kế có sẵn theo D10: hai tab Phòng mẫu (YourSpace tuyển chọn và dựng) và Nhà hàng xóm (người dùng tự đăng). Người dùng xem một thiết kế, thả tim, mua lẻ hoặc cả bộ, hoặc dùng làm mẫu theo hai nhánh: dùng cả không gian (cho nhà cùng layout) hoặc lấy bộ món về đặt vào ảnh phòng của mình. Mục tiêu là cho người chưa sẵn sàng tự bày một điểm bắt đầu cụ thể, bằng những căn phòng giống nhà mình, và nối thẳng điểm bắt đầu đó với việc mua (D1). Phần đăng thiết kế và kiểm duyệt nằm ở E09.

## Version Control

| Version | Date | Updated by | Note |
| --- | --- | --- | --- |
| 1.0 | 02 Oct 2026 | Phạm Việt Anh | Tạo epic từ PRD v2.0 và flow chốt 02/10/2026. |

## Scope

- **Trong phạm vi** — Màn Thiết kế có sẵn hai tab (15-1) và thẻ thiết kế; chi tiết thiết kế (15-2); thả tim, lưu vào Yêu thích; mua lẻ hoặc cả bộ qua sheet mua dùng chung với E07; sheet "Dùng thiết kế này thế nào?" (15-3) với hai nhánh dùng cả không gian và lấy bộ món; điều kiện mở tab Nhà hàng xóm.
- **Ngoài phạm vi** — Đăng thiết kế, consent công khai, báo cáo và gỡ (E09); xác minh SĐT, thanh toán giữ tiền, tách đơn (E07); khay đồ và thao tác đặt đồ trong Trình chỉnh sửa (E04); chia hoa hồng cho người đăng (D10 không cho phép).
- **Theo mốc** — M1: không có (D10; PRD §8 còn mở việc có đưa một phần Phòng mẫu lên M1 làm nhóm đối chứng hay không). · M2: không có. · M2+: toàn bộ epic; lúc đầu chỉ có tab Phòng mẫu, tab Nhà hàng xóm mở khi đủ thiết kế.

## User Stories

## E2-US1 — Duyệt Thiết kế có sẵn theo hai tab

 Là Young Aesthetes chưa biết bày phòng thế nào, tôi muốn xem các thiết kế có sẵn theo phong cách mình chọn, chia thành Phòng mẫu và Nhà hàng xóm, để tìm một căn giống nhà mình mà bắt đầu.

**Status:** Draft

**Mốc:** M2+ · **Priority:** P2 · **Effort:** M

**Màn:** Thiết kế có sẵn (15-1), vào từ chi tiết phong cách (02-2).

**Pre-condition:** Người dùng đang ở chi tiết một phong cách; có ít nhất một Phòng mẫu của phong cách đó.

**Post-condition:** Người dùng mở được chi tiết một thiết kế (15-2).

#### Acceptance Criteria

- AC1: 15-1 có hai tab tên đúng "Phòng mẫu" và "Nhà hàng xóm"; không dùng tên ngụ ý có kiến trúc sư tuyển chọn (D10).
- AC2: Mỗi thẻ thiết kế hiện ảnh không gian, tổng giá cả bộ dạng `21.600.000 ₫`, số món và số nhà cung cấp.
- AC3: Thẻ ở tab Nhà hàng xóm hiện thêm tác giả, loại căn hộ và diện tích (ví dụ "căn hộ 2 phòng ngủ, 68 m²") để người xem biết có cùng layout không, lượt thả tim và lượt dùng làm mẫu.
- AC4: Danh sách lọc sẵn theo phong cách đang xem ở 02-2; đổi tab giữ nguyên phong cách đã lọc.
- AC5: Tab Nhà hàng xóm chỉ hiện khi số thiết kế công khai đạt ngưỡng (số lượng chưa chốt, xem PRD §8); trước đó 15-1 chỉ có tab Phòng mẫu, không hiện tab trống.
- AC6: Tổng giá trên thẻ luôn tính theo giá hiện tại của các món, không theo giá lúc thiết kế được tạo.

#### Corner Cases

- CC1: Phong cách đang xem chưa có thiết kế nào ở một tab: tab đó hiện màn trống (13-4) gợi ý xem phong cách khác hoặc "Thử trong phòng của bạn".
- CC2: Mất mạng (13-1): giữ các thẻ đã tải, báo mất mạng, có nút "Thử lại"; không hiện giá cũ như giá hiện tại khi chưa lấy được giá mới.
- CC3: Thiết kế bị ẩn hoặc gỡ theo E09 trong lúc danh sách đang mở: thẻ biến khỏi danh sách ở lần tải lại; nếu người dùng bấm vào trước đó, 15-2 báo thiết kế không còn hiển thị.

## E2-US2 — Xem chi tiết thiết kế

 Là Young Aesthetes, tôi muốn xem một thiết kế đầy đủ với ảnh, các món, nhà cung cấp và tổng giá để quyết định mua, dùng làm mẫu hay bỏ qua.

**Status:** Draft

**Mốc:** M2+ · **Priority:** P2 · **Effort:** M

**Màn:** Chi tiết thiết kế (15-2).

**Pre-condition:** Người dùng bấm một thẻ ở 15-1, hoặc mở link chia sẻ một thiết kế.

**Post-condition:** Người dùng thả tim, mở sheet mua (E2-US4), mở sheet dùng làm mẫu 15-3 (E2-US5, E2-US6), hoặc quay lại 15-1.

#### Acceptance Criteria

- AC1: 15-2 hiện ảnh không gian, nguồn (Phòng mẫu của YourSpace, hoặc tác giả kèm loại căn hộ và diện tích với Nhà hàng xóm), danh sách món (ảnh, tên, nhà cung cấp, kích thước dạng `101 × 119 × 117 cm`, giá) và tổng giá.
- AC2: Giá từng món và tổng giá là giá hiện tại tại thời điểm xem.
- AC3: Món hết hàng mang nhãn "Hết hàng" có icon và chữ, và không chọn mua được.
- AC4: Thiết kế là bản dùng lại của thiết kế khác thì hiện dòng ghi nguồn bản gốc, bấm vào mở bản gốc (E09).
- AC5: Màn có đúng một nút đặc terracotta; "Dùng làm mẫu", "Mua" và thả tim là các hành động còn lại theo DESIGN.md.
- AC6: Có lối "Báo cáo" cho thiết kế ở tab Nhà hàng xóm (E09); lối này không nằm cạnh nút chính.

#### Corner Cases

- CC1: Mọi món trong thiết kế đều hết hàng: vẫn xem và dùng làm mẫu được; lối mua tắt kèm lý do bằng chữ.
- CC2: Máy yếu (13-3): ảnh không gian hiện ở chế độ 2D, danh sách món và giá không đổi.
- CC3: Mở từ link chia sẻ khi chưa cài app: trang web hiện ảnh, danh sách món, tổng giá và lời mời mở app; nút dùng làm mẫu mở app thẳng vào thiết kế đó.

## E2-US3 — Thả tim thiết kế cộng đồng

 Là Young Aesthetes, tôi muốn thả tim một thiết kế ở Nhà hàng xóm để cho người đăng biết tôi thích và để lưu nó vào Yêu thích xem lại sau.

**Status:** Draft

**Mốc:** M2+ · **Priority:** P2 · **Effort:** S

**Màn:** Thẻ thiết kế (15-1), chi tiết thiết kế (15-2), tab Yêu thích (10-1).

**Pre-condition:** Người dùng đang xem một thiết kế ở tab Nhà hàng xóm.

**Post-condition:** Lượt thả tim của thiết kế tăng một; thiết kế có trong tab Yêu thích.

#### Acceptance Criteria

- AC1: Bấm tim trên thẻ hoặc ở 15-2 tăng lượt thả tim của thiết kế lên một và lưu thiết kế vào tab Yêu thích; không cần đăng nhập.
- AC2: Bấm lại để bỏ tim: lượt thả tim giảm một và thiết kế rời khỏi tab Yêu thích.
- AC3: Trạng thái đã thả tim hiện bằng hình tim đặc kèm số lượt, không chỉ đổi màu.
- AC4: Lượt thả tim hiện cho người đăng ở trang thiết kế của họ (E09); không quy đổi ra tiền hay hoa hồng.

#### Corner Cases

- CC1: Thả tim liên tục nhiều lần trên cùng máy chỉ tính một lượt cho mỗi thiết kế.
- CC2: Mất mạng (13-1): thiết kế vẫn được lưu vào Yêu thích trên máy; lượt thả tim được gửi khi có mạng lại.
- CC3: Thiết kế đã thả tim bị ẩn hoặc gỡ (E09): thẻ trong Yêu thích hiện "Thiết kế không còn hiển thị" và cho xóa khỏi danh sách.

## E2-US4 — Mua lẻ hoặc mua cả bộ từ thiết kế

 Là Young Aesthetes thích một thiết kế, tôi muốn mua cả bộ hoặc chỉ vài món trong đó bằng một lần thanh toán để có ngay căn phòng như vậy mà không phải mua từng nơi.

**Status:** Draft

**Mốc:** M2+ · **Priority:** P2 · **Effort:** M

**Màn:** Chi tiết thiết kế (15-2) → sheet mua dùng chung với E07 → luồng thanh toán (07-1…07-7).

**Pre-condition:** Thiết kế có ít nhất một món còn hàng.

**Post-condition:** Đơn được đặt qua E07; người dùng quay về đúng tab thiết kế đang xem.

#### Acceptance Criteria

- AC1: "Mua cả bộ" mở sheet mua của E07 với mọi món còn hàng được chọn sẵn, nhóm theo nhà cung cấp; bỏ chọn món nào thì món đó không được mua (mua lẻ).
- AC2: Giá trong sheet là giá hiện tại; tổng tiền cập nhật ngay khi chọn hoặc bỏ chọn.
- AC3: Mua nhiều món từ nhiều nhà cung cấp là một lần thanh toán; hệ thống tách đơn theo nhà cung cấp (D10, E07).
- AC4: Sheet hiện câu "YourSpace không cầm tiền của bạn. Khoản thanh toán được giữ tại đối tác thanh toán được cấp phép đến khi bạn nhận hàng." (D2).
- AC5: Khi thiết kế là không gian của người khác (tab Nhà hàng xóm), sheet nhắc người dùng đo lại phòng mình vì cùng layout chưa chắc cùng kích thước, kèm kích thước từng món.
- AC6: Đặt hàng xong, nút chính đưa về đúng tab thiết kế đang xem ở 15-1; "Xem đơn hàng" là lựa chọn phụ.

#### Corner Cases

- CC1: Giá một món đổi giữa lúc mở sheet và lúc thanh toán: báo giá mới trước khi thanh toán, người dùng xác nhận lại.
- CC2: Một món hết hàng sau khi đã chọn: bỏ món đó khỏi sheet, báo bằng chữ, tính lại tổng.
- CC3: Mất mạng (13-1) trong lúc thanh toán: xử lý theo E07, không tạo đơn trùng; sau khi có mạng lại vẫn quay về đúng tab đang xem.

## E2-US5 — Dùng làm mẫu: dùng cả không gian

 Là Young Aesthetes ở căn hộ cùng layout với một thiết kế, tôi muốn sao chép cả không gian đó vào Phòng của tôi để chỉnh tiếp mà không phải bày lại từ đầu.

**Status:** Draft

**Mốc:** M2+ · **Priority:** P2 · **Effort:** L

**Màn:** Chi tiết thiết kế (15-2) → sheet "Dùng thiết kế này thế nào?" (15-3) → Phòng của tôi (03-0) → Trình chỉnh sửa (05-1).

**Pre-condition:** Người dùng đang ở 15-2; với thiết kế ở tab Nhà hàng xóm, người đăng đã cho phép dùng cả không gian (E09).

**Post-condition:** Phòng của tôi có một không gian mới là bản sao của thiết kế, đang mở trong Trình chỉnh sửa; bản gốc không đổi.

#### Acceptance Criteria

- AC1: 15-3 hiện hai lựa chọn có mô tả: "Dùng cả không gian" (nhà bạn cùng layout, mở ảnh phòng và cách bày của người đăng để chỉnh tiếp) và "Lấy bộ món" (các món vào khay, bạn tự đặt vào ảnh phòng của mình).
- AC2: Chọn "Dùng cả không gian" tạo một không gian mới trong Phòng của tôi gồm ảnh phòng, các món đã đặt, vị trí, chất liệu và dự toán theo giá hiện tại, rồi mở nó trong Trình chỉnh sửa; không cần đăng nhập.
- AC3: Mọi chỉnh sửa trên bản sao không làm đổi bản gốc.
- AC4: Bản sao mang dòng ghi nguồn thiết kế gốc; dòng này đi theo nếu bản sao được đăng tiếp (E09).
- AC5: Lượt dùng làm mẫu của thiết kế gốc tăng một và được ghi riêng cho nhánh dùng cả không gian (E11).
- AC6: Với thiết kế mà người đăng đã tắt "cho phép dùng cả không gian", 15-3 ẩn lựa chọn này và chỉ còn "Lấy bộ món"; Phòng mẫu luôn có đủ hai lựa chọn.

#### Corner Cases

- CC1: Mất mạng (13-1) khi đang tải ảnh gốc: không tạo không gian dở dang; báo lỗi và cho thử lại.
- CC2: Món trong bản sao đã hết hàng: giữ món trên ảnh với nhãn "Hết hàng", không tính vào dự toán.
- CC3: Máy yếu (13-3): bản sao mở ở chế độ xem 2D, vẫn lưu được vào Phòng của tôi.
- CC4: AI tạm ngưng (13-2): bản sao vẫn mở được vì vị trí các món đã có sẵn; món thêm mới được đặt thủ công theo E04.

## E2-US6 — Dùng làm mẫu: lấy bộ món về phòng mình

 Là Young Aesthetes thích các món của một thiết kế nhưng nhà mình khác layout, tôi muốn đưa cả bộ món vào khay rồi tự đặt vào ảnh phòng của mình.

**Status:** Draft

**Mốc:** M2+ · **Priority:** P2 · **Effort:** M

**Màn:** Sheet 15-3 → chọn nguồn ảnh (03-1) → chụp và hiểu phòng (03-2…03-7) → Trình chỉnh sửa (05-1).

**Pre-condition:** Người dùng đang ở 15-3.

**Post-condition:** Trình chỉnh sửa mở trên ảnh phòng của người dùng, khay có một tab chứa bộ món của thiết kế.

#### Acceptance Criteria

- AC1: Chọn "Lấy bộ món" đưa người dùng tới chụp ảnh mới hoặc chọn ảnh có sẵn (03-1), qua đủ bước consent và hiểu phòng của E03.
- AC2: Trong Trình chỉnh sửa, khay có một tab riêng tên theo thiết kế nguồn chứa toàn bộ món của thiết kế; tab này đứng cạnh các tab phong cách, đổi tab không mất đồ đã đặt.
- AC3: Không món nào tự xuất hiện trên ảnh; người dùng tự kéo từng món vào, AI chỉ gợi ý tỷ lệ và vị trí với chip "Đã tự căn theo mặt sàn · kéo để chỉnh".
- AC4: Nhánh này không dùng ảnh phòng của người đăng; nó dùng được kể cả khi người đăng tắt "cho phép dùng cả không gian".
- AC5: Không gian mới mang dòng ghi nguồn thiết kế gốc; lượt dùng làm mẫu của thiết kế gốc tăng một và được ghi riêng cho nhánh lấy bộ món (E11).

#### Corner Cases

- CC1: Người dùng hủy ở bước chụp: quay về 15-2, không tạo không gian nào và không tính lượt dùng làm mẫu.
- CC2: Món trong bộ đã hết hàng: vẫn hiện trong tab với nhãn "Hết hàng", không kéo vào ảnh được.
- CC3: AI tạm ngưng (13-2) hoặc không lấy được depth: chuyển sang đặt thủ công (F5), bộ món vẫn nằm trong khay.
- CC4: Ảnh phòng khó phân tích (F4, 03-7): không chặn; tắt tự căn, người dùng tự đặt các món.
