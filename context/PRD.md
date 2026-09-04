# PRD — The Web That Found Linh Chu

## Mục tiêu

Tạo một interactive story trên web khiến Linh Chu đi qua cung cảm xúc tò mò → vui → đẹp → bí ẩn → vũ trụ → bất ngờ → lãng mạn, không mang dáng Valentine template.

## Persona chính

Linh Chu nhận link trên điện thoại, chưa được giải thích trước, có 3–5 phút và kỳ vọng mỗi bước tự nói rõ phải làm gì.

## Acceptance criteria

- AC-1: tám scene Web→Sense→Wonder→Cosmos→Rain→Butterfly→Mystery→Final mở theo thứ tự và không thể vô tình bỏ qua tương tác chính.
- AC-2: mọi scene cho biết thao tác tiếp theo bằng tiếng Việt tự nhiên.
- AC-3: web, heroine portal, galaxy, rain, sakura, butterfly và mystery seed có phản hồi rõ bằng touch, mouse và keyboard.
- AC-4: galaxy 3D morph rõ từ số 6 thành L; cánh anh đào trực tiếp ráp thành `LINH CHU`, đồng thời tạo nhiều bướm sống bay quanh tên.
- AC-5: payoff cuối là lời rủ đi ngắm hoàng hôn, lấy copy từ config.
- AC-6: âm thanh opt-in; thất bại âm thanh không chặn truyện.
- AC-7: viewport 360×640, 390×844 và 1280×800 không tràn ngang; target chính tối thiểu 44px.
- AC-8: reduced motion vẫn kể trọn truyện, không có màn trắng.
- AC-9: không dùng emoji làm graphic, stock art, logo Spider-Man hay sao chép trực tiếp nhân vật Wonder Woman.
- AC-10: toàn bộ trải nghiệm chỉ hiển thị đúng hai quote văn học ngắn, không attribution trong UI.

## Ngoài scope

Backend, tài khoản, lưu tiến độ server, analytics, deployment production và nội dung đa ngôn ngữ.

## Success metric

100% tám scene đi được bằng mobile touch và keyboard; không console error trong một lượt hoàn chỉnh.
