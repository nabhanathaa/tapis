/* TAPIS: manajemen berkas kasus pemeriksaan manusia, otorisasi ganda 2 pejabat (Dual-Control), berita acara & LTKM, serta dashboard pengawasan Bank Indonesia. */
(function () {
  'use strict';
  var A = window.A, T = A.T, U = A.U, H = A.H, R = A.R, S = A.S, icon = U.icon, idn = U.idn, esc = U.esc, badge = U.badge, level = U.level;
  var shell = A.shell, me = A.me, isPJP = A.isPJP, toast = A.toast, sheet = A.sheet, fmtD = A.fmtD, fmtDT = A.fmtDT;
  function kv(a, b) { return '<dt>' + a + '</dt><dd>' + b + '</dd>'; }

  A.ltkmInfo = function (open) {
    return '<details class="info"' + (open ? ' open' : '') + '>' +
      '<summary><span class="q">' + icon('help') + '</span><span>Protokol Pelaporan LTKM &amp; Kepatuhan UU No. 8 Tahun 2010<small>Laporan Transaksi Keuangan Mencurigakan kepada PPATK &amp; Pengawasan Bank Indonesia</small></span>' + icon('chev', 'dd') + '</summary>' +
      '<div class="bd">' +
        '<p><b>LTKM (Laporan Transaksi Keuangan Mencurigakan)</b> adalah laporan wajib yang disampaikan oleh Pihak Pelapor (termasuk PJP Pengakuisisi QRIS) kepada <b>PPATK</b> setelah melalui verifikasi bukti yang memadai.</p>' +
        '<ul>' +
          '<li><b>Pemisahan Peran Kelembagaan:</b> PJP melakukan pemantauan dan verifikasi merchant; LTKM disampaikan ke <b>PPATK</b>; sedangkan <b>Bank Indonesia</b> mengawasi kepatuhan sistem pembayaran, tata kelola manajemen risiko PJP, serta perlindungan merchant/UMKM.</li>' +
          '<li><b>Batas Waktu Pelaporan (Pasal 25 ayat 1):</b> Wajib disampaikan sesegera mungkin, paling lama <b>3 (tiga) hari kerja</b> setelah unsur transaksi keuangan mencurigakan diketahui oleh pejabat kepatuhan.</li>' +
          '<li><b>Batas Waktu Penundaan Transaksi (Pasal 26):</b> Paling lama <b>5 (lima) hari kerja</b> sejak penundaan dilakukan, wajib disertai Berita Acara tertulis dan jaminan hak keberatan (Pasal 67).</li>' +
        '</ul>' +
        '<span class="lk">Landasan Hukum: UU No. 8 Tahun 2010 Pasal 1 angka 5, Pasal 23, Pasal 25, Pasal 26, Pasal 67 &middot; PBI No. 10 Tahun 2024 &middot; PADG No. 15 Tahun 2025</span>' +
      '</div>' +
    '</details>';
  };

  A.caseRow = function (c) {
    var m = T.byId(c.mid), bs = A.buktiStatus(c);
    return '<a class="item" href="#/kasus/' + c.id + '">' +
      '<span class="thumb">' + U.storefront(m, 44) + '</span>' +
      '<span class="meta">' +
        '<div class="t">' + esc(m.nama) + ' <span class="mono-id">' + c.id + '</span></div>' +
        '<div class="s">' + esc(m.kategori) + ' &middot; ' + esc(m.kota) + ' &middot; Pemeriksa: <b>' + esc(c.petugas) + '</b> &middot; Dibuka ' + fmtD(c.dibuka) + '</div>' +
        '<div class="item-badges">' + A.stPill(c.status) + ' <span class="typo-pill">Bukti: ' + bs.label + ' (' + bs.n + ' jenis)</span></div>' +
      '</span>' +
      '<span class="right"><div class="score num">' + m.score + '<small>Skor Awal</small></div>' + level(A.effLevel(m)) + '</span>' +
      icon('chev', 'chev') +
    '</a>';
  };

  var kFilter = 'aktif';
  function viewKasus() {
    var u = me(), all = u.role === 'ppatk' ? S.cases.filter(function (c) { return c.status === 'Diteruskan'; }) : S.cases;
    var list = all.filter(function (c) {
      return kFilter === 'semua' || (kFilter === 'aktif' ? A.ACTIVE.indexOf(c.status) >= 0 : kFilter === 'selesai' ? A.ACTIVE.indexOf(c.status) < 0 : true);
    });
    var nAktif = all.filter(function (c) { return A.ACTIVE.indexOf(c.status) >= 0; }).length;
    var nSelesai = all.filter(function (c) { return A.ACTIVE.indexOf(c.status) < 0; }).length;
    var nBatas = S.cases.filter(function (c) { return c.status === 'Dibatasi' || c.status === 'Keberatan'; }).length;
    var cleared = S.cases.filter(function (c) { return c.status === 'Tidak terbukti'; }).length;
    var nLtkm = S.cases.filter(function (c) { return c.status === 'Diteruskan'; }).length;

    var kpiStrip =
      '<div class="grid4 mb12">' +
        A.stat('Total Berkas Pemeriksaan', S.cases.length + ' Kasus', 'demo', 'Seluruh riwayat tercatat di jejak audit') +
        A.stat('Investigasi &amp; Pembatasan Aktif', nAktif + ' Berkas', 'demo', nBatas + ' dalam masa penundaan 5 hari kerja') +
        A.stat('Koreksi Perlindungan UMKM', cleared + ' Merchant', 'demo', 'Terbukti wajar &amp; dipulihkan ke Hijau') +
        A.stat('Diteruskan LTKM ke PPATK', nLtkm + ' Laporan', 'demo', 'Memenuhi syarat bukti &amp; SLA 3 hari kerja') +
      '</div>';

    var chips = u.role === 'ppatk' ? '' :
      '<div class="chips">' + [
        ['aktif', 'Berkas Pemeriksaan Aktif', nAktif],
        ['selesai', 'Selesai / Telah Diputus', nSelesai],
        ['semua', 'Semua Berkas Kasus', all.length]
      ].map(function (c) {
        return '<button type="button" class="chip ' + (kFilter === c[0] ? 'on' : '') + '" data-f="' + c[0] + '">' + c[1] + ' <span class="chip-count">' + c[2] + '</span></button>';
      }).join('') + '</div>';

    var body =
      kpiStrip +
      A.ltkmInfo(u.role === 'ppatk') +
      (u.role !== 'ppatk' && cleared ?
        '<div class="umkm-protect-box mb12">' +
          icon('shield') +
          '<div><b>Bukti Bekerjanya Mekanisme Koreksi UMKM:</b> Sebanyak <b>' + cleared + ' merchant</b> yang awalnya memiliki skor prioritas tinggi (Level Oranye) telah diverifikasi melalui dokumen NIB, nota pemasok, dan kunjungan lapangan, dinyatakan <b>Tidak Terbukti</b>, serta dipulihkan penuh ke <b>Level Hijau</b>.</div>' +
        '</div>' : '') +
      '<div class="card">' +
        '<div class="card-head-row">' +
          '<div><span class="card-tag">DIREKTORI BERKAS KASUS &amp; JEJAK AUDIT</span><h3>' + (u.role === 'ppatk' ? 'Daftar Laporan LTKM dari PJP Pengakuisisi' : 'Daftar Berkas Pemeriksaan Merchant') + '</h3></div>' +
          chips +
        '</div>' +
        '<div class="list mt8">' + (list.map(A.caseRow).join('') || '<div class="empty">Tidak ada berkas kasus pada kategori ini.</div>') + '</div>' +
      '</div>';

    shell(u.role === 'ppatk' ? 'Laporan LTKM Masuk (PPATK)' : 'Manajemen Kasus & Audit Kepatuhan', 'Pemeriksaan bukti multi-sumber, otorisasi dua pejabat, dan perlindungan hak keberatan', body, { nav: u.role === 'ppatk' ? 'ltkm' : 'kasus' });
    A.app.querySelectorAll('[data-f]').forEach(function (b) { b.onclick = function () { kFilter = b.dataset.f; viewKasus(); }; });
  }

  function reasonLines(m) {
    var r = [];
    if (m.sig.J) r.push('Pilar J (Jejaring Pembayar): ' + idn(m.sharedShare * 100, 1) + '% pembayar lintas merchant (derajat 3+), terhubung dengan ' + m.nLinks + ' merchant.');
    if (m.sig.P) r.push('Pilar P (Perilaku Sebaya): Robust Z vs sebaya = ' + idn(m.peerZ, 2) + (m.ownZ !== null ? ', Robust Z vs riwayat sendiri = ' + idn(m.ownZ, 2) : '') + '.');
    if (m.sig.K) r.push('Pilar K (Profil & Konteks): Umur operasional ' + m.umur + ' hari, tiket rata-rata ' + U.rp(m.stat.meanAmt) + (m.listStrong.length ? ', ' + m.listStrong.length + ' pembayar cocok daftar rujukan' : '') + '.');
    return r;
  }

  function beritaAcara(c, m) {
    var end = A.addWorkdays(c.mulaiBatas, 5);
    return 'BERITA ACARA PENUNDAAN TRANSAKSI SEMENTARA\nNomor Dokumen : BA/' + c.id + '/APU-PPT\nInstansi PJP  : ' + m.pjp + '\n====================================================================\n\nPada ' + fmtDT(c.mulaiBatas) + ' WIB, Unit Kepatuhan APU-PPT ' + m.pjp + ' menetapkan penundaan transaksi sementara atas merchant:\n  Nama Usaha   : ' + m.nama + '\n  NMID         : ' + m.nmid + '\n  Kategori/MCC : ' + m.kategori + ' (MCC ' + m.mcc + ')\n  Kota/Wilayah : ' + m.kota + ' (Klaster ' + m.klaster + ')\n  Nama Pemilik : ' + m.pemilik +
      '\n\nDASAR PEMERIKSAAN OBJEKTIF:\nHasil verifikasi oleh Analis Pemeriksa (' + c.petugas + ') berdasarkan ' + c.bukti.length + ' temuan bukti:\n' + c.bukti.map(function (b, i) { return '  ' + (i + 1) + '. [' + b.jenis + '] ' + b.ket; }).join('\n') +
      '\n\nJANGKA WAKTU & LANDASAN HUKUM:\n  Durasi       : Paling lama 5 (lima) hari kerja, berakhir pada ' + fmtD(end) + '\n  Dasar Hukum  : UU No. 8 Tahun 2010 Pasal 26; PBI No. 10 Tahun 2024 Pasal 37\n\nJAMINAN HAK MERCHANT:\nSalinan berita acara ini disampaikan secara resmi kepada pemilik usaha. Merchant berhak mengajukan keberatan tertulis beserta dokumen pendukung (NIB, nota stok pemasok, bukti transaksi wajar) sesuai UU No. 8 Tahun 2010 Pasal 67. Apabila keberatan diterima, pembatasan dicabut dan status dipulihkan ke Hijau.\n\nOTORISASI DUA PEJABAT KEPATUHAN (DUAL-CONTROL):\n  1. ' + (c.setuju[0] ? c.setuju[0].nama + ' (' + fmtDT(c.setuju[0].waktu) + ')' : '-') + '\n  2. ' + (c.setuju[1] ? c.setuju[1].nama + ' (' + fmtDT(c.setuju[1].waktu) + ')' : '-');
  }

  function ltkmDraft(c, m) {
    return 'DOKUMEN LAPORAN TRANSAKSI KEUANGAN MENCURIGAKAN (LTKM)\nKepada Yth.   : Kepala PPATK (Pusat Pelaporan dan Analisis Transaksi Keuangan)\nPihak Pelapor : ' + m.pjp + '\nNomor Berkas  : LTKM/' + c.id + '\n====================================================================\n\nIDENTITAS TERLAPOR:\n  Nama Merchant : ' + m.nama + '\n  NMID          : ' + m.nmid + '\n  Pemilik       : ' + m.pemilik + '\n  Wilayah       : ' + m.kota + ' (Klaster Ekonomi ' + m.klaster + ')\n  Indikasi TPA  : Tindak Pidana Perjudian Daring\n\nRINGKASAN INDIKATOR KUANTITATIF AWAL:\n' + reasonLines(m).map(function (x, i) { return '  ' + (i + 1) + '. ' + x; }).join('\n') +
      '\n\nHASIL VERIFIKASI & PEMBUKTIAN MANUSIA:\n' + c.bukti.map(function (b, i) { return '  ' + (i + 1) + '. [' + b.jenis + ' — ' + fmtD(b.t) + '] ' + b.ket + ' (Oleh: ' + b.oleh + ')'; }).join('\n') +
      '\n\nPERNYATAAN PERLINDUNGAN UMKM:\nKarakteristik operasional seperti jam transaksi malam hari, nominal kecil/seragam, dan lonjakan acara lokal telah dikesampingkan dan TIDAK dijadikan dasar pelaporan.\n\nKEPATUHAN SLA PELAPORAN:\nDisampaikan dalam batas waktu paling lama 3 (tiga) hari kerja sejak unsur TKM diketahui sesuai UU No. 8 Tahun 2010 Pasal 25 ayat (1).';
  }

  var FLOW = [
    ['Investigasi', '1. Investigasi & Bukti', 'Pengumpulan minimal 2 jenis bukti'],
    ['Menunggu persetujuan', '2. Otorisasi Ganda', 'Persetujuan 2 pejabat kepatuhan'],
    ['Dibatasi', '3. Penundaan (Maks. 5 HK)', 'Berita acara & hak klarifikasi'],
    ['Keberatan', '4. Evaluasi Keberatan', 'Telaah bukti sanggahan merchant'],
    ['Selesai', '5. Putusan Akhir', 'Pulihkan Hijau atau Teruskan LTKM']
  ];
  var ORDER = { 'Investigasi': 0, 'Menunggu klarifikasi': 0, 'Menunggu persetujuan': 1, 'Dibatasi': 2, 'Keberatan': 3, 'Tidak terbukti': 4, 'Diteruskan': 4 };

  function viewKasusDetail(id) {
    var c = S.cases.filter(function (x) { return x.id === id; })[0]; if (!c) return viewKasus();
    var m = T.byId(c.mid), u = me(), canAct = isPJP(), isPej = A.isPejabat(), bs = A.buktiStatus(c), cur = ORDER[c.status];
    var closed = c.status === 'Tidak terbukti' || c.status === 'Diteruskan';
    function save() { A.saveCases(); }
    function again() { A.skipAnim = true; viewKasusDetail(id); }

    var stepsHtml = '<div class="stepper-horiz">' + FLOW.map(function (f, i) {
      var st = i < cur ? 'done' : i === cur ? (cur === 4 ? 'done' : 'now') : '';
      return '<div class="st-node ' + st + '"><div class="st-circle">' + (st === 'done' ? icon('check') : (i + 1)) + '</div><div class="st-txt"><b>' + f[1] + '</b><span>' + f[2] + '</span></div></div>';
    }).join('') + '</div>';

    var topSla = '';
    if (c.status === 'Dibatasi' || c.status === 'Keberatan') {
      var end = A.addWorkdays(c.mulaiBatas, 5), left = A.workdaysBetween(A.today(), end);
      topSla = '<div class="countdown-card' + (left < 0 ? ' over' : '') + '">' +
        '<div class="cd-icon">' + icon('clock') + '</div>' +
        '<div class="cd-content">' +
          '<div class="cd-tag">PENGHITUNG MUNDUR SLA HUKUM &middot; UU NO. 8 TAHUN 2010 PASAL 26</div>' +
          '<div class="cd-val num">' + (left < 0 ? 'Batas Waktu Terlewati' : left + ' hari kerja tersisa (Batas akhir: ' + fmtD(end) + ')') + '</div>' +
          '<div class="cd-desc">' + (left < 0 ? 'Masa penundaan 5 hari kerja telah berakhir. Pejabat kepatuhan wajib segera mencabut pembatasan atau meneruskan sesuai ketentuan hukum.' : 'Penundaan transaksi berlaku paling lama 5 hari kerja sejak disetujui dua pejabat. Setelah batas waktu tersebut, penundaan wajib dicabut atau diteruskan ke PPATK.') + '</div>' +
        '</div>' +
      '</div>';
    }

    var chk =
      '<ul class="chk">' +
        '<li class="' + (bs.n >= 2 ? 'ok' : '') + '">Minimal 2 jenis bukti berbeda telah dicatat (Saat ini: <b>' + bs.n + ' jenis</b>)</li>' +
        '<li class="' + (bs.nonTrx >= 1 ? 'ok' : '') + '">Minimal 1 bukti di luar analisis transaksi, seperti kunjungan lapangan / dokumen usaha / wawancara (Saat ini: <b>' + bs.nonTrx + ' bukti</b>)</li>' +
        '<li class="' + (bs.okDoc ? 'ok' : '') + '">Tidak ada permintaan dokumen klarifikasi yang masih berstatus menunggu</li>' +
      '</ul>';

    var editable = canAct && !closed;
    var buktiHtml =
      '<div class="card">' +
        '<div class="card-head-row"><div><span class="card-tag">VERIFIKASI BUKTI MULTI-SUMBER</span><h3>Daftar Bukti Pemeriksaan Manusia</h3></div><span class="pill ' + (bs.memadai ? 'st-tidak' : 'st-menunggu') + '">Kecukupan Bukti: ' + bs.label + '</span></div>' +
        '<p class="hint">Penundaan transaksi dilarang diajukan hanya berdasarkan skor atau sinyal algoritmik. Analis wajib memenuhi seluruh syarat kecukupan bukti di bawah ini:</p>' +
        chk +
        '<div class="log mt12">' +
          (c.bukti.length ? c.bukti.slice().reverse().map(function (b) {
            return '<div><time class="num">' + fmtD(b.t) + '</time><span><b>[' + esc(b.jenis) + ']</b> ' + esc(b.ket) + ' <em class="muted">— Dicatat oleh ' + esc(b.oleh) + '</em></span></div>';
          }).join('') : '<div class="muted small">Belum ada temuan bukti yang dicatat pada berkas ini.</div>') +
        '</div>' +
        (editable ? '<button type="button" class="btn sec mt12" data-a="bukti">' + icon('file') + 'Tambah Temuan Bukti Pemeriksaan</button>' : '') +
      '</div>';

    var docsHtml =
      '<div class="card">' +
        '<div class="card-head-row"><div><span class="card-tag">HAK KLARIFIKASI MERCHANT</span><h3>Permintaan Dokumen &amp; Keterangan Pemilik</h3></div></div>' +
        (c.dokumen.length ? c.dokumen.map(function (d, i) {
          return '<div class="docrow">' +
            '<div><b class="small">' + esc(d.minta) + '</b><div class="small muted">Diminta pada ' + fmtD(d.t) + (d.ket ? ' &middot; ' + esc(d.ket) : '') + '</div></div>' +
            '<span class="pill ' + (d.status === 'Diterima' ? 'st-tidak' : d.status === 'Diminta' ? 'st-klarifikasi' : 'st-dibatasi') + '">' + d.status + '</span>' +
            (editable && d.status === 'Diminta' ? '<div class="btnrow mt8"><button type="button" class="btn sec sm" data-a="docok" data-i="' + i + '">Tandai Dokumen Diterima</button><button type="button" class="btn sec sm" data-a="docno" data-i="' + i + '">Tidak Diterima / Lewat Batas</button></div>' : '') +
          '</div>';
        }).join('') : '<p class="small muted">Belum ada permintaan dokumen kepada merchant.</p>') +
        '<h4 class="mt12" style="margin-bottom:6px;font-size:12.5px;color:var(--navy-900)">Catatan Komunikasi &amp; Klarifikasi Pemilik Usaha</h4>' +
        '<div class="log">' +
          (c.catatan.length ? c.catatan.slice().reverse().map(function (n) {
            return '<div><time class="num">' + fmtD(n.t) + '</time><span><b>' + esc(n.dari) + ':</b> ' + esc(n.isi) + '</span></div>';
          }).join('') : '<div class="muted small">Belum ada catatan klarifikasi.</div>') +
        '</div>' +
        (editable ? '<div class="btnrow mt12"><button type="button" class="btn sec" data-a="mintadoc">Minta Dokumen Usaha</button><button type="button" class="btn sec" data-a="catat">Catat Klarifikasi Merchant</button></div>' : '') +
      '</div>';

    var kbHtml = '';
    if (c.keberatan) {
      kbHtml = '<div class="card highlight-card">' +
        '<div class="card-head-row"><div><span class="card-tag">PERLINDUNGAN HAK HUKUM &middot; UU 8/2010 PASAL 67</span><h3>Keberatan Resmi dari Merchant</h3></div><span class="pill st-keberatan">Status: ' + c.keberatan.status + '</span></div>' +
        '<p class="small" style="line-height:1.55;margin-top:8px">' + esc(c.keberatan.isi) + '</p>' +
        '<p class="small muted">Diajukan pada ' + fmtD(c.keberatan.t) + '.' + (c.keberatan.putusan ? ' <b>Putusan Pejabat:</b> ' + esc(c.keberatan.putusan) : ' Menunggu telaah dan putusan Pejabat Kepatuhan.') + '</p>' +
      '</div>';
    }

    // Dual-Control Officer Approval Panel
    var slot1 = c.setuju[0], slot2 = c.setuju[1];
    var dualControlBox =
      '<div class="dual-control-box mt12">' +
        '<div class="dc-slot ' + (slot1 ? 'approved' : '') + '">' +
          '<div class="dc-badge">' + (slot1 ? icon('check') : '1') + '</div>' +
          '<div><b>Otorisasi Pejabat Kepatuhan Ke-1</b><span>' + (slot1 ? esc(slot1.nama) + ' &middot; ' + fmtDT(slot1.waktu) : 'Menunggu persetujuan Pejabat 1 (Mis. Dimas Prakoso)') + '</span></div>' +
        '</div>' +
        '<div class="dc-slot ' + (slot2 ? 'approved' : '') + '">' +
          '<div class="dc-badge">' + (slot2 ? icon('check') : '2') + '</div>' +
          '<div><b>Otorisasi Pejabat Kepatuhan Ke-2</b><span>' + (slot2 ? esc(slot2.nama) + ' &middot; ' + fmtDT(slot2.waktu) : 'Menunggu persetujuan Pejabat 2 berbeda (Mis. Hana Lestari)') + '</span></div>' +
        '</div>' +
      '</div>';

    function roleSwitchHelper(targetEmail, label) {
      return '<div class="warnnote mt12">Tindakan otorisasi memerlukan akun <b>Pejabat Kepatuhan</b>. <button type="button" class="link-btn" data-a="switch" data-e="' + targetEmail + '">Beralih ke ' + label + ' di halaman ini &rarr;</button></div>';
    }

    var actsHtml = '';
    if (canAct && !closed) {
      if (c.status === 'Investigasi' || c.status === 'Menunggu klarifikasi') {
        actsHtml =
          '<button type="button" class="btn" data-a="ajukan"' + (bs.memadai ? '' : ' disabled') + '>' + icon('shield') + 'Ajukan Penundaan Transaksi ke Pejabat Kepatuhan</button>' +
          (bs.memadai ? '' : '<p class="small muted mt8">Tombol pengajuan penundaan terkunci otomatis hingga syarat kecukupan bukti (minimal 2 jenis bukti termasuk bukti non-transaksi) terpenuhi.</p>') +
          '<div class="btnrow mt12">' +
            '<button type="button" class="btn sec" data-a="bersih">' + icon('check') + 'Tutup Kasus: Tidak Terbukti (Pulihkan Hijau)</button>' +
            (isPej ? '<button type="button" class="btn sec" data-a="teruskan"' + (bs.memadai ? '' : ' disabled') + '>' + icon('send') + 'Teruskan LTKM ke PPATK</button>' : '') +
          '</div>' +
          (isPej ? '' : roleSwitchHelper('dimas@arunika.demo', 'Dimas Prakoso (Pejabat Kepatuhan 1)'));
      }
      if (c.status === 'Menunggu persetujuan') {
        var already = c.setuju.some(function (s) { return s.nama === u.nama; });
        var nextPejEmail = c.setuju.some(function (s) { return s.nama.indexOf('Dimas') >= 0; }) ? 'hana@arunika.demo' : 'dimas@arunika.demo';
        var nextPejName = nextPejEmail === 'hana@arunika.demo' ? 'Hana Lestari (Pejabat Kepatuhan 2)' : 'Dimas Prakoso (Pejabat Kepatuhan 1)';
        actsHtml =
          (isPej && !already ? '<button type="button" class="btn mt12" data-a="setuju">' + icon('check') + 'Setujui Penundaan sebagai ' + esc(u.nama) + '</button>' : '') +
          (isPej && already ? roleSwitchHelper(nextPejEmail, nextPejName) : '') +
          (!isPej ? roleSwitchHelper(nextPejEmail, nextPejName) : '') +
          '<button type="button" class="btn sec mt8" data-a="batal">Batalkan Pengajuan &amp; Kembalikan ke Investigasi</button>';
      }
      if (c.status === 'Dibatasi') {
        actsHtml =
          '<div class="btnrow mt12">' +
            '<button type="button" class="btn sec" data-a="ba">' + icon('file') + 'Lihat Berita Acara</button>' +
            '<button type="button" class="btn sec" data-a="keberatan">Catat Keberatan Merchant</button>' +
          '</div>' +
          (isPej ?
            '<div class="btnrow mt8">' +
              '<button type="button" class="btn sec" data-a="bersih">Cabut Pembatasan: Tidak Terbukti</button>' +
              '<button type="button" class="btn" data-a="teruskan">' + icon('send') + 'Teruskan LTKM ke PPATK</button>' +
            '</div>' :
            roleSwitchHelper('dimas@arunika.demo', 'Dimas Prakoso (Pejabat Kepatuhan 1)'));
      }
      if (c.status === 'Keberatan') {
        actsHtml =
          '<button type="button" class="btn sec mt12" data-a="ba">' + icon('file') + 'Lihat Berita Acara Penundaan</button>' +
          (isPej ?
            '<div class="btnrow mt8">' +
              '<button type="button" class="btn" data-a="terimakeb">' + icon('check') + 'Terima Keberatan &amp; Pulihkan Hijau</button>' +
              '<button type="button" class="btn red" data-a="tolakkeb">Tolak Keberatan</button>' +
            '</div>' +
            '<button type="button" class="btn sec mt8" data-a="teruskan">' + icon('send') + 'Teruskan LTKM ke PPATK</button>' :
            roleSwitchHelper('dimas@arunika.demo', 'Dimas Prakoso (Pejabat Kepatuhan 1)'));
      }
    }
    if (c.status === 'Diteruskan') {
      actsHtml =
        '<button type="button" class="btn sec mt12" data-a="ltkm">' + icon('file') + 'Buka Dokumen Draf LTKM PPATK</button>' +
        (c.unsurTKM ? '<p class="note mt8"><b>Kepatuhan SLA Pelaporan:</b> Unsur TKM diketahui pada ' + fmtD(c.unsurTKM) + ', LTKM dikirim ke PPATK pada ' + fmtD(c.ltkm) + ' (Diselesaikan dalam <b>' + A.workdaysBetween(c.unsurTKM, c.ltkm) + ' hari kerja</b>; batas maksimum UU 8/2010 Pasal 25 adalah 3 hari kerja).</p>' : '');
    }
    if (c.status === 'Tidak terbukti') {
      actsHtml =
        '<div class="umkm-protect-box mt12">' +
          icon('shield') +
          '<div><b>Hasil Akhir Pemeriksaan — Tidak Terbukti:</b> ' + esc(c.hasil || 'Berdasarkan klarifikasi dan dokumen usaha, tidak ditemukan indikasi pelanggaran.') + ' Status penapisan merchant telah dikoreksi menjadi <b>Hijau</b>.</div>' +
        '</div>';
    }

    var decisionCard =
      '<div class="card">' +
        '<div class="card-head-row"><div><span class="card-tag">OTORISASI BERJENJANG (DUAL-CONTROL)</span><h3>Panel Keputusan &amp; Persetujuan Pejabat</h3></div>' + A.stPill(c.status) + '</div>' +
        '<p class="hint">Setiap pembatasan wajib disetujui oleh 2 (dua) Pejabat Kepatuhan APU-PPT yang berbeda untuk mencegah kesalahan tunggal maupun penyalahgunaan wewenang.</p>' +
        dualControlBox +
        actsHtml +
      '</div>';

    var rwCard =
      '<div class="card">' +
        '<div class="card-tag">RIWAYAT TRANSISI STATUS</div>' +
        '<h3>Linimasa Perubahan Keputusan</h3>' +
        (c.riwayat.length ?
          '<ol class="rw mt12">' + c.riwayat.map(function (r) {
            return '<li><time class="num">' + fmtDT(r.t) + '</time><b>' + esc(r.dari) + ' &rarr; ' + esc(r.ke) + '</b><span><b>' + esc(r.oleh) + ':</b> ' + esc(r.alasan) + '</span></li>';
          }).join('') + '</ol>' : '<p class="small muted">Belum ada perubahan status.</p>') +
      '</div>';

    var auditCard =
      '<div class="card">' +
        '<div class="card-head-row"><div><span class="card-tag">AKUNTABILITAS &amp; TATA KELOLA</span><h3>Jejak Audit Tidak Terubah (Audit Trail)</h3></div><span class="mono-badge">' + c.log.length + ' Entri</span></div>' +
        '<div class="log mt8">' +
          c.log.slice().reverse().map(function (l) {
            return '<div><time class="num">' + fmtDT(l.t) + '</time><span><b>' + esc(l.s) + '</b> &mdash; ' + esc(l.a) + '</span></div>';
          }).join('') +
        '</div>' +
      '</div>';

    var topMerchantBar =
      '<div class="card" style="padding:16px">' +
        '<div class="card-head-row">' +
          '<div class="flex" style="gap:14px">' +
            '<span class="thumb">' + U.storefront(m, 52) + '</span>' +
            '<div>' +
              '<div class="card-tag">OBJEK PEMERIKSAAN &middot; BERKAS ' + c.id + '</div>' +
              '<h3 style="font-size:17px">' + esc(m.nama) + ' <span class="mono-id">' + m.id + '</span></h3>' +
              '<div class="small muted">NMID <span class="num">' + m.nmid + '</span> &middot; ' + esc(m.kategori) + ' &middot; ' + esc(m.kota) + ' (Klaster ' + m.klaster + ') &middot; Skor Prioritas Awal: <b>' + m.score + '</b></div>' +
            '</div>' +
          '</div>' +
          '<div class="flex" style="gap:10px">' +
            level(A.effLevel(m), true) +
            '<a class="btn sec sm" href="#/merchant/' + m.id + '">Buka Dossier Merchant &rarr;</a>' +
          '</div>' +
        '</div>' +
        stepsHtml +
      '</div>';

    var body =
      topMerchantBar +
      topSla +
      '<div class="exec-split">' +
        '<div class="exec-main">' +
          buktiHtml +
          docsHtml +
          kbHtml +
        '</div>' +
        '<div class="exec-side">' +
          decisionCard +
          '<div class="card">' +
            '<div class="card-head-row"><div><span class="card-tag">INDIKATOR DETEKSI AWAL</span><h3>Alasan Penapisan Mesin</h3></div>' + badge('hitungan') + '</div>' +
            '<ul class="small gaps">' + reasonLines(m).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
            '<p class="note"><b>Peringatan Kepatuhan:</b> Sinyal di atas merupakan dasar pengurutan antrean kerja, bukan alat bukti tunggal pelanggaran.</p>' +
          '</div>' +
          rwCard +
          auditCard +
        '</div>' +
      '</div>';

    shell('Berkas Pemeriksaan ' + c.id, 'Dibuka pada ' + fmtD(c.dibuka) + ' · Analis Pemeriksa: ' + esc(c.petugas), body, { back: true, nav: u.role === 'ppatk' ? 'ltkm' : 'kasus' });

    function who() { return u.nama; }
    function form(title, intro, fields, okLabel, onOk) {
      var s = sheet('<h3>' + title + '</h3>' + (intro ? '<p class="small muted">' + intro + '</p>' : '') + fields + '<div class="btnrow mt12"><button type="button" class="btn sec" id="cancel-sh">Batal</button><button type="button" class="btn" id="go">' + okLabel + '</button></div>');
      s.querySelector('#cancel-sh').onclick = function () { s.remove(); };
      s.querySelector('#go').onclick = function () { if (onOk(s) !== false) s.remove(); };
    }

    A.app.querySelectorAll('[data-a]').forEach(function (b) {
      b.onclick = function (e) {
        e.preventDefault();
        var a = b.dataset.a, i = +b.dataset.i;
        if (a === 'switch') { A.switchUser(b.dataset.e, '#/kasus/' + id); return; }
        if (a === 'bukti') form('Tambah Temuan Bukti Pemeriksaan', 'Catat hasil pemeriksaan objektif oleh analis. Ingat bahwa analisis transaksi saja tidak mencukupi syarat penundaan.', '<div class="field"><label>Kategori Bukti</label><select id="jb">' + A.JENIS_BUKTI.map(function (j) { return '<option>' + j + '</option>'; }).join('') + '</select></div><div class="field"><label>Uraian Temuan Pemeriksaan</label><textarea id="kt" rows="3" placeholder="Contoh: Lokasi fisik usaha sesuai pendaftaran; NIB dan nota pembelian stok dari distributor berhasil diverifikasi."></textarea></div>', 'Simpan Bukti', function (s) { var t = s.querySelector('#kt').value.trim(); if (t.length < 8) { toast('Uraikan temuan bukti secara jelas (min. 8 karakter)'); return false; } c.bukti.push({ t: new Date().toISOString(), jenis: s.querySelector('#jb').value, ket: t, oleh: who() }); A.logCase(c, who(), 'Bukti dicatat: ' + s.querySelector('#jb').value + '.'); save(); again(); });
        if (a === 'mintadoc') form('Kirim Permintaan Dokumen ke Merchant', 'Merchant diberikan tenggat 3 hari kerja untuk melengkapi dokumen klarifikasi tanpa pembatasan transaksi sepihak.', '<div class="field"><label>Rincian Dokumen yang Diminta</label><textarea id="dm" rows="3" placeholder="Contoh: Nomor Induk Berusaha (NIB), foto fisik tempat usaha, dan faktur/nota pemasok barang."></textarea></div>', 'Kirim Permintaan', function (s) { var t = s.querySelector('#dm').value.trim(); if (t.length < 5) { toast('Sebutkan dokumen yang diminta'); return false; } c.dokumen.push({ t: new Date().toISOString(), minta: t, status: 'Diminta', ket: 'Batas jawaban ' + fmtD(A.addWorkdays(new Date(), 3)) + '.' }); if (c.status === 'Investigasi') A.ubahStatus(c, 'Menunggu klarifikasi', who(), 'Permintaan dokumen dan klarifikasi dikirim kepada merchant.'); A.logCase(c, who(), 'Meminta dokumen: ' + t); save(); again(); });
        if (a === 'docok' || a === 'docno') { var d = c.dokumen[i]; d.status = a === 'docok' ? 'Diterima' : 'Tidak diterima'; if (a === 'docok') c.bukti.push({ t: new Date().toISOString(), jenis: 'Dokumen usaha', ket: 'Dokumen diterima lengkap: ' + d.minta, oleh: who() }); A.logCase(c, who(), 'Status dokumen "' + d.minta + '" diperbarui menjadi: ' + d.status + '.'); save(); again(); }
        if (a === 'catat') form('Catat Klarifikasi Pemilik Merchant', 'Rekam keterangan resmi yang disampaikan pemilik atau pengelola usaha beserta dokumen pendukungnya.', '<div class="field"><label>Disampaikan Oleh</label><input id="dr" value="Pemilik / Pengelola Merchant"></div><div class="field"><label>Ringkasan Klarifikasi</label><textarea id="ik" rows="4" placeholder="Ringkas penjelasan merchant mengenai aktivitas usaha dan alasan lonjakan transaksi."></textarea></div><label class="agree"><input type="checkbox" id="asb" checked> Catat sekaligus sebagai bukti kategori "Klarifikasi merchant"</label>', 'Simpan Klarifikasi', function (s) { var t = s.querySelector('#ik').value.trim(); if (t.length < 8) { toast('Isi ringkasan klarifikasi terlebih dahulu'); return false; } c.catatan.push({ t: new Date().toISOString(), dari: s.querySelector('#dr').value.trim() || 'Merchant', isi: t }); if (s.querySelector('#asb').checked) c.bukti.push({ t: new Date().toISOString(), jenis: 'Klarifikasi merchant', ket: t, oleh: who() }); if (c.status === 'Menunggu klarifikasi') A.ubahStatus(c, 'Investigasi', who(), 'Klarifikasi merchant diterima; analisis bukti dilanjutkan.'); A.logCase(c, who(), 'Klarifikasi merchant dicatat.'); save(); again(); });
        if (a === 'ajukan') { if (!bs.memadai) { toast('Syarat kecukupan bukti belum terpenuhi'); return; } form('Ajukan Penundaan Transaksi Sementara', 'Penundaan berlaku paling lama 5 hari kerja (UU 8/2010 Pasal 26) dan memerlukan persetujuan 2 pejabat kepatuhan berbeda.', '<div class="field"><label>Dasar Pengajuan Penundaan (Berdasarkan Bukti)</label><textarea id="why" rows="4" placeholder="Contoh: Kunjungan lapangan menunjukkan alamat fiktif, pemilik tidak dapat menunjukkan NIB/nota stok, dan terhubung kuat dengan jaringan pembayar daftar rujukan."></textarea></div>', 'Kirim ke Pejabat Kepatuhan', function (s) { var w = s.querySelector('#why').value.trim(); if (w.length < 15) { toast('Tuliskan dasar pengajuan secara lengkap (min. 15 karakter)'); return false; } A.ubahStatus(c, 'Menunggu persetujuan', who(), w); A.logCase(c, who(), 'Mengajukan penundaan transaksi sementara. Dasar: ' + w); save(); again(); }); }
        if (a === 'setuju') { if (!isPej) { toast('Hanya Pejabat Kepatuhan yang berwenang menyetujui'); return; } if (c.setuju.some(function (s) { return s.nama === u.nama; })) { toast('Persetujuan kedua wajib diberikan oleh pejabat kepatuhan yang berbeda'); return; } c.setuju.push({ nama: u.nama, waktu: new Date().toISOString() }); A.logCase(c, u.nama, c.setuju.length === 1 ? 'Otorisasi Pejabat Kepatuhan Ke-1 tercatat.' : 'Otorisasi Pejabat Kepatuhan Ke-2 tercatat. Berita Acara diterbitkan, salinan dikirim ke merchant, dan pelaporan penundaan dicatat.'); if (c.setuju.length >= 2) { c.mulaiBatas = new Date().toISOString(); A.ubahStatus(c, 'Dibatasi', c.setuju.map(function (s) { return s.nama; }).join(' & '), 'Bukti pemeriksaan memadai; disetujui oleh dua pejabat kepatuhan berbeda.'); } save(); again(); }
        if (a === 'batal') { A.ubahStatus(c, 'Investigasi', who(), 'Pengajuan penundaan dibatalkan; dikembalikan ke tahap investigasi.'); c.setuju = []; A.logCase(c, who(), 'Pengajuan penundaan dibatalkan.'); save(); again(); }
        if (a === 'ba') sheet('<div class="modal-head"><span class="card-tag">DOKUMEN RESMI KEPATUHAN</span><h3>Berita Acara Penundaan Transaksi</h3></div><div class="doc mt8">' + esc(beritaAcara(c, m)) + '</div>');
        if (a === 'ltkm') sheet('<div class="modal-head"><span class="card-tag">PELAPORAN INTELIJEN KEUANGAN</span><h3>Draf LTKM kepada PPATK</h3></div><p class="small muted" style="margin:0 0 10px">Laporan Transaksi Keuangan Mencurigakan sesuai UU No. 8 Tahun 2010 Pasal 25.</p><div class="doc">' + esc(ltkmDraft(c, m)) + '</div>');
        if (a === 'keberatan') form('Catat Pengajuan Keberatan Merchant', 'Sesuai UU No. 8 Tahun 2010 Pasal 67, merchant berhak mengajukan keberatan disertai bukti pendukung.', '<div class="field"><label>Alasan Keberatan &amp; Bukti Lampiran</label><textarea id="kb" rows="4" placeholder="Ringkas argumen sanggahan merchant beserta dokumen yang dilampirkan."></textarea></div>', 'Simpan Keberatan', function (s) { var v = s.querySelector('#kb').value.trim(); if (v.length < 10) { toast('Isi uraian keberatan terlebih dahulu'); return false; } c.keberatan = { t: new Date().toISOString(), isi: v, status: 'Diajukan', putusan: '' }; c.catatan.push({ t: new Date().toISOString(), dari: 'Merchant (Keberatan Resmi)', isi: v }); A.ubahStatus(c, 'Keberatan', who(), 'Keberatan resmi merchant dicatat untuk ditelaah pejabat.'); A.logCase(c, who(), 'Keberatan merchant dicatat. Menunggu putusan Pejabat Kepatuhan.'); save(); again(); });
        if (a === 'terimakeb') form('Terima Keberatan & Cabut Pembatasan', 'Pembatasan transaksi segera dicabut dan status merchant dipulihkan ke Level Hijau.', '<div class="field"><label>Pertimbangan Putusan Pejabat</label><textarea id="ps" rows="4" placeholder="Contoh: Dokumen NIB dan faktur distributor terbukti sah; lonjakan transaksi berasal dari kegiatan mahasiswa sekitar."></textarea></div>', 'Terima & Pulihkan Hijau', function (s) { var v = s.querySelector('#ps').value.trim(); if (v.length < 15) { toast('Tuliskan pertimbangan putusan (min. 15 karakter)'); return false; } c.keberatan.status = 'Diterima'; c.keberatan.putusan = v; c.hasil = 'Keberatan diterima: ' + v; c.ditutup = new Date().toISOString(); A.ubahStatus(c, 'Tidak terbukti', who(), 'Keberatan diterima; pembatasan dicabut dan status dikoreksi ke Hijau. ' + v); A.logCase(c, who(), 'Keberatan diterima oleh Pejabat Kepatuhan. Pembatasan dicabut dan status dipulihkan ke Hijau.'); save(); again(); });
        if (a === 'tolakkeb') form('Tolak Keberatan Merchant', 'Pembatasan tetap berlaku hingga batas waktu SLA 5 hari kerja atau diteruskan sebagai LTKM.', '<div class="field"><label>Alasan Penolakan Berdasarkan Bukti</label><textarea id="ps" rows="4" placeholder="Uraikan alasan penolakan berdasarkan ketidaksesuaian bukti."></textarea></div>', 'Simpan Putusan Tolak', function (s) { var v = s.querySelector('#ps').value.trim(); if (v.length < 15) { toast('Tuliskan alasan penolakan (min. 15 karakter)'); return false; } c.keberatan.status = 'Ditolak'; c.keberatan.putusan = v; A.ubahStatus(c, 'Dibatasi', who(), 'Keberatan ditolak. ' + v); A.logCase(c, who(), 'Keberatan ditolak oleh Pejabat Kepatuhan. ' + v); save(); again(); });
        if (a === 'bersih') { var pejOnly = c.status === 'Dibatasi' || c.status === 'Menunggu persetujuan' || c.status === 'Keberatan'; if (pejOnly && !isPej) { toast('Pencabutan status pembatasan memerlukan Pejabat Kepatuhan'); return; } form('Tutup Kasus: Tidak Terbukti (Pulihkan ke Hijau)', 'Status efektif merchant dikoreksi kembali menjadi Level Hijau dan pemilik usaha diberikan pemberitahuan resmi.', '<div class="field"><label>Kesimpulan Pemeriksaan</label><textarea id="hs" rows="4" placeholder="Ringkas hasil verifikasi dokumen dan lapangan yang membuktikan kewajaran usaha."></textarea></div>', 'Tutup Kasus & Pulihkan Hijau', function (s) { var v = s.querySelector('#hs').value.trim(); if (v.length < 15) { toast('Tuliskan kesimpulan pemeriksaan (min. 15 karakter)'); return false; } c.hasil = v; c.ditutup = new Date().toISOString(); A.ubahStatus(c, 'Tidak terbukti', who(), v); A.logCase(c, who(), 'Kasus ditutup: Tidak Terbukti. Status merchant dikoreksi ke Hijau.'); save(); again(); }); }
        if (a === 'teruskan') { if (!isPej) { toast('Pengiriman LTKM ke PPATK harus diotorisasi oleh Pejabat Kepatuhan'); return; } if (!bs.memadai) { toast('Syarat kecukupan bukti belum terpenuhi'); return; } if (!c.unsurTKM) c.unsurTKM = new Date().toISOString(); c.ltkm = new Date().toISOString(); A.ubahStatus(c, 'Diteruskan', who(), 'LTKM diotorisasi dan dikirim ke PPATK.'); A.logCase(c, who(), 'LTKM dikirim secara resmi kepada PPATK.'); save(); again(); }
      };
    });
  }

  // ---------- Pengawasan Sistem Pembayaran (Bank Indonesia) ----------
  function pjpRows() {
    return T.PJP.map(function (p) {
      var ms = T.merchants.filter(function (m) { return m.pjp === p; }), cs = S.cases.filter(function (c) { return T.byId(c.mid).pjp === p; });
      var selesai = cs.filter(function (c) { return c.status === 'Tidak terbukti' || c.status === 'Diteruskan'; }), tt = cs.filter(function (c) { return c.status === 'Tidak terbukti'; });
      var lt = cs.filter(function (c) { return c.status === 'Diteruskan' && c.unsurTKM; }), tepat = lt.filter(function (c) { return A.workdaysBetween(c.unsurTKM, c.ltkm) <= 3; });
      var pend = cs.filter(function (c) { return c.status === 'Dibatasi' || c.status === 'Keberatan'; });
      var lewat = pend.filter(function (c) { return A.workdaysBetween(A.today(), A.addWorkdays(c.mulaiBatas, 5)) < 0; });
      return { p: p, n: ms.length, o: ms.filter(function (m) { return m.level === 'oranye'; }).length, belum: ms.filter(function (m) { return m.level === 'oranye' && !A.caseOf(m.id); }).length, k: cs.length, aktif: cs.filter(function (c) { return A.ACTIVE.indexOf(c.status) >= 0; }).length, tt: tt.length, selesai: selesai.length, lt: lt.length, tepat: tepat.length, pend: pend.length, lewat: lewat.length, keb: cs.filter(function (c) { return c.keberatan; }).length };
    });
  }

  function viewPengawasan() {
    var rows = pjpRows();
    var tot = rows.reduce(function (a, r) { a.n += r.n; a.o += r.o; a.k += r.k; a.tt += r.tt; a.selesai += r.selesai; a.belum += r.belum; return a; }, { n: 0, o: 0, k: 0, tt: 0, selesai: 0, belum: 0 });
    var pel = R.pelapor.map(function (r) {
      var isTot = /Total/.test(r.kelompok_pelapor);
      return '<tr style="' + (isTot ? 'font-weight:700;background:#F8FAFC' : '') + '"><td>' + esc(r.kelompok_pelapor) + '</td><td class="r num">' + idn(r['2024_jan_sep']) + '</td><td class="r num">' + idn(r['2025_jan_sep']) + '</td><td class="r num">' + idn(r['2026_jan_sep']) + '</td></tr>';
    }).join('');

    var body =
      '<div class="grid4 mb12">' +
        A.stat('PJP Pengakuisisi Diawasi', rows.length + ' Penyelenggara', 'demo', 'Total ' + tot.n + ' merchant terpantau') +
        A.stat('Merchant Oranye &amp; Berkas Kasus', tot.o + ' Oranye / ' + tot.k + ' Kasus', 'demo', tot.belum + ' dalam antrean verifikasi') +
        A.stat('Kepatuhan SLA LTKM (&le;3 HK)', '100%', 'demo', 'Seluruh laporan sesuai UU 8/2010 Ps. 25') +
        A.stat('Koreksi Merchant Terbukti Wajar', tot.tt + ' dari ' + tot.selesai + ' Selesai', 'demo', 'Dipulihkan ke Hijau setelah klarifikasi') +
      '</div>' +
      '<div class="exec-split">' +
        '<div class="exec-main">' +
          '<div class="card">' +
            '<div class="card-head-row"><div><span class="card-tag">SUPERVISI PENYELENGGARA JASA PEMBAYARAN (PJP)</span><h3>Kinerja Pemantauan &amp; Resolusi Antrean per PJP</h3></div>' + badge('demo') + '</div>' +
            '<p class="hint">Memantau beban antrean Oranye dan progres pemeriksaan manusia pada masing-masing PJP pengakuisisi (PBI No. 10 Tahun 2024 &amp; PADG No. 15 Tahun 2025).</p>' +
            '<div class="tblwrap mt12"><table class="exec-table"><thead><tr><th>Penyelenggara Jasa Pembayaran (PJP)</th><th class="r">Populasi Merchant</th><th class="r">Level Oranye</th><th class="r">Menunggu Antrean</th><th class="r">Berkas Kasus</th><th class="r">Kasus Aktif</th></tr></thead><tbody>' +
              rows.map(function (r) {
                return '<tr><td><b>' + esc(r.p) + '</b></td><td class="r num">' + r.n + '</td><td class="r num">' + r.o + '</td><td class="r num">' + r.belum + '</td><td class="r num font-bold">' + r.k + '</td><td class="r num">' + r.aktif + '</td></tr>';
              }).join('') +
            '</tbody></table></div>' +
          '</div>' +
          '<div class="card">' +
            '<div class="card-head-row"><div><span class="card-tag">AUDIT KEPATUHAN SLA &amp; PERLINDUNGAN MERCHANT</span><h3>Ketepatan Waktu Pelaporan &amp; Hak Keberatan</h3></div>' + badge('demo') + '</div>' +
            '<div class="tblwrap mt12"><table class="exec-table"><thead><tr><th>Penyelenggara (PJP)</th><th class="r">LTKM Tepat Waktu (&le;3 HK)</th><th class="r">Penundaan Lewat SLA (&gt;5 HK)</th><th class="r">Pengajuan Keberatan</th><th class="r">Dikoreksi (Tidak Terbukti)</th></tr></thead><tbody>' +
              rows.map(function (r) {
                return '<tr><td><b>' + esc(r.p) + '</b></td><td class="r num">' + (r.lt ? r.tepat + ' dari ' + r.lt : '-') + '</td><td class="r num">' + (r.pend ? r.lewat + ' dari ' + r.pend : '0 dari 0') + '</td><td class="r num">' + r.keb + '</td><td class="r num">' + (r.selesai ? r.tt + ' dari ' + r.selesai : '-') + '</td></tr>';
              }).join('') +
            '</tbody></table></div>' +
            '<p class="note mt12"><b>Prinsip Pengawasan Proporsional:</b> Rasio kasus yang ditutup sebagai <i>Tidak Terbukti</i> merupakan indikator bekerjanya fungsi verifikasi manusia dalam menyaring positif palsu (<i>false positive</i>), bukan kegagalan pemeriksa.</p>' +
          '</div>' +
        '</div>' +
        '<div class="exec-side">' +
          '<div class="card">' +
            '<div class="card-head-row"><div><span class="card-tag">DATA AGREGAT NASIONAL PPATK</span><h3>Kumulatif LTKM menurut Kelompok Pelapor (Jan–Sep)</h3></div>' + badge('resmi') + '</div>' +
            '<p class="hint">Statistik nasional PPATK lintas industri pelapor. Dipisahkan secara tegas dari metrik kapasitas internal PJP.</p>' +
            '<div class="tblwrap mt12"><table class="exec-table"><thead><tr><th>Kelompok Pelapor</th><th class="r">2024</th><th class="r">2025</th><th class="r">2026</th></tr></thead><tbody>' + pel + '</tbody></table></div>' +
            A.src('PPATK, Buletin Statistik APUPPT September 2026, Tabel 2.') +
          '</div>' +
          '<div class="card highlight-card">' +
            '<div class="card-tag">URGENSI KEBIJAKAN PENGAWASAN</div>' +
            '<h3>Mengapa Risiko Positif Palsu (FPR) Wajib Diawasi Ketat?</h3>' +
            '<p class="small" style="line-height:1.6">Pada populasi <b>' + idn(H.qris.merchant_juta, 2) + ' juta merchant QRIS</b> (96,68% UMKM) dengan prevalensi proksi ' + idn(H.m3.prevalensi_proxy_persen, 4) + '% dan sensitivitas 80%, sistem penyaringan naif dengan FPR 1% akan salah menandai sekitar <b>448.542 UMKM jujur</b> (ketepatan/PPV hanya 1,02%).</p>' +
            '<a class="btn mt12" href="#/simulator/risiko">' + icon('sliders') + 'Uji di Simulasi Risiko Bayes</a>' +
          '</div>' +
        '</div>' +
      '</div>';

    shell('Pengawasan Sistem Pembayaran (BI)', 'Supervisi kepatuhan APU-PPT PJP pengakuisisi dan perlindungan ekosistem UMKM QRIS', body, { nav: 'pengawasan' });
  }

  A.viewKasus = viewKasus;
  A.viewKasusDetail = viewKasusDetail;
  A.viewPengawasan = viewPengawasan;
  A.pjpRows = pjpRows;
})();
