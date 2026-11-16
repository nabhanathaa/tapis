/* TAPIS: Pusat Bukti Nasional (M1 Deposit, M2 Deret Waktu LTKM, M3 Bayes, Peta & Klaster 514 Wilayah) dan Simulator Risiko/Level (Mobile Flagship Architecture). */
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
      ['ringkas', 'Ringkasan'],
      ['m1', 'M1 · Deposit'],
      ['m2', 'M2 · Tren LTKM'],
      ['m3', 'M3 · Bayes'],
      ['klaster', 'Peta & Klaster']
    ].map(function (t) {
      return '<button type="button" class="' + (bTab === t[0] ? 'on' : '') + '" data-t="' + t[0] + '">' + t[1] + '</button>';
    }).join('');
    var body = '<div class="tabs">' + tabs + '</div>' + ({ ringkas: bRingkas, m1: bM1, m2: bM2, m3: bM3, klaster: bKlaster }[bTab] || bRingkas)();
    shell(bTab === 'klaster' ? 'Peta & Klaster 514 Wilayah' : 'Pusat Bukti Nasional', 'Data resmi PPATK, Bank Indonesia & BPS', body, { nav: 'bukti' });
    A.app.querySelectorAll('[data-t]').forEach(function (b) { b.onclick = function () { location.hash = '#/bukti/' + b.dataset.t; }; });
    if (bTab === 'klaster') bindKlasterEvents();
  }

  function bRingkas() {
    var d = H.deposit, m = H.m2, m3 = H.m3;
    return '<div class="grid2 mb12">' +
        A.stat('Merchant QRIS (96,68% UMKM)', cu(H.qris.merchant_juta, 2, '', ' Jt'), 'resmi', 'BI, Juni 2026 (65,77 jt pengguna)') +
        A.stat('Volume QRIS Sem I 2026', cu(H.qris.volume_miliar, 2, '', ' M'), 'resmi', 'Nominal Rp1,12 kuadriliun') +
        A.stat('Pangsa Frek. Deposit via QRIS', cu(87.66, 2, '', '%'), 'resmi', '198,77 jt dari 226,76 jt trx') +
        A.stat('Rata-rata Deposit QRIS', cu(Math.round(d.rata2_qris_rp), 0, 'Rp'), 'hitungan', 'Di bawah rata-rata QRIS (Rp89.243)') +
      '</div>' +
      '<div class="card">' +
        '<div class="card-head-row"><div><div class="card-tag">SINTESIS EMPIRIS NOTEBOOK RISET</div><h3>Tiga Temuan Kunci Landasan TAPIS</h3></div>' + badge('hitungan') + '</div>' +
        '<div class="reason"><span class="ic on">M1</span><div><b>Frekuensi Melonjak (+139,95%), Nominal Mengecil (-47,49%)</b><p>Dekomposisi logaritmik Kitagawa (1955): kenaikan nilai deposit Sem I 2025 ke Sem I 2026 (+Rp4,55 T) didorong efek frekuensi (<b>+Rp18,68 T</b>) yang diredam penurunan rata-rata nominal (<b>-Rp14,13 T</b>). Rata-rata deposit via QRIS (<b>' + rp(d.rata2_qris_rp) + '</b>) lebih kecil dari rata-rata belanja QRIS nasional (<b>' + rp(H.qris.rata2_transaksi_rp) + '</b>).</p><a class="small font-bold" href="#/bukti/m1">Buka Dekomposisi M1 &rarr;</a></div></div>' +
        '<div class="reason"><span class="ic on">M2</span><div><b>Tren LTKM Perjudian Menurun Signifikan (Jun 2024 – Sep 2026)</b><p>Uji Mann-Kendall TFPW menghasilkan <b>Z = ' + idn(m.mk_tfpw_Z, 3) + ' (p = ' + idn(m.mk_tfpw_p, 4) + ')</b> dengan kemiringan Sen <b>' + idn(m.sen_persen_per_bulan, 2) + '%/bulan</b>. Segmentasi BIC menandai ' + m.patah_bic.map(bln).join(' & ') + '.</p><a class="small font-bold" href="#/bukti/m2">Buka Deret Waktu M2 &rarr;</a></div></div>' +
        '<div class="reason"><span class="ic on">M3</span><div><b>Paradoks Base-Rate Bayes: Bahaya Ambang Tunggal</b><p>Pada 44,86 juta merchant dan prevalensi proksi <b>' + idn(m3.prevalensi_proxy_persen, 4) + '%</b>, mencapai PPV 50% menuntut FPR &le; <b>' + idn(m3.fpr_maks_ppv50_skenario_proxy_persen, 4) + '%</b>. Karena itu TAPIS mewajibkan <b>konvergensi 2-dari-3 sinyal (J, P, K)</b> dan verifikasi manusia.</p><a class="small font-bold" href="#/bukti/m3">Buka Kurva Bayes M3 &rarr;</a></div></div>' +
      '</div>' +
      '<div class="card">' +
        '<div class="card-head-row"><div><div class="card-tag">KONTEKS SPASIAL 514 WILAYAH</div><h3>Segmentasi Struktur Ekonomi PDRB</h3></div><span class="badge b-resmi">Ward K=4</span></div>' +
        '<p class="hint">Mengelompokkan 514 kabupaten/kota menurut 17 lapangan usaha PDRB BPS (Hopkins = <b>0,8087</b>) sebagai Lapis 1 pembanding kontekstual.</p>' +
        '<div class="mt8">' +
          R.klaster.profil.map(function (p) {
            return '<div class="sb-row">' +
              '<div class="sb-head"><span class="sb-label"><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + p.warna + ';margin-right:6px"></i>K' + p.id + ': ' + esc(p.nama) + '</span><span class="sb-val num">' + p.n + ' (' + idn(p.pct, 1) + '%)</span></div>' +
              '<div class="sb-track"><div class="sb-fill" style="width:' + p.pct + '%;background:' + p.warna + '"></div></div>' +
            '</div>';
          }).join('') +
        '</div>' +
        '<a class="btn sec block mt12" href="#/bukti/klaster">' + icon('map') + 'Buka Peta Interaktif 514 Wilayah</a>' +
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
          '<div class="hbar' + (v < 0 ? ' neg' : '') + '" style="position:absolute;top:4px;height:18px;border-radius:4px;background:' + col + ';' + (v >= 0 ? 'left:50%' : 'right:50%') + ';width:' + (Math.abs(v) / mx * 46) + '%"></div>' +
        '</div>' +
        '<div class="kr-val num" style="color:' + col + '">' + (v < 0 ? '-' : '+') + 'Rp' + idn(Math.abs(v), 2) + ' T</div>' +
      '</div>';
    }
    var cmp = [
      { l: 'Deposit QRIS', v: d.rata2_qris_rp, c: '#DC2626', t: rp(d.rata2_qris_rp) },
      { l: 'Belanja QRIS', v: H.qris.rata2_transaksi_rp, c: '#1D5BD8', t: rp(H.qris.rata2_transaksi_rp) },
      { l: 'Batas MDR 0%', v: 100000, c: '#0F9D6E', t: 'Rp100.000' },
      { l: 'Bank / E-Wallet', v: 346360, c: '#64748B', t: 'Rp346.360' }
    ];
    return '<div class="grid2 mb12">' +
        A.stat('Deposit Sem I 2026', 'Rp' + idn(d.nilai_sem1_2026_T, 2) + ' T', 'resmi', 'Naik +26,0% vs Sem I 2025') +
        A.stat('Frekuensi Sem I 2026', idn(d.frek_sem1_2026_juta, 2) + ' Jt', 'resmi', 'Naik +139,95% vs Sem I 2025') +
        A.stat('Pangsa Kanal QRIS', idn(d.porsi_nilai_kanal_qris_persen, 1) + '% / ' + idn(d.porsi_frek_kanal_qris_persen, 1) + '%', 'resmi', 'Nilai Rp12,36 T · Frek 198,8 jt') +
        A.stat('Porsi thd QRIS Nasional', idn(d.porsi_volume_qris_nasional_persen, 2) + '% vol', 'hitungan', '98%+ transaksi QRIS adalah sah') +
      '</div>' +
      '<div class="card">' +
        '<div class="card-head-row"><div><div class="card-tag">DEKOMPOSISI KITAGAWA (1955)</div><h3>Efek Frekuensi vs Rata-rata Nominal</h3></div>' + badge('hitungan') + '</div>' +
        '<p class="hint">Nilai deposit naik dari Rp17,50 T ke Rp22,05 T (+Rp4,55 T; log total = <code>+' + idn(d.log_total, 4) + '</code>):</p>' +
        '<div class="mt8">' +
          hb('Efek Frekuensi', d.efek_frek_T, '#1D5BD8', 'Log frek +' + idn(d.log_frek, 4) + ' (94,5 jt → 226,8 jt)') +
          hb('Efek Rata-rata Nominal', d.efek_rata2_T, '#DC2626', 'Log rata2 ' + idn(d.log_rata2, 4) + ' (Rp185rb → Rp97rb)') +
          hb('Perubahan Bersih', d.efek_frek_T + d.efek_rata2_T, '#081E46', 'Selisih Sem I 2025 ke Sem I 2026') +
        '</div>' +
        '<p class="note mt8"><b>Implikasi:</b> Pelaku memecah deposit menjadi nominal kecil namun sangat sering. Aturan berbasis nominal kecil saja akan salah menjerat UMKM mikro.</p>' +
        A.src('PPATK, Laporan Semester I 2026; Metode Kitagawa (1955).') +
      '</div>' +
      '<div class="card">' +
        '<div class="card-head-row"><div><div class="card-tag">KOMPARASI TIKET TRANSAKSI</div><h3>Rata-rata Deposit QRIS vs Belanja UMKM</h3></div>' + badge('hitungan') + '</div>' +
        U.bars(cmp, { max: 390000, h: 170 }) +
      '</div>' +
      '<div class="card">' +
        '<div class="card-head-row"><div><div class="card-tag">TREN HISTORIS</div><h3>Nilai Deposit Judi Daring (Semua Kanal)</h3></div>' + badge('resmi') + '</div>' +
        U.bars(yr, { h: 165 }) +
        '<div class="tblwrap mt8"><table class="tbl"><thead><tr><th>Periode &amp; Kanal</th><th class="r">Nilai (T)</th><th class="r">Frek (Jt)</th><th class="r">Rata-rata</th></tr></thead><tbody>' +
          R.deposit.filter(function (x) { return x.frekuensi_transaksi; }).map(function (r) {
            return '<tr><td><b>' + esc(r.periode) + '</b><small class="block muted">' + esc(r.kanal) + '</small></td><td class="r num">' + idn(r.nilai_rp / 1e12, 2) + '</td><td class="r num">' + idn(r.frekuensi_transaksi / 1e6, 2) + '</td><td class="r num font-bold">' + rp(r.rata2_per_transaksi_rp) + '</td></tr>';
          }).join('') +
        '</tbody></table></div>' +
      '</div>';
  }

  function bM2() {
    var m = H.m2, s = m.deret, W = 360, Hh = 190, L = 40, Rr = 10, Tt = 16, B = 24, n = s.length, mx = 23000;
    var X = function (i) { return L + (W - L - Rr) * (i + 0.5) / n; }, Y = function (v) { return Tt + (Hh - Tt - B) * (1 - v / mx); }, bw = (W - L - Rr) / n;
    var startIdx = s.findIndex(function (r) { return r.bulan === '2024-07'; });
    var segs = m.segmen, cuts = [startIdx].concat(m.segmen_awal.map(function (b) { return s.findIndex(function (r) { return r.bulan === b; }); })).concat([n]);
    var grid = U.axisY(0, mx, 4).map(function (v) { return '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + Y(v).toFixed(1) + '" y2="' + Y(v).toFixed(1) + '" stroke="#E2E8F0" stroke-dasharray="2 2"/><text x="' + (L - 4) + '" y="' + (Y(v) + 3).toFixed(1) + '" font-size="8.5" text-anchor="end" fill="#64748B" font-family="JetBrains Mono,monospace">' + idn(v / 1000, 0) + 'rb</text>'; }).join('');
    var bars = s.map(function (r, i) { return '<rect class="gb" x="' + (X(i) - bw * 0.35).toFixed(1) + '" y="' + Y(r.perjudian).toFixed(1) + '" width="' + (bw * 0.7).toFixed(1) + '" height="' + (Hh - B - Y(r.perjudian)).toFixed(1) + '" fill="' + (i < startIdx ? '#CBD5E1' : '#93C5FD') + '" rx="2"><title>' + r.bulan + ': ' + idn(r.perjudian) + ' laporan</title></rect>'; }).join('');
    var seg = segs.map(function (g, j) { var a = X(cuts[j]) - bw / 2, b = X(cuts[j + 1] - 1) + bw / 2; return '<rect x="' + a.toFixed(1) + '" y="' + Y(g.CI95_atas_HAC).toFixed(1) + '" width="' + (b - a).toFixed(1) + '" height="' + (Y(g.CI95_bawah_HAC) - Y(g.CI95_atas_HAC)).toFixed(1) + '" fill="#1D5BD8" opacity=".16"/><line x1="' + a.toFixed(1) + '" x2="' + b.toFixed(1) + '" y1="' + Y(g.rata2_geometrik).toFixed(1) + '" y2="' + Y(g.rata2_geometrik).toFixed(1) + '" stroke="#081E46" stroke-width="2"/><text x="' + ((a + b) / 2).toFixed(1) + '" y="' + (Y(g.CI95_atas_HAC) - 4).toFixed(1) + '" font-size="8.5" font-weight="800" text-anchor="middle" fill="#081E46" font-family="JetBrains Mono,monospace">' + idn(g.rata2_geometrik, 0) + '</text>'; }).join('');
    var br = cuts.slice(1, -1).map(function (c) { return '<line x1="' + (X(c) - bw / 2).toFixed(1) + '" x2="' + (X(c) - bw / 2).toFixed(1) + '" y1="' + Tt + '" y2="' + (Hh - B) + '" stroke="#DC2626" stroke-width="1.4" stroke-dasharray="3 3"/>'; }).join('');
    var xl = s.map(function (r, i) { return (i % 5 === 0 || i === n - 1) ? '<text x="' + X(i).toFixed(1) + '" y="' + (Hh - 6) + '" font-size="8.5" text-anchor="middle" fill="#64748B" font-family="JetBrains Mono,monospace">' + r.bulan + '</text>' : ''; }).join('');
    var chart = '<svg class="chart" viewBox="0 0 ' + W + ' ' + Hh + '">' + grid + bars + seg + br + xl + '</svg>';

    var cus = m.cusum_2026, cmn = -7, cW = 350, cH = 155, hLim = -4;
    var cX = function (i) { return 30 + (cW - 44) * i / (cus.length - 1); }, cY = function (v) { return 12 + (cH - 34) * (v / cmn); };
    var cline = cus.map(function (r, i) { return (i ? 'L' : 'M') + cX(i).toFixed(1) + ',' + cY(r.CUSUM_bawah).toFixed(1); }).join('');
    var cdots = cus.map(function (r, i) { return '<circle cx="' + cX(i).toFixed(1) + '" cy="' + cY(r.CUSUM_bawah).toFixed(1) + '" r="3.5" fill="' + (r.status ? '#DC2626' : '#1D5BD8') + '" stroke="#fff" stroke-width="1.2"/><text x="' + cX(i).toFixed(1) + '" y="' + (cH - 6) + '" font-size="8.5" text-anchor="middle" fill="#64748B">' + BULAN[+r.bulan.slice(5) - 1].slice(0, 3) + '</text>'; }).join('');
    var cyt = [0, -2, -4, -6].map(function (v) { return '<line x1="30" x2="' + (cW - 14) + '" y1="' + cY(v).toFixed(1) + '" y2="' + cY(v).toFixed(1) + '" stroke="#EEF2F7"/><text x="24" y="' + (cY(v) + 3).toFixed(1) + '" font-size="8.5" text-anchor="end" fill="#94A3B8" font-family="JetBrains Mono,monospace">' + v + '</text>'; }).join('');
    var cchart = '<svg class="chart" viewBox="0 0 ' + cW + ' ' + cH + '">' + cyt + '<line x1="30" x2="' + (cW - 14) + '" y1="' + cY(hLim).toFixed(1) + '" y2="' + cY(hLim).toFixed(1) + '" stroke="#DC2626" stroke-width="1.3" stroke-dasharray="3 3"/><path class="ln" pathLength="1" d="' + cline + '" fill="none" stroke="#081E46" stroke-width="2.2"/>' + cdots + '</svg>';

    return '<div class="grid2 mb12">' +
        A.stat('Mann-Kendall TFPW', 'Z = ' + idn(m.mk_tfpw_Z, 2), 'hitungan', 'p = ' + idn(m.mk_tfpw_p, 4) + ' (Turun signifikan)') +
        A.stat('Kemiringan Theil-Sen', idn(m.sen_persen_per_bulan, 2) + '%/bln', 'hitungan', 'Autokorelasi lag-1 rho = ' + idn(m.rho_tfpw, 3)) +
        A.stat('OLS-CUSUM &amp; sup-F', idn(m.cusum_ols_stat, 2) + ' / ' + idn(m.supF, 2), 'hitungan', 'p CUSUM = ' + idn(m.cusum_ols_p, 4)) +
        A.stat('LTKM Perjudian Jan–Sep', idn(m.jan_sep_2026), 'resmi', 'Turun -28,19% vs Jan–Sep 2025') +
      '</div>' +
      '<div class="card">' +
        '<div class="card-head-row"><div><div class="card-tag">DERET WAKTU BULANAN (N = 27)</div><h3>Tren LTKM Perjudian &amp; Segmentasi BIC</h3></div>' + badge('resmi') + '</div>' +
        '<p class="hint">Garis gelap: rata-rata geometrik per segmen + pita CI 95% (Newey-West HAC). Garis merah: titik patah eksploratif BIC.</p>' +
        chart +
        A.src('PPATK, Buletin Statistik APUPPT Jun 2025, Okt 2025 & Sep 2026.') +
      '</div>' +
      '<div class="card">' +
        '<div class="card-head-row"><div><div class="card-tag">PEMANTAUAN BERUNTUN</div><h3>CUSUM Bawah 2026 vs Acuan 2025</h3></div>' + badge('hitungan') + '</div>' +
        '<p class="hint">Melewati ambang ilustratif h = -4 pertama kali pada <b>' + bln(m.cusum_alarm_pertama) + '</b>.</p>' +
        cchart +
      '</div>' +
      '<div class="card">' +
        '<div class="card-tag">DIAGNOSTIK EKONOMETRIKA</div><h3>Ringkasan Uji Statistik</h3>' +
        '<div class="tblwrap mt8"><table class="tbl"><tbody>' +
          '<tr><td>Mann-Kendall (Ties)</td><td class="r num">Z = ' + idn(m.mk_Z_ties, 3) + ' (p = ' + idn(m.mk_p_ties, 4) + ')</td></tr>' +
          '<tr style="background:#EFF6FF"><td><b>Mann-Kendall TFPW</b></td><td class="r num"><b>Z = ' + idn(m.mk_tfpw_Z, 3) + ' (p = ' + idn(m.mk_tfpw_p, 4) + ')</b></td></tr>' +
          '<tr><td>Kemiringan Sen</td><td class="r num">' + idn(m.sen_persen_per_bulan, 2) + '% / bulan</td></tr>' +
          '<tr><td>Uji Andrews sup-F (' + bln(m.supF_tanggal) + ')</td><td class="r num">F = ' + idn(m.supF, 2) + ' (p IID = ' + idn(m.supF_p_iid, 4) + ')</td></tr>' +
          '<tr><td>Bootstrap AR(1) sup-F</td><td class="r num">p = ' + idn(m.supF_p_ar1_null, 4) + ' (Tidak signifikan)</td></tr>' +
        '</tbody></table></div>' +
      '</div>';
  }

  function ppvCurve(prev, sens, mark) {
    var W = 350, Hh = 180, L = 36, Rr = 12, Tt = 12, B = 28, lo = Math.log10(0.001), hi = Math.log10(2);
    var X = function (f) { return L + (W - L - Rr) * (Math.log10(f) - lo) / (hi - lo); }, Y = function (p) { return Tt + (Hh - Tt - B) * (1 - p / 100); };
    function path(pv, col, w, cls) {
      var d = '';
      for (var k = 0; k <= 80; k++) {
        var f = Math.pow(10, lo + (hi - lo) * k / 80);
        d += (k ? 'L' : 'M') + X(f).toFixed(1) + ',' + Y(100 * T.ppv(sens, pv / 100, f / 100)).toFixed(1);
      }
      return '<path ' + (cls ? 'class="ln" pathLength="1" ' : '') + 'd="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + w + '"/>';
    }
    var g = [0, 25, 50, 75, 100].map(function (p) {
      return '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + Y(p).toFixed(1) + '" y2="' + Y(p).toFixed(1) + '" stroke="#E2E8F0" stroke-dasharray="2 2"/>' +
        '<text x="' + (L - 5) + '" y="' + (Y(p) + 3).toFixed(1) + '" font-size="8.5" text-anchor="end" fill="#64748B" font-family="JetBrains Mono,monospace">' + p + '%</text>';
    }).join('');
    var xt = [0.001, 0.01, 0.1, 1].map(function (f) {
      return '<text x="' + X(f).toFixed(1) + '" y="' + (Hh - 10) + '" font-size="8.5" text-anchor="middle" fill="#64748B" font-family="JetBrains Mono,monospace">' + idn(f, f < 0.01 ? 3 : f < 0.1 ? 2 : f < 1 ? 1 : 0) + '%</text>';
    }).join('');
    var mk = mark ?
      '<line x1="' + X(mark).toFixed(1) + '" x2="' + X(mark).toFixed(1) + '" y1="' + Tt + '" y2="' + (Hh - B) + '" stroke="#081E46" stroke-width="1.4" stroke-dasharray="3 3"/>' +
      '<circle cx="' + X(mark).toFixed(1) + '" cy="' + Y(100 * T.ppv(sens, prev / 100, mark / 100)).toFixed(1) + '" r="5" fill="#081E46" stroke="#FFFFFF" stroke-width="1.8"/>' : '';
    return '<svg class="chart risk-curve" role="img" aria-label="Kurva hubungan FPR dan Ketepatan PPV" viewBox="0 0 ' + W + ' ' + Hh + '">' +
      g +
      '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + Y(50).toFixed(1) + '" y2="' + Y(50).toFixed(1) + '" stroke="#D97706" stroke-width="1.3" stroke-dasharray="3 3"/>' +
      path(0.005, '#94A3B8', 1.4) +
      path(0.05, '#0F766E', 1.4) +
      path(prev, '#1D5BD8', 2.5, 1) +
      mk + xt +
    '</svg>';
  }

  function bM3() {
    var m3 = H.m3, rows = m3.ppv_skenario, groups = {};
    rows.forEach(function (r) { (groups[r.skenario_prevalensi] = groups[r.skenario_prevalensi] || []).push(r); });
    var tbl = Object.keys(groups).map(function (k) {
      return '<h4 class="mt12" style="margin:10px 0 4px;font-size:12px;color:var(--navy-900)">Skenario: ' + esc(k) + '</h4>' +
        '<div class="tblwrap"><table class="tbl"><thead><tr><th>FPR</th><th class="r">TP</th><th class="r">FP (UMKM)</th><th class="r">PPV</th></tr></thead><tbody>' +
        groups[k].map(function (r) {
          return '<tr><td class="num font-bold">' + idn(r['FPR_%'], 2) + '%</td><td class="r num">' + idn(r.true_positive_ekspektasian) + '</td><td class="r num" style="color:#B91C1C">' + idn(r.false_positive_ekspektasian) + '</td><td class="r num font-bold">' + idn(r['PPV_%'], 2) + '%</td></tr>';
        }).join('') + '</tbody></table></div>';
    }).join('');
    var imp = m3.dampak_transaksi_skenario;
    return '<div class="grid2 mb12">' +
        A.stat('Populasi Merchant', idn(m3.merchant_populasi / 1e6, 2) + ' Jt', 'resmi', 'Merchant QRIS nasional') +
        A.stat('Prevalensi Proksi', idn(m3.prevalensi_proxy_persen, 4) + '%', 'hitungan', '5.762 rek / 44,86 jt toko') +
        A.stat('Syarat FPR (PPV 50%)', idn(m3.fpr_maks_ppv50_skenario_proxy_persen, 4) + '%', 'hitungan', 'Pada sensitivitas 80%') +
        A.stat('Nilai Bruto Tertunda', 'Rp154,68 M', 'asumsi', '5 hari, porsi 50%, FPR 1%') +
      '</div>' +
      '<div class="card">' +
        '<div class="card-head-row"><div><div class="card-tag">TEOREMA BAYES</div><h3>Kurva Ketepatan (PPV) vs FPR</h3></div>' + badge('asumsi') + '</div>' +
        ppvCurve(m3.prevalensi_proxy_persen, m3.sensitivitas_asumsi) +
        '<div class="chart-legend mt8">' +
          '<span><i style="background:#1D5BD8"></i>Proksi (0,0128%)</span>' +
          '<span><i style="background:#94A3B8"></i>Rendah (0,005%)</span>' +
          '<span><i style="background:#0F766E"></i>Tinggi (0,050%)</span>' +
        '</div>' +
        tbl +
      '</div>' +
      '<div class="card">' +
        '<div class="card-head-row"><div><div class="card-tag">DAMPAK LIKUIDITAS UMKM</div><h3>Nilai Transaksi Bruto Tertunda</h3></div>' + badge('asumsi') + '</div>' +
        '<div class="tblwrap mt8"><table class="tbl"><thead><tr><th>Durasi</th><th class="r">Porsi</th><th class="r">Nilai Bruto (Rp Miliar)</th></tr></thead><tbody>' +
          imp.map(function (r) {
            return '<tr><td><b>' + r.hari + ' hari</b></td><td class="r num">' + r['porsi_transaksi_terganggu_%'] + '%</td><td class="r num font-bold">Rp' + idn(r.nilai_bruto_tengah_Rp_miliar, 2) + ' M</td></tr>';
          }).join('') +
        '</tbody></table></div>' +
        '<a class="btn block mt12" href="#/simulator/risiko">' + icon('sliders') + 'Buka Simulator Risiko Interaktif</a>' +
      '</div>';
  }

  // ---------- Spasial: Peta Interaktif 38 Provinsi & 514 Kabupaten/Kota ----------
  var kState = {
    layer: 'klaster',
    pulau: 'all',
    provIdx: -1,
    klaster: 'all',
    search: '',
    showLabels: false,
    zoom514: 100
  };

  function getProvinceCenter(dStr) {
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
    return '<div class="grid2 mb12">' +
        A.stat('Wilayah Pemetaan PDRB', '514 Kab/Kota', 'resmi', '38 Provinsi · 17 Sektor BPS') +
        A.stat('Hopkins Statistic (CLR)', idn(kl.hopkins, 4), 'hitungan', '>0,75 kecenderungan klaster kuat') +
        A.stat('Klaster 1 (Pertanian)', '292 Wilayah', 'hitungan', '56,81% kab/kota nasional') +
        A.stat('Klaster 3 &amp; 4 (Industri/Jasa)', '205 Wilayah', 'hitungan', '162 Industri + 43 Kota Jasa') +
      '</div>' +

      '<div class="card">' +
        '<div class="card-head-row">' +
          '<div>' +
            '<span class="card-tag">PEMETAAN TEMATIK SPASIAL 38 PROVINSI &amp; 514 KAB/KOTA</span>' +
            '<h3>Peta Interaktif Struktur Ekonomi Indonesia</h3>' +
          '</div>' +
          badge('hitungan') +
        '</div>' +
        '<p class="hint">Ketuk provinsi pada peta untuk melihat komposisi klaster kabupaten/kota, PDRB per kapita, dan pertumbuhan riil.</p>' +
        '<div class="map-toolbar mt8">' +
          '<select id="km-layer" class="filter-select">' +
            '<option value="klaster"' + (kState.layer === 'klaster' ? ' selected' : '') + '>Peta Dominasi Klaster Ekonomi (Ward K=4)</option>' +
            '<option value="pdrb"' + (kState.layer === 'pdrb' ? ' selected' : '') + '>Peta PDRB per Kapita ADHB (BPS)</option>' +
            '<option value="growth"' + (kState.layer === 'growth' ? ' selected' : '') + '>Peta Pertumbuhan PDRB Riil (%)</option>' +
            '<option value="peta514"' + (kState.layer === 'peta514' ? ' selected' : '') + '>Peta Choropleth 514 Kab/Kota (Detail)</option>' +
          '</select>' +
          '<div class="filter-controls">' +
            '<select id="km-pulau" class="filter-select">' +
              '<option value="all"' + (kState.pulau === 'all' ? ' selected' : '') + '>Semua Kepulauan</option>' +
              SP.pulauList.map(function (pl) {
                return '<option value="' + esc(pl) + '"' + (kState.pulau === pl ? ' selected' : '') + '>' + esc(pl) + '</option>';
              }).join('') +
            '</select>' +
            '<select id="km-prov" class="filter-select">' +
              '<option value="-1"' + (kState.provIdx === -1 ? ' selected' : '') + '>Semua Provinsi (38)</option>' +
              SP.provs.filter(function (pv) { return kState.pulau === 'all' || pv.pulau === kState.pulau; }).map(function (pv) {
                return '<option value="' + pv.idx + '"' + (kState.provIdx === pv.idx ? ' selected' : '') + '>' + esc(pv.nama) + ' (' + pv.nKab + ')</option>';
              }).join('') +
            '</select>' +
          '</div>' +
          '<div class="flex between">' +
            '<button type="button" class="chip ' + (kState.showLabels ? 'on' : '') + '" id="km-lbl-btn">' + icon('eye') + 'Label Nilai di Peta</button>' +
            '<button type="button" class="chip" id="km-reset-btn">' + icon('reset') + 'Reset Peta</button>' +
          '</div>' +
        '</div>' +
        '<div id="klaster-Interactive-Stage" class="mt8"></div>' +
      '</div>' +

      '<div class="sec-head"><h3>Profil 4 Klaster Struktur Ekonomi</h3><span class="small muted">17 Sektor BPS</span></div>' +
      kl.profil.map(function (c) {
        var barsHtml = (c.sektor_top || []).map(function (st) {
          return '<div class="sb-row">' +
            '<div class="sb-head"><span class="sb-label">' + esc(st.sektor) + '</span><span class="sb-val num">' + idn(st.pct, 1) + '%</span></div>' +
            '<div class="sb-track"><div class="sb-fill" style="width:' + Math.min(100, st.pct * 2.4) + '%;background:' + c.warna + '"></div></div>' +
          '</div>';
        }).join('');
        return '<div class="card cluster-card">' +
          '<div class="card-head-row">' +
            '<div class="flex"><span style="background:' + c.warna + ';width:12px;height:12px;border-radius:3px;display:inline-block"></span><b style="font-size:13.5px;color:var(--navy-900)">Klaster ' + c.id + ' &mdash; ' + esc(c.nama) + '</b></div>' +
            '<span class="badge b-resmi">' + c.n + ' Wilayah (' + idn(c.pct, 1) + '%)</span>' +
          '</div>' +
          '<p class="hint mt4">' + esc(c.deskripsi) + '</p>' +
          '<div class="mt8"><div class="card-tag">3 SEKTOR PDRB DOMINAN (RATA-RATA KLASTER)</div>' + barsHtml + '</div>' +
          '<button type="button" class="btn sec sm block mt8" data-filter-kl="' + c.id + '">Lihat ' + c.n + ' Kabupaten/Kota Klaster ' + c.id + ' &darr;</button>' +
        '</div>';
      }).join('') +

      '<div class="card" id="kab514-explorer">' +
        '<div class="card-head-row">' +
          '<div><span class="card-tag">DIREKTORI 514 KABUPATEN/KOTA</span><h3>Eksplorasi Klaster Wilayah</h3></div>' +
          '<span class="badge b-hitungan" id="kab514-count">514 Wilayah</span>' +
        '</div>' +
        '<div class="search mt8">' + icon('search') + '<input id="kab514-q" placeholder="Cari kabupaten/kota atau provinsi (Mis. Surabaya, Keerom, Medan)..." value="' + esc(kState.search) + '"></div>' +
        '<div class="chips">' +
          [['all', 'Semua (514)'], ['1', 'K1 (292)'], ['2', 'K2 (17)'], ['3', 'K3 (162)'], ['4', 'K4 (43)']].map(function (x) {
            return '<button type="button" class="chip ' + (String(kState.klaster) === x[0] ? 'on' : '') + '" data-kchip="' + x[0] + '">' + x[1] + '</button>';
          }).join('') +
        '</div>' +
        '<div id="kab514-table-box" class="mt8"></div>' +
      '</div>' +

      '<div class="card">' +
        '<div class="card-head-row"><div><span class="card-tag">DIAGNOSTIK KOMPUTASI (.IPYNB)</span><h3>Evaluasi Model Ruang CLR (Ward K=4)</h3></div>' + badge('hitungan') + '</div>' +
        '<p class="hint">' + esc(kl.metodologi) + '</p>' +
        '<div class="grid2 mt8">' +
          '<div class="mini-k"><b class="num">' + idn(kl.hopkins, 4) + '</b><span>Hopkins Statistic</span></div>' +
          '<div class="mini-k"><b class="num">' + idn(kl.k4.silhouette, 4) + '</b><span>Silhouette (Ward K=4)</span></div>' +
          '<div class="mini-k"><b class="num">' + idn(kl.k4.davies_bouldin, 4) + '</b><span>Davies–Bouldin (K=4)</span></div>' +
          '<div class="mini-k"><b class="num">' + idn(kl.k4.calinski_harabasz, 2) + '</b><span>Calinski–Harabasz</span></div>' +
        '</div>' +
        '<div class="tblwrap mt8"><table class="tbl"><thead><tr><th>Algoritma</th><th class="r">K</th><th class="r">Silhouette</th><th class="r">DBI</th><th class="r">CH</th><th class="r">Rank</th></tr></thead><tbody>' +
          kl.evaluasi_model.map(function (r) {
            var isSelected = r.k === 4 && r.algoritma.indexOf('Ward') >= 0;
            return '<tr style="' + (isSelected ? 'background:#EFF6FF;font-weight:700' : '') + '">' +
              '<td>' + esc(r.algoritma.replace(' (Euclidean CLR)', '')) + '</td>' +
              '<td class="r num">' + r.k + '</td>' +
              '<td class="r num">' + idn(r.silhouette, 3) + '</td>' +
              '<td class="r num">' + idn(r.davies_bouldin, 3) + '</td>' +
              '<td class="r num">' + idn(r.calinski_harabasz, 1) + '</td>' +
              '<td class="r num">' + idn(r.rank_gabungan, 2) + '</td>' +
            '</tr>';
          }).join('') +
        '</tbody></table></div>' +
        '<p class="warnnote mt8"><b>Bukan Peta Risiko Judi:</b> Klaster wilayah digunakan sebagai <b>Lapis 1 Pembanding Kontekstual</b> agar UMKM di daerah agraris (K1) tidak dibandingkan secara keliru dengan pusat komersial metropolitan (K4).</p>' +
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
        var s = [[224, 238, 255], [125, 174, 248], [29, 91, 216], [8, 30, 70]];
        var k = Math.min(2, Math.floor(t * 3)), f = t * 3 - k;
        var c = s[k].map(function (x, i) { return Math.round(x + (s[k + 1][i] - x) * f); });
        return 'rgb(' + c.join(',') + ')';
      }
      var g = pv.pertumbuhan;
      if (g < 0) return '#DC2626';
      if (g < 3) return '#93C5FD';
      if (g < 4.5) return '#2563EB';
      if (g < 6) return '#1E40AF';
      return '#081E46';
    }

    var mapContentHtml = '';
    if (kState.layer === 'peta514') {
      mapContentHtml =
        '<div class="map514-viewer">' +
          '<div class="map514-Head">' +
            '<span class="small font-bold">Peta Choropleth 514 Kab/Kota</span>' +
            '<div class="flex">' +
              '<button type="button" class="chip" id="z-out">' + icon('zoomOut') + '</button>' +
              '<span class="mono-badge">' + kState.zoom514 + '%</span>' +
              '<button type="button" class="chip" id="z-in">' + icon('zoomIn') + '</button>' +
              '<button type="button" class="chip on" id="z-back-vec">Peta Vektor</button>' +
            '</div>' +
          '</div>' +
          '<div class="map514-scroll">' +
            '<img src="assets/img/klaster_struktur_ekonomi.png" alt="Peta Klaster Struktur Ekonomi 514 Kabupaten/Kota" style="width:' + kState.zoom514 + '%;max-width:none;height:auto;display:block;margin:0 auto">' +
          '</div>' +
        '</div>';
    } else {
      var paths = provs.map(function (pv) {
        var isSel = kState.provIdx === pv.idx;
        var dimmed = kState.pulau !== 'all' && pv.pulau !== kState.pulau;
        var fill = colorForProv(pv);
        var stroke = isSel ? '#F5A524' : '#FFFFFF';
        var sw = isSel ? '2.4' : '0.85';
        return '<path data-pidx="' + pv.idx + '" d="' + pv.d + '" fill="' + fill + '" fill-opacity="' + (dimmed ? '0.35' : '0.94') + '" stroke="' + stroke + '" stroke-width="' + sw + '" style="cursor:pointer">' +
          '<title>' + esc(pv.nama) + ' (' + pv.nKab + ' Kab/Kota) — Dominan K' + pv.domKlaster + '</title>' +
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
            '<rect x="' + (c.cx - 15).toFixed(1) + '" y="' + (c.cy - 7).toFixed(1) + '" width="30" height="14" rx="4" fill="rgba(8,30,70,0.88)" stroke="#fff" stroke-width="0.6"/>' +
            '<text x="' + c.cx.toFixed(1) + '" y="' + (c.cy + 2.5).toFixed(1) + '" font-size="8" font-weight="700" fill="#FFFFFF" text-anchor="middle" font-family="JetBrains Mono,monospace">' + txt + '</text>' +
          '</g>';
        }).join('');
      }

      var legendOverlay = '';
      if (kState.layer === 'klaster') {
        legendOverlay =
          '<div class="map-legend-box">' +
            '<div class="mlb-items">' +
              '<span><i style="background:#013590"></i>K1 Pertanian (292)</span>' +
              '<span><i style="background:#dc88bf"></i>K2 Konstruksi/Pem (17)</span>' +
              '<span><i style="background:#84b547"></i>K3 Industri (162)</span>' +
              '<span><i style="background:#e92e2e"></i>K4 Jasa/Kota (43)</span>' +
            '</div>' +
          '</div>';
      } else if (kState.layer === 'pdrb') {
        legendOverlay =
          '<div class="map-legend-box">' +
            '<div class="mlb-grad" style="background:linear-gradient(90deg,#E0EEFF,#7DAEF8,#1D5BD8,#081E46)"></div>' +
            '<div class="flex between small muted"><span>Rp' + idn(loP / 1000, 1) + ' Jt</span><span>Rp' + idn(hiP / 1000, 1) + ' Jt</span></div>' +
          '</div>';
      } else {
        legendOverlay =
          '<div class="map-legend-box">' +
            '<div class="mlb-items">' +
              '<span><i style="background:#DC2626"></i>&lt;0%</span>' +
              '<span><i style="background:#93C5FD"></i>0–3%</span>' +
              '<span><i style="background:#2563EB"></i>3–4,5%</span>' +
              '<span><i style="background:#081E46"></i>&gt;4,5%</span>' +
            '</div>' +
          '</div>';
      }

      mapContentHtml =
        '<div class="vec-map-stage">' +
          '<svg class="chart vec-map-svg" viewBox="0 0 ' + P.w + ' ' + P.h + '">' + paths + labelsSvg + '</svg>' +
          legendOverlay +
          '<div class="map-sub-bar">' +
            '<span class="small muted">Ketuk provinsi di peta untuk inspeksi detail</span>' +
            '<button type="button" class="btn sec sm" id="switch-to-514">' + icon('map') + 'Peta 514 Kab/Kota</button>' +
          '</div>' +
        '</div>';
    }

    var selProv = kState.provIdx >= 0 ? provs[kState.provIdx] : null;
    var activeKabs = selProv ? selProv.kabs : SP.kabs.filter(function (kb) { return kState.pulau === 'all' || kb.pulau === kState.pulau; });
    var cCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    activeKabs.forEach(function (kb) { cCounts[kb.klaster] = (cCounts[kb.klaster] || 0) + 1; });
    var totActive = Math.max(1, activeKabs.length);

    var sidePanelHtml =
      '<div class="map-inspector mt8">' +
        '<div class="mi-head">' +
          '<span class="card-tag">' + (selProv ? 'PROVINSI TERPILIH &middot; ' + esc(selProv.pulau.toUpperCase()) : (kState.pulau !== 'all' ? 'AGREGAT KEPULAUAN' : 'AGREGAT NASIONAL 38 PROVINSI')) + '</span>' +
          '<h4>' + (selProv ? esc(selProv.nama) : (kState.pulau !== 'all' ? 'Kepulauan ' + esc(kState.pulau) : 'Seluruh Wilayah Indonesia')) + '</h4>' +
        '</div>' +
        (selProv ?
          '<div class="grid2 mt8">' +
            '<div class="mini-k"><b class="num">Rp' + idn(selProv.pdrbKapita / 1000, 2) + ' Jt</b><span>PDRB / Kapita</span></div>' +
            '<div class="mini-k"><b class="num">' + (selProv.pertumbuhan > 0 ? '+' : '') + idn(selProv.pertumbuhan, 2) + '%</b><span>Pertumbuhan Riil</span></div>' +
          '</div>' :
          '<div class="grid2 mt8">' +
            '<div class="mini-k"><b class="num">' + activeKabs.length + '</b><span>Kabupaten / Kota</span></div>' +
            '<div class="mini-k"><b class="num">' + (kState.pulau === 'all' ? 38 : provs.filter(function (p) { return p.pulau === kState.pulau; }).length) + '</b><span>Provinsi</span></div>' +
          '</div>') +
        '<div class="mt8">' +
          '<div class="card-tag">DISTRIBUSI KLASTER (' + activeKabs.length + ' KAB/KOTA)</div>' +
          [1, 2, 3, 4].map(function (cid) {
            var pr = SP.profById[cid];
            var n = cCounts[cid] || 0, pct = (n / totActive * 100);
            return '<div class="sb-row">' +
              '<div class="sb-head"><span class="sb-label"><i style="display:inline-block;width:8px;height:8px;border-radius:2px;background:' + pr.warna + ';margin-right:5px"></i>K' + cid + ' · ' + esc(pr.nama) + '</span><span class="sb-val num">' + n + ' (' + idn(pct, 1) + '%)</span></div>' +
              '<div class="sb-track"><div class="sb-fill" style="width:' + pct + '%;background:' + pr.warna + '"></div></div>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>';

    box.innerHTML = mapContentHtml + sidePanelHtml;

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
    if (cbadge) cbadge.textContent = filtered.length + ' Wilayah';
    var shown = filtered.slice(0, 60);
    tbox.innerHTML =
      '<div class="mi-kab-list">' +
        (shown.map(function (kb) {
          return '<div class="mi-kab-row">' +
            '<div><b>' + esc(kb.nama) + '</b><small class="block muted">' + esc(kb.provinsi) + ' &middot; ' + esc(kb.sektorDominan) + '</small></div>' +
            '<span class="kl-pill k' + kb.klaster + '">K' + kb.klaster + '</span>' +
          '</div>';
        }).join('') || '<div class="empty">Tidak ditemukan kabupaten/kota untuk filter ini.</div>') +
      '</div>' +
      (filtered.length > 60 ? '<p class="hint mt8">Menampilkan 60 dari ' + filtered.length + ' wilayah. Gunakan pencarian di atas untuk mencari kabupaten/kota spesifik.</p>' : '');
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
        if (exp && exp.scrollIntoView) exp.scrollIntoView({ behavior: 'smooth' });
      };
    });
  }

  // ---------- Simulator Level Merchant & Simulasi Risiko Bayes ----------
  var sim = { J: false, P: false, K: false, jdata: true, malam: true, seragam: true, sesaat: false, preset: 'angkringan' };
  var PRESETS = {
    angkringan: { n: 'Angkringan Malam', d: 'Ramai 21–03, Rp10–15rb, seragam (Tetap Hijau)', s: { J: false, P: false, K: false, jdata: true, malam: true, seragam: true, sesaat: false } },
    acara: { n: 'Warung Acara Lokal', d: 'Naik 2 hari saat acara, lalu normal (Tetap Hijau)', s: { J: false, P: false, K: false, jdata: true, malam: false, seragam: false, sesaat: true } },
    pulsa: { n: 'Konter Pulsa', d: 'Nominal paket tetap sepanjang hari (Tetap Hijau)', s: { J: false, P: false, K: false, jdata: true, malam: false, seragam: true, sesaat: false } },
    satu: { n: 'Anomali 1 Pilar', d: 'Volume naik, tapi jejaring & profil wajar (Kuning)', s: { J: false, P: true, K: false, jdata: true, malam: false, seragam: false, sesaat: false } },
    datakurang: { n: 'ID Pembayar <70%', d: 'Pilar J berstatus Data Kurang (Hijau)', s: { J: false, P: false, K: false, jdata: false, malam: false, seragam: false, sesaat: false } },
    baru: { n: 'Konvergensi 3 Pilar', d: 'Toko baru melonjak + pembayar bersama (Oranye)', s: { J: true, P: true, K: true, jdata: true, malam: false, seragam: true, sesaat: false } }
  };

  var amb = { fpr: 1, sens: 80, prev: null, dua: false, porsi: 50, hari: 5 };

  function viewSimulator(tab) {
    tab = tab || 'risiko';
    if (tab === 'ambang') tab = 'risiko';
    var tabs = '<div class="tabs">' +
      '<button type="button" class="' + (tab === 'risiko' ? 'on' : '') + '" data-t="risiko">Simulasi Risiko Bayes</button>' +
      '<button type="button" class="' + (tab === 'level' ? 'on' : '') + '" data-t="level">Simulator 4-Level UMKM</button>' +
    '</div>';
    shell(tab === 'level' ? 'Simulator Aturan 4-Level' : 'Simulasi Risiko (Bayes)', tab === 'level' ? 'Uji aturan konvergensi 2-dari-3 sinyal kuat & sinyal lemah' : 'Trade-off FPR, ketepatan PPV & dampak UMKM', tabs + '<div id="simbody"></div>', { nav: 'sim-risiko' });
    A.app.querySelectorAll('[data-t]').forEach(function (b) { b.onclick = function () { location.hash = '#/simulator/' + b.dataset.t; }; });
    if (tab === 'level') simLevel(); else simAmbang();
  }

  function simLevel() {
    var el = A.app.querySelector('#simbody'), J = sim.jdata && sim.J, n = (J ? 1 : 0) + (sim.P ? 1 : 0) + (sim.K ? 1 : 0);
    var r = T.tentukanLevel({ nGroups: n, weak: { malam: sim.malam, seragam: sim.seragam, sesaat: sim.sesaat } }), lv = r.level;
    var why = r.alasan + (lv === 'oranye' ? ' Pembatasan (Merah) tetap wajib melalui verifikasi bukti manusia dan persetujuan 2 pejabat.' : '') + (!sim.jdata ? ' Pilar J berstatus Data Tidak Memadai.' : '');
    var pres = Object.keys(PRESETS).map(function (k) {
      return '<button type="button" class="' + (sim.preset === k ? 'on' : '') + '" data-p="' + k + '"><b>' + PRESETS[k].n + '</b><span>' + PRESETS[k].d + '</span></button>';
    }).join('');
    function tg(k, t, s, tag, dis) {
      return '<div class="toggle' + (dis ? ' dis' : '') + '">' +
        '<div class="tx"><b>' + t + '<span class="tag ' + tag + '">' + (tag === 'w' ? 'Lemah' : 'Pilar ' + tag.toUpperCase()) + '</span></b><span>' + s + '</span></div>' +
        '<label class="switch"><input type="checkbox" data-k="' + k + '" ' + (sim[k] && !dis ? 'checked' : '') + (dis ? ' disabled' : '') + '><span></span></label>' +
      '</div>';
    }
    el.innerHTML =
      '<div class="result r-' + lv + '">' +
        '<div class="small" style="opacity:.88;font-weight:700;text-transform:uppercase;letter-spacing:.05em">Keputusan Penapisan Otomatis</div>' +
        '<div class="lvname mt4">' + U.LV[lv] + ' &middot; ' + U.LVDESC[lv] + '</div>' +
        '<p class="mt8">' + why + '</p>' +
      '</div>' +
      '<div class="card">' +
        '<div class="card-tag">SKENARIO CEPAT UMKM</div><h3>Pilih Profil Usaha</h3>' +
        '<div class="presets mt8">' + pres + '</div>' +
      '</div>' +
      '<div class="card">' +
        '<div class="card-tag">TIGA PILAR SINYAL KUAT (J &middot; P &middot; K)</div><h3>Sakelar Konvergensi (Syarat &ge;2)</h3>' +
        tg('jdata', 'Cakupan ID Pembayar Memadai (&ge;70%)', 'Syarat kelayakan data sebelum graf dievaluasi', 'j') +
        tg('J', 'Pilar J — Jejaring Pembayar Lintas Toko', 'Pembayar bersama tinggi (&ge;25% derajat 3+)', 'j', !sim.jdata) +
        tg('P', 'Pilar P — Perilaku Relatif Sebaya', 'Deviasi volume persisten (Robust Z &ge; 3,5)', 'p') +
        tg('K', 'Pilar K — Profil &amp; Konteks Wilayah', 'Toko baru melonjak / tiket menyimpang / rujukan', 'k') +
      '</div>' +
      '<div class="card">' +
        '<div class="card-tag">GARANSI PERLINDUNGAN UMKM</div><h3>Sinyal Lemah (Bukan Bukti)</h3>' +
        tg('malam', 'Operasional Malam Hari (22.00–05.00)', 'Lumrah bagi angkringan &amp; kuliner malam', 'w') +
        tg('seragam', 'Nominal Seragam / Harga Paket', 'Lumrah bagi konter pulsa &amp; makanan satu harga', 'w') +
        tg('sesaat', 'Lonjakan Sesaat (1–3 Hari)', 'Lumrah saat akhir pekan atau acara lokal', 'w') +
      '</div>';

    el.querySelectorAll('[data-p]').forEach(function (b) { b.onclick = function () { var p = PRESETS[b.dataset.p]; Object.assign(sim, p.s); sim.preset = b.dataset.p; simLevel(); }; });
    el.querySelectorAll('[data-k]').forEach(function (c) { c.onchange = function () { sim[c.dataset.k] = c.checked; sim.preset = ''; simLevel(); }; });
  }

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
      '<div class="card risk-main">' +
        '<div class="card-head-row">' +
          '<div><div class="card-tag" id="amb-tag-desc">INDIKATOR UTAMA &middot; SKENARIO PROKSI</div><h3>Ketepatan &amp; Beban Pemeriksaan</h3></div>' +
          badge('asumsi') +
        '</div>' +
        '<div class="risk-primary mt8">' +
          '<div class="risk-primary-value num" id="amb-ppv-val">0%</div>' +
          '<div><div class="risk-primary-label">Ketepatan Penapisan (PPV)</div><p class="hint">Proporsi merchant benar-benar bermasalah dari seluruh yang ditandai.</p></div>' +
        '</div>' +
        '<div class="risk-kpis">' +
          '<div class="risk-kpi"><span>Terindikasi Benar (TP)</span><strong class="num" id="amb-tp-val">0</strong></div>' +
          '<div class="risk-kpi risk-kpi-warn"><span>UMKM Salah Ditandai (FP)</span><strong class="num" id="amb-fp-val">0</strong></div>' +
          '<div class="risk-kpi risk-kpi-total"><span>Total Perlu Verifikasi (TP+FP)</span><strong class="num" id="amb-tot-val">0</strong></div>' +
        '</div>' +
        '<p id="amb-cap-note" class="note"></p>' +
      '</div>' +

      '<div class="card">' +
        '<div class="card-tag">PANEL KONTROL PARAMETER</div><h3>Geser Asumsi Skenario</h3>' +
        '<div class="field mt8">' +
          '<label>Risiko Salah Menandai UMKM (FPR): <strong class="num" id="lbl-fpr">1,00%</strong></label>' +
          '<input type="range" id="fpr" min="0" max="1000" value="' + sliderPos + '">' +
        '</div>' +
        '<div class="field">' +
          '<label>Sensitivitas Deteksi: <strong class="num" id="lbl-sens">' + amb.sens + '%</strong></label>' +
          '<input type="range" id="sens" min="50" max="95" value="' + amb.sens + '">' +
        '</div>' +
        '<div class="field">' +
          '<label>Skenario Prevalensi (&pi;)</label>' +
          '<div class="chips">' +
            prevOptions.map(function (p) {
              return '<button type="button" class="chip ' + (Math.abs(amb.prev - p[0]) < 1e-9 ? 'on' : '') + '" data-pv="' + p[0] + '">' + p[1] + ' &middot; ' + idn(p[0], p[0] === base ? 4 : 3) + '%</button>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div class="toggle">' +
          '<div class="tx"><b>Syarat Konvergensi 2-dari-3 Pilar</b><span>Menekan FPR efektif dengan rumus <code>3p&sup2;(1&minus;p) + p&sup3;</code>.</span></div>' +
          '<label class="switch"><input type="checkbox" id="dua" ' + (amb.dua ? 'checked' : '') + '><span></span></label>' +
        '</div>' +
        '<div class="field mt8">' +
          '<label>Porsi Transaksi Terganggu: <strong id="lbl-porsi">' + amb.porsi + '%</strong></label>' +
          '<div class="chips">' +
            [25, 50, 100].map(function (v) {
              return '<button type="button" class="chip ' + (amb.porsi === v ? 'on' : '') + '" data-po="' + v + '">' + v + '%</button>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div class="field">' +
          '<label>Durasi Pemeriksaan: <strong id="lbl-hari">' + amb.hari + ' hari</strong></label>' +
          '<input type="range" id="hari" min="1" max="10" value="' + amb.hari + '">' +
        '</div>' +
      '</div>' +

      '<div class="card">' +
        '<div class="card-tag">KURVA TEOREMA BAYES</div><h3>Hubungan FPR dan Ketepatan (PPV)</h3>' +
        '<div id="amb-curve-box" class="mt8"></div>' +
        '<div class="chart-legend mt8">' +
          '<span><i style="background:#1D5BD8"></i>Terpilih</span>' +
          '<span><i style="background:#94A3B8"></i>Rendah</span>' +
          '<span><i style="background:#0F766E"></i>Tinggi</span>' +
          '<span><i style="background:#D97706"></i>PPV 50%</span>' +
        '</div>' +
      '</div>' +

      '<div class="card">' +
        '<div class="card-tag">DAMPAK LIKUIDITAS UMKM</div><h3>Nilai Transaksi Bruto Tertunda</h3>' +
        '<div class="stat mt8"><div class="lab">FP &times; GMV Harian &times; Durasi &times; Porsi</div><div class="val num" id="amb-bruto-val">Rp0 miliar</div></div>' +
        '<p class="note mt8">Merupakan transaksi bruto yang berpotensi tertunda sementara apabila dilakukan pembatasan naif tanpa verifikasi manusia.</p>' +
      '</div>';

    function updateAmbangDOM() {
      var r = ambCalc(amb), K = A.kapasitas();
      var tpShown = Math.round(r.tp), fpShown = Math.round(r.fp), total = tpShown + fpShown;
      var prevDesc = Math.abs(amb.prev - 0.005) < 1e-9 ? 'Rendah (0,005%)' : (Math.abs(amb.prev - 0.05) < 1e-9 ? 'Tinggi (0,050%)' : 'Proksi (' + idn(base, 4) + '%)');
      el.querySelector('#amb-tag-desc').textContent = 'SKENARIO ' + prevDesc.toUpperCase() + (amb.dua ? ' · 2-DARI-3 AKTIF' : '');
      el.querySelector('#amb-ppv-val').textContent = idn(r.ppv * 100, 1) + '%';
      el.querySelector('#amb-tp-val').textContent = idn(tpShown);
      el.querySelector('#amb-fp-val').textContent = idn(fpShown);
      el.querySelector('#amb-tot-val').textContent = idn(total);
      el.querySelector('#amb-bruto-val').textContent = 'Rp' + idn(r.bruto / 1e9, 2) + ' miliar';
      el.querySelector('#lbl-fpr').textContent = idn(amb.fpr, amb.fpr < 0.01 ? 4 : amb.fpr < 0.1 ? 3 : 2) + '%' + (amb.dua ? ' (Efektif: ' + idn(r.fe * 100, 5) + '%)' : '');
      el.querySelector('#lbl-sens').textContent = amb.sens + '%' + (amb.dua ? ' (Efektif: ' + idn(r.se * 100, 1) + '%)' : '');
      el.querySelector('#lbl-porsi').textContent = amb.porsi + '%';
      el.querySelector('#lbl-hari').textContent = amb.hari + ' hari';

      var capNote = el.querySelector('#amb-cap-note');
      capNote.className = r.fp > r.tp ? 'warnnote' : 'note';
      capNote.innerHTML = 'Menuntaskan <b>' + idn(total) + ' merchant</b> dengan kapasitas tim (<b>' + idn(K) + ' kasus/hari</b>) memerlukan sekitar <b>' + idn(K > 0 ? Math.ceil(total / K) : 0) + ' hari kerja</b>.';

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
