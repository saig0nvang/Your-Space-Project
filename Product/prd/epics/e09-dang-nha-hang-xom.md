---
derives_from: [D3@7fbc47fb, D10@4b681365, D3b@4248a41d]
---
[Quay lại PRD YourSpace](../../PRD.md)

# E09 Đăng lên Nhà hàng xóm & kiểm duyệt

Epic này mô tả việc người dùng đăng một không gian đã bày lên tab Nhà hàng xóm và cách YourSpace kiểm duyệt nội dung đó theo D10. Đăng là việc không bắt buộc và là bước duy nhất trong luồng chỉnh sửa cần đăng nhập (xác minh SĐT bằng OTP). Ảnh phòng được công khai nên có consent riêng, khác với consent xử lý ảnh của D3; người đăng xem trước đúng ảnh sẽ công khai, che được chỗ riêng tư và tắt riêng được nhánh "dùng cả không gian". Kiểm duyệt theo kiểu hậu kiểm: thiết kế hiện ngay, bị ẩn khi đủ lượt báo cáo, và được gỡ trong 24 giờ khi cơ quan quản lý yêu cầu (Nghị định 147/2024). Mục tiêu là vòng lan truyền chạy được mà người đăng vẫn kiểm soát được ảnh nhà mình.

## Version Control

| Version | Date | Updated by | Note |
| --- | --- | --- | --- |
| 1.0 | 02 Oct 2026 | Phạm Việt Anh | Tạo epic từ PRD v2.0 và flow chốt 02/10/2026. |

## Scope

- **Trong phạm vi** — Nút đăng trong Trình chỉnh sửa; xác minh SĐT bằng OTP khi đăng; màn đăng 15-4 (xem trước ảnh công khai, consent công khai, cắt hoặc che chỗ riêng tư, công tắc cho phép dùng cả không gian); hiện ngay sau khi đăng; ghi nguồn chuỗi bản dùng lại; báo cáo 15-5; ẩn theo ngưỡng, xem xét, khôi phục hoặc gỡ; gỡ theo yêu cầu cơ quan quản lý; người đăng gỡ thiết kế của mình.
- **Ngoài phạm vi** — Duyệt, thả tim, mua và dùng làm mẫu thiết kế (E02); hoa hồng hay bất kỳ khoản tiền nào cho người đăng (D10 không cho phép); bình luận, theo dõi người đăng; công cụ nội bộ cho người xem xét (chưa viết story ở bản này).
- **Theo mốc** — M1: không có (D5, D10). · M2: không có. · M2+: toàn bộ epic. Trước khi mở tab Nhà hàng xóm cần luật sư xác nhận YourSpace có phải xin giấy phép mạng xã hội không (PRD §8).

## User Stories

## E9-US1 — Bắt đầu đăng và xác minh SĐT

 Là Người đăng thiết kế, tôi muốn đăng không gian vừa bày lên Nhà hàng xóm chỉ bằng việc xác minh số điện thoại để khoe nó mà không phải tạo tài khoản.

**Status:** Draft

**Mốc:** M2+ · **Priority:** P2 · **Effort:** M

**Màn:** Trình chỉnh sửa (05-1, khu lưu & chia sẻ 05-7) → SĐT (07-1) → OTP (07-2) → Đăng thiết kế (15-4).

**Pre-condition:** Người dùng có một không gian trong Trình chỉnh sửa với ít nhất một món đã đặt.

**Post-condition:** Người dùng đã xác minh SĐT và đang ở 15-4; không gian không bị thay đổi.

#### Acceptance Criteria

- AC1: Lối "Đăng lên Nhà hàng xóm" là lựa chọn phụ trong khu lưu & chia sẻ; không phải nút chính của Trình chỉnh sửa và không chặn lưu, nhờ duyệt hay mua.
- AC2: Người dùng chưa xác minh SĐT được yêu cầu nhập SĐT và mã OTP ngay trong luồng; không có form tạo tài khoản, mật khẩu hay hồ sơ bắt buộc.
- AC3: Người dùng đã xác minh SĐT trước đó (ví dụ khi thanh toán ở E07) đi thẳng tới 15-4, không phải nhập OTP lại.
- AC4: Đăng là bước duy nhất trong luồng chỉnh sửa cần xác minh SĐT; thêm đồ, xóa đồ cũ, lưu và mở lại không gian vẫn không cần (D10).
- AC5: Mọi thiết kế công khai đều gắn với một SĐT đã xác minh, đáp ứng yêu cầu xác thực người dùng mạng xã hội bằng SĐT của Nghị định 147/2024.

#### Corner Cases

- CC1: Mã OTP sai hoặc hết hạn: báo lỗi bằng chữ, cho nhập lại hoặc gửi mã mới; không gian vẫn nguyên.
- CC2: Người dùng thoát giữa chừng: quay về Trình chỉnh sửa đúng trạng thái trước khi bấm đăng, không có gì được công khai.
- CC3: Mất mạng (13-1): không gửi được mã OTP; báo mất mạng, có nút "Thử lại"; không gian vẫn lưu được trên máy.

## E9-US2 — Xem trước ảnh công khai và đồng ý công khai

 Là Người đăng thiết kế, tôi muốn thấy đúng ảnh sẽ công khai, che được chỗ riêng tư và chọn có cho người khác dùng cả không gian của mình hay không để chỉ chia sẻ những gì tôi muốn.

**Status:** Draft

**Mốc:** M2+ · **Priority:** P2 · **Effort:** L

**Màn:** Đăng thiết kế (15-4).

**Pre-condition:** Người dùng đã xác minh SĐT (E9-US1).

**Post-condition:** Thiết kế được đăng với ảnh đã cắt hoặc che theo ý người đăng và lựa chọn "cho phép dùng cả không gian" đã ghi nhận; hoặc người dùng hủy và không có gì được công khai.

#### Acceptance Criteria

- AC1: 15-4 hiện xem trước đúng ảnh và thông tin sẽ công khai: ảnh không gian, tên hiển thị của người đăng, loại căn hộ, diện tích, danh sách món và tổng giá.
- AC2: Người đăng cắt ảnh hoặc che vùng riêng tư ngay trên 15-4; xem trước cập nhật theo; mọi nơi hiển thị công khai (thẻ, 15-2, bản sao "dùng cả không gian" ở E02) chỉ dùng ảnh đã cắt hoặc che.
- AC3: Có consent riêng, không đánh dấu sẵn, nói rõ ảnh phòng sẽ được lưu trên hệ thống, hiện cho người khác và có thể được dùng làm mẫu; nút "Đăng" chỉ bật khi người đăng đã đồng ý.
- AC4: Consent công khai tách khỏi câu consent xử lý ảnh "Ảnh được gửi lên hệ thống để xử lý và xóa ngay sau đó." (D3); 15-4 không dùng lại câu đó và không có câu nào nói hay ngụ ý ảnh không rời khỏi máy.
- AC5: Có công tắc "Cho phép dùng cả không gian" kèm giải thích: chỉ lựa chọn này sao chép ảnh phòng của bạn; "Lấy bộ món" không dùng ảnh. Trạng thái mặc định của công tắc: chưa chốt.
- AC6: Người đăng đổi được công tắc này sau khi đăng (E9-US6); thay đổi áp dụng cho các lượt dùng làm mẫu từ lúc đó.

#### Corner Cases

- CC1: Người đăng che gần hết ảnh: vẫn cho đăng, xem trước cho thấy đúng kết quả; không tự cắt hay tự che thay người đăng (AI chỉ gợi ý).
- CC2: Không gian chứa món đã hết hàng: xem trước hiện nhãn "Hết hàng" như người xem sẽ thấy ở E02.
- CC3: Mất mạng (13-1) khi bấm "Đăng": không công khai bản dở; giữ nguyên lựa chọn cắt, che, công tắc và consent để thử lại.
- CC4: Máy yếu (13-3): xem trước hiện ở 2D; công cụ cắt và che vẫn dùng được.

## E9-US3 — Hiện ngay khi đăng và ghi nguồn bản dùng lại

 Là Người đăng thiết kế, tôi muốn thiết kế của mình hiện ngay sau khi đăng và luôn được ghi nguồn khi người khác dùng lại để công sức của tôi được ghi nhận dù không có hoa hồng.

**Status:** Draft

**Mốc:** M2+ · **Priority:** P2 · **Effort:** M

**Màn:** Đăng thiết kế (15-4) → Thiết kế có sẵn (15-1, tab Nhà hàng xóm) → Chi tiết thiết kế (15-2).

**Pre-condition:** Người đăng đã đồng ý consent và bấm "Đăng" ở 15-4.

**Post-condition:** Thiết kế công khai, có trang chi tiết riêng và mang chuỗi ghi nguồn nếu là bản dùng lại.

#### Acceptance Criteria

- AC1: Thiết kế hiện ngay sau khi đăng, không qua bước duyệt trước (kiểm duyệt hậu kiểm, D10).
- AC2: Nếu không gian được tạo từ "Dùng cả không gian" hoặc "Lấy bộ món" (E02), trang 15-2 và thẻ của nó hiện dòng ghi nguồn bản gốc; người đăng không xóa được dòng này.
- AC3: Chuỗi nhiều đời (bản gốc → bản dùng lại → bản dùng lại tiếp) được giữ đầy đủ; từ 15-2 người xem mở được bản gốc và bản liền trước.
- AC4: Bản gốc không bị thay đổi khi một bản dùng lại được đăng; lượt dùng làm mẫu của bản gốc được tính theo E02.
- AC5: Không có màn, nhãn hay số liệu nào nói người đăng được chia hoa hồng hoặc nhận tiền từ đơn mua theo thiết kế của họ.

#### Corner Cases

- CC1: Bản gốc trong chuỗi đã bị gỡ: dòng ghi nguồn vẫn giữ tên tác giả gốc nhưng ghi "Thiết kế gốc không còn hiển thị", không mở được.
- CC2: Tab Nhà hàng xóm chưa mở (chưa đủ thiết kế, E02): thiết kế vẫn được đăng; cách người khác thấy nó trước khi tab mở chưa chốt.
- CC3: Mất mạng (13-1) ngay sau khi bấm "Đăng": người đăng thấy trạng thái đang gửi; chỉ báo "Đã đăng" khi hệ thống xác nhận, không đăng trùng hai lần.

## E9-US4 — Báo cáo thiết kế

 Là Young Aesthetes đang xem Nhà hàng xóm, tôi muốn báo cáo một thiết kế có nội dung xấu kèm lý do để nó được xem xét và gỡ nếu vi phạm.

**Status:** Draft

**Mốc:** M2+ · **Priority:** P2 · **Effort:** M

**Màn:** Chi tiết thiết kế (15-2) → Báo cáo thiết kế (15-5).

**Pre-condition:** Người dùng đang xem một thiết kế ở tab Nhà hàng xóm không phải của mình.

**Post-condition:** Báo cáo được ghi nhận vào hàng xem xét; nếu đủ ngưỡng thì thiết kế bị ẩn (E9-US5).

#### Acceptance Criteria

- AC1: Lối "Báo cáo" ở 15-2 mở 15-5; người báo cáo phải chọn một lý do trước khi gửi (danh sách lý do: chưa chốt).
- AC2: Ai cũng gửi được báo cáo mà không cần đăng nhập; mọi báo cáo đều vào hàng xem xét.
- AC3: Chỉ báo cáo từ người đã xác minh SĐT mới được tính vào ngưỡng ẩn, và mỗi SĐT chỉ tính một lần cho một thiết kế; báo cáo từ người chưa xác minh vào hàng xem xét nhưng không tự làm ẩn thiết kế.
- AC4: Sau khi gửi, người báo cáo thấy xác nhận đã nhận báo cáo; thiết kế vẫn hiện với họ cho tới khi bị ẩn theo E9-US5.
- AC5: Thiết kế ở tab Phòng mẫu không có lối báo cáo của E09 (nội dung do YourSpace dựng).

#### Corner Cases

- CC1: Cùng một người đã xác minh báo cáo một thiết kế nhiều lần: chỉ tính một lượt vào ngưỡng.
- CC2: Người đăng tự báo cáo thiết kế của mình: không có lối báo cáo; họ dùng lối gỡ ở E9-US6.
- CC3: Mất mạng (13-1) khi gửi: giữ lý do đã chọn, báo mất mạng, có nút "Thử lại"; không ghi nhận báo cáo khi chưa gửi được.

## E9-US5 — Ẩn chờ xem xét và gỡ theo yêu cầu

 Là Young Aesthetes duyệt Nhà hàng xóm, tôi muốn thiết kế bị nhiều người báo cáo được ẩn trong lúc chờ xem xét để không phải thấy nội dung xấu lâu.

**Status:** Draft

**Mốc:** M2+ · **Priority:** P2 · **Effort:** M

**Màn:** Thiết kế có sẵn (15-1), Chi tiết thiết kế (15-2); thông báo cho người đăng (10-2).

**Pre-condition:** Một thiết kế đã nhận báo cáo (E9-US4) hoặc YourSpace nhận yêu cầu gỡ từ cơ quan quản lý.

**Post-condition:** Thiết kế đang ẩn chờ xem xét, đã được khôi phục, hoặc đã bị gỡ hẳn.

#### Acceptance Criteria

- AC1: Khi số báo cáo tính vào ngưỡng (từ các SĐT đã xác minh khác nhau, E9-US4) đạt ngưỡng, thiết kế tự ẩn khỏi 15-1, link chia sẻ và kết quả dùng làm mẫu mới, rồi chờ xem xét. Số lượt cụ thể: chưa chốt, xem PRD §8.
- AC2: Kết quả xem xét chỉ có hai nhánh: khôi phục (hiện lại như trước, giữ lượt thả tim và lượt dùng làm mẫu) hoặc gỡ hẳn. Thời hạn xem xét: chưa chốt.
- AC3: Khi cơ quan quản lý yêu cầu gỡ, thiết kế bị gỡ trong vòng 24 giờ kể từ lúc nhận yêu cầu (Nghị định 147/2024), không chờ ngưỡng báo cáo.
- AC4: Người đăng nhận thông báo khi thiết kế bị ẩn, được khôi phục hoặc bị gỡ, kèm lý do ở mức chung; thông báo không tiết lộ ai đã báo cáo.
- AC5: Thiết kế đang ẩn hoặc đã gỡ không xuất hiện ở tab Yêu thích của người khác như thiết kế xem được; thẻ hiện "Thiết kế không còn hiển thị" (E02).

#### Corner Cases

- CC1: Thiết kế đã được khôi phục rồi lại nhận báo cáo mới: báo cáo mới vẫn vào hàng xem xét; báo cáo cũ có còn tính vào ngưỡng hay không: chưa chốt.
- CC2: Người khác đang mở 15-2 đúng lúc thiết kế bị ẩn: lần thao tác tiếp theo (mua, dùng làm mẫu, thả tim) báo thiết kế không còn hiển thị và đưa về 15-1.
- CC3: Bản sao "dùng cả không gian" đã tạo từ thiết kế trước khi nó bị gỡ: cách xử lý chưa chốt.

## E9-US6 — Người đăng quản lý và gỡ thiết kế của mình

 Là Người đăng thiết kế, tôi muốn xem lượt thả tim, lượt dùng làm mẫu và gỡ thiết kế của mình bất cứ lúc nào để thấy công sức được ghi nhận và lấy lại quyền với ảnh nhà mình.

**Status:** Draft

**Mốc:** M2+ · **Priority:** P2 · **Effort:** S

**Màn:** Tôi (12-1) → danh sách thiết kế đã đăng → Chi tiết thiết kế (15-2) ở chế độ người đăng.

**Pre-condition:** Người dùng đã xác minh SĐT và có ít nhất một thiết kế đã đăng.

**Post-condition:** Thiết kế vẫn công khai với thiết lập mới, hoặc đã bị gỡ khỏi Nhà hàng xóm.

#### Acceptance Criteria

- AC1: Tab Tôi có danh sách thiết kế đã đăng, mỗi thiết kế hiện lượt thả tim, lượt dùng làm mẫu tách theo hai nhánh (dùng cả không gian, lấy bộ món) và trạng thái (đang hiện, đang ẩn chờ xem xét, đã gỡ).
- AC2: Người đăng gỡ được thiết kế của mình bất cứ lúc nào, sau một bước xác nhận; thiết kế biến khỏi 15-1 và link chia sẻ ngay khi gỡ xong.
- AC3: Người đăng bật hoặc tắt "Cho phép dùng cả không gian" cho từng thiết kế; khi tắt, 15-3 ẩn nhánh này với mọi người xem từ lúc đó.
- AC4: Gỡ thiết kế không xóa không gian gốc trong Phòng của tôi của người đăng.
- AC5: Không có mục doanh thu, hoa hồng hay rút tiền nào trong khu quản lý thiết kế.

#### Corner Cases

- CC1: Người đăng gỡ một thiết kế đang là bản gốc của nhiều bản dùng lại: các bản dùng lại vẫn hiện, dòng ghi nguồn đổi thành "Thiết kế gốc không còn hiển thị" (E9-US3).
- CC2: Người đăng đổi sang máy khác: xác minh lại SĐT để thấy danh sách thiết kế đã đăng.
- CC3: Chưa đăng thiết kế nào: danh sách hiện màn trống (13-4) giải thích có thể đăng từ Trình chỉnh sửa.
- CC4: Mất mạng (13-1) khi gỡ: không báo đã gỡ cho tới khi hệ thống xác nhận; có nút "Thử lại".
