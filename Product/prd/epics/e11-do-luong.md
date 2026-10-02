---
derives_from: [D5@15cdc73a, D10@4b681365]
---
[Quay lại PRD YourSpace](../../PRD.md)

# E11 Đo lường & thử nghiệm

M1 tồn tại để trả lời một câu hỏi: người dùng có coi việc thử đồ trong phòng thật là bước để **mua thật** hay chỉ là trò chơi trang trí (D5, PRD §7.1). Epic này định nghĩa cách trả lời câu hỏi đó bằng hành vi đo được: thí nghiệm ảnh ghép trước khi viết code, schema sự kiện có kiểu cho vòng lõi M1, cách tính các chỉ số ở PRD §6, và cách đo Click-to-Buy sao cho không đếm nhầm click tò mò. Từ M2 trở đi, epic bổ sung sự kiện cho Thiết kế có sẵn, Nhà hàng xóm và link chia sẻ (D10). Đo lường không được trở thành một đường để ảnh phòng rời khỏi luồng xử lý đã consent.

## Version Control

| Version | Date | Updated by | Note |
| --- | --- | --- | --- |
| 1.0 | 02 Oct 2026 | Phạm Việt Anh | Tạo epic từ PRD v2.0 và flow chốt 02/10/2026. |

## Scope

- **Trong phạm vi** — Thí nghiệm ảnh ghép RAT; schema sự kiện có kiểu ở `packages/core` (`analytics/events`, spec M1 §7); route `/api/events`; cách tính chỉ số PRD §6; UTM và đo thời gian ở lại trang nhà cung cấp; ranh giới quyền riêng tư của đo lường; sự kiện M2+ cho cộng đồng, đơn hàng và link.
- **Ngoài phạm vi** — Spike depth tuần 1 và rubric believability (spec M1 §10, thuộc E04); Sean Ellis survey và Organic Referral Rate (MVP_Research §11.4, chưa đưa vào PRD §6); A/B test giao diện; hệ thống quảng cáo và attribution trả phí.
- **Theo mốc** — M1: thí nghiệm ảnh ghép, schema 8 sự kiện của spec M1 cộng phần bổ sung, chỉ số PRD §6 mốc M1, UTM và thời gian ở lại. M2: sự kiện đơn hàng thật (`OrderPlaced`). M2+: sự kiện cộng đồng và link chia sẻ (D10).

## User Stories

## E11-US1 — Thí nghiệm ảnh ghép trước khi code

 Là founder YourSpace, tôi muốn kiểm chứng giả định nguy hiểm nhất bằng ảnh ghép thủ công trước khi viết code, để không xây cả M1 trên một giả định sai.

**Status:** Draft

**Mốc:** M1 (tuần đầu, trước khi code) · **Priority:** P0 · **Effort:** M

**Màn:** Không có màn sản phẩm. Ảnh ghép thủ công bằng công cụ chỉnh ảnh.

**Pre-condition:** Có 5 ảnh phòng thật và bộ món từ catalog M1 (2–3 phong cách).

**Post-condition:** Có bảng kết quả từng người tham gia và một kết luận ghi lại: tiếp tục, tiếp tục kèm điều chỉnh, hoặc dừng.

#### Acceptance Criteria

- AC1: Thiết kế đúng 5 ảnh phòng × 2 bản × 20 người (PRD §7.1, MVP_Research §12.4). Mỗi ảnh có một bản "ghép vụng" (sai tỷ lệ) và một bản "ghép đẹp" (đúng tỷ lệ).
- AC2: 20 người thuộc Young Aesthetes (PRD §3.1). Mỗi người xem cả hai bản và trả lời hai câu: "Bạn có bấm Mua không?" và "Bản nào khiến bạn muốn mua hơn?". Câu trả lời ghi theo từng người, từng ảnh.
- AC3: Quy tắc kết luận theo MVP_Research §12.4: không ai muốn mua dù xem bản ghép đẹp thì RAT sai, dừng dự án; bản ghép đẹp tạo ý định mua cao hơn rõ rệt thì giữ AI Spatial Placement trong M1. Mức chênh lệch được coi là "rõ rệt" chưa chốt; founder ghi ngưỡng **trước** khi chạy thí nghiệm.
- AC4: Kết quả và kết luận được lưu thành tài liệu trong repo, kèm cỡ mẫu thực tế và cách tuyển người.

#### Corner Cases

- CC1: Không tuyển đủ 20 người đúng phân khúc: ghi rõ cỡ mẫu thực, không ngoại suy thành tỷ lệ cho toàn bộ người dùng.
- CC2: Người tham gia đoán được bản nào là bản "chuẩn": xáo thứ tự hai bản giữa các người, không gắn nhãn "vụng" hay "đẹp".
- CC3: Dùng ảnh phòng của chính người tham gia: xin đồng ý trước, chỉ dùng cho thí nghiệm và xóa sau khi xong.

## E11-US2 — Schema sự kiện có kiểu cho vòng lõi M1

 Là founder YourSpace, tôi muốn mọi hành vi trong vòng lõi M1 được ghi bằng sự kiện có kiểu, để chỉ số tính ra từ dữ liệu đúng nghĩa chứ không từ log rời rạc.

**Status:** Draft

**Mốc:** M1 · **Priority:** P0 · **Effort:** M

**Màn:** Web M1: `packages/core/analytics/events`, API `/api/events` (spec M1 §6–§7).

**Pre-condition:** Nơi lưu sự kiện được chọn: PostHog phía client hoặc `/api/events` ghi vào Supabase (spec M1 §3, chưa chốt).

**Post-condition:** Mỗi bước của vòng lõi phát đúng một sự kiện hợp lệ theo schema.

#### Acceptance Criteria

- AC1: Schema gồm 8 sự kiện của spec M1 §7, đặt tên PascalCase. Tên snake_case trong spec M1 §8 (`style_selected`, `buy_clicked`…) là cùng sự kiện, không phải sự kiện khác.

| Sự kiện | Khi nào phát | Trường đề xuất (không có ảnh) |
| --- | --- | --- |
| `StyleSelected` | Chọn phong cách | `styleId` |
| `PhotoUploaded` | Depth trả kết quả hoặc chuyển chế độ tự chỉnh | `source` (camera · thư viện · ảnh mẫu), `depthMs`, `confidenceBucket`, `manualMode` |
| `ItemPlaced` | Thả một món vào ảnh | `itemId`, `styleId`, `autoPlaced` |
| `ScaleOverride` | Người dùng chỉnh tay tỷ lệ một món (F1) | `itemId` |
| `ItemRemoved` | Xóa một món 3D khỏi không gian | `itemId` |
| `InpaintDone` | Xóa đồ cũ trong ảnh xong hoặc lỗi (E05) | `result` (ok · lỗi · hoàn tác), `ms` |
| `BuyClicked` | Bấm mua một món hoặc cả bộ | `itemIds`, `totalVND`, `mode` (lẻ · cả bộ), `supplierIds` |
| `LeadSubmitted` | Server xác nhận đã nhận lead (E10-US1) | `styleId`, `itemCount`, `totalVND` |

- AC2: Bổ sung vào schema để tính đủ chỉ số PRD §6: `SessionStarted` (cho Return Rate D7) và `SpaceSaved` / `SpaceShared` (cho Save/Share Rate). Spec M1 §8 có `save_share` nhưng §7 chưa có kiểu; cần cập nhật spec M1 khi duyệt epic này.
- AC3: Mỗi sự kiện có `anonymousId` (lưu trong trình duyệt, không gắn SĐT hay danh tính), `sessionId`, thời điểm và phiên bản schema. M1 không có tài khoản (D5).
- AC4: Sự kiện được kiểm kiểu trước khi gửi và khi `/api/events` nhận. Sự kiện sai schema bị loại và ghi lỗi, không ghi một nửa.
- AC5: Test E2E (spec M1 §12): chọn phong cách → tải ảnh → đặt món → dự toán → bấm mua phát đúng chuỗi `StyleSelected → PhotoUploaded → ItemPlaced → BuyClicked`.

#### Corner Cases

- CC1: Mất mạng (13-1): sự kiện xếp hàng trong trình duyệt và gửi lại khi có mạng, không trùng (khóa idempotency theo từng sự kiện).
- CC2: AI tạm ngưng (13-2) hoặc depth lỗi (F5): vẫn phát `PhotoUploaded` với `manualMode = true`, để không mất người dùng khỏi phễu Activation.
- CC3: Máy yếu chuyển xem 2D (13-3): sự kiện mang cờ chế độ hiển thị, để tách chỉ số giữa hai nhóm máy.
- CC4: Trình duyệt chặn bộ nhớ cục bộ: `anonymousId` sinh mới mỗi phiên; Return Rate của nhóm này bị đếm thiếu và được ghi chú trong báo cáo.

## E11-US3 — Tính các chỉ số PRD §6

 Là founder YourSpace, tôi muốn xem các chỉ số M1 tính thẳng từ sự kiện, với định nghĩa cố định, để biết RAT đang đúng hay sai mà không phải đoán.

**Status:** Draft

**Mốc:** M1 · **Priority:** P0 · **Effort:** M

**Màn:** Bảng chỉ số nội bộ (không có màn cho người dùng).

**Pre-condition:** E11-US2 đã chạy và có dữ liệu sự kiện.

**Post-condition:** Mỗi chỉ số M1 của PRD §6 có một truy vấn đã ghi lại định nghĩa, mẫu số và target.

#### Acceptance Criteria

- AC1: Định nghĩa theo PRD §6, đơn vị đếm là `anonymousId`:

| Chỉ số | Cách tính từ sự kiện | Target (PRD §6) |
| --- | --- | --- |
| Activation Rate | Người có `StyleSelected` → `PhotoUploaded` → ≥1 `ItemPlaced` / tổng người dùng | ≥ 30% |
| Click-to-Buy Rate | Người có ≥1 `BuyClicked` / tổng người dùng | ≥ 15% |
| Save/Share Rate | Người có `SpaceSaved` hoặc `SpaceShared` sau ≥1 `ItemPlaced` / người có ≥1 `ItemPlaced` | ≥ 30% |
| Return Rate (D7) | Người có `SessionStarted` mới trong 7 ngày sau phiên đầu / người có phiên đầu | ≥ 25% |
| AOV | Trung bình `totalVND` của `BuyClicked` | Base ~10 triệu ₫; 15 triệu ₫ là upside |
| AI Placement Accuracy | Món có `autoPlaced = true` không có `ScaleOverride` sau đó / món có `autoPlaced = true` | ≥ 60% (giả thuyết phụ, chưa có baseline) |

- AC2: Click-to-Buy báo kèm một biến thể mẫu số "người đã đặt ≥1 món", vì giả thuyết chính ở MVP_Research §11.2 đo trên người đã hoàn thành bản phối. Hai con số ghi rõ mẫu số, không trộn.
- AC3: Báo kèm chỉ số Aha đề xuất ở MVP_Research §12.3: % người tải ảnh phòng thật (`source` khác ảnh mẫu) và có ≥1 `BuyClicked` hoặc `LeadSubmitted` trong cùng phiên.
- AC4: Không báo các chỉ số phù phiếm làm chỉ số thành công: tổng lượt truy cập, tổng số món được kéo thả, thời gian trung bình trên trang, số bản phối không kèm bấm mua (MVP_Research §11.3).
- AC5: Ngưỡng pass spike depth chưa chốt (PRD §8); AI Placement Accuracy không thay cho rubric spike.

#### Corner Cases

- CC1: Chưa có dữ liệu (13-4): bảng chỉ số hiện "Chưa đủ dữ liệu" thay vì 0%.
- CC2: AI Placement Accuracy chưa đo được việc kéo lại vị trí sau khi thả (F2), vì chưa có sự kiện riêng. Thêm sự kiện kéo lại vị trí hay gộp vào `ScaleOverride` chưa chốt; báo cáo ghi rõ giới hạn này.
- CC3: Lưu lượng từ chính founder và người test nội bộ: loại theo danh sách `anonymousId` nội bộ trước khi tính.

## E11-US4 — Đo Click-to-Buy kèm UTM và thời gian ở lại trang nhà cung cấp

 Là founder YourSpace, tôi muốn phân biệt người bấm mua để mua với người bấm vì tò mò giá, để Click-to-Buy không thành chỉ số phù phiếm.

**Status:** Draft

**Mốc:** M1 · **Priority:** P0 · **Effort:** M

**Màn:** Web M1: nút mua trong `EstimatePanel`, `AffiliateCheckout` (spec M1 §7). Spec M2: 06-1.

**Pre-condition:** Món trong catalog có `buyUrl` (spec M1 §7). Đích link affiliate chưa chốt (PRD §8).

**Post-condition:** Mỗi `BuyClicked` có thể nối với lượt đến trang nhà cung cấp và, khi có dữ liệu, thời gian ở lại.

#### Acceptance Criteria

- AC1: Mọi link ra ngoài đi qua một redirect của YourSpace (MVP_Research §12.5 action #9). Redirect ghi `BuyClicked` trước khi chuyển hướng và gắn UTM nhận diện YourSpace, phong cách và món.
- AC2: Thời gian ở lại trang nhà cung cấp lấy từ dữ liệu UTM của nhà cung cấp khi họ chia sẻ. Khi không có, dùng chỉ số thay thế: thời gian từ lúc rời tab YourSpace tới lúc quay lại, ghi rõ là chỉ số thay thế.
- AC3: Báo hai con số: Click-to-Buy thô (PRD §6) và Click-to-Buy có ý định. Ngưỡng đề xuất ở MVP_Research §12.3 (ở lại ≥ 30 giây thì tính; rời trong < 10 giây thì không tính) **chưa chốt**; founder chốt trước khi launch.
- AC4: Redirect không làm chậm việc mở trang nhà cung cấp tới mức người dùng nhận ra. Ghi sự kiện lỗi không được chặn việc chuyển hướng.

#### Corner Cases

- CC1: Nhà cung cấp hoặc sàn không chia sẻ dữ liệu UTM: chỉ có chỉ số thay thế, ghi chú trong báo cáo.
- CC2: Người dùng không quay lại tab YourSpace: thời gian ở lại là "không xác định", không tính vào nhóm có ý định cũng không tính vào nhóm rời nhanh.
- CC3: Link nhà cung cấp hỏng hoặc trả 404: redirect vẫn ghi `BuyClicked` kèm cờ lỗi, báo món đó để sửa catalog.
- CC4: Mất mạng khi bấm mua (13-1): không ghi `BuyClicked` cho lượt chuyển hướng không xảy ra.

## E11-US5 — Đo lường không chạm vào ảnh phòng

 Là Young Aesthetes, tôi muốn chắc rằng ảnh căn phòng của tôi không bị gửi vào công cụ đo lường, để consent "Ảnh được gửi lên hệ thống để xử lý và xóa ngay sau đó." là thật.

**Status:** Draft

**Mốc:** M1 · **Priority:** P0 · **Effort:** S

**Màn:** Web M1: route `/capture` và `Uploader`, `RoomCanvas`. Spec M2: 03-2, 03-3, 03-4, nhóm 04, nhóm 05.

**Pre-condition:** Công cụ đo lường đã chọn ở E11-US2.

**Post-condition:** Không sự kiện nào chứa ảnh hoặc dữ liệu suy ra từ ảnh; màn chụp ảnh không tải SDK đo lường bên thứ ba.

#### Acceptance Criteria

- AC1: Không sự kiện nào chứa ảnh phòng, ảnh phối cảnh, thumbnail, pixel, depth map, mask, hash ảnh hoặc EXIF/GPS. Schema ở E11-US2 không có trường nào cho các dữ liệu này.
- AC2: Màn chụp ảnh và xem lại ảnh không tải SDK đo lường bên thứ ba (risk_register_v2 RISK 3, mitigation 3). Test E2E đọc log mạng của route `/capture` và thất bại nếu có request tới tên miền của công cụ đo lường.
- AC3: Không bật ghi lại phiên (session replay) hay ảnh chụp màn hình trong báo lỗi trên bất kỳ màn nào đang hiện ảnh phòng, vì chúng sẽ chụp lại chính ảnh đó.
- AC4: `LeadSubmitted` không chứa SĐT hay Zalo. Số liên hệ chỉ nằm ở nơi lưu lead (E10-US1).
- AC5: Chính sách quyền riêng tư liệt kê các sự kiện được ghi và nói rõ không có ảnh trong đó. Không có câu nào nói hay ngụ ý ảnh không rời khỏi máy.

#### Corner Cases

- CC1: Thư viện đo lường tự ghi URL có chứa object URL hay tên tệp ảnh: lọc bỏ trước khi gửi.
- CC2: Báo lỗi từ AI (13-2) tự đính kèm request body: cấu hình để không gửi body của `/api/depth`, `/api/segment`, `/api/inpaint`.
- CC3: Người dùng tắt đo lường trong trình duyệt hoặc dùng trình chặn: sản phẩm vẫn chạy đủ; báo cáo ghi chú phần lưu lượng bị thiếu.

## E11-US6 — Sự kiện cộng đồng, đơn hàng và link từ M2

 Là founder YourSpace, tôi muốn đo Thiết kế có sẵn, Nhà hàng xóm và link chia sẻ bằng cùng kiểu sự kiện, để biết cộng đồng có tạo ra đơn và lan truyền thật hay không (D10).

**Status:** Draft

**Mốc:** M2 (`OrderPlaced`) · M2+ (cộng đồng, link) · **Priority:** P2 · **Effort:** M

**Màn:** 15-1, 15-2, 15-3, 15-4, 15-5, 11-1, 11-2, 07-7.

**Pre-condition:** Schema M1 (E11-US2) đang chạy; tài khoản xác minh SĐT có ở M2.

**Post-condition:** Các chỉ số mốc M2+ ở PRD §6 tính được từ sự kiện.

#### Acceptance Criteria

- AC1: Bổ sung sự kiện PascalCase theo cùng quy ước của spec M1:

| Sự kiện | Khi nào phát | Trường đề xuất |
| --- | --- | --- |
| `DesignViewed` | Mở 15-2 | `designId`, `tab` (Phòng mẫu · Nhà hàng xóm) |
| `DesignLiked` | Thả tim | `designId` |
| `TemplateUsed` | Chọn một nhánh ở 15-3 | `designId`, `branch` (dùng cả không gian · lấy bộ món) |
| `DesignPublished` | Đăng thành công ở 15-4 | `designId`, `allowFullSpace` |
| `DesignReported` | Gửi báo cáo ở 15-5 | `designId`, `reason` |
| `ShareLinkCreated` | Tạo link ở 11-1 hoặc link chia sẻ | `linkType` (nhờ duyệt · chia sẻ) |
| `ShareLinkOpened` | Người nhận mở link (11-2) | `linkType`, `linkId` |
| `OrderPlaced` | Thanh toán thành công (07-7) | `orderId`, `totalVND`, `source` (không gian · Phòng mẫu · Nhà hàng xóm), `designId` nếu có |

- AC2: Chỉ số M2+ của PRD §6 tính từ các sự kiện trên: Tỷ lệ đăng (`DesignPublished` / không gian hoàn tất), Lượt dùng làm mẫu (`TemplateUsed` theo `designId`, tách theo `branch`), Đơn từ thiết kế có sẵn (`OrderPlaced` có `source` là Phòng mẫu hoặc Nhà hàng xóm / tổng `OrderPlaced`), Lan truyền qua link (`ShareLinkOpened` dẫn tới phiên mới / người gửi). Target: "Đặt sau khi có baseline M2" (PRD §6).
- AC3: Định nghĩa "không gian hoàn tất" cho mẫu số Tỷ lệ đăng chưa chốt; ghi định nghĩa trước khi báo con số đầu tiên.
- AC4: Sau khi người dùng xác minh SĐT, sự kiện gắn với ID tài khoản nội bộ, không gắn SĐT. Các quy tắc ảnh ở E11-US5 áp dụng cho mọi sự kiện mới, kể cả ảnh công khai trên Nhà hàng xóm.
- AC5: `DesignReported` dùng cho đo lường. Việc ẩn thiết kế khi đủ lượt báo cáo chạy ở E09, không phụ thuộc vào công cụ đo lường.

#### Corner Cases

- CC1: Tab Nhà hàng xóm chưa mở vì chưa đủ thiết kế (13-4): không tính chỉ số của tab này, ghi "chưa mở" thay vì 0.
- CC2: Một bản dùng lại được đăng tiếp: `DesignPublished` ghi kèm `designId` nguồn để đếm vòng lan truyền mà không đếm trùng.
- CC3: Mất mạng khi mở link (13-1): `ShareLinkOpened` chỉ ghi khi trang tải xong, không ghi lượt mở hỏng.
