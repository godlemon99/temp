// 엔진 로드 + 패치 + readSettings 흉내
const fs = require('fs'), path = require('path'), vm = require('vm');
const DIR = __dirname;
function loadEngine(patches){
  let src = fs.readFileSync(path.join(DIR, 'engine.js'), 'utf8');
  const cnt = [];
  for (const [a, b] of (patches || [])){ const n = src.split(a).length - 1; cnt.push(n); src = src.split(a).join(b); }
  const ctx = {console, Math, Date, JSON, Object, Array, Number, String, Boolean, Infinity, NaN, isFinite, isNaN, parseInt, parseFloat, Map, Set, Error, RegExp, Symbol, Float64Array, Int32Array, Uint32Array};
  ctx.self = ctx;
  vm.createContext(ctx);
  vm.runInContext(src, ctx, {filename:'engine.js'});
  return {E: ctx.Engine, cnt};
}
function defaultsP(E){
  // readSettings(): FIELDS 순회, select 기본값이 선택지에 없으면 첫 선택지
  const fsrc = fs.readFileSync(path.join(DIR, 'fields.js'), 'utf8');
  const FIELDS = new Function('E', 'const CRY_KEYS_HELP = "";' + fsrc + '; return FIELDS;')(E);
  const saved = Object.assign({}, E.DEFAULTS);
  const P = {};
  FIELDS.forEach(grp => grp.items.forEach(([key, , type, , opts]) => {
    let v = String(saved[key]);
    if (type === 'select' && !opts.some(o => o[0] === v)) v = opts[0][0];
    if (type === 'int') P[key] = Math.round(parseFloat(v) || 0);
    else if (type === 'num') P[key] = parseFloat(v) || 0;
    else P[key] = v;
  }));
  P.runs = Math.max(1, Math.min(500, P.runs)); P.goal = parseInt(P.goal, 10) || 56;
  return P;
}
module.exports = {loadEngine, defaultsP};
