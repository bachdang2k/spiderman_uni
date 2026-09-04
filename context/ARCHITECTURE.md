# ARCHITECTURE

## Sơ đồ

```text
story config ───────► scene state machine ───────► unlocked scene list
                           │                            │
                           ├── Lenis/GSAP               ├── SVG/CSS
                           ├── Howler                    ├── Canvas rAF
                           └── Three.js galaxy/sakura    └── semantic copy fallback
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
4. Chạm galaxy hình 6 để các điểm 3D hội tụ thành chữ L.
5. Chạm giọt mưa để đánh thức cành anh đào.
6. Sau va chạm, cánh hoa tự hội tụ thành `LINH CHU`; đàn bướm dẫn mắt tới CTA xuất hiện muộn.
7. Mở kén sao được quấn bằng tơ nhện.
8. Các vì sao ráp thành lời mời đi ngắm hoàng hôn.

## Fallback

WebGL/Canvas thất bại vẫn còn geometry SVG, CSS và semantic copy. Audio thất bại im lặng. Reduced motion đặt particle vào trạng thái hoàn tất nhưng giữ state sequence.
