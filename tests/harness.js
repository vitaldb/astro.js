// astro.js 를 Node 에서 실행하는 도구. 브라우저의 동기 XMLHttpRequest(/de406.php) 대신
// 로컬 DE406 바이너리(lnxm3000p3000.406)에서 레코드를 읽어 준다.
//   DE406_FILE=/path/lnxm3000p3000.406 node tests/harness.js src/astro.js > out.json
"use strict";
const fs = require("fs");
const vm = require("vm");

const NCOEFF = 728, RECSIZE = NCOEFF * 8;

function load(astroPath, de406Path) {
    const fd = fs.openSync(de406Path, "r");
    class XMLHttpRequest {
        open(method, url) { this.idx = +new URL(url, "http://x").searchParams.get("idx"); }
        send() {
            const buf = Buffer.alloc(RECSIZE);
            fs.readSync(fd, buf, 0, RECSIZE, (this.idx + 2) * RECSIZE);
            const vals = [];
            for (let i = 0; i < NCOEFF; i++) vals.push(buf.readDoubleLE(i * 8));
            this.status = 200;
            this.responseText = vals.map((v) => String(v)).join(",");
        }
    }
    const ctx = { window: {}, XMLHttpRequest, document: { cookie: "", write() {} }, navigator: { userAgent: "" }, console };
    ctx.window = ctx;
    vm.createContext(ctx);
    vm.runInContext(fs.readFileSync(astroPath, "utf8"), ctx, { filename: astroPath });
    vm.runInContext(fs.readFileSync(__dirname + "/../src/astrodata.js", "utf8"), ctx);
    return ctx;
}

// 비교에 쓰는 대표 계산들
function compute(A) {
    const run = (code) => vm.runInContext(code, A);
    return run(`(function () {
        var out = {}; var D2R = Math.PI / 180;
        // astro.js 는 관측지를 전역 변수 glon, glat(라디안), dgmt(시간대)로 읽는다
        dgmt = 9; glon = 126.9779528 * D2R; glat = 37.56635278 * D2R;
        var dates = [[2000,1,1],[2026,3,20],[2026,6,21],[2026,9,26],[2026,12,22],[1987,7,15],[2041,2,1]];
        out.jd = dates.map(function (d) { return GetJD(d[0], d[1], d[2], 12, 0, 0); });
        out.deltaT = out.jd.map(deltaT);
        out.gst = out.jd.map(function (jd) { return UTToGST(LCTToUT(jd, 9)); });
        out.sun = out.jd.map(function (jd) { var r = GetRiseSetTime2(jd, calsun, D2R * -0.83); return [r[0], r[1], r[2]]; });
        out.moon = out.jd.map(function (jd) { var r = GetRiseSetTime2(jd, calmoon, D2R * -0.13); return [r[0], r[1], r[2]]; });
        out.pos = out.jd.map(function (jd) { var p = getpos(LCTToUT(jd, 9));
            return p.filter(Boolean).map(function (v) { return [v.GetLon(), v.GetLat(), v.GetLength()]; }); });
        out.lunar = dates.map(function (d) { var l = sol2lun(d[0], d[1], d[2]); return [l.year, l.month, l.day, l.leap]; });
        return JSON.stringify(out);
    })()`);
}

if (require.main === module) {
    const de406 = process.env.DE406_FILE;
    if (!de406) { console.error("DE406_FILE 환경 변수로 lnxm3000p3000.406 경로를 지정하세요"); process.exit(2); }
    process.stdout.write(compute(load(process.argv[2] || __dirname + "/../src/astro.js", de406)) + "\n");
}
module.exports = { load, compute };
