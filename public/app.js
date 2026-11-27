import {catalog,vocab,sample} from './content.js';
import {courses as courseData} from './courses.js';
const $=(selector,root=document)=>root.querySelector(selector);
const main=$('#main');
const names={starters:'Pre A1 Starters',movers:'A1 Movers',flyers:'A2 Flyers',preschool:'Mầm non',primary:'Tiểu học',middle:'THCS',high:'THPT',college:'Sinh viên',work:'Người đi làm'};
const stages=['starters','movers','flyers'];
const groups=['preschool','primary','middle','high','college','work'];
const courseNames={...Object.fromEntries(Object.entries(courseData).map(([key,course])=>[key,course.name||names[key]])),one:'Kèm 1–1',undecided:'Nhờ Ms Thủy xác định trình độ'};
const turn=()=>location.hash.slice(1).split('/');
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const select=(values,labels,selected)=>values.map(key=>'<option value="'+esc(key)+'" '+(key===selected?'selected':'')+'>'+esc(labels[key]??key)+'</option>').join('');
const button=(href,label,theme='')=>'<a class="btn '+theme+'" href="#'+href+'">'+label+'</a>';
const section=(title,inner,intro='')=>'<section class="section"><div class="wrap"><h1>'+title+'</h1>'+(intro?'<p class="intro">'+intro+'</p>':'')+inner+'</div></section>';
const audio=(src,label='Bài nghe')=>'<audio controls preload="none" aria-label="'+esc(label)+'" src="'+esc(src)+'"></audio>';
const credentials='<div class="credentials"><div><strong>Ngôn ngữ Anh</strong><span>Trường Đại học Công nghiệp</span></div><div><strong>TESOL</strong><span>Chứng chỉ giảng dạy tiếng Anh</span></div><div><strong>CHỨNG CHỈ NGHIỆP VỤ SƯ PHẠM CẤP 1</strong></div><div><strong>CHỨNG CHỈ NGHIỆP VỤ SƯ PHẠM CẤP 2</strong></div><div><strong>Hơn 6 năm</strong><span>Dạy trẻ em và tiếng Anh giao tiếp cho người đi làm</span></div></div>';
let state={user:null,unlocked:false};
let view=0;
let lastResult=null;
let afterAuth='';
let cleanup=()=>{};
async function api(path,data,raw) {
  const res=await fetch('/api/'+path, data===undefined&&!raw?{}:raw?{method:'POST',body:raw,headers:{'Content-Type':raw.type}}:{method:'POST',body:JSON.stringify(data),headers:{'Content-Type':'application/json'}});
  const payload=await res.json();
  if(!res.ok)throw Object.assign(new Error(payload.error||'Máy chủ chưa phản hồi.'),{status:res.status});
  return payload;
}
const refresh=async()=>{state=await api('auth');$('#account').textContent=state.user?.role==='teacher'?'Giảng viên':state.user?'Tài khoản':'Đăng nhập';};
function writeStatus(node,message,kind='') {
  node.className='notice '+kind;
  node.textContent=message;
}
const status='<p class="notice" role="status"></p>';
function bindForm(form,handler) {
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const submit=$('button[type=submit]',form);
    submit.disabled=true;
    const message=$('.notice',form);
    writeStatus(message,'Đang xử lý…');
    try {await handler(Object.fromEntries(new FormData(form)),message);}
    catch(error){writeStatus(message,error.message,'error');}
    finally{submit.disabled=false;}
  });
}
function requireLogin(destination) {
  afterAuth=destination;
  return '<p>Đăng nhập để lưu bài và tiếp tục trên thiết bị khác.</p>'+button('auth','Đăng nhập hoặc tạo tài khoản','gold');
}
function needPlacement() {
  return '<p>Hãy hoàn thành bài đầu vào dành cho nhóm của bạn để mở các bài khác.</p>'+button('start','Làm bài đầu vào','gold');
}
function stagesGrid() {
  const notes=['Làm quen từ và câu ngắn.','Nghe hội thoại và đọc mô tả.','Đọc hiểu câu chuyện và nghe lấy chi tiết.'];
  return '<div class="grid">'+stages.map((key,i)=>'<article class="card stage"><h3>'+names[key]+'</h3><p>'+notes[i]+'</p>'+button('course/'+key,'Xem khóa học','outline')+'</article>').join('')+'</div>';
}
function home(anchor) {
  main.innerHTML=`<div class="landing">
  <section class="hero"><div class="wrap landing-hero">
    <div class="hero-copy"><p class="hero-label">SUNNY HOUSE · TIẾNG ANH CAMBRIDGE</p>
      <h1>Vững từng bước, <em>tự tin nói tiếng Anh</em></h1>
      <p>Học tiếng Anh cùng MS Thủy. Chọn lộ trình phù hợp cho con và luyện tiếng Anh qua bài nghe, từ vựng và trò chơi.</p>
      <div class="actions">${button('start','Làm bài đầu vào miễn phí','gold')}${button('home/path','Xem lộ trình','outline')}</div>
    </div>
    <figure class="figure"><img class="founder-portrait" src="/images/ms-thuy-tesol.webp" alt="Ms Thủy mặc áo tốt nghiệp và cầm bìa chứng chỉ TESOL" width="850" height="830" fetchpriority="high"><figcaption class="nametag">Ms Thủy <span>Founder SUNNY HOUSE</span></figcaption></figure>
  </div><div class="wrap">${credentials}</div></section>
  <section class="section alternate" id="home-path"><div class="wrap">
    <p class="landing-label">CHƯƠNG TRÌNH CAMBRIDGE</p><h2>Các cấp độ khác nhau, lộ trình học rõ ràng</h2>
    <p class="intro">Xem nội dung học, thời lượng và học phí từng cấp trước khi chọn lớp cho con.</p>${stagesGrid()}
  </div></section>
  <section class="section"><div class="wrap"><p class="landing-label">BÀI ĐẦU VÀO</p><h2>Bắt đầu từ đâu?</h2><div class="grid">
    <article class="card"><span class="step">1</span><h3>Làm bài đầu vào</h3><p>Chọn nhóm người học để nhận bài phù hợp.</p><a href="#start">Bắt đầu làm bài</a></article>
    <article class="card"><span class="step">2</span><h3>Xem kết quả và lộ trình</h3><p>Xem kỹ năng cần ôn và trao đổi với Ms Thủy.</p><a href="#consult">Nhận tư vấn</a></article>
    <article class="card"><span class="step">3</span><h3>Luyện tập mỗi ngày</h3><p>Luyện đề ngắn, nghe từ mới và chơi cùng bạn.</p><a href="#practice">Xem bài luyện</a></article>
  </div></div></section>
  <section class="section alternate"><div class="wrap landing-split">
    <div><p class="landing-label">LUYỆN TẬP TRỰC TUYẾN</p><h2>Học thêm giữa các buổi trên lớp</h2><p class="intro">Mở bài luyện, nghe lại từ khó hoặc chọn một trò chơi theo cấp độ của con.</p></div>
    <div class="landing-quick">
      <a href="#practice"><strong>Luyện đề</strong><span>Bài nghe, đọc và viết theo cấp độ</span></a>
      <a href="#vocab"><strong>Thẻ từ vựng</strong><span>Nghe phát âm và ôn từ đã lưu</span></a>
      <a href="#games"><strong>Board game</strong><span>Chơi cá nhân hoặc chia đội</span></a>
    </div>
  </div></section>
  <section class="section" id="home-questions"><div class="wrap landing-split">
    <div><p class="landing-label">DÀNH CHO PHỤ HUYNH</p><h2>Câu hỏi thường gặp</h2></div>
    <div class="landing-faq">
      <details><summary>Con nên bắt đầu ở cấp độ nào?</summary><p>Hãy cho con làm bài đầu vào miễn phí. Bài cho học sinh tiểu học gợi ý Starters, Movers hoặc Flyers theo kết quả nghe và đọc.</p></details>
      <details><summary>Bài đang làm có được lưu không?</summary><p>Khi đăng nhập, tiến độ có thể đồng bộ để con tiếp tục trên thiết bị khác.</p></details>
      <details><summary>Xem học phí và hỏi về lớp học ở đâu?</summary><p>Xem từng trang <a href="#courses">khóa học</a> hoặc gửi yêu cầu tư vấn để xác nhận lớp và mức học phí đang áp dụng.</p></details>
    </div>
  </div></section>
  <section class="section landing-cta"><div class="wrap landing-split"><div><h2>Trao đổi về lộ trình của con</h2><p>Cho Ms Thủy biết độ tuổi và mục tiêu học để được tư vấn bước tiếp theo.</p></div><div class="actions">${button('consult','Nhận tư vấn','gold')}${button('about','Giới thiệu Ms Thủy','outline')}</div></div></section>
  </div>`;
  if(anchor==='path'||anchor==='questions')document.getElementById('home-'+anchor)?.scrollIntoView();
}
function about() {
  main.innerHTML=section('Về SUNNY HOUSE','<article class="card"><h3>Ms Thủy · Founder SUNNY HOUSE</h3><p>Ms Thủy sinh năm 2000, tốt nghiệp ngành Ngôn ngữ Anh tại Trường Đại học Công nghiệp. Cô có chứng chỉ nghiệp vụ sư phạm cấp tiểu học và THCS, cùng chứng chỉ TESOL.</p><p>Cô có hơn 6 năm kinh nghiệm dạy trẻ mầm non, học sinh tiểu học và tiếng Anh giao tiếp cho người đi làm.</p>'+button('consult','Nhận tư vấn','gold')+'</article>');
}
function courseCard(key) {
  return '<article class="card stage"><h3>'+esc(courseNames[key])+'</h3>'+
    button('course/'+key,'Xem khóa học','outline')+'</article>';
}
function courses(key) {
  if(key==='global-success'){
    main.innerHTML=section('Global Success','<div class="grid two">'+courseCard('global-6')+courseCard('global-7')+'</div>',
      'Chọn lộ trình theo lớp của học sinh.');
    return;
  }
  if(!key){
    main.innerHTML=section('Khóa học tại SUNNY HOUSE',stagesGrid()+
      '<div class="tabs grid">'+courseCard('conversation')+
      '<article class="card stage"><h3>Global Success</h3><p>Lộ trình riêng cho lớp 6 và lớp 7.</p>'+
      button('course/global-success','Chọn lớp','outline')+'</article>'+courseCard('kids-debate')+
      '<article class="card"><h3>Kèm 1–1</h3>'+button('consult/one','Nhận tư vấn','outline')+'</article></div>');
    return;
  }
  if(!Object.hasOwn(courseData,key))return missing();
  const course=courseData[key];
  const list=items=>'<ul>'+items.map(item=>'<li>'+esc(item)+'</li>').join('')+'</ul>';
  const cards=items=>items.map(({title,lines})=>'<article class="card"><h3>'+esc(title)+'</h3>'+list(lines)+'</article>').join('');
  const stagesMarkup=course.stages.map((stage,i)=>`<details class="card" ${i===0?'open':''}>
      <summary>${esc(stage.title)}</summary>
      <div class="stack tabs">${stage.units.map(({title,lines})=>'<details class="card"><summary>'+esc(title)+'</summary>'+list(lines)+'</details>').join('')}</div>
    </details>`).join('');
  const compare=Boolean(course.benefits);
  const feeTable=course.fees ? `<div class="card course-compare"><table aria-label="${compare?'So sánh học phí và quyền lợi':'Lịch học và học phí'}">
    ${compare?'<thead><tr><th scope="col">Thông tin lớp</th><th scope="col">Lớp A</th><th scope="col">Lớp B</th></tr></thead>':''}
    <tbody>${course.fees.map(([label,...values])=>'<tr><th scope="row">'+esc(label)+'</th>'+values.map(value=>'<td>'+esc(value)+'</td>').join('')+'</tr>').join('')}</tbody>
    </table></div>` : '<article class="card"><p>Liên hệ trung tâm hoặc nhắn Zalo để được tư vấn học phí.</p><a class="btn outline" href="https://zalo.me/0343027537">Nhắn Zalo</a></article>';
  const index=key.startsWith('global-')?'course/global-success':'courses';
  main.innerHTML=section(esc(courseNames[key]),`
    <p class="intro">${esc(course.overview)}</p>
    ${course.textbook?'<p><strong>Giáo trình.</strong> '+esc(course.textbook)+'</p>':''}
    <div class="actions tabs">${button('consult/'+key,'Nhận tư vấn khóa này','gold')}${button(index,index==='courses'?'Xem các khóa học':'Xem các lớp Global Success','outline')}</div>
    <h2>${compare?'So sánh học phí theo lớp':'Lịch học và học phí'}</h2>${feeTable}
    <h2 class="tabs">Lộ trình học</h2><div class="stack">${stagesMarkup}</div>
    ${course.skills?'<h2 class="tabs">Bốn kỹ năng được rèn luyện</h2><div class="grid two">'+cards(course.skills)+'</div>':''}
    ${course.benefits?'<h2 class="tabs">Quyền lợi theo lớp</h2><div class="grid two">'+cards(course.benefits)+'</div>':''}
    ${course.assessment?'<article class="card tabs"><h2>Xếp lớp và theo dõi tiến độ</h2>'+list(course.assessment)+'</article>':''}
  `);
}

function bindPasswordForm() {
  const details=document.createElement('details');
  details.className='card tabs';
  details.innerHTML=`<summary>Đổi mật khẩu</summary><form class="form tabs" id="change-password">
    <label>Mật khẩu hiện tại<input type="password" name="current" autocomplete="current-password" minlength="10" maxlength="128" required></label>
    <label>Mật khẩu mới<input type="password" name="next" autocomplete="new-password" minlength="10" maxlength="128" required></label>
    <button type="submit">Lưu mật khẩu mới</button>${status}</form>`;
  $('.wrap',main).append(details);
  bindForm($('#change-password'),async(data,msg)=>{
    await api('account/password',data);
    $('#change-password').reset();
    writeStatus(msg,'Đã lưu mật khẩu mới và đăng xuất các phiên khác.','success');
  });
}
async function auth(stamp) {
  if(state.user) {
    const history=await api('history');
    if(stamp!==view)return;
    lastResult=history.find(row=>row.kind==='placement')?.result??null;
    main.innerHTML=section('Tài khoản',`<div class="stack"><article class="card"><h3>${esc(state.user.name||state.user.email)}</h3><p>${esc(names[state.user.learner_group]||'Chưa chọn nhóm người học')}</p>${state.user.route?'<p>Lộ trình giáo viên đề xuất: '+esc(state.user.route)+'</p>':''}<div class="actions">${button('start',state.unlocked?'Xem bài đầu vào':'Làm bài đầu vào','gold')}<button class="outline" id="logout">Đăng xuất</button></div></article><article class="card"><h3>Lịch sử học</h3>${history.map(row=>'<p><a href="#paper/'+esc(row.paper)+'">'+esc(catalog.find(p=>p.id===row.paper)?.title||'Bài trên lớp')+'</a> · '+esc(row.created_at)+'</p>').join('')||'<p>Chưa có bài đã nộp.</p>'}</article></div>`);
    bindPasswordForm();
    $('#logout').onclick=async()=>{await api('auth/logout',{});lastResult=null;await refresh();await render();};
    return;
  }
  const mode=turn()[1]==='register'?'register':'login';
  main.innerHTML=section(mode==='login'?'Đăng nhập':'Tạo tài khoản học viên',`<form class="card form" id="auth-form">
  <label>Email tài khoản<input name="email" type="email" autocomplete="email" maxlength="254" required></label>
  <label>Mật khẩu<input name="password" type="password" minlength="10" maxlength="128" autocomplete="${mode==='login'?'current-password':'new-password'}" required></label>
  ${mode==='register'?'<p>Phụ huynh tạo và giữ thông tin đăng nhập riêng cho mỗi trẻ. Mật khẩu cần ít nhất 10 ký tự.</p>':''}
  <button type="submit" class="gold">${mode==='login'?'Đăng nhập':'Tạo tài khoản'}</button>${status}
  ${mode==='login'?'<a href="#auth/register">Tạo tài khoản học viên</a>':'<a href="#auth">Đã có tài khoản</a>'}</form>`);
  bindForm($('#auth-form'),async data=>{await api('auth/'+mode,data);await refresh();location.hash=state.user?.role==='teacher'?'teacher':afterAuth||'start';afterAuth='';});
}
function start() {
  if(!state.user){main.innerHTML=section('Bài đầu vào miễn phí',requireLogin('start'));return;}
  if(state.user.learner_group){location.hash='paper/placement-'+state.user.learner_group;return;}
  main.innerHTML=section('Bài đầu vào miễn phí',`<form class="card form" id="profile">
  <label>Tên học viên<input name="name" autocomplete="given-name" maxlength="100" required></label>
  <label>Tuổi<input name="age" type="number" min="3" max="120" required></label>
  <label>Nhóm người học<select name="group" required><option value="">Chọn nhóm</option>${select(groups,names)}</select></label>
  <button class="gold" type="submit">Mở bài đầu vào</button>${status}</form>`);
  bindForm($('#profile'),async data=>{data.age=Number(data.age);await api('profile',data);await refresh();location.hash='paper/placement-'+data.group;});
}
function practice(key) {
  const level=stages.includes(key)?key:'starters';
  const tabs='<div class="actions tabs">'+stages.map(stage=>button('practice/'+stage,names[stage],stage===level?'active':'outline')).join('')+'</div>';
  const cards=catalog.filter(p=>p.kind==='practice'&&p.level===level).map((p,i)=>`<article class="card" lang="en"><h3>Test ${i+1} · ${esc(p.title)}</h3><p>Listening, Reading and Writing · ${p.count} questions · about 5–8 minutes</p>${button('paper/'+p.id,'Open test','outline')}</article>`).join('');
  const cross=state.unlocked?'<h2 class="tabs">Bài đầu vào theo nhóm</h2><div class="actions">'+groups.map(g=>button('paper/placement-'+g,names[g],'outline')).join('')+'</div>':'';
  main.innerHTML=section('Luyện đề online',tabs+(!state.user?requireLogin('practice/'+level):!state.unlocked?needPlacement():'')+'<div class="grid tabs">'+cards+'</div>'+cross,'Bài luyện ngắn do SUNNY HOUSE biên soạn. Chọn cấp độ để xem các đề.');
}
function fileMarkup(files=[]) {
  return files.map(file=>file.type.startsWith('audio/')?'<div><p>'+esc(file.name)+'</p>'+audio('/api/files/'+file.id,file.name)+'</div>':file.type.startsWith('image/')?'<img class="file-preview" src="/api/files/'+esc(file.id)+'" alt="'+esc(file.name)+'">':'<a href="/api/files/'+esc(file.id)+'">'+esc(file.name)+'</a>').join('');
}
function onlineLinkMarkup(link) {
  if(!link)return '';
  let url;
  try { url=new URL(link.url); } catch { return ''; }
  if(url.protocol!=='https:'||url.username||url.password)return '';
  const isMeeting=link.type==='meeting';
  return `<article class="card tabs"><h3>${isMeeting?'Lớp học trực tuyến':'Video bài học'}</h3>
    <p>${esc(url.hostname)} · Mở trong tab mới</p>
    <a class="btn gold" href="${esc(url.href)}" target="_blank" rel="noopener noreferrer">${isMeeting?'Vào lớp online':'Xem video'}</a></article>`;
}
function onlineLinkFields(link) {
  return `<label>Link video / lớp học online<input name="onlineUrl" type="url" maxlength="2048" placeholder="https://…" value="${esc(link?.url)}"></label>
    <label>Loại liên kết<select name="onlineType">${select(['video','meeting'],{video:'Video bài học',meeting:'Lớp học online'},link?.type||'video')}</select></label>`;
}
const englishSkills={Nghe:'Listening',Đọc:'Reading',Viết:'Writing'};
const questionLabels={
  vi:{question:'Câu',listen:'Nghe câu',picture:'Hình',answer:'Câu trả lời'},
  en:{question:'Question',listen:'Listen to question',picture:'Picture',answer:'Answer'}
};
function questionView(q,i,value,preview=false,english=false) {
  const labels=questionLabels[english?'en':'vi'];
  const skill=english?englishSkills[q.skill]:q.skill;
  return `<article class="card question" lang="${english?'en':'vi'}"><span class="pill">${esc(skill)} · ${labels.question} ${i+1}</span>${q.audio?audio(q.audio,labels.listen+' '+(i+1)):''}
  ${q.passage?'<p lang="en">'+esc(q.passage)+'</p>':''}<h3>${esc(q.prompt)}</h3>
  ${q.options?'<div class="options '+(q.pictures?'pictures':'')+'">'+q.options.map((option,j)=>'<button type="button" class="outline '+(value===option?'selected':'')+'" data-q="'+i+'" data-option="'+j+'" aria-pressed="'+(value===option)+'" '+(preview?'disabled':'')+'>'+(q.pictures?'<span aria-hidden="true">'+esc(q.pictures[j])+'</span><span class="sr-only">'+labels.picture+' '+(j+1)+'</span>':esc(option))+'</button>').join('')+'</div>':'<textarea maxlength="2000" rows="2" data-input="'+i+'" aria-label="'+labels.answer+' '+(i+1)+'" '+(preview?'disabled':'')+'>'+esc(value)+'</textarea>'}</article>`;
}
function skillScores(result,english=false) {
  return '<div class="scores">'+Object.entries(result.scores).map(([name,skill])=>'<span class="pill">'+esc(english?englishSkills[name]:name)+' '+skill.correct+'/'+skill.total+'</span>').join('')+'</div>';
}
function displayResult(p,result) {
  if(p.kind==='placement')lastResult=result;
  if(p.kind==='practice'){
    main.innerHTML=section('<span lang="en">Results · '+esc(p.title)+'</span>',`
      <div lang="en"><article class="card">${skillScores(result,true)}
      ${result.revisionTopics?.length?'<p>Review: '+esc(result.revisionTopics.map(skill=>englishSkills[skill]).join(', '))+'.</p>':''}
      ${button('practice/'+p.level,'Back to practice tests','outline')}</article>
      <div class="questions">${result.items.map((item,i)=>`<article class="card review">
        <h3>Question ${i+1} · ${item.correct?'Correct':'Review'}</h3><p>${esc(item.prompt)}</p>
        <p>Your answer: ${esc(item.selected)}</p><p>Correct answer: ${esc(item.answer)}</p>
        <p>${esc(item.explanation)}</p>${item.audio?audio(item.audio,'Replay audio')+'<p>'+esc(item.transcript)+'</p>':''}
      </article>`).join('')}</div></div>`);
    return;
  }
  main.innerHTML=section('Kết quả · '+esc(p.title),`${onlineLinkMarkup(p.onlineLink)}<article class="card">${skillScores(result)}
  ${result.recommendation?'<h3>Lộ trình đề xuất: '+esc(state.user?.route||result.recommendation)+'</h3><p>'+esc(result.reason)+'</p>':''}
  ${result.revisionTopics?.length?'<p>Nên ôn thêm: '+esc(result.revisionTopics.join(', '))+'.</p>':''}
  ${result.review?'<p>Giáo viên chấm '+result.review.score+'/10 · '+esc(result.review.comment)+'</p>':''}
  ${p.kind==='placement'?button('consult','Nhận tư vấn theo kết quả này','gold'):button(p.kind==='assigned'?'assigned':'practice','Quay lại danh sách','outline')}</article>
  <div class="questions">${result.items?.map((item,i)=>`<article class="card review"><h3>Câu ${i+1} · ${item.correct===null?'Giáo viên chấm':item.correct?'Đúng':'Cần ôn'}</h3><p>${esc(item.prompt)}</p><p>Em chọn: ${esc(item.selected)}</p>${item.answer?'<p>Đáp án: '+esc(item.answer)+'</p>':''}<p>${esc(item.explanation)}</p>${item.audio?audio(item.audio)+'<p lang="en">'+esc(item.transcript)+'</p>':''}</article>`).join('')||'<p>Đáp án sẽ hiện khi giáo viên mở.</p>'}</div>`);
}
function preschoolIntro() {
  return '<article class="card"><h3>Nghe hướng dẫn và làm mẫu</h3><p>Bấm nghe rồi chạm vào hình đúng. Con có thể nghe lại.</p>'+audio(sample.instructions,'Nghe hướng dẫn tiếng Việt')+audio(sample.audio,'Câu làm mẫu')+'<div class="options pictures"><button type="button" class="outline" id="sample">⚽</button><button type="button" class="outline sample-wrong">🐶</button><button type="button" class="outline sample-wrong">🐟</button></div><p id="sample-status" role="status"></p></article>';
}
function speakVietnamese(text) {
  if(!('speechSynthesis' in window))return false;
  const voice=speechSynthesis.getVoices().find(item=>item.lang.toLowerCase().startsWith('vi'));
  if(!voice)return false;
  const utterance=new SpeechSynthesisUtterance(text);
  utterance.voice=voice; utterance.lang='vi-VN';utterance.rate=.85;
  speechSynthesis.cancel();speechSynthesis.speak(utterance);
  return true;
}
async function paper(id,stamp) {
  if(!state.user){main.innerHTML=section('Làm bài',requireLogin('paper/'+id));return;}
  if(!state.user.learner_group&&!state.unlocked){main.innerHTML=section('Làm bài',needPlacement());return;}
  const {paper:p,draft,result}=await api('papers/'+encodeURIComponent(id));
  if(stamp!==view)return;
  const practiceTest=p.kind==='practice';
  const key='sunny-draft:'+state.user.id+':'+id;
  if(result){localStorage.removeItem(key);displayResult(p,result);return;}
  if(!p.questions.length) {
    main.innerHTML=section(esc(p.title),onlineLinkMarkup(p.onlineLink)+fileMarkup(p.files)+
      '<p>Buổi học này không yêu cầu nộp bài.</p>'+button('assigned','Quay lại danh sách','outline'));
    return;
  }
  let revision=draft?.revision??0;
  let answers=draft?.answers??p.questions.map(()=>null);
  let dirty=false;
  let saving=null;
  let timer;
  let conflict=false;
  let local;
  try {local=JSON.parse(localStorage.getItem(key));}catch {local=null;}
  if(local?.revision===revision&&local.answers?.length===answers.length){answers=local.answers;dirty=true;}
  const title=practiceTest?'<span lang="en">'+esc(p.title)+'</span>':esc(p.title);
  main.innerHTML=section(title,`
  ${practiceTest?'<p class="intro" lang="en">'+esc(names[p.level])+' · '+p.questions.length+' questions · Listening, Reading and Writing · about 5–8 minutes</p>':`
  <p class="intro">${esc(names[p.level]||'')} · ${p.questions.length} câu · ${esc([...new Set(p.questions.map(q=>q.skill))].join(' và '))}${p.kind==='placement'&&p.level==='preschool'?' · khoảng 5–8 phút':''}</p>`}
  ${p.level==='preschool'&&p.kind==='placement'?preschoolIntro():''}
  ${p.objective?'<p>'+esc(p.objective)+'</p>':''}${p.vocab?'<p>Từ vựng: '+p.vocab.map(esc).join(', ')+'</p>':''}
  ${onlineLinkMarkup(p.onlineLink)}${fileMarkup(p.files)}<div class="questions">${p.questions.map((q,i)=>questionView(q,i,answers[i],false,practiceTest)).join('')}</div>
  ${p.application?'<article class="card"><h3>Vận dụng</h3><p>'+esc(p.application)+'</p></article>':''}
  <div class="actions tabs"><button class="gold" id="submit" lang="${practiceTest?'en':'vi'}">${practiceTest?'Submit answers':'Nộp bài'}</button><p id="progress" role="status"></p></div>`);
  const progress=$('#progress');
  const localSave=()=>localStorage.setItem(key,JSON.stringify({revision,answers}));
  async function sync() {
    if(saving||!dirty||conflict)return saving;
    dirty=false;
    saving=(async()=>{
      try {
        const saved=await api('papers/'+id+'/draft',{answers:[...answers],revision});
        if(saved.result){localStorage.removeItem(key);if(stamp===view)displayResult(p,saved.result);return;}
        revision=saved.revision;
        if(dirty)localSave();else localStorage.removeItem(key);
        const savedMessage=practiceTest?(dirty?'Saving…':'Progress saved'):(dirty?'Đang lưu…':'Đã lưu tiến độ');
        writeStatus(progress,savedMessage,'success');
        if(dirty){clearTimeout(timer);timer=setTimeout(sync,200);}
      } catch(error) {
        dirty=true;
        conflict=error.status===409;
        const offlineMessage=practiceTest?'Saved on this device. Progress will sync when online.':'Đã lưu trên thiết bị này. Sẽ đồng bộ khi có mạng.';
        writeStatus(progress,conflict&&practiceTest?'This test changed on another device. Reload to continue.':conflict?error.message:offlineMessage,'error');
      } finally {saving=null;}
    })();
    return saving;
  }
  function change() {
    dirty=true;localSave();clearTimeout(timer);timer=setTimeout(sync,350);
  }
  for(const el of main.querySelectorAll('[data-q]'))el.onclick=()=>{
    const i=Number(el.dataset.q);
    answers[i]=p.questions[i].options[Number(el.dataset.option)];
    for(const peer of el.parentNode.children){peer.classList.toggle('selected',peer===el);peer.setAttribute('aria-pressed',String(peer===el));}
    change();
  };
  for(const el of main.querySelectorAll('[data-input]'))el.oninput=()=>{answers[el.dataset.input]=el.value.trim()||null;change();};
  if($('#sample')) {
    $('#sample').onclick=()=>{$('#sample-status').textContent='Đúng rồi!';speakVietnamese('Đúng rồi!');};
    for(const el of main.querySelectorAll('.sample-wrong'))el.onclick=()=>{$('#sample-status').textContent='Con nghe lại nhé.';speakVietnamese('Con nghe lại nhé.');};
  }
  const submit=$('#submit');
  submit.onclick=async()=>{
    submit.disabled=true;clearTimeout(timer);
    try {
      await saving;
      if(conflict)throw new Error('Bài đã thay đổi trên thiết bị khác. Hãy tải lại trước khi nộp.');
      const done=await api('papers/'+id+'/submit',{answers:[...answers],revision});
      dirty=false;localStorage.removeItem(key);await refresh();
      if(stamp===view)displayResult(p,done.result);
    } catch(error){writeStatus(progress,practiceTest?(conflict||error.status===409?'This test changed on another device. Reload to continue.':'Could not submit your answers. Please try again.'):error.message,'error');}
    finally{submit.disabled=false;}
  };
  const online=()=>sync();
  window.addEventListener('online',online);
  cleanup=()=>{clearTimeout(timer);window.removeEventListener('online',online);void sync();};
  if(dirty)void sync();
}
function consult(key) {
  const suggested=Object.keys(courseNames).find(id=>(state.user?.route||lastResult?.recommendation)===courseNames[id]);
  const level=Object.hasOwn(courseNames,key)?key:suggested||'undecided';
  main.innerHTML=section('Nhận tư vấn từ Ms Thủy',`<form class="card form" id="consult">
  <label>Tên người cần tư vấn<input name="name" maxlength="100" value="${esc(state.user?.name)}" required></label>
  <label>Nhóm tuổi hoặc lớp<input name="group" maxlength="60" value="${esc(names[state.user?.learner_group])}" required></label>
  <label>Điện thoại hoặc Zalo của người liên hệ<input name="phone" type="tel" maxlength="20" autocomplete="tel" required></label>
  <p>Với học viên nhỏ tuổi, vui lòng nhập số của phụ huynh hoặc người giám hộ.</p>
  <label>Mục tiêu học<textarea name="goal" maxlength="800" rows="3" required></textarea></label>
  <label>Khóa quan tâm<select name="course">${select(Object.keys(courseNames),courseNames,level)}</select></label>
  ${lastResult?'<label class="check"><input type="checkbox" name="includeResult" checked> Gửi kèm kết quả đầu vào</label>'+skillScores(lastResult)+'<p>Gợi ý: '+esc(state.user?.route||lastResult.recommendation)+'</p>':''}
  <button type="submit" class="gold">Gửi yêu cầu tư vấn</button>${status}</form>
  <div class="actions tabs"><a class="btn outline" href="tel:0343027537">Gọi ngay</a><a class="btn outline" href="https://zalo.me/0343027537">Nhắn Zalo</a><a class="btn outline" href="mailto:lathuy32@gmail.com">Email</a></div>`);
  bindForm($('#consult'),async(data,message)=>{
    data.includeResult=data.includeResult==='on';
    const result=await api('consult',data);
    writeStatus(message,result.synced?'SUNNY HOUSE đã tiếp nhận yêu cầu.':'Yêu cầu đã được lưu. Đồng bộ thông báo đang chờ xử lý.','success');
  });
}
async function vocabulary(key,stamp) {
  const level=stages.includes(key)?key:'starters';
  const saved=new Set(state.user?await api('words'):JSON.parse(localStorage.getItem('sunny-words')||'[]'));
  if(stamp!==view)return;
  main.innerHTML=section('Từ vựng',`<div class="actions tabs">${stages.map(stage=>button('vocab/'+stage,names[stage],stage===level?'active':'outline')).join('')}<button class="outline" id="saved">Ôn từ đã lưu</button></div><div id="words"></div>`);
  let filtered=false;
  const draw=()=>{
    const words=vocab.filter(entry=>entry.level===level&&(!filtered||saved.has(entry.word)));
    const topics=[...new Set(words.map(w=>w.topic))];
    $('#words').innerHTML=topics.map(topic=>'<h2 class="tabs">'+esc(topic)+'</h2><div class="grid">'+words.filter(w=>w.topic===topic).map(w=>
      `<article class="card"><div class="flash"><div class="word-picture" aria-hidden="true">${w.picture}</div><h3 lang="en">${esc(w.word)}</h3><p hidden>${esc(w.meaning)} · <span lang="en">${esc(w.example)}</span></p></div>
      <div class="actions"><button class="outline flip">Lật thẻ</button><button class="outline mark-word" data-word="${esc(w.word)}" aria-pressed="${saved.has(w.word)}">${saved.has(w.word)?'Bỏ lưu':'Lưu từ khó'}</button></div><div class="tabs">${audio(w.audio,'Nghe '+w.word)}</div><p class="notice" role="status"></p></article>`).join('')+'</div>').join('')||'<p>Chưa lưu từ nào ở cấp này.</p>';
    for(const el of main.querySelectorAll('.flip'))el.onclick=()=>{const back=$('.flash p',el.closest('article'));back.hidden=!back.hidden;};
    for(const el of main.querySelectorAll('.mark-word'))el.onclick=async()=>{
      const word=el.dataset.word;const mark=!saved.has(word);el.disabled=true;
      try{
        if(state.user)await api('words',{word,saved:mark});
        if(mark)saved.add(word);else saved.delete(word);
        if(!state.user)localStorage.setItem('sunny-words',JSON.stringify([...saved]));
        if(filtered&&!mark)draw();else{el.textContent=mark?'Bỏ lưu':'Lưu từ khó';el.setAttribute('aria-pressed',String(mark));}
      }catch(error){writeStatus($('.notice',el.closest('article')),error.message,'error');}
      finally{el.disabled=false;}
    };
  };
  $('#saved').onclick=e=>{filtered=!filtered;e.target.classList.toggle('active',filtered);e.target.textContent=filtered?'Xem tất cả':'Ôn từ đã lưu';draw();};
  draw();
}
const gameList={
  bingo:{title:'Bingo nghe từ',level:'Mầm non và Starters',skill:'Nghe nhận biết từ',rule:'Nghe từ và chạm tranh. Ghép đủ một hàng, cột hoặc đường chéo để ghi điểm.'},
  race:{title:'Đường đua ghép câu',level:'Movers',skill:'Trật tự từ và đọc câu',rule:'Chạm các từ theo thứ tự để ghép câu. Mỗi câu đúng tiến một ô, đội đầu tiên tới đích thắng.'},
  treasure:{title:'Truy tìm kho báu',level:'Flyers',skill:'Đọc manh mối và chỉ đường',rule:'Chọn đường phù hợp với manh mối. Qua ba chặng để tìm kho báu.'}
};
const clues=[
  {prompt:'Follow the tunnel beneath the river.',options:['Đường trên cầu','Đường hầm dưới sông','Đường dốc lên đồi'],answer:1},
  {prompt:'The next clue is opposite the library, across the road.',options:['Tiệm bánh đối diện thư viện','Sân bên cạnh thư viện','Phòng sau thư viện'],answer:0},
  {prompt:'At low tide, cross the sand to the island.',options:['Leo cầu thang','Xuống đường hầm','Băng qua bãi cát'],answer:2}
];
function shuffle(items) {
  const result=[...items];
  for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
function games(key) {
  if(!Object.hasOwn(gameList,key)){
    main.innerHTML=section('Board game','<div class="grid">'+Object.entries(gameList).map(([id,g])=>'<article class="card"><h3>'+g.title+'</h3><p>Phù hợp với '+g.level+'</p><p>'+g.skill+'</p><p>'+g.rule+'</p>'+button('games/'+id,'Chơi ngay','outline')+'</article>').join('')+'</div>');
    return;
  }
  const game=gameList[key];
  main.innerHTML=section(game.title,`<div class="gameplay card"><p>Phù hợp với ${game.level}. ${game.rule}</p>
    <div class="actions"><button class="outline" id="solo">Chơi cá nhân</button><button class="outline" id="teams">Chia hai đội</button></div>
    <div id="game"></div><p id="game-status" role="status"></p></div>`);
  const field=$('#game'),msg=$('#game-status');
  let players,player,rounds,progress,boards,target,wordOrder,selected,won;
  const wordSets=vocab.filter(w=>w.level==='movers').slice(0,3).map(w=>w.example.split(' '));
  const tiles=vocab.filter(w=>w.level==='starters');
  const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  function init(count){
    players=count;player=0;rounds=0;progress=Array(count).fill(0);boards=Array.from({length:count},()=>new Set());
    target=shuffle(tiles);wordOrder=shuffle(wordSets[0]);selected=[];won=null;draw();
    writeStatus(msg,'');
  }
  function next(correct) {
    if(correct)progress[player]++;
    const victory=key==='bingo'?lines.some(line=>line.every(i=>boards[player].has(i))):progress[player]===3;
    if(victory){won=player;draw();return;}
    if(key==='bingo') {
      if(players===2)player=1-player;
      let number=0;
      while(boards[player].has(tiles.indexOf(target[rounds%9]))&&number<9){rounds++;number++;}
    } else {
      if(players===2)player=1-player;
      if(key==='race'){wordOrder=shuffle(wordSets[progress[player]]);selected=[];}
    }
    draw();
    writeStatus(msg,correct?'Đúng rồi!':'Thử lại ở lượt tiếp theo.',correct?'success':'error');
  }
  function draw(){
    if(won!==null) {
      const keyName='sunny-game:'+key+':'+players;
      let record=JSON.parse(localStorage.getItem(keyName)||'{}');
      record[won]=(record[won]||0)+1;localStorage.setItem(keyName,JSON.stringify(record));
      field.innerHTML='<h2 class="tabs">'+(players===2?'Đội '+(won+1)+' thắng!':'Em đã hoàn thành ván!')+'</h2><p>Số ván đã thắng: '+record[won]+'</p><button class="gold" id="again">Chơi lại</button>';
      writeStatus(msg,'');$('#again').onclick=()=>init(players);return;
    }
    let html='<h3 class="tabs">'+(players===2?'Lượt đội '+(player+1):'Lượt của em')+'</h3><p>Điểm '+(players===2?'đội 1 / đội 2: ':': ')+progress.join(' / ')+'</p>';
    if(key==='bingo')html+=audio(target[rounds%9].audio,'Nghe từ cần tìm')+'<div class="board">'+tiles.map((w,i)=>'<button class="outline '+(boards[player].has(i)?'selected':'')+'" data-tile="'+i+'" aria-label="Tranh '+(i+1)+'" '+(boards[player].has(i)?'disabled':'')+'>'+w.picture+'</button>').join('')+'</div>';
    if(key==='race')html+='<div class="race">'+[0,1,2,3].map(i=>'<span class="'+(i<=progress[player]?'passed':'')+'">'+(i===progress[player]?'🚗':i===3?'🏁':i)+'</span>').join('')+'</div><p lang="en">'+selected.map(i=>esc(wordOrder[i])).join(' ')+'</p><div class="actions">'+wordOrder.map((word,i)=>'<button class="outline" data-token="'+i+'" '+(selected.includes(i)?'disabled':'')+'>'+esc(word)+'</button>').join('')+'<button id="undo" class="outline">Xóa từ cuối</button><button id="check" class="gold" '+(selected.length===wordOrder.length?'':'disabled')+'>Kiểm tra câu</button></div>';
    if(key==='treasure'){
      const clue=clues[progress[player]];
      html+='<div class="race">'+[0,1,2,3].map(i=>'<span class="'+(i<=progress[player]?'passed':'')+'">'+(i===progress[player]?'📍':i===3?'🧰':'🌿')+'</span>').join('')+'</div><p lang="en">'+clue.prompt+'</p><div class="options">'+clue.options.map((option,i)=>'<button class="outline" data-path="'+i+'">'+option+'</button>').join('')+'</div>';
    }
    field.innerHTML=html;
    for(const el of field.querySelectorAll('[data-tile]'))el.onclick=()=>{
      const i=Number(el.dataset.tile);const ok=tiles[i]===target[rounds%9];
      if(ok)boards[player].add(i);
      rounds++;next(ok);
    };
    for(const el of field.querySelectorAll('[data-token]'))el.onclick=()=>{selected.push(Number(el.dataset.token));draw();};
    for(const el of field.querySelectorAll('[data-path]'))el.onclick=()=>next(Number(el.dataset.path)===clues[progress[player]].answer);
    if($('#undo'))$('#undo').onclick=()=>{selected.pop();draw();};
    if($('#check'))$('#check').onclick=()=>next(selected.map(i=>wordOrder[i]).join(' ')===wordSets[progress[player]].join(' '));
  }
  $('#solo').onclick=()=>init(1);$('#teams').onclick=()=>init(2);init(1);
}
async function assigned(stamp){
  if(!state.user){main.innerHTML=section('Bài trên lớp',requireLogin('assigned'));return;}
  if(!state.unlocked&&state.user.role!=='teacher'){main.innerHTML=section('Bài trên lớp',needPlacement());return;}
  const list=await api('assigned');
  if(stamp!==view)return;
  main.innerHTML=section('Bài trên lớp',(state.user.role==='teacher'?button('teacher','Quản lý lớp','gold'):'')+'<div class="grid tabs">'+list.map(a=>
    '<article class="card"><span class="pill">'+esc(a.status)+'</span><h3>'+esc(a.title)+'</h3><p>'+esc(a.class_name)+' · '+esc(names[a.level])+'</p>'+button('paper/assigned-'+a.id,'Mở bài','outline')+'</article>').join('')+'</div>'+(!list.length?'<p>Chưa có bài được giao.</p>':''));
}
async function teacher(key,id,stamp) {
  if(!state.user){main.innerHTML=section('Quản lý lớp',requireLogin('teacher'));return;}
  if(state.user.role!=='teacher'){main.innerHTML=section('Quản lý lớp','<p>Chỉ tài khoản giáo viên có quyền truy cập.</p>');return;}
  const tools=key==='assignment'||key==='student'?'<p><a href="#teacher">Quay lại quản lý lớp</a></p>':'';
  if(key==='account'){
    main.innerHTML=section('Tài khoản giảng viên','<article class="card"><h3>'+esc(state.user.name||state.user.email)+'</h3><p>'+esc(state.user.email)+'</p></article>');
    bindPasswordForm();
    return;
  }
  if(key==='leads'){
    const rows=await api('teacher/leads');
    if(stamp!==view)return;
    const labels={pending:'Chờ xử lý',received:'Đã tiếp nhận',contacted:'Đã liên hệ'};
    main.innerHTML=section('Yêu cầu tư vấn',tools+'<div class="stack">'+rows.map(row=>{
      const p=row.payload;
      return `<article class="card"><h3>${esc(p.name)} · ${esc(p.group)}</h3><p>${esc(p.phone)} · ${esc(courseNames[p.course])}</p><p>${esc(p.goal)}</p>${p.result?skillScores(p.result)+'<p>'+esc(p.result.recommendation)+'</p>':''}
      <p>${row.synced?'Đã đồng bộ':'Chờ đồng bộ'}</p><form class="form lead-status" data-id="${row.id}"><label>Trạng thái<select name="status">${select(Object.keys(labels),labels,row.status)}</select></label><div class="actions"><button type="submit">Lưu trạng thái</button>${row.synced?'':'<button type="button" class="outline retry">Thử đồng bộ lại</button>'}</div>${status}</form></article>`;
    }).join('')+'</div>'+(!rows.length?'<p>Chưa có yêu cầu tư vấn.</p>':''));
    for(const form of main.querySelectorAll('.lead-status')){
      bindForm(form,async(data,message)=>{await api('teacher/leads/'+form.dataset.id,data);writeStatus(message,'Đã lưu.','success');});
      if($('.retry',form))$('.retry',form).onclick=async e=>{const el=e.target;el.disabled=true;
        try{const result=await api('teacher/leads/'+form.dataset.id,{retry:true});if(result.synced)await render();else writeStatus($('.notice',form),'Đã giữ yêu cầu. Tích hợp chưa phản hồi.','error');}
        catch(error){writeStatus($('.notice',form),error.message,'error');}finally{el.disabled=false;}
      };
    }
    return;
  }
  if(key==='student'){
    const data=await api('teacher/student/'+id);
    if(stamp!==view)return;
    const student=data.student;
    main.innerHTML=section(esc(student.name||student.email),tools+`<div class="stack"><article class="card"><p>${esc(student.email)} · ${esc(names[student.learner_group]||'Chưa chọn nhóm')}</p><p>Hoạt động gần nhất: ${esc(data.lastActivity||'Chưa có')}</p><form class="form" id="route-form"><label>Lộ trình giáo viên đề xuất<input name="route" maxlength="120" value="${esc(student.route)}" required></label><button type="submit">Lưu lộ trình</button>${status}</form></article>
    <article class="card"><h3>Bài đã làm</h3>${data.results.map(row=>'<p>'+esc(catalog.find(p=>p.id===row.paper)?.title||'Bài trên lớp')+' · '+esc(row.created_at)+'</p>'+skillScores(row.result)+(row.result.recommendation?'<p>'+esc(row.result.recommendation)+'</p>':'')).join('')||'<p>Chưa có bài.</p>'}</article>
    <article class="card"><h3>Bài còn thiếu</h3>${data.missing.map(row=>'<p>'+esc(row.title)+' · '+esc(row.class_name)+'</p>').join('')||'<p>Không có bài còn thiếu.</p>'}</article></div>`);
    bindForm($('#route-form'),async(data,msg)=>{await api('teacher/route',{...data,student:id});writeStatus(msg,'Đã lưu.','success');});
    return;
  }
  const data=await api('teacher/classes');
  if(stamp!==view)return;
  if(key==='archive'){
    main.innerHTML=section('Lớp đã xóa',
      '<div class="staff-classes">'+data.archived.map(c=>`<article class="card"><h3>${esc(c.title)}</h3>
      <p>${esc(names[c.level]||c.level)}</p><form class="form class-action" data-class="${esc(c.id)}"><button type="submit">Khôi phục lớp</button>${status}</form></article>`).join('')+'</div>'+
      (!data.archived.length?'<p>Chưa có lớp đã xóa.</p>':''),
      'Khôi phục để lớp và các buổi học xuất hiện lại trong danh sách.');
    for(const form of main.querySelectorAll('.class-action'))bindForm(form,async()=>{
      await api('teacher/classes/'+encodeURIComponent(form.dataset.class),{action:'restore'});
      await render();
    });
    return;
  }
  const clsNames=Object.fromEntries(data.classes.map(c=>[c.id,c.title]));
  const classSelect=select(Object.keys(clsNames),clsNames);
  if(key==='assignment'){
    const a=await api('teacher/assignment/'+id);
    if(stamp!==view)return;
    const cls=data.classes.find(c=>c.id===a.class_id);
    const students=data.students.filter(s=>s.class_id===a.class_id);
    const studentNames=Object.fromEntries(students.map(s=>[s.id,s.name||s.email]));
    const lessonSet=catalog.filter(p=>p.kind==='lesson'&&p.level===cls.level);
    const lessonTitles=Object.fromEntries(lessonSet.map(p=>[p.id,p.title]));
    const isBase=catalog.some(p=>p.id===a.paper.id&&p.kind==='lesson');
    const baseCount=isBase?catalog.find(p=>p.id===a.paper.id).count:0;
    const custom=a.paper.questions.slice(baseCount).map(q=>{
      const {audio,...rest}=q;
      return {...rest,...(audio?{file:audio.split('/').at(-1)}:{})};
    });
    const date=a.release_at?new Date(a.release_at-new Date(a.release_at).getTimezoneOffset()*60000).toISOString().slice(0,16):'';
    const edit=`<div class="teacher-grid"><article class="card"><h3>Soạn bài</h3><form class="form" id="edit-assignment">
      <label>Tên buổi<input name="title" value="${esc(a.title)}" maxlength="120" required></label>
      <label>Giao cho<select name="student"><option value="">Cả lớp</option>${select(Object.keys(studentNames),studentNames,a.student)}</select></label>
      <label>Học liệu có sẵn<select name="paperId"><option value="">Tự soạn</option>${select(Object.keys(lessonTitles),lessonTitles,isBase?a.paper.id:'')}</select></label>
      ${onlineLinkFields(a.paper.onlineLink)}
      <div class="stack" id="question-editor"></div><button class="outline" id="add-question" type="button">Thêm câu hỏi</button><button type="submit">Lưu bản nháp</button>${status}</form></article>
      <article class="card"><h3>Tệp của buổi học</h3><form class="form" id="upload"><label>Ảnh, MP3, WAV hoặc PDF<input name="file" type="file" accept="image/png,image/jpeg,image/webp,audio/mpeg,audio/wav,audio/ogg,audio/mp4,application/pdf" required></label><button type="submit">Tải lên</button>${status}</form><div class="stack">${a.files.map(f=>'<p>'+esc(f.name)+'</p>').join('')}</div>
      <form class="form" id="publish"><button type="submit" class="gold">Xuất bản bản đã lưu</button>${status}</form></article></div>`;
    const publishedLink=a.published?`<article class="card tabs"><h3>Liên kết buổi học</h3>
      <form class="form" id="edit-online-link">${onlineLinkFields(a.paper.onlineLink)}<button type="submit">Lưu liên kết</button>${status}</form></article>`:'';
    main.innerHTML=section(esc(a.title),tools+'<p>'+esc(cls.title)+' · '+(a.published?'Đã xuất bản':'Bản nháp')+'</p>'+(a.published?publishedLink:edit)+
      `<article class="card tabs"><h3>Lịch mở đáp án</h3><form class="form" id="release"><label>Mở từ thời điểm (để trống để ẩn)<input name="release" type="datetime-local" value="${date}"></label><button type="submit">Lưu lịch</button>${status}</form></article>
      <details class="card tabs"><summary>Xem trước dưới góc nhìn học viên</summary>${onlineLinkMarkup(a.paper.onlineLink)}${fileMarkup(a.files)}<div class="questions">${a.paper.questions.map((q,i)=>questionView(q,i,null,true)).join('')}</div>${a.paper.application?'<p>'+esc(a.paper.application)+'</p>':''}</details>
      <h2 class="tabs">Bài nộp</h2><div class="stack">${a.submissions.map(row=>`<article class="card"><h3>${esc(row.name||row.email)}</h3>${skillScores(row.result)}
        ${row.result.items.map((item,i)=>'<p>Câu '+(i+1)+' · '+esc(item.prompt)+' — '+esc(item.selected)+'</p>').join('')}
        <form class="form grading" data-student="${row.user_id}"><label>Điểm giáo viên (0–10)<input name="score" type="number" min="0" max="10" step="0.1" value="${esc(row.review?.score)}" required></label><label>Nhận xét<textarea name="comment" maxlength="4000" required>${esc(row.review?.comment)}</textarea></label><button type="submit">Lưu nhận xét</button>${status}</form></article>`).join('')||'<p>Chưa có bài nộp.</p>'}</div>`);
    if(!a.published){
      const audioFiles=Object.fromEntries(a.files.filter(f=>f.type.startsWith('audio/')).map(f=>[f.id,f.name]));
      function addQuestion(q={}) {
        const card=document.createElement('fieldset');card.className='card form custom-question';
        card.innerHTML=`<label>Kỹ năng<select data-field="skill">${select(['Đọc','Viết','Nghe'],{},q.skill)}</select></label>
          <label>Câu hỏi<input data-field="prompt" maxlength="500" value="${esc(q.prompt)}" required></label>
          <label>Đoạn đọc<textarea data-field="passage" maxlength="2000">${esc(q.passage)}</textarea></label>
          <label>Đáp án<input data-field="answer" maxlength="300" value="${esc(q.answer)}"></label>
          <label>Đáp án chấp nhận thêm (mỗi dòng một đáp án)<textarea data-field="accepted">${esc(q.accepted?.join('\n'))}</textarea></label>
          <label>Lời giải<textarea data-field="explanation" maxlength="800">${esc(q.explanation)}</textarea></label>
          <label>Tệp nghe<select data-field="file"><option value="">Chọn tệp</option>${select(Object.keys(audioFiles),audioFiles,q.file)}</select></label>
          <label>Transcript<textarea data-field="transcript" maxlength="3000">${esc(q.transcript)}</textarea></label>
          <label class="check"><input type="checkbox" data-field="open" ${q.open?'checked':''}> Giáo viên chấm tự luận</label><button class="outline" type="button">Xóa câu hỏi</button>`;
        $('button',card).onclick=()=>card.remove();
        $('#question-editor').append(card);
      }
      custom.forEach(addQuestion);
      $('#add-question').onclick=()=>addQuestion();
      bindForm($('#edit-assignment'),async(data)=>{
        const questions=[...main.querySelectorAll('.custom-question')].map(card=>{
          const q={};
          for(const el of card.querySelectorAll('[data-field]')){
            if(el.type==='checkbox')q[el.dataset.field]=el.checked;
            else if(el.value.trim())q[el.dataset.field]=el.dataset.field==='accepted'?el.value.trim().split('\n').map(x=>x.trim()).filter(Boolean):el.value.trim();
          }
          return q;
        });
        await api('teacher/assignment',{...data,classId:a.class_id,id,questions});await render();
      });
      bindForm($('#upload'),async(data)=>{await api('teacher/files/'+id+'?name='+encodeURIComponent(data.file.name),undefined,data.file);await render();});
      bindForm($('#publish'),async()=>{await api('teacher/publish/'+id,{});await render();});
    }
    if(a.published)bindForm($('#edit-online-link'),async(data)=>{
      await api('teacher/online-link/'+id,data);
      await render();
    });
    bindForm($('#release'),async(data,message)=>{await api('teacher/release/'+id,{release:data.release?new Date(data.release).getTime():null});writeStatus(message,'Đã lưu lịch.','success');});
    for(const form of main.querySelectorAll('.grading'))bindForm(form,async(data,message)=>{await api('teacher/review/'+id,{...data,score:Number(data.score),student:form.dataset.student});writeStatus(message,'Đã lưu nhận xét.','success');});
    return;
  }
  main.innerHTML=section('Quản lý lớp',`<div class="staff-metrics">
    <div><strong>${data.classes.length}</strong><span>Lớp đang hoạt động</span></div>
    <div><strong>${new Set(data.students.map(student=>student.id)).size}</strong><span>Học viên</span></div>
    <div><strong>${data.assignments.length}</strong><span>Buổi học</span></div>
  </div><h2>Lớp đang hoạt động</h2>
  <div class="staff-classes">${data.classes.map(c=>`<article class="card staff-class">
    <span class="pill">${esc(names[c.level]||c.level)}</span><h3>${esc(c.title)}</h3>
    <p>${data.students.filter(student=>student.class_id===c.id).length} học viên</p>
    <details><summary>Xóa lớp</summary><p>Lớp sẽ được ẩn. Bài nộp được giữ lại và bạn có thể khôi phục lớp.</p>
    <form class="form class-action" data-class="${esc(c.id)}"><button type="submit" class="staff-danger">Xác nhận xóa lớp</button>${status}</form></details>
  </article>`).join('')}</div>${data.classes.length?'':'<p>Chưa có lớp. Tạo lớp ở mục bên dưới.</p>'}
  <div class="teacher-grid tabs">
  <article class="card"><h3>Tạo lớp</h3><form class="form" id="new-class"><label>Tên lớp<input name="title" maxlength="120" required></label><label>Trình độ<select name="level">${select([...stages,...groups],names)}</select></label><button type="submit">Tạo lớp</button>${status}</form></article>
  <article class="card"><h3>Thêm học viên</h3><form class="form" id="enroll"><label>Lớp<select name="classId" required><option value="">Chọn lớp</option>${classSelect}</select></label><label>Email tài khoản học viên<input name="email" type="email" required></label><button type="submit">Thêm học viên</button>${status}</form></article>
  <article class="card"><h3>Tạo buổi học</h3><form class="form" id="new-assignment"><label>Lớp<select name="classId" required><option value="">Chọn lớp</option>${classSelect}</select></label><label>Tên buổi<input name="title" maxlength="120" required></label><button type="submit">Tạo bản nháp</button>${status}</form></article>
  <article class="card"><h3>Lọc lớp, bài và học viên</h3><div class="form"><label>Lớp<select id="filter-class"><option value="">Tất cả</option>${classSelect}</select></label><label>Trình độ<select id="filter-level"><option value="">Tất cả</option>${select([...stages,...groups],names)}</select></label><label>Tên buổi<input id="filter-session"></label><label>Tên hoặc email học viên<input id="filter-student"></label></div></article>
  </div><div class="teacher-grid tabs"><article class="card"><h3>Buổi học</h3><div id="sessions-list" class="table-list"></div></article><article class="card"><h3>Học viên</h3><div id="students-list" class="table-list"></div></article></div>`);
  const draw=()=>{
    const cid=$('#filter-class').value,level=$('#filter-level').value;
    const session=$('#filter-session').value.toLowerCase(),student=$('#filter-student').value.toLowerCase();
    const meets=id=>(!cid||cid===id)&&(!level||data.classes.some(c=>c.id===id&&c.level===level));
    $('#sessions-list').innerHTML=data.assignments.filter(a=>meets(a.class_id)&&a.title.toLowerCase().includes(session)).map(a=>'<a href="#teacher/assignment/'+a.id+'">'+esc(a.title)+' · '+esc(clsNames[a.class_id])+' · '+(a.published?'Đã xuất bản':'Bản nháp')+'</a>').join('')||'<p>Chưa có buổi học phù hợp.</p>';
    $('#students-list').innerHTML=data.students.filter(s=>meets(s.class_id)&&((s.name||'')+' '+s.email).toLowerCase().includes(student)).map(s=>'<a href="#teacher/student/'+s.id+'">'+esc(s.name||s.email)+' · '+esc(clsNames[s.class_id])+'</a>').join('')||'<p>Chưa có học viên phù hợp.</p>';
  };
  for(const selector of ['#filter-class','#filter-level','#filter-session','#filter-student'])$(selector).oninput=draw;
  draw();
  for(const form of main.querySelectorAll('.class-action'))bindForm(form,async()=>{
    await api('teacher/classes/'+encodeURIComponent(form.dataset.class),{action:'archive'});
    await render();
  });
  bindForm($('#new-class'),async data=>{await api('teacher/classes',data);await render();});
  bindForm($('#enroll'),async data=>{await api('teacher/enroll',data);await render();});
  bindForm($('#new-assignment'),async data=>{const result=await api('teacher/assignment',data);location.hash='teacher/assignment/'+result.id;});
}
function missing() {
  main.innerHTML=section('Không tìm thấy trang',button('home','Về trang chủ','outline'));
}
async function render(){
  cleanup();cleanup=()=>{};
  const stamp=++view;
  const [path='home',key,id]=turn();
  const isTeacher=state.user?.role==='teacher';
  if(isTeacher&&['auth','start','assigned','paper'].includes(path)){
    location.replace('#teacher');
    return;
  }
  const staffMode=isTeacher&&path==='teacher';
  document.body.classList.toggle('staff-mode',staffMode);
  $('#teacher-nav').hidden=!staffMode;
  for(const link of document.querySelectorAll('[data-staff-page]')){
    if(staffMode&&link.dataset.staffPage===(['account','archive','leads'].includes(key)?key:'classes'))link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  }
  $('#menu').setAttribute('aria-expanded','false');
  $('#nav').classList.remove('open');
  closeNavGroups();
  main.innerHTML=section('Đang tải…','');
  try {
    switch(path) {
      case '':case 'home':home(key);break;
      case 'about':about();break;
      case 'courses':courses();break;
      case 'course':courses(key);break;
      case 'auth':await auth(stamp);break;
      case 'start':start();break;
      case 'paper':await paper(key,stamp);break;
      case 'practice':practice(key);break;
      case 'consult':{
        if(state.user&&!lastResult){
          const history=await api('history');
          if(stamp!==view)return;
          lastResult=history.find(row=>row.kind==='placement')?.result??null;
        }
        consult(key);break;
      }
      case 'vocab':await vocabulary(key,stamp);break;
      case 'games':games(key);break;
      case 'assigned':await assigned(stamp);break;
      case 'teacher':await teacher(key,id,stamp);break;
      default:missing();
    }
  } catch(error) {
    if(stamp!==view)return;
    main.innerHTML=section('Chưa mở được trang','<p class="error">'+esc(error.message)+'</p>'+(staffMode?button('teacher','Về khu vực giảng viên','outline'):error.status===403?needPlacement():button('home','Về trang chủ','outline')));
  }
}
const nav=$('#nav');
const menu=$('#menu');
const navGroups=[...nav.querySelectorAll('.nav-group')];
function setNavGroup(group,open) {
  $('.nav-toggle',group).setAttribute('aria-expanded',String(open));
  $('.nav-options',group).hidden=!open;
}
function closeNavGroups(except) {
  for(const group of navGroups)if(group!==except)setNavGroup(group,false);
}
for(const group of navGroups) {
  const toggle=$('.nav-toggle',group);
  toggle.onclick=()=>{
    const opening=toggle.getAttribute('aria-expanded')==='false';
    closeNavGroups(group);
    setNavGroup(group,opening);
  };
  group.addEventListener('pointerenter',event=>{
    if(event.pointerType!=='mouse'||!matchMedia('(min-width: 1181px)').matches)return;
    closeNavGroups(group);
    setNavGroup(group,true);
  });
  group.addEventListener('pointerleave',event=>{
    if(event.pointerType==='mouse'&&!group.contains(document.activeElement))setNavGroup(group,false);
  });
  group.addEventListener('focusout',event=>{
    if(!group.contains(event.relatedTarget))setNavGroup(group,false);
  });
}
function closeMobileNav() {
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded','false');
}
menu.onclick=()=>{
  const open=nav.classList.toggle('open');
  menu.setAttribute('aria-expanded',String(open));
  if(!open)closeNavGroups();
};
nav.addEventListener('click',event=>{
  if(!event.target.closest('a'))return;
  closeNavGroups();
  closeMobileNav();
});
document.addEventListener('pointerdown',event=>{
  if(event.target.closest('.navwrap'))return;
  closeNavGroups();
  closeMobileNav();
});
document.addEventListener('keydown',event=>{
  if(event.key!=='Escape')return;
  const group=event.target.closest('.nav-group');
  if(group&&$('.nav-toggle',group).getAttribute('aria-expanded')==='true'){
    $('.nav-toggle',group).focus();
    setNavGroup(group,false);
  } else if(nav.classList.contains('open')){
    menu.focus();
    closeMobileNav();
  }
});
$('#staff-logout').onclick=async()=>{
  const control=$('#staff-logout');
  control.disabled=true;
  try {
    await api('auth/logout',{});
    lastResult=null;
    await refresh();
    location.hash='auth';
  } catch(error) {
    writeStatus($('.notice',$('#teacher-nav')),error.message,'error');
  } finally {
    control.disabled=false;
  }
};
window.addEventListener('hashchange',()=>{window.scrollTo(0,0);void render();});
try {await refresh();} catch {state={user:null,unlocked:false};}
await render();
