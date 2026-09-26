# astro.js

브라우저에서 동작하는 천문 계산 라이브러리입니다. 2007년부터 [천문노트(astronote.org)](https://astronote.org)의
천문 달력, 오늘의 천문 현상, 해·달·행성의 출몰 시각, 24절기, 삭망 시각, 북극성 조견판 등이 이 코드로 계산해 왔습니다.

- **NASA JPL DE406 천체력**으로 태양·달·행성 위치 계산 (기원전 3000년 ~ 서기 3000년)
- 세차·장동, 적도·황도·지평·은하 좌표 변환, 항성시, ΔT
- 해·달·행성의 뜨고 지는 시각과 남중 시각, 박명 시각
- **한국 음력** 변환 (`sol2lun`, `lun2sol`, 1841~2041년)
- 밝은 별 3,000개, 88개 별자리 선·이름(한글), 메시에 목록, 세계 도시 543곳 (`astrodata.js`)
- 달 위상 그리기 (`moonphase.js`, SVG)

## 파일

| 파일 | 내용 |
|---|---|
| `src/astro.js` | 계산 라이브러리. 원래 압축(packer)되어 배포되던 것을 읽기 쉽게 풀었다. 계산 결과는 원본과 같다(테스트로 확인) |
| `src/astrodata.js` | 별·별자리·메시에·도시 데이터 |
| `src/moonphase.js` | 천체력으로 위상을 계산해 달 모양을 SVG 로 그린다 |
| `server/de406_server.py` | `astro.js` 가 부르는 `/de406.php?idx=N` 서버 예제 (Python 표준 라이브러리만 사용) |
| `examples/index.html` | 오늘 서울의 일출몰·월출몰·음력·달 위상 |
| `tests/` | 회귀 테스트 (원본 출력과 비교) |

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
  var sun = GetRiseSetTime2(lct, calsun, D2R * -0.83);    // [뜸, 남중, 짐]
  console.log(HToHM(GetTime(sun[0])));                    // "06:22"
  console.log(sol2lun(2026, 9, 26));                      // {year: 2026, month: 8, day: 16, leap: 0}
</script>
```

행성 위치(`getpos`)는 64일 단위의 DE406 레코드를 `/de406.php?idx=N` 에서 받아 쓴다.
응답은 레코드의 계수 728 개를 쉼표로 이은 문자열이다. 다른 경로를 쓰려면 `getrecord()` 를 고치면 된다.

## 테스트

```sh
DE406_FILE=lnxm3000p3000.406 npm test
```

`tests/golden.json` 은 천문노트에서 쓰던 원본(압축본)의 출력이다. 코드를 고친 뒤 결과가 바뀌지 않았는지 확인한다.
독립 계산(skyfield, DE421)과 비교하면 서울 일출몰은 2초, 추분 시각은 9초, 보름 시각은 13초 이내로 맞는다.

## 알려진 한계

- 음력 표는 2041년까지다.
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
coordinate transforms, sidereal time, ΔT, rise/transit/set solving, the Korean lunisolar calendar
(1841–2041), the Yale Bright Star Catalogue (5th ed.) with Korean constellation names, and an SVG moon-phase renderer.
Run `scripts/get-de406.sh`, then `python server/de406_server.py lnxm3000p3000.406` and open
`http://localhost:8000/examples/`. MIT licensed.
