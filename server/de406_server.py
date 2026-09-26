"""astro.js 가 부르는 /de406.php?idx=N 을 제공하는 최소 서버 (Python 표준 라이브러리만 사용).

    python server/de406_server.py lnxm3000p3000.406 --port 8000

같은 포트에서 이 저장소의 파일(src/, examples/)도 함께 제공하므로
http://localhost:8000/examples/ 를 열면 예제가 바로 동작한다.

레코드 형식: JPL DE406 리눅스 바이너리. 레코드마다 double 728 개, 앞의 2 레코드는 헤더,
데이터 레코드는 JD 625360.5 부터 64일 단위. 응답은 728 개 값을 쉼표로 이은 문자열.
"""
import argparse
import struct
from functools import lru_cache
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

NCOEFF = 728
RECSIZE = NCOEFF * 8
ROOT = Path(__file__).resolve().parents[1]


def make_handler(de406_path):
    nrec = de406_path.stat().st_size // RECSIZE - 2

    @lru_cache(maxsize=1024)
    def record(idx):
        with open(de406_path, "rb") as f:
            f.seek((idx + 2) * RECSIZE)
            return ",".join(repr(v) for v in struct.unpack(f"<{NCOEFF}d", f.read(RECSIZE)))

    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, *a, **kw):
            super().__init__(*a, directory=str(ROOT), **kw)

        def do_GET(self):
            u = urlsplit(self.path)
            if u.path != "/de406.php":
                return super().do_GET()
            idx = parse_qs(u.query).get("idx", [""])[0]
            if not idx.isdigit() or not 0 <= int(idx) < nrec:
                self.send_error(400, "idx")
                return
            body = record(int(idx)).encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.send_header("Cache-Control", "public, max-age=2592000")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

    return Handler


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("de406", type=Path, help="lnxm3000p3000.406 경로")
    ap.add_argument("--port", type=int, default=8000)
    args = ap.parse_args()
    print(f"http://localhost:{args.port}/examples/")
    ThreadingHTTPServer(("", args.port), make_handler(args.de406)).serve_forever()
