/* TAPIS synth: SATU skenario SIMULASI yang saling terhubung (100 merchant sintetis).
   Proporsi demonstrasi: 80 normal, 15 anomali untuk ditinjau, 5 terindikasi kuat.
   Proporsi ini hanya untuk peragaan alur, BUKAN gambaran prevalensi aktual.
   Semua ID konsisten: merchant_id, payer_id, transaction_id. Tidak ada data nyata di berkas ini. */
(function (root) {
  'use strict';
  var TS = root.TS;
  var rnd = TS.mulberry32(20261107);
  function ri(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(rnd() * a.length)]; }
  function gauss() { var u = 1 - rnd(), v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function pois(l) { if (l > 40) return Math.max(0, Math.round(l + Math.sqrt(l) * gauss())); var L = Math.exp(-l), k = 0, p = 1; do { k++; p *= rnd(); } while (p > L); return k - 1; }

  var DAYS = 56, BASE = 28, RECENT = 14, FIRST_RECENT = DAYS - RECENT;
  var END = new Date(2026, 10, 6);                        // hari terakhir data simulasi: 6 Nov 2026
  var START = new Date(END.getTime() - (DAYS - 1) * 864e5);
  var CITIES = ['Surabaya', 'Sidoarjo', 'Malang', 'Yogyakarta', 'Semarang', 'Bandung', 'Jakarta Timur', 'Depok', 'Makassar', 'Medan'];
  var PJP = ['PJP Arunika', 'PJP Seroja Digital', 'PJP Lintas Bayar'];
  var CATS = {
    'Warung kelontong': { tick: 32000, lam: 26, hours: 'day', mcc: '5411', buka: [7, 21] },
    'Angkringan': { tick: 17000, lam: 32, hours: 'night', mcc: '5814', buka: [17, 3] },
    'Kedai kopi': { tick: 27000, lam: 34, hours: 'evening', mcc: '5814', buka: [10, 24] },
    'Konter pulsa': { tick: 26000, lam: 22, hours: 'day', mcc: '4814', buka: [8, 21] },
    'Toko pakaian': { tick: 118000, lam: 10, hours: 'day', mcc: '5651', buka: [9, 21] },
    'Laundry kiloan': { tick: 41000, lam: 9, hours: 'day', mcc: '7211', buka: [7, 20] },
    'Bengkel motor': { tick: 86000, lam: 8, hours: 'day', mcc: '7538', buka: [8, 17] },
    'Fotokopi': { tick: 12000, lam: 20, hours: 'day', mcc: '7338', buka: [7, 20] },
    'Bakso dan mi ayam': { tick: 21000, lam: 28, hours: 'evening', mcc: '5814', buka: [10, 22] },
    'Toko sembako': { tick: 64000, lam: 16, hours: 'day', mcc: '5411', buka: [6, 21] }
  };
  var NORMAL_NAMES = {
    'Warung kelontong': ['Warung Bu Sri', 'Warung Barokah', 'Toko Kelontong Rizki', 'Warung Pojok Gang 3', 'Warung Mak Ijah', 'Warung Pak Darto', 'Warung Sumber Makmur', 'Toko Kelontong Lestari'],
    'Angkringan': ['Angkringan Mbah Sastro', 'Angkringan Lik Man', 'Angkringan Tugu Lor', 'Angkringan Pakde Wito', 'Angkringan Pojok Stasiun', 'Angkringan Cak Ndut', 'Angkringan Bu Narti', 'Angkringan Dini Hari'],
    'Kedai kopi': ['Kopi Larut', 'Kedai Kopi Tepi Rel', 'Kopi Sudut Pasar', 'Kopi Teduh', 'Kopi Senja Kita', 'Kedai Kopi Mbak Rina', 'Kopi Pagi Hari', 'Kopi Gang Sempit'],
    'Konter pulsa': ['Konter Cahaya Cell', 'Pulsa Murah Dika', 'Konter Sinar Jaya', 'Zaky Phone', 'Konter Mitra Seluler', 'Pulsa Kita Cell', 'Konter Aneka Voucher', 'Dunia Pulsa'],
    'Toko pakaian': ['Busana Aisyah', 'Distro Arka', 'Toko Baju Melati', 'Grosir Kaos Abadi', 'Butik Nadia', 'Toko Pakaian Murah Meriah', 'Busana Muslim Hanifah', 'Distro Pojok'],
    'Laundry kiloan': ['Laundry Bersih Kilat', 'Laundry Mbak Nur', 'Wangi Laundry', 'Laundry Asrama', 'Laundry Express Sari', 'Laundry Kiloan Murah', 'Laundry Cucian Ceria', 'Laundry Pak Heru'],
    'Bengkel motor': ['Bengkel Jaya Motor', 'Bengkel Pak Tono', 'Servis Motor Rapi', 'Bengkel Dua Saudara', 'Bengkel Motor Sentosa', 'Bengkel Cak Bambang', 'Bengkel Roda Dua', 'Servis Motor Kilat'],
    'Fotokopi': ['Fotokopi Kampus', 'Fotokopi Berkah Ilmu', 'Copy Center Nusa', 'Fotokopi Pak Hadi', 'Fotokopi Cerdas', 'Fotokopi Sinar Terang', 'Copy Mandiri', 'Fotokopi Pojok Fakultas'],
    'Bakso dan mi ayam': ['Bakso Pak Kumis', 'Mi Ayam Cak Ri', 'Bakso Stadion Mas Bowo', 'Mi Ayam Bu Tun', 'Bakso Beranak Sidoarjo', 'Mi Ayam Pak Slamet', 'Bakso Urat Mas Gendut', 'Mi Ayam Ceker Bu Lis'],
    'Toko sembako': ['Toko Sembako Makmur', 'Sembako Bu Hajah', 'Toko Beras Sumber Rejeki', 'Sembako Murah Tiga Putra', 'Toko Sembako Annisa', 'Sembako Grosir Pak Anto', 'Toko Sembako Barokah', 'Sembako Mitra Warga']
  };
  var OWNERS = ['Sri W.', 'Ahmad F.', 'Siti R.', 'Budi S.', 'Dewi A.', 'Rudi H.', 'Nur L.', 'Agus P.', 'Wati K.', 'Hendra T.', 'Yuni M.', 'Fajar N.', 'Lina S.', 'Eko P.', 'Tri W.', 'Mira D.'];

  // ---------- rancangan skenario ----------
  // tag: label internal untuk peragaan dan pengujian. Hasil penapisan dihitung mesin, bukan dibaca dari tag.
  var NORMAL_TAGS = { // nama normal -> tag khusus (sisanya 'normal')
    'Angkringan Mbah Sastro': 'malam', 'Angkringan Lik Man': 'malam', 'Angkringan Tugu Lor': 'malam', 'Angkringan Pakde Wito': 'malam',
    'Kopi Larut': 'malam', 'Kedai Kopi Tepi Rel': 'malam',
    'Konter Cahaya Cell': 'seragam', 'Pulsa Murah Dika': 'seragam', 'Konter Sinar Jaya': 'seragam', 'Zaky Phone': 'seragam',
    'Bakso Stadion Mas Bowo': 'acara', 'Warung Pojok Gang 3': 'acara', 'Fotokopi Kampus': 'acara', 'Toko Baju Melati': 'acara', 'Laundry Asrama': 'acara', 'Kopi Teduh': 'acara',
    'Warung Mak Ijah': 'payer_kurang', 'Mi Ayam Cak Ri': 'payer_kurang', 'Laundry Mbak Nur': 'payer_kurang', 'Servis Motor Rapi': 'payer_kurang', 'Toko Sembako Makmur': 'payer_kurang',
    'Busana Aisyah': 'riwayat_pendek', 'Bengkel Pak Tono': 'riwayat_pendek', 'Sembako Bu Hajah': 'riwayat_pendek', 'Kopi Sudut Pasar': 'riwayat_pendek',
    'Distro Arka': 'baru_wajar', 'Wangi Laundry': 'baru_wajar', 'Mi Ayam Bu Tun': 'baru_wajar',
    'Warung Barokah': 'data_hilang', 'Copy Center Nusa': 'data_hilang'
  };
  // [nama, kategori, tag, kelompok]
  var SPECIAL = [
    ['Toko Sembako Berkah 88', 'Toko sembako', 'kuat', 'kuat'], ['Warung Sumber Hoki', 'Warung kelontong', 'kuat', 'kuat'], ['Konter Mega Isi Ulang', 'Konter pulsa', 'kuat', 'kuat'],
    ['Fotokopi Cepat 24', 'Fotokopi', 'kuat', 'kuat'], ['Kedai Kopi Untung', 'Kedai kopi', 'kuat', 'kuat'],
    ['Bakso Viral Mbak Tika', 'Bakso dan mi ayam', 'P_saja', 'anomali'], ['Distro Live Jaya', 'Toko pakaian', 'P_saja', 'anomali'], ['Laundry Antar Jemput 24', 'Laundry kiloan', 'P_saja', 'anomali'],
    ['Bengkel Garasi Baru', 'Bengkel motor', 'K_saja', 'anomali'], ['Konter Prima Digital', 'Konter pulsa', 'K_saja', 'anomali'], ['Toko Sembako Online Kita', 'Toko sembako', 'K_saja', 'anomali'],
    ['Fotokopi Kampus Baru', 'Fotokopi', 'J_saja', 'anomali'], ['Kopi Diskusi Mahasiswa', 'Kedai kopi', 'J_saja', 'anomali'],
    ['Bakso Arisan Warga', 'Bakso dan mi ayam', 'PJ', 'anomali'], ['Butik Reuni Akbar', 'Toko pakaian', 'PJ', 'anomali'],
    ['Toko Beras Gudang Utama', 'Toko sembako', 'JK', 'anomali'], ['Bengkel Aksesori Motor Cepat', 'Bengkel motor', 'JK', 'anomali'],
    ['Grosir Kampus Mart', 'Toko sembako', 'PK', 'anomali'], ['Kedai Promo Perdana', 'Kedai kopi', 'PK', 'anomali'], ['Konter Grand Opening', 'Konter pulsa', 'PK', 'anomali']
  ];
  var NOTES = {
    malam: 'Ramai malam sampai dini hari dan nominal kecil yang seragam. Pola ini wajar untuk usaha jenis ini.',
    seragam: 'Nominal seragam karena paket pulsa, token listrik, atau menu harga tetap.',
    acara: 'Lonjakan sesaat pada akhir pekan atau hari acara lokal, lalu kembali ke pola biasa.',
    payer_kurang: 'Identitas pembayar tidak lengkap pada sebagian besar transaksi (misalnya pembayaran melalui kanal yang tidak menyertakan ID pembayar).',
    riwayat_pendek: 'Merchant baru buka sehingga riwayat transaksi belum mencapai 28 hari.',
    baru_wajar: 'Merchant relatif baru dengan volume sebanding usaha sejenis.',
    data_hilang: 'Sebagian data harian hilang karena gangguan pengiriman data dari PJP.',
    P_saja: 'Volume naik tajam dan bertahan (mis. mendadak ramai di media sosial) tanpa sinyal jejaring atau profil.',
    K_saja: 'Nominal rata-rata jauh di atas usaha sejenis. Belum ada sinyal lain; perlu dilengkapi dokumen usaha.',
    J_saja: 'Berbagi banyak pembayar dengan merchant lain (komunitas kampus/arisan), tanpa perubahan volume atau profil janggal.',
    PJ: 'Lonjakan volume dan berbagi pembayar dengan komunitas merchant yang sama.',
    JK: 'Berbagi pembayar dengan komunitas merchant yang sama dan nominal rata-rata jauh di atas usaha sejenis.',
    PK: 'Merchant baru dengan lonjakan volume pada masa promosi pembukaan.',
    kuat: 'Merchant muda dengan volume melonjak, nominal pembulatan, jaringan pembayar bersama dengan merchant lain, dan sebagian pembayar cocok dengan daftar rujukan.'
  };

  // ---------- kolom transaksi (hanya 14 hari terakhir) ----------
  var TX = { merchant: [], payer: [], ts: [], amount: [], status: [] };
  var payerNames = []; function newPayer() { payerNames.push('PYR-' + String(payerNames.length + 1).padStart(6, '0')); return payerNames.length - 1; }
  function pool(n) { var a = []; for (var i = 0; i < n; i++) a.push(newPayer()); return a; }

  function hourProfile(kind) {
    var p = [];
    for (var h = 0; h < 24; h++) {
      var v;
      if (kind === 'day') v = h >= 7 && h <= 20 ? 1 + 0.6 * Math.sin((h - 7) / 13 * Math.PI) : 0.04;
      else if (kind === 'evening') v = h >= 16 ? 0.5 + (h - 16) / 6 : (h <= 1 ? 0.8 : 0.07);
      else if (kind === 'night') v = (h >= 20 || h <= 3) ? 1.3 : (h >= 17 ? 0.35 : 0.02);
      else v = 0.55 + 0.45 * rnd();                     // 'flat': 24 jam (pola tidak khas usaha fisik)
      p.push(v);
    }
    var s = p.reduce(function (a, b) { return a + b; }, 0), c = 0; return p.map(function (x) { c += x / s; return c; });
  }
  function drawHour(cum) { var u = rnd(); for (var h = 0; h < 24; h++) if (u <= cum[h]) return h; return 23; }
  function nmid() { var s = 'ID10'; for (var i = 0; i < 11; i++) s += ri(0, 9); return s; }

  var merchants = [], listed = {}, sharedPools = {};
  function sharedPool(key, n) { return sharedPools[key] || (sharedPools[key] = pool(n)); }

  function make(cat, name, tag, group, idx) {
    var c = CATS[cat], lam = c.lam * (0.75 + 0.5 * rnd());
    var m = {
      id: 'M' + String(merchants.length + 1).padStart(3, '0'), nama: name, kategori: cat, mcc: c.mcc, tag: tag, kelompok: group,
      kota: CITIES[(idx * 3 + name.length) % CITIES.length], nmid: nmid(), pjp: PJP[merchants.length % 3], pemilik: pick(OWNERS),
      umur: ri(240, 2200), usaha: 'Usaha mikro', dokumenUsaha: 'lengkap', jamBuka: c.buka, hoursKind: c.hours,
      tickBase: Math.round(c.tick * (0.8 + 0.4 * rnd()) / 500) * 500, uniformBase: 0.12 + 0.16 * rnd(), failRate: 0.02 + 0.03 * rnd(),
      catatanSimulasi: NOTES[tag] || '', sumberData: 'SIMULASI'
    };
    var ramp = null, event = null, missingDays = 0, payerMissing = 0, poolIds = [];
    switch (tag) {
      case 'malam': m.uniformBase = 0.5 + 0.2 * rnd(); m.tickBase = Math.min(m.tickBase, 15000); m.hoursKind = 'night'; break;
      case 'seragam': m.uniformBase = 0.72 + 0.1 * rnd(); break;
      case 'acara': event = [ri(46, 53)]; if (name === 'Bakso Stadion Mas Bowo') event = [50]; break;
      case 'payer_kurang': payerMissing = 0.55 + 0.2 * rnd(); break;
      case 'riwayat_pendek': m.umur = ri(11, 24); break;
      case 'baru_wajar': m.umur = ri(32, 55); break;
      case 'data_hilang': missingDays = 0.22; break;
      case 'P_saja': ramp = { from: ri(34, 38), mult: 5.2 + rnd() }; break;
      case 'K_saja': m.tickBase = Math.round(c.tick * (3.4 + rnd()) / 500) * 500; m.dokumenUsaha = 'belum'; if (name === 'Bengkel Garasi Baru') m.umur = 34; break;
      case 'J_saja': break;
      case 'PJ': m.umur = ri(150, 400); ramp = { from: ri(34, 38), mult: 7 + rnd() }; break;
      case 'JK': m.tickBase = Math.round(c.tick * (3.4 + rnd()) / 500) * 500; m.dokumenUsaha = 'sebagian'; break;
      case 'PK': m.umur = ri(30, 40); ramp = { from: ri(33, 36), mult: 6 + rnd() }; m.dokumenUsaha = 'sebagian'; break;
      case 'kuat': m.umur = ri(19, 45); ramp = { from: ri(31, 36), mult: 5.4 + rnd() * 1.2 }; m.hoursKind = 'flat'; m.tickBase = [50000, 52000, 75000, 100000, 60000][idx]; m.uniformBase = 0.5 + 0.2 * rnd(); m.failRate = 0.09 + 0.05 * rnd(); m.dokumenUsaha = 'belum'; break;
    }
    if (name === 'Bengkel Garasi Baru') m.catatanSimulasi = 'Merchant baru dengan nominal di atas kebiasaan bengkel sejenis. Perlu dokumen usaha; belum ada sinyal lain.';
    m.modal = Math.round(m.tickBase * (0.85 + 0.3 * rnd()) / 500) * 500 || 500;
    // deret harian: [berhasil, gagal]; null = data hilang; sebelum buka = null
    var open = DAYS - m.umur; m.ok = []; m.gagal = [];
    for (var d = 0; d < DAYS; d++) {
      if (d < open) { m.ok.push(null); m.gagal.push(null); continue; }
      var wk = (d % 7 === 5 || d % 7 === 6) ? 1.12 : 1, l = lam * wk;
      if (tag === 'kuat' || tag === 'PK') l = lam * 0.5 * wk; // volume awal rendah pada merchant baru
      if (ramp && d >= ramp.from) l = lam * wk * ramp.mult * Math.min(1, (d - ramp.from + 1) / 4);
      if (event && (d === event[0] || d === event[0] + 1)) l = lam * 3.8;
      if (missingDays && d >= FIRST_RECENT - 6 && rnd() < missingDays) { m.ok.push(null); m.gagal.push(null); continue; }
      if (missingDays && d < FIRST_RECENT - 6 && rnd() < missingDays * 0.6) { m.ok.push(null); m.gagal.push(null); continue; }
      var n = pois(l), f = Math.min(n, pois(n * m.failRate)); m.ok.push(n - f); m.gagal.push(f);
    }
    m._payerMissing = payerMissing; m._event = event;
    merchants.push(m); return m;
  }

  // ---------- bangun populasi ----------
  var idx = 0;
  Object.keys(NORMAL_NAMES).forEach(function (cat) { NORMAL_NAMES[cat].forEach(function (nm) { make(cat, nm, NORMAL_TAGS[nm] || 'normal', 'normal', idx++); }); });
  SPECIAL.forEach(function (s, i) { make(s[1], s[0], s[2], s[3], s[2] === 'kuat' ? i : idx++); });

  // kolam pembayar: pribadi + kolam bersama klaster
  var COMM = ['J_saja', 'PJ', 'JK'], shellIdx = 0;
  merchants.forEach(function (m) {
    var exp = 0; for (var d = FIRST_RECENT; d < DAYS; d++) exp += (m.ok[d] || 0) + (m.gagal[d] || 0);
    var own = Math.max(14, Math.round(exp * (m.tag === 'PJ' ? 0.04 : COMM.indexOf(m.tag) >= 0 ? 0.10 : 0.30)));
    m._own = pool(own); m._shared = [];
    if (m.tag === 'kuat') { var sp = sharedPool('shell', 110); for (var i = 0; i < 80; i++) m._shared.push(sp[(i * 7 + shellIdx * 13) % sp.length]); shellIdx++; m._own = m._own.slice(0, 8); }
    else if (COMM.indexOf(m.tag) >= 0) { var sc = sharedPool('komunitas', 60); for (var j = 0; j < 60; j++) if (rnd() < 0.78) m._shared.push(sc[j]); }
  });
  // sedikit irisan wajar antarmerchant sekota (pelanggan yang sama belanja di beberapa tempat)
  merchants.forEach(function (m) {
    if (m.tag === 'kuat' || COMM.indexOf(m.tag) >= 0) return;
    var mates = merchants.filter(function (o) { return o !== m && o.kota === m.kota && o.tag !== 'kuat' && COMM.indexOf(o.tag) < 0; }).slice(0, 2);
    mates.forEach(function (o) { var k = ri(0, 2); for (var i = 0; i < k; i++) m._own.push(o._own[ri(0, o._own.length - 1)]); });
  });
  // daftar rujukan (SIMULASI): pembayar yang tercatat pada sumber rujukan fiktif
  var shell = sharedPools['shell'];
  var LISTSRC = [
    ['Daftar rujukan internal PJP Arunika (simulasi)', '2026-10-28', 'nomor rekening pembayar', 'tinggi'],
    ['Daftar rujukan internal PJP Arunika (simulasi)', '2026-10-28', 'nomor rekening pembayar', 'tinggi'],
    ['Laporan pelanggan ke PJP (simulasi)', '2026-10-15', 'nomor rekening pembayar', 'sedang'],
    ['Laporan pelanggan ke PJP (simulasi)', '2026-10-15', 'nomor rekening pembayar', 'sedang'],
    ['Laporan pelanggan ke PJP (simulasi)', '2026-10-15', 'kemiripan nama pembayar', 'rendah'],
    ['Daftar rujukan internal PJP Seroja Digital (simulasi)', '2026-09-30', 'nomor rekening pembayar', 'tinggi'],
    ['Daftar rujukan internal PJP Seroja Digital (simulasi)', '2026-09-30', 'kemiripan nama pembayar', 'rendah'],
    ['Laporan pelanggan ke PJP (simulasi)', '2026-10-15', 'nomor rekening pembayar', 'sedang']
  ];
  LISTSRC.forEach(function (e, i) { listed[payerNames[shell[3 + i * 12]]] = { sumber: e[0], tanggal: e[1], dasar: e[2], keyakinan: e[3] }; });

  // ledger 14 hari terakhir, konsisten dengan deret harian
  merchants.forEach(function (m, mi) {
    var cum = hourProfile(m.hoursKind), start = TX.ts.length, ownN = m._own.length, shN = m._shared.length;
    m._tx0 = start;
    for (var d = FIRST_RECENT; d < DAYS; d++) {
      var nok = m.ok[d], nf = m.gagal[d]; if (nok === null) continue;
      var tot = nok + nf;
      for (var t = 0; t < tot; t++) {
        var h = drawHour(cum), mn = ri(0, 59), pid;
        if (m._payerMissing && rnd() < m._payerMissing) pid = -1;
        else if (shN && rnd() < (m.tag === 'kuat' ? 0.92 : 0.88)) pid = m._shared[Math.floor(shN * Math.pow(rnd(), 1.2))];
        else pid = m._own[Math.floor(ownN * Math.pow(rnd(), 1.7))];
        var amt = rnd() < m.uniformBase ? m.modal : Math.max(1000, Math.round(m.tickBase * Math.exp(0.55 * gauss() - 0.15) / 500) * 500);
        TX.merchant.push(mi); TX.payer.push(pid); TX.ts.push(d * 1440 + h * 60 + mn); TX.amount.push(amt); TX.status.push(t < nf ? 0 : 1);
      }
    }
    m._tx1 = TX.ts.length;
  });

  function tsToDate(t) { return new Date(START.getTime() + t * 6e4); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function iso(t) { var d = tsToDate(t); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function txRow(i) { return { transaction_id: 'TRX-' + String(i + 1).padStart(7, '0'), merchant_id: merchants[TX.merchant[i]].id, payer_id: TX.payer[i] < 0 ? null : payerNames[TX.payer[i]], timestamp: iso(TX.ts[i]), amount: TX.amount[i], transaction_status: TX.status[i] ? 'berhasil' : 'gagal', label: 'SIMULASI' }; }
  function txOf(m, limit) { var out = []; for (var i = m._tx1 - 1; i >= m._tx0 && out.length < (limit || 1e9); i--) out.push(txRow(i)); return out; }

  root.TSYN = { DAYS: DAYS, BASE: BASE, RECENT: RECENT, FIRST_RECENT: FIRST_RECENT, START: START, END: END, CITIES: CITIES, PJP: PJP, CATS: CATS, merchants: merchants, TX: TX, payerNames: payerNames, listed: listed,
    txRow: txRow, txOf: txOf, tsToDate: tsToDate, nTx: function () { return TX.ts.length; }, notes: NOTES };
  if (typeof module !== 'undefined') module.exports = root.TSYN;
})(typeof window !== 'undefined' ? window : globalThis);
