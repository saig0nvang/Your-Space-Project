---
derives_from: [D1@d0d780f3, D2@499c7e4d, D3@7fbc47fb, D3b@4248a41d, D4@bb7f1ffe, D5@15cdc73a, D6@b921ed46, D7@96011236, D8@4efe52c0, D10@4b681365]
---
| Product Name: | YourSpace |
| --- | --- |
| Version: | V2.0 |
| Author(s): | Phạm Việt Anh |
| Last Updated: | 02/10/2026 |
| Status: | Draft — chờ founder duyệt |

# PRD Full: YourSpace

YourSpace giúp người trẻ Việt Nam thử đặt đồ nội thất 3D vào ảnh căn phòng thật của mình, thấy tổng chi phí, rồi mới mua — và cho họ lấy cảm hứng từ phòng mẫu cùng những căn nhà của người khác có cùng kiểu không gian.

> **Nguồn chuẩn:** PRD này mô tả **sản phẩm ở trạng thái đích**, lấy flow "Hành trình YourSpace" chốt ngày 02/10/2026 làm chuẩn (§4.2). Mỗi epic ghi rõ thuộc mốc nào (D5): **M1** web validation 4–6 tuần, **M2** app mobile + thanh toán giữ tiền, **M2+** sau đó.
> Quyết định định hướng nằm trong `decisions/` (D1–D10). User story chi tiết nằm trong `Product/prd/epics/`.
> Flow trực quan: [artifact Hành trình YourSpace](https://claude.ai/artifact/Qf7racvMuWPqxHDyKvvggb) (riêng tư) · bản lưu trong repo: `Product/prd/assets/hanh-trinh-yourspace.html`.

## Version Control

| Version | Date | Updated by | Note |
| --- | --- | --- | --- |
| 2.0 | 02 Oct 2026 | Phạm Việt Anh | Viết lại theo cấu trúc PRD full: executive summary, customer problem, target customers, solution overview, epic requirements, success metrics, assumptions, open decisions. Lấy flow lý tưởng làm chuẩn; tách user story ra 11 epic; thêm Thiết kế có sẵn (Phòng mẫu, Nhà hàng xóm) theo D10; sửa định nghĩa fallback F3. |
| 1.x | 23 Jul – 23 Sep 2026 | Phạm Việt Anh | PRD Skeleton Workshop 2 (mục 10.0–10.10), đồng bộ theo D1–D7 và D3b. |

## 1. Executive Summary

**Bối cảnh:** Mua một món nội thất 5–30 triệu đồng là quyết định khó đảo ngược. Người trẻ Việt Nam lưu hàng trăm ảnh phòng đẹp trên TikTok và Pinterest nhưng không gọi được tên phong cách mình thích, không hình dung được món đồ trong chính căn phòng của mình, và mất 2–4 tuần đắn đo cho mỗi lần xuống tiền. Thị trường nội thất Việt Nam khoảng $9.76 tỷ USD/năm (Mordor) nhưng vẫn bán theo kiểu catalog từng món.

YourSpace đổi điểm bắt đầu từ "danh sách sản phẩm" sang "phong cách" và "căn phòng thật". Người dùng chọn gu, chụp phòng, xóa đồ cũ, đặt đồ mới đúng tỷ lệ, thấy tổng tiền, rồi mua lẻ hoặc cả bộ. Ai chưa sẵn sàng tự bày có thể bắt đầu từ Phòng mẫu hoặc từ phòng của hàng xóm có cùng layout.

Sản phẩm cần chứng minh bốn giá trị:

- **Tìm được gu.** Người dùng gọi tên được phong cách mình thích và thấy nó cụ thể bằng đồ thật (Need #1, D8).

- **Mua đúng.** Người dùng thấy món đồ trong chính căn phòng của mình, đúng tỷ lệ, trước khi trả tiền (Need #2, D1, D4).

- **Mua an toàn.** Tiền được giữ tại đối tác thanh toán được cấp phép đến khi nhận hàng; nhà cung cấp chịu bồi hoàn khi có sự cố (D2).

- **Lan truyền qua cộng đồng.** Mỗi không gian đã bày có thể đăng lên Nhà hàng xóm để người khác dùng làm mẫu (D10).

**Giai đoạn hiện tại:** M1 — web validation 4–6 tuần, kiểm chứng giả định nguy hiểm nhất: người dùng có coi việc thử đồ trong phòng thật là bước để **mua thật** hay chỉ là trò chơi trang trí. M1 chưa có tài khoản, chưa có thanh toán; "mua" là link affiliate hoặc để lại số điện thoại (D5, D7).

## 2. The Customer Problem

### 2.1 Problem statement

**Biết mình thích cái đẹp nhưng không gọi được tên.** Người dùng thấy một căn phòng đẹp và nghĩ "đây đúng là mình", nhưng không biết đó là Japandi hay Wabi Sabi, không biết những món nào tạo nên phong cách đó, nên không biết bắt đầu mua từ đâu.

**Không hình dung được món đồ trong phòng thật.** Ảnh sản phẩm trên sàn thương mại điện tử chụp trong studio. Người dùng phải tự tưởng tượng chiếc sofa sẽ trông thế nào, vừa hay không, có lệch tông với sàn và tường nhà mình không. Sai một lần là mất vài triệu đến vài chục triệu.

**Không biết mua ở đâu cho đúng giá.** Cùng một kiểu bàn, shop này bán 3 triệu, shop kia bán 12 triệu. Không có nơi gom đồ theo phong cách kèm giá tham khảo đáng tin.

**Mua nội thất online thiếu bảo vệ.** Đơn giá cao, giao hàng lâu, nhà cung cấp nhỏ lẻ. Người dùng sợ trả tiền rồi không nhận được hàng đúng như đã thấy.

**Thiếu cảm hứng từ những căn nhà giống nhà mình.** Ảnh mẫu trên mạng là biệt thự hoặc căn hộ nước ngoài. Người ở căn hộ chung cư 2 phòng ngủ khó thấy mình trong đó. *(Giả thuyết mới của D10, chưa có bằng chứng riêng.)*

### 2.2 Customer evidence

Toàn bộ bằng chứng dưới đây là **gián tiếp**, lấy từ nghiên cứu bàn giấy ở `Product_research/Strategic_Discovery.md`. **Chưa có kết quả RAT hay phỏng vấn người dùng nào.**

| Quan sát | Vấn đề sản phẩm | Nhu cầu cần giải quyết |
| --- | --- | --- |
| Câu hỏi phổ biến trên các cộng đồng nội thất là "Phong cách này gọi là gì?". Từ khóa "phong cách thiết kế nội thất" có hơn 12K lượt tìm/tháng trên Google Việt Nam. | Người dùng không có cách hệ thống để khám phá gu. | Duyệt theo phong cách, mỗi phong cách có đặc trưng, chất liệu và món tiêu biểu (E01). |
| Group "Nghiện Nhà" hơn 500K thành viên có hàng trăm bài mỗi tuần hỏi "Sofa này kê vào phòng tôi có hợp không?". Người mua thường đắn đo 2–4 tuần trước một món lớn. | Không có công cụ thử đồ trong chính căn phòng của mình. | Chụp phòng, đặt đồ 3D đúng tỷ lệ, xóa đồ cũ, thấy tổng tiền (E03, E04, E05). |
| IKEA Place đạt hơn 2 triệu lượt tải toàn cầu. | Nhu cầu "thử trước khi mua" có thật nhưng các app hiện có chỉ cho thử từng món lẻ của một hãng. | Thử cả một bộ phong cách với hàng của nhiều nhà cung cấp Việt Nam (E04). |
| Khảo sát Q&Me (2024): người tiêu dùng trẻ sẵn sàng chi thêm 15–20% nếu nguồn gốc và chất lượng rõ ràng. | Giá và nguồn hàng nội thất mù mờ. | Dự toán theo nhà cung cấp, thanh toán giữ tiền đến khi nhận hàng (E07, E08). |

## 3. Target Customers

### 3.1 Primary personas

| Persona | Đặc điểm | Điểm đau | Mục tiêu |
| --- | --- | --- | --- |
| **Young Aesthetes** (khách hàng chính) | 25–35 tuổi, đang hoặc sắp sở hữu căn nhà đầu tiên ở HCM, Hà Nội, Đà Nẵng; thu nhập 15–40 triệu/tháng; lướt TikTok, Pinterest, group Nghiện Nhà hằng ngày. | Có gu nhưng không gọi được tên; sợ phòng "đại trà, giống người già"; sợ mua nhầm món đắt tiền. | Tự tin rằng căn phòng của mình hợp với món đồ trước khi trả tiền. |
| **Người đăng thiết kế** (M2+) | Young Aesthetes đã bày xong một không gian ưng ý và muốn khoe. | Bày xong không có chỗ để người khác thấy và dùng lại; ngại công khai ảnh phòng riêng. | Được thả tim, được người khác dùng làm mẫu, kiểm soát được ảnh nào công khai. |
| **Người được nhờ duyệt** | Người thân, bạn đời, bạn cùng phòng — người cùng quyết định mua. | Không cài app, chỉ muốn xem nhanh và cho ý kiến. | Mở một link trên web, xem phối cảnh, góp ý. |
| **Chuyên gia thiết kế** | Nhà thiết kế nội thất nhận tư vấn theo phong cách. | Khách đến không rõ gu, không có ảnh phòng. | Nhận khách đã có ảnh phòng và phong cách cụ thể. M1 chỉ thu lead; đầy đủ ở M2+ (D7). |
| **Nhà cung cấp** (phase sau, D1) | Xưởng và showroom nội thất tầm trung tại Việt Nam. | Khách bỏ giỏ hàng, hoàn hàng vì "kê không hợp". | Bán được hàng cho khách đã thử trong phòng thật. Là lớp monetization sau khi chứng minh nhu cầu người dùng. |

### 3.2 Customer journey

| Giai đoạn | Hành vi người dùng | Pain points | Giải pháp trong YourSpace |
| --- | --- | --- | --- |
| Tìm gu | Lướt ảnh phòng đẹp, lưu lại, tìm tên phong cách. | Không gọi được tên, không biết món nào tạo nên phong cách. | Khám phá phong cách; Phòng mẫu và Nhà hàng xóm cho thấy phong cách bằng phòng thật (E01, E02). |
| Thử trong phòng | Chụp phòng, đặt thử đồ, dọn đồ cũ. | Không hình dung được tỷ lệ và tông màu trong phòng mình. | Chụp có hướng dẫn, AI căn theo mặt sàn, chạm để xóa đồ cũ, chỉnh tay khi AI sai (E03, E04, E05). |
| Quyết định | Xem tổng tiền, hỏi ý người thân. | Không biết tổng chi phí; quyết một mình thì ngại. | Dự toán luôn hiện; gửi link nhờ duyệt; hỏi chuyên gia (E04, E10). |
| Mua | Chọn món, trả tiền. | Sợ trả tiền rồi không nhận được hàng; ngại tạo tài khoản. | Mua lẻ hoặc cả bộ trong một sheet; xác minh SĐT một lần; tiền giữ tại đối tác (E07). |
| Sau mua | Chờ hàng, nhận hàng, đánh giá. | Không biết đơn đang ở đâu; có sự cố thì khó đòi tiền. | Dòng thời gian giữ tiền; xác nhận nhận hàng mới chuyển tiền; báo sự cố (E08). |
| Chia sẻ | Khoe phòng, xem phòng của người khác. | Phòng mẫu trên mạng không giống nhà mình. | Đăng lên Nhà hàng xóm; dùng làm mẫu theo hai nhánh (E02, E09). |

## 4. Solution overview

### 4.1 Product Vision

YourSpace là nơi người trẻ Việt Nam đi từ "thấy một căn phòng đẹp" đến "căn phòng của mình đã đẹp như thế" — bằng đồ thật, giá thật, trong ảnh phòng thật.

Sản phẩm không làm thay người dùng: AI chỉ gợi ý tỷ lệ và vị trí, người dùng quyết định mọi thay đổi trên ảnh. Sản phẩm cũng không giữ tiền: khoản thanh toán nằm tại đối tác được cấp phép.

**Product direction:** mỗi tính năng phải giúp trả lời rõ ba câu hỏi của người dùng trước khi họ trả tiền:

- Phong cách này có phải là mình không?

- Món này đặt trong phòng mình có hợp và có vừa không?

- Tổng cộng hết bao nhiêu, mua ở đâu, và nếu có sự cố thì tiền của mình có được bảo vệ không?

### 4.2 Hành trình người dùng (nguồn chuẩn)

Ba cửa vào: **Thử phòng** (chụp ảnh luôn), **Khám phá phong cách**, và **Phòng của tôi** cho người quay lại. Mọi chỉnh sửa diễn ra trong một **Trình chỉnh sửa** duy nhất. Mua xong luôn quay về đúng nơi xuất phát.

```mermaid
flowchart LR
  start([Mở đầu]) --> mine[Phòng của tôi]
  start --> try[Thử phòng]
  start --> explore[Khám phá phong cách]
  try --> cap["Chụp có hướng dẫn + consent"] --> und["Hiểu phòng: mặt sàn, tỷ lệ"] --> ed
  mine --> ed
  explore --> style[Chi tiết phong cách] --> design["Thiết kế có sẵn: Phòng mẫu, Nhà hàng xóm"]
  design -- dùng cả không gian --> ed
  design -- lấy bộ món --> cap
  design -- mua lẻ hoặc cả bộ --> buy
  ed{{"Trình chỉnh sửa: thêm đồ, xóa đồ cũ, chất liệu, dự toán, hoàn tác"}}
  ed --> save[Lưu không gian]
  ed --> share[Nhờ người duyệt]
  ed -- cần đăng nhập --> pub[Đăng lên Nhà hàng xóm]
  pub -.-> design
  ed -- mua lẻ hoặc cả bộ --> buy[Sheet mua]
  buy --> otp["Xác minh SĐT, chỉ lần đầu"] --> pay["Thanh toán giữ tiền, tách đơn theo nhà cung cấp"] --> done[Đặt hàng xong]
  done -. mua từ không gian .-> ed
  done -. mua từ thiết kế .-> design
  done --> order["Đơn hàng: giữ tiền, nhận hàng, đánh giá"]
```

**Sáu hành trình chính:**

| Hành trình | Đường đi | Epic |
| --- | --- | --- |
| Thử phòng rồi mua | Mở đầu → Thử phòng → Chụp → Hiểu phòng → Trình chỉnh sửa → Mua → Xác minh SĐT → Thanh toán → Đặt hàng xong → **về không gian đang sửa** | E01, E03, E04, E05, E07 |
| Mua theo thiết kế có sẵn | Mở đầu → Khám phá → Chi tiết phong cách → Thiết kế có sẵn → Mua → … → **về đúng tab thiết kế đang xem** | E01, E02, E07 |
| Dùng cả không gian | Thiết kế có sẵn → Dùng làm mẫu → *Dùng cả không gian* → bản sao vào Phòng của tôi → Trình chỉnh sửa → Mua → **về không gian đó** | E02, E04, E07 |
| Lấy bộ món về phòng mình | Thiết kế có sẵn → Dùng làm mẫu → *Lấy bộ món* → Chụp phòng mình → Trình chỉnh sửa (bộ món thành một tab trong khay) → Mua | E02, E03, E04, E07 |
| Lưu lại, quay lại sau | Trình chỉnh sửa → Lưu → Phòng của tôi → mở lại đúng không gian | E06 |
| Đăng lên Nhà hàng xóm | Trình chỉnh sửa → Đăng (xác minh SĐT, consent công khai) → hiện trong tab Nhà hàng xóm | E09 |

**Nguyên tắc xuyên suốt:**

- **Không đăng nhập để dùng.** Thử, chỉnh, lưu trên máy đều không cần tài khoản. Xác minh SĐT bằng OTP chỉ ở ba chỗ: thanh toán, đặt lịch chuyên gia, đăng thiết kế (D10).
- **Về đúng nơi xuất phát.** Mua từ không gian thì về không gian; mua từ thiết kế có sẵn thì về tab đang xem.
- **Lưu bất cứ lúc nào**, kể cả sau khi đã mua một phần. Món đã mua mang nhãn "Đã mua" trong không gian.
- **AI chỉ gợi ý.** Sau mỗi việc AI làm, một chip nói nó đã làm gì và cách sửa. Độ tin cậy thấp thì chuyển sang chế độ tự chỉnh.
- **Consent thật về ảnh.** Trước lần gửi ảnh đầu: "Ảnh được gửi lên hệ thống để xử lý và xóa ngay sau đó." Đăng công khai có consent riêng.
- **Một nút chính mỗi màn** (DESIGN.md).

### 4.3 Key Benefits

| Selling point | Ý nghĩa với người dùng |
| --- | --- |
| Thấy trước trong phòng mình | Món đồ hiện trong ảnh phòng thật, đúng tỷ lệ theo mặt sàn; đồ cũ có thể xóa để thấy căn phòng sau khi thay. |
| Bắt đầu từ gu, không từ catalog | Chọn phong cách trước, chỉ thấy những món hợp phong cách đó; mix được nhiều phong cách trong một phòng. |
| Mượn ý tưởng từ nhà giống nhà mình | Phòng mẫu và Nhà hàng xóm cho dùng cả không gian của người cùng layout, hoặc lấy bộ món về phòng mình. |
| Mua cả bộ mà vẫn an toàn | Một lần thanh toán cho nhiều nhà cung cấp; tiền chỉ chuyển cho nhà cung cấp khi bạn xác nhận đã nhận hàng. |

## 5. User Stories & Requirements

PRD full chỉ giữ mức epic. User story, Acceptance Criteria và Corner Cases nằm trong từng file epic ở `Product/prd/epics/`. Mã màn (ví dụ 03-2) theo spec app M2 `docs/superpowers/specs/2026-09-25-m2-mobile-app-design.md`.

**Priority:** P0 = vòng lõi bất khả xâm phạm của M1 (chọn phong cách → tải ảnh → đặt ≥1 món → thấy dự toán → bấm mua). P1 = cần cho trải nghiệm đầy đủ, cắt được khi trễ. P2 = sau khi có traction.

### 5.1 Epics

| Epic | Epic description | Priority | Mốc | Release readiness |
| --- | --- | --- | --- | --- |
| [E01 Mở đầu & khám phá phong cách](prd/epics/e01-mo-dau-kham-pha.md) | Màn mở đầu với hai cửa vào và lối vào Phòng của tôi; duyệt phong cách, chi tiết phong cách, món tiêu biểu. | P0 | M1 (2–3 phong cách) · M2 đầy đủ | Draft |
| [E02 Thiết kế có sẵn: Phòng mẫu & Nhà hàng xóm](prd/epics/e02-thiet-ke-co-san.md) | Hai tab thiết kế; thả tim; mua lẻ hoặc cả bộ; dùng làm mẫu theo hai nhánh (dùng cả không gian, lấy bộ món). | P2 | M2+ (D10) | Draft |
| [E03 Chụp & hiểu phòng](prd/epics/e03-chup-hieu-phong.md) | Chụp có hướng dẫn, consent, xác nhận mặt sàn và chiều cao máy, ảnh từ thư viện, ảnh khó phân tích. | P0 | M1 | Draft |
| [E04 Trình chỉnh sửa: đặt đồ & AI Spatial Placement](prd/epics/e04-trinh-chinh-sua.md) | Khay đồ theo phong cách và loại đồ, đặt đồ tự căn tỷ lệ, kéo, xoay trục Y, chỉnh tay, đổi chất liệu, hoàn tác, thanh dự toán. | P0 | M1 (đổi chất liệu: M2) | Draft |
| [E05 Dọn phòng: xóa đồ cũ](prd/epics/e05-don-phong.md) | Chạm để chọn vật thể, xóa bằng inpainting, so sánh trước/sau, hoàn tác; dùng xen kẽ với thêm đồ trong cùng màn. | P1 | M1 (thứ 3 trong thang cắt scope, spec M1 §11) | Draft |
| [E06 Lưu, Phòng của tôi & Yêu thích](prd/epics/e06-luu-yeu-thich.md) | Lưu không gian bất cứ lúc nào không cần đăng nhập; danh sách Phòng của tôi; Yêu thích và báo giảm giá. | P1 | M1 (xuất ảnh/link) · M2 đầy đủ | Draft |
| [E07 Mua & thanh toán giữ tiền](prd/epics/e07-mua-thanh-toan.md) | Sheet mua lẻ hoặc cả bộ nhóm theo nhà cung cấp; M1 dẫn ra link affiliate hoặc thu lead; M2 xác minh SĐT, thanh toán giữ tiền, tách đơn, quay về nơi xuất phát. | P0 | M1 (link/lead) · M2 (thanh toán) | Draft |
| [E08 Đơn hàng & hậu mãi](prd/epics/e08-don-hang.md) | Danh sách đơn, dòng thời gian giữ tiền, xác nhận nhận hàng, báo sự cố, đánh giá. | P2 | M2 | Draft |
| [E09 Đăng lên Nhà hàng xóm & kiểm duyệt](prd/epics/e09-dang-nha-hang-xom.md) | Đăng thiết kế (xác minh SĐT, consent công khai, tắt riêng "dùng cả không gian"), ghi nguồn, báo cáo và ẩn theo ngưỡng. | P2 | M2+ (D10) | Draft |
| [E10 Nhờ người duyệt & chuyên gia](prd/epics/e10-nho-duyet-chuyen-gia.md) | M1 thu lead tư vấn; M2+ gửi link nhờ duyệt mở trên web, danh sách chuyên gia, đặt lịch, chat. | P1 | M1 (lead) · M2+ | Draft |
| [E11 Đo lường & thử nghiệm](prd/epics/e11-do-luong.md) | Sự kiện có kiểu cho các chỉ số RAT và cộng đồng; đo Click-to-Buy và thời gian ở lại trang nhà cung cấp. | P0 | M1 | Draft |

## 6. Success Metrics

| Metric | Measurement | Target | Mốc |
| --- | --- | --- | --- |
| Activation Rate | % người dùng hoàn thành: chọn phong cách → tải ảnh → đặt ≥1 món. | ≥ 30% | M1 |
| Click-to-Buy Rate | % người dùng bấm "Mua" trên ít nhất 1 món (chỉ số chính của RAT). | ≥ 15% | M1 |
| Save/Share Rate | % người dùng lưu hoặc chia sẻ không gian sau khi phối đồ. | ≥ 30% | M1 |
| Return Rate (D7) | % người dùng quay lại trong 7 ngày. | ≥ 25% | M1 |
| AOV | Giá trị trung bình giỏ hàng khi bấm mua. | Base ~10 triệu ₫; 15 triệu ₫ ("mua cả không gian") là upside, không phải cam kết. | M1 |
| AI Placement Accuracy | % món người dùng không phải chỉnh lại sau khi thả. | ≥ 60% (giả thuyết phụ, chưa có baseline). Ngưỡng pass spike chưa chốt (§8). | M1 |
| Tỷ lệ đăng | % không gian hoàn tất được đăng lên Nhà hàng xóm. | Đặt sau khi có baseline M2. | M2+ |
| Lượt dùng làm mẫu | Số lượt dùng làm mẫu trên mỗi thiết kế, tách theo hai nhánh. | Đặt sau khi có baseline M2. | M2+ |
| Đơn từ thiết kế có sẵn | % đơn bắt nguồn từ Phòng mẫu hoặc Nhà hàng xóm. | Đặt sau khi có baseline M2. | M2+ |
| Lan truyền qua link | Số người mở app từ link chia sẻ hoặc link nhờ duyệt trên mỗi người gửi. | Đặt sau khi có baseline M2. | M2+ |

## 7. Assumptions

### 7.1 Key Assumptions We're Making

- **Về người dùng (giả định nguy hiểm nhất):** Người dùng coi việc thử đồ trong phòng thật là bước để mua thật, không chỉ là trò chơi trang trí. Kiểm chứng bằng thí nghiệm ảnh ghép (5 ảnh phòng × 2 bản × 20 người) trước khi code, rồi bằng Click-to-Buy ở M1.

- **Về AI:** Depth từ một ảnh đủ để đồ trông đúng tỷ lệ với đa số ảnh phòng Việt Nam. Kiểm chứng bằng spike tuần đầu M1; nếu không đạt thì lùi về đặt đồ thủ công (D4).

- **Về nhà cung cấp:** Nhà cung cấp tầm trung chịu cung cấp mô hình 3D, kích thước thật và giá. Chưa kiểm chứng (Unknown #2).

- **Về cộng đồng:** Người dùng chịu đăng phòng của mình công khai dù không được chia hoa hồng, chỉ vì được thả tim và được dùng làm mẫu (D10). Chưa kiểm chứng.

- **Về thị trường:** Đủ nhiều người ở căn hộ cùng layout để nhánh "dùng cả không gian" có giá trị thật.

### 7.2 Risks & Mitigation

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Ảnh ghép không đủ thật để người dùng tin | High | Spike tuần đầu M1; tách occlusion khỏi scale; lùi về đặt đồ thủ công nếu dưới ngưỡng. |
| Người dùng chỉ "chơi", không mua | High | Thí nghiệm ảnh ghép trước khi code; Click-to-Buy là chỉ số chính của M1; không chặn nút mua bằng đăng nhập. |
| Ảnh phòng lên cloud (NĐ13) | High | Consent thật, xóa ngay sau xử lý, DPIA trước khi launch M1 (`Governance-and-Risk/document_trail.md`). |
| Nhà hàng xóm khiến YourSpace thành mạng xã hội theo Nghị định 147/2024 | High | Xác thực người đăng bằng SĐT; gỡ nội dung vi phạm trong 24 giờ khi có yêu cầu; hỏi luật sư về giấy phép trước khi mở tab (D10). |
| Nội dung xấu hiện trước khi bị báo cáo | Medium | Ngưỡng vài lượt báo cáo từ tài khoản khác nhau rồi ẩn chờ xem xét; xem xét nhanh. |
| Tab Nhà hàng xóm trống lúc đầu | Medium | Chỉ mở tab khi đủ thiết kế; Phòng mẫu gánh nội dung giai đoạn đầu. |
| Cùng layout nhưng khác kích thước | Medium | Khi mua từ không gian của người khác, nhắc đo lại phòng mình. |
| Depth vẫn chứa đồ cũ đã xóa, nên món mới đặt vào vùng đó bị che sai | Medium | Bỏ qua depth cũ trong vùng đã xóa khi tính occlusion. Cách làm chưa chốt (§8). |
| Xóa đồ cũ cho kết quả xấu hoặc tốn chi phí | Medium | Hoàn tác, thử lại vùng nhỏ hơn. Nếu M1 trễ, đứng thứ 3 trong thang cắt scope (spec M1 §11); cắt cần founder quyết vì là non-negotiable gốc. |

## 8. Open Decisions

- **Mục tiêu chạy toàn bộ AI trên máy người dùng** (tầm nhìn dài hạn của D3): đang thảo luận riêng, context ở `docs/briefs/2026-09-25-on-device-context.md`.

- **Lưu kết quả depth:** D3 yêu cầu xử lý xong xóa ngay; D3b cache depth theo hash ảnh. Cần chốt cache chứa gì và giữ bao lâu.

- **Segmentation chưa có bản ghi quyết định** trong `decisions/`, dù có trong pipeline M1.

- **Ngưỡng pass spike depth** (đề xuất ≥ 70% ảnh "tin được").

- **Đích của lead và link affiliate ở M1** (spec M1 §15).

- **Lưu ở M1:** spec M1 chọn xuất ảnh hoặc link, không tài khoản. Chưa chốt có thu SĐT khi lưu để kiêm luôn thu lead hay không.

- **Số lượt báo cáo cụ thể** để ẩn một thiết kế trên Nhà hàng xóm.

- **Giấy phép mạng xã hội** khi mở Nhà hàng xóm — cần luật sư (Nghị định 147/2024).

- **Ai dựng nội dung Phòng mẫu**, và có đưa một phần lên M1 dạng ảnh kèm danh sách món để làm nhóm đối chứng cho RAT hay không.

- **Hạn báo sự cố** sau khi nhận hàng và có tự chuyển tiền cho nhà cung cấp khi hết hạn không (spec M2 §7).

- **Đối tác thanh toán giữ tiền và đối tác trả góp** cụ thể (spec M2 §7).

**Phát sinh khi viết epic (02/10/2026):**

- **Chụp & xóa đồ (E03, E05):** occlusion trong vùng đã xóa khi depth vẫn chứa đồ cũ; đề xuất chờ duyệt — từ chối consent thì vào chế độ tự chỉnh (E3-US3), xóa thêm thì lấp lại từ ảnh gốc với mặt nạ gộp để tránh "bóng ma" (E5-US2).

- **Lưu, đơn hàng, xác minh (E06, E07, E08):** thời hạn giữ ảnh khi đồng bộ tài khoản; thời hạn giữ dữ liệu đơn; số lần thử và thời hạn mã OTP; có kiểm duyệt đánh giá sản phẩm hay không. Link chia sẻ ở M1 không chứa ảnh phòng, nên mở trên máy khác chỉ dựng lại danh sách món.

- **Nhà hàng xóm (E02, E09):** ngưỡng số thiết kế để mở tab; mặc định của công tắc "Cho phép dùng cả không gian"; danh sách lý do báo cáo; thời hạn xem xét báo cáo; thiết kế đăng trước khi tab mở hiển thị ở đâu; bản sao "dùng cả không gian" xử lý thế nào khi bản gốc bị gỡ; báo cáo cũ có còn tính vào ngưỡng sau khi thiết kế được khôi phục không. Quy tắc đã áp dụng: ai cũng báo cáo được, chỉ báo cáo từ người đã xác minh SĐT mới tính vào ngưỡng ẩn (E9).

- **Đo lường & tư vấn (E10, E11):** ngưỡng thời gian ở lại trang nhà cung cấp (đề xuất 30 giây và 10 giây); cam kết gọi lại lead trong 24 giờ; hạn của link nhờ duyệt (mock spec M2 đặt 7 ngày); bổ sung `SessionStarted`, `SpaceSaved`, `SpaceShared` vào spec M1 §7; chưa có sự kiện kéo lại vị trí nên AI Placement Accuracy tạm tính theo `ScaleOverride`.

## Phụ lục A — AI & dữ liệu

| Tác vụ | Model | M1 chạy ở đâu | Tần suất | Cache | Căn cứ |
| --- | --- | --- | --- | --- | --- |
| Depth | Depth Anything V2 small | Server/cloud qua API hosted, sau interface `AIGateway.depth()` để M2-mobile có thể chạy trên máy | 1 lần/ảnh lúc tải lên | Theo hash ảnh | D3b |
| Segmentation | SAM / MobileSAM, prompt theo điểm chạm | Server, khi người dùng chạm vào vật thể | Khi xóa đồ | — | Spec M1 §5; chưa có bản ghi quyết định |
| Inpainting | LaMa qua API hosted; SDXL-inpaint cho vùng lớn | Server, theo yêu cầu | Khi xóa đồ | Theo hash ảnh + mask | D3 |

**Quyền riêng tư:**
- Câu consent bắt buộc trước lần gửi ảnh đầu: "Ảnh được gửi lên hệ thống để xử lý và xóa ngay sau đó."
- Không bao giờ nói hay ngụ ý ảnh không rời khỏi máy. Chạy AI trên máy là tầm nhìn dài hạn (D3), không phải M1.
- Đăng lên Nhà hàng xóm và đồng bộ tài khoản lưu ảnh trên máy chủ, nên mỗi việc có consent riêng (D10).
- Chi tiết pipeline, cache, rate limit, budget cap: spec M1 §5.

**Fallback khi AI sai** (chi tiết trong epic tương ứng):

| Mã | Tình huống | Hành vi | Epic |
| --- | --- | --- | --- |
| F1 | AI scale sai tỷ lệ | Cho chỉnh tay tự do, ghi log `ScaleOverride` | E04 |
| F2 | AI đặt sai vị trí (đồ lơ lửng) | Bám xuống đường sàn gần nhất, cho kéo tự do | E04 |
| F3 | Xóa đồ cũ cho kết quả xấu | **Hoàn tác, hoặc thử lại với vùng chọn nhỏ hơn.** Không "hiện lại pixel gốc" — với đồ thật trong ảnh, làm vậy là đưa món đồ cũ quay lại. *(Sửa định nghĩa ở bản 1.x.)* | E05 |
| F4 | Ảnh khó phân tích | Không chặn; tắt tự căn, chuyển chế độ tự chỉnh, gợi ý chụp lại | E03 |
| F5 | Không lấy được depth (lỗi hoặc quá chậm) | Tắt AI depth, chuyển sang chỉnh tay hoàn toàn | E04 |
| F6 | Muốn hoàn tác | Hoàn tác nhiều bước trên mọi màn chỉnh sửa | E04, E05 |

## Phụ lục B — Thuật ngữ

| Thuật ngữ | Nghĩa |
| --- | --- |
| Không gian | Một ảnh phòng kèm các món đã đặt, vùng đã xóa, chất liệu đã chọn và dự toán. |
| Trình chỉnh sửa | Màn duy nhất để thêm đồ, xóa đồ cũ, đổi chất liệu, xem dự toán. |
| Phòng mẫu | Không gian do YourSpace tuyển chọn và dựng (D10). |
| Nhà hàng xóm | Không gian do người dùng đăng lên (D10). |
| Dùng làm mẫu — dùng cả không gian | Tạo bản sao ảnh phòng và cách bày của người đăng vào Phòng của tôi để chỉnh tiếp. |
| Dùng làm mẫu — lấy bộ món | Đưa các món của thiết kế vào khay; người dùng tự đặt vào ảnh phòng của mình. |
| Dự toán | Tổng tiền các món đang có trong không gian, nhóm theo nhà cung cấp. |
| Giữ tiền | Khoản thanh toán nằm tại đối tác thanh toán được cấp phép đến khi người dùng xác nhận đã nhận hàng (D2). YourSpace không cầm tiền. |
| M0 / M1 / M2 | PoC đã có / web validation 4–6 tuần / app mobile + thanh toán, 3–4 tháng (D5). |
