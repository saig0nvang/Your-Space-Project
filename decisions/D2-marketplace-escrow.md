---
id: D2
title: Marketplace + Escrow, đáp xuống M2
status: accepted
date: 2026-07-23
supersedes: null
superseded_by: null
amends: null
amended_by: []
---

**Quyết định:** **Marketplace + Escrow (giữ tiền trung gian).** Về mô hình sản phẩm là marketplace có escrow; theo D5 escrow **đáp xuống M2** (M1 chỉ affiliate/thu-lead, chưa cầm tiền).
- YourSpace giữ tiền hộ (escrow) → giải ngân cho supplier **khi có xác nhận giao hàng**. Định vị đúng: escrow = **bảo vệ người mua** (hợp D1 user-first).
- **Trách nhiệm bồi hoàn khi có sự cố thuộc về SUPPLIER/B2B**, không phải founder móc túi. Khóa bằng hợp đồng + SLA (phạt supplier, ví dụ 8%).

**Ràng buộc & hệ quả cần đồng bộ:**
- **Pháp lý:** KHÔNG tự giữ tiền trong tài khoản YourSpace. Dùng **cổng thanh toán được cấp phép có hold/escrow** (PayOS/MoMo/VNPay/ngân hàng) để né giấy phép trung gian thanh toán NHNN. YourSpace chỉ điều phối.
- **PRD:** bỏ "Thanh toán In-app" khỏi Out-of-Scope vĩnh viễn → đưa vào scope **M2** (M1 chưa có escrow).
- **Governance:** viết lại RISK 4 (escrow giữ nguyên) và `incident_playbook` — kịch bản "founder tự hoàn 25tr" phải đổi thành "supplier chịu, trừ qua escrow". `Business_Assumptions` cập nhật: doanh thu = **take-rate 8% trên GMV giao dịch thật** (không còn thuần "affiliate click-out").
- **Cảnh báo:** làm MVP nặng thêm đáng kể → phải điều chỉnh D5 (timeline) cho thực tế.
