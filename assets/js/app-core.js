/* TAPIS app-core: ruang nama bersama (window.A): penyimpanan demo, akun demo, tanggal, model kasus, antrean, kerangka halaman.
   Penyimpanan localStorage dan peran akun hanya untuk demonstrasi di peramban; BUKAN keamanan produksi. */
(function () {
  'use strict';
  var T = window.TAPIS, U = window.UI, R = window.RESMI, H = R.hasil;
  var A = window.A = { T: T, U: U, R: R, H: H, app: document.getElementById('app') };
  var icon = U.icon, idn = U.idn, esc = U.esc;

  // ---------- penyimpanan demo ----------
  var MEM = {};
  A.load = function (k, d) { try { var v = localStorage.getItem('tapis3.' + k); return v ? JSON.parse(v) : d; } catch (e) { return MEM[k] !== undefined ? MEM[k] : d; } };
  A.save = function (k, v) { MEM[k] = v; try { localStorage.setItem('tapis3.' + k, JSON.stringify(v)); } catch (e) { } };
  A.resetAll = function () { try { Object.keys(localStorage).filter(function (k) { return k.indexOf('tapis3.') === 0; }).forEach(function (k) { localStorage.removeItem(k); }); } catch (e) { } MEM = {}; };
  A.hash = function (s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); };

  A.ROLES = {
    pjp_analis: { nama: 'Analis Pemantauan Merchant', inst: 'PJP pengakuisisi' },
    pjp_pejabat: { nama: 'Pejabat Kepatuhan APU-PPT', inst: 'PJP pengakuisisi' },
    bi: { nama: 'Pengawas Sistem Pembayaran (simulasi)', inst: 'Bank Indonesia' },
    ppatk: { nama: 'Analis Transaksi Keuangan (simulasi)', inst: 'PPATK' }
  };
  A.DEMO_USERS = [
    { email: 'rani@arunika.demo', nama: 'Rani Kusumawardani', role: 'pjp_analis', unit: 'PJP Arunika - Unit Pemantauan Transaksi', nip: 'ARK-04417', pass: A.hash('demo1234'), c: '#1E5BD8' },
    { email: 'dimas@arunika.demo', nama: 'Dimas Prakoso', role: 'pjp_pejabat', unit: 'PJP Arunika - Kepatuhan APU-PPT', nip: 'ARK-01102', pass: A.hash('demo1234'), c: '#0B2A5B' },
    { email: 'hana@arunika.demo', nama: 'Hana Lestari', role: 'pjp_pejabat', unit: 'PJP Arunika - Kepatuhan APU-PPT', nip: 'ARK-01108', pass: A.hash('demo1234'), c: '#2F7D8B' },
    { email: 'laras@bi.demo', nama: 'Laras Ayuningtyas', role: 'bi', unit: 'Departemen Pengawasan Sistem Pembayaran', nip: 'BI-DEMO-2291', pass: A.hash('demo1234'), c: '#F5A524' },
    { email: 'yoga@ppatk.demo', nama: 'Yoga Pratama', role: 'ppatk', unit: 'Direktorat Analisis Transaksi', nip: 'PPATK-DEMO-0815', pass: A.hash('demo1234'), c: '#E0413A' }
  ];
  var S = A.S = {};
  S.users = A.load('users', null);
  if (!S.users || S.users.length < A.DEMO_USERS.length) { S.users = A.DEMO_USERS.slice(); A.save('users', S.users); }
  S.session = A.load('session', null);
  S.settings = A.load('settings', { analis: [{ nama: 'Rani Kusumawardani', kap: 2 }, { nama: 'Sinta Maharani', kap: 1 }] });
  A.me = function () { return S.session && S.users.filter(function (u) { return u.email === S.session; })[0]; };
  A.isPJP = function () { var u = A.me(); return !!u && (u.role === 'pjp_analis' || u.role === 'pjp_pejabat'); };
  A.isPejabat = function () { var u = A.me(); return !!u && u.role === 'pjp_pejabat'; };
  A.pejabat = function () { return S.users.filter(function (u) { return u.role === 'pjp_pejabat'; }); };

  // ---------- tanggal dan hari kerja ----------
  A.BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  A.HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  A.today = function () { var d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  A.fmtD = function (d) { d = new Date(d); return d.getDate() + ' ' + A.BULAN[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear(); };
  A.fmtDT = function (d) { d = new Date(d); return A.fmtD(d) + ', ' + String(d.getHours()).padStart(2, '0') + '.' + String(d.getMinutes()).padStart(2, '0'); };
  A.addWorkdays = function (d, n) { d = new Date(d); var k = 0; while (k < n) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) k++; } return d; };
  A.subWorkdays = function (d, n) { d = new Date(d); var k = 0; while (k < n) { d.setDate(d.getDate() - 1); if (d.getDay() !== 0 && d.getDay() !== 6) k++; } return d; };
  A.workdaysBetween = function (a, b) { a = new Date(a); b = new Date(b); a.setHours(0, 0, 0, 0); b.setHours(0, 0, 0, 0); var n = 0, s = a < b ? 1 : -1; while (a.getTime() !== b.getTime()) { a.setDate(a.getDate() + s); if (a.getDay() !== 0 && a.getDay() !== 6) n += s; } return n; };
  A.bln = function (s) { var p = s.split('-'); return A.BULAN[+p[1] - 1] + ' ' + p[0]; };

  // ---------- model kasus (data SIMULASI) ----------
  // status: Investigasi | Menunggu klarifikasi | Menunggu persetujuan | Dibatasi | Keberatan | Tidak terbukti | Diteruskan
  // Merah/Dibatasi TIDAK pernah otomatis: wajib bukti memadai + persetujuan dua pejabat berbeda.
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
  A.caseOf = function (mid) { var l = S.cases.filter(function (c) { return c.mid === mid; }); return l.length ? l[0] : null; };   // kasus terbaru (urutan unshift)
  A.activeCase = function (mid) { return S.cases.filter(function (c) { return c.mid === mid && A.ACTIVE.indexOf(c.status) >= 0; })[0] || null; };
  // Level efektif: Merah hanya dari kasus Dibatasi/Keberatan; kasus "Tidak terbukti" mengoreksi status menjadi Hijau.
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

  // ---------- komponen tampilan bersama ----------
  A.initials = function (n) { return String(n || '?').split(' ').filter(Boolean).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase(); };
  A.avatar = function (u) { return '<span class="av" style="background:' + (u.c || '#33507F') + '">' + esc(A.initials(u.nama)) + '</span>'; };
  A.cu = function (v, d, pre, suf) { pre = pre || ''; suf = suf || ''; d = d || 0; return '<span class="num cu" data-cu="' + v + '" data-d="' + d + '" data-pre="' + pre + '" data-suf="' + suf + '">' + pre + idn(v, d) + suf + '</span>'; };
  A.skipAnim = false;
  var RED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  A.animate = function (root) {
    if (!RED) root.querySelectorAll('[data-cu]').forEach(function (el) {
      var v = +el.dataset.cu, d = +el.dataset.d, pre = el.dataset.pre, suf = el.dataset.suf, t0 = null, dur = 900;
      function step(t) { if (t0 === null) t0 = t; var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = pre + idn(v * e, d) + suf; if (k < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    });
    var m = root.querySelector('main.enter'); if (m) setTimeout(function () { m.classList.remove('enter'); }, 1700);
  };
  A.navFor = function (u) {
    if (u.role === 'bi') return [['beranda', 'home', 'Beranda'], ['pengawasan', 'shield', 'Pengawasan'], ['bukti', 'chart', 'Bukti'], ['simulator', 'sliders', 'Simulator'], ['menu', 'menu', 'Menu']];
    if (u.role === 'ppatk') return [['beranda', 'home', 'Beranda'], ['ltkm', 'file', 'LTKM'], ['bukti', 'chart', 'Bukti'], ['simulator', 'sliders', 'Simulator'], ['menu', 'menu', 'Menu']];
    return [['beranda', 'home', 'Beranda'], ['antrean', 'queue', 'Antrean'], ['kasus', 'folder', 'Kasus'], ['bukti', 'chart', 'Bukti'], ['menu', 'menu', 'Menu']];
  };
  A.shell = function (title, sub, body, opt) {
    opt = opt || {}; var u = A.me(), cur = location.hash.split('/')[1] || 'beranda', app = A.app;
    var n = A.navFor(u).map(function (x) {
      var cnt = x[0] === 'antrean' ? A.unhandled().length : 0, dot = cnt ? '<span class="dot">' + cnt + '</span>' : '';
      return '<a href="#/' + x[0] + '" class="' + (cur === x[0] || opt.nav === x[0] ? 'on' : '') + '">' + icon(x[1]) + x[2] + dot + '</a>';
    }).join('');
    var lead = opt.back ? '<button class="iconbtn" onclick="history.back()" aria-label="Kembali">' + icon('back') + '</button>' : '<a class="logo" href="#/beranda" aria-label="Beranda"><img src="assets/img/logo.png" alt=""></a>';
    var trail = (opt.right || '') + (opt.back ? '' : '<a class="avbtn" href="#/akun" aria-label="Akun">' + A.avatar(u) + '</a>');
    app.innerHTML = '<header class="topbar">' + lead + '<div class="ttl"><h1>' + title + '</h1>' + (sub ? '<div class="sub">' + sub + '</div>' : '') + '</div>' + trail + '</header>' +
      '<main class="page' + (A.skipAnim ? '' : ' enter') + '">' + body + '</main><nav class="bnav"><div class="bnav-in">' + n + '</div></nav>';
    if (!A.skipAnim) { window.scrollTo(0, 0); A.animate(app); }
    A.skipAnim = false;
    var tb = app.querySelector('.topbar'); window.onscroll = function () { tb.classList.toggle('scrolled', window.scrollY > 4); }; tb.classList.toggle('scrolled', window.scrollY > 4);
  };
  A.toast = function (msg) { var t = document.createElement('div'); t.className = 'toast'; t.innerHTML = '<i>' + icon('check') + '</i><span></span>'; t.querySelector('span').textContent = msg; document.body.appendChild(t); setTimeout(function () { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; }, 2400); setTimeout(function () { t.remove(); }, 2750); };
  A.sheet = function (html) {
    var bg = document.createElement('div'); bg.className = 'sheet-bg'; bg.innerHTML = '<div class="sheet" role="dialog"><div class="grab"></div>' + html + '</div>';
    bg.addEventListener('click', function (e) { if (e.target === bg) bg.remove(); }); document.body.appendChild(bg); return bg;
  };
  A.stat = function (lab, val, kind, src) { return '<div class="stat"><div class="lab">' + lab + '</div><div class="val num">' + val + '</div>' + (src ? '<div class="src">' + U.badge(kind) + ' ' + src + '</div>' : '') + '</div>'; };
  A.src = function (s) { return '<div class="srcline">Sumber: ' + s + '</div>'; };
  A.menuLink = function (href, ic, t, s) { return '<a href="' + href + '"><span class="mi">' + icon(ic) + '</span><span><b>' + t + '</b><span>' + s + '</span></span>' + icon('chev', 'chev') + '</a>'; };
  A.ST_CLS = { 'Investigasi': 'investigasi', 'Menunggu klarifikasi': 'klarifikasi', 'Menunggu persetujuan': 'menunggu', 'Dibatasi': 'dibatasi', 'Keberatan': 'keberatan', 'Tidak terbukti': 'tidak', 'Diteruskan': 'diteruskan' };
  A.stPill = function (st) { return '<span class="pill st-' + (A.ST_CLS[st] || '') + '">' + st + '</span>'; };
  A.groupsBar = function (m) { return '<div class="groups">' + ['J', 'P', 'K'].map(function (g) { return '<span class="' + (m.sig[g] ? 'on' : m.sig[g] === null ? 'na' : '') + '"></span>'; }).join('') + '</div>'; };
  A.LVCOL = { hijau: '#17A673', kuning: '#E0A100', oranye: '#F07A1A', merah: '#E0413A' };
  A.itemRow = function (m, extra) {
    var c = A.caseOf(m.id), lv = A.effLevel(m);
    return '<a class="item" href="#/merchant/' + m.id + '"><span class="thumb">' + U.storefront(m, 44) + '</span><span class="meta"><div class="t">' + esc(m.nama) + '</div><div class="s">' + esc(m.kategori) + ' &middot; ' + esc(m.kota) + (c ? ' &middot; ' + c.status : '') + '</div><div style="margin-top:4px">' + U.level(lv) + (lv !== m.level ? ' <span class="small muted">penapisan: ' + U.LV[m.level] + '</span>' : '') + (extra || '') + '</div></span>' +
      '<span class="right"><div class="score num">' + m.score + '<small>prioritas</small></div>' + A.groupsBar(m) + '</span></a>';
  };
  A.route = function () { };      // diisi oleh app.js
})();
