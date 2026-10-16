// jobs: [{key, seed, P(override)}] → 결과를 파일로
const {Worker} = require('worker_threads');
const path = require('path'), fs = require('fs');
const {loadEngine, defaultsP} = require('./lib.js');
const {E} = loadEngine([]);
const BASE = defaultsP(E);
function runJobs(jobs, nW, onDone){
  return new Promise(res => {
    let next = 0, done = 0; const out = [];
    const t0 = Date.now();
    const ws = [];
    for (let i = 0; i < Math.min(nW, jobs.length); i++){
      const w = new Worker(path.join(__dirname, 'worker.js')); ws.push(w);
      const give = () => { if (next >= jobs.length){ w.terminate(); return; } const j = jobs[next++]; w.cur = j; w.postMessage({P:Object.assign({}, BASE, j.P), seed:j.seed, keepLog:j.keepLog}); };
      w.on('message', m => { const j = w.cur; out.push({key:j.key, seed:j.seed, err:m.err, r:m.r}); done++; if (onDone) onDone(j, m); if (done % 4 === 0 || done === jobs.length) process.stderr.write(`${done}/${jobs.length} ${((Date.now() - t0) / 1000).toFixed(0)}s\n`); if (done === jobs.length) res(out); give(); });
      w.on('error', e => { console.error('worker error', e); });
      give();
    }
  });
}
module.exports = {runJobs, BASE, E};
