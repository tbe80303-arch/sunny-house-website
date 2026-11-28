import {roadmaps} from './course-roadmaps.js';
import {courseFees} from './course-fees.js';
import {teacherRoadmap} from './teacher-roadmap.js';

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

const cambridge = (key, textbook, overview) => ({
  textbook: textbook + ' – Oxford University Press, Second Edition',
  overview,
  feeSections: courseFees[key],
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
    'Chương trình Pre-A1 gồm phần Hello, 15 chủ đề và 3 phần ôn tập, kết hợp luyện bốn kỹ năng theo định dạng Cambridge Starters.'),
  movers: cambridge('movers', 'Get Ready for Movers',
    'Chương trình A1 gồm phần Introduction, 12 Unit và 3 phần ôn tập theo định dạng Cambridge Movers. Nội dung đối chiếu với Vocabulary & Grammar Index của Oxford.'),
  flyers: cambridge('flyers', 'Get Ready for Flyers',
    'Chương trình A2 gồm phần Introduction, 12 Unit và 3 phần ôn tập theo định dạng Cambridge Flyers. Nội dung đối chiếu với Vocabulary & Grammar Index của Oxford.'),
  conversation: {
    name: 'Tiếng Anh giao tiếp cho giáo viên',
    overview: 'Lộ trình thực hành tiếng Anh để giao tiếp hằng ngày, điều hành lớp học và trao đổi với phụ huynh, đồng nghiệp.',
    feeSections: courseFees.conversation,
    feeNote: 'Dấu — đánh dấu ô chưa có thông tin trong bảng English for Work. Lịch học linh động, vui lòng liên hệ trung tâm để thống nhất ngày và giờ.',
    roadmapNote: 'Lộ trình đề xuất gồm 12 buổi mỗi tháng. Gói tháng bắt đầu với 12 buổi đầu, gói 6 tháng gồm 72 buổi và có thể điều chỉnh theo mục tiêu giảng dạy.',
    stages: teacherRoadmap
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
