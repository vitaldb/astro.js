"""tests/horizons_satellites.json: 위성 검사용 JPL Horizons 기준값 (행성·위성의 지심 천측 적경·적위 J2000, 거리).
    uv run --no-project --with requests python scripts/make_satellite_fixture.py > tests/horizons_satellites.json
"""
import json, sys, time, requests
S = requests.Session()
SYS = {'jupiter': ('599', {'io': '501', 'europa': '502', 'ganymede': '503', 'callisto': '504'}),
       'saturn': ('699', {'mimas': '601', 'enceladus': '602', 'tethys': '603', 'dione': '604', 'rhea': '605', 'titan': '606', 'iapetus': '608'}),
       'uranus': ('799', {'ariel': '701', 'umbriel': '702', 'titania': '703', 'oberon': '704'}),
       'neptune': ('899', {'triton': '801'}), 'mars': ('499', {'phobos': '401', 'deimos': '402'})}
EPOCHS = [2461310.25, 2461450.75, 2461700.5, 2462100.125, 2462800.5]   # TT 율리우스일 (2026-09 ~ 2030-09)


def obs(target, jds):
    p = {'format': 'text', 'COMMAND': f"'{target}'", 'OBJ_DATA': "'NO'", 'EPHEM_TYPE': "'OBSERVER'", 'CENTER': "'500@399'",
         'QUANTITIES': "'1,20'", 'ANG_FORMAT': "'DEG'", 'CSV_FORMAT': "'YES'", 'EXTRA_PREC': "'YES'",
         'TLIST': ' '.join(f"'{j}'" for j in jds), 'TLIST_TYPE': "'JD'", 'TIME_TYPE': "'TT'"}
    for a in range(5):
        t = S.get('https://ssd.jpl.nasa.gov/api/horizons.api', params=p, timeout=60).text
        if '$$SOE' in t:
            break
        time.sleep(5)
    rows = [[x.strip() for x in l.split(',')] for l in t[t.index('$$SOE') + 5:t.index('$$EOE')].strip().splitlines()]
    return [(float(r[3]), float(r[4]), float(r[5]) * 149597870.7) for r in rows]


out = {'source': 'JPL Horizons, observer 500@399, astrometric RA/Dec (ICRF), TT epochs', 'epochs': EPOCHS, 'systems': {}}
for planet, (pid, moons) in SYS.items():
    sysd = {'planet': [list(x) for x in obs(pid, EPOCHS)], 'moons': {}}
    for key, mid in moons.items():
        sysd['moons'][key] = [[x[0], x[1]] for x in obs(mid, EPOCHS)]
    out['systems'][planet] = sysd
json.dump(out, sys.stdout, indent=0)
