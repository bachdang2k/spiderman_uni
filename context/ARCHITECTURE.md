# ARCHITECTURE

## Sơ đồ

```text
story config ───────► scene state machine ───────► unlocked scene list
                           │                            │
                           ├── Lenis/GSAP               ├── SVG/CSS
                           ├── Howler                    ├── Canvas rAF
                           └── Three.js galaxy + heart   └── semantic copy fallback
```

## Ranh giới

- `config`: toàn bộ personalization và copy.
- `App`: máy trạng thái và điều phối transition; không chứa visual scene.
- `scenes`: một scene, một primary interaction; gọi `onComplete` nhưng không tự mở scene sau.
- `components`: primitive hình thức/tương tác tái dùng.
- `hooks/lib/animations`: side effect motion/audio và motion policy.

## State machine

Mỗi scene: `locked → active → resolved → exited`. Scene chỉ được mount khi unlocked. `advance(from)` bỏ qua mọi lời gọi không đến từ scene current, ngăn double-advance.

## Luồng lõi

1. Chạm web và bắn tơ.
2. Chọn tín hiệu Spider Sense khác biệt.
3. Chạm huy hiệu của nữ anh hùng nguyên bản để mở cổng sao.
4. Chạm galaxy hình `6` — **tương tác cuối cùng của cả câu chuyện**. Các điểm 3D hội tụ chậm
   thành chữ `L`, rồi tự chuyển sang cảnh cuối, không có nút và không có wipe.
5. `The Heart That Writes` — một cảnh, ba beat, một timeline GSAP, không có tương tác nào:
   trái tim hạt sáng đứng yên rồi tan rã từ nửa dưới lên · chính những hạt đó viết `Diệu Linh`
   theo lối viết tay · phần hạt dự trữ gom xuống và viết câu hỏi bằng cùng nét tay. Rồi dừng.

Truyện kết thúc ở khung đó: không nút trả lời, không hoàng hôn, không chrome, không fade.

## Fallback

WebGL/Canvas thất bại vẫn còn geometry SVG, CSS và semantic copy. Audio thất bại im lặng. Reduced motion đặt particle vào trạng thái hoàn tất nhưng giữ state sequence.
