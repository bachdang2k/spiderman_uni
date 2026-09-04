# DESIGN SYSTEM — Cinematic Web

## 1. Nguyên tắc

Spider-Verse ở texture/động năng, không cosplay thương hiệu. Romance xuất hiện muộn. Mỗi màn chỉ có một tiêu điểm và một primary action.

## 2. Token

| Nhóm   | Token               | Giá trị                                                  |
| ------ | ------------------- | -------------------------------------------------------- |
| màu    | night               | `#080A12`                                                |
| màu    | navy                | `#101426`                                                |
| màu    | deep blue           | `#172554`                                                |
| màu    | web red             | `#E63946`                                                |
| màu    | cream               | `#F7F1E3`                                                |
| màu    | gold                | `#D4A84F`                                                |
| màu    | petal               | `#D96C75`                                                |
| chữ    | display             | Cormorant Garamond 400/500                               |
| chữ    | body                | Manrope 400/500                                          |
| target | interactive minimum | `44px`                                                   |
| motion | cinematic           | 700–1350ms, `power3.inOut` hoặc cubic-bezier tương đương |

Opacity, gradient và màu pha từ bảng trên được phép khi tăng chiều sâu nhưng không được làm chữ thường dưới WCAG AA.

## 3. Hierarchy và rhythm

- Focal visual chiếm trung tâm; copy dẫn đặt ở 12–15% đầu màn; hint/continue ở safe-area đáy.
- Display heading dùng serif; labels/progress dùng sans uppercase tracking rộng.
- Không đồng thời hiện hint và continue.

## 4. Component states

- `ContinueButton`: default, hover/focus, disabled.
- Primary scene target: idle, hover/focus, resolved.
- `SoundToggle`: on/off và accessible label.
- `InteractiveHint`: hiện trước interaction, biến mất ngay khi interaction bắt đầu.

## 5. Motion & accessibility

- Motion có chủ đích: web → stem → constellation → web.
- Không bounce ngẫu nhiên; không scale rẻ tiền cho copy.
- `prefers-reduced-motion` phải bỏ loop/transition dài.
- Focus ring dùng gold; graphic SVG có label hoặc ẩn khỏi accessibility tree.

## 6. Checklist của Design & UI/UX Director

Chấm cả: visual hierarchy, affordance, copy clarity, emotional pacing, continuity giữa scene, touch ergonomics, contrast, overflow, focus order, motion fatigue và mức bất ngờ của scene 6.
