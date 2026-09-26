"""위성의 평균 원궤도를 JPL Horizons 벡터로 맞춰 astro.js 에 넣을 상수를 만든다 (한 번만 실행).

행성 중심 ICRF 적도 좌표(km)로 받아: 궤도면 법선, 평균 반지름, 기준 시각 위상, 평균 운동.
평균 운동은 1년 떨어진 두 시점의 위상 차(공칭 주기로 바퀴 수 결정)로 정밀하게 구한다.
    uv run --no-project --with requests --with numpy python scripts/fit_satellite_orbits.py > orbits.json   # 결과를 src/astro.js 의 SAT_ORBITS 로 옮긴다
"""
import json, sys, time
import numpy as np, requests

MOONS = [  # key, id, 행성 id, 공칭 항성주기(일)
    ('phobos', '401', '499', 0.31891023), ('deimos', '402', '499', 1.263),
    ('mimas', '601', '699', 0.942422), ('enceladus', '602', '699', 1.370218), ('tethys', '603', '699', 1.887802),
    ('dione', '604', '699', 2.736915), ('rhea', '605', '699', 4.518212), ('titan', '606', '699', 15.94542),
    ('iapetus', '608', '699', 79.3215),
    ('ariel', '701', '799', 2.520379), ('umbriel', '702', '799', 4.144177), ('titania', '703', '799', 8.705872),
    ('oberon', '704', '799', 13.463239), ('triton', '801', '899', 5.876854),
]
E0 = 2461309.5  # 2026-09-27 00:00 TDB
S = requests.Session()


def vectors(mid, center, jd0, span, n=60):
    p = {'format': 'text', 'COMMAND': f"'{mid}'", 'OBJ_DATA': "'NO'", 'MAKE_EPHEM': "'YES'", 'EPHEM_TYPE': "'VECTORS'",
         'CENTER': f"'500@{center}'", 'REF_PLANE': "'FRAME'", 'REF_SYSTEM': "'ICRF'", 'VEC_TABLE': "'1'", 'CSV_FORMAT': "'YES'",
         'OUT_UNITS': "'KM-S'", 'START_TIME': f"'JD{jd0:.5f}'", 'STOP_TIME': f"'JD{jd0 + span:.5f}'", 'STEP_SIZE': f"'{n}'"}
    for a in range(5):
        r = S.get('https://ssd.jpl.nasa.gov/api/horizons.api', params=p, timeout=60)
        if r.ok and '$$SOE' in r.text:
            break
        time.sleep(5 * (a + 1))
    body = r.text[r.text.index('$$SOE') + 5:r.text.index('$$EOE')]
    rows = [l.split(',') for l in body.strip().splitlines()]
    t = np.array([float(x[0]) for x in rows]); v = np.array([[float(x[2]), float(x[3]), float(x[4])] for x in rows])
    return t, v


def fit(key, mid, center, period):
    span = 2 * period
    t, v = vectors(mid, center, E0 - period, span)
    nrm = np.cross(v[:-1], v[1:]).mean(0); nrm /= np.linalg.norm(nrm)
    e1 = np.cross([0, 0, 1.0], nrm); e1 /= np.linalg.norm(e1)            # 승교점 방향 (ICRF 적도면과의 교선)
    e2 = np.cross(nrm, e1)
    a = np.linalg.norm(v, axis=1).mean()
    th = np.unwrap(np.arctan2(v @ e2, v @ e1))
    n0 = 2 * np.pi / period
    th0 = np.mean(th - n0 * (t - E0)) % (2 * np.pi)                      # 기준 시각 위상 (공칭 운동으로)
    # 1년 뒤 위상으로 평균 운동을 다듬는다
    t2, v2 = vectors(mid, center, E0 + 365.25 - period / 2, period, 40)
    th2 = np.unwrap(np.arctan2(v2 @ e2, v2 @ e1))
    th2_0 = np.mean(th2 - n0 * (t2 - (E0 + 365.25))) % (2 * np.pi)       # 공칭 운동으로 외삽했을 때의 어긋남
    predicted = th0 + n0 * 365.25                                        # 공칭 운동으로 예측한 1년 뒤 위상
    dphi = ((th2_0 - predicted + np.pi) % (2 * np.pi)) - np.pi           # 관측 − 예측 (반 바퀴 안쪽이라고 본다)
    n = n0 + dphi / 365.25
    ecc = (np.linalg.norm(v, axis=1).max() - np.linalg.norm(v, axis=1).min()) / (2 * a)
    return {'key': key, 'id': mid, 'planet': center, 'a': round(float(a), 1), 'n': float(n), 'th0': float(th0),
            'pole': [round(float(x), 7) for x in nrm], 'ecc_est': round(float(ecc), 4)}


out = []
for key, mid, center, period in MOONS:
    out.append(fit(key, mid, center, period)); print(key, out[-1]['a'], round(out[-1]['n'] * 180 / np.pi, 6), 'deg/d', 'e~', out[-1]['ecc_est'], file=sys.stderr)
json.dump({'epoch_jd_tdb': E0, 'orbits': out}, sys.stdout, indent=1)
