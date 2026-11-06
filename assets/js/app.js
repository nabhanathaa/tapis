/* TAPIS app: router, akun, halaman. Data merchant/kasus = DEMO; angka di halaman Bukti = RESMI (window.RESMI). */
(function () {
  'use strict';
  var T = window.TAPIS, U = window.UI, R = window.RESMI, H = R.hasil;
  var icon = U.icon, idn = U.idn, rp = U.rp, esc = U.esc, badge = U.badge, level = U.level;
  var app = document.getElementById('app');

  // ---------- penyimpanan (localStorage dengan cadangan memori) ----------
  var MEM = {};
  function load(k, d) { try { var v = localStorage.getItem('tapis2.' + k); return v ? JSON.parse(v) : d; } catch (e) { return MEM[k] !== undefined ? MEM[k] : d; } }
  function save(k, v) { MEM[k] = v; try { localStorage.setItem('tapis2.' + k, JSON.stringify(v)); } catch (e) { } }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); }

  var ROLES = {
    pjp_analis: { nama: 'Analis Pemantauan Merchant', inst: 'PJP pengakuisisi' },
    pjp_pejabat: { nama: 'Pejabat Kepatuhan APU-PPT', inst: 'PJP pengakuisisi' },
    bi: { nama: 'Pengawas Sistem Pembayaran', inst: 'Bank Indonesia' },
    ppatk: { nama: 'Analis Transaksi Keuangan', inst: 'PPATK' }
  };
  var DEMO_USERS = [
    { email: 'rani@arunika.demo', nama: 'Rani Kusumawardani', role: 'pjp_analis', unit: 'PJP Arunika - Unit Pemantauan Transaksi', nip: 'ARK-04417', pass: hash('demo1234'), c: '#1E5BD8' },
    { email: 'dimas@arunika.demo', nama: 'Dimas Prakoso', role: 'pjp_pejabat', unit: 'PJP Arunika - Kepatuhan APU-PPT', nip: 'ARK-01102', pass: hash('demo1234'), c: '#0B2A5B' },
    { email: 'laras@bi.demo', nama: 'Laras Ayuningtyas', role: 'bi', unit: 'Departemen Pengawasan Sistem Pembayaran', nip: 'BI-DEMO-2291', pass: hash('demo1234'), c: '#F5A524' },
    { email: 'yoga@ppatk.demo', nama: 'Yoga Pratama', role: 'ppatk', unit: 'Direktorat Analisis Transaksi', nip: 'PPATK-DEMO-0815', pass: hash('demo1234'), c: '#E0413A' }
  ];
  var users = load('users', null); if (!users) { users = DEMO_USERS.slice(); save('users', users); }
  var session = load('session', null);
  var settings = load('settings', { kapasitas: 4 });
  function me() { return session && users.filter(function (u) { return u.email === session; })[0]; }
  function isPJP() { var u = me(); return u && (u.role === 'pjp_analis' || u.role === 'pjp_pejabat'); }

  // ---------- tanggal dan hari kerja ----------
  var BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  var HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  function today() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function fmtD(d) { d = new Date(d); return d.getDate() + ' ' + BULAN[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear(); }
  function fmtDT(d) { d = new Date(d); return fmtD(d) + ', ' + String(d.getHours()).padStart(2, '0') + '.' + String(d.getMinutes()).padStart(2, '0'); }
  function addWorkdays(d, n) { d = new Date(d); var k = 0; while (k < n) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) k++; } return d; }
  function workdaysBetween(a, b) { a = new Date(a); b = new Date(b); a.setHours(0, 0, 0, 0); b.setHours(0, 0, 0, 0); var n = 0, s = a < b ? 1 : -1; while (a.getTime() !== b.getTime()) { a.setDate(a.getDate() + s); if (a.getDay() !== 0 && a.getDay() !== 6) n += s; } return n; }
  function subWorkdays(d, n) { d = new Date(d); var k = 0; while (k < n) { d.setDate(d.getDate() - 1); if (d.getDay() !== 0 && d.getDay() !== 6) k++; } return d; }

  // ---------- kasus DEMO ----------
  var oranye = T.merchants.filter(function (m) { return m.level === 'oranye'; }).sort(function (a, b) { return b.score - a.score; });
  function at(d, h, mi) { d = new Date(d); d.setHours(h, mi || 0, 0, 0); return d.toISOString(); }
  function seedCases() {
    var t = today(), c = [];
    var a = oranye[0], b = oranye[3], d = oranye[6], e = T.merchants.filter(function (m) { return m.scenario === 'acara'; })[0];
    var s1 = subWorkdays(t, 2); s1.setHours(9, 40);
    c.push({ id: 'KS-' + t.getFullYear() + '-0141', mid: a.id, status: 'Dibatasi', dibuka: at(subWorkdays(t, 3), 8, 52), petugas: 'Rani Kusumawardani',
      setuju: [{ nama: 'Dimas Prakoso', waktu: s1.toISOString() }, { nama: 'Hana Lestari', waktu: new Date(s1.getTime() + 36e5).toISOString() }], mulaiBatas: new Date(s1.getTime() + 36e5).toISOString(),
      log: [{ t: at(subWorkdays(t, 3), 6, 15), s: 'Sistem', a: 'Level Oranye, 3 dari 3 kelompok sinyal. Masuk antrean.' }, { t: at(subWorkdays(t, 3), 8, 52), s: 'Rani Kusumawardani', a: 'Kasus dibuka. Verifikasi lapangan dijadwalkan.' },
        { t: s1.toISOString(), s: 'Rani Kusumawardani', a: 'Mengajukan penundaan transaksi. Alamat usaha tidak ditemukan saat kunjungan.' }, { t: s1.toISOString(), s: 'Dimas Prakoso', a: 'Persetujuan pertama.' },
        { t: new Date(s1.getTime() + 36e5).toISOString(), s: 'Hana Lestari', a: 'Persetujuan kedua. Berita acara diterbitkan, salinan dikirim ke merchant.' }] });
    c.push({ id: 'KS-' + t.getFullYear() + '-0143', mid: b.id, status: 'Investigasi', dibuka: at(subWorkdays(t, 1), 10, 5), petugas: 'Rani Kusumawardani', setuju: [],
      log: [{ t: at(subWorkdays(t, 1), 6, 15), s: 'Sistem', a: 'Level Oranye, masuk antrean.' }, { t: at(subWorkdays(t, 1), 10, 5), s: 'Rani Kusumawardani', a: 'Kasus dibuka. Permintaan dokumen usaha dikirim.' }] });
    c.push({ id: 'KS-' + t.getFullYear() + '-0127', mid: d.id, status: 'Diteruskan', dibuka: at(subWorkdays(t, 9), 9, 20), petugas: 'Rani Kusumawardani', setuju: [],
      ltkm: at(subWorkdays(t, 7), 15, 40), log: [{ t: at(subWorkdays(t, 9), 9, 20), s: 'Rani Kusumawardani', a: 'Kasus dibuka.' }, { t: at(subWorkdays(t, 7), 15, 40), s: 'Dimas Prakoso', a: 'LTKM dikirim ke PPATK (2 hari kerja sejak unsur TKM diketahui).' }] });
    c.push({ id: 'KS-' + t.getFullYear() + '-0119', mid: e.id, status: 'Tidak terbukti', dibuka: at(subWorkdays(t, 12), 13, 10), petugas: 'Rani Kusumawardani', setuju: [],
      hasil: 'Lonjakan bertepatan dengan jadwal pertandingan di stadion terdekat. Pembayar adalah pelanggan lokal yang tidak terhubung dengan merchant lain. Status dipulihkan ke Hijau.',
      log: [{ t: at(subWorkdays(t, 12), 13, 10), s: 'Rani Kusumawardani', a: 'Kasus dibuka dari tinjauan manual level Kuning.' }, { t: at(subWorkdays(t, 11), 16, 25), s: 'Rani Kusumawardani', a: 'Ditutup: tidak terbukti. Merchant diberi tahu.' }] });
    return c;
  }
  var cases = load('cases', null); if (!cases) { cases = seedCases(); save('cases', cases); }
  function caseOf(mid) { return cases.filter(function (c) { return c.mid === mid && c.status !== 'Tidak terbukti'; })[0]; }
  function effLevel(m) { var c = caseOf(m.id); return c && (c.status === 'Dibatasi' || c.status === 'Keberatan') ? 'merah' : m.level; }

  // ---------- kerangka ----------
  function navFor(u) {
    if (u.role === 'bi') return [['beranda', 'home', 'Beranda'], ['pengawasan', 'shield', 'Pengawasan'], ['bukti', 'chart', 'Bukti'], ['simulator', 'sliders', 'Simulator'], ['menu', 'menu', 'Menu']];
    if (u.role === 'ppatk') return [['beranda', 'home', 'Beranda'], ['ltkm', 'file', 'LTKM'], ['bukti', 'chart', 'Bukti'], ['simulator', 'sliders', 'Simulator'], ['menu', 'menu', 'Menu']];
    return [['beranda', 'home', 'Beranda'], ['antrean', 'queue', 'Antrean'], ['kasus', 'folder', 'Kasus'], ['bukti', 'chart', 'Bukti'], ['menu', 'menu', 'Menu']];
  }
  function initials(n) { return String(n || '?').split(' ').filter(Boolean).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase(); }
  function avatar(u) { return '<span class="av" style="background:' + (u.c || '#33507F') + '">' + esc(initials(u.nama)) + '</span>'; }
  function cu(v, d, pre, suf) { pre = pre || ''; suf = suf || ''; d = d || 0; return '<span class="num cu" data-cu="' + v + '" data-d="' + d + '" data-pre="' + pre + '" data-suf="' + suf + '">' + pre + idn(v, d) + suf + '</span>'; }
  var skipAnim = false, RED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function animate(root) {
    if (!RED) root.querySelectorAll('[data-cu]').forEach(function (el) {
      var v = +el.dataset.cu, d = +el.dataset.d, pre = el.dataset.pre, suf = el.dataset.suf, t0 = null, dur = 1000;
      function step(t) { if (t0 === null) t0 = t; var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = pre + idn(v * e, d) + suf; if (k < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    });
    var m = root.querySelector('main.enter'); if (m) setTimeout(function () { m.classList.remove('enter'); }, 1700);
  }
  function shell(title, sub, body, opt) {
    opt = opt || {}; var u = me(), cur = location.hash.split('/')[1] || 'beranda';
    var n = navFor(u).map(function (x) {
      var cnt = x[0] === 'antrean' ? oranye.filter(function (m) { return !caseOf(m.id); }).length : 0, dot = cnt ? '<span class="dot">' + cnt + '</span>' : '';
      return '<a href="#/' + x[0] + '" class="' + (cur === x[0] || (opt.nav === x[0]) ? 'on' : '') + '">' + icon(x[1]) + x[2] + dot + '</a>';
    }).join('');
    var lead = opt.back ? '<button class="iconbtn" onclick="history.back()" aria-label="Kembali">' + icon('back') + '</button>' : '<a class="logo" href="#/beranda" aria-label="Beranda"><img src="assets/img/logo.png" alt=""></a>';
    var trail = (opt.right || '') + (opt.back ? '' : '<a class="avbtn" href="#/akun" aria-label="Akun">' + avatar(u) + '</a>');
    app.innerHTML = '<header class="topbar">' + lead + '<div class="ttl"><h1>' + title + '</h1>' + (sub ? '<div class="sub">' + sub + '</div>' : '') + '</div>' + trail + '</header>' +
      '<main class="page' + (skipAnim ? '' : ' enter') + '">' + body + '</main><nav class="bnav"><div class="bnav-in">' + n + '</div></nav>';
    if (!skipAnim) { window.scrollTo(0, 0); animate(app); }
    skipAnim = false;
    var tb = app.querySelector('.topbar'); window.onscroll = function () { tb.classList.toggle('scrolled', window.scrollY > 4); }; tb.classList.toggle('scrolled', window.scrollY > 4);
  }
  function toast(msg) { var t = document.createElement('div'); t.className = 'toast'; t.innerHTML = '<i>' + icon('check') + '</i><span></span>'; t.querySelector('span').textContent = msg; document.body.appendChild(t); setTimeout(function () { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; }, 2400); setTimeout(function () { t.remove(); }, 2750); }
  function sheet(html) {
    var bg = document.createElement('div'); bg.className = 'sheet-bg'; bg.innerHTML = '<div class="sheet" role="dialog"><div class="grab"></div>' + html + '</div>';
    bg.addEventListener('click', function (e) { if (e.target === bg) bg.remove(); }); document.body.appendChild(bg); return bg;
  }

  // ---------- masuk dan daftar ----------
  function viewAuth(mode) {
    var reg = mode === 'daftar';
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
  function loginForm() {
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
  function login(email) { session = email; save('session', session); location.hash = '#/beranda'; route(); }

  // ---------- beranda ----------
  function greet() { var h = new Date().getHours(); return h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam'; }
  function viewBeranda() {
    var u = me(), d = new Date(), cnt = { hijau: 0, kuning: 0, oranye: 0, merah: 0 };
    T.merchants.forEach(function (m) { cnt[effLevel(m)]++; });
    var open = cases.filter(function (c) { return c.status === 'Investigasi' || c.status === 'Menunggu persetujuan' || c.status === 'Dibatasi' || c.status === 'Keberatan'; });
    var waiting = oranye.filter(function (m) { return !caseOf(m.id); });
    var bat = cases.filter(function (c) { return c.status === 'Dibatasi' || c.status === 'Keberatan'; }).map(function (c) { return workdaysBetween(today(), addWorkdays(c.mulaiBatas, 5)); });
    var kpi = isPJP() ? '<div class="row"><div class="kpi"><b>' + cu(waiting.length) + '</b><span>Oranye belum ditangani</span></div><div class="kpi"><b>' + cu(settings.kapasitas) + '</b><span>Kapasitas periksa hari ini</span></div><div class="kpi"><b>' + cu(open.length) + '</b><span>Kasus aktif</span></div></div>'
      : u.role === 'bi' ? '<div class="row"><div class="kpi"><b>' + cu(3) + '</b><span>PJP diawasi</span></div><div class="kpi"><b>' + cu(open.length) + '</b><span>Kasus aktif</span></div><div class="kpi"><b>0</b><span>Lewat 5 hari kerja</span></div></div>'
        : '<div class="row"><div class="kpi"><b>' + cu(cases.filter(function (c) { return c.status === 'Diteruskan'; }).length) + '</b><span>LTKM dari PJP</span></div><div class="kpi"><b>' + cu(oranye.length) + '</b><span>Merchant Oranye</span></div><div class="kpi"><b>' + cu(open.length) + '</b><span>Kasus aktif</span></div></div>';
    var tot = T.merchants.length;
    var top = waiting.slice(0, 3).map(itemRow).join('') || '<div class="empty">Tidak ada merchant Oranye yang menunggu.</div>';
    var body = '<div class="hello"><img class="wm" src="assets/img/logo.png" alt=""><small>' + greet() + ', ' + HARI[d.getDay()] + ' ' + fmtD(d) + '</small><div class="name">' + esc(u.nama.split(' ')[0]) + '</div>' + kpi + '</div>' +
      (bat.length && isPJP() ? '<div class="countdown">' + icon('clock') + '<div><b class="num">' + Math.min.apply(null, bat) + ' hari kerja</b><br><span>sisa batas penundaan terdekat (UU 8/2010 Pasal 26: paling lama 5 hari kerja)</span></div></div>' : '') +
      '<div class="card"><h3>Sebaran level merchant</h3><p class="hint">Portofolio merchant yang dipantau hari ini</p>' + donut(cnt, tot) +
      '<div class="note">Sebagian besar Kuning adalah usaha yang ramai malam hari atau bernominal seragam. Mereka hanya dipantau otomatis dan tidak masuk antrean pemeriksaan.</div></div>' +
      (isPJP() ? '<div class="sec-title"><h2>Perlu diperiksa</h2><a href="#/antrean">Lihat antrean</a></div><div class="list">' + top + '</div>' : '') +
      (u.role === 'ppatk' ? '<div class="sec-title"><h2>Tentang LTKM</h2></div>' + ltkmInfo(false) + '<div class="sec-title"><h2>LTKM terbaru</h2><a href="#/ltkm">Lihat semua</a></div><div class="list">' + cases.filter(function (c) { return c.status === 'Diteruskan'; }).map(caseRow).join('') + '</div>' : '') +
      (u.role === 'bi' ? '<div class="sec-title"><h2>Pengawasan</h2><a href="#/pengawasan">Buka</a></div><div class="card"><h3>Kepatuhan batas waktu PJP</h3><p class="hint">Ringkasan kepatuhan tiga PJP terhadap batas lapor 3 hari kerja dan penundaan 5 hari kerja.</p></div>' : '') +
      '<div class="sec-title"><h2>Angka resmi</h2><a href="#/bukti">Pusat bukti</a></div><div class="grid2">' +
      stat('Frekuensi deposit judi daring melalui QRIS, Sem I 2026', cu(87.66, 2, '', '%'), 'resmi', 'PPATK, siaran pers Agustus 2026') +
      stat('Rata-rata satu deposit melalui QRIS', cu(Math.round(H.deposit.rata2_qris_rp), 0, 'Rp'), 'hitungan', 'dari PPATK, Laporan Semester I 2026') +
      stat('Merchant QRIS, Juni 2026', cu(H.qris.merchant_juta, 2, '', ' juta'), 'resmi', 'BI, siaran pers 28/159/DKom') +
      stat('Laporan indikasi Perjudian, Jan-Sep 2026 dibanding 2025', cu((1 - H.m2.jan_sep_2026 / H.m2.jan_sep_2025) * 100, 1, '-', '%'), 'hitungan', 'dari PPATK, Buletin APUPPT Sep 2026') + '</div>' +
      '<div class="sec-title"><h2>Pintasan</h2></div><div class="list menu">' +
      menuLink('#/simulator', 'sliders', 'Simulator ambang', 'Lihat mengapa angkringan dini hari tidak ikut terjaring') +
      menuLink('#/jejaring/' + oranye[0].id, 'net', 'Jejaring pembayar', 'Klaster merchant yang berbagi pembayar') + '</div>';
    shell('TAPIS', esc(u.unit), body);
  }
  function stat(lab, val, kind, src) { return '<div class="stat"><div class="lab">' + lab + '</div><div class="val num">' + val + '</div><div class="src">' + badge(kind) + ' ' + src + '</div></div>'; }
  function donut(cnt, tot) {
    var off = 0, L = ['hijau', 'kuning', 'oranye', 'merah'], sg = L.map(function (l, i) { var p = cnt[l] / tot * 100, g = p > 0 ? Math.max(0.01, p - 1.2) : 0; var c = p > 0 ? '<circle class="sg" r="15.9155" cx="21" cy="21" fill="none" stroke="var(--lv-' + l + ')" stroke-width="5" stroke-linecap="round" stroke-dasharray="' + g.toFixed(2) + ' ' + (100 - g).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '" style="animation-delay:' + (i * 0.12) + 's"/>' : ''; off += p; return c; }).join('');
    var lst = L.map(function (l) { return '<div><i style="background:var(--lv-' + l + ')"></i><span>' + U.LV[l] + '</span><b>' + cu(cnt[l]) + '</b><em>' + idn(cnt[l] / tot * 100) + '%</em></div>'; }).join('');
    return '<div class="donutwrap"><div class="donut-box"><svg class="donut" viewBox="0 0 42 42"><circle r="15.9155" cx="21" cy="21" fill="none" stroke="#EEF2F8" stroke-width="5"/>' + sg + '</svg><div class="c"><b>' + cu(tot) + '</b><span>merchant</span></div></div><div class="lvlist">' + lst + '</div></div>';
  }
  var LVCOL = { hijau: '#17A673', kuning: '#E0A100', oranye: '#F07A1A', merah: '#E0413A' };
  function gauge(score, lv) {
    return '<div class="gauge"><svg viewBox="0 0 120 120"><defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3B82F6"/><stop offset="1" stop-color="' + LVCOL[lv] + '"/></linearGradient></defs><circle class="trk" cx="60" cy="60" r="50" pathLength="100"/><circle class="val" cx="60" cy="60" r="50" pathLength="100" stroke="url(#gg)" stroke-dasharray="' + score + ' 100"/></svg><div class="gv"><b>' + cu(score) + '</b><span>skor dari 100</span></div></div>';
  }
  function stPill(st) { var k = { 'Investigasi': 'investigasi', 'Menunggu persetujuan': 'menunggu', 'Dibatasi': 'dibatasi', 'Keberatan': 'keberatan', 'Tidak terbukti': 'tidak', 'Diteruskan': 'diteruskan' }[st] || ''; return '<span class="pill st-' + k + '">' + st + '</span>'; }
  function menuLink(href, ic, t, s) { return '<a href="' + href + '"><span class="mi">' + icon(ic) + '</span><span><b>' + t + '</b><span>' + s + '</span></span>' + icon('chev', 'chev') + '</a>'; }
  function groupsBar(m) { return '<div class="groups">' + ['J', 'P', 'K'].map(function (g) { return '<span class="' + (m.sig[g] ? 'on' : '') + '"></span>'; }).join('') + '</div>'; }
  function itemRow(m) {
    var c = caseOf(m.id);
    return '<a class="item" href="#/merchant/' + m.id + '"><span class="thumb">' + U.storefront(m, 44) + '</span><span class="meta"><div class="t">' + esc(m.nama) + '</div><div class="s">' + esc(m.kategori) + ' &middot; ' + esc(m.kota) + (c ? ' &middot; ' + c.status : '') + '</div><div style="margin-top:4px">' + level(effLevel(m)) + '</div></span>' +
      '<span class="right"><div class="score num">' + m.score + '<small>skor</small></div>' + groupsBar(m) + '</span></a>';
  }

  // ---------- antrean ----------
  var qFilter = 'oranye', qSearch = '';
  function viewAntrean() {
    var list = T.merchants.filter(function (m) { var l = effLevel(m); return qFilter === 'semua' ? true : l === qFilter; })
      .filter(function (m) { return !qSearch || (m.nama + ' ' + m.kota + ' ' + m.kategori + ' ' + m.nmid).toLowerCase().indexOf(qSearch) >= 0; })
      .sort(function (a, b) { return b.score - a.score; });
    var K = settings.kapasitas, body = '';
    var chips = [['oranye', 'Oranye'], ['merah', 'Merah'], ['kuning', 'Kuning'], ['hijau', 'Hijau'], ['semua', 'Semua']].map(function (c) { return '<button class="chip ' + (qFilter === c[0] ? 'on' : '') + '" data-f="' + c[0] + '">' + c[1] + '</button>'; }).join('');
    body += '<div class="search">' + icon('search') + '<input id="q" placeholder="Cari nama, kota, atau NMID" value="' + esc(qSearch) + '"></div><div class="chips">' + chips + '</div>';
    if (qFilter === 'oranye') {
      var w = list.filter(function (m) { return !caseOf(m.id); }), inCap = w.slice(0, K), wait = w.slice(K), handled = list.filter(function (m) { return caseOf(m.id); });
      var used = Math.min(w.length, K);
      body += '<div class="card"><div class="flex between"><h3>Antrean sadar kapasitas</h3><button class="chip" id="cap">Ubah</button></div><p class="hint">Hanya ' + K + ' merchant teratas yang diperiksa hari ini. Sisanya menunggu dan tidak diblokir otomatis.</p>' +
        '<div class="cap mt12"><div class="bar"><b style="width:' + (used / Math.max(K, w.length) * 100) + '%"></b><b class="over" style="width:' + (Math.max(0, w.length - K) / Math.max(K, w.length) * 100) + '%"></b></div><span class="small num">' + w.length + ' / ' + K + '</span></div></div>' +
        '<div class="sec-title"><h2>Diperiksa hari ini</h2><span class="small muted">' + inCap.length + ' merchant</span></div><div class="list">' + (inCap.map(itemRow).join('') || '<div class="empty">Kosong</div>') + '</div>' +
        (wait.length ? '<div class="sec-title"><h2>Menunggu kapasitas</h2><span class="small muted">' + wait.length + ' merchant</span></div><div class="list">' + wait.map(itemRow).join('') + '</div>' : '') +
        (handled.length ? '<div class="sec-title"><h2>Sudah ditangani</h2></div><div class="list">' + handled.map(itemRow).join('') + '</div>' : '');
    } else {
      if (qFilter === 'kuning') body += '<div class="note mt0" style="margin-bottom:12px">Kuning tidak masuk antrean. Merchant dipantau otomatis tanpa pemberitahuan atau pembatasan apa pun.</div>';
      body += '<div class="list">' + (list.map(itemRow).join('') || '<div class="empty">Tidak ada merchant pada level ini.</div>') + '</div>';
    }
    shell('Antrean', 'Diurutkan menurut skor peringkat, bukan peluang', body);
    app.querySelectorAll('[data-f]').forEach(function (b) { b.onclick = function () { qFilter = b.dataset.f; viewAntrean(); }; });
    var q = app.querySelector('#q'); q.oninput = function () { qSearch = q.value.toLowerCase(); var pos = q.selectionStart; skipAnim = true; viewAntrean(); var n = app.querySelector('#q'); n.focus(); n.setSelectionRange(pos, pos); };
    var cb = app.querySelector('#cap'); if (cb) cb.onclick = function () {
      var s = sheet('<h3>Kapasitas pemeriksa</h3><p class="small muted">Jumlah merchant yang dapat diverifikasi tim hari ini. Nilai ini menentukan K pada antrean Top-K.</p><input type="range" id="k" min="1" max="10" value="' + K + '"><div class="big num" id="kv">' + K + ' merchant</div><button class="btn mt12" id="ks">Simpan</button>');
      var r = s.querySelector('#k'); r.oninput = function () { s.querySelector('#kv').textContent = r.value + ' merchant'; };
      s.querySelector('#ks').onclick = function () { settings.kapasitas = +r.value; save('settings', settings); s.remove(); viewAntrean(); };
    };
  }

  // ---------- profil merchant ----------
  function reasons(m) {
    var r = [];
    r.push(['J', 'Jejaring pembayar', m.sig.J, m.sig.J ? idn(m.sharedShare * 100) + '% pembayar juga membayar di 4 merchant lain atau lebih; terhubung dengan ' + m.nLinks + ' merchant lewat pembayar yang sama.' : 'Pembayar didominasi pelanggan sendiri (' + idn(m.sharedShare * 100) + '% pembayar bersama).']);
    r.push(['P', 'Perubahan mendadak relatif sebaya', m.sig.P, 'Robust Z volume 14 hari terhadap ' + esc(m.kategori.toLowerCase()) + ' sejenis = ' + idn(m.peerZ, 1) + (m.cusum.alarmAt >= 0 ? '; CUSUM melewati batas pada hari ke-' + (m.cusum.alarmAt + 1) + '.' : '; CUSUM tidak melewati batas.')]);
    var k = []; if (m.newHot) k.push('merchant baru (' + m.umur + ' hari) dengan volume di atas 3 kali persentil 90 sebaya'); if (Math.abs(m.tickZ) >= 3) k.push('nominal rata-rata ' + rp(m.tick) + ' tidak lazim untuk kategori ini (Robust Z ' + idn(m.tickZ, 1) + ')'); if (m.listed) k.push(m.listed + ' pembayar cocok dengan daftar rujukan rekening situs terlapor');
    r.push(['K', 'Profil dan daftar rujukan', m.sig.K, k.length ? k.join('; ') + '.' : 'Profil usaha sesuai pola transaksi; tidak ada kecocokan daftar.']);
    return r;
  }
  function notProof(m) {
    var a = [];
    if (m.weak.malam) a.push('Aktif pada malam hingga dini hari (' + idn(m.nightShare * 100) + '% transaksi pukul 22.00-05.00). Wajar bagi angkringan, kedai kopi, dan usaha malam.');
    if (m.weak.seragam) a.push('Nominal seragam (' + idn(m.uniform * 100) + '% transaksi pada satu nilai). Wajar bagi pulsa, token, dan menu harga tetap.');
    if (m.tick < 100000) a.push('Nominal di bawah Rp100.000. Rata-rata transaksi QRIS nasional sekitar ' + rp(H.qris.rata2_transaksi_rp) + ' sehingga nominal kecil adalah hal biasa.');
    a.push('Skor ' + m.score + ' adalah peringkat relatif terhadap merchant lain, bukan peluang bahwa merchant ini terlibat judi daring.');
    return a;
  }
  function viewMerchant(id) {
    var m = T.byId(id); if (!m) return viewAntrean();
    var lv = effLevel(m), c = caseOf(m.id), u = me(), n = m.nGroups;
    var rule = lv === 'oranye' ? n + ' dari 3 kelompok sinyal aktif. Syarat Oranye (minimal 2 kelompok) terpenuhi, sehingga merchant masuk antrean verifikasi manusia.'
      : lv === 'merah' ? 'Penundaan transaksi telah disetujui dua pejabat. Merchant menerima salinan berita acara dan dapat mengajukan keberatan.'
        : lv === 'kuning' ? (n === 1 ? 'Hanya 1 kelompok sinyal aktif. Satu kelompok tidak cukup untuk verifikasi; merchant cukup dipantau.' : 'Tidak ada kelompok sinyal kuat. Hanya sinyal lemah (jam atau nominal) yang tercatat, dan sinyal lemah dibatasi paling tinggi Kuning.')
          : 'Tidak ada sinyal yang perlu ditindaklanjuti.';
    var rs = reasons(m).map(function (r) { return '<div class="reason"><span class="ic ' + (r[2] ? 'on' : 'off') + '">' + icon(r[2] ? 'check' : 'x') + '</span><div><b>' + r[1] + ' <span class="tag ' + r[0].toLowerCase() + '">' + r[0] + '</span></b><p>' + r[3] + '</p></div></div>'; }).join('');
    var act = '';
    if (isPJP()) {
      if (c) act = '<a class="btn" href="#/kasus/' + c.id + '">' + icon('folder') + 'Buka kasus ' + c.id + '</a>';
      else if (lv === 'oranye') act = '<button class="btn" id="open">' + icon('folder') + 'Buka kasus verifikasi</button>';
      else act = '<button class="btn sec" disabled>' + icon('lock') + 'Kasus hanya dapat dibuka untuk level Oranye</button>';
    }
    var body = '<div class="mhead"><span class="photo">' + U.storefront(m, 72) + '</span><div><h2>' + esc(m.nama) + '</h2><div class="s">' + esc(m.kategori) + ' &middot; ' + esc(m.kota) + '</div><div class="mt8">' + level(lv, true) + '</div></div></div>' +
      '<div class="card"><div class="scorecard">' + gauge(m.score, lv) + '<div class="sigs"><div class="small muted" style="font-weight:600">Kelompok sinyal ' + n + ' dari 3</div>' + [['J', 'Jejaring pembayar'], ['P', 'Perubahan sebaya'], ['K', 'Profil dan daftar']].map(function (g) { return '<div class="sig ' + (m.sig[g[0]] ? 'on' : '') + '"><i>' + g[0] + '</i>' + g[1] + '</div>'; }).join('') + '</div></div><p class="note">' + rule + '</p></div>' +
      '<div class="card"><h3>Kartu alasan</h3><p class="hint">Setiap level harus dapat dijelaskan kepada pemeriksa dan merchant.</p>' + rs +
      '<div class="notproof"><h4>Yang bukan bukti</h4><ul>' + notProof(m).map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div></div>' +
      '<div class="card"><div class="flex between"><h3>Linimasa transaksi harian</h3><span class="small muted">56 hari</span></div><p class="hint">Garis gelap = merchant; pita = persentil 10-90 merchant sejenis; garis putus = median sebaya.</p>' + U.timeline(m) + '</div>' +
      '<div class="card"><h3>Jam transaksi</h3><p class="hint">Batang gelap = pukul 22.00-05.00. Pola jam tidak pernah dipakai sendirian.</p>' + U.hours(m) + '</div>' +
      '<div class="card"><h3>Identitas merchant</h3><dl class="kv mt8"><dt>NMID</dt><dd class="num">' + m.nmid + '</dd><dt>MCC</dt><dd>' + m.mcc + '</dd><dt>Kriteria</dt><dd>' + m.usaha + '</dd><dt>Pemilik</dt><dd>' + m.pemilik + '</dd><dt>Umur merchant</dt><dd>' + m.umur + ' hari</dd><dt>PJP</dt><dd>' + esc(m.pjp) + '</dd><dt>Transaksi 14 hari</dt><dd class="num">' + idn(m.trx14) + '</dd><dt>Rata-rata nominal</dt><dd class="num">' + rp(m.tick) + '</dd><dt>Pembayar unik</dt><dd class="num">' + m.uniq.length + '</dd></dl>' +
      (m.catatan ? '<p class="warnnote">' + esc(m.catatan) + '</p>' : '') + '</div>' +
      (m.nLinks ? '<a class="btn sec" href="#/jejaring/' + m.id + '" style="margin-bottom:10px">' + icon('net') + 'Lihat jejaring pembayar</a>' : '') + act;
    shell('Profil merchant', m.nmid, body, { back: true, nav: 'antrean' });
    var ob = app.querySelector('#open'); if (ob) ob.onclick = function () {
      var t = new Date(), id = 'KS-' + t.getFullYear() + '-' + String(150 + cases.length).padStart(4, '0');
      cases.unshift({ id: id, mid: m.id, status: 'Investigasi', dibuka: t.toISOString(), petugas: u.nama, setuju: [], log: [{ t: t.toISOString(), s: 'Sistem', a: 'Level Oranye, ' + n + ' dari 3 kelompok sinyal.' }, { t: t.toISOString(), s: u.nama, a: 'Kasus dibuka.' }] });
      save('cases', cases); toast('Kasus ' + id + ' dibuka'); location.hash = '#/kasus/' + id;
    };
  }

  // ---------- jejaring ----------
  function viewJejaring(id) {
    var m = T.byId(id) || oranye[0], g = U.network(m, T);
    var body = '<div class="card"><h3>' + esc(m.nama) + '</h3><p class="hint">Kotak = merchant (garis tepi menunjukkan level). Titik = pembayar. Titik jingga membayar di 3 merchant atau lebih; titik merah tercatat di daftar rujukan.</p>' + g.svg +
      '<div class="legend"><span><i style="background:#0B2A5B"></i>Merchant terpilih</span><span><i style="background:#F07A1A"></i>Pembayar bersama</span><span><i style="background:#E0413A"></i>Daftar rujukan</span><span><i style="background:#94A3B8"></i>Pembayar biasa</span></div></div>' +
      '<div class="grid2"><div class="stat"><div class="lab">Merchant dalam klaster</div><div class="val num">' + g.nMerchant + '</div></div><div class="stat"><div class="lab">Pembayar bersama</div><div class="val num">' + g.nShared + '</div></div></div>' +
      '<div class="card mt12"><h3>Mengapa jejaring</h3><p class="small">Bandar dapat dengan mudah mengganti nominal atau jam setor, tetapi sulit membangun ulang jaringan pemain. Sinyal ini paling mahal dipalsukan sehingga diberi bobot terbesar (0,35).</p></div>';
    shell('Jejaring pembayar', 'Analisis graf merchant dan pembayar', body, { back: true, nav: 'antrean' });
    app.querySelectorAll('[data-m]').forEach(function (n) { n.addEventListener('click', function () { location.hash = '#/merchant/' + n.dataset.m; }); });
  }

  // ---------- kasus ----------
  function ltkmInfo(open) {
    return '<details class="info"' + (open ? ' open' : '') + '><summary><span class="q">' + icon('help') + '</span><span>Apa itu LTKM?<small>Laporan Transaksi Keuangan Mencurigakan</small></span>' + icon('chev', 'dd') + '</summary><div class="bd">' +
      '<p><b>LTKM</b> adalah singkatan dari <b>Laporan Transaksi Keuangan Mencurigakan</b>. LTKM merupakan laporan wajib yang disampaikan Pihak Pelapor kepada Pusat Pelaporan dan Analisis Transaksi Keuangan (<b>PPATK</b>) ketika terdeteksi adanya transaksi keuangan yang mencurigakan.</p>' +
      '<p>Pihak Pelapor mencakup Penyedia Jasa Keuangan (PJK), antara lain bank dan penyelenggara jasa pembayaran (PJP) seperti pengakuisisi merchant QRIS. Laporan dikirim ke PPATK, sedangkan Bank Indonesia mengawasi kepatuhan PJP dalam menjalankan kewajiban ini.</p>' +
      '<p>Transaksi tergolong mencurigakan bila:</p><ul><li>menyimpang dari profil, karakteristik, atau kebiasaan pola transaksi pengguna jasa;</li><li>patut diduga dilakukan untuk menghindari kewajiban pelaporan;</li><li>memakai harta kekayaan yang diduga berasal dari tindak pidana; atau</li><li>diminta PPATK untuk dilaporkan.</li></ul>' +
      '<p>Batas waktu: sesegera mungkin, paling lama <b>3 hari kerja</b> setelah unsur transaksi mencurigakan diketahui.</p>' +
      '<span class="lk">Dasar: UU 8/2010 Pasal 1 angka 5, Pasal 23 ayat (1), dan Pasal 25 ayat (1)</span></div></details>';
  }
  var ST = ['Investigasi', 'Menunggu persetujuan', 'Dibatasi', 'Keberatan', 'Tidak terbukti', 'Diteruskan'];
  function viewKasus() {
    var u = me(), list = u.role === 'ppatk' ? cases.filter(function (c) { return c.status === 'Diteruskan'; }) : cases;
    var body = ltkmInfo(u.role === 'ppatk') + '<div class="list">' + (list.map(caseRow).join('') || '<div class="empty">Belum ada kasus.</div>') + '</div>';
    shell(u.role === 'ppatk' ? 'LTKM dari PJP' : 'Kasus', 'Setiap tindakan tercatat di jejak audit', body, { nav: u.role === 'ppatk' ? 'ltkm' : 'kasus' });
  }
  function caseRow(c) {
    var m = T.byId(c.mid);
    return '<a class="item" href="#/kasus/' + c.id + '"><span class="thumb">' + U.storefront(m, 44) + '</span><span class="meta"><div class="t">' + c.id + '</div><div class="s">' + esc(m.nama) + ' &middot; dibuka ' + fmtD(c.dibuka) + '</div><div style="margin-top:4px">' + stPill(c.status) + '</div></span>' + icon('chev', 'chev') + '</a>';
  }
  function beritaAcara(c, m) {
    var end = addWorkdays(c.mulaiBatas, 5);
    return 'BERITA ACARA PENUNDAAN TRANSAKSI\nNomor: BA/' + c.id + '\n\nPada ' + fmtDT(c.mulaiBatas) + ' WIB, ' + m.pjp + ' melakukan penundaan transaksi atas merchant:\n  Nama      : ' + m.nama + '\n  NMID      : ' + m.nmid + '\n  Pemilik   : ' + m.pemilik +
      '\n\nAlasan    : terdapat ' + m.nGroups + ' kelompok sinyal transaksi keuangan mencurigakan yang telah diverifikasi petugas.\nJangka    : paling lama 5 (lima) hari kerja, sampai ' + fmtD(end) + '.\nDasar     : UU 8/2010 Pasal 26; PBI 10/2024 Pasal 37.\n\nPenundaan dilaporkan kepada PPATK paling lama 24 jam. Salinan berita acara ini diberikan kepada merchant. Merchant dapat menyampaikan keberatan disertai dokumen pendukung.\n\nDisetujui: ' + c.setuju.map(function (s) { return s.nama; }).join(' dan ') + '';
  }
  function ltkmDraft(c, m) {
    return 'DRAF LAPORAN TRANSAKSI KEUANGAN MENCURIGAKAN\nPelapor   : ' + m.pjp + '\nTerlapor  : ' + m.nama + ' (NMID ' + m.nmid + ')\nIndikasi TPA: Perjudian\n\nRingkasan alasan:\n' + reasons(m).filter(function (r) { return r[2]; }).map(function (r, i) { return (i + 1) + '. ' + r[1] + ': ' + r[3].replace(/<[^>]+>/g, ''); }).join('\n') +
      '\n\nHal yang telah dikesampingkan: jam transaksi dan nominal tidak dijadikan dasar laporan.\nBatas lapor: paling lama 3 hari kerja sejak unsur TKM diketahui (UU 8/2010 Pasal 25 ayat 1).';
  }
  function viewKasusDetail(id) {
    var c = cases.filter(function (x) { return x.id === id; })[0]; if (!c) return viewKasus();
    var m = T.byId(c.mid), u = me(), canAct = isPJP(), isPej = u.role === 'pjp_pejabat';
    function addLog(a, who) { c.log.push({ t: new Date().toISOString(), s: who || u.nama, a: a }); save('cases', cases); }
    var flow = [['Investigasi', 'Verifikasi oleh analis', 'Dokumen usaha, kunjungan, wawancara'], ['Menunggu persetujuan', 'Persetujuan dua pejabat', 'Syarat sebelum penundaan'], ['Dibatasi', 'Penundaan transaksi', 'Paling lama 5 hari kerja, berita acara'], ['Keberatan', 'Keberatan merchant', 'Hak merchant atas salinan dan klarifikasi'], ['Selesai', 'Tidak terbukti atau diteruskan', 'Pulihkan, atau LTKM ke PPATK']];
    var order = { 'Investigasi': 0, 'Menunggu persetujuan': 1, 'Dibatasi': 2, 'Keberatan': 3, 'Tidak terbukti': 4, 'Diteruskan': 4 }, cur = order[c.status];
    var steps = '<ul class="steps">' + flow.map(function (f, i) { return '<li class="' + (i < cur ? 'done' : i === cur ? (cur === 4 ? 'done' : 'now') : '') + '"><span class="b"></span><b>' + f[1] + '</b><span>' + f[2] + '</span></li>'; }).join('') + '</ul>';
    var top = '';
    if (c.status === 'Dibatasi' || c.status === 'Keberatan') {
      var end = addWorkdays(c.mulaiBatas, 5), left = workdaysBetween(today(), end);
      top = '<div class="countdown">' + icon('clock') + '<div><b class="num">' + Math.max(0, left) + ' hari kerja</b><br><span>tersisa sampai ' + fmtD(end) + '. Setelah itu penundaan wajib berakhir atau diteruskan sesuai kewenangan PPATK.</span></div></div>';
    }
    var acts = '';
    if (canAct) {
      if (c.status === 'Investigasi') acts = '<button class="btn" data-a="ajukan">Ajukan penundaan transaksi</button><div class="btnrow mt8"><button class="btn sec" data-a="bersih">Tidak terbukti</button><button class="btn sec" data-a="teruskan">Teruskan LTKM</button></div>';
      if (c.status === 'Menunggu persetujuan') {
        var already = c.setuju.some(function (s) { return s.nama === u.nama; });
        acts = '<div class="card"><h3>Persetujuan ' + c.setuju.length + ' dari 2</h3><p class="hint">' + (c.setuju.map(function (s) { return esc(s.nama) + ' (' + fmtDT(s.waktu) + ')'; }).join(', ') || 'Belum ada persetujuan') + '</p></div>' +
          (isPej && !already ? '<button class="btn" data-a="setuju">' + icon('check') + 'Setujui sebagai ' + esc(u.nama) + '</button>' : '') +
          (isPej && already ? '<button class="btn sec" data-a="setuju2">Simulasikan persetujuan pejabat kedua</button><p class="small muted mt8">Persetujuan kedua harus dari pejabat lain. Tombol ini hanya untuk demo.</p>' : '') +
          (!isPej ? '<p class="warnnote">Hanya pejabat kepatuhan yang dapat menyetujui. <a href="#" data-a="switch">Masuk sebagai Dimas Prakoso (akun demo)</a></p>' : '') + '<button class="btn ghost" data-a="batal">Batalkan pengajuan</button>';
      }
      if (c.status === 'Dibatasi') acts = '<button class="btn sec" data-a="ba">' + icon('file') + 'Lihat berita acara</button><button class="btn sec mt8" data-a="keberatan">Catat keberatan dari merchant</button><div class="btnrow mt8"><button class="btn sec" data-a="bersih">Tidak terbukti</button><button class="btn" data-a="teruskan">Teruskan LTKM</button></div>';
      if (c.status === 'Keberatan') acts = '<div class="card"><h3>Keberatan merchant</h3><p class="small">' + esc(c.keberatan) + '</p></div><button class="btn sec" data-a="ba">' + icon('file') + 'Lihat berita acara</button><div class="btnrow mt8"><button class="btn sec" data-a="bersih">Terima keberatan</button><button class="btn" data-a="teruskan">Teruskan LTKM</button></div>';
    }
    if (c.status === 'Diteruskan') acts = '<button class="btn sec" data-a="ltkm">' + icon('file') + 'Lihat draf LTKM</button>';
    if (c.status === 'Tidak terbukti') acts = '<div class="card"><h3>Hasil</h3><p class="small">' + esc(c.hasil || 'Ditutup: tidak terbukti.') + '</p></div>';
    var body = '<a class="item card" style="padding:12px" href="#/merchant/' + m.id + '"><span class="thumb">' + U.storefront(m, 44) + '</span><span class="meta"><div class="t">' + esc(m.nama) + '</div><div class="s">' + m.nmid + ' &middot; skor ' + m.score + '</div></span>' + level(effLevel(m)) + '</a>' + top +
      '<div class="card"><div class="flex between"><h3>Alur kasus</h3>' + stPill(c.status) + '</div>' + steps + '</div>' + acts +
      '<div class="card mt12"><h3>Jejak audit</h3><div class="log mt8">' + c.log.slice().reverse().map(function (l) { return '<div><time>' + fmtDT(l.t) + '</time><span><b>' + esc(l.s) + '</b>. ' + esc(l.a) + '</span></div>'; }).join('') + '</div></div>';
    shell(c.id, 'Dibuka ' + fmtD(c.dibuka) + ' oleh ' + esc(c.petugas), body, { back: true, nav: u.role === 'ppatk' ? 'ltkm' : 'kasus' });
    app.querySelectorAll('[data-a]').forEach(function (b) {
      b.onclick = function (e) {
        e.preventDefault(); var a = b.dataset.a;
        if (a === 'ajukan') { var s = sheet('<h3>Ajukan penundaan transaksi</h3><p class="small muted">Penundaan paling lama 5 hari kerja dan memerlukan persetujuan dua pejabat. Tuliskan hasil verifikasi yang menjadi dasar.</p><div class="field"><textarea id="why" rows="4" placeholder="Contoh: alamat usaha tidak ditemukan saat kunjungan, dokumen usaha tidak dapat diberikan."></textarea></div><button class="btn" id="go">Kirim pengajuan</button>'); s.querySelector('#go').onclick = function () { var w = s.querySelector('#why').value.trim(); if (w.length < 10) { toast('Isi alasan verifikasi terlebih dahulu'); return; } c.status = 'Menunggu persetujuan'; addLog('Mengajukan penundaan transaksi. ' + w); s.remove(); viewKasusDetail(id); }; }
        if (a === 'setuju' || a === 'setuju2') { var who = a === 'setuju' ? u.nama : 'Hana Lestari'; c.setuju.push({ nama: who, waktu: new Date().toISOString() }); addLog(c.setuju.length === 1 ? 'Persetujuan pertama.' : 'Persetujuan kedua. Berita acara diterbitkan, salinan dikirim ke merchant, penundaan dilaporkan ke PPATK.', who); if (c.setuju.length >= 2) { c.status = 'Dibatasi'; c.mulaiBatas = new Date().toISOString(); save('cases', cases); } viewKasusDetail(id); }
        if (a === 'switch') { login('dimas@arunika.demo'); location.hash = '#/kasus/' + id; }
        if (a === 'batal') { c.status = 'Investigasi'; c.setuju = []; addLog('Pengajuan penundaan dibatalkan.'); viewKasusDetail(id); }
        if (a === 'ba') sheet('<h3>Berita acara</h3><div class="doc">' + esc(beritaAcara(c, m)) + '</div>');
        if (a === 'ltkm') sheet('<h3>Draf LTKM</h3><p class="small muted" style="margin:0 0 10px">Laporan Transaksi Keuangan Mencurigakan yang dikirim PJP kepada PPATK.</p><div class="doc">' + esc(ltkmDraft(c, m)) + '</div>');
        if (a === 'keberatan') { var s2 = sheet('<h3>Catat keberatan merchant</h3><div class="field"><textarea id="kb" rows="4" placeholder="Ringkas keberatan dan dokumen yang dilampirkan merchant."></textarea></div><button class="btn" id="go">Simpan</button>'); s2.querySelector('#go').onclick = function () { var v = s2.querySelector('#kb').value.trim(); if (!v) return; c.status = 'Keberatan'; c.keberatan = v; addLog('Keberatan merchant dicatat: ' + v); s2.remove(); viewKasusDetail(id); }; }
        if (a === 'bersih') { c.status = 'Tidak terbukti'; c.hasil = 'Ditutup: tidak terbukti. Penundaan dicabut dan merchant diberi tahu.'; addLog('Ditutup: tidak terbukti. Status merchant dipulihkan.'); viewKasusDetail(id); }
        if (a === 'teruskan') { c.status = 'Diteruskan'; c.ltkm = new Date().toISOString(); addLog('LTKM dikirim ke PPATK.'); viewKasusDetail(id); }
      };
    });
  }

  // ---------- pengawasan BI ----------
  function viewPengawasan() {
    var rows = T.PJP.map(function (p, i) {
      var ms = T.merchants.filter(function (m) { return m.pjp === p; }), o = ms.filter(function (m) { return m.level === 'oranye'; }).length;
      var cs = cases.filter(function (c) { return T.byId(c.mid).pjp === p; });
      return { p: p, n: ms.length, o: o, k: cs.length, tepat: [100, 92, 100][i], lewat: 0, keb: cs.filter(function (c) { return c.keberatan; }).length, tt: cs.filter(function (c) { return c.status === 'Tidak terbukti'; }).length };
    });
    var body = '<div class="card"><h3>Kepatuhan PJP</h3><p class="hint">BI mengawasi kepatuhan PJP secara berbasis risiko (PBI 10/2024 Pasal 58), bukan memutus merchant satu per satu.</p>' +
      '<table class="mini mt8"><thead><tr><th>PJP</th><th class="r">Merchant</th><th class="r">Oranye</th><th class="r">Kasus</th></tr></thead><tbody>' + rows.map(function (r) { return '<tr><td>' + esc(r.p.replace('', '')) + '</td><td class="r num">' + r.n + '</td><td class="r num">' + r.o + '</td><td class="r num">' + r.k + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<div class="card"><h3>Ketepatan batas waktu</h3><table class="mini mt8"><thead><tr><th>PJP</th><th class="r">LTKM tepat 3 hari kerja</th><th class="r">Penundaan lewat 5 hari</th></tr></thead><tbody>' + rows.map(function (r) { return '<tr><td>' + esc(r.p.replace('', '')) + '</td><td class="r num">' + r.tepat + '%</td><td class="r num">' + r.lewat + '</td></tr>'; }).join('') + '</tbody></table>' +
      '<p class="note">Indikator yang diawasi: ketepatan lapor (UU 8/2010 Pasal 25), kepatuhan batas penundaan (Pasal 26), rasio kasus tidak terbukti, dan keberatan merchant. Rasio tidak terbukti yang tinggi menandakan ambang PJP terlalu longgar dan merugikan UMKM.</p></div>' +
      '<div class="card"><h3>Mengapa ambang perlu diawasi</h3><p class="small">Pada prevalensi acuan ' + idn(H.m3.prevalensi_acuan_persen, 4) + '%, ambang dengan FPR 1% di seluruh ' + idn(H.qris.merchant_juta, 2) + ' juta merchant menandai sekitar ' + idn(0.01 * H.qris.merchant_juta * 1e6) + ' merchant jujur setiap periode. ' + badge('hitungan') + '</p><a class="btn sec mt8" href="#/simulator/ambang">Buka simulator ambang</a></div>';
    shell('Pengawasan', 'Pengawasan sistem pembayaran', body);
  }

  // ---------- bukti resmi ----------
  var bTab = 'ringkas';
  function viewBukti(tab) {
    bTab = tab || bTab;
    var tabs = [['ringkas', 'Ringkasan'], ['m1', 'Deposit'], ['m2', 'Laporan'], ['m3', 'Ambang'], ['peta', 'Peta']].map(function (t) { return '<button class="' + (bTab === t[0] ? 'on' : '') + '" data-t="' + t[0] + '">' + t[1] + '</button>'; }).join('');
    var body = '<div class="tabs">' + tabs + '</div>' + ({ ringkas: bRingkas, m1: bM1, m2: bM2, m3: bM3, peta: bPeta }[bTab])();
    shell('Pusat bukti', 'Angka resmi PPATK, Bank Indonesia, dan BPS', body, { nav: 'bukti' });
    app.querySelectorAll('[data-t]').forEach(function (b) { b.onclick = function () { location.hash = '#/bukti/' + b.dataset.t; }; });
    if (bTab === 'peta') bindPeta();
  }
  function src(s) { return '<div class="srcline">Sumber: ' + s + '</div>'; }
  function bRingkas() {
    var d = H.deposit;
    return '<div class="grid2">' + stat('Merchant QRIS (96,68% UMKM)', cu(H.qris.merchant_juta, 2, '', ' juta'), 'resmi', 'BI 2026') + stat('Transaksi QRIS Sem I 2026', cu(H.qris.volume_miliar, 2, '', ' miliar'), 'resmi', 'BI 2026') +
      stat('Frekuensi deposit judi daring lewat QRIS', cu(87.66, 2, '', '%'), 'resmi', 'PPATK 2026') + stat('Rata-rata deposit lewat QRIS', cu(Math.round(d.rata2_qris_rp), 0, 'Rp'), 'hitungan', 'dari PPATK 2026') + '</div>' +
      '<div class="card mt12"><h3>Tiga temuan dari data resmi</h3>' +
      '<div class="reason"><span class="ic on">1</span><div><b>Deposit makin kecil dan makin sering</b><p>Frekuensi naik ' + idn((d.frek_sem1_2026_juta / d.frek_sem1_2025_juta - 1) * 100, 1) + '%, rata-rata turun ' + idn((1 - d.rata2_2026_rp / d.rata2_2025_rp) * 100, 1) + '%. Deposit QRIS rata-rata ' + rp(d.rata2_qris_rp) + ', di bawah rata-rata transaksi QRIS ' + rp(H.qris.rata2_transaksi_rp) + '.</p></div></div>' +
      '<div class="reason"><span class="ic on">2</span><div><b>Laporan turun bertahap</b><p>Dua titik patah (awal ' + H.m2.patah_bic.map(bln).join(' dan ') + '). Rata-rata ' + H.m2.segmen.map(function (s) { return idn(s.rata2_geometrik); }).join(', lalu ') + ' indikasi per bulan.</p></div></div>' +
      '<div class="reason"><span class="ic on">3</span><div><b>Ambang harus sangat ketat</b><p>Agar separuh tanda benar, FPR paling tinggi ' + idn(H.m3.fpr_maks_ppv50_persen, 4) + '% per merchant. Karena itu TAPIS mewajibkan dua kelompok sinyal.</p></div></div></div>';
  }
  function bln(s) { var p = s.split('-'); return BULAN[+p[1] - 1] + ' ' + p[0]; }
  function bM1() {
    var dep = R.deposit.filter(function (r) { return r.kanal === 'Semua kanal'; });
    var yr = ['2023', '2024', '2025', 'Sem I 2026'].map(function (p) { var r = dep.filter(function (x) { return x.periode === p; })[0]; return { l: p, v: r.nilai_rp / 1e12, t: 'Rp' + idn(r.nilai_rp / 1e12, 1) + ' T', c: p === 'Sem I 2026' ? '#1E5BD8' : '#94A3B8' }; });
    var d = H.deposit, mx = Math.max(Math.abs(d.efek_frek_T), Math.abs(d.efek_rata2_T));
    function hb(lab, v, col) { var w = Math.abs(v) / mx * 130; return '<div style="display:flex;align-items:center;gap:8px;margin:8px 0"><span style="width:92px;font-size:11.5px">' + lab + '</span><div style="flex:1;position:relative;height:22px"><div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:#CBD5E1"></div><div class="hbar' + (v < 0 ? ' neg' : '') + '" style="position:absolute;top:2px;height:18px;border-radius:5px;background:' + col + ';' + (v >= 0 ? 'left:50%' : 'right:50%') + ';width:' + (Math.abs(v) / mx * 48) + '%"></div></div><b class="num" style="width:74px;text-align:right;font-size:12px">' + (v < 0 ? '-' : '+') + 'Rp' + idn(Math.abs(v), 2) + ' T</b></div>'; }
    var cmp = [{ l: 'Deposit QRIS', v: d.rata2_qris_rp, c: '#E0413A', t: rp(d.rata2_qris_rp) }, { l: 'Transaksi QRIS', v: H.qris.rata2_transaksi_rp, c: '#1E5BD8', t: rp(H.qris.rata2_transaksi_rp) }, { l: 'Batas MDR 0%', v: 100000, c: '#CBD5E1', t: 'Rp100.000' }];
    return '<div class="card"><div class="flex between"><h3>Nilai deposit judi daring</h3>' + badge('resmi') + '</div>' + U.bars(yr) + src('PPATK, Laporan Semester I 2026, hal. 29.') + '</div>' +
      '<div class="card"><div class="flex between"><h3>Dekomposisi perubahan nilai</h3>' + badge('hitungan') + '</div><p class="hint">Sem I 2025 ke Sem I 2026: nilai naik ' + idn((Math.exp(d.log_total) - 1) * 100, 1) + '%.</p>' +
      hb('Efek frekuensi', d.efek_frek_T, '#1E5BD8') + hb('Efek rata-rata', d.efek_rata2_T, '#E0413A') + hb('Perubahan total', d.efek_frek_T + d.efek_rata2_T, '#0B2A5B') +
      '<p class="note">Kenaikan frekuensi hampir seluruhnya dihapus oleh turunnya nominal per transaksi. Pola ini sesuai dengan modus "nominal kecil, berulang, dan tersebar" yang disebut PPATK.</p>' + src('PPATK, Siaran Pers B/04/HM.05/3.1/VIII/2026; dekomposisi Kitagawa (1955).') + '</div>' +
      '<div class="card"><div class="flex between"><h3>Nominal tidak dapat menjadi pembeda</h3>' + badge('hitungan') + '</div>' + U.bars(cmp, { max: 115000 }) +
      '<p class="note">Rata-rata deposit lewat QRIS lebih kecil daripada rata-rata belanja QRIS dan berada di bawah batas MDR 0% yang berlaku 1 Oktober 2026. Aturan berbasis nominal justru akan menandai warung.</p>' + src('PPATK 2026; BI, Siaran Pers 28/159/DKom; diolah.') + '</div>';
  }
  function bM2() {
    var s = H.m2.deret, W = 340, Hh = 190, L = 40, Rr = 6, Tt = 12, B = 24, n = s.length, mx = 22000;
    var X = function (i) { return L + (W - L - Rr) * (i + 0.5) / n; }, Y = function (v) { return Tt + (Hh - Tt - B) * (1 - v / mx); }, bw = (W - L - Rr) / n;
    var startIdx = s.findIndex(function (r) { return r.bulan === '2024-07'; });
    var segs = H.m2.segmen, cuts = [startIdx].concat(H.m2.segmen_awal.map(function (b) { return s.findIndex(function (r) { return r.bulan === b; }); })).concat([n]);
    var grid = U.axisY(0, mx, 4).map(function (v) { return '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke="#E8EEF7"/><text x="' + (L - 4) + '" y="' + (Y(v) + 3) + '" font-size="8.5" text-anchor="end" fill="#94A3B8">' + idn(v) + '</text>'; }).join('');
    var bars = s.map(function (r, i) { return '<rect class="gb" x="' + (X(i) - bw * 0.36) + '" y="' + Y(r.perjudian) + '" width="' + (bw * 0.72) + '" height="' + (Hh - B - Y(r.perjudian)) + '" fill="' + (i < startIdx ? '#E3EAF5' : '#BFD3F5') + '" rx="1"/>'; }).join('');
    var seg = segs.map(function (g, j) { var a = X(cuts[j]) - bw / 2, b = X(cuts[j + 1] - 1) + bw / 2; return '<rect x="' + a + '" y="' + Y(g.CI95_atas) + '" width="' + (b - a) + '" height="' + (Y(g.CI95_bawah) - Y(g.CI95_atas)) + '" fill="#1E5BD8" opacity=".18"/><line x1="' + a + '" x2="' + b + '" y1="' + Y(g.rata2_geometrik) + '" y2="' + Y(g.rata2_geometrik) + '" stroke="#1E5BD8" stroke-width="2.4"/><text x="' + ((a + b) / 2) + '" y="' + (Y(g.CI95_atas) - 4) + '" font-size="9.5" font-weight="700" text-anchor="middle" fill="#0B2A5B">' + idn(g.rata2_geometrik) + '</text>'; }).join('');
    var br = cuts.slice(1, -1).map(function (c) { return '<line x1="' + (X(c) - bw / 2) + '" x2="' + (X(c) - bw / 2) + '" y1="' + Tt + '" y2="' + (Hh - B) + '" stroke="#E0413A" stroke-dasharray="3 3"/>'; }).join('');
    var xl = s.map(function (r, i) { return r.bulan.slice(5) === '01' || i === 0 ? '<text x="' + X(i) + '" y="' + (Hh - 8) + '" font-size="8.5" text-anchor="middle" fill="#64748B">' + (r.bulan.slice(5) === '01' ? r.bulan.slice(0, 4) : 'Jun 24') + '</text>' : ''; }).join('');
    var chart = '<svg class="chart" viewBox="0 0 ' + W + ' ' + Hh + '">' + grid + bars + seg + br + xl + '</svg>';
    var m = H.m2, cu = m.cusum_2026, cmn = -7, cW = 340, cH = 160;
    var cX = function (i) { return 30 + (cW - 40) * i / (cu.length - 1); }, cY = function (v) { return 10 + (cH - 34) * (v / cmn); };
    var cline = cu.map(function (r, i) { return (i ? 'L' : 'M') + cX(i) + ',' + cY(r.CUSUM_bawah); }).join('');
    var cdots = cu.map(function (r, i) { return '<circle cx="' + cX(i) + '" cy="' + cY(r.CUSUM_bawah) + '" r="3.2" fill="' + (r.status ? '#E0413A' : '#1E5BD8') + '"/><text x="' + cX(i) + '" y="' + (cH - 8) + '" font-size="8.5" text-anchor="middle" fill="#64748B">' + BULAN[+r.bulan.slice(5) - 1].slice(0, 3) + '</text>'; }).join('');
    var cyt = [0, -2, -4, -6].map(function (v) { return '<text x="24" y="' + (cY(v) + 3) + '" font-size="8.5" text-anchor="end" fill="#94A3B8">' + v + '</text>'; }).join('');
    var cus = '<svg class="chart" viewBox="0 0 ' + cW + ' ' + cH + '">' + cyt + '<line x1="30" x2="' + (cW - 10) + '" y1="' + cY(-4) + '" y2="' + cY(-4) + '" stroke="#E0413A" stroke-dasharray="4 3"/><text x="' + (cW - 12) + '" y="' + (cY(-4) - 4) + '" font-size="8.5" text-anchor="end" fill="#E0413A">batas alarm h = 4</text><line x1="30" x2="' + (cW - 10) + '" y1="' + cY(0) + '" y2="' + cY(0) + '" stroke="#E8EEF7"/><path class="ln" pathLength="1" d="' + cline + '" fill="none" stroke="#1E5BD8" stroke-width="2.2"/>' + cdots + '</svg>';
    var pel = R.pelapor.map(function (r) { return '<tr><td>' + esc(r.kelompok_pelapor.replace('Penyelenggara e-money dan/atau e-wallet', 'Penyelenggara e-money/e-wallet')) + '</td><td class="r num">' + idn(r['2024_jan_sep']) + '</td><td class="r num">' + idn(r['2025_jan_sep']) + '</td><td class="r num">' + idn(r['2026_jan_sep']) + '</td></tr>'; }).join('');
    return '<div class="card"><div class="flex between"><h3>Indikasi Perjudian per bulan</h3>' + badge('resmi') + '</div><p class="hint">Garis = rata-rata geometrik segmen, pita = CI 95% (HAC), garis putus = awal segmen baru (BIC).</p>' + chart + src('PPATK, Buletin Statistik APUPPT edisi Juni 2025, Oktober 2025, dan September 2026, Tabel 5; diolah.') + '</div>' +
      '<div class="card"><h3>Hasil uji</h3><table class="mini mt8"><tbody>' +
      '<tr><td>Mann-Kendall (log)</td><td class="r num">Z = ' + idn(m.mk_Z, 2) + '; p = ' + idn(m.mk_p, 3) + '</td></tr><tr><td>Mann-Kendall prewhitened</td><td class="r num">p = ' + idn(m.mk_pw_p, 3) + '</td></tr>' +
      '<tr><td>Kemiringan Sen</td><td class="r num">' + idn(m.sen_persen_per_bulan, 2) + '% per bulan</td></tr><tr><td>OLS-CUSUM</td><td class="r num">' + idn(m.cusum_ols_stat, 3) + '; p = ' + idn(m.cusum_ols_p, 3) + '</td></tr>' +
      '<tr><td>sup-F (Andrews)</td><td class="r num">' + idn(m.supF, 2) + ' pada ' + bln(m.supF_tanggal) + '</td></tr><tr><td>p bootstrap iid / AR(1) sisaan</td><td class="r num">' + idn(m.supF_p_iid, 4) + ' / ' + idn(m.supF_p_ar1_resid, 4) + '</td></tr>' +
      '<tr><td>p bootstrap AR(1) paling konservatif</td><td class="r num">' + idn(m.supF_p_ar1, 3) + '</td></tr><tr><td>Jan-Sep 2025 dan 2026</td><td class="r num">' + idn(m.jan_sep_2025) + ' dan ' + idn(m.jan_sep_2026) + '</td></tr></tbody></table>' +
      '<p class="warnnote">Tanggal patah diestimasi dari data yang sama, sehingga nilai-p kontras segmen cenderung optimis. Penurunan laporan tidak menilai kinerja lembaga dan tidak diuji sebagai akibat kebijakan tertentu.</p></div>' +
      '<div class="card"><div class="flex between"><h3>CUSUM bawah 2026 terhadap acuan 2025</h3>' + badge('hitungan') + '</div><p class="hint">Alat yang sama dipakai TAPIS untuk tiap merchant. Alarm pertama: ' + bln(m.cusum_alarm_pertama) + '.</p>' + cus + src('PPATK, Buletin APUPPT September 2026; CUSUM Page (1954), k = 0,5.') + '</div>' +
      '<div class="card"><div class="flex between"><h3>LTKM per kelompok pelapor, Jan-Sep</h3>' + badge('resmi') + '</div><p class="hint">LTKM = Laporan Transaksi Keuangan Mencurigakan yang diterima PPATK.</p><table class="mini mt8"><thead><tr><th>Pelapor</th><th class="r">2024</th><th class="r">2025</th><th class="r">2026</th></tr></thead><tbody>' + pel + '</tbody></table>' +
      '<p class="note">Laporan penyelenggara e-money/e-wallet turun ' + idn((1 - m.ltkm_emoney_jan_sep[2] / m.ltkm_emoney_jan_sep[0]) * 100, 1) + '% ketika deposit lewat QRIS membesar. Beban pemantauan perlu dipetakan ulang ke pengakuisisi merchant.</p>' + src('PPATK, Buletin APUPPT September 2026, Tabel 2.') + '</div>';
  }
  function ppvCurve(prev, sens, mark) {
    var W = 340, Hh = 170, L = 30, Rr = 8, Tt = 10, B = 26, lo = Math.log10(0.001), hi = Math.log10(2);
    var X = function (f) { return L + (W - L - Rr) * (Math.log10(f) - lo) / (hi - lo); }, Y = function (p) { return Tt + (Hh - Tt - B) * (1 - p / 100); };
    function path(pv, col, w, cls) { var d = ''; for (var k = 0; k <= 80; k++) { var f = Math.pow(10, lo + (hi - lo) * k / 80); d += (k ? 'L' : 'M') + X(f).toFixed(1) + ',' + Y(100 * T.ppv(sens, pv / 100, f / 100)).toFixed(1); } return '<path ' + (cls ? 'class="ln" pathLength="1" ' : '') + 'd="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + w + '"/>'; }
    var g = [0, 25, 50, 75, 100].map(function (p) { return '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + Y(p) + '" y2="' + Y(p) + '" stroke="#E8EEF7"/><text x="' + (L - 4) + '" y="' + (Y(p) + 3) + '" font-size="8.5" text-anchor="end" fill="#94A3B8">' + p + '</text>'; }).join('');
    var xt = [0.001, 0.01, 0.1, 1].map(function (f) { return '<text x="' + X(f) + '" y="' + (Hh - 10) + '" font-size="8.5" text-anchor="middle" fill="#64748B">' + idn(f, f < 0.01 ? 3 : f < 0.1 ? 2 : f < 1 ? 1 : 0) + '%</text>'; }).join('');
    var mk = mark ? '<line x1="' + X(mark) + '" x2="' + X(mark) + '" y1="' + Tt + '" y2="' + (Hh - B) + '" stroke="#0B2A5B" stroke-dasharray="3 3"/><circle cx="' + X(mark) + '" cy="' + Y(100 * T.ppv(sens, prev / 100, mark / 100)) + '" r="4.5" fill="#0B2A5B"/>' : '';
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + Hh + '">' + g + '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + Y(50) + '" y2="' + Y(50) + '" stroke="#F5A524" stroke-dasharray="2 3"/>' + path(0.005, '#CBD5E1', 1.3) + path(0.05, '#33507F', 1.3) + path(prev, '#1E5BD8', 2.6, 1) + mk + xt + '<text x="' + ((W + L) / 2) + '" y="' + (Hh - 0) + '" font-size="8.5" text-anchor="middle" fill="#94A3B8">FPR per merchant (skala log)</text></svg>';
  }
  function bM3() {
    var m3 = H.m3, rows = m3.tabel_ppv.filter(function (r) { return Math.abs(r['prevalensi_%'] - m3.prevalensi_acuan_persen) < 1e-3; });
    return '<div class="card"><div class="flex between"><h3>Nilai prediktif positif (PPV)</h3>' + badge('asumsi') + '</div><p class="hint">Dari setiap merchant yang ditandai, berapa persen yang benar? Sensitivitas 80% adalah asumsi.</p>' + ppvCurve(m3.prevalensi_acuan_persen, 0.8) +
      '<div class="legend"><span><i style="background:#1E5BD8"></i>prevalensi acuan ' + idn(m3.prevalensi_acuan_persen, 4) + '%</span><span><i style="background:#CBD5E1"></i>0,005%</span><span><i style="background:#33507F"></i>0,05%</span><span><i style="background:#F5A524"></i>PPV 50%</span></div>' +
      '<table class="mini mt12"><thead><tr><th>FPR</th><th class="r">Salah tandai</th><th class="r">Benar tandai</th><th class="r">PPV</th></tr></thead><tbody>' + rows.map(function (r) { return '<tr><td class="num">' + idn(r['FPR_%'], 2) + '%</td><td class="r num">' + idn(r.salah_tandai) + '</td><td class="r num">' + idn(r.benar_tandai) + '</td><td class="r num">' + idn(r['PPV_%'], 1) + '%</td></tr>'; }).join('') + '</tbody></table>' +
      '<p class="note">Prevalensi acuan = 5.762 rekening perjudian yang dihentikan Jan-Jun 2026 dibagi ' + idn(H.qris.merchant_juta, 2) + ' juta merchant. Agar PPV 50%, FPR paling tinggi ' + idn(m3.fpr_maks_ppv50_persen, 4) + '%.</p>' + src('PPATK, Laporan Semester I 2026, hal. 21; BI 2026; Teorema Bayes; diolah.') + '</div>' +
      '<div class="card"><h3>Beban rujukan pemeriksa</h3><p class="small">Rata-rata segmen terakhir laporan indikasi Perjudian: <b class="num">' + idn(m3.beban_rujukan) + '</b> per bulan (batas atas prediksi 95%: ' + idn(m3.beban_batas_atas95) + '). Agar salah tandai tidak melampaui angka ini, FPR harus paling tinggi ' + idn(m3.fpr_maks_beban_persen, 4) + '%. ' + badge('hitungan') + '</p><a class="btn sec mt8" href="#/simulator/ambang">Coba di simulator</a></div>';
  }
  function bPeta() {
    var P = R.peta, vals = P.prov.map(function (p) { return p.v; }).sort(function (a, b) { return a - b; }), lo = T.quantile(vals, 0.05), hi = T.quantile(vals, 0.95);
    function col(v) { var t = Math.max(0, Math.min(1, (v - lo) / (hi - lo))); var s = [[238, 243, 250], [141, 182, 245], [30, 91, 216], [11, 42, 91]], k = Math.min(2, Math.floor(t * 3)), f = t * 3 - k; var c = s[k].map(function (x, i) { return Math.round(x + (s[k + 1][i] - x) * f); }); return 'rgb(' + c.join(',') + ')'; }
    var paths = P.prov.map(function (p, i) { return '<path data-i="' + i + '" d="' + p.d + '" fill="' + col(p.v) + '" stroke="#fff" stroke-width=".8" style="cursor:pointer"/>'; }).join('');
    var sorted = P.prov.slice().sort(function (a, b) { return b.v - a.v; });
    return '<div class="card"><div class="flex between"><h3>PDRB per kapita ADHB 2024</h3>' + badge('resmi') + '</div><p class="hint">Ketuk provinsi untuk melihat nilai.</p><svg class="chart" viewBox="0 0 ' + P.w + ' ' + P.h + '">' + paths + '</svg>' +
      '<div style="height:8px;border-radius:4px;background:linear-gradient(90deg,#EEF3FA,#8DB6F5,#1E5BD8,#0B2A5B);margin-top:8px"></div><div class="flex between small muted"><span>Rp' + idn(lo / 1000) + ' juta</span><span>Rp' + idn(hi / 1000) + ' juta</span></div>' +
      '<div id="pinfo" class="note">Ketuk peta. Tertinggi ' + esc(sorted[0].n) + ' (Rp' + idn(sorted[0].v / 1000, 1) + ' juta), terendah ' + esc(sorted[sorted.length - 1].n) + ' (Rp' + idn(sorted[sorted.length - 1].v / 1000, 1) + ' juta), selisih ' + idn(sorted[0].v / sorted[sorted.length - 1].v, 1) + ' kali.</div>' +
      '<p class="warnnote"><b>Bukan peta risiko judi daring.</b> Peta ini menunjukkan bahwa kemampuan ekonomi daerah tidak merata, sehingga tampilan dan pelatihan petugas TAPIS harus ringan dan dapat dipakai di seluruh daerah.</p>' + src('BPS, PDRB per kapita ADHB menurut provinsi 2024; batas 38 provinsi; diolah.') + '</div>';
  }
  function bindPeta() { app.querySelectorAll('path[data-i]').forEach(function (p) { p.onclick = function () { var d = R.peta.prov[+p.dataset.i]; app.querySelectorAll('path[data-i]').forEach(function (q) { q.setAttribute('stroke', '#fff'); q.setAttribute('stroke-width', '.8'); }); p.setAttribute('stroke', '#E0413A'); p.setAttribute('stroke-width', '2.5'); app.querySelector('#pinfo').innerHTML = '<b>' + esc(d.n) + '</b>: PDRB per kapita Rp' + idn(d.v / 1000, 1) + ' juta (ADHB 2024); pertumbuhan riil per kapita 2025 ' + idn(d.g, 2) + '%.'; }; }); }

  // ---------- simulator ----------
  var sim = { J: false, P: false, K: false, malam: true, seragam: true, kecil: true, preset: 'angkringan' };
  var PRESETS = {
    angkringan: { n: 'Angkringan dini hari', d: 'Ramai 21.00-03.00, Rp10-15 ribu', s: { J: false, P: false, K: false, malam: true, seragam: true, kecil: true } },
    kopi: { n: 'Kedai kopi malam', d: 'Buka sampai pukul 02.00', s: { J: false, P: false, K: false, malam: true, seragam: false, kecil: true } },
    acara: { n: 'Lonjakan saat acara', d: 'Pertandingan di stadion dekat warung', s: { J: false, P: true, K: false, malam: true, seragam: false, kecil: true } },
    bayangan: { n: 'Merchant bayangan', d: 'Baru, berbagi pembayar, melonjak', s: { J: true, P: true, K: true, malam: false, seragam: true, kecil: true } },
    baru: { n: 'Merchant baru tak wajar', d: 'Profil tidak cocok dan melonjak', s: { J: false, P: true, K: true, malam: false, seragam: false, kecil: false } },
    pulsa: { n: 'Konter pulsa', d: 'Nominal tetap sepanjang hari', s: { J: false, P: false, K: false, malam: false, seragam: true, kecil: true } }
  };
  var amb = { fpr: 0.1, sens: 80, prev: null, dua: false };
  function viewSimulator(tab) {
    tab = tab || 'level';
    var tabs = '<div class="tabs"><button class="' + (tab === 'level' ? 'on' : '') + '" data-t="level">Level merchant</button><button class="' + (tab === 'ambang' ? 'on' : '') + '" data-t="ambang">Ambang dan beban</button></div>';
    shell('Simulator', tab === 'level' ? 'Aturan empat level TAPIS' : 'Teorema Bayes dengan angka resmi', tabs + '<div id="simbody"></div>', { nav: 'simulator' });
    app.querySelectorAll('[data-t]').forEach(function (b) { b.onclick = function () { location.hash = '#/simulator/' + b.dataset.t; }; });
    if (tab === 'level') simLevel(); else simAmbang();
  }
  function simLevel() {
    var el = app.querySelector('#simbody'), n = (sim.J ? 1 : 0) + (sim.P ? 1 : 0) + (sim.K ? 1 : 0), weak = sim.malam || sim.seragam || sim.kecil;
    var lv = n >= 2 ? 'oranye' : (n === 1 || weak) ? 'kuning' : 'hijau';
        var why = n >= 2 ? n + ' dari 3 kelompok sinyal aktif. Merchant masuk antrean verifikasi. Pembatasan tetap hanya oleh manusia dengan persetujuan dua pejabat.'
      : n === 1 ? 'Hanya 1 kelompok sinyal. TAPIS tidak pernah mengirim merchant ke antrean dengan satu kelompok saja. Merchant dipantau otomatis tanpa gangguan.'
        : weak ? 'Hanya sinyal lemah (jam, nominal seragam, nominal kecil). Sinyal lemah dibatasi paling tinggi Kuning, sehingga usaha ini tidak pernah diperiksa hanya karena jam bukanya.' : 'Tidak ada sinyal. Merchant normal.';
    var pres = Object.keys(PRESETS).map(function (k) { return '<button class="' + (sim.preset === k ? 'on' : '') + '" data-p="' + k + '"><b>' + PRESETS[k].n + '</b>' + PRESETS[k].d + '</button>'; }).join('');
    function tg(k, t, s, tag) { return '<div class="toggle"><div class="tx"><b>' + t + '<span class="tag ' + tag + '">' + (tag === 'w' ? 'lemah' : tag.toUpperCase()) + '</span></b><span>' + s + '</span></div><label class="switch"><input type="checkbox" data-k="' + k + '" ' + (sim[k] ? 'checked' : '') + '><span></span></label></div>'; }
    el.innerHTML = '<div class="result r-' + lv + '"><div class="small" style="opacity:.8">Hasil</div><div class="lvname">' + U.LV[lv] + ' &middot; ' + U.LVDESC[lv] + '</div><p>' + why + '</p></div>' +
      '<div class="presets">' + pres + '</div>' +
      '<div class="card"><h3>Kelompok sinyal kuat</h3><p class="hint">Oranye membutuhkan minimal dua.</p>' + tg('J', 'Jejaring pembayar', 'Pembayar yang sama di banyak merchant baru', 'j') + tg('P', 'Perubahan mendadak relatif sebaya', 'Robust Z atau CUSUM melewati batas', 'p') + tg('K', 'Profil tidak cocok atau ada di daftar', 'Kategori, umur, nominal, daftar rujukan', 'k') + '</div>' +
      '<div class="card"><h3>Sinyal lemah</h3><p class="hint">Tidak pernah cukup untuk verifikasi.</p>' + tg('malam', 'Ramai malam hingga dini hari', 'Pukul 22.00-05.00', 'w') + tg('seragam', 'Nominal seragam', 'Banyak transaksi pada satu nilai', 'w') + tg('kecil', 'Nominal kecil', 'Di bawah Rp100.000', 'w') + '</div>';
    el.querySelectorAll('[data-p]').forEach(function (b) { b.onclick = function () { var p = PRESETS[b.dataset.p]; Object.assign(sim, p.s); sim.preset = b.dataset.p; simLevel(); }; });
    el.querySelectorAll('[data-k]').forEach(function (c) { c.onchange = function () { sim[c.dataset.k] = c.checked; sim.preset = ''; simLevel(); }; });
  }
  function simAmbang() {
    var el = app.querySelector('#simbody'), M = H.qris.merchant_juta * 1e6, base = H.m3.prevalensi_acuan_persen;
    if (amb.prev === null) amb.prev = base;
    var s = amb.sens / 100, f = amb.fpr / 100, pv = amb.prev / 100;
    var se = amb.dua ? s * s : s, fe = amb.dua ? f * f : f;
    var ppv = T.ppv(se, pv, fe), fp = fe * M * (1 - pv), tp = se * M * pv, cap = H.m3.beban_rujukan;
    var omzet = H.qris.nominal_kuadriliun * 1e15 / 181 / M; // HITUNGAN: rata-rata nominal per merchant per hari
    var tertahan = fp * omzet * 7;
    var sliderPos = Math.round((Math.log10(amb.fpr) + 3) / (Math.log10(2) + 3) * 1000);
    el.innerHTML = '<div class="card"><div class="flex between"><h3>Hasil per periode</h3>' + badge('hitungan') + '</div>' + ppvCurve(amb.prev, se, fe * 100) +
      '<div class="grid2 mt8"><div class="stat"><div class="lab">PPV (tanda yang benar)</div><div class="val num">' + idn(ppv * 100, 1) + '%</div></div><div class="stat"><div class="lab">Merchant jujur ikut ditandai</div><div class="val num">' + idn(fp) + '</div></div>' +
      '<div class="stat"><div class="lab">Pelaku tertandai</div><div class="val num">' + idn(tp) + '</div></div><div class="stat"><div class="lab">Dibanding beban rujukan ' + idn(cap) + '/bulan</div><div class="val num" style="color:' + (fp + tp > cap ? '#E0413A' : '#17A673') + '">' + idn((fp + tp) / cap, 1) + ' kali</div></div></div>' +
      '<p class="' + (fp > tp ? 'warnnote' : 'note') + '">Bila setiap merchant jujur yang tertandai ditunda 5 hari kerja, omzet UMKM yang ikut tertahan sekitar <b>Rp' + idn(tertahan / 1e9, 1) + ' miliar</b> per periode. ' + badge('asumsi') + '</p></div>' +
      '<div class="card"><h3>Atur parameter</h3><div class="field mt8"><label>FPR per merchant: <span class="num">' + idn(amb.fpr, amb.fpr < 0.01 ? 4 : amb.fpr < 0.1 ? 3 : 2) + '%</span></label><input type="range" id="fpr" min="0" max="1000" value="' + sliderPos + '"></div>' +
      '<div class="field"><label>Sensitivitas sistem: ' + amb.sens + '% ' + badge('asumsi') + '</label><input type="range" id="sens" min="50" max="95" value="' + amb.sens + '"></div>' +
      '<div class="field"><label>Prevalensi pelaku di antara merchant</label><div class="chips">' + [[0.005, '0,005%'], [base, idn(base, 4) + '% (acuan)'], [0.05, '0,05%']].map(function (p) { return '<button class="chip ' + (Math.abs(amb.prev - p[0]) < 1e-9 ? 'on' : '') + '" data-pv="' + p[0] + '">' + p[1] + '</button>'; }).join('') + '</div></div>' +
      '<div class="toggle"><div class="tx"><b>Wajib dua kelompok sinyal</b><span>FPR dan sensitivitas gabungan menjadi kuadratnya (ASUMSI independensi; korelasi nyata membuat hasil lebih buruk)</span></div><label class="switch"><input type="checkbox" id="dua" ' + (amb.dua ? 'checked' : '') + '><span></span></label></div></div>' +
      '<div class="card"><h3>Dari mana angka ini</h3><p class="small">Merchant ' + idn(H.qris.merchant_juta, 2) + ' juta dan nominal Rp' + idn(H.qris.nominal_kuadriliun, 2) + ' kuadriliun (BI, Sem I 2026). Prevalensi acuan dari 5.762 rekening perjudian yang dihentikan (PPATK). Beban rujukan dari rata-rata segmen terakhir laporan indikasi Perjudian (notebook M2). Omzet per merchant per hari sekitar ' + rp(omzet) + ' (HITUNGAN), dan penundaan 5 hari kerja disetarakan 7 hari kalender (ASUMSI).</p></div>';
    var r = el.querySelector('#fpr'); r.oninput = function () { amb.fpr = Math.pow(10, -3 + (Math.log10(2) + 3) * r.value / 1000); simAmbang(); el.querySelector('#fpr').focus(); };
    var sn = el.querySelector('#sens'); sn.oninput = function () { amb.sens = +sn.value; simAmbang(); el.querySelector('#sens').focus(); };
    el.querySelectorAll('[data-pv]').forEach(function (b) { b.onclick = function () { amb.prev = +b.dataset.pv; simAmbang(); }; });
    el.querySelector('#dua').onchange = function () { amb.dua = this.checked; simAmbang(); };
  }

  // ---------- menu, akun, panduan ----------
  function viewMenu() {
    var u = me();
    var body = '<div class="profile">' + avatar(u) + '<div style="position:relative;z-index:1;min-width:0"><b>' + esc(u.nama) + '</b><div class="small">' + esc(ROLES[u.role].nama) + '</div><div class="small">' + esc(u.unit) + '</div></div></div>' +
      '<div class="list menu">' + menuLink('#/simulator', 'sliders', 'Simulator', 'Empat level dan ambang Bayes') + menuLink('#/jejaring/' + oranye[0].id, 'net', 'Jejaring pembayar', 'Graf merchant dan pembayar') + menuLink('#/bukti/peta', 'map', 'Peta konteks', 'PDRB per kapita 38 provinsi') +
      (isPJP() ? menuLink('#/antrean', 'queue', 'Antrean', 'Top-K sesuai kapasitas') : menuLink('#/kasus', 'folder', 'Daftar kasus', 'Status dan jejak audit')) + '</div>' +
      '<div class="sec-title"><h2>Bantuan</h2></div><div class="list menu">' + menuLink('#/panduan', 'book', 'Cara TAPIS menilai', 'Sinyal, level, dan dasar hukum') + menuLink('#/tentang', 'info', 'Tentang data', 'Sumber resmi dan data demo') + menuLink('#/akun', 'id', 'Akun', 'Profil dan pengaturan') + '</div>' +
      '<button class="btn sec mt12" id="out">' + icon('logout') + 'Keluar</button>';
    shell('Menu', '', body);
    app.querySelector('#out').onclick = function () { session = null; save('session', null); location.hash = '#/masuk'; };
  }
  function viewAkun() {
    var u = me();
    var body = '<div class="card"><dl class="kv"><dt>Nama</dt><dd>' + esc(u.nama) + '</dd><dt>Peran</dt><dd>' + esc(ROLES[u.role].nama) + '</dd><dt>Unit</dt><dd>' + esc(u.unit) + '</dd><dt>Nomor pegawai</dt><dd>' + esc(u.nip) + '</dd><dt>Email</dt><dd>' + esc(u.email) + '</dd></dl></div>' +
      '<div class="card"><h3>Hak akses</h3><p class="small">' + ({ pjp_analis: 'Membuka kasus, mengajukan penundaan, mencatat keberatan, menutup kasus, dan mengirim LTKM.', pjp_pejabat: 'Semua hak analis ditambah persetujuan penundaan. Penundaan memerlukan dua pejabat berbeda.', bi: 'Melihat kepatuhan PJP dan pusat bukti. Tidak dapat bertindak atas merchant.', ppatk: 'Melihat LTKM yang diteruskan PJP dan pusat bukti.' })[u.role] + '</p></div>' +
      '<button class="btn sec" id="rs">' + icon('reset') + 'Kembalikan data demo ke awal</button><p class="small muted mt8">Menghapus kasus, akun tambahan, dan pengaturan yang tersimpan di peramban ini.</p>';
    shell('Akun', '', body, { back: true, nav: 'menu' });
    app.querySelector('#rs').onclick = function () { try { Object.keys(localStorage).filter(function (k) { return k.indexOf('tapis2.') === 0; }).forEach(function (k) { localStorage.removeItem(k); }); } catch (e) { } MEM = {}; location.hash = '#/masuk'; location.reload(); };
  }
  function viewPanduan() {
    var lv = [['hijau', 'Tidak ada sinyal kuat.', 'Tidak ada tindakan.'], ['kuning', 'Satu kelompok sinyal, atau hanya sinyal lemah.', 'Dipantau otomatis. Merchant tidak diberi tahu dan tidak dibatasi.'], ['oranye', 'Minimal dua dari tiga kelompok sinyal.', 'Masuk antrean Top-K. Analis memverifikasi.'], ['merah', 'Hanya setelah verifikasi manusia dan persetujuan dua pejabat.', 'Penundaan paling lama 5 hari kerja, berita acara, salinan ke merchant, lapor PPATK dalam 24 jam.']];
    var body = ltkmInfo(true) + '<div class="card"><h3>Empat level</h3>' + lv.map(function (l) { return '<div class="reason"><div>' + level(l[0], true) + '<p class="mt8"><b style="display:inline;font-size:12.5px">Syarat:</b> ' + l[1] + '</p><p><b style="display:inline;font-size:12.5px">Tindakan:</b> ' + l[2] + '</p></div></div>'; }).join('') + '</div>' +
      '<div class="card"><h3>Tiga kelompok sinyal</h3><div class="reason"><span class="ic on">J</span><div><b>Jejaring pembayar (bobot 0,35)</b><p>Pembayar yang sama membayar di banyak merchant baru. Paling mahal dipalsukan.</p></div></div><div class="reason"><span class="ic on">P</span><div><b>Perubahan relatif sebaya (0,20 + 0,20)</b><p>Robust Z (Iglewicz dan Hoaglin, 1993) terhadap usaha sejenis dan CUSUM (Page, 1954) terhadap riwayat sendiri.</p></div></div><div class="reason"><span class="ic on">K</span><div><b>Profil dan daftar (0,15 + 0,10)</b><p>Kategori, umur, nominal, dan kecocokan dengan daftar rujukan.</p></div></div>' +
      '<p class="note">Skor = 100 x jumlah (bobot x persentil). Skor adalah peringkat, bukan peluang. Bobot adalah rancangan awal yang perlu dikalibrasi dengan data berlabel PJP.</p></div>' +
      '<div class="card"><h3>Dasar hukum</h3><table class="mini"><tbody><tr><td>Pemantauan merchant oleh PJP</td><td>PBI 10/2024 Pasal 16 dan 29; PADG 15/2025 Penjelasan Pasal 14</td></tr><tr><td>Lapor TKM 3 hari kerja</td><td>UU 8/2010 Pasal 25 ayat (1)</td></tr><tr><td>Penundaan 5 hari kerja</td><td>UU 8/2010 Pasal 26; PBI 10/2024 Pasal 37</td></tr><tr><td>Penghentian sementara oleh PPATK</td><td>UU 8/2010 Pasal 44 ayat (1) huruf i, Pasal 65-66</td></tr><tr><td>Keberatan</td><td>UU 8/2010 Pasal 67</td></tr><tr><td>Teknologi inovatif pengawasan</td><td>PADG 15/2025 Pasal 24</td></tr></tbody></table></div>';
    shell('Cara TAPIS menilai', '', body, { back: true, nav: 'menu' });
  }
  function viewTentang() {
    var body = '<div class="card"><h3>Empat jenis angka</h3><div class="reason"><span>' + badge('resmi') + '</span><div><p>Tertulis di publikasi PPATK, Bank Indonesia, atau BPS.</p></div></div><div class="reason"><span>' + badge('hitungan') + '</span><div><p>Diturunkan dari angka resmi oleh notebook analisis.</p></div></div><div class="reason"><span>' + badge('asumsi') + '</span><div><p>Parameter skenario, misalnya sensitivitas 80%.</p></div></div><div class="reason"><span>' + badge('demo') + '</span><div><p>Merchant, transaksi, foto, pembayar, kasus, dan akun. Tidak berasal dari data nyata dan tidak dipakai dalam temuan.</p></div></div></div>' +
      '<div class="card"><h3>Sumber resmi</h3><ul class="small" style="padding-left:18px;margin:6px 0">' +
      '<li>PPATK, Buletin Statistik APUPPT edisi Juni 2025, Oktober 2025, dan September 2026 (Tabel 2 dan Tabel 5).</li><li>PPATK, Laporan Semester I Tahun 2026.</li><li>PPATK, Siaran Pers B/04/HM.05/3.1/VIII/2026.</li><li>Bank Indonesia, Siaran Pers No. 28/159/DKom.</li><li>BPS, PDRB dan PDRB per kapita menurut provinsi 2024-2025.</li><li>UU 8/2010; PBI 10/2024; PADG 15/2025.</li></ul></div>';
    shell('Tentang data', '', body, { back: true, nav: 'menu' });
  }

  // ---------- router ----------
  function route() {
    document.querySelectorAll('.sheet-bg').forEach(function (x) { x.remove(); });
    var p = (location.hash || '#/').slice(2).split('/'), v = p[0] || 'beranda';
    if (!me()) { return viewAuth(v === 'daftar' ? 'daftar' : 'masuk'); }
    if (v === 'masuk' || v === 'daftar') { location.hash = '#/beranda'; return; }
    var u = me();
    var map = {
      beranda: viewBeranda, antrean: function () { return isPJP() || u.role === 'ppatk' ? viewAntrean() : viewPengawasan(); }, merchant: function () { viewMerchant(p[1]); }, jejaring: function () { viewJejaring(p[1]); },
      kasus: function () { p[1] ? viewKasusDetail(p[1]) : viewKasus(); }, ltkm: viewKasus, pengawasan: viewPengawasan,
      bukti: function () { viewBukti(p[1]); }, simulator: function () { viewSimulator(p[1]); }, menu: viewMenu, akun: viewAkun, panduan: viewPanduan, tentang: viewTentang
    };
    (map[v] || viewBeranda)();
  }
  window.addEventListener('hashchange', route);
  route();
})();
