/*
 * 달 위상 그리기 — 예전의 달 사진 30장(/view/moon/N.jpg)을 대신한다.
 *
 * astro.js 의 getpos()(DE406 천체력)로 그 시각 지구에서 본 해와 달의 방향을 구해
 * 위상각과 밝은 비율을 계산하고, 배경이 투명한 SVG 로 그린다. 색은 라이트/다크 테마를 따른다.
 *
 *   MoonPhase.at(lct)          → {fraction: 0~1, waxing: bool, age: 일, phaseAngle: 도}
 *   MoonPhase.svg(lct, size)   → SVG 문자열 (document.write 나 innerHTML 에 바로 사용)
 */
(function () {
    var SYNODIC = 29.530588853;
    var uid = 0;

    function at(lct) {
        var ut = LCTToUT(lct, typeof dgmt === "number" ? dgmt : 9);
        var pos = getpos(ut, 9);                // 지구 중심 적도 좌표: 9 = 달, 10 = 태양 (필요한 천체만 계산)
        var moon = pos[9], sun = pos[10];
        var toSun = Sub(sun, moon), toEarth = Sub(new Vector(0, 0, 0), moon);
        var phaseAngle = Ang(toSun, toEarth);   // 달에서 본 해와 지구 사이 각
        var fraction = (1 + Math.cos(phaseAngle)) / 2;
        // 황경 차이로 차는 달/기우는 달을 가른다
        var lm = EquToEcl(moon, ut), ls = EquToEcl(sun, ut);
        var elong = ((Math.atan2(lm.y, lm.x) - Math.atan2(ls.y, ls.x)) / (2 * Math.PI) % 1 + 1) % 1;
        return { fraction: fraction, waxing: elong < 0.5, age: elong * SYNODIC, phaseAngle: phaseAngle * 180 / Math.PI };
    }

    function dark() { return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches; }

    function svg(lct, size) {
        var p = typeof lct === "object" ? lct : at(lct);
        size = size || 50;
        var r = 24, id = "mp" + (++uid);
        var night = dark() ? "#1d2835" : "#2b313a";      // 달의 어두운 면
        var shine = dark() ? "#e9e4d4" : "#f3efe2";
        // 밝은 가장자리는 반원, 명암 경계선은 가로 반지름 r|1-2k| 인 반타원
        var k = p.fraction, rx = Math.abs(1 - 2 * k) * r, side = p.waxing ? 1 : 0;
        var lit = k < 0.005 ? "" : k > 0.995
            ? "<circle r='" + r + "' fill='url(#" + id + ")'/>"
            : "<path fill='url(#" + id + ")' d='M0 " + (-r) + " A" + r + " " + r + " 0 0 " + side + " 0 " + r +
              " A" + rx.toFixed(2) + " " + r + " 0 0 " + (k > 0.5 ? side : 1 - side) + " 0 " + (-r) + "Z'/>";
        return "<svg class=moonphase width=" + size + " height=" + size + " viewBox='-25 -25 50 50' role=img " +
            "aria-label='달 " + Math.round(k * 100) + "% " + (p.waxing ? "차는 중" : "기우는 중") + "'>" +
            "<defs><radialGradient id='" + id + "' cx='" + (p.waxing ? "35%" : "65%") + "' cy='40%' r='75%'>" +
            "<stop offset='0' stop-color='" + shine + "'/><stop offset='.75' stop-color='#d9d2bd'/>" +
            "<stop offset='1' stop-color='#a8a18d'/></radialGradient></defs>" +
            "<circle r='" + r + "' fill='" + night + "'/>" + lit +
            "<circle r='" + r + "' fill='none' stroke='rgba(127,140,160,.35)' stroke-width='.8'/></svg>";
    }

    window.MoonPhase = { at: at, svg: svg };
})();
