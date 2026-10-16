// 워커: engine.js에 patches.json(기록용 패치)을 적용해 판 하나씩 돌림
const {parentPort} = require('worker_threads');
const fs = require('fs'), path = require('path');
const {loadEngine} = require('./lib.js');
const PATCHES = JSON.parse(fs.readFileSync(process.env.PATCHES || path.join(__dirname, 'patches.json'), 'utf8'));
let E = null;
parentPort.on('message', ({P, seed, keepLog}) => {
  if (!E){ const r = loadEngine(PATCHES); E = r.E; if (r.cnt.some(c => c !== 1)) { parentPort.postMessage({err:'patch count ' + r.cnt.join(',') + ' — HTML이 바뀌어 패치 문자열이 안 맞음, patches.json을 고쳐야 함'}); return; } }
  try {
    const r = E.run(P, seed, !!keepLog);
    if (!keepLog) r.log = null; r.samples = null;
    parentPort.postMessage({r});
  } catch (e){ parentPort.postMessage({err:String(e && e.stack || e)}); }
});
