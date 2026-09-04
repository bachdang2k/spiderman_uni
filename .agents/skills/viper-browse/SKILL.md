---
name: viper-browse
description: Dùng Playwright MCP để thao tác, chụp, đo và đọc console của website VIPER.
---

# viper-browse

Chỉ dùng Playwright MCP `browser_*` trên localhost của repo này.

Quy trình: `browser_navigate` → `browser_snapshot` → thao tác thật → snapshot/screenshot → `browser_console_messages`. Với mobile dùng `browser_resize`; với style dùng `browser_evaluate` và `getComputedStyle`; với reduced motion dùng `page.emulateMedia({ reducedMotion: 'reduce' })`.

Mọi phát hiện nêu: viewport, thao tác, thứ thấy trên màn, kỳ vọng và bằng chứng selector/screenshot/console tương ứng. Không kết luận từ source code.
