# astro.js

브라우저에서 동작하는 천문 계산 라이브러리입니다. 2007년부터 [천문노트(astronote.org)](https://astronote.org)의
천문 달력, 오늘의 천문 현상, 해·달·행성의 출몰 시각, 24절기, 삭망 시각, 북극성 조견판 등이 이 코드로 계산해 왔습니다.

- **NASA JPL DE406 천체력**으로 태양·달·행성 위치 계산 (기원전 3000년 ~ 서기 3000년)
- 세차·장동, 적도·황도·지평·은하 좌표 변환, 항성시, ΔT
- 해·달·행성의 뜨고 지는 시각과 남중 시각, 박명 시각
- 삭·망·상하현 시각(`GetMoonPhaseTime`), 24절기 시각(`GetSolarTermTime`)
- **한국 음력** 변환 (`sol2lun`, `lun2sol`, 1841~2050년, 한국천문연구원 자료와 날마다 일치)
- 밝은 별 1,000개, 88개 별자리 선·이름(한글), 메시에 목록, 세계 도시 543곳 (`astrodata.js`)
- 달 위상 그리기 (`moonphase.js`, SVG)

## 파일

| 파일 | 내용 |
|---|---|
| `src/astro.js` | 계산 라이브러리. 원래 압축(packer)되어 배포되던 것을 읽기 쉽게 풀었다. v1.1 에서 정확도 버그를 고쳤다([CHANGELOG](CHANGELOG.md)) |
| `src/astrodata.js` | 별·별자리·메시에·도시 데이터 |
| `src/moonphase.js` | 천체력으로 위상을 계산해 달 모양을 SVG 로 그린다 |
| `server/de406_server.py` | `astro.js` 가 부르는 `/de406.php?idx=N` 서버 예제 (Python 표준 라이브러리만 사용) |
| `examples/index.html` | 오늘 서울의 일출몰·월출몰·음력·달 위상 |
| `tests/` | 회귀 테스트, 음력 검사(KASI), 정확도 검사(skyfield) |
| `scripts/gen_lunar_table.py` | KASI 음양력 자료로 음력 표(`lstbl`)와 검사 자료(`tests/kasi_lunar.json`)를 만든다 |

## 빠른 시작

```sh
scripts/get-de406.sh                     # JPL DE406 바이너리(199MB)를 받는다
python server/de406_server.py lnxm3000p3000.406 --port 8000
# 브라우저에서 http://localhost:8000/examples/
```

```html
<script src="src/astro.js"></script>
<script src="src/astrodata.js"></script>
<script>
  // 관측지는 전역 변수로 준다: 경도·위도(라디안), UTC 와의 시차(시간)
  var glon = 126.978 * D2R, glat = 37.566 * D2R, dgmt = 9;
  var lct = GetJD(2026, 9, 26, 12, 0, 0);                 // 지방시 율리우스일
  var sun = GetRiseSetTime2(lct, calsun, D2R * -0.83);    // [뜸, 남중, 짐]  해: −0.83°
  var moon = GetRiseSetTime2(lct, calmoon, D2R * 0.13);   //                달: +0.13° (부호 주의)
  console.log(HToHM(GetTime(sun[0])));                    // "06:22"
  console.log(sol2lun(2026, 9, 26));                      // {year: 2026, month: 8, day: 16, leap: 0}
  console.log(lun2sol(2033, 11, 1, true));                // 윤11월 1일 → {year: 2033, month: 12, day: 22}
  var full = GetMoonPhaseTime(lct, 180);                  // lct 근처 보름(망) 시각, 지방시 율리우스일
  var chubun = GetSolarTermTime(2026, 180);               // 2026년 추분 시각
</script>
```

행성 위치(`getpos`)는 64일 단위의 DE406 레코드를 `/de406.php?idx=N` 에서 받아 쓴다.
응답은 레코드의 계수 728 개를 쉼표로 이은 문자열이다. 다른 경로를 쓰려면 `getrecord()` 를 고치면 된다.

시각 인수: `getpos(jd)` 의 `jd` 는 **역학시(TT)** 율리우스일이다. 지방시에서는 `LCTToTT(lct)`
(= UT + `deltaT()`)로 바꿔 넘긴다. `getpos` 는 기하학적 위치를 주며, 광행시간·광행차를 넣은
겉보기 위치는 `GetApparentEqu(tt, id)` 로 얻는다. `calsun`·`calmoon`·`calpla[]` 는 이미 그렇게 한다.

## 테스트

```sh
DE406_FILE=lnxm3000p3000.406 npm test
```

- `tests/golden.json`: v1.1 출력의 기준값. 계산 결과가 바뀌지 않았는지 확인한다(허용오차 1e-8).
  `tests/golden_v1.json` 은 2007~2026년 천문노트에서 쓰던 원본(압축본, v1.0)의 출력이다.
- `tests/lunar_test.js`: `sol2lun` 을 1841~2050년 **모든 날**, `lun2sol` 을 모든 달의 첫날·끝날에 대해
  한국천문연구원(KASI) 음양력 자료(`tests/kasi_lunar.json`)와 비교한다. `npm test` 에 포함된다.

### 정확도 검사 (skyfield + JPL DE421)

```sh
export DE406_FILE=lnxm3000p3000.406 DE421_FILE=de421.bsp   # de421.bsp 가 없으면 skyfield 가 받는다
uv run --with skyfield --with numpy python tests/skyfield_check.py --run src/astro.js --year 2026 --strict
```

`tests/accuracy_dump.js` 가 서울 기준으로 계산한 값을 skyfield 와 비교한다. v1.1, 2026년 결과(초, astro.js − skyfield):

| 항목 | 허용 | v1.0 | v1.1 |
|---|---|---|---|
| 해 뜸·짐 (97일, 2000·2026·2040) | ±3 | −1.3 … +2.7 | −2.0 … +1.0 |
| 달 뜸·짐 (365일, h0 +0.13°) | ±20 | −124 … +186 | −18 … +19 |
| 삭·망·상하현 (`GetMoonPhaseTime`) | ±10 | +8 … +19 (페이지 방식) | −0.4 … +1.2 |
| 24절기 (`GetSolarTermTime`) | ±5 | −8.2 … −7.5 | −1.8 … −1.5 |
| ΔT 2026년 | | 75.4 s (실제 69.1) | 69.1 s |
| 그리니치 항성시 `UTToGST` | | ±1.3 | ±0.04 |

## 알려진 한계

- 음력 표는 1841~2050년이다(KASI 가 공개한 범위). 범위 밖에서 `sol2lun`·`lun2sol` 은 `year: 0` 을 돌려준다.
- ΔT 는 1973~2025년 IERS 관측값, 그 뒤는 예측이다. 2050년 이후는 수십 초~수 분까지 불확실하다.
- 달의 뜨고 지는 시각은 h0 를 +0.13° 로 고정해 계산하므로(실제 지평시차는 0.90~1.02°) ±20초 안팎의 오차가 남는다.
- `getpos()` 는 기하학적 위치다(광행차 없음, 행성 20~35″). 겉보기 위치는 `GetApparentEqu()` 를 쓴다.
  세차·장동은 IAU 1976/1980 모형이라 J2000 에서 멀어질수록 0.1″ 수준의 차이가 생긴다.
- 행성 계산이 레코드를 **동기** XMLHttpRequest 로 받는다. 화면이 잠깐 멈출 수 있다.

## 데이터 출처

- 별 목록(`stardata`): Yale Bright Star Catalogue, 5th Revised Ed. (Hoffleit & Warren, 1991)
- 행성·달·태양 위치: NASA JPL DE406 Long Ephemeris
- 별자리 이름(한글), 도시 목록: 천문노트

## 라이선스

MIT © 2007-2026 이형철 (Hyung-Chul Lee). DE406 천체력 파일은 NASA JPL 이 제공하며 이 저장소에 포함되어 있지 않다.

---

# astro.js (English)

An astronomy library for the browser, used since 2007 by the Korean amateur astronomy site
[astronote.org](https://astronote.org) for its calendars, rise/set tables, solar terms and more.
Planetary positions come from NASA JPL's DE406 ephemeris (3000 BC – AD 3000), served in 64-day
Chebyshev records by a tiny endpoint (`server/de406_server.py`). Also includes precession/nutation,
coordinate transforms, sidereal time, ΔT, rise/transit/set solving, lunar phase and solar term times,
the Korean lunisolar calendar (1841–2050, verified day by day against KASI data), the Yale Bright Star Catalogue (5th ed.) with Korean constellation names, and an SVG moon-phase renderer.
Run `scripts/get-de406.sh`, then `python server/de406_server.py lnxm3000p3000.406` and open
`http://localhost:8000/examples/`. MIT licensed.
