"""한국 음력표(lstbl) 생성기.

정답 자료: 한국천문연구원(KASI) 음양력 자료를 옮긴 파이썬 패키지 korean-lunar-calendar.
    uv run --with korean-lunar-calendar python scripts/gen_lunar_table.py [first_year last_year]
    uv run --with korean-lunar-calendar python scripts/gen_lunar_table.py --fixture > tests/kasi_lunar.json
출력: astro.js 의 lstbl 형식(해마다 12자리; 1=작은달 29일, 2=큰달 30일,
      3/4/5/6 = 그 달 뒤에 윤달이 붙음: 3=29+29, 4=29+30, 5=30+29, 6=30+30)을 JSON 으로.
"""
import datetime as dt
import json
import sys

from korean_lunar_calendar import KoreanLunarCalendar


def month_table(first, last):
    """lunar (year, month, leap) -> [solar start date, length]"""
    cal = KoreanLunarCalendar()
    d = dt.date(first, 1, 1)
    end = min(dt.date(last + 1, 3, 1), dt.date(2051, 1, 1))
    months = {}
    while d < end:
        assert cal.setSolarDate(d.year, d.month, d.day), d
        key = (cal.lunarYear, cal.lunarMonth, bool(cal.isIntercalation))
        if key not in months:
            months[key] = [d, 0]
        months[key][1] += 1
        d += dt.timedelta(days=1)
    return months


def build(first, last):
    """패키지의 KASI 월 길이 자료로 표를 만들고, 양력→음력 변환 결과로 교차 검증한다.
    패키지의 변환 함수는 양력 2050-12-31(음력 2050-11-18)까지만 받으므로
    음력 2050년 12월(2051년 1월에 끝남)은 패키지 내부 자료(KOREAN_LUNAR_DATA)의 길이를 쓴다."""
    cal = KoreanLunarCalendar()
    days = cal._KoreanLunarCalendar__getLunarDays
    leap_month = lambda y: cal._KoreanLunarCalendar__getLunarIntercalationMonth(
        cal._KoreanLunarCalendar__getLunarData(y))
    rows = {}
    for y in range(first, last + 1):
        s = ""
        lm = leap_month(y)
        for m in range(1, 13):
            n = days(y, m, False)
            if m == lm:
                s += {(29, 29): "3", (29, 30): "4", (30, 29): "5", (30, 30): "6"}[(n, days(y, m, True))]
            else:
                s += {29: "1", 30: "2"}[n]
        rows[y] = s
    # 교차 검증: 양력 날짜를 하루씩 넘기며 얻은 월 길이와 비교
    months = month_table(first - 1 if first > 1000 else first, min(last, 2049))
    for (y, m, leap), (d0, n) in months.items():
        if first <= y <= last and (y, m) != (min(last, 2049) + 1, 1) and d0.year <= 2050:
            if y == 2050 or (y, m) == (min(last, 2049), 12):
                continue
            c = rows[y][m - 1]
            want = {"1": (29, None), "2": (30, None), "3": (29, 29), "4": (29, 30), "5": (30, 29), "6": (30, 30)}[c]
            assert n == want[1 if leap else 0], (y, m, leap, n, c)
    cal.setLunarDate(first, 1, 1, False)
    start = dt.date(cal.solarYear, cal.solarMonth, cal.solarDay)
    return rows, start, months


def fixture(first, last):
    """tests/kasi_lunar.json: 음력 달마다 [음력 해, 달, 윤달(0/1), 양력 초하루 "YYYY-MM-DD", 일수]."""
    cal = KoreanLunarCalendar()
    days = cal._KoreanLunarCalendar__getLunarDays
    out = []
    cal.setLunarDate(first, 1, 1, False)
    d = dt.date(cal.solarYear, cal.solarMonth, cal.solarDay)
    for y in range(first, last + 1):
        lm = cal._KoreanLunarCalendar__getLunarIntercalationMonth(cal._KoreanLunarCalendar__getLunarData(y))
        for m in range(1, 13):
            for leap in ((False, True) if m == lm else (False,)):
                n = days(y, m, leap)
                if d <= dt.date(2050, 12, 31):  # 패키지의 변환 함수로 초하루를 다시 확인
                    assert cal.setSolarDate(d.year, d.month, d.day)
                    assert (cal.lunarYear, cal.lunarMonth, cal.lunarDay, bool(cal.isIntercalation)) == (y, m, 1, leap), (d, y, m)
                out.append([y, m, int(leap), d.isoformat(), n])
                d += dt.timedelta(days=n)
    return out


if __name__ == "__main__":
    if sys.argv[1:2] == ["--fixture"]:
        rows = fixture(1841, 2050)
        sys.stdout.write("{\"source\": \"KASI (korean-lunar-calendar 0.4.0)\", \"months\": [\n")
        sys.stdout.write(",\n".join(json.dumps(r) for r in rows))
        sys.stdout.write("\n]}\n")
        sys.exit()
    first, last = (int(a) for a in sys.argv[1:3]) if len(sys.argv) > 2 else (1841, 2050)
    rows, start, _ = build(first, last)
    json.dump({"first": first, "last": last, "start": start.isoformat(),
               "rows": [rows[y] for y in range(first, last + 1)]}, sys.stdout, indent=0)
    print()
