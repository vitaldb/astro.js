// 회귀 테스트: 현재 src/astro.js 의 계산 결과가 기준값(tests/golden.json)과 같은지 확인한다.
// 기준값: tests/golden.json 은 v1.1 의 출력, tests/golden_v1.json 은 2007~2026년 astronote.org 에서 쓰던
// 원본(압축본, v1.0)의 출력이다(v1.1 의 정확도 수정으로 바뀐 값은 CHANGELOG.md 참고).
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
        // 율리우스일(~2.4e6)에 상대오차 1e-9 를 쓰면 3분까지 통과하므로 절대 허용오차를 쓴다:
        // 1e-8 (일 단위면 1 ms, 라디안이면 0.002″) 또는 아주 큰 수는 상대 1e-14
        const tol = Math.max(1e-8, 1e-14 * Math.abs(a));
        if (!(Math.abs(a - b) <= tol)) { fails++; if (fails < 20) console.log("다름", path, a, b); }
    } else if (a !== b) { fails++; console.log("다름", path, a, b); }
}
for (const k of Object.keys(golden)) walk(golden[k], got[k], k);
console.log(fails ? `실패 ${fails}건` : "통과: 모든 값이 기준값과 같습니다");
const lunarFails = require("./lunar_test").run();
process.exit(fails || lunarFails ? 1 : 0);
