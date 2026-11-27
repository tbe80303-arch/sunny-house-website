import {papers} from '../../server/bank.js';

const archiveReady=new WeakSet();
const activeClass="NOT EXISTS (SELECT 1 FROM archived_classes ac WHERE ac.class_id=c.id)";
const groups=['preschool','primary','middle','high','college','work'];
const levels=['starters','movers','flyers',...groups];
const encoder=new TextEncoder();
const hex=buffer=>Array.from(new Uint8Array(buffer),b=>b.toString(16).padStart(2,'0')).join('');
const digest=async text=>hex(await crypto.subtle.digest('SHA-256',encoder.encode(text)));
const random=()=>crypto.randomUUID();
const json=(data,status=200,headers={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store',...headers}});
function need(value,message='Dữ liệu chưa hợp lệ.',status=400) {
  if(!value) throw Object.assign(new Error(message),{status});
}
const string=(value,max,min=1)=>typeof value==='string'&&value.trim().length>=min&&value.trim().length<=max;
const cleanEmail=value=>String(value||'').trim().toLowerCase();
const normal=value=>String(value??'').normalize('NFC').toLowerCase().trim().replace(/\s+/g,' ').replace(/[.!?]+$/,'');
async function passwordHash(password,salt) {
  const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);
  return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:encoder.encode(salt),iterations:100000},key,256));
}
function equals(a,b) {
  if(a.length!==b.length)return false;
  let diff=0;
  for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);
  return diff===0;
}

export async function onRequest({request,env,params}) {
  try {
    return await route(request,env,params.path||[]);
  } catch(error) {
    if(!error.status) console.error(error.message);
    return json({error:error.status?error.message:'Máy chủ chưa xử lý được yêu cầu. Vui lòng thử lại.'},error.status||500);
  }
}

async function route(req,env,segments) {
  const [scope,id,action]=segments;
  const method=req.method;
  const url=new URL(req.url);
  if(method!=='GET') need(req.headers.get('Origin')===url.origin,'Yêu cầu không hợp lệ.',403);
  const db=env.DB;
  need(db,'Chưa cấu hình cơ sở dữ liệu.',503);
  const query=(sql,...args)=>db.prepare(sql).bind(...args);
  const one=(sql,...args)=>query(sql,...args).first();
  const all=async(sql,...args)=>(await query(sql,...args).all()).results;
  const run=(sql,...args)=>query(sql,...args).run();
  async function prepareClassArchive() {
    if(archiveReady.has(db))return;
    // Existing Pages installations initialize this additive table on first use.
    await run('CREATE TABLE IF NOT EXISTS archived_classes (class_id TEXT PRIMARY KEY REFERENCES classes(id), archived_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)');
    archiveReady.add(db);
  }
  const body=async()=>{
    const text=await req.text();
    need(text.length<100000,'Nội dung vượt giới hạn.',413);
    try { return JSON.parse(text); } catch { need(false,'JSON chưa hợp lệ.'); }
  };
  const now=Date.now();
  const prod=url.protocol==='https:';
  const cookie=req.headers.get('Cookie')?.match(/(?:^|; )sunny_session=([a-f0-9-]{36})(?:;|$)/)?.[1];
  const sessionCookie=(token,max)=>'sunny_session='+token+'; Path=/; HttpOnly; SameSite=Lax; Max-Age='+max+(prod?'; Secure':'');
  const tokenHash=cookie?await digest(cookie):null;
  const user=tokenHash?await one('SELECT u.id,u.email,u.role,u.name,u.age,u.learner_group,u.route FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires>?',tokenHash,now):null;
  async function throttle(key,limit,windowMs) {
    const row=await one('INSERT INTO throttle(key,count,until) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN until<=? THEN 1 ELSE count+1 END,until=CASE WHEN until<=? THEN excluded.until ELSE until END RETURNING count',await digest(key),now+windowMs,now,now);
    need(row.count<=limit,'Vui lòng thử lại sau.',429);
  }
  if(scope==='auth') {
    if(method==='GET') return json({user,unlocked:!!(user&&await one('SELECT 1 FROM results WHERE user_id=? AND kind=?',user.id,'placement'))});
    if(method==='POST'&&id==='logout') {
      if(tokenHash)await run('DELETE FROM sessions WHERE token=?',tokenHash);
      return json({},200,{'Set-Cookie':sessionCookie('',0)});
    }
    if(method==='POST'&&['login','register'].includes(id)) {
      const data=await body();
      const email=cleanEmail(data.email);
      need(email.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)&&string(data.password,128,10),'Kiểm tra email và mật khẩu (tối thiểu 10 ký tự).');
      await throttle('auth:'+(req.headers.get('CF-Connecting-IP')||'local'),30,900000);
      await throttle('account:'+email,12,900000);
      let account;
      if(id==='register') {
        const salt=random();
        const hash=await passwordHash(data.password,salt);
        const uid=random();
        const result=await run('INSERT INTO users(id,email,password) VALUES(?,?,?) ON CONFLICT(email) DO NOTHING',uid,email,salt+':'+hash);
        need(result.meta.changes,'Email này đã được sử dụng.',409);
        account={id:uid};
      } else {
        account=await one('SELECT id,password FROM users WHERE email=?',email);
        const [salt,hash]=(account?.password||'00000000-0000-0000-0000-000000000000:'+ '0'.repeat(64)).split(':');
        need(equals(await passwordHash(data.password,salt),hash)&&account,'Email hoặc mật khẩu chưa đúng.',401);
      }
      const token=random();
      if(tokenHash)await run('DELETE FROM sessions WHERE token=?',tokenHash);
      await run('INSERT INTO sessions(token,user_id,expires) VALUES(?,?,?)',await digest(token),account.id,now+1209600000);
      return json({},200,{'Set-Cookie':sessionCookie(token,1209600)});
    }
  }
  async function syncLead(lead) {
    if(lead.synced)return true;
    if(!env.LEADS_WEBHOOK||!env.LEADS_WEBHOOK_SECRET) {
      console.warn('Consultation sync: webhook URL or secret is missing.');
      return false;
    }
    try {
      const response=await fetch(env.LEADS_WEBHOOK,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        id:lead.id,createdAt:lead.created_at,secret:env.LEADS_WEBHOOK_SECRET,...JSON.parse(lead.payload)
      }),signal:AbortSignal.timeout(12000)});
      if(!response.ok||!response.headers.get('Content-Type')?.includes('application/json')) {
        console.warn('Consultation sync: unexpected webhook response, HTTP '+response.status+'.');
        return false;
      }
      const result=await response.json();
      if(result?.ok===true) {
        await run('UPDATE leads SET synced=1 WHERE id=?',lead.id);
        return true;
      }
      console.warn('Consultation sync: webhook did not confirm delivery.');
    } catch {
      console.warn('Consultation sync: request or delivery update failed.');
    }
    return false;
  }
  if(scope==='consult'&&method==='POST') {
    const data=await body();
    const phone=String(data.phone||'').replace(/[ .()-]/g,'');
    need(string(data.name,100)&&string(data.group,60)&&string(data.goal,800)&&/^(?:\+84|0)\d{9,10}$/.test(phone)
      &&['starters','movers','flyers','undecided','one','conversation'].includes(data.course),'Kiểm tra thông tin tư vấn.');
    const latest=user?await one('SELECT result FROM results WHERE user_id=? AND kind=? ORDER BY created_at DESC LIMIT 1',user.id,'placement'):null;
    const result=latest?JSON.parse(latest.result):null;
    const payload={name:data.name.trim(),group:data.group.trim(),phone,goal:data.goal.trim(),course:data.course,
      result:data.includeResult&&result?{scores:result.scores,recommendation:user.route||result.recommendation}:null};
    const leadId=await digest(JSON.stringify(payload));
    const previous=await one('SELECT * FROM leads WHERE id=?',leadId);
    if(!previous) {
      await throttle('consult:'+(req.headers.get('CF-Connecting-IP')||'local'),12,3600000);
      await run('INSERT INTO leads(id,payload,user_id) VALUES(?,?,?) ON CONFLICT(id) DO NOTHING',leadId,JSON.stringify(payload),user?.id??null);
    }
    return json({received:true,synced:await syncLead(previous||await one('SELECT * FROM leads WHERE id=?',leadId))});
  }

  need(user,'Vui lòng đăng nhập để tiếp tục.',401);
  const unlocked=async()=>!!await one('SELECT 1 FROM results WHERE user_id=? AND kind=?',user.id,'placement');
  if(scope==='account'&&id==='password'&&method==='POST') {
    const data=await body();
    need(string(data.current,128,10)&&string(data.next,128,10)&&data.current!==data.next,
      'Mật khẩu mới cần ít nhất 10 ký tự và phải khác mật khẩu hiện tại.');
    await throttle('password:'+user.id,12,900000);
    const existing=await one('SELECT password FROM users WHERE id=?',user.id);
    const [salt,hash]=existing.password.split(':');
    need(equals(await passwordHash(data.current,salt),hash),'Mật khẩu hiện tại chưa đúng.',401);
    const newSalt=random();
    const next=newSalt+':'+await passwordHash(data.next,newSalt);
    const token=random();
    const nextHash=await digest(token);
    const [updated]=await db.batch([
      query('UPDATE users SET password=? WHERE id=? AND password=?',next,user.id,existing.password),
      query('DELETE FROM sessions WHERE user_id=? AND EXISTS(SELECT 1 FROM users WHERE id=? AND password=?)',user.id,user.id,next),
      query('INSERT INTO sessions(token,user_id,expires) SELECT ?,id,? FROM users WHERE id=? AND password=?',nextHash,now+1209600000,user.id,next)
    ]);
    need(updated.meta.changes,'Mật khẩu đã thay đổi. Vui lòng đăng nhập lại.',409);
    return json({},200,{'Set-Cookie':sessionCookie(token,1209600)});
  }
  if(scope==='profile'&&method==='POST') {
    const data=await body();
    need(string(data.name,100)&&Number.isInteger(data.age)&&data.age>=3&&data.age<=120&&groups.includes(data.group));
    const update=await run('UPDATE users SET name=?,age=?,learner_group=? WHERE id=? AND learner_group IS NULL',data.name.trim(),data.age,data.group,user.id);
    need(update.meta.changes,'Nhóm học viên đã được thiết lập.',409);
    return json({});
  }
  if(scope==='history'&&method==='GET') {
    const rows=await all('SELECT paper,kind,result,created_at FROM results WHERE user_id=? ORDER BY created_at DESC',user.id);
    return json(rows.map(row=>{const result=JSON.parse(row.result);delete result.items;return {...row,result};}));
  }
  if(scope==='words') {
    if(method==='GET')return json((await all('SELECT word FROM saved_words WHERE user_id=?',user.id)).map(row=>row.word));
    if(method==='POST') {
      const data=await body();
      need(string(data.word,80)&&typeof data.saved==='boolean');
      await (data.saved?run('INSERT OR IGNORE INTO saved_words VALUES(?,?)',user.id,data.word):run('DELETE FROM saved_words WHERE user_id=? AND word=?',user.id,data.word));
      return json({});
    }
  }
  async function studentAssignment(assignmentId) {
    await prepareClassArchive();
    return one(`SELECT a.* FROM assignments a JOIN classes c ON c.id=a.class_id JOIN enrollment e ON e.class_id=a.class_id
      WHERE a.id=? AND a.published=1 AND e.student=? AND (a.student IS NULL OR a.student=?)
      AND (${activeClass} OR EXISTS(SELECT 1 FROM results r WHERE r.user_id=e.student AND r.paper=('assigned-'||a.id)))`,assignmentId,user.id,user.id);
  }
  if(scope==='assigned'&&method==='GET') {
    await prepareClassArchive();
    return json(await all(`SELECT a.id,a.title,c.title class_name,c.level,a.created_at,
      CASE WHEN r.paper IS NOT NULL THEN 'Đã nộp' WHEN d.paper IS NOT NULL THEN 'Đang làm' ELSE 'Chưa làm' END status
      FROM assignments a JOIN classes c ON a.class_id=c.id JOIN enrollment e ON e.class_id=c.id
      LEFT JOIN drafts d ON d.paper=('assigned-'||a.id) AND d.user_id=e.student
      LEFT JOIN results r ON r.paper=('assigned-'||a.id) AND r.user_id=e.student
      WHERE e.student=? AND a.published=1 AND (a.student IS NULL OR a.student=e.student) AND ${activeClass} ORDER BY a.created_at DESC`,user.id));
  }
  if(scope==='files'&&method==='GET') {
    const file=await one('SELECT u.*,c.teacher FROM uploads u JOIN assignments a ON a.id=u.assignment JOIN classes c ON c.id=a.class_id WHERE u.id=?',id);
    need(file&&(file.teacher===user.id||await studentAssignment(file.assignment)),'Tệp không có sẵn.',404);
    const object=await env.FILES?.get(id);
    need(object,'Tệp không có sẵn.',404);
    return new Response(object.body,{headers:{'Content-Type':file.type,'X-Content-Type-Options':'nosniff','Cache-Control':'private, no-store','Content-Disposition':file.type==='application/pdf'?'attachment':'inline'}});
  }
  async function getPaper(paperId) {
    if(paperId?.startsWith('assigned-')) {
      const assigned=await studentAssignment(paperId.slice(9));
      need(assigned,'Bài giao không có sẵn.',404);
      return {...JSON.parse(assigned.paper),id:paperId,kind:'assigned',title:assigned.title,release:assigned.release_at,
        files:await all('SELECT id,name,type FROM uploads WHERE assignment=?',assigned.id)};
    }
    const paper=papers[paperId];
    need(paper&&Object.hasOwn(papers,paperId),'Không tìm thấy bài.',404);
    return paper;
  }
  const publicPaper=paper=>({...paper,questions:paper.questions.map(({answer,accepted,transcript,explanation,...question})=>question)});
  function assessment(paper,answers) {
    const scores={};
    const items=paper.questions.map((q,i)=>{
      const selected=answers[i];
      const correct=q.open?null:[q.answer,...(q.accepted||[])].some(option=>normal(option)===normal(selected));
      if(correct!==null) {
        scores[q.skill]??={correct:0,total:0};
        scores[q.skill].total++;
        if(correct)scores[q.skill].correct++;
      }
      return {...q,selected,correct};
    });
    const points=Object.values(scores).reduce((sum,value)=>sum+value.correct,0);
    const ratio=points/paper.questions.length;
    let recommendation=null;
    let reason=null;
    if(paper.kind==='placement') {
      if(paper.level==='primary') {
        const blocks=[0,2,4].map(offset=>items.slice(offset,offset+2).filter(item=>item.correct).length);
        recommendation=blocks[0]===2&&blocks[1]===2&&blocks[2]>=1?'A2 Flyers':blocks[0]===2&&blocks[1]>=1?'A1 Movers':'Pre A1 Starters';
        reason='Số câu đúng theo ba nhóm tăng dần: '+blocks.join(' / ')+' (mỗi nhóm 2 câu).';
      } else {
        recommendation=paper.level==='preschool'?'Tiếng Anh mầm non':paper.level==='work'?(ratio>=0.75?'Tiếng Anh giao tiếp từ A2':'Ôn mẫu câu giao tiếp nền tảng'):'TOEIC nền tảng';
        reason=points+'/'+paper.questions.length+' câu đúng trong bài chẩn đoán nội bộ.';
      }
    }
    const topics=[...new Set(items.filter(item=>item.correct===false).map(item=>item.skill))];
    return {scores,items,recommendation,reason,revisionTopics:topics};
  }
  function resultView(paper,stored) {
    const result=JSON.parse(stored.result);
    if(paper.kind==='assigned'&&(paper.release===null||paper.release>now))delete result.items;
    return {...result,review:stored.review&&JSON.parse(stored.review)};
  }
  if(scope==='papers') {
    if(!(await unlocked()))need(user.learner_group&&id==='placement-'+user.learner_group,'Hãy nộp bài đầu vào của nhóm bạn trước.',403);
    const paper=await getPaper(id);
    const stored=await one('SELECT * FROM results WHERE user_id=? AND paper=?',user.id,id);
    if(method==='GET') {
      const draftRow=await one('SELECT answers,revision FROM drafts WHERE user_id=? AND paper=?',user.id,id);
      return json({paper:publicPaper(paper),draft:draftRow?{answers:JSON.parse(draftRow.answers),revision:draftRow.revision}:null,result:stored?resultView(paper,stored):null});
    }
    if(method==='POST'&&['draft','submit'].includes(action)) {
      if(stored)return json({result:resultView(paper,stored)});
      const {answers,revision}=await body();
      need(Array.isArray(answers)&&answers.length===paper.questions.length&&answers.every((value,i)=>value===null||(string(value,2000)&&(!paper.questions[i].options||paper.questions[i].options.includes(value)))));
      if(action==='draft') {
        need(Number.isInteger(revision)&&revision>=0);
        const saved=await run(`INSERT INTO drafts(user_id,paper,answers,revision)
          SELECT ?,?,?,1 WHERE ?=0 AND NOT EXISTS(SELECT 1 FROM results WHERE user_id=? AND paper=?)
          ON CONFLICT(user_id,paper) DO NOTHING`,user.id,id,JSON.stringify(answers),revision,user.id,id);
        if(!saved.meta.changes) {
          const updated=await run(`UPDATE drafts SET answers=?,revision=revision+1,updated_at=CURRENT_TIMESTAMP WHERE user_id=? AND paper=? AND revision=?
            AND NOT EXISTS(SELECT 1 FROM results WHERE user_id=? AND paper=?)`,JSON.stringify(answers),user.id,id,revision,user.id,id);
          need(updated.meta.changes,'Bài đã thay đổi trên thiết bị khác. Hãy tải lại để kiểm tra.',409);
        }
        return json({revision:revision+1});
      }
      need(Number.isInteger(revision)&&revision>=0);
      need(answers.every(answer=>answer!==null),'Hãy trả lời tất cả các câu trước khi nộp.');
      const result=assessment(paper,answers);
      await db.batch([
        query(`INSERT INTO results(user_id,paper,kind,result) SELECT ?,?,?,?
          WHERE ?=COALESCE((SELECT revision FROM drafts WHERE user_id=? AND paper=?),0)
          ON CONFLICT(user_id,paper) DO NOTHING`,user.id,id,paper.kind,JSON.stringify(result),revision,user.id,id),
        query('DELETE FROM drafts WHERE user_id=? AND paper=? AND EXISTS(SELECT 1 FROM results WHERE user_id=? AND paper=?)',user.id,id,user.id,id)
      ]);
      const submitted=await one('SELECT * FROM results WHERE user_id=? AND paper=?',user.id,id);
      need(submitted,'Bài đã thay đổi trên thiết bị khác. Hãy tải lại trước khi nộp.',409);
      return json({result:resultView(paper,submitted)});
    }
  }
  if(scope==='teacher') {
    need(user.role==='teacher','Chỉ giáo viên có quyền truy cập.',403);
    await prepareClassArchive();
    const ownedClass=async cid=>{
      const row=await one(`SELECT c.* FROM classes c WHERE c.id=? AND c.teacher=? AND ${activeClass}`,cid,user.id);
      need(row,'Không tìm thấy lớp.',404);
      return row;
    };
    const ownedAssignment=async aid=>{
      const row=await one(`SELECT a.* FROM assignments a JOIN classes c ON c.id=a.class_id WHERE a.id=? AND c.teacher=? AND ${activeClass}`,aid,user.id);
      need(row,'Không tìm thấy buổi học.',404);
      return row;
    };
    const enrolled=async(cid,sid)=>!!await one('SELECT 1 FROM enrollment WHERE class_id=? AND student=?',cid,sid);
    if(id==='classes'&&method==='GET') {
      const classes=await all(`SELECT c.* FROM classes c WHERE c.teacher=? AND ${activeClass} ORDER BY c.title`,user.id);
      const archived=await all('SELECT c.*,ac.archived_at FROM classes c JOIN archived_classes ac ON ac.class_id=c.id WHERE c.teacher=? ORDER BY ac.archived_at DESC',user.id);
      const students=await all(`SELECT e.class_id,u.id,u.name,u.email,u.route FROM enrollment e JOIN users u ON u.id=e.student JOIN classes c ON c.id=e.class_id WHERE c.teacher=? AND ${activeClass} ORDER BY u.name,u.email`,user.id);
      const assignments=await all(`SELECT a.id,a.class_id,a.student,a.title,a.published,a.release_at FROM assignments a JOIN classes c ON c.id=a.class_id WHERE c.teacher=? AND ${activeClass} ORDER BY a.created_at DESC`,user.id);
      return json({classes,archived,students,assignments});
    }
    if(id==='classes'&&action&&method==='POST') {
      const change=await body();
      need(change.action==='archive'||change.action==='restore');
      const owned=await one('SELECT 1 FROM classes WHERE id=? AND teacher=?',action,user.id);
      need(owned,'Không tìm thấy lớp.',404);
      if(change.action==='archive') {
        await run('INSERT INTO archived_classes(class_id) VALUES(?) ON CONFLICT(class_id) DO NOTHING',action);
      } else {
        await run('DELETE FROM archived_classes WHERE class_id=?',action);
      }
      return json({});
    }
    if(id==='classes'&&method==='POST') {
      const data=await body();
      need(string(data.title,120)&&levels.includes(data.level));
      const cid=random();
      await run('INSERT INTO classes VALUES(?,?,?,?)',cid,user.id,data.title.trim(),data.level);
      return json({id:cid});
    }
    if(id==='enroll'&&method==='POST') {
      const data=await body();
      await ownedClass(data.classId);
      const student=await one('SELECT id FROM users WHERE email=? AND role=?',cleanEmail(data.email),'student');
      need(student,'Không tìm thấy tài khoản học viên.',404);
      await run('INSERT OR IGNORE INTO enrollment VALUES(?,?)',data.classId,student.id);
      return json({});
    }
    if(id==='student'&&method==='GET') {
      const student=await one(`SELECT id,name,email,age,learner_group,route FROM users u WHERE id=?
        AND EXISTS(SELECT 1 FROM classes c JOIN enrollment e ON e.class_id=c.id WHERE c.teacher=? AND e.student=u.id AND ${activeClass})`,action,user.id);
      need(student,'Không tìm thấy học viên.',404);
      const results=(await all('SELECT paper,kind,result,review,created_at FROM results WHERE user_id=? ORDER BY created_at DESC',action)).map(row=>{
        const result=JSON.parse(row.result);
        delete result.items;
        return {...row,result};
      });
      const activity=await one('SELECT MAX(updated_at) date FROM drafts WHERE user_id=?',action);
      const missing=await all(`SELECT a.title,c.title class_name FROM assignments a JOIN classes c ON c.id=a.class_id
        JOIN enrollment e ON e.class_id=c.id WHERE c.teacher=? AND e.student=? AND ${activeClass} AND a.published=1 AND (a.student IS NULL OR a.student=e.student)
        AND NOT EXISTS(SELECT 1 FROM results r WHERE r.user_id=e.student AND r.paper=('assigned-'||a.id))`,user.id,action);
      return json({student,results,missing,lastActivity:[activity.date,results[0]?.created_at].filter(Boolean).sort().at(-1)||null});
    }
    if(id==='route'&&method==='POST') {
      const data=await body();
      need(string(data.route,120)&&string(data.student,64));
      const result=await run(`UPDATE users SET route=? WHERE id=? AND EXISTS(SELECT 1 FROM enrollment e JOIN classes c ON c.id=e.class_id WHERE e.student=users.id AND c.teacher=? AND ${activeClass})`,data.route.trim(),data.student,user.id);
      need(result.meta.changes,'Không tìm thấy học viên.',404);
      return json({});
    }
    if(id==='assignment'&&method==='POST') {
      const data=await body();
      const cls=await ownedClass(data.classId);
      const base=papers[data.paperId];
      need(string(data.title,120)&&(!data.student||await enrolled(cls.id,data.student))
        &&(!data.paperId||(base?.kind==='lesson'&&base.level===cls.level)));
      const custom=Array.isArray(data.questions)?data.questions:[];
      need(custom.length<=30&&custom.every(q=>string(q.prompt,500)&&['Nghe','Đọc','Viết'].includes(q.skill)
        &&(q.open===true||string(q.answer,300))&&(q.passage===undefined||string(q.passage,2000))
        &&(q.explanation===undefined||string(q.explanation,800))&&(q.transcript===undefined||string(q.transcript,3000))));
      const lesson=base?{...base,questions:[...base.questions]}:{level:cls.level,questions:[]};
      for(const q of custom) {
        let audio=null;
        if(q.file) {
          const file=await one('SELECT u.id FROM uploads u JOIN assignments a ON a.id=u.assignment WHERE u.id=? AND a.id=? AND a.class_id=? AND u.type LIKE ?',q.file,data.id||'',cls.id,'audio/%');
          need(file,'Tệp nghe không thuộc buổi này.');
          audio='/api/files/'+file.id;
        }
        need(q.skill!=='Nghe'||(audio&&q.transcript),'Câu nghe cần tệp âm thanh và transcript.');
        lesson.questions.push({skill:q.skill,prompt:q.prompt,open:q.open===true,
          ...(q.answer?{answer:q.answer}:{}),accepted:Array.isArray(q.accepted)?q.accepted.filter(v=>string(v,300)).slice(0,10):[],
          ...(q.passage?{passage:q.passage}:{}),...(audio?{audio,transcript:q.transcript}:{}),explanation:q.explanation||''});
      }
      const aid=data.id||random();
      if(data.id) {
        const prior=await ownedAssignment(aid);
        need(!prior.published&&prior.class_id===cls.id,'Chỉ chỉnh sửa được bản nháp.',409);
        const changed=await run('UPDATE assignments SET title=?,paper=?,student=? WHERE id=? AND published=0',data.title,JSON.stringify(lesson),data.student||null,aid);
        need(changed.meta.changes,'Buổi học đã xuất bản.',409);
      } else await run('INSERT INTO assignments(id,class_id,student,title,paper) VALUES(?,?,?,?,?)',aid,cls.id,data.student||null,data.title,JSON.stringify(lesson));
      return json({id:aid});
    }
    if(id==='assignment'&&method==='GET') {
      const a=await ownedAssignment(action);
      return json({...a,paper:JSON.parse(a.paper),files:await all('SELECT id,name,type FROM uploads WHERE assignment=?',a.id),
        submissions:(await all('SELECT r.user_id,u.name,u.email,r.result,r.review,r.created_at FROM results r JOIN users u ON u.id=r.user_id WHERE r.paper=? ORDER BY r.created_at DESC','assigned-'+a.id)).map(r=>({...r,result:JSON.parse(r.result),review:r.review?JSON.parse(r.review):null}))});
    }
    if(id==='files'&&method==='POST') {
      const a=await ownedAssignment(action);
      need(!a.published,'Chỉ tải tệp lên bản nháp.',409);
      need(env.FILES,'Chưa cấu hình kho tệp R2.',503);
      const type=req.headers.get('Content-Type');
      const name=url.searchParams.get('name');
      need(string(name,150)&&['application/pdf','image/png','image/jpeg','image/webp','audio/mpeg','audio/wav','audio/ogg','audio/mp4'].includes(type),'Định dạng tệp chưa hỗ trợ.');
      const limit=12*1024*1024;
      need(Number(req.headers.get('Content-Length'))<=limit,'Tệp tối đa 12 MB.',413);
      const source=await req.arrayBuffer();
      need(source.byteLength>0&&source.byteLength<=limit,'Tệp tối đa 12 MB.',413);
      const fid=random();
      await env.FILES.put(fid,source);
      try {
        const added=await run('INSERT INTO uploads(id,assignment,name,type) SELECT ?,id,?,? FROM assignments WHERE id=? AND published=0',fid,name,type,a.id);
        need(added.meta.changes,'Buổi học đã xuất bản.',409);
      } catch(error) {
        await env.FILES.delete(fid);
        throw error;
      }
      return json({id:fid});
    }
    if(id==='publish'&&method==='POST') {
      const a=await ownedAssignment(action);
      need(JSON.parse(a.paper).questions.length>0,'Thêm câu hỏi trước khi xuất bản.');
      await run('UPDATE assignments SET published=1 WHERE id=?',a.id);
      return json({});
    }
    if(id==='release'&&method==='POST') {
      const a=await ownedAssignment(action);
      const {release}=await body();
      need(release===null||(Number.isSafeInteger(release)&&release>=0));
      await run('UPDATE assignments SET release_at=? WHERE id=?',release,a.id);
      return json({});
    }
    if(id==='review'&&method==='POST') {
      const a=await ownedAssignment(action);
      const data=await body();
      need(string(data.student,64)&&string(data.comment,4000)&&Number.isFinite(data.score)&&data.score>=0&&data.score<=10);
      const changed=await run('UPDATE results SET review=? WHERE user_id=? AND paper=?',JSON.stringify({comment:data.comment,score:data.score}),data.student,'assigned-'+a.id);
      need(changed.meta.changes,'Chưa có bài nộp.',404);
      return json({});
    }
    if(id==='leads'&&method==='GET')return json((await all('SELECT * FROM leads ORDER BY created_at DESC LIMIT 200')).map(row=>({...row,payload:JSON.parse(row.payload)})));
    if(id==='leads'&&method==='POST') {
      const lead=await one('SELECT * FROM leads WHERE id=?',action);
      need(lead,'Không tìm thấy yêu cầu.',404);
      const data=await body();
      if(data.retry===true)return json({synced:await syncLead(lead)});
      need(['pending','received','contacted'].includes(data.status));
      await run('UPDATE leads SET status=? WHERE id=?',data.status,lead.id);
      return json({});
    }
  }
  return json({error:'Không tìm thấy đường dẫn.'},404);
}
