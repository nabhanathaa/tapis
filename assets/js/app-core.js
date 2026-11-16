/* TAPIS app-core: ruang nama bersama (window.A), indeks spasial 514 wilayah, manajemen sesi multi-peran, model kasus, dan kerangka mobile app flagship (Pilahin-style). */
(function () {
  'use strict';
  var T = window.TAPIS, U = window.UI, R = window.RESMI, H = R.hasil;
  var A = window.A = { T: T, U: U, R: R, H: H, app: document.getElementById('app') };
  var icon = U.icon, idn = U.idn, esc = U.esc;

  // ---------- Penyimpanan Lokal (Namespace v7) ----------
  var MEM = {};
  var NS = 'tapis7.';
  A.load = function (k, d) { try { var v = localStorage.getItem(NS + k); return v ? JSON.parse(v) : d; } catch (e) { return MEM[k] !== undefined ? MEM[k] : d; } };
  A.save = function (k, v) { MEM[k] = v; try { localStorage.setItem(NS + k, JSON.stringify(v)); } catch (e) { } };
  A.resetAll = function () { try { Object.keys(localStorage).filter(function (k) { return k.indexOf('tapis') === 0; }).forEach(function (k) { localStorage.removeItem(k); }); } catch (e) { } MEM = {}; };
  A.hash = function (s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); };

  // ---------- Indeks Spasial 38 Provinsi & 514 Kabupaten/Kota ----------
  var PROV_COUNTS = [23, 33, 19, 12, 11, 17, 10, 15, 7, 7, 6, 27, 35, 5, 38, 8, 9, 10, 22, 14, 14, 13, 10, 5, 15, 13, 24, 17, 6, 6, 11, 10, 7, 6, 9, 4, 8, 8];
  function pulauOf(pi) {
    if (pi <= 9) return 'Sumatera';
    if (pi <= 15) return 'Jawa';
    if (pi <= 18) return 'Bali & Nusa Tenggara';
    if (pi <= 23) return 'Kalimantan';
    if (pi <= 29) return 'Sulawesi';
    return 'Maluku & Papua';
  }
  function buildSpatialIndex() {
    var kMap = (R.klaster && R.klaster.kota_klaster) || {};
    var kKeys = Object.keys(kMap);
    var profs = (R.klaster && R.klaster.profil) || [];
    var profById = {};
    profs.forEach(function (p) { profById[p.id] = p; });
    var provs = (R.peta && R.peta.prov) || [];
    var kabList = [], provMeta = [], cursor = 0;

    provs.forEach(function (pv, pi) {
      var cnt = PROV_COUNTS[pi] || 0;
      var slice = kKeys.slice(cursor, cursor + cnt);
      cursor += cnt;
      var cCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
      var pKabs = [];
      slice.forEach(function (kName) {
        var cid = kMap[kName] || 1;
        cCounts[cid] = (cCounts[cid] || 0) + 1;
        var item = {
          nama: kName,
          tipe: kName.indexOf('Kota ') === 0 ? 'Kota' : 'Kabupaten',
          provinsi: pv.n,
          provIdx: pi,
          pulau: pulauOf(pi),
          klaster: cid,
          klasterNama: profById[cid] ? profById[cid].nama : ('Klaster ' + cid),
          klasterWarna: profById[cid] ? profById[cid].warna : '#1D5BD8',
          sektorDominan: profById[cid] ? profById[cid].sektor_dominan : ''
        };
        kabList.push(item);
        pKabs.push(item);
      });
      var dom = 1, maxC = -1;
      [1, 3, 4, 2].forEach(function (cid) {
        if (cCounts[cid] > maxC) { maxC = cCounts[cid]; dom = cid; }
      });
      provMeta.push({
        idx: pi,
        nama: pv.n,
        pulau: pulauOf(pi),
        pdrbKapita: pv.v,
        pertumbuhan: pv.g,
        d: pv.d,
        nKab: cnt,
        kCounts: cCounts,
        domKlaster: dom,
        domProfil: profById[dom] || null,
        kabs: pKabs
      });
    });
    return {
      provs: provMeta,
      kabs: kabList,
      profById: profById,
      pulauList: ['Sumatera', 'Jawa', 'Bali & Nusa Tenggara', 'Kalimantan', 'Sulawesi', 'Maluku & Papua']
    };
  }
  A.SPATIAL = buildSpatialIndex();

  // ---------- Peran & Akun Instansi ----------
  A.ROLES = {
    pjp_analis: { nama: 'Analis Pemantauan Merchant', inst: 'PJP pengakuisisi', short: 'Analis PJP' },
    pjp_pejabat: { nama: 'Pejabat Kepatuhan APU-PPT', inst: 'PJP pengakuisisi', short: 'Pejabat PJP' },
    bi: { nama: 'Pengawas Sistem Pembayaran', inst: 'Bank Indonesia', short: 'Pengawas BI' },
    ppatk: { nama: 'Analis Transaksi Keuangan', inst: 'PPATK', short: 'Analis PPATK' }
  };
  A.DEMO_USERS = [
    { email: 'rani@arunika.demo', nama: 'Rani Kusumawardani', role: 'pjp_analis', unit: 'PJP Arunika – Unit Pemantauan Transaksi', nip: 'ARK-04417', pass: A.hash('demo1234'), c: '#1D5BD8' },
    { email: 'dimas@arunika.demo', nama: 'Dimas Prakoso', role: 'pjp_pejabat', unit: 'PJP Arunika – Kepatuhan APU-PPT (Pejabat 1)', nip: 'ARK-01102', pass: A.hash('demo1234'), c: '#081E46' },
    { email: 'hana@arunika.demo', nama: 'Hana Lestari', role: 'pjp_pejabat', unit: 'PJP Arunika – Kepatuhan APU-PPT (Pejabat 2)', nip: 'ARK-01108', pass: A.hash('demo1234'), c: '#0F766E' },
    { email: 'laras@bi.demo', nama: 'Laras Ayuningtyas', role: 'bi', unit: 'Bank Indonesia – Pengawasan Sistem Pembayaran', nip: 'BI-DPSP-2291', pass: A.hash('demo1234'), c: '#D97706' },
    { email: 'yoga@ppatk.demo', nama: 'Yoga Pratama', role: 'ppatk', unit: 'PPATK – Direktorat Analisis Transaksi', nip: 'PPATK-0815', pass: A.hash('demo1234'), c: '#DC2626' }
  ];

  var S = A.S = {};
  S.users = A.load('users', null);
  if (!S.users || S.users.length < A.DEMO_USERS.length) {
    S.users = A.DEMO_USERS.slice();
    A.save('users', S.users);
  }
  S.session = A.load('session', 'rani@arunika.demo');
  S.settings = A.load('settings', { analis: [{ nama: 'Rani Kusumawardani', kap: 2 }, { nama: 'Sinta Maharani', kap: 1 }] });

  A.me = function () {
    var u = S.session && S.users.filter(function (x) { return x.email === S.session; })[0];
    if (!u && location.hash !== '#/masuk' && location.hash !== '#/daftar') {
      u = S.users[0] || A.DEMO_USERS[0];
      S.session = u.email;
      A.save('session', u.email);
    }
    return u;
  };
  A.isPJP = function () { var u = A.me(); return !!u && (u.role === 'pjp_analis' || u.role === 'pjp_pejabat'); };
  A.isPejabat = function () { var u = A.me(); return !!u && u.role === 'pjp_pejabat'; };
  A.pejabat = function () { return S.users.filter(function (u) { return u.role === 'pjp_pejabat'; }); };

  A.switchUser = function (email, targetHash) {
    var u = S.users.find(function (x) { return x.email === email; }) || A.DEMO_USERS.find(function (x) { return x.email === email; });
    if (!u) return;
    S.session = u.email;
    A.save('session', u.email);
    var curHash = location.hash || '#/beranda';
    if (targetHash) {
      if (location.hash === targetHash) A.route();
      else location.hash = targetHash;
    } else {
      var v = curHash.slice(2).split('/')[0] || 'beranda';
      if (u.role === 'bi' && v === 'antrean') location.hash = '#/pengawasan';
      else if (u.role === 'ppatk' && v === 'antrean') location.hash = '#/ltkm';
      else if (A.isPJP() && (v === 'pengawasan' || v === 'ltkm')) location.hash = '#/antrean';
      else A.route();
    }
    A.toast('Peran aktif: ' + u.nama.split(' ')[0] + ' (' + (A.ROLES[u.role] ? A.ROLES[u.role].short : u.role) + ')');
  };

  // ---------- Tanggal dan Hari Kerja ----------
  A.BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  A.HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  A.today = function () { var d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  A.fmtD = function (d) { d = new Date(d); return d.getDate() + ' ' + A.BULAN[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear(); };
  A.fmtDT = function (d) { d = new Date(d); return A.fmtD(d) + ', ' + String(d.getHours()).padStart(2, '0') + '.' + String(d.getMinutes()).padStart(2, '0'); };
  A.addWorkdays = function (d, n) { d = new Date(d); var k = 0; while (k < n) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) k++; } return d; };
  A.subWorkdays = function (d, n) { d = new Date(d); var k = 0; while (k < n) { d.setDate(d.getDate() - 1); if (d.getDay() !== 0 && d.getDay() !== 6) k++; } return d; };
  A.workdaysBetween = function (a, b) { a = new Date(a); b = new Date(b); a.setHours(0, 0, 0, 0); b.setHours(0, 0, 0, 0); var n = 0, s = a < b ? 1 : -1; while (a.getTime() !== b.getTime()) { a.setDate(a.getDate() + s); if (a.getDay() !== 0 && a.getDay() !== 6) n += s; } return n; };
  A.bln = function (s) { var p = s.split('-'); return A.BULAN[+p[1] - 1] + ' ' + p[0]; };

  // ---------- Model Kasus Pemeriksaan Berjenjang ----------
  var JENIS_BUKTI = ['Kunjungan lapangan', 'Dokumen usaha', 'Wawancara pemilik', 'Klarifikasi merchant', 'Analisis transaksi'];
  A.JENIS_BUKTI = JENIS_BUKTI;
  A.ACTIVE = ['Investigasi', 'Menunggu klarifikasi', 'Menunggu persetujuan', 'Dibatasi', 'Keberatan'];
  function at(d, h, mi) { d = new Date(d); d.setHours(h, mi || 0, 0, 0); return d.toISOString(); }
  function seedCases() {
    var t = A.today(), y = t.getFullYear(), c = [], sw = A.subWorkdays;
    function base(no, mid, st, dibuka, pet) { return { id: 'KS-' + y + '-' + no, mid: mid, status: st, dibuka: dibuka, petugas: pet || 'Rani Kusumawardani', bukti: [], dokumen: [], catatan: [], setuju: [], riwayat: [], log: [], keberatan: null, hasil: '' }; }
    function rw(k, t0, dari, ke, oleh, alasan) { k.riwayat.push({ t: t0, dari: dari, ke: ke, oleh: oleh, alasan: alasan }); }
    var o1 = at(sw(t, 5), 8, 52), s1 = sw(t, 2); s1.setHours(9, 40);
    var k = base('0141', 'M084', 'Dibatasi', o1);
    k.bukti = [{ t: at(sw(t, 4), 11, 0), jenis: 'Kunjungan lapangan', ket: 'Alamat usaha pada profil tidak ditemukan; bangunan kosong.', oleh: 'Rani Kusumawardani' }, { t: at(sw(t, 4), 14, 0), jenis: 'Analisis transaksi', ket: 'Pembayar bersama dengan 3 merchant lain; sebagian cocok daftar rujukan.', oleh: 'Rani Kusumawardani' }, { t: at(sw(t, 3), 10, 0), jenis: 'Dokumen usaha', ket: 'NIB dan foto usaha tidak dapat diberikan pemilik.', oleh: 'Rani Kusumawardani' }];
    k.dokumen = [{ t: at(sw(t, 4), 9, 30), minta: 'NIB, foto usaha, dan nota pembelian stok', status: 'Tidak diterima', ket: 'Tidak dipenuhi dalam 2 hari kerja.' }];
    k.catatan = [{ t: at(sw(t, 3), 10, 15), dari: 'Pemilik (via telepon)', isi: 'Pemilik menyatakan usaha dikelola orang lain dan tidak dapat menunjukkan dokumen.' }];
    k.setuju = [{ nama: 'Dimas Prakoso', waktu: s1.toISOString() }, { nama: 'Hana Lestari', waktu: new Date(s1.getTime() + 36e5).toISOString() }]; k.mulaiBatas = new Date(s1.getTime() + 36e5).toISOString();
    rw(k, o1, 'Oranye (penapisan)', 'Investigasi', 'Rani Kusumawardani', 'Kasus dibuka dari antrean.'); rw(k, k.mulaiBatas, 'Investigasi', 'Dibatasi', 'Dimas Prakoso dan Hana Lestari', 'Bukti memadai; persetujuan dua pejabat.');
    k.log = [{ t: o1, s: 'Sistem', a: 'Level Oranye, 3 dari 3 kelompok sinyal. Masuk antrean.' }, { t: o1, s: 'Rani Kusumawardani', a: 'Kasus dibuka.' }, { t: s1.toISOString(), s: 'Dimas Prakoso', a: 'Persetujuan pertama.' }, { t: k.mulaiBatas, s: 'Hana Lestari', a: 'Persetujuan kedua. Berita acara diterbitkan, salinan dikirim ke merchant.' }];
    c.push(k);
    var o2 = at(sw(t, 6), 10, 5), s2 = sw(t, 3); s2.setHours(13, 0);
    k = base('0138', 'M083', 'Keberatan', o2);
    k.bukti = [{ t: at(sw(t, 5), 10, 0), jenis: 'Analisis transaksi', ket: 'Volume naik 4 kali dalam 10 hari; pembayar bersama dengan 3 merchant lain.', oleh: 'Rani Kusumawardani' }, { t: at(sw(t, 5), 15, 0), jenis: 'Wawancara pemilik', ket: 'Pemilik sulit dihubungi; jawaban tidak konsisten soal asal stok.', oleh: 'Rani Kusumawardani' }];
    k.dokumen = [{ t: at(sw(t, 5), 9, 0), minta: 'NIB dan nota pemasok', status: 'Diminta', ket: '' }];
    k.setuju = [{ nama: 'Dimas Prakoso', waktu: s2.toISOString() }, { nama: 'Hana Lestari', waktu: new Date(s2.getTime() + 18e5).toISOString() }]; k.mulaiBatas = new Date(s2.getTime() + 18e5).toISOString();
    var kbT = at(sw(t, 1), 9, 20);
    k.keberatan = { t: kbT, isi: 'Konter baru buka bulan lalu dan melayani mahasiswa kampus sekitar. Kami melampirkan foto toko, NIB, dan nota pembelian stok dari distributor.', status: 'Diajukan', putusan: '' };
    k.catatan = [{ t: kbT, dari: 'Merchant', isi: 'Lampiran: foto toko, NIB, nota stok distributor (3 lembar).' }];
    rw(k, o2, 'Oranye (penapisan)', 'Investigasi', 'Rani Kusumawardani', 'Kasus dibuka dari antrean.'); rw(k, k.mulaiBatas, 'Investigasi', 'Dibatasi', 'Dimas Prakoso dan Hana Lestari', 'Bukti memadai; persetujuan dua pejabat.'); rw(k, kbT, 'Dibatasi', 'Keberatan', 'Rani Kusumawardani', 'Keberatan merchant dicatat beserta lampiran.');
    k.log = [{ t: o2, s: 'Rani Kusumawardani', a: 'Kasus dibuka.' }, { t: k.mulaiBatas, s: 'Hana Lestari', a: 'Persetujuan kedua. Berita acara diterbitkan.' }, { t: kbT, s: 'Rani Kusumawardani', a: 'Keberatan merchant dicatat. Menunggu putusan pejabat.' }];
    c.push(k);
    var o3 = at(sw(t, 9), 9, 20), lk = at(sw(t, 7), 15, 40);
    k = base('0127', 'M082', 'Diteruskan', o3); k.unsurTKM = at(sw(t, 9), 16, 0); k.ltkm = lk;
    k.bukti = [{ t: at(sw(t, 8), 10, 0), jenis: 'Kunjungan lapangan', ket: 'Toko tutup; papan nama tidak sesuai profil.', oleh: 'Rani Kusumawardani' }, { t: at(sw(t, 8), 13, 0), jenis: 'Analisis transaksi', ket: 'Jaringan pembayar sama dengan 4 merchant lain; 6 pembayar cocok daftar rujukan.', oleh: 'Rani Kusumawardani' }];
    rw(k, o3, 'Oranye (penapisan)', 'Investigasi', 'Rani Kusumawardani', 'Kasus dibuka dari antrean.'); rw(k, lk, 'Investigasi', 'Diteruskan', 'Dimas Prakoso', 'LTKM dikirim ke PPATK.');
    k.log = [{ t: o3, s: 'Rani Kusumawardani', a: 'Kasus dibuka.' }, { t: lk, s: 'Dimas Prakoso', a: 'LTKM dikirim ke PPATK (2 hari kerja sejak unsur TKM diketahui).' }];
    c.push(k);
    [['0119', 'M098', 12, 'Merchant baru dalam masa promosi pembukaan. Pemilik menunjukkan NIB, nota pemasok, dan foto kegiatan promo. Pembayar adalah pelanggan lokal tanpa kaitan dengan merchant lain.'], ['0121', 'M099', 11, 'Lonjakan bertepatan dengan diskon pembukaan yang diumumkan di media sosial usaha. Dokumen usaha lengkap dan kunjungan lapangan sesuai profil.']].forEach(function (z) {
      var od = at(sw(t, z[2]), 13, 10), cd = at(sw(t, z[2] - 2), 16, 25);
      var q = base(z[0], z[1], 'Tidak terbukti', od);
      q.bukti = [{ t: at(sw(t, z[2] - 1), 10, 0), jenis: 'Kunjungan lapangan', ket: 'Lokasi sesuai profil; usaha beroperasi normal.', oleh: 'Rani Kusumawardani' }, { t: at(sw(t, z[2] - 1), 14, 0), jenis: 'Dokumen usaha', ket: 'NIB dan nota pemasok diterima.', oleh: 'Rani Kusumawardani' }];
      q.dokumen = [{ t: od, minta: 'NIB dan nota pemasok', status: 'Diterima', ket: 'Lengkap.' }]; q.catatan = [{ t: at(sw(t, z[2] - 1), 9, 0), dari: 'Pemilik', isi: 'Pembukaan toko disertai promo; lonjakan transaksi diharapkan.' }];
      q.hasil = z[3]; rw(q, od, 'Oranye (penapisan)', 'Investigasi', 'Rani Kusumawardani', 'Kasus dibuka dari antrean.'); rw(q, cd, 'Investigasi', 'Tidak terbukti', 'Rani Kusumawardani', 'Merchant memberi klarifikasi memadai; skor tinggi bukan bukti.');
      q.log = [{ t: od, s: 'Rani Kusumawardani', a: 'Kasus dibuka.' }, { t: cd, s: 'Rani Kusumawardani', a: 'Ditutup: tidak terbukti. Status penapisan dikoreksi ke Hijau; merchant diberi tahu.' }]; q.ditutup = cd; c.push(q);
    });
    var o6 = at(sw(t, 1), 11, 0);
    k = base('0149', 'M096', 'Menunggu klarifikasi', o6);
    k.bukti = [{ t: o6, jenis: 'Analisis transaksi', ket: 'Nominal rata-rata jauh di atas toko sembako sejenis; berbagi pembayar dengan komunitas merchant yang sama.', oleh: 'Rani Kusumawardani' }];
    k.dokumen = [{ t: o6, minta: 'Daftar pelanggan tetap (grosir), nota pemasok, dan surat keterangan usaha', status: 'Diminta', ket: 'Batas jawaban ' + A.fmtD(A.addWorkdays(new Date(o6), 3)) + '.' }];
    rw(k, o6, 'Oranye (penapisan)', 'Investigasi', 'Rani Kusumawardani', 'Kasus dibuka dari antrean.'); rw(k, o6, 'Investigasi', 'Menunggu klarifikasi', 'Rani Kusumawardani', 'Meminta dokumen usaha dan klarifikasi pemilik.');
    k.log = [{ t: o6, s: 'Rani Kusumawardani', a: 'Kasus dibuka. Permintaan dokumen dikirim ke merchant.' }];
    c.push(k);
    return c;
  }

  S.cases = A.load('cases', null); if (!S.cases) { S.cases = seedCases(); A.save('cases', S.cases); }
  A.saveCases = function () { A.save('cases', S.cases); };
  A.saveSettings = function () { A.save('settings', S.settings); };
  A.caseOf = function (mid) { var l = S.cases.filter(function (c) { return c.mid === mid; }); return l.length ? l[0] : null; };
  A.activeCase = function (mid) { return S.cases.filter(function (c) { return c.mid === mid && A.ACTIVE.indexOf(c.status) >= 0; })[0] || null; };
  A.effLevel = function (m) {
    var c = A.caseOf(m.id);
    if (c && (c.status === 'Dibatasi' || c.status === 'Keberatan')) return 'merah';
    if (c && c.status === 'Tidak terbukti') return 'hijau';
    return m.level;
  };
  A.buktiStatus = function (c) {
    var jenis = {}; c.bukti.forEach(function (b) { jenis[b.jenis] = 1; });
    var n = Object.keys(jenis).length, nonTrx = Object.keys(jenis).filter(function (j) { return j !== 'Analisis transaksi'; }).length;
    var okDoc = !c.dokumen.some(function (d) { return d.status === 'Diminta'; });
    var memadai = n >= 2 && nonTrx >= 1;
    return { n: n, nonTrx: nonTrx, memadai: memadai, okDoc: okDoc, label: memadai ? 'Memadai' : (n ? 'Belum memadai' : 'Belum ada') };
  };
  A.unhandled = function () { return T.merchants.filter(function (m) { return m.level === 'oranye' && !A.caseOf(m.id); }); };
  A.antrean = function () { return T.susunAntrean(A.unhandled(), S.settings.analis); };
  A.kapasitas = function () { return T.kapasitasHarian(S.settings.analis); };
  A.newCaseId = function () { var y = new Date().getFullYear(), mx = 150; S.cases.forEach(function (c) { var n = +c.id.split('-')[2]; if (n > mx) mx = n; }); return 'KS-' + y + '-' + String(mx + 1).padStart(4, '0'); };
  A.logCase = function (c, who, text) { c.log.push({ t: new Date().toISOString(), s: who, a: text }); };
  A.ubahStatus = function (c, ke, oleh, alasan) { c.riwayat.push({ t: new Date().toISOString(), dari: c.status, ke: ke, oleh: oleh, alasan: alasan }); c.status = ke; };
  A.openCase = function (m, u) {
    var q = A.antrean().filter(function (x) { return x.m === m; })[0], t = new Date().toISOString();
    var c = { id: A.newCaseId(), mid: m.id, status: 'Investigasi', dibuka: t, petugas: u.nama, prioritas: q ? { rank: q.rank, skor: m.score } : { rank: null, skor: m.score }, bukti: [], dokumen: [], catatan: [], setuju: [], riwayat: [{ t: t, dari: 'Oranye (penapisan)', ke: 'Investigasi', oleh: u.nama, alasan: 'Kasus dibuka dari antrean.' }], log: [{ t: t, s: 'Sistem', a: 'Level Oranye, ' + m.nGroups + ' dari 3 kelompok sinyal. Skor prioritas ' + m.score + '.' }, { t: t, s: u.nama, a: 'Kasus dibuka.' }], keberatan: null, hasil: '' };
    S.cases.unshift(c); A.saveCases(); return c;
  };

  // ---------- Komponen Tampilan Bersama ----------
  A.initials = function (n) { return String(n || '?').split(' ').filter(Boolean).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase(); };
  A.avatar = function (u) { return '<span class="tb-av" style="background:' + (u.c || '#15459B') + '">' + esc(A.initials(u.nama)) + '</span>'; };
  A.cu = function (v, d, pre, suf) { pre = pre || ''; suf = suf || ''; d = d || 0; return '<span class="num cu" data-cu="' + v + '" data-d="' + d + '" data-pre="' + pre + '" data-suf="' + suf + '">' + pre + idn(v, d) + suf + '</span>'; };
  A.skipAnim = false;
  var RED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  A.animate = function (root) {
    if (!RED) root.querySelectorAll('[data-cu]').forEach(function (el) {
      var v = +el.dataset.cu, d = +el.dataset.d, pre = el.dataset.pre, suf = el.dataset.suf, t0 = null, dur = 650;
      function step(t) { if (t0 === null) t0 = t; var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = pre + idn(v * e, d) + suf; if (k < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    });
  };

  // 5 Tab Navigasi Bawah (dengan tombol tengah menonjol seperti Pilahin)
  A.navFor = function (u) {
    if (u.role === 'bi') return [['beranda', 'home', 'Beranda'], ['pengawasan', 'shield', 'Pengawasan'], ['simulator', 'scale', 'Simulasi', true], ['bukti', 'chart', 'Analitik'], ['menu', 'user', 'Akun']];
    if (u.role === 'ppatk') return [['beranda', 'home', 'Beranda'], ['ltkm', 'file', 'LTKM'], ['simulator', 'scale', 'Simulasi', true], ['bukti', 'chart', 'Analitik'], ['menu', 'user', 'Akun']];
    return [['beranda', 'home', 'Beranda'], ['antrean', 'queue', 'Antrean'], ['kasus', 'scale', 'Kasus', true], ['bukti', 'chart', 'Analitik'], ['menu', 'user', 'Akun']];
  };

  A.statusBarHtml = function () {
    var now = new Date();
    var tStr = String(now.getHours()).padStart(2, '0') + '.' + String(now.getMinutes()).padStart(2, '0');
    return '<div class="phone-sbar" aria-hidden="true">' +
      '<span class="ps-time num">' + tStr + '</span>' +
      '<div class="ps-island"></div>' +
      '<div class="ps-icons">' +
        '<svg viewBox="0 0 18 12" width="15" height="10" fill="currentColor"><rect x="1" y="8" width="2.5" height="3.5" rx="0.7"/><rect x="5" y="6" width="2.5" height="5.5" rx="0.7"/><rect x="9" y="3.5" width="2.5" height="8" rx="0.7"/><rect x="13" y="1" width="2.5" height="10.5" rx="0.7"/></svg>' +
        '<svg viewBox="0 0 16 12" width="14" height="10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M1.5 4.2a10 10 0 0 1 13 0"/><path d="M4.2 7a6 6 0 0 1 7.6 0"/><circle cx="8" cy="10" r="1.2" fill="currentColor" stroke="none"/></svg>' +
        '<svg viewBox="0 0 24 12" width="20" height="10" fill="none"><rect x="1" y="1.5" width="19" height="9" rx="2.5" stroke="currentColor" stroke-width="1.4"/><rect x="3" y="3.3" width="14" height="5.4" rx="1.2" fill="currentColor"/><path d="M21.5 4.2v3.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' +
      '</div>' +
    '</div>';
  };

  A.openCapModal = function (onDone) {
    var s = A.sheet(
      '<h3>Pengaturan Kapasitas Analis</h3>' +
      '<p class="small muted">Jumlah kuota kasus baru yang dapat mulai ditinjau tiap analis per hari kerja agar pemeriksaan bukti tetap teliti.</p>' +
      S.settings.analis.map(function (a, i) {
        return '<div class="field"><label>' + esc(a.nama) + '</label><input type="number" min="0" max="20" data-i="' + i + '" value="' + a.kap + '"></div>';
      }).join('') +
      '<button type="button" class="btn block mt12" id="ks">Simpan Perubahan</button>'
    );
    s.querySelector('#ks').onclick = function () {
      s.querySelectorAll('input[data-i]').forEach(function (inp) {
        S.settings.analis[+inp.dataset.i].kap = Math.max(0, Math.min(20, Math.round(+inp.value || 0)));
      });
      A.saveSettings();
      s.remove();
      A.toast('Kapasitas diperbarui: ' + A.kapasitas() + ' kasus/hari kerja');
      if (onDone) onDone(); else A.route();
    };
  };

  function greetText() {
    var h = new Date().getHours();
    return h < 11 ? 'Selamat pagi,' : h < 15 ? 'Selamat siang,' : h < 18 ? 'Selamat sore,' : 'Selamat malam,';
  }

  A.shell = function (title, sub, body, opt) {
    opt = opt || {};
    var u = A.me(), cur = (location.hash.split('/')[1] || 'beranda'), app = A.app;
    var roleInfo = A.ROLES[u.role] || { short: 'Petugas' };
    var isHome = (cur === 'beranda' || opt.nav === 'beranda') && !opt.back;
    var activeCasesCnt = S.cases.filter(function (c) { return A.ACTIVE.indexOf(c.status) >= 0; }).length;

    var n = A.navFor(u).map(function (x) {
      var isOn = cur === x[0] || opt.nav === x[0] ||
        (x[0] === 'bukti' && (opt.nav === 'bukti-ringkas' || opt.nav === 'bukti-klaster' || cur === 'bukti')) ||
        (x[0] === 'simulator' && (opt.nav === 'sim-risiko' || opt.nav === 'sim-level' || cur === 'simulator')) ||
        (x[0] === 'menu' && (cur === 'akun' || cur === 'panduan' || cur === 'tentang' || cur === 'data'));
      if (x[3]) {
        return '<a href="#/' + x[0] + '" class="center-fab ' + (isOn ? 'active' : '') + '"><div class="fab-ring">' + icon(x[1]) + '</div><span>' + x[2] + '</span></a>';
      }
      return '<a href="#/' + x[0] + '" class="' + (isOn ? 'active' : '') + '">' + icon(x[1]) + '<span>' + x[2] + '</span></a>';
    }).join('');

    var headerLeft = '';
    if (opt.back) {
      headerLeft =
        '<button type="button" class="iconbtn" id="tb-back" aria-label="Kembali">' + icon('back') + '</button>' +
        '<div class="title"><h1>' + title + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>';
    } else if (isHome) {
      headerLeft =
        '<a class="tb-greeting" href="#/menu">' +
          '<div class="tb-av" style="background:' + (u.c || '#1D5BD8') + '">' + esc(A.initials(u.nama)) + '</div>' +
          '<div class="tb-gtxt"><small>' + greetText() + '</small><b>' + esc(u.nama.split(' ')[0]) + '</b></div>' +
        '</a>';
    } else {
      headerLeft = '<div class="title"><h1>' + title + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>';
    }

    var headerRight =
      '<a class="role-pill-top" href="#/menu" title="Ganti Peran Demo">' + esc(roleInfo.short) + '</a>' +
      '<a class="iconbtn" href="#/kasus" aria-label="Kasus & Notifikasi">' +
        icon('bell') +
        (activeCasesCnt ? '<span class="dot">' + activeCasesCnt + '</span>' : '') +
      '</a>';

    app.innerHTML =
      A.statusBarHtml() +
      '<header class="topbar"><div class="topbar-row">' + headerLeft + headerRight + '</div></header>' +
      '<main class="page' + (A.skipAnim ? '' : ' anim') + '">' + body + '</main>' +
      '<nav class="bnav" aria-label="Navigasi Utama"><div class="bnav-in">' + n + '</div></nav>';

    var backBtn = app.querySelector('#tb-back');
    if (backBtn) backBtn.onclick = function () { history.back(); };

    if (!A.skipAnim) { window.scrollTo(0, 0); A.animate(app); }
    A.skipAnim = false;
  };

  A.toast = function (msg) {
    var old = document.querySelectorAll('.toast');
    old.forEach(function (x) { x.remove(); });
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; }, 2400);
    setTimeout(function () { t.remove(); }, 2750);
  };

  A.sheet = function (html) {
    var bg = document.createElement('div');
    bg.className = 'modal-bg sheet-bg';
    bg.innerHTML = '<div class="sheet" role="dialog"><div class="grab"></div>' + html + '</div>';
    bg.addEventListener('click', function (e) { if (e.target === bg) bg.remove(); });
    document.body.appendChild(bg);
    return bg;
  };

  A.stat = function (lab, val, kind, src) {
    return '<div class="stat"><div class="lab"><span>' + lab + '</span>' + (kind ? U.badge(kind) : '') + '</div><div class="val num">' + val + '</div>' + (src ? '<div class="sub">' + src + '</div>' : '') + '</div>';
  };
  A.src = function (s) { return '<div class="src">Sumber: ' + s + '</div>'; };
  A.menuLink = function (href, ic, t, s, badgeCnt, icColor) {
    return '<a class="mg-row" href="' + href + '">' +
      '<div class="mg-ic ' + (icColor || 'ic-blue') + '">' + icon(ic) + '</div>' +
      '<div class="mg-txt"><b>' + t + '</b><span>' + s + '</span></div>' +
      (badgeCnt ? '<span class="mg-badge num">' + badgeCnt + '</span>' : '') +
      icon('chev', 'mg-chev') +
    '</a>';
  };
  A.ST_CLS = { 'Investigasi': 'investigasi', 'Menunggu klarifikasi': 'klarifikasi', 'Menunggu persetujuan': 'menunggu', 'Dibatasi': 'dibatasi', 'Keberatan': 'keberatan', 'Tidak terbukti': 'tidak', 'Diteruskan': 'diteruskan' };
  A.stPill = function (st) { return '<span class="pill st-' + (A.ST_CLS[st] || '') + '">' + st + '</span>'; };
  A.groupsBar = function (m) {
    return '<div class="gbar">' + ['J', 'P', 'K'].map(function (g) {
      var cls = m.sig[g] ? 'on' : m.sig[g] === null ? 'na' : '';
      return '<span class="sig-pill ' + cls + '" title="Pilar ' + g + ': ' + (m.sig[g] ? 'Aktif' : m.sig[g] === null ? 'Data Kurang' : 'Normal') + '">' + g + '</span>';
    }).join('') + '</div>';
  };
  A.LVCOL = { hijau: '#0D9488', kuning: '#D97706', oranye: '#EA580C', merah: '#DC2626' };
  A.itemRow = function (m, opts) {
    opts = opts || {};
    var c = A.caseOf(m.id), lv = A.effLevel(m);
    var href = opts.href || ('#/merchant/' + m.id);
    return '<a class="item" href="' + href + '">' +
      '<span class="thumb">' + U.storefront(m, 42) + '</span>' +
      '<span class="meta">' +
        '<div class="t">' + esc(m.nama) + ' <span class="mono-id">' + m.id + '</span></div>' +
        '<div class="s">' + esc(m.kategori) + ' &middot; ' + esc(m.kota) + ' (K' + m.klaster + ')' + (c ? ' &middot; <b>' + c.status + '</b>' : '') + '</div>' +
        '<div class="item-badges">' + U.level(lv) + ' <span class="typo-pill">' + esc(U.tagLabel(m.tag)) + '</span></div>' +
      '</span>' +
      '<span class="right">' + (opts.right || ('<div class="score num">' + m.score + '<small>Skor</small></div>' + A.groupsBar(m))) + '</span>' +
      icon('chev', 'chev') +
    '</a>';
  };
  A.route = function () { };
})();
