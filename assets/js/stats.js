/* TAPIS stats: utilitas statistik murni (tanpa data). Dipakai mesin, simulator, dan uji. */
(function (root) {
  'use strict';
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function clean(a) { return a.filter(function (x) { return x !== null && x !== undefined && isFinite(x); }); }
  function sorted(a) { return clean(a).sort(function (x, y) { return x - y; }); }
  function median(a) { var s = sorted(a), n = s.length; if (!n) return NaN; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; }
  function quantile(a, q) { var s = sorted(a); if (!s.length) return NaN; var pos = (s.length - 1) * q, lo = Math.floor(pos), hi = Math.ceil(pos); return s[lo] + (s[hi] - s[lo]) * (pos - lo); }
  function mad(a) { var m = median(a); return median(clean(a).map(function (x) { return Math.abs(x - m); })); }
  function mean(a) { a = clean(a); return a.length ? a.reduce(function (s, x) { return s + x; }, 0) / a.length : NaN; }
  function sd(a) { a = clean(a); if (a.length < 2) return NaN; var m = mean(a); return Math.sqrt(a.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0) / (a.length - 1)); }

  // Robust Z (Iglewicz dan Hoaglin, 1993): 0,6745 (x - median) / MAD. floor = batas bawah MAD agar kelompok kecil tidak memicu z ekstrem.
  function robustZ(x, ref, floor) { var m = median(ref), d = Math.max(mad(ref), floor || 1e-9); return 0.6745 * (x - m) / d; }

  // CUSUM atas (Page, 1954) pada deret yang distandarkan terhadap baseN hari pertama. Nilai kosong (null) dilewati.
  // PARAMETER k dan h ILUSTRATIF, belum dikalibrasi terhadap target false-alarm rate atau average run length.
  function cusumUp(series, baseN, k, h) {
    var base = clean(series.slice(0, baseN)), mu = mean(base), s = sd(base);
    s = Math.max(isFinite(s) ? s : 0, 0.15);
    var S = 0, path = [], alarmAt = -1;
    for (var i = 0; i < series.length; i++) {
      var v = series[i];
      if (v !== null && v !== undefined) { S = Math.max(0, S + (v - mu) / s - k); }
      path.push(S);
      if (i >= baseN && alarmAt < 0 && S > h) alarmAt = i;
    }
    return { path: path, max: Math.max.apply(null, path.slice(baseN).concat([0])), alarmAt: alarmAt, k: k, h: h };
  }

  // Rumus M3 (Bayes), identik dengan notebook: PPV = Se*pi / (Se*pi + FPR*(1-pi))
  function ppv(se, pi, fpr) { var tp = se * pi, fp = fpr * (1 - pi); return (tp + fp) > 0 ? tp / (tp + fp) : NaN; }
  function fprMax(target, se, pi) { return se * pi * (1 - target) / (target * (1 - pi)); }
  // Aturan "minimal 2 dari 3 kelompok" bila ketiga kelompok identik dan independen (ASUMSI): 3p^2(1-p) + p^3
  function twoOfThree(p) { return 3 * p * p * (1 - p) + p * p * p; }

  // peringkat persentil (0..1) untuk tiap elemen; nilai null tidak diberi peringkat
  function percentRank(values) {
    var idx = [], out = new Array(values.length).fill(null);
    values.forEach(function (v, i) { if (v !== null && v !== undefined && isFinite(v)) idx.push(i); });
    var s = idx.map(function (i) { return values[i]; }).sort(function (a, b) { return a - b; });
    idx.forEach(function (i) { var r = 0; while (r < s.length && s[r] <= values[i]) r++; out[i] = r / s.length; });
    return out;
  }
  root.TS = { mulberry32: mulberry32, median: median, quantile: quantile, mad: mad, mean: mean, sd: sd, clean: clean, robustZ: robustZ, cusumUp: cusumUp, ppv: ppv, fprMax: fprMax, twoOfThree: twoOfThree, percentRank: percentRank };
  if (typeof module !== 'undefined') module.exports = root.TS;
})(typeof window !== 'undefined' ? window : globalThis);
