# VIPER Creative Dogfood — The Web That Found Linh Chu

Đây là biến thể VIPER tập trung vào trải nghiệm sáng tạo tương tác. Nguồn sự thật: `context/PRD.md`, `context/ARCHITECTURE.md`, `context/DESIGN-SYSTEM.md`, `context/PROTOTYPE.md` và `context/STATE.md`.

## Tám luật

1. Scope khóa theo PRD; ý tưởng mới vào backlog.
2. Quyết định đảo ngược được sau scope lock: tự chọn, ghi decision, tiếp tục.
3. Quyết định UI/motion không hiển nhiên phải có một dòng trong `DECISIONS.md` trước khi code.
4. Tài liệu và code là một hợp đồng; thay hành vi thì cập nhật cả hai.
5. Trải nghiệm là một tuyến truyện; scene sau không mở trước khi scene hiện tại resolved.
6. Clean code và accessibility là gate, không phải polish tùy chọn.
7. Tiếng Việt có dấu cho copy; identifier bằng tiếng Anh.
8. Challenge trước khi sửa lớn; dogfood bằng trình duyệt trước khi báo xong.

## Chu trình

`Validate → Implement → Dogfood → Improve → Verify`

- Validate: đọc PRD/persona/architecture/design system, nêu một câu hỏi khó và tự trả lời bằng tài liệu.
- Implement: giữ state machine, config tập trung và progressive enhancement.
- Dogfood: một lượt duy nhất bằng `viper-user-picky` qua Playwright MCP.
- Improve: sửa lỗi lõi, UI/UX nặng và lỗi dưới 15 phút; ghi phần còn lại vào STATE.
- Verify: `make check`, chạy lại đúng phần vừa sửa ở desktop, mobile và reduced-motion.

## Dogfood một vai

Chỉ dùng `viper-user-picky`. Vai này chạy tuần tự bốn pass trong cùng browser MCP session:

1. Visual hierarchy và affordance ở 1280×800.
2. Typography, color, contrast, spacing và composition bằng computed style + screenshot.
3. Responsive UI/UX ở 390×844, 360×640 và landscape.
4. Motion direction: pacing, continuity, easing, reduced-motion và emotional payoff.

`picky` không được chỉ chấm “đúng token”: phải kiểm tra cảm xúc, nhịp kể, clarity của tương tác và chất lượng motion. Báo cáo “ổn” mà không có selector, computed style, viewport hoặc thao tác cụ thể không được tính.

## Hợp đồng lệnh

```text
make dev      make check      make test
make dogfood  make build      make doctor
```

## Trước khi nói xong

```text
make check xanh
make test xanh
dogfood có bằng chứng thật
phát hiện đã sửa hoặc ghi STATE
```
