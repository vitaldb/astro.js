// 음력 변환 검사: sol2lun / lun2sol 을 한국천문연구원(KASI) 음양력 자료와 날마다 비교한다.
// tests/kasi_lunar.json 은 scripts/gen_lunar_table.py --fixture 로 만든다(음력 1841~2050년 모든 달).
// DE406 파일이 필요 없다:  node tests/lunar_test.js
"use strict";
const fs = require("fs");
const vm = require("vm");

function run() {
    // vm 샌드박스의 전역 변수 접근은 느려서, 이 검사는 Node 전역에 바로 올린다.
    vm.runInThisContext(fs.readFileSync(__dirname + "/../src/astro.js", "utf8"));
    const ctx = globalThis;
    const { months } = JSON.parse(fs.readFileSync(__dirname + "/kasi_lunar.json", "utf8"));
    let fails = 0, days = 0;
    const fail = (msg) => { fails++; if (fails <= 20) console.log("다름", msg); };
    const DAY = 86400000;
    for (const [y, m, leap, start, n] of months) {
        const t0 = Date.parse(start + "T00:00:00Z");
        for (let d = 1; d <= n; d++) {
            const s = new Date(t0 + (d - 1) * DAY);
            const sy = s.getUTCFullYear(), sm = s.getUTCMonth() + 1, sd = s.getUTCDate();
            days++;
            if (sy <= 2050) {
                const l = ctx.sol2lun(sy, sm, sd);
                if (l.year !== y || l.month !== m || l.day !== d || l.leap !== leap)
                    fail(`sol2lun(${sy},${sm},${sd}) = ${JSON.stringify(l)}, KASI ${y}/${leap ? "윤" : ""}${m}/${d}`);
            }
            if (d === 1 || d === n) {
                const r = ctx.lun2sol(y, m, d, leap);
                if (r.year !== sy || r.month !== sm || r.day !== sd)
                    fail(`lun2sol(${y},${m},${d},${leap}) = ${JSON.stringify(r)}, KASI ${sy}-${sm}-${sd}`);
            }
        }
    }
    // 표 범위 밖은 0 을 돌려준다(예전에는 2042년 이후 sol2lun 이 TypeError)
    const zero = (o) => o.year === 0 && o.month === 0 && o.day === 0;
    if (!zero(ctx.sol2lun(1841, 1, 22))) fail("sol2lun(1841,1,22) 범위 밖");
    if (!zero(ctx.sol2lun(2051, 3, 1))) fail("sol2lun(2051,3,1) 범위 밖");
    if (!zero(ctx.sol2lun(2100, 1, 1))) fail("sol2lun(2100,1,1) 범위 밖");
    if (!zero(ctx.lun2sol(2051, 1, 1))) fail("lun2sol(2051,1,1) 범위 밖");
    if (!zero(ctx.lun2sol(1840, 12, 1))) fail("lun2sol(1840,12,1) 범위 밖");
    console.log(fails ? `음력: 실패 ${fails}건` : `음력: 통과 (KASI 자료 ${months.length}개월, ${days}일)`);
    return fails;
}
if (require.main === module) process.exit(run() ? 1 : 0);
module.exports = { run };
