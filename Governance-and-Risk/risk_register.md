---
derives_from: [D2@499c7e4d, D5@15cdc73a, D6@b921ed46]
---
# Risk Register v1 — YourSpace
**Ngày lập:** 07/05/2026 | **Người lập:** Phạm Việt Anh (Founder)

### 0. Cơ sở tính toán Runway (Burn Rate)
> **Cập nhật 2026-07-23 (D6):** Chuyển sang mô hình **BOOTSTRAP** — tính runway theo burn thật, KHÔNG dùng $8,333/tháng.

- **Tiền mặt hiện có:** ~50tr VND
- **Burn rate thật (bootstrap):** ~11.7tr VND/tháng → runway ~4.3 tháng
- **Thang Impact (theo số tháng runway ở burn 11.7tr VND/tháng):**
  - Impact 1: < 11.7tr VND (< 1 tháng runway)
  - Impact 2: 11.7tr – 23tr VND (1-2 tháng runway)
  - Impact 3: 23tr – 35tr VND (2-3 tháng runway)
  - Impact 4: > 35tr VND (>3 tháng runway — đe dọa cạn sạch 50tr tiền mặt)
- **Lưu ý:** Kịch bản Seed $150,000 / burn ~$8,333/tháng là **kịch bản M2 sau gọi vốn**, KHÔNG dùng để chấm điểm rủi ro ở giai đoạn bootstrap hiện tại. Các con số tổn thất bằng USD nêu dưới đây phản ánh kịch bản seed/M2; ở giai đoạn bootstrap cần đọc lại theo thang VND ở trên.

---

### 1. Risk 1: Customer-facing AI Risk (Ảo giác tỷ lệ không gian)
*Rủi ro lõi của trải nghiệm Visual Commerce*

- **If** mô hình Depth Anything V2 ước lượng sai độ sâu phòng 15-20% trong một chiến dịch marketing lớn (đẩy traffic cao), khiến đồ nội thất trên app hiển thị nhỏ hơn thực tế.
- **Then** 100 khách hàng mua nhầm các món đồ lớn (giường, sofa) không nhét vừa phòng. Theo mô hình đã chốt (D2), **phí hoàn hàng do SUPPLIER chịu** — khấu trừ qua escrow + phạt SLA 8%, KHÔNG phải YourSpace móc túi đền 600tr. Tuy vậy YourSpace vẫn hứng khủng hoảng truyền thông khi khách lên TikTok bóc phốt và có thể mất đà traction M1. *(Lưu ý: luồng hoàn hàng qua escrow thuộc M2; ở M1 web-first bước "mua" là link affiliate/thu lead nên chưa phát sinh nghĩa vụ bồi hoàn.)*
- **Leading to** Không còn khoản đền 600tr về YourSpace (đã chuyển sang supplier). Tổn thất trực tiếp còn lại chủ yếu là chi phí xử lý khủng hoảng PR + tổn hại uy tín/traction ≈ **~25-30tr VND ≈ 2-3 tháng runway** (ở burn 11.7tr).

**Chấm điểm:**
- Likelihood: 4 (Rất dễ xảy ra với AI tính toán chiều sâu từ ảnh 2D)
- Impact: 3 (Tài chính giảm mạnh vì supplier chịu bồi hoàn, nhưng ở bootstrap runway mỏng nên đòn reputational/traction vẫn nghiêm trọng ~2-3 tháng)
- **Score: 12 → [Ưu tiên cao]** 🚨 (Bồi hoàn đã chuyển sang supplier nên rớt khỏi KILL ZONE tài chính, nhưng đây vẫn là rủi ro REPUTATIONAL số 1 cần mitigate ngay: Manual Fallback + cảnh báo rủi ro trên UI — xem Incident Playbook).

---

### 2. Risk 2: Vendor Risk (Đối tác Supplier khóa API 3D)
*Rủi ro phụ thuộc dữ liệu*

- **If** 3 nhà cung cấp nội thất Mid-range lớn nhất đột ngột thay đổi chính sách, khóa quyền truy cập API vào catalog 3D độc quyền của họ vì lo ngại YourSpace lấy cắp model.
- **Then** App trắng trơn, không có đồ nội thất thật để người dùng kéo thả. Tỷ lệ chốt đơn rớt về 0. Phải thuê đội ngũ 3D tự scan lại 1,000 sản phẩm với chi phí $20/model.
- **Leading to** $20,000 chi phí tạo 3D model gấp + mất 2 tháng doanh thu = **4.5 tháng runway**.

**Chấm điểm:**
- Likelihood: 3 (Có thể xảy ra nếu chưa ký hợp đồng pháp lý chặt chẽ)
- Impact: 4 (Mất >4 tháng runway)
- **Score: 12 → [Watch]** (Đưa vào roadmap: Ký hợp đồng ràng buộc Supplier lock-in ngay trong tháng này).

---

### 3. Risk 3: Founder-bandwidth Risk (Single Point of Failure)
*Rủi ro nhân sự của Solo Founder*

- **If** Founder (Việt Anh) ốm nặng, tai nạn hoặc burnout phải nghỉ phép 2 tuần đúng đợt launch bản cập nhật Mobile MVP (React Native + Expo GL) và dính lỗi crash ở màn hình thanh toán. *(Lưu ý: màn hình thanh toán in-app/escrow thuộc M2 (D5) — M1 web-first chưa có bước thanh toán này, nên đây là kịch bản rủi ro của giai đoạn M2.)*
- **Then** Không có lập trình viên nào khác trong team có đủ thẩm quyền và hiểu biết kiến trúc để hotfix. Tiền marketing đổ vào tải app bị lãng phí do app crash.
- **Leading to** Lãng phí $5,000 tiền Ads + 1 tháng gián đoạn tiến độ = **1.5 tháng runway**.

**Chấm điểm:**
- Likelihood: 2 (Có thể xảy ra)
- Impact: 2 (Mất 1.5 tháng runway)
- **Score: 4 → [Accept]** (Chấp nhận rủi ro hiện tại vì đang ở giai đoạn Seed, nhưng cần document hệ thống rõ ràng để bàn giao tạm thời nếu cần).

---

### 4. Tổng kết 2x2 Matrix

```text

        ┌──────────────┬──────────────┐
   High │ Risk 2 (12)  │ Risk 1 (12)  │
   (>3mo) Watch          Ưu tiên cao  │
        │              │              │
   Imp. ├──────────────┼──────────────┤
   Low  │ Risk 3 (4)   │              │
   (<1mo) Accept       │              │
        │              │              │
        └──────────────┴──────────────┘
          Low (1-2)       High (4-5)
               Likelihood
```

**Action ưu tiên (Incident Playbook):** Tập trung giải quyết **Risk 1 (Customer-facing AI Risk)**. Sau khi chốt D2 (supplier chịu bồi hoàn qua escrow), Risk 1 giảm từ Score 16 (KILL ZONE) xuống 12 vì tổn thất TÀI CHÍNH không còn dồn vào YourSpace — nhưng vẫn là rủi ro REPUTATIONAL số 1 (ảo giác tỷ lệ phá uy tín "AI hiểu không gian"), nên vẫn ưu tiên diễn tập & mitigate.
