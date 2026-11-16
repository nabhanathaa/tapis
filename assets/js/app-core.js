/* TAPIS app-core: ruang nama bersama (window.A), indeks spasial 514 wilayah, manajemen sesi multi-peran, model kasus, dan kerangka enterprise. */
(function () {
  'use strict';
  var T = window.TAPIS, U = window.UI, R = window.RESMI, H = R.hasil;
  var A = window.A = { T: T, U: U, R: R, H: H, app: document.getElementById('app') };
  var icon = U.icon, idn = U.idn, esc = U.esc;

  // ---------- penyimpanan lokal ----------
  var MEM = {};
  A.load = function (k, d) { try { var v = localStorage.getItem('tapis3.' + k); return v ? JSON.parse(v) : d; } catch (e) { return MEM[k] !== undefined ? MEM[k] : d; } };
  A.save = function (k, v) { MEM[k] = v; try { localStorage.setItem('tapis3.' + k, JSON.stringify(v)); } catch (e) { } };
  A.resetAll = function () { try { Object.keys(localStorage).filter(function (k) { return k.indexOf('tapis3.') === 0; }).forEach(function (k) { localStorage.removeItem(k); }); } catch (e) { } MEM = {}; };
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
      // Tentukan klaster dominan provinsi (jika seri, utamakan K4 > K3 > K2 > K1 untuk keterbacaan struktur ekonomi)
      var dom = 1, maxC = -1;
      [1, 3, 4, 2].forEach(function (cid) {
        if (cCounts[cid] > maxC) { maxC = cCounts[cid]; dom = cid; }
      });
      var mInProv = T.merchants.filter(function (m) {
        return pKabs.some(function (kb) {
          return kb.nama === m.kota || kb.nama === 'Kota ' + m.kota || kb.nama === 'Kabupaten ' + m.kota || (m.kota.indexOf('Jakarta') >= 0 && pv.n === 'DKI Jakarta');
        });
      });
      provMeta.push({
        idx: pi,
        nama: pv.n,
        pulau: pulauOf(pi),
        pdrbKapita: pv.v, // ribu Rp
        pertumbuhan: pv.g, // %
        d: pv.d,
        nKab: cnt,
        kCounts: cCounts,
        domKlaster: dom,
        domProfil: profById[dom] || null,
        kabs: pKabs,
        merchants: mInProv
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
    pjp_analis: { nama: 'Analis Pemantauan Merchant', inst: 'PJP Pengakuisisi', kode: 'P1', short: 'Analis PJP' },
    pjp_pejabat: { nama: 'Pejabat Kepatuhan APU-PPT', inst: 'PJP Pengakuisisi', kode: 'P2', short: 'Pejabat PJP' },
    bi: { nama: 'Pengawas Sistem Pembayaran', inst: 'Bank Indonesia', kode: 'BI', short: 'Pengawas BI' },
    ppatk: { nama: 'Analis Transaksi Keuangan', inst: 'PPATK', kode: 'PPATK', short: 'Analis PPATK' }
  };
  A.DEMO_USERS = [
    { email: 'rani@arunika.demo', nama: 'Rani Kusumawardani', role: 'pjp_analis', unit: 'PJP Arunika — Unit Surveilans & Pemantauan Transaksi', nip: 'ARK-04417', pass: A.hash('demo1234'), c: '#1D5BD8', badge: 'P1 · Analis' },
    { email: 'dimas@arunika.demo', nama: 'Dimas Prakoso', role: 'pjp_pejabat', unit: 'PJP Arunika — Divisi Kepatuhan APU-PPT (Pejabat 1)', nip: 'ARK-01102', pass: A.hash('demo1234'), c: '#091E42', badge: 'P2 · Pejabat 1' },
    { email: 'hana@arunika.demo', nama: 'Hana Lestari', role: 'pjp_pejabat', unit: 'PJP Arunika — Divisi Kepatuhan APU-PPT (Pejabat 2)', nip: 'ARK-01108', pass: A.hash('demo1234'), c: '#0F766E', badge: 'P3 · Pejabat 2' },
    { email: 'laras@bi.demo', nama: 'Laras Ayuningtyas', role: 'bi', unit: 'Bank Indonesia — Departemen Pengawasan Sistem Pembayaran', nip: 'BI-DPSP-2291', pass: A.hash('demo1234'), c: '#B4690E', badge: 'BI · Pengawas' },
    { email: 'yoga@ppatk.demo', nama: 'Yoga Pratama', role: 'ppatk', unit: 'PPATK — Direktorat Analisis & Pemeriksaan Transaksi', nip: 'PPATK-0815', pass: A.hash('demo1234'), c: '#B91C1C', badge: 'PPATK · Analis' }
  ];

  var S = A.S = {};
  S.users = A.load('users', null);
  if (!S.users || S.users.length < A.DEMO_USERS.length) {
    S.users = A.DEMO_USERS.slice();
    A.save('users', S.users);
  } else {
    // Sinkronisasi metadata label terbaru
    A.DEMO_USERS.forEach(function (du) {
      var ex = S.users.find(function (u) { return u.email === du.email; });
      if (ex) { ex.unit = du.unit; ex.badge = du.badge; ex.c = du.c; }
    });
  }
  S.session = A.load('session', undefined);
  if (S.session === undefined && location.hash !== '#/masuk' && location.hash !== '#/daftar') {
    S.session = 'rani@arunika.demo';
    A.save('session', S.session);
  }
  S.settings = A.load('settings', { analis: [{ nama: 'Rani Kusumawardani', kap: 2 }, { nama: 'Sinta Maharani', kap: 1 }] });

  A.me = function () { return S.session && S.users.filter(function (u) { return u.email === S.session; })[0]; };
  A.isPJP = function () { var u = A.me(); return !!u && (u.role === 'pjp_analis' || u.role === 'pjp_pejabat'); };
  A.isPejabat = function () { var u = A.me(); return !!u && u.role === 'pjp_pejabat'; };
  A.pejabat = function () { return S.users.filter(function (u) { return u.role === 'pjp_pejabat'; }); };

  A.switchUser = function (email, targetHash) {
    var u = S.users.find(function (x) { return x.email === email; });
    if (!u) return;
    S.session = u.email;
    A.save('session', u.email);
    var curHash = location.hash || '#/beranda';
    if (targetHash) {
      if (location.hash === targetHash) A.route();
      else location.hash = targetHash;
    } else {
      // Sesuaikan rute bila peran berganti pada halaman khusus peran
      var v = curHash.slice(2).split('/')[0] || 'beranda';
      if (u.role === 'bi' && v === 'antrean') location.hash = '#/pengawasan';
      else if (u.role === 'ppatk' && v === 'antrean') location.hash = '#/ltkm';
      else if (A.isPJP() && (v === 'pengawasan' || v === 'ltkm')) location.hash = '#/antrean';
      else A.route();
    }
    A.toast('Peran aktif: ' + u.nama + ' (' + (A.ROLES[u.role] ? A.ROLES[u.role].short : u.role) + ')');
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
  A.avatar = function (u) { return '<span class="av" style="background:' + (u.c || '#15459B') + '">' + esc(A.initials(u.nama)) + '</span>'; };
  A.cu = function (v, d, pre, suf) { pre = pre || ''; suf = suf || ''; d = d || 0; return '<span class="num cu" data-cu="' + v + '" data-d="' + d + '" data-pre="' + pre + '" data-suf="' + suf + '">' + pre + idn(v, d) + suf + '</span>'; };
  A.skipAnim = false;
  var RED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  A.animate = function (root) {
    if (!RED) root.querySelectorAll('[data-cu]').forEach(function (el) {
      var v = +el.dataset.cu, d = +el.dataset.d, pre = el.dataset.pre, suf = el.dataset.suf, t0 = null, dur = 650;
      function step(t) { if (t0 === null) t0 = t; var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = pre + idn(v * e, d) + suf; if (k < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    });
    var m = root.querySelector('main.enter'); if (m) setTimeout(function () { m.classList.remove('enter'); }, 900);
  };

  A.navFor = function (u) {
    if (u.role === 'bi') return [['beranda', 'home', 'Beranda'], ['pengawasan', 'shield', 'Pengawasan'], ['bukti', 'chart', 'Pusat Bukti'], ['simulator', 'sliders', 'Simulasi'], ['menu', 'menu', 'Menu']];
    if (u.role === 'ppatk') return [['beranda', 'home', 'Beranda'], ['ltkm', 'file', 'LTKM'], ['bukti', 'chart', 'Pusat Bukti'], ['simulator', 'sliders', 'Simulasi'], ['menu', 'menu', 'Menu']];
    return [['beranda', 'home', 'Beranda'], ['antrean', 'queue', 'Antrean'], ['kasus', 'folder', 'Kasus'], ['bukti', 'chart', 'Pusat Bukti'], ['menu', 'menu', 'Menu']];
  };

  function sidebarSections(u) {
    var qCnt = A.unhandled().length;
    var activeCases = S.cases.filter(function (c) { return A.ACTIVE.indexOf(c.status) >= 0; }).length;
    var ltkmCnt = S.cases.filter(function (c) { return c.status === 'Diteruskan'; }).length;

    var sec1 = [
      { id: 'beranda', href: '#/beranda', ic: 'home', label: 'Beranda Eksekutif' }
    ];
    if (u.role === 'bi') {
      sec1.push({ id: 'pengawasan', href: '#/pengawasan', ic: 'shield', label: 'Pengawasan Sistem Pembayaran' });
      sec1.push({ id: 'kasus', href: '#/kasus', ic: 'folder', label: 'Audit Kasus PJP', badge: activeCases });
    } else if (u.role === 'ppatk') {
      sec1.push({ id: 'ltkm', href: '#/ltkm', ic: 'file', label: 'Laporan LTKM Masuk', badge: ltkmCnt });
      sec1.push({ id: 'jejaring', href: '#/jejaring/M081', ic: 'net', label: 'Graf Jejaring Pembayar' });
    } else {
      sec1.push({ id: 'antrean', href: '#/antrean', ic: 'queue', label: 'Antrean Verifikasi', badge: qCnt, badgeTone: 'amber' });
      sec1.push({ id: 'kasus', href: '#/kasus', ic: 'folder', label: 'Manajemen Kasus & Audit', badge: activeCases });
      sec1.push({ id: 'jejaring', href: '#/jejaring/M081', ic: 'net', label: 'Graf Jejaring Pembayar' });
    }

    var sec2 = [
      { id: 'bukti-ringkas', href: '#/bukti/ringkas', ic: 'chart', label: 'Pusat Bukti Nasional', match: function (h) { return h.indexOf('#/bukti') === 0 && h.indexOf('#/bukti/klaster') !== 0 && h.indexOf('#/bukti/peta') !== 0; } },
      { id: 'bukti-klaster', href: '#/bukti/klaster', ic: 'map', label: 'Peta & Klaster 514 Wilayah', badge: '514', badgeTone: 'blue', match: function (h) { return h.indexOf('#/bukti/klaster') === 0 || h.indexOf('#/bukti/peta') === 0; } },
      { id: 'sim-risiko', href: '#/simulator/risiko', ic: 'sliders', label: 'Simulasi Risiko (Bayes)', match: function (h) { return h.indexOf('#/simulator/risiko') === 0 || h.indexOf('#/simulator/ambang') === 0; } },
      { id: 'sim-level', href: '#/simulator/level', ic: 'scale', label: 'Simulator Aturan Level', match: function (h) { return h === '#/simulator' || h.indexOf('#/simulator/level') === 0; } }
    ];

    var sec3 = [
      { id: 'data', href: '#/data', ic: 'download', label: 'Basis Data & Ekspor CSV' },
      { id: 'panduan', href: '#/panduan', ic: 'book', label: 'Metodologi & Regulasi' },
      { id: 'tentang', href: '#/tentang', ic: 'info', label: 'Arsitektur & Sumber Data' },
      { id: 'akun', href: '#/akun', ic: 'id', label: 'Profil & Pengaturan Sesi' }
    ];

    return [
      { title: 'OPERASIONAL & PENGAWASAN', items: sec1 },
      { title: 'INTELIJEN DATA & SPASIAL', items: sec2 },
      { title: 'TATA KELOLA & REGULASI', items: sec3 }
    ];
  }

  A.openCapModal = function (onDone) {
    var s = A.sheet(
      '<div class="modal-head"><span class="card-tag">PARAMETER OPERASIONAL INTERNAL</span><h3>Pengaturan Kapasitas Harian Tim Analis</h3></div>' +
      '<p class="small muted">Tentukan kuota maksimum kasus baru yang dapat mulai ditinjau oleh masing-masing analis per hari kerja agar pemeriksaan bukti lapangan dan dokumen tetap objektif serta tidak terburu-buru.</p>' +
      '<div class="mt12">' +
      S.settings.analis.map(function (a, i) {
        return '<div class="field"><label>' + esc(a.nama) + ' (Kasus Baru / Hari Kerja)</label><input type="number" min="0" max="20" data-i="' + i + '" value="' + a.kap + '"></div>';
      }).join('') +
      '</div>' +
      '<div class="btnrow mt12"><button class="btn sec" id="cap-cancel">Batal</button><button class="btn" id="cap-save">Simpan Kapasitas</button></div>'
    );
    s.querySelector('#cap-cancel').onclick = function () { s.remove(); };
    s.querySelector('#cap-save').onclick = function () {
      s.querySelectorAll('input[data-i]').forEach(function (inp) {
        S.settings.analis[+inp.dataset.i].kap = Math.max(0, Math.min(20, Math.round(+inp.value || 0)));
      });
      A.saveSettings();
      s.remove();
      A.toast('Kapasitas tim diperbarui menjadi ' + A.kapasitas() + ' kasus/hari kerja');
      if (onDone) onDone(); else A.route();
    };
  };

  A.shell = function (title, sub, body, opt) {
    opt = opt || {};
    var u = A.me(), curHash = location.hash || '#/beranda', cur = curHash.split('/')[1] || 'beranda', app = A.app;
    var roleInfo = A.ROLES[u.role] || { nama: 'Petugas', inst: 'Instansi', short: 'Petugas' };

    // Bottom navigation (Mobile)
    var bnavHtml = A.navFor(u).map(function (x) {
      var cnt = x[0] === 'antrean' ? A.unhandled().length : 0;
      var dot = cnt ? '<span class="dot">' + cnt + '</span>' : '';
      var isOn = cur === x[0] || opt.nav === x[0];
      return '<a href="#/' + x[0] + '" class="' + (isOn ? 'on' : '') + '">' + icon(x[1]) + '<span>' + x[2] + '</span>' + dot + '</a>';
    }).join('');

    // Sidebar navigation (Desktop)
    var sectionsHtml = sidebarSections(u).map(function (sec) {
      var links = sec.items.map(function (it) {
        var isOn = it.match ? it.match(curHash) : (cur === it.id || opt.nav === it.id);
        var bHtml = it.badge ? '<span class="snav-badge ' + (it.badgeTone || '') + '">' + it.badge + '</span>' : '';
        return '<a href="' + it.href + '" class="snav-link ' + (isOn ? 'on' : '') + '">' + icon(it.ic) + '<span class="snav-text">' + it.label + '</span>' + bHtml + '</a>';
      }).join('');
      return '<div class="snav-group"><div class="snav-title">' + sec.title + '</div>' + links + '</div>';
    }).join('');

    // Role switcher dock (PRISMA / SIRAM style)
    var roleBtns = A.DEMO_USERS.map(function (du) {
      var active = du.email === u.email;
      var shortCode = du.email === 'rani@arunika.demo' ? 'P1 Analis' :
        du.email === 'dimas@arunika.demo' ? 'P2 Pejabat 1' :
        du.email === 'hana@arunika.demo' ? 'P3 Pejabat 2' :
        du.email === 'laras@bi.demo' ? 'BI Pengawas' : 'PPATK';
      return '<button type="button" class="role-sw-btn ' + (active ? 'on' : '') + '" data-sw-user="' + du.email + '" title="' + esc(du.nama + ' — ' + du.unit) + '">' + shortCode + '</button>';
    }).join('');

    var lead = opt.back ?
      '<button class="iconbtn" onclick="history.back()" aria-label="Kembali">' + icon('back') + '</button>' :
      '<a class="logo-mob" href="#/beranda" aria-label="Beranda"><img src="assets/img/logo.png" alt="TAPIS"></a>';

    app.innerHTML =
      '<div class="app-shell">' +
        '<aside class="sidebar" aria-label="Navigasi Utama">' +
          '<a class="brand-box" href="#/beranda">' +
            '<div class="brand-logo"><img src="assets/img/logo.png" alt="Logo TAPIS"></div>' +
            '<div class="brand-meta">' +
              '<div class="brand-name">TAPIS <span class="brand-ver">v2.6</span></div>' +
              '<div class="brand-sub">Surveilans &amp; Penapisan QRIS</div>' +
            '</div>' +
          '</a>' +
          '<div class="snav-scroll">' + sectionsHtml + '</div>' +
          '<div class="sidebar-foot">' +
            '<div class="role-switcher-box">' +
              '<div class="rs-label"><span>Peran Aktif (Klik untuk ganti)</span><span class="rs-inst">' + esc(roleInfo.inst) + '</span></div>' +
              '<div class="rs-grid">' + roleBtns + '</div>' +
            '</div>' +
            '<div class="user-dock">' +
              '<a href="#/akun" class="user-dock-main">' +
                A.avatar(u) +
                '<div class="ud-meta">' +
                  '<b>' + esc(u.nama) + '</b>' +
                  '<span>' + esc(roleInfo.nama) + ' &middot; ' + esc(u.nip) + '</span>' +
                '</div>' +
              '</a>' +
              '<button type="button" class="ud-logout" id="sb-logout" title="Keluar / Layar Masuk" aria-label="Keluar">' + icon('logout') + '</button>' +
            '</div>' +
          '</div>' +
        '</aside>' +
        '<div class="workspace">' +
          '<header class="topbar">' +
            '<div class="topbar-left">' +
              lead +
              '<div class="ttl">' +
                '<div class="breadcrumb"><span>TAPIS</span><span class="sep">/</span><span>' + esc(roleInfo.inst) + '</span></div>' +
                '<h1>' + title + '</h1>' +
                (sub ? '<div class="sub">' + sub + '</div>' : '') +
              '</div>' +
            '</div>' +
            '<div class="topbar-right">' +
              '<div class="global-search" id="g-search-wrap">' +
                icon('search') +
                '<input type="search" id="g-search" placeholder="Cari merchant, NMID, kota, atau ID kasus..." autocomplete="off">' +
                '<div class="g-search-pop" id="g-search-pop" hidden></div>' +
              '</div>' +
              '<div class="sys-pill" title="Mesin Surveilans Multi-Layer J-P-K Aktif"><span class="live-dot"></span><span>Surveilans Aktif</span></div>' +
              (opt.right || '') +
              '<a class="top-user-pill" href="#/akun" title="Profil &amp; Pengaturan">' +
                A.avatar(u) +
                '<div class="tup-meta"><b>' + esc(u.nama.split(' ')[0]) + '</b><span>' + esc(roleInfo.short) + '</span></div>' +
              '</a>' +
            '</div>' +
          '</header>' +
          '<main class="page' + (A.skipAnim ? '' : ' enter') + '">' + body + '</main>' +
          '<footer class="app-footer">' +
            '<div class="footer-inner">' +
              '<div class="footer-left">' +
                '<b>TAPIS — Sistem Penapisan Risiko &amp; Prioritisasi Merchant QRIS</b>' +
                '<span>Arsitektur Kepatuhan Berjenjang: UU No. 8 Tahun 2010 (Pasal 25, 26, 67) &middot; PBI No. 10 Tahun 2024 &middot; PADG No. 15 Tahun 2025</span>' +
              '</div>' +
              '<div class="footer-right">' +
                '<a href="#/bukti/ringkas">Pusat Bukti</a>' +
                '<a href="#/bukti/klaster">Peta 514 Wilayah</a>' +
                '<a href="#/simulator/risiko">Simulasi Bayes</a>' +
                '<a href="#/panduan">Metodologi</a>' +
                '<a href="#/data">Ekspor CSV</a>' +
              '</div>' +
            '</div>' +
          '</footer>' +
        '</div>' +
        '<nav class="bnav" aria-label="Navigasi Bawah"><div class="bnav-in">' + bnavHtml + '</div></nav>' +
      '</div>';

    if (!A.skipAnim) { window.scrollTo(0, 0); A.animate(app); }
    A.skipAnim = false;

    var tb = app.querySelector('.topbar');
    window.onscroll = function () { if (tb) tb.classList.toggle('scrolled', window.scrollY > 4); };
    if (tb) tb.classList.toggle('scrolled', window.scrollY > 4);

    // Bind role switcher
    app.querySelectorAll('[data-sw-user]').forEach(function (btn) {
      btn.onclick = function () { A.switchUser(btn.dataset.swUser); };
    });

    // Bind logout
    var outBtn = app.querySelector('#sb-logout');
    if (outBtn) outBtn.onclick = function () { S.session = null; A.save('session', null); location.hash = '#/masuk'; };

    // Bind global search
    var gs = app.querySelector('#g-search'), gpop = app.querySelector('#g-search-pop');
    if (gs && gpop) {
      gs.oninput = function () {
        var q = gs.value.trim().toLowerCase();
        if (!q) { gpop.hidden = true; gpop.innerHTML = ''; return; }
        var mHits = T.merchants.filter(function (m) {
          return (m.nama + ' ' + m.id + ' ' + m.nmid + ' ' + m.kota + ' ' + m.kategori).toLowerCase().indexOf(q) >= 0;
        }).slice(0, 6);
        var cHits = S.cases.filter(function (c) {
          var m = T.byId(c.mid);
          return (c.id + ' ' + c.status + ' ' + (m ? m.nama : '')).toLowerCase().indexOf(q) >= 0;
        }).slice(0, 3);
        if (!mHits.length && !cHits.length) {
          gpop.innerHTML = '<div class="gs-empty">Tidak ditemukan merchant atau kasus untuk "' + esc(gs.value) + '"</div>';
          gpop.hidden = false;
          return;
        }
        var html = '';
        if (mHits.length) {
          html += '<div class="gs-sec">Merchant QRIS</div>' + mHits.map(function (m) {
            return '<a class="gs-item" href="#/merchant/' + m.id + '">' +
              '<div class="gs-main"><b>' + esc(m.nama) + '</b><span>' + m.id + ' &middot; ' + esc(m.kategori) + ' &middot; ' + esc(m.kota) + '</span></div>' +
              '<div class="gs-right">' + U.level(A.effLevel(m)) + '<span class="gs-score num">' + m.score + '</span></div>' +
            '</a>';
          }).join('');
        }
        if (cHits.length) {
          html += '<div class="gs-sec">Berkas Kasus Pemeriksaan</div>' + cHits.map(function (c) {
            var m = T.byId(c.mid);
            return '<a class="gs-item" href="#/kasus/' + c.id + '">' +
              '<div class="gs-main"><b>' + c.id + ' — ' + esc(m ? m.nama : c.mid) + '</b><span>Pemeriksa: ' + esc(c.petugas) + '</span></div>' +
              '<div class="gs-right">' + A.stPill(c.status) + '</div>' +
            '</a>';
          }).join('');
        }
        gpop.innerHTML = html;
        gpop.hidden = false;
      };
      document.addEventListener('click', function (ev) {
        if (!app.querySelector('#g-search-wrap') || !app.querySelector('#g-search-wrap').contains(ev.target)) {
          gpop.hidden = true;
        }
      }, { once: false });
    }
  };

  A.toast = function (msg) {
    var old = document.querySelectorAll('.toast');
    old.forEach(function (x) { x.remove(); });
    var t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = '<i>' + icon('check') + '</i><span></span>';
    t.querySelector('span').textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; }, 2600);
    setTimeout(function () { t.remove(); }, 2950);
  };

  A.sheet = function (html) {
    var bg = document.createElement('div');
    bg.className = 'sheet-bg';
    bg.innerHTML = '<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>' + html + '</div>';
    bg.addEventListener('click', function (e) { if (e.target === bg) bg.remove(); });
    document.body.appendChild(bg);
    return bg;
  };

  A.stat = function (lab, val, kind, src) {
    return '<div class="stat">' +
      '<div class="stat-top"><div class="lab">' + lab + '</div>' + (kind ? U.badge(kind) : '') + '</div>' +
      '<div class="val num">' + val + '</div>' +
      (src ? '<div class="src">' + src + '</div>' : '') +
    '</div>';
  };
  A.src = function (s) { return '<div class="srcline">Sumber &amp; Metodologi: ' + s + '</div>'; };
  A.menuLink = function (href, ic, t, s) { return '<a href="' + href + '"><span class="mi">' + icon(ic) + '</span><span><b>' + t + '</b><span>' + s + '</span></span>' + icon('chev', 'chev') + '</a>'; };
  A.ST_CLS = { 'Investigasi': 'investigasi', 'Menunggu klarifikasi': 'klarifikasi', 'Menunggu persetujuan': 'menunggu', 'Dibatasi': 'dibatasi', 'Keberatan': 'keberatan', 'Tidak terbukti': 'tidak', 'Diteruskan': 'diteruskan' };
  A.stPill = function (st) { return '<span class="pill st-' + (A.ST_CLS[st] || '') + '">' + st + '</span>'; };
  A.groupsBar = function (m) {
    return '<div class="groups">' + ['J', 'P', 'K'].map(function (g) {
      var cls = m.sig[g] ? 'on' : m.sig[g] === null ? 'na' : '';
      return '<span class="' + cls + '" title="Sinyal ' + g + ': ' + (m.sig[g] ? 'Terindikasi Aktif' : m.sig[g] === null ? 'Data Tidak Memadai' : 'Normal / Wajar') + '">' + g + '</span>';
    }).join('') + '</div>';
  };
  A.LVCOL = { hijau: '#0F9D6E', kuning: '#D9820B', oranye: '#E05D10', merah: '#D92D20' };
  A.itemRow = function (m, extra) {
    var c = A.caseOf(m.id), lv = A.effLevel(m);
    return '<a class="item" href="#/merchant/' + m.id + '">' +
      '<span class="thumb">' + U.storefront(m, 44) + '</span>' +
      '<span class="meta">' +
        '<div class="t">' + esc(m.nama) + ' <span class="mono-id">' + m.id + '</span></div>' +
        '<div class="s">' + esc(m.kategori) + ' &middot; ' + esc(m.kota) + ' (Klaster ' + m.klaster + ')' + (c ? ' &middot; <b>Kasus: ' + c.status + '</b>' : '') + '</div>' +
        '<div class="item-badges">' + U.level(lv) + (lv !== m.level ? ' <span class="small muted">Penapisan awal: ' + U.LV[m.level] + '</span>' : '') + ' <span class="typo-pill">' + esc(U.tagLabel(m.tag)) + '</span>' + (extra || '') + '</div>' +
      '</span>' +
      '<span class="right"><div class="score num">' + m.score + '<small>Skor Prioritas</small></div>' + A.groupsBar(m) + '</span>' +
      icon('chev', 'chev') +
    '</a>';
  };
  A.route = function () { };
})();
