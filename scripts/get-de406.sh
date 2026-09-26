#!/bin/sh
# NASA JPL DE406 (기원전 3000년 ~ 서기 3000년) 리눅스 바이너리를 받는다 (199MB).
set -e
URL=https://ssd.jpl.nasa.gov/ftp/eph/planets/Linux/de406/lnxm3000p3000.406
OUT=${1:-lnxm3000p3000.406}
curl -L --fail -o "$OUT" "$URL"
echo "저장: $OUT"
