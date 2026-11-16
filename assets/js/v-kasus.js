/* TAPIS: manajemen berkas kasus pemeriksaan manusia, otorisasi ganda 2 pejabat (Dual-Control), berita acara & LTKM, serta dashboard pengawasan Bank Indonesia (Mobile Flagship Architecture). */
(function () {
  'use strict';
  var A = window.A, T = A.T, U = A.U, H = A.H, R = A.R, S = A.S, icon = U.icon, idn = U.idn, esc = U.esc, badge = U.badge, level = U.level;
  var shell = A.shell, me = A.me, isPJP = A.isPJP, toast = A.toast, sheet = A.sheet, fmtD = A.fmtD, fmtDT = A.fmtDT;

  A.ltkmInfo = function (open) {
    return '<details class="info"' + (open ? ' open' : '') + '>' +
      '<summary><span class="q">' + icon('help') + '</span><span>Protokol LTKM &amp; Kepatuhan UU No. 8 Tahun 2010<small>Pelaporan ke PPATK &amp; Pengawasan Sistem Pembayaran BI</small></span>' + icon('chev', 'dd') + '</summary>' +
      '<div class="bd">' +
        '<p><b>LTKM (Laporan Transaksi Keuangan Mencurigakan)</b> wajib disampaikan oleh PJP Pengakuisisi kepada <b>PPATK</b> setelah verifikasi bukti manusia memadai.</p>' +
        '<ul>' +
          '<li><b>Pemisahan Peran:</b> PJP memverifikasi merchant; LTKM dikirim ke <b>PPATK</b>; <b>Bank Indonesia</b> mengawasi tata kelola PJP dan perlindungan UMKM.</li>' +
          '<li><b>Batas Waktu LTKM (Pasal 25 ayat 1):</b> Maksimal <b>3 hari kerja</b> sejak unsur TKM diketahui pejabat kepatuhan.</li>' +
          '<li><b>Batas Penundaan (Pasal 26):</b> Maksimal <b>5 hari kerja</b> disertai Berita Acara dan hak keberatan (Pasal 67).</li>' +
        '</ul>' +
        '<span class="lk">UU No. 8 Tahun 2010 Ps. 23, 25, 26, 67 &middot; PBI No. 10/2024 &middot; PADG No. 15/2025</span>' +
      '</div>' +
    '</details>';
  };

  A.caseRow = function (c) {
    var m = T.byId(c.mid), bs = A.buktiStatus(c);
    return '<a class="item" href="#/kasus/' + c.id + '">' +
      '<span class="thumb">' + U.storefront(m, 42) + '</span>' +
      '<span class="meta">' +
        '<div class="t">' + esc(m.nama) + ' <span class="mono-id">' + c.id + '</span></div>' +
        '<div class="s">' + esc(m.kota) + ' &middot; PIC: <b>' + esc(c.petugas) + '</b> &middot; ' + fmtD(c.dibuka) + '</div>' +
        '<div class="item-badges">' + A.stPill(c.status) + ' <span class="typo-pill">Bukti: ' + bs.label + ' (' + bs.n + ')</span></div>' +
      '</span>' +
      '<span class="right"><div class="score num">' + m.score + '<small>Skor</small></div>' + level(A.effLevel(m)) + '</span>' +
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
      '<div class="grid2 mb12">' +
        A.stat('Total Berkas Kasus', S.cases.length + ' Kasus', 'demo', 'Tercatat di jejak audit') +
        A.stat('Investigasi Aktif', nAktif + ' Berkas', 'demo', nBatas + ' penundaan 5 HK') +
        A.stat('Koreksi UMKM', cleared + ' Toko', 'demo', 'Dipulihkan ke Hijau') +
        A.stat('LTKM ke PPATK', nLtkm + ' Laporan', 'demo', 'SLA &le;3 hari kerja') +
      '</div>';

    var chips = u.role === 'ppatk' ? '' :
      '<div class="chips">' + [
        ['aktif', 'Aktif', nAktif],
        ['selesai', 'Selesai', nSelesai],
        ['semua', 'Semua', all.length]
      ].map(function (c) {
        return '<button type="button" class="chip ' + (kFilter === c[0] ? 'on' : '') + '" data-f="' + c[0] + '">' + c[1] + ' <span class="chip-count">' + c[2] + '</span></button>';
      }).join('') + '</div>';

    var body =
      kpiStrip +
      A.ltkmInfo(u.role === 'ppatk') +
      (u.role !== 'ppatk' && cleared ?
        '<div class="umkm-protect-box mb12">' +
          icon('shield') +
          '<div><b>Mekanisme Koreksi UMKM Bekerja:</b> <b>' + cleared + ' merchant</b> berstatus Oranye telah diverifikasi dokumen &amp; lapangan, dinyatakan <b>Tidak Terbukti</b>, dan dipulihkan penuh ke <b>Hijau</b>.</div>' +
        '</div>' : '') +
      '<div class="card">' +
        '<div class="card-head-row">' +
          '<div><span class="card-tag">DIREKTORI BERKAS KASUS</span><h3>' + (u.role === 'ppatk' ? 'Laporan LTKM Masuk' : 'Berkas Pemeriksaan') + '</h3></div>' +
        '</div>' +
        (chips ? '<div class="mt8">' + chips + '</div>' : '') +
        '<div class="list mt8">' + (list.map(A.caseRow).join('') || '<div class="empty">Tidak ada berkas kasus pada kategori ini.</div>') + '</div>' +
      '</div>';

    shell(u.role === 'ppatk' ? 'LTKM Masuk (PPATK)' : 'Berkas Kasus & Audit', 'Verifikasi bukti manusia & otorisasi 2 pejabat', body, { nav: u.role === 'ppatk' ? 'ltkm' : 'kasus' });
    A.app.querySelectorAll('[data-f]').forEach(function (b) { b.onclick = function () { kFilter = b.dataset.f; viewKasus(); }; });
  }

  function reasonLines(m) {
    var r = [];
    if (m.sig.J) r.push('Pilar J (Jejaring): ' + idn(m.sharedShare * 100, 1) + '% pembayar lintas merchant (3+ toko), terhubung ' + m.nLinks + ' merchant.');
    if (m.sig.P) r.push('Pilar P (Sebaya): Robust Z vs sebaya = ' + idn(m.peerZ, 2) + (m.ownZ !== null ? ', vs riwayat sendiri = ' + idn(m.ownZ, 2) : '') + '.');
    if (m.sig.K) r.push('Pilar K (Profil): Umur ' + m.umur + ' hari, tiket rata-rata ' + U.rp(m.stat.meanAmt) + (m.listStrong.length ? ', ' + m.listStrong.length + ' cocok rujukan' : '') + '.');
    return r;
  }

  function beritaAcara(c, m) {
    var end = A.addWorkdays(c.mulaiBatas, 5);
    return 'BERITA ACARA PENUNDAAN TRANSAKSI SEMENTARA\nNomor Dokumen : BA/' + c.id + '/APU-PPT\nInstansi PJP  : ' + m.pjp + '\n====================================================\n\nPada ' + fmtDT(c.mulaiBatas) + ' WIB, Unit Kepatuhan APU-PPT ' + m.pjp + ' menetapkan penundaan transaksi sementara atas merchant:\n  Nama Usaha   : ' + m.nama + '\n  NMID         : ' + m.nmid + '\n  Kategori/MCC : ' + m.kategori + ' (MCC ' + m.mcc + ')\n  Kota/Wilayah : ' + m.kota + ' (Klaster ' + m.klaster + ')\n  Nama Pemilik : ' + m.pemilik +
      '\n\nDASAR PEMERIKSAAN OBJEKTIF (' + c.petugas + '):\n' + c.bukti.map(function (b, i) { return '  ' + (i + 1) + '. [' + b.jenis + '] ' + b.ket; }).join('\n') +
      '\n\nJANGKA WAKTU & LANDASAN HUKUM:\n  Durasi       : Maksimal 5 hari kerja, berakhir pada ' + fmtD(end) + '\n  Dasar Hukum  : UU No. 8 Tahun 2010 Pasal 26; PBI No. 10 Tahun 2024 Pasal 37\n\nJAMINAN HAK MERCHANT:\nMerchant berhak mengajukan keberatan tertulis beserta dokumen pendukung (NIB, nota stok pemasok) sesuai UU No. 8 Tahun 2010 Pasal 67.\n\nOTORISASI DUA PEJABAT KEPATUHAN:\n  1. ' + (c.setuju[0] ? c.setuju[0].nama + ' (' + fmtDT(c.setuju[0].waktu) + ')' : '-') + '\n  2. ' + (c.setuju[1] ? c.setuju[1].nama + ' (' + fmtDT(c.setuju[1].waktu) + ')' : '-');
  }

  function ltkmDraft(c, m) {
    return 'DOKUMEN LAPORAN TRANSAKSI KEUANGAN MENCURIGAKAN (LTKM)\nKepada Yth.   : Kepala PPATK\nPihak Pelapor : ' + m.pjp + '\nNomor Berkas  : LTKM/' + c.id + '\n====================================================\n\nIDENTITAS TERLAPOR:\n  Nama Merchant : ' + m.nama + ' (NMID ' + m.nmid + ')\n  Pemilik       : ' + m.pemilik + '\n  Wilayah       : ' + m.kota + ' (Klaster Ekonomi ' + m.klaster + ')\n  Indikasi TPA  : Tindak Pidana Perjudian Daring\n\nINDIKATOR AWAL:\n' + reasonLines(m).map(function (x, i) { return '  ' + (i + 1) + '. ' + x; }).join('\n') +
      '\n\nHASIL VERIFIKASI & PEMBUKTIAN MANUSIA:\n' + c.bukti.map(function (b, i) { return '  ' + (i + 1) + '. [' + b.jenis + ' — ' + fmtD(b.t) + '] ' + b.ket + ' (' + b.oleh + ')'; }).join('\n') +
      '\n\nPERNYATAAN PERLINDUNGAN UMKM:\nJam transaksi malam hari, nominal kecil/seragam, dan lonjakan acara lokal TIDAK dijadikan dasar pelaporan.\n\nSLA PELAPORAN:\nDisampaikan dalam batas waktu <=3 hari kerja sesuai UU No. 8 Tahun 2010 Pasal 25 ayat (1).';
  }

  var FLOW = [
    ['Investigasi', 'Investigasi'],
    ['Menunggu persetujuan', '2 Pejabat'],
    ['Dibatasi', 'Penundaan'],
    ['Keberatan', 'Keberatan'],
    ['Selesai', 'Putusan']
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
      return '<div class="st-node ' + st + '"><div class="st-circle">' + (st === 'done' ? icon('check') : (i + 1)) + '</div><div class="st-txt"><b>' + f[1] + '</b></div></div>';
    }).join('') + '</div>';

    var topSla = '';
    if (c.status === 'Dibatasi' || c.status === 'Keberatan') {
      var end = A.addWorkdays(c.mulaiBatas, 5), left = A.workdaysBetween(A.today(), end);
      topSla = '<div class="countdown-card' + (left < 0 ? ' over' : '') + '">' +
        '<div class="cd-icon">' + icon('clock') + '</div>' +
        '<div class="cd-content">' +
          '<div class="cd-tag">SLA PENUNDAAN &middot; UU 8/2010 PASAL 26</div>' +
          '<div class="cd-val num">' + (left < 0 ? 'Batas Waktu Terlewati' : left + ' hari kerja tersisa (s.d. ' + fmtD(end) + ')') + '</div>' +
          '<div class="cd-desc">Penundaan berlaku maks. 5 hari kerja sejak disetujui 2 pejabat, lalu wajib dicabut atau diteruskan ke PPATK.</div>' +
        '</div>' +
      '</div>';
    }

    // Dual-Control Officer Approval Panel
    var slot1 = c.setuju[0], slot2 = c.setuju[1];
    var dualControlBox =
      '<div class="dual-control-box mt8">' +
        '<div class="dc-slot ' + (slot1 ? 'approved' : '') + '">' +
          '<div class="dc-badge">' + (slot1 ? icon('check') : '1') + '</div>' +
          '<div><b>Pejabat Kepatuhan Ke-1</b><span>' + (slot1 ? esc(slot1.nama) + ' &middot; ' + fmtDT(slot1.waktu) : 'Menunggu Pejabat 1 (Dimas Prakoso)') + '</span></div>' +
        '</div>' +
        '<div class="dc-slot ' + (slot2 ? 'approved' : '') + '">' +
          '<div class="dc-badge">' + (slot2 ? icon('check') : '2') + '</div>' +
          '<div><b>Pejabat Kepatuhan Ke-2</b><span>' + (slot2 ? esc(slot2.nama) + ' &middot; ' + fmtDT(slot2.waktu) : 'Menunggu Pejabat 2 berbeda (Hana Lestari)') + '</span></div>' +
        '</div>' +
      '</div>';

    function roleSwitchHelper(targetEmail, label) {
      return '<div class="warnnote mt8">Tindakan otorisasi memerlukan akun <b>Pejabat Kepatuhan</b>. <button type="button" class="link-btn" data-a="switch" data-e="' + targetEmail + '">Beralih ke ' + label + ' di halaman ini &rarr;</button></div>';
    }

    var actsHtml = '';
    if (canAct && !closed) {
      if (c.status === 'Investigasi' || c.status === 'Menunggu klarifikasi') {
        actsHtml =
          '<button type="button" class="btn block mt8" data-a="ajukan"' + (bs.memadai ? '' : ' disabled') + '>' + icon('shield') + 'Ajukan Penundaan ke Pejabat</button>' +
          (bs.memadai ? '' : '<p class="small muted mt8">Tombol pengajuan terkunci hingga minimal 2 jenis bukti (termasuk non-transaksi) tercatat.</p>') +
          '<div class="btnrow mt8">' +
            '<button type="button" class="btn sec" data-a="bersih">' + icon('check') + 'Tidak Terbukti (Hijau)</button>' +
            (isPej ? '<button type="button" class="btn sec" data-a="teruskan"' + (bs.memadai ? '' : ' disabled') + '>' + icon('send') + 'Teruskan LTKM</button>' : '') +
          '</div>' +
          (isPej ? '' : roleSwitchHelper('dimas@arunika.demo', 'Dimas Prakoso (Pejabat 1)'));
      }
      if (c.status === 'Menunggu persetujuan') {
        var already = c.setuju.some(function (s) { return s.nama === u.nama; });
        var nextPejEmail = c.setuju.some(function (s) { return s.nama.indexOf('Dimas') >= 0; }) ? 'hana@arunika.demo' : 'dimas@arunika.demo';
        var nextPejName = nextPejEmail === 'hana@arunika.demo' ? 'Hana Lestari (Pejabat 2)' : 'Dimas Prakoso (Pejabat 1)';
        actsHtml =
          (isPej && !already ? '<button type="button" class="btn block mt8" data-a="setuju">' + icon('check') + 'Setujui Penundaan sebagai ' + esc(u.nama) + '</button>' : '') +
          (isPej && already ? roleSwitchHelper(nextPejEmail, nextPejName) : '') +
          (!isPej ? roleSwitchHelper(nextPejEmail, nextPejName) : '') +
          '<button type="button" class="btn sec block mt8" data-a="batal">Batalkan Pengajuan</button>';
      }
      if (c.status === 'Dibatasi') {
        actsHtml =
          '<div class="btnrow mt8">' +
            '<button type="button" class="btn sec" data-a="ba">' + icon('file') + 'Berita Acara</button>' +
            '<button type="button" class="btn sec" data-a="keberatan">Catat Keberatan</button>' +
          '</div>' +
          (isPej ?
            '<div class="btnrow mt8">' +
              '<button type="button" class="btn sec" data-a="bersih">Cabut: Tidak Terbukti</button>' +
              '<button type="button" class="btn" data-a="teruskan">' + icon('send') + 'Kirim LTKM</button>' +
            '</div>' :
            roleSwitchHelper('dimas@arunika.demo', 'Dimas Prakoso (Pejabat 1)'));
      }
      if (c.status === 'Keberatan') {
        actsHtml =
          '<button type="button" class="btn sec block mt8" data-a="ba">' + icon('file') + 'Lihat Berita Acara Penundaan</button>' +
          (isPej ?
            '<div class="btnrow mt8">' +
              '<button type="button" class="btn" data-a="terimakeb">' + icon('check') + 'Terima &amp; Pulihkan</button>' +
              '<button type="button" class="btn red" data-a="tolakkeb">Tolak Keberatan</button>' +
            '</div>' +
            '<button type="button" class="btn sec block mt8" data-a="teruskan">' + icon('send') + 'Teruskan LTKM ke PPATK</button>' :
            roleSwitchHelper('dimas@arunika.demo', 'Dimas Prakoso (Pejabat 1)'));
      }
    }
    if (c.status === 'Diteruskan') {
      actsHtml =
        '<button type="button" class="btn sec block mt8" data-a="ltkm">' + icon('file') + 'Buka Dokumen Draf LTKM PPATK</button>' +
        (c.unsurTKM ? '<p class="note mt8"><b>SLA Pelaporan:</b> Unsur TKM diketahui ' + fmtD(c.unsurTKM) + ', LTKM dikirim ' + fmtD(c.ltkm) + ' (<b>' + A.workdaysBetween(c.unsurTKM, c.ltkm) + ' hari kerja</b>; batas UU 8/2010 Ps. 25 maks. 3 HK).</p>' : '');
    }
    if (c.status === 'Tidak terbukti') {
      actsHtml =
        '<div class="umkm-protect-box mt8">' +
          icon('shield') +
          '<div><b>Hasil Akhir — Tidak Terbukti:</b> ' + esc(c.hasil || 'Aktivitas usaha terbukti wajar.') + ' Status dikoreksi ke <b>Hijau</b>.</div>' +
        '</div>';
    }

    var chk =
      '<ul class="chk">' +
        '<li class="' + (bs.n >= 2 ? 'ok' : '') + '">Minimal 2 jenis bukti berbeda tercatat (Saat ini: <b>' + bs.n + '</b>)</li>' +
        '<li class="' + (bs.nonTrx >= 1 ? 'ok' : '') + '">Minimal 1 bukti non-transaksi seperti kunjungan/dokumen (Saat ini: <b>' + bs.nonTrx + '</b>)</li>' +
        '<li class="' + (bs.okDoc ? 'ok' : '') + '">Tidak ada permintaan dokumen klarifikasi yang masih menunggu</li>' +
      '</ul>';

    var editable = canAct && !closed;

    var body =
      '<div class="card">' +
        '<div class="card-head-row">' +
          '<div class="flex" style="gap:10px">' +
            '<span class="thumb">' + U.storefront(m, 44) + '</span>' +
            '<div>' +
              '<span class="card-tag">BERKAS ' + c.id + ' &middot; SKOR ' + m.score + '</span>' +
              '<h3>' + esc(m.nama) + '</h3>' +
              '<div class="small muted">' + esc(m.kategori) + ' &middot; ' + esc(m.kota) + ' (K' + m.klaster + ')</div>' +
            '</div>' +
          '</div>' +
          '<a class="btn sec sm" href="#/merchant/' + m.id + '">Dossier</a>' +
        '</div>' +
        stepsHtml +
      '</div>' +

      topSla +

      '<div class="card">' +
        '<div class="card-head-row"><div><span class="card-tag">OTORISASI DUA PEJABAT (DUAL-CONTROL)</span><h3>Keputusan &amp; Persetujuan</h3></div>' + A.stPill(c.status) + '</div>' +
        '<p class="hint">Pembatasan wajib disetujui 2 Pejabat Kepatuhan berbeda untuk mencegah kesalahan tunggal.</p>' +
        dualControlBox +
        actsHtml +
      '</div>' +

      (c.keberatan ?
        '<div class="card highlight-card">' +
          '<div class="card-head-row"><div><span class="card-tag">HAK SANGGAH &middot; UU 8/2010 PASAL 67</span><h3>Keberatan Resmi Merchant</h3></div><span class="pill st-keberatan">' + c.keberatan.status + '</span></div>' +
          '<p class="small" style="margin-top:6px">' + esc(c.keberatan.isi) + '</p>' +
          '<p class="small muted">Diajukan ' + fmtD(c.keberatan.t) + '.' + (c.keberatan.putusan ? ' <b>Putusan:</b> ' + esc(c.keberatan.putusan) : '') + '</p>' +
        '</div>' : '') +

      '<div class="card">' +
        '<div class="card-head-row"><div><span class="card-tag">VERIFIKASI MULTI-SUMBER</span><h3>Bukti Pemeriksaan (' + bs.n + ')</h3></div><span class="pill ' + (bs.memadai ? 'st-tidak' : 'st-menunggu') + '">' + bs.label + '</span></div>' +
        chk +
        '<div class="log mt8">' +
          (c.bukti.length ? c.bukti.slice().reverse().map(function (b) {
            return '<div><time class="num">' + fmtD(b.t) + '</time><span><b>[' + esc(b.jenis) + ']</b> ' + esc(b.ket) + ' <em class="muted">(' + esc(b.oleh) + ')</em></span></div>';
          }).join('') : '<div class="muted small">Belum ada temuan bukti tercatat.</div>') +
        '</div>' +
        (editable ? '<button type="button" class="btn sec block mt8" data-a="bukti">' + icon('file') + 'Tambah Temuan Bukti</button>' : '') +
      '</div>' +

      '<div class="card">' +
        '<div class="card-tag">KLARIFIKASI MERCHANT</div><h3>Dokumen &amp; Keterangan Pemilik</h3>' +
        (c.dokumen.length ? c.dokumen.map(function (d, i) {
          return '<div class="docrow">' +
            '<div><b class="small">' + esc(d.minta) + '</b><div class="small muted">' + fmtD(d.t) + (d.ket ? ' &middot; ' + esc(d.ket) : '') + '</div></div>' +
            '<span class="pill ' + (d.status === 'Diterima' ? 'st-tidak' : d.status === 'Diminta' ? 'st-klarifikasi' : 'st-dibatasi') + '">' + d.status + '</span>' +
            (editable && d.status === 'Diminta' ? '<div class="btnrow mt8"><button type="button" class="btn sec sm" data-a="docok" data-i="' + i + '">Diterima</button><button type="button" class="btn sec sm" data-a="docno" data-i="' + i + '">Lewat Batas</button></div>' : '') +
          '</div>';
        }).join('') : '<p class="small muted mt4">Belum ada permintaan dokumen.</p>') +
        '<div class="log mt8">' +
          (c.catatan.length ? c.catatan.slice().reverse().map(function (n) {
            return '<div><time class="num">' + fmtD(n.t) + '</time><span><b>' + esc(n.dari) + ':</b> ' + esc(n.isi) + '</span></div>';
          }).join('') : '<div class="muted small">Belum ada catatan klarifikasi.</div>') +
        '</div>' +
        (editable ? '<div class="btnrow mt8"><button type="button" class="btn sec" data-a="mintadoc">Minta Dokumen</button><button type="button" class="btn sec" data-a="catat">Catat Klarifikasi</button></div>' : '') +
      '</div>' +

      '<div class="card">' +
        '<div class="card-tag">JEJAK AUDIT TIDAK TERUBAH</div><h3>Riwayat &amp; Log Audit (' + c.log.length + ')</h3>' +
        '<div class="log mt8">' +
          c.log.slice().reverse().map(function (l) {
            return '<div><time class="num">' + fmtDT(l.t) + '</time><span><b>' + esc(l.s) + '</b> &mdash; ' + esc(l.a) + '</span></div>';
          }).join('') +
        '</div>' +
      '</div>';

    shell('Kasus ' + c.id, 'Dibuka ' + fmtD(c.dibuka) + ' · PIC: ' + esc(c.petugas), body, { back: true, nav: u.role === 'ppatk' ? 'ltkm' : 'kasus' });

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
        if (a === 'bukti') form('Tambah Temuan Bukti', 'Catat hasil pemeriksaan objektif oleh analis.', '<div class="field"><label>Kategori Bukti</label><select id="jb">' + A.JENIS_BUKTI.map(function (j) { return '<option>' + j + '</option>'; }).join('') + '</select></div><div class="field"><label>Uraian Temuan</label><textarea id="kt" rows="3" placeholder="Contoh: Lokasi fisik sesuai pendaftaran; NIB dan nota distributor terverifikasi."></textarea></div>', 'Simpan Bukti', function (s) { var t = s.querySelector('#kt').value.trim(); if (t.length < 8) { toast('Uraikan temuan bukti (min. 8 karakter)'); return false; } c.bukti.push({ t: new Date().toISOString(), jenis: s.querySelector('#jb').value, ket: t, oleh: who() }); A.logCase(c, who(), 'Bukti dicatat: ' + s.querySelector('#jb').value + '.'); save(); again(); });
        if (a === 'mintadoc') form('Minta Dokumen ke Merchant', 'Tenggat 3 hari kerja tanpa pembatasan transaksi sepihak.', '<div class="field"><label>Rincian Dokumen</label><textarea id="dm" rows="3" placeholder="Contoh: NIB, foto tempat usaha, dan nota pemasok barang."></textarea></div>', 'Kirim Permintaan', function (s) { var t = s.querySelector('#dm').value.trim(); if (t.length < 5) { toast('Sebutkan dokumen yang diminta'); return false; } c.dokumen.push({ t: new Date().toISOString(), minta: t, status: 'Diminta', ket: 'Batas jawaban ' + fmtD(A.addWorkdays(new Date(), 3)) + '.' }); if (c.status === 'Investigasi') A.ubahStatus(c, 'Menunggu klarifikasi', who(), 'Permintaan dokumen dikirim ke merchant.'); A.logCase(c, who(), 'Meminta dokumen: ' + t); save(); again(); });
        if (a === 'docok' || a === 'docno') { var d = c.dokumen[i]; d.status = a === 'docok' ? 'Diterima' : 'Tidak diterima'; if (a === 'docok') c.bukti.push({ t: new Date().toISOString(), jenis: 'Dokumen usaha', ket: 'Dokumen diterima lengkap: ' + d.minta, oleh: who() }); A.logCase(c, who(), 'Status dokumen "' + d.minta + '" diperbarui menjadi: ' + d.status + '.'); save(); again(); }
        if (a === 'catat') form('Catat Klarifikasi Merchant', 'Rekam keterangan resmi pemilik usaha.', '<div class="field"><label>Disampaikan Oleh</label><input id="dr" value="Pemilik / Pengelola Merchant"></div><div class="field"><label>Ringkasan Klarifikasi</label><textarea id="ik" rows="3" placeholder="Ringkas penjelasan pemilik usaha."></textarea></div><label class="agree"><input type="checkbox" id="asb" checked> Catat sekaligus sebagai bukti "Klarifikasi merchant"</label>', 'Simpan', function (s) { var t = s.querySelector('#ik').value.trim(); if (t.length < 8) { toast('Isi ringkasan klarifikasi'); return false; } c.catatan.push({ t: new Date().toISOString(), dari: s.querySelector('#dr').value.trim() || 'Merchant', isi: t }); if (s.querySelector('#asb').checked) c.bukti.push({ t: new Date().toISOString(), jenis: 'Klarifikasi merchant', ket: t, oleh: who() }); if (c.status === 'Menunggu klarifikasi') A.ubahStatus(c, 'Investigasi', who(), 'Klarifikasi diterima; analisis dilanjutkan.'); A.logCase(c, who(), 'Klarifikasi merchant dicatat.'); save(); again(); });
        if (a === 'ajukan') { if (!bs.memadai) { toast('Syarat kecukupan bukti belum terpenuhi'); return; } form('Ajukan Penundaan Sementara', 'Berlaku maks. 5 hari kerja (UU 8/2010 Ps. 26) dengan persetujuan 2 pejabat berbeda.', '<div class="field"><label>Dasar Pengajuan</label><textarea id="why" rows="3" placeholder="Uraikan dasar pengajuan berdasarkan temuan bukti."></textarea></div>', 'Kirim ke Pejabat', function (s) { var w = s.querySelector('#why').value.trim(); if (w.length < 15) { toast('Tuliskan dasar pengajuan (min. 15 karakter)'); return false; } A.ubahStatus(c, 'Menunggu persetujuan', who(), w); A.logCase(c, who(), 'Mengajukan penundaan transaksi sementara. Dasar: ' + w); save(); again(); }); }
        if (a === 'setuju') { if (!isPej) { toast('Hanya Pejabat Kepatuhan yang berwenang'); return; } if (c.setuju.some(function (s) { return s.nama === u.nama; })) { toast('Persetujuan kedua wajib dari pejabat berbeda'); return; } c.setuju.push({ nama: u.nama, waktu: new Date().toISOString() }); A.logCase(c, u.nama, c.setuju.length === 1 ? 'Otorisasi Pejabat Ke-1 tercatat.' : 'Otorisasi Pejabat Ke-2 tercatat. Berita Acara diterbitkan.'); if (c.setuju.length >= 2) { c.mulaiBatas = new Date().toISOString(); A.ubahStatus(c, 'Dibatasi', c.setuju.map(function (s) { return s.nama; }).join(' & '), 'Bukti memadai; disetujui dua pejabat berbeda.'); } save(); again(); }
        if (a === 'batal') { A.ubahStatus(c, 'Investigasi', who(), 'Pengajuan dibatalkan.'); c.setuju = []; A.logCase(c, who(), 'Pengajuan penundaan dibatalkan.'); save(); again(); }
        if (a === 'ba') sheet('<div class="modal-head"><span class="card-tag">DOKUMEN RESMI</span><h3>Berita Acara Penundaan</h3></div><div class="doc mt8">' + esc(beritaAcara(c, m)) + '</div>');
        if (a === 'ltkm') sheet('<div class="modal-head"><span class="card-tag">PELAPORAN PPATK</span><h3>Draf LTKM</h3></div><div class="doc mt8">' + esc(ltkmDraft(c, m)) + '</div>');
        if (a === 'keberatan') form('Catat Keberatan Merchant', 'Sesuai UU 8/2010 Pasal 67, merchant berhak mengajukan keberatan.', '<div class="field"><label>Alasan Keberatan &amp; Bukti</label><textarea id="kb" rows="3" placeholder="Ringkas sanggahan dan bukti lampiran merchant."></textarea></div>', 'Simpan Keberatan', function (s) { var v = s.querySelector('#kb').value.trim(); if (v.length < 10) { toast('Isi uraian keberatan'); return false; } c.keberatan = { t: new Date().toISOString(), isi: v, status: 'Diajukan', putusan: '' }; c.catatan.push({ t: new Date().toISOString(), dari: 'Merchant (Keberatan)', isi: v }); A.ubahStatus(c, 'Keberatan', who(), 'Keberatan resmi dicatat.'); A.logCase(c, who(), 'Keberatan merchant dicatat.'); save(); again(); });
        if (a === 'terimakeb') form('Terima Keberatan & Pulihkan Hijau', 'Pembatasan dicabut dan status dipulihkan ke Hijau.', '<div class="field"><label>Pertimbangan Putusan</label><textarea id="ps" rows="3" placeholder="Contoh: NIB dan nota distributor terbukti sah."></textarea></div>', 'Terima & Pulihkan', function (s) { var v = s.querySelector('#ps').value.trim(); if (v.length < 15) { toast('Tuliskan pertimbangan (min. 15 karakter)'); return false; } c.keberatan.status = 'Diterima'; c.keberatan.putusan = v; c.hasil = 'Keberatan diterima: ' + v; c.ditutup = new Date().toISOString(); A.ubahStatus(c, 'Tidak terbukti', who(), 'Keberatan diterima; status dikoreksi ke Hijau. ' + v); A.logCase(c, who(), 'Keberatan diterima. Status dipulihkan ke Hijau.'); save(); again(); });
        if (a === 'tolakkeb') form('Tolak Keberatan', 'Pembatasan tetap berlaku hingga SLA 5 HK atau diteruskan LTKM.', '<div class="field"><label>Alasan Penolakan</label><textarea id="ps" rows="3" placeholder="Uraikan alasan penolakan berdasarkan bukti."></textarea></div>', 'Simpan Tolak', function (s) { var v = s.querySelector('#ps').value.trim(); if (v.length < 15) { toast('Tuliskan alasan (min. 15 karakter)'); return false; } c.keberatan.status = 'Ditolak'; c.keberatan.putusan = v; A.ubahStatus(c, 'Dibatasi', who(), 'Keberatan ditolak. ' + v); A.logCase(c, who(), 'Keberatan ditolak. ' + v); save(); again(); });
        if (a === 'bersih') { var pejOnly = c.status === 'Dibatasi' || c.status === 'Menunggu persetujuan' || c.status === 'Keberatan'; if (pejOnly && !isPej) { toast('Memerlukan Pejabat Kepatuhan'); return; } form('Tutup Kasus: Tidak Terbukti', 'Status efektif merchant dikoreksi ke Level Hijau.', '<div class="field"><label>Kesimpulan Pemeriksaan</label><textarea id="hs" rows="3" placeholder="Ringkas hasil verifikasi yang membuktikan kewajaran usaha."></textarea></div>', 'Pulihkan ke Hijau', function (s) { var v = s.querySelector('#hs').value.trim(); if (v.length < 15) { toast('Tuliskan kesimpulan (min. 15 karakter)'); return false; } c.hasil = v; c.ditutup = new Date().toISOString(); A.ubahStatus(c, 'Tidak terbukti', who(), v); A.logCase(c, who(), 'Kasus ditutup: Tidak Terbukti. Status dikoreksi ke Hijau.'); save(); again(); }); }
        if (a === 'teruskan') { if (!isPej) { toast('Harus diotorisasi Pejabat Kepatuhan'); return; } if (!bs.memadai) { toast('Bukti belum memadai'); return; } if (!c.unsurTKM) c.unsurTKM = new Date().toISOString(); c.ltkm = new Date().toISOString(); A.ubahStatus(c, 'Diteruskan', who(), 'LTKM dikirim ke PPATK.'); A.logCase(c, who(), 'LTKM dikirim resmi ke PPATK.'); save(); again(); }
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
      '<div class="grid2 mb12">' +
        A.stat('PJP Diawasi', rows.length + ' PJP', 'demo', tot.n + ' merchant terpantau') +
        A.stat('Oranye &amp; Kasus', tot.o + ' / ' + tot.k, 'demo', tot.belum + ' dalam antrean') +
        A.stat('SLA LTKM (&le;3 HK)', '100%', 'demo', 'Sesuai UU 8/2010 Ps. 25') +
        A.stat('Koreksi UMKM', tot.tt + ' dari ' + tot.selesai, 'demo', 'Dipulihkan ke Hijau') +
      '</div>' +

      '<div class="card">' +
        '<div class="card-head-row"><div><span class="card-tag">SUPERVISI PJP PENGAKUISISI</span><h3>Beban Antrean &amp; Kasus per PJP</h3></div>' + badge('demo') + '</div>' +
        '<p class="hint">Pemantauan kepatuhan PJP sesuai PBI No. 10/2024 &amp; PADG No. 15/2025.</p>' +
        '<div class="tblwrap mt8"><table class="tbl"><thead><tr><th>PJP</th><th class="r">Toko</th><th class="r">Oranye</th><th class="r">Antre</th><th class="r">Kasus</th></tr></thead><tbody>' +
          rows.map(function (r) {
            return '<tr><td><b>' + esc(r.p) + '</b></td><td class="r num">' + r.n + '</td><td class="r num">' + r.o + '</td><td class="r num">' + r.belum + '</td><td class="r num font-bold">' + r.k + '</td></tr>';
          }).join('') +
        '</tbody></table></div>' +
      '</div>' +

      '<div class="card">' +
        '<div class="card-head-row"><div><span class="card-tag">AUDIT SLA &amp; PERLINDUNGAN UMKM</span><h3>Ketepatan Waktu &amp; Keberatan</h3></div>' + badge('demo') + '</div>' +
        '<div class="tblwrap mt8"><table class="tbl"><thead><tr><th>PJP</th><th class="r">LTKM &le;3HK</th><th class="r">Lewat 5HK</th><th class="r">Sanggah</th><th class="r">Pulih Hijau</th></tr></thead><tbody>' +
          rows.map(function (r) {
            return '<tr><td><b>' + esc(r.p) + '</b></td><td class="r num">' + (r.lt ? r.tepat + '/' + r.lt : '-') + '</td><td class="r num">' + (r.pend ? r.lewat + '/' + r.pend : '0/0') + '</td><td class="r num">' + r.keb + '</td><td class="r num">' + (r.selesai ? r.tt + '/' + r.selesai : '-') + '</td></tr>';
          }).join('') +
        '</tbody></table></div>' +
        '<p class="note mt8"><b>Prinsip Proporsionalitas:</b> Kasus <i>Tidak Terbukti</i> menunjukkan bekerjanya verifikasi manusia menyaring positif palsu.</p>' +
      '</div>' +

      '<div class="card">' +
        '<div class="card-head-row"><div><span class="card-tag">DATA AGREGAT PPATK</span><h3>LTKM menurut Kelompok Pelapor (Jan–Sep)</h3></div>' + badge('resmi') + '</div>' +
        '<div class="tblwrap mt8"><table class="tbl"><thead><tr><th>Kelompok Pelapor</th><th class="r">2024</th><th class="r">2025</th><th class="r">2026</th></tr></thead><tbody>' + pel + '</tbody></table></div>' +
        A.src('PPATK, Buletin Statistik APUPPT September 2026, Tabel 2.') +
      '</div>';

    shell('Pengawasan BI', 'Supervisi kepatuhan APU-PPT PJP & perlindungan UMKM', body, { nav: 'pengawasan' });
  }

  A.viewKasus = viewKasus;
  A.viewKasusDetail = viewKasusDetail;
  A.viewPengawasan = viewPengawasan;
  A.pjpRows = pjpRows;
})();
