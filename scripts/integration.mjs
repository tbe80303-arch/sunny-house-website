import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {papers} from '../server/bank.js';

const origin=process.env.SUNNY_TEST_ORIGIN||'http://localhost:8788';
assert(['localhost','127.0.0.1'].includes(new URL(origin).hostname),'Use a local test server.');
const tag=randomUUID().slice(0,8);
const password='Local-test-'+tag+'-only';
const email=group=>'local-'+tag+'-'+group+'@example.test';

function client() {
  let cookie='';
  return async (path,{method='GET',body,raw,expected=200}={})=>{
    const response=await fetch(origin+'/api/'+path,{method,headers:{Origin:origin,Cookie:cookie,
      ...(raw?{'Content-Type':raw.type}:body?{'Content-Type':'application/json'}:{})},body:raw?.data??(body&&JSON.stringify(body))});
    const auth=response.headers.get('Set-Cookie');
    if(auth)cookie=auth.split(';')[0];
    const data=response.headers.get('Content-Type')?.startsWith('application/json')?await response.json():new Uint8Array(await response.arrayBuffer());
    assert.equal(response.status,expected,path+' '+JSON.stringify(data).slice(0,250));
    return data;
  };
}
const post=(request,path,body,expected)=>request(path,{method:'POST',body,expected});
async function signup(group,age) {
  const request=client();
  await post(request,'auth/register',{email:email(group),password});
  if(age)await post(request,'profile',{name:'Kiểm thử '+group,group,age});
  return request;
}
const values=id=>papers[id].questions.map(q=>q.answer);

const little=await signup('preschool',5);
await post(little,'profile',{name:'Đổi nhóm',age:5,group:'college'},409);
await little('papers/placement-college',{expected:403});
await little('papers/practice-starters-1',{expected:403});
const first=await little('papers/placement-preschool');
assert(first.paper.questions.every(q=>q.pictures&&q.audio&&!q.answer));
assert((await fetch(origin+first.paper.questions[0].audio)).headers.get('Content-Type')?.includes('audio'));
const firstAnswers=values('placement-preschool');
await post(little,'papers/placement-preschool/submit',{answers:firstAnswers.map(()=>null),revision:0},400);
const initial=await post(little,'papers/placement-preschool/draft',{answers:[firstAnswers[0],...firstAnswers.slice(1).map(()=>null)],revision:0});
assert.equal(initial.revision,1);
const device=client();
await post(device,'auth/login',{email:email('preschool'),password});
assert.equal((await device('papers/placement-preschool')).draft.answers[0],firstAnswers[0]);
await post(device,'papers/placement-preschool/draft',{answers:firstAnswers,revision:0},409);
const submitted=await Promise.all([little,device].map(request=>post(request,'papers/placement-preschool/submit',{answers:firstAnswers,revision:1})));
assert.deepEqual(submitted[0],submitted[1]);
assert.equal((await little('history')).length,1);
assert((await device('auth')).unlocked);
await post(little,'account/password',{current:password,next:password+'-new'});
assert.equal((await device('auth')).user,null);
await post(device,'auth/login',{email:email('preschool'),password:password+'-new'});
await device('papers/practice-starters-1');

for(const [group,recommendation] of [['college','TOEIC nền tảng'],['work','Tiếng Anh giao tiếp từ A2']]) {
  const learner=await signup(group,20);
  const id='placement-'+group;
  assert.equal((await learner('papers/'+id)).paper.level,group);
  const {result}=await post(learner,'papers/'+id+'/submit',{answers:values(id),revision:0});
  assert.equal(result.recommendation,recommendation);
}
const anon=client();
const lead={name:'Gia đình QA '+tag,group:'Tiểu học',phone:'0900000000',goal:'Nghe hiểu',course:'starters'};
assert((await post(anon,'consult',lead)).received);
await post(anon,'consult',lead);

const teacher=await signup('teacher');
await teacher('teacher/classes',{expected:403});
execFileSync('node',['node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--config','wrangler.local.toml','--command',
  "UPDATE users SET role='teacher' WHERE email='"+email('teacher')+"'"],{stdio:'ignore'});
const cls=await post(teacher,'teacher/classes',{title:'Lớp QA',level:'starters'});
await post(teacher,'teacher/enroll',{classId:cls.id,email:email('preschool')});
const lesson=await post(teacher,'teacher/assignment',{title:'Buổi có audio',classId:cls.id,paperId:'lesson-starters-1'});
const sound=await readFile('public'+first.paper.questions[0].audio);
const file=await teacher('teacher/files/'+lesson.id+'?name=test.mp3',{method:'POST',raw:{type:'audio/mpeg',data:sound}});
await little('files/'+file.id,{expected:404});
await post(teacher,'teacher/assignment',{id:lesson.id,title:'Buổi có audio',classId:cls.id,paperId:'lesson-starters-1',
  questions:[{skill:'Nghe',prompt:'Chạm vào con mèo.',file:file.id,transcript:'Touch the cat.',answer:'cat',accepted:['a cat']},
    {skill:'Viết',prompt:'Viết tên một con vật.',open:true}]});
await post(teacher,'teacher/publish/'+lesson.id,{});
assert.equal((await little('assigned'))[0].status,'Chưa làm');
assert.equal((await little('files/'+file.id)).length,sound.length);
const answer=[...values('lesson-starters-1'),'A cat.','Dog'];
await post(little,'papers/assigned-'+lesson.id+'/draft',{answers:[...answer.slice(0,1),null,null,null],revision:0});
assert.equal((await little('assigned'))[0].status,'Đang làm');
const assigned=await post(little,'papers/assigned-'+lesson.id+'/submit',{answers:answer,revision:1});
assert(!assigned.result.items);
assert.equal(assigned.result.scores['Nghe'].correct,2);
assert.equal((await little('assigned'))[0].status,'Đã nộp');
const detail=await teacher('teacher/assignment/'+lesson.id);
assert.equal(detail.submissions[0].result.items[3].selected,'Dog');
const sid=detail.submissions[0].user_id;
await post(teacher,'teacher/review/'+lesson.id,{student:sid,comment:'Làm tốt.',score:9});
await post(teacher,'teacher/release/'+lesson.id,{release:0});
const release=await little('papers/assigned-'+lesson.id);
assert.equal(release.result.items.length,4);
assert.equal(release.result.review.score,9);
assert.equal((await teacher('teacher/student/'+sid)).missing.length,0);
await post(little,'teacher/classes/'+cls.id,{action:'archive'},403);
await post(teacher,'teacher/classes/'+cls.id,{action:'archive'});
await post(teacher,'teacher/classes/'+cls.id,{action:'archive'});
const archived=await teacher('teacher/classes');
assert(!archived.classes.some(row=>row.id===cls.id));
assert(archived.archived.some(row=>row.id===cls.id));
assert(!archived.assignments.some(row=>row.id===lesson.id));
assert.equal((await little('assigned')).length,0);
assert.equal((await little('papers/assigned-'+lesson.id)).result.review.score,9);
await teacher('teacher/assignment/'+lesson.id,{expected:404});
await post(teacher,'teacher/classes/'+cls.id,{action:'restore'});
assert.equal((await little('assigned'))[0].status,'Đã nộp');
assert.equal((await teacher('teacher/assignment/'+lesson.id)).submissions.length,1);
const online=await post(teacher,'teacher/assignment',{title:'Buổi học qua video',classId:cls.id});
await post(teacher,'teacher/publish/'+online.id,{},400);
await post(teacher,'teacher/assignment',{id:online.id,title:'Buổi học qua video',classId:cls.id,onlineType:'video',onlineUrl:'javascript:alert(1)'},400);
await post(teacher,'teacher/assignment',{id:online.id,title:'Buổi học qua video',classId:cls.id,onlineType:'video',onlineUrl:'https://youtu.be/example'});
assert.equal((await teacher('teacher/assignment/'+online.id)).paper.onlineLink.url,'https://youtu.be/example');
await little('papers/assigned-'+online.id,{expected:404});
await post(teacher,'teacher/publish/'+online.id,{});
assert.equal((await little('assigned')).find(row=>row.id===online.id).status,'Tài liệu online');
assert.equal((await little('papers/assigned-'+online.id)).paper.onlineLink.type,'video');
await post(little,'papers/assigned-'+online.id+'/submit',{answers:[],revision:0},400);
await post(little,'teacher/online-link/'+online.id,{onlineType:'meeting',onlineUrl:'https://meet.google.com/abc-defg-hij'},403);
await post(teacher,'teacher/online-link/'+online.id,{onlineType:'meeting',onlineUrl:'https://meet.google.com/abc-defg-hij'});
assert.equal((await little('papers/assigned-'+online.id)).paper.onlineLink.type,'meeting');
await post(teacher,'teacher/online-link/'+online.id,{onlineUrl:''},400);
assert.equal((await teacher('teacher/student/'+sid)).missing.length,0);
const leads=(await teacher('teacher/leads')).filter(row=>row.payload.name===lead.name);
assert.equal(leads.length,1);
await post(teacher,'teacher/leads/'+leads[0].id,{status:'contacted'});
assert.equal((await teacher('teacher/leads')).find(row=>row.id===leads[0].id).status,'contacted');
console.log('OK: placement, server lock, cross-device drafts, duplicate submissions, teacher permissions, R2 upload, assignment and review, class archive and restore, lesson links, consult deduplication.');
