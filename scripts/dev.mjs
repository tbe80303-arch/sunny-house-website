import {spawn} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';

const localConfig=resolve('.wrangler/config');
mkdirSync(localConfig,{recursive:true});
const args=process.argv.slice(2).flatMap(option=>{
  if(option==='--strictPort')return [];
  if(option.startsWith('--host='))return ['--ip='+option.slice(7)];
  return [option==='--host'?'--ip':option];
});
const child=spawn(process.execPath,['node_modules/wrangler/bin/wrangler.js','pages','dev','public','--d1','DB=00000000-0000-0000-0000-000000000000','--r2','FILES','--compatibility-date','2026-11-01',...args],{
  env:{...process.env,XDG_CONFIG_HOME:process.env.XDG_CONFIG_HOME||localConfig},
  stdio:'inherit'
});
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>child.kill(signal));
child.on('exit',code=>{process.exitCode=code||0;});
