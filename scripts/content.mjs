import {readFileSync,writeFileSync,mkdirSync,existsSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';

mkdirSync('public/audio',{recursive:true});
const temp = mkdtempSync(join(tmpdir(),'sunny-audio-'));
function audio(transcript) {
  const id = createHash('sha256').update(transcript).digest('hex').slice(0,20);
  const dst = 'public/audio/'+id+'.mp3';
  if (!existsSync(dst)) {
    const parts = transcript.split(' / ');
    for (const [i,line] of parts.entries()) {
      const source = join(temp,i+'.txt');
      writeFileSync(source,line);
      execFileSync('ffmpeg',['-loglevel','error','-y','-f','lavfi','-i',
        'flite=textfile='+source+':voice='+ (i%2?'slt':'rms'),'-af','atempo=0.89,apad=pad_dur=0.35',
        join(temp,i+'.wav')]);
    }
    writeFileSync(join(temp,'parts.txt'),parts.map((_,i)=>"file '"+i+".wav'").join('\n'));
    execFileSync('ffmpeg',['-loglevel','error','-y','-f','concat','-safe','0','-i',join(temp,'parts.txt'),'-af','loudnorm=I=-19:TP=-2:LRA=8','-b:a','48k',dst]);
  }
  return '/audio/'+id+'.mp3';
}
const rows = file => readFileSync('scripts/'+file+'.txt','utf8').trim().split('\n').map(line=>line.split('|'));
const papers = {};
const pict = {cat:'🐱',dog:'🐶',bird:'🐦',duck:'🦆',fish:'🐟',frog:'🐸',red:'🔴',green:'🟢',blue:'🔵',yellow:'🟡',ball:'⚽',train:'🚂',kite:'🪁','one apple':'🍎','two apples':'🍎🍎','three apples':'🍎🍎🍎',pen:'🖊️',bag:'🎒',shoe:'👟',chair:'🪑',table:'🛋️',bed:'🛏️',orange:'🍊',banana:'🍌',pear:'🍐',one:'1️⃣',two:'2️⃣',three:'3️⃣',white:'⚪',pink:'🩷',brown:'🟤'};
for (const [file,kind] of [['stories','practice'],['lessons','lesson'],['placement','placement']]) {
  const counters = {};
  for (const [level,title,spoken,lq,la,lb,lc,le,reading,rq,ra,rb,rc,re] of rows(file)) {
    const n = counters[level] = (counters[level]||0)+1;
    const id = [kind,level,...(kind==='placement'?[]:[n])].join('-');
    const paper = papers[id] ??= {id,kind,level,title:kind==='placement'?'Bài đầu vào':title,questions:[]};
    for (const [skill, passage, prompt, answer, wrong1, wrong2, explanation] of [
      ['Nghe',spoken,lq,la,lb,lc,le],
      [level==='preschool'?'Nghe':'Đọc',reading,rq,ra,rb,rc,re],
    ]) {
      const offset = (n+paper.questions.length)%3;
      const options = [wrong1,wrong2];
      options.splice(offset,0,answer);
      const pictures = ['preschool','starters','primary'].includes(level) && options.every(option=>pict[option]);
      const fromAudio = skill==='Nghe';
      paper.questions.push({skill,prompt,options,pictures:pictures?options.map(option=>pict[option]):null,
        ...(fromAudio?{audio:audio(passage),transcript:passage}:{passage}), answer,explanation});
    }
    if(kind==='lesson') {
      paper.objective = 'Nghe lấy chi tiết và đọc hiểu chủ đề '+title.toLowerCase()+'.';
      paper.vocab = [...new Set([la,ra])];
      paper.application = 'Nói hoặc viết một câu mới về chủ đề “'+title+'” với một từ hoặc cụm từ trong bài.';
    }
  }
}
const extraCount = {};
for(const [level,spoken,lq,la,lb,lc,le,reading,rq,ra,rb,rc,re,wq,wa,variant,we] of rows('practice-extra')) {
  const n=extraCount[level]=(extraCount[level]||0)+1;
  const paper=papers['practice-'+level+'-'+n];
  const listenOptions=[lb,lc];
  const readOptions=[rb,rc];
  listenOptions.splice(n%3,0,la);
  readOptions.splice((n+2)%3,0,ra);
  paper.questions.push(
    {skill:'Nghe',prompt:lq,options:listenOptions,audio:audio(spoken),transcript:spoken,answer:la,explanation:le},
    {skill:'Đọc',prompt:rq,options:readOptions,passage:reading,answer:ra,explanation:re},
    {skill:'Viết',prompt:wq,answer:wa,accepted:variant?[variant]:[],explanation:we}
  );
  paper.questions.sort((a,b)=>['Nghe','Đọc','Viết'].indexOf(a.skill)-['Nghe','Đọc','Viết'].indexOf(b.skill));
}
for(const level of ['preschool','college','work']) {
  const paper=papers['placement-'+level];
  papers['lesson-'+level+'-sample']={...paper,id:'lesson-'+level+'-sample',kind:'lesson',
    title:{preschool:'Nghe và nhận biết tranh',college:'Đọc thông báo và nghe lịch hẹn',work:'Hẹn lịch và trao đổi công việc'}[level],
    objective:'Nghe lấy chi tiết và thực hành lại mẫu câu.',
    application:level==='preschool'?'Chỉ vào một đồ chơi khi giáo viên đọc tên.':'Đóng vai và tạo một lịch hẹn mới.'};
}
const vocab=rows('vocab').map(([level,topic,word,meaning,picture,example])=>({level,topic,word,meaning,picture,example,audio:audio(word)}));
const sample={instructions:'/audio/preschool-instructions-vi.mp3',audio:audio('Touch the ball.'),picture:'⚽'};
const exportJson = value=>JSON.stringify(value);
writeFileSync('server/bank.js','export const papers = '+exportJson(papers)+';\n');
writeFileSync('public/content.js','export const vocab = '+exportJson(vocab)+';\nexport const sample = '+exportJson(sample)+';\nexport const catalog = '+exportJson(Object.values(papers).map(({id,kind,level,title,questions})=>({id,kind,level,title,count:questions.length})))+';\n');
rmSync(temp,{recursive:true,force:true});
