import {roadmaps} from './course-roadmaps.js';

const sessions = (start, lessons) => lessons.map(([title, ...lines], index) => ({
  title: 'Buổi ' + (start + index) + ' · ' + title,
  lines
}));

const fixedFees = amount => [
  ['Số buổi', '16 buổi'],
  ['Lịch học', '2 buổi/tuần trong 8 tuần'],
  ['Học phí', amount + '/16 buổi'],
  ['Thời điểm thu học phí', 'Buổi thứ 12']
];

const cambridge = (key, textbook, overview, fees) => ({
  textbook: textbook + ' – Oxford University Press, Second Edition',
  overview,
  fees,
  ...roadmaps[key]
});

const globalSuccess = grade => ({
  name: 'Global Success lớp ' + grade,
  textbook: 'Tiếng Anh ' + grade + ' Global Success',
  overview: 'Lộ trình 16 buổi bám sát 12 Unit trong hai học kỳ. Mỗi buổi theo chủ đề kết hợp từ vựng, ngữ pháp, phát âm và vận dụng; sau mỗi ba Unit có một buổi ôn tập.',
  fees: fixedFees('1.280.000đ'),
  stages: roadmaps['global-' + grade]
});

export const courses = {
  starters: cambridge('starters', 'Get Ready for Starters',
    'Chương trình Pre-A1 gồm phần Hello, 15 chủ đề và 3 phần ôn tập, kết hợp luyện bốn kỹ năng theo định dạng Cambridge Starters.',
    [
      ['Sĩ số tối đa', '3 học sinh', '6 học sinh'],
      ['Số buổi', '8 buổi', '8 buổi'],
      ['Thời lượng', '75 phút/buổi', '75 phút/buổi'],
      ['Học phí', '1.500.000đ', '1.000.000đ'],
      ['Sửa bài không giới hạn', 'Có', 'Có'],
      ['Kèm riêng 1:1 khi cần', 'Có', 'Có'],
      ['Tài liệu Global Success bổ trợ thường xuyên', 'Có', '—'],
      ['Tài liệu luyện 4 kỹ năng', 'Tài liệu bổ trợ', 'Theo lộ trình Starters'],
      ['Tài khoản website luyện đề Starters, IOE và Global Success', 'Có', '—']
    ]),
  movers: cambridge('movers', 'Get Ready for Movers',
    'Chương trình A1 gồm phần Introduction, 12 Unit và 3 phần ôn tập theo định dạng Cambridge Movers. Nội dung đối chiếu với Vocabulary & Grammar Index của Oxford.',
    [
      ['Sĩ số tối đa', '8 học sinh', '3 học sinh'],
      ['Số buổi', '16 buổi', '16 buổi'],
      ['Thời lượng', '105 phút/buổi', '105 phút/buổi'],
      ['Học phí', '1.200.000đ', '3.200.000đ'],
      ['Học phí/buổi', '75.000đ', '200.000đ']
    ]),
  flyers: cambridge('flyers', 'Get Ready for Flyers',
    'Chương trình A2 gồm phần Introduction, 12 Unit và 3 phần ôn tập theo định dạng Cambridge Flyers. Nội dung đối chiếu với Vocabulary & Grammar Index của Oxford.',
    [
      ['Sĩ số tối đa', '8 học sinh', '3 học sinh'],
      ['Số buổi', '16 buổi', '16 buổi'],
      ['Thời lượng', '105 phút/buổi', '105 phút/buổi'],
      ['Học phí', '1.400.000đ', '3.750.000đ'],
      ['Học phí/buổi', '87.500đ', '234.375đ']
    ]),
  conversation: {
    name: 'Tiếng Anh giao tiếp cho giáo viên',
    overview: 'Lộ trình thực hành tiếng Anh để giao tiếp hằng ngày, điều hành lớp học và trao đổi với phụ huynh, đồng nghiệp.',
    stages: [
      {title: 'Giao tiếp hằng ngày', units: sessions(1, [
        ['My Daily Routine', 'Dựa trên bài mẫu, luyện hiện tại đơn và cách kể lịch sinh hoạt theo trình tự.', 'Viết một đoạn về thói quen hằng ngày, sau đó kể lại và hỏi đáp theo cặp.'],
        ['My Teaching Day', 'Giới thiệu môn dạy, lịch học và các công việc chuẩn bị bài. Luyện hỏi giờ và sắp lịch.', 'Thực hành trao đổi lịch dạy với đồng nghiệp và ghi lại các mốc giờ.']
      ])},
      {title: 'Tiếng Anh trong lớp học', units: sessions(3, [
        ['Starting and Closing a Lesson', 'Chào lớp, điểm danh, giới thiệu mục tiêu và chốt nội dung.', 'Dẫn phần mở đầu và kết thúc một tiết học ngắn.'],
        ['Giving Clear Instructions', 'Dùng mệnh lệnh và các từ first, next, finally để hướng dẫn từng bước.', 'Hướng dẫn một hoạt động theo nhóm và dùng câu hỏi ngắn để kiểm tra học sinh đã hiểu.'],
        ['Asking Questions and Encouraging Answers', 'Luyện câu hỏi mở, câu hỏi tiếp nối và cách mời học sinh ít nói tham gia.', 'Đóng vai tổ chức thảo luận và cho học sinh thời gian suy nghĩ.'],
        ['Managing Classroom Routines', 'Chia nhóm, chuyển hoạt động, nhắc thời gian và xử lý việc mất tập trung bằng lời nhắc lịch sự.', 'Mô phỏng một hoạt động theo cặp từ lúc giao nhiệm vụ đến khi thu bài.'],
        ['Giving Feedback', 'Khen cụ thể, gợi ý sửa lỗi và hướng dẫn học sinh tự sửa.', 'Góp ý một bài nói hoặc bài viết bằng mẫu câu ngắn, dễ hiểu.']
      ])},
      {title: 'Trao đổi chuyên môn và dạy thử', units: sessions(8, [
        ['Talking with Parents', 'Mô tả tiến bộ, nêu điểm cần luyện và đề xuất việc có thể làm ở nhà.', 'Đóng vai buổi trao đổi với phụ huynh và viết tin nhắn tóm tắt.'],
        ['Working with Colleagues', 'Chia sẻ ý tưởng, đề nghị hỗ trợ, hẹn họp và xác nhận phân công.', 'Cùng chuẩn bị một hoạt động và trình bày kế hoạch cho đồng nghiệp.'],
        ['Microteaching', 'Dạy thử một phần bài bằng tiếng Anh với mở bài, hướng dẫn, kiểm tra mức độ hiểu và phản hồi.', 'Nhận góp ý về phát âm, độ rõ của chỉ dẫn và cách tương tác, rồi thực hành lại.']
      ])}
    ]
  },
  'global-6': globalSuccess(6),
  'global-7': globalSuccess(7),
  'kids-debate': {
    name: 'Kids Debate',
    overview: 'Trong 16 buổi, học viên luyện nêu ý kiến, giải thích bằng lý do và ví dụ, lắng nghe, phản biện lịch sự và tranh biện theo đội bằng tiếng Anh.',
    fees: fixedFees('2.400.000đ'),
    stages: [
      {title: 'My Opinion · Nêu ý kiến', units: sessions(1, [
        ['Express Your Opinion', 'Phân biệt ý kiến với sự việc. Dùng “I think…” và “In my opinion…” để nói về một lựa chọn yêu thích.'],
        ['Choose a Side', 'Chọn đồng ý hoặc không đồng ý với một chủ đề quen thuộc, rồi nói trong 30 giây.'],
        ['Listen and Restate', 'Nghe bạn trình bày, nhắc lại đúng ý bằng “You think that…” và hỏi thêm một câu.']
      ])},
      {title: 'Give Reasons · Đưa lý do và ví dụ', units: sessions(4, [
        ['Give a Reason', 'Dùng “because” để nêu lý do. Làm việc theo cặp và chọn lý do thuyết phục cho một đề xuất ở trường.'],
        ['Support Your Claim', 'Dùng “For example…” để minh họa. Kiểm tra ví dụ có liên quan đến luận điểm hay không.'],
        ['Build a Short Argument', 'Luyện trình bày ý kiến, lý do, ví dụ và nhắc lại quan điểm. Mỗi học viên trình bày trong một phút.']
      ])},
      {title: 'Agree and Disagree · Đối thoại và phản biện', units: sessions(7, [
        ['Disagree Politely', 'Dùng “I see your point, but…” để phản hồi ý kiến. Thảo luận việc trẻ có nên có điện thoại riêng.'],
        ['Ask Useful Questions', 'Đặt câu hỏi yêu cầu làm rõ hoặc đưa ví dụ khi tranh luận việc sở thú có nên tồn tại.'],
        ['Reply to a Counterargument', 'Tóm tắt luận điểm đối phương và trả lời bằng một lý do cụ thể. Tranh luận thành phố và nông thôn.']
      ])},
      {title: 'Think Both Sides · Xem xét hai phía', units: sessions(10, [
        ['Compare the Pros and Cons', 'Dùng “On the one hand… On the other hand…” để phân tích giờ vào học.'],
        ['Switch Sides', 'Đổi vai giữa hai đội trong chủ đề học trực tuyến và học tại lớp. Mỗi đội trình bày ưu điểm và hạn chế.'],
        ['Suggest a Compromise', 'Thảo luận cách giảm túi nhựa ở trường. Đưa một giải pháp và giải thích tác động với các bên.']
      ])},
      {title: 'Young Debaters · Tranh biện theo đội', units: sessions(13, [
        ['Plan a Team Debate', 'Chọn chủ đề, phân vai mở đầu, phản biện và kết luận. Lập ba luận điểm với ví dụ.'],
        ['Practise Cross-Questions', 'Soạn hai câu hỏi cho đội đối phương. Luyện trả lời ngắn, có lý do và đúng thời gian.'],
        ['Rehearse and Improve', 'Tranh biện thử, nhận góp ý về lập luận, phát âm, lắng nghe và làm việc nhóm.'],
        ['Final Debate Competition', 'Thực hiện trận tranh biện bằng tiếng Anh gồm mở đầu, luận điểm, hỏi đáp, phản biện và kết luận.']
      ])}
    ]
  }
};
