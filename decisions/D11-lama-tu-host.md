---
id: D11
title: Xóa đồ dùng LaMa ONNX tự host trên server, thay API hosted trả theo lượt
status: accepted
date: 2026-10-06
supersedes: null
superseded_by: null
amends: D3
amended_by: []
---

**Quyết định:** Xóa đồ cũ (`POST /api/ai/inpaint`) chạy **LaMa ONNX tự host, trên CPU của chính server app**
(`onnxruntime-node` trong route handler Next.js), thay vì gọi API hosted trả-theo-lượt (Replicate, theo D3).
Interface đổi được vẫn giữ nguyên: `InpaintService` / `AIGateway` (`packages/core/src/ai/`) không đổi — chỉ
đổi adapter đứng sau nó, từ `replicateLama.ts` sang `lamaLocal.ts`.

**Lý do:**
- **Không phụ thuộc token hay chi phí theo lượt** — Replicate cần `REPLICATE_API_TOKEN` và tính tiền mỗi lần gọi;
  tự host loại bỏ cả hai, phù hợp bản demo pitch không có ngân sách vận hành.
- **Ảnh không rời khỏi máy chủ của YourSpace** — xử lý ngay trên server app, không đi qua một vendor thứ ba nào
  khác. Câu đồng thuận hiện có ("ảnh được gửi lên hệ thống để xử lý và xóa ngay") vì vậy **đúng sự thật hơn**:
  không còn nhập nhằng việc ảnh có rời khỏi hạ tầng YourSpace hay không.
- **Đã có số đo thật từ spike** (`docs/spikes/2026-10-04-ai-pipeline-real-photos.md`, kịch bản
  `apps/mobile/scripts/sample-objects/build.py` nhánh `m1-build`, hàm `lama_fill`): LaMa ONNX chạy CPU cho
  kết quả chấp nhận được trong khoảng **2–5 giây/lượt**, đo lại trên bản tự host này cũng cùng khoảng (8,3 s
  lượt đầu gồm nạp model ~200 MB, 1,85–1,9 s các lượt sau — xem báo cáo Task 18).

**Hệ quả cần đồng bộ (founder/các phiên sau):**
- **Model ~208 MB nằm trên server** (`apps/web/.models/lama_fp32.onnx`, tải bằng
  `pnpm --filter web fetch:lama`, git-ignored). Deploy cần máy chủ có ổ đĩa ghi được và đủ RAM để giữ model
  nạp sẵn — **không chạy được trên Vercel serverless** (giới hạn kích thước gói + không có ổ đĩa bền). Gợi ý:
  Railway hoặc máy chủ Node dài hạn tương tự.
  - Xem lại triển khai thực tế vẫn đang `demo/web-pitch` chạy `next dev`/`next start` cục bộ; mục này chỉ ghi
    nhận ràng buộc cho lần đầu đưa lên môi trường có người dùng thật ngoài máy phát triển.
- **Xếp hàng một lượt mỗi lần** (hàng đợi promise trong `lamaLocal.ts`): một `InferenceSession` CPU dùng
  chung giữa các request, không chạy song song được nhiều lượt xóa đồ cùng lúc trên một instance. Vẫn giữ
  giới hạn 30 lượt/IP/giờ để chặn lạm dụng; không còn khái niệm "ngân sách theo ngày" vì không còn chi phí
  theo lượt.
- **Chất lượng như spike**: đồ lớn sát tường vẫn hay xấu (F3 — chọn vùng nhỏ hơn rồi xóa lại — vẫn là đường xử
  lý chính khi kết quả không ưng ý), vì cùng model, cùng kích thước suy luận 512×512.
- `decisions/D3-cloud-inpainting.md` được amend bởi quyết định này — phần thân D3 giữ nguyên, chỉ thêm `D11`
  vào `amended_by` của nó.
