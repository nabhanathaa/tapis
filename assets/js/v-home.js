/* TAPIS: layar masuk/daftar, beranda mobile fintech (Pilahin-style), akun & ganti peran demo, panduan metodologi, dan tentang data. */
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

  // ---------- Masuk dan Daftar (Didalam Bingkai HP) ----------
  function viewAuth(mode) {
    var reg = mode === 'daftar', app = A.app, users = S.users;
    var DEMO_USERS = A.DEMO_USERS, ROLES = A.ROLES, initials = A.initials;
    var demo = DEMO_USERS.map(function (u) {
      return '<button type="button" class="role-tile" data-demo="' + u.email + '">' +
        '<div class="rt-icon" style="background:' + u.c + ';font-weight:800;font-size:13px">' + initials(u.nama) + '</div>' +
        '<b>' + esc(u.nama.split(' ')[0]) + '</b>' +
        '<small>' + esc(ROLES[u.role].short) + '</small>' +
      '</button>';
    }).join('');

    app.innerHTML =
      A.statusBarHtml() +
      '<main class="page anim" style="padding-top:16px">' +
        '<div class="hello" style="margin-bottom:12px">' +
          '<div class="hello-eyebrow">SISTEM PENAPISAN RISIKO QRIS &middot; BANK INDONESIA</div>' +
          '<div class="hello-big" style="font-size:24px;margin:6px 0">TAPIS Mobile</div>' +
          '<p style="margin:0;font-size:12px;color:rgba(226,232,240,0.9)">Memutus deposit judi daring tanpa menjerat 44,86 juta UMKM ekosistem QRIS.</p>' +
        '</div>' +
        '<div class="card role-demo-card">' +
          '<div class="rd-head">' +
            '<span class="rd-ic">' + icon('swap') + '</span>' +
            '<div><b>Masuk cepat akun demo</b><p>Pilih salah satu dari 5 peran instansi untuk langsung membuka beranda.</p></div>' +
          '</div>' +
          '<div class="role-tiles-grid">' + demo + '</div>' +
        '</div>' +
        '<div class="card">' +
          '<div class="tabs">' +
            '<button type="button" class="' + (reg ? '' : 'on') + '" data-go="masuk">Masuk</button>' +
            '<button type="button" class="' + (reg ? 'on' : '') + '" data-go="daftar">Daftar Petugas</button>' +
          '</div>' +
          '<div id="err"></div>' +
          (reg ?
            '<form id="f-reg">' +
              '<div class="field"><label>Nama Lengkap</label><input name="nama" required placeholder="Sesuai kartu pegawai"></div>' +
              '<div class="field"><label>Instansi</label><select name="inst"><option value="pjp">PJP Pengakuisisi</option><option value="bi">Bank Indonesia</option><option value="ppatk">PPATK</option></select></div>' +
              '<div class="field"><label>Jabatan</label><select name="jabatan"><option value="pjp_analis">Analis Pemantauan Merchant</option><option value="pjp_pejabat">Pejabat Kepatuhan APU-PPT</option></select></div>' +
              '<div class="field"><label>Satuan Kerja / Nama PJP</label><input name="org" required value="PJP Arunika"></div>' +
              '<div class="field"><label>NIP</label><input name="nip" required placeholder="Nomor induk pegawai"></div>' +
              '<div class="field"><label>Email Dinas</label><input name="email" type="email" required placeholder="nama@instansi.go.id"></div>' +
              '<div class="field"><label>Kata Sandi</label><input name="pass" type="password" required minlength="8" placeholder="Minimal 8 karakter"></div>' +
              '<button class="btn block mt12" type="submit">Buat Akun &amp; Masuk</button>' +
            '</form>' :
            '<form id="f-login">' +
              '<div class="field"><label>Email Dinas</label><input name="email" type="email" required value="rani@arunika.demo"></div>' +
              '<div class="field"><label>Kata Sandi</label><input name="pass" type="password" required value="demo1234"></div>' +
              '<button class="btn block mt12" type="submit">Masuk ke Beranda ' + icon('arrow') + '</button>' +
            '</form>') +
        '</div>' +
      '</main>';

    app.querySelectorAll('[data-go]').forEach(function (b) { b.onclick = function () { location.hash = '#/' + b.dataset.go; }; });
    app.querySelectorAll('[data-demo]').forEach(function (b) { b.onclick = function () { login(b.dataset.demo); }; });
    var fl = app.querySelector('#f-login');
    if (fl) fl.onsubmit = function (e) {
      e.preventDefault();
      var em = this.email.value.trim().toLowerCase(), pw = this.pass.value;
      var u = users.filter(function (x) { return x.email === em; })[0];
      if (!u || u.pass !== hash(pw)) {
        app.querySelector('#err').innerHTML = '<div class="warnnote mb12">Email dinas atau kata sandi tidak cocok.</div>';
        return;
      }
      login(u.email);
    };
    var fr = app.querySelector('#f-reg');
    if (fr) fr.onsubmit = function (e) {
      e.preventDefault();
      var em = fr.email.value.trim().toLowerCase();
      var role = fr.inst.value === 'pjp' ? fr.jabatan.value : fr.inst.value;
      var u = { email: em, nama: fr.nama.value.trim(), role: role, unit: fr.org.value.trim(), nip: fr.nip.value.trim(), pass: hash(fr.pass.value), c: '#1D5BD8' };
      users.push(u); save('users', users); login(em);
    };
  }
  A.viewAuth = viewAuth;

  // ---------- Donut SVG untuk Sebaran 4-Level ----------
  function donut(cnt, tot) {
    var off = 0, L = ['hijau', 'kuning', 'oranye', 'merah'];
    var COL = { hijau: '#0D9488', kuning: '#D97706', oranye: '#EA580C', merah: '#DC2626' };
    var sg = L.map(function (l) {
      var p = cnt[l] / tot * 100, g = p > 0 ? Math.max(0.5, p - 1) : 0;
      var c = p > 0 ? '<circle r="15.9155" cx="21" cy="21" fill="none" stroke="' + COL[l] + '" stroke-width="5.2" stroke-dasharray="' + g.toFixed(2) + ' ' + (100 - g).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '"/>' : '';
      off += p;
      return c;
    }).join('');
    var lst = L.map(function (l) {
      return '<div class="dl-row"><span><i style="background:' + COL[l] + '"></i>' + U.LV[l] + '</span><b class="num">' + cnt[l] + ' (' + idn(cnt[l] / tot * 100, 0) + '%)</b></div>';
    }).join('');
    return '<div class="donut-wrap">' +
      '<svg class="donut-svg" viewBox="0 0 42 42">' +
        '<circle r="15.9155" cx="21" cy="21" fill="none" stroke="#E2E8F0" stroke-width="5.2"/>' +
        sg +
        '<text x="21" y="20" text-anchor="middle" font-size="7.5" font-weight="800" fill="#081E46" font-family="JetBrains Mono,monospace">' + tot + '</text>' +
        '<text x="21" y="25.5" text-anchor="middle" font-size="3.8" font-weight="700" fill="#64748B">MERCHANT</text>' +
      '</svg>' +
      '<div class="donut-leg">' + lst + '</div>' +
    '</div>';
  }
  A.donut = donut;

  // ---------- Beranda Mobile Fintech (Persis Struktur Pilahin) ----------
  function viewBeranda() {
    var u = me(), cnt = { hijau: 0, kuning: 0, oranye: 0, merah: 0 }, cs = S.cases;
    T.merchants.forEach(function (m) { cnt[A.effLevel(m)]++; });
    var open = cs.filter(function (c) { return A.ACTIVE.indexOf(c.status) >= 0; });
    var cleared = cs.filter(function (c) { return c.status === 'Tidak terbukti'; }).length;
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

    var pctH = Math.round(cnt.hijau / T.merchants.length * 100);
    var pctK = Math.round(cnt.kuning / T.merchants.length * 100);
    var pctO = Math.round(cnt.oranye / T.merchants.length * 100);
    var pctM = Math.round(cnt.merah / T.merchants.length * 100);

    // 1. Strip Info Demo (seperti strip kuning di Pilahin)
    var demoBanner =
      '<div class="demo-strip">' +
        icon('info') +
        '<div><b>DATA RESMI &amp; SIMULASI.</b> Angka makro dari BI, PPATK &amp; BPS; 100 merchant mikro terkalibrasi. <a href="#/menu">Ganti peran di Akun</a>.</div>' +
      '</div>';

    // 2. Hero Card (seperti kartu hijau "SETORAN HARI INI" di Pilahin, bertema Navy-Blue-Gold BI)
    var heroEyebrow = isPJP() ? 'ANTREAN VERIFIKASI HARI INI &middot; PJP ARUNIKA' :
      (u.role === 'bi' ? 'SUPERVISI SISTEM PEMBAYARAN &middot; BANK INDONESIA' : 'INTELIJEN KEUANGAN &middot; PPATK');
    var heroBigVal = isPJP() ? (cu(q.length) + ' <span>merchant</span>') :
      (u.role === 'bi' ? (cu(H.qris.merchant_juta, 2) + ' <span>juta UMKM QRIS</span>') : (cu(cs.filter(function (c) { return c.status === 'Diteruskan'; }).length) + ' <span>LTKM masuk</span>'));
    var ctaHref = isPJP() ? '#/antrean' : (u.role === 'bi' ? '#/pengawasan' : '#/ltkm');
    var ctaText = isPJP() ? 'Mulai verifikasi antrean' : (u.role === 'bi' ? 'Buka pengawasan PJP' : 'Tinjau laporan LTKM');

    var heroCard =
      '<div class="hello">' +
        '<div class="hello-eyebrow">' + heroEyebrow + '</div>' +
        '<div class="hello-big num">' + heroBigVal + '</div>' +
        '<div class="hello-kpis">' +
          '<div class="hk-box"><span>KUOTA HARI INI</span><b class="num">' + today + '/' + K + '</b></div>' +
          '<div class="hk-box"><span>KASUS AKTIF</span><b class="num">' + open.length + ' berkas</b></div>' +
          '<div class="hk-box"><span>UMKM PULIH</span><b class="num">' + cleared + ' toko</b></div>' +
        '</div>' +
        '<a class="hello-cta" href="' + ctaHref + '">' +
          icon('scale') +
          '<span>' + ctaText + ' &rarr;</span>' +
        '</a>' +
      '</div>';

    // 3. "Perlu tindakan" Cards (persis seperti kartu putih beraksen kiri di Pilahin)
    var actionsHtml =
      '<div class="sec-head"><h3>Perlu tindakan</h3><a class="small font-bold" href="#/kasus">Semua kasus</a></div>' +
      '<div class="action-stack">' +
        (kebCases.length ?
          '<a class="act-card act-blue" href="#/kasus/' + kebCases[0].id + '">' +
            '<div class="act-ic">' + icon('file') + '</div>' +
            '<div class="act-body">' +
              '<b>' + kebCases.length + ' pengajuan keberatan merchant baru</b>' +
              '<span>Tinjau lampiran NIB &amp; nota stok agar UMKM mendapat kepastian</span>' +
            '</div>' +
            icon('chev', 'act-chev') +
          '</a>' : '') +
        (minBat !== null ?
          '<a class="act-card act-gold" href="#/kasus/' + batCases[0].id + '">' +
            '<div class="act-ic">' + icon('clock') + '</div>' +
            '<div class="act-body">' +
              '<b>' + batCases.length + ' penundaan aktif (' + minBat + ' hari kerja tersisa)</b>' +
              '<span>Setujui pencabutan atau teruskan LTKM sesuai SLA UU 8/2010 Ps. 26</span>' +
            '</div>' +
            icon('chev', 'act-chev') +
          '</a>' : '') +
        (q.length ?
          '<a class="act-card act-orange" href="#/merchant/' + q[0].m.id + '">' +
            '<div class="act-ic">' + icon('queue') + '</div>' +
            '<div class="act-body">' +
              '<b>Prioritas #1: ' + esc(q[0].m.nama) + ' (Skor ' + q[0].m.score + ')</b>' +
              '<span>' + esc(q[0].m.kota) + ' &middot; Konvergensi ' + q[0].m.nGroups + ' dari 3 pilar sinyal kuat</span>' +
            '</div>' +
            icon('chev', 'act-chev') +
          '</a>' : '') +
      '</div>';

    // 4. 4 Quick Action Icon Tiles (persis seperti 4 tombol kotak di bawah "Perlu tindakan" pada Pilahin)
    var quickTiles =
      '<div class="quick-tiles-4">' +
        '<a class="qtile" href="#/bukti/klaster">' +
          '<div class="qt-ic qt-blue"><span class="qt-badge">514</span>' + icon('map') + '</div>' +
          '<span>Peta Klaster</span>' +
        '</a>' +
        '<a class="qtile" href="#/jejaring/' + (q.length ? q[0].m.id : 'M081') + '">' +
          '<div class="qt-ic qt-purple"><span class="qt-badge">' + jCnt + '</span>' + icon('net') + '</div>' +
          '<span>Jejaring</span>' +
        '</a>' +
        '<a class="qtile" href="#/simulator/risiko">' +
          '<div class="qt-ic qt-gold">' + icon('sliders') + '</div>' +
          '<span>Simulasi</span>' +
        '</a>' +
        '<a class="qtile" href="#/menu">' +
          '<div class="qt-ic qt-emerald"><span class="qt-badge">5</span>' + icon('swap') + '</div>' +
          '<span>Ganti Peran</span>' +
        '</a>' +
      '</div>';

    // 5. Sebaran 4-Level & Perlindungan UMKM
    var sebaranCard =
      '<div class="card">' +
        '<div class="card-head-row"><div><span class="card-tag">PROPORSI POPULASI TERKALIBRASI</span><h3>Komposisi 4-Level Merchant</h3></div>' + badge('demo') + '</div>' +
        '<div class="segbar mt8">' +
          '<i style="width:' + pctH + '%;background:#0D9488"></i>' +
          '<i style="width:' + pctK + '%;background:#D97706"></i>' +
          '<i style="width:' + pctO + '%;background:#EA580C"></i>' +
          '<i style="width:' + Math.max(2, pctM) + '%;background:#DC2626"></i>' +
        '</div>' +
        '<div class="mt12">' + donut(cnt, T.merchants.length) + '</div>' +
        '<div class="umkm-protect-box mt12">' +
          icon('shield') +
          '<div><b>Garansi Perlindungan UMKM:</b> Angkringan malam, konter pulsa seragam, dan lonjakan acara lokal dijamin tetap <b>Hijau</b> (sinyal lemah bukan bukti).</div>' +
        '</div>' +
      '</div>';

    // 6. Tiga Pilar Sinyal (J, P, K)
    var pilarCard =
      '<div class="card">' +
        '<div class="card-head-row"><div><span class="card-tag">KONVERGENSI MINIMAL 2 DARI 3 PILAR</span><h3>Deteksi Sinyal Kuat (J &middot; P &middot; K)</h3></div>' + badge('hitungan') + '</div>' +
        '<div class="pilar-mini-grid mt8">' +
          '<div class="pm-card"><div class="pm-top"><span class="pm-badge j">Pilar J &middot; Jejaring</span><b class="num">' + jCnt + ' toko</b></div><b>Konektivitas Pembayar Lintas Merchant</b><p>Irisan pembayar bersama (&ge;25% derajat 3+) &amp; ukuran komponen graf.</p></div>' +
          '<div class="pm-card"><div class="pm-top"><span class="pm-badge p">Pilar P &middot; Sebaya</span><b class="num">' + pCnt + ' toko</b></div><b>Deviasi Perilaku Sebaya 3-Lapis &amp; CUSUM</b><p>Robust Z terhadap Klaster PDRB Wilayah &rarr; Kategori MCC &rarr; Skala Usaha.</p></div>' +
          '<div class="pm-card"><div class="pm-top"><span class="pm-badge k">Pilar K &middot; Konteks</span><b class="num">' + kCnt + ' toko</b></div><b>Profil Usaha, Umur &amp; Daftar Rujukan</b><p>Merchant baru (&lt;60 hari) melonjak &gt;3x P90, anomali tiket, atau cocok rujukan.</p></div>' +
        '</div>' +
      '</div>';

    // 7. Data Makro Resmi BI, PPATK & BPS
    var macroGrid =
      '<div class="sec-head"><h3>Bukti Empiris Nasional</h3><a class="small font-bold" href="#/bukti">Pusat bukti &rarr;</a></div>' +
      '<div class="grid2">' +
        A.stat('Pangsa Frek. Deposit QRIS', cu(87.66, 2, '', '%'), 'resmi', 'PPATK Sem I 2026 (198,8 jt trx)') +
        A.stat('Rata-rata Deposit QRIS', cu(Math.round(H.deposit.rata2_qris_rp), 0, 'Rp'), 'hitungan', 'Di bawah rata-rata QRIS (Rp89rb)') +
        A.stat('Populasi Merchant QRIS', cu(H.qris.merchant_juta, 2, '', ' Jt'), 'resmi', 'Bank Indonesia (96,68% UMKM)') +
        A.stat('Klaster Wilayah PDRB', '514 Wilayah', 'hitungan', '17 Sektor BPS · Hopkins 0,8087') +
      '</div>';

    var body = demoBanner + heroCard + actionsHtml + quickTiles + sebaranCard + pilarCard + macroGrid;
    shell('Beranda', esc(u.unit), body, { nav: 'beranda' });
  }

  // ---------- Halaman Akun & Ganti Peran Demo (Persis Pilahin) ----------
  function roleSwitcherCard(targetHash) {
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
        '<div><b>Ganti peran demo</b><p>Lihat alur yang sama dari sisi peran lain. Ketuk salah satu peran di bawah untuk berpindah secara langsung.</p></div>' +
      '</div>' +
      '<div class="role-tiles-grid">' +
        roles.map(function (r) {
          var on = u.email === r.email;
          return '<button type="button" class="role-tile ' + (on ? 'active' : '') + '" data-sw="' + r.email + '" data-th="' + (targetHash || '#/menu') + '">' +
            '<div class="rt-icon">' + icon(r.ic) + '</div>' +
            '<b>' + r.label + '</b>' +
            '<small>' + r.sub + '</small>' +
          '</button>';
        }).join('') +
      '</div>' +
    '</div>';
  }

  function viewMenu() {
    var u = me(), ROLES = A.ROLES, q = A.antrean();
    var openCases = S.cases.filter(function (c) { return A.ACTIVE.indexOf(c.status) >= 0; }).length;
    var body =
      '<div class="akun-hero-card">' +
        '<div class="ah-top">' +
          '<div class="ah-av">' + esc(A.initials(u.nama)) + '</div>' +
          '<div class="ah-info">' +
            '<h2>' + esc(u.nama) + '</h2>' +
            '<p>' + esc(u.email) + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="ah-pills">' +
          '<span class="ah-pill primary">' + esc(ROLES[u.role].short) + '</span>' +
          '<span class="ah-pill">' + esc(ROLES[u.role].inst) + '</span>' +
          '<span class="ah-pill">Akun demo</span>' +
        '</div>' +
      '</div>' +

      roleSwitcherCard('#/menu') +

      '<div class="menu-group-card">' +
        A.menuLink('#/kasus', 'bell', 'Berkas Kasus & Notifikasi', 'Otorisasi 2 pejabat, Berita Acara & LTKM', openCases, 'ic-red') +
        A.menuLink('#/bukti/klaster', 'map', 'Peta & Klaster 514 Wilayah', 'Peta interaktif 38 provinsi & 514 kab/kota (Ward CLR)', '514', 'ic-blue') +
        A.menuLink('#/simulator/risiko', 'sliders', 'Simulasi Risiko & Level UMKM', 'Kalkulasi PPV Teorema Bayes & uji aturan 4 level', '', 'ic-gold') +
        A.menuLink('#/jejaring/' + (q.length ? q[0].m.id : 'M081'), 'net', 'Graf Jejaring Pembayar', 'Topologi konektivitas pembayar lintas toko', '', 'ic-purple') +
        A.menuLink('#/data', 'download', 'Basis Data & Ekspor CSV', '100 merchant, ledger 14 hari & deret 56 hari', '', 'ic-emerald') +
      '</div>' +

      '<div class="menu-group-card">' +
        A.menuLink('#/panduan', 'book', 'Cara TAPIS Menilai & Regulasi', 'Arsitektur 4 lapis, rumus Robust Z/CUSUM & UU 8/2010', '', 'ic-blue') +
        A.menuLink('#/tentang', 'info', 'Tentang Sumber Data', 'Klasifikasi angka Resmi, Hitungan, Asumsi & Simulasi', '', 'ic-slate') +
        A.menuLink('#/akun', 'id', 'Detail Akun & Reset Simulasi', 'Hak akses peran & kembalikan data ke awal', '', 'ic-gold') +
      '</div>' +

      '<button type="button" class="btn sec block" id="out">' + icon('logout') + 'Buka Layar Masuk / Daftar Petugas</button>';

    shell('Akun', esc(u.unit), body, { nav: 'menu' });
    A.app.querySelector('#out').onclick = function () { S.session = null; save('session', null); location.hash = '#/masuk'; };
    A.app.querySelectorAll('[data-sw]').forEach(function (b) {
      b.onclick = function () { A.switchUser(b.dataset.sw, b.dataset.th); };
    });
  }

  function viewAkun() {
    var u = me(), ROLES = A.ROLES;
    var body =
      roleSwitcherCard('#/akun') +
      '<div class="card"><h3>Identitas Petugas Aktif</h3><dl class="kv mt8"><dt>Nama</dt><dd>' + esc(u.nama) + '</dd><dt>Peran</dt><dd>' + esc(ROLES[u.role].nama) + '</dd><dt>Unit Kerja</dt><dd>' + esc(u.unit) + '</dd><dt>NIP</dt><dd class="num">' + esc(u.nip) + '</dd><dt>Email</dt><dd class="num">' + esc(u.email) + '</dd></dl></div>' +
      '<div class="card"><h3>Kewenangan dalam Alur Kasus</h3><p class="small">' + ({ pjp_analis: 'Membuka berkas kasus dari antrean Oranye, mencatat bukti kunjungan/dokumen, meminta klarifikasi merchant, mengajukan penundaan, serta menutup kasus yang terbukti wajar.', pjp_pejabat: 'Seluruh kewenangan analis ditambah persetujuan penundaan (wajib 2 pejabat kepatuhan berbeda), memutus keberatan merchant, mencabut pembatasan, dan mengirim LTKM ke PPATK.', bi: 'Mengawasi indikator kepatuhan PJP, SLA penundaan 5 hari kerja, rasio koreksi UMKM, dan pusat bukti nasional.', ppatk: 'Menerima dan menelaah LTKM yang diteruskan PJP beserta bukti pemeriksaan.' })[u.role] + '</p></div>' +
      '<button type="button" class="btn sec block" id="rs">' + icon('reset') + 'Kembalikan Data ke Keadaan Awal</button>';
    shell('Detail Akun', esc(u.unit), body, { back: true, nav: 'menu' });
    A.app.querySelector('#rs').onclick = function () { A.resetAll(); location.hash = '#/beranda'; location.reload(); };
    A.app.querySelectorAll('[data-sw]').forEach(function (b) {
      b.onclick = function () { A.switchUser(b.dataset.sw, b.dataset.th); };
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
      '<p class="note mt8">Skor prioritas = 100 &times; &Sigma;(bobot &times; persentil). Bobot: Jejaring (' + W.jaringan + '), Sebaya (' + W.sebaya + '), Perubahan (' + W.perubahan + '), Profil (' + W.profil + '), Daftar (' + W.daftar + ').</p></div>';
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
