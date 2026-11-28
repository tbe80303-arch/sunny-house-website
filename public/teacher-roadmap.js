import { dailyRoutine } from './teacher-reading.js';

const months = [
  ['Giao tiếp hằng ngày và tiếng Anh trong lớp học', [
    ['My Daily Routine', 'Hiện tại đơn, trạng từ tần suất và từ nối trình tự. Đọc bài gốc rồi gạch chân các mốc thời gian và hoạt động.', 'Dịch bài đọc sang tiếng Anh, viết một đoạn về lịch của mình và kể lại bằng lời. Dùng “I usually wake up at six” và “After that, I…”.'],
    ['My Teaching Day', 'Tên môn học, ca dạy, chuẩn bị bài, chấm bài và các cụm chỉ giờ. Phân biệt “at seven”, “on Mondays” và “in the afternoon”.', 'Giới thiệu một ngày dạy của mình. Hỏi đồng nghiệp “What time does your first class start?” và ghi lại lịch hai người.'],
    ['Introducing Yourself', 'Tên, môn dạy, kinh nghiệm, đối tượng học viên và mục tiêu nghề nghiệp. Luyện nối ý bằng “and”, “but” và “because”.', 'Nói một phút trước lớp, sau đó viết phần giới thiệu ngắn để dùng trong buổi gặp phụ huynh.'],
    ['Starting a Lesson', 'Chào lớp, điểm danh và nêu mục tiêu với “Who’s absent today?” và “By the end of this lesson, you’ll be able to…”.', 'Mô phỏng ba phút mở đầu tiết học có câu hỏi khởi động và mục tiêu rõ ràng.'],
    ['Giving Clear Instructions', 'Câu mệnh lệnh và trình tự “First… Next… Finally…”. Phân biệt chỉ dẫn với giải thích dài.', 'Hướng dẫn một trò chơi từ vựng, làm mẫu một lượt và hỏi “What do you do first?” để kiểm tra.'],
    ['Asking Questions', 'Câu hỏi yes/no, câu hỏi Wh- và câu hỏi nối tiếp như “Can you tell me more?”.', 'Soạn câu hỏi từ dễ đến khó cho một đoạn đọc. Mời học viên trả lời và cho thời gian suy nghĩ.'],
    ['Managing Classroom Routines', 'Chia cặp, đổi nhóm, phát tài liệu, nhắc thời gian và chuyển hoạt động. Luyện “Work in pairs” và “You have two minutes left”.', 'Điều hành một hoạt động nhóm từ lúc phát tài liệu đến lúc thu bài.'],
    ['Giving Feedback', 'Khen cụ thể, nhắc lỗi và khuyến khích tự sửa. Luyện “Your example is clear” và “Can you check the verb tense?”.', 'Phản hồi một câu nói và một đoạn viết. Nêu một điểm mạnh, một điểm cần sửa và một bước luyện tiếp.'],
    ['Closing a Lesson', 'Tóm tắt ý chính, giao bài tập và kiểm tra điều học viên ghi nhớ.', 'Kết thúc một tiết học bằng câu hỏi “What did you learn today?” và viết hướng dẫn bài tập về nhà.'],
    ['Talking with Parents', 'Diễn đạt tiến bộ và nhu cầu luyện tập bằng ngôn ngữ dễ hiểu. Luyện “She is making progress in…” và “At home, you can…”.', 'Đóng vai trao đổi với phụ huynh và viết tin nhắn xác nhận nội dung vừa thống nhất.'],
    ['Working with Colleagues', 'Hẹn họp, đề nghị hỗ trợ, xác nhận lịch và phân công với “Could we meet on…?” và “I’ll prepare…”.', 'Cùng chuẩn bị một hoạt động rồi gửi tin nhắn chốt người phụ trách, thời điểm và tài liệu cần mang.'],
    ['Microteaching', 'Kết hợp mở bài, hướng dẫn, đặt câu hỏi, phản hồi và giao bài tập.', 'Dạy thử một đoạn ngắn. Ghi lại hai điểm cần sửa sau khi nhận phản hồi và dạy lại đoạn chỉ dẫn.']
  ]],
  ['Điều hành hoạt động và hỗ trợ học viên', [
    ['Classroom Objects and Spaces', 'Từ vựng về bàn ghế, bảng, thiết bị và giới từ vị trí.', 'Hướng dẫn chuẩn bị phòng học và vị trí đặt tài liệu.'],
    ['Setting Classroom Rules', 'Diễn đạt quy tắc với “must”, “mustn’t” và “please”.', 'Viết bảng quy tắc lớp và giải thích lý do cho từng quy tắc.'],
    ['Building a Warm-up', 'Câu hỏi gợi nhớ kiến thức và chỉ dẫn trò chơi ngắn.', 'Dẫn hoạt động khởi động với tín hiệu bắt đầu, dừng và chuyển bài.'],
    ['Using the Board', 'Cụm từ chỉ hướng và bố cục nội dung trên bảng.', 'Hướng dẫn chép bài, khoanh đáp án và đối chiếu với từ khóa.'],
    ['Running Pair Work', 'Cách chia vai A/B, đổi lượt và đặt giới hạn thời gian.', 'Tổ chức hỏi đáp theo cặp và giải thích việc mỗi vai cần làm.'],
    ['Group Projects', 'Từ vựng về phân công, thời hạn và sản phẩm nhóm.', 'Giao một dự án áp phích, thống nhất vai trò và kiểm tra tiến độ.'],
    ['Checking Understanding', 'Câu hỏi kiểm tra chỉ dẫn và câu hỏi kiểm tra khái niệm.', 'Viết câu hỏi kiểm tra cho ba hoạt động và đóng vai xử lý khi lớp hiểu sai.'],
    ['Supporting Mixed Levels', 'Mẫu câu gợi ý, cho thêm thời gian và giao nhiệm vụ mở rộng.', 'Chuẩn bị hai phiên bản của cùng một nhiệm vụ và giải thích lựa chọn cho học viên.'],
    ['Helping a Hesitant Learner', 'Ngôn ngữ động viên, chia nhỏ câu hỏi và tạo khoảng chờ.', 'Đóng vai hỗ trợ một học viên chưa sẵn sàng nói trước lớp.'],
    ['Handling Interruptions', 'Lời nhắc lịch sự, cụm xin phép và cách đưa lớp về nhiệm vụ.', 'Xử lý một tình huống chen lời và một tình huống nhóm mất tập trung.'],
    ['Managing Online Lessons', 'Ngôn ngữ dùng mic, chat, chia sẻ màn hình và phòng nhóm.', 'Dẫn một hoạt động trực tuyến có phương án khi học viên mất tiếng.'],
    ['Classroom Management Practice', 'Ôn chỉ dẫn, chia nhóm, kiểm tra hiểu và xử lý gián đoạn.', 'Dạy thử một hoạt động và tự đánh giá độ rõ của từng chỉ dẫn.']
  ]],
  ['Giải thích bài học và phản hồi', [
    ['Introducing Vocabulary', 'Giải thích nghĩa bằng tranh, ví dụ và câu hỏi gợi đoán.', 'Dạy một nhóm từ mới rồi kiểm tra học viên dùng đúng ngữ cảnh.'],
    ['Teaching Pronunciation', 'Âm cuối, trọng âm từ và cách chỉ dẫn khẩu hình bằng lời đơn giản.', 'Làm mẫu, luyện đồng thanh và giúp học viên tự nhận ra một lỗi phát âm.'],
    ['Explaining Grammar', 'Ngôn ngữ nói về hình thức, ý nghĩa và cách dùng của cấu trúc.', 'Dùng hai câu ví dụ để giải thích sự khác nhau giữa thói quen và việc đang diễn ra.'],
    ['Preparing a Listening Task', 'Dự đoán nội dung, nghe ý chính và nghe lấy chi tiết.', 'Viết ba lượt chỉ dẫn cho một bài nghe và sắp câu hỏi theo mục tiêu.'],
    ['Guiding Reading', 'Đọc lướt, tìm chi tiết và suy nghĩa theo ngữ cảnh.', 'Điều hành bài đọc có câu hỏi trước, trong và sau khi đọc.'],
    ['Setting Up Speaking Tasks', 'Khung nói, mẫu câu và cách quy định số lượt trao đổi.', 'Làm mẫu một hội thoại và cho học viên tạo biến thể theo cặp.'],
    ['Teaching Paragraph Writing', 'Câu chủ đề, câu hỗ trợ, từ nối và câu kết.', 'Hướng dẫn lập dàn ý, viết nháp và tự kiểm tra một đoạn văn.'],
    ['Giving Written Feedback', 'Cách chỉ lỗi về từ, ngữ pháp, chính tả và mạch ý.', 'Nhận xét một bài mẫu và gợi ý người viết chỉnh lại hai câu.'],
    ['Correcting Spoken Errors', 'Phản hồi ngay hoặc sau hoạt động tùy mục tiêu nói.', 'Đóng vai hai kiểu sửa lỗi và chọn cách phù hợp cho từng tình huống.'],
    ['Designing a Short Quiz', 'Câu hỏi trắc nghiệm, điền từ và đáp án mẫu.', 'Viết bài kiểm tra ngắn, thử làm và sửa chỉ dẫn dễ gây hiểu nhầm.'],
    ['Reporting Progress', 'Dẫn chứng cụ thể về tiến bộ và đặt một mục tiêu tiếp theo.', 'Viết nhận xét ngắn cho hai hồ sơ học viên giả định.'],
    ['Skills Lesson Practice', 'Ôn hướng dẫn bốn kỹ năng và phản hồi bài.', 'Soạn một hoạt động có đầu vào, phần thực hành và tiêu chí đánh giá.']
  ]],
  ['Trao đổi với phụ huynh và nhà trường', [
    ['Greeting Parents', 'Mở đầu cuộc gặp, giới thiệu vai trò và xác nhận mục đích trao đổi.', 'Đóng vai buổi gặp đầu tiên và đặt câu hỏi về mục tiêu học.'],
    ['Discussing Strengths', 'Miêu tả quan sát bằng ví dụ cụ thể về nghe, nói, đọc hoặc viết.', 'Giải thích một điểm mạnh và dẫn lại một sản phẩm học tập.'],
    ['Discussing Concerns', 'Nêu vấn đề bằng “I’ve noticed…” và đặt câu hỏi tìm nguyên nhân.', 'Trao đổi một vấn đề về tham gia lớp và cùng thống nhất bước tiếp theo.'],
    ['Suggesting Home Practice', 'Mẫu câu đề xuất, thời lượng và tần suất luyện tập.', 'Soạn ba hoạt động ngắn tại nhà có hướng dẫn rõ ràng.'],
    ['Attendance and Make-up Lessons', 'Xác nhận vắng học, hỏi lịch trống và đề nghị phương án học bù.', 'Viết tin nhắn xác nhận lại ngày, giờ và nội dung cần hoàn thành.'],
    ['Writing Parent Updates', 'Cấu trúc tin nhắn gồm mục đích, thông tin chính và việc cần làm.', 'Soạn thông báo về bài tập, tài liệu mang theo và hạn nộp.'],
    ['Parent–Teacher Conference', 'Quản lý lượt nói, diễn giải nhận xét và ghi lại cam kết.', 'Mô phỏng cuộc trao đổi có mở đầu, dẫn chứng, câu hỏi và phần chốt.'],
    ['Talking to School Staff', 'Cách xin hỗ trợ thiết bị, tài liệu hoặc đổi phòng.', 'Thực hành trao đổi với đồng nghiệp và xác nhận yêu cầu bằng email.'],
    ['Planning a School Event', 'Ngôn ngữ về chương trình, người phụ trách, địa điểm và phương án dự phòng.', 'Thông báo một sự kiện lớp và phân vai trong cuộc họp ngắn.'],
    ['Handling Difficult Questions', 'Mẫu câu xác nhận đã hiểu, xin thời gian kiểm tra và giải thích lựa chọn.', 'Đóng vai trả lời thắc mắc về tiến độ hoặc khối lượng bài tập.'],
    ['Writing a Follow-up Email', 'Tiêu đề email, tóm tắt quyết định, hẹn phản hồi và kết thư lịch sự.', 'Viết email sau cuộc họp phụ huynh theo các điểm đã thống nhất.'],
    ['Parent Communication Practice', 'Ôn thông báo, tư vấn và trả lời câu hỏi phát sinh.', 'Thực hiện chuỗi gặp trực tiếp, gửi cập nhật và thống nhất lịch theo dõi.']
  ]],
  ['Tiếng Anh công việc và phát triển chuyên môn', [
    ['Professional Introductions', 'Mô tả trách nhiệm, thế mạnh và nhóm học viên thường dạy.', 'Giới thiệu mình với một đồng nghiệp mới bằng hai mức độ trang trọng.'],
    ['Scheduling and Rescheduling', 'Đề xuất khung giờ, hỏi lịch trống và xác nhận múi giờ nếu cần.', 'Đổi lịch một cuộc họp và gửi lời xác nhận ngắn.'],
    ['Giving a Team Update', 'Cách báo cáo việc đã xong, việc đang làm và việc cần hỗ trợ.', 'Trình bày cập nhật hai phút trong buổi họp tổ chuyên môn.'],
    ['Sharing Lesson Plans', 'Giải thích mục tiêu, tiến trình, tài liệu và cách đánh giá.', 'Trình bày giáo án rồi trả lời câu hỏi của đồng nghiệp.'],
    ['Co-teaching', 'Phân vai, chuyển lượt, nhắc tín hiệu và hỗ trợ nhau trong lớp.', 'Soạn và thử một đoạn dạy chung có điểm chuyển vai rõ.'],
    ['Observing a Lesson', 'Ghi lại hành vi quan sát được và diễn đạt nhận xét trung tính.', 'Viết ghi chú dự giờ và đặt hai câu hỏi để trao đổi sau tiết học.'],
    ['Peer Feedback', 'Nêu điểm hiệu quả, tác động và một đề xuất có thể thử.', 'Trao đổi góp ý theo cặp dựa trên ghi chú quan sát.'],
    ['Leading a Short Meeting', 'Mở họp, chuyển mục, mời phát biểu và chốt việc cần làm.', 'Điều hành cuộc họp ngắn và gửi phần tóm tắt quyết định.'],
    ['Writing Teaching Materials', 'Giọng văn rõ ràng, ví dụ nhất quán và từ vựng phù hợp trình độ.', 'Viết phiếu học tập có hướng dẫn, ví dụ và tiêu chí hoàn thành.'],
    ['Presenting a Teaching Idea', 'Cách giới thiệu vấn đề, giải pháp, ví dụ thực tế và giới hạn.', 'Thuyết trình ngắn về một hoạt động rồi trả lời câu hỏi.'],
    ['Responding to Professional Email', 'Xác nhận yêu cầu, xin thông tin bổ sung và hẹn phản hồi.', 'Viết phản hồi cho yêu cầu tài liệu và một đề nghị hợp tác.'],
    ['Team Communication Practice', 'Ôn giới thiệu, báo cáo, họp và phản hồi chuyên môn.', 'Mô phỏng họp tổ, thống nhất thử một hoạt động và ghi biên bản ngắn.']
  ]],
  ['Vận dụng, dạy thử và đánh giá cuối lộ trình', [
    ['Reviewing Personal Goals', 'Đối chiếu mục tiêu với bài nói và bài viết đã thực hiện.', 'Chọn hai điểm cần cải thiện và lập kế hoạch luyện tập cho phần cuối khóa.'],
    ['Improving Clarity and Pace', 'Nhịp nói, ngắt câu, nhấn từ khóa và giảm câu chỉ dẫn quá dài.', 'Thu âm một chỉ dẫn, nghe lại và ghi âm phiên bản đã chỉnh.'],
    ['Planning a Complete Lesson', 'Xác định mục tiêu, hoạt động mở đầu, thực hành và kiểm tra.', 'Viết giáo án ngắn có thời gian dự kiến và phương án khi học viên chưa hiểu.'],
    ['Creating a Lesson Handout', 'Sắp xếp bài tập từ dễ đến khó và dùng từ nối rõ ràng.', 'Thiết kế phiếu học tập và nhờ bạn thực hiện thử theo chỉ dẫn.'],
    ['Handling Unexpected Situations', 'Mẫu câu điều chỉnh hoạt động khi thiếu thời gian, thiết bị hoặc tài liệu.', 'Đóng vai xử lý hai tình huống phát sinh bằng tiếng Anh.'],
    ['Teaching a Speaking Segment', 'Gợi ý câu trả lời, chia lượt và sửa lỗi sau khi học viên nói.', 'Dạy thử một hoạt động nói có phần phản hồi cuối.'],
    ['Teaching a Reading Segment', 'Hướng dẫn dự đoán, tìm chi tiết và giải thích lựa chọn.', 'Dạy thử bài đọc với câu hỏi kiểm tra ở từng bước.'],
    ['Preparing a Parent Report', 'Chọn dẫn chứng, nêu mục tiêu tiếp theo và đề xuất cách luyện tại nhà.', 'Viết báo cáo ngắn và trình bày lại bằng lời.'],
    ['Rehearsing the Final Lesson', 'Kiểm tra trình tự, sự rõ ràng và thời lượng của từng hoạt động.', 'Dạy thử, nhận góp ý và cập nhật giáo án.'],
    ['Final Microteaching', 'Vận dụng mở bài, chỉ dẫn, câu hỏi, tương tác và phản hồi.', 'Dạy một đoạn bài hoàn chỉnh và trả lời câu hỏi về lựa chọn hoạt động.'],
    ['Reviewing the Writing Portfolio', 'Đối chiếu bản nháp và bản chỉnh sửa của email, nhận xét hoặc phiếu học tập.', 'Chọn sản phẩm tiêu biểu và giải thích những điểm đã cải thiện.'],
    ['Final Review and Next Steps', 'Tổng kết kỹ năng giao tiếp trong lớp và ở nơi làm việc.', 'Đối chiếu đầu ra với mục tiêu cá nhân và lập kế hoạch tiếp tục luyện.']
  ]]
];

export const teacherRoadmap = months.map(([title, lessons], month) => ({
  title: 'Tháng ' + (month + 1) + ' · ' + title,
  units: lessons.map(([topic, focus, practice], index) => ({
    title: 'Buổi ' + (month * 12 + index + 1) + ' · ' + topic,
    lines: [
      'Nội dung: ' + focus,
      ...(month === 0 && index === 0 ? dailyRoutine : []),
      'Thực hành và đầu ra: ' + practice
    ]
  }))
}));
