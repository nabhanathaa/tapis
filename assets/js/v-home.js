/* TAPIS: masuk/daftar (akun demo), beranda, menu, akun, panduan, tentang. */
(function () {
  'use strict';
  var A = window.A, T = A.T, U = A.U, H = A.H, S = A.S, icon = U.icon, idn = U.idn, rp = U.rp, esc = U.esc, badge = U.badge, level = U.level;
  var save = A.save, toast = A.toast, shell = A.shell, cu = A.cu, hash = A.hash, me = A.me, isPJP = A.isPJP;
  function login(email) { S.session = email; save('session', email); location.hash = '#/beranda'; A.route(); }
  A.login = login;
  // ---------- masuk dan daftar ----------
  function viewAuth(mode) {
    var reg = mode === 'daftar', app = A.app, users = S.users;
    app.innerHTML = '<div class="auth"><div class="hero"><span class="orb o1"></span><span class="orb o2"></span><span class="ring"></span><div class="logo-tile"><img src="assets/img/logo.png" alt="Logo TAPIS"></div>' +
      '<h1>' + (reg ? 'Daftarkan akun petugas' : 'Halo, selamat datang') + '</h1><p class="brandline"><b>TAPIS</b> &middot; Menapis transaksi, menjaga ekosistem QRIS</p></div>' +
      '<div class="panel"><div class="seg" data-on="' + (reg ? 1 : 0) + '"><i></i><button class="' + (reg ? '' : 'on') + '" data-go="masuk">Masuk</button><button class="' + (reg ? 'on' : '') + '" data-go="daftar">Daftar petugas</button></div>' +
      '<div id="err"></div>' + (reg ? regForm() : loginForm()) + '</div></div>';
    app.querySelectorAll('[data-go]').forEach(function (b) { b.onclick = function (e) { e.preventDefault(); location.hash = '#/' + b.dataset.go; }; });
    app.querySelectorAll('.eye').forEach(function (b) { b.onclick = function () { var i = b.parentElement.querySelector('input'), show = i.type === 'password'; i.type = show ? 'text' : 'password'; b.innerHTML = icon(show ? 'eyeoff' : 'eye'); b.setAttribute('aria-label', show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'); }; });
    function fail(msg) { var e = app.querySelector('#err'); e.innerHTML = ''; void e.offsetWidth; e.innerHTML = '<div class="err">' + msg + '</div>'; }
    if (!reg) {
      app.querySelector('#forgot').onclick = function (e) { e.preventDefault(); toast('Hubungi administrator unit kerja untuk mengatur ulang kata sandi.'); };
      app.querySelector('#f-login').onsubmit = function (e) {
        e.preventDefault(); var em = this.email.value.trim().toLowerCase(), pw = this.pass.value, btn = this.querySelector('button[type=submit]');
        var u = users.filter(function (x) { return x.email === em; })[0];
        if (!u || u.pass !== hash(pw)) { fail('Email dinas atau kata sandi tidak cocok.'); return; }
        btn.classList.add('loading'); setTimeout(function () { login(u.email); }, 450);
      };
      app.querySelectorAll('[data-demo]').forEach(function (b) { b.onclick = function () { login(b.dataset.demo); }; });
    } else {
      var f = app.querySelector('#f-reg'), inst = f.inst, jab = f.jabatan;
      function sync() { var p = inst.value === 'pjp'; jab.closest('.field').style.display = p ? '' : 'none'; f.org.closest('.field').querySelector('label').textContent = p ? 'Nama PJP pengakuisisi' : 'Satuan kerja'; f.org.placeholder = p ? 'Contoh: PJP Arunika' : 'Contoh: Direktorat Analisis Transaksi'; }
      inst.onchange = sync; sync();
      f.onsubmit = function (e) {
        e.preventDefault(); var em = f.email.value.trim().toLowerCase();
        if (users.some(function (x) { return x.email === em; })) { fail('Email ini sudah terdaftar.'); return; }
        if (f.pass.value.length < 8) { fail('Kata sandi minimal 8 karakter.'); return; }
        var role = inst.value === 'pjp' ? jab.value : inst.value;
        var u = { email: em, nama: f.nama.value.trim(), role: role, unit: f.org.value.trim(), nip: f.nip.value.trim(), pass: hash(f.pass.value), c: '#33507F' };
        users.push(u); save('users', users); toast('Akun dibuat. Selamat bertugas.'); login(em);
      };
    }
  }
  function fld(label, ic, input, extra) { return '<div class="field"><label>' + label + '</label><div class="inp">' + icon(ic) + input + (extra || '') + '</div></div>'; }
  var EYE = '<button type="button" class="eye" aria-label="Tampilkan kata sandi">' + icon('eye') + '</button>', DD = icon('chev', 'dd');
  function loginForm() { var DEMO_USERS = A.DEMO_USERS, ROLES = A.ROLES, initials = A.initials;
    var demo = DEMO_USERS.map(function (u) { return '<button type="button" data-demo="' + u.email + '"><span class="av" style="background:' + u.c + '">' + initials(u.nama) + '</span><span><b>' + esc(u.nama.split(' ')[0]) + '</b><span>' + esc(ROLES[u.role].inst === 'PJP pengakuisisi' ? (u.role === 'pjp_pejabat' ? 'Pejabat PJP' : 'Analis PJP') : ROLES[u.role].inst) + '</span></span></button>'; }).join('');
    return '<form id="f-login" autocomplete="on">' +
      fld('Email dinas', 'mail', '<input name="email" type="email" required placeholder="nama@instansi.go.id" value="rani@arunika.demo" autocomplete="username">') +
      fld('Kata sandi', 'lock', '<input name="pass" type="password" required placeholder="Minimal 8 karakter" value="demo1234" autocomplete="current-password">', EYE) +
      '<div class="rowb"><label><input type="checkbox" checked> Ingat saya</label><a href="#" id="forgot">Lupa kata sandi?</a></div>' +
      '<button class="btn round" type="submit">Masuk<span class="arr">' + icon('arrow') + '</span></button></form>' +
      '<div class="divider">atau masuk cepat sebagai</div><div class="demo-acc">' + demo + '</div>' +
      '<p class="foot">Belum punya akun? <a href="#/daftar" data-go="daftar">Daftar petugas</a></p>';
  }
  function regForm() {
    return '<form id="f-reg">' + fld('Nama lengkap', 'user', '<input name="nama" required placeholder="Sesuai kartu pegawai">') +
      fld('Instansi', 'building', '<select name="inst"><option value="pjp">PJP pengakuisisi (bank atau lembaga selain bank)</option><option value="bi">Bank Indonesia</option><option value="ppatk">PPATK</option></select>', DD) +
      fld('Jabatan dalam alur kasus', 'briefcase', '<select name="jabatan"><option value="pjp_analis">Analis pemantauan merchant</option><option value="pjp_pejabat">Pejabat kepatuhan (dapat menyetujui pembatasan)</option></select>', DD) +
      fld('Nama PJP pengakuisisi', 'shield', '<input name="org" required placeholder="Contoh: PJP Arunika">') +
      fld('Nomor induk pegawai', 'id', '<input name="nip" required placeholder="Nomor induk pegawai">') +
      fld('Email dinas', 'mail', '<input name="email" type="email" required placeholder="nama@instansi.go.id">') +
      fld('Kata sandi', 'lock', '<input name="pass" type="password" required minlength="8" placeholder="Minimal 8 karakter">', EYE) +
      '<label class="agree"><input type="checkbox" required> Saya memahami bahwa data transaksi bersifat rahasia dan setiap tindakan saya tercatat dalam jejak audit.</label>' +
      '<button class="btn round" type="submit">Buat akun<span class="arr">' + icon('arrow') + '</span></button></form>' +
      '<p class="foot">Sudah punya akun? <a href="#/masuk" data-go="masuk">Masuk</a></p>';
  }
  A.viewAuth = viewAuth;

  // ---------- beranda ----------
  function greet() { var h = new Date().getHours(); return h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam'; }
  function donut(cnt, tot) {
    var off = 0, L = ['hijau', 'kuning', 'oranye', 'merah'], sg = L.map(function (l, i) { var p = cnt[l] / tot * 100, g = p > 0 ? Math.max(0.01, p - 1.2) : 0; var c = p > 0 ? '<circle class="sg" r="15.9155" cx="21" cy="21" fill="none" stroke="var(--lv-' + l + ')" stroke-width="5" stroke-linecap="round" stroke-dasharray="' + g.toFixed(2) + ' ' + (100 - g).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '" style="animation-delay:' + (i * 0.12) + 's"/>' : ''; off += p; return c; }).join('');
    var lst = L.map(function (l) { return '<div><i style="background:var(--lv-' + l + ')"></i><span>' + U.LV[l] + '</span><b>' + cu(cnt[l]) + '</b><em>' + idn(cnt[l] / tot * 100) + '%</em></div>'; }).join('');
    return '<div class="donutwrap"><div class="donut-box"><svg class="donut" viewBox="0 0 42 42"><circle r="15.9155" cx="21" cy="21" fill="none" stroke="#EEF2F8" stroke-width="5"/>' + sg + '</svg><div class="c"><b>' + cu(tot) + '</b><span>merchant</span></div></div><div class="lvlist">' + lst + '</div></div>';
  }
  A.donut = donut;
  function viewBeranda() {
    var u = me(), d = new Date(), cnt = { hijau: 0, kuning: 0, oranye: 0, merah: 0 }, cs = S.cases;
    T.merchants.forEach(function (m) { cnt[A.effLevel(m)]++; });
    var open = cs.filter(function (c) { return A.ACTIVE.indexOf(c.status) >= 0; });
    var q = A.antrean(), K = A.kapasitas(), today = q.filter(function (x) { return x.today; }).length;
    var bat = cs.filter(function (c) { return c.status === 'Dibatasi' || c.status === 'Keberatan'; }).map(function (c) { return A.workdaysBetween(A.today(), A.addWorkdays(c.mulaiBatas, 5)); });
    var kpi = isPJP() ? '<div class="row"><div class="kpi"><b>' + cu(q.length) + '</b><span>Belum diperiksa</span></div><div class="kpi"><b>' + cu(K) + '</b><span>Kapasitas per hari kerja</span></div><div class="kpi"><b>' + cu(open.length) + '</b><span>Kasus aktif</span></div></div>'
      : '<div class="row"><div class="kpi"><b>' + cu(T.merchants.length) + '</b><span>Merchant simulasi</span></div><div class="kpi"><b>' + cu(cs.length) + '</b><span>Kasus simulasi</span></div><div class="kpi"><b>' + cu(open.length) + '</b><span>Kasus aktif</span></div></div>';
    var top = q.slice(0, 3).map(function (x) { return A.itemRow(x.m); }).join('') || '<div class="empty">Tidak ada merchant Oranye yang menunggu.</div>';
    var body = '<div class="hello"><img class="wm" src="assets/img/logo.png" alt=""><small>' + greet() + ', ' + A.HARI[d.getDay()] + ' ' + A.fmtD(d) + '</small><div class="name">' + esc(u.nama.split(' ')[0]) + '</div>' + kpi + '</div>' +
      (bat.length && isPJP() ? '<div class="countdown">' + icon('clock') + '<div><b class="num">' + Math.min.apply(null, bat) + ' hari kerja</b><br><span>sisa batas penundaan terdekat (UU 8/2010 Pasal 26: paling lama 5 hari kerja)</span></div></div>' : '') +
      '<div class="card"><div class="flex between"><h3>Sebaran level merchant</h3>' + badge('demo') + '</div><p class="hint">' + T.merchants.length + ' merchant simulasi. Level Merah hanya muncul setelah pemeriksaan manusia dan persetujuan dua pejabat.</p>' + donut(cnt, T.merchants.length) +
      '<div class="note">Angkringan malam, konter pulsa bernominal seragam, dan warung dengan lonjakan acara tetap Hijau. Jam malam, nominal seragam, dan lonjakan sesaat adalah sinyal lemah yang tidak pernah berdiri sendiri.</div></div>' +
      (isPJP() ? '<div class="card"><div class="flex between"><h3>Kapasitas pemeriksaan</h3>' + badge('asumsi') + '</div><p class="hint">Parameter operasional yang diatur tim (bukan data nasional). Saat ini ' + K + ' kasus baru dapat mulai ditinjau per hari kerja; ' + today + ' dijadwalkan hari ini, ' + Math.max(0, q.length - today) + ' menunggu kapasitas.</p><a class="btn sec" href="#/antrean">Buka antrean</a></div>' : '') +
      (isPJP() ? '<div class="sec-title"><h2>Peringkat teratas</h2><a href="#/antrean">Lihat antrean</a></div><div class="list">' + top + '</div>' : '') +
      (u.role === 'ppatk' ? '<div class="sec-title"><h2>Tentang LTKM</h2></div>' + A.ltkmInfo(false) + '<div class="sec-title"><h2>LTKM simulasi dari PJP</h2><a href="#/ltkm">Lihat semua</a></div><div class="list">' + cs.filter(function (c) { return c.status === 'Diteruskan'; }).map(A.caseRow).join('') + '</div>' : '') +
      (u.role === 'bi' ? '<div class="sec-title"><h2>Pengawasan</h2><a href="#/pengawasan">Buka</a></div><div class="card"><h3>Kinerja PJP dan statistik nasional</h3><p class="hint">Indikator kinerja PJP dihitung dari kasus simulasi dan dipisahkan dari statistik LTKM nasional PPATK.</p></div>' : '') +
      '<div class="sec-title"><h2>Angka resmi</h2><a href="#/bukti">Pusat bukti</a></div><div class="grid2">' +
      A.stat('Frekuensi deposit judi daring melalui QRIS, Sem I 2026', cu(87.66, 2, '', '%'), 'resmi', 'PPATK, siaran pers Agustus 2026') +
      A.stat('Rata-rata satu deposit melalui QRIS', cu(Math.round(H.deposit.rata2_qris_rp), 0, 'Rp'), 'hitungan', 'dari PPATK, Laporan Semester I 2026') +
      A.stat('Merchant QRIS, Juni 2026', cu(H.qris.merchant_juta, 2, '', ' juta'), 'resmi', 'BI, siaran pers 28/159/DKom') +
      A.stat('Laporan indikasi Perjudian, Jan-Sep 2026 dibanding 2025', cu((1 - H.m2.jan_sep_2026 / H.m2.jan_sep_2025) * 100, 1, '-', '%'), 'hitungan', 'dari PPATK, Buletin APUPPT Sep 2026') + '</div>' +
      '<div class="sec-title"><h2>Pintasan</h2></div><div class="list menu">' +
      A.menuLink('#/simulator', 'sliders', 'Simulator level dan ambang', 'Uji skenario merchant dan hitung PPV dengan rumus notebook') +
      A.menuLink('#/jejaring/' + (q.length ? q[0].m.id : 'M081'), 'net', 'Jejaring pembayar', 'Graf merchant dan pembayar bersama') + '</div>';
    shell('TAPIS', esc(u.unit), body);
  }

  // ---------- menu, akun, panduan, tentang ----------
  function viewMenu() {
    var u = me(), ROLES = A.ROLES, q = A.antrean();
    var body = '<div class="profile">' + A.avatar(u) + '<div style="position:relative;z-index:1;min-width:0"><b>' + esc(u.nama) + '</b><div class="small">' + esc(ROLES[u.role].nama) + '</div><div class="small">' + esc(u.unit) + '</div></div></div>' +
      '<div class="list menu">' + A.menuLink('#/simulator', 'sliders', 'Simulator', 'Level merchant dan ambang Bayes') + A.menuLink('#/jejaring/' + (q.length ? q[0].m.id : 'M081'), 'net', 'Jejaring pembayar', 'Graf merchant dan pembayar') + A.menuLink('#/bukti/peta', 'map', 'Peta konteks', 'PDRB per kapita 38 provinsi') +
      (isPJP() ? A.menuLink('#/antrean', 'queue', 'Antrean', 'Peringkat prioritas dan kapasitas') : A.menuLink('#/kasus', 'folder', 'Daftar kasus', 'Status dan jejak audit')) + A.menuLink('#/data', 'file', 'Data simulasi', 'Daftar merchant dan ekspor CSV') + '</div>' +
      '<div class="sec-title"><h2>Bantuan</h2></div><div class="list menu">' + A.menuLink('#/panduan', 'book', 'Cara TAPIS menilai', 'Sinyal, skor, level, dan dasar hukum') + A.menuLink('#/tentang', 'info', 'Tentang data', 'Sumber resmi dan data simulasi') + A.menuLink('#/akun', 'id', 'Akun', 'Profil dan pengaturan') + '</div>' +
      '<button class="btn sec mt12" id="out">' + icon('logout') + 'Keluar</button>';
    shell('Menu', '', body);
    A.app.querySelector('#out').onclick = function () { S.session = null; save('session', null); location.hash = '#/masuk'; };
  }
  function viewAkun() {
    var u = me(), ROLES = A.ROLES;
    var body = '<div class="card"><dl class="kv"><dt>Nama</dt><dd>' + esc(u.nama) + '</dd><dt>Peran</dt><dd>' + esc(ROLES[u.role].nama) + '</dd><dt>Unit</dt><dd>' + esc(u.unit) + '</dd><dt>Nomor pegawai</dt><dd>' + esc(u.nip) + '</dd><dt>Email</dt><dd>' + esc(u.email) + '</dd></dl></div>' +
      '<div class="card"><h3>Hak akses dalam demo</h3><p class="small">' + ({ pjp_analis: 'Membuka kasus, mencatat bukti, meminta dokumen dan klarifikasi, mengajukan penundaan, mencatat keberatan, serta menutup kasus yang belum dibatasi.', pjp_pejabat: 'Semua hak analis ditambah persetujuan penundaan (dua pejabat berbeda), putusan keberatan, pencabutan pembatasan, dan pengiriman LTKM.', bi: 'Melihat kinerja PJP dan pusat bukti. Tidak dapat bertindak atas merchant.', ppatk: 'Melihat LTKM simulasi yang diteruskan PJP dan pusat bukti.' })[u.role] + '</p>' +
      '<p class="warnnote">Akun, kata sandi, dan peran di sini hanya untuk demonstrasi di peramban ini (localStorage). Ini bukan mekanisme keamanan produksi: sistem nyata memerlukan autentikasi sisi server, kontrol akses, dan jejak audit yang tidak dapat diubah.</p></div>' +
      '<button class="btn sec" id="rs">' + icon('reset') + 'Kembalikan data simulasi ke awal</button><p class="small muted mt8">Menghapus kasus, akun tambahan, dan pengaturan kapasitas yang tersimpan di peramban ini.</p>';
    shell('Akun', '', body, { back: true, nav: 'menu' });
    A.app.querySelector('#rs').onclick = function () { A.resetAll(); location.hash = '#/masuk'; location.reload(); };
  }
  function viewPanduan() {
    var W = T.CONFIG.W;
    var lv = [['hijau', 'Tidak ada kelompok sinyal kuat. Sinyal lemah (jam malam, nominal seragam, lonjakan sesaat) tidak mengubah level.', 'Tidak ada tindakan.'], ['kuning', 'Tepat satu kelompok sinyal kuat (J, P, atau K) aktif.', 'Dipantau otomatis. Tidak masuk antrean; merchant tidak diberi tahu dan tidak dibatasi.'], ['oranye', 'Minimal dua dari tiga kelompok sinyal aktif.', 'Masuk antrean pemeriksaan menurut skor prioritas dan kapasitas analis.'], ['merah', 'Tidak pernah otomatis. Hanya setelah pemeriksaan manusia, bukti memadai, dan persetujuan dua pejabat berbeda.', 'Penundaan paling lama 5 hari kerja, berita acara, salinan ke merchant, hak keberatan.']];
    var body = A.ltkmInfo(true) + '<div class="card"><h3>Empat lapisan terpisah</h3><ol class="small" style="padding-left:18px;margin:6px 0"><li><b>Sinyal</b>: J, P, dan K dihitung dari data transaksi.</li><li><b>Skor prioritas</b>: peringkat untuk mengurutkan antrean, bukan peluang.</li><li><b>Level penapisan</b>: Hijau, Kuning, Oranye berdasarkan jumlah kelompok sinyal.</li><li><b>Keputusan pemeriksaan</b>: hanya manusia; Merah/Dibatasi lewat kasus.</li></ol></div>' +
      '<div class="card"><h3>Empat level</h3>' + lv.map(function (l) { return '<div class="reason"><div>' + level(l[0], true) + '<p class="mt8"><b style="display:inline;font-size:12.5px">Syarat:</b> ' + l[1] + '</p><p><b style="display:inline;font-size:12.5px">Tindakan:</b> ' + l[2] + '</p></div></div>'; }).join('') + '</div>' +
      '<div class="card"><h3>Tiga kelompok sinyal</h3><div class="reason"><span class="ic on">J</span><div><b>Jejaring pembayar</b><p>Pembayar bersama, proporsi pembayar lintas merchant, derajat pembayar, komponen jaringan, serta fan-in dan fan-out. Bila ID pembayar tidak lengkap, hasilnya "tidak cukup data", bukan "aman".</p></div></div><div class="reason"><span class="ic on">P</span><div><b>Perilaku</b><p>Robust Z terhadap usaha sejenis dan terhadap riwayat sendiri (Iglewicz dan Hoaglin, 1993), serta CUSUM (Page, 1954; k = ' + T.CONFIG.cusum.k + ' dan h = ' + T.CONFIG.cusum.h + ' bersifat ilustratif dan belum dikalibrasi). Mempertimbangkan panjang riwayat, data hilang, dan jumlah pembanding minimal.</p></div></div><div class="reason"><span class="ic on">K</span><div><b>Profil dan konteks</b><p>Umur merchant, kategori atau MCC, profil usaha, dan daftar rujukan beserta sumber, tanggal pembaruan, dasar pencocokan, dan tingkat keyakinan.</p></div></div>' +
      '<p class="note">Skor prioritas = 100 x jumlah (bobot x persentil). Bobot ' + W.jaringan + ' (jejaring), ' + W.sebaya + ' (sebaya), ' + W.perubahan + ' (perubahan), ' + W.profil + ' (profil), ' + W.daftar + ' (daftar) adalah rancangan awal, bukan hasil estimasi empiris. Skor adalah peringkat, bukan peluang bahwa merchant terlibat judi daring.</p></div>' +
      '<div class="card"><h3>Yang tidak pernah menjadi alasan tunggal</h3><p class="small">Aktif pada malam hari, nominal kecil atau seragam, dan lonjakan sesaat saat akhir pekan atau acara lokal. Ketiganya wajar bagi angkringan, konter pulsa, dan warung.</p></div>' +
      '<div class="card"><h3>Dasar hukum</h3><table class="mini"><tbody><tr><td>Pemantauan merchant oleh PJP</td><td>PBI 10/2024 Pasal 16 dan 29; PADG 15/2025 Penjelasan Pasal 14</td></tr><tr><td>Lapor TKM 3 hari kerja</td><td>UU 8/2010 Pasal 25 ayat (1)</td></tr><tr><td>Penundaan 5 hari kerja</td><td>UU 8/2010 Pasal 26; PBI 10/2024 Pasal 37</td></tr><tr><td>Penghentian sementara oleh PPATK</td><td>UU 8/2010 Pasal 44 ayat (1) huruf i, Pasal 65-66</td></tr><tr><td>Keberatan</td><td>UU 8/2010 Pasal 67</td></tr><tr><td>Teknologi inovatif pengawasan</td><td>PADG 15/2025 Pasal 24</td></tr></tbody></table></div>';
    shell('Cara TAPIS menilai', '', body, { back: true, nav: 'menu' });
  }
  function viewTentang() {
    var body = '<div class="card"><h3>Empat jenis angka</h3><div class="reason"><span>' + badge('resmi') + '</span><div><p>Tertulis di publikasi PPATK, Bank Indonesia, atau BPS.</p></div></div><div class="reason"><span>' + badge('hitungan') + '</span><div><p>Diturunkan dari angka resmi oleh notebook analisis (analisis_tapis_revisi_v2).</p></div></div><div class="reason"><span>' + badge('asumsi') + '</span><div><p>Parameter skenario atau rancangan awal, misalnya sensitivitas 80%, bobot skor, k dan h CUSUM, kapasitas analis.</p></div></div><div class="reason"><span>' + badge('demo') + '</span><div><p>Merchant, transaksi, pembayar, kasus, daftar rujukan, dan akun. Dibangkitkan oleh simulasi, tidak berasal dari data nyata, dan tidak dipakai sebagai temuan.</p></div></div></div>' +
      '<div class="card"><h3>Batas klaim</h3><p class="small">TAPIS adalah prototipe. TAPIS bukan sistem produksi dan belum divalidasi dengan data berlabel. Hasil penapisan pada data simulasi hanya memperlihatkan cara kerja aturan; angka itu bukan akurasi deteksi di dunia nyata.</p></div>' +
      '<div class="card"><h3>Sumber resmi</h3><ul class="small" style="padding-left:18px;margin:6px 0"><li>PPATK, Buletin Statistik APUPPT edisi Juni 2025, Oktober 2025, dan September 2026 (Tabel 2 dan Tabel 5).</li><li>PPATK, Laporan Semester I Tahun 2026.</li><li>PPATK, Siaran Pers B/04/HM.05/3.1/VIII/2026.</li><li>Bank Indonesia, Siaran Pers No. 28/159/DKom.</li><li>BPS, PDRB dan PDRB per kapita menurut provinsi 2024-2025.</li><li>UU 8/2010; PBI 10/2024; PADG 15/2025.</li></ul></div>';
    shell('Tentang data', '', body, { back: true, nav: 'menu' });
  }
  A.viewBeranda = viewBeranda; A.viewMenu = viewMenu; A.viewAkun = viewAkun; A.viewPanduan = viewPanduan; A.viewTentang = viewTentang;

})();
