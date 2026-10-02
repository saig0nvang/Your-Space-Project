---
derives_from: [D3@7fbc47fb, D3b@4248a41d, D4@bb7f1ffe]
---
[Quay lại PRD YourSpace](../../PRD.md)

# E03 Chụp & hiểu phòng

Epic này đưa ảnh căn phòng thật của người dùng vào hệ thống và biến nó thành một cảnh mà đồ 3D đặt lên được đúng tỷ lệ: chọn nguồn ảnh, chụp có hướng dẫn, đồng ý gửi ảnh, quét phòng (depth), rồi xác nhận mặt sàn và chiều cao máy. Mục tiêu là đa số ảnh đi qua được mà không cần chỉnh tay, còn ảnh khó vẫn dùng được ở chế độ tự chỉnh, không bao giờ chặn người dùng. Epic này thuộc vòng lõi P0 của M1 (bước "tải ảnh").

Nguyên tắc nền (spec M1 §4): **tách occlusion khỏi scale.** Depth tương đối chỉ dùng cho thứ tự trước–sau (occlusion). Tỷ lệ đồ dựa vào mặt sàn và chiều cao máy, không tin depth mét tuyệt đối. Depth tính **một lần mỗi ảnh**, trên server, cache theo hash ảnh (D3b).

## Version Control

| Version | Date | Updated by | Note |
| --- | --- | --- | --- |
| 1.0 | 02 Oct 2026 | Phạm Việt Anh | Tạo epic từ PRD v2.0 và flow chốt 02/10/2026. |

## Scope

- **Trong phạm vi** — Chọn nguồn ảnh (chụp mới hoặc thư viện); camera có thước cân bằng từ cảm biến và gợi ý "thấy rõ sàn"; xem lại ảnh và consent trước lần gửi ảnh đầu; thu nhỏ ảnh trước khi gửi; quét phòng lấy depth qua `AIGateway.depth()`; xác nhận mặt sàn và chiều cao máy; kéo đường chân trời cho ảnh thư viện; xử lý ảnh khó phân tích (F4); trạng thái mất mạng (13-1); mang bộ món từ thiết kế có sẵn vào phòng vừa chụp.
- **Ngoài phạm vi** — Đặt, kéo, xoay đồ và chế độ thủ công (E04); xóa đồ cũ (E05); danh sách Phòng của tôi 03-0 và lưu không gian (E06); quét nhiều ảnh, panorama, LiDAR (D4: không clone đầy đủ Kreativ); chạy depth trên máy người dùng (M2-mobile thay adapter sau `AIGateway.depth()`, chưa phải M1).
- **Theo mốc** — M1: web, chụp bằng camera trình duyệt hoặc chọn ảnh có sẵn, depth trên server, stateless (ảnh sống trong bộ nhớ trình duyệt). Route `/capture` hiện đang thử đọc tư thế máy lúc chụp. · M2: app native, cùng luồng màn 03-1…03-7; adapter depth có thể chuyển sang chạy trên máy. · M2+: nhánh "Lấy bộ món" từ Thiết kế có sẵn (D10) đi qua epic này.

## User Stories

## E3-US1 — Chọn nguồn ảnh phòng

 Là Young Aesthetes, tôi muốn chọn giữa chụp ảnh mới và lấy ảnh có sẵn trong máy để bắt đầu thử đồ bằng cách nhanh nhất với mình.

**Status:** Draft

**Mốc:** M1 · **Priority:** P0 · **Effort:** S

**Màn:** 03-1 · web M1: bước đầu của `/capture`

**Pre-condition:** Người dùng bấm "Thử phòng" ở màn mở đầu, hoặc đi từ chi tiết phong cách sang bước chụp. Không cần đăng nhập.

**Post-condition:** Người dùng đang ở camera (E3-US2) hoặc đã chọn xong một ảnh từ thư viện và sang xem lại (E3-US3).

#### Acceptance Criteria

- AC1: Màn 03-1 có hai lựa chọn: chụp ảnh mới và chọn ảnh từ thư viện. Mỗi lựa chọn có vùng chạm ≥ 44px.
- AC2: Quyền camera chỉ được xin khi người dùng chọn chụp ảnh mới, không xin từ màn mở đầu.
- AC3: Ảnh chọn từ thư viện đi tiếp sang xem lại + consent (03-3), sau đó qua bước kéo đường chân trời (03-6) thay cho thước cân bằng.
- AC4: Hệ thống đọc EXIF (tiêu cự, cảm biến) của ảnh nếu có, trước khi thu nhỏ ảnh, để ước lượng góc nhìn camera (spec M1 §4). Không có EXIF thì dùng góc nhìn mặc định ~60° dọc / ~65° ngang.

#### Corner Cases

- CC1: Người dùng từ chối quyền camera → màn 03-1 giải thích ngắn vì sao cần camera và vẫn giữ lựa chọn "chọn ảnh từ thư viện".
- CC2: Tệp chọn từ thư viện không phải ảnh hoặc không đọc được → báo lỗi bằng icon + chữ, cho chọn lại; không gửi gì lên server.
- CC3: Màn trống (13-4) — thư viện không có ảnh nào → gợi ý chụp ảnh mới.

## E3-US2 — Chụp có thước cân bằng và gợi ý thấy rõ sàn

 Là Young Aesthetes, tôi muốn được hướng dẫn cầm máy thẳng và thấy rõ sàn khi chụp để ảnh đủ tốt cho đồ đặt vào đúng tỷ lệ ngay lần đầu.

**Status:** Draft

**Mốc:** M1 · **Priority:** P0 · **Effort:** M

**Màn:** 03-2 · web M1: `/capture` (đang thử đọc hướng máy qua `deviceorientation`)

**Pre-condition:** Người dùng đã chọn chụp ảnh mới và đã cấp quyền camera.

**Post-condition:** Có một ảnh vừa chụp kèm tư thế máy (độ nghiêng trước–sau và nghiêng ngang) lúc ngắm; người dùng sang màn xem lại (E3-US3).

#### Acceptance Criteria

- AC1: Khung ngắm hiện thước cân bằng lấy từ cảm biến của máy, cập nhật liên tục khi người dùng nghiêng máy.
- AC2: Khung ngắm hiện gợi ý "Thấy rõ sàn nhà"; khi chưa thấy sàn thì gợi ý lùi lại.
- AC3: Tư thế máy được lưu kèm ảnh là tư thế lúc ngắm, không phải lúc tay với nút chụp. Prototype `/capture` hiện lấy mẫu ~600 ms trước khi bấm.
- AC4: Màn camera luôn ở theme tối (ảnh + scrim, chữ trắng) theo `DESIGN.md`.

#### Corner Cases

- CC1: Trình duyệt hoặc máy không có cảm biến hướng, hoặc người dùng không cấp quyền cảm biến (iOS phải xin riêng) → vẫn cho chụp, ẩn thước cân bằng; ảnh đi qua bước kéo đường chân trời (03-6) như ảnh thư viện.
- CC2: Cảm biến trả số vô lý (prototype `/capture` coi góc ngửa/cúi ngoài khoảng −5° đến 55° là số đo hỏng) → bỏ số đo cảm biến, chuyển sang 03-6 để người dùng tự chỉnh.
- CC3: Camera không mở được (lỗi phần cứng, bị app khác chiếm) → báo lỗi bằng icon + chữ, đưa về 03-1 để chọn ảnh thư viện.

## E3-US3 — Xem lại ảnh và đồng ý gửi ảnh

 Là Young Aesthetes, tôi muốn xem lại ảnh và biết rõ ảnh của mình được xử lý ra sao trước khi gửi để quyết định có tiếp tục hay chụp lại.

**Status:** Draft

**Mốc:** M1 · **Priority:** P0 · **Effort:** S

**Màn:** 03-3 · web M1: bước xem lại trong `/capture`

**Pre-condition:** Có một ảnh vừa chụp (E3-US2) hoặc vừa chọn từ thư viện (E3-US1).

**Post-condition:** Người dùng đã đồng ý và ảnh (đã thu nhỏ) được gửi đi quét (E3-US4), hoặc người dùng chọn chụp lại.

#### Acceptance Criteria

- AC1: Trước lần gửi ảnh đầu tiên, màn hiện đúng câu consent: "Ảnh được gửi lên hệ thống để xử lý và xóa ngay sau đó." Chưa đồng ý thì không có byte ảnh nào rời khỏi máy.
- AC2: Không có câu chữ nào trên màn này hay ở bất kỳ đâu trong luồng nói hoặc ngụ ý ảnh không rời khỏi máy (D3).
- AC3: Ảnh được thu nhỏ trên máy về cạnh dài ~1600px trước khi gửi (spec M1 §9).
- AC4: Màn có nút "Chụp lại" quay về 03-2 (hoặc 03-1 nếu ảnh từ thư viện), không mất quyền camera đã cấp.

#### Corner Cases

- CC1: Người dùng không đồng ý gửi ảnh → không gửi ảnh, không gọi depth; vào trình chỉnh sửa ở chế độ tự chỉnh (05-6, E04) với ảnh nằm trên máy; công cụ xóa đồ cũ (E05) bị tắt và có dòng giải thích. *(Đề xuất, cần founder xác nhận.)*
- CC2: Mất mạng (13-1) lúc bấm tiếp tục → giữ ảnh trên máy, báo mất mạng, cho thử lại khi có mạng; không bắt chụp lại.
- CC3: Ảnh quá nhỏ (cạnh dài dưới mức thu nhỏ) → gửi nguyên kích thước, không phóng to.

## E3-US4 — Quét phòng lấy depth

 Là Young Aesthetes, tôi muốn app tự hiểu chiều sâu căn phòng từ một ảnh để đồ đặt vào sau đó trông đúng phối cảnh mà tôi không phải làm gì thêm.

**Status:** Draft

**Mốc:** M1 · **Priority:** P0 · **Effort:** L

**Màn:** 03-4 · web M1: gọi `/api/depth` qua `AIGateway`

**Pre-condition:** Người dùng đã đồng ý consent; ảnh đã thu nhỏ.

**Post-condition:** Client có depth tương đối của ảnh và gợi ý hiệu chỉnh (mặt sàn, chiều cao máy, độ tin cậy); ảnh trên server đã bị xóa; người dùng sang xác nhận mặt sàn (E3-US5), hoặc sang chế độ tự chỉnh nếu không lấy được depth.

#### Acceptance Criteria

- AC1: Depth (Depth Anything V2 small) chạy trên server, **một lần cho mỗi ảnh**, không chạy lại khi người dùng đặt hay kéo đồ (D3b).
- AC2: Kết quả depth được cache theo hash ảnh; gửi lại cùng ảnh thì không gọi model lần hai. Cache giữ gì và giữ bao lâu chưa chốt (PRD §8). Ảnh gốc bị xóa ngay sau khi xử lý (zero-retention).
- AC3: Thời gian xử lý depth ≤ 5 giây với ảnh điện thoại thông thường (mục tiêu từ PRD 1.x).
- AC4: Trong lúc chờ, màn 03-4 hiện vạch quét phòng (một lượt 1400ms theo `DESIGN.md`) và chữ cho biết app đang làm gì.
- AC5: Mọi lời gọi depth đi qua `AIGateway`: key chỉ nằm trên server, có rate limit theo IP, timeout ~20 giây và 1 lần thử lại với lỗi 5xx/429, chặn gửi trùng khi bấm hai lần (spec M1 §5).

#### Corner Cases

- CC1: Quá timeout, bị rate limit, vượt ngân sách ngày hoặc nhà cung cấp lỗi (F5) → không chặn; vào trình chỉnh sửa ở chế độ tự chỉnh, hiện trạng thái "AI tạm ngưng" (13-2). Chi tiết ở E04.
- CC2: Mất mạng (13-1) giữa chừng → ảnh vẫn ở trên máy; báo mất mạng và cho thử lại; thử lại dùng cùng hash nên không tính phí hai lần nếu lượt trước đã xong.
- CC3: Depth trả về nhưng độ tin cậy thấp → chuyển sang luồng ảnh khó phân tích (E3-US6), không đoán bừa.

## E3-US5 — Xác nhận mặt sàn và chiều cao máy

 Là Young Aesthetes, tôi muốn xác nhận app đã nhận đúng sàn nhà và chỉnh chiều cao máy nếu cần để đồ đặt vào có kích thước đúng với phòng tôi.

**Status:** Draft

**Mốc:** M1 · **Priority:** P0 · **Effort:** M

**Màn:** 03-5 (ảnh chụp trong app) · 03-6 (ảnh thư viện: kéo đường chân trời)

**Pre-condition:** Đã có depth và gợi ý hiệu chỉnh từ E3-US4.

**Post-condition:** Cảnh có mặt sàn và camera ảo đã xác nhận; người dùng sang chọn phong cách cho phòng (05-0, E04) hoặc vào thẳng trình chỉnh sửa.

#### Acceptance Criteria

- AC1: Màn 03-5 phủ lên ảnh vùng sàn app nhận được và chiều cao máy đang giả định (mặc định ~1,4 m, spec M1 §4). Người dùng xác nhận bằng một chạm, hoặc chỉnh chiều cao máy bằng thanh trượt.
- AC2: Mặt sàn được suy từ depth (dựng đám điểm, tìm mặt phẳng ngang) kết hợp tư thế máy lúc chụp nếu có. Tỷ lệ đồ chỉ dựa vào mặt sàn và chiều cao máy; depth chỉ dùng cho thứ tự trước–sau.
- AC3: Ảnh từ thư viện (hoặc ảnh không có số đo cảm biến) đi qua 03-6: người dùng kéo một đường ngang về đúng tầm mắt (đường chân trời) để app suy ra độ nghiêng máy, rồi mới xác nhận sàn.
- AC4: Bỏ qua bước xác nhận vẫn vào được trình chỉnh sửa với giá trị app đề xuất; chip AI trong trình chỉnh sửa nói rõ app đã tự căn và cách sửa.

#### Corner Cases

- CC1: Không tìm được mặt sàn (sàn bị che gần hết, ảnh chụp trần hoặc tường) → xử lý như ảnh khó phân tích (E3-US6).
- CC2: Người dùng kéo đường chân trời ra ngoài khung ảnh hoặc tới vị trí vô lý → giới hạn ở mép khung và nhắc kéo về tầm mắt.
- CC3: Kích thước đồ vẫn sai sau khi xác nhận → người dùng chỉnh tay trong trình chỉnh sửa (F1, E04); quay lại 03-5 được từ trình chỉnh sửa mà không phải chụp lại.

## E3-US6 — Ảnh khó phân tích vẫn dùng được (F4)

 Là Young Aesthetes, tôi muốn vẫn thử đồ được khi ảnh của mình chưa đủ tốt để không bị bỏ dở chỉ vì một tấm ảnh tối hay góc lạ.

**Status:** Draft

**Mốc:** M1 · **Priority:** P0 · **Effort:** S

**Màn:** 03-7

**Pre-condition:** Depth trả về độ tin cậy thấp, hoặc không tìm được mặt sàn.

**Post-condition:** Người dùng vào trình chỉnh sửa ở chế độ tự chỉnh, hoặc quay lại chụp ảnh khác.

#### Acceptance Criteria

- AC1: Không chặn người dùng. Màn 03-7 cho hai lựa chọn: tiếp tục với ảnh này ở chế độ tự chỉnh, hoặc "Chụp lại".
- AC2: Tiếp tục với ảnh này thì tắt tự căn tỷ lệ; trình chỉnh sửa mở ở chế độ thủ công (05-6): đồ vẫn bám sàn mặc định và có bóng đổ, người dùng tự kéo, chỉnh kích thước, xoay trục Y.
- AC3: Màn nói ngắn lý do và mẹo chụp lại: chụp thẳng, đủ sáng, thấy rõ sàn nhà.
- AC4: Ngưỡng coi là "khó phân tích" lấy từ PRD 1.x (độ tin cậy depth < 0,4 trên > 50% diện tích ảnh) làm điểm khởi đầu; chốt lại sau spike tuần 1 (PRD §8).

#### Corner Cases

- CC1: Người dùng chụp lại nhiều lần mà vẫn khó phân tích → không đẩy lại 03-7 lần nữa trong cùng phiên; mặc định vào chế độ tự chỉnh và giữ nút chụp lại trong trình chỉnh sửa.
- CC2: Spike tuần 1 không đạt ngưỡng (đề xuất ≥ 70% ảnh "tin được", chưa chốt) → M1 ship đặt thủ công trước, tự căn chỉ còn là trợ giúp bật được (D4); màn 03-7 khi đó không còn là ngoại lệ mà là luồng mặc định.

## E3-US7 — Mang bộ món về phòng vừa chụp

 Là Young Aesthetes, tôi muốn sau khi chọn "Lấy bộ món" từ một thiết kế có sẵn, chụp phòng mình xong là thấy ngay các món đó trong khay để tự đặt vào phòng mình.

**Status:** Draft

**Mốc:** M2+ · **Priority:** P2 · **Effort:** S

**Màn:** 15-3 (nhánh "Lấy bộ món") → 03-1…03-7 → 05-1

**Pre-condition:** Người dùng đang xem một thiết kế ở 15-2 và chọn "Lấy bộ món" ở sheet 15-3 (E02).

**Post-condition:** Trình chỉnh sửa mở trên ảnh phòng của người dùng, khay có sẵn tab "Bộ món" chứa các món của thiết kế đó, ghi nguồn thiết kế.

#### Acceptance Criteria

- AC1: Sau khi hiểu phòng xong (E3-US4, E3-US5 hoặc E3-US6), trình chỉnh sửa mở với tab "Bộ món" đang chọn trong khay; các tab phong cách vẫn còn.
- AC2: Không món nào tự được đặt vào ảnh; người dùng tự chạm sàn để đặt từng món (AI chỉ gợi ý).
- AC3: Tab "Bộ món" ghi nguồn thiết kế (tên thiết kế, người đăng hoặc Phòng mẫu). Thiết kế gốc không bị đổi.

#### Corner Cases

- CC1: Người dùng quay lại giữa luồng chụp (chụp lại, đổi ảnh) → bộ món đã lấy không mất trong phiên đó. Giữ bộ món qua các phiên hay không chưa chốt (E06).
- CC2: Ảnh khó phân tích (F4) → vẫn mang bộ món vào trình chỉnh sửa ở chế độ tự chỉnh.
- CC3: Mất mạng (13-1) khi tải danh sách món của thiết kế → giữ người dùng ở bước chụp, báo mất mạng, tải lại khi có mạng.
