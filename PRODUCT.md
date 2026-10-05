# Product

<!-- impeccable:product-schema 1 -->

## Platform

ios

## Stack

App mobile: React Native, theo quy ước iOS trước, Android chỉnh sau (founder chọn 2026-10-03). Chưa scaffold. App dùng lại domain TypeScript thuần ở `packages/core`. Web M1 hiện có ở `apps/web`: Next.js 16 + React-Three-Fiber. AI chạy trên cloud sau interface `AIGateway`.

## Users

- **Young Aesthetes (khách hàng chính):** 25–35 tuổi, đang hoặc sắp sở hữu căn nhà đầu tiên ở TP.HCM, Hà Nội, Đà Nẵng; thu nhập 15–40 triệu/tháng; lướt TikTok, Pinterest, group nội thất hằng ngày. Thấy phòng đẹp nhưng không gọi được tên phong cách, sợ phòng "đại trà, giống người già", sợ mua nhầm món 5–30 triệu đồng; thường đắn đo 2–4 tuần cho một món lớn. Việc cần làm: chắc chắn món đồ hợp và vừa căn phòng của mình trước khi trả tiền.
- **Người đăng thiết kế (M2+):** chính người dùng trên, đã bày xong một không gian ưng ý và muốn khoe. Muốn được thả tim, được dùng làm mẫu, và kiểm soát ảnh nào công khai.
- **Người được nhờ duyệt:** bạn đời, người thân, bạn cùng phòng cùng quyết định mua. Không cài app; mở link trên web, xem phối cảnh, góp ý.
- **Chuyên gia thiết kế:** muốn nhận khách đã có ảnh phòng và phong cách cụ thể. M1 chỉ thu lead; đầy đủ từ M2+.

Nhà cung cấp là lớp kiếm tiền ở phase sau, không phải người dùng của app ở giai đoạn này.

## Product Purpose

YourSpace giúp người trẻ Việt Nam đi từ "thấy một căn phòng đẹp" đến "căn phòng của mình đã đẹp như thế" bằng đồ thật, giá thật, trong ảnh phòng thật. Người dùng chọn gu, chụp phòng, xóa đồ cũ, đặt đồ 3D đúng tỷ lệ, thấy tổng tiền, rồi mua lẻ hoặc cả bộ. Ai chưa muốn tự bày thì bắt đầu từ Phòng mẫu hoặc Nhà hàng xóm.

Mỗi tính năng phải giúp người dùng trả lời ba câu hỏi trước khi trả tiền:

1. Phong cách này có phải là mình không?
2. Món này đặt trong phòng mình có hợp và có vừa không?
3. Tổng cộng bao nhiêu, mua ở đâu, có sự cố thì tiền có được bảo vệ không?

Thành công (mục tiêu M1, PRD §6): Activation ≥ 30% (chọn phong cách → tải ảnh → đặt ≥ 1 món); Click-to-Buy ≥ 15% (chỉ số chính); Save/Share ≥ 30%; quay lại trong 7 ngày ≥ 25%; AOV nền khoảng 10 triệu ₫. Giả định nguy hiểm nhất: người dùng coi việc thử đồ trong phòng thật là bước để mua thật, không chỉ là trò trang trí.

## Positioning

Bắt đầu từ gu và từ căn phòng thật, không từ catalog. Người dùng thử cả một bộ đồ của nhiều nhà cung cấp Việt Nam, đúng tỷ lệ theo mặt sàn, trong ảnh phòng của chính mình, xóa được đồ cũ, và thấy tổng tiền nhóm theo nhà cung cấp; app của một hãng chỉ cho thử từng món của hãng đó. Nhà hàng xóm cho người ở căn hộ cùng layout dùng luôn cả không gian người khác đã bày. Mua cả bộ trả một lần; tiền được giữ tại đối tác thanh toán được cấp phép đến khi nhận hàng.

## Operating Context

- Dùng trên điện thoại, đứng trong chính căn phòng cần bày. Phần lớn là căn hộ chung cư, nhiều khối có cùng layout.
- Ba cửa vào: Thử phòng (chụp ảnh luôn), Khám phá phong cách, Phòng của tôi (người quay lại). Mọi chỉnh sửa diễn ra trong một Trình chỉnh sửa duy nhất. Mua xong về đúng nơi xuất phát.
- Sáu hành trình chính (PRD §4.2): thử phòng rồi mua; mua theo thiết kế có sẵn; dùng cả không gian; lấy bộ món về phòng mình; lưu lại, quay lại sau; đăng lên Nhà hàng xóm.
- Quyết định mua thường có người thứ hai tham gia và kéo dài nhiều ngày, nên không gian phải lưu được và mở lại đúng trạng thái.
- Nguồn chuẩn của flow: `Product/PRD.md` §4.2, user story ở `Product/prd/epics/`, sơ đồ `Product/prd/assets/hanh-trinh-yourspace.html`. Quyết định định hướng ở `decisions/` (D1–D10).

## Capabilities and Constraints

Mốc theo D5: **M1** web validation (không tài khoản; "mua" là link affiliate hoặc để lại SĐT) · **M2** app + thanh toán giữ tiền · **M2+** cộng đồng. Thiết kế đích là flow lý tưởng; mỗi năng lực giữ mốc như PRD.

**Chụp và hiểu phòng.** Chụp có thước cân bằng và gợi ý thấy rõ sàn, hoặc chọn ảnh thư viện rồi kéo đường chân trời. Consent trước lần gửi ảnh đầu. Depth chạy trên server một lần mỗi ảnh; tỷ lệ lấy từ mặt sàn và chiều cao máy, depth chỉ dùng cho thứ tự trước–sau. Ảnh khó phân tích không bị chặn mà chuyển sang tự chỉnh.

**Trình chỉnh sửa.** Khay đồ: phong cách là tab, loại đồ là chip; một phòng mix được nhiều phong cách. Chạm sàn để đặt; AI tự căn tỷ lệ và hiện chip nói đã làm gì. Kéo, chọn, chỉ xoay quanh trục Y, chỉnh kích thước bằng tay, đổi chất liệu (M2). Hoàn tác ≥ 10 bước. Thanh dự toán luôn hiện tổng tiền và số món. Xóa đồ cũ là công cụ cùng màn: bắt đầu bằng chạm để chọn vật thể, chọn nhiều vật thể rồi xóa trong một lượt, inpainting trên cloud; không dựng lại được chân tường bị đồ che. AI sai hoặc tạm ngưng thì lùi về đặt tay (F1–F6, PRD Phụ lục A).

**Lưu.** Lưu bất cứ lúc nào, không cần đăng nhập; M2 lưu trên máy, M1 xuất ảnh PNG + link. Món đã mua mang nhãn "Đã mua". Đồng bộ lên tài khoản là tùy chọn, có consent riêng.

**Mua.** Một sheet: mặc định chọn hết, bỏ chọn để mua lẻ, nhóm theo nhà cung cấp, giá luôn là giá hiện tại. M2: xác minh SĐT bằng OTP chỉ lần đầu; thanh toán một lần, hệ thống tách đơn theo nhà cung cấp; trả đủ qua đối tác (có VietQR) hoặc trả góp 0% qua đối tác; không COD, không đặt cọc. Đơn hàng có dòng thời gian giữ tiền; tiền chỉ chuyển cho nhà cung cấp khi người dùng xác nhận đã nhận hàng; có báo sự cố và đánh giá.

**Thiết kế có sẵn (M2+).** Hai tab Phòng mẫu (YourSpace tuyển chọn và dựng) và Nhà hàng xóm (người dùng đăng). Thả tim cũng lưu vào Yêu thích. Dùng làm mẫu rẽ hai nhánh: *Dùng cả không gian* (bản sao ảnh phòng và cách bày; bản gốc không đổi) và *Lấy bộ món* (các món vào khay thành một tab riêng, người dùng tự đặt vào ảnh phòng mình). Đăng cần OTP và consent công khai riêng; người đăng tắt riêng được nhánh dùng cả không gian. Kiểm duyệt hậu kiểm: ẩn chờ xem xét khi đủ báo cáo từ các SĐT đã xác minh khác nhau. Người đăng không nhận hoa hồng; phần thưởng là lượt thả tim, lượt dùng làm mẫu và việc ghi nguồn.

**Ràng buộc cứng.**

- Không đăng nhập để dùng. Xác minh SĐT chỉ ở ba chỗ: thanh toán, đặt lịch chuyên gia, đăng thiết kế. Không có form tài khoản, mật khẩu hay email.
- AI chỉ gợi ý: không món nào được thêm, xóa hay dời khi người dùng chưa thao tác; không tự nhận diện hay tự xóa đồ cũ.
- Một hành động chính trên mỗi màn.
- Mua xong về đúng nơi xuất phát: không gian đang sửa, hoặc tab thiết kế đang xem.

**Thuật ngữ** (PRD Phụ lục B): Không gian · Trình chỉnh sửa · Phòng mẫu · Nhà hàng xóm · Dùng làm mẫu (Dùng cả không gian / Lấy bộ món) · Dự toán · Giữ tiền.

**Chưa quyết.**

- Build app ngay thay vì chạy web M1 trước: founder muốn (2026-10-03) nhưng chưa có bản ghi quyết định thay D5.
- Có màn chọn phong cách riêng khi tạo không gian mới (E4-US1) hay phong cách chỉ là tab trong khay (PRD §4.2, flow HTML).
- Màn Mở đầu là màn trung tâm hay là một tab của tab bar 5 ô (E1-US4).
- Mặc định công tắc "Cho phép dùng cả không gian" khi đăng (đang khuyến nghị TẮT); danh sách lý do và ngưỡng báo cáo; ngưỡng số thiết kế để mở tab Nhà hàng xóm.
- Có màn giới thiệu trước màn Mở đầu không; ảnh chọn từ thư viện có tính là không gian mới không.
- Từ chối consent gửi ảnh thì vào chế độ tự chỉnh với ảnh nằm trên máy (đề xuất ở E3-US3, chờ duyệt).
- Đối tác thanh toán giữ tiền và đối tác trả góp; hạn báo sự cố; giấy phép mạng xã hội theo Nghị định 147/2024 trước khi mở Nhà hàng xóm.

## Brand Commitments

- Tên sản phẩm: YourSpace. Tên tab: "Phòng mẫu", "Nhà hàng xóm". Không dùng tên ngụ ý có kiến trúc sư tuyển chọn (ví dụ "Architect's choice") khi không có kiến trúc sư thật tham gia.
- Câu bắt buộc, giữ nguyên chữ:
  - Consent trước lần gửi ảnh đầu: "Ảnh được gửi lên hệ thống để xử lý và xóa ngay sau đó."
  - Tiền: "YourSpace không cầm tiền của bạn. Khoản thanh toán được giữ tại đối tác thanh toán được cấp phép đến khi bạn nhận hàng."
  - Sau khi AI đặt món: "Đã tự căn theo mặt sàn · kéo để chỉnh"
- Không bao giờ nói hay ngụ ý ảnh không rời khỏi máy. Không nói YourSpace giữ tiền. Đăng công khai có consent riêng, tách khỏi câu consent xử lý ảnh.
- Giọng văn: gọi người dùng là "bạn"; không emoji, không dấu chấm than (brief 2026-10-03 §7).
- Định dạng: tiền `12.400.000 ₫`; kích thước `101 × 119 × 117 cm`.
- Các chuỗi bị `decisions/facts.yml` cấm không được xuất hiện trong sản phẩm (kiểm bằng `pnpm kb:check`).

## Evidence on Hand

- Chưa có kết quả RAT hay phỏng vấn người dùng nào. Bằng chứng nhu cầu đều gián tiếp, từ nghiên cứu bàn giấy (`Product_research/Strategic_Discovery.md`, PRD §2.2).
- 14 ảnh phòng mẫu ở `apps/web/public/golden/rooms/` và model sofa CC0 ở `apps/web/public/golden/`; nguồn và giấy phép ở `apps/web/public/golden/CREDITS.md`.
- Sơ đồ hành trình: `Product/prd/assets/hanh-trinh-yourspace.html`.
- Chưa có: logo, bộ icon chính thức, tên và giá nhà cung cấp thật, tên đối tác thanh toán, nội dung Phòng mẫu, thiết kế cộng đồng, đánh giá hay lời chứng thực. Không được bịa những thứ này; dữ liệu mẫu phải ghi rõ là mẫu, và không hiện tên hay logo đối tác thanh toán khi chưa chốt.

## Product Principles

1. **Căn phòng thật là nơi quyết định.** Rút ngắn đường tới khoảnh khắc món đồ đầu tiên đứng đúng tỷ lệ trong ảnh phòng của người dùng; tổng tiền không bao giờ khuất.
2. **AI gợi ý, người dùng quyết.** Mọi thay đổi trên ảnh cần thao tác chủ động. AI kém tin cậy thì chuyển sang tự chỉnh; đó là đường lui có chủ đích, không phải lỗi.
3. **Không bắt đăng nhập để thử.** Danh tính chỉ xuất hiện đúng lúc có tiền hoặc nội dung công khai.
4. **Nói thật về ảnh và tiền.** Mọi câu về dữ liệu và thanh toán phải đúng sự thật pháp lý.
5. **Không làm mất công người dùng.** Lưu bất cứ lúc nào, mở lại đúng trạng thái, mua xong về đúng chỗ cũ.

## Accessibility & Inclusion

- Vùng chạm ≥ 44 px; tương phản chữ ≥ 4.5:1 ở cả theme sáng và tối.
- Trạng thái luôn có icon + chữ, không dùng màu một mình.
- Tiếng Việt hiển thị đủ dấu chồng tầng; font phải có subset vietnamese.
