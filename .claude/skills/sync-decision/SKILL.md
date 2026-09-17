---
name: sync-decision
description: Use when a decision record in decisions/ has changed and dependent documents need to be brought back in line - reads the decision diff, edits only the affected documents, and re-stamps their hashes.
---

# Sync Decision

Đồng bộ các tài liệu phụ thuộc sau khi một quyết định trong `decisions/` thay đổi.

## Điều kiện dừng

Skill này **không commit**. Nó dừng lại và giao `git diff` cho founder duyệt.

## Các bước

1. Xác định id quyết định từ tham số. Không có tham số thì chạy `pnpm kb:check` và hỏi
   founder muốn xử lý quyết định nào.

2. Lấy danh sách tài liệu bị ảnh hưởng:

       pnpm kb:impact <id>

3. Lấy nội dung thay đổi của chính quyết định đó. `pnpm kb:check` in sẵn patch dưới mỗi
   mục ①. Đọc patch, xác định **những khẳng định nào vừa đổi** — đó là phạm vi được phép sửa.

4. Với từng tài liệu trong danh sách:
   - Đọc toàn bộ file.
   - Chỉ sửa những đoạn mà patch ở bước 3 làm cho sai. Không biên tập câu chữ khác,
     không "cải thiện" văn phong, không đụng phần không liên quan.
   - Nếu tài liệu vẫn đúng dù quyết định đã đổi, không sửa gì.

5. Đối chiếu `decisions/facts.yml`: mọi số và nhãn vừa sửa phải dùng đúng `value`, và không
   được để lại chuỗi nào trong `forbidden`.

6. Đóng dấu lại từng tài liệu đã xử lý:

       pnpm kb:ack <đường-dẫn>

7. Chạy `pnpm kb:check`. Mục ① và ④ phải sạch cho những tài liệu vừa xử lý.

8. Nếu quyết định cũ đã bị `supersedes`/`amends`, cập nhật `derives_from` của tài liệu để trỏ
   sang bản mới, rồi `kb ack` lại — mục ③ mới hết.

9. Dừng. Báo cáo cho founder: đã sửa file nào, sửa gì, còn gì chưa xử lý được và vì sao.
   Nhắc họ review `git diff` trước khi commit.

## Không làm

- Không commit, không push.
- Không sửa file trong `decisions/` — quyết định là bất biến; đổi ý thì tạo bản ghi mới.
- Không chạy `kb ack` cho tài liệu chưa hề đọc.
