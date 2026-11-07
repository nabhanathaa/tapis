/* TAPIS: antrean berkapasitas, profil merchant, jejaring pembayar, data simulasi + ekspor CSV. Semua data merchant = SIMULASI. */
(function () {
  'use strict';
  var A = window.A, T = A.T, U = A.U, H = A.H, S = A.S, icon = U.icon, idn = U.idn, rp = U.rp, esc = U.esc, badge = U.badge, level = U.level;
  var shell = A.shell, cu = A.cu, me = A.me, isPJP = A.isPJP, toast = A.toast, sheet = A.sheet, CF = T.CONFIG;
  function dstr(i) { return A.fmtD(new Date(T.START.getTime() + i * 864e5)); }
  var P_BASE = dstr(0) + ' - ' + dstr(T.BASE - 1), P_REC = dstr(T.FIRST_RECENT) + ' - ' + dstr(T.DAYS - 1);

  // ---------- antrean ----------
  var qFilter = 'oranye', qSearch = '';
  function viewAntrean() {
    var K = A.kapasitas(), q = A.antrean();
    var chips = [['oranye', 'Oranye'], ['merah', 'Merah'], ['kuning', 'Kuning'], ['hijau', 'Hijau'], ['semua', 'Semua']].map(function (c) { return '<button class="chip ' + (qFilter === c[0] ? 'on' : '') + '" data-f="' + c[0] + '">' + c[1] + '</button>'; }).join('');
    var body = '<div class="search">' + icon('search') + '<input id="q" placeholder="Cari nama, kota, NMID, atau ID merchant" value="' + esc(qSearch) + '"></div><div class="chips">' + chips + '</div>';
    function match(m) { return !qSearch || (m.nama + ' ' + m.kota + ' ' + m.kategori + ' ' + m.nmid + ' ' + m.id).toLowerCase().indexOf(qSearch) >= 0; }
    if (qFilter === 'oranye') {
      var rows = q.filter(function (x) { return match(x.m); });
      var hari = K > 0 ? Math.ceil(q.length / K) : null, today = q.filter(function (x) { return x.today; }).length;
      var handled = T.merchants.filter(function (m) { return m.level === 'oranye' && A.caseOf(m.id) && match(m); }).sort(function (a, b) { return b.score - a.score; });
      body += '<div class="card"><div class="flex between"><h3>Antrean berkapasitas</h3><button class="chip" id="cap">Atur kapasitas</button></div>' +
        '<div class="grid3 mt8"><div class="mini-k"><b class="num">' + q.length + '</b><span>Belum diperiksa</span></div><div class="mini-k"><b class="num">' + K + '</b><span>Kapasitas per hari kerja</span></div><div class="mini-k"><b class="num">' + (hari === null ? '-' : hari) + '</b><span>Hari kerja untuk menuntaskan</span></div></div>' +
        '<p class="hint mt8">Kapasitas adalah parameter yang diatur tim (' + S.settings.analis.map(function (a) { return esc(a.nama.split(' ')[0]) + ' ' + a.kap; }).join(', ') + ' kasus baru per hari). Perkiraan mulai ditinjau dihitung dari peringkat dibagi kapasitas harian dan berubah bila kapasitas atau jumlah kasus baru berubah. Merchant yang menunggu tidak dibatasi secara otomatis.</p></div>' +
        '<div class="card"><h3>Peringkat prioritas</h3><p class="hint">Urutan berdasarkan skor prioritas (peringkat relatif, bukan peluang). Level Oranye berarti minimal dua dari tiga kelompok sinyal aktif.</p>' +
        '<div class="tblwrap"><table class="mini qtable"><thead><tr><th>#</th><th>Merchant</th><th class="r">Skor</th><th>J P K</th><th>Petugas</th><th>Status antrean</th></tr></thead><tbody>' +
        (rows.map(function (x) { var m = x.m; return '<tr data-href="#/merchant/' + m.id + '"><td class="num">' + x.rank + '</td><td><b>' + esc(m.nama) + '</b><br><span class="small muted">' + m.id + ' &middot; ' + esc(m.kategori) + '</span></td><td class="r num">' + m.score + '</td><td>' + A.groupsBar(m) + '</td><td>' + esc(x.petugas ? x.petugas.split(' ')[0] : '-') + '</td><td><span class="pill ' + (x.today ? 'st-menunggu' : 'st-investigasi') + '">' + x.status + '</span><br><span class="small muted">' + (x.hari ? 'mulai hari kerja ke-' + x.hari : 'kapasitas belum diatur') + '</span></td></tr>'; }).join('') || '<tr><td colspan="6" class="empty">Tidak ada merchant yang menunggu.</td></tr>') + '</tbody></table></div>' +
        '<p class="small muted mt8">Dijadwalkan hari ini: ' + today + ' merchant. Menunggu kapasitas: ' + Math.max(0, q.length - today) + ' merchant.</p></div>' +
        (handled.length ? '<div class="sec-title"><h2>Sudah ditangani</h2><span class="small muted">' + handled.length + ' merchant</span></div><div class="list">' + handled.map(function (m) { return A.itemRow(m); }).join('') + '</div>' : '');
    } else {
      var list = T.merchants.filter(function (m) { return (qFilter === 'semua' || A.effLevel(m) === qFilter) && match(m); }).sort(function (a, b) { return b.score - a.score; });
      if (qFilter === 'kuning') body += '<div class="note" style="margin-bottom:12px">Kuning tidak masuk antrean. Merchant dipantau otomatis tanpa pemberitahuan atau pembatasan apa pun.</div>';
      if (qFilter === 'merah') body += '<div class="note" style="margin-bottom:12px">Merah hanya ada setelah pemeriksaan manusia, bukti memadai, dan persetujuan dua pejabat. Tidak ada merchant yang menjadi Merah otomatis.</div>';
      body += '<div class="list">' + (list.map(function (m) { return A.itemRow(m); }).join('') || '<div class="empty">Tidak ada merchant pada level ini.</div>') + '</div>';
    }
    shell('Antrean', 'Peringkat prioritas, bukan peluang', body);
    var app = A.app;
    app.querySelectorAll('[data-f]').forEach(function (b) { b.onclick = function () { qFilter = b.dataset.f; viewAntrean(); }; });
    app.querySelectorAll('tr[data-href]').forEach(function (r) { r.onclick = function () { location.hash = r.dataset.href; }; });
    var qi = app.querySelector('#q'); qi.oninput = function () { qSearch = qi.value.toLowerCase(); var pos = qi.selectionStart; A.skipAnim = true; viewAntrean(); var n = app.querySelector('#q'); n.focus(); n.setSelectionRange(pos, pos); };
    var cb = app.querySelector('#cap'); if (cb) cb.onclick = function () {
      var s = sheet('<h3>Kapasitas analis</h3><p class="small muted">Jumlah kasus baru yang dapat mulai ditinjau tiap analis per hari kerja. Ini asumsi operasional tim, bukan statistik nasional.</p>' +
        S.settings.analis.map(function (a, i) { return '<div class="field"><label>' + esc(a.nama) + '</label><input type="number" min="0" max="20" data-i="' + i + '" value="' + a.kap + '"></div>'; }).join('') + '<button class="btn mt12" id="ks">Simpan</button>');
      s.querySelector('#ks').onclick = function () { s.querySelectorAll('input[data-i]').forEach(function (inp) { S.settings.analis[+inp.dataset.i].kap = Math.max(0, Math.min(20, Math.round(+inp.value || 0))); }); A.saveSettings(); s.remove(); viewAntrean(); };
    };
  }

  // ---------- profil merchant ----------
  var LVCOL = A.LVCOL;
  function gauge(score, lv) {
    return '<div class="gauge"><svg viewBox="0 0 120 120"><defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3B82F6"/><stop offset="1" stop-color="' + LVCOL[lv] + '"/></linearGradient></defs><circle class="trk" cx="60" cy="60" r="50" pathLength="100"/><circle class="val" cx="60" cy="60" r="50" pathLength="100" stroke="url(#gg)" stroke-dasharray="' + score + ' 100"/></svg><div class="gv"><b>' + cu(score) + '</b><span>skor prioritas</span></div></div>';
  }
  function peerInfo(m) { var peers = T.merchants.filter(function (o) { return o !== m && o.kategori === m.kategori && o.recentVals.length >= CF.P.minRecentDays && o.umur >= 14; }), meds = peers.map(function (o) { return o.recentMed; }); return { n: peers.length, med: T.median(meds), p90: T.quantile(meds, 0.9), avgMed: T.median(T.merchants.filter(function (o) { return o !== m && o.kategori === m.kategori; }).map(function (o) { return o.stat.meanAmt; })) }; }
  var ST_LBL = { aktif: 'Aktif', tidak: 'Tidak aktif', tidak_cukup_data: 'Tidak cukup data' };
  function sigCard(g, title, st, text, rows) {
    return '<div class="sigcard s-' + st + '"><div class="sh"><span class="tag ' + g.toLowerCase() + '">' + g + '</span><b>' + title + '</b><em>' + ST_LBL[st] + '</em></div><p>' + text + '</p>' + (rows ? '<dl class="kv cmp">' + rows + '</dl>' : '') + '</div>';
  }
  function kv(a, b) { return '<dt>' + a + '</dt><dd>' + b + '</dd>'; }
  function signalCards(m) {
    var pe = peerInfo(m), out = '';
    // J
    var jText, jRows;
    if (m.sigStatus.J === 'tidak_cukup_data') { jText = 'Analisis jejaring tidak dapat dilakukan karena data pembayar tidak memadai. Status ini <b>bukan</b> berarti aman dan bukan berarti berisiko; merchant dinilai dari kelompok P dan K saja.'; }
    else if (m.sig.J) jText = idn(m.sharedShare * 100) + '% pembayar juga membayar di ' + (CF.J.sharedDegree - 1) + ' merchant lain atau lebih, dan terhubung dengan ' + m.nLinks + ' merchant (komponen jaringan ' + m.komponen + ' merchant) lewat sedikitnya ' + CF.J.linkPayers + ' pembayar yang sama.';
    else jText = 'Pembayar didominasi pelanggan sendiri atau jejaring bersama terlalu kecil untuk dianggap sinyal.';
    jRows = kv('Periode data', P_REC + ' (14 hari)') + kv('Cakupan ID pembayar', idn(m.stat.coverage * 100) + '% transaksi (minimal ' + idn(CF.J.minCoverage * 100) + '%)') + kv('Pembayar unik', idn(m.stat.payerUnik)) +
      (m.jData ? kv('Pembayar lintas merchant', idn(m.crossShare * 100) + '% (derajat 2+) dan ' + idn(m.sharedShare * 100) + '% (derajat ' + CF.J.sharedDegree + '+), ambang ' + idn(CF.J.sharedShare * 100) + '%') + kv('Fan-in / fan-out', m.fanIn + ' pembayar / rata-rata ' + idn(m.fanOut, 1) + ' merchant per pembayar') + kv('Tautan merchant / komponen', m.nLinks + ' / ' + m.komponen + ' (minimal ' + CF.J.minLinks + ' dan ' + CF.J.minComponent + ')') : '');
    out += sigCard('J', 'Jejaring pembayar', m.sigStatus.J, jText, jRows);
    // P
    var pText, pRows = kv('Periode acuan / terkini', P_BASE + ' / ' + P_REC);
    if (m.sigStatus.P === 'tidak_cukup_data') pText = 'Data harian dalam 14 hari terakhir kurang dari ' + CF.P.minRecentDays + ' hari, sehingga perubahan tidak dapat dinilai.';
    else {
      pText = m.pActive ? 'Volume harian 14 hari terakhir tetap tinggi dibanding ' + esc(m.kategori.toLowerCase()) + ' sejenis' + (m.ownZ !== null ? ' dan dibanding riwayat merchant sendiri' : '') + '.' : m.transient ? 'Ada ' + m.elevDays + ' hari dengan lonjakan, lalu kembali normal. Lonjakan sesaat (akhir pekan atau acara lokal) dicatat tetapi <b>tidak</b> dianggap sinyal.' : 'Volume sejalan dengan usaha sejenis dan riwayat sendiri.';
      pRows += kv('Median transaksi/hari', 'merchant ' + idn(m.recentMed, 1) + '; sebaya ' + idn(pe.med, 1) + ' (P90 ' + idn(pe.p90, 1) + '; ' + pe.n + ' merchant)') + kv('Robust Z vs sebaya', m.peerZ === null ? 'pembanding kurang dari ' + CF.P.minPeers + ' merchant' : idn(m.peerZ, 1) + ' (ambang ' + CF.P.peerZ + ')') +
        kv('Robust Z vs riwayat sendiri', m.ownZ === null ? 'riwayat ' + m.baseVals.length + ' hari (minimal ' + CF.P.minBaseDays + ')' : idn(m.ownZ, 1) + ' (ambang ' + CF.P.ownZ + ')') + kv('CUSUM atas (ilustratif)', m.cusum.alarmAt >= 0 ? 'melewati h = ' + CF.cusum.h + ' pada hari ke-' + (m.cusum.alarmAt + 1) : 'tidak melewati h = ' + CF.cusum.h) + kv('Hari tinggi / data hilang', m.elevDays + ' hari / ' + idn(m.pData.missingShare * 100) + '%');
    }
    out += sigCard('P', 'Perilaku relatif sebaya', m.sigStatus.P, pText, pRows);
    // K
    var k = []; if (m.newHot) k.push('merchant baru (' + m.umur + ' hari) dengan volume di atas ' + CF.K.newHotMult + ' kali persentil 90 sebaya'); if (Math.abs(m.tickZ) >= CF.K.tickZ) k.push('nominal rata-rata ' + rp(m.stat.meanAmt) + ' tidak lazim untuk kategori ini (Robust Z ' + idn(m.tickZ, 1) + ')'); if (m.listStrong.length) k.push(m.listStrong.length + ' pembayar cocok dengan daftar rujukan berkeyakinan sedang atau tinggi');
    var kRows = kv('Kategori / MCC', esc(m.kategori) + ' / ' + m.mcc) + kv('Umur merchant', m.umur + ' hari (ambang baru ' + CF.K.newDays + ')') + kv('Nominal rata-rata', rp(m.stat.meanAmt) + '; median kategori sejenis ' + rp(pe.avgMed)) + kv('Profil usaha', esc(m.usaha) + '; dokumen: ' + esc(m.dokumenUsaha));
    if (m.listMatches.length) kRows += kv('Daftar rujukan', m.listMatches.map(function (e) { return esc(e.payer_id) + ': ' + esc(e.sumber) + ', diperbarui ' + e.tanggal + ', dasar ' + esc(e.dasar) + ', keyakinan ' + e.keyakinan; }).join('<br>'));
    out += sigCard('K', 'Profil dan konteks', m.sigStatus.K, k.length ? k.join('; ') + '.' : 'Profil usaha sesuai pola transaksi dan tidak ada kecocokan daftar rujukan.', kRows);
    return out;
  }
  function notProof(m) {
    var a = [];
    if (m.weak.malam) a.push('Aktif pada malam hingga dini hari (' + idn(m.nightShare * 100) + '% transaksi pukul 22.00-05.00). Wajar bagi angkringan, kedai kopi, dan usaha malam. Jam malam tidak pernah menjadi alasan tunggal.');
    if (m.weak.seragam) a.push('Nominal seragam (' + idn(m.uniform * 100) + '% transaksi pada satu nilai). Wajar bagi pulsa, token, dan menu harga tetap. Tidak pernah menjadi alasan tunggal.');
    if (m.weak.sesaat) a.push('Lonjakan sesaat selama ' + m.elevDays + ' hari lalu kembali normal. Wajar saat akhir pekan atau acara lokal.');
    if (m.stat.meanAmt < 100000) a.push('Nominal rata-rata ' + rp(m.stat.meanAmt) + ' di bawah Rp100.000. Rata-rata transaksi QRIS nasional sekitar ' + rp(H.qris.rata2_transaksi_rp) + ', jadi nominal kecil adalah hal biasa.');
    a.push('Skor ' + m.score + ' adalah peringkat relatif terhadap merchant lain pada simulasi ini, bukan peluang bahwa merchant terlibat judi daring. Sinyal bukan bukti; keputusan hanya melalui pemeriksaan manusia.');
    return a;
  }
  function caseBlock(c) {
    var bs = A.buktiStatus(c);
    return '<div class="card"><div class="flex between"><h3>Pemeriksaan</h3>' + A.stPill(c.status) + '</div><dl class="kv mt8">' + kv('Kasus', '<a href="#/kasus/' + c.id + '">' + c.id + '</a>') + kv('Pemeriksa', esc(c.petugas)) + kv('Dibuka', A.fmtD(c.dibuka)) + kv('Bukti', bs.label + ' (' + bs.n + ' jenis)') + kv('Permintaan dokumen', c.dokumen.length ? c.dokumen.map(function (d) { return esc(d.minta) + ' (' + d.status.toLowerCase() + ')'; }).join('; ') : 'belum ada') + kv('Keberatan', c.keberatan ? c.keberatan.status : 'tidak ada') + kv('Perubahan keputusan', c.riwayat.length + ' catatan') + '</dl>' +
      (c.status === 'Tidak terbukti' ? '<p class="note">Setelah pemeriksaan, dugaan tidak terbukti dan status penapisan dikoreksi. Skor tinggi bukan putusan bersalah.</p>' : '') + '<a class="btn sec mt8" href="#/kasus/' + c.id + '">Buka kasus</a></div>';
  }
  function viewMerchant(id) {
    var m = T.byId(id); if (!m) return viewAntrean();
    var lv = A.effLevel(m), c = A.caseOf(m.id), u = me(), n = m.nGroups, qr = A.antrean().filter(function (x) { return x.m === m; })[0];
    var rule = lv === 'merah' ? 'Penundaan transaksi telah disetujui dua pejabat setelah pemeriksaan manusia. Merchant menerima salinan berita acara dan dapat mengajukan keberatan.' :
      c && c.status === 'Tidak terbukti' ? 'Penapisan otomatis menandai Oranye (' + n + ' dari 3 kelompok sinyal), tetapi pemeriksaan manusia menyimpulkan tidak terbukti. Status dikoreksi ke Hijau.' :
        m.level === 'oranye' ? n + ' dari 3 kelompok sinyal aktif. Syarat Oranye (minimal 2 kelompok) terpenuhi, sehingga merchant masuk antrean verifikasi manusia. Level ini bukan tuduhan.' :
          m.level === 'kuning' ? 'Hanya 1 kelompok sinyal aktif. Satu kelompok tidak cukup untuk pemeriksaan; merchant cukup dipantau.' : (m.weak.malam || m.weak.seragam || m.weak.sesaat ? 'Hanya sinyal lemah yang tercatat. Sinyal lemah tidak pernah cukup untuk memicu pemeriksaan.' : 'Tidak ada sinyal yang perlu ditindaklanjuti.');
    var act = '';
    if (isPJP()) {
      if (A.activeCase(m.id)) act = '<a class="btn" href="#/kasus/' + A.activeCase(m.id).id + '">' + icon('folder') + 'Buka kasus ' + A.activeCase(m.id).id + '</a>';
      else if (m.level === 'oranye' && !c) act = '<button class="btn" id="open">' + icon('folder') + 'Buka kasus verifikasi</button>' + (qr && !qr.today ? '<p class="small muted mt8">Merchant ini berada di luar kapasitas hari ini (mulai hari kerja ke-' + qr.hari + '). Membuka kasus lebih awal adalah keputusan pemeriksa.</p>' : '');
      else act = '<button class="btn sec" disabled>' + icon('lock') + 'Kasus hanya dapat dibuka untuk level Oranye yang belum diperiksa</button>';
    }
    var tx = T.txOf(m, 8), gaps = m.dataGaps.map(function (g) { return '<li><b>' + g.signal + '</b>: ' + esc(g.why) + '</li>'; }).join('');
    var body = '<div class="mhead"><span class="photo">' + U.storefront(m, 72) + '</span><div><h2>' + esc(m.nama) + '</h2><div class="s">' + esc(m.id) + ' &middot; ' + esc(m.kategori) + ' &middot; ' + esc(m.kota) + '</div><div class="mt8">' + level(lv, true) + (lv !== m.level ? '<div class="small muted mt8">Penapisan otomatis: ' + U.LV[m.level] + '</div>' : '') + '</div></div></div>' +
      '<div class="card"><div class="scorecard">' + gauge(m.score, lv) + '<div class="sigs"><div class="small muted" style="font-weight:600">Kelompok sinyal ' + n + ' dari 3' + (qr ? ' &middot; peringkat #' + qr.rank : '') + '</div>' + [['J', 'Jejaring'], ['P', 'Perilaku'], ['K', 'Profil dan konteks']].map(function (g) { return '<div class="sig ' + (m.sig[g[0]] ? 'on' : m.sig[g[0]] === null ? 'na' : '') + '"><i>' + g[0] + '</i>' + g[1] + (m.sig[g[0]] === null ? ' <em>tidak cukup data</em>' : '') + '</div>'; }).join('') + '</div></div><p class="note">' + rule + '</p></div>' +
      '<div class="card"><h3>Alasan sinyal</h3><p class="hint">Setiap sinyal disertai data pembanding dan periodenya. Hasil ini dari data simulasi.</p>' + signalCards(m) + '</div>' +
      (gaps ? '<div class="card"><h3>Keterbatasan data</h3><ul class="small gaps">' + gaps + '</ul></div>' : '') +
      '<div class="card"><div class="notproof" style="margin:0"><h4>Sinyal bukan bukti</h4><ul>' + notProof(m).map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div></div>' +
      (c ? caseBlock(c) : '') +
      '<div class="card"><div class="flex between"><h3>Linimasa transaksi harian</h3><span class="small muted">56 hari</span></div><p class="hint">Garis gelap = transaksi berhasil per hari; hari kosong tidak digambar sebagai nol. Pita = persentil 10-90 merchant sejenis; garis putus = median sebaya.</p>' + U.timeline(m) + '</div>' +
      '<div class="card"><h3>Jam transaksi</h3><p class="hint">Batang gelap = pukul 22.00-05.00. Jam buka tercatat ' + String(m.jamBuka[0]).padStart(2, '0') + '.00-' + String(m.jamBuka[1]).padStart(2, '0') + '.00. Pola jam tidak pernah dipakai sendirian.</p>' + U.hours(m) + '</div>' +
      '<div class="card"><h3>Transaksi 14 hari terakhir</h3><dl class="kv mt8">' + kv('Transaksi (berhasil / gagal)', idn(m.stat.ok14) + ' / ' + idn(m.stat.gagal14)) + kv('Pembayar unik', idn(m.stat.payerUnik)) + kv('Nominal rata-rata / median / P90', rp(m.stat.meanAmt) + ' / ' + rp(m.stat.medAmt) + ' / ' + rp(m.stat.p90Amt)) + kv('Nominal terbanyak', idn(m.stat.modalShare * 100) + '% transaksi') + kv('Di luar jam buka', idn(m.stat.outsideShare * 100) + '%') + '</dl>' +
      '<div class="tblwrap mt8"><table class="mini"><thead><tr><th>Waktu</th><th>Pembayar</th><th class="r">Nominal</th><th>Status</th></tr></thead><tbody>' + tx.map(function (t) { return '<tr><td class="num small">' + t.timestamp + '</td><td class="small">' + esc(t.payer_id || 'tidak tercatat') + '</td><td class="r num">' + idn(t.amount) + '</td><td class="small">' + t.transaction_status + '</td></tr>'; }).join('') + '</tbody></table></div><p class="small muted mt8">Delapan transaksi terbaru dari ledger simulasi. Ekspor lengkap di menu Data simulasi.</p></div>' +
      '<div class="card"><h3>Identitas merchant</h3><dl class="kv mt8">' + kv('NMID', '<span class="num">' + m.nmid + '</span>') + kv('MCC', m.mcc) + kv('Kriteria usaha', esc(m.usaha)) + kv('Pemilik', esc(m.pemilik)) + kv('Umur merchant', m.umur + ' hari') + kv('PJP', esc(m.pjp)) + kv('Dokumen usaha', esc(m.dokumenUsaha)) + kv('Skenario simulasi', esc(m.tag)) + '</dl>' +
      (m.catatanSimulasi ? '<p class="warnnote">' + esc(m.catatanSimulasi) + '</p>' : '') + '</div>' +
      (m.nLinks || m.jData ? '<a class="btn sec" href="#/jejaring/' + m.id + '" style="margin-bottom:10px">' + icon('net') + 'Lihat jejaring pembayar</a>' : '') + act;
    shell('Profil merchant', m.nmid, body, { back: true, nav: 'antrean' });
    var ob = A.app.querySelector('#open'); if (ob) ob.onclick = function () { var k = A.openCase(m, u); toast('Kasus ' + k.id + ' dibuka'); location.hash = '#/kasus/' + k.id; };
  }

  // ---------- jejaring ----------
  function viewJejaring(id) {
    var q = A.antrean(), m = T.byId(id) || (q.length ? q[0].m : T.byId('M081')), g = U.network(m, T);
    var links = Object.keys(m.links).map(function (k) { return { m: T.byId(k), n: m.links[k] }; }).sort(function (a, b) { return b.n - a.n; });
    var body = '<div class="card"><h3>' + esc(m.nama) + '</h3><p class="hint">Kotak = merchant (garis tepi = level penapisan). Titik = pembayar. Titik jingga membayar di 3 merchant atau lebih; titik merah tercatat di daftar rujukan. Data SIMULASI.</p>' + (m.jData ? g.svg : '<div class="note">Data pembayar merchant ini tidak memadai (cakupan ID ' + idn(m.stat.coverage * 100) + '%), sehingga graf tidak dapat disusun dengan andal. Status J = tidak cukup data.</div>') +
      '<div class="legend"><span><i style="background:#0B2A5B"></i>Merchant terpilih</span><span><i style="background:#F07A1A"></i>Pembayar bersama</span><span><i style="background:#E0413A"></i>Daftar rujukan</span><span><i style="background:#94A3B8"></i>Pembayar biasa</span></div></div>' +
      '<div class="grid2"><div class="stat"><div class="lab">Merchant dalam klaster</div><div class="val num">' + g.nMerchant + '</div></div><div class="stat"><div class="lab">Pembayar bersama</div><div class="val num">' + g.nShared + '</div></div>' +
      '<div class="stat"><div class="lab">Komponen jaringan</div><div class="val num">' + m.komponen + '</div></div><div class="stat"><div class="lab">Fan-out rata-rata</div><div class="val num">' + idn(m.fanOut, 1) + '</div></div></div>' +
      (links.length ? '<div class="card mt12"><h3>Merchant terhubung</h3><table class="mini mt8"><thead><tr><th>Merchant</th><th class="r">Pembayar bersama</th></tr></thead><tbody>' + links.map(function (l) { return '<tr data-href="#/merchant/' + l.m.id + '"><td>' + esc(l.m.nama) + '<br><span class="small muted">' + l.m.id + '</span></td><td class="r num">' + l.n + '</td></tr>'; }).join('') + '</tbody></table></div>' : '') +
      '<div class="card mt12"><h3>Cara membaca</h3><p class="small">Dua merchant dianggap terhubung bila berbagi sedikitnya ' + CF.J.linkPayers + ' pembayar. Komunitas yang wajar (arisan, kampus) juga dapat berbagi pembayar, sehingga jejaring saja menghasilkan Kuning; Oranye menuntut satu kelompok sinyal lain. Bobot jejaring 0,35 adalah rancangan awal.</p></div>';
    shell('Jejaring pembayar', 'Analisis graf merchant dan pembayar', body, { back: true, nav: 'antrean' });
    A.app.querySelectorAll('[data-m]').forEach(function (n) { n.addEventListener('click', function () { location.hash = '#/merchant/' + n.dataset.m; }); });
    A.app.querySelectorAll('tr[data-href]').forEach(function (r) { r.onclick = function () { location.hash = r.dataset.href; }; });
  }

  // ---------- data simulasi + CSV ----------
  function csv(rows) { return rows.map(function (r) { return r.map(function (v) { v = v === null || v === undefined ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\n'); }
  function dl(name, text) { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
  function exportMerchants() {
    var r = [['merchant_id', 'nama', 'kategori', 'mcc', 'kota', 'pjp', 'umur_hari', 'skenario', 'kelompok', 'status_J', 'status_P', 'status_K', 'skor_J_jejaring', 'skor_P_sebaya', 'skor_P_perubahan', 'skor_K_profil', 'skor_K_daftar', 'skor_prioritas', 'level_penapisan', 'status_pemeriksaan', 'trx_berhasil_14h', 'trx_gagal_14h', 'pembayar_unik_14h', 'rata_nominal', 'median_nominal', 'jam_buka', 'label']];
    T.merchants.forEach(function (m) { var c = A.caseOf(m.id); r.push([m.id, m.nama, m.kategori, m.mcc, m.kota, m.pjp, m.umur, m.tag, m.kelompok, m.sigStatus.J, m.sigStatus.P, m.sigStatus.K, m.parts.jaringan.toFixed(3), m.parts.sebaya.toFixed(3), m.parts.perubahan.toFixed(3), m.parts.profil.toFixed(3), m.parts.daftar.toFixed(3), m.score, m.level, c ? c.status : 'belum diperiksa', m.stat.ok14, m.stat.gagal14, m.stat.payerUnik, Math.round(m.stat.meanAmt), Math.round(m.stat.medAmt), m.jamBuka.join('-'), 'SIMULASI']); });
    dl('tapis_merchant_simulasi.csv', csv(r));
  }
  function exportTx() {
    var r = [['transaction_id', 'merchant_id', 'payer_id', 'timestamp', 'amount', 'transaction_status', 'label']];
    for (var i = 0; i < T.nTx(); i++) { var t = T.txRow(i); r.push([t.transaction_id, t.merchant_id, t.payer_id, t.timestamp, t.amount, t.transaction_status, t.label]); }
    dl('tapis_transaksi_simulasi.csv', csv(r));
  }
  function exportHarian() {
    var r = [['merchant_id', 'tanggal', 'trx_berhasil', 'trx_gagal', 'label']];
    T.merchants.forEach(function (m) { for (var d = 0; d < T.DAYS; d++) r.push([m.id, new Date(T.START.getTime() + d * 864e5).toISOString().slice(0, 10), m.ok[d], m.gagal[d], 'SIMULASI']); });
    dl('tapis_harian_simulasi.csv', csv(r));
  }
  function exportKasus() {
    var r = [['case_id', 'merchant_id', 'status', 'dibuka', 'pemeriksa', 'status_bukti', 'dokumen_diminta', 'keberatan', 'hasil', 'label']];
    S.cases.forEach(function (c) { r.push([c.id, c.mid, c.status, c.dibuka, c.petugas, A.buktiStatus(c).label, c.dokumen.map(function (d) { return d.minta + ' [' + d.status + ']'; }).join('; '), c.keberatan ? c.keberatan.status : '', c.hasil, 'SIMULASI']); });
    dl('tapis_kasus_simulasi.csv', csv(r));
  }
  var dFilter = '';
  function viewData() {
    var tags = {}; T.merchants.forEach(function (m) { tags[m.kelompok] = (tags[m.kelompok] || 0) + 1; });
    var list = T.merchants.filter(function (m) { return !dFilter || (m.nama + ' ' + m.id + ' ' + m.tag).toLowerCase().indexOf(dFilter) >= 0; });
    var body = '<div class="card"><div class="flex between"><h3>Skenario simulasi terpadu</h3>' + badge('demo') + '</div><p class="small">' + T.merchants.length + ' merchant (' + tags.normal + ' normal, ' + tags.anomali + ' anomali, ' + tags.kuat + ' terindikasi kuat), ' + T.DAYS + ' hari (' + dstr(0) + ' - ' + dstr(T.DAYS - 1) + '), ' + idn(T.nTx()) + ' transaksi 14 hari terakhir pada ledger, ' + S.cases.length + ' kasus. Dibangkitkan dengan bibit acak tetap sehingga hasilnya dapat diulang. Bukan data nyata.</p>' +
      '<div class="btnrow mt8"><button class="btn sec" data-x="m">' + icon('file') + 'Merchant</button><button class="btn sec" data-x="t">' + icon('file') + 'Transaksi</button></div><div class="btnrow mt8"><button class="btn sec" data-x="h">' + icon('file') + 'Harian</button><button class="btn sec" data-x="k">' + icon('file') + 'Kasus</button></div></div>' +
      '<div class="search">' + icon('search') + '<input id="dq" placeholder="Cari nama, ID, atau skenario" value="' + esc(dFilter) + '"></div>' +
      '<div class="card"><div class="tblwrap"><table class="mini"><thead><tr><th>ID</th><th>Merchant</th><th>Skenario</th><th class="r">Skor</th><th>Level</th></tr></thead><tbody>' + list.map(function (m) { return '<tr data-href="#/merchant/' + m.id + '"><td class="num small">' + m.id + '</td><td>' + esc(m.nama) + '</td><td class="small">' + esc(m.tag) + '</td><td class="r num">' + m.score + '</td><td>' + level(m.level) + '</td></tr>'; }).join('') + '</tbody></table></div></div>';
    shell('Data simulasi', 'Semua data berlabel SIMULASI', body, { back: true, nav: 'menu' });
    var app = A.app;
    app.querySelectorAll('[data-x]').forEach(function (b) { b.onclick = function () { ({ m: exportMerchants, t: exportTx, h: exportHarian, k: exportKasus })[b.dataset.x](); toast('Berkas CSV diunduh'); }; });
    app.querySelectorAll('tr[data-href]').forEach(function (r) { r.onclick = function () { location.hash = r.dataset.href; }; });
    var qi = app.querySelector('#dq'); qi.oninput = function () { dFilter = qi.value.toLowerCase(); var pos = qi.selectionStart; A.skipAnim = true; viewData(); var n = app.querySelector('#dq'); n.focus(); n.setSelectionRange(pos, pos); };
  }
  A.viewAntrean = viewAntrean; A.viewMerchant = viewMerchant; A.viewJejaring = viewJejaring; A.viewData = viewData;
})();
