// 회귀 테스트: 현재 src/astro.js 의 계산 결과가 기준값(tests/golden.json)과 같은지 확인한다.
// 기준값은 2007~2016년 astronote.org 에서 쓰던 원본(압축본)의 출력이다.
//   DE406_FILE=/path/lnxm3000p3000.406 npm test
"use strict";
const { load, compute } = require("./harness");
const golden = require("./golden.json");

const de406 = process.env.DE406_FILE;
if (!de406) { console.error("DE406_FILE 환경 변수를 지정하세요 (scripts/get-de406.sh 로 받을 수 있음)"); process.exit(2); }
const got = JSON.parse(compute(load(__dirname + "/../src/astro.js", de406)));

let fails = 0;
function walk(a, b, path) {
    if (Array.isArray(a)) return a.forEach((x, i) => walk(x, b[i], path + "[" + i + "]"));
    if (typeof a === "number") {
        const tol = 1e-9 * Math.max(1, Math.abs(a));
        if (!(Math.abs(a - b) <= tol)) { fails++; if (fails < 20) console.log("다름", path, a, b); }
    } else if (a !== b) { fails++; console.log("다름", path, a, b); }
}
for (const k of Object.keys(golden)) walk(golden[k], got[k], k);
console.log(fails ? `실패 ${fails}건` : "통과: 모든 값이 기준값과 같습니다");
process.exit(fails ? 1 : 0);
