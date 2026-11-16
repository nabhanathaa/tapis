/* TAPIS: Pusat Bukti Nasional (M1 Deposit, M2 Deret Waktu LTKM, M3 Bayes, Peta & Klaster 514 Wilayah) dan Simulator Risiko/Level. */
(function () {
  'use strict';
  var A = window.A, T = A.T, U = A.U, H = A.H, R = A.R, S = A.S, icon = U.icon, idn = U.idn, rp = U.rp, esc = U.esc, badge = U.badge, level = U.level;
  var shell = A.shell, cu = A.cu, BULAN = A.BULAN;
  var bTab = 'ringkas';
  function bln(s) { return A.bln(s); }

  function viewBukti(tab) {
    bTab = tab || bTab;
    if (bTab === 'peta') bTab = 'klaster';
    var tabs = [
      ['ringkas', 'Ringkasan Eksekutif'],
      ['m1', 'M1 · Dekomposisi Deposit QRIS'],
      ['m2', 'M2 · Deret Waktu LTKM'],
      ['m3', 'M3 · Kurva Bayes & Dampak'],
      ['klaster', 'Spasial · Peta & Klaster 514 Wilayah']
    ].map(function (t) {
      return '<button type="button" class="' + (bTab === t[0] ? 'on' : '') + '" data-t="' + t[0] + '">' + t[1] + '</button>';
    }).join('');
    var body = '<div class="tabs">' + tabs + '</div>' + ({ ringkas: bRingkas, m1: bM1, m2: bM2, m3: bM3, klaster: bKlaster }[bTab] || bRingkas)();
    shell(bTab === 'klaster' ? 'Peta Interaktif & Klaster Struktur Ekonomi' : 'Pusat Bukti Empiris Nasional', 'Sintesis data resmi PPATK, Bank Indonesia, dan Badan Pusat Statistik (BPS)', body, { nav: bTab === 'klaster' ? 'bukti-klaster' : 'bukti-ringkas' });
    A.app.querySelectorAll('[data-t]').forEach(function (b) { b.onclick = function () { location.hash = '#/bukti/' + b.dataset.t; }; });
    if (bTab === 'klaster') bindKlasterEvents();
  }

  function bRingkas() {
    var d = H.deposit, m = H.m2, m3 = H.m3;
    return '<div class="grid4 mb12">' +
        A.stat('Populasi Merchant QRIS (96,68% UMKM)', cu(H.qris.merchant_juta, 2, '', ' Juta'), 'resmi', 'Bank Indonesia, Juni 2026 (65,77 juta pengguna)') +
        A.stat('Volume Transaksi QRIS (Sem I 2026)', cu(H.qris.volume_miliar, 2, '', ' Miliar'), 'resmi', 'Nominal Rp1,12 kuadriliun · Rata-rata Rp89.243') +
        A.stat('Pangsa Frekuensi Deposit Judi via QRIS', cu(87.66, 2, '', '%'), 'resmi', 'PPATK Sem I 2026 (198,77 juta dari 226,76 juta trx)') +
        A.stat('Rata-rata Nominal Deposit via QRIS', cu(Math.round(d.rata2_qris_rp), 0, 'Rp'), 'hitungan', 'Di bawah rata-rata belanja QRIS (Rp89.243) & MDR 0%') +
      '</div>' +
      '<div class="exec-split">' +
        '<div class="exec-main">' +
          '<div class="card">' +
            '<div class="card-head-row"><div><div class="card-tag">SINTESIS EMPIRIS NOTEBOOK RISET</div><h3>Tiga Temuan Kunci Landasan Desain TAPIS</h3></div>' + badge('hitungan') + '</div>' +
            '<div class="reason"><span class="ic on">M1</span><div><b>Pergeseran Pola: Frekuensi Melonjak (+139,95%), Nominal Mengecil (-47,49%)</b><p>Melalui dekomposisi logaritmik Kitagawa (1955), kenaikan nilai deposit Sem I 2025 ke Sem I 2026 (+Rp4,55 triliun) didorong oleh efek ekspansi frekuensi (<b>+Rp18,68 triliun</b>) yang diredam penurunan rata-rata nominal (<b>-Rp14,13 triliun</b>). Rata-rata deposit via QRIS (<b>' + rp(d.rata2_qris_rp) + '</b>) lebih rendah daripada rata-rata transaksi QRIS nasional (<b>' + rp(H.qris.rata2_transaksi_rp) + '</b>), sehingga <b>nominal kecil tidak boleh dijadikan pembeda tunggal</b>.</p><a class="small font-bold" href="#/bukti/m1">Buka Analisis Dekomposisi M1 &rarr;</a></div></div>' +
            '<div class="reason"><span class="ic on">M2</span><div><b>Tren Laporan Indikasi Perjudian Menurun Signifikan (Jun 2024 – Sep 2026)</b><p>Uji non-parametrik Mann-Kendall dengan koreksi ties menghasilkan <b>Z = ' + idn(m.mk_Z_ties, 3) + ' (p = ' + idn(m.mk_p_ties, 4) + ')</b>, dan setelah <i>Trend-Free Pre-Whitening</i> (TFPW) menghasilkan <b>Z = ' + idn(m.mk_tfpw_Z, 3) + ' (p = ' + idn(m.mk_tfpw_p, 4) + ')</b> dengan kemiringan Sen <b>' + idn(m.sen_persen_per_bulan, 2) + '% per bulan</b>. Evaluasi <i>structural break</i> BIC menandai ' + m.patah_bic.map(bln).join(' dan ') + ' sebagai segmentasi eksploratif.</p><a class="small font-bold" href="#/bukti/m2">Buka Ekonometrika Deret Waktu M2 &rarr;</a></div></div>' +
            '<div class="reason"><span class="ic on">M3</span><div><b>Paradoks Base-Rate Bayes: Mengapa Ambang Tunggal Membahayakan UMKM</b><p>Pada populasi 44,86 juta merchant dan prevalensi proksi <b>' + idn(m3.prevalensi_proxy_persen, 4) + '%</b> (asumsi sensitivitas 80%), mencapai ketepatan (PPV) 50% menuntut tingkat kesalahan positif palsu (FPR) maksimum <b>' + idn(m3.fpr_maks_ppv50_skenario_proxy_persen, 4) + '%</b>. Itulah sebabnya TAPIS mewajibkan <b>konvergensi minimal 2 dari 3 pilar sinyal (J, P, K)</b>, pembanding berlapis 514 wilayah, dan verifikasi manusia sebelum pembatasan.</p><a class="small font-bold" href="#/bukti/m3">Buka Simulasi Teorema Bayes M3 &rarr;</a></div></div>' +
          '</div>' +
        '</div>' +
        '<div class="exec-side">' +
          '<div class="card">' +
            '<div class="card-head-row"><div><div class="card-tag">KONTEKS SPASIAL 514 WILAYAH</div><h3>Segmentasi Struktur Ekonomi PDRB</h3></div><span class="badge b-resmi">K=4 Ward CLR</span></div>' +
            '<p class="hint">Mengelompokkan 514 kabupaten/kota berdasarkan komposisi 17 lapangan usaha PDRB BPS (Hopkins Statistic = <b>0,8087</b>) sebagai Lapis 1 pembanding kontekstual.</p>' +
            '<div class="mt12">' +
              R.klaster.profil.map(function (p) {
                return '<div class="sb-row">' +
                  '<div class="sb-head"><span class="sb-label"><i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:' + p.warna + ';margin-right:6px"></i>Klaster ' + p.id + ': ' + esc(p.nama) + '</span><span class="sb-val num">' + p.n + ' wilayah (' + idn(p.pct, 2) + '%)</span></div>' +
                  '<div class="sb-track"><div class="sb-fill" style="width:' + p.pct + '%;background:' + p.warna + '"></div></div>' +
                '</div>';
              }).join('') +
            '</div>' +
            '<a class="btn sec mt12" href="#/bukti/klaster">' + icon('map') + 'Buka Peta Interaktif 514 Wilayah</a>' +
          '</div>' +
          '<div class="card">' +
            '<div class="card-tag">INTEGRITAS METODOLOGIS</div>' +
            '<h3>Pemisahan Data Makro vs Operasional Mikro</h3>' +
            '<p class="small muted" style="line-height:1.55">Seluruh indikator di Pusat Bukti berasal dari data agregat nasional. Statistik LTKM nasional PPATK <b>bukan ukuran kapasitas pemeriksa PJP</b> dan tidak dicampuradukkan dengan parameter kuota harian analis pada menu Antrean.</p>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function bM1() {
    var dep = R.deposit.filter(function (r) { return r.kanal === 'Semua kanal'; });
    var yr = ['2023', '2024', '2025', 'Sem I 2026'].map(function (p) {
      var r = dep.filter(function (x) { return x.periode === p; })[0];
      return { l: p, v: r.nilai_rp / 1e12, t: 'Rp' + idn(r.nilai_rp / 1e12, 2) + ' T', c: p === 'Sem I 2026' ? '#1D5BD8' : '#94A3B8' };
    });
    var d = H.deposit, mx = Math.max(Math.abs(d.efek_frek_T), Math.abs(d.efek_rata2_T));
    function hb(lab, v, col, desc) {
      return '<div class="kitagawa-row">' +
        '<div class="kr-meta"><b>' + lab + '</b><span>' + desc + '</span></div>' +
        '<div class="kr-bar-wrap">' +
          '<div class="kr-zero"></div>' +
          '<div class="hbar' + (v < 0 ? ' neg' : '') + '" style="position:absolute;top:4px;height:20px;border-radius:5px;background:' + col + ';' + (v >= 0 ? 'left:50%' : 'right:50%') + ';width:' + (Math.abs(v) / mx * 46) + '%"></div>' +
        '</div>' +
        '<div class="kr-val num" style="color:' + col + '">' + (v < 0 ? '-' : '+') + 'Rp' + idn(Math.abs(v), 2) + ' T</div>' +
      '</div>';
    }
    var cmp = [
      { l: 'Rata-rata Deposit QRIS', v: d.rata2_qris_rp, c: '#DC2626', t: rp(d.rata2_qris_rp) },
      { l: 'Rata-rata Transaksi QRIS', v: H.qris.rata2_transaksi_rp, c: '#1D5BD8', t: rp(H.qris.rata2_transaksi_rp) },
      { l: 'Batas MDR 0% UMKM', v: 100000, c: '#0F9D6E', t: 'Rp100.000' },
      { l: 'Deposit Bank / E-Wallet', v: 346360, c: '#64748B', t: 'Rp346.360' }
    ];
    return '<div class="grid4 mb12">' +
        A.stat('Nilai Deposit Sem I 2026 (Semua Kanal)', 'Rp' + idn(d.nilai_sem1_2026_T, 2) + ' T', 'resmi', 'Naik dari Rp17,50 T pada Sem I 2025 (+26,0%)') +
        A.stat('Frekuensi Deposit Sem I 2026', idn(d.frek_sem1_2026_juta, 2) + ' Juta', 'resmi', 'Naik +139,95% dari 94,50 juta transaksi (Sem I 2025)') +
        A.stat('Pangsa Nilai &amp; Frekuensi Kanal QRIS', idn(d.porsi_nilai_kanal_qris_persen, 2) + '% / ' + idn(d.porsi_frek_kanal_qris_persen, 2) + '%', 'resmi', 'Rp12,36 triliun &amp; 198,77 juta transaksi via QRIS') +
        A.stat('Porsi terhadap Volume &amp; Nominal QRIS Nasional', idn(d.porsi_volume_qris_nasional_persen, 2) + '% / ' + idn(d.porsi_nominal_qris_nasional_persen, 2) + '%', 'hitungan', 'Sebagian besar ekosistem QRIS (98%+) adalah transaksi sah') +
      '</div>' +
      '<div class="exec-split">' +
        '<div class="exec-main">' +
          '<div class="card">' +
            '<div class="card-head-row"><div><div class="card-tag">DEKOMPOSISI LOGARITMIK KITAGAWA (1955)</div><h3>Mengurai Perubahan Nilai Deposit (Sem I 2025 vs Sem I 2026)</h3></div>' + badge('hitungan') + '</div>' +
            '<p class="hint">Total nilai deposit berubah dari Rp17,50 triliun menjadi Rp22,05 triliun (+Rp4,55 triliun; log perubahan total = <code>+' + idn(d.log_total, 4) + '</code>). Dekomposisi memisahkan kontribusi perubahan frekuensi dan rata-rata nominal:</p>' +
            '<div class="mt12">' +
              hb('Efek Frekuensi (Volume Transaksi)', d.efek_frek_T, '#1D5BD8', 'Log rasio frekuensi = +' + idn(d.log_frek, 4) + ' (94,50 jt &rarr; 226,76 jt)') +
              hb('Efek Rata-rata Nominal per Transaksi', d.efek_rata2_T, '#DC2626', 'Log rasio rata-rata = ' + idn(d.log_rata2, 4) + ' (Rp185.185 &rarr; Rp97.244)') +
              hb('Perubahan Bersih Nilai Deposit', d.efek_frek_T + d.efek_rata2_T, '#091E42', 'Selisih absolut Sem I 2025 ke Sem I 2026') +
            '</div>' +
            '<p class="note mt12"><b>Implikasi Arsitektur Penapisan:</b> Pelaku memecah deposit menjadi transaksi bernominal kecil namun sangat sering dan tersebar. Karena itu, aturan konvensional berbasis ambang nominal besar gagal mendeteksi, sementara aturan berbasis nominal kecil secara naif justru akan menjerat UMKM mikro.</p>' +
            A.src('PPATK, Laporan Semester I 2026 & Siaran Pers B/04/HM.05/3.1/VIII/2026; Metode Dekomposisi Simetris Kitagawa (1955).') +
          '</div>' +
          '<div class="card">' +
            '<div class="card-head-row"><div><div class="card-tag">KOMPARASI RATA-RATA TIKET TRANSAKSI</div><h3>Mengapa Nominal Kecil Tidak Boleh Menjadi Indikator Tunggal</h3></div>' + badge('hitungan') + '</div>' +
            U.bars(cmp, { max: 390000, h: 210 }) +
            '<p class="note mt12">Rata-rata satu deposit judi daring melalui QRIS (<b>' + rp(d.rata2_qris_rp) + '</b>) berada di bawah rata-rata belanja QRIS nasional (<b>' + rp(H.qris.rata2_transaksi_rp) + '</b>) serta di bawah batas bebas biaya MDR 0% bagi Usaha Mikro (Rp100.000). Di TAPIS, nominal transaksi dievaluasi secara relatif terhadap kelompok sebaya sejenis (Pilar K &amp; P) dan wajib dikombinasikan dengan sinyal jejaring pembayar (Pilar J).</p>' +
          '</div>' +
        '</div>' +
        '<div class="exec-side">' +
          '<div class="card">' +
            '<div class="card-head-row"><div><div class="card-tag">TREN HISTORIS TAHUNAN</div><h3>Nilai Deposit Judi Daring (Semua Kanal)</h3></div>' + badge('resmi') + '</div>' +
            U.bars(yr, { h: 200 }) +
            A.src('PPATK, Laporan Semester I 2026, hal. 29.') +
          '</div>' +
          '<div class="card">' +
            '<div class="card-head-row"><div><div class="card-tag">TABEL RINCIAN DATA RESMI</div><h3>Komposisi Kanal Deposit Sem I 2026</h3></div>' + badge('resmi') + '</div>' +
            '<div class="tblwrap mt8"><table class="exec-table"><thead><tr><th>Periode &amp; Kanal</th><th class="r">Nilai (Rp T)</th><th class="r">Frekuensi (Jt)</th><th class="r">Rata-rata</th></tr></thead><tbody>' +
              R.deposit.filter(function (x) { return x.frekuensi_transaksi; }).map(function (r) {
                return '<tr><td><b>' + esc(r.periode) + '</b><small class="block muted">' + esc(r.kanal) + '</small></td><td class="r num">' + idn(r.nilai_rp / 1e12, 2) + '</td><td class="r num">' + idn(r.frekuensi_transaksi / 1e6, 2) + '</td><td class="r num font-bold">' + rp(r.rata2_per_transaksi_rp) + '</td></tr>';
              }).join('') +
            '</tbody></table></div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function bM2() {
    var m = H.m2, s = m.deret, W = 560, Hh = 225, L = 46, Rr = 14, Tt = 18, B = 28, n = s.length, mx = 23000;
    var X = function (i) { return L + (W - L - Rr) * (i + 0.5) / n; }, Y = function (v) { return Tt + (Hh - Tt - B) * (1 - v / mx); }, bw = (W - L - Rr) / n;
    var startIdx = s.findIndex(function (r) { return r.bulan === '2024-07'; });
    var segs = m.segmen, cuts = [startIdx].concat(m.segmen_awal.map(function (b) { return s.findIndex(function (r) { return r.bulan === b; }); })).concat([n]);
    var grid = U.axisY(0, mx, 4).map(function (v) { return '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + Y(v).toFixed(1) + '" y2="' + Y(v).toFixed(1) + '" stroke="#E2E8F0" stroke-dasharray="2 2"/><text x="' + (L - 6) + '" y="' + (Y(v) + 3.5).toFixed(1) + '" font-size="9.5" text-anchor="end" fill="#64748B" font-family="JetBrains Mono,monospace">' + idn(v) + '</text>'; }).join('');
    var bars = s.map(function (r, i) { return '<rect class="gb" x="' + (X(i) - bw * 0.34).toFixed(1) + '" y="' + Y(r.perjudian).toFixed(1) + '" width="' + (bw * 0.68).toFixed(1) + '" height="' + (Hh - B - Y(r.perjudian)).toFixed(1) + '" fill="' + (i < startIdx ? '#CBD5E1' : '#93C5FD') + '" rx="2.5"><title>' + r.bulan + ': ' + idn(r.perjudian) + ' laporan</title></rect>'; }).join('');
    var seg = segs.map(function (g, j) { var a = X(cuts[j]) - bw / 2, b = X(cuts[j + 1] - 1) + bw / 2; return '<rect x="' + a.toFixed(1) + '" y="' + Y(g.CI95_atas_HAC).toFixed(1) + '" width="' + (b - a).toFixed(1) + '" height="' + (Y(g.CI95_bawah_HAC) - Y(g.CI95_atas_HAC)).toFixed(1) + '" fill="#1D5BD8" opacity=".16"/><line x1="' + a.toFixed(1) + '" x2="' + b.toFixed(1) + '" y1="' + Y(g.rata2_geometrik).toFixed(1) + '" y2="' + Y(g.rata2_geometrik).toFixed(1) + '" stroke="#091E42" stroke-width="2.4"/><text x="' + ((a + b) / 2).toFixed(1) + '" y="' + (Y(g.CI95_atas_HAC) - 5).toFixed(1) + '" font-size="10" font-weight="800" text-anchor="middle" fill="#091E42" font-family="JetBrains Mono,monospace">Mean Geo: ' + idn(g.rata2_geometrik, 0) + '</text>'; }).join('');
    var br = cuts.slice(1, -1).map(function (c) { return '<line x1="' + (X(c) - bw / 2).toFixed(1) + '" x2="' + (X(c) - bw / 2).toFixed(1) + '" y1="' + Tt + '" y2="' + (Hh - B) + '" stroke="#DC2626" stroke-width="1.6" stroke-dasharray="4 3"/>'; }).join('');
    var xl = s.map(function (r, i) { return (i % 3 === 0 || i === n - 1) ? '<text x="' + X(i).toFixed(1) + '" y="' + (Hh - 8) + '" font-size="9.5" text-anchor="middle" fill="#64748B" font-family="JetBrains Mono,monospace">' + r.bulan + '</text>' : ''; }).join('');
    var chart = '<svg class="chart" viewBox="0 0 ' + W + ' ' + Hh + '">' + grid + bars + seg + br + xl + '</svg>';

    var cus = m.cusum_2026, cmn = -7, cW = 500, cH = 185, hLim = -4;
    var cX = function (i) { return 38 + (cW - 56) * i / (cus.length - 1); }, cY = function (v) { return 14 + (cH - 40) * (v / cmn); };
    var cline = cus.map(function (r, i) { return (i ? 'L' : 'M') + cX(i).toFixed(1) + ',' + cY(r.CUSUM_bawah).toFixed(1); }).join('');
    var cdots = cus.map(function (r, i) { return '<circle cx="' + cX(i).toFixed(1) + '" cy="' + cY(r.CUSUM_bawah).toFixed(1) + '" r="4" fill="' + (r.status ? '#DC2626' : '#1D5BD8') + '" stroke="#fff" stroke-width="1.5"/><text x="' + cX(i).toFixed(1) + '" y="' + (cH - 8) + '" font-size="9.5" text-anchor="middle" fill="#64748B">' + BULAN[+r.bulan.slice(5) - 1].slice(0, 3) + ' 26</text>'; }).join('');
    var cyt = [0, -2, -4, -6].map(function (v) { return '<line x1="38" x2="' + (cW - 18) + '" y1="' + cY(v).toFixed(1) + '" y2="' + cY(v).toFixed(1) + '" stroke="#EEF2F7"/><text x="30" y="' + (cY(v) + 3.5).toFixed(1) + '" font-size="9.5" text-anchor="end" fill="#94A3B8" font-family="JetBrains Mono,monospace">' + v + '</text>'; }).join('');
    var cchart = '<svg class="chart" viewBox="0 0 ' + cW + ' ' + cH + '">' + cyt + '<line x1="38" x2="' + (cW - 18) + '" y1="' + cY(hLim).toFixed(1) + '" y2="' + cY(hLim).toFixed(1) + '" stroke="#DC2626" stroke-width="1.5" stroke-dasharray="4 3"/><text x="' + (cW - 20) + '" y="' + (cY(hLim) - 5).toFixed(1) + '" font-size="9.5" font-weight="700" text-anchor="end" fill="#DC2626">Ambang Ilustratif h = -4,0</text><path class="ln" pathLength="1" d="' + cline + '" fill="none" stroke="#091E42" stroke-width="2.4"/>' + cdots + '</svg>';

    return '<div class="grid4 mb12">' +
        A.stat('Uji Mann-Kendall TFPW (Utama)', 'Z = ' + idn(m.mk_tfpw_Z, 2), 'hitungan', 'p = ' + idn(m.mk_tfpw_p, 4) + ' (Tren menurun signifikan)') +
        A.stat('Kemiringan Theil-Sen (Laju Bulanan)', idn(m.sen_persen_per_bulan, 2) + '% / bln', 'hitungan', 'Autokorelasi lag-1 rho = ' + idn(m.rho_tfpw, 3)) +
        A.stat('Statistik OLS-CUSUM &amp; Andrews sup-F', idn(m.cusum_ols_stat, 2) + ' / ' + idn(m.supF, 2), 'hitungan', 'p OLS-CUSUM = ' + idn(m.cusum_ols_p, 4) + ' · sup-F Des 2024') +
        A.stat('Kumulatif LTKM Perjudian (Jan–Sep)', idn(m.jan_sep_2026) + ' laporan', 'resmi', 'Turun -28,19% dari Jan–Sep 2025 (' + idn(m.jan_sep_2025) + ')') +
      '</div>' +
      '<div class="exec-split">' +
        '<div class="exec-main">' +
          '<div class="card">' +
            '<div class="card-head-row"><div><div class="card-tag">DERET WAKTU BULANAN PPATK (N = 27 BULAN)</div><h3>Tren Bulanan LTKM Indikasi Perjudian &amp; Segmentasi BIC</h3></div>' + badge('resmi') + '</div>' +
            '<p class="hint">Batang menunjukkan jumlah laporan per bulan. Garis horizontal gelap adalah rata-rata geometrik per rezim waktu disertai pita CI 95% (Newey-West HAC). Garis vertikal merah putus-putus adalah titik patah eksploratif menurut Bayesian Information Criterion (BIC).</p>' +
            chart +
            A.src('PPATK, Buletin Statistik APUPPT Edisi Juni 2025, Oktober 2025, dan September 2026, Tabel 5; diolah.') +
          '</div>' +
          '<div class="card">' +
            '<div class="card-head-row"><div><div class="card-tag">DETEKSI PERGESERAN REZIM</div><h3>Lintasan CUSUM Bawah Tahun 2026 terhadap Acuan 2025</h3></div>' + badge('hitungan') + '</div>' +
            '<p class="hint">Melewati ambang ilustratif pertama kali pada <b>' + bln(m.cusum_alarm_pertama) + '</b>. Parameter <code>k = 0,5</code> dan <code>h = 4</code> disajikan sebagai ilustrasi pemantauan beruntun (Page, 1954).</p>' +
            cchart +
          '</div>' +
        '</div>' +
        '<div class="exec-side">' +
          '<div class="card">' +
            '<div class="card-head-row"><div><div class="card-tag">DIAGNOSTIK EKONOMETRIKA</div><h3>Ringkasan Uji Tren &amp; Patahan Struktural</h3></div>' + badge('hitungan') + '</div>' +
            '<div class="tblwrap mt8"><table class="exec-table"><tbody>' +
              '<tr><td>Mann-Kendall (Koreksi Ties)</td><td class="r num">Z = ' + idn(m.mk_Z_ties, 3) + ' (p = ' + idn(m.mk_p_ties, 4) + ')</td></tr>' +
              '<tr style="background:#EFF6FF"><td><b>Mann-Kendall TFPW</b></td><td class="r num"><b>Z = ' + idn(m.mk_tfpw_Z, 3) + ' (p = ' + idn(m.mk_tfpw_p, 4) + ')</b></td></tr>' +
              '<tr><td>Estimator Kemiringan Sen</td><td class="r num">' + idn(m.sen_persen_per_bulan, 2) + '% per bulan</td></tr>' +
              '<tr><td>Uji Stabilitas OLS-CUSUM</td><td class="r num">Stat = ' + idn(m.cusum_ols_stat, 3) + ' (p = ' + idn(m.cusum_ols_p, 4) + ')</td></tr>' +
              '<tr><td>Uji Andrews sup-F (' + bln(m.supF_tanggal) + ')</td><td class="r num">F = ' + idn(m.supF, 2) + ' (p IID = ' + idn(m.supF_p_iid, 4) + ')</td></tr>' +
              '<tr><td>Bootstrap AR(1) sup-F (rho = ' + idn(m.rho_ar1_null, 2) + ')</td><td class="r num">p = ' + idn(m.supF_p_ar1_null, 4) + ' (Tidak signifikan)</td></tr>' +
              '<tr><td>Titik Patah Eksploratif BIC</td><td class="r num">' + m.patah_bic.map(bln).join(' &amp; ') + '</td></tr>' +
            '</tbody></table></div>' +
            '<p class="warnnote mt12"><b>Catatan kehati-hatian:</b> Patahan tunggal Desember 2024 signifikan pada asumsi IID namun tidak bertahan di bawah <i>wild/parametric bootstrap</i> AR(1) (p = ' + idn(m.supF_p_ar1_null, 2) + '). Karena itu, segmentasi 3 rezim diposisikan sebagai deskripsi eksploratif, bukan klaim kausalitas kebijakan tunggal.</p>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function ppvCurve(prev, sens, mark) {
    var W = 520, Hh = 215, L = 42, Rr = 16, Tt = 14, B = 32, lo = Math.log10(0.001), hi = Math.log10(2);
    var X = function (f) { return L + (W - L - Rr) * (Math.log10(f) - lo) / (hi - lo); }, Y = function (p) { return Tt + (Hh - Tt - B) * (1 - p / 100); };
    function path(pv, col, w, cls) {
      var d = '';
      for (var k = 0; k <= 90; k++) {
        var f = Math.pow(10, lo + (hi - lo) * k / 90);
        d += (k ? 'L' : 'M') + X(f).toFixed(1) + ',' + Y(100 * T.ppv(sens, pv / 100, f / 100)).toFixed(1);
      }
      return '<path ' + (cls ? 'class="ln" pathLength="1" ' : '') + 'd="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + w + '"/>';
    }
    var g = [0, 25, 50, 75, 100].map(function (p) {
      return '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + Y(p).toFixed(1) + '" y2="' + Y(p).toFixed(1) + '" stroke="#E2E8F0" stroke-dasharray="2 2"/>' +
        '<text x="' + (L - 6) + '" y="' + (Y(p) + 3.5).toFixed(1) + '" font-size="9.5" text-anchor="end" fill="#64748B" font-family="JetBrains Mono,monospace">' + p + '%</text>';
    }).join('');
    var xt = [0.001, 0.01, 0.1, 1].map(function (f) {
      return '<text x="' + X(f).toFixed(1) + '" y="' + (Hh - 12) + '" font-size="9.5" text-anchor="middle" fill="#64748B" font-family="JetBrains Mono,monospace">' + idn(f, f < 0.01 ? 3 : f < 0.1 ? 2 : f < 1 ? 1 : 0) + '%</text>';
    }).join('');
    var mk = mark ?
      '<line x1="' + X(mark).toFixed(1) + '" x2="' + X(mark).toFixed(1) + '" y1="' + Tt + '" y2="' + (Hh - B) + '" stroke="#091E42" stroke-width="1.5" stroke-dasharray="4 3"/>' +
      '<circle cx="' + X(mark).toFixed(1) + '" cy="' + Y(100 * T.ppv(sens, prev / 100, mark / 100)).toFixed(1) + '" r="5.5" fill="#091E42" stroke="#FFFFFF" stroke-width="2"/>' : '';
    return '<svg class="chart risk-curve" role="img" aria-label="Kurva hubungan FPR dan Ketepatan PPV" viewBox="0 0 ' + W + ' ' + Hh + '">' +
      g +
      '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + Y(50).toFixed(1) + '" y2="' + Y(50).toFixed(1) + '" stroke="#D97706" stroke-width="1.4" stroke-dasharray="4 3"/>' +
      path(0.005, '#94A3B8', 1.5) +
      path(0.05, '#0F766E', 1.5) +
      path(prev, '#1D5BD8', 2.8, 1) +
      mk + xt +
      '<text x="' + ((W + L) / 2) + '" y="' + (Hh - 1) + '" font-size="9.5" font-weight="600" text-anchor="middle" fill="#64748B">Risiko Salah Menandai per Merchant / FPR (Skala Logaritmik)</text>' +
    '</svg>';
  }

  function bM3() {
    var m3 = H.m3, rows = m3.ppv_skenario, groups = {};
    rows.forEach(function (r) { (groups[r.skenario_prevalensi] = groups[r.skenario_prevalensi] || []).push(r); });
    var tbl = Object.keys(groups).map(function (k) {
      return '<h4 class="mt12" style="margin:14px 0 6px;font-size:13px;color:var(--navy-900)">Skenario Prevalensi: ' + esc(k) + '</h4>' +
        '<div class="tblwrap"><table class="exec-table"><thead><tr><th>Risiko Salah Menandai (FPR)</th><th class="r">Terindikasi Benar (TP)</th><th class="r">UMKM Salah Ditandai (FP)</th><th class="r">Ketepatan (PPV)</th></tr></thead><tbody>' +
        groups[k].map(function (r) {
          return '<tr><td class="num font-bold">' + idn(r['FPR_%'], 2) + '%</td><td class="r num">' + idn(r.true_positive_ekspektasian) + '</td><td class="r num" style="color:#B91C1C">' + idn(r.false_positive_ekspektasian) + '</td><td class="r num font-bold">' + idn(r['PPV_%'], 2) + '%</td></tr>';
        }).join('') + '</tbody></table></div>';
    }).join('');
    var imp = m3.dampak_transaksi_skenario;
    return '<div class="grid4 mb12">' +
        A.stat('Populasi Merchant Dasar Simulasi', idn(m3.merchant_populasi / 1e6, 2) + ' Juta', 'resmi', 'Seluruh merchant QRIS nasional (Juni 2026)') +
        A.stat('Prevalensi Proksi Rekening/Merchant', idn(m3.prevalensi_proxy_persen, 4) + '%', 'hitungan', '5.762 rekening dihentikan dibagi 44,86 juta merchant') +
        A.stat('Syarat FPR Maksimum agar PPV &ge; 50%', idn(m3.fpr_maks_ppv50_skenario_proxy_persen, 4) + '%', 'hitungan', 'Pada skenario proksi &amp; sensitivitas 80%') +
        A.stat('Potensi Nilai Bruto Tertunda (5 Hari, 50%)', 'Rp154,68 Miliar', 'asumsi', 'Pada FPR 1% (dana milik merchant, bukan hilang)') +
      '</div>' +
      '<div class="exec-split">' +
        '<div class="exec-main">' +
          '<div class="card">' +
            '<div class="card-head-row"><div><div class="card-tag">TEOREMA BAYES PADA PREVALENSI RENDAH</div><h3>Kurva Ketepatan Hasil Penapisan (PPV) terhadap FPR</h3></div>' + badge('asumsi') + '</div>' +
            '<p class="hint">Menunjukkan proporsi merchant yang benar-benar bermasalah di antara seluruh merchant yang ditandai oleh sistem pada 3 skenario prevalensi.</p>' +
            ppvCurve(m3.prevalensi_proxy_persen, m3.sensitivitas_asumsi) +
            '<div class="chart-legend mt8">' +
              '<span><i style="background:#1D5BD8"></i>Skenario Proksi (0,0128%)</span>' +
              '<span><i style="background:#94A3B8"></i>Skenario Rendah (0,005%)</span>' +
              '<span><i style="background:#0F766E"></i>Skenario Tinggi (0,050%)</span>' +
              '<span><i style="background:#D97706"></i>Ambang Ketepatan 50%</span>' +
            '</div>' +
            tbl +
            A.src('PPATK, Laporan Semester I 2026, hal. 21; Bank Indonesia 2026; Teorema Bayes.') +
          '</div>' +
        '</div>' +
        '<div class="exec-side">' +
          '<div class="card">' +
            '<div class="card-head-row"><div><div class="card-tag">ESTIMASI DAMPAK LIKUIDITAS UMKM</div><h3>Nilai Transaksi Bruto yang Berpotensi Tertunda</h3></div>' + badge('asumsi') + '</div>' +
            '<p class="hint">Dihitung pada skenario FPR 1% dan prevalensi proksi. Merupakan <b>nilai transaksi bruto yang tertunda sementara</b> selama proses verifikasi, bukan omzet yang hilang permanen.</p>' +
            '<div class="tblwrap mt12"><table class="exec-table"><thead><tr><th>Durasi Tunda</th><th class="r">Porsi Terganggu</th><th class="r">Nilai Bruto (Rp Miliar)</th></tr></thead><tbody>' +
              imp.map(function (r) {
                return '<tr><td><b>' + r.hari + ' hari</b></td><td class="r num">' + r['porsi_transaksi_terganggu_%'] + '%</td><td class="r num font-bold">Rp' + idn(r.nilai_bruto_tengah_Rp_miliar, 2) + ' M <small class="muted">(' + idn(r.nilai_bruto_min_Rp_miliar, 1) + '–' + idn(r.nilai_bruto_maks_Rp_miliar, 1) + ')</small></td></tr>';
              }).join('') +
            '</tbody></table></div>' +
            '<a class="btn mt12" href="#/simulator/risiko">' + icon('sliders') + 'Buka Simulator Risiko Interaktif</a>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  // ---------- Spasial: Peta Interaktif 38 Provinsi & 514 Kabupaten/Kota ----------
  var kState = {
    layer: 'klaster', // 'klaster' | 'pdrb' | 'growth' | 'peta514'
    pulau: 'all',
    provIdx: -1, // -1 = Nasional
    klaster: 'all',
    search: '',
    showLabels: false,
    zoom514: 100
  };

  function getProvinceCenter(dStr) {
    // Hitung titik tengah kotak pembatas dari path SVG terbesar provinsi untuk penempatan label
    var parts = dStr.split('Z').filter(Boolean);
    var bestBox = null, maxArea = -1;
    parts.forEach(function (part) {
      var nums = part.match(/-?\d+(\.\d+)?/g);
      if (!nums || nums.length < 4) return;
      var minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
      for (var i = 0; i < nums.length; i += 2) {
        var x = +nums[i], y = +nums[i + 1];
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
      var area = (maxX - minX) * (maxY - minY);
      if (area > maxArea) { maxArea = area; bestBox = { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 }; }
    });
    return bestBox || { cx: 500, cy: 200 };
  }

  function bKlaster() {
    var SP = A.SPATIAL;
    var kl = R.klaster;
    return '<div class="grid4 mb12">' +
        A.stat('Cakupan Wilayah Pemetaan PDRB', '514 Kab/Kota', 'resmi', '38 Provinsi · 17 Lapangan Usaha BPS (Sem I 2026)') +
        A.stat('Hopkins Statistic (Ruang CLR)', idn(kl.hopkins, 4), 'hitungan', '> 0,75 menunjukkan kecenderungan mengelompok kuat') +
        A.stat('Klaster Primer &amp; Pertanian (Klaster 1)', '292 Wilayah', 'hitungan', '56,81% kabupaten/kota · Dominasi Pertanian 32,5%') +
        A.stat('Klaster Industri &amp; Metropolitan (K3 + K4)', '205 Wilayah', 'hitungan', '162 Industri Pengolahan (31,52%) + 43 Kota Jasa (8,37%)') +
      '</div>' +
      '<div class="card">' +
        '<div class="card-head-row">' +
          '<div>' +
            '<span class="card-tag">PEMETAAN TEMATIK SPASIAL &amp; PEMBANDING KONTEKSTUAL 514 KABUPATEN/KOTA</span>' +
            '<h3>Peta Interaktif Struktur Ekonomi &amp; Klaster Kewilayahan Indonesia</h3>' +
          '</div>' +
          '<div class="flex">' + badge('resmi') + badge('hitungan') + '</div>' +
        '</div>' +
        '<p class="hint">Pilih lapisan variabel peta, kelompok pulau, atau klik langsung provinsi pada peta untuk menginspeksi distribusi klaster kabupaten/kota, nilai PDRB per kapita, pertumbuhan riil, dan struktur lapangan usaha.</p>' +
        '<div class="map-toolbar mt12">' +
          '<div class="mt-group">' +
            '<label>Variabel / Mode Peta</label>' +
            '<select id="km-layer" class="filter-select">' +
              '<option value="klaster"' + (kState.layer === 'klaster' ? ' selected' : '') + '>Dominasi Klaster Struktur Ekonomi (Ward K=4)</option>' +
              '<option value="pdrb"' + (kState.layer === 'pdrb' ? ' selected' : '') + '>PDRB per Kapita ADHB (Rp Juta, BPS)</option>' +
              '<option value="growth"' + (kState.layer === 'growth' ? ' selected' : '') + '>Pertumbuhan PDRB Riil per Kapita (%, BPS)</option>' +
              '<option value="peta514"' + (kState.layer === 'peta514' ? ' selected' : '') + '>Peta Choropleth 514 Kabupaten/Kota (Resolusi Tinggi)</option>' +
            '</select>' +
          '</div>' +
          '<div class="mt-group">' +
            '<label>Kelompok Pulau</label>' +
            '<select id="km-pulau" class="filter-select">' +
              '<option value="all"' + (kState.pulau === 'all' ? ' selected' : '') + '>Semua Kepulauan (38 Provinsi · 514 Wilayah)</option>' +
              SP.pulauList.map(function (pl) {
                return '<option value="' + esc(pl) + '"' + (kState.pulau === pl ? ' selected' : '') + '>' + esc(pl) + '</option>';
              }).join('') +
            '</select>' +
          '</div>' +
          '<div class="mt-group">' +
            '<label>Inspeksi Provinsi</label>' +
            '<select id="km-prov" class="filter-select">' +
              '<option value="-1"' + (kState.provIdx === -1 ? ' selected' : '') + '>Seluruh Indonesia (Agregat Nasional)</option>' +
              SP.provs.filter(function (pv) { return kState.pulau === 'all' || pv.pulau === kState.pulau; }).map(function (pv) {
                return '<option value="' + pv.idx + '"' + (kState.provIdx === pv.idx ? ' selected' : '') + '>' + esc(pv.nama) + ' (' + pv.nKab + ' Kab/Kota)</option>';
              }).join('') +
            '</select>' +
          '</div>' +
          '<div class="mt-group mt-actions">' +
            '<label>&nbsp;</label>' +
            '<div class="flex">' +
              '<button type="button" class="chip ' + (kState.showLabels ? 'on' : '') + '" id="km-lbl-btn">' + icon('eye') + 'Tampilkan Nilai</button>' +
              '<button type="button" class="chip" id="km-reset-btn">' + icon('reset') + 'Reset Peta</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div id="klaster-Interactive-Stage" class="mt12"></div>' +
      '</div>' +

      '<div class="sec-title"><div><span class="card-tag">KARAKTERISTIK SEKTORAL 4 KLASTER (17 LAPANGAN USAHA BPS)</span><h2>Profil Komposisi PDRB &amp; Peran Kontekstual per Klaster</h2></div></div>' +
      '<div class="grid2 mb12">' +
        kl.profil.map(function (c) {
          var barsHtml = (c.sektor_top || []).map(function (st) {
            return '<div class="sb-row">' +
              '<div class="sb-head"><span class="sb-label">' + esc(st.sektor) + '</span><span class="sb-val num">' + idn(st.pct, 1) + '%</span></div>' +
              '<div class="sb-track"><div class="sb-fill" style="width:' + Math.min(100, st.pct * 2.4) + '%;background:' + c.warna + '"></div></div>' +
            '</div>';
          }).join('');
          return '<div class="card cluster-card">' +
            '<div class="card-head-row">' +
              '<div class="flex"><span class="cluster-dot" style="background:' + c.warna + ';width:14px;height:14px;border-radius:4px"></span><b style="font-size:15px;color:var(--navy-900)">Klaster ' + c.id + ' &mdash; ' + esc(c.nama) + '</b></div>' +
              '<span class="badge b-resmi">' + idn(c.pct, 2) + '% Nasional</span>' +
            '</div>' +
            '<div class="cluster-count num mt8">' + c.n + ' <small>kabupaten/kota dari 514 wilayah</small></div>' +
            '<p class="hint mt4">' + esc(c.deskripsi) + '</p>' +
            '<div class="mt12"><div class="card-tag">3 LAPANGAN USAHA PDRB DOMINAN (RATA-RATA KLASTER)</div>' + barsHtml + '</div>' +
            '<div class="mt12"><button type="button" class="btn sec sm" data-filter-kl="' + c.id + '">Lihat Daftar ' + c.n + ' Kabupaten/Kota Klaster ' + c.id + ' &darr;</button></div>' +
          '</div>';
        }).join('') +
      '</div>' +

      '<div class="card" id="kab514-explorer">' +
        '<div class="card-head-row">' +
          '<div><span class="card-tag">DIREKTORI SPASIAL 514 KABUPATEN/KOTA</span><h3>Eksplorasi &amp; Pencarian Klasifikasi Klaster per Kabupaten/Kota</h3></div>' +
          '<span class="badge b-hitungan" id="kab514-count">514 Wilayah</span>' +
        '</div>' +
        '<div class="filter-controls mt12">' +
          '<div class="search" style="margin:0;flex:2;min-width:220px">' + icon('search') + '<input id="kab514-q" placeholder="Cari nama kabupaten/kota atau provinsi (Mis. Surabaya, Bojonegoro, Keerom, Medan)..." value="' + esc(kState.search) + '"></div>' +
          '<div class="chips" style="padding:0;margin:0">' +
            [['all', 'Semua (514)'], ['1', 'Klaster 1 (292)'], ['2', 'Klaster 2 (17)'], ['3', 'Klaster 3 (162)'], ['4', 'Klaster 4 (43)']].map(function (x) {
              return '<button type="button" class="chip ' + (String(kState.klaster) === x[0] ? 'on' : '') + '" data-kchip="' + x[0] + '">' + x[1] + '</button>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div id="kab514-table-box" class="mt12"></div>' +
      '</div>' +

      '<div class="card mt12">' +
        '<div class="card-head-row"><div><span class="card-tag">DIAGNOSTIK KOMPUTASI &amp; PEMILIHAN MODEL (DARI NOTEBOOK .IPYNB)</span><h3>Evaluasi Pengelompokan Ruang CLR &amp; Alasan Pemilihan Ward K=4</h3></div>' + badge('hitungan') + '</div>' +
        '<p class="hint">' + esc(kl.metodologi) + '</p>' +
        '<div class="grid4 mt12">' +
          '<div class="mini-k"><b class="num">' + idn(kl.hopkins, 4) + '</b><span>Hopkins Statistic (CLR)</span></div>' +
          '<div class="mini-k"><b class="num">' + idn(kl.k2.silhouette, 4) + ' vs ' + idn(kl.k4.silhouette, 4) + '</b><span>Silhouette Score (K=2 vs K=4)</span></div>' +
          '<div class="mini-k"><b class="num">' + idn(kl.k2.davies_bouldin, 4) + ' vs ' + idn(kl.k4.davies_bouldin, 4) + '</b><span>Davies–Bouldin (Lebih Rendah Baik)</span></div>' +
          '<div class="mini-k"><b class="num">' + idn(kl.k2.calinski_harabasz, 2) + ' vs ' + idn(kl.k4.calinski_harabasz, 2) + '</b><span>Calinski–Harabasz (Lebih Tinggi Baik)</span></div>' +
        '</div>' +
        '<div class="tblwrap mt12"><table class="exec-table"><thead><tr><th>Algoritma Pengelompokan</th><th class="r">Jumlah Klaster (K)</th><th class="r">Silhouette Score</th><th class="r">Davies–Bouldin Index</th><th class="r">Calinski–Harabasz</th><th class="r">Rank Gabungan</th><th>Interpretasi Metodologis</th></tr></thead><tbody>' +
          kl.evaluasi_model.map(function (r) {
            var isSelected = r.k === 4 && r.algoritma.indexOf('Ward') >= 0;
            return '<tr style="' + (isSelected ? 'background:#EFF6FF;font-weight:600' : '') + '">' +
              '<td><b>' + esc(r.algoritma) + '</b></td>' +
              '<td class="r num">' + r.k + '</td>' +
              '<td class="r num">' + idn(r.silhouette, 4) + '</td>' +
              '<td class="r num">' + idn(r.davies_bouldin, 4) + '</td>' +
              '<td class="r num">' + idn(r.calinski_harabasz, 2) + '</td>' +
              '<td class="r num font-bold">' + idn(r.rank_gabungan, 3) + '</td>' +
              '<td>' + esc(r.catatan) + '</td>' +
            '</tr>';
          }).join('') +
        '</tbody></table></div>' +
        '<div class="exec-split mt12">' +
          '<div class="note" style="margin:0"><b>Mengapa Ward K=4 Dipilih untuk Pembanding Berlapis:</b> Secara matematis murni, solusi <code>K=2</code> memiliki separasi tertinggi (Silhouette 0,4994), namun hanya membelah wilayah menjadi agraris vs non-agraris. Solusi <code>Ward K=4</code> dipertahankan sebagai <b>segmentasi eksploratif</b> karena memisahkan wilayah pertanian primer (K1), daerah pemekaran berbasis konstruksi/pemerintahan (K2), koridor industri pengolahan (K3), dan pusat perdagangan metropolitan (K4).</div>' +
          '<div class="warnnote" style="margin:0"><b>Bukan Peta Risiko Perjudian:</b> Klaster kewilayahan sama sekali <b>bukan indikator tingkat kerawanan judi daring</b> suatu daerah. Di TAPIS, klaster digunakan semata-mata sebagai <b>Lapis 1 Pembanding Kontekstual (Klaster Wilayah &rarr; Kategori MCC &rarr; Skala Usaha)</b> agar ritme transaksi UMKM di daerah agraris tidak dibandingkan secara keliru dengan pusat komersial metropolitan.</div>' +
        '</div>' +
      '</div>';
  }

  function renderKlasterStage() {
    var box = A.app.querySelector('#klaster-Interactive-Stage');
    if (!box) return;
    var SP = A.SPATIAL, P = R.peta;
    var provs = SP.provs;
    var valsPdrb = provs.map(function (p) { return p.pdrbKapita; }).sort(function (a, b) { return a - b; });
    var loP = T.quantile(valsPdrb, 0.05), hiP = T.quantile(valsPdrb, 0.95);

    function colorForProv(pv) {
      if (kState.pulau !== 'all' && pv.pulau !== kState.pulau) return '#E2E8F0';
      if (kState.layer === 'klaster') {
        return { 1: '#013590', 2: '#dc88bf', 3: '#84b547', 4: '#e92e2e' }[pv.domKlaster] || '#1D5BD8';
      }
      if (kState.layer === 'pdrb') {
        var t = Math.max(0, Math.min(1, (pv.pdrbKapita - loP) / (hiP - loP)));
        var s = [[224, 238, 255], [125, 174, 248], [29, 91, 216], [9, 30, 66]];
        var k = Math.min(2, Math.floor(t * 3)), f = t * 3 - k;
        var c = s[k].map(function (x, i) { return Math.round(x + (s[k + 1][i] - x) * f); });
        return 'rgb(' + c.join(',') + ')';
      }
      // growth
      var g = pv.pertumbuhan;
      if (g < 0) return '#DC2626';
      if (g < 3) return '#93C5FD';
      if (g < 4.5) return '#2563EB';
      if (g < 6) return '#1E40AF';
      return '#091E42';
    }

    var mapContentHtml = '';
    if (kState.layer === 'peta514') {
      mapContentHtml =
        '<div class="map514-viewer">' +
          '<div class="map514-Head">' +
            '<span><b>Peta Spasial 514 Kabupaten/Kota (Agglomerative Ward K=4, Ruang CLR)</b></span>' +
            '<div class="flex">' +
              '<button type="button" class="chip" id="z-out">' + icon('zoomOut') + 'Perkecil</button>' +
              '<span class="mono-badge">' + kState.zoom514 + '%</span>' +
              '<button type="button" class="chip" id="z-in">' + icon('zoomIn') + 'Perbesar</button>' +
              '<button type="button" class="chip" id="z-back-vec">Kembali ke Peta Vektor Interaktif</button>' +
            '</div>' +
          '</div>' +
          '<div class="map514-scroll">' +
            '<img src="assets/img/klaster_struktur_ekonomi.png" alt="Peta Klaster Struktur Ekonomi 514 Kabupaten/Kota Indonesia" style="width:' + kState.zoom514 + '%;max-width:none;height:auto;display:block;margin:0 auto">' +
          '</div>' +
        '</div>';
    } else {
      var paths = provs.map(function (pv) {
        var isSel = kState.provIdx === pv.idx;
        var dimmed = kState.pulau !== 'all' && pv.pulau !== kState.pulau;
        var fill = colorForProv(pv);
        var stroke = isSel ? '#F5A524' : '#FFFFFF';
        var sw = isSel ? '2.4' : '0.85';
        return '<path data-pidx="' + pv.idx + '" d="' + pv.d + '" fill="' + fill + '" fill-opacity="' + (dimmed ? '0.35' : '0.94') + '" stroke="' + stroke + '" stroke-width="' + sw + '" style="cursor:pointer;transition:fill-opacity .2s">' +
          '<title>' + esc(pv.nama) + ' (' + pv.nKab + ' Kab/Kota) — Dominan: Klaster ' + pv.domKlaster + ' (' + esc(pv.domProfil ? pv.domProfil.nama : '') + ') | PDRB/Kapita: Rp' + idn(pv.pdrbKapita / 1000, 1) + ' Juta | Pertumbuhan: ' + idn(pv.pertumbuhan, 2) + '%</title>' +
        '</path>';
      }).join('');

      var labelsSvg = '';
      if (kState.showLabels) {
        labelsSvg = provs.filter(function (pv) { return kState.pulau === 'all' || pv.pulau === kState.pulau; }).map(function (pv) {
          var c = getProvinceCenter(pv.d);
          var txt = kState.layer === 'klaster' ? ('K' + pv.domKlaster) :
            kState.layer === 'pdrb' ? (idn(pv.pdrbKapita / 1000, 0) + 'jt') :
            (idn(pv.pertumbuhan, 1) + '%');
          return '<g pointer-events="none">' +
            '<rect x="' + (c.cx - 14).toFixed(1) + '" y="' + (c.cy - 7).toFixed(1) + '" width="28" height="13" rx="3.5" fill="rgba(9,30,66,0.84)" stroke="#fff" stroke-width="0.6"/>' +
            '<text x="' + c.cx.toFixed(1) + '" y="' + (c.cy + 2.5).toFixed(1) + '" font-size="7.5" font-weight="700" fill="#FFFFFF" text-anchor="middle" font-family="JetBrains Mono,monospace">' + txt + '</text>' +
          '</g>';
        }).join('');
      }

      var legendOverlay = '';
      if (kState.layer === 'klaster') {
        legendOverlay =
          '<div class="map-legend-box">' +
            '<div class="mlb-title">Dominasi Klaster Provinsi (K=4)</div>' +
            '<div class="mlb-items">' +
              '<span><i style="background:#013590"></i>K1 · Pertanian &amp; Primer (292)</span>' +
              '<span><i style="background:#dc88bf"></i>K2 · Konstruksi &amp; Pemerintahan (17)</span>' +
              '<span><i style="background:#84b547"></i>K3 · Industri Pengolahan (162)</span>' +
              '<span><i style="background:#e92e2e"></i>K4 · Perdagangan Metropolitan (43)</span>' +
            '</div>' +
          '</div>';
      } else if (kState.layer === 'pdrb') {
        legendOverlay =
          '<div class="map-legend-box">' +
            '<div class="mlb-title">PDRB per Kapita ADHB 2024 (BPS)</div>' +
            '<div class="mlb-grad" style="background:linear-gradient(90deg,#E0EEFF,#7DAEF8,#1D5BD8,#091E42)"></div>' +
            '<div class="flex between small muted"><span>Rp' + idn(loP / 1000, 1) + ' Juta</span><span>Rp' + idn(hiP / 1000, 1) + ' Juta</span></div>' +
          '</div>';
      } else {
        legendOverlay =
          '<div class="map-legend-box">' +
            '<div class="mlb-title">Pertumbuhan PDRB Riil per Kapita (%)</div>' +
            '<div class="mlb-items">' +
              '<span><i style="background:#DC2626"></i>&lt; 0% (Kontraksi)</span>' +
              '<span><i style="background:#93C5FD"></i>0% – 3,0%</span>' +
              '<span><i style="background:#2563EB"></i>3,0% – 4,5%</span>' +
              '<span><i style="background:#091E42"></i>&gt; 4,5% (Tinggi)</span>' +
            '</div>' +
          '</div>';
      }

      mapContentHtml =
        '<div class="vec-map-stage">' +
          '<svg class="chart vec-map-svg" viewBox="0 0 ' + P.w + ' ' + P.h + '">' + paths + labelsSvg + '</svg>' +
          legendOverlay +
          '<div class="map-sub-bar">' +
            '<span class="small muted">Klik provinsi pada peta untuk melihat distribusi 514 kabupaten/kota dan rincian PDRB wilayah tersebut.</span>' +
            '<button type="button" class="btn sec sm" id="switch-to-514">' + icon('map') + 'Lihat Peta Choropleth Detail 514 Kab/Kota</button>' +
          '</div>' +
        '</div>';
    }

    // Panel Inspeksi Samping (Nasional / Pulau / Provinsi Terpilih)
    var selProv = kState.provIdx >= 0 ? provs[kState.provIdx] : null;
    var activeKabs = selProv ? selProv.kabs : SP.kabs.filter(function (kb) { return kState.pulau === 'all' || kb.pulau === kState.pulau; });
    var cCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    activeKabs.forEach(function (kb) { cCounts[kb.klaster] = (cCounts[kb.klaster] || 0) + 1; });
    var totActive = Math.max(1, activeKabs.length);

    var sidePanelHtml =
      '<div class="map-inspector">' +
        '<div class="mi-head">' +
          '<span class="card-tag">' + (selProv ? 'PROFIL PROVINSI TERPILIH &middot; ' + esc(selProv.pulau.toUpperCase()) : (kState.pulau !== 'all' ? 'AGREGAT KEPULAUAN' : 'AGREGAT NASIONAL 38 PROVINSI')) + '</span>' +
          '<h4>' + (selProv ? esc(selProv.nama) : (kState.pulau !== 'all' ? 'Kepulauan ' + esc(kState.pulau) : 'Seluruh Wilayah Indonesia')) + '</h4>' +
        '</div>' +
        (selProv ?
          '<div class="grid2 mt8">' +
            '<div class="mini-k"><b class="num">Rp' + idn(selProv.pdrbKapita / 1000, 2) + ' Jt</b><span>PDRB / Kapita ADHB</span></div>' +
            '<div class="mini-k"><b class="num">' + (selProv.pertumbuhan > 0 ? '+' : '') + idn(selProv.pertumbuhan, 2) + '%</b><span>Pertumbuhan Riil</span></div>' +
          '</div>' :
          '<div class="grid2 mt8">' +
            '<div class="mini-k"><b class="num">' + activeKabs.length + '</b><span>Kabupaten / Kota</span></div>' +
            '<div class="mini-k"><b class="num">' + (kState.pulau === 'all' ? 38 : provs.filter(function (p) { return p.pulau === kState.pulau; }).length) + '</b><span>Provinsi Tercakup</span></div>' +
          '</div>') +
        '<div class="mt12">' +
          '<div class="card-tag">KOMPOSISI KLASTER KABUPATEN/KOTA (' + activeKabs.length + ' WILAYAH)</div>' +
          [1, 2, 3, 4].map(function (cid) {
            var pr = SP.profById[cid];
            var n = cCounts[cid] || 0, pct = (n / totActive * 100);
            return '<div class="sb-row">' +
              '<div class="sb-head"><span class="sb-label"><i style="display:inline-block;width:8px;height:8px;border-radius:2px;background:' + pr.warna + ';margin-right:5px"></i>K' + cid + ' · ' + esc(pr.nama) + '</span><span class="sb-val num">' + n + ' (' + idn(pct, 1) + '%)</span></div>' +
              '<div class="sb-track"><div class="sb-fill" style="width:' + pct + '%;background:' + pr.warna + '"></div></div>' +
            '</div>';
          }).join('') +
        '</div>' +
        '<div class="mt12">' +
          '<div class="card-tag">DAFTAR KABUPATEN/KOTA (' + activeKabs.length + ')</div>' +
          '<div class="mi-kab-list">' +
            activeKabs.slice(0, 60).map(function (kb) {
              return '<div class="mi-kab-row">' +
                '<div><b>' + esc(kb.nama) + '</b>' + (!selProv ? '<small class="block muted">' + esc(kb.provinsi) + '</small>' : '') + '</div>' +
                '<span class="kl-pill k' + kb.klaster + '">Klaster ' + kb.klaster + '</span>' +
              '</div>';
            }).join('') +
            (activeKabs.length > 60 ? '<div class="small muted" style="padding:8px 0;text-align:center">+ ' + (activeKabs.length - 60) + ' wilayah lainnya (lihat tabel lengkap di bawah)</div>' : '') +
          '</div>' +
        '</div>' +
      '</div>';

    box.innerHTML = '<div class="map-workbench">' + mapContentHtml + sidePanelHtml + '</div>';

    // Bind interactive map clicks
    box.querySelectorAll('path[data-pidx]').forEach(function (p) {
      p.onclick = function () {
        var idx = +p.dataset.pidx;
        kState.provIdx = (kState.provIdx === idx) ? -1 : idx;
        var sel = A.app.querySelector('#km-prov');
        if (sel) sel.value = String(kState.provIdx);
        renderKlasterStage();
        renderKab514Table();
      };
    });
    var sw514 = box.querySelector('#switch-to-514');
    if (sw514) sw514.onclick = function () {
      kState.layer = 'peta514';
      var lsel = A.app.querySelector('#km-layer');
      if (lsel) lsel.value = 'peta514';
      renderKlasterStage();
    };
    var zIn = box.querySelector('#z-in');
    if (zIn) zIn.onclick = function () { kState.zoom514 = Math.min(220, kState.zoom514 + 30); renderKlasterStage(); };
    var zOut = box.querySelector('#z-out');
    if (zOut) zOut.onclick = function () { kState.zoom514 = Math.max(100, kState.zoom514 - 30); renderKlasterStage(); };
    var zBack = box.querySelector('#z-back-vec');
    if (zBack) zBack.onclick = function () {
      kState.layer = 'klaster';
      var lsel = A.app.querySelector('#km-layer');
      if (lsel) lsel.value = 'klaster';
      renderKlasterStage();
    };
  }

  function renderKab514Table() {
    var tbox = A.app.querySelector('#kab514-table-box');
    var cbadge = A.app.querySelector('#kab514-count');
    if (!tbox) return;
    var SP = A.SPATIAL;
    var q = kState.search.trim().toLowerCase();
    var filtered = SP.kabs.filter(function (kb) {
      if (kState.pulau !== 'all' && kb.pulau !== kState.pulau) return false;
      if (kState.provIdx >= 0 && kb.provIdx !== kState.provIdx) return false;
      if (kState.klaster !== 'all' && String(kb.klaster) !== String(kState.klaster)) return false;
      if (q && (kb.nama + ' ' + kb.provinsi + ' ' + kb.klasterNama + ' ' + kb.pulau).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    if (cbadge) cbadge.textContent = filtered.length + ' dari 514 Wilayah';
    var shown = filtered.slice(0, 80);
    tbox.innerHTML =
      '<div class="tblwrap" style="max-height:420px;overflow-y:auto">' +
        '<table class="exec-table">' +
          '<thead><tr><th>Kabupaten / Kota</th><th>Provinsi &amp; Kepulauan</th><th>Klaster Struktur Ekonomi</th><th>Sektor Lapangan Usaha PDRB Dominan</th></tr></thead>' +
          '<tbody>' +
            (shown.map(function (kb) {
              return '<tr>' +
                '<td><b>' + esc(kb.nama) + '</b></td>' +
                '<td>' + esc(kb.provinsi) + '<small class="block muted">' + esc(kb.pulau) + '</small></td>' +
                '<td><span class="kl-pill k' + kb.klaster + '">Klaster ' + kb.klaster + ' &middot; ' + esc(kb.klasterNama) + '</span></td>' +
                '<td class="small">' + esc(kb.sektorDominan) + '</td>' +
              '</tr>';
            }).join('') || '<tr><td colspan="4" class="empty">Tidak ditemukan kabupaten/kota untuk kriteria filter ini.</td></tr>') +
          '</tbody>' +
        '</table>' +
      '</div>' +
      (filtered.length > 80 ? '<p class="small muted mt8">Menampilkan 80 dari ' + filtered.length + ' wilayah. Gunakan kotak pencarian atau filter pulau/provinsi/klaster di atas untuk mempersempit daftar.</p>' : '');
  }

  function bindKlasterEvents() {
    renderKlasterStage();
    renderKab514Table();
    var app = A.app;
    var lsel = app.querySelector('#km-layer');
    if (lsel) lsel.onchange = function () { kState.layer = lsel.value; renderKlasterStage(); };
    var psel = app.querySelector('#km-pulau');
    if (psel) psel.onchange = function () { kState.pulau = psel.value; kState.provIdx = -1; viewBukti('klaster'); };
    var prsel = app.querySelector('#km-prov');
    if (prsel) prsel.onchange = function () { kState.provIdx = +prsel.value; renderKlasterStage(); renderKab514Table(); };
    var lblBtn = app.querySelector('#km-lbl-btn');
    if (lblBtn) lblBtn.onclick = function () { kState.showLabels = !kState.showLabels; lblBtn.classList.toggle('on', kState.showLabels); renderKlasterStage(); };
    var rstBtn = app.querySelector('#km-reset-btn');
    if (rstBtn) rstBtn.onclick = function () { kState.layer = 'klaster'; kState.pulau = 'all'; kState.provIdx = -1; kState.klaster = 'all'; kState.search = ''; kState.showLabels = false; viewBukti('klaster'); };

    var kq = app.querySelector('#kab514-q');
    if (kq) kq.oninput = function () { kState.search = kq.value; renderKab514Table(); };
    app.querySelectorAll('[data-kchip]').forEach(function (b) {
      b.onclick = function () {
        kState.klaster = b.dataset.kchip;
        app.querySelectorAll('[data-kchip]').forEach(function (x) { x.classList.toggle('on', x.dataset.kchip === kState.klaster); });
        renderKab514Table();
      };
    });
    app.querySelectorAll('[data-filter-kl]').forEach(function (b) {
      b.onclick = function () {
        kState.klaster = b.dataset.filterKl;
        app.querySelectorAll('[data-kchip]').forEach(function (x) { x.classList.toggle('on', x.dataset.kchip === kState.klaster); });
        renderKab514Table();
        var exp = app.querySelector('#kab514-explorer');
        if (exp) exp.scrollIntoView({ behavior: 'smooth' });
      };
    });
  }

  // ---------- Simulator Level Merchant & Simulasi Risiko Bayes ----------
  var sim = { J: false, P: false, K: false, jdata: true, malam: true, seragam: true, sesaat: false, preset: 'angkringan' };
  var PRESETS = {
    angkringan: { n: 'Angkringan Malam Hari', d: 'Ramai 21.00–03.00, Rp10–15 ribu, seragam (Tetap Hijau)', s: { J: false, P: false, K: false, jdata: true, malam: true, seragam: true, sesaat: false } },
    acara: { n: 'Warung Lonjakan Acara Lokal', d: 'Naik 2 hari saat pertandingan/acara, lalu normal (Tetap Hijau)', s: { J: false, P: false, K: false, jdata: true, malam: false, seragam: false, sesaat: true } },
    pulsa: { n: 'Konter Pulsa & Token Listrik', d: 'Nominal paket harga tetap sepanjang hari (Tetap Hijau)', s: { J: false, P: false, K: false, jdata: true, malam: false, seragam: true, sesaat: false } },
    satu: { n: 'Anomali Tunggal (1 Pilar Saja)', d: 'Volume naik persisten, tetapi jejaring & profil wajar (Kuning)', s: { J: false, P: true, K: false, jdata: true, malam: false, seragam: false, sesaat: false } },
    datakurang: { n: 'Cakupan ID Pembayar Parsial', d: 'ID pembayar <70%; Pilar J berstatus Data Kurang (Hijau)', s: { J: false, P: false, K: false, jdata: false, malam: false, seragam: false, sesaat: false } },
    baru: { n: 'Konvergensi 3 Pilar (J + P + K)', d: 'Merchant baru melonjak + jaringan pembayar bersama (Oranye)', s: { J: true, P: true, K: true, jdata: true, malam: false, seragam: true, sesaat: false } }
  };

  var amb = { fpr: 1, sens: 80, prev: null, dua: false, porsi: 50, hari: 5 };

  function viewSimulator(tab) {
    tab = tab || 'risiko';
    if (tab === 'ambang') tab = 'risiko';
    var tabs = '<div class="tabs">' +
      '<button type="button" class="' + (tab === 'risiko' ? 'on' : '') + '" data-t="risiko">Simulasi Risiko &amp; Dampak UMKM (Teorema Bayes)</button>' +
      '<button type="button" class="' + (tab === 'level' ? 'on' : '') + '" data-t="level">Simulator Aturan 4-Level &amp; Perlindungan UMKM</button>' +
    '</div>';
    shell(tab === 'level' ? 'Simulator Aturan Level Penapisan' : 'Simulasi Risiko & Ketepatan Penapisan (Bayes)', tab === 'level' ? 'Eksperimen interaktif aturan konvergensi 2-dari-3 sinyal kuat dan sinyal lemah' : 'Evaluasi trade-off FPR, sensitivitas, prevalensi, dan nilai transaksi bruto UMKM yang tertunda', tabs + '<div id="simbody"></div>', { nav: tab === 'level' ? 'sim-level' : 'sim-risiko' });
    A.app.querySelectorAll('[data-t]').forEach(function (b) { b.onclick = function () { location.hash = '#/simulator/' + b.dataset.t; }; });
    if (tab === 'level') simLevel(); else simAmbang();
  }

  function simLevel() {
    var el = A.app.querySelector('#simbody'), J = sim.jdata && sim.J, n = (J ? 1 : 0) + (sim.P ? 1 : 0) + (sim.K ? 1 : 0);
    var r = T.tentukanLevel({ nGroups: n, weak: { malam: sim.malam, seragam: sim.seragam, sesaat: sim.sesaat } }), lv = r.level;
    var why = r.alasan + (lv === 'oranye' ? ' Pembatasan transaksi (Level Merah) tetap tidak pernah otomatis: wajib melalui pembukaan berkas kasus, verifikasi bukti lapangan/dokumen, dan persetujuan 2 pejabat kepatuhan berbeda.' : '') + (!sim.jdata ? ' Pilar J berstatus "Data Tidak Memadai" (tidak dihitung sebagai aman maupun berisiko).' : '');
    var pres = Object.keys(PRESETS).map(function (k) {
      return '<button type="button" class="' + (sim.preset === k ? 'on' : '') + '" data-p="' + k + '"><b>' + PRESETS[k].n + '</b><span>' + PRESETS[k].d + '</span></button>';
    }).join('');
    function tg(k, t, s, tag, dis) {
      return '<div class="toggle' + (dis ? ' dis' : '') + '">' +
        '<div class="tx"><b>' + t + '<span class="tag ' + tag + '">' + (tag === 'w' ? 'Sinyal Lemah' : 'Pilar ' + tag.toUpperCase()) + '</span></b><span>' + s + '</span></div>' +
        '<label class="switch"><input type="checkbox" data-k="' + k + '" ' + (sim[k] && !dis ? 'checked' : '') + (dis ? ' disabled' : '') + '><span></span></label>' +
      '</div>';
    }
    el.innerHTML =
      '<div class="exec-split">' +
        '<div class="exec-main">' +
          '<div class="card">' +
            '<div class="card-tag">SKENARIO CEPAT (PRESET UMKM &amp; ANOMALI)</div>' +
            '<h3>Pilih Profil Skenario Usaha</h3>' +
            '<div class="presets mt12">' + pres + '</div>' +
          '</div>' +
          '<div class="card">' +
            '<div class="card-tag">LAPISAN PERTAMA: TIGA PILAR SINYAL KUAT (J &middot; P &middot; K)</div>' +
            '<h3>Sakelar Konvergensi Sinyal Kuat</h3>' +
            '<p class="hint">Masuk ke antrean pemeriksaan (Oranye) membutuhkan <b>minimal 2 dari 3 pilar sinyal kuat</b>. Satu pilar saja hanya menghasilkan pemantauan otomatis (Kuning).</p>' +
            tg('jdata', 'Cakupan ID Pembayar Memadai (&ge;70% &amp; &ge;20 Pembayar Unik)', 'Syarat kelayakan data sebelum graf jejaring dievaluasi', 'j') +
            tg('J', 'Pilar J — Jejaring Pembayar Lintas Merchant', 'Proporsi pembayar bersama tinggi (&ge;25% derajat 3+) &amp; terhubung dengan &ge;3 merchant lain', 'j', !sim.jdata) +
            tg('P', 'Pilar P — Perilaku Relatif Sebaya &amp; CUSUM', 'Deviasi volume persisten (Robust Z &ge; 3,5 vs sebaya dan &ge; 3,0 vs riwayat sendiri)', 'p') +
            tg('K', 'Pilar K — Profil Usaha, Konteks &amp; Daftar Rujukan', 'Merchant baru (&lt;60 hari) melonjak &gt;3x P90, tiket tidak lazim, atau cocok daftar rujukan', 'k') +
          '</div>' +
          '<div class="card">' +
            '<div class="card-tag">GARANSI PERLINDUNGAN UMKM</div>' +
            '<h3>Sinyal Lemah (Bukan Dasar Penundaan)</h3>' +
            '<p class="hint">Aktifkan ketiga sinyal lemah di bawah tanpa sinyal kuat: hasil penapisan dijamin <b>tetap Hijau</b>.</p>' +
            tg('malam', 'Operasional Malam hingga Dini Hari (22.00–05.00)', 'Lumrah pada angkringan, kedai kopi, dan warung makan malam', 'w') +
            tg('seragam', 'Konsentrasi Nominal Seragam / Harga Tetap', 'Lumrah pada konter pulsa, token listrik, dan menu paket satu harga', 'w') +
            tg('sesaat', 'Lonjakan Volume Sesaat (1–3 Hari)', 'Lumrah saat akhir pekan, gajian, atau acara kampus/pertandingan lokal', 'w') +
          '</div>' +
        '</div>' +
        '<div class="exec-side">' +
          '<div class="result r-' + lv + '">' +
            '<div class="small" style="opacity:.88;font-weight:700;text-transform:uppercase;letter-spacing:.06em">Keputusan Mesin Penapisan Otomatis</div>' +
            '<div class="lvname mt4">' + U.LV[lv] + ' &middot; ' + U.LVDESC[lv] + '</div>' +
            '<p class="mt8">' + why + '</p>' +
          '</div>' +
          '<div class="card">' +
            '<div class="card-tag">MATRIKS KEPUTUSAN BERJENJANG</div>' +
            '<h3>Mengapa Mesin Tidak Pernah Menghasilkan Level Merah?</h3>' +
            '<p class="small muted" style="line-height:1.6">Di TAPIS, output tertinggi dari algoritma hanyalah <b>Level Oranye (Masuk Antrean Verifikasi)</b>. Penundaan transaksi (<b>Level Merah</b>) hanya dapat terjadi di dalam modul <b>Manajemen Kasus</b> setelah analis mengumpulkan minimal 2 jenis bukti (termasuk bukti lapangan/dokumen) dan memperoleh otorisasi dari <b>2 Pejabat Kepatuhan berbeda</b>.</p>' +
            '<a class="btn sec mt12" href="#/kasus">Lihat Contoh Berkas Kasus &amp; Dual-Control &rarr;</a>' +
          '</div>' +
        '</div>' +
      '</div>';

    el.querySelectorAll('[data-p]').forEach(function (b) { b.onclick = function () { var p = PRESETS[b.dataset.p]; Object.assign(sim, p.s); sim.preset = b.dataset.p; simLevel(); }; });
    el.querySelectorAll('[data-k]').forEach(function (c) { c.onchange = function () { sim[c.dataset.k] = c.checked; sim.preset = ''; simLevel(); }; });
  }

  // Rumus identik dengan notebook: PPV = Se*pi/(Se*pi + FPR*(1-pi)); FPR 2-dari-3 = 3p^2(1-p)+p^3
  function ambCalc(o) {
    var M = H.m3.merchant_populasi, pv = o.prev / 100, s = o.sens / 100, f = o.fpr / 100;
    var se = o.dua ? T.twoOfThree(s) : s, fe = o.dua ? T.twoOfThree(f) : f;
    var tp = se * pv * M, fp = fe * (1 - pv) * M;
    var gmvHari = H.qris.nominal_kuadriliun * 1e15 / 181 / M;
    return { se: se, fe: fe, tp: tp, fp: fp, ppv: T.ppv(se, pv, fe), gmvHari: gmvHari, bruto: fp * gmvHari * o.hari * (o.porsi / 100) };
  }
  A.ambCalc = ambCalc;

  function simAmbang() {
    var el = A.app.querySelector('#simbody'), base = H.m3.prevalensi_proxy_persen;
    if (amb.prev === null) amb.prev = base;
    var sliderPos = Math.round((Math.log10(amb.fpr) + 3) / (Math.log10(2) + 3) * 1000);
    var prevOptions = [[0.005, 'Rendah'], [base, 'Proksi'], [0.05, 'Tinggi']];

    el.innerHTML =
      '<div class="exec-split">' +
        '<div class="exec-main">' +
          '<div class="card risk-main">' +
            '<div class="card-head-row">' +
              '<div><div class="card-tag" id="amb-tag-desc">INDIKATOR UTAMA &middot; SKENARIO PROKSI</div><h3>Estimasi Ketepatan &amp; Beban Pemeriksaan Satu Siklus Nasional</h3></div>' +
              badge('asumsi') +
            '</div>' +
            '<div class="risk-primary mt8">' +
              '<div class="risk-primary-value num" id="amb-ppv-val">0%</div>' +
              '<div><div class="risk-primary-label">Ketepatan Hasil Penapisan (Positive Predictive Value / PPV)</div><p class="hint">Proporsi merchant yang benar-benar bermasalah dari seluruh merchant yang ditandai oleh sistem penapisan.</p></div>' +
            '</div>' +
            '<div class="risk-kpis">' +
              '<div class="risk-kpi"><span>Merchant Terindikasi Benar (True Positive / TP)</span><strong class="num" id="amb-tp-val">0</strong></div>' +
              '<div class="risk-kpi risk-kpi-warn"><span>UMKM Jujur yang Salah Ditandai (False Positive / FP)</span><strong class="num" id="amb-fp-val">0</strong></div>' +
              '<div class="risk-kpi risk-kpi-total"><span>Total Merchant yang Memerlukan Pemeriksaan Manusia (TP + FP)</span><strong class="num" id="amb-tot-val">0</strong></div>' +
            '</div>' +
            '<p id="amb-cap-note" class="note"></p>' +
          '</div>' +
          '<div class="card">' +
            '<div class="card-head-row"><div><div class="card-tag">KURVA TRADE-OFF KESALAHAN VS KETEPATAN</div><h3>Hubungan Risiko Salah Menandai (FPR) dan Ketepatan (PPV)</h3></div></div>' +
            '<p class="hint">Semakin tinggi FPR (risiko UMKM tidak bermasalah ikut ditandai), semakin anjlok ketepatan hasil penapisan.</p>' +
            '<div id="amb-curve-box" class="mt8"></div>' +
            '<div class="chart-legend mt8">' +
              '<span><i style="background:#1D5BD8"></i>Skenario Prevalensi Terpilih</span>' +
              '<span><i style="background:#94A3B8"></i>Prevalensi Rendah (0,005%)</span>' +
              '<span><i style="background:#0F766E"></i>Prevalensi Tinggi (0,050%)</span>' +
              '<span><i style="background:#D97706"></i>Garis Ketepatan 50%</span>' +
            '</div>' +
            '<details class="tech-note mt12"><summary>Lihat Rumus Teorema Bayes &amp; Definisi Parameter</summary><p><code>PPV = (Se &times; &pi;) / [Se &times; &pi; + FPR &times; (1 &minus; &pi;)]</code>. Apabila aturan konvergensi <b>2-dari-3 kelompok sinyal</b> diaktifkan, peluang gabungan dihitung dengan <code>3p&sup2;(1&minus;p) + p&sup3;</code> dengan asumsi independensi antar kelompok sinyal.</p></details>' +
          '</div>' +
          '<div class="card">' +
            '<div class="card-tag">POTENSI DAMPAK LIKUIDITAS TERHADAP UMKM</div>' +
            '<h3>Estimasi Nilai Transaksi Bruto yang Berpotensi Tertunda</h3>' +
            '<div class="stat mt8"><div class="lab">FP &times; GMV Harian Rata-rata per Merchant &times; Durasi &times; Porsi Terganggu</div><div class="val num" id="amb-bruto-val">Rp0 miliar</div></div>' +
            '<p class="note mt8">Nilai ini adalah <b>transaksi bruto yang berpotensi tertunda sementara</b> pada UMKM jujur yang salah ditandai apabila dilakukan pembatasan naif tanpa verifikasi. Bukan omzet hilang permanen: dana tetap milik merchant dan dicairkan setelah pemeriksaan selesai.</p>' +
          '</div>' +
        '</div>' +
        '<div class="exec-side">' +
          '<div class="card">' +
            '<div class="card-tag">PANEL KONTROL PARAMETER SKENARIO</div>' +
            '<h3>Ubah Asumsi &amp; Amati Dampaknya Secara Langsung</h3>' +
            '<p class="hint">Geser parameter di bawah ini untuk menguji sensitivitas ketepatan penapisan dan dampak terhadap UMKM.</p>' +
            '<div class="field mt12">' +
              '<label>Risiko Salah Menandai UMKM (FPR): <strong class="num" id="lbl-fpr">1,00%</strong></label>' +
              '<input type="range" id="fpr" min="0" max="1000" value="' + sliderPos + '">' +
              '<p class="help">Proporsi UMKM jujur yang keliru ditandai per satu siklus penapisan (Skala logaritmik 0,001% s.d. 2,00%).</p>' +
            '</div>' +
            '<div class="field">' +
              '<label>Kemampuan Menemukan Merchant Bermasalah (Sensitivitas): <strong class="num" id="lbl-sens">' + amb.sens + '%</strong></label>' +
              '<input type="range" id="sens" min="50" max="95" value="' + amb.sens + '">' +
              '<p class="help">Asumsi proporsi merchant bermasalah yang berhasil terdeteksi oleh sinyal.</p>' +
            '</div>' +
            '<div class="field">' +
              '<label>Skenario Prevalensi Merchant Bermasalah (&pi;)</label>' +
              '<div class="chips" style="padding-bottom:4px">' +
                prevOptions.map(function (p) {
                  return '<button type="button" class="chip ' + (Math.abs(amb.prev - p[0]) < 1e-9 ? 'on' : '') + '" data-pv="' + p[0] + '">' + p[1] + ' &middot; ' + idn(p[0], p[0] === base ? 4 : 3) + '%</button>';
                }).join('') +
              '</div>' +
              '<p class="help">Nilai proksi (0,0128%) berasal dari 5.762 rekening judi yang dihentikan dibagi 44,86 juta merchant QRIS.</p>' +
            '</div>' +
            '<div class="toggle">' +
              '<div class="tx"><b>Aktifkan Syarat Konvergensi 2-dari-3 Pilar Sinyal</b><span>Menekan FPR efektif secara drastis dengan rumus binomial <code>3p&sup2;(1&minus;p) + p&sup3;</code> (asumsi independensi antar kelompok sinyal).</span></div>' +
              '<label class="switch"><input type="checkbox" id="dua" ' + (amb.dua ? 'checked' : '') + '><span></span></label>' +
            '</div>' +
            '<div class="field mt12">' +
              '<label>Porsi Transaksi yang Terganggu: <strong id="lbl-porsi">' + amb.porsi + '%</strong></label>' +
              '<div class="chips" style="padding-bottom:4px">' +
                [25, 50, 100].map(function (v) {
                  return '<button type="button" class="chip ' + (amb.porsi === v ? 'on' : '') + '" data-po="' + v + '">' + v + '%</button>';
                }).join('') +
              '</div>' +
            '</div>' +
            '<div class="field">' +
              '<label>Asumsi Durasi Gangguan / Pemeriksaan: <strong id="lbl-hari">' + amb.hari + ' hari</strong></label>' +
              '<input type="range" id="hari" min="1" max="10" value="' + amb.hari + '">' +
            '</div>' +
          '</div>' +
          '<div class="card">' +
            '<div class="card-tag">BATAS INTERPRETASI KEBIJAKAN</div>' +
            '<h3>Prinsip Kehati-hatian Simulasi</h3>' +
            '<ul class="small gaps">' +
              '<li>Hasil simulasi bukan bukti pelanggaran dan tidak menggantikan pemeriksaan serta persetujuan manusia.</li>' +
              '<li>Prevalensi rendah, proksi, dan tinggi merupakan asumsi skenario pada satu siklus populasi (44,86 juta merchant).</li>' +
              '<li>Statistik LTKM nasional PPATK tidak digunakan sebagai ukuran kapasitas pemeriksaan PJP.</li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
      '</div>';

    function updateAmbangDOM() {
      var r = ambCalc(amb), K = A.kapasitas();
      var tpShown = Math.round(r.tp), fpShown = Math.round(r.fp), total = tpShown + fpShown;
      var prevDesc = Math.abs(amb.prev - 0.005) < 1e-9 ? 'Asumsi Rendah (0,005%)' : (Math.abs(amb.prev - 0.05) < 1e-9 ? 'Asumsi Tinggi (0,050%)' : 'Asumsi Proksi (' + idn(base, 4) + '%)');
      el.querySelector('#amb-tag-desc').textContent = 'INDIKATOR UTAMA · ' + prevDesc.toUpperCase() + (amb.dua ? ' · ATURAN 2-DARI-3 AKTIF' : '');
      el.querySelector('#amb-ppv-val').textContent = idn(r.ppv * 100, 1) + '%';
      el.querySelector('#amb-tp-val').textContent = idn(tpShown);
      el.querySelector('#amb-fp-val').textContent = idn(fpShown);
      el.querySelector('#amb-tot-val').textContent = idn(total);
      el.querySelector('#amb-bruto-val').textContent = 'Rp' + idn(r.bruto / 1e9, 2) + ' miliar';
      el.querySelector('#lbl-fpr').textContent = idn(amb.fpr, amb.fpr < 0.01 ? 4 : amb.fpr < 0.1 ? 3 : 2) + '%' + (amb.dua ? ' (Efektif 2/3: ' + idn(r.fe * 100, 5) + '%)' : '');
      el.querySelector('#lbl-sens').textContent = amb.sens + '%' + (amb.dua ? ' (Efektif 2/3: ' + idn(r.se * 100, 1) + '%)' : '');
      el.querySelector('#lbl-porsi').textContent = amb.porsi + '%';
      el.querySelector('#lbl-hari').textContent = amb.hari + ' hari';

      var capNote = el.querySelector('#amb-cap-note');
      capNote.className = r.fp > r.tp ? 'warnnote' : 'note';
      capNote.innerHTML = 'Seluruh <b>' + idn(total) + ' merchant</b> yang ditandai membutuhkan verifikasi manusia. Dengan kapasitas tim PJP saat ini (<b>' + idn(K) + ' kasus baru per hari kerja</b> pada pengaturan Antrean), menuntaskan beban tersebut membutuhkan sekitar <b>' + idn(K > 0 ? Math.ceil(total / K) : 0) + ' hari kerja</b>.';

      el.querySelector('#amb-curve-box').innerHTML = ppvCurve(amb.prev, r.se, r.fe * 100);
    }

    updateAmbangDOM();

    var rg = el.querySelector('#fpr');
    rg.oninput = function () { amb.fpr = Math.pow(10, -3 + (Math.log10(2) + 3) * rg.value / 1000); updateAmbangDOM(); };
    var sn = el.querySelector('#sens');
    sn.oninput = function () { amb.sens = +sn.value; updateAmbangDOM(); };
    var hr = el.querySelector('#hari');
    hr.oninput = function () { amb.hari = +hr.value; updateAmbangDOM(); };
    el.querySelectorAll('[data-pv]').forEach(function (b) {
      b.onclick = function () {
        amb.prev = +b.dataset.pv;
        el.querySelectorAll('[data-pv]').forEach(function (x) { x.classList.toggle('on', Math.abs(amb.prev - (+x.dataset.pv)) < 1e-9); });
        updateAmbangDOM();
      };
    });
    el.querySelectorAll('[data-po]').forEach(function (b) {
      b.onclick = function () {
        amb.porsi = +b.dataset.po;
        el.querySelectorAll('[data-po]').forEach(function (x) { x.classList.toggle('on', amb.porsi === (+x.dataset.po)); });
        updateAmbangDOM();
      };
    });
    el.querySelector('#dua').onchange = function () { amb.dua = this.checked; updateAmbangDOM(); };
  }

  A.viewBukti = viewBukti;
  A.viewSimulator = viewSimulator;
})();
