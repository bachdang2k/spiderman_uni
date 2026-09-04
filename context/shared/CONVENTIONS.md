# CONVENTIONS

- Một scene có một primary interaction và một điều kiện resolved rõ ràng.
- `App` sở hữu progression; scene không biết scene kế tiếp.
- Personalized copy và asset reference chỉ ở `src/config/story.ts`.
- Side effect animation/audio/canvas phải cleanup khi unmount.
- Không dùng emoji graphic, stock image hay browser icon mặc định.
- Interactive target tối thiểu 44×44px, có accessible name và focus-visible.
- Không hardcode màu mới ngoài `DESIGN-SYSTEM.md`; cố ý lệch phải ghi decision.
- Mobile là layout riêng theo viewport, không chỉ co desktop.
- Mỗi thay đổi phải chạy lint, typecheck/build và dogfood phần liên quan.
- Trước khi kết thúc: review tên, dependency, cleanup side effect, duplicated rule, accessibility và console.
