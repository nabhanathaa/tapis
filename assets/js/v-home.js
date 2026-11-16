/* TAPIS: portal autentikasi instansi, beranda eksekutif, menu navigasi, profil akun, metodologi & regulasi, transparansi data. */
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

  // ---------- Portal Masuk & Registrasi Petugas ----------
  function viewAuth(mode) {
    var reg = mode === 'daftar', app = A.app, users = S.users;
    app.innerHTML =
      '<div class="auth-portal">' +
        '<div class="auth-showcase">' +
          '<span class="orb o1"></span><span class="orb o2"></span>' +
          '<div class="as-inner">' +
            '<div class="as-brand">' +
              '<div class="logo-tile"><img src="assets/img/logo.png" alt="Logo TAPIS"></div>' +
              '<div>' +
                '<div class="as-tag">SISTEM SURVEILANS &amp; PRIORITISASI RISIKO QRIS</div>' +
                '<h1>TAPIS</h1>' +
              '</div>' +
            '</div>' +
            '<h2 class="as-headline">Menapis Transaksi Mencurigakan, Melindungi 44,86 Juta UMKM Ekosistem QRIS.</h2>' +
            '<p class="as-lead">Arsitektur penapisan berjenjang yang memisahkan <b>sinyal deteksi statistik</b> dari <b>keputusan pembatasan</b>. Dirancang untuk memutus aliran deposit judi daring tanpa menjerat usaha mikro yang jujur melalui pembanding berlapis 514 kabupaten/kota dan otorisasi dua pejabat.</p>' +
            '<div class="as-kpis">' +
              '<div class="as-kpi"><b>44,86 Juta</b><span>Merchant QRIS Nasional (96,68% UMKM)</span></div>' +
              '<div class="as-kpi"><b>3 Pilar (J·P·K)</b><span>Syarat Minimal 2 Kelompok Sinyal Kuat</span></div>' +
              '<div class="as-kpi"><b>514 Wilayah</b><span>Klaster PDRB 17 Sektor BPS (Ward CLR)</span></div>' +
              '<div class="as-kpi"><b>Dual-Control</b><span>Wajib Bukti Lapangan &amp; 2 Pejabat Kepatuhan</span></div>' +
            '</div>' +
            '<div class="as-pillars">' +
              '<div class="as-pillar"><i>' + icon('net') + '</i><div><b>Pemisahan Sinyal &amp; Sanksi</b><span>Jam malam, nominal seragam, dan lonjakan acara lokal tidak pernah menjadi alasan tunggal pembatasan.</span></div></div>' +
              '<div class="as-pillar"><i>' + icon('shield') + '</i><div><b>Kepatuhan Regulasi Terukur</b><span>Selaras dengan UU No. 8 Tahun 2010 (Pasal 25, 26, 67), PBI No. 10 Tahun 2024, dan PADG No. 15 Tahun 2025.</span></div></div>' +
              '<div class="as-pillar"><i>' + icon('chart') + '</i><div><b>Berpijak pada Bukti Empiris Resmi</b><span>Terintegrasi dengan publikasi resmi Bank Indonesia, PPATK, dan Badan Pusat Statistik (BPS).</span></div></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="auth-panel-wrap">' +
          '<div class="auth-panel">' +
            '<div class="ap-head">' +
              '<div class="card-tag">PORTAL OTORISASI PETUGAS</div>' +
              '<h2>' + (reg ? 'Registrasi Petugas Instansi' : 'Masuk ke Workspace TAPIS') + '</h2>' +
              '<p class="small muted">Gunakan kredensial dinas atau pilih salah satu peran instansi di bawah untuk menguji alur pengawasan secara menyeluruh.</p>' +
            '</div>' +
            '<div class="seg" data-on="' + (reg ? 1 : 0) + '"><i></i><button type="button" class="' + (reg ? '' : 'on') + '" data-go="masuk">Masuk Sistem</button><button type="button" class="' + (reg ? 'on' : '') + '" data-go="daftar">Registrasi Petugas</button></div>' +
            '<div id="err"></div>' +
            (reg ? regForm() : loginForm()) +
          '</div>' +
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
      app.querySelector('#forgot').onclick = function (e) { e.preventDefault(); toast('Hubungi administrator unit kerja APU-PPT untuk pengaturan ulang kredensial.'); };
      app.querySelector('#f-login').onsubmit = function (e) {
        e.preventDefault();
        var em = this.email.value.trim().toLowerCase(), pw = this.pass.value, btn = this.querySelector('button[type=submit]');
        var u = users.filter(function (x) { return x.email === em; })[0];
        if (!u || u.pass !== hash(pw)) { fail('Email dinas atau kata sandi tidak sesuai.'); return; }
        btn.classList.add('loading');
        setTimeout(function () { login(u.email); }, 300);
      };
      app.querySelectorAll('[data-demo]').forEach(function (b) { b.onclick = function () { login(b.dataset.demo); }; });
    } else {
      var f = app.querySelector('#f-reg'), inst = f.inst, jab = f.jabatan;
      function sync() {
        var p = inst.value === 'pjp';
        jab.closest('.field').style.display = p ? '' : 'none';
        f.org.closest('.field').querySelector('label').textContent = p ? 'Nama PJP Pengakuisisi' : 'Satuan Kerja / Direktorat';
        f.org.placeholder = p ? 'Contoh: PJP Arunika' : 'Contoh: Departemen Pengawasan Sistem Pembayaran';
      }
      inst.onchange = sync; sync();
      f.onsubmit = function (e) {
        e.preventDefault();
        var em = f.email.value.trim().toLowerCase();
        if (users.some(function (x) { return x.email === em; })) { fail('Email dinas ini sudah terdaftar.'); return; }
        if (f.pass.value.length < 8) { fail('Kata sandi minimal 8 karakter.'); return; }
        var role = inst.value === 'pjp' ? jab.value : inst.value;
        var u = { email: em, nama: f.nama.value.trim(), role: role, unit: f.org.value.trim(), nip: f.nip.value.trim(), pass: hash(f.pass.value), c: '#15459B' };
        users.push(u); save('users', users); toast('Akun petugas berhasil didaftarkan.'); login(em);
      };
    }
  }

  function fld(label, ic, input, extra) { return '<div class="field"><label>' + label + '</label><div class="inp">' + icon(ic) + input + (extra || '') + '</div></div>'; }
  var EYE = '<button type="button" class="eye" aria-label="Tampilkan kata sandi">' + icon('eye') + '</button>', DD = icon('chev', 'dd');

  function loginForm() {
    var DEMO_USERS = A.DEMO_USERS, ROLES = A.ROLES, initials = A.initials;
    var demo = DEMO_USERS.map(function (u) {
      var r = ROLES[u.role] || {};
      var desc = u.email === 'rani@arunika.demo' ? 'Analis PJP · Verifikasi & Bukti' :
        u.email === 'dimas@arunika.demo' ? 'Pejabat PJP 1 · Otorisasi Ke-1' :
        u.email === 'hana@arunika.demo' ? 'Pejabat PJP 2 · Otorisasi Ke-2' :
        u.email === 'laras@bi.demo' ? 'Bank Indonesia · Pengawasan SP' : 'PPATK · Analisis LTKM';
      return '<button type="button" data-demo="' + u.email + '">' +
        '<span class="av" style="background:' + u.c + '">' + initials(u.nama) + '</span>' +
        '<span><b>' + esc(u.nama) + '</b><span>' + esc(desc) + '</span></span>' +
      '</button>';
    }).join('');
    return '<form id="f-login" autocomplete="on">' +
      fld('Email Dinas Instansi', 'mail', '<input name="email" type="email" required placeholder="nama@instansi.go.id" value="rani@arunika.demo" autocomplete="username">') +
      fld('Kata Sandi', 'lock', '<input name="pass" type="password" required placeholder="Minimal 8 karakter" value="demo1234" autocomplete="current-password">', EYE) +
      '<div class="rowb"><label><input type="checkbox" checked> Pertahankan sesi aktif</label><a href="#" id="forgot">Bantuan akses?</a></div>' +
      '<button class="btn round" type="submit">Masuk ke Workspace<span class="arr">' + icon('arrow') + '</span></button></form>' +
      '<div class="divider">Pilih Peran Instansi (Akses Cepat 1-Klik)</div><div class="demo-acc">' + demo + '</div>' +
      '<p class="foot">Petugas baru? <a href="#/daftar" data-go="daftar">Registrasi akun petugas</a></p>';
  }

  function regForm() {
    return '<form id="f-reg">' +
      fld('Nama Lengkap Pegawai', 'user', '<input name="nama" required placeholder="Sesuai identitas kepegawaian">') +
      fld('Instansi Pengawas / Pelapor', 'building', '<select name="inst"><option value="pjp">PJP Pengakuisisi (Bank / Lembaga Selain Bank)</option><option value="bi">Bank Indonesia (Pengawasan Sistem Pembayaran)</option><option value="ppatk">PPATK (Analisis Transaksi Keuangan)</option></select>', DD) +
      fld('Kewenangan dalam Alur Kasus', 'briefcase', '<select name="jabatan"><option value="pjp_analis">Analis Pemantauan Merchant (Verifikasi &amp; Bukti)</option><option value="pjp_pejabat">Pejabat Kepatuhan APU-PPT (Otorisasi Penundaan &amp; LTKM)</option></select>', DD) +
      fld('Nama PJP Pengakuisisi', 'shield', '<input name="org" required placeholder="Contoh: PJP Arunika">') +
      fld('Nomor Induk Pegawai (NIP)', 'id', '<input name="nip" required placeholder="Contoh: ARK-04417">') +
      fld('Email Dinas', 'mail', '<input name="email" type="email" required placeholder="nama@instansi.go.id">') +
      fld('Kata Sandi', 'lock', '<input name="pass" type="password" required minlength="8" placeholder="Minimal 8 karakter">', EYE) +
      '<label class="agree"><input type="checkbox" required> Saya memahami bahwa data pengawasan bersifat rahasia dan seluruh keputusan tercatat dalam jejak audit.</label>' +
      '<button class="btn round" type="submit">Daftarkan Akun Petugas<span class="arr">' + icon('arrow') + '</span></button></form>' +
      '<p class="foot">Sudah memiliki akun? <a href="#/masuk" data-go="masuk">Masuk sistem</a></p>';
  }
  A.viewAuth = viewAuth;

  // ---------- Beranda Eksekutif ----------
  function greet() { var h = new Date().getHours(); return h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam'; }
  function donut(cnt, tot) {
    var off = 0, L = ['hijau', 'kuning', 'oranye', 'merah'];
    var sg = L.map(function (l, i) {
      var p = cnt[l] / tot * 100, g = p > 0 ? Math.max(0.4, p - 1.0) : 0;
      var c = p > 0 ? '<circle class="sg" r="15.9155" cx="21" cy="21" fill="none" stroke="var(--lv-' + l + ')" stroke-width="4.8" stroke-linecap="round" stroke-dasharray="' + g.toFixed(2) + ' ' + (100 - g).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '" style="animation-delay:' + (i * 0.1) + 's"/>' : '';
      off += p; return c;
    }).join('');
    var lst = L.map(function (l) {
      return '<div class="lv-row">' +
        '<i style="background:var(--lv-' + l + ')"></i>' +
        '<div class="lv-r-txt"><b>' + U.LV[l] + '</b><span>' + U.LVDESC[l] + '</span></div>' +
        '<strong class="num">' + cu(cnt[l]) + '</strong>' +
        '<em class="num">' + idn(cnt[l] / tot * 100, 0) + '%</em>' +
      '</div>';
    }).join('');
    return '<div class="donutwrap"><div class="donut-box"><svg class="donut" viewBox="0 0 42 42"><circle r="15.9155" cx="21" cy="21" fill="none" stroke="#EEF2F8" stroke-width="4.8"/>' + sg + '</svg><div class="c"><b>' + cu(tot) + '</b><span>Merchant</span></div></div><div class="lvlist">' + lst + '</div></div>';
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

    var jCnt = 0, pCnt = 0, kCnt = 0;
    T.merchants.forEach(function (m) {
      if (m.sig && m.sig.J) jCnt++;
      if (m.sig && m.sig.P) pCnt++;
      if (m.sig && m.sig.K) kCnt++;
    });

    var roleInfo = (A.ROLES && A.ROLES[u.role]) ? A.ROLES[u.role] : { nama: 'Petugas', inst: 'Instansi' };
    var pctH = Math.round(cnt.hijau / T.merchants.length * 100);
    var pctK = Math.round(cnt.kuning / T.merchants.length * 100);
    var pctO = Math.round(cnt.oranye / T.merchants.length * 100);
    var pctM = Math.round(cnt.merah / T.merchants.length * 100);

    var capPercent = Math.min(100, Math.round((today / Math.max(1, K)) * 100));
    var capStatus = today >= K ? 'Kuota Harian Terisi Penuh' : 'Tersedia (' + (K - today) + ' slot)';

    var kpi = isPJP() ?
      '<div class="kpi-grid kpi-4">' +
        '<a class="kpi-card" href="#/antrean">' +
          '<span class="kpi-tag amber">ANTREAN VERIFIKASI</span>' +
          '<b class="num">' + cu(q.length) + ' <small>Merchant</small></b>' +
          '<span>Level Oranye (&ge;2 pilar sinyal aktif)</span>' +
        '</a>' +
        '<a class="kpi-card" href="#/antrean">' +
          '<span class="kpi-tag blue">KAPASITAS TIM ANALIS</span>' +
          '<b class="num">' + cu(K) + ' <small>Kasus / Hari</small></b>' +
          '<span>Dijadwalkan hari ini: ' + today + ' merchant</span>' +
        '</a>' +
        '<a class="kpi-card" href="#/kasus">' +
          '<span class="kpi-tag green">PEMERIKSAAN AKTIF</span>' +
          '<b class="num">' + cu(open.length) + ' <small>Berkas Kasus</small></b>' +
          '<span>Investigasi, klarifikasi &amp; persetujuan</span>' +
        '</a>' +
        '<a class="kpi-card" href="#/kasus/' + (batCases[0] ? batCases[0].id : '') + '">' +
          '<span class="kpi-tag gold">SLA HUKUM PENUNDAAN</span>' +
          '<b class="num">' + (minBat !== null ? minBat + ' <small>Hari Kerja</small>' : 'Aman') + '</b>' +
          '<span>Batas maks. 5 hari kerja (UU 8/2010 Ps. 26)</span>' +
        '</a>' +
      '</div>'
      :
      '<div class="kpi-grid kpi-4">' +
        '<a class="kpi-card" href="#/antrean">' +
          '<span class="kpi-tag blue">POPULASI DIPANTAU</span>' +
          '<b class="num">' + cu(T.merchants.length) + ' <small>Merchant</small></b>' +
          '<span>Tersebar di 12 kota &amp; 4 klaster PDRB</span>' +
        '</a>' +
        '<a class="kpi-card" href="#/kasus">' +
          '<span class="kpi-tag amber">TOTAL BERKAS KASUS</span>' +
          '<b class="num">' + cu(cs.length) + ' <small>Kasus</small></b>' +
          '<span>Seluruh tindakan tercatat di jejak audit</span>' +
        '</a>' +
        '<a class="kpi-card" href="#/kasus">' +
          '<span class="kpi-tag green">KOREKSI PERLINDUNGAN UMKM</span>' +
          '<b class="num">' + cu(cs.filter(function (c) { return c.status === 'Tidak terbukti'; }).length) + ' <small>Dipulihkan</small></b>' +
          '<span>Terbukti wajar &amp; dikembalikan ke Hijau</span>' +
        '</a>' +
        '<a class="kpi-card" href="#/bukti/klaster">' +
          '<span class="kpi-tag gold">CAKUPAN KLASTER SPASIAL</span>' +
          '<b class="num">514 <small>Kab/Kota</small></b>' +
          '<span>Segmentasi 17 lapangan usaha BPS</span>' +
        '</a>' +
      '</div>';

    var hero =
      '<div class="hello">' +
        '<div class="hello-top">' +
          '<div class="live-status">' +
            '<span class="live-dot"></span>' +
            '<span>SURVEILANS MULTI-LAYER AKTIF &middot; SIKLUS SEM I 2026</span>' +
          '</div>' +
          '<div class="hello-date">' + A.HARI[d.getDay()] + ', ' + A.fmtD(d) + ' WIB</div>' +
        '</div>' +
        '<div class="hello-main">' +
          '<div class="hello-head">' +
            '<div class="hello-greet">' + greet() + ',</div>' +
            '<h2 class="hello-name">' + esc(u.nama) + '</h2>' +
            '<div class="hello-sub">' + esc(u.unit) + ' &bull; <span class="role-pill">' + esc(roleInfo.nama) + '</span> &bull; <span class="mono-tag">NIP ' + esc(u.nip) + '</span></div>' +
          '</div>' +
          '<div class="hello-actions">' +
            (isPJP() ? '<a class="btn-hero primary" href="#/antrean">' + icon('queue') + 'Buka Antrean Prioritas (' + q.length + ')</a>' :
              u.role === 'bi' ? '<a class="btn-hero primary" href="#/pengawasan">' + icon('shield') + 'Dashboard Pengawasan PJP</a>' :
              '<a class="btn-hero primary" href="#/ltkm">' + icon('file') + 'Tinjau LTKM Masuk</a>') +
            '<a class="btn-hero secondary" href="#/bukti/klaster">' + icon('map') + 'Peta Klaster 514 Wilayah</a>' +
          '</div>' +
        '</div>' +
        kpi +
      '</div>';

    var countdownHtml = (bat.length && isPJP()) ?
      '<div class="countdown-card">' +
        '<div class="cd-icon">' + icon('clock') + '</div>' +
        '<div class="cd-content">' +
          '<div class="cd-tag">PERINGATAN SLA KEPATUHAN HUKUM &middot; UU NO. 8 TAHUN 2010 PASAL 26</div>' +
          '<div class="cd-val num">' + minBat + ' hari kerja tersisa untuk penyelesaian status penundaan transaksi</div>' +
          '<div class="cd-desc">Penundaan transaksi wajib diputuskan paling lama <b>5 hari kerja</b> sejak berita acara diterbitkan. Terdapat <b>' + batCases.length + ' kasus aktif</b> dalam masa pembatasan/keberatan (' + batCases.map(function (c) { return c.id; }).join(', ') + ').</div>' +
        '</div>' +
        '<a class="btn sec sm cd-cta" href="#/kasus/' + batCases[0].id + '">Tinjau Berkas ' + batCases[0].id + ' ' + icon('arrow') + '</a>' +
      '</div>' : '';

    var sigRadar =
      '<div class="card sig-radar-card">' +
        '<div class="card-head-row">' +
          '<div>' +
            '<div class="card-tag">ARSITEKTUR DETEKSI MULTI-PILAR</div>' +
            '<h3>Tiga Pilar Sinyal Penapisan Objektif (J &middot; P &middot; K)</h3>' +
          '</div>' +
          badge('hitungan') +
        '</div>' +
        '<p class="hint">Memisahkan deteksi statistik dari sanksi. Hanya merchant yang mengaktifkan <b>minimal 2 dari 3 kelompok sinyal kuat</b> yang masuk ke antrean verifikasi analis (Level Oranye).</p>' +
        '<div class="sig-pills">' +
          '<a class="sig-pill" href="#/antrean">' +
            '<div class="sig-badge j">J</div>' +
            '<div class="sig-info">' +
              '<div class="sig-title">Pilar J &mdash; Jejaring Pembayar Lintas Merchant</div>' +
              '<div class="sig-desc">Proporsi pembayar bersama (derajat &ge;3), tautan antar-merchant (&ge;6 pembayar sama), ukuran komponen graf, serta rasio fan-in / fan-out.</div>' +
            '</div>' +
            '<div class="sig-stat"><b class="num">' + jCnt + '</b><span>Merchant Aktif</span></div>' +
          '</a>' +
          '<a class="sig-pill" href="#/antrean">' +
            '<div class="sig-badge p">P</div>' +
            '<div class="sig-info">' +
              '<div class="sig-title">Pilar P &mdash; Perilaku Relatif Sebaya &amp; Riwayat</div>' +
              '<div class="sig-desc">Robust Z-Score (Iglewicz-Hoaglin) terhadap kelompok sebaya 3-lapis (Klaster Wilayah &rarr; Kategori MCC &rarr; Skala) dan CUSUM Atas (Page, 1954).</div>' +
            '</div>' +
            '<div class="sig-stat"><b class="num">' + pCnt + '</b><span>Merchant Aktif</span></div>' +
          '</a>' +
          '<a class="sig-pill" href="#/antrean">' +
            '<div class="sig-badge k">K</div>' +
            '<div class="sig-info">' +
              '<div class="sig-title">Pilar K &mdash; Profil Usaha, Konteks Wilayah &amp; Daftar Rujukan</div>' +
              '<div class="sig-desc">Anomali umur merchant baru dengan volume ekstrem (&gt;3x P90 sebaya), deviasi nominal tiket rata-rata, dan kecocokan daftar rujukan internal.</div>' +
            '</div>' +
            '<div class="sig-stat"><b class="num">' + kCnt + '</b><span>Merchant Aktif</span></div>' +
          '</a>' +
        '</div>' +
      '</div>';

    var topRows = q.slice(0, 5).map(function (x) {
      var m = x.m;
      return '<tr data-href="#/merchant/' + m.id + '">' +
        '<td><span class="rank-pill ' + (x.rank <= 3 ? 'top' : '') + '">#' + x.rank + '</span></td>' +
        '<td><div class="mthumb"><div class="thumb">' + U.storefront(m, 38) + '</div><div><b>' + esc(m.nama) + '</b><small>' + m.id + ' &middot; ' + esc(m.kategori) + '</small></div></div></td>' +
        '<td><span class="city-tag">' + esc(m.kota) + '</span><small class="block muted">Klaster ' + m.klaster + '</small></td>' +
        '<td><div class="score-cell"><b class="num">' + m.score + '</b><div class="score-mini-bar"><span style="width:' + m.score + '%"></span></div></div></td>' +
        '<td>' + A.groupsBar(m) + '</td>' +
        '<td><span class="pill ' + (x.today ? 'st-menunggu' : 'st-investigasi') + '">' + (x.today ? 'Kuota Hari Ini' : 'Hari ke-' + x.hari) + '</span></td>' +
      '</tr>';
    }).join('');

    var priorityTableCard =
      '<div class="card">' +
        '<div class="card-head-row">' +
          '<div>' +
            '<div class="card-tag">ANTREAN VERIFIKASI PRIORITAS</div>' +
            '<h3>Peringkat Merchant Level Oranye Teratas</h3>' +
          '</div>' +
          '<a class="btn sec sm" href="#/antrean">Lihat Semua (' + q.length + ') ' + icon('arrow') + '</a>' +
        '</div>' +
        '<p class="hint">Diurutkan berdasarkan skor prioritas komposit (0&ndash;100) untuk menentukan urutan peninjauan analis sesuai kapasitas harian.</p>' +
        '<div class="tblwrap mt12">' +
          '<table class="exec-table">' +
            '<thead><tr><th style="width:52px">Rank</th><th>Merchant &amp; Kategori</th><th>Wilayah</th><th style="width:95px">Skor</th><th style="width:86px">Pilar Sinyal</th><th style="width:120px">Status Antrean</th></tr></thead>' +
            '<tbody>' + (topRows || '<tr><td colspan="6" class="empty">Seluruh merchant Oranye telah memiliki berkas pemeriksaan.</td></tr>') + '</tbody>' +
          '</table>' +
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
        '<div class="card-head-row">' +
          '<div>' +
            '<div class="card-tag">DISTRIBUSI STATUS EKOSISTEM</div>' +
            '<h3>Sebaran Level Penapisan Merchant</h3>' +
          '</div>' +
          badge('demo') +
        '</div>' +
        '<p class="hint">Dari ' + T.merchants.length + ' merchant yang dipantau, mesin otomatis hanya mengklasifikasikan hingga <b>Oranye</b>. Level <b>Merah</b> wajib melalui bukti pemeriksaan manusia &amp; persetujuan 2 pejabat.</p>' +
        riskBar +
        donut(cnt, T.merchants.length) +
        '<div class="umkm-protect-box">' +
          icon('shield') +
          '<div><b>Garansi Perlindungan UMKM Jujur:</b> Usaha malam (angkringan/kopi), transaksi nominal seragam (konter pulsa/token), dan lonjakan musiman/acara lokal diklasifikasikan sebagai <i>Sinyal Lemah</i> dan <b>tetap Hijau</b>.</div>' +
        '</div>' +
      '</div>';

    var capCard =
      '<div class="card cap-card">' +
        '<div class="card-head-row">' +
          '<div>' +
            '<div class="card-tag">MANAJEMEN BEBAN KERJA ANALIS</div>' +
            '<h3>Kapasitas Peninjauan Harian</h3>' +
          '</div>' +
          '<button type="button" class="chip" id="home-cap-btn">' + icon('sliders') + 'Atur Kuota</button>' +
        '</div>' +
        '<p class="hint">Mencegah kelelahan analis dan keputusan sepihak melalui kuota pemeriksaan kasus baru per hari kerja.</p>' +
        '<div class="cap-meter-wrap">' +
          '<div class="cap-meter-header">' +
            '<span>Alokasi Hari Kerja Ini: <b>' + today + ' dari ' + K + ' kasus baru</b></span>' +
            '<span class="cap-status-pill ' + (today >= K ? 'full' : 'ok') + '">' + capStatus + '</span>' +
          '</div>' +
          '<div class="cap-meter-bar"><div class="cap-meter-fill" style="width:' + capPercent + '%"></div></div>' +
          '<div class="cap-analis-list">' +
            S.settings.analis.map(function (a) {
              return '<div class="ca-item"><span>' + esc(a.nama) + '</span><b class="num">' + a.kap + ' kasus/hari</b></div>';
            }).join('') +
          '</div>' +
          '<div class="cap-meter-sub">' +
            '<span><b>' + today + '</b> dijadwalkan hari ini</span>' +
            '<span>&bull;</span>' +
            '<span><b>' + Math.max(0, q.length - today) + '</b> menunggu kuota hari berikutnya (tanpa pembatasan)</span>' +
          '</div>' +
        '</div>' +
        '<div class="btnrow">' +
          '<a class="btn sec" href="#/antrean">Buka Antrean</a>' +
          '<a class="btn" href="#/kasus">Manajemen Kasus (' + open.length + ')</a>' +
        '</div>' +
      '</div>';

    var roleSpecialCard = '';
    if (u.role === 'ppatk') {
      var ltkmList = cs.filter(function (c) { return c.status === 'Diteruskan'; });
      roleSpecialCard =
        '<div class="card highlight-card">' +
          '<div class="card-head-row"><div><div class="card-tag">PERSPEKTIF ANALIS PPATK</div><h3>Laporan Transaksi Keuangan Mencurigakan (LTKM) Masuk</h3></div>' + badge('demo') + '</div>' +
          '<p class="hint">Daftar berkas pemeriksaan PJP yang telah memenuhi kecukupan bukti dan diteruskan sebagai LTKM ke PPATK sesuai UU No. 8 Tahun 2010 Pasal 25.</p>' +
          '<div class="list mt12">' + ltkmList.map(A.caseRow).join('') + '</div>' +
        '</div>';
    } else if (u.role === 'bi') {
      roleSpecialCard =
        '<div class="card highlight-card">' +
          '<div class="card-head-row"><div><div class="card-tag">PERSPEKTIF PENGAWAS BANK INDONESIA</div><h3>Ringkasan Kepatuhan PJP &amp; Perlindungan Konsumen/Merchant</h3></div><a class="btn sec sm" href="#/pengawasan">Buka Modul Pengawasan ' + icon('arrow') + '</a></div>' +
          '<p class="hint">Memantau kepatuhan SLA penundaan 5 hari kerja, rasio koreksi merchant tidak terbukti, serta penanganan keberatan merchant pada 3 PJP pengakuisisi.</p>' +
        '</div>';
    }

    var statsGrid =
      '<div class="sec-title"><div><span class="card-tag">LANDASAN EMPIRIS NASIONAL</span><h2>Indikator Resmi PPATK, Bank Indonesia &amp; BPS</h2></div><a href="#/bukti/ringkas">Buka Pusat Bukti &rarr;</a></div>' +
      '<div class="grid4">' +
        A.stat('Pangsa Frekuensi Deposit Judi Daring via QRIS (Sem I 2026)', cu(87.66, 2, '', '%'), 'resmi', 'PPATK, Siaran Pers Agustus 2026 (198,77 juta transaksi)') +
        A.stat('Rata-rata Nominal per Transaksi Deposit via QRIS', cu(Math.round(H.deposit.rata2_qris_rp), 0, 'Rp'), 'hitungan', 'Diolah dari Laporan Semester I 2026 PPATK (vs Rp89.243 rata-rata QRIS)') +
        A.stat('Populasi Merchant QRIS Nasional (Juni 2026)', cu(H.qris.merchant_juta, 2, '', ' Juta'), 'resmi', 'Bank Indonesia, Siaran Pers No. 28/159/DKom (96,68% UMKM)') +
        A.stat('Perubahan LTKM Indikasi Perjudian (Jan–Sep 2026 vs 2025)', cu((1 - H.m2.jan_sep_2026 / H.m2.jan_sep_2025) * 100, 1, '-', '%'), 'hitungan', 'Mann-Kendall TFPW Z = -3,627 (p = 0,0003) · Buletin APUPPT Sep 2026') +
      '</div>';

    var quickGrid =
      '<div class="sec-title"><div><span class="card-tag">INSTRUMEN ANALITIK &amp; SIMULASI KEBIJAKAN</span><h2>Eksplorasi Modul Utama TAPIS</h2></div></div>' +
      '<div class="quick-grid-4">' +
        '<a class="quick-card" href="#/bukti/klaster">' +
          '<div class="q-ic map">' + icon('map') + '</div>' +
          '<div><b>Peta &amp; Klaster 514 Wilayah</b><span>Eksplorasi spasial 38 provinsi &amp; 514 kab/kota berbasis PDRB 17 lapangan usaha BPS (Ward CLR K=4).</span></div>' +
        '</a>' +
        '<a class="quick-card" href="#/simulator/risiko">' +
          '<div class="q-ic sim">' + icon('sliders') + '</div>' +
          '<div><b>Simulasi Risiko Bayes (PPV)</b><span>Evaluasi trade-off FPR, sensitivitas, prevalensi, dan nilai transaksi bruto UMKM yang tertunda.</span></div>' +
        '</a>' +
        '<a class="quick-card" href="#/jejaring/' + (q.length ? q[0].m.id : 'M081') + '">' +
          '<div class="q-ic net">' + icon('net') + '</div>' +
          '<div><b>Graf Jejaring Pembayar</b><span>Visualisasi topologi pembayar bersama lintas merchant, derajat konektivitas, dan daftar rujukan.</span></div>' +
        '</a>' +
        '<a class="quick-card" href="#/simulator/level">' +
          '<div class="q-ic rule">' + icon('scale') + '</div>' +
          '<div><b>Simulator Aturan 4-Level</b><span>Uji interaktif bagaimana kombinasi sinyal kuat (J, P, K) dan sinyal lemah menentukan level merchant.</span></div>' +
        '</a>' +
      '</div>';

    var body =
      hero +
      countdownHtml +
      roleSpecialCard +
      '<div class="exec-split">' +
        '<div class="exec-main">' + sigRadar + priorityTableCard + '</div>' +
        '<div class="exec-side">' + sebaranCard + capCard + '</div>' +
      '</div>' +
      statsGrid +
      quickGrid;

    shell('Beranda Eksekutif', esc(u.unit), body, { nav: 'beranda' });

    var app = A.app;
    app.querySelectorAll('tr[data-href]').forEach(function (r) {
      r.onclick = function () { location.hash = r.dataset.href; };
    });
    var capBtn = app.querySelector('#home-cap-btn');
    if (capBtn) capBtn.onclick = function () { A.openCapModal(viewBeranda); };
  }

  // ---------- Menu, Akun, Panduan Metodologi, Transparansi Data ----------
  function viewMenu() {
    var u = me(), ROLES = A.ROLES, q = A.antrean();
    var body =
      '<div class="profile">' +
        A.avatar(u) +
        '<div style="position:relative;z-index:1;min-width:0;flex:1">' +
          '<b>' + esc(u.nama) + '</b>' +
          '<div class="small" style="margin-top:4px"><span class="role-pill">' + esc(ROLES[u.role].nama) + '</span> &middot; <span class="mono-tag">NIP ' + esc(u.nip) + '</span></div>' +
          '<div class="small" style="margin-top:4px;opacity:.85">' + esc(u.unit) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="exec-split">' +
        '<div>' +
          '<div class="sec-title mt0"><h2>Modul Operasional &amp; Analitik</h2></div>' +
          '<div class="list menu">' +
            (isPJP() ? A.menuLink('#/antrean', 'queue', 'Antrean Verifikasi Berkapasitas', 'Peringkat prioritas merchant Oranye & alokasi kuota analis') : A.menuLink('#/pengawasan', 'shield', 'Pengawasan Sistem Pembayaran', 'Kepatuhan SLA PJP, keberatan merchant, dan statistik nasional')) +
            A.menuLink('#/kasus', 'folder', 'Manajemen Kasus & Jejak Audit', 'Pemeriksaan bukti multi-sumber, otorisasi 2 pejabat, dan draf LTKM') +
            A.menuLink('#/jejaring/' + (q.length ? q[0].m.id : 'M081'), 'net', 'Graf Jejaring Pembayar', 'Analisis konektivitas pembayar bersama lintas merchant') +
            A.menuLink('#/bukti/klaster', 'map', 'Peta Interaktif & Klaster 514 Wilayah', 'Segmentasi struktur ekonomi PDRB 17 lapangan usaha BPS') +
            A.menuLink('#/bukti/ringkas', 'chart', 'Pusat Bukti Nasional (M1 · M2 · M3)', 'Dekomposisi Kitagawa deposit QRIS, deret waktu LTKM, dan kurva Bayes') +
            A.menuLink('#/simulator/risiko', 'sliders', 'Simulasi Risiko & Simulator Level', 'Eksperimen parameter FPR, sensitivitas, prevalensi, dan aturan 2-dari-3') +
          '</div>' +
        '</div>' +
        '<div>' +
          '<div class="sec-title mt0"><h2>Tata Kelola, Data &amp; Regulasi</h2></div>' +
          '<div class="list menu">' +
            A.menuLink('#/data', 'download', 'Basis Data & Ekspor CSV', 'Eksplorasi 100 merchant, ledger 14 hari, deret 56 hari, dan berkas kasus') +
            A.menuLink('#/panduan', 'book', 'Metodologi & Landasan Hukum', 'Arsitektur 4 lapis, rumus Robust Z & CUSUM, serta kepatuhan UU 8/2010') +
            A.menuLink('#/tentang', 'info', 'Transparansi Sumber Data', 'Klasifikasi angka Resmi, Hitungan Ekonometrika, Asumsi, dan Data Terkalibrasi') +
            A.menuLink('#/akun', 'id', 'Profil Petugas & Pengaturan Sesi', 'Informasi hak akses peran, ganti instansi, dan reset data ke awal') +
          '</div>' +
          '<button class="btn sec mt12" id="out">' + icon('logout') + 'Keluar dari Sesi Aktif</button>' +
        '</div>' +
      '</div>';
    shell('Indeks Modul & Navigasi', 'Peta lengkap fitur dan tata kelola TAPIS', body, { nav: 'menu' });
    A.app.querySelector('#out').onclick = function () { S.session = null; save('session', null); location.hash = '#/masuk'; };
  }

  function viewAkun() {
    var u = me(), ROLES = A.ROLES;
    var roleCards = A.DEMO_USERS.map(function (du) {
      var active = du.email === u.email;
      return '<div class="acc-role-card ' + (active ? 'on' : '') + '">' +
        '<div class="flex between">' +
          '<div class="flex">' + A.avatar(du) + '<div><b>' + esc(du.nama) + '</b><div class="small muted">' + esc(ROLES[du.role].nama) + '</div></div></div>' +
          (active ? '<span class="pill st-tidak">Sesi Aktif</span>' : '<button type="button" class="btn sec sm" data-sw="' + du.email + '">Aktifkan Peran</button>') +
        '</div>' +
        '<div class="small muted mt8">' + esc(du.unit) + ' &middot; <span class="num">' + esc(du.nip) + '</span></div>' +
      '</div>';
    }).join('');

    var body =
      '<div class="exec-split">' +
        '<div>' +
          '<div class="card">' +
            '<div class="card-tag">IDENTITAS PETUGAS AKTIF</div>' +
            '<h3>Profil &amp; Kewenangan Kelembagaan</h3>' +
            '<dl class="kv mt12">' +
              '<dt>Nama Lengkap</dt><dd>' + esc(u.nama) + '</dd>' +
              '<dt>Peran Fungsional</dt><dd>' + esc(ROLES[u.role].nama) + '</dd>' +
              '<dt>Instansi / Unit Kerja</dt><dd>' + esc(u.unit) + '</dd>' +
              '<dt>Nomor Induk Pegawai</dt><dd class="num">' + esc(u.nip) + '</dd>' +
              '<dt>Email Dinas</dt><dd class="num">' + esc(u.email) + '</dd>' +
            '</dl>' +
            '<div class="note mt12"><b>Lingkup Kewenangan:</b> ' +
              ({
                pjp_analis: 'Membuka berkas kasus verifikasi dari antrean Oranye, mencatat temuan bukti lapangan/dokumen, meminta klarifikasi merchant, mengajukan penundaan transaksi kepada pejabat kepatuhan, serta menutup kasus yang terbukti wajar (dipulihkan ke Hijau).',
                pjp_pejabat: 'Memiliki seluruh kewenangan analis ditambah hak otorisasi penundaan transaksi (wajib persetujuan 2 pejabat kepatuhan berbeda), memutus keberatan merchant (UU 8/2010 Pasal 67), mencabut pembatasan, dan meneruskan LTKM ke PPATK.',
                bi: 'Memantau indikator kepatuhan PJP pengakuisisi, mengawasi SLA penundaan 5 hari kerja dan perlindungan merchant UMKM, serta menelaah pusat bukti nasional. Tidak melakukan intervensi mikro langsung pada akun merchant.',
                ppatk: 'Menerima dan menganalisis Laporan Transaksi Keuangan Mencurigakan (LTKM) yang diteruskan oleh PJP pengakuisisi beserta rincian sinyal jejaring dan bukti pemeriksaan.'
              })[u.role] +
            '</div>' +
          '</div>' +
          '<div class="card">' +
            '<div class="card-tag">PEMELIHARAAN WORKSPACE</div>' +
            '<h3>Reset &amp; Kalibrasi Ulang Skenario</h3>' +
            '<p class="small muted">Mengembalikan seluruh berkas kasus, status persetujuan pejabat, dan pengaturan kuota kapasitas analis ke keadaan awal yang terkalibrasi.</p>' +
            '<div class="btnrow mt12">' +
              '<button class="btn sec" id="rs">' + icon('reset') + 'Kembalikan Data ke Keadaan Awal</button>' +
              '<button class="btn red" id="acc-out">' + icon('logout') + 'Keluar Sesi</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<div class="card">' +
            '<div class="card-tag">SIMULASI LINTAS INSTANSI</div>' +
            '<h3>Beralih Peran Pengawasan (Multi-Role)</h3>' +
            '<p class="hint">Klik salah satu akun pejabat/analis di bawah untuk menguji alur pemeriksaan berjenjang (Dual-Control 2 Pejabat, Pengawasan BI, dan Pelaporan PPATK) secara langsung.</p>' +
            '<div class="acc-role-list mt12">' + roleCards + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    shell('Profil & Pengaturan Sesi', esc(u.unit), body, { back: true, nav: 'akun' });
    A.app.querySelector('#rs').onclick = function () { A.resetAll(); location.hash = '#/beranda'; location.reload(); };
    A.app.querySelector('#acc-out').onclick = function () { S.session = null; save('session', null); location.hash = '#/masuk'; };
    A.app.querySelectorAll('[data-sw]').forEach(function (b) {
      b.onclick = function () { A.switchUser(b.dataset.sw, '#/akun'); };
    });
  }

  function viewPanduan() {
    var W = T.CONFIG.W;
    var lv = [
      ['hijau', 'Tidak ada kelompok sinyal kuat yang aktif, atau hanya terdapat sinyal lemah (aktif malam hari, nominal seragam, atau lonjakan sesaat).', 'Tidak ada pembatasan maupun intervensi. Transaksi dan pencairan dana berjalan normal sepenuhnya.'],
      ['kuning', 'Tepat 1 (satu) kelompok sinyal kuat (J, P, atau K) aktif tanpa konvergensi kelompok sinyal lain.', 'Pemantauan otomatis di latar belakang. Tidak masuk antrean pemeriksaan analis dan merchant tidak dibatasi.'],
      ['oranye', 'Minimal 2 (dua) dari 3 kelompok sinyal kuat (J, P, K) aktif secara bersamaan (Aturan Konvergensi 2-dari-3).', 'Masuk antrean verifikasi manusia sesuai urutan Skor Prioritas dan kuota kapasitas harian tim analis.'],
      ['merah', 'TIDAK PERNAH dihasilkan otomatis oleh mesin. Hanya ditetapkan setelah kasus dibuka, bukti lapangan/dokumen memadai, dan disetujui 2 pejabat kepatuhan berbeda.', 'Penundaan transaksi sementara paling lama 5 hari kerja (UU 8/2010 Pasal 26), penerbitan Berita Acara resmi, dan jaminan hak keberatan merchant (Pasal 67).']
    ];
    var body =
      A.ltkmInfo(true) +
      '<div class="exec-split">' +
        '<div>' +
          '<div class="card">' +
            '<div class="card-tag">ARSITEKTUR KEPUTUSAN</div>' +
            '<h3>Empat Lapisan Pemisahan Sinyal &amp; Tindakan</h3>' +
            '<p class="hint">TAPIS dirancang agar algoritma statistik tidak pernah menjatuhkan sanksi otomatis kepada pelaku usaha.</p>' +
            '<div class="arch-steps mt12">' +
              '<div class="arch-step"><span class="as-num">01</span><div><b>Lapisan 1: Ekstraksi Tiga Pilar Sinyal (J, P, K)</b><p>Mengukur topologi graf pembayar bersama (J), deviasi volume Robust Z &amp; CUSUM terhadap kelompok sebaya 3-lapis (P), serta konteks profil &amp; daftar rujukan (K).</p></div></div>' +
              '<div class="arch-step"><span class="as-num">02</span><div><b>Lapisan 2: Skor Prioritas Komposit (0–100)</b><p>Mengurutkan urgensi peninjauan menggunakan peringkat persentil terbobot: Jejaring (' + (W.jaringan * 100) + '%), Sebaya (' + (W.sebaya * 100) + '%), Perubahan (' + (W.perubahan * 100) + '%), Profil (' + (W.profil * 100) + '%), Daftar (' + (W.daftar * 100) + '%). Skor adalah urutan prioritas kerja, bukan probabilitas bersalah.</p></div></div>' +
              '<div class="arch-step"><span class="as-num">03</span><div><b>Lapisan 3: Klasifikasi Level Penapisan &amp; Antrean Berkapasitas</b><p>Menerapkan syarat konvergensi 2-dari-3 sinyal kuat untuk Level Oranye dan menjadwalkan pemeriksaan sesuai kapasitas riil analis per hari kerja.</p></div></div>' +
              '<div class="arch-step"><span class="as-num">04</span><div><b>Lapisan 4: Verifikasi Bukti Manusia &amp; Otorisasi Ganda (Dual-Control)</b><p>Mewajibkan minimal 2 jenis bukti (termasuk bukti non-transaksi seperti kunjungan lapangan/dokumen NIB) dan persetujuan 2 pejabat kepatuhan sebelum pembatasan (Merah) atau pelaporan LTKM.</p></div></div>' +
            '</div>' +
          '</div>' +
          '<div class="card">' +
            '<div class="card-tag">METODOLOGI STATISTIK</div>' +
            '<h3>Spesifikasi Tiga Kelompok Sinyal Kuat</h3>' +
            '<div class="reason"><span class="ic on">J</span><div><b>Pilar J — Jejaring Pembayar Lintas Merchant</b><p>Mendeteksi pola penampungan terkoordinasi melalui derajat pembayar lintas toko (&ge;3 merchant), jumlah tautan merchant (&ge;3 merchant berbagi &ge;6 pembayar identik), ukuran komponen terhubung (&ge;4), serta fan-in/fan-out. Jika cakupan ID pembayar &lt;70%, status dicatat sebagai <i>Data Tidak Memadai</i> (bukan dianggap aman atau berisiko).</p></div></div>' +
            '<div class="reason"><span class="ic on">P</span><div><b>Pilar P — Perilaku Relatif Sebaya 3-Lapis &amp; CUSUM</b><p>Membandingkan merchant pada <b>Lapis 1 (Klaster Ekonomi Wilayah BPS) &rarr; Lapis 2 (Kategori MCC) &rarr; Lapis 3 (Skala Usaha)</b> menggunakan Robust Z-Score (Iglewicz &amp; Hoaglin, 1993: <code>0,6745(x - median)/MAD</code>) dan tabular CUSUM Atas (Page, 1954).</p></div></div>' +
            '<div class="reason"><span class="ic on">K</span><div><b>Pilar K — Profil, Konteks Wilayah &amp; Daftar Rujukan</b><p>Mengevaluasi kesesuaian umur merchant (&lt;60 hari dengan volume &gt;3x P90 sebaya), deviasi nominal tiket rata-rata (<code>|Robust Z| &ge; 3</code>), serta kecocokan pembayar pada daftar rujukan berkeyakinan tinggi/sedang.</p></div></div>' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<div class="card">' +
            '<div class="card-tag">TAKSONOMI LEVEL RISIKO</div>' +
            '<h3>Empat Level Penapisan &amp; Protokol Tindakan</h3>' +
            lv.map(function (l) {
              return '<div class="reason"><div>' + level(l[0], true) + '<p class="mt8"><b>Kriteria:</b> ' + l[1] + '</p><p><b>Protokol Operasional:</b> ' + l[2] + '</p></div></div>';
            }).join('') +
          '</div>' +
          '<div class="card">' +
            '<div class="card-tag">KEPATUHAN HUKUM &amp; REGULASI</div>' +
            '<h3>Matriks Dasar Hukum Sistem Pembayaran &amp; APU-PPT</h3>' +
            '<div class="tblwrap mt8"><table class="exec-table"><thead><tr><th>Instrumen Kewenangan</th><th>Landasan Regulasi</th></tr></thead><tbody>' +
              '<tr><td><b>Kewajiban Pemantauan Merchant oleh PJP</b></td><td>PBI No. 10 Tahun 2024 Pasal 16 &amp; Pasal 29; PADG No. 15 Tahun 2025 Penjelasan Pasal 14</td></tr>' +
              '<tr><td><b>Batas Waktu Penyampaian LTKM (Maks. 3 Hari Kerja)</b></td><td>UU No. 8 Tahun 2010 Pasal 25 ayat (1)</td></tr>' +
              '<tr><td><b>Penundaan Transaksi Sementara (Maks. 5 Hari Kerja)</b></td><td>UU No. 8 Tahun 2010 Pasal 26; PBI No. 10 Tahun 2024 Pasal 37</td></tr>' +
              '<tr><td><b>Penghentian Sementara Transaksi oleh PPATK</b></td><td>UU No. 8 Tahun 2010 Pasal 44 ayat (1) huruf i, Pasal 65&ndash;66</td></tr>' +
              '<tr><td><b>Hak Mengajukan Keberatan bagi Pihak Terdampak</b></td><td>UU No. 8 Tahun 2010 Pasal 67</td></tr>' +
              '<tr><td><b>Pemanfaatan Teknologi Pengawasan Inovatif (SupTech/RegTech)</b></td><td>PADG No. 15 Tahun 2025 Pasal 24</td></tr>' +
            '</tbody></table></div>' +
          '</div>' +
        '</div>' +
      '</div>';
    shell('Metodologi & Landasan Regulasi', 'Arsitektur statistik, perlindungan UMKM, dan tata kelola hukum TAPIS', body, { back: true, nav: 'panduan' });
  }

  function viewTentang() {
    var body =
      '<div class="exec-split">' +
        '<div>' +
          '<div class="card">' +
            '<div class="card-tag">TATA KELOLA PROVENANS DATA</div>' +
            '<h3>Empat Klasifikasi Sumber Angka di TAPIS</h3>' +
            '<p class="hint">Untuk menjaga integritas akademik dan akuntabilitas kebijakan, setiap indikator di dalam platform diberi penanda asal data secara eksplisit.</p>' +
            '<div class="reason"><span>' + badge('resmi') + '</span><div><b>Publikasi Resmi Negara</b><p>Angka makro yang dikutip langsung dari laporan resmi Bank Indonesia, PPATK, dan Badan Pusat Statistik (BPS) tanpa modifikasi.</p></div></div>' +
            '<div class="reason"><span>' + badge('hitungan') + '</span><div><b>Komputasi Riset Ekonometrika</b><p>Hasil pengolahan statistik dari data resmi di dalam notebook riset (Dekomposisi logaritmik Kitagawa, Uji Mann-Kendall TFPW, Andrews sup-F, CUSUM, dan Agglomerative Ward Clustering ruang CLR).</p></div></div>' +
            '<div class="reason"><span>' + badge('asumsi') + '</span><div><b>Parameter Model &amp; Skenario</b><p>Parameter operasional atau skenario simulasi yang dapat diuji sensitivitasnya (sensitivitas 80%, bobot skor prioritas, parameter k/h CUSUM, FPR, dan kuota kapasitas harian analis).</p></div></div>' +
            '<div class="reason"><span>' + badge('demo') + '</span><div><b>Data Mikro Terkalibrasi (100 Merchant &amp; Ledger Transaksi)</b><p>Populasi mikro 100 merchant (80 normal/wajar, 15 anomali parsial, 5 indikasi kuat), deret 56 hari, dan 14 hari ledger transaksi dibangkitkan secara deterministik (bibit acak tetap) untuk mendemonstrasikan mekanisme verifikasi berjenjang tanpa melanggar kerahasiaan data nasabah/merchant nyata.</p></div></div>' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<div class="card">' +
            '<div class="card-tag">DAFTAR PUSTAKA &amp; SUMBER DATA</div>' +
            '<h3>Referensi Resmi &amp; Dokumen Regulasi</h3>' +
            '<ul class="ref-list mt8">' +
              '<li><b>Bank Indonesia (2026).</b> <i>Siaran Pers No. 28/159/DKom</i> — Perkembangan pengguna QRIS (65,77 juta), populasi merchant (44,86 juta; 96,68% UMKM), volume transaksi (12,55 miliar), dan nominal transaksi (Rp1,12 kuadriliun).</li>' +
              '<li><b>PPATK (2026).</b> <i>Laporan Semester I Tahun 2026 &amp; Siaran Pers B/04/HM.05/3.1/VIII/2026</i> — Statistik frekuensi dan nilai deposit judi daring menurut kanal pembayaran (QRIS vs rekening bank/dompet elektronik).</li>' +
              '<li><b>PPATK (2025–2026).</b> <i>Buletin Statistik APUPPT Edisi Juni 2025, Oktober 2025, dan September 2026 (Tabel 2 &amp; Tabel 5)</i> — Deret waktu bulanan LTKM indikasi tindak pidana asal perjudian dan distribusi kelompok pelapor.</li>' +
              '<li><b>Badan Pusat Statistik / BPS (2025–2026).</b> <i>PDRB Atas Dasar Harga Berlaku menurut 17 Lapangan Usaha 514 Kabupaten/Kota &amp; PDRB per Kapita 38 Provinsi</i>.</li>' +
              '<li><b>Kerangka Hukum Nasional:</b> Undang-Undang Nomor 8 Tahun 2010 tentang Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang; Peraturan Bank Indonesia Nomor 10 Tahun 2024; Peraturan Anggota Dewan Gubernur Nomor 15 Tahun 2025.</li>' +
            '</ul>' +
          '</div>' +
          '<div class="card">' +
            '<div class="card-tag">BATAS KLAIM ILMIAH</div>' +
            '<h3>Pernyataan Integritas Akademik</h3>' +
            '<p class="small muted" style="line-height:1.6">TAPIS merupakan prototipe riset kebijakan dan sistem pendukung keputusan (<i>Decision Support System</i>). Seluruh parameter penapisan mikro perlu dikalibrasi lebih lanjut menggunakan data berlabel milik pengawas/penyelenggara sebelum diterapkan pada lingkungan produksi berskala nasional.</p>' +
          '</div>' +
        '</div>' +
      '</div>';
    shell('Arsitektur & Transparansi Data', 'Dokumentasi sumber data resmi dan metodologi komputasi', body, { back: true, nav: 'tentang' });
  }

  A.viewBeranda = viewBeranda;
  A.viewMenu = viewMenu;
  A.viewAkun = viewAkun;
  A.viewPanduan = viewPanduan;
  A.viewTentang = viewTentang;
})();
