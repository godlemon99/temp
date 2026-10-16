// node sum.js results/x.json [baseKey]  — 짝 비교 표
const fs = require('fs');
const res = JSON.parse(fs.readFileSync(process.argv[2]));
const baseKey = process.argv[3] || 'base';
const H = x => x == null ? NaN : x / 3600;
const med = a => { const s = a.filter(Number.isFinite).sort((x, y) => x - y); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : NaN; };
const mean = a => { const b = a.filter(Number.isFinite); return b.length ? b.reduce((x, y) => x + y, 0) / b.length : NaN; };
const se = a => { const b = a.filter(Number.isFinite); if (b.length < 2) return NaN; const m = mean(b); return Math.sqrt(b.reduce((x, y) => x + (y - m) ** 2, 0) / (b.length - 1) / b.length); };
const metr = {e60:r => H(r.e60T && r.e60T['0.693']), e20:r => H(r.e60T && r.e60T['20']), fuse:r => H(r.fuseStartT), f57:r => H(r.firstT[57]), f58:r => H(r.firstT[58]), f59:r => H(r.firstT[59]), v52:r => H(r.v52T), mol:r => H(r.aw12T)};
const base = res[baseKey] || [];
const bySeed = Object.fromEntries(base.map(r => [r.seed, r]));
const fmt = (x, d = 1) => Number.isFinite(x) ? x.toFixed(d) : '-';
console.log(['변형', 'n', '첫60(중앙)', 'Δ±se', '20기', 'Δ±se', '융합', '융합단수(억)', '첫57', '첫58', '52/52', '52/52단수', '몰기끝', '첫59', '못감'].join(' | '));
for (const [k, arr] of Object.entries(res)){
  const row = [k, arr.length];
  for (const m of ['e60', 'e20']){
    row.push(fmt(med(arr.map(metr[m]))));
    const d = arr.filter(r => bySeed[r.seed]).map(r => metr[m](r) - metr[m](bySeed[r.seed]));
    row.push(k === baseKey ? '' : `${fmt(mean(d), 2)}±${fmt(se(d), 2)}`);
  }
  row.push(fmt(med(arr.map(metr.fuse))), fmt(med(arr.map(r => r.fuseAw / 1e8)), 2), fmt(med(arr.map(metr.f57))), fmt(med(arr.map(metr.f58))), fmt(med(arr.map(metr.v52))), fmt(med(arr.map(r => r.v52Aw / 1e8)), 2), fmt(med(arr.map(metr.mol))), fmt(med(arr.map(metr.f59))), arr.filter(r => !(r.e60T && r.e60T['0.693'])).length);
  console.log(row.join(' | '));
}
