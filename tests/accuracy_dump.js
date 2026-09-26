// 정확도 검사용 계산 결과를 JSON 으로 출력한다(tests/skyfield_check.py 가 읽는다).
//   DE406_FILE=... node tests/accuracy_dump.js [src/astro.js] [year] > out.json
// v1.0(원본) 파일에도 쓸 수 있도록, v1.1 도우미 함수가 없으면 그 항목은 빼고
// 천문노트 페이지(moontime·suntime)의 계산 방식을 그대로 옮긴 결과("site_*")를 낸다.
"use strict";
const vm = require("vm");
const { load } = require("./harness");

const astro = process.argv[2] || __dirname + "/../src/astro.js";
const year = +(process.argv[3] || 2026);
const A = load(astro, process.env.DE406_FILE);
const out = vm.runInContext(`(function (year) {
    var o = { astro: ${JSON.stringify(astro)}, year: year, dgmt: 9, lon: 126.9779528, lat: 37.56635278 };
    dgmt = 9; glon = o.lon * D2R; glat = o.lat * D2R;
    var riseset = function (calpos, h0, days) {
        var r = [];
        days.forEach(function (d) { var x = GetRiseSetTime2(d, calpos, h0); r.push([d, x[0], x[1], x[2]]); });
        return r;
    };
    var days = [], day1 = GetJD(year, 1, 1, 12, 0, 0), nd = GetJD(year + 1, 1, 1, 12, 0, 0) - day1;
    for (var i = 0; i < nd; i++) days.push(day1 + i);
    var sundays = days.filter(function (d, i) { return i % 5 == 0; });
    [2000, 2040].forEach(function (y) { for (var m = 1; m <= 12; m++) sundays.push(GetJD(y, m, 1, 12, 0, 0)); });
    o.sun = riseset(calsun, D2R * -0.83, sundays);
    o.moon_p013 = riseset(calmoon, D2R * 0.13, days);
    o.moon_m013 = riseset(calmoon, D2R * -0.13, days);

    // 천문노트 moontime.html 의 삭·망 계산(그대로)
    var siteMoon = function (fixed) {
        var getDelta = function (lct) {
            var ut = LCTToUT(lct, dgmt);
            if (!fixed) { var e = EquToEcl(getpos(ut), ut); return e[9].GetLon() - e[10].GetLon(); }
            var g = getpos(ut, 9), s = getpos(ut - g[10].GetLength() / lspeed / 86400, 10);
            return EquToEcl(g[9], ut).GetLon() - EquToEcl(s[10], ut).GetLon();
        };
        var res = [[], []];
        for (var q = 0; q < 4; q += 2) {
            var ang = q * HPI, lct = GetJD(year, 1, 0, 0, 0, 0);
            for (var m = 0; m < 14; m++) {
                for (var i = 0; i < 10; i++) {
                    var delta = util_norm(getDelta(lct), ang - PI, TPI);
                    var step = (delta - ang) / TPI * 29.530589;
                    lct -= step;
                    if (fixed ? Math.abs(step) < 0.5 / 86400 : Math.abs(delta) < 0.0000001) break;
                }
                if (GetYear(lct) == year) {
                    if (fixed) lct -= deltaT(lct) / 86400;
                    else { var t = (lct - 2397450.5) / 36524.24; lct -= 30.9 * t * t / 3600 / 24; }
                    res[q / 2].push(lct);
                }
                lct += 29.530589;
            }
        }
        return res;
    };
    o.site_newfull = siteMoon(false);
    o.site_newfull_fixed = siteMoon(true);

    // 천문노트 suntime.html 의 절기 계산(그대로)
    var angs = [285, 300, 315, 330, 345, 0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270];
    var siteTerm = function (ang0) {
        var getDelta = function (lct) {
            var ut = LCTToUT(lct, dgmt);
            var g = getpos(ut, 10);
            g = getpos(ut - g[10].GetLength() / lspeed / 24 / 3600, 10);
            return EquToEcl(g[10], ut).GetLon();
        };
        var lct = GetJD(year, 1, 6, 0, 0, 0) + util_norm(ang0 - 285, 0, 360) * 365.2425 / 360, ang = ang0 * D2R;
        for (var i = 0; i < 10; i++) {
            var delta = util_norm(getDelta(lct), ang - PI, TPI);
            if (delta > ang + PI) delta -= TPI;
            lct -= (delta - ang) / TPI * 365.2425;
            if (Math.abs(delta) < 0.0000001) break;
        }
        return lct - deltaT(lct) / 3600 / 24;
    };
    o.site_terms = angs.map(function (a) { return [a, siteTerm(a)]; });

    if (typeof GetMoonPhaseTime == "function") {
        o.phases = [];
        for (var a = 0; a < 360; a += 90) for (var i = -1; i < 14; i++) {
            var t = GetMoonPhaseTime(GetJD(year, 1, 1, 0, 0, 0) + i * 29.530589 + a / 360 * 29.530589, a);
            if (GetYear(t) == year && !o.phases.some(function (p) { return Math.abs(p[1] - t) < 1; })) o.phases.push([a, t]);
        }
        o.terms = angs.map(function (a) { return [a, GetSolarTermTime(year, a)]; });
    }
    o.deltaT = [];
    for (var y = 1960; y <= 2050; y += 2) o.deltaT.push([y, deltaT(GetJD(y, 7, 1, 0, 0, 0))]);
    o.gst = [];
    for (var i = 0; i < 400; i++) { var ut = GetJD(1990, 1, 1, 0, 0, 0) + i * 37.3217; o.gst.push([ut, GetTime(UTToGST(ut))]); }
    return JSON.stringify(o);
})(${year})`, A);
process.stdout.write(out + "\n");
