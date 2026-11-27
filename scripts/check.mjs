import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {papers} from '../server/bank.js';
import {catalog,vocab,sample} from '../public/content.js';

const audio=new Set([sample.audio,sample.instructions,...vocab.map(w=>w.audio)]);
const bank=new Set();
for(const level of ['starters','movers','flyers']) {
  for(const kind of ['lesson','practice']) {
    const sets=Object.values(papers).filter(p=>p.level===level&&p.kind===kind);
    assert.equal(sets.length,10);
    for(const p of sets) {
      const fingerprint=p.questions.map(q=>q.prompt+q.transcript+q.passage).join('|');
      assert(!bank.has(fingerprint));
      bank.add(fingerprint);
      assert(p.questions.some(q=>q.skill==='Nghe'));
      assert(p.questions.some(q=>q.skill==='Đọc'));
      if(kind==='lesson')assert(p.objective&&p.application&&p.vocab.length);
    }
  }
}
for(const level of ['preschool','primary','middle','high','college','work']) {
  assert(papers['placement-'+level]?.questions.length>=4);
}
for(const p of Object.values(papers)) {
  for(const q of p.questions) {
    assert(q.options ? q.options.includes(q.answer) : q.answer);
    assert(q.explanation);
    if(q.skill==='Nghe') {
      assert(q.transcript);
      assert(q.audio);
      audio.add(q.audio);
    }
    if(p.level==='preschool')assert(q.audio&&q.pictures?.length===3);
  }
}
assert.equal(catalog.length,Object.keys(papers).length);
for(const path of audio) {
  const seconds=Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0','public'+path],{encoding:'utf8'}));
  assert(seconds>0,path);
}
console.log('OK: 30 bài luyện, 30 bộ trên lớp, 3 buổi mẫu, 6 bài đầu vào, '+audio.size+' MP3 giải mã được.');
