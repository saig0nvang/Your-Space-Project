---
derives_from: [D3@7fbc47fb, D4@bb7f1ffe, D10@4b681365, D3b@4248a41d]
---
[Quay lại PRD YourSpace](../../PRD.md)

# E05 Dọn phòng: xóa đồ cũ

Epic này cho người dùng xóa đồ cũ có thật trong ảnh phòng để thấy căn phòng sau khi thay: chạm vào vật thể, xác nhận vùng chọn, để AI xóa và lấp nền trên cloud, rồi so sánh trước và sau. Xóa đồ cũ là **một công cụ trong Trình chỉnh sửa** (E04), dùng xen kẽ với thêm đồ, không phải một bước bắt buộc làm trước. Hệ thống không tự nhận diện và không tự xóa gì; mọi lượt xóa bắt đầu từ cú chạm của người dùng (D10, như IKEA Kreativ).

Đây là trải nghiệm "non-negotiable gốc" mà D3 giữ lại bằng cloud inpainting. Ở M1 tính năng mang **P1**: trong thang cắt scope khi M1 trễ (spec M1 §11), xóa đồ cũ đứng **thứ ba**, sau "AI tự căn → đặt thủ công" và "occlusion → vẽ đè". Cắt nó (lùi về chỉ thêm đồ) cần founder quyết, vì đây là phần non-negotiable gốc.

## Version Control

| Version | Date | Updated by | Note |
| --- | --- | --- | --- |
| 1.0 | 02 Oct 2026 | Phạm Việt Anh | Tạo epic từ PRD v2.0 và flow chốt 02/10/2026. |

## Scope

- **Trong phạm vi** — Công cụ Xóa trên thanh công cụ canvas; chạm để chọn vật thể bằng segmentation theo điểm (SAM); xác nhận vùng và chọn nhiều vật thể cho một lượt xóa; inpainting trên cloud qua `AIGateway` (LaMa, SDXL-inpaint cho vùng lớn); so sánh trước/sau; xử lý kết quả xấu (F3) bằng hoàn tác hoặc thử lại với vùng nhỏ hơn; hoàn tác (F6) cho lượt xóa; trạng thái mất mạng (13-1) và AI tạm ngưng (13-2).
- **Ngoài phạm vi** — Tự nhận diện hoặc gắn nhãn đồ vật (cần thêm model, chưa quyết — spec M2 §7); tự xóa khi người dùng chưa chạm; dựng lại chân tường hay cấu trúc phòng bị đồ che; relighting; chạy inpainting trên máy người dùng (tầm nhìn dài hạn của D3, không phải M1); "hiện lại pixel gốc" như một cách sửa kết quả xấu (đã bỏ khỏi F3).
- **Theo mốc** — M1: web, P1, đứng thứ ba trong thang cắt scope (spec M1 §11), cắt cần founder quyết. · M2: app native, cùng nhóm màn 04-1…04-4 nằm trong canvas 05. · M2+: không có thay đổi riêng.

## User Stories

## E5-US1 — Chạm để chọn đồ cũ cần xóa

 Là Young Aesthetes, tôi muốn chạm vào món đồ cũ trong ảnh để app khoanh đúng món đó, để tôi xóa nó mà không phải tô vẽ thủ công.

**Status:** Draft

**Mốc:** M1 · **Priority:** P1 · **Effort:** M

**Màn:** 04-1 (trong canvas 05-1, công cụ Xóa)

**Pre-condition:** Người dùng đang ở Trình chỉnh sửa, đã đồng ý consent gửi ảnh (E03), và chọn công cụ Xóa trên thanh công cụ.

**Post-condition:** Vật thể được chạm hiện vùng chọn (mask) phủ lên ảnh, chờ người dùng xác nhận (E5-US2).

#### Acceptance Criteria

- AC1: Công cụ Xóa nằm trên cùng thanh công cụ với Thêm, Chất liệu, Hoàn tác. Người dùng chuyển qua lại giữa thêm đồ và xóa đồ bất cứ lúc nào; không có thứ tự bắt buộc.
- AC2: Chạm một điểm trên vật thể → server chạy segmentation theo điểm chạm (SAM / MobileSAM) và trả vùng chọn phủ lên ảnh. Chỉ dùng prompt dạng điểm (bản ONNX bỏ qua prompt hộp, spec M2 §6).
- AC3: Hệ thống không tự đề xuất, tự nhận diện hay tự khoanh vật thể nào khi người dùng chưa chạm (D10).
- AC4: Ở chế độ Xóa, chạm vào món 3D đã đặt không xóa món đó; xóa món 3D thuộc E04.

#### Corner Cases

- CC1: Vùng chọn trả về sai vật thể hoặc lấn sang tường, sàn → người dùng chạm lại để bỏ chọn và chạm điểm khác; không có gì bị xóa.
- CC2: Người dùng không đồng ý gửi ảnh ở E03 → công cụ Xóa mờ, có chữ giải thích cần gửi ảnh lên hệ thống để xóa đồ.
- CC3: Mất mạng (13-1) khi chạm chọn → báo mất mạng, giữ nguyên ảnh; chạm lại khi có mạng.
- CC4: AI tạm ngưng (13-2) do rate limit hoặc vượt ngân sách → công cụ Xóa tạm tắt kèm lý do; thêm đồ vẫn dùng bình thường.

## E5-US2 — Xác nhận vùng và chọn nhiều đồ cho một lượt xóa

 Là Young Aesthetes, tôi muốn chọn hết các món cũ cần bỏ rồi xóa cùng lúc để ảnh sau khi xóa sạch và không để lại bóng mờ của đồ cũ.

**Status:** Draft

**Mốc:** M1 · **Priority:** P1 · **Effort:** M

**Màn:** 04-2

**Pre-condition:** Có ít nhất một vùng chọn từ E5-US1.

**Post-condition:** Người dùng bấm xóa một lần cho toàn bộ các vùng đã chọn; hệ thống bắt đầu lượt xóa (E5-US3).

#### Acceptance Criteria

- AC1: Màn 04-2 hiện mọi vùng đã chọn cùng lúc; người dùng chạm thêm vật thể khác để cộng vào lượt xóa, hoặc chạm vào vùng đã chọn để bỏ.
- AC2: Tất cả vùng đã chọn được gộp thành một mặt nạ và xóa trong **một** lượt inpainting. Xóa nhiều lượt liền nhau (ví dụ bàn trước, sofa sau) sinh "bóng ma" đồ cũ (spec M2 §6).
- AC3: Mặt nạ được nới rộng quanh viền và kéo thêm xuống dưới để xóa cả bóng đổ của đồ cũ. Thông số khởi điểm theo bằng chứng spec M2 §6 (nới 14 px, kéo thêm 45 px xuống dưới trên vùng cắt ~1080 px); chốt lại sau spike.
- AC4: Nút xóa nằm trong tầm ngón cái, vùng chạm ≥ 44px, ghi rõ số vật thể sẽ xóa.

#### Corner Cases

- CC1: Người dùng thoát công cụ Xóa khi còn vùng chọn chưa xóa → bỏ các vùng chọn, không gọi inpainting, không tính phí.
- CC2: Người dùng đã xóa một lượt rồi muốn xóa thêm đồ khác (dùng xen kẽ với thêm đồ) → nguy cơ "bóng ma" khi vùng mới nằm sát vùng cũ. Đề xuất: lượt mới lấp lại từ ảnh gốc với mặt nạ gộp mọi vùng đã xóa, vẫn là một lượt. *(Đề xuất kỹ thuật, cần kiểm trong spike.)*
- CC3: Màn trống (13-4) — không còn vùng nào được chọn → nút xóa mờ, có gợi ý "Chạm vào món đồ cũ để chọn".

## E5-US3 — Xóa đồ cũ bằng inpainting trên cloud

 Là Young Aesthetes, tôi muốn app xóa đồ cũ và lấp lại nền hợp lý để hình dung căn phòng khi đã dọn trước khi đặt đồ mới.

**Status:** Draft

**Mốc:** M1 · **Priority:** P1 · **Effort:** L

**Màn:** 04-3 · web M1: `/api/inpaint` (hoặc gộp `/api/remove`) qua `AIGateway`

**Pre-condition:** Người dùng đã xác nhận các vùng cần xóa (E5-US2) và đã đồng ý consent gửi ảnh.

**Post-condition:** Vùng đã xóa hiện bằng một lớp ảnh lấp nằm giữa ảnh gốc và các món 3D; lượt xóa vào lịch sử hoàn tác; ảnh trên server đã bị xóa.

#### Acceptance Criteria

- AC1: Inpainting chạy trên cloud qua API hosted (LaMa; SDXL-inpaint cho vùng lớn), sau `AIGateway`. Ngưỡng "vùng lớn" chưa chốt.
- AC2: Timeout ~30 giây, 1 lần thử lại với lỗi 5xx/429; chặn gửi trùng khi bấm hai lần để không tính phí hai lần (spec M1 §5).
- AC3: Kết quả cache theo hash ảnh + mặt nạ; xóa lại đúng vùng đó thì không gọi model lần hai. Ảnh gửi lên bị xóa ngay sau khi xử lý (D3).
- AC4: Thứ tự lớp: ảnh gốc → lớp lấp của vùng đã xóa → món 3D (spec M1 §4). Món đã đặt không bị đổi khi xóa đồ cũ.
- AC5: Trong lúc chờ, màn 04-3 cho biết app đang xóa và người dùng không bị khóa khỏi việc khác. Xong thì chip AI nói đã xóa gì và cách sửa (ví dụ "Đã xóa ghế cũ · hoàn tác nếu chưa ưng"). Ghi sự kiện `item_removed` và `inpaint_done`.

#### Corner Cases

- CC1: Quá timeout hoặc nhà cung cấp lỗi → không đổi gì trên ảnh, báo lỗi bằng icon + chữ, cho thử lại; không tự "hiện lại" hay giả kết quả.
- CC2: Vượt ngân sách AI trong ngày → tắt mềm công cụ Xóa (13-2), các tính năng đặt đồ vẫn chạy (spec M1 §5).
- CC3: Mất mạng (13-1) giữa lượt xóa → hủy lượt đó, giữ nguyên trạng thái trước khi xóa; thử lại khi có mạng.
- CC4: Depth của ảnh vẫn chứa đồ cũ đã xóa, nên món mới đặt vào vùng đó có thể bị "che" bởi vật không còn nhìn thấy → occlusion trong vùng đã xóa phải bỏ qua depth cũ. Cách làm chưa chốt (spec M1 §4).

## E5-US4 — So sánh trước và sau khi xóa

 Là Young Aesthetes, tôi muốn so nhanh ảnh trước và sau khi xóa để biết kết quả có đủ sạch để tin hay không.

**Status:** Draft

**Mốc:** M1 · **Priority:** P1 · **Effort:** S

**Màn:** 04-4

**Pre-condition:** Vừa xong ít nhất một lượt xóa (E5-US3).

**Post-condition:** Người dùng giữ kết quả và tiếp tục chỉnh, hoặc chọn sửa kết quả xấu (E5-US5).

#### Acceptance Criteria

- AC1: Màn 04-4 cho xem ảnh trước lượt xóa và sau lượt xóa trên cùng khung, chuyển qua lại bằng một thao tác.
- AC2: Xem "trước" chỉ để so sánh, không đổi trạng thái không gian; thả ra là về ảnh "sau".
- AC3: Màn có hai đường đi tiếp rõ ràng: giữ kết quả (về canvas) hoặc sửa kết quả xấu (hoàn tác, thử lại vùng nhỏ hơn).

#### Corner Cases

- CC1: Không gian có món 3D đè lên vùng đã xóa → so sánh chỉ thay lớp ảnh nền; món 3D vẫn hiện ở cả hai bản.
- CC2: Máy yếu (13-3) → so sánh dùng hai ảnh 2D tĩnh, không cần render 3D.

## E5-US5 — Sửa kết quả xóa xấu (F3)

 Là Young Aesthetes, tôi muốn sửa lại khi vùng xóa bị nhòe hay lỗi để căn phòng trong ảnh vẫn đủ thật cho tôi quyết định mua.

**Status:** Draft

**Mốc:** M1 · **Priority:** P1 · **Effort:** S

**Màn:** 04-4 · nút Hoàn tác trên canvas

**Pre-condition:** Một lượt xóa cho kết quả người dùng không ưng (nhòe, vệt, sót bóng).

**Post-condition:** Không gian về trạng thái trước lượt xóa, hoặc có kết quả mới từ một lượt xóa với vùng nhỏ hơn.

#### Acceptance Criteria

- AC1: Hai cách sửa: **hoàn tác** lượt xóa (về đúng trạng thái trước đó, đồ cũ hiện lại vì đó là ý của hoàn tác), hoặc **thử lại với vùng chọn nhỏ hơn** từ trạng thái trước lượt xóa.
- AC2: Hệ thống **không** "hiện lại pixel gốc" trong vùng đã xóa như một cách sửa: với đồ thật trong ảnh, làm vậy là đưa món đồ cũ quay lại (PRD Phụ lục A, F3 đã sửa).
- AC3: Hoàn tác lượt xóa không gọi lại AI và không tốn phí; thử lại vùng nhỏ hơn là một lượt inpainting mới, đi qua cache và ngân sách như E5-US3.
- AC4: Màn nói rõ giới hạn đã biết khi phù hợp: app không dựng lại được chân tường bị đồ che (thành vệt xám mờ) và vùng lấp lớn có thể hơi mềm (spec M2 §6).

#### Corner Cases

- CC1: Thử lại vài lần vẫn xấu → gợi ý giữ đồ cũ và đặt đồ mới đè lên, hoặc chụp lại góc khác; không ép người dùng phải xóa được.
- CC2: Người dùng đã đặt món 3D sau lượt xóa xấu rồi mới hoàn tác lượt xóa → hoàn tác theo đúng thứ tự lịch sử (E4-US7): món đặt sau bị hoàn tác trước.
- CC3: AI tạm ngưng (13-2) khi muốn thử lại → vẫn hoàn tác được; thử lại chờ AI mở lại.
