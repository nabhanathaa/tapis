/* TAPIS: antrean verifikasi berkapasitas, dossier diagnostik merchant, graf jejaring pembayar, dan eksplorasi basis data + ekspor CSV (Mobile Flagship Architecture). */
(function () {
  'use strict';
  var A = window.A, T = A.T, U = A.U, H = A.H, S = A.S, icon = U.icon, idn = U.idn, rp = U.rp, esc = U.esc, badge = U.badge, level = U.level;
  var shell = A.shell, cu = A.cu, me = A.me, isPJP = A.isPJP, toast = A.toast, CF = T.CONFIG;
  function dstr(i) { return A.fmtD(new Date(T.START.getTime() + i * 864e5)); }
  var P_BASE = dstr(0) + ' – ' + dstr(T.BASE - 1), P_REC = dstr(T.FIRST_RECENT) + ' – ' + dstr(T.DAYS - 1);

  // ---------- Antrean Verifikasi Berkapasitas ----------
  var qFilter = 'oranye', qSearch = '', qSig = 'all', qKlaster = 'all';

  function qCardOrange(x) {
    var m = x.m, rankClass = x.rank <= 3 ? 'rank-pill top' : 'rank-pill';
    var petugas = x.petugas || 'Belum dialokasikan';
    var hariLabel = x.hari ? 'Hari ke-' + x.hari : 'Kuota 0';
    var pillCls = x.today ? 'st-menunggu' : 'st-investigasi';
    return '<a class="q-mcard" href="#/merchant/' + m.id + '">' +
      '<div class="qm-top">' +
        '<span class="' + rankClass + '">Prioritas #' + x.rank + '</span>' +
        '<span class="pill ' + pillCls + '">' + x.status + ' &middot; ' + hariLabel + '</span>' +
      '</div>' +
      '<div class="qm-main">' +
        '<div class="thumb">' + U.storefront(m, 44) + '</div>' +
        '<div class="qm-info">' +
          '<b>' + esc(m.nama) + ' <span class="mono-id">' + m.id + '</span></b>' +
          '<span>' + esc(m.kategori) + ' &middot; ' + esc(m.kota) + ' (K' + m.klaster + ')</span>' +
          '<div class="qm-tags">' +
            '<span class="typo-pill">' + esc(U.tagLabel(m.tag)) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="qm-score">' +
          '<b class="num">' + m.score + '</b>' +
          '<small>Skor</small>' +
        '</div>' +
      '</div>' +
      '<div class="qm-foot">' +
        '<div class="qm-sig"><span class="small muted">Pilar:</span> ' + A.groupsBar(m) + '</div>' +
        '<div class="qm-pic">PIC: <b>' + esc(petugas) + '</b></div>' +
      '</div>' +
    '</a>';
  }

  function viewAntrean() {
    var K = A.kapasitas(), q = A.antrean(), hari = K > 0 ? Math.ceil(q.length / K) : null, today = q.filter(function (x) { return x.today; }).length;
    var qCounts = {
      oranye: q.length,
      merah: T.merchants.filter(function (m) { return A.effLevel(m) === 'merah'; }).length,
      kuning: T.merchants.filter(function (m) { return A.effLevel(m) === 'kuning'; }).length,
      hijau: T.merchants.filter(function (m) { return A.effLevel(m) === 'hijau'; }).length,
      semua: T.merchants.length
    };

    var chips = [
      ['oranye', 'Oranye'],
      ['merah', 'Merah'],
      ['kuning', 'Kuning'],
      ['hijau', 'Hijau'],
      ['semua', 'Semua']
    ].map(function (c) {
      var dot = c[0] !== 'semua' ? '<span class="chip-dot ' + c[0] + '"></span>' : '';
      return '<button type="button" class="chip ' + (qFilter === c[0] ? 'on' : '') + '" data-f="' + c[0] + '">' + dot + c[1] + ' <span class="chip-count">' + qCounts[c[0]] + '</span></button>';
    }).join('');

    function match(m) {
      if (qSearch && (m.nama + ' ' + m.kota + ' ' + m.kategori + ' ' + m.nmid + ' ' + m.id + ' ' + U.tagLabel(m.tag)).toLowerCase().indexOf(qSearch) < 0) return false;
      if (qKlaster !== 'all' && String(m.klaster) !== String(qKlaster)) return false;
      if (qSig === 'J' && !m.sig.J) return false;
      if (qSig === 'P' && !m.sig.P) return false;
      if (qSig === 'K' && !m.sig.K) return false;
      if (qSig === 'weak' && !((m.weak.malam || m.weak.seragam || m.weak.sesaat) && m.nGroups === 0)) return false;
      return true;
    }

    var summaryStrip =
      '<div class="card">' +
        '<div class="card-head-row">' +
          '<div><span class="card-tag">MANAJEMEN ANTREAN BERKAPASITAS</span><h3>Kuota Pemeriksaan Analis</h3></div>' +
          '<button type="button" class="btn sec sm" id="cap">' + icon('sliders') + 'Kuota</button>' +
        '</div>' +
        '<div class="grid2 mt8">' +
          '<div class="mini-k"><b class="num">' + q.length + ' <small>toko</small></b><span>Antrean Oranye</span></div>' +
          '<div class="mini-k"><b class="num">' + K + ' <small>kasus/hari</small></b><span>Kapasitas Tim</span></div>' +
          '<div class="mini-k"><b class="num">' + today + ' <small>merchant</small></b><span>Jadwal Hari Ini</span></div>' +
          '<div class="mini-k"><b class="num">' + (hari === null ? '-' : hari + ' <small>hari kerja</small>') + '</b><span>Estimasi Tuntas</span></div>' +
        '</div>' +
        '<p class="hint mt8">Kuota analis: ' + S.settings.analis.map(function (a) { return '<b>' + esc(a.nama) + '</b> (' + a.kap + '/hari)'; }).join(', ') + '. Merchant di luar kuota hari ini tetap bertransaksi normal.</p>' +
      '</div>';

    var filterBar =
      '<div class="filter-bar-card">' +
        '<div class="chips">' + chips + '</div>' +
        '<div class="search" style="margin:6px 0">' + icon('search') + '<input id="q" placeholder="Cari merchant, kota, kategori, NMID, atau ID..." value="' + esc(qSearch) + '"></div>' +
        '<div class="filter-controls">' +
          '<select id="f-sig" class="filter-select" aria-label="Filter Pilar Sinyal">' +
            '<option value="all"' + (qSig === 'all' ? ' selected' : '') + '>Semua Pilar Sinyal</option>' +
            '<option value="J"' + (qSig === 'J' ? ' selected' : '') + '>Pilar J (Jejaring) Aktif</option>' +
            '<option value="P"' + (qSig === 'P' ? ' selected' : '') + '>Pilar P (Sebaya) Aktif</option>' +
            '<option value="K"' + (qSig === 'K' ? ' selected' : '') + '>Pilar K (Profil) Aktif</option>' +
            '<option value="weak"' + (qSig === 'weak' ? ' selected' : '') + '>Sinyal Lemah Terlindungi</option>' +
          '</select>' +
          '<select id="f-klaster" class="filter-select" aria-label="Filter Klaster Wilayah">' +
            '<option value="all"' + (qKlaster === 'all' ? ' selected' : '') + '>Semua Klaster (K1–K4)</option>' +
            '<option value="1"' + (qKlaster === '1' ? ' selected' : '') + '>K1 · Pertanian</option>' +
            '<option value="2"' + (qKlaster === '2' ? ' selected' : '') + '>K2 · Konstruksi &amp; Pem.</option>' +
            '<option value="3"' + (qKlaster === '3' ? ' selected' : '') + '>K3 · Industri</option>' +
            '<option value="4"' + (qKlaster === '4' ? ' selected' : '') + '>K4 · Perdagangan/Jasa</option>' +
          '</select>' +
        '</div>' +
      '</div>';

    var body = summaryStrip + filterBar;

    if (qFilter === 'oranye') {
      var rows = q.filter(function (x) { return match(x.m); });
      var handled = T.merchants.filter(function (m) { return m.level === 'oranye' && A.caseOf(m.id) && match(m); }).sort(function (a, b) { return b.score - a.score; });

      body +=
        '<div class="sec-head"><h3>Antrean Verifikasi (' + rows.length + ')</h3><span class="small muted">Urut skor tertinggi</span></div>' +
        '<div class="q-mcard-list">' +
          (rows.map(qCardOrange).join('') || '<div class="card empty">Tidak ada merchant Oranye yang sesuai dengan filter.</div>') +
        '</div>' +
        (handled.length ?
          '<div class="sec-head mt12"><h3>Sudah Masuk Alur Kasus (' + handled.length + ')</h3></div>' +
          '<div class="list">' + handled.map(function (m) { return A.itemRow(m); }).join('') + '</div>' : '');
    } else {
      var list = T.merchants.filter(function (m) {
        return (qFilter === 'semua' || A.effLevel(m) === qFilter) && match(m);
      }).sort(function (a, b) { return b.score - a.score; });

      var infoBanner = '';
      if (qFilter === 'kuning') infoBanner = '<div class="note mb12"><b>Protokol Level Kuning:</b> Tepat 1 sinyal kuat aktif. Dipantau otomatis tanpa pemeriksaan dan tanpa pembatasan transaksi.</div>';
      if (qFilter === 'merah') infoBanner = '<div class="warnnote mb12"><b>Protokol Level Merah:</b> Telah diverifikasi bukti manusia dan disetujui 2 pejabat kepatuhan (maks. 5 hari kerja, UU 8/2010 Ps. 26).</div>';
      if (qFilter === 'hijau') infoBanner = '<div class="umkm-protect-box mb12">' + icon('shield') + '<div><b>Protokol Level Hijau (UMKM Terlindungi):</b> Mencakup usaha normal, usaha yang dikoreksi setelah klarifikasi, dan usaha dengan sinyal lemah wajar.</div></div>';

      body += infoBanner +
        '<div class="sec-head"><h3>Daftar Merchant (' + list.length + ')</h3></div>' +
        '<div class="list">' +
          (list.map(function (m) {
            return A.itemRow(m, { right: A.groupsBar(m) + '<b class="num" style="font-size:13px">' + m.score + '</b>' });
          }).join('') || '<div class="card empty">Tidak ada merchant pada filter ini.</div>') +
        '</div>';
    }

    shell('Antrean Verifikasi', 'Prioritisasi berbasis kapasitas & perlindungan UMKM', body, { nav: 'antrean' });

    var app = A.app;
    app.querySelectorAll('[data-f]').forEach(function (b) { b.onclick = function () { qFilter = b.dataset.f; viewAntrean(); }; });
    var fsig = app.querySelector('#f-sig'); if (fsig) fsig.onchange = function () { qSig = fsig.value; viewAntrean(); };
    var fkl = app.querySelector('#f-klaster'); if (fkl) fkl.onchange = function () { qKlaster = fkl.value; viewAntrean(); };
    var qi = app.querySelector('#q');
    if (qi) qi.oninput = function () {
      qSearch = qi.value.toLowerCase();
      var pos = qi.selectionStart;
      A.skipAnim = true;
      viewAntrean();
      var n = app.querySelector('#q');
      if (n) { n.focus(); n.setSelectionRange(pos, pos); }
    };
    var cb = app.querySelector('#cap');
    if (cb) cb.onclick = function () { A.openCapModal(viewAntrean); };
  }

  // ---------- Profil & Dossier Diagnostik Merchant ----------
  var LVCOL = A.LVCOL;
  function gauge(score, lv) {
    return '<div class="gauge"><svg viewBox="0 0 120 120"><defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1D5BD8"/><stop offset="1" stop-color="' + LVCOL[lv] + '"/></linearGradient></defs><circle class="trk" cx="60" cy="60" r="50" pathLength="100"/><circle class="val" cx="60" cy="60" r="50" pathLength="100" stroke="url(#gg)" stroke-dasharray="' + score + ' 100"/></svg><div class="gv"><b>' + cu(score) + '</b><span>Skor</span></div></div>';
  }

  function peerInfo(m) {
    var peers = T.merchants.filter(function (o) { return o !== m && o.kategori === m.kategori && o.recentVals.length >= CF.P.minRecentDays && o.umur >= 14; }), meds = peers.map(function (o) { return o.recentMed; });
    var peersCluster = peers.filter(function (o) { return o.klaster === m.klaster; });
    return {
      n: peers.length,
      nCluster: peersCluster.length,
      med: T.median(meds),
      p90: T.quantile(meds, 0.9),
      avgMed: T.median(T.merchants.filter(function (o) { return o !== m && o.kategori === m.kategori; }).map(function (o) { return o.stat.meanAmt; })),
      medCluster: peersCluster.length ? T.median(peersCluster.map(function (o) { return o.recentMed; })) : null
    };
  }

  var ST_LBL = { aktif: 'Terindikasi Aktif', tidak: 'Normal / Tidak Aktif', tidak_cukup_data: 'Data Tidak Memadai' };
  function sigCard(g, title, st, text, rows) {
    return '<div class="sigcard s-' + st + '"><div class="sh"><span class="tag ' + g.toLowerCase() + '">Pilar ' + g + '</span><b>' + title + '</b><em>' + ST_LBL[st] + '</em></div><p>' + text + '</p>' + (rows ? '<dl class="kv cmp">' + rows + '</dl>' : '') + '</div>';
  }
  function kv(a, b) { return '<dt>' + a + '</dt><dd>' + b + '</dd>'; }

  function signalCards(m) {
    var pe = peerInfo(m), out = '';
    var jText, jRows;
    if (m.sigStatus.J === 'tidak_cukup_data') {
      jText = 'Analisis jejaring pembayar tidak dapat dieksekusi karena cakupan ID pembayar di bawah ambang 70%. Status ini <b>bukan indikasi risiko</b>; evaluasi bertumpu pada Pilar P dan K.';
    } else if (m.sig.J) {
      jText = idn(m.sharedShare * 100, 1) + '% pembayar juga bertransaksi di ' + (CF.J.sharedDegree - 1) + ' merchant lain atau lebih, serta terhubung dengan ' + m.nLinks + ' merchant (komponen ' + m.komponen + ' entitas).';
    } else {
      jText = 'Distribusi pembayar didominasi pelanggan mandiri atau irisan pembayar bersama masih dalam batas kewajaran komunitas lokal.';
    }
    jRows = kv('Jendela Observasi', P_REC + ' (14 hari)') +
      kv('Cakupan ID Pembayar', idn(m.stat.coverage * 100, 1) + '% (syarat min. ' + idn(CF.J.minCoverage * 100) + '%)') +
      kv('Pembayar Unik', idn(m.stat.payerUnik) + ' akun') +
      (m.jData ?
        kv('Pembayar Lintas Toko', idn(m.crossShare * 100, 1) + '% (2+) &amp; <b>' + idn(m.sharedShare * 100, 1) + '%</b> (3+, ambang ' + idn(CF.J.sharedShare * 100) + '%)') +
        kv('Rata-rata Fan-Out', idn(m.fanOut, 2) + ' toko/pembayar') +
        kv('Tautan / Komponen', m.nLinks + ' toko / ' + m.komponen + ' entitas') : '');
    out += sigCard('J', 'Jejaring Pembayar Lintas Toko', m.sigStatus.J, jText, jRows);

    var pText, pRows = kv('Jendela Acuan vs Evaluasi', P_BASE + ' vs ' + P_REC);
    if (m.sigStatus.P === 'tidak_cukup_data') {
      pText = 'Riwayat transaksi aktif dalam 14 hari terakhir kurang dari ' + CF.P.minRecentDays + ' hari.';
    } else {
      pText = m.pActive ?
        'Frekuensi transaksi harian 14 hari terakhir meningkat persisten melampaui ambang Robust Z sebaya (' + esc(m.kategori.toLowerCase()) + ')' + (m.ownZ !== null ? ' maupun riwayat sendiri.' : '.') :
        m.transient ?
          'Terdapat ' + m.elevDays + ' hari kenaikan volume sementara lalu kembali normal. Dicatat sebagai <b>Sinyal Lemah</b> (bukan pemicu antrean).' :
          'Frekuensi transaksi harian konsisten dengan distribusi normal kelompok sebaya sejenis.';
      pRows += kv('Pembanding Berlapis', 'K' + m.klaster + ' (' + esc(m.klasterNama) + ') &rarr; ' + esc(m.kategori)) +
        kv('Median Trx / Hari', '<b>' + idn(m.recentMed, 1) + '</b> (Sebaya: ' + idn(pe.med, 1) + '; P90: ' + idn(pe.p90, 1) + ')') +
        kv('Robust Z vs Sebaya', m.peerZ === null ? '&lt;' + CF.P.minPeers + ' sebaya' : '<b>' + idn(m.peerZ, 2) + '</b> (ambang &ge;' + CF.P.peerZ + ')') +
        kv('Robust Z vs Riwayat', m.ownZ === null ? 'Riwayat ' + m.baseVals.length + 'h' : '<b>' + idn(m.ownZ, 2) + '</b> (ambang &ge;' + CF.P.ownZ + ')') +
        kv('Statistik CUSUM Atas', m.cusum.alarmAt >= 0 ? 'Melewati h=' + CF.cusum.h + ' di Hari ke-' + (m.cusum.alarmAt + 1) + ' (S=' + idn(m.cusum.max, 1) + ')' : 'Normal (S=' + idn(m.cusum.max, 1) + ')');
    }
    out += sigCard('P', 'Perilaku Relatif Sebaya &amp; CUSUM', m.sigStatus.P, pText, pRows);

    var k = [];
    if (m.newHot) k.push('umur sangat muda (' + m.umur + ' hari) dengan volume >' + CF.K.newHotMult + 'x P90 sebaya');
    if (Math.abs(m.tickZ) >= CF.K.tickZ) k.push('rata-rata tiket (' + rp(m.stat.meanAmt) + ') menyimpang tajam (Robust Z = ' + idn(m.tickZ, 2) + ')');
    if (m.listStrong.length) k.push(m.listStrong.length + ' pembayar cocok daftar rujukan internal');

    var kRows = kv('Klaster Ekonomi Wilayah', 'Klaster ' + m.klaster + ': ' + esc(m.klasterNama) + ' (' + esc(m.kota) + ')') +
      kv('Sektor Dominan PDRB', esc(m.klasterSektor)) +
      kv('Kategori &amp; Umur', esc(m.kategori) + ' (MCC ' + m.mcc + ') &middot; ' + m.umur + ' hari') +
      kv('Rata-rata Tiket vs Sebaya', '<b>' + rp(m.stat.meanAmt) + '</b> vs ' + rp(pe.avgMed) + ' (Z: ' + idn(m.tickZ, 2) + ')') +
      kv('Dokumen KYM', esc(m.usaha) + ' &middot; <b>' + esc(m.dokumenUsaha.toUpperCase()) + '</b>');
    if (m.listMatches.length) {
      kRows += kv('Daftar Rujukan', m.listMatches.map(function (e) {
        return '<span class="mono-id">' + esc(e.payer_id) + '</span> (' + esc(e.sumber) + ', keyakinan: <b>' + e.keyakinan + '</b>)';
      }).join('<br>'));
    }
    out += sigCard('K', 'Profil Usaha &amp; Konteks Wilayah', m.sigStatus.K, k.length ? 'Terdeteksi: ' + k.join('; ') + '.' : 'Profil usaha, tiket transaksi, dan kelengkapan dokumen sesuai karakteristik sebaya.', kRows);
    return out;
  }

  function notProof(m) {
    var a = [];
    if (m.weak.malam) a.push('<b>Operasional Malam (' + idn(m.nightShare * 100, 1) + '% pukul 22.00–05.00):</b> Lumrah bagi kuliner malam/angkringan. Bukan alasan tunggal penundaan.');
    if (m.weak.seragam) a.push('<b>Nominal Seragam (' + idn(m.uniform * 100, 1) + '% pada modus):</b> Wajar bagi penjual pulsa, token listrik, atau makanan satu harga.');
    if (m.weak.sesaat) a.push('<b>Lonjakan Sesaat (' + m.elevDays + ' hari):</b> Kenaikan sementara saat akhir pekan atau acara lokal yang kembali normal.');
    if (m.stat.meanAmt < 100000) a.push('<b>Nominal Rata-rata ' + rp(m.stat.meanAmt) + ':</b> Di sekitar rata-rata QRIS nasional (' + rp(H.qris.rata2_transaksi_rp) + ') dan di bawah batas MDR 0% UMKM mikro.');
    a.push('<b>Skor ' + m.score + '/100 adalah Peringkat Antrean:</b> Mengurutkan jadwal verifikasi analis, bukan peluang matematis judi daring.');
    return a;
  }

  function caseBlock(c) {
    var bs = A.buktiStatus(c);
    return '<div class="card highlight-card">' +
      '<div class="card-head-row"><div><span class="card-tag">STATUS BERKAS PEMERIKSAAN</span><h3>Kasus ' + c.id + '</h3></div>' + A.stPill(c.status) + '</div>' +
      '<dl class="kv mt8">' +
        kv('Nomor Berkas', '<a class="font-bold num" href="#/kasus/' + c.id + '">' + c.id + ' &rarr;</a>') +
        kv('Analis Pemeriksa', esc(c.petugas)) +
        kv('Kecukupan Bukti', '<b>' + bs.label + '</b> (' + bs.n + ' bukti)') +
        kv('Keberatan', c.keberatan ? c.keberatan.status : 'Tidak ada') +
      '</dl>' +
      (c.status === 'Tidak terbukti' ? '<div class="umkm-protect-box mt8">' + icon('shield') + '<div><b>Telah Dikoreksi ke Hijau:</b> Pemeriksaan manusia membuktikan aktivitas usaha wajar.</div></div>' : '') +
      '<a class="btn block mt8" href="#/kasus/' + c.id + '">' + icon('folder') + 'Buka Berkas Pemeriksaan ' + c.id + '</a>' +
    '</div>';
  }

  function viewMerchant(id) {
    var m = T.byId(id); if (!m) return viewAntrean();
    var lv = A.effLevel(m), c = A.caseOf(m.id), u = me(), n = m.nGroups, qr = A.antrean().filter(function (x) { return x.m === m; })[0];
    var rule = lv === 'merah' ? 'Penundaan sementara disetujui oleh 2 pejabat kepatuhan setelah verifikasi bukti manusia (maks. 5 hari kerja, UU 8/2010 Ps. 26).' :
      c && c.status === 'Tidak terbukti' ? 'Penapisan awal menandai Oranye (' + n + '/3 pilar), namun verifikasi lapangan membuktikan usaha wajar. Dikoreksi penuh ke Hijau.' :
      m.level === 'oranye' ? 'Mengaktifkan ' + n + ' dari 3 pilar sinyal kuat (&ge;2 terpenuhi). Masuk antrean verifikasi analis tanpa pembatasan sepihak.' :
      m.level === 'kuning' ? 'Hanya 1 pilar sinyal kuat yang aktif. Sesuai aturan 2-dari-3, merchant dipantau otomatis tanpa gangguan.' :
      'Seluruh indikator jejaring, perilaku sebaya, dan profil berada dalam rentang normal atau hanya sinyal lemah yang dilindungi.';

    var actBtn = '';
    if (isPJP()) {
      if (A.activeCase(m.id)) actBtn = '<a class="btn" href="#/kasus/' + A.activeCase(m.id).id + '">' + icon('folder') + 'Buka Kasus ' + A.activeCase(m.id).id + '</a>';
      else if (m.level === 'oranye' && !c) actBtn = '<button type="button" class="btn" id="open">' + icon('folder') + 'Buka Kasus Verifikasi</button>';
      else if (c) actBtn = '<a class="btn sec" href="#/kasus/' + c.id + '">' + icon('folder') + 'Arsip Kasus ' + c.id + '</a>';
    }

    var tx = T.txOf(m, 8);
    var gaps = m.dataGaps.map(function (g) { return '<li><b>Pilar ' + g.signal + ':</b> ' + esc(g.why) + '</li>'; }).join('');

    var body =
      '<div class="card mhead-card">' +
        '<div class="mhead">' +
          '<span class="photo">' + U.storefront(m, 64) + '</span>' +
          '<div class="mhead-info">' +
            '<span class="mono-badge">ID ' + m.id + ' &middot; ' + m.nmid + '</span>' +
            '<h2>' + esc(m.nama) + '</h2>' +
            '<p class="small muted">' + esc(m.kategori) + ' (MCC ' + m.mcc + ') &middot; ' + esc(m.kota) + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="mhead-badges mt8">' +
          level(lv, true) +
          '<span class="typo-pill">' + esc(U.tagLabel(m.tag)) + '</span>' +
          '<a href="#/bukti/klaster" class="klaster-link">Klaster ' + m.klaster + ': ' + esc(m.klasterNama) + '</a>' +
          (qr ? '<span class="pill st-menunggu">Antrean #' + qr.rank + '</span>' : '') +
        '</div>' +
        '<div class="btnrow mt12">' +
          actBtn +
          '<a class="btn sec" href="#/jejaring/' + m.id + '">' + icon('net') + 'Graf Jejaring</a>' +
        '</div>' +
      '</div>' +

      (c ? caseBlock(c) : '') +

      '<div class="card">' +
        '<div class="card-head-row"><div><span class="card-tag">KONVERGENSI 2-DARI-3 PILAR</span><h3>Evaluasi Skor Prioritas</h3></div>' + badge('hitungan') + '</div>' +
        '<div class="scorecard mt8">' +
          gauge(m.score, lv) +
          '<div class="sigs">' +
            [['J', 'Jejaring Pembayar', m.sig.J, m.sigStatus.J], ['P', 'Perilaku Sebaya', m.sig.P, m.sigStatus.P], ['K', 'Profil &amp; Konteks', m.sig.K, m.sigStatus.K]].map(function (g) {
              var stCls = g[2] ? 'on' : g[3] === 'tidak_cukup_data' ? 'na' : '';
              var stTxt = g[2] ? 'Aktif' : g[3] === 'tidak_cukup_data' ? 'Data <70%' : 'Normal';
              return '<div class="sig ' + stCls + '"><i>' + g[0] + '</i><span>' + g[1] + '</span><b class="sig-status-txt">' + stTxt + '</b></div>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div class="mt12"><div class="card-tag">DEKOMPOSISI BOBOT SKOR (0–100)</div>' + U.scoreBreakdown(m, CF.W) + '</div>' +
        '<p class="note mt12">' + rule + '</p>' +
      '</div>' +

      '<div class="card">' +
        '<div class="card-head-row"><div><span class="card-tag">DERET WAKTU 56 HARI</span><h3>Frekuensi Harian vs Sebaya</h3></div></div>' +
        '<p class="hint">Garis biru: transaksi harian toko. Pita biru muda: rentang P10–P90 usaha sejenis (' + esc(m.kategori) + ').</p>' +
        U.timeline(m) +
      '</div>' +

      '<div class="card">' +
        '<div class="card-head-row"><div><span class="card-tag">POLA WAKTU OPERASIONAL</span><h3>Distribusi 24 Jam</h3></div><span class="mono-badge">Buka ' + String(m.jamBuka[0]).padStart(2, '0') + ':00–' + String(m.jamBuka[1]).padStart(2, '0') + ':00</span></div>' +
        '<p class="hint">Transaksi luar jam buka: <b>' + idn(m.stat.outsideShare * 100, 1) + '%</b>. Jam malam bukan bukti tunggal.</p>' +
        U.hours(m) +
      '</div>' +

      '<div class="card">' +
        '<div class="card-head-row"><div><span class="card-tag">RINCIAN PARAMETER</span><h3>Tiga Pilar Sinyal (J &middot; P &middot; K)</h3></div>' + badge('hitungan') + '</div>' +
        '<div class="mt8">' + signalCards(m) + '</div>' +
      '</div>' +

      (gaps ? '<div class="card"><div class="card-tag">KUALITAS DATA</div><h3>Keterbatasan Observasi</h3><ul class="small gaps">' + gaps + '</ul></div>' : '') +

      '<div class="notproof"><h4>Prinsip Perlindungan UMKM: Sinyal Bukan Bukti</h4><ul>' + notProof(m).map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>' +

      '<div class="card">' +
        '<div class="card-head-row"><div><span class="card-tag">LEDGER TRANSAKSI 14 HARI</span><h3>Sampel Transaksi Terkini</h3></div><a class="btn sec sm" href="#/data">' + icon('download') + 'CSV</a></div>' +
        '<div class="grid3 mt8">' +
          '<div class="mini-k"><b class="num">' + idn(m.stat.ok14) + '</b><span>Berhasil (14H)</span></div>' +
          '<div class="mini-k"><b class="num">' + rp(m.stat.meanAmt) + '</b><span>Rata-rata</span></div>' +
          '<div class="mini-k"><b class="num">' + idn(m.stat.modalShare * 100, 0) + '%</b><span>Modus</span></div>' +
        '</div>' +
        '<div class="tblwrap mt8"><table class="tbl"><thead><tr><th>Waktu</th><th>Pembayar</th><th class="r">Nominal</th><th>Status</th></tr></thead><tbody>' +
          tx.map(function (t) {
            return '<tr><td class="num small">' + t.timestamp.slice(5) + '</td><td class="small num">' + esc(t.payer_id || 'Anonim') + '</td><td class="r num font-bold">' + rp(t.amount) + '</td><td><span class="pill ' + (t.transaction_status === 'berhasil' ? 'st-tidak' : 'st-dibatasi') + '">' + t.transaction_status + '</span></td></tr>';
          }).join('') +
        '</tbody></table></div>' +
      '</div>';

    shell(esc(m.nama), 'Dossier Merchant · ' + m.id, body, { back: true, nav: 'antrean' });

    var ob = A.app.querySelector('#open');
    if (ob) ob.onclick = function () {
      var k = A.openCase(m, u);
      toast('Berkas kasus ' + k.id + ' berhasil dibuka');
      location.hash = '#/kasus/' + k.id;
    };
  }

  // ---------- Graf Jejaring Pembayar Lintas Merchant ----------
  function viewJejaring(id) {
    var q = A.antrean(), m = T.byId(id) || (q.length ? q[0].m : T.byId('M081')), g = U.network(m, T);
    var links = Object.keys(m.links).map(function (k) { return { m: T.byId(k), n: m.links[k] }; }).sort(function (a, b) { return b.n - a.n; });
    var netMerchants = T.merchants.filter(function (x) { return x.nLinks > 0 || x.level === 'oranye'; }).sort(function (a, b) { return b.nLinks - a.nLinks || b.score - a.score; });

    var body =
      '<div class="card">' +
        '<div class="card-head-row">' +
          '<div><span class="card-tag">PILAR J &middot; TOPOLOGI PEMBAYAR</span><h3>Pilih Pusat Graf Merchant</h3></div>' +
          '<a class="btn sec sm" href="#/merchant/' + m.id + '">Dossier ' + m.id + '</a>' +
        '</div>' +
        '<div class="chips mt8">' +
          netMerchants.slice(0, 10).map(function (nm) {
            return '<button type="button" class="chip ' + (nm.id === m.id ? 'on' : '') + '" data-jm="' + nm.id + '">' +
              '<span class="chip-dot ' + A.effLevel(nm) + '"></span>' + esc(nm.nama) + ' <span class="chip-count">' + nm.nLinks + '</span>' +
            '</button>';
          }).join('') +
        '</div>' +
      '</div>' +

      '<div class="card">' +
        '<div class="card-head-row">' +
          '<div><span class="card-tag">VISUALISASI KONEKTIVITAS</span><h3>' + esc(m.nama) + ' (' + m.id + ')</h3></div>' +
          level(A.effLevel(m)) +
        '</div>' +
        '<p class="hint">Ketuk simpul merchant (kotak) untuk membuka dossier. Titik bulat adalah ID pembayar unik (14 hari terakhir).</p>' +
        '<div class="net-canvas-wrap mt8">' +
          (m.jData ? g.svg : '<div class="note">Cakupan ID pembayar pada merchant ini hanya <b>' + idn(m.stat.coverage * 100, 1) + '%</b> (&lt;70%), sehingga graf tidak dibentuk (Data Tidak Memadai).</div>') +
        '</div>' +
        '<div class="chart-legend mt8">' +
          '<span><i style="background:#081E46"></i>Pusat (' + m.id + ')</span>' +
          '<span><i style="background:#FFFFFF;border:2px solid #D97706"></i>Terhubung (&ge;6 pembayar)</span>' +
          '<span><i style="background:#EA580C;border-radius:50%"></i>Lintas 3+ Toko</span>' +
          '<span><i style="background:#DC2626;border-radius:50%"></i>Daftar Rujukan</span>' +
        '</div>' +
      '</div>' +

      '<div class="grid2">' +
        A.stat('Merchant di Graf', g.nMerchant + ' Toko', 'hitungan', 'Pusat: ' + m.id) +
        A.stat('Pembayar Bersama', g.nShared + ' Akun', 'hitungan', idn(m.sharedShare * 100, 1) + '% derajat 3+') +
        A.stat('Ukuran Komponen', m.komponen + ' Entitas', 'hitungan', 'Ambang J: &ge;' + CF.J.minComponent) +
        A.stat('Fan-Out Rata-rata', idn(m.fanOut, 2) + 'x', 'hitungan', 'Fan-in: ' + idn(m.fanIn) + ' unik') +
      '</div>' +

      '<div class="card">' +
        '<div class="card-tag">TAUTAN LANGSUNG</div>' +
        '<h3>Merchant Terhubung (' + links.length + ')</h3>' +
        (links.length ?
          '<div class="list mt8">' +
            links.map(function (l) {
              return A.itemRow(l.m, { href: '#/jejaring/' + l.m.id, right: '<span class="pill st-menunggu">' + l.n + ' akun sama</span>' });
            }).join('') +
          '</div>' :
          '<p class="small muted mt8">Tidak ada tautan pembayar bersama (&ge;' + CF.J.linkPayers + ' akun identik).</p>') +
      '</div>';

    shell('Graf Jejaring Pembayar', 'Topologi konektivitas lintas merchant', body, { back: true, nav: 'jejaring' });

    A.app.querySelectorAll('[data-m]').forEach(function (n) {
      n.addEventListener('click', function () { location.hash = '#/merchant/' + n.dataset.m; });
    });
    A.app.querySelectorAll('[data-jm]').forEach(function (b) {
      b.onclick = function () { location.hash = '#/jejaring/' + b.dataset.jm; };
    });
  }

  // ---------- Basis Data & Ekspor CSV ----------
  function csv(rows) { return rows.map(function (r) { return r.map(function (v) { v = v === null || v === undefined ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\n'); }
  function dl(name, text) { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\uFEFF' + text], { type: 'text/csv;charset=utf-8' })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
  function exportMerchants() {
    var r = [['merchant_id', 'nama', 'kategori', 'mcc', 'kota', 'klaster_pdrb', 'klaster_nama', 'pjp', 'umur_hari', 'tipologi', 'kelompok', 'status_J', 'status_P', 'status_K', 'skor_J_jejaring', 'skor_P_sebaya', 'skor_P_perubahan', 'skor_K_profil', 'skor_K_daftar', 'skor_prioritas', 'level_penapisan', 'level_efektif', 'status_pemeriksaan', 'trx_berhasil_14h', 'trx_gagal_14h', 'pembayar_unik_14h', 'rata_nominal', 'median_nominal', 'jam_buka']];
    T.merchants.forEach(function (m) { var c = A.caseOf(m.id); r.push([m.id, m.nama, m.kategori, m.mcc, m.kota, m.klaster, m.klasterNama, m.pjp, m.umur, U.tagLabel(m.tag), m.kelompok, m.sigStatus.J, m.sigStatus.P, m.sigStatus.K, m.parts.jaringan.toFixed(3), m.parts.sebaya.toFixed(3), m.parts.perubahan.toFixed(3), m.parts.profil.toFixed(3), m.parts.daftar.toFixed(3), m.score, m.level, A.effLevel(m), c ? c.status : 'belum diperiksa', m.stat.ok14, m.stat.gagal14, m.stat.payerUnik, Math.round(m.stat.meanAmt), Math.round(m.stat.medAmt), m.jamBuka.join('-')]); });
    dl('tapis_master_merchant.csv', csv(r));
  }
  function exportTx() {
    var r = [['transaction_id', 'merchant_id', 'payer_id', 'timestamp', 'amount', 'transaction_status']];
    for (var i = 0; i < T.nTx(); i++) { var t = T.txRow(i); r.push([t.transaction_id, m_id(t), t.payer_id, t.timestamp, t.amount, t.transaction_status]); }
    dl('tapis_ledger_transaksi_14h.csv', csv(r));
  }
  function m_id(t) { return t.merchant_id; }
  function exportHarian() {
    var r = [['merchant_id', 'tanggal', 'trx_berhasil', 'trx_gagal']];
    T.merchants.forEach(function (m) { for (var d = 0; d < T.DAYS; d++) r.push([m.id, new Date(T.START.getTime() + d * 864e5).toISOString().slice(0, 10), m.ok[d], m.gagal[d]]); });
    dl('tapis_deret_harian_56h.csv', csv(r));
  }
  function exportKasus() {
    var r = [['case_id', 'merchant_id', 'status', 'dibuka', 'pemeriksa', 'status_bukti', 'dokumen_diminta', 'keberatan', 'hasil']];
    S.cases.forEach(function (c) { r.push([c.id, c.mid, c.status, c.dibuka, c.petugas, A.buktiStatus(c).label, c.dokumen.map(function (d) { return d.minta + ' [' + d.status + ']'; }).join('; '), c.keberatan ? c.keberatan.status : '', c.hasil]); });
    dl('tapis_berkas_kasus_audit.csv', csv(r));
  }

  var dFilter = '';
  function viewData() {
    var tags = {}; T.merchants.forEach(function (m) { tags[m.kelompok] = (tags[m.kelompok] || 0) + 1; });
    var list = T.merchants.filter(function (m) { return !dFilter || (m.nama + ' ' + m.id + ' ' + m.kota + ' ' + m.kategori + ' ' + U.tagLabel(m.tag)).toLowerCase().indexOf(dFilter) >= 0; });
    var body =
      '<div class="card">' +
        '<div class="card-head-row"><div><span class="card-tag">REPOSITORI &amp; AUDITABILITAS</span><h3>Unduh Basis Data (CSV)</h3></div>' + badge('demo') + '</div>' +
        '<p class="hint">' + T.merchants.length + ' merchant (' + tags.normal + ' normal, ' + tags.anomali + ' anomali parsial, ' + tags.kuat + ' konvergensi kuat), ' + T.DAYS + ' hari observasi, ' + idn(T.nTx()) + ' transaksi ledger.</p>' +
        '<div class="grid2 mt8">' +
          '<button type="button" class="export-card" data-x="m">' + icon('download') + '<b>Master Merchant</b><span>100 entitas &amp; skor (.csv)</span></button>' +
          '<button type="button" class="export-card" data-x="t">' + icon('download') + '<b>Ledger 14 Hari</b><span>' + idn(T.nTx()) + ' transaksi (.csv)</span></button>' +
          '<button type="button" class="export-card" data-x="h">' + icon('download') + '<b>Deret 56 Hari</b><span>5.600 observasi (.csv)</span></button>' +
          '<button type="button" class="export-card" data-x="k">' + icon('download') + '<b>Berkas Kasus</b><span>' + S.cases.length + ' berkas audit (.csv)</span></button>' +
        '</div>' +
      '</div>' +
      '<div class="card">' +
        '<div class="card-head-row"><div><span class="card-tag">DIREKTORI ENTITAS</span><h3>100 Merchant (' + list.length + ')</h3></div></div>' +
        '<div class="search mt8">' + icon('search') + '<input id="dq" placeholder="Cari nama, ID, kota, atau tipologi..." value="' + esc(dFilter) + '"></div>' +
        '<div class="list mt8">' +
          list.slice(0, 40).map(function (m) {
            return A.itemRow(m, { right: A.groupsBar(m) + '<b class="num" style="font-size:12px">' + m.score + '</b>' });
          }).join('') +
        '</div>' +
        (list.length > 40 ? '<p class="hint mt8">Menampilkan 40 dari ' + list.length + ' merchant. Gunakan pencarian atau unduh CSV untuk daftar lengkap.</p>' : '') +
      '</div>';

    shell('Basis Data & CSV', 'Eksplorasi dan ekspor data terkalibrasi', body, { back: true, nav: 'data' });
    var app = A.app;
    app.querySelectorAll('[data-x]').forEach(function (b) { b.onclick = function () { ({ m: exportMerchants, t: exportTx, h: exportHarian, k: exportKasus })[b.dataset.x](); toast('Berkas CSV berhasil diunduh'); }; });
    var qi = app.querySelector('#dq');
    if (qi) qi.oninput = function () {
      dFilter = qi.value.toLowerCase();
      var pos = qi.selectionStart;
      A.skipAnim = true;
      viewData();
      var n = app.querySelector('#dq');
      if (n) { n.focus(); n.setSelectionRange(pos, pos); }
    };
  }

  A.viewAntrean = viewAntrean;
  A.viewMerchant = viewMerchant;
  A.viewJejaring = viewJejaring;
  A.viewData = viewData;
})();
