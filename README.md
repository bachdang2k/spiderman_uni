# The Web That Found Linh Chu

Một interactive story tuyến tính gồm 8 cảnh, xây bằng React, TypeScript, GSAP, Lenis, Framer Motion, Canvas/SVG và Howler.

## Chạy dự án

```bash
npm install
npm run dev
```

Kiểm tra bản production:

```bash
npm run build
npm run preview
```

## State machine

Mỗi scene đi qua `locked → active → resolved → exited`. `App.tsx` chỉ mount scene kế tiếp sau khi tương tác chính của scene hiện tại hoàn tất. Scene đã xem vẫn nằm trong luồng cuộn để người dùng quay lại, nhưng không thể cuộn để bỏ qua scene bị khóa.

## Tùy biến

Toàn bộ nội dung cá nhân nằm trong `src/config/story.ts`:

- `girlName`: tên người nhận.
- `senderName`: tên người gửi; để rỗng sẽ hiện dấu ba chấm.
- `scenes`: microcopy của từng cảnh.
- `quotes`: phần diễn ý từ _Hoàng Tử Bé_ và _Nhà Giả Kim_.
- `final.message`: lá thư cuối.
- `assets`: chỗ khai báo asset thay thế nếu muốn bổ sung.

Visual chính hiện được tạo bằng Canvas, SVG và CSS nên không phụ thuộc ảnh stock.
# spiderman_uni
