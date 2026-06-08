# Risk Register v1 — YourSpace
**Ngày lập:** 07/05/2026 | **Người lập:** Phạm Việt Anh (Founder)

### 0. Cơ sở tính toán Runway (Burn Rate)
- **Vốn mục tiêu (Seed):** $150,000 cho 18 tháng
- **Burn rate trung bình:** ~$8,333/tháng
- **Quy đổi:**
  - Mất $8,333 = 1 tháng runway
  - Mất $25,000 = 3 tháng runway (Impact 3)
  - Mất $33,000+ = 4 tháng runway (Impact 4)

---

### 1. Risk 1: Customer-facing AI Risk (Ảo giác tỷ lệ không gian)
*Rủi ro lõi của trải nghiệm Visual Commerce*

- **If** mô hình Depth Anything V2 ước lượng sai độ sâu phòng 15-20% trong một chiến dịch marketing lớn (đẩy traffic cao), khiến đồ nội thất trên app hiển thị nhỏ hơn thực tế.
- **Then** 100 khách hàng mua nhầm các món đồ lớn (giường, sofa) không nhét vừa phòng. Nhãn hàng từ chối chịu trách nhiệm và ép YourSpace đền bù phí hoàn hàng (trung bình 30% x đơn 20 triệu = 6 triệu VNĐ/đơn). Khách hàng lên TikTok bóc phốt.
- **Leading to** $24,000 bồi thường (600 triệu VNĐ) + $10,000 chi phí xử lý khủng hoảng PR = **4 tháng runway**.

**Chấm điểm:**
- Likelihood: 4 (Rất dễ xảy ra với AI tính toán chiều sâu từ ảnh 2D)
- Impact: 4 (Mất 4 tháng runway)
- **Score: 16 → [KILL ZONE]** 🚨 (Phải mitigate ngay tuần này bằng tính năng Manual Fallback và cảnh báo rủi ro trên UI).

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

- **If** Founder (Việt Anh) ốm nặng, tai nạn hoặc burnout phải nghỉ phép 2 tuần đúng đợt launch bản cập nhật Mobile MVP (React Native + Expo GL) và dính lỗi crash ở màn hình thanh toán.
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
   High │ Risk 2 (12)  │ Risk 1 (16)  │
   (>3mo) Watch          KILL ZONE    │
        │              │              │
   Imp. ├──────────────┼──────────────┤
   Low  │ Risk 3 (4)   │              │
   (<1mo) Accept       │              │
        │              │              │
        └──────────────┴──────────────┘
          Low (1-2)       High (4-5)
               Likelihood
```

**Action ưu tiên (Incident Playbook):** Tập trung giải quyết **Risk 1 (Customer-facing AI Risk)** vì nằm trong vùng KILL ZONE.
