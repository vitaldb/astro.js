"""astro.js 정확도 검사: 독립 계산(skyfield + JPL DE421)과 비교한다.

    DE406_FILE=/path/lnxm3000p3000.406 node tests/accuracy_dump.js src/astro.js 2026 > /tmp/acc.json
    uv run --with skyfield --with numpy python tests/skyfield_check.py /tmp/acc.json [--bsp de421.bsp] [--strict]

(accuracy_dump.js 를 따로 돌리지 않고 `--run` 을 주면 이 스크립트가 node 를 불러 만든다.)
기준: 서울(126.978°E, 37.566°N, UTC+9).
  해 뜸/짐  : skyfield find_risings/find_settings (지형중심, 굴절 34′, 윗가장자리)     허용 ±3 s
  달 뜸/짐  : 같은 방식(지평시차 포함), astro.js 는 h0 = +0.13°                          허용 ±20 s
  삭·망·상하현: 겉보기 황경 차(almanac.moon_phases)                                     허용 ±10 s
  24절기    : 태양 겉보기 황경 = 15°·k                                                  허용 ±5 s
  ΔT, 그리니치 시항성시(GAST)
--strict 이면 v1.1 라이브러리 항목(해·달 +0.13·도우미 함수)이 허용오차를 넘을 때 종료 코드 1.
"""
import argparse
import datetime as dt
import json
import os
import statistics
import subprocess
import sys

import numpy as np
from skyfield import almanac
from skyfield.api import E, N, load, wgs84
from skyfield.framelib import ecliptic_frame

ap = argparse.ArgumentParser()
ap.add_argument("dump", nargs="?", help="accuracy_dump.js 출력 JSON")
ap.add_argument("--run", metavar="ASTRO_JS", help="node tests/accuracy_dump.js 를 이 파일로 실행")
ap.add_argument("--year", type=int, default=2026)
ap.add_argument("--bsp", default=os.environ.get("DE421_FILE", "de421.bsp"))
ap.add_argument("--strict", action="store_true")
args = ap.parse_args()

if args.run:
    here = os.path.dirname(os.path.abspath(__file__))
    txt = subprocess.check_output(["node", os.path.join(here, "accuracy_dump.js"), args.run, str(args.year)])
    D = json.loads(txt)
else:
    D = json.load(open(args.dump, encoding="utf-8"))

ts = load.timescale()
eph = load(args.bsp)
earth, sun, moon = eph["earth"], eph["sun"], eph["moon"]
TZ = dt.timedelta(hours=D["dgmt"])
site = wgs84.latlon(D["lat"] * N, D["lon"] * E)
observer = earth + site
year = D["year"]


def jd_to_utc(jd):
    """astro.js 지방시 율리우스일 → UTC datetime"""
    return dt.datetime(2000, 1, 1, 12) + dt.timedelta(days=jd - 2451545.0) - TZ


def to_dt(t):
    return [x.replace(tzinfo=None) for x in t.utc_datetime()]


failed = []


def stats(label, diffs, tol=None):
    if not diffs:
        print(f"  {label:<44} n=0")
        return
    a = np.array(diffs)
    worst = float(a[np.argmax(np.abs(a))])
    ok = "" if tol is None else ("  OK" if abs(worst) <= tol else f"  초과(허용 ±{tol:g})")
    print(f"  {label:<44} n={len(a):>3}  평균 {a.mean():+7.2f}  최소 {a.min():+8.2f}  최대 {a.max():+8.2f}  최대|x| {abs(worst):7.2f}{ok}")
    if tol is not None and abs(worst) > tol:
        failed.append(label)


def match(times, ref, window=3600):
    """astro.js 시각(UTC)마다 가장 가까운 기준 사건과의 차(초). window 초 넘게 떨어지면 버림."""
    out = []
    ref = sorted(ref)
    import bisect
    for t in times:
        i = bisect.bisect_left(ref, t)
        cands = [ref[j] for j in (i - 1, i) if 0 <= j < len(ref)]
        if not cands:
            continue
        r = min(cands, key=lambda x: abs((t - x).total_seconds()))
        d = (t - r).total_seconds()
        if abs(d) <= window:
            out.append(d)
    return out


t0 = ts.utc(year - 1, 12, 31)
t1 = ts.utc(year + 1, 1, 2)
print(f"astro.js − skyfield/DE421 (초), {D['astro']}")

print("== 해 뜸·짐 (h0 −0.83°) ==")
years = sorted({jd_to_utc(r[0]).year for r in D["sun"]})
sr, ss = [], []
for y in years:
    a, b = ts.utc(y - 1, 12, 31), ts.utc(y + 1, 1, 2)
    sr += to_dt(almanac.find_risings(observer, sun, a, b)[0])
    ss += to_dt(almanac.find_settings(observer, sun, a, b)[0])
rise = [jd_to_utc(r[1]) for r in D["sun"] if r[1] is not None]
sett = [jd_to_utc(r[3]) for r in D["sun"] if r[3] is not None]
stats(f"해 뜸 ({', '.join(map(str, years))})", match(rise, sr), 3)
stats("해 짐", match(sett, ss), 3)

print(f"== 달 뜸·짐 {year} 매일 ==")
mr = to_dt(almanac.find_risings(observer, moon, t0, t1)[0])
ms = to_dt(almanac.find_settings(observer, moon, t0, t1)[0])
for key, label, tol in (("moon_p013", "h0 +0.13° (올바른 값)", 20), ("moon_m013", "h0 −0.13° (calendar·planet 페이지 값)", None)):
    rows = D[key]
    stats(f"달 뜸 {label}", match([jd_to_utc(r[1]) for r in rows if r[1] is not None], mr), tol)
    stats(f"달 짐 {label}", match([jd_to_utc(r[3]) for r in rows if r[3] is not None], ms), tol)

print(f"== 삭·망 {year} ==")
times, ph = almanac.find_discrete(t0, t1, almanac.moon_phases(eph))
ref_ph = {k: [x for x, p in zip(to_dt(times), ph) if p == k] for k in range(4)}
stats("삭 (moontime 페이지 방식, ΔT=30.9t²)", match([jd_to_utc(x) for x in D["site_newfull"][0]], ref_ph[0]))
stats("망 (moontime 페이지 방식, ΔT=30.9t²)", match([jd_to_utc(x) for x in D["site_newfull"][1]], ref_ph[2]))
stats("삭 (페이지 방식 + deltaT()·광행시간)", match([jd_to_utc(x) for x in D["site_newfull_fixed"][0]], ref_ph[0]))
stats("망 (페이지 방식 + deltaT()·광행시간)", match([jd_to_utc(x) for x in D["site_newfull_fixed"][1]], ref_ph[2]))
if "phases" in D:
    for a, name in ((0, "삭"), (90, "상현"), (180, "망"), (270, "하현")):
        stats(f"{name} GetMoonPhaseTime()", match([jd_to_utc(t) for x, t in D["phases"] if x == a], ref_ph[a // 90]), 10)

print(f"== 24절기 {year} ==")


def lon_index(t):
    lon = earth.at(t).observe(sun).apparent().frame_latlon(ecliptic_frame)[1].degrees
    return (lon // 15).astype(int) % 24


lon_index.step_days = 5
times, idx = almanac.find_discrete(t0, t1, lon_index)
ref_terms = {}
for t, i in zip(to_dt(times), idx):
    if t.year == year or (t + TZ).year == year:
        ref_terms[int(i) * 15] = t
d = [(jd_to_utc(t) - ref_terms[a]).total_seconds() for a, t in D["site_terms"] if a in ref_terms]
stats("suntime 페이지 방식 (deltaT())", d)
if "terms" in D:
    d = [(jd_to_utc(t) - ref_terms[a]).total_seconds() for a, t in D["terms"] if a in ref_terms]
    stats("GetSolarTermTime()", d, 5)

print("== ΔT (초) ==")
dd = []
for y, v in D["deltaT"]:
    ref = float(ts.utc(y, 7, 1).delta_t)
    dd.append(v - ref)
    if y % 10 == 0 or y in (2016, 2026):
        print(f"  {y}: astro.js {v:7.2f}  skyfield {ref:7.2f}  차 {v - ref:+6.2f}")
stats("ΔT 1960~2050 (2년 간격)", dd)

print("== 그리니치 겉보기 항성시 GAST (UT1 = 인수) ==")
g = []
for jd, h in D["gst"]:
    t = ts.ut1_jd(jd)
    d = (h - float(t.gast)) * 3600 / 1.00273790935  # 항성시 초 → 시각 초
    g.append((d + 43200) % 86400 - 43200)
stats("UTToGST (초)", g)

if failed:
    print("허용오차 초과:", ", ".join(failed))
if args.strict and failed:
    sys.exit(1)
