/* TAPIS: antrean verifikasi berkapasitas, dossier diagnostik merchant, graf jejaring pembayar, dan eksplorasi basis data + ekspor CSV. */
(function () {
  'use strict';
  var A = window.A, T = A.T, U = A.U, H = A.H, S = A.S, icon = U.icon, idn = U.idn, rp = U.rp, esc = U.esc, badge = U.badge, level = U.level;
  var shell = A.shell, cu = A.cu, me = A.me, isPJP = A.isPJP, toast = A.toast, CF = T.CONFIG;
  function dstr(i) { return A.fmtD(new Date(T.START.getTime() + i * 864e5)); }
  var P_BASE = dstr(0) + ' – ' + dstr(T.BASE - 1), P_REC = dstr(T.FIRST_RECENT) + ' – ' + dstr(T.DAYS - 1);

  // ---------- Antrean Verifikasi Berkapasitas ----------
  var qFilter = 'oranye', qSearch = '', qSig = 'all', qKlaster = 'all';

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
      ['oranye', 'Oranye · Antrean Verifikasi'],
      ['merah', 'Merah · Dibatasi Sementara'],
      ['kuning', 'Kuning · Pantau Otomatis'],
      ['hijau', 'Hijau · Normal & Terlindungi'],
      ['semua', 'Semua Populasi']
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
          '<div><span class="card-tag">MANAJEMEN ANTREAN SADAR KAPASITAS</span><h3>Alokasi Kuota Pemeriksaan Harian</h3></div>' +
          '<button type="button" class="btn sec sm" id="cap">' + icon('sliders') + 'Atur Kapasitas Analis</button>' +
        '</div>' +
        '<div class="grid4 mt12">' +
          '<div class="mini-k"><b class="num">' + q.length + '</b><span>Antrean Oranye Menunggu</span></div>' +
          '<div class="mini-k"><b class="num">' + K + ' <small>kasus/hari</small></b><span>Kapasitas Tim Analis</span></div>' +
          '<div class="mini-k"><b class="num">' + today + ' <small>merchant</small></b><span>Dijadwalkan Hari Kerja Ini</span></div>' +
          '<div class="mini-k"><b class="num">' + (hari === null ? '-' : hari + ' <small>hari kerja</small>') + '</b><span>Estimasi Tuntas Antrean</span></div>' +
        '</div>' +
        '<p class="hint mt12">Kuota diatur per analis (' + S.settings.analis.map(function (a) { return '<b>' + esc(a.nama) + '</b>: ' + a.kap + ' kasus/hari'; }).join(', ') + '). Merchant Level Oranye yang belum masuk kuota hari ini <b>tidak dibatasi</b> dan tetap bertransaksi normal hingga bukti diperiksa manusia.</p>' +
      '</div>';

    var filterBar =
      '<div class="filter-bar-card">' +
        '<div class="chips">' + chips + '</div>' +
        '<div class="filter-controls">' +
          '<div class="search" style="margin:0;flex:2;min-width:240px">' + icon('search') + '<input id="q" placeholder="Cari nama merchant, kota, kategori, NMID, atau ID..." value="' + esc(qSearch) + '"></div>' +
          '<select id="f-sig" class="filter-select" aria-label="Filter Pilar Sinyal">' +
            '<option value="all"' + (qSig === 'all' ? ' selected' : '') + '>Semua Pilar Sinyal</option>' +
            '<option value="J"' + (qSig === 'J' ? ' selected' : '') + '>Pilar J (Jejaring Pembayar) Aktif</option>' +
            '<option value="P"' + (qSig === 'P' ? ' selected' : '') + '>Pilar P (Perilaku Sebaya) Aktif</option>' +
            '<option value="K"' + (qSig === 'K' ? ' selected' : '') + '>Pilar K (Profil &amp; Konteks) Aktif</option>' +
            '<option value="weak"' + (qSig === 'weak' ? ' selected' : '') + '>UMKM Sinyal Lemah Terlindungi (Malam/Seragam/Acara)</option>' +
          '</select>' +
          '<select id="f-klaster" class="filter-select" aria-label="Filter Klaster Wilayah">' +
            '<option value="all"' + (qKlaster === 'all' ? ' selected' : '') + '>Semua Klaster Wilayah (K1–K4)</option>' +
            '<option value="1"' + (qKlaster === '1' ? ' selected' : '') + '>Klaster 1 · Pertanian &amp; Primer</option>' +
            '<option value="2"' + (qKlaster === '2' ? ' selected' : '') + '>Klaster 2 · Konstruksi &amp; Pemerintahan</option>' +
            '<option value="3"' + (qKlaster === '3' ? ' selected' : '') + '>Klaster 3 · Industri Pengolahan</option>' +
            '<option value="4"' + (qKlaster === '4' ? ' selected' : '') + '>Klaster 4 · Perdagangan &amp; Jasa Metropolitan</option>' +
          '</select>' +
        '</div>' +
      '</div>';

    var body = summaryStrip + filterBar;

    if (qFilter === 'oranye') {
      var rows = q.filter(function (x) { return match(x.m); });
      var handled = T.merchants.filter(function (m) { return m.level === 'oranye' && A.caseOf(m.id) && match(m); }).sort(function (a, b) { return b.score - a.score; });

      body +=
        '<div class="card">' +
          '<div class="card-head-row">' +
            '<div><span class="card-tag">DAFTAR PRIORITAS VERIFIKASI MANUSIA</span><h3>Antrean Merchant Level Oranye (Belum Diperiksa)</h3></div>' +
            '<span class="badge b-resmi">' + rows.length + ' Merchant</span>' +
          '</div>' +
          '<p class="hint">Diurutkan menurut Skor Prioritas tertinggi. Hanya merchant yang mengaktifkan minimal 2 dari 3 pilar sinyal kuat (J, P, K) yang masuk ke daftar ini.</p>' +
          '<div class="tblwrap mt12">' +
            '<table class="exec-table">' +
              '<thead><tr>' +
                '<th style="width:54px">Rank</th>' +
                '<th>Identitas Merchant &amp; Tipologi</th>' +
                '<th>Wilayah &amp; Klaster PDRB</th>' +
                '<th style="width:110px">Skor Prioritas</th>' +
                '<th style="width:96px">Matriks J·P·K</th>' +
                '<th>PIC Pemeriksa</th>' +
                '<th>Jadwal &amp; Kuota</th>' +
                '<th class="r">Tindakan</th>' +
              '</tr></thead>' +
              '<tbody>' +
                (rows.map(function (x) {
                  var m = x.m, rankClass = x.rank <= 3 ? 'rank-pill top' : 'rank-pill';
                  var petugas = x.petugas || 'Belum dialokasikan';
                  var hariLabel = x.hari ? 'Hari kerja ke-' + x.hari : 'Kuota 0';
                  var pillCls = x.today ? 'st-menunggu' : 'st-investigasi';
                  return '<tr data-href="#/merchant/' + m.id + '">' +
                    '<td><span class="' + rankClass + '">#' + x.rank + '</span></td>' +
                    '<td><div class="mthumb"><div class="thumb">' + U.storefront(m, 40) + '</div><div><b>' + esc(m.nama) + '</b> <span class="mono-id">' + m.id + '</span><small>' + esc(m.kategori) + ' &middot; ' + esc(U.tagLabel(m.tag)) + '</small></div></div></td>' +
                    '<td><b>' + esc(m.kota) + '</b><small class="block muted">Klaster ' + m.klaster + ' (' + esc(m.klasterNama) + ')</small></td>' +
                    '<td><div class="score-cell"><b class="num">' + m.score + '</b><div class="score-mini-bar"><span style="width:' + m.score + '%"></span></div></div></td>' +
                    '<td>' + A.groupsBar(m) + '</td>' +
                    '<td><span class="pic-name">' + esc(petugas) + '</span></td>' +
                    '<td><span class="pill ' + pillCls + '">' + x.status + '</span><small class="block muted mt2">' + hariLabel + '</small></td>' +
                    '<td class="r"><a class="btn sec sm" href="#/merchant/' + m.id + '">Periksa</a></td>' +
                  '</tr>';
                }).join('') || '<tr><td class="empty" colspan="8">Tidak ada merchant Oranye yang sesuai dengan filter pencarian.</td></tr>') +
              '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>' +
        (handled.length ?
          '<div class="card">' +
            '<div class="card-head-row"><div><span class="card-tag">BERKAS PEMERIKSAAN TERBUKA</span><h3>Merchant Oranye yang Telah Masuk Alur Kasus</h3></div><span class="badge b-demo">' + handled.length + ' Berkas</span></div>' +
            '<div class="list mt12">' + handled.map(function (m) { return A.itemRow(m); }).join('') + '</div>' +
          '</div>' : '');
    } else {
      var list = T.merchants.filter(function (m) {
        return (qFilter === 'semua' || A.effLevel(m) === qFilter) && match(m);
      }).sort(function (a, b) { return b.score - a.score; });

      var infoBanner = '';
      if (qFilter === 'kuning') infoBanner = '<div class="note mb12"><b>Protokol Level Kuning (Pemantauan Otomatis):</b> Tepat 1 kelompok sinyal kuat aktif. Merchant hanya dipantau secara algoritmik di latar belakang tanpa pemberitahuan, tanpa pemeriksaan lapangan, dan tanpa pembatasan transaksi.</div>';
      if (qFilter === 'merah') infoBanner = '<div class="warnnote mb12"><b>Protokol Level Merah (Penundaan Terverifikasi):</b> Tidak pernah dihasilkan otomatis oleh mesin. Seluruh merchant di bawah ini telah melalui pemeriksaan bukti manusia dan disetujui oleh 2 pejabat kepatuhan berbeda (maksimal 5 hari kerja sesuai UU No. 8 Tahun 2010 Pasal 26).</div>';
      if (qFilter === 'hijau') infoBanner = '<div class="umkm-protect-box mb12">' + icon('shield') + '<div><b>Protokol Level Hijau (UMKM Normal &amp; Terlindungi):</b> Mencakup merchant reguler, usaha yang sudah dikoreksi (tidak terbukti setelah klarifikasi), serta usaha dengan sinyal lemah wajar (angkringan malam, konter pulsa nominal seragam, dan lonjakan acara akhir pekan).</div></div>';

      body += infoBanner +
        '<div class="card">' +
          '<div class="card-head-row"><div><span class="card-tag">DIREKTORI PENAPISAN MERCHANT</span><h3>Daftar Merchant (' + esc(qFilter.toUpperCase()) + ')</h3></div><span class="badge b-demo">' + list.length + ' Merchant</span></div>' +
          '<div class="tblwrap mt12">' +
            '<table class="exec-table">' +
              '<thead><tr>' +
                '<th style="width:66px">ID</th>' +
                '<th>Identitas Merchant &amp; Kategori</th>' +
                '<th>Wilayah &amp; Klaster</th>' +
                '<th>Tipologi Pola Transaksi</th>' +
                '<th style="width:95px">Skor</th>' +
                '<th style="width:90px">Sinyal</th>' +
                '<th style="width:160px">Level Efektif</th>' +
                '<th class="r">Profil</th>' +
              '</tr></thead>' +
              '<tbody>' +
                (list.map(function (m) {
                  var lv = A.effLevel(m), c = A.caseOf(m.id);
                  return '<tr data-href="#/merchant/' + m.id + '">' +
                    '<td class="num font-bold">' + m.id + '</td>' +
                    '<td><div class="mthumb"><div class="thumb">' + U.storefront(m, 38) + '</div><div><b>' + esc(m.nama) + '</b><small>' + esc(m.kategori) + ' &middot; <span class="num">' + m.nmid + '</span></small></div></div></td>' +
                    '<td><b>' + esc(m.kota) + '</b><small class="block muted">Klaster ' + m.klaster + '</small></td>' +
                    '<td><span class="typo-pill">' + esc(U.tagLabel(m.tag)) + '</span>' + (c ? '<small class="block muted mt2">Kasus ' + c.id + ': <b>' + c.status + '</b></small>' : '') + '</td>' +
                    '<td><div class="score-cell"><b class="num">' + m.score + '</b><div class="score-mini-bar"><span style="width:' + m.score + '%"></span></div></div></td>' +
                    '<td>' + A.groupsBar(m) + '</td>' +
                    '<td>' + level(lv) + (lv !== m.level ? '<small class="block muted mt2">Awal: ' + U.LV[m.level] + '</small>' : '') + '</td>' +
                    '<td class="r"><a class="btn sec sm" href="#/merchant/' + m.id + '">Detail</a></td>' +
                  '</tr>';
                }).join('') || '<tr><td colspan="8" class="empty">Tidak ada merchant pada kategori/filter ini.</td></tr>') +
              '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>';
    }

    shell('Antrean & Direktori Penapisan', 'Prioritisasi pemeriksaan berbasis kapasitas dan perlindungan UMKM', body, { nav: 'antrean' });

    var app = A.app;
    app.querySelectorAll('[data-f]').forEach(function (b) { b.onclick = function () { qFilter = b.dataset.f; viewAntrean(); }; });
    app.querySelectorAll('tr[data-href]').forEach(function (r) { r.onclick = function () { location.hash = r.dataset.href; }; });
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
    return '<div class="gauge"><svg viewBox="0 0 120 120"><defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1D5BD8"/><stop offset="1" stop-color="' + LVCOL[lv] + '"/></linearGradient></defs><circle class="trk" cx="60" cy="60" r="50" pathLength="100"/><circle class="val" cx="60" cy="60" r="50" pathLength="100" stroke="url(#gg)" stroke-dasharray="' + score + ' 100"/></svg><div class="gv"><b>' + cu(score) + '</b><span>Skor Prioritas</span></div></div>';
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
    // J
    var jText, jRows;
    if (m.sigStatus.J === 'tidak_cukup_data') {
      jText = 'Analisis jejaring pembayar tidak dapat dieksekusi karena cakupan ID pembayar di bawah ambang minimum (70%). Status ini <b>bukan indikasi risiko</b> dan bukan jaminan aman; evaluasi bertumpu pada Pilar P dan K.';
    } else if (m.sig.J) {
      jText = idn(m.sharedShare * 100, 1) + '% pembayar juga bertransaksi di ' + (CF.J.sharedDegree - 1) + ' merchant lain atau lebih, serta terhubung dengan ' + m.nLinks + ' merchant (ukuran komponen ' + m.komponen + ' merchant) melalui sedikitnya ' + CF.J.linkPayers + ' pembayar bersama.';
    } else {
      jText = 'Distribusi pembayar didominasi oleh pelanggan mandiri atau irisan pembayar bersama masih berada dalam batas kewajaran komunitas lokal.';
    }
    jRows = kv('Jendela Observasi', P_REC + ' (14 hari)') +
      kv('Cakupan ID Pembayar', idn(m.stat.coverage * 100, 1) + '% transaksi (syarat min. ' + idn(CF.J.minCoverage * 100) + '%)') +
      kv('Pembayar Unik (Fan-In)', idn(m.stat.payerUnik) + ' pembayar') +
      (m.jData ?
        kv('Pembayar Lintas Toko', idn(m.crossShare * 100, 1) + '% (derajat 2+) &amp; <b>' + idn(m.sharedShare * 100, 1) + '%</b> (derajat ' + CF.J.sharedDegree + '+, ambang ' + idn(CF.J.sharedShare * 100) + '%)') +
        kv('Rata-rata Fan-Out', idn(m.fanOut, 2) + ' merchant per pembayar') +
        kv('Tautan / Komponen Graf', m.nLinks + ' merchant / ' + m.komponen + ' entitas (ambang ' + CF.J.minLinks + ' &amp; ' + CF.J.minComponent + ')') : '');
    out += sigCard('J', 'Jejaring Pembayar Lintas Toko', m.sigStatus.J, jText, jRows);

    // P
    var pText, pRows = kv('Jendela Acuan vs Evaluasi', P_BASE + ' vs ' + P_REC);
    if (m.sigStatus.P === 'tidak_cukup_data') {
      pText = 'Riwayat transaksi aktif dalam 14 hari terakhir kurang dari ' + CF.P.minRecentDays + ' hari, sehingga deviasi perilaku belum dapat diuji secara statistik.';
    } else {
      pText = m.pActive ?
        'Frekuensi transaksi harian 14 hari terakhir meningkat secara persisten dan melampaui ambang Robust Z terhadap kelompok sebaya (' + esc(m.kategori.toLowerCase()) + ')' + (m.ownZ !== null ? ' maupun riwayat historis merchant sendiri.' : '.') :
        m.transient ?
          'Terdapat ' + m.elevDays + ' hari dengan kenaikan volume sementara lalu kembali ke garis dasar. Lonjakan sesaat (akhir pekan/acara lokal) dicatat sebagai <b>Sinyal Lemah</b> dan tidak memicu antrean.' :
          'Frekuensi transaksi harian konsisten dengan distribusi normal kelompok sebaya sejenis maupun riwayat mandiri.';
      pRows += kv('Pembanding Berlapis (3-Tier)', 'Klaster ' + m.klaster + ' (' + esc(m.klasterNama) + ') &rarr; ' + esc(m.kategori) + ' &rarr; ' + esc(m.usaha)) +
        kv('Median Frekuensi / Hari', '<b>' + idn(m.recentMed, 1) + ' trx</b> (Sebaya kategori: ' + idn(pe.med, 1) + (pe.medCluster !== null ? '; Sebaya seklaster: ' + idn(pe.medCluster, 1) : '') + '; P90: ' + idn(pe.p90, 1) + ')') +
        kv('Robust Z vs Sebaya', m.peerZ === null ? 'Pembanding &lt;' + CF.P.minPeers + ' merchant' : '<b>' + idn(m.peerZ, 2) + '</b> (ambang &ge;' + CF.P.peerZ + ')') +
        kv('Robust Z vs Riwayat Sendiri', m.ownZ === null ? 'Riwayat ' + m.baseVals.length + ' hari (min. ' + CF.P.minBaseDays + ')' : '<b>' + idn(m.ownZ, 2) + '</b> (ambang &ge;' + CF.P.ownZ + ')') +
        kv('Statistik CUSUM Atas', m.cusum.alarmAt >= 0 ? 'Melewati ambang h=' + CF.cusum.h + ' pada Hari ke-' + (m.cusum.alarmAt + 1) + ' (S_max=' + idn(m.cusum.max, 1) + ')' : 'Normal (S_max=' + idn(m.cusum.max, 1) + ', di bawah h=' + CF.cusum.h + ')') +
        kv('Hari Di Atas Baseline / Hilang', m.elevDays + ' hari / ' + idn(m.pData.missingShare * 100, 0) + '% hari tanpa transmisi');
    }
    out += sigCard('P', 'Perilaku Relatif Sebaya &amp; CUSUM', m.sigStatus.P, pText, pRows);

    // K
    var k = [];
    if (m.newHot) k.push('merchant berusia sangat muda (' + m.umur + ' hari) dengan volume melampaui ' + CF.K.newHotMult + 'x persentil ke-90 sebaya');
    if (Math.abs(m.tickZ) >= CF.K.tickZ) k.push('nominal rata-rata per transaksi (' + rp(m.stat.meanAmt) + ') menyimpang tajam dari usaha sejenis (Robust Z = ' + idn(m.tickZ, 2) + ')');
    if (m.listStrong.length) k.push(m.listStrong.length + ' ID pembayar cocok dengan daftar rujukan internal berkeyakinan tinggi/sedang');

    var kRows = kv('Klaster Struktur Ekonomi', 'Klaster ' + m.klaster + ': ' + esc(m.klasterNama) + ' (' + esc(m.kota) + ')') +
      kv('Sektor Dominan Wilayah', esc(m.klasterSektor)) +
      kv('Kategori Usaha &amp; MCC', esc(m.kategori) + ' (MCC ' + m.mcc + ')') +
      kv('Umur Operasional Merchant', m.umur + ' hari (ambang atensi merchant baru: &lt;' + CF.K.newDays + ' hari)') +
      kv('Rata-rata Tiket vs Sebaya', '<b>' + rp(m.stat.meanAmt) + '</b> vs Median Sebaya ' + rp(pe.avgMed) + ' (Robust Z: ' + idn(m.tickZ, 2) + ')') +
      kv('Kelengkapan Dokumen KYM', esc(m.usaha) + ' &middot; Status dokumen: <b>' + esc(m.dokumenUsaha.toUpperCase()) + '</b>');
    if (m.listMatches.length) {
      kRows += kv('Kecocokan Daftar Rujukan', m.listMatches.map(function (e) {
        return '<span class="mono-id">' + esc(e.payer_id) + '</span> (' + esc(e.sumber) + ', ' + e.tanggal + ', dasar: ' + esc(e.dasar) + ', keyakinan: <b>' + e.keyakinan + '</b>)';
      }).join('<br>'));
    }
    out += sigCard('K', 'Profil Usaha, Konteks Wilayah &amp; Rujukan', m.sigStatus.K, k.length ? 'Terdeteksi: ' + k.join('; ') + '.' : 'Profil usaha, nominal tiket transaksi, dan kelengkapan dokumen sesuai dengan karakteristik kelompok sebaya tanpa kecocokan daftar rujukan.', kRows);
    return out;
  }

  function notProof(m) {
    var a = [];
    if (m.weak.malam) a.push('<b>Operasional Malam Hari (' + idn(m.nightShare * 100, 1) + '% transaksi pukul 22.00–05.00):</b> Merupakan karakteristik lumrah bagi angkringan, kedai kopi, dan kuliner malam. Jam transaksi tidak pernah menjadi dasar tunggal penundaan.');
    if (m.weak.seragam) a.push('<b>Konsentrasi Nominal Seragam (' + idn(m.uniform * 100, 1) + '% pada nominal modus):</b> Wajar bagi penjual paket pulsa, token listrik, fotokopi, atau makanan satu harga.');
    if (m.weak.sesaat) a.push('<b>Lonjakan Volume Sesaat (' + m.elevDays + ' hari):</b> Kenaikan sementara saat akhir pekan, gajian, atau acara kampus/pertandingan lokal yang segera kembali normal.');
    if (m.stat.meanAmt < 100000) a.push('<b>Nominal Rata-rata ' + rp(m.stat.meanAmt) + ' (&lt;Rp100.000):</b> Berada di sekitar rata-rata transaksi QRIS nasional (' + rp(H.qris.rata2_transaksi_rp) + ') dan di bawah batas MDR 0% UMKM mikro.');
    a.push('<b>Skor Prioritas ' + m.score + '/100 adalah Peringkat Antrean:</b> Skor mengurutkan jadwal kerja analis, bukan peluang matematis keterlibatan judi daring. Keputusan pembatasan wajib melalui pembuktian manusia dan otorisasi dua pejabat.');
    return a;
  }

  function caseBlock(c) {
    var bs = A.buktiStatus(c);
    return '<div class="card highlight-card">' +
      '<div class="card-head-row"><div><span class="card-tag">STATUS BERKAS PEMERIKSAAN</span><h3>Kasus ' + c.id + '</h3></div>' + A.stPill(c.status) + '</div>' +
      '<dl class="kv mt8">' +
        kv('Nomor Berkas', '<a class="font-bold num" href="#/kasus/' + c.id + '">' + c.id + ' &rarr;</a>') +
        kv('Analis Pemeriksa', esc(c.petugas)) +
        kv('Tanggal Dibuka', A.fmtD(c.dibuka)) +
        kv('Kecukupan Bukti', '<b>' + bs.label + '</b> (' + bs.n + ' jenis bukti, ' + bs.nonTrx + ' bukti lapangan/dokumen)') +
        kv('Permintaan Dokumen', c.dokumen.length ? c.dokumen.map(function (d) { return esc(d.minta) + ' (' + d.status + ')'; }).join('; ') : 'Belum ada permintaan') +
        kv('Status Keberatan', c.keberatan ? c.keberatan.status : 'Tidak ada') +
      '</dl>' +
      (c.status === 'Tidak terbukti' ? '<div class="umkm-protect-box mt8">' + icon('shield') + '<div><b>Telah Dikoreksi &amp; Dipulihkan ke Hijau:</b> Pemeriksaan manusia membuktikan aktivitas usaha wajar.</div></div>' : '') +
      '<a class="btn mt12" href="#/kasus/' + c.id + '">' + icon('folder') + 'Buka Berkas Pemeriksaan ' + c.id + '</a>' +
    '</div>';
  }

  function viewMerchant(id) {
    var m = T.byId(id); if (!m) return viewAntrean();
    var lv = A.effLevel(m), c = A.caseOf(m.id), u = me(), n = m.nGroups, qr = A.antrean().filter(function (x) { return x.m === m; })[0];
    var rule = lv === 'merah' ? 'Penundaan transaksi sementara telah disetujui oleh 2 pejabat kepatuhan setelah verifikasi bukti manusia. Merchant menerima Berita Acara resmi dan dijamin hak keberatannya (UU 8/2010 Pasal 67).' :
      c && c.status === 'Tidak terbukti' ? 'Mesin penapisan awal menandai Level Oranye (' + n + ' dari 3 pilar sinyal), namun hasil verifikasi dokumen dan lapangan membuktikan usaha wajar. Status dikoreksi penuh menjadi Hijau.' :
      m.level === 'oranye' ? 'Mengaktifkan ' + n + ' dari 3 kelompok sinyal kuat (syarat konvergensi &ge;2 terpenuhi). Merchant dijadwalkan dalam antrean verifikasi analis tanpa pembatasan sepihak.' :
      m.level === 'kuning' ? 'Hanya 1 kelompok sinyal kuat yang aktif. Sesuai aturan 2-dari-3, satu sinyal tidak cukup untuk memicu pemeriksaan; merchant dipantau otomatis.' :
      (m.weak.malam || m.weak.seragam || m.weak.sesaat ? 'Hanya terdeteksi sinyal lemah (jam malam, nominal seragam, atau lonjakan sesaat). Sinyal lemah dilindungi penuh dan tetap berstatus Hijau.' : 'Seluruh indikator jejaring, perilaku sebaya, dan profil berada dalam rentang normal.');

    var actBtn = '';
    if (isPJP()) {
      if (A.activeCase(m.id)) actBtn = '<a class="btn" href="#/kasus/' + A.activeCase(m.id).id + '">' + icon('folder') + 'Buka Kasus ' + A.activeCase(m.id).id + '</a>';
      else if (m.level === 'oranye' && !c) actBtn = '<button type="button" class="btn" id="open">' + icon('folder') + 'Buka Kasus Verifikasi</button>';
      else if (c) actBtn = '<a class="btn sec" href="#/kasus/' + c.id + '">' + icon('folder') + 'Lihat Arsip Kasus ' + c.id + '</a>';
      else actBtn = '<button type="button" class="btn sec" disabled title="Kasus hanya dibuka untuk merchant Level Oranye">' + icon('lock') + 'Tidak Memerlukan Berkas Kasus</button>';
    }

    var tx = T.txOf(m, 10);
    var gaps = m.dataGaps.map(function (g) { return '<li><b>Pilar ' + g.signal + ':</b> ' + esc(g.why) + '</li>'; }).join('');

    var headerCard =
      '<div class="card mhead-card">' +
        '<div class="mhead">' +
          '<span class="photo">' + U.storefront(m, 80) + '</span>' +
          '<div class="mhead-info">' +
            '<div class="mhead-top">' +
              '<span class="card-tag">DOSSIER DIAGNOSTIK MERCHANT &middot; ' + esc(m.pjp.toUpperCase()) + '</span>' +
              '<span class="mono-badge">ID ' + m.id + ' &middot; NMID ' + m.nmid + '</span>' +
            '</div>' +
            '<h2>' + esc(m.nama) + '</h2>' +
            '<div class="mhead-sub">' +
              '<span><b>' + esc(m.kategori) + '</b> (MCC ' + m.mcc + ')</span>' +
              '<span>&bull;</span>' +
              '<span><b>' + esc(m.kota) + '</b></span>' +
              '<span>&bull;</span>' +
              '<a href="#/bukti/klaster" class="klaster-link">Klaster ' + m.klaster + ': ' + esc(m.klasterNama) + '</a>' +
              '<span>&bull;</span>' +
              '<span class="typo-pill">' + esc(U.tagLabel(m.tag)) + '</span>' +
            '</div>' +
            '<div class="mhead-badges mt8">' +
              level(lv, true) +
              (lv !== m.level ? '<span class="pill st-investigasi">Penapisan Awal: ' + U.LV[m.level] + '</span>' : '') +
              (qr ? '<span class="pill st-menunggu">Antrean Prioritas #' + qr.rank + ' (' + (qr.today ? 'Jadwal Hari Ini' : 'Hari ke-' + qr.hari) + ')</span>' : '') +
            '</div>' +
          '</div>' +
          '<div class="mhead-actions">' +
            actBtn +
            '<a class="btn sec" href="#/jejaring/' + m.id + '">' + icon('net') + 'Graf Jejaring Pembayar</a>' +
          '</div>' +
        '</div>' +
      '</div>';

    var leftCol =
      '<div class="card">' +
        '<div class="card-head-row"><div><span class="card-tag">EVALUASI SKOR &amp; KONVERGENSI SINYAL</span><h3>Ringkasan Penapisan Multi-Layer</h3></div>' + badge('hitungan') + '</div>' +
        '<div class="scorecard mt12">' +
          gauge(m.score, lv) +
          '<div class="sigs">' +
            '<div class="small muted" style="font-weight:800;text-transform:uppercase;letter-spacing:.05em">Konvergensi Pilar Sinyal (' + n + ' dari 3 Aktif)</div>' +
            [['J', 'Jejaring Pembayar', m.sig.J, m.sigStatus.J], ['P', 'Perilaku Relatif Sebaya', m.sig.P, m.sigStatus.P], ['K', 'Profil &amp; Konteks Wilayah', m.sig.K, m.sigStatus.K]].map(function (g) {
              var stCls = g[2] ? 'on' : g[3] === 'tidak_cukup_data' ? 'na' : '';
              var stTxt = g[2] ? 'Terindikasi' : g[3] === 'tidak_cukup_data' ? 'Data Kurang' : 'Normal';
              return '<div class="sig ' + stCls + '"><i>' + g[0] + '</i><span>' + g[1] + '</span><b class="sig-status-txt">' + stTxt + '</b></div>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div class="mt12"><div class="card-tag">DEKOMPOSISI BOBOT SKOR PRIORITAS (0–100)</div>' + U.scoreBreakdown(m, CF.W) + '</div>' +
        '<p class="note mt12">' + rule + '</p>' +
        (qr && !qr.today && !c ? '<p class="small muted mt8">Merchant ini dijadwalkan pada <b>hari kerja ke-' + qr.hari + '</b> sesuai kapasitas harian tim (' + A.kapasitas() + ' kasus/hari). Analis tetap dapat membuka berkas lebih awal bila diperlukan.</p>' : '') +
      '</div>' +
      (gaps ? '<div class="card"><div class="card-tag">KUALITAS &amp; KELENGKAPAN DATA</div><h3>Catatan Keterbatasan Observasi</h3><ul class="small gaps">' + gaps + '</ul></div>' : '') +
      '<div class="card"><div class="notproof" style="margin:0"><h4>Prinsip Perlindungan UMKM: Sinyal Bukan Bukti</h4><ul>' + notProof(m).map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div></div>';

    var rightCol =
      (c ? caseBlock(c) : '') +
      '<div class="card">' +
        '<div class="card-head-row"><div><span class="card-tag">ANALISIS DERET WAKTU (56 HARI)</span><h3>Linimasa Transaksi Harian vs Kelompok Sebaya</h3></div><span class="mono-badge">' + P_BASE + ' s.d. ' + dstr(T.DAYS - 1) + '</span></div>' +
        '<p class="hint">Garis tebal menunjukkan transaksi berhasil per hari (hari tanpa transmisi tidak dianggap nol). Area biru adalah rentang normal P10–P90 usaha sejenis (' + esc(m.kategori) + ').</p>' +
        U.timeline(m) +
      '</div>' +
      '<div class="card">' +
        '<div class="card-head-row"><div><span class="card-tag">PROFIL WAKTU OPERASIONAL</span><h3>Distribusi Jam Transaksi (24 Jam)</h3></div><span class="mono-badge">Jam Buka: ' + String(m.jamBuka[0]).padStart(2, '0') + ':00–' + String(m.jamBuka[1]).padStart(2, '0') + ':00</span></div>' +
        '<p class="hint">Proporsi transaksi di luar jam buka tercatat: <b>' + idn(m.stat.outsideShare * 100, 1) + '%</b>. Aktivitas malam hari dicatat sebagai konteks operasional dan tidak pernah menjadi alasan tunggal pembatasan.</p>' +
        U.hours(m) +
      '</div>';

    var signalsFullRow =
      '<div class="card">' +
        '<div class="card-head-row"><div><span class="card-tag">RINCIAN PARAMETER &amp; PEMBANDING BERLAPIS</span><h3>Pembuktian Objektif Tiga Pilar Sinyal (J &middot; P &middot; K)</h3></div>' + badge('hitungan') + '</div>' +
        '<p class="hint">Setiap pilar dievaluasi menggunakan pembanding berlapis (Klaster Ekonomi Wilayah &rarr; Kategori MCC &rarr; Skala Usaha) dan jendela waktu eksplisit.</p>' +
        '<div class="sig-grid-3 mt12">' + signalCards(m) + '</div>' +
      '</div>';

    var bottomSplit =
      '<div class="exec-split">' +
        '<div class="card">' +
          '<div class="card-head-row"><div><span class="card-tag">BUKU BESAR TRANSAKSI (LEDGER 14 HARI)</span><h3>Ringkasan &amp; Sampel Transaksi Terkini</h3></div><a class="btn sec sm" href="#/data">' + icon('download') + 'Ekspor CSV</a></div>' +
          '<div class="grid3 mt12">' +
            '<div class="mini-k"><b class="num">' + idn(m.stat.ok14) + ' / ' + idn(m.stat.gagal14) + '</b><span>Berhasil / Gagal (14H)</span></div>' +
            '<div class="mini-k"><b class="num">' + rp(m.stat.meanAmt) + '</b><span>Rata-rata Tiket (Median ' + rp(m.stat.medAmt) + ')</span></div>' +
            '<div class="mini-k"><b class="num">' + idn(m.stat.modalShare * 100, 1) + '%</b><span>Konsentrasi Nominal Modus</span></div>' +
          '</div>' +
          '<div class="tblwrap mt12"><table class="exec-table"><thead><tr><th>ID Transaksi</th><th>Waktu (WIB)</th><th>ID Pembayar</th><th class="r">Nominal</th><th>Status</th></tr></thead><tbody>' +
            tx.map(function (t) {
              return '<tr><td class="num small font-bold">' + t.transaction_id + '</td><td class="num small">' + t.timestamp + '</td><td class="small num">' + esc(t.payer_id || 'Tanpa ID (Anonim)') + '</td><td class="r num font-bold">' + rp(t.amount) + '</td><td><span class="pill ' + (t.transaction_status === 'berhasil' ? 'st-tidak' : 'st-dibatasi') + '">' + t.transaction_status + '</span></td></tr>';
            }).join('') +
          '</tbody></table></div>' +
        '</div>' +
        '<div class="card">' +
          '<div class="card-head-row"><div><span class="card-tag">PROFIL KYM &amp; KONTEKS SPASIAL</span><h3>Identitas Merchant &amp; Karakteristik Wilayah</h3></div>' + badge('demo') + '</div>' +
          '<dl class="kv mt12">' +
            kv('Nama Usaha', '<b>' + esc(m.nama) + '</b>') +
            kv('National Merchant ID (NMID)', '<span class="num font-bold">' + m.nmid + '</span>') +
            kv('Kategori &amp; Kode MCC', esc(m.kategori) + ' (MCC ' + m.mcc + ')') +
            kv('Skala Usaha &amp; Pemilik', esc(m.usaha) + ' &middot; ' + esc(m.pemilik)) +
            kv('PJP Pengakuisisi', esc(m.pjp)) +
            kv('Umur Terdaftar', m.umur + ' hari kalender') +
            kv('Status Dokumen Usaha', '<b>' + esc(m.dokumenUsaha.toUpperCase()) + '</b>') +
            kv('Kabupaten / Kota', '<b>' + esc(m.kota) + '</b>') +
            kv('Klaster Struktur Ekonomi', '<a href="#/bukti/klaster">Klaster ' + m.klaster + ' &mdash; ' + esc(m.klasterNama) + '</a>') +
            kv('Sektor Dominan PDRB', esc(m.klasterSektor)) +
            kv('Tipologi Pola Transaksi', '<span class="typo-pill">' + esc(U.tagLabel(m.tag)) + '</span>') +
          '</dl>' +
          (m.catatanSimulasi ? '<div class="note mt12"><b>Catatan Diagnostik Kontekstual:</b> ' + esc(m.catatanSimulasi) + '</div>' : '') +
        '</div>' +
      '</div>';

    var body = headerCard + '<div class="exec-split"><div class="exec-main">' + leftCol + '</div><div class="exec-side">' + rightCol + '</div></div>' + signalsFullRow + bottomSplit;
    shell('Dossier Merchant — ' + esc(m.nama), 'NMID ' + m.nmid + ' · ' + esc(m.kota), body, { back: true, nav: 'antrean' });

    var ob = A.app.querySelector('#open');
    if (ob) ob.onclick = function () {
      var k = A.openCase(m, u);
      toast('Berkas kasus ' + k.id + ' berhasil dibuka untuk verifikasi');
      location.hash = '#/kasus/' + k.id;
    };
  }

  // ---------- Graf Jejaring Pembayar Lintas Merchant ----------
  function viewJejaring(id) {
    var q = A.antrean(), m = T.byId(id) || (q.length ? q[0].m : T.byId('M081')), g = U.network(m, T);
    var links = Object.keys(m.links).map(function (k) { return { m: T.byId(k), n: m.links[k] }; }).sort(function (a, b) { return b.n - a.n; });
    var netMerchants = T.merchants.filter(function (x) { return x.nLinks > 0 || x.level === 'oranye'; }).sort(function (a, b) { return b.nLinks - a.nLinks || b.score - a.score; });

    var selectorBar =
      '<div class="card">' +
        '<div class="card-head-row">' +
          '<div><span class="card-tag">ANALISIS TOPOLOGI GRAF PEMBAYAR (PILAR J)</span><h3>Pilih Titik Pusat Merchant</h3></div>' +
          '<a class="btn sec sm" href="#/merchant/' + m.id + '">Buka Dossier ' + m.id + ' &rarr;</a>' +
        '</div>' +
        '<div class="chips mt8" style="padding-bottom:2px">' +
          netMerchants.slice(0, 12).map(function (nm) {
            return '<button type="button" class="chip ' + (nm.id === m.id ? 'on' : '') + '" data-jm="' + nm.id + '">' +
              '<span class="chip-dot ' + A.effLevel(nm) + '"></span>' + esc(nm.nama) + ' <span class="chip-count">' + nm.nLinks + ' tautan</span>' +
            '</button>';
          }).join('') +
        '</div>' +
      '</div>';

    var body =
      selectorBar +
      '<div class="exec-split">' +
        '<div class="exec-main">' +
          '<div class="card">' +
            '<div class="card-head-row">' +
              '<div><span class="card-tag">VISUALISASI GRAF KONEKTIVITAS</span><h3>Jejaring Pembayar: ' + esc(m.nama) + ' (' + m.id + ')</h3></div>' +
              level(A.effLevel(m)) +
            '</div>' +
            '<p class="hint">Simpul kotak menunjukkan merchant (klik untuk berpindah pusat graf). Titik lingkaran adalah pembayar unik dalam 14 hari terakhir.</p>' +
            '<div class="net-canvas-wrap mt12">' +
              (m.jData ? g.svg : '<div class="note">Cakupan ID pembayar pada merchant ini hanya <b>' + idn(m.stat.coverage * 100, 1) + '%</b> (di bawah ambang 70%), sehingga topologi graf tidak dapat dibentuk secara andal. Status Pilar J ditetapkan sebagai <b>Data Tidak Memadai</b>.</div>') +
            '</div>' +
            '<div class="chart-legend mt12">' +
              '<span><i style="background:#091E42"></i>Merchant Pusat (' + m.id + ')</span>' +
              '<span><i style="background:#FFFFFF;border:2px solid #E05D10"></i>Merchant Terhubung (&ge;6 pembayar sama)</span>' +
              '<span><i style="background:#EA580C;border-radius:50%"></i>Pembayar Lintas Toko (&ge;3 merchant)</span>' +
              '<span><i style="background:#DC2626;border-radius:50%"></i>Pembayar Tercatat Daftar Rujukan</span>' +
              '<span><i style="background:#94A3B8;border-radius:50%"></i>Pembayar Mandiri</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="exec-side">' +
          '<div class="grid2">' +
            A.stat('Merchant dalam Klaster Graf', g.nMerchant + ' Toko', 'hitungan', 'Termasuk pusat ' + m.id) +
            A.stat('Pembayar Bersama (2+ Toko)', g.nShared + ' Akun', 'hitungan', idn(m.sharedShare * 100, 1) + '% derajat 3+') +
            A.stat('Ukuran Komponen Jaringan', m.komponen + ' Entitas', 'hitungan', 'Ambang sinyal J: &ge;' + CF.J.minComponent) +
            A.stat('Fan-Out Rata-rata Pembayar', idn(m.fanOut, 2) + 'x', 'hitungan', 'Fan-in: ' + idn(m.fanIn) + ' pembayar unik') +
          '</div>' +
          '<div class="card mt12">' +
            '<div class="card-tag">KONEKTIVITAS LINTAS MERCHANT</div>' +
            '<h3>Daftar Merchant Terhubung Langsung</h3>' +
            (links.length ?
              '<div class="tblwrap mt8"><table class="exec-table"><thead><tr><th>Merchant Terhubung</th><th>Level</th><th class="r">Pembayar Sama</th></tr></thead><tbody>' +
                links.map(function (l) {
                  return '<tr data-href="#/jejaring/' + l.m.id + '">' +
                    '<td><b>' + esc(l.m.nama) + '</b><small class="block muted">' + l.m.id + ' &middot; ' + esc(l.m.kota) + '</small></td>' +
                    '<td>' + level(A.effLevel(l.m)) + '</td>' +
                    '<td class="r num font-bold">' + l.n + ' akun</td>' +
                  '</tr>';
                }).join('') +
              '</tbody></table></div>' :
              '<p class="small muted mt8">Merchant ini tidak memiliki tautan pembayar bersama (&ge;' + CF.J.linkPayers + ' pembayar identik) dengan merchant lain.</p>') +
          '</div>' +
          '<div class="card mt12">' +
            '<div class="card-tag">PRINSIP INTERPRETASI</div>' +
            '<h3>Membedakan Komunitas Wajar vs Penampungan</h3>' +
            '<p class="small muted" style="line-height:1.55">Dua merchant terhubung apabila berbagi sedikitnya <b>' + CF.J.linkPayers + ' ID pembayar</b> yang sama dalam 14 hari terakhir. Karena komunitas mahasiswa, kantin perkantoran, atau arisan warga juga dapat berbagi pembayar, <b>Pilar J sendirian hanya menghasilkan Level Kuning</b>. Masuknya merchant ke antrean Oranye mewajibkan konvergensi dengan lonjakan perilaku (P) atau anomali profil/rujukan (K).</p>' +
          '</div>' +
        '</div>' +
      '</div>';

    shell('Graf Jejaring Pembayar Lintas Toko', 'Analisis topologi konektivitas pembayar dan deteksi fan-in/fan-out', body, { back: true, nav: 'jejaring' });

    A.app.querySelectorAll('[data-m]').forEach(function (n) {
      n.addEventListener('click', function () { location.hash = '#/merchant/' + n.dataset.m; });
    });
    A.app.querySelectorAll('[data-jm]').forEach(function (b) {
      b.onclick = function () { location.hash = '#/jejaring/' + b.dataset.jm; };
    });
    A.app.querySelectorAll('tr[data-href]').forEach(function (r) {
      r.onclick = function () { location.hash = r.dataset.href; };
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
    for (var i = 0; i < T.nTx(); i++) { var t = T.txRow(i); r.push([t.transaction_id, t.merchant_id, t.payer_id, t.timestamp, t.amount, t.transaction_status]); }
    dl('tapis_ledger_transaksi_14h.csv', csv(r));
  }
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
        '<div class="card-head-row"><div><span class="card-tag">REPOSITORI &amp; AUDITABILITAS DATA</span><h3>Ekspor Basis Data Terkalibrasi (CSV)</h3></div>' + badge('demo') + '</div>' +
        '<p class="hint">Seluruh populasi mikro (' + T.merchants.length + ' merchant: ' + tags.normal + ' operasional normal, ' + tags.anomali + ' anomali parsial, ' + tags.kuat + ' konvergensi kuat; ' + T.DAYS + ' hari observasi; ' + idn(T.nTx()) + ' transaksi ledger 14 hari terakhir) dibangkitkan dengan bibit deterministik untuk menjamin keterulangan pengujian.</p>' +
        '<div class="grid4 mt12">' +
          '<button type="button" class="export-card" data-x="m">' + icon('download') + '<b>Master Merchant</b><span>100 entitas, skor J·P·K, &amp; klaster PDRB (.csv)</span></button>' +
          '<button type="button" class="export-card" data-x="t">' + icon('download') + '<b>Ledger Transaksi 14H</b><span>' + idn(T.nTx()) + ' baris transaksi mikro (.csv)</span></button>' +
          '<button type="button" class="export-card" data-x="h">' + icon('download') + '<b>Deret Harian 56H</b><span>5.600 observasi frekuensi harian (.csv)</span></button>' +
          '<button type="button" class="export-card" data-x="k">' + icon('download') + '<b>Berkas Kasus &amp; Audit</b><span>' + S.cases.length + ' berkas pemeriksaan &amp; status (.csv)</span></button>' +
        '</div>' +
      '</div>' +
      '<div class="card">' +
        '<div class="card-head-row"><div><span class="card-tag">TABEL MASTER ENTITAS</span><h3>Direktori Lengkap 100 Merchant (' + list.length + ' Ditampilkan)</h3></div></div>' +
        '<div class="search mt8">' + icon('search') + '<input id="dq" placeholder="Cari nama merchant, ID, kota, kategori, atau tipologi..." value="' + esc(dFilter) + '"></div>' +
        '<div class="tblwrap mt8"><table class="exec-table"><thead><tr><th>ID</th><th>Merchant &amp; Kategori</th><th>Kota &amp; Klaster</th><th>Tipologi Skenario</th><th>Sinyal J·P·K</th><th class="r">Skor</th><th>Level</th></tr></thead><tbody>' +
          list.map(function (m) {
            return '<tr data-href="#/merchant/' + m.id + '">' +
              '<td class="num small font-bold">' + m.id + '</td>' +
              '<td><b>' + esc(m.nama) + '</b><small class="block muted">' + esc(m.kategori) + ' (MCC ' + m.mcc + ')</small></td>' +
              '<td>' + esc(m.kota) + '<small class="block muted">Klaster ' + m.klaster + '</small></td>' +
              '<td><span class="typo-pill">' + esc(U.tagLabel(m.tag)) + '</span></td>' +
              '<td>' + A.groupsBar(m) + '</td>' +
              '<td class="r num font-bold">' + m.score + '</td>' +
              '<td>' + level(A.effLevel(m)) + '</td>' +
            '</tr>';
          }).join('') +
        '</tbody></table></div>' +
      '</div>';

    shell('Basis Data & Ekspor CSV', 'Eksplorasi tabel master dan unduh data mentah untuk replikasi analisis', body, { back: true, nav: 'data' });
    var app = A.app;
    app.querySelectorAll('[data-x]').forEach(function (b) { b.onclick = function () { ({ m: exportMerchants, t: exportTx, h: exportHarian, k: exportKasus })[b.dataset.x](); toast('Berkas CSV berhasil diunduh'); }; });
    app.querySelectorAll('tr[data-href]').forEach(function (r) { r.onclick = function () { location.hash = r.dataset.href; }; });
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
