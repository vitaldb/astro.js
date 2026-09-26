var undefined;
function GetJD(year, month, day, hour, minute, second) {
    year = parseInt(year);
    month = parseInt(month);
    day = parseInt(day);
    hour = parseInt(hour);
    minute = parseInt(minute);
    second = parseInt(second);
    if (month < 3) {
        year--;
        month += 12;
    }
    var A = Math.floor(year / 100);
    var B = Math.floor(A / 4);
    return (
        Math.floor(365.25 * year) +
        2 -
        A +
        B +
        Math.floor(30.6 * month - 0.4) +
        day +
        1721025.5 +
        hour / 24.0 +
        minute / 1440.0 +
        second / 86400.0
    );
}
function deltaT(jd) {
    var y = GetYear(jd);
    var fd = GetJD(y, 1, 0, 0, 0, 0);
    var ld = GetJD(y + 1, 1, 0, 0, 0, 0);
    y += (jd - fd) / (ld - fd);
    var dt;
    if (y < -500) {
        var u = (y - 1820) / 100;
        dt = -20 + 32 * u * u;
    } else if (y < 500) {
        var u = y / 100;
        dt =
            10583.6 +
            u *
                (-1014.41 +
                    u *
                        (33.78311 +
                            u * (-5.952053 + u * (-0.1798452 + u * (0.022174192 + u * 0.0090316521)))));
    } else if (y < 1600) {
        var u = (y - 1000) / 100;
        dt =
            1574.2 +
            u *
                (-556.01 +
                    u *
                        (71.23472 +
                            u * (0.319781 + u * (-0.8503463 + u * (-0.005050998 + u * 0.0083572073)))));
    } else if (y < 1700) {
        var t = y - 1600;
        dt = 120 + t * (-0.9808 + t * (-0.01532 + t / 7129));
    } else if (y < 1800) {
        var t = y - 1700;
        dt = 8.83 + t * (0.1603 + t * (-0.0059285 + t * (0.00013336 - t / 1174000)));
    } else if (y < 1860) {
        var t = y - 1800;
        dt =
            13.72 +
            t *
                (-0.332447 +
                    t *
                        (0.0068612 +
                            t *
                                (0.0041116 +
                                    t *
                                        (-0.00037436 +
                                            t * (0.0000121272 + t * (-0.0000001699 + t * 0.000000000875))))));
    } else if (y < 1900) {
        var t = y - 1860;
        dt = 7.62 + t * (0.5737 + t * (-0.251754 + t * (0.01680668 + t * (-0.0004473624 + t / 233174))));
    } else if (y < 1920) {
        var t = y - 1900;
        dt = -2.79 + t * (1.494119 + t * (-0.0598939 + t * (0.0061966 + t * -0.000197)));
    } else if (y < 1941) {
        var t = y - 1920;
        dt = 21.2 + t * (0.84493 + t * (-0.0761 + t * 0.0020936));
    } else if (y < 1961) {
        var t = y - 1950;
        dt = 29.07 + 0.407 * t - (t * t) / 233 + (t * t * t) / 2547;
    } else if (y < 1986) {
        var t = y - 1975;
        dt = 45.45 + t * (1.067 + t * (-1 / 260 + (t * -1) / 718));
    } else if (y < 2005) {
        var t = y - 2000;
        dt = 63.86 + t * (0.3345 + t * (-0.060374 + t * (0.0017275 + t * (0.000651814 + t * 0.00002373599))));
    } else if (y < 2050) {
        var t = y - 2000;
        dt = 62.92 + 0.32217 * t + 0.005589 * t * t;
    } else if (y < 2150) {
        var u = (y - 1820) / 100;
        dt = -20 + 32 * u * u - 0.5628 * (2150 - y);
    } else {
        var u = (y - 1820) / 100;
        dt = -20 + 32 * u * u;
    }
    if (y < 1955) {
        var b = y - 1955.0;
        dt += -0.000091 * (-25.8 + 26.0) * b * b;
    }
    return dt;
}
function YMD(jd) {
    var year = GetYear(jd);
    if (year < 10) year = "0" + year;
    var month = GetMonth(jd);
    if (month < 10) month = "0" + month;
    var day = GetDay(jd);
    if (day < 10) day = "0" + day;
    return year + "-" + month + "-" + day;
}
function GetRiseSetTime2(_lct, calpos, h0) {
    var equ = calpos(_lct);
    var ret = GetRiseSetTime(_lct, equ, h0);
    var r = ret[0];
    if (r > _lct + 0.5) r -= 365 / 366;
    else if (r < _lct - 0.5) r += 365 / 366;
    equ = calpos(r);
    ret = GetRiseSetTime(_lct, equ, h0);
    if (r - ret[0] > 0.5) ret[0] += 365 / 366;
    else if (r - ret[0] < -0.5) ret[0] -= 365 / 366;
    r = ret[0];
    var t = ret[1];
    if (t > _lct + 0.5) t -= 365 / 366;
    else if (t < _lct - 0.5) t += 365 / 366;
    equ = calpos(t);
    ret = GetRiseSetTime(_lct, equ, h0);
    if (t - ret[1] > 0.5) ret[1] += 365 / 366;
    else if (t - ret[1] < -0.5) ret[1] -= 365 / 366;
    t = ret[1];
    var s = ret[2];
    if (s > _lct + 0.5) s -= 365 / 366;
    else if (s < _lct - 0.5) s += 365 / 366;
    equ = calpos(s);
    ret = GetRiseSetTime(_lct, equ, h0);
    if (s - ret[2] > 0.5) ret[2] += 365 / 366;
    else if (s - ret[2] < -0.5) ret[2] -= 365 / 366;
    s = ret[2];
    return [r, t, s];
}
function calsun(_lct) {
    var equ = getpos(LCTToUT(_lct, dgmt), 10);
    return equ[10];
}
function calmoon(_lct) {
    var equ = getpos(LCTToUT(_lct, dgmt), 9);
    return equ[9];
}
var calpla = [
    function (lct) {
        var equ = getpos(LCTToUT(lct, dgmt), 0);
        return equ[0];
    },
    function (lct) {
        var equ = getpos(LCTToUT(lct, dgmt), 1);
        return equ[1];
    },
    function (lct) {},
    function (lct) {
        var equ = getpos(LCTToUT(lct, dgmt), 3);
        return equ[3];
    },
    function (lct) {
        var equ = getpos(LCTToUT(lct, dgmt), 4);
        return equ[4];
    },
    function (lct) {
        var equ = getpos(LCTToUT(lct, dgmt), 5);
        return equ[5];
    },
    function (lct) {
        var equ = getpos(LCTToUT(lct, dgmt), 6);
        return equ[6];
    },
    function (lct) {
        var equ = getpos(LCTToUT(lct, dgmt), 7);
        return equ[7];
    },
    function (lct) {},
    calmoon,
    calsun,
];
var S2R = 4.8481368110953599359e-6;
var R2D = 57.295779513082320876798154814105;
var R2H = 3.8197186342054880584532103209403;
var H2R = 0.26179938779914943653855361527329;
var D2R = 0.017453292519943295769236907684886;
var M2R = D2R / 60;
var J2000 = 2451545.0;
var B1950 = 2433282.423;
var PI = 3.1415926535897932384626433832795;
var TPI = 6.283185307179586476925286766559;
var HPI = 1.5707963267948966192313216916395;
var daysofmonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function LeapYear(year) {
    if (year / 4 != Math.floor(year / 4)) return false;
    if (year / 100 != Math.floor(year / 100)) return true;
    if (year / 400 != Math.floor(year / 400)) return false;
    return true;
}
function getDaysInMonth(year, month) {
    if (month == 2 && LeapYear(year)) return 29;
    else return daysofmonth[month];
}
var Astro = {
    setCookie: function (name, value, expires, path, domain, secure) {
        var today = new Date();
        today.setTime(today.getTime());
        if (expires) expires = expires * 1000 * 60 * 60 * 24;
        var expires_date = new Date(today.getTime() + expires);
        document.cookie =
            name +
            "=" +
            escape(value) +
            (expires ? ";expires=" + expires_date.toGMTString() : "") +
            (path ? ";path=" + path : "") +
            (domain ? ";domain=" + domain : "") +
            (secure ? ";secure" : "");
    },
    getCookie: function (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(";");
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == " ") {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(nameEQ) == 0) return unescape(c.substring(nameEQ.length, c.length));
        }
        return null;
    },
};
function getmag(hel_ecl, gecl) {
    var ret = [];
    var absmag, phase_function;
    var phase, dphase;
    var i = 0;
    var hdist = hel_ecl[i].GetLength() / au;
    var gdist = gecl[i].GetLength() / au;
    phase = R2D * Ang(gecl[i], hel_ecl[i]);
    dphase = phase / 100;
    absmag = -0.6;
    phase_function = absmag + 4.98 * dphase - 4.88 * dphase * dphase + 3.02 * dphase * dphase * dphase;
    ret[i++] = phase_function + 5 * log10(hdist * gdist);
    hdist = hel_ecl[i].GetLength() / au;
    gdist = gecl[i].GetLength() / au;
    phase = R2D * Ang(gecl[i], hel_ecl[i]);
    dphase = phase / 100;
    absmag = -4.47;
    phase_function = absmag + 1.03 * dphase + 0.57 * dphase * dphase + 0.13 * dphase * dphase * dphase;
    ret[i++] = phase_function + 5 * log10(hdist * gdist);
    hdist = hel_ecl[i].GetLength() / au;
    gdist = gecl[i].GetLength() / au;
    phase = R2D * Ang(gecl[i], hel_ecl[i]);
    dphase = phase / 100;
    absmag = -3.87;
    phase_function = absmag + 1.3 * dphase + 0.19 * dphase * dphase + 0.48 * dphase * dphase * dphase;
    ret[i++] = phase_function + 5 * log10(hdist * gdist);
    hdist = hel_ecl[i].GetLength() / au;
    gdist = gecl[i].GetLength() / au;
    phase = R2D * Ang(gecl[i], hel_ecl[i]);
    dphase = phase / 100;
    absmag = -1.52;
    phase_function = absmag + 0.016 * phase;
    ret[i++] = phase_function + 5 * log10(hdist * gdist);
    hdist = hel_ecl[i].GetLength() / au;
    gdist = gecl[i].GetLength() / au;
    phase = R2D * Ang(gecl[i], hel_ecl[i]);
    dphase = phase / 100;
    absmag = -9.4;
    phase_function = absmag + 0.005 * phase;
    ret[i++] = phase_function + 5 * log10(hdist * gdist);
    hdist = hel_ecl[i].GetLength() / au;
    gdist = gecl[i].GetLength() / au;
    phase = R2D * Ang(gecl[i], hel_ecl[i]);
    dphase = phase / 100;
    absmag = -8.88;
    phase_function = absmag + 0.044 * phase;
    ret[i++] = phase_function + 5 * log10(hdist * gdist);
    hdist = hel_ecl[i].GetLength() / au;
    gdist = gecl[i].GetLength() / au;
    phase = R2D * Ang(gecl[i], hel_ecl[i]);
    dphase = phase / 100;
    absmag = -7.19;
    phase_function = absmag + 0.0028 * phase;
    ret[i++] = phase_function + 5 * log10(hdist * gdist);
    hdist = hel_ecl[i].GetLength() / au;
    gdist = gecl[i].GetLength() / au;
    phase = R2D * Ang(gecl[i], hel_ecl[i]);
    dphase = phase / 100;
    absmag = -6.87;
    phase_function = absmag + 0.0028 * phase;
    ret[i++] = phase_function + 5 * log10(hdist * gdist);
    ret[i++] = null;
    ret[i++] = null;
    ret[i++] = null;
    return ret;
}
var seoul_temp = [-2.5, -0.3, 5.2, 12.1, 17.4, 21.9, 24.9, 25.4, 20.8, 14.4, 6.9, 0.2];
function refraction(hor, p, t) {
    if (hor instanceof Array) {
        var ret = [];
        for (var i = 0; i < hor.length; i++) ret[i] = refraction(hor[i], p, t);
        return ret;
    }
    if (p == undefined) p = 1013;
    if (t == undefined) {
        if (month == undefined) t = 15;
        else t = seoul_temp[month - 1];
    }
    var z = hor.GetLon();
    var a = hor.GetLat() * R2D;
    var r = (D2R * p) / (273 + t);
    if (a > 15) r *= 0.00452 * Math.tan(HPI - a * D2R);
    else r *= (0.1594 + a * 0.019 + 0.00002 * a * a) / (1 + a * 0.505 + 0.0845 * a * a);
    return new Vector(z, a * D2R - r);
}
function GetDate(jd) {
    return Math.floor(jd - 0.5) + 0.5;
}
function GetTime(jd) {
    return (jd - GetDate(jd)) * 24.0;
}
function GetHour(jd) {
    var h = GetTime(jd);
    return Math.floor(h);
}
function GetMinute(jd) {
    var h = GetTime(jd) - GetHour(jd);
    return Math.floor(h * 60);
}
function GetSecond(jd) {
    var m = (GetTime(jd) - GetHour(jd)) * 60 - GetMinute(jd);
    return Math.floor(m * 60);
}
function GetYear(jd) {
    var Z = jd + 0.5;
    var W = Math.floor((Z - 1867216.25) / 36524.25);
    var X = Math.floor(W / 4);
    var A = Math.floor(Z + 1 + W - X);
    var B = Math.floor(A + 1524);
    var C = Math.floor((B - 122.1) / 365.25);
    var D = Math.floor(365.25 * C);
    var E = Math.floor((B - D) / 30.6001);
    var F = Math.floor(30.6001 * E);
    var year = C - 4716;
    var month = E - 1;
    if (month > 12) year += 1;
    return year;
}
function GetMonth(jd) {
    var Z = jd + 0.5;
    var W = Math.floor((Z - 1867216.25) / 36524.25);
    var X = Math.floor(W / 4);
    var A = Math.floor(Z + 1 + W - X);
    var B = Math.floor(A + 1524);
    var C = Math.floor((B - 122.1) / 365.25);
    var D = Math.floor(365.25 * C);
    var E = Math.floor((B - D) / 30.6001);
    var F = Math.floor(30.6001 * E);
    var month = E - 1;
    if (month > 12) month -= 12;
    return month;
}
function GetDay(jd) {
    var Z = jd + 0.5;
    var W = Math.floor((Z - 1867216.25) / 36524.25);
    var X = Math.floor(W / 4);
    var A = Math.floor(Z + 1 + W - X);
    var B = Math.floor(A + 1524);
    var C = Math.floor((B - 122.1) / 365.25);
    var D = Math.floor(365.25 * C);
    var E = Math.floor((B - D) / 30.6001);
    var F = Math.floor(30.6001 * E);
    return B - D - F;
}
function UTToLCT(ut, dgmt) {
    return ut + dgmt / 24.0;
}
function LCTToUT(lct, dgmt) {
    return lct - dgmt / 24.0;
}
function GSTToLCT(gst, dgmt) {
    return UTToLCT(GSTToUT(gst), dgmt);
}
function LSTToLCT(lst, lon, dgmt) {
    return GSTToLCT(LSTToGST(lst, lon), dgmt);
}
function LCTToGST(lct, dgmt) {
    var ut = LCTToUT(lct, dgmt);
    return UTToGST(ut);
}
function GSTToLST(gst, lon) {
    return gst + lon / TPI;
}
function UTToLST(ut, lon) {
    return GSTToLST(UTToGST(ut), lon);
}
function LCTToLST(lct, dgmt, lon) {
    return UTToLST(LCTToUT(lct, dgmt), lon);
}
function LSTToGST(lst, lon) {
    return lst - lon / TPI;
}
function LSTToUT(lst, lon) {
    return GSTToUT(LSTToGST(lst, lon));
}
function UTToGST(ut) {
    var ut_date = GetDate(ut);
    var ut_time = GetTime(ut);
    var d = ut - 2451545.0;
    var t = (ut_date - 2451545.0) / 36525.0;
    var gmst = 6.697374558 + 2400.051336 * t + 0.000025862 * t * t + ut_time * 1.00273790935;
    gmst = util_norm(gmst, 0, 24);
    var om = 125.04 - 0.052954 * d;
    var l = 280.47 + 0.98565 * d;
    var eps = 23.4393 - 0.0000004 * d;
    var delta_psi = -0.000319 * Math.sin(om) - 0.000024 * Math.sin(2 * l);
    var eqeq = delta_psi * Math.cos(eps);
    var gast = gmst + eqeq;
    gast = util_norm(gast, 0, 24);
    return ut_date + gast / 24.0;
}
function GSTToUT(gst) {
    var gst_date = GetDate(gst);
    var t = (gst_date - 2451545.0) / 36525.0;
    var t0 = 6.697374558 + 2400.051336 * t + 0.000025862 * t * t;
    t0 = util_norm(t0, 0, 24);
    var ut_time = GetTime(gst) - t0;
    ut_time = util_norm(ut_time, 0, 24);
    ut_time *= 0.9972695663;
    return gst_date + ut_time / 24.0;
}
function GetRiseSetTime(lct, equ, h0) {
    if (h0 == undefined) h0 = 0;
    var ut = LCTToUT(lct, dgmt);
    var gst = UTToGST(ut);
    var lst = GSTToLST(gst, glon);
    var lst_date = GetDate(lst);
    var ra = equ.GetLon();
    if (ra > PI) ra -= TPI;
    var dec = equ.GetLat();
    var tlst = lst_date + ra / TPI;
    var tlct = LSTToLCT(tlst, glon, dgmt);
    if (tlct > lct + 1) tlct = LSTToLCT(tlst - 1, glon, dgmt);
    var coslha = (Math.sin(h0) - Math.sin(glat) * Math.sin(dec)) / (Math.cos(glat) * Math.cos(dec));
    if (coslha < -1) return [undefined, 1, undefined];
    else if (coslha > 1) return [undefined, -1, undefined];
    var lha = Math.acos(coslha) / TPI;
    return [tlct - lha / 1.00273790935, tlct, tlct + lha / 1.00273790935];
}
var au = 0.149597870691000015e9;
var emrat = 0.813005600000000044e2;
var start = [3, 171, 207, 261, 291, 309, 327, 345, 363, 381, 693];
var ncoeff = [14, 12, 9, 10, 6, 6, 6, 6, 6, 13, 12];
var nspans = [4, 1, 2, 1, 1, 1, 1, 1, 1, 8, 1];
var lspeed = 2.99792458e5;
function Mod(fDividend, fDivisor) {
    return fDividend - Math.floor(fDividend / fDivisor) * fDivisor;
}
function Inv(v) {
    if (v instanceof Vector) return new Vector(-v.x, -v.y, -v.z);
}
function Ang(v1, v2) {
    if (v1 instanceof Vector && v2 instanceof Vector) return Math.acos(Dot(Normalize(v1), Normalize(v2)));
}
function Dot(v1, v2) {
    if (v1 instanceof Vector && v2 instanceof Vector) return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}
function Normalize(v1) {
    if (v1 instanceof Vector) return Div(v1, v1.GetLength());
}
function Vector(x, y, z) {
    if (typeof z == "undefined") {
        this.x = Math.cos(y) * Math.cos(x);
        this.y = Math.cos(y) * Math.sin(x);
        this.z = Math.sin(y);
    } else {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
Vector.prototype.Set = function (_x, _y, _z) {
    this.x = _x;
    this.y = _y;
    this.z = _z;
};
var ephcom_t = [];
var last_ncoeff = 2;
var last_x = -2;
function ephcom_cheby(x, record, offset, ncoeff) {
    if (last_x != x) {
        last_x = x;
        last_ncoeff = ncoeff;
        ephcom_t[0] = 1.0;
        ephcom_t[1] = x;
        for (var i = 2; i < ncoeff; i++) ephcom_t[i] = 2 * x * ephcom_t[i - 1] - ephcom_t[i - 2];
    } else if (last_ncoeff < ncoeff) {
        ephcom_t[0] = 1.0;
        ephcom_t[1] = x;
        for (var i = last_ncoeff; i < ncoeff; i++) ephcom_t[i] = 2 * x * ephcom_t[i - 1] - ephcom_t[i - 2];
        last_ncoeff = ncoeff;
    }
    var pv = new Array(3);
    for (var j = 0; j < 3; j++) {
        pv[j] = 0.0;
        for (var k = 0; k < ncoeff; k++) pv[j] += ephcom_t[k] * record[offset + j * ncoeff + k];
    }
    return pv;
}
function setCookie(name, value) {
    document.cookie = name + "=" + value + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
function Mul(v1, s) {
    if (v1 instanceof Vector) {
        return new Vector(v1.x * s, v1.y * s, v1.z * s);
    }
}
function Div(v1, s) {
    if (v1 instanceof Vector) {
        return new Vector(v1.x / s, v1.y / s, v1.z / s);
    }
}
function Add(v1, v2) {
    if (!(v2 instanceof Vector)) return v1;
    if (v1 instanceof Vector) {
        return new Vector(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
    }
    if (v1 instanceof Array) {
        var ret = [];
        for (var i = 0; i < v1.length; i++) {
            ret[i] = new Vector(v1[i].x + v2.x, v1[i].y + v2.y, v1[i].z + v2.z);
        }
        return ret;
    }
    return v1 + v2;
}
function Sub(v1, v2) {
    if (!(v2 instanceof Vector)) return v1;
    if (v1 instanceof Vector) {
        return new Vector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
    }
    if (v1 instanceof Array) {
        var ret = [];
        for (var i = 0; i < v1.length; i++) {
            ret[i] = new Vector(v1[i].x - v2.x, v1[i].y - v2.y, v1[i].z - v2.z);
        }
        return ret;
    }
    return v1 - v2;
}
Vector.prototype.GetLon = function () {
    var ret = Math.atan2(this.y, this.x);
    if (ret < 0) ret += TPI;
    return ret;
};
Vector.prototype.SetSphe = function (lon, lat) {
    this.x = Math.cos(lat) * Math.cos(lon);
    this.y = Math.cos(lat) * Math.sin(lon);
    this.z = Math.sin(lat);
};
Vector.prototype.Div = function (s) {
    this.x /= s;
    this.y /= s;
    this.z /= s;
};
Vector.prototype.toString = function () {
    return "(" + this.x + ", " + this.y + ", " + this.z + ")";
};
Vector.prototype.Mul = function (s) {
    this.x *= s;
    this.y *= s;
    this.z *= s;
};
Vector.prototype.Sub = function (v1) {
    if (v1 instanceof Vector) {
        this.x -= v1.x;
        this.y -= v1.y;
        this.z -= v1.z;
    }
};
Vector.prototype.Add = function (v1) {
    if (v1 instanceof Vector) {
        this.x += v1.x;
        this.y += v1.y;
        this.z += v1.z;
    }
};
function Matrix(x11, x12, x13, x21, x22, x23, x31, x32, x33) {
    this.m_00 = x11;
    this.m_01 = x12;
    this.m_02 = x13;
    this.m_10 = x21;
    this.m_11 = x22;
    this.m_12 = x23;
    this.m_20 = x31;
    this.m_21 = x32;
    this.m_22 = x33;
}
Matrix.prototype.Set = function (x11, x12, x13, x21, x22, x23, x31, x32, x33) {
    this.m_00 = x11;
    this.m_01 = x12;
    this.m_02 = x13;
    this.m_10 = x21;
    this.m_11 = x22;
    this.m_12 = x23;
    this.m_20 = x31;
    this.m_21 = x32;
    this.m_22 = x33;
};
Vector.prototype.GetLength2 = function () {
    return this.x * this.x + this.y * this.y + this.z * this.z;
};
Vector.prototype.GetLength = function () {
    return Math.sqrt(this.GetLength2());
};
Vector.prototype.GetLat = function () {
    var r = this.GetLength();
    return Math.asin(this.z / r);
};
Matrix.prototype.SetGalToHor = function (lst, lat) {
    var e2h = new Matrix();
    e2h.SetEquToHor(lst, lat);
    var gal2equ = new Matrix();
    gal2equ.SetGalToEqu();
    var ret = e2h.Mul(gal2equ);
    this.x = ret.x;
    this.y = ret.y;
    this.z = ret.z;
};
Matrix.prototype.SetEquToHor = function (lst, lat) {
    var lst_rad = GetTime(lst) * H2R;
    var cos_lst = Math.cos(lst_rad);
    var sin_lst = Math.sin(lst_rad);
    var cos_lat = Math.cos(lat);
    var sin_lat = Math.sin(lat);
    this.Set(
        -sin_lat * cos_lst,
        -sin_lat * sin_lst,
        cos_lat,
        -sin_lst,
        cos_lst,
        0.0,
        cos_lat * cos_lst,
        cos_lat * sin_lst,
        sin_lat,
    );
};
Matrix.prototype.Mul = function (v) {
    if (v instanceof Vector) {
        return new Vector(
            v.x * this.m_00 + v.y * this.m_01 + v.z * this.m_02,
            v.x * this.m_10 + v.y * this.m_11 + v.z * this.m_12,
            v.x * this.m_20 + v.y * this.m_21 + v.z * this.m_22,
        );
    } else if (v instanceof Matrix) {
        return new Matrix(
            this.m_00 * v.m_00 + this.m_01 * v.m_10 + this.m_02 * v.m_20,
            this.m_00 * v.m_01 + this.m_01 * v.m_11 + this.m_02 * v.m_21,
            this.m_00 * v.m_02 + this.m_01 * v.m_12 + this.m_02 * v.m_22,
            this.m_10 * v.m_00 + this.m_11 * v.m_10 + this.m_12 * v.m_20,
            this.m_10 * v.m_01 + this.m_11 * v.m_11 + this.m_12 * v.m_21,
            this.m_10 * v.m_02 + this.m_11 * v.m_12 + this.m_12 * v.m_22,
            this.m_20 * v.m_00 + this.m_21 * v.m_10 + this.m_22 * v.m_20,
            this.m_20 * v.m_01 + this.m_21 * v.m_11 + this.m_22 * v.m_21,
            this.m_20 * v.m_02 + this.m_21 * v.m_12 + this.m_22 * v.m_22,
        );
    }
};
Matrix.prototype.SetEclToHor = function (lst, lat) {
    var e2h = new Matrix();
    e2h.SetEquToHor(lst, lat);
    var ecl2equ = new Matrix();
    ecl2equ.SetEclToEqu(lst);
    var ret = e2h.Mul(ecl2equ);
    this.x = ret.x;
    this.y = ret.y;
    this.z = ret.z;
};
Matrix.prototype.SetGalToEqu = function () {
    this.Set(
        -0.0669887,
        0.4927285,
        -0.8676008,
        -0.8727558,
        -0.450347,
        -0.1883746,
        -0.4835389,
        0.7445846,
        0.4601998,
    );
};
Matrix.prototype.SetEclToEqu = function (dt) {
    var d = dt - 2451543.5;
    var e = (23.4393 - 3.563e-7 * d) * D2R;
    var cos_e = Math.cos(e);
    var sin_e = Math.sin(e);
    this.Set(1.0, 0.0, 0.0, 0.0, cos_e, -sin_e, 0.0, sin_e, cos_e);
};
Matrix.prototype.SetHorToEqu = function (lst, lat) {
    var lst_rad = GetTime(lst) * H2R;
    var cos_lst = Math.cos(lst_rad);
    var sin_lst = Math.sin(lst_rad);
    var cos_lat = Math.cos(lat);
    var sin_lat = Math.sin(lat);
    this.Set(
        -cos_lst * sin_lat,
        -sin_lst,
        cos_lst * cos_lat,
        -sin_lst * sin_lat,
        cos_lst,
        sin_lst * cos_lat,
        cos_lat,
        0.0,
        sin_lat,
    );
};
Matrix.prototype.SetEquToEcl = function (dt) {
    var d = dt - 2451543.5;
    var e = (23.4393 - 3.563e-7 * d) * D2R;
    var cos_e = Math.cos(e);
    var sin_e = Math.sin(e);
    this.Set(1.0, 0.0, 0.0, 0.0, cos_e, sin_e, 0.0, -sin_e, cos_e);
};
function EquToEcl(equ, dt) {
    if (equ instanceof Array) {
        var ret = [];
        for (var i = 0; i < equ.length; i++) ret[i] = EquToEcl(equ[i], dt);
        return ret;
    }
    var d = dt - 2451543.5;
    var e = (23.4393 - 3.563e-7 * d) * D2R;
    var cos_e = Math.cos(e);
    var sin_e = Math.sin(e);
    var x = equ.x;
    var y = equ.y;
    var z = equ.z;
    return new Vector(x * 1.0 + y * 0 + z * 0, x * 0 + y * cos_e + z * sin_e, x * 0 + y * -sin_e + z * cos_e);
}
function HorToEqu(hor, lst, lat) {
    if (hor instanceof Array) {
        var ret = [];
        for (var i = 0; i < hor.length; i++) ret[i] = HorToEqu(hor[i], lst, lat);
        return ret;
    }
    var mat = new Matrix();
    mat.SetHorToEqu(lst, lat);
    return mat.Mul(hor);
}
function EquToGal(equ) {
    var x = equ.x;
    var y = equ.y;
    var z = equ.z;
    return new Vector(
        x * -0.0669887 + y * -0.8727558 + z * -0.4835389,
        x * 0.4927285 + y * -0.450347 + z * 0.7445846,
        x * -0.8676008 + y * -0.1883746 + z * 0.4601998,
    );
}
function EclToEqu(ecl, dt) {
    var x = ecl.x;
    var y = ecl.y;
    var z = ecl.z;
    var d = dt - 2451543.5;
    var e = (23.4393 - 3.563e-7 * d) * D2R;
    var cos_e = Math.cos(e);
    var sin_e = Math.sin(e);
    return new Vector(
        x * 1.0 + y * 0.0 + z * 0.0,
        x * 0.0 + y * cos_e + z * -sin_e,
        x * 0.0 + y * sin_e + z * cos_e,
    );
}
function EclToHor(ecl, lst, lat) {
    return Equ2Hor(EclToEqu(ecl, lst), lst, lat);
}
function HorToEqu(hor, lst, lat) {
    var mat = new Matrix();
    mat.SetHorToEqu(lst, lat);
    return mat.Mul(hor);
}
function EquToHor(equ, lst, lat) {
    if (equ instanceof Array) {
        var ret = [];
        for (var i = 0; i < equ.length; i++) ret[i] = EquToHor(equ[i], lst, lat);
        return ret;
    }
    var mat = new Matrix();
    mat.SetEquToHor(lst, lat);
    return mat.Mul(equ);
}
function epsiln(jd) {
    var t = (jd - 2451545.0) / 365250.0;
    return (
        ((((((((((2.45e-10 * t + 5.79e-9) * t + 2.787e-7) * t + 7.12e-7) * t - 3.905e-5) * t - 2.4967e-3) *
            t -
            5.138e-3) *
            t +
            1.9989) *
            t -
            0.0152) *
            t -
            468.0927) *
            t +
            84381.412) *
        S2R
    );
}
var jdnut = -1.0;
var nutl = 0.0;
var nuto = 0.0;
var ntcoeff = [
    0, 0, 0, 0, 2, 2062, 2, -895, 5, -2, 0, 2, 0, 1, 46, 0, -24, 0, 2, 0, -2, 0, 0, 11, 0, 0, 0, -2, 0, 2, 0,
    2, -3, 0, 1, 0, 1, -1, 0, -1, 0, -3, 0, 0, 0, 0, -2, 2, -2, 1, -2, 0, 1, 0, 2, 0, -2, 0, 1, 1, 0, 0, 0, 0,
    0, 2, -2, 2, -13187, -16, 5736, -31, 0, 1, 0, 0, 0, 1426, -34, 54, -1, 0, 1, 2, -2, 2, -517, 12, 224, -6,
    0, -1, 2, -2, 2, 217, -5, -95, 3, 0, 0, 2, -2, 1, 129, 1, -70, 0, 2, 0, 0, -2, 0, 48, 0, 1, 0, 0, 0, 2,
    -2, 0, -22, 0, 0, 0, 0, 2, 0, 0, 0, 17, -1, 0, 0, 0, 1, 0, 0, 1, -15, 0, 9, 0, 0, 2, 2, -2, 2, -16, 1, 7,
    0, 0, -1, 0, 0, 1, -12, 0, 6, 0, -2, 0, 0, 2, 1, -6, 0, 3, 0, 0, -1, 2, -2, 1, -5, 0, 3, 0, 2, 0, 0, -2,
    1, 4, 0, -2, 0, 0, 1, 2, -2, 1, 4, 0, -2, 0, 1, 0, 0, -1, 0, -4, 0, 0, 0, 2, 1, 0, -2, 0, 1, 0, 0, 0, 0,
    0, -2, 2, 1, 1, 0, 0, 0, 0, 1, -2, 2, 0, -1, 0, 0, 0, 0, 1, 0, 0, 2, 1, 0, 0, 0, -1, 0, 0, 1, 1, 1, 0, 0,
    0, 0, 1, 2, -2, 0, -1, 0, 0, 0, 0, 0, 2, 0, 2, -2274, -2, 977, -5, 1, 0, 0, 0, 0, 712, 1, -7, 0, 0, 0, 2,
    0, 1, -386, -4, 200, 0, 1, 0, 2, 0, 2, -301, 0, 129, -1, 1, 0, 0, -2, 0, -158, 0, -1, 0, -1, 0, 2, 0, 2,
    123, 0, -53, 0, 0, 0, 0, 2, 0, 63, 0, -2, 0, 1, 0, 0, 0, 1, 63, 1, -33, 0, -1, 0, 0, 0, 1, -58, -1, 32, 0,
    -1, 0, 2, 2, 2, -59, 0, 26, 0, 1, 0, 2, 0, 1, -51, 0, 27, 0, 0, 0, 2, 2, 2, -38, 0, 16, 0, 2, 0, 0, 0, 0,
    29, 0, -1, 0, 1, 0, 2, -2, 2, 29, 0, -12, 0, 2, 0, 2, 0, 2, -31, 0, 13, 0, 0, 0, 2, 0, 0, 26, 0, -1, 0,
    -1, 0, 2, 0, 1, 21, 0, -10, 0, -1, 0, 0, 2, 1, 16, 0, -8, 0, 1, 0, 0, -2, 1, -13, 0, 7, 0, -1, 0, 2, 2, 1,
    -10, 0, 5, 0, 1, 1, 0, -2, 0, -7, 0, 0, 0, 0, 1, 2, 0, 2, 7, 0, -3, 0, 0, -1, 2, 0, 2, -7, 0, 3, 0, 1, 0,
    2, 2, 2, -8, 0, 3, 0, 1, 0, 0, 2, 0, 6, 0, 0, 0, 2, 0, 2, -2, 2, 6, 0, -3, 0, 0, 0, 0, 2, 1, -6, 0, 3, 0,
    0, 0, 2, 2, 1, -7, 0, 3, 0, 1, 0, 2, -2, 1, 6, 0, -3, 0, 0, 0, 0, -2, 1, -5, 0, 3, 0, 1, -1, 0, 0, 0, 5,
    0, 0, 0, 2, 0, 2, 0, 1, -5, 0, 3, 0, 0, 1, 0, -2, 0, -4, 0, 0, 0, 1, 0, -2, 0, 0, 4, 0, 0, 0, 0, 0, 0, 1,
    0, -4, 0, 0, 0, 1, 1, 0, 0, 0, -3, 0, 0, 0, 1, 0, 2, 0, 0, 3, 0, 0, 0, 1, -1, 2, 0, 2, -3, 0, 1, 0, -1,
    -1, 2, 2, 2, -3, 0, 1, 0, -2, 0, 0, 0, 1, -2, 0, 1, 0, 3, 0, 2, 0, 2, -3, 0, 1, 0, 0, -1, 2, 2, 2, -3, 0,
    1, 0, 1, 1, 2, 0, 2, 2, 0, -1, 0, -1, 0, 2, -2, 1, -2, 0, 1, 0, 2, 0, 0, 0, 1, 2, 0, -1, 0, 1, 0, 0, 0, 2,
    -2, 0, 1, 0, 3, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 1, 2, 2, 0, -1, 0, -1, 0, 0, 0, 2, 1, 0, -1, 0, 1, 0, 0,
    -4, 0, -1, 0, 0, 0, -2, 0, 2, 2, 2, 1, 0, -1, 0, -1, 0, 2, 4, 2, -2, 0, 1, 0, 2, 0, 0, -4, 0, -1, 0, 0, 0,
    1, 1, 2, -2, 2, 1, 0, -1, 0, 1, 0, 2, 2, 1, -1, 0, 1, 0, -2, 0, 2, 4, 2, -1, 0, 1, 0, -1, 0, 4, 0, 2, 1,
    0, 0, 0, 1, -1, 0, -2, 0, 1, 0, 0, 0, 2, 0, 2, -2, 1, 1, 0, -1, 0, 2, 0, 2, 2, 2, -1, 0, 0, 0, 1, 0, 0, 2,
    1, -1, 0, 0, 0, 0, 0, 4, -2, 2, 1, 0, 0, 0, 3, 0, 2, -2, 2, 1, 0, 0, 0, 1, 0, 2, -2, 0, -1, 0, 0, 0, 0, 1,
    2, 0, 1, 1, 0, 0, 0, -1, -1, 0, 2, 1, 1, 0, 0, 0, 0, 0, -2, 0, 1, -1, 0, 0, 0, 0, 0, 2, -1, 2, -1, 0, 0,
    0, 0, 1, 0, 2, 0, -1, 0, 0, 0, 1, 0, -2, -2, 0, -1, 0, 0, 0, 0, -1, 2, 0, 1, -1, 0, 0, 0, 1, 1, 0, -2, 1,
    -1, 0, 0, 0, 1, 0, -2, 2, 0, -1, 0, 0, 0, 2, 0, 0, 2, 0, 1, 0, 0, 0, 0, 0, 2, 4, 2, -1, 0, 0, 0, 0, 1, 0,
    1, 0, 1, 0, 0, 0,
];
var ss_nutate = new Array([], [], [], [], []);
var cc_nutate = new Array([], [], [], [], []);
function nutlo(jd) {
    if (jdnut == jd) return;
    jdnut = jd;
    var t = (jd - 2451545.0) / 36525.0;
    var t2 = t * t;
    var t10 = t / 10.0;
    var OM = (mods3600(-6962890.539 * t + 450160.28) + (0.008 * t + 7.455) * t2) * S2R;
    var MS = (mods3600(129596581.224 * t + 1287099.804) - (0.012 * t + 0.577) * t2) * S2R;
    var MM = (mods3600(1717915922.633 * t + 485866.733) + (0.064 * t + 31.31) * t2) * S2R;
    var FF = (mods3600(1739527263.137 * t + 335778.877) + (0.011 * t - 13.257) * t2) * S2R;
    var DD = (mods3600(1602961601.328 * t + 1072261.307) + (0.019 * t - 6.891) * t2) * S2R;
    var f, g;
    var cu, su, sw;
    var C = 0.0;
    var D = 0.0;
    var p = 0;
    for (var i = 0; i < 105; i++) {
        var k1 = 0;
        var cv = 0.0;
        var sv = 0.0;
        for (var m = 0; m < 5; m++) {
            var ang = 0;
            if (m == 0) ang = MM;
            else if (m == 1) ang = MS;
            else if (m == 2) ang = FF;
            else if (m == 3) ang = DD;
            else if (m == 4) ang = OM;
            var j = ntcoeff[p++];
            if (j) {
                su = Math.sin(ang * j);
                cu = Math.cos(ang * j);
                if (k1 == 0) {
                    sv = su;
                    cv = cu;
                    k1 = 1;
                } else {
                    sw = su * cv + cu * sv;
                    cv = cu * cv - su * sv;
                    sv = sw;
                }
            }
        }
        f = ntcoeff[p++] + t10 * ntcoeff[p++];
        g = ntcoeff[p++] + t10 * ntcoeff[p++];
        C += f * sv;
        D += g * cv;
    }
    C += (-1742 * t10 - 171996) * Math.sin(OM);
    D += (89 * t10 + 92025) * Math.cos(OM);
    nutl = 0.0001 * C * S2R;
    nuto = 0.0001 * D * S2R;
}
var nutmat_jd = null;
var nutmat = null;
function nutate(vec, jd) {
    // 같은 jd 로 여러 천체를 부르므로 장동 행렬을 jd 별로 한 번만 만든다(결과는 같다)
    if (nutmat_jd === jd) return nutmat.Mul(vec);
    nutlo(jd);
    var eps = epsiln(jd);
    var f = eps + nuto;
    var ce = Math.cos(f);
    var se = Math.sin(f);
    var so = Math.sin(nuto);
    var cl = Math.cos(nutl);
    var sl = Math.sin(nutl);
    var mat = new Matrix(
        cl,
        -sl * Math.cos(eps),
        -sl * Math.sin(eps),
        sl * ce,
        cl * Math.cos(eps) * ce + Math.sin(eps) * se,
        -(so + (1.0 - cl) * Math.sin(eps) * ce),
        sl * se,
        so + (cl - 1.0) * se * Math.cos(eps),
        cl * Math.sin(eps) * se + Math.cos(eps) * ce,
    );
    nutmat = mat;
    nutmat_jd = jd;
    return mat.Mul(vec);
}
var pAcof = [
    -8.66e-10, -4.759e-8, 2.424e-7, 1.3095e-5, 1.7451e-4, -1.8055e-3, -0.235316, 0.07732, 111.1971, 50290.966,
];
var nodecof = [
    6.6402e-16, -2.69151e-15, -1.547021e-12, 7.521313e-12, 6.3190131e-10, -3.48388152e-9, -1.813065896e-7,
    2.75036225e-8, 7.4394531426e-5, -0.042078604317, 3.052112654975,
];
var inclcof = [
    1.2147e-16, 7.3759e-17, -8.26287e-14, 2.50341e-13, 2.4650839e-11, -5.4000441e-11, 1.32115526e-9,
    -5.998737027e-7, -1.6242797091e-5, 0.002278495537, 0,
];
// 세차 회전에 쓰는 각의 sin/cos 을 (jd, 방향) 별로 한 번만 계산해 둔다.
// 회전 순서와 연산은 원래 코드와 같으므로 결과가 비트 단위로 같다.
var precess_cache = {};
function precess_coef(jd, direction) {
    var key = direction == 1 ? 1 : -1;
    var c = precess_cache[key];
    if (c && c.jd === jd) return c;
    var eps = epsiln(J2000);
    if (direction == 1) eps = epsiln(jd);
    var t = (jd - J2000) / 365250.0;
    var p = 0;
    var pa = pAcof[p++];
    for (var i = 0; i < 9; i++) pa = pa * t + pAcof[p++];
    pa *= S2R * t;
    p = 0;
    var w = nodecof[p++];
    for (var i = 0; i < 10; i++) w = w * t + nodecof[p++];
    var z1 = w;
    if (direction == 1) z1 = w + pa;
    p = 0;
    var z2 = inclcof[p++];
    for (var i = 0; i < 10; i++) z2 = z2 * t + inclcof[p++];
    if (direction == 1) z2 = -z2;
    var z3;
    if (direction == 1) z3 = -w;
    else z3 = -w - pa;
    var eps2;
    if (direction == 1) eps2 = epsiln(J2000);
    else eps2 = epsiln(jd);
    c = {
        jd: jd,
        pA: pa,
        ce1: Math.cos(eps),
        se1: Math.sin(eps),
        B1: Math.cos(z1),
        A1: Math.sin(z1),
        B2: Math.cos(z2),
        A2: Math.sin(z2),
        B3: Math.cos(z3),
        A3: Math.sin(z3),
        ce2: Math.cos(eps2),
        se2: Math.sin(eps2),
    };
    precess_cache[key] = c;
    return c;
}
function precess(vec, jd, direction) {
    if (jd == J2000) return vec;
    var c = precess_coef(jd, direction);
    pA = c.pA; // 원래 코드가 전역 변수 pA 를 남겼으므로 유지한다
    var x0 = vec.x;
    var x1 = c.ce1 * vec.y + c.se1 * vec.z;
    var x2 = -c.se1 * vec.y + c.ce1 * vec.z;
    var z = c.B1 * x0 + c.A1 * x1;
    x1 = -c.A1 * x0 + c.B1 * x1;
    x0 = z;
    z = c.B2 * x1 + c.A2 * x2;
    x2 = -c.A2 * x1 + c.B2 * x2;
    x1 = z;
    z = c.B3 * x0 + c.A3 * x1;
    x1 = -c.A3 * x0 + c.B3 * x1;
    x0 = z;
    z = c.ce2 * x1 - c.se2 * x2;
    x2 = c.se2 * x1 + c.ce2 * x2;
    x1 = z;
    return new Vector(x0, x1, x2);
}
function sidrlt(jd) {
    var secs = GetTime(jd) * 3600.0;
    var jd0 = GetDate(jd);
    var t = (jd - J2000) / 36525.0;
    var t0 = (jd0 - J2000) / 36525.0;
    nutlo(jd);
    var eps = epsiln(jd);
    var eqeq = 240.0 * R2D * nutl * Math.cos(eps);
    var gmst = (((-2.0e-6 * t0 - 3e-7) * t0 + 9.27695e-2) * t0 + 8640184.7928613) * t0 + 24110.54841;
    var msday =
        (((-(4 * 2.0e-6) * t0 - 3 * 3e-7) * t0 + 2 * 9.27695e-2) * t0 + 8640184.7928613) / (86400 * 36525) +
        1.0;
    gmst = gmst + msday * secs + eqeq;
    gmst = gmst - 86400.0 * Math.floor(gmst / 86400.0);
    if (gmst < 0.0) gmst += 86400.0;
    return gmst;
}
function mods3600(x) {
    lx = x;
    return lx - 1296000.0 * Math.floor(lx / 1296000.0);
}
function make2(x) {
    x = Math.floor(x);
    return x < 10 ? "0" + x : x;
}
function dms(x) {
    var sign;
    var res = "";
    var s = x * R2D;
    if (s < 0.0) {
        res += " -";
        sign = -1;
        s = -s;
    } else {
        res += " +";
        sign = 1;
    }
    var d = s;
    s -= Math.floor(d);
    s *= 60;
    var m = s;
    s -= Math.floor(m);
    s *= 60;
    res += make2(d) + " " + make2(m) + " " + make2(s);
    return res;
}
function dms2(x) {
    var sign;
    var res = "";
    var s = x * R2D;
    if (s < 0.0) {
        res += " -";
        sign = -1;
        s = -s;
    } else {
        res += " +";
        sign = 1;
    }
    var d = s;
    s -= Math.floor(d);
    s *= 60;
    var m = s;
    s -= Math.floor(m);
    s *= 60;
    res += make2(d) + "도 " + make2(m) + "분 " + make2(s) + "초";
    return res;
}
function dm(x) {
    var res = "";
    var s = x * R2D;
    var d = s;
    s -= Math.floor(d);
    s *= 60;
    var m = s;
    res += make2(d) + " " + make2(m);
    return res;
}
function hms2(x) {
    var res = new String();
    var s = x * R2H;
    var d = s;
    s -= Math.floor(d);
    s *= 60;
    var m = s;
    s -= Math.floor(m);
    s *= 60;
    res += make2(d) + "시 " + make2(m) + "분 " + make2(s) + "초";
    return res;
}
function hms(x) {
    var res = new String();
    var s = x * R2H;
    var d = s;
    s -= Math.floor(d);
    s *= 60;
    var m = s;
    s -= Math.floor(m);
    s *= 60;
    res += make2(d) + " " + make2(m) + " " + make2(s);
    return res;
}
function hm(x) {
    var res = new String();
    var s = x * R2H;
    var d = s;
    s -= Math.floor(d);
    s *= 60;
    var m = s;
    res += make2(d) + ":" + make2(m);
    return res;
}
function HToHMS(x) {
    var d = Math.floor(x);
    x -= d;
    x *= 60;
    var m = Math.floor(x);
    x -= m;
    x *= 60;
    var s = Math.floor(x);
    if (d < 10) d = "0" + d;
    if (m < 10) m = "0" + m;
    if (s < 10) s = "0" + s;
    return make2(d) + ":" + make2(m) + ":" + make2(s);
}
function HTo12HMS(x) {
    var d = Math.floor(x);
    x -= d;
    x *= 60;
    var m = Math.floor(x);
    x -= m;
    x *= 60;
    var s = Math.floor(x);
    if (d < 10) d = "0" + d;
    if (m < 10) m = "0" + m;
    if (s < 10) s = "0" + s;
    return (d < 12 ? "오전" : "오후") + " " + (make2(d) % 12) + ":" + make2(m) + ":" + make2(s);
}
function HToHMS2(x) {
    var d = Math.floor(x);
    x -= d;
    x *= 60;
    var m = Math.floor(x);
    x -= m;
    x *= 60;
    var s = Math.floor(x);
    if (d < 10) d = "0" + d;
    if (m < 10) m = "0" + m;
    if (s < 10) s = "0" + s;
    return make2(d) + "시 " + make2(m) + "분 " + make2(s) + "초";
}
function HToHM(x) {
    var d = Math.floor(x);
    x -= d;
    x *= 60;
    var m = Math.floor(x);
    if (d < 10) d = "0" + d;
    if (m < 10) m = "0" + m;
    return make2(d) + ":" + make2(m);
}
function util_norm(x, from, to) {
    var w = to - from;
    return x - Math.floor((x - from) / w) * w;
}
var planet_mag0 = [-0.42, -4.4, 0, -1.52, -9.4, -8.88, -7.19, -6.87, -1.0];
var planet_radius0 = [2439, 6051, 6378, 3396, 70850, 60330, 25400, 24300, 1, 1738, 695990];
var planet_hnames = [
    "수성",
    "금성",
    "지구",
    "화성",
    "목성",
    "토성",
    "천왕성",
    "해왕성",
    "명왕성",
    "달",
    "태양",
];
var planet_enames = [
    "Mercury",
    "Venus",
    "Earth",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
    "Pluto",
    "Moon",
    "Sun",
];
var planet_colors = [
    "#BABABA",
    "#F0D19F",
    "#6464FF",
    "#BE8A72",
    "#958266",
    "#DBA94F",
    "#8AC8F0",
    "#3F7CC2",
    "#848484",
    "#848484",
    "#E4AC00",
];
function log10(x) {
    return Math.log(x) / Math.log(10);
}
function newXMLHttpRequest() {
    var xmlreq = false;
    if (window.XMLHttpRequest) {
        xmlreq = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        try {
            xmlreq = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e1) {
            try {
                xmlreq = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e2) {}
        }
    }
    return xmlreq;
}
var req;
var de406 = [];
function getrecord(idx) {
    if (req == undefined) req = newXMLHttpRequest();
    if (de406[idx] == undefined) {
        req.open("GET", "/de406.php?idx=" + idx, false);
        req.send();
        if (req.status == 200) {
            // 쉼표로 이은 계수 728개를 한 번만 숫자로 바꿔 둔다(계산할 때마다 문자열을 숫자로 바꾸지 않도록).
            // Number(문자열) 은 곱셈 때의 암묵 변환과 같은 값이므로 결과는 그대로다.
            var text = req.responseText.split(",");
            var record = typeof Float64Array != "undefined" ? new Float64Array(text.length) : [];
            for (var i = 0; i < text.length; i++) record[i] = +text[i];
            de406[idx] = record;
        }
    }
    return de406[idx];
}
function gethel(jd, id) {
    if (jd < 625360.5 || jd > 2816784.5) return;
    var idx = Math.floor((jd - 625360.5) / 64);
    var record = getrecord(idx);
    var blockdays = jd - record[0];
    var pos = [];
    for (var i = 0; i < 11; i++) {
        if (id != undefined && i != id && i != 2 && i != 9 && i != 10) continue;
        var subspan = 64 / nspans[i];
        var nsub = Math.floor((jd - record[0]) / subspan);
        var dataoffset = start[i] - 1 + 3 * ncoeff[i] * nsub;
        var subdays = blockdays - (nsub * 64) / nspans[i];
        var chebytime = (2 * subdays) / subspan - 1.0;
        var ret = ephcom_cheby(chebytime, record, dataoffset, ncoeff[i]);
        pos[i] = new Vector(ret[0], ret[1], ret[2]);
    }
    pos[2] = Sub(pos[2], Div(pos[9], 1.0 + emrat));
    pos[9] = Add(pos[9], pos[2]);
    for (var i = 0; i < 11; i++) pos[i] = Sub(pos[i], pos[10]);
    return pos;
}
function getpos(jd, id) {
    var pos = gethel(jd, id);
    var ret = [];
    for (var i = 0; i < 11; i++) {
        if (id == undefined || i == id || i == 2 || i == 9 || i == 10) {
            ret[i] = Sub(pos[i], pos[2]);
            ret[i] = nutate(ret[i], jd);
            ret[i] = precess(ret[i], jd, -1);
        }
    }
    return ret;
}
var lstbl = [
    "124112121221",
    "221211212121",
    "222121412121",
    "221212121212",
    "121221212121",
    "212152122121",
    "211212122212",
    "121121212221",
    "212321212122",
    "212112112212",
    "221211212152",
    "212211212112",
    "212212121212",
    "121212521212",
    "112122122121",
    "211212122212",
    "121152121222",
    "121121122122",
    "212112112122",
    "216112112122",
    "122121212112",
    "212122122312",
    "122121221212",
    "112121221221",
    "211241221221",
    "211211221222",
    "121121121222",
    "122321121221",
    "222112112121",
    "222121211521",
    "221221212112",
    "121221212212",
    "112124212212",
    "112121212221",
    "211211212221",
    "221151212212",
    "221121121212",
    "221212112121",
    "224212112121",
    "212212212112",
    "121212522121",
    "121212122122",
    "112112122212",
    "211232122122",
    "211211212122",
    "212121121212",
    "221521121212",
    "212212112121",
    "212212121212",
    "152122121212",
    "121212122122",
    "112115221222",
    "112112121222",
    "121211212122",
    "212151212121",
    "222121121212",
    "122121212121",
    "215221212121",
    "212121221212",
    "121121252212",
    "121121212221",
    "212112121222",
    "121232112212",
    "221211211221",
    "221221121212",
    "122412121212",
    "121212212121",
    "211221212212",
    "151212122212",
    "121121212221",
    "212115122122",
    "212112112212",
    "221211211212",
    "221251212112",
    "212212121212",
    "121212212121",
    "232122122121",
    "211212122212",
    "121121522122",
    "121121122122",
    "212112112122",
    "212232112122",
    "122121212112",
    "212122121211",
    "212521221212",
    "112121221221",
    "211212122122",
    "151211221222",
    "121121121222",
    "122115121221",
    "222112112121",
    "222121211212",
    "122161212112",
    "121221221212",
    "112121221221",
    "214121212221",
    "211211212221",
    "221121412212",
    "221121121212",
    "221212112121",
    "221224112121",
    "212212212112",
    "121212212212",
    "112412122122",
    "112112122212",
    "211211212212",
    "251211212122",
    "212121121212",
    "221212321212",
    "212212112121",
    "212212121212",
    "121242121212",
    "121122122122",
    "112112122122",
    "214112121222",
    "121211212122",
    "212121152122",
    "122121121212",
    "122121212121",
    "212125212121",
    "212121221212",
    "121121221221",
    "212321212221",
    "212112121222",
    "121211211221",
    "225211211221",
    "221221121212",
    "122121521212",
    "121212212121",
    "211221212212",
    "121152122212",
    "121121212221",
    "212112112221",
    "221512112212",
    "221211211212",
    "221212152112",
    "212212121211",
    "221212212121",
    "211216122121",
    "211212122122",
    "121121122122",
    "212321122122",
    "212112112122",
    "212211211522",
    "122121211212",
    "122122121211",
    "212215221212",
    "112121221221",
    "211212122122",
    "121151212222",
    "121121121222",
    "122112112122",
    "125212112121",
    "222121211212",
    "122122152112",
    "121221212212",
    "112121221221",
    "211232212221",
    "211211212221",
    "221121121221",
    "222321121212",
    "221212112121",
    "221221211212",
    "152212122112",
    "121212212211",
    "212121522122",
    "112112122212",
    "211211212212",
    "221151212122",
    "212121121212",
    "212212112121",
    "216212112121",
    "212212121212",
    "121212125212",
    "121121222122",
    "112112122122",
    "211232121222",
    "121211212122",
    "212121121212",
    "212521121212",
    "122121212121",
    "212122121212",
    "152121221212",
    "121121221221",
    "212115212221",
    "212112121222",
    "121211211222",
    "122151211221",
    "221221121122",
    "121221212121",
    "215212212121",
    "211212212212",
    "121121522212",
    "121121212221",
    "212112112212",
    "221214112122",
    "221211211212",
    "221212121121",
    "221252121211",
    "212212212121",
    "211212212212",
    "151212122212",
    "121121122122",
];
function absdate(y, m, d) {
    if (m < 3) {
        y--;
        m += 12;
    }
    A = Math.floor(y / 100);
    B = Math.floor(A / 4);
    return Math.floor(365.25 * y) - A + B + Math.floor(30.6 * m - 0.4) + d;
}
function sol2lun(y, m, d) {
    if (ly < 1841 || ly > 2041) return { year: 0, month: 0, day: 0, leap: 0 };
    var ly = 1841;
    var lm = 1;
    var ld = absdate(y, m, d) - absdate(1841, 1, 22);
    var c = "";
    while (true) {
        c = lstbl[ly - 1841].substr(lm - 1, 1);
        switch (c) {
            case "1":
                nday = 29;
                break;
            case "2":
                nday = 30;
                break;
            case "3":
                nday = 58;
                break;
            case "4":
                nday = 59;
                break;
            case "5":
                nday = 59;
                break;
            case "6":
                nday = 60;
                break;
        }
        if (ld <= nday) break;
        ld -= nday;
        if (lm == 12) {
            lm = 1;
            ly++;
        } else lm++;
    }
    switch (c) {
        case "3":
            nday = 29;
            break;
        case "4":
            nday = 29;
            break;
        case "5":
            nday = 30;
            break;
        case "6":
            nday = 30;
            break;
    }
    if (ld <= nday) return { year: ly, month: lm, day: ld, leap: 0 };
    return { year: ly, month: lm, day: ld - nday, leap: 1 };
}
function lun2sol(ly, lm, ld) {
    if (ly < 1841 || ly > 2041) return { year: 0, month: 0, day: 0 };
    var jd = GetJD(1841, 1, 22, 0, 0, 0);
    for (var y = 1841; y <= ly; y++) {
        for (var m = 1; m <= 12; m++) {
            var c = lstbl[y - 1841].substr(m - 1, 1);
            var nday = 0;
            switch (c) {
                case "1":
                    nday = 29;
                    break;
                case "2":
                    nday = 30;
                    break;
                case "3":
                    nday = 58;
                    break;
                case "4":
                    nday = 59;
                    break;
                case "5":
                    nday = 59;
                    break;
                case "6":
                    nday = 60;
                    break;
            }
            if (y == ly && m == lm) break;
            jd += nday;
        }
    }
    jd += ld;
    return { year: GetYear(jd), month: GetMonth(jd), day: GetDay(jd) };
}
