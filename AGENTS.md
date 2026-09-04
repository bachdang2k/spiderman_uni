# The Web That Found Linh Chu — VIPER dogfood adapter

Đọc file này, sau đó đọc `CLAUDE.md` top-to-bottom trước khi thay đổi sản phẩm. Trạng thái sống ở `context/STATE.md`.

## Runtime Codex

| VIPER                | Codex trong repo này                                         |
| -------------------- | ------------------------------------------------------------ |
| `/viper-dogfood`     | Skill `$viper-dogfood` tại `.agents/skills/viper-dogfood/`   |
| `viper-browse`       | Skill tại `.agents/skills/viper-browse/`                     |
| agent `viper-user-*` | Custom agent tại `.codex/agents/`                            |
| Playwright MCP       | local SSE `127.0.0.1:8935/sse`; một session cho vai duy nhất |
| sửa file             | `apply_patch`                                                |

## Ràng buộc

- Sau khi scope đã khóa, không hỏi lại về quyết định UI đảo ngược được; ghi vào `context/DECISIONS.md` rồi tiếp tục.
- Mọi agent sửa code phải đọc `context/shared/CONVENTIONS.md`, tự review diff và chạy `make check`.
- Dogfood chỉ chạy đúng **một vai**: `viper-user-picky`, trong một browser session riêng của lượt dogfood. Server local chỉ thật sự isolated khi được khởi động với `--isolated`.
- `viper-user-picky` là **Design & UI/UX Director**: đo token/computed style và đánh giá hierarchy, affordance, nhịp kể, motion, responsive, accessibility cùng emotional progression. Không audit edge/state stress. Mọi nhận xét phải có bằng chứng render thật.
- Không báo hoàn tất nếu chưa có bằng chứng trình duyệt, console và viewport desktop/mobile trong `context/STATE.md`.
