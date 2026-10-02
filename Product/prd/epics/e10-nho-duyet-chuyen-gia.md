---
derives_from: [D7@96011236, D10@4b681365]
---
[Quay lại PRD YourSpace](../../PRD.md)

# E10 Nhờ người duyệt & chuyên gia

Mua nội thất hiếm khi là quyết định của một người. Epic này gom hai cách để người dùng hỏi ý kiến trước khi chốt: hỏi người thân qua một link xem phối cảnh, và hỏi chuyên gia thiết kế theo đúng phong cách đang dùng. Ở M1, chỉ có nút "Tôi muốn tư vấn" để thu SĐT/Zalo, vừa phục vụ người dùng vừa là tín hiệu ý định mua mạnh nhất của RAT (D7). Từ M2 trở đi, người dùng gửi link nhờ duyệt mở trên web không cần app, nhận phản hồi về đúng không gian, tìm chuyên gia, đặt lịch và chat trong app.

## Version Control

| Version | Date | Updated by | Note |
| --- | --- | --- | --- |
| 1.0 | 02 Oct 2026 | Phạm Việt Anh | Tạo epic từ PRD v2.0 và flow chốt 02/10/2026. |

## Scope

- **Trong phạm vi** — Nút "Tôi muốn tư vấn" và form thu SĐT/Zalo có consent liên hệ lại (M1); tạo link nhờ duyệt có consent riêng, trang web cho người nhận, phản hồi quay về không gian (nhóm 11); danh sách chuyên gia theo phong cách, hồ sơ, đặt lịch có xác minh SĐT bằng OTP, chat (nhóm 09).
- **Ngoài phạm vi** — Chia sẻ công khai lên Nhà hàng xóm (E09); xuất ảnh hoặc link lưu không gian (E06); thanh toán phí tư vấn; công cụ làm việc phía chuyên gia (lịch, CRM); đo lường (E11).
- **Theo mốc** — M1: thu lead tư vấn, chưa có chat hay đặt lịch (D7). M2 · M2+: nhóm màn 09 và 11 trong spec M2; PRD §5.1 và D7 xếp phần này vào M2+, thời điểm cụ thể trong M2+ chưa chốt.

> **Mốc của nhóm 11 (nhờ duyệt):** PRD §5.1 xếp chung vào "M2+". Spec M2 §3 không gắn M1 cho nhóm 11, nên không đưa link nhờ duyệt vào M1. Ở M1, người dùng vẫn tự gửi ảnh xuất ra từ E06.

## User Stories

## E10-US1 — Để lại SĐT/Zalo để được tư vấn

 Là Young Aesthetes, tôi muốn để lại SĐT hoặc Zalo ngay cạnh dự toán để có người tư vấn cho căn phòng đang thử mà không phải tạo tài khoản.

**Status:** Draft

**Mốc:** M1 · **Priority:** P1 · **Effort:** M

**Màn:** Web M1: `EstimatePanel` + `LeadCapture`, API `/api/lead` (spec M1 §6–§8). Spec M2: 06-1 (nút để lại SĐT).

**Pre-condition:** Người dùng đã chọn phong cách và có ít nhất một món trong dự toán.

**Post-condition:** Lead được ghi nhận kèm consent liên hệ lại; sự kiện `LeadSubmitted` được phát (E11).

#### Acceptance Criteria

- AC1: Nút "Tôi muốn tư vấn" nằm cạnh nút mua trong dự toán, ở kiểu nút phụ. Màn không có hai nút terracotta đặc (DESIGN.md).
- AC2: Form có một ô nhập SĐT hoặc Zalo, một ô tick "Đồng ý để YourSpace liên hệ lại qua số này để tư vấn" **không được tick sẵn**. Nút gửi chỉ bật khi số hợp lệ theo định dạng SĐT Việt Nam và ô consent đã tick.
- AC3: Lead gửi qua `/api/lead` gồm: SĐT/Zalo, thời điểm consent, phong cách đang chọn, danh sách món và tổng dự toán. Lead **không kèm ảnh phòng, ảnh phối cảnh hay hash ảnh**, vì ảnh chỉ được giữ để xử lý rồi xóa ngay.
- AC4: Đích lưu lead chưa chốt (spec M1 §3 dự kiến Supabase; xem PRD §8 "Đích của lead và link affiliate ở M1"). Story chưa sẵn sàng build cho tới khi đích lưu và người nhận lead được chốt.
- AC5: Gửi thành công hiện "Đã nhận số của bạn." Câu xác nhận không hứa thời hạn gọi lại cho tới khi founder chốt cam kết đó (MVP_Research §12, S5 và action #11 đề xuất 24 giờ, chưa chốt).
- AC6: Mở form không chặn nút mua. Người dùng đóng form thì quay lại đúng dự toán, các món đã đặt giữ nguyên.

#### Corner Cases

- CC1: Mất mạng khi gửi (13-1): giữ nguyên số đã nhập và trạng thái consent, hiện "Chưa gửi được. Thử lại khi có mạng." Không báo thành công khi server chưa xác nhận.
- CC2: Bấm gửi hai lần hoặc gửi lại cùng số trong cùng phiên: server dedupe, chỉ ghi một lead, chỉ phát một `LeadSubmitted`.
- CC3: Người dùng muốn rút consent hoặc xóa số đã để lại: chính sách quyền riêng tư ghi kênh yêu cầu xóa (NĐ13). Lead bị xóa thì không liên hệ lại.
- CC4: Rate limit theo IP (spec M1 §5) chặn spam form: hiện thông báo thử lại sau, không mất số đã nhập.

## E10-US2 — Tạo link nhờ duyệt có consent riêng

 Là Young Aesthetes, tôi muốn gửi một link xem phối cảnh cho người thân để hỏi ý kiến trước khi mua, và biết rõ ảnh nào được lưu trên máy chủ.

**Status:** Draft

**Mốc:** M2+ · **Priority:** P1 · **Effort:** M

**Màn:** 11-1 (tạo link có consent), mở từ Trình chỉnh sửa (05-7 lưu & chia sẻ).

**Pre-condition:** Người dùng đang mở một không gian có ít nhất một món.

**Post-condition:** Có một link nhờ duyệt trỏ tới ảnh phối cảnh và danh sách món của không gian; người dùng chia sẻ link qua ứng dụng nhắn tin của máy.

#### Acceptance Criteria

- AC1: Trước khi tạo link lần đầu, sheet consent riêng nói rõ: ảnh phối cảnh sẽ được lưu trên máy chủ để người nhận xem, ai có link đều xem được, và link hết hạn sau một thời hạn. Consent này tách khỏi consent xử lý ảnh ở E03 (spec M2 §4).
- AC2: Hạn link hiện rõ trên sheet. Mock spec M2 đặt hết hạn sau 7 ngày; thời hạn chính thức chờ DPIA cho luồng này (spec M2 §7 mục 5).
- AC3: Link chỉ chứa ảnh phối cảnh đã ghép, danh sách món, giá và tổng dự toán. Không chứa ảnh gốc trước khi dọn phòng.
- AC4: Tạo link không cần xác minh SĐT, vì OTP chỉ ở ba chỗ: thanh toán, đặt lịch chuyên gia, đăng thiết kế (D10).
- AC5: Người dùng thu hồi được link bất cứ lúc nào. Thu hồi xong thì ảnh phối cảnh của link bị xóa khỏi máy chủ và link mở ra trang "Link không còn hiệu lực".
- AC6: Link hiển thị đúng phiên bản không gian lúc tạo. Sửa không gian sau đó không tự cập nhật link; sheet gợi ý "Tạo link mới để gửi bản đã sửa".

#### Corner Cases

- CC1: Từ chối consent: không tạo link, không gửi ảnh nào lên. Gợi ý xuất ảnh về máy để tự gửi (E06).
- CC2: Mất mạng (13-1): không tạo được link, hiện trạng thái mất mạng; không giả lập link chưa có trên máy chủ.
- CC3: Không gian chỉ có ảnh phòng, chưa có món nào (13-4): nút tạo link tắt, kèm câu "Thêm ít nhất một món để nhờ duyệt."
- CC4: Không gian dùng món đã ngừng bán: link vẫn hiện món đó kèm nhãn "Ngừng bán", không hiện giá cũ như giá còn hiệu lực.

## E10-US3 — Người nhận xem và góp ý trên web, không cần app

 Là Người được nhờ duyệt, tôi muốn mở link trên trình duyệt điện thoại, xem phối cảnh và góp ý từng món mà không phải cài app hay tạo tài khoản.

**Status:** Draft

**Mốc:** M2+ · **Priority:** P1 · **Effort:** M

**Màn:** 11-2 (trang web cho người nhận).

**Pre-condition:** Người nhận có một link nhờ duyệt còn hiệu lực.

**Post-condition:** Góp ý của người nhận được gửi về không gian gốc; sự kiện `ShareLinkOpened` được ghi (E11).

#### Acceptance Criteria

- AC1: Link mở trong trình duyệt di động, không yêu cầu cài app, đăng nhập hay nhập SĐT.
- AC2: Trang hiện ảnh phối cảnh, danh sách món kèm giá theo định dạng `12.400.000 ₫`, kích thước theo định dạng `101 × 119 × 117 cm` và tổng dự toán nhóm theo nhà cung cấp.
- AC3: Người nhận chọn thích hoặc không thích từng món, viết một góp ý chung, nhập tên hiển thị tùy chọn. Nút chính duy nhất của trang là "Gửi góp ý".
- AC4: Trang có lối phụ "Thử trong phòng của bạn" dẫn tới tải app hoặc web, không cạnh tranh với nút chính.
- AC5: Vùng chạm ≥ 44px, tương phản chữ ≥ 4.5:1 (spec M2 §4).

#### Corner Cases

- CC1: Link hết hạn hoặc đã thu hồi: hiện "Link đã hết hạn. Nhờ người gửi tạo link mới." Không hiện ảnh cũ.
- CC2: Mất mạng khi gửi góp ý (13-1): giữ nội dung đã nhập, cho gửi lại; không báo đã gửi khi chưa gửi.
- CC3: Máy yếu hoặc trình duyệt không có WebGL (13-3): trang chỉ dùng ảnh tĩnh nên vẫn xem được đầy đủ.
- CC4: Nhiều người cùng mở một link: mỗi góp ý được ghi riêng, kèm tên hiển thị nếu có.

## E10-US4 — Nhận phản hồi về đúng không gian

 Là Young Aesthetes, tôi muốn thấy góp ý của người thân ngay trong không gian tôi đã gửi để sửa tiếp hoặc chốt mua.

**Status:** Draft

**Mốc:** M2+ · **Priority:** P1 · **Effort:** S

**Màn:** 11-3 (phản hồi trong app), 10-2 (thông báo), 03-0 (Phòng của tôi).

**Pre-condition:** Người dùng đã tạo ít nhất một link nhờ duyệt và có người gửi góp ý.

**Post-condition:** Người dùng mở đúng không gian gốc với góp ý gắn theo từng món.

#### Acceptance Criteria

- AC1: Mỗi góp ý mới tạo một thông báo. Chạm vào thông báo mở đúng không gian đã gửi trong Phòng của tôi, không mở danh sách chung.
- AC2: Lượt thích hoặc không thích hiện cạnh từng món trong không gian. Góp ý chung hiện ở 11-3 kèm tên hiển thị và thời điểm.
- AC3: Góp ý không tự thay đổi không gian. Mọi sửa đổi sau đó do người dùng chủ động làm trong Trình chỉnh sửa.
- AC4: Từ 11-3 có đường đi thẳng tới sheet mua của không gian đó (E07).

#### Corner Cases

- CC1: Người dùng đã xóa không gian khỏi máy: góp ý vẫn đọc được ở 11-3 kèm ảnh phối cảnh của link, có nhãn "Không gian này không còn trên máy".
- CC2: Người dùng đổi máy mà chưa đồng bộ tài khoản: chưa chốt cách nhận lại góp ý (phụ thuộc đồng bộ ở E06 và consent riêng của spec M2 §1).
- CC3: Chưa có góp ý nào (13-4): 11-3 hiện "Chưa có ai góp ý." kèm thời điểm link hết hạn.

## E10-US5 — Tìm chuyên gia theo phong cách và xem hồ sơ

 Là Young Aesthetes, tôi muốn xem các chuyên gia làm đúng phong cách tôi đang dùng để chọn người hiểu gu của mình.

**Status:** Draft

**Mốc:** M2+ · **Priority:** P2 · **Effort:** M

**Màn:** 09-1 (danh sách), 09-2 (hồ sơ).

**Pre-condition:** Người dùng mở mục chuyên gia từ Trình chỉnh sửa hoặc từ chi tiết phong cách.

**Post-condition:** Người dùng chọn được một chuyên gia để đặt lịch hoặc quay lại không gian.

#### Acceptance Criteria

- AC1: Mở từ một không gian thì danh sách lọc sẵn theo phong cách của không gian đó; người dùng bỏ lọc được.
- AC2: Hồ sơ hiện phong cách sở trường, ảnh dự án đã làm, khu vực nhận việc và lịch còn trống. Phí tư vấn và cách thu phí chưa chốt; mock spec M2 dùng dữ liệu mẫu (spec M2 §7 mục 3).
- AC3: Không gắn danh xưng chuyên môn chưa xác minh (ví dụ "kiến trúc sư") cho hồ sơ, cùng nguyên tắc tên tab của D10.
- AC4: Hồ sơ có một nút chính duy nhất: "Đặt lịch".

#### Corner Cases

- CC1: Chưa có chuyên gia cho phong cách đang lọc (13-4): hiện trạng thái trống kèm lựa chọn bỏ lọc hoặc để lại SĐT tư vấn (E10-US1).
- CC2: Mất mạng (13-1): hiện danh sách đã tải gần nhất kèm nhãn mất mạng; tắt nút đặt lịch.
- CC3: Chuyên gia ngừng nhận khách khi người dùng đang xem hồ sơ: nút đặt lịch tắt, hiện "Chuyên gia tạm ngừng nhận lịch."

## E10-US6 — Đặt lịch tư vấn có xác minh SĐT

 Là Young Aesthetes, tôi muốn đặt một buổi tư vấn với chuyên gia và gửi kèm không gian đang làm để buổi tư vấn đi thẳng vào căn phòng của tôi.

**Status:** Draft

**Mốc:** M2+ · **Priority:** P2 · **Effort:** M

**Màn:** 09-3 (đặt lịch), 07-1 và 07-2 (SĐT, OTP).

**Pre-condition:** Người dùng đã chọn một chuyên gia ở 09-2.

**Post-condition:** Lịch hẹn được tạo, gắn với SĐT đã xác minh và không gian người dùng chọn gửi kèm.

#### Acceptance Criteria

- AC1: Đặt lịch yêu cầu xác minh SĐT bằng OTP; đây là một trong ba điểm có OTP (D10). Người dùng đã xác minh trước đó trên máy này thì không phải nhập lại.
- AC2: Người dùng chọn khung giờ còn trống và chọn có gửi kèm không gian hay không. Gửi kèm thì hiện consent riêng như E10-US2, vì ảnh phối cảnh sẽ lưu trên máy chủ để chuyên gia xem.
- AC3: Xác nhận đặt lịch hiện tên chuyên gia, thời gian và hình thức tư vấn; lịch hẹn xuất hiện trong Tôi (12-1).
- AC4: Người dùng hủy hoặc đổi lịch được. Chính sách hủy chưa chốt.

#### Corner Cases

- CC1: Khung giờ vừa bị người khác đặt khi đang xác nhận: báo khung giờ không còn, giữ nguyên lựa chọn khác, gợi ý khung gần nhất.
- CC2: OTP sai hoặc hết hạn: cho gửi lại mã; số lần thử và thời hạn mã dùng chung quy tắc với thanh toán (E07).
- CC3: Mất mạng giữa lúc xác nhận (13-1): không tạo lịch trùng khi người dùng thử lại; trạng thái cuối cùng lấy theo server.

## E10-US7 — Chat với chuyên gia trong app

 Là Young Aesthetes, tôi muốn nhắn tin với chuyên gia về không gian của mình để hỏi nhanh mà không phải gọi điện.

**Status:** Draft

**Mốc:** M2+ · **Priority:** P2 · **Effort:** L

**Màn:** 09-4 (chat).

**Pre-condition:** Người dùng có lịch hẹn với chuyên gia ở E10-US6.

**Post-condition:** Cuộc trò chuyện gắn với lịch hẹn và không gian đã gửi kèm.

#### Acceptance Criteria

- AC1: Cuộc chat hiện thẻ không gian đã gửi kèm ở đầu; chạm vào thẻ mở đúng không gian trong Trình chỉnh sửa.
- AC2: Chuyên gia gửi được món gợi ý dưới dạng thẻ món. Món gợi ý chỉ vào khay khi người dùng bấm thêm; không tự đặt vào ảnh.
- AC3: Gửi thêm ảnh phối cảnh trong chat chỉ sau consent riêng như E10-US2.
- AC4: Thời gian phản hồi cam kết của chuyên gia chưa chốt; giao diện không hiện con số cam kết cho tới khi chốt.

#### Corner Cases

- CC1: Mất mạng (13-1): tin nhắn chưa gửi mang nhãn "Chưa gửi", tự gửi lại khi có mạng, không gửi trùng.
- CC2: Chuyên gia chưa trả lời (13-4): khung chat hiện thời điểm lịch hẹn và lối để lại SĐT tư vấn.
- CC3: Món chuyên gia gợi ý đã ngừng bán: thẻ món mang nhãn "Ngừng bán", nút thêm vào khay tắt.
