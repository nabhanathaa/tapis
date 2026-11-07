/* TAPIS engine: pemisahan lapisan analisis.
   (1) hitungSinyal   : sinyal J (Jejaring), P (Perilaku), K (Profil/Konteks) + sinyal lemah + catatan data
   (2) hitungPrioritas: skor peringkat 0-100 (bobot rancangan awal, BUKAN hasil estimasi empiris)
   (3) tentukanLevel  : Hijau / Kuning / Oranye hasil penapisan otomatis. Merah TIDAK pernah dihasilkan di sini.
   (4) susunAntrean   : antrean pemeriksaan sadar kapasitas. Keputusan tindakan hanya lewat pemeriksaan manusia (lihat app.js).
   Semua parameter di CONFIG bersifat rancangan awal dan belum dikalibrasi dengan data berlabel. */
(function (root) {
  'use strict';
  var TS = root.TS, SY = root.TSYN;
  var CONFIG = {
    W: { sebaya: 0.20, perubahan: 0.20, jaringan: 0.35, profil: 0.15, daftar: 0.10 },   // rancangan awal
    cusum: { k: 0.5, h: 5, kalibrasi: false },                                         // ILUSTRATIF, belum dikalibrasi
    J: { minCoverage: 0.7, minUniquePayers: 20, sharedDegree: 3, sharedShare: 0.25, minLinks: 3, linkPayers: 6, minComponent: 4 },
    P: { minRecentDays: 10, minBaseDays: 14, minPeers: 5, peerZ: 3.5, ownZ: 3, madFloorPeer: 0.25, madFloorOwn: 0.15, transientMax: 3 },
    K: { newDays: 60, newHotMult: 3, tickZ: 3, madFloor: 0.15, minListConfidence: ['tinggi', 'sedang'] },
    weak: { night: 0.5, uniform: 0.45 },
    weakOnlyLevel: 'hijau'      // sinyal lemah (jam malam, nominal seragam) atau lonjakan sesaat tidak pernah cukup untuk dianggap berisiko
  };
  var DAYS = SY.DAYS, BASE = SY.BASE, FR = SY.FIRST_RECENT, TX = SY.TX, ms = SY.merchants, N = ms.length;
  var idIdx = {}; ms.forEach(function (m, i) { idIdx[m.id] = i; });

  // ---------- statistik dasar dari ledger ----------
  ms.forEach(function (m, mi) {
    var a = [], cnt = {}, nOk = 0, nF = 0, known = 0, tot = 0, night = 0, outside = 0, hrs = new Array(24).fill(0), set = {};
    for (var i = m._tx0; i < m._tx1; i++) {
      tot++; var h = Math.floor((TX.ts[i] % 1440) / 60); hrs[h]++;
      if (h >= 22 || h <= 4) night++;
      var b = m.jamBuka, op = b[0] < b[1] ? (h >= b[0] && h < b[1]) : (h >= b[0] || h < b[1]); if (!op) outside++;
      if (TX.payer[i] >= 0) { known++; set[TX.payer[i]] = 1; }
      if (TX.status[i]) { nOk++; a.push(TX.amount[i]); cnt[TX.amount[i]] = (cnt[TX.amount[i]] || 0) + 1; } else nF++;
    }
    var modal = 0; for (var k in cnt) if (cnt[k] > modal) modal = cnt[k];
    m.stat = { trx14: tot, ok14: nOk, gagal14: nF, gagalRate: tot ? nF / tot : 0, coverage: tot ? known / tot : 0, payerUnik: Object.keys(set).length,
      meanAmt: TS.mean(a), medAmt: TS.median(a), p90Amt: TS.quantile(a, 0.9), modalShare: nOk ? modal / nOk : 0, nightShare: tot ? night / tot : 0, outsideShare: tot ? outside / tot : 0, hours: hrs.map(function (x) { return tot ? x / tot : 0; }) };
    m.uniq = Object.keys(set).map(function (p) { return SY.payerNames[+p]; });
    m._payerSet = set; m._i = mi;
    m.recentVals = m.ok.slice(FR).filter(function (x) { return x !== null; });
    m.baseVals = m.ok.slice(0, BASE).filter(function (x) { return x !== null; });
    m.recentMed = TS.median(m.recentVals); m.baseMed = TS.median(m.baseVals);
    m.hours = m.stat.hours; m.nightShare = m.stat.nightShare; m.uniform = m.stat.modalShare; m.tick = m.stat.meanAmt; m.trx14 = m.stat.trx14;
    m.daily = m.ok.slice(); m.scenario = m.tag;
  });

  // ---------- (1a) sinyal J: jejaring pembayar ----------
  var payerM = {};                                           // payer -> daftar merchant (hanya merchant dengan data pembayar memadai)
  ms.forEach(function (m) { m.jData = m.stat.coverage >= CONFIG.J.minCoverage && m.stat.payerUnik >= CONFIG.J.minUniquePayers; });
  ms.forEach(function (m, mi) { if (!m.jData) return; Object.keys(m._payerSet).forEach(function (p) { (payerM[p] = payerM[p] || []).push(mi); }); });
  var pairs = {};
  Object.keys(payerM).forEach(function (p) { var l = payerM[p]; if (l.length < 2 || l.length > 14) return; for (var a = 0; a < l.length; a++) for (var b = a + 1; b < l.length; b++) { var key = l[a] + '_' + l[b]; pairs[key] = (pairs[key] || 0) + 1; } });
  var parent = ms.map(function (_, i) { return i; }); function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
  ms.forEach(function (m) { m.links = {}; m.nLinks = 0; });
  Object.keys(pairs).forEach(function (key) { if (pairs[key] < CONFIG.J.linkPayers) return; var s = key.split('_'), a = +s[0], b = +s[1]; ms[a].links[ms[b].id] = pairs[key]; ms[b].links[ms[a].id] = pairs[key]; parent[find(a)] = find(b); });
  var compSize = {}; ms.forEach(function (_, i) { var r = find(i); compSize[r] = (compSize[r] || 0) + 1; });
  ms.forEach(function (m, mi) {
    m.nLinks = Object.keys(m.links).length; m.komponen = m.nLinks ? compSize[find(mi)] : 1; m.komponenId = m.nLinks ? find(mi) : -1;
    var d3 = 0, d2 = 0, degSum = 0, n = 0;
    if (m.jData) Object.keys(m._payerSet).forEach(function (p) { var deg = (payerM[p] || []).length; n++; degSum += deg; if (deg >= 2) d2++; if (deg >= CONFIG.J.sharedDegree) d3++; });
    m.sharedShare = n ? d3 / n : 0; m.crossShare = n ? d2 / n : 0; m.fanOut = n ? degSum / n : 0; m.fanIn = m.stat.payerUnik;
    m.listMatches = []; m.uniq.forEach(function (p) { var e = SY.listed[p]; if (e) m.listMatches.push({ payer_id: p, sumber: e.sumber, tanggal: e.tanggal, dasar: e.dasar, keyakinan: e.keyakinan }); });
    m.listed = m.listMatches.length;
  });

  // ---------- (1b) sinyal P: perilaku ----------
  var byCat = {}; ms.forEach(function (m) { (byCat[m.kategori] = byCat[m.kategori] || []).push(m); });
  ms.forEach(function (m) {
    var P = CONFIG.P, peers = byCat[m.kategori].filter(function (o) { return o !== m && o.recentVals.length >= P.minRecentDays && o.umur >= 14; });
    m.pData = { recent: m.recentVals.length, base: m.baseVals.length, peers: peers.length, missingShare: 1 - (m.ok.slice(Math.max(0, DAYS - m.umur)).filter(function (x) { return x !== null; }).length / Math.max(1, Math.min(DAYS, m.umur))) };
    m.pHist = m.baseVals.length >= P.minBaseDays;
    if (m.recentVals.length < P.minRecentDays) { m.peerZ = null; m.ownZ = null; m.cusum = { max: 0, alarmAt: -1, path: [] }; m.pStatus = 'tidak_cukup_data'; return; }
    var lg = function (x) { return Math.log(1 + x); };
    m.peerZ = peers.length >= P.minPeers ? TS.robustZ(lg(m.recentMed), peers.map(function (o) { return lg(o.recentMed); }), P.madFloorPeer) : null;
    m.ownZ = m.pHist ? TS.robustZ(lg(m.recentMed), m.baseVals.map(lg), P.madFloorOwn) : null;
    m.cusum = TS.cusumUp(m.ok.map(function (x) { return x === null ? null : lg(x); }), BASE, CONFIG.cusum.k, CONFIG.cusum.h);
    var thr = Math.max(3, 2.5 * (m.baseMed || 0)), elev = m.ok.slice(FR).filter(function (x) { return x !== null && x > thr; }).length;
    m.elevDays = elev;
    m.transient = m.pHist && elev >= 1 && elev <= P.transientMax && (m.ownZ === null || m.ownZ < 2);
    var sustained = m.pHist ? m.ownZ >= P.ownZ : true;
    m.pActive = !!(sustained && ((m.peerZ !== null && m.peerZ >= P.peerZ) || (m.peerZ === null && m.ownZ !== null && m.ownZ >= P.ownZ)));
    m.pStatus = m.pActive ? 'aktif' : 'tidak';
  });

  // ---------- (1c) sinyal K: profil dan konteks ----------
  ms.forEach(function (m) {
    var K = CONFIG.K, peers = byCat[m.kategori].filter(function (o) { return o !== m; });
    m.tickZ = TS.robustZ(Math.log(m.stat.meanAmt || 1), peers.map(function (o) { return Math.log(o.stat.meanAmt || 1); }), K.madFloor);
    var p90 = TS.quantile(peers.map(function (o) { return o.recentMed; }), 0.9);
    m.newHot = m.umur < K.newDays && m.recentMed > K.newHotMult * p90;
    m.listStrong = m.listMatches.filter(function (e) { return K.minListConfidence.indexOf(e.keyakinan) >= 0; });
    m.kActive = m.newHot || Math.abs(m.tickZ) >= K.tickZ || m.listStrong.length > 0;
  });

  // ---------- (1d) status sinyal + sinyal lemah + catatan data ----------
  ms.forEach(function (m) {
    var J = m.jData ? (m.sharedShare >= CONFIG.J.sharedShare && m.nLinks >= CONFIG.J.minLinks && m.komponen >= CONFIG.J.minComponent) : null;
    m.sig = { J: J, P: m.pStatus === 'tidak_cukup_data' ? null : m.pActive, K: m.kActive };
    m.sigStatus = { J: J === null ? 'tidak_cukup_data' : J ? 'aktif' : 'tidak', P: m.pStatus === 'tidak_cukup_data' ? 'tidak_cukup_data' : (m.pActive ? 'aktif' : 'tidak'), K: m.kActive ? 'aktif' : 'tidak' };
    m.weak = { malam: m.nightShare >= CONFIG.weak.night, seragam: m.uniform >= CONFIG.weak.uniform, sesaat: !!m.transient };
    m.dataGaps = [];
    if (!m.jData) m.dataGaps.push({ signal: 'J', why: 'ID pembayar tercatat pada ' + Math.round(m.stat.coverage * 100) + '% transaksi (minimal ' + Math.round(CONFIG.J.minCoverage * 100) + '%) dan ' + m.stat.payerUnik + ' pembayar dikenal (minimal ' + CONFIG.J.minUniquePayers + ').' });
    if (m.pStatus === 'tidak_cukup_data') m.dataGaps.push({ signal: 'P', why: 'Hanya ' + m.recentVals.length + ' hari data dalam 14 hari terakhir (minimal ' + CONFIG.P.minRecentDays + ').' });
    else if (!m.pHist) m.dataGaps.push({ signal: 'P', why: 'Riwayat sendiri ' + m.baseVals.length + ' hari (minimal ' + CONFIG.P.minBaseDays + '). Hanya pembanding sebaya yang dipakai; keyakinan lebih rendah.', partial: true });
    else if (m.pData.missingShare > 0.15) m.dataGaps.push({ signal: 'P', why: 'Data harian hilang ' + Math.round(m.pData.missingShare * 100) + '% pada masa operasi. Hari kosong dilewati, bukan dianggap nol.', partial: true });
    if (m.pStatus !== 'tidak_cukup_data' && m.peerZ === null) m.dataGaps.push({ signal: 'P', why: 'Pembanding sebaya kurang dari ' + CONFIG.P.minPeers + ' merchant.', partial: true });
    m.nGroups = (m.sig.J ? 1 : 0) + (m.sig.P ? 1 : 0) + (m.sig.K ? 1 : 0);
  });

  // ---------- (2) skor prioritas ----------
  function pctOf(fn) { return TS.percentRank(ms.map(fn)); }
  var pSeb = pctOf(function (m) { return m.peerZ; }), pPer = pctOf(function (m) { return m.cusum.max === 0 && m.ownZ === null ? null : Math.max(m.ownZ === null ? -9 : m.ownZ, m.cusum.max); }),
    pJar = pctOf(function (m) { return m.jData ? m.sharedShare * Math.log(1 + m.nLinks) : null; }), pPro = pctOf(function (m) { return (m.newHot ? 3 : 0) + Math.abs(m.tickZ); });
  ms.forEach(function (m, i) {
    var parts = { sebaya: pSeb[i] === null ? 0 : pSeb[i], perubahan: pPer[i] === null ? 0 : pPer[i], jaringan: pJar[i] === null ? 0 : pJar[i], profil: pPro[i],
      daftar: m.listMatches.length ? Math.min(1, m.listMatches.reduce(function (s, e) { return s + ({ tinggi: 1, sedang: 0.6, rendah: 0.2 })[e.keyakinan]; }, 0) / 2) : 0 };
    m.parts = parts; m.partsComplete = pJar[i] !== null && pSeb[i] !== null;
    m.score = Math.round(100 * Object.keys(CONFIG.W).reduce(function (s, k) { return s + CONFIG.W[k] * parts[k]; }, 0));
  });

  // ---------- (3) level penapisan ----------
  function tentukanLevel(m) {
    var n = m.nGroups, weakAny = m.weak.malam || m.weak.seragam || m.weak.sesaat;
    if (n >= 2) return { level: 'oranye', alasan: n + ' dari 3 kelompok sinyal aktif: masuk antrean verifikasi manusia.' };
    if (n === 1) return { level: 'kuning', alasan: 'Satu kelompok sinyal aktif: dipantau otomatis, tidak masuk antrean.' };
    if (weakAny) return { level: CONFIG.weakOnlyLevel, alasan: 'Hanya sinyal lemah (jam, nominal seragam, atau lonjakan sesaat). Ini ciri usaha yang wajar dan tidak dianggap risiko.' };
    return { level: 'hijau', alasan: 'Tidak ada sinyal yang perlu ditindaklanjuti.' };
  }
  ms.forEach(function (m) { var r = tentukanLevel(m); m.level = r.level; m.levelAlasan = r.alasan; });

  // pita sebaya harian (untuk grafik profil)
  Object.keys(byCat).forEach(function (cat) {
    var base = byCat[cat].filter(function (o) { return o.tag === 'normal'; }), band = [];
    for (var d = 0; d < DAYS; d++) { var v = base.map(function (o) { return o.ok[d]; }).filter(function (x) { return x !== null; }); if (v.length < 3) v = [0, 0, 0]; band.push([TS.quantile(v, 0.1), TS.quantile(v, 0.5), TS.quantile(v, 0.9)]); }
    byCat[cat].forEach(function (m) { m.band = band; });
  });

  // ---------- (4) antrean sadar kapasitas ----------
  // kapasitas = jumlah kasus BARU yang dapat mulai ditinjau per hari kerja (parameter operasional yang diatur pengguna).
  function kapasitasHarian(analis) { return analis.reduce(function (s, a) { return s + Math.max(0, +a.kap || 0); }, 0); }
  function susunAntrean(candidates, analis) {
    var K = kapasitasHarian(analis), slots = []; analis.forEach(function (a) { for (var i = 0; i < a.kap; i++) slots.push(a.nama); });
    var list = candidates.slice().sort(function (a, b) { return b.score - a.score; });
    return list.map(function (m, r) {
      var hari = K > 0 ? Math.floor(r / K) + 1 : null;
      return { m: m, rank: r + 1, hari: hari, today: hari === 1, petugas: K > 0 ? slots[r % K] : null, status: K <= 0 ? 'Belum ada kapasitas' : hari === 1 ? 'Dijadwalkan hari ini' : 'Menunggu kapasitas' };
    });
  }

  root.TAPIS = { CONFIG: CONFIG, DAYS: DAYS, BASE: BASE, RECENT: SY.RECENT, FIRST_RECENT: FR, W: CONFIG.W, PJP: SY.PJP, CITIES: SY.CITIES, merchants: ms, listed: SY.listed, TX: SY.TX, START: SY.START, END: SY.END,
    byId: function (id) { return ms[idIdx[id]]; }, txOf: SY.txOf, txRow: SY.txRow, nTx: SY.nTx, payerNames: SY.payerNames,
    tentukanLevel: tentukanLevel, susunAntrean: susunAntrean, kapasitasHarian: kapasitasHarian,
    robustZ: TS.robustZ, cusumUp: TS.cusumUp, ppv: TS.ppv, fprMax: TS.fprMax, twoOfThree: TS.twoOfThree, median: TS.median, quantile: TS.quantile, mean: TS.mean };
  if (typeof module !== 'undefined') module.exports = root.TAPIS;
})(typeof window !== 'undefined' ? window : globalThis);
