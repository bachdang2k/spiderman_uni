# STATE

```text
Pha hiện tại : Dogfood → Improve
Scope khóa   : Có
Stack        : React + Vite + TypeScript + GSAP + Lenis + Framer Motion + Howler
URL local    : http://127.0.0.1:4180
```

## Challenge log

| Ngày       | Pha       | Câu hỏi                                                                                                                                                               | Kết quả       | Trả lời                                                                                                                                                                                            |
| ---------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-04 | Dogfood   | Một người nhận link không biết trước câu chuyện có luôn hiểu hành động tiếp theo và không thể bỏ qua payoff không?                                                    | PASS để audit | State machine khóa scene kế; dogfood phải chứng minh hint, target và transition trên browser thật.                                                                                                 |
| 2026-09-04 | Implement | Khi bỏ toàn bộ lời dẫn, làm sao tên `LINH CHU` vẫn là payoff cảm xúc thay vì một typography demo, đồng thời người xem biết phải đi tiếp mà CTA không phá khoảnh khắc? | DESIGN GATE   | Trì hoãn nhận diện qua luồng gió, giữ tên ổn định không UI tối thiểu khoảng 2 giây, rồi cho đúng một con bướm tách đàn dẫn mắt tới CTA xuất hiện muộn. Motion tự đảm nhiệm nội dung và affordance. |
| 2026-09-04 | Implement | Nếu bỏ outline rõ để galaxy giống thiên hà thật, người xem có còn nhận ra số `6` trước khi morph thành `L`?                                                           | PASS để audit | Dùng khác biệt mật độ thay outline: lõi cloud đặc, nhiều stream đứt đoạn quấn vòng và outer arm dài. Hạt chủ đạo dưới khoảng 1.5px; flare cực hiếm.                                                |

## Bằng chứng dogfood

- 2026-09-04 — Galaxy reference được mở **trước** bằng Playwright MCP tại 1280×800: ảnh gốc `820×876`, ratio `0.936`; sau đó mới mở current scene cùng viewport để đối chiếu.
- Galaxy rebuild: MCP đo stage desktop `860×600`, renderer `webgl-game-stars`, `11.500` stars; mobile khởi tạo trực tiếp tại 390×844 dùng `5.800` stars. Lỗi favicon `404` trong compare session đến từ tab xem PNG trực tiếp của browser, không phải app document.
- Visual compare local xác nhận số `6` đã cùng chiều với reference: outer arm mở sang phải ở phía trên, core xoắn nằm thấp hơn; đã loại double-edge/DNA, watermark số `6/L` và supporting copy.
- Point cloud của số `6` lấy trực tiếp spatial/color mask từ PNG reference rồi render lại bằng WebGL micro-stars; ảnh chỉ cung cấp tọa độ/màu, không xuất hiện như một lớp bitmap trong scene.
- Morph `6 → L` dùng stagger theo bán kính, cung gió và depth offset trong shader; CTA chỉ xuất hiện sau khi hạt cát đã settle. Hai trạng thái dùng chung stage center.
- 2026-09-04 — `viper-user-picky`, Playwright MCP local `127.0.0.1:8935/sse`.
- Đi hết S0→S7 tại 1280×800 và 390×844; active cuối là `scene-final`; overflow ngang đo được `0px` ở cả hai viewport.
- MCP `getComputedStyle`: SoundToggle và final CTA đều cao `44px`; display là Cormorant Garamond, body là Manrope; màu dùng cream/night/gold đã chốt.
- Playwright regression bằng browser context riêng: 4/4 pass (desktop path, mobile path, keyboard + reduced-motion ở cả hai project).
- MCP local PID 47402 không có cờ `--isolated`; không gây collision vì dogfood chỉ còn một vai. Muốn isolation cứng phải restart server với cờ này.
- Ảnh từng scene: `test-results/dogfood/` (artifact local, không commit).

## Phát hiện chưa xử

- Sakura reveal chưa được duyệt về hình thức. Tạm dừng chỉnh Sakura cho tới khi Galaxy được Authority chấp nhận.
- Spider character/icon tự tạo đã bị gỡ khỏi runtime; chờ Authority cung cấp visual direction mới.

## Đã sửa từ dogfood

- S0 hỗ trợ Enter/Space thông qua click semantics chuẩn của button.
- Lenis refresh dimension sau khi scene mới mount; camera tự đến đúng chương kế.
- Decorative gold dust không còn nuốt pointer của constellation.
- Target toggle/continue/final/star đạt tối thiểu 44px; focus của sao dùng glow thay box mặc định.
- Progress/citation tăng tương phản; reduced-motion rút GSAP, transition và fake-ending timeline.
- Báo hoa đổi từ silhouette tai nhọn sang đầu báo tròn và thêm muzzle/whisker rõ hơn.
- Thêm favicon SVG custom để loại console 404.
- Copy payoff được hạ từ sắc thái “định mệnh/tỏ tình” về góc nhìn một bạn nam đang tìm hiểu và muốn Linh vui.
- Bỏ toàn bộ attribution hiển thị dưới hai quote; quote vẫn được cấu hình tập trung trong `src/config/story.ts`.
- THWIP/motion streak vẫn giữ; lens HUD, nhân vật web-hero và sticker showcase tự tạo đã được gỡ theo direction mới.
- Sửa phase surprise để fake ending không hiện lại; neo destination riêng khỏi implicit grid nên CTA không còn đè lên payoff.
- Dogfood lại sau chỉnh sửa: MCP đi hết desktop/mobile, overflow `0px`, console error `0`; Playwright regression 4/4 pass.
- Visual inspection trước đó của Spider mini đã hết hiệu lực vì icon hiện không còn trong runtime.
- Verification cuối galaxy pass: `make check && make test`; Prettier, ESLint, TypeScript/Vite build sạch và Playwright 4/4 pass trên desktop, mobile, keyboard và reduced-motion.
