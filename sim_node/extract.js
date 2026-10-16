// node extract.js — ../DPS_최속성장_시뮬레이터.html에서 engine.js(엔진)와 fields.js(설정 칸)를 꺼냄. HTML을 고칠 때마다 다시 실행
const fs = require('fs'), path = require('path');
const h = fs.readFileSync(path.join(__dirname, '..', 'DPS_최속성장_시뮬레이터.html'), 'utf8');
const m = h.match(/<script id="engine-src" type="text\/plain">([\s\S]*?)<\/script>/);
const i = h.indexOf('const FIELDS = ['), j = h.indexOf('\n];\n', i) + 4;
fs.writeFileSync(path.join(__dirname, 'engine.js'), m[1]);
fs.writeFileSync(path.join(__dirname, 'fields.js'), h.slice(i, j));
console.log('engine.js', m[1].length, 'fields.js', j - i);
