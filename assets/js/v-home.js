/* TAPIS: layar masuk/daftar, beranda mobile fintech, akun & ganti peran demo, panduan metodologi, dan tentang data. */
(function () {
  'use strict';
  var A = window.A, T = A.T, U = A.U, H = A.H, S = A.S, icon = U.icon, idn = U.idn, rp = U.rp, esc = U.esc, badge = U.badge, level = U.level;
  var save = A.save, toast = A.toast, shell = A.shell, cu = A.cu, hash = A.hash, me = A.me, isPJP = A.isPJP;

  function login(email, targetHash) {
    S.session = email;
    save('session', email);
    location.hash = targetHash || '#/beranda';
    A.route();
  }
  A.login = login;

  // ---------- Masuk dan Daftar ----------
  function viewAuth(mode) {
    var reg = mode === 'daftar', app = A.app, users = S.users;
    app.innerHTML =
      '<div class="auth">' +
        A.statusBarHtml() +
        '<div class="hero">' +
          '<span class="orb o1"></span><span class="orb o2"></span><span class="ring"></span>' +
          '<div class="logo-tile"><img src="assets/img/logo.png" alt="Logo TAPIS"></div>' +
          '<h1>' + (reg ? 'Daftarkan akun petugas' : 'Halo, selamat datang') + '</h1>' +
          '<p class="brandline"><b>TAPIS</b> &middot; Menapis transaksi, menjaga ekosistem QRIS</p>' +
        '</div>' +
        '<div class="panel">' +
          '<div class="seg" data-on="' + (reg ? 1 : 0) + '"><i></i><button type="button" class="' + (reg ? '' : 'on') + '" data-go="masuk">Masuk</button><button type="button" class="' + (reg ? 'on' : '') + '" data-go="daftar">Daftar petugas</button></div>' +
          '<div id="err"></div>' +
          (reg ? regForm() : loginForm()) +
        '</div>' +
      '</div>';

    app.querySelectorAll('[data-go]').forEach(function (b) { b.onclick = function (e) { e.preventDefault(); location.hash = '#/' + b.dataset.go; }; });
    app.querySelectorAll('.eye').forEach(function (b) {
      b.onclick = function () {
        var i = b.parentElement.querySelector('input'), show = i.type === 'password';
        i.type = show ? 'text' : 'password';
        b.innerHTML = icon(show ? 'eyeoff' : 'eye');
        b.setAttribute('aria-label', show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');
      };
    });
    function fail(msg) { var e = app.querySelector('#err'); e.innerHTML = ''; void e.offsetWidth; e.innerHTML = '<div class="err">' + msg + '</div>'; }
    if (!reg) {
      app.querySelector('#forgot').onclick = function (e) { e.preventDefault(); toast('Hubungi administrator unit kerja untuk mengatur ulang kata sandi.'); };
      app.querySelector('#f-login').onsubmit = function (e) {
        e.preventDefault();
        var em = this.email.value.trim().toLowerCase(), pw = this.pass.value, btn = this.querySelector('button[type=submit]');
        var u = users.filter(function (x) { return x.email === em; })[0];
        if (!u || u.pass !== hash(pw)) { fail('Email dinas atau kata sandi tidak cocok.'); return; }
        btn.classList.add('loading');
        setTimeout(function () { login(u.email); }, 350);
      };
      app.querySelectorAll('[data-demo]').forEach(function (b) { b.onclick = function () { login(b.dataset.demo); }; });
    } else {
      var f = app.querySelector('#f-reg'), inst = f.inst, jab = f.jabatan;
      function sync() {
        var p = inst.value === 'pjp';
        jab.closest('.field').style.display = p ? '' : 'none';
        f.org.closest('.field').querySelector('label').textContent = p ? 'Nama PJP pengakuisisi' : 'Satuan kerja';
        f.org.placeholder = p ? 'Contoh: PJP Arunika' : 'Contoh: Direktorat Analisis Transaksi';
      }
      inst.onchange = sync; sync();
      f.onsubmit = function (e) {
        e.preventDefault();
        var em = f.email.value.trim().toLowerCase();
        if (users.some(function (x) { return x.email === em; })) { fail('Email ini sudah terdaftar.'); return; }
        if (f.pass.value.length < 8) { fail('Kata sandi minimal 8 karakter.'); return; }
        var role = inst.value === 'pjp' ? jab.value : inst.value;
        var u = { email: em, nama: f.nama.value.trim(), role: role, unit: f.org.value.trim(), nip: f.nip.value.trim(), pass: hash(f.pass.value), c: '#15459B' };
        users.push(u); save('users', users); toast('Akun dibuat. Selamat bertugas.'); login(em);
      };
    }
  }

  function fld(label, ic, input, extra) { return '<div class="field"><label>' + label + '</label><div class="inp">' + icon(ic) + input + (extra || '') + '</div></div>'; }
  var EYE = '<button type="button" class="eye" aria-label="Tampilkan kata sandi">' + icon('eye') + '</button>', DD = icon('chev', 'dd');

  function loginForm() {
    var DEMO_USERS = A.DEMO_USERS, ROLES = A.ROLES, initials = A.initials;
    var demo = DEMO_USERS.map(function (u) {
      return '<button type="button" data-demo="' + u.email + '"><span class="av" style="background:' + u.c + '">' + initials(u.nama) + '</span><span><b>' + esc(u.nama.split(' ')[0]) + '</b><span>' + esc(ROLES[u.role].inst === 'PJP pengakuisisi' ? (u.role === 'pjp_pejabat' ? 'Pejabat PJP' : 'Analis PJP') : ROLES[u.role].inst) + '</span></span></button>';
    }).join('');
    return '<form id="f-login" autocomplete="on">' +
      fld('Email dinas', 'mail', '<input name="email" type="email" required placeholder="nama@instansi.go.id" value="rani@arunika.demo" autocomplete="username">') +
      fld('Kata sandi', 'lock', '<input name="pass" type="password" required placeholder="Minimal 8 karakter" value="demo1234" autocomplete="current-password">', EYE) +
      '<div class="rowb"><label><input type="checkbox" checked> Ingat saya</label><a href="#" id="forgot">Lupa kata sandi?</a></div>' +
      '<button class="btn round" type="submit">Masuk<span class="arr">' + icon('arrow') + '</span></button></form>' +
      '<div class="divider">atau masuk cepat sebagai</div><div class="demo-acc">' + demo + '</div>' +
      '<p class="foot">Belum punya akun? <a href="#/daftar" data-go="daftar">Daftar petugas</a></p>';
  }

  function regForm() {
    return '<form id="f-reg">' +
      fld('Nama lengkap', 'user', '<input name="nama" required placeholder="Sesuai kartu pegawai">') +
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

  // ---------- Beranda Mobile Fintech ----------
  function greet() { var h = new Date().getHours(); return h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam'; }
  function donut(cnt, tot) {
    var off = 0, L = ['hijau', 'kuning', 'oranye', 'merah'];
    var sg = L.map(function (l, i) {
      var p = cnt[l] / tot * 100, g = p > 0 ? Math.max(0.1, p - 1.2) : 0;
      var c = p > 0 ? '<circle class="sg" r="15.9155" cx="21" cy="21" fill="none" stroke="var(--lv-' + l + ')" stroke-width="5" stroke-linecap="round" stroke-dasharray="' + g.toFixed(2) + ' ' + (100 - g).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '" style="animation-delay:' + (i * 0.1) + 's"/>' : '';
      off += p; return c;
    }).join('');
    var lst = L.map(function (l) {
      return '<div><i style="background:var(--lv-' + l + ')"></i><span>' + U.LV[l] + '</span><b>' + cu(cnt[l]) + '</b><em>' + idn(cnt[l] / tot * 100) + '%</em></div>';
    }).join('');
    return '<div class="donutwrap"><div class="donut-box"><svg class="donut" viewBox="0 0 42 42"><circle r="15.9155" cx="21" cy="21" fill="none" stroke="#EEF2F8" stroke-width="5"/>' + sg + '</svg><div class="c"><b>' + cu(tot) + '</b><span>merchant</span></div></div><div class="lvlist">' + lst + '</div></div>';
  }
  A.donut = donut;

  function viewBeranda() {
    var u = me(), d = new Date(), cnt = { hijau: 0, kuning: 0, oranye: 0, merah: 0 }, cs = S.cases;
    T.merchants.forEach(function (m) { cnt[A.effLevel(m)]++; });
    var open = cs.filter(function (c) { return A.ACTIVE.indexOf(c.status) >= 0; });
    var q = A.antrean(), K = A.kapasitas(), today = q.filter(function (x) { return x.today; }).length;
    var batCases = cs.filter(function (c) { return c.status === 'Dibatasi' || c.status === 'Keberatan'; });
    var bat = batCases.map(function (c) { return A.workdaysBetween(A.today(), A.addWorkdays(c.mulaiBatas, 5)); });
    var minBat = bat.length ? Math.min.apply(null, bat) : null;
    var kebCases = cs.filter(function (c) { return c.status === 'Keberatan'; });

    var jCnt = 0, pCnt = 0, kCnt = 0;
    T.merchants.forEach(function (m) {
      if (m.sig && m.sig.J) jCnt++;
      if (m.sig && m.sig.P) pCnt++;
      if (m.sig && m.sig.K) kCnt++;
    });

    var roleInfo = (A.ROLES && A.ROLES[u.role]) ? A.ROLES[u.role] : { nama: 'Petugas' };
    var pctH = Math.round(cnt.hijau / T.merchants.length * 100);
    var pctK = Math.round(cnt.kuning / T.merchants.length * 100);
    var pctO = Math.round(cnt.oranye / T.merchants.length * 100);
    var pctM = Math.round(cnt.merah / T.merchants.length * 100);

    var capPercent = Math.min(100, Math.round((today / Math.max(1, K)) * 100));
    var capStatus = today >= K ? 'Kuota Terpenuhi' : 'Tersedia (' + (K - today) + ' slot)';

    // Hero Card bergaya Pilahin / Fintech Flagship
    var hero =
      '<div class="hello">' +
        '<div class="hello-top">' +
          '<div class="live-status"><span class="live-dot"></span><span>SURVEILANS MULTI-LAYER AKTIF</span></div>' +
          '<div class="hello-date">' + A.HARI[d.getDay()] + ', ' + A.fmtD(d) + '</div>' +
        '</div>' +
        '<div class="hello-head">' +
          '<div class="hello-greet">' + greet() + ',</div>' +
          '<h2 class="hello-name">' + esc(u.nama) + '</h2>' +
          '<div class="hello-sub">' + esc(u.unit) + ' &bull; <span class="role-pill">' + esc(roleInfo.nama) + '</span></div>' +
        '</div>' +
        '<div class="hero-metric-box">' +
          '<div class="hm-label">ANTREAN VERIFIKASI PRIORITAS &middot; LEVEL ORANYE</div>' +
          '<div class="hm-val"><b class="num">' + cu(isPJP() ? q.length : T.merchants.length) + '</b><span>' + (isPJP() ? 'merchant menunggu verifikasi' : 'merchant QRIS dipantau') + '</span></div>' +
          '<div class="kpi-grid">' +
            '<a class="kpi-card" href="#/antrean"><span class="kpi-tag amber">PRIORITAS</span><b class="num">' + cu(q.length) + '</b><span>Belum diperiksa</span></a>' +
            '<a class="kpi-card" href="#/antrean"><span class="kpi-tag blue">KAPASITAS</span><b class="num">' + cu(K) + '</b><span>Kuota / hari kerja</span></a>' +
            '<a class="kpi-card" href="#/kasus"><span class="kpi-tag green">BERJALAN</span><b class="num">' + cu(open.length) + '</b><span>Kasus aktif</span></a>' +
          '</div>' +
          '<a class="hero-cta-btn" href="' + (isPJP() ? '#/antrean' : (u.role === 'bi' ? '#/pengawasan' : '#/ltkm')) + '">' +
            icon('scale') +
            '<span>' + (isPJP() ? 'Mulai verifikasi antrean prioritas' : (u.role === 'bi' ? 'Buka pengawasan kepatuhan PJP' : 'Tinjau laporan LTKM masuk')) + '</span>' +
            icon('arrow') +
          '</a>' +
        '</div>' +
      '</div>';

    // Bagian "Perlu tindakan" bergaya Pilahin (kartu aksi dengan aksen vertikal kiri)
    var actionItems = '';
    if (minBat !== null) {
      actionItems +=
        '<a class="act-card amber" href="#/kasus/' + batCases[0].id + '">' +
          '<div class="act-ic">' + icon('clock') + '</div>' +
          '<div class="act-body">' +
            '<b>Batas penundaan: ' + minBat + ' hari kerja tersisa</b>' +
            '<span>UU 8/2010 Pasal 26: ' + batCases.length + ' kasus dibatasi wajib diputus maksimal 5 hari kerja</span>' +
          '</div>' +
          icon('chev', 'act-chev') +
        '</a>';
    }
    if (kebCases.length) {
      actionItems +=
        '<a class="act-card blue" href="#/kasus/' + kebCases[0].id + '">' +
          '<div class="act-ic">' + icon('file') + '</div>' +
          '<div class="act-body">' +
            '<b>' + kebCases.length + ' pengajuan keberatan merchant</b>' +
            '<span>Lampiran NIB &amp; nota stok distributor menunggu putusan pejabat</span>' +
          '</div>' +
          icon('chev', 'act-chev') +
        '</a>';
    }
    var actionSection = actionItems ? '<div class="sec-title"><h2>Perlu tindakan segera</h2></div><div class="act-stack">' + actionItems + '</div>' : '';

    // 4 Quick Tiles bergaya Pilahin (Peta 514, Jejaring, Simulasi, Aturan)
    var quickTiles =
      '<div class="quick-tiles-4">' +
        '<a class="qtile" href="#/bukti/klaster">' +
          '<div class="qt-ic blue"><span class="qt-badge">514</span>' + icon('map') + '</div>' +
          '<span>Peta Klaster</span>' +
        '</a>' +
        '<a class="qtile" href="#/jejaring/' + (q.length ? q[0].m.id : 'M081') + '">' +
          '<div class="qt-ic purple"><span class="qt-badge">' + jCnt + '</span>' + icon('net') + '</div>' +
          '<span>Graf Jejaring</span>' +
        '</a>' +
        '<a class="qtile" href="#/simulator/risiko">' +
          '<div class="qt-ic amber">' + icon('sliders') + '</div>' +
          '<span>Simulasi Risiko</span>' +
        '</a>' +
        '<a class="qtile" href="#/menu">' +
          '<div class="qt-ic green"><span class="qt-badge">5</span>' + icon('swap') + '</div>' +
          '<span>Ganti Peran</span>' +
        '</a>' +
      '</div>';

    var sigRadar =
      '<div class="card sig-radar-card">' +
        '<div class="flex between"><div><div class="card-tag">SURVEILANS MULTI-LAYER</div><h3>Tiga Pilar Sinyal Penapisan</h3></div>' + badge('hitungan') + '</div>' +
        '<p class="hint">Memisahkan sinyal deteksi dari sanksi. Hanya merchant dengan minimal 2 dari 3 kelompok sinyal kuat yang masuk antrean verifikasi.</p>' +
        '<div class="sig-pills">' +
          '<a class="sig-pill" href="#/antrean"><div class="sig-badge j">J</div><div class="sig-info"><div class="sig-title">Jejaring Pembayar</div><div class="sig-desc">Pembayar bersama lintas toko, fan-in/fan-out &amp; graf</div></div><div class="sig-stat"><b class="num">' + jCnt + '</b><span>merchant</span></div></a>' +
          '<a class="sig-pill" href="#/antrean"><div class="sig-badge p">P</div><div class="sig-info"><div class="sig-title">Perilaku Relatif Sebaya</div><div class="sig-desc">Robust Z &amp; CUSUM terhadap kelompok sebaya 3-lapis</div></div><div class="sig-stat"><b class="num">' + pCnt + '</b><span>merchant</span></div></a>' +
          '<a class="sig-pill" href="#/antrean"><div class="sig-badge k">K</div><div class="sig-info"><div class="sig-title">Profil &amp; Konteks Wilayah</div><div class="sig-desc">Klaster PDRB 514 kab/kota, anomali umur &amp; daftar rujukan</div></div><div class="sig-stat"><b class="num">' + kCnt + '</b><span>merchant</span></div></a>' +
        '</div>' +
      '</div>';

    var riskBar =
      '<div class="risk-spectrum">' +
        '<span class="sp-hijau" style="width:' + pctH + '%" title="Hijau ' + pctH + '%"></span>' +
        '<span class="sp-kuning" style="width:' + pctK + '%" title="Kuning ' + pctK + '%"></span>' +
        '<span class="sp-oranye" style="width:' + pctO + '%" title="Oranye ' + pctO + '%"></span>' +
        (pctM ? '<span class="sp-merah" style="width:' + pctM + '%" title="Merah ' + pctM + '%"></span>' : '') +
      '</div>';

    var sebaranCard =
      '<div class="card">' +
        '<div class="flex between"><div><div class="card-tag">STATUS EKOSISTEM</div><h3>Sebaran Level Merchant</h3></div>' + badge('demo') + '</div>' +
        '<p class="hint">' + T.merchants.length + ' merchant terkalibrasi. Level Merah hanya ditetapkan setelah verifikasi analis dan persetujuan 2 pejabat.</p>' +
        riskBar +
        donut(cnt, T.merchants.length) +
        '<div class="umkm-protect-box">' +
          icon('shield') +
          '<div><b>Prinsip Perlindungan UMKM:</b> Angkringan malam, konter pulsa seragam, dan warung dengan lonjakan acara tetap Hijau. Jam malam dan nominal seragam tidak pernah menjadi alasan tunggal pembatasan.</div>' +
        '</div>' +
      '</div>';

    var capCard = isPJP() ?
      '<div class="card cap-card">' +
        '<div class="flex between"><div><div class="card-tag">OPERASIONAL ANALIS</div><h3>Kapasitas Peninjauan Harian</h3></div><button type="button" class="chip sm-chip" id="home-cap-btn">' + icon('sliders') + 'Atur kuota</button></div>' +
        '<p class="hint">Alokasi kuota pemeriksaan kasus baru per hari kerja agar analis meninjau bukti secara menyeluruh.</p>' +
        '<div class="cap-meter-wrap">' +
          '<div class="cap-meter-header"><span>Alokasi Hari Ini: <b>' + today + ' dari ' + K + ' kasus</b></span><span class="cap-status-pill ' + (today >= K ? 'full' : 'ok') + '">' + capStatus + '</span></div>' +
          '<div class="cap-meter-bar"><div class="cap-meter-fill" style="width:' + capPercent + '%"></div></div>' +
          '<div class="cap-meter-sub"><span><b>' + today + '</b> dijadwalkan hari ini</span><span>&bull;</span><span><b>' + Math.max(0, q.length - today) + '</b> menunggu di antrean</span></div>' +
        '</div>' +
        '<a class="btn sec" href="#/antrean">Buka Antrean Pemeriksaan <span class="arr">' + icon('arrow') + '</span></a>' +
      '</div>' : '';

    var top = q.slice(0, 3).map(function (x) { return A.itemRow(x.m); }).join('') || '<div class="empty">Tidak ada merchant Oranye yang menunggu.</div>';
    var topList = isPJP() ?
      '<div class="sec-title"><h2>Peringkat Prioritas Teratas</h2><a href="#/antrean">Lihat semua (' + q.length + ')</a></div><div class="list">' + top + '</div>' : '';

    var ppatkList = (u.role === 'ppatk') ?
      '<div class="sec-title"><h2>Tentang LTKM</h2></div>' + A.ltkmInfo(false) +
      '<div class="sec-title"><h2>LTKM dari PJP</h2><a href="#/ltkm">Lihat semua</a></div><div class="list">' + cs.filter(function (c) { return c.status === 'Diteruskan'; }).map(A.caseRow).join('') + '</div>' : '';

    var biSection = (u.role === 'bi') ?
      '<div class="sec-title"><h2>Pengawasan Sistem Pembayaran</h2><a href="#/pengawasan">Buka</a></div><div class="card"><h3>Kinerja PJP dan Statistik Nasional</h3><p class="hint">Memantau kepatuhan SLA penundaan 5 hari kerja, rasio koreksi UMKM, dan statistik LTKM nasional PPATK.</p><a class="btn sec mt12" href="#/pengawasan">Buka Dashboard Pengawasan</a></div>' : '';

    var statsGrid =
      '<div class="sec-title"><h2>Data Resmi PPATK, BI &amp; BPS</h2><a href="#/bukti">Pusat bukti</a></div>' +
      '<div class="grid2">' +
        A.stat('Frekuensi deposit judi via QRIS, Sem I 2026', cu(87.66, 2, '', '%'), 'resmi', 'PPATK, Agustus 2026') +
        A.stat('Rata-rata satu deposit melalui QRIS', cu(Math.round(H.deposit.rata2_qris_rp), 0, 'Rp'), 'hitungan', 'Laporan Sem I 2026 PPATK') +
        A.stat('Populasi Merchant QRIS, Juni 2026', cu(H.qris.merchant_juta, 2, '', ' juta'), 'resmi', 'BI, 96,68% UMKM') +
        A.stat('Laporan indikasi Perjudian, Jan–Sep 2026', cu((1 - H.m2.jan_sep_2026 / H.m2.jan_sep_2025) * 100, 1, '-', '%'), 'hitungan', 'Buletin APUPPT Sep 2026') +
      '</div>';

    var body = hero + actionSection + quickTiles + sigRadar + sebaranCard + capCard + topList + ppatkList + biSection + statsGrid;
    shell('TAPIS', esc(u.unit), body, { nav: 'beranda' });

    var capBtn = A.app.querySelector('#home-cap-btn');
    if (capBtn) capBtn.onclick = function () { A.openCapModal(viewBeranda); };
  }

  // ---------- Menu & Akun (dengan Kartu "Ganti Peran Demo" seperti Pilahin) ----------
  function roleSwitcherCard() {
    var u = me();
    var roles = [
      { email: 'rani@arunika.demo', label: 'Analis PJP', sub: 'Verifikasi', ic: 'search' },
      { email: 'dimas@arunika.demo', label: 'Pejabat 1', sub: 'Otorisasi 1', ic: 'shield' },
      { email: 'hana@arunika.demo', label: 'Pejabat 2', sub: 'Otorisasi 2', ic: 'check' },
      { email: 'laras@bi.demo', label: 'Pengawas BI', sub: 'Supervisi', ic: 'scale' },
      { email: 'yoga@ppatk.demo', label: 'PPATK', sub: 'LTKM', ic: 'file' }
    ];
    return '<div class="card role-demo-card">' +
      '<div class="rd-head">' +
        '<span class="rd-ic">' + icon('swap') + '</span>' +
        '<div><b>Ganti peran demo</b><span>Lihat alur yang sama dari sisi peran instansi lain secara langsung.</span></div>' +
      '</div>' +
      '<div class="rd-grid">' +
        roles.map(function (r) {
          var on = u.email === r.email;
          return '<button type="button" class="rd-tile ' + (on ? 'on' : '') + '" data-sw="' + r.email + '">' +
            '<i>' + icon(r.ic) + '</i>' +
            '<b>' + r.label + '</b>' +
            '<span>' + r.sub + '</span>' +
          '</button>';
        }).join('') +
      '</div>' +
    '</div>';
  }

  function viewMenu() {
    var u = me(), ROLES = A.ROLES, q = A.antrean();
    var openCases = S.cases.filter(function (c) { return A.ACTIVE.indexOf(c.status) >= 0; }).length;
    var body =
      '<div class="profile">' +
        A.avatar(u) +
        '<div style="position:relative;z-index:1;min-width:0;flex:1">' +
          '<b>' + esc(u.nama) + '</b>' +
          '<div class="small" style="margin-top:2px;opacity:.85">' + esc(u.email) + '</div>' +
          '<div class="prof-pills">' +
            '<span class="role-pill">' + esc(ROLES[u.role].short) + '</span>' +
            '<span class="prof-pill">' + esc(ROLES[u.role].inst) + '</span>' +
            '<span class="prof-pill num">' + esc(u.nip) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      roleSwitcherCard() +
      '<div class="list menu">' +
        A.menuLink('#/bukti/klaster', 'map', 'Peta & Klaster 514 Wilayah', 'Peta interaktif 38 provinsi & 514 kab/kota (Ward CLR)', '514') +
        A.menuLink('#/simulator/risiko', 'sliders', 'Simulasi Risiko & Level', 'Kalkulasi PPV Teorema Bayes & uji aturan 4 level') +
        A.menuLink('#/jejaring/' + (q.length ? q[0].m.id : 'M081'), 'net', 'Jejaring Pembayar', 'Graf konektivitas merchant & pembayar lintas toko') +
        (isPJP() ? A.menuLink('#/antrean', 'queue', 'Antrean Verifikasi', 'Peringkat prioritas & kuota kapasitas harian', q.length) : A.menuLink('#/pengawasan', 'shield', 'Pengawasan Sistem Pembayaran', 'Kepatuhan SLA PJP & statistik LTKM nasional')) +
        A.menuLink('#/kasus', 'folder', 'Manajemen Kasus & Audit', 'Bukti multi-sumber, otorisasi 2 pejabat & draf LTKM', openCases) +
        A.menuLink('#/data', 'download', 'Data & Ekspor CSV', '100 merchant, ledger 14 hari & deret 56 hari') +
      '</div>' +
      '<div class="sec-title"><h2>Metodologi &amp; Tata Kelola</h2></div>' +
      '<div class="list menu">' +
        A.menuLink('#/panduan', 'book', 'Cara TAPIS Menilai', 'Arsitektur 4 lapis, rumus Robust Z/CUSUM & dasar hukum') +
        A.menuLink('#/tentang', 'info', 'Tentang Sumber Data', 'Klasifikasi angka Resmi, Hitungan, Asumsi & Terkalibrasi') +
        A.menuLink('#/akun', 'id', 'Detail Akun & Reset Data', 'Hak akses peran & kembalikan simulasi ke awal') +
      '</div>' +
      '<button type="button" class="btn sec mt12" id="out">' + icon('logout') + 'Keluar dari Sesi</button>';

    shell('Akun & Menu', esc(u.unit), body, { nav: 'menu' });
    A.app.querySelector('#out').onclick = function () { S.session = null; save('session', null); location.hash = '#/masuk'; };
    A.app.querySelectorAll('[data-sw]').forEach(function (b) {
      b.onclick = function () { A.switchUser(b.dataset.sw, '#/menu'); };
    });
  }

  function viewAkun() {
    var u = me(), ROLES = A.ROLES;
    var body =
      roleSwitcherCard() +
      '<div class="card"><h3>Identitas Petugas Aktif</h3><dl class="kv mt8"><dt>Nama</dt><dd>' + esc(u.nama) + '</dd><dt>Peran</dt><dd>' + esc(ROLES[u.role].nama) + '</dd><dt>Unit Kerja</dt><dd>' + esc(u.unit) + '</dd><dt>NIP</dt><dd class="num">' + esc(u.nip) + '</dd><dt>Email</dt><dd class="num">' + esc(u.email) + '</dd></dl></div>' +
      '<div class="card"><h3>Kewenangan dalam Alur Kasus</h3><p class="small">' + ({ pjp_analis: 'Membuka berkas kasus dari antrean Oranye, mencatat bukti kunjungan/dokumen, meminta klarifikasi merchant, mengajukan penundaan, serta menutup kasus yang terbukti wajar.', pjp_pejabat: 'Seluruh kewenangan analis ditambah persetujuan penundaan (wajib 2 pejabat kepatuhan berbeda), memutus keberatan merchant, mencabut pembatasan, dan mengirim LTKM ke PPATK.', bi: 'Mengawasi indikator kepatuhan PJP, SLA penundaan 5 hari kerja, rasio koreksi UMKM, dan pusat bukti nasional.', ppatk: 'Menerima dan menelaah LTKM yang diteruskan PJP beserta bukti pemeriksaan.' })[u.role] + '</p>' +
      '<p class="warnnote">Penyimpanan sesi di peramban ini (localStorage) ditujukan untuk demonstrasi alur kerja multi-peran secara langsung.</p></div>' +
      '<button type="button" class="btn sec" id="rs">' + icon('reset') + 'Kembalikan Data ke Keadaan Awal</button><p class="small muted mt8">Menghapus berkas kasus tambahan dan mengembalikan kuota kapasitas ke pengaturan awal.</p>';
    shell('Detail Akun', esc(u.unit), body, { back: true, nav: 'menu' });
    A.app.querySelector('#rs').onclick = function () { A.resetAll(); location.hash = '#/beranda'; location.reload(); };
    A.app.querySelectorAll('[data-sw]').forEach(function (b) {
      b.onclick = function () { A.switchUser(b.dataset.sw, '#/akun'); };
    });
  }

  function viewPanduan() {
    var W = T.CONFIG.W;
    var lv = [
      ['hijau', 'Tidak ada kelompok sinyal kuat. Sinyal lemah (jam malam, nominal seragam, lonjakan sesaat) tidak mengubah level.', 'Tidak ada tindakan pembatasan.'],
      ['kuning', 'Tepat satu kelompok sinyal kuat (J, P, atau K) aktif.', 'Dipantau otomatis di latar belakang; merchant tidak dibatasi.'],
      ['oranye', 'Minimal dua dari tiga kelompok sinyal kuat aktif bersamaan.', 'Masuk antrean verifikasi sesuai skor prioritas dan kapasitas analis.'],
      ['merah', 'Tidak pernah otomatis. Hanya setelah verifikasi manusia, bukti memadai, dan persetujuan dua pejabat berbeda.', 'Penundaan paling lama 5 hari kerja (UU 8/2010 Pasal 26), berita acara, dan hak keberatan (Pasal 67).']
    ];
    var body =
      A.ltkmInfo(true) +
      '<div class="card"><div class="card-tag">ARSITEKTUR KEPUTUSAN</div><h3>Empat Lapisan Terpisah</h3><ol class="small" style="padding-left:18px;margin:8px 0;line-height:1.6"><li><b>Sinyal (J, P, K)</b>: Diekstraksi secara objektif dari data transaksi &amp; konteks wilayah.</li><li><b>Skor Prioritas (0–100)</b>: Peringkat untuk mengurutkan antrean kerja analis, bukan peluang bersalah.</li><li><b>Level Penapisan</b>: Hijau, Kuning, Oranye berdasarkan konvergensi minimal 2 kelompok sinyal.</li><li><b>Keputusan Pemeriksaan</b>: Hanya oleh manusia melalui bukti lapangan/dokumen &amp; otorisasi 2 pejabat.</li></ol></div>' +
      '<div class="card"><div class="card-tag">TAKSONOMI LEVEL</div><h3>Empat Level Penapisan</h3>' + lv.map(function (l) { return '<div class="reason"><div>' + level(l[0], true) + '<p class="mt8"><b>Syarat:</b> ' + l[1] + '</p><p><b>Tindakan:</b> ' + l[2] + '</p></div></div>'; }).join('') + '</div>' +
      '<div class="card"><div class="card-tag">METODOLOGI STATISTIK</div><h3>Tiga Pilar Sinyal Kuat</h3><div class="reason"><span class="ic on">J</span><div><b>Jejaring Pembayar</b><p>Proporsi pembayar lintas merchant (derajat &ge;3), tautan antar-merchant (&ge;6 pembayar sama), ukuran komponen graf, serta fan-in/fan-out. Bila ID pembayar &lt;70%, dicatat sebagai "Data Tidak Memadai".</p></div></div><div class="reason"><span class="ic on">P</span><div><b>Perilaku Relatif Sebaya 3-Lapis</b><p>Membandingkan merchant pada <b>Klaster Ekonomi Wilayah &rarr; Kategori MCC &rarr; Skala Usaha</b> menggunakan Robust Z (Iglewicz &amp; Hoaglin, 1993) dan CUSUM Atas (Page, 1954; k = ' + T.CONFIG.cusum.k + ', h = ' + T.CONFIG.cusum.h + ').</p></div></div><div class="reason"><span class="ic on">K</span><div><b>Profil &amp; Konteks Wilayah</b><p>Umur merchant (&lt;60 hari dengan volume &gt;3x P90 sebaya), deviasi nominal tiket rata-rata, dan kecocokan daftar rujukan.</p></div></div>' +
      '<p class="note">Skor prioritas = 100 &times; &Sigma;(bobot &times; persentil). Bobot: Jejaring (' + W.jaringan + '), Sebaya (' + W.sebaya + '), Perubahan (' + W.perubahan + '), Profil (' + W.profil + '), Daftar (' + W.daftar + ').</p></div>' +
      '<div class="card"><div class="card-tag">KEPATUHAN HUKUM</div><h3>Landasan Regulasi</h3><table class="mini mt8"><tbody><tr><td>Pemantauan merchant oleh PJP</td><td>PBI 10/2024 Ps. 16 &amp; 29; PADG 15/2025 Ps. 14</td></tr><tr><td>Batas lapor LTKM (Maks. 3 HK)</td><td>UU 8/2010 Pasal 25 ayat (1)</td></tr><tr><td>Penundaan transaksi (Maks. 5 HK)</td><td>UU 8/2010 Pasal 26; PBI 10/2024 Ps. 37</td></tr><tr><td>Penghentian sementara PPATK</td><td>UU 8/2010 Pasal 44 ayat (1) huruf i, Ps. 65–66</td></tr><tr><td>Hak keberatan merchant</td><td>UU 8/2010 Pasal 67</td></tr><tr><td>Teknologi pengawasan (SupTech)</td><td>PADG 15/2025 Pasal 24</td></tr></tbody></table></div>';
    shell('Cara TAPIS Menilai', 'Metodologi statistik dan landasan hukum', body, { back: true, nav: 'menu' });
  }

  function viewTentang() {
    var body =
      '<div class="card"><div class="card-tag">PROVENANS DATA</div><h3>Empat Klasifikasi Angka</h3><div class="reason"><span>' + badge('resmi') + '</span><div><p>Dikutip langsung dari publikasi resmi PPATK, Bank Indonesia, dan BPS.</p></div></div><div class="reason"><span>' + badge('hitungan') + '</span><div><p>Dihasilkan melalui komputasi ekonometrika pada notebook riset (Kitagawa, Mann-Kendall TFPW, Andrews sup-F, Ward CLR K=4).</p></div></div><div class="reason"><span>' + badge('asumsi') + '</span><div><p>Parameter skenario yang dapat diuji sensitivitasnya (sensitivitas 80%, bobot skor, k/h CUSUM, kuota analis).</p></div></div><div class="reason"><span>' + badge('demo') + '</span><div><p>Populasi mikro 100 merchant, ledger transaksi 14 hari, dan berkas kasus yang dibangkitkan dengan bibit deterministik untuk peragaan alur verifikasi tanpa melanggar privasi data nyata.</p></div></div></div>' +
      '<div class="card"><div class="card-tag">REFERENSI RESMI</div><h3>Sumber Data Publikasi</h3><ul class="small" style="padding-left:18px;margin:6px 0;line-height:1.6"><li><b>PPATK:</b> Buletin Statistik APUPPT Juni 2025, Oktober 2025, &amp; September 2026 (Tabel 2 &amp; Tabel 5); Laporan Semester I 2026; Siaran Pers B/04/HM.05/3.1/VIII/2026.</li><li><b>Bank Indonesia:</b> Siaran Pers No. 28/159/DKom (Statistik QRIS Nasional).</li><li><b>BPS:</b> PDRB 17 Lapangan Usaha 514 Kabupaten/Kota &amp; PDRB per Kapita 38 Provinsi.</li><li><b>Regulasi:</b> UU No. 8 Tahun 2010; PBI No. 10 Tahun 2024; PADG No. 15 Tahun 2025.</li></ul></div>';
    shell('Tentang Sumber Data', 'Transparansi dan integritas akademik data', body, { back: true, nav: 'menu' });
  }

  A.viewBeranda = viewBeranda;
  A.viewMenu = viewMenu;
  A.viewAkun = viewAkun;
  A.viewPanduan = viewPanduan;
  A.viewTentang = viewTentang;
})();
