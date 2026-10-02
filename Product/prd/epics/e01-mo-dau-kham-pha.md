---
derives_from: [D1@d0d780f3, D5@15cdc73a, D8@4efe52c0]
---
[Quay lại PRD YourSpace](../../PRD.md)

# E01 Mở đầu & khám phá phong cách

Epic này gom phần đầu của hành trình: màn mở đầu với hai cửa vào (Thử phòng, Khám phá phong cách) và lối vào Phòng của tôi cho người quay lại, thanh điều hướng của app, rồi luồng duyệt phong cách xuống tới từng món. Mục tiêu là người dùng gọi tên được gu của mình và thấy nó cụ thể bằng đồ thật (Need #1 = style-first, D8), rồi đi tiếp vào thử phòng mà không gặp màn đăng nhập hay form đăng ký nào (D1).

## Version Control

| Version | Date | Updated by | Note |
| --- | --- | --- | --- |
| 1.0 | 02 Oct 2026 | Phạm Việt Anh | Tạo epic từ PRD v2.0 và flow chốt 02/10/2026. |

## Scope

- **Trong phạm vi** — Màn mở đầu hai cửa vào và lối vào Phòng của tôi; xin quyền camera đúng lúc bấm chụp (01-3); tab bar app M2; trang phong cách (02-1), chi tiết phong cách (02-2), danh sách món có lọc (02-3), chi tiết sản phẩm có xem 3D (02-4).
- **Ngoài phạm vi** — Style Quiz (LATER); tìm kiếm (02-5, M2, chưa viết story ở bản này); màn giới thiệu ba bước 01-2a…01-2c của spec M2 (flow 02/10 không nhắc tới, chưa viết story); Thiết kế có sẵn (E02); chụp và hiểu phòng (E03); khay đồ trong Trình chỉnh sửa (E04); Yêu thích và báo giảm giá (E06); mua (E07).
- **Theo mốc** — M1: web, 2–3 phong cách (Japandi · Mid-Century · Bauhaus, chốt 24/07), catalog 16–24 models, dùng lại 02-1…02-4; chưa có tab bar, chưa có tài khoản. · M2: app native, 3 phong cách × 8 món, tab bar 5 ô, lối vào Phòng của tôi đầy đủ. · M2+: chi tiết phong cách dẫn sang Thiết kế có sẵn (E02).

## User Stories

## E1-US1 — Màn mở đầu hai cửa vào

 Là Young Aesthetes mở YourSpace lần đầu, tôi muốn thấy ngay hai cách bắt đầu là chụp phòng mình hoặc khám phá phong cách để vào việc liền mà không phải đăng ký.

**Status:** Draft

**Mốc:** M1 · **Priority:** P0 · **Effort:** M

**Màn:** Màn chào `Main` (spec M2 nhóm 1); web M1: trang chủ `/`.

**Pre-condition:** Người dùng mở app hoặc trang web; chưa có không gian nào được lưu.

**Post-condition:** Người dùng đã vào luồng Thử phòng (E03) hoặc trang phong cách 02-1.

#### Acceptance Criteria

- AC1: Màn mở đầu có đúng một nút đặc terracotta là "Chụp ảnh phòng"; "Khám phá phong cách" hiện ngang hàng dưới dạng thẻ, ghi tên các phong cách đang có (M1: Japandi · Mid-Century · Bauhaus).
- AC2: Màn mở đầu không có form đăng ký, đăng nhập hay ô nhập SĐT; người dùng đi hết luồng thử phòng mà không gặp bước tạo tài khoản nào.
- AC3: Màn mở đầu không xin quyền camera, thông báo hay vị trí; quyền camera chỉ được xin theo E1-US3.
- AC4: Bấm "Chụp ảnh phòng" mở luồng chụp (03-1/03-2); bấm thẻ "Khám phá phong cách" mở 02-1.
- AC5: Mọi vùng chạm trên màn ≥ 44px; chữ đạt tương phản ≥ 4.5:1 ở cả theme Ban ngày và Buổi tối.
- AC6: Sự kiện mở màn và cửa vào đã chọn được ghi theo E11 để đo Activation Rate.

#### Corner Cases

- CC1: Mất mạng khi mở (13-1): màn mở đầu vẫn hiện hai cửa vào kèm thông báo mất mạng có nút "Thử lại"; ảnh thẻ phong cách chưa tải được thì hiện chấm mẫu vật liệu thay ảnh, không để khung trắng.
- CC2: AI tạm ngưng (13-2) không chặn màn mở đầu; người dùng vẫn vào được Thử phòng và được báo ở bước hiểu phòng rằng sẽ đặt đồ thủ công (E03, E04).
- CC3: Trên máy tính không có camera (web M1), nút chính đổi thành "Tải ảnh phòng" và mở bộ chọn tệp.

## E1-US2 — Lối vào Phòng của tôi cho người quay lại

 Là Young Aesthetes đã lưu một không gian đang làm dở, tôi muốn thấy nó ngay ở màn mở đầu để mở lại bằng một chạm.

**Status:** Draft

**Mốc:** M2 · **Priority:** P1 · **Effort:** S

**Màn:** Màn chào `Main` → Phòng của tôi (03-0) → Trình chỉnh sửa (05-1). Web M1: phụ thuộc cách lưu ở M1, chưa chốt, xem PRD §8.

**Pre-condition:** Trên máy có ít nhất một không gian đã lưu (E06).

**Post-condition:** Không gian được mở lại trong Trình chỉnh sửa đúng trạng thái lúc lưu.

#### Acceptance Criteria

- AC1: Khi có không gian đã lưu, màn mở đầu hiện thêm khối "Tiếp tục" với không gian gần nhất: tên, số món, thời điểm lưu (ví dụ "Phòng khách · 4 món · lưu hôm qua") và nút "Mở".
- AC2: Bấm "Mở" đưa thẳng vào Trình chỉnh sửa với đủ các món đã đặt, vùng đã xóa, chất liệu đã chọn và dự toán như lúc lưu; món đã mua giữ nhãn "Đã mua".
- AC3: Khi chưa có không gian nào được lưu, khối "Tiếp tục" không hiện; màn mở đầu giữ nguyên bố cục hai cửa vào của E1-US1, không hiện trạng thái trống.
- AC4: Mở lại không gian đã lưu không cần đăng nhập hay xác minh SĐT.

#### Corner Cases

- CC1: Có nhiều không gian đã lưu: khối "Tiếp tục" chỉ hiện không gian gần nhất kèm liên kết "Xem tất cả" mở 03-0.
- CC2: Dữ liệu không gian bị hỏng hoặc ảnh phòng đã bị xóa khỏi máy: báo không mở được không gian này, cho xóa nó khỏi danh sách, không làm treo màn mở đầu.
- CC3: Máy yếu (13-3): không gian mở ở chế độ xem 2D, có thông báo vì sao và cách quay về chế độ 3D khi máy đáp ứng được.

## E1-US3 — Xin quyền camera đúng lúc bấm chụp

 Là Young Aesthetes, tôi muốn app chỉ hỏi quyền camera khi tôi thật sự bấm chụp để hiểu vì sao app cần nó và không bị hỏi ngay khi vừa mở.

**Status:** Draft

**Mốc:** M2 · **Priority:** P0 · **Effort:** S

**Màn:** Xin quyền camera (01-3) → chọn nguồn ảnh (03-1) / camera (03-2). Web M1: hộp thoại quyền của trình duyệt khi bấm chụp.

**Pre-condition:** Người dùng bấm "Chụp ảnh phòng" và app chưa từng được cấp hoặc bị từ chối quyền camera.

**Post-condition:** App có quyền camera và mở 03-2, hoặc người dùng chọn ảnh từ thư viện.

#### Acceptance Criteria

- AC1: Màn 01-3 chỉ hiện ở lần đầu bấm "Chụp ảnh phòng", nói ngắn gọn app cần camera để chụp phòng, rồi mới gọi hộp thoại quyền của hệ điều hành.
- AC2: Màn 01-3 luôn có lựa chọn phụ "Chọn ảnh có sẵn" để đi luồng ảnh thư viện (03-1, 03-6) mà không cần cấp quyền camera.
- AC3: Đã cấp quyền thì những lần bấm chụp sau vào thẳng camera 03-2, không qua 01-3.
- AC4: Màn 01-3 không nhắc tới việc gửi ảnh lên hệ thống; câu consent về ảnh chỉ hiện ở màn xem lại 03-3 trước lần gửi ảnh đầu (E03).

#### Corner Cases

- CC1: Người dùng từ chối quyền: quay về 03-1, hiện hướng dẫn mở lại quyền trong Cài đặt kèm nút "Chọn ảnh có sẵn"; không hỏi lại tự động.
- CC2: Hệ điều hành đã chặn hẳn quyền (không còn hiện hộp thoại): 01-3 đổi nút chính thành "Mở Cài đặt", vẫn giữ "Chọn ảnh có sẵn".
- CC3: Camera đang bị app khác chiếm hoặc lỗi mở camera: báo lỗi bằng chữ, cho thử lại hoặc chọn ảnh có sẵn.

## E1-US4 — Tab bar điều hướng của app

 Là Young Aesthetes dùng app M2, tôi muốn một thanh điều hướng cố định để chuyển nhanh giữa khám phá, phòng của mình, thử phòng, đồ yêu thích và trang cá nhân.

**Status:** Draft

**Mốc:** M2 · **Priority:** P1 · **Effort:** S

**Màn:** Tab bar (spec M2 §2). Web M1 không có tab bar.

**Pre-condition:** Người dùng đã qua màn mở đầu và đang ở một màn chính của app.

**Post-condition:** Người dùng tới đúng khu vực đã chọn.

#### Acceptance Criteria

- AC1: Tab bar có 5 ô theo thứ tự: Khám phá · Phòng · Thử phòng · Yêu thích · Tôi; ô Thử phòng ở giữa, nổi bật và mở thẳng luồng chụp (E1-US3).
- AC2: Mỗi ô có icon và chữ; ô đang chọn không chỉ đổi màu mà có thêm dấu hiệu hình dạng (DESIGN.md: không dùng màu một mình để báo trạng thái); vùng chạm mỗi ô ≥ 44px.
- AC3: Mọi ô dùng được khi chưa đăng nhập; tab Tôi chỉ yêu cầu xác minh SĐT khi người dùng vào đơn hàng hoặc đồng bộ tài khoản, không yêu cầu khi mở tab.
- AC4: Giỏ hàng nằm ở góc trên các màn mua sắm, không chiếm ô tab; đơn hàng nằm trong Tôi.

#### Corner Cases

- CC1: Đang ở Trình chỉnh sửa có thay đổi chưa lưu mà bấm sang tab khác: hỏi lưu không gian hay bỏ thay đổi, không mất dữ liệu âm thầm.
- CC2: Tab Phòng hoặc Yêu thích chưa có gì: hiện màn trống (13-4) với một hành động gợi ý (ví dụ "Chụp ảnh phòng" hoặc "Khám phá phong cách").
- CC3: Mất mạng (13-1): tab bar vẫn chuyển được giữa các tab; nội dung cần mạng hiện thông báo mất mạng trong tab đó.

## E1-US5 — Duyệt phong cách và xem chi tiết phong cách

 Là Young Aesthetes biết mình thích cái đẹp nhưng không gọi được tên, tôi muốn duyệt các phong cách với đặc trưng, chất liệu và món tiêu biểu để nhận ra gu của mình.

**Status:** Draft

**Mốc:** M1 · **Priority:** P0 · **Effort:** M

**Màn:** Trang phong cách (02-1), chi tiết phong cách (02-2). Web M1 dùng lại 02-1, 02-2.

**Pre-condition:** Người dùng chọn cửa "Khám phá phong cách" hoặc tab Khám phá.

**Post-condition:** Người dùng đã chọn một phong cách; phong cách đó được mang sang luồng thử phòng và khay đồ (E04).

#### Acceptance Criteria

- AC1: 02-1 hiện mỗi phong cách bằng một thẻ gồm ảnh minh họa, tên, một câu mô tả và chấm mẫu vật liệu; M1 có 2–3 phong cách (Japandi · Mid-Century · Bauhaus), M2 có 3 phong cách.
- AC2: 02-2 hiện đặc trưng của phong cách (màu sắc, chất liệu, cảm xúc), chấm mẫu vật liệu chữ ký và danh sách món tiêu biểu có ảnh, tên, giá dạng `12.400.000 ₫`.
- AC3: 02-2 có đúng một nút đặc "Thử trong phòng của bạn"; bấm vào mở luồng chụp (E03) và phong cách này là tab mặc định trong khay đồ của Trình chỉnh sửa.
- AC4: 02-2 có lối phụ "Xem tất cả món" mở 02-3 đã lọc theo phong cách này.
- AC5: Thời gian từ lúc mở app đến lúc chọn được phong cách ≤ 60 giây (chỉ tiêu từ PRD 1.x).
- AC6: Sự kiện xem và chọn phong cách được ghi theo E11 (bước đầu của Activation Rate).
- AC7: Từ M2+, 02-2 có lối vào Thiết kế có sẵn của phong cách đó (E02); ở M1 và M2 lối này không hiện.

#### Corner Cases

- CC1: Ảnh minh họa phong cách không tải được: thẻ giữ tên, mô tả và chấm mẫu vật liệu, ảnh thay bằng nền vật liệu; vẫn bấm vào được.
- CC2: Mất mạng (13-1) khi mở 02-2: hiện phần đã có trong catalog tĩnh, báo mất mạng ở phần ảnh, có nút "Thử lại".
- CC3: Một phong cách tạm thời không có món nào hiển thị được: 02-2 vẫn hiện đặc trưng, phần món tiêu biểu hiện màn trống (13-4) và gợi ý xem phong cách khác.

## E1-US6 — Danh sách món có lọc

 Là Young Aesthetes đã chọn được phong cách, tôi muốn xem các món thuộc phong cách đó và lọc theo loại đồ, chất liệu để tìm đúng món mình cần.

**Status:** Draft

**Mốc:** M1 · **Priority:** P0 · **Effort:** M

**Màn:** Danh sách món có lọc (02-3). Web M1 dùng lại 02-3.

**Pre-condition:** Người dùng đã chọn một phong cách ở 02-2.

**Post-condition:** Người dùng mở được chi tiết một món (02-4).

#### Acceptance Criteria

- AC1: 02-3 chỉ hiện các món thuộc phong cách đang chọn; M1 lấy từ catalog 16–24 models chia cho 2–3 phong cách, M2 có 8 món mỗi phong cách.
- AC2: Lọc theo loại đồ bằng chip (ví dụ Sofa, Bàn, Đèn, Kệ) và theo chất liệu bằng chấm mẫu vật liệu; chip đang bật có icon hoặc dấu chọn, không chỉ đổi màu.
- AC3: Mỗi món hiện ảnh, tên, giá dạng `12.400.000 ₫`, nhà cung cấp và kích thước dạng `101 × 119 × 117 cm`.
- AC4: Ở M1, giá ghi là giá tham khảo và nhà cung cấp là nơi bán qua link affiliate (D5, D7).
- AC5: Bấm một món mở 02-4; quay lại 02-3 giữ nguyên bộ lọc và vị trí cuộn.

#### Corner Cases

- CC1: Bộ lọc không ra món nào: hiện màn trống (13-4) với nút "Bỏ lọc".
- CC2: Mất mạng (13-1) giữa chừng: danh sách đã tải giữ nguyên, ảnh chưa tải hiện khung vật liệu, có thông báo và nút "Thử lại".
- CC3: Một món thiếu kích thước hoặc giá trong catalog: không hiện món đó; catalog được kiểm tra lúc build (spec M1).

## E1-US7 — Chi tiết sản phẩm có xem 3D

 Là Young Aesthetes đang cân nhắc một món, tôi muốn xem mô hình 3D, kích thước thật và giá để biết nó có đáng thử trong phòng mình không.

**Status:** Draft

**Mốc:** M1 · **Priority:** P0 · **Effort:** M

**Màn:** Chi tiết sản phẩm có xem 3D (02-4). Web M1 dùng lại 02-4.

**Pre-condition:** Người dùng mở một món từ 02-2 hoặc 02-3.

**Post-condition:** Món được đưa vào luồng thử phòng, được thả tim vào Yêu thích (M2), hoặc người dùng đi tới bước mua (E07).

#### Acceptance Criteria

- AC1: 02-4 hiện mô hình 3D xoay được quanh trục Y bằng thao tác kéo, kèm tên, giá dạng `12.400.000 ₫`, nhà cung cấp, chất liệu và kích thước thật dạng `101 × 119 × 117 cm`.
- AC2: Nút đặc duy nhất là "Thử trong phòng của bạn": nếu đã có không gian đang mở thì món vào khay của không gian đó; nếu chưa thì mở luồng chụp (E03) và món chờ sẵn trong khay.
- AC3: Ở M1, lối mua là link affiliate hoặc để lại SĐT theo E07; ở M2, lối mua mở sheet mua của E07.
- AC4: Ở M2, có nút thả tim lưu món vào Yêu thích không cần đăng nhập (E06).
- AC5: Xem 3D giữ ≥ 30fps trên máy đạt yêu cầu tối thiểu như canvas (E04).

#### Corner Cases

- CC1: Máy yếu (13-3): thay mô hình 3D bằng ảnh 2D của món, ghi rõ đang xem 2D; nút "Thử trong phòng của bạn" vẫn dùng được.
- CC2: Tệp `.glb` lỗi hoặc không tải được: hiện khối thay thế đúng kích thước thật kèm nút "Thử lại" (spec M1).
- CC3: Mất mạng (13-1) trước khi tải xong mô hình: giữ thông tin chữ và giá, báo mất mạng ở khung 3D, có nút "Thử lại".
