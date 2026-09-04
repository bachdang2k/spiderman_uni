---
name: viper-dogfood
description: Dogfood trải nghiệm bằng đúng một vai viper-user-picky qua Playwright MCP, tự sửa và verify lại.
---

# $viper-dogfood — one-role creative audit

Không đọc code rồi suy “chắc chạy”. Phải mở localhost, thao tác và đo bản render thật.

## Chuẩn bị

Đọc `context/PRD.md`, `PERSONAS.md`, `ARCHITECTURE.md`, `PROTOTYPE.md`, `DESIGN-SYSTEM.md` và `STATE.md`; chạy `make dev`. Dùng duy nhất custom agent `viper-user-picky` với browser MCP isolated.

## Bốn pass bắt buộc

1. **Hierarchy & affordance 1280×800:** đi từ S0 tới hidden ending; chấm tiêu điểm và độ rõ của primary action.
2. **Visual system:** screenshot từng scene; đo computed style; chấm typography, color, contrast, spacing và composition.
3. **Responsive UI/UX:** đi hết luồng ở 390×844 và kiểm điểm nghi ngờ ở 360×640 + 844×390; đo overflow, target và cân bằng bố cục.
4. **Motion direction:** chấm pacing, continuity web→stem→constellation→web, easing, motion fatigue, reduced-motion và surprise payoff.

## Xử phát hiện

- Không rõ affordance, tràn mobile, focus/contrast lỗi, motion phá nhịp kể hoặc payoff yếu: sửa ngay.
- Lỗi UI/UX/motion dưới 15 phút: sửa ngay.
- Phần lớn hơn: ghi `context/STATE.md §Phát hiện chưa xử`.
- Sau sửa chạy `make check`, `make test`, rồi browser regression đúng scene đã sửa.

## Bằng chứng tối thiểu

URL, viewport, danh sách thao tác thật, screenshot, console errors, selector + computed style cho phát hiện hình thức. Thiếu một trong các loại liên quan thì chưa được kết luận.
