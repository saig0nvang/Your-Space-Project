# YourSpace — demo web (pitch)

Vòng lõi M1: Phong cách → Thử phòng (ảnh + chân trời) → Trình chỉnh sửa (xóa đồ, đặt đồ 3D, dự toán) → Mua (để lại SĐT).
Spec: `docs/superpowers/specs/2026-10-05-web-pitch-demo-design.md`.

## Chạy

    pnpm install
    cp apps/web/.env.example apps/web/.env.local   # điền REPLICATE_API_TOKEN để dùng Xóa đồ
    pnpm dev                                        # http://localhost:3000

- Depth (Depth Anything V2 Small) và chạm chọn (SlimSAM) chạy trong trình duyệt; lần đầu tải ~65 MB model.
- Xóa đồ gọi LaMa trên Replicate qua `/api/ai/inpaint` (giới hạn 30 lượt/IP/giờ).
- Dựng lại mô hình 3D: `pnpm --filter web build:models`. Nguồn và giấy phép: `public/models/CREDITS.md`.
- Trang thử nghiệm cũ: `/dev`.

Bản demo: giá, nhà cung cấp là dữ liệu mẫu; form SĐT không gửi đi đâu.

## Trạng thái kiểm thử

Đã kiểm trên Chrome desktop: đặt đồ, kéo đồ, che khuất đúng sau đồ thật trong phòng, ánh sáng theo ảnh
chụp, undo/redo, chỉnh tỷ lệ phòng, chạm chọn bằng SlimSAM, sheet Mua + form để lại SĐT.

Chưa kiểm: xóa đồ thật qua Replicate (chưa có token để thử), trình duyệt trên điện thoại, ảnh phòng chụp
từ điện thoại thật.

## Lint

`pnpm lint` còn 2 lỗi đã có từ trước trên nhánh gốc (`m1-build`), không thuộc phạm vi bản demo này, không
sửa ở đây:

- `apps/web/app/capture/page.tsx` — `react-hooks/set-state-in-effect`
- `apps/web/app/sensor-test/page.tsx` — `react-hooks/set-state-in-effect`

Cả hai là trang dev đang làm (WIP) đọc cảm biến thiết bị, phi mục tiêu của bản demo pitch.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
