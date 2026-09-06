# STATE

```text
Pha hiện tại : Dogfood → Improve  (đoạn kết "The Heart That Writes")
Scope khóa   : Có
Stack        : React + Vite + TypeScript + Three.js + GSAP + Lenis + Framer Motion + Howler
URL local    : http://127.0.0.1:4180  (MCP browser cần http://localhost:4180 + vite --host 0.0.0.0)
Bằng chứng   : docs/evidence/
```

## Đang ở đâu

Nửa cuối câu chuyện đã được dựng lại theo `.playwright-mcp/HEART-PARTICLE-DIRECTION.md`.
Cảnh 4–7 cũ (mưa · anh đào · kén sao · lời mời) **đã xoá**. Truyện còn **năm** cảnh:

```text
0 Web · 1 Spider Sense · 2 Wonder · 3 Galaxy 6→L · 4 The Heart That Writes
```

Chạm galaxy số `6` là **tương tác cuối cùng**; từ đó tới hết là một chuỗi liền mạch 26.8s,
không nút, không wipe, không fade.

`make check` xanh · `make test` 8/8 pass · console error `0` · overflow ngang `0` ở cả ba viewport.
Đo trên GPU thật (Apple M1, qua Playwright MCP): **61fps** với 110.000 hạt ở desktop.

## Cần Authority duyệt trước khi đi tiếp

Hai file này đang đóng băng và **chưa được đụng tới** — đây là phần `§0.2` của direction:

| File                        | Việc cần duyệt                                                                                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `context/CURRENT-SCRIPT.md` | Vẫn mô tả arc anh đào và vẫn mang dấu `FROZEN FOR REVIEW`. Cần viết lại còn năm cảnh, lời mời sống tiếp thành beat C                                                           |
| `context/PRD.md`            | `AC-1` phải đổi thành **năm** cảnh · `AC-4` (cánh hoa ghép `LINH CHU`) phải thay bằng tên viết bằng hạt · `AC-5` phải sửa lời: lời mời còn, nút trả lời và hoàng hôn thì không |

Ngoài ra có **một mâu thuẫn dữ liệu** cần Authority quyết:
`STORY_CONFIG.girlName` và `title` vẫn là `Linh Chu`, nhưng direction (`§1`, `§7.5`, `§12.10`)
yêu cầu cảnh cuối viết `Diệu Linh`. Đã thêm `STORY_CONFIG.signatureName = 'Diệu Linh'` và viết
đúng theo direction; **không** tự đổi `girlName` hay tiêu đề vì nằm ngoài `§13`.

## Kiến trúc đoạn kết

| File                              | Trách nhiệm                                                                                        |
| --------------------------------- | -------------------------------------------------------------------------------------------------- |
| `src/assets/lettering/hand.ts`    | Bộ chữ viết tay tự vẽ: điểm bút từng glyph + dấu, một độ nghiêng chung                             |
| `src/assets/lettering/lines.ts`   | Ghép glyph thành nét liền theo từ, xử lý dấu hoãn / dấu tại chỗ, xuất path SVG + nhịp nghỉ của bút |
| `src/lib/spline.ts`               | Catmull-Rom hướng tâm — đường cong của bộ chữ viết tay                                             |
| `src/lib/galaxyLetter.ts`         | Chữ `L` mà cảnh 4 kế thừa + cỡ sân khấu galaxy dùng chung cho hai cảnh                             |
| `src/lib/heart/geometry.ts`       | Lấy mẫu mặt tim ẩn 3D, ba lớp shell/interior/diffuse                                               |
| `src/lib/heart/palette.ts`        | Ramp màu suy từ token, không có cyan, không token mới                                              |
| `src/lib/heart/script.ts`         | Path viết tay → đích của hạt + **thời điểm** mỗi hạt đáp xuống (nhịp bút theo độ cong)             |
| `src/lib/heart/shaders.ts`        | Toàn bộ chuyển động: vị trí là hàm thuần của thời gian + thuộc tính (tất định theo khung)          |
| `src/components/HeartWriting.tsx` | Dựng scene, bloom + trail, timeline GSAP, `window.heartSequence` để tua đúng beat                  |
| `src/scenes/SceneHeart/index.tsx` | Cảnh 4: canvas, chữ cho screen reader, fallback SVG khi WebGL chết                                 |

## Mốc thời gian của cảnh 4 (giây)

`0 preroll(2.4) → condense(2.2) → hold(1.8) → dissolve(4.4) → current(1.5) → viết tên(5.0) →
tên giữ(2.8) → gom(1.3) → viết câu hỏi(6.6) → giữ vô thời hạn` — tổng 26.8s.

Tua đúng beat: `window.heartSequence.seek(giây)` (đã dùng trong `tests/design-dogfood.spec.ts`).

## Challenge log

| Ngày       | Pha       | Câu hỏi                                                                                                                    | Kết quả       | Trả lời                                                                                                                                           |
| ---------- | --------- | -------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-05 | Validate  | Ba beat A/B/C không có tương tác — nếu để chúng thành ba entry của state machine thì máy trạng thái sẽ ra sao?             | PASS          | `advance(from)` chỉ chạy khi scene hiện tại gọi; beat không có tương tác sẽ khoá máy hoặc buộc gọi `onComplete` giả. Nên một scene, một timeline. |
| 2026-09-05 | Implement | Nếu vị trí hạt là hàm thuần của thời gian, làm sao có được quỹ đạo cuộn thật của curl noise mà không tích phân theo khung? | PASS          | Hành quân 5 bước dọc trường curl giải tích ngay trong vertex shader: hạt vẽ đúng một đường dòng, vẫn tất định từng khung.                         |
| 2026-09-05 | Improve   | Tên đứng yên trong lúc câu hỏi được viết — điều gì trong bản dựng có thể làm nó _drift_ mà mắt vẫn thấy?                   | FAIL → đã sửa | Yaw drift ±8° của camera. Đã cho tắt hẳn khi bắt đầu viết chữ; chiều sâu lúc đó do z-scatter và phối cảnh gánh.                                   |

## Bằng chứng dogfood

- 2026-09-05 — Playwright MCP nối được vào máy Authority (Chromium trên Apple M1) qua
  `http://localhost:4180` sau khi vite bind `0.0.0.0`. Đo được: renderer `webgl-heart-writing`,
  `110.000` hạt, **61fps**, overflow `0`, console error `0`.
- Ba khung bắt buộc của `§14` ở `docs/evidence/`: `1280-mid-dissolve.png` ·
  `1280-name-alone.png` · `1280-both-lines.png`. Thêm `390-both-lines.png`,
  `360-both-lines.png`, `1280-reduced-motion.png`, `1280-galaxy-six.png`.
- Reduced motion: hai dòng hiện đủ, đọc được, không có khung trắng, không có vòng lặp tan rã.
- Screen reader nhận đủ hai dòng: `Diệu Linh` và `Would you watch the sunset with me?`.
- Khung cuối: `0` button, `0` progress, `0` sound toggle trong `.scene-heart`.
- 2026-09-06 — **`§12.22` đã đo, không còn là ước lượng.** Không có máy thật nên mô phỏng bằng
  CDP trên GPU thật (Apple M1) qua Playwright MCP: `Emulation.setDeviceMetricsOverride` với
  `deviceScaleFactor: 3` cho ra backing store `585×1266` — đúng bằng iPhone 390×844 sau khi code
  kẹp `pixelRatio` xuống `1.5`. Chạy trọn 26.8s với `Emulation.setCPUThrottlingRate` 6×:
  **60fps · đúng 1 khung rớt trong 27 giây (ở t=12.2s) · GPU p50 1.86ms, p95 3.64ms, max 5.53ms**
  trên ngân sách 16.67ms — đo bằng `EXT_disjoint_timer_query_webgl2`, không phải suy từ fps.
  Nghĩa là còn **dư 3.0× ở khung nặng nhất**. CPU không phải nút thắt: throttle 4× và 6× không
  đổi gì, đúng như thiết kế (vị trí hạt nằm trong vertex shader, JS chỉ tween scalar). Quét
  fill-rate: giữ 60fps tới **8× số điểm ảnh** (5.93 MP). Giới hạn thật: máy nào có GPU chậm hơn
  M1 quá ~3× sẽ bắt đầu rớt khung — cỡ A15 thì thừa sức, Android tầm trung là vùng rủi ro.
- 2026-09-06 — **Fallback WebGL chết đã ép chạy và đã nhìn thật**, bằng cách chặn mọi
  `getContext('webgl*')`. Lộ ra hai lỗi thật, đã sửa (xem `DECISIONS.md`): DOM vẫn khai
  `webgl-heart-writing` + `38000` hạt dù không có canvas nào, và `viewBox` cố định làm dòng cuối
  câu hỏi bị cắt ở 1280×800. Bằng chứng: `docs/evidence/1280-webgl-fallback.png` ·
  `390-webgl-fallback.png`. Đã khoá bằng test `a browser without WebGL still gets the whole
ending, uncropped` — đã dựng lại đúng hình cũ để xác nhận test bắt được lỗi.
- 2026-09-06 — **Lộ thêm một chế độ hỏng câm.** Máy có WebGL2 nhưng không render được half-float
  (`EXT_color_buffer_half_float`/`EXT_color_buffer_float`) thì cả trail buffer lẫn bloom ghi vào
  framebuffer không hoàn chỉnh: **không exception, không console error, `is-fallback` không bật,
  màn cuối trống trơn**. Đã dựng lại bằng cách chặn hai extension đó và chụp
  `docs/evidence/halffloat-no-halffloat.png`. Đã sửa: kiểm extension ngay sau khi dựng renderer,
  thiếu thì ném lỗi để fallback SVG nhận việc. Đã khoá bằng test.

## Phát hiện chưa xử

- Cảnh galaxy chưa được duyệt lại toàn diện về hình thức sau khi roll back: mới xác nhận số `6`
  đúng bản cũ (kể cả sau khi đổi mask sang PNG xám) và hint nằm trong màn hình.
- Hint của cảnh cosmos là tiếng Anh trong khi hint cảnh wonder là tiếng Việt. Copy của Authority,
  chưa đụng.
- Ngân sách hạt hạ theo số nhân là bậc thang cố định, **chưa phải thích ứng thật**. Muốn đúng thì
  phải đo vài khung đầu rồi co `setDrawRange` — việc đó cần đổi cách gán vai hạt (hiện vai chia
  theo khối chỉ số nên cắt bớt đuôi sẽ mất sạch hạt nền và hạt dự trữ) sang rải theo tỉ lệ vàng,
  và cần một lượt dogfood riêng. Chưa làm.

## Đã sửa trong vòng này

- Cắt cảnh 4–7 và sáu component chết; dọn 79 class CSS không còn ai dùng.
- Morph `6 → L` chậm lại 3.8s → 6.4s theo yêu cầu Authority. Hình số `6` **giữ nguyên bản cũ**:
  bản dựng lại bằng nét tự vẽ đã bị Authority bác và đã roll back.
- **Sửa lỗi nút bị đẩy khỏi màn hình** (Authority báo): padding dọc của `.scene` tính theo `9vw`
  nên trên màn rộng-thấp scene cao hơn viewport, kéo `.continue`/`.hint` xuống dưới nếp gấp.
  Đổi sang `7svh` và cap focal element theo `svh`. Đã đo lại ở sáu cỡ màn: không cỡ nào tràn.
- Nét chữ làm mềm mại lại theo yêu cầu Authority: vai chữ tròn và rộng hơn, đáy nét lượn thay vì
  nhọn, `w`/`W` có nét gấp sắc để không đọc thành `m`/`M`, `L` bỏ vòng dưới để không đọc thành `E`.
- Bỏ nút Continue giữa cảnh 3 và 4; chữ `L` đi xuyên qua đúng cỡ và đúng chỗ, không fade.
- Đóng dấu `data-renderer`/`data-particles` sau khi dựng xong thay vì trước, và nhánh fallback
  đóng dấu `svg-fallback` — trước đây khung không-WebGL vẫn khai là đã render WebGL.
- `viewBox` và phép căn của SVG fallback suy từ bounds mực thật; hết cắt dòng cuối ở 1280×800,
  hết lệch trái. Thêm test khoá lại hành vi này.
- Kiểm `EXT_color_buffer_half_float` sau khi dựng renderer — trước đây máy thiếu nó thì màn cuối
  trống trơn mà không báo lỗi gì.
- Mask số `6`: screenshot RGBA 578 KB → PNG xám 159 KB, **0/718.320 pixel lệch** (dựng lại từ giá
  trị sau color management vì ảnh gốc có `iCCP`). Cả trang giảm từ ~1,45 MB xuống 1,05 MB.
- Chữ `w` thường nới rộng 17.1 → 21.0 với đáy nhọn, hết đọc nhầm thành `m`.
- Nền hết ngả navy lúc `t7.3–9.5`: trail fade nâng 0.34 → 0.52 sau khi tim vỡ.
- Ngân sách hạt desktop 110.000 → 55.000 với máy `≤ 4` nhân.

## Phiên sau làm gì

Authority đã chốt: **cập nhật lại ba màn đầu** — `SceneWeb` (0) · `SceneSpiderSense` (1) ·
`SceneWonder` (2). Nội dung: thêm animation, thêm icon, và thêm các model Spider-Man khác.

Đoạn kết (cảnh 3 galaxy và cảnh 4 trái tim) coi như **đã chốt, không đụng tới** trừ khi Authority
yêu cầu. Ba màn đầu hiện là phần ít được chăm nhất của cả tuyến truyện.

Cần biết trước khi bắt đầu:

- Sticker Spider-Man sẵn có nằm ở `src/assets/references/spider-stickers/`.
- Mọi cảnh phải lọt viewport — `.scene` dùng `7svh` và focal element cap theo `svh`. Test
  `expectFitsViewport` trong `tests/design-dogfood.spec.ts` đang khoá điều này ở cả ba cảnh đầu;
  thêm animation mà làm cao lên là test đỏ ngay.
- Ba màn đầu là DOM/CSS/Framer Motion, **không phải WebGL** — chỉ cảnh 3 và 4 dùng Three.js.
  Đừng mang khuôn particle của `HeartWriting` sang đây.
- Ngân sách tải: cả trang hiện **1,05 MB**. Thêm ảnh/model thì cân nhắc — riêng mask số `6` đã
  chiếm 159 KB. Ảnh mới nên là PNG xám hoặc SVG nếu chỉ dùng làm mask.
- Câu chuyện có `reducedMotion()` (`src/lib/motion.ts`); animation mới phải có nhánh giảm chuyển
  động, test số 3 và 4 đang kiểm.

Chưa được đụng nếu Authority chưa duyệt: `context/CURRENT-SCRIPT.md` và `context/PRD.md` (vẫn
đóng băng, vẫn mô tả arc anh đào bảy cảnh), và mâu thuẫn `STORY_CONFIG.girlName = 'Linh Chu'` với
tên viết ở cảnh cuối là `Diệu Linh`.
