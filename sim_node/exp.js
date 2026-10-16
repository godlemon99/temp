// node exp.js spec.json → results/<name>.json (변형별 판 결과). spec = {name, seeds:[..], common:{..}, variants:{이름:{설정 덮어쓰기}}, lite:true}
// 같은 이름으로 다시 돌리면 이미 있는 (변형, 시드)는 건너뜀 — 판 수를 늘릴 때 그대로 쓰면 됨
const {runJobs} = require('./pool.js');
const fs = require('fs'), path = require('path');
const spec = JSON.parse(fs.readFileSync(process.argv[2]));
const COMMON = {goal60End:'e1', e60Stop:1, ev60:false, snapEvery:1800, maxHours:200};   // e1 = 60강 기대값으로 끝(운 뺀 비교) · e60Stop 20이면 20기까지
const slim = r => { const q = (r.snaps || []).find(s => s.ql && [0, 2, 3, 4].every(i => s.ql[i] >= 10));
  return {seed:r.seed, e60T:r.e60T, firstT:{57:r.firstT[57], 58:r.firstT[58], 59:r.firstT[59]}, fuseStartT:r.fuseStartT, fuseAw:r.fuseAw, v52T:r.v52T, v52Aw:r.v52Aw, aw12T:r.aw12T, cap:r.cap, q10:q ? q.t : null,
    snaps:(r.snaps || []).map(s => ({t:s.t, aw:s.aw, ex:s.exLv, vend:s.vend, p57:s.p57, p58:s.p58, ql:s.ql, ex7:s.ex7, spent:s.spent, ep:s.ep, mstep:s.mstep, cr:s.cr, n56:s.n56, money:s.money, hg:s.hg,
      orb:s.orb && {sp:s.orb.sp, save:s.orb.save, status:s.orb.status, exp:s.orb.exp, pr:s.orb.pr, mine:s.orb.mine}})), orbSeq:spec.lite ? undefined : r.orbSeq}; };
(async () => {
  fs.mkdirSync(path.join(__dirname, 'results'), {recursive:true});
  const jobs = [];
  for (const s of spec.seeds) for (const [k, ov] of Object.entries(spec.variants)) jobs.push({key:k, seed:s, P:Object.assign({}, COMMON, spec.common || {}, ov)});
  const file = path.join(__dirname, 'results', spec.name + '.json');
  const res = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : {};
  const todo = jobs.filter(j => !(res[j.key] || []).some(x => x.seed === j.seed));
  let n = 0;
  await runJobs(todo, spec.workers || 4, (j, m) => { if (m.err){ console.error(j.key, j.seed, m.err.slice(0, 500)); return; } (res[j.key] = res[j.key] || []).push(slim(m.r)); if (++n % 16 === 0) fs.writeFileSync(file, JSON.stringify(res)); });
  fs.writeFileSync(file, JSON.stringify(res));
  console.error('saved', file);
})();
