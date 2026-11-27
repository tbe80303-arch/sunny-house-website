# SUNNY HOUSE

Website tiếng Việt dùng Cloudflare Pages, Pages Functions, D1 và R2. Thư mục `public/` chứa giao diện và MP3. `server/bank.js` chứa đáp án để chấm bên máy chủ. Nội dung biên soạn nằm trong `scripts/*.txt`.

## Chạy cục bộ

Cần Node.js 22 trở lên và npm. FFmpeg với libflite và ffprobe được dùng để tạo và kiểm tra âm thanh.

```bash
npm ci
npm run db:local
npm run dev
```

Mở `http://localhost:8788`. Đăng ký từng tài khoản học viên. Phụ huynh có thể giữ email và mật khẩu riêng của từng trẻ và đổi mật khẩu trong trang Tài khoản. Đổi mật khẩu sẽ đăng xuất các thiết bị khác. Tài khoản đăng ký mới có quyền học viên.

```bash
npm test
npm run test:integration
```

Chạy bài tích hợp khi máy chủ cục bộ đang hoạt động. Bài tích hợp tạo tài khoản, lớp, bài nộp và yêu cầu tư vấn giả trong D1 cục bộ. Thao tác cấp quyền trong bài kiểm thử chỉ chạy với D1 cục bộ.

## Triển khai production

1. Tạo hoặc chọn repository **riêng tư** của trung tâm trên GitHub. Thêm remote `origin` cho repository này và đẩy nhánh `main`. Repository chứa đáp án.
2. Trong Cloudflare Dashboard, vào **Workers & Pages → Create application → Pages → Connect to Git**. Cấp quyền GitHub cho đúng repository, chọn nhánh production `main`, chọn cấu hình không dùng framework, đặt **Build output directory** là `public`. Không cần chạy lệnh build. Các lần đẩy lên `main` tiếp theo tự triển khai.
3. Trong Cloudflare, tạo một D1 database tên `sunny-house` và một R2 bucket riêng tư tên `sunny-house-files`. Thay `database_id` mẫu trong `wrangler.toml` bằng ID của D1 thật. Kiểm tra **Settings → Bindings** của Pages có D1 tên binding `DB` và R2 tên binding `FILES` trỏ tới đúng tài nguyên. Dùng tài nguyên riêng cho preview nếu bật preview.
4. Trên máy được chủ tài khoản đăng nhập qua `npx wrangler login`, chạy `npx wrangler d1 migrations apply DB --remote` và đẩy cấu hình đã cập nhật lên `main`. Giữ nguyên database và bucket qua các lần triển khai. Mọi thay đổi cấu trúc tiếp theo dùng migration mới.
5. Mở URL Pages do Dashboard trả về. Thử đăng ký tài khoản kiểm thử, nghe một tệp âm thanh, lưu bài để mở lại bằng phiên đăng nhập khác và gửi một form tư vấn thử. Xóa dữ liệu thử qua Dashboard khi hoàn thành kiểm tra trực tiếp.

### Cấp quyền cho MR Thủy

MR Thủy tự đăng ký tài khoản bằng email do mình quản lý. Chủ Cloudflare xác minh địa chỉ vừa dùng rồi chạy câu SQL sau trong **D1 → Console** của database production:

```sql
UPDATE users SET role = 'teacher'
WHERE email = 'EMAIL_GIAO_VIEN_DA_XAC_MINH';

SELECT email, role FROM users WHERE email = 'EMAIL_GIAO_VIEN_DA_XAC_MINH';
```

Giáo viên mở **Tài khoản → Quản lý lớp**. Tạo lớp theo cấp độ, thêm học viên bằng email tài khoản, rồi tạo bản nháp cho buổi học. Chọn một bộ có sẵn hoặc tự soạn. Để thêm câu nghe tự soạn, tải MP3 lên buổi học trước, chọn tệp trong câu hỏi và điền transcript. Lưu bản nháp, mở phần xem trước rồi xuất bản. Trong cùng buổi, mở bài nộp để phản hồi và đặt ngày giờ mở đáp án. Giáo viên có thể giao cho cả lớp hoặc chọn một học viên đã thuộc lớp.

### Google Sheets và email tư vấn

1. Chủ trung tâm tạo một bảng tính riêng tư rồi mở **Extensions → Apps Script**. Dán nội dung `scripts/Leads.gs`. Trong **Project settings → Script properties**, tạo `LEADS_SHEET_ID` với ID của bảng tính và `LEADS_WEBHOOK_SECRET` với một giá trị ngẫu nhiên dài.
2. Chọn **Deploy → New deployment → Web app**, chạy bằng tài khoản sở hữu bảng và cho phép endpoint nhận yêu cầu từ Cloudflare. Ứng dụng kiểm tra secret trước khi ghi. Cấp quyền truy cập bảng và gửi email cho Apps Script bằng tài khoản chủ sở hữu.
3. Trong Pages **Settings → Variables and Secrets**, lưu URL `/exec` dưới tên `LEADS_WEBHOOK` và giá trị tương ứng dưới tên `LEADS_WEBHOOK_SECRET`. Sau khi triển khai, gửi một yêu cầu thử và xác nhận cùng một ID xuất hiện một lần trong bảng và có email báo tới `lathuy32@gmail.com`.
4. Khi tích hợp chưa phản hồi, bản ghi vẫn ở D1. Trong **Quản lý lớp → Yêu cầu tư vấn**, dùng **Thử đồng bộ lại**. Apps Script dùng ID để tìm hàng đã ghi và dùng dấu thời gian để theo dõi email đã gửi. Nếu tiến trình bị gián đoạn đúng sau khi hệ thống email nhận lệnh gửi nhưng trước khi bảng lưu thời gian, việc thử lại có thể gửi thông báo hai lần.

## Phạm vi cần hoàn thiện trước khi bàn giao production

- Trang Starters dựa trên Google Doc **STARTERS** của SUNNY HOUSE. Cần đối chiếu với tệp Word chính thức khi nhận được. Trang Movers và Flyers chờ nội dung và học phí từ tệp Word đó. Trang chủ dùng chân dung MR Thủy từ ảnh tốt nghiệp do người dùng cung cấp, đã tách nền. Các ảnh mẫu bố cục vẫn cần được cung cấp.
- 30 bài luyện là bài ngắn 5 câu, gồm Nghe, Đọc và Viết. Cần biên soạn thêm câu, tranh và kiểu bài để đạt 15–20 phút mỗi đề. 30 bộ trên lớp hiện là các hoạt động ngắn có mục tiêu, từ vựng, hai câu chấm tự động và bài vận dụng. MP3 tiếng Anh dùng giọng tổng hợp Flite, đổi giọng theo lượt hội thoại. Hướng dẫn tiếng Việt cho mầm non là tệp MP3 riêng.
- Kiểm thử cục bộ đã chạy cho D1, R2, xác thực, khóa bài, tiếp tục trên thiết bị khác, chống nộp trùng, giáo viên và form tư vấn. Phiên kiểm thử trình duyệt chưa mở được qua relay nên các kích thước 360, 390, 768 px và thao tác chạm ba game cần nghiệm thu trên trình duyệt. Production, Google Sheets và gửi email cần quyền của chủ dịch vụ trước khi kiểm tra đầu-cuối.
