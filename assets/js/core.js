/* TAPIS core: data DEMO + mesin penapisan (rancangan).
   Seluruh merchant, pembayar, transaksi, dan foto di berkas ini adalah DATA DEMO (tiruan).
   Angka RESMI hanya berasal dari data/resmi.js (hasil notebook). */
(function () {
  'use strict';

  // ---------- utilitas ----------
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var rnd = mulberry32(20261106);
  function ri(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(rnd() * arr.length)]; }
  function pois(l) { // Poisson sederhana (Knuth untuk l kecil, normal untuk l besar)
    if (l > 40) return Math.max(0, Math.round(l + Math.sqrt(l) * gauss()));
    var L = Math.exp(-l), k = 0, p = 1; do { k++; p *= rnd(); } while (p > L); return k - 1;
  }
  function gauss() { var u = 1 - rnd(), v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function median(a) { var s = a.slice().sort(function (x, y) { return x - y; }); var n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; }
  function quantile(a, q) { var s = a.slice().sort(function (x, y) { return x - y; }); var pos = (s.length - 1) * q, lo = Math.floor(pos), hi = Math.ceil(pos); return s[lo] + (s[hi] - s[lo]) * (pos - lo); }
  function mad(a) { var m = median(a); return median(a.map(function (x) { return Math.abs(x - m); })); }
  function mean(a) { return a.reduce(function (s, x) { return s + x; }, 0) / a.length; }

  // Robust Z (Iglewicz dan Hoaglin, 1993): 0,6745 (x - median) / MAD
  function robustZ(x, ref, floor) { var m = median(ref), d = mad(ref); d = Math.max(d, floor || 1e-9); return 0.6745 * (x - m) / d; }

  // CUSUM atas (Page, 1954) pada deret terstandar terhadap acuan
  function cusumUp(series, baseN, k, h) {
    var base = series.slice(0, baseN), mu = mean(base), sd = Math.sqrt(mean(base.map(function (x) { return (x - mu) * (x - mu); }))) || 1;
    var S = 0, out = [], alarmAt = -1;
    for (var i = 0; i < series.length; i++) {
      var z = (series[i] - mu) / sd; S = Math.max(0, S + z - k); out.push(S);
      if (i >= baseN && alarmAt < 0 && S > h) alarmAt = i;
    }
    return { path: out, max: Math.max.apply(null, out.slice(baseN)), alarmAt: alarmAt };
  }

  // ---------- data DEMO ----------
  var DAYS = 56, BASE = 28;
  var CITIES = ['Surabaya', 'Sidoarjo', 'Malang', 'Yogyakarta', 'Semarang', 'Bandung', 'Jakarta Timur', 'Depok', 'Makassar', 'Medan'];
  var CATS = {
    'Warung kelontong': { tick: 32000, lam: 38, hours: 'day', mcc: '5411' },
    'Angkringan': { tick: 17000, lam: 46, hours: 'night', mcc: '5814' },
    'Kedai kopi': { tick: 27000, lam: 52, hours: 'evening', mcc: '5814' },
    'Konter pulsa': { tick: 26000, lam: 30, hours: 'day', mcc: '4814' },
    'Toko pakaian': { tick: 118000, lam: 14, hours: 'day', mcc: '5651' },
    'Laundry kiloan': { tick: 41000, lam: 11, hours: 'day', mcc: '7211' },
    'Bengkel motor': { tick: 86000, lam: 9, hours: 'day', mcc: '7538' },
    'Fotokopi': { tick: 12000, lam: 25, hours: 'day', mcc: '7338' },
    'Bakso dan mi ayam': { tick: 21000, lam: 40, hours: 'evening', mcc: '5814' },
    'Toko sembako': { tick: 64000, lam: 22, hours: 'day', mcc: '5411' }
  };
  var NAMES = {
    'Warung kelontong': ['Warung Bu Sri', 'Warung Barokah', 'Toko Kelontong Rizki', 'Warung Pojok Gang 3', 'Warung Mak Ijah'],
    'Angkringan': ['Angkringan Mbah Sastro', 'Angkringan Lik Man', 'Angkringan Tugu Lor', 'Angkringan Pakde Wito'],
    'Kedai kopi': ['Kopi Larut', 'Kedai Kopi Tepi Rel', 'Kopi Sudut Pasar', 'Kopi Teduh'],
    'Konter pulsa': ['Konter Cahaya Cell', 'Pulsa Murah Dika', 'Konter Sinar Jaya', 'Zaky Phone'],
    'Toko pakaian': ['Busana Aisyah', 'Distro Arka', 'Toko Baju Melati', 'Grosir Kaos Abadi'],
    'Laundry kiloan': ['Laundry Bersih Kilat', 'Laundry Mbak Nur', 'Wangi Laundry', 'Laundry Asrama'],
    'Bengkel motor': ['Bengkel Jaya Motor', 'Bengkel Pak Tono', 'Servis Motor Rapi', 'Bengkel Dua Saudara'],
    'Fotokopi': ['Fotokopi Kampus', 'Fotokopi Berkah Ilmu', 'Copy Center Nusa', 'Fotokopi Pak Hadi'],
    'Bakso dan mi ayam': ['Bakso Pak Kumis', 'Mi Ayam Cak Ri', 'Bakso Stadion Mas Bowo', 'Mi Ayam Bu Tun'],
    'Toko sembako': ['Toko Sembako Makmur', 'Sembako Bu Hajah', 'Toko Beras Sumber Rejeki', 'Sembako Murah Tiga Putra']
  };
  var PJP = ['PJP Arunika', 'PJP Seroja Digital', 'PJP Lintas Bayar'];

  function hourProfile(kind) {
    var p = [];
    for (var h = 0; h < 24; h++) {
      var v;
      if (kind === 'day') v = h >= 7 && h <= 20 ? 1 + 0.6 * Math.sin((h - 7) / 13 * Math.PI) : 0.05;
      else if (kind === 'evening') v = h >= 16 ? 0.5 + (h - 16) / 6 : (h <= 1 ? 0.8 : 0.08);
      else if (kind === 'night') v = (h >= 20 || h <= 3) ? 1.2 : (h >= 17 ? 0.4 : 0.03);
      else if (kind === 'flat') v = 0.55 + 0.45 * rnd();
      p.push(v);
    }
    var s = p.reduce(function (a, b) { return a + b; }, 0); return p.map(function (x) { return x / s; });
  }
  function nmid() { var s = 'ID10'; for (var i = 0; i < 11; i++) s += ri(0, 9); return s; }

  var merchants = [], payerSeq = 0;
  function newPayer() { payerSeq++; return 'P' + String(payerSeq).padStart(5, '0'); }

  function makeMerchant(cat, name, opt) {
    opt = opt || {};
    var c = CATS[cat], lam = c.lam * (0.7 + 0.6 * rnd());
    var m = {
      id: 'm' + (merchants.length + 1), nama: name, kategori: cat, mcc: c.mcc, kota: opt.kota || pick(CITIES), nmid: nmid(),
      pjp: opt.pjp || pick(PJP), umur: opt.umur || ri(240, 2200), usaha: opt.usaha || 'Usaha mikro',
      pemilik: opt.pemilik || pick(['Sri W.', 'Ahmad F.', 'Siti R.', 'Budi S.', 'Dewi A.', 'Rudi H.', 'Nur L.', 'Agus P.', 'Wati K.', 'Hendra T.', 'Yuni M.', 'Fajar N.']),
      tick: Math.round(c.tick * (0.8 + 0.4 * rnd()) / 500) * 500, kind: opt.kind || c.hours,
      daily: [], uniform: opt.uniform || (0.12 + 0.18 * rnd()), payers: [], scenario: opt.scenario || 'normal', catatan: opt.catatan || ''
    };
    for (var d = 0; d < DAYS; d++) {
      var wk = (d % 7 === 5 || d % 7 === 6) ? 1.15 : 1, l = lam * wk;
      if (opt.ramp && d >= opt.ramp.from) l = lam * opt.ramp.mult * Math.min(1, (d - opt.ramp.from + 1) / 5);
      if (opt.event && opt.event.indexOf(d) >= 0) l = lam * 4.2;
      if (opt.preLow && d < opt.ramp.from) l = lam * 0.35;
      m.daily.push(pois(l));
    }
    m.hours = hourProfile(m.kind);
    if (opt.ticket) m.tick = opt.ticket;
    var pool = opt.ownPayers || ri(40, 110);
    for (var i = 0; i < pool; i++) m.payers.push(newPayer());
    merchants.push(m); return m;
  }

  // merchant normal: 3-4 per kategori
  Object.keys(NAMES).forEach(function (cat) {
    NAMES[cat].forEach(function (nm, i) {
      var special = { 'Angkringan Mbah Sastro': 1, 'Kopi Larut': 1, 'Konter Cahaya Cell': 1, 'Bakso Stadion Mas Bowo': 1 };
      if (special[nm]) return;
      makeMerchant(cat, nm, { kota: CITIES[(i * 3 + nm.length) % CITIES.length] });
    });
  });
  // skenario yang harus berhenti di Kuning
  makeMerchant('Angkringan', 'Angkringan Mbah Sastro', { kota: 'Yogyakarta', kind: 'night', umur: 1630, uniform: 0.58, scenario: 'malam',
    catatan: 'Ramai pukul 21.00 sampai 03.00 dan nominal seragam Rp10.000 sampai Rp15.000. Pola ini wajar untuk angkringan.' });
  makeMerchant('Kedai kopi', 'Kopi Larut', { kota: 'Malang', kind: 'night', umur: 720, uniform: 0.46, scenario: 'malam',
    catatan: 'Kedai kopi mahasiswa yang buka sampai dini hari.' });
  makeMerchant('Konter pulsa', 'Konter Cahaya Cell', { kota: 'Sidoarjo', uniform: 0.71, scenario: 'seragam',
    catatan: 'Nominal seragam karena paket pulsa dan token listrik memang berharga tetap.' });
  makeMerchant('Bakso dan mi ayam', 'Bakso Stadion Mas Bowo', { kota: 'Surabaya', event: [44, 45, 51, 52], scenario: 'acara',
    catatan: 'Lonjakan pada hari pertandingan di stadion dekat lokasi usaha.' });

  // klaster merchant bayangan (DEMO): pembayar bersama, umur muda, lonjakan
  var shellPool = []; for (var s = 0; s < 170; s++) shellPool.push(newPayer());
  var shellNames = [['Toko sembako', 'Toko Sembako Berkah 88'], ['Warung kelontong', 'Warung Sumber Hoki'], ['Konter pulsa', 'Konter Mega Isi Ulang'],
    ['Warung kelontong', 'Warung Lancar Rezeki'], ['Fotokopi', 'Fotokopi Cepat 24'], ['Toko pakaian', 'Grosir Fashion Nusa'],
    ['Kedai kopi', 'Kedai Kopi Untung'], ['Toko sembako', 'Toko Serba Ada Jaya']];
  shellNames.forEach(function (sn, i) {
    var m = makeMerchant(sn[0], sn[1], { kota: pick(['Jakarta Timur', 'Depok', 'Bandung']), umur: ri(19, 52), kind: 'flat', scenario: 'bayangan',
      ramp: { from: ri(30, 38), mult: ri(9, 22) }, preLow: true, ownPayers: ri(6, 14), uniform: 0.35 + 0.3 * rnd(),
      ticket: [50000, 52000, 75000, 100000, 50000, 99000, 60000, 98000][i], pjp: i < 5 ? PJP[0] : PJP[1] });
    var take = ri(70, 110), used = {};
    for (var t = 0; t < take; t++) { var p = shellPool[ri(0, shellPool.length - 1)]; if (!used[p]) { used[p] = 1; m.payers.push(p); } }
  });
  // merchant dengan ketidakcocokan profil saja (Kuning)
  makeMerchant('Bengkel motor', 'Bengkel Garasi Baru', { kota: 'Semarang', umur: 34, ticket: 245000, scenario: 'profil',
    catatan: 'Merchant baru dengan nominal di atas kebiasaan bengkel sejenis. Perlu dilengkapi dokumen usaha, belum ada sinyal lain.' });

  // tumpang tindih wajar antar-merchant satu kota (pelanggan yang sama belanja di beberapa tempat)
  merchants.forEach(function (m) {
    if (m.scenario === 'bayangan') return;
    merchants.forEach(function (o) {
      if (o === m || o.kota !== m.kota || o.scenario === 'bayangan') return;
      var k = ri(0, 3); for (var i = 0; i < k; i++) m.payers.push(o.payers[ri(0, o.payers.length - 1)]);
    });
  });
  // daftar rujukan (DEMO): pembayar yang tercatat pernah menyetor ke rekening situs terlapor
  var listed = {}; for (var q = 0; q < 14; q++) listed[shellPool[q * 11]] = 1;

  // ---------- mesin penapisan (rancangan) ----------
  var W = { sebaya: 0.20, perubahan: 0.20, jaringan: 0.35, profil: 0.15, daftar: 0.10 };

  function analyse() {
    var payerCount = {};
    merchants.forEach(function (m) { var seen = {}; m.payers.forEach(function (p) { if (!seen[p]) { seen[p] = 1; payerCount[p] = (payerCount[p] || 0) + 1; } }); });
    var byCat = {};
    merchants.forEach(function (m) {
      m.uniq = Array.from(new Set(m.payers));
      m.recent = mean(m.daily.slice(DAYS - 14)); m.baseMean = mean(m.daily.slice(0, BASE));
      (byCat[m.kategori] = byCat[m.kategori] || []).push(m);
      var night = m.hours.slice(22).concat(m.hours.slice(0, 5)).reduce(function (a, b) { return a + b; }, 0);
      m.nightShare = night; m.trx14 = m.daily.slice(DAYS - 14).reduce(function (a, b) { return a + b; }, 0);
    });
    merchants.forEach(function (m) {
      var peers = byCat[m.kategori].filter(function (o) { return o !== m; });
      m.peerZ = robustZ(Math.log(1 + m.recent), peers.map(function (o) { return Math.log(1 + o.recent); }), 0.25); // batas bawah MAD agar kelompok sebaya kecil tidak memicu z ekstrem
      m.cusum = cusumUp(m.daily.map(function (x) { return Math.log(1 + x); }), BASE, 0.5, 5);
      var shared = m.uniq.filter(function (p) { return payerCount[p] >= 4; });
      m.sharedShare = shared.length / m.uniq.length;
      var links = {};
      merchants.forEach(function (o) {
        if (o === m) return; var set = new Set(o.payers), k = 0;
        m.uniq.forEach(function (p) { if (set.has(p)) k++; });
        if (k >= 6) links[o.id] = k;
      });
      m.links = links; m.nLinks = Object.keys(links).length;
      m.listed = m.uniq.filter(function (p) { return listed[p]; }).length;
      var tickRef = peers.map(function (o) { return Math.log(o.tick); });
      m.tickZ = robustZ(Math.log(m.tick), tickRef, 0.15);
      var p90 = quantile(peers.map(function (o) { return o.recent; }), 0.9);
      m.newHot = m.umur < 60 && m.recent > 3 * p90;
      // kelompok sinyal
      m.sig = {
        J: m.sharedShare >= 0.25 && m.nLinks >= 3,
        P: m.peerZ >= 3.5 || m.cusum.alarmAt >= 0,
        K: m.newHot || Math.abs(m.tickZ) >= 3 || m.listed > 0
      };
      m.weak = { malam: m.nightShare >= 0.5, seragam: m.uniform >= 0.45 };
      var n = (m.sig.J ? 1 : 0) + (m.sig.P ? 1 : 0) + (m.sig.K ? 1 : 0);
      m.nGroups = n;
      m.level = n >= 2 ? 'oranye' : (n === 1 || m.weak.malam || m.weak.seragam) ? 'kuning' : 'hijau';
    });
    // skor = 100 x jumlah(bobot x persentil)
    function pct(key) {
      var vals = merchants.map(function (m) { return m[key]; }).sort(function (a, b) { return a - b; });
      merchants.forEach(function (m) { var r = 0; while (r < vals.length && vals[r] <= m[key]) r++; m['pct_' + key] = r / vals.length; });
    }
    merchants.forEach(function (m) { m.netRaw = m.sharedShare * Math.log(1 + m.nLinks); m.profRaw = (m.newHot ? 3 : 0) + Math.abs(m.tickZ); m.cusRaw = m.cusum.max; m.listRaw = m.listed; });
    ['peerZ', 'cusRaw', 'netRaw', 'profRaw', 'listRaw'].forEach(pct);
    merchants.forEach(function (m) {
      var parts = { sebaya: m.pct_peerZ, perubahan: m.pct_cusRaw, jaringan: m.pct_netRaw, profil: m.pct_profRaw, daftar: m.listRaw > 0 ? 1 : 0 };
      m.parts = parts;
      m.score = Math.round(100 * Object.keys(W).reduce(function (s, k) { return s + W[k] * parts[k]; }, 0));
      // peringkat diturunkan untuk level di bawah Oranye agar antrean hanya berisi Oranye
    });
    // pita sebaya harian
    Object.keys(byCat).forEach(function (cat) {
      var band = [];
      for (var d = 0; d < DAYS; d++) {
        var v = byCat[cat].filter(function (o) { return o.scenario === 'normal'; }).map(function (o) { return o.daily[d]; });
        if (v.length < 2) v = byCat[cat].map(function (o) { return o.daily[d]; });
        band.push([quantile(v, 0.1), quantile(v, 0.5), quantile(v, 0.9)]);
      }
      byCat[cat].forEach(function (m) { m.band = band; });
    });
    return merchants;
  }

  // ---------- rumus M3 (Bayes), dipakai simulator ----------
  function ppv(sens, prev, fpr) { return sens * prev / (sens * prev + fpr * (1 - prev)); }
  function fprMax(target, sens, prev) { return sens * prev * (1 - target) / (target * (1 - prev)); }

  window.TAPIS = {
    DAYS: DAYS, BASE: BASE, W: W, PJP: PJP, CITIES: CITIES,
    merchants: analyse(), listed: listed,
    robustZ: robustZ, cusumUp: cusumUp, ppv: ppv, fprMax: fprMax, median: median, quantile: quantile, mean: mean,
    byId: function (id) { return merchants.filter(function (m) { return m.id === id; })[0]; }
  };
})();
