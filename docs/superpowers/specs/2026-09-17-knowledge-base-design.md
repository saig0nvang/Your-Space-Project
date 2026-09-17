---
derives_from: []
---
# YourSpace — Knowledge Base liên kết Quyết định ↔ Tài liệu (thiết kế)

> Ngày: 2026-09-17 · Trạng thái: thiết kế đã duyệt, chờ lập plan
> Mục tiêu: không bao giờ để một quyết định thay đổi mà không biết tài liệu nào vừa trở thành sai.

## 1. Vấn đề

30 tài liệu (~56k từ) mô tả cùng một sản phẩm từ 6 góc (Product, Product_research, Pitch,
Governance-and-Risk, docs/superpowers, README). `Doc_Consistency_Audit_2026-07-23.md` đã đo
được 83 mâu thuẫn + 55 điểm trôi lệch, và kết luận rằng chúng dồn về 6 quyết định gốc (D1–D6).

Nguyên nhân cấu trúc: quan hệ "tài liệu X dựa trên quyết định D" chỉ tồn tại trong đầu founder.
Khi D đổi, không có cơ chế nào chỉ ra X vừa hết đúng. `Doc_Sync_Plan_2026-07-23.md` là bản đồ
phụ thuộc đó — nhưng dựng thủ công, một lần, và đã cũ.

Thiết kế này biến quan hệ ngầm đó thành dữ liệu máy đọc được, có cổng kiểm tra.

## 2. Phạm vi

**Trong phạm vi:** hạ tầng KB — thư mục `decisions/`, `facts.yml`, `scripts/kb.mjs`,
git hook, skill `/sync-decision`, và gắn `derives_from` cho toàn bộ tài liệu hiện có.

**Ngoài phạm vi (có chủ đích):** không sửa nội dung bất kỳ tài liệu nào. Đợt đồng bộ tồn đọng
theo `Doc_Sync_Plan_2026-07-23.md` sẽ chạy sau, bằng chính công cụ này.

**Hệ quả đã biết:** ngay sau bootstrap, `kb check` sẽ báo phần lớn tài liệu là stale — vì chúng
đang thực sự sai so với D1–D6. Đó là kết quả đúng: hàng đợi sync thủ công trở thành hàng đợi
máy sinh và theo dõi được.

## 3. Nguyên tắc

1. **Quyết định là bất biến.** Đổi ý = tạo bản ghi mới, liên kết ngược về bản cũ. Không sửa tại chỗ.
2. **Không có cạnh nào ghi hai lần mà không được đối chiếu.** Cạnh quyết định → tài liệu chỉ
   khai ở `derives_from` của tài liệu downstream; chiều ngược lại luôn suy ra, không bao giờ ghi tay.
   Cạnh giữa các quyết định ghi cả hai đầu (để đọc file là thấy, không cần chạy công cụ), nhưng
   `kb check` bắt buộc hai đầu phải khớp nhau.
3. **Phát hiện là tự động, sửa là có người duyệt.** Máy khoanh vùng; agent đề xuất; founder gật.
4. **Cảnh báo, không chặn.** Hook chặn cứng sẽ bị `--no-verify` trong vài ngày rồi quên.

## 4. Data model

### 4.1 Thư mục quyết định

```
decisions/
  D1-user-first.md
  D2-marketplace-escrow.md
  D3-cloud-inpainting.md
  D3b-depth-server-side.md
  D4-kreativ-lite.md
  D5-milestone-ladder.md
  D6-market-numbers.md
  facts.yml
```

Frontmatter mỗi file quyết định:

```yaml
---
id: D3
title: AI Inpainting chạy cloud qua API hosted
status: accepted          # accepted | superseded | amended
date: 2026-07-23
superseded_by: null       # id, khi bị thay thế toàn bộ
supersedes: null          # id, khi thay thế cái khác
amended_by: [D3b]         # id[], khi bị bổ sung một phần
amends: null              # id, khi bổ sung cái khác
---
```

`status`, `superseded_by` và `amended_by` là thông tin **suy ra được** từ `supersedes`/`amends`
của các file khác, nhưng vẫn được ghi ra để đọc file là hiểu ngay mà không phải chạy công cụ.
Đổi lại, `kb check` xác minh ba thứ này khớp với chiều ngược lại và coi sai lệch là **lỗi cấu
trúc** (mã thoát 2), chứ không phải cảnh báo. Ghi hai đầu mà không đối chiếu chính là cách
`Decisions_Log` cũ trôi khỏi thực tế.

Thân bài giữ **nguyên văn** nội dung D1–D6 từ `Decisions_Log_2026-07-23.md`. Không viết lại,
không biên tập. Đây là bước di trú, không phải bước xét lại quyết định.

**Hai loại cạnh giữa quyết định:**

- `supersedes` / `superseded_by` — thay thế **toàn bộ**. Bản cũ chuyển `status: superseded`.
- `amends` / `amended_by` — bổ sung **một phần**. Bản cũ giữ `status: amended` và vẫn còn hiệu lực
  ở những phần không bị đụng tới.

Cần cả hai vì ca thật đầu tiên là ca bổ sung một phần: khối `[Cập nhật M1 — 2026-07-24]` hiện
đang nằm chèn giữa D3 sửa lại tiền đề về depth (server-side thay vì on-device), nhưng **không**
đảo ngược quyết định cốt lõi của D3 (inpainting chạy cloud). Ép nó thành `supersedes` sẽ hoặc
nói dối, hoặc buộc D3b phải chép lại toàn văn D3.

### 4.2 `facts.yml`

Các dữ kiện dạng số/nhãn mà nhiều tài liệu cùng nhắc tới, kèm **danh sách giá trị đã bị loại bỏ**:

```yaml
tam:
  value: "$9.76B"
  owner: D6
  forbidden: ["$5B", "~$5B"]
sam:
  value: "$300-500M"
  owner: D6
  forbidden: ["$2.5B"]
cac:
  value: "100K VND"
  owner: D6
  forbidden: ["160K"]
burn:
  value: "11.7tr VND/tháng"
  owner: D6
  forbidden: ["$8,333"]
privacy_claim:
  value: "ảnh gửi lên xử lý & xóa ngay"
  owner: D3
  forbidden: ["100% on-device", "không upload ảnh", "API cost = 0"]
```

`forbidden` là phần bắt lỗi deterministic — không cần AI, chỉ cần tìm chuỗi. Đây chính là loại lỗi
đã sinh ra phần lớn 83 mâu thuẫn: một con số bị đổi ở quyết định nhưng bản cũ còn sống trong 5 file khác.

Danh sách `forbidden` ban đầu rút từ cột "Ghi chú đồng bộ" của bảng D6 và các mục 🔴 trong
`Doc_Sync_Plan_2026-07-23.md`.

### 4.3 Frontmatter tài liệu downstream

```yaml
---
derives_from: [D1@a3f2c1d9, D4@9b1c7702, D6@77de0215]
---
```

Chuỗi sau `@` là **git blob SHA** (8 ký tự đầu) của file quyết định tại thời điểm tài liệu này
được xác nhận khớp lần cuối.

`derives_from: []` (mảng rỗng, khai tường minh) nghĩa là "đã xét, tài liệu này không phụ thuộc
quyết định nào" — khác hẳn với **thiếu** `derives_from`, nghĩa là "chưa vào graph".
Phân biệt này thay cho một danh sách loại trừ cứng trong code.

Khoá tuỳ chọn thứ hai:

```yaml
facts_check: false
```

Miễn tài liệu khỏi phép kiểm tra `facts.yml` ở mục 6. Cần cho đúng ba tài liệu meta —
`Decisions_Log_2026-07-23.md`, `Doc_Sync_Plan_2026-07-23.md`, `Doc_Consistency_Audit_2026-07-23.md`
— vì chúng trích dẫn nguyên văn các giá trị đã bị loại bỏ để nói về chính việc loại bỏ chúng.
Quét chúng chỉ sinh báo động giả, và báo động giả là thứ làm người ta bỏ qua cả báo cáo.

## 5. Cơ chế phát hiện drift

Vì mỗi quyết định là một file riêng, **không cần hash theo section**. Toàn bộ cơ chế dựa trên
kho object của git:

1. Hash hiện tại: `git hash-object decisions/D3-cloud-inpainting.md`
2. So với hash đã lưu trong `derives_from` của từng tài liệu.
3. Lệch → lấy lại **nguyên văn bản cũ** bằng `git cat-file -p <hash cũ>`, rồi
   `git diff --numstat <cũ> <mới>` cho mức độ thay đổi và `git diff <cũ> <mới>` cho patch đọc được.

Khác biệt so với việc chỉ lưu một checksum mờ: báo cáo không nói "D3 đã đổi 12%", mà in ra
**đúng những dòng trong D3 đã đổi**. Đó là thứ founder cần để quyết định có phải sửa tài liệu
downstream không, và là input trực tiếp cho `/sync-decision`.

**Các ca biên:**

- *Blob cũ không còn trong kho object* (chưa từng commit, hoặc đã bị gc): báo stale, ghi rõ
  "không truy được bản cũ", bỏ qua phần diff.
- *File quyết định đã sửa nhưng chưa commit*: `git hash-object` vẫn tính được hash của bản
  trong thư mục làm việc → drift bị phát hiện **ngay ở pre-commit**, đúng lúc cần nhất.
- *`kb ack` ghi hash mới*: dùng `git hash-object -w` để bảo đảm blob mới nằm trong kho object,
  nếu không lần diff sau sẽ mất bản đối chiếu.
- *Hai file quyết định trùng `id`*: lỗi cứng, `kb` thoát mã 2.
- *`derives_from` trỏ tới `id` không tồn tại*: lỗi cứng, thoát mã 2.
- *Hai đầu của một cạnh giữa quyết định không khớp* (D3b khai `amends: D3` nhưng D3 không khai
  `amended_by: [D3b]`, hoặc `status` không phản ánh đúng): lỗi cứng, thoát mã 2, in ra cặp lệch.

## 6. `scripts/kb.mjs`

Tập hợp tài liệu được xét = `git ls-files '*.md'` trừ danh sách loại trừ
(`apps/web/**`, `**/CREDITS.md`, `CLAUDE.md`, `decisions/**`). Dùng `git ls-files` để tự động
loại `node_modules` và mọi thứ không được theo dõi.

| Lệnh | Hành vi |
|---|---|
| `pnpm kb:check` | Báo cáo 4 mục: ① tài liệu stale kèm diff quyết định ② tài liệu thiếu `derives_from` ③ tài liệu trỏ tới quyết định đã `superseded`/`amended` ④ vi phạm `facts.yml` (file:dòng + chuỗi bị cấm + giá trị đúng) |
| `pnpm kb:impact D3` | Chạy **trước** khi sửa quyết định: liệt kê mọi tài liệu có `derives_from` chứa D3 |
| `pnpm kb:ack <đường-dẫn> [id...]` | Đóng dấu hash mới sau khi người đã tự đọc và thấy tài liệu vẫn đúng. Không có `id` thì ack toàn bộ quyết định của tài liệu đó |
| `pnpm kb:graph` | Xuất sơ đồ Mermaid quyết định → tài liệu ra stdout |

**Mã thoát:** `0` sạch · `1` có drift hoặc vi phạm · `2` lỗi cấu trúc (trùng id, tham chiếu hỏng,
YAML không parse được). Cờ `--warn` ép mọi trường hợp về `0`; hook dùng cờ này.

Mục ③ tồn tại để việc supersede không trở nên vô hình: khi D3 bị D3b bổ sung, mọi tài liệu còn
trỏ vào D3 phải được nhắc rằng có bản mới hơn, kể cả khi hash của D3 chưa hề đổi.

**Phụ thuộc:** `yaml` (devDependency ở root). Frontmatter và `facts.yml` là YAML thật —
`facts.yml` có nested mapping và mảng — nên tự chế parser sẽ vỡ ở ca biên đầu tiên khi sửa tay.

## 7. Git hook

`.githooks/pre-commit` chạy `node scripts/kb.mjs check --warn`, in báo cáo, **luôn cho commit đi qua**.

Cài bằng `git config core.hooksPath .githooks` — hook nằm trong repo, được version, không cần
husky hay bước cài đặt nào khác. Plan sẽ ghi lệnh này vào README phần setup.

## 8. Skill `/sync-decision <id>`

Luồng:

1. Chạy `kb impact <id>` để lấy danh sách tài liệu bị ảnh hưởng.
2. Lấy diff của quyết định giữa hash cũ và hash hiện tại (mục 5) làm mô tả thay đổi.
3. Với từng tài liệu: đọc, sửa các đoạn bị diff làm cho sai, không đụng phần khác.
4. `kb ack` từng tài liệu đã sửa.
5. Dừng lại, yêu cầu founder review `git diff`. Skill **không** commit.

Skill sửa nội dung nhưng không tự đóng dấu khi chưa sửa — `ack` chỉ chạy sau khi có thay đổi
thực sự hoặc khi founder chủ động gọi `kb ack` bằng tay.

## 9. Bootstrap

1. Tạo `decisions/` bằng cách tách `Decisions_Log_2026-07-23.md` thành 7 file (D1, D2, D3, D3b,
   D4, D5, D6), nguyên văn. Khối `[Cập nhật M1 — 2026-07-24]` trong D3 tách ra thành D3b với
   `amends: D3`, ngày 2026-07-24.
2. Viết `facts.yml` từ bảng D6 và các mục 🔴 của `Doc_Sync_Plan`.
3. Đóng băng `Decisions_Log_2026-07-23.md`: thêm header ghi rõ đây là snapshot lịch sử
   ngày 2026-07-23, nguồn chân lý hiện tại là `decisions/`. Nội dung còn lại giữ nguyên.
4. Cập nhật `CLAUDE.md`: "Định hướng sản phẩm" trỏ sang `decisions/`.
5. Gắn `derives_from` cho toàn bộ tài liệu được xét. **Nguồn suy ra:**
   `Doc_Sync_Plan_2026-07-23.md` đã liệt kê sẵn từng file dính quyết định nào (mục A–F) —
   dùng bản đồ đó thay vì đọc lại 56k từ. Tài liệu không có trong plan được xét riêng và
   gắn `derives_from: []` nếu thực sự độc lập.
6. Lấy hash nền, theo đúng thứ tự này: **commit `decisions/` trước** (để blob của các file
   quyết định vào kho object), rồi chạy `kb ack` cho toàn bộ tài liệu — lệnh này ghi hash vào
   frontmatter của chúng — rồi commit lần hai cho các tài liệu vừa bị sửa frontmatter.
7. Chạy `kb check` lần đầu — kết quả mong đợi là một danh sách dài tài liệu stale, chính là
   hàng đợi sync tồn đọng.

## 10. Kiểm thử

`scripts/kb.test.mjs` dùng `node:test` (có sẵn trong Node 20, không thêm phụ thuộc). Mỗi test
dựng một repo git tạm trong thư mục temp, tạo file, chạy các lệnh `kb`, kiểm tra stdout và mã thoát.

Ca cần phủ:

- Tài liệu khớp hash → `check` sạch, thoát `0`.
- Sửa file quyết định → tài liệu phụ thuộc bị báo stale, patch in ra chứa dòng đã đổi.
- `ack` sau khi sửa → `check` sạch trở lại.
- Tài liệu thiếu `derives_from` → vào mục ②; có `derives_from: []` → không vào mục nào.
- Quyết định có `amended_by` → tài liệu trỏ vào nó vào mục ③ dù hash không đổi.
- Chuỗi trong `forbidden` xuất hiện trong tài liệu → vào mục ④ kèm số dòng.
- Trùng `id`, `derives_from` trỏ id không tồn tại, hai đầu cạnh quyết định lệch nhau → thoát `2`.
- `--warn` ép thoát `0` dù có drift.

## 11. Không làm

Transclusion cứng (`{{facts.tam}}` trong file) · Obsidian vault · GitHub Actions ·
hash theo section · graph database · sinh tài liệu tự động.

Mỗi thứ đều thêm được về sau trên nền data model này mà không phải làm lại. Với 30 tài liệu và
một người, chúng là chi phí không có người trả.
