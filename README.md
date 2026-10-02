---
derives_from: [D1@d0d780f3, D4@bb7f1ffe, D5@15cdc73a, D7@96011236, D10@4b681365]
---
# YourSpace

YourSpace là nền tảng visual commerce cho nội thất, giúp người dùng thử đặt đồ vào chính căn phòng của mình trước khi mua.

Thay vì phải tưởng tượng một chiếc sofa, bàn trà hay kệ tivi sẽ trông như thế nào trong không gian thật, người dùng có thể upload ảnh phòng, chọn phong cách nội thất, kéo thả sản phẩm 3D vào ảnh và xem tổng thể trước khi ra quyết định.

## Vấn Đề

Mua nội thất là một quyết định có rủi ro cao hơn nhiều so với mua các sản phẩm tiêu dùng thông thường. Người dùng không chỉ hỏi "món này có đẹp không", mà còn phải tự trả lời:

- Món này có hợp với phòng thật của mình không?
- Kích thước có vừa không?
- Màu sắc và chất liệu có lệch tông không?
- Nếu mua về kê không hợp thì đổi trả thế nào?
- Tổng chi phí cho cả không gian sẽ là bao nhiêu?

Trong khi đó, thị trường lại có quá nhiều catalog, quá nhiều sản phẩm đơn lẻ và quá ít công cụ giúp người dùng hình dung quyết định mua trong bối cảnh căn phòng thật của họ.

## Giải Pháp

YourSpace chuyển trải nghiệm mua nội thất từ việc lướt catalog sang trải nghiệm "sống thử trước khi mua".

Người dùng bắt đầu bằng ảnh phòng thật, chọn một phong cách nội thất như Japandi, Wabi-Sabi, Mid-Century hoặc Scandinavian, sau đó thử đặt các món đồ 3D đã được curate theo phong cách đó vào không gian của mình.

Sản phẩm hướng tới trải nghiệm:

- Style-first (nhu cầu số 1): bắt đầu từ gu thẩm mỹ và khám phá phong cách, không bắt đầu từ danh sách hàng nghìn SKU.
- User-controlled: người dùng trực tiếp kéo thả, xoay, chỉnh và quyết định bố cục.
- Purchase-oriented: mỗi phối cảnh đều có thể dẫn tới danh sách sản phẩm, chi phí và bước mua hàng tiếp theo.
- AI-assisted: AI hỗ trợ scale và placement để đồ trông tự nhiên hơn trong ảnh phòng thật.

## Tính Năng Chính

- Upload ảnh phòng thật làm canvas thiết kế.
- Chọn phong cách nội thất để xem các món đồ đã được curate.
- Kéo thả đồ nội thất 3D vào ảnh.
- Xoay, phóng to, thu nhỏ, di chuyển và xóa từng món đồ.
- Xem tổng thể căn phòng trước khi mua.
- Ước tính tổng chi phí dựa trên các món đã chọn.
- AI Spatial Placement kiểu "Kreativ-lite": từ 1 ảnh phòng, dùng Depth Anything V2 để ước lượng chiều sâu và tự động scale/đặt đồ đúng phối cảnh hơn (xoay chỉ theo trục Y).
- Manual override để người dùng luôn giữ quyền kiểm soát cuối cùng; nếu độ chính xác của AI chưa đạt, luồng degrade mượt về đặt đồ thủ công.

## Phạm Vi M1 (Web Validation)

Sản phẩm được chia theo thang bậc mốc rõ ràng, không gọi chung tất cả là "MVP":

- **M0 — PoC (đã có):** web prototype hiện tại trong `WebApp/`, tập trung kéo thả đồ 3D thủ công. Đây là proof of concept, không phải MVP.
- **M1 — Validation (web-first, ~4-6 tuần):** vòng lõi trải nghiệm người dùng mô tả dưới đây; chưa có escrow, bước mua chỉ đo ý định (link/thu-lead).
- **M2 — MVP thật (~3-4 tháng):** bổ sung escrow/thanh toán, onboard supplier, nâng cao chất lượng inpainting (polish) và mobile native. (Xóa đồ cũ cơ bản đã có ở M1.)
- **Từ M2 trở đi:** Thiết kế có sẵn gồm Phòng mẫu và cộng đồng Nhà hàng xóm; người dùng đăng không gian để người khác dùng làm mẫu (D10).

M1 tập trung vào một luồng trải nghiệm cốt lõi:

1. Người dùng upload ảnh phòng.
2. Chọn phong cách nội thất (style-first).
3. Thử đặt đồ 3D vào ảnh, có AI Spatial Placement hỗ trợ; có thể **xóa/giữ đồ có sẵn trong ảnh** (xóa đồ cũ qua cloud inpainting).
4. Chỉnh bố cục thủ công nếu cần.
5. Xem chi phí ước tính.
6. Ra quyết định cuối: mua / lưu thiết kế, hoặc rẽ nhánh để lại thông tin nhận tư vấn từ chuyên gia thiết kế (thu-lead).

AI Spatial Placement nằm trong M1 như một lớp hỗ trợ thông minh kiểu "Kreativ-lite" (1 ảnh + Depth Anything V2). AI không thay người dùng thiết kế toàn bộ căn phòng, mà giúp món đồ được đặt vào ảnh với tỷ lệ và phối cảnh hợp lý hơn; nếu chất lượng depth chưa đạt ngưỡng, luồng degrade mượt về đặt đồ thủ công.

## Prototype

Repository hiện có một web proof of concept cho trải nghiệm đặt đồ 3D vào ảnh phòng.

Để chạy prototype, mở terminal tại thư mục gốc của repository:

```bash
python -m http.server 8000
```

Sau đó mở:

```text
http://localhost:8000/WebApp/
```

Ghi chú:

- Prototype dùng browser-based 3D rendering.
- Một số asset 3D và tính năng visual editing đang ở mức thử nghiệm.
- Các phần segmentation, inpainting và AI-assisted placement được tách riêng trong thư mục kỹ thuật.

## Cấu Trúc Repository

| Thư mục | Nội dung |
|---|---|
| [`Product`](Product/) | Product brief, PRD, business assumptions, needs và moat. |
| [`Product_research`](Product_research/) | Nghiên cứu MVP, PMF, chiến lược sản phẩm và roadmap. |
| [`Pitch`](Pitch/) | Pitch memo, pitch script, investor package và các bản pitch ngắn. |
| [`WebApp`](WebApp/) | Prototype web cho room visualization và 3D drag-drop. |
| [`WebApp/Docs`](WebApp/Docs/) | Walkthrough và ghi chú triển khai MVP. |
| [`Technical`](Technical/) | Thử nghiệm segmentation, inpainting và các hướng AI/visual editing. |
| [`Assets`](Assets/) | Ảnh mẫu và 3D model dùng trong prototype. |
| [`Finance`](Finance/) | Mô hình tài chính và giả định kinh doanh. |
| [`Governance-and-Risk`](Governance-and-Risk/) | Risk register, operating rules và incident playbook. |
| [`Exports`](Exports/) | Các bản export của investor package. |
| [`Archive`](Archive/) | Ghi chú cũ và tài liệu thô. |

## Tài Liệu Chính

- [`Product/Product_Brief.md`](Product/Product_Brief.md) - tổng quan sản phẩm, user flow, persona và pain points.
- [`Product/PRD.md`](Product/PRD.md) - PRD v2.0: flow chuẩn, 11 epic theo mốc; user story ở `Product/prd/epics/`.
- [`Product_research/MVP_Research_and_PMF.md`](Product_research/MVP_Research_and_PMF.md) - giả định MVP và hướng kiểm chứng PMF.
- [`Product_research/Roadmap.md`](Product_research/Roadmap.md) - roadmap sản phẩm.
- [`Pitch/Pitch_Memo.md`](Pitch/Pitch_Memo.md) - bản tóm tắt problem, insight, solution, market và ask.
- [`WebApp/Docs/Walkthrough.md`](WebApp/Docs/Walkthrough.md) - hướng dẫn đọc và thử prototype.

## Trạng Thái Hiện Tại

YourSpace đã hoàn tất M0 (PoC) và đang chuẩn bị bước vào M1 (web validation).

Đã hoàn thành:

- Product brief và PRD.
- MVP scope và roadmap.
- Pitch memo và investor package.
- Web proof of concept cho trải nghiệm room visualization.
- Thử nghiệm kỹ thuật ban đầu cho segmentation, inpainting và AI-assisted placement.

Trọng tâm tiếp theo:

- Kiểm chứng người dùng có tự tin hơn sau khi visualize đồ trong phòng thật hay không.
- Đo click-to-buy intent sau khi dùng prototype.
- Kiểm chứng mức độ sẵn sàng của supplier trong việc cung cấp product data và 3D catalog assets.
- Cải thiện độ tin cậy của AI Spatial Placement trong các ảnh phòng thực tế.

## Định Vị

YourSpace trước hết là công cụ giúp người dùng tự tin chuyển từ cảm hứng sang quyết định mua đúng — giảm sự đắn đo ngay tại thời điểm cần ra quyết định. Lớp visual sales channel cho ngành nội thất (kết nối brand/supplier) là hướng monetization bật sau, khi đã chứng minh được nhu cầu người dùng.

## Knowledge base

Tài liệu và quyết định được liên kết qua `decisions/` và frontmatter `derives_from`.
Sau khi clone, bật hook cảnh báo drift:

    git config core.hooksPath .githooks

Lệnh thường dùng: `pnpm kb:check` · `pnpm kb:impact D3` · `pnpm kb:ack <file>` · `pnpm kb:graph`.
