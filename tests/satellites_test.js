// 위성 검사: GetSatellites() 를 JPL Horizons 기준값(tests/horizons_satellites.json, 2026-09 ~ 2030-09 다섯 시점)과 비교한다.
// 행성 위치·거리는 기준값을 그대로 넣고, 위성 위치 오차(각초)만 본다. DE406 파일이 필요 없다:  node tests/satellites_test.js
// 기준값은 scripts/make_satellite_fixture.py 로 만든다.
"use strict";
const fs = require("fs");
const vm = require("vm");

// 허용오차(″): 이심률이 있는 타이탄·이아페투스는 평균 원궤도라 크다(궤도 반지름의 2~5%)
const TOL = { titan: 15, iapetus: 20 };
const DEFAULT_TOL = 3;

function run() {
    vm.runInThisContext(fs.readFileSync(__dirname + "/../src/astro.js", "utf8"));
    const ref = JSON.parse(fs.readFileSync(__dirname + "/horizons_satellites.json", "utf8"));
    let fails = 0, n = 0, worst = {};
    ref.epochs.forEach((tt, i) => {
        for (const planet of Object.keys(ref.systems)) {
            const sys = ref.systems[planet], [ra, dec, dist] = sys.planet[i];
            const got = {};
            for (const m of globalThis.GetSatellites(tt, planet, ra, dec, dist)) got[m.key] = m;
            for (const key of Object.keys(sys.moons)) {
                const [mra, mdec] = sys.moons[key][i];
                const g = got[key];
                n++;
                if (!g) { fails++; console.log("없음", planet, key, tt); continue; }
                const err = Math.hypot((g.ra - mra) * Math.cos(mdec * Math.PI / 180), g.dec - mdec) * 3600;
                worst[key] = Math.max(worst[key] || 0, err);
                if (!(err <= (TOL[key] || DEFAULT_TOL))) { fails++; console.log("다름", key, "JD", tt, err.toFixed(2) + "″"); }
            }
        }
    });
    const summary = Object.entries(worst).map(([k, v]) => `${k} ${v.toFixed(1)}″`).join(", ");
    console.log(fails ? `위성: 실패 ${fails}건` : `위성: 통과 (${n}개 위치, 최대 오차 ${summary})`);
    return fails;
}
if (require.main === module) process.exit(run() ? 1 : 0);
module.exports = { run };
