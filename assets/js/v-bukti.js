/* TAPIS: Pusat Bukti dan Simulator risiko berbasis perhitungan Bayes. */
(function () {
  'use strict';
  var A = window.A, T = A.T, U = A.U, H = A.H, R = A.R, S = A.S, icon = U.icon, idn = U.idn, rp = U.rp, esc = U.esc, badge = U.badge, level = U.level;
  var shell = A.shell, cu = A.cu, BULAN = A.BULAN, app = A.app;
  var bTab = 'ringkas';
  function bln(s) { return A.bln(s); }
  function viewBukti(tab) {
    bTab = tab || bTab;
    if (bTab === 'peta') bTab = 'klaster';
    var tabs = [['ringkas', 'Ringkasan'], ['m1', 'Deposit'], ['m2', 'Laporan'], ['m3', 'Simulasi Risiko'], ['klaster', 'Klaster Wilayah']].map(function (t) { return '<button class="' + (bTab === t[0] ? 'on' : '') + '" data-t="' + t[0] + '">' + t[1] + '</button>'; }).join('');
    var body = '<div class="tabs">' + tabs + '</div>' + ({ ringkas: bRingkas, m1: bM1, m2: bM2, m3: bM3, klaster: bKlaster }[bTab] || bRingkas)();
    shell('Pusat bukti', 'Angka resmi PPATK, Bank Indonesia, dan BPS', body, { nav: 'bukti' });
    A.app.querySelectorAll('[data-t]').forEach(function (b) { b.onclick = function () { location.hash = '#/bukti/' + b.dataset.t; }; });
  }
  function bRingkas() {
    var d = H.deposit, m = H.m2, m3 = H.m3;
    return '<div class="grid2">' + A.stat('Merchant QRIS (96,68% UMKM)', cu(H.qris.merchant_juta, 2, '', ' juta'), 'resmi', 'BI 2026') + A.stat('Transaksi QRIS Sem I 2026', cu(H.qris.volume_miliar, 2, '', ' miliar'), 'resmi', 'BI 2026') +
      A.stat('Frekuensi deposit judi daring lewat QRIS', cu(87.66, 2, '', '%'), 'resmi', 'PPATK 2026') + A.stat('Rata-rata deposit lewat QRIS', cu(Math.round(d.rata2_qris_rp), 0, 'Rp'), 'hitungan', 'dari PPATK 2026') + '</div>' +
      '<div class="card mt12"><div class="card-tag">SINTESIS TEMUAN</div><h3>Tiga Temuan Kunci dari Data Resmi</h3>' +
      '<div class="reason"><span class="ic on">1</span><div><b>Deposit lebih sering, nominal lebih kecil (M1)</b><p>Frekuensi naik ' + idn((d.frek_sem1_2026_juta / d.frek_sem1_2025_juta - 1) * 100, 1) + '%, rata-rata nominal turun ' + idn((1 - d.rata2_2026_rp / d.rata2_2025_rp) * 100, 1) + '%. Rata-rata deposit QRIS (' + rp(d.rata2_qris_rp) + ') lebih rendah daripada rata-rata transaksi QRIS (' + rp(H.qris.rata2_transaksi_rp) + ').</p></div></div>' +
      '<div class="reason"><span class="ic on">2</span><div><b>Laporan indikasi perjudian menurun (M2)</b><p>Tren menurun signifikan (Mann-Kendall Z = ' + idn(m.mk_Z_ties, 2) + '; p = ' + idn(m.mk_p_ties, 4) + '; TFPW Z = ' + idn(m.mk_tfpw_Z, 2) + '; p = ' + idn(m.mk_tfpw_p, 4) + '). Titik patah BIC (' + m.patah_bic.map(bln).join(' dan ') + ') bersifat eksploratif.</p></div></div>' +
      '<div class="reason"><span class="ic on">3</span><div><b>Risiko salah menandai perlu ditekan (M3)</b><p>Pada prevalensi proksi ' + idn(m3.prevalensi_proxy_persen, 4) + '% dan sensitivitas 80%, ketepatan 50% mensyaratkan FPR maksimum ' + idn(m3.fpr_maks_ppv50_skenario_proxy_persen, 4) + '%. TAPIS menekannya dengan syarat minimal dua kelompok sinyal dan audit analis.</p></div></div></div>' +
      '<p class="warnnote">Data agregat nasional, bukan tolok ukur kapasitas pemeriksa.</p>';
  }
  function bM1() {
    var dep = R.deposit.filter(function (r) { return r.kanal === 'Semua kanal'; });
    var yr = ['2023', '2024', '2025', 'Sem I 2026'].map(function (p) { var r = dep.filter(function (x) { return x.periode === p; })[0]; return { l: p, v: r.nilai_rp / 1e12, t: 'Rp' + idn(r.nilai_rp / 1e12, 1) + ' T', c: p === 'Sem I 2026' ? '#1E5BD8' : '#94A3B8' }; });
    var d = H.deposit, mx = Math.max(Math.abs(d.efek_frek_T), Math.abs(d.efek_rata2_T));
    function hb(lab, v, col) { var w = Math.abs(v) / mx * 130; return '<div style="display:flex;align-items:center;gap:8px;margin:8px 0"><span style="width:92px;font-size:11.5px">' + lab + '</span><div style="flex:1;position:relative;height:22px"><div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:#CBD5E1"></div><div class="hbar' + (v < 0 ? ' neg' : '') + '" style="position:absolute;top:2px;height:18px;border-radius:5px;background:' + col + ';' + (v >= 0 ? 'left:50%' : 'right:50%') + ';width:' + (Math.abs(v) / mx * 48) + '%"></div></div><b class="num" style="width:74px;text-align:right;font-size:12px">' + (v < 0 ? '-' : '+') + 'Rp' + idn(Math.abs(v), 2) + ' T</b></div>'; }
    var cmp = [{ l: 'Deposit QRIS', v: d.rata2_qris_rp, c: '#E0413A', t: rp(d.rata2_qris_rp) }, { l: 'Transaksi QRIS', v: H.qris.rata2_transaksi_rp, c: '#1E5BD8', t: rp(H.qris.rata2_transaksi_rp) }, { l: 'Batas MDR 0%', v: 100000, c: '#CBD5E1', t: 'Rp100.000' }];
    return '<div class="card"><div class="flex between"><div><div class="card-tag">DATA AGREGAT NASIONAL</div><h3>Nilai Deposit Judi Daring</h3></div>' + badge('resmi') + '</div>' + U.bars(yr) + A.src('PPATK, Laporan Semester I 2026, hal. 29.') + '</div>' +
      '<div class="card"><div class="flex between"><div><div class="card-tag">DEKOMPOSISI KITAGAWA (1955)</div><h3>Dekomposisi Perubahan Nilai</h3></div>' + badge('hitungan') + '</div><p class="hint">Sem I 2025 ke Sem I 2026: nilai naik ' + idn((Math.exp(d.log_total) - 1) * 100, 1) + '%.</p>' +
      hb('Efek frekuensi', d.efek_frek_T, '#1E5BD8') + hb('Efek rata-rata', d.efek_rata2_T, '#E0413A') + hb('Perubahan total', d.efek_frek_T + d.efek_rata2_T, '#0B2A5B') +
      '<p class="note">Kenaikan frekuensi hampir seluruhnya diimbangi turunnya nominal per transaksi, sesuai pola "nominal kecil, berulang, dan tersebar" menurut PPATK.</p>' + A.src('PPATK, Siaran Pers B/04/HM.05/3.1/VIII/2026; dekomposisi Kitagawa (1955).') + '</div>' +
      '<div class="card"><div class="flex between"><div><div class="card-tag">PERBANDINGAN BELANJA DAN JUDI</div><h3>Nominal Bukan Pembeda Tunggal</h3></div>' + badge('hitungan') + '</div>' + U.bars(cmp, { max: 115000 }) +
      '<p class="note">Deposit QRIS rata-rata lebih kecil daripada transaksi QRIS dan di bawah batas MDR 0% (berlaku 1 Oktober 2026), sehingga aturan berbasis nominal berisiko menandai warung secara keliru.</p>' + A.src('PPATK 2026; BI, Siaran Pers 28/159/DKom; diolah.') + '</div>';
  }
  function bM2() {
    var m = H.m2, s = m.deret, W = 340, Hh = 190, L = 40, Rr = 6, Tt = 12, B = 24, n = s.length, mx = 22000;
    var X = function (i) { return L + (W - L - Rr) * (i + 0.5) / n; }, Y = function (v) { return Tt + (Hh - Tt - B) * (1 - v / mx); }, bw = (W - L - Rr) / n;
    var startIdx = s.findIndex(function (r) { return r.bulan === '2024-07'; });
    var segs = m.segmen, cuts = [startIdx].concat(m.segmen_awal.map(function (b) { return s.findIndex(function (r) { return r.bulan === b; }); })).concat([n]);
    var grid = U.axisY(0, mx, 4).map(function (v) { return '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke="#E8EEF7"/><text x="' + (L - 4) + '" y="' + (Y(v) + 3) + '" font-size="8.5" text-anchor="end" fill="#94A3B8">' + idn(v) + '</text>'; }).join('');
    var bars = s.map(function (r, i) { return '<rect class="gb" x="' + (X(i) - bw * 0.36) + '" y="' + Y(r.perjudian) + '" width="' + (bw * 0.72) + '" height="' + (Hh - B - Y(r.perjudian)) + '" fill="' + (i < startIdx ? '#E3EAF5' : '#BFD3F5') + '" rx="1"/>'; }).join('');
    var seg = segs.map(function (g, j) { var a = X(cuts[j]) - bw / 2, b = X(cuts[j + 1] - 1) + bw / 2; return '<rect x="' + a + '" y="' + Y(g.CI95_atas_HAC) + '" width="' + (b - a) + '" height="' + (Y(g.CI95_bawah_HAC) - Y(g.CI95_atas_HAC)) + '" fill="#1E5BD8" opacity=".18"/><line x1="' + a + '" x2="' + b + '" y1="' + Y(g.rata2_geometrik) + '" y2="' + Y(g.rata2_geometrik) + '" stroke="#1E5BD8" stroke-width="2.4"/><text x="' + ((a + b) / 2) + '" y="' + (Y(g.CI95_atas_HAC) - 4) + '" font-size="9.5" font-weight="700" text-anchor="middle" fill="#0B2A5B">' + idn(g.rata2_geometrik) + '</text>'; }).join('');
    var br = cuts.slice(1, -1).map(function (c) { return '<line x1="' + (X(c) - bw / 2) + '" x2="' + (X(c) - bw / 2) + '" y1="' + Tt + '" y2="' + (Hh - B) + '" stroke="#E0413A" stroke-dasharray="3 3"/>'; }).join('');
    var xl = s.map(function (r, i) { return r.bulan.slice(5) === '01' || i === 0 ? '<text x="' + X(i) + '" y="' + (Hh - 8) + '" font-size="8.5" text-anchor="middle" fill="#64748B">' + (r.bulan.slice(5) === '01' ? r.bulan.slice(0, 4) : 'Jun 24') + '</text>' : ''; }).join('');
    var chart = '<svg class="chart" viewBox="0 0 ' + W + ' ' + Hh + '">' + grid + bars + seg + br + xl + '</svg>';
    var cus = m.cusum_2026, cmn = -7, cW = 340, cH = 160, hLim = -4;
    var cX = function (i) { return 30 + (cW - 40) * i / (cus.length - 1); }, cY = function (v) { return 10 + (cH - 34) * (v / cmn); };
    var cline = cus.map(function (r, i) { return (i ? 'L' : 'M') + cX(i) + ',' + cY(r.CUSUM_bawah); }).join('');
    var cdots = cus.map(function (r, i) { return '<circle cx="' + cX(i) + '" cy="' + cY(r.CUSUM_bawah) + '" r="3.2" fill="' + (r.status ? '#E0413A' : '#1E5BD8') + '"/><text x="' + cX(i) + '" y="' + (cH - 8) + '" font-size="8.5" text-anchor="middle" fill="#64748B">' + BULAN[+r.bulan.slice(5) - 1].slice(0, 3) + '</text>'; }).join('');
    var cyt = [0, -2, -4, -6].map(function (v) { return '<text x="24" y="' + (cY(v) + 3) + '" font-size="8.5" text-anchor="end" fill="#94A3B8">' + v + '</text>'; }).join('');
    var cchart = '<svg class="chart" viewBox="0 0 ' + cW + ' ' + cH + '">' + cyt + '<line x1="30" x2="' + (cW - 10) + '" y1="' + cY(hLim) + '" y2="' + cY(hLim) + '" stroke="#E0413A" stroke-dasharray="4 3"/><text x="' + (cW - 12) + '" y="' + (cY(hLim) - 4) + '" font-size="8.5" text-anchor="end" fill="#E0413A">batas ilustratif h = 4</text><line x1="30" x2="' + (cW - 10) + '" y1="' + cY(0) + '" y2="' + cY(0) + '" stroke="#E8EEF7"/><path class="ln" pathLength="1" d="' + cline + '" fill="none" stroke="#1E5BD8" stroke-width="2.2"/>' + cdots + '</svg>';
    var pel = R.pelapor.map(function (r) { return '<tr><td>' + esc(r.kelompok_pelapor.replace('Penyelenggara e-money dan/atau e-wallet', 'Penyelenggara e-money/e-wallet')) + '</td><td class="r num">' + idn(r['2024_jan_sep']) + '</td><td class="r num">' + idn(r['2025_jan_sep']) + '</td><td class="r num">' + idn(r['2026_jan_sep']) + '</td></tr>'; }).join('');
    var em = R.pelapor.filter(function (r) { return /e-money/.test(r.kelompok_pelapor); })[0];
    return '<div class="card"><div class="flex between"><div><div class="card-tag">TREN DERET WAKTU LTKM</div><h3>Indikasi Perjudian per Bulan</h3></div>' + badge('resmi') + '</div><p class="hint">Batang: jumlah laporan. Garis: rata-rata geometrik segmen. Pita: CI 95% (HAC). Garis putus: awal segmen baru menurut BIC.</p>' + chart + A.src('PPATK, Buletin Statistik APUPPT edisi Juni 2025, Oktober 2025, dan September 2026, Tabel 5; diolah.') + '</div>' +
      '<div class="card"><div class="flex between"><div><div class="card-tag">UJI HIPOTESIS STATISTIK</div><h3>Hasil Uji Tren dan Titik Patah</h3></div>' + badge('hitungan') + '</div><table class="mini mt8"><tbody>' +
      '<tr><td>Mann-Kendall, koreksi ties</td><td class="r num">Z = ' + idn(m.mk_Z_ties, 3) + '; p = ' + idn(m.mk_p_ties, 4) + '</td></tr>' +
      '<tr><td><b>Mann-Kendall TFPW</b> (uji utama bila ada autokorelasi)</td><td class="r num"><b>Z = ' + idn(m.mk_tfpw_Z, 3) + '; p = ' + idn(m.mk_tfpw_p, 4) + '</b></td></tr>' +
      '<tr><td>Autokorelasi untuk TFPW</td><td class="r num">rho = ' + idn(m.rho_tfpw, 3) + '</td></tr>' +
      '<tr><td>Kemiringan Sen</td><td class="r num">' + idn(m.sen_persen_per_bulan, 2) + '% per bulan</td></tr>' +
      '<tr><td>OLS-CUSUM</td><td class="r num">' + idn(m.cusum_ols_stat, 3) + '; p = ' + idn(m.cusum_ols_p, 4) + '</td></tr>' +
      '<tr><td>sup-F (Andrews)</td><td class="r num">' + idn(m.supF, 2) + ' pada ' + bln(m.supF_tanggal) + '</td></tr>' +
      '<tr><td>p bootstrap sup-F, IID</td><td class="r num">' + idn(m.supF_p_iid, 4) + '</td></tr>' +
      '<tr><td>p bootstrap sup-F, AR(1) di bawah H0 (rho = ' + idn(m.rho_ar1_null, 3) + ')</td><td class="r num">' + idn(m.supF_p_ar1_null, 4) + '</td></tr>' +
      '<tr><td>Titik patah BIC</td><td class="r num">' + m.patah_bic.map(bln).join(', ') + '</td></tr>' +
      '<tr><td>Jan-Sep 2025 dan 2026</td><td class="r num">' + idn(m.jan_sep_2025) + ' dan ' + idn(m.jan_sep_2026) + '</td></tr></tbody></table>' +
      '<p class="warnnote">Tren menurun kuat, tetapi patahan tunggal Desember 2024 tidak bertahan pada bootstrap AR(1) di bawah H0 (p = ' + idn(m.supF_p_ar1_null, 2) + '). Titik patah BIC bersifat eksploratif. Penurunan LTKM bukan ukuran kinerja lembaga, bukan uji dampak kebijakan, dan bukan jumlah pelaku atau kapasitas pemeriksaan.</p></div>' +
      '<div class="card"><div class="flex between"><div><div class="card-tag">DETEKSI PERUBAHAN CUSUM</div><h3>CUSUM Bawah 2026 terhadap Acuan 2025</h3></div>' + badge('hitungan') + '</div><p class="hint">Alarm pertama: ' + bln(m.cusum_alarm_pertama) + '. Parameter k = 0,5 dan h = 4 bersifat <b>ilustratif</b>; CUSUM atas per merchant di TAPIS (k = ' + T.CONFIG.cusum.k + ', h = ' + T.CONFIG.cusum.h + ') juga belum dikalibrasi dengan data berlabel.</p>' + cchart + A.src('PPATK, Buletin APUPPT September 2026; CUSUM Page (1954).') + '</div>' +
      '<div class="card"><div class="flex between"><div><div class="card-tag">DATA PELAPORAN NASIONAL</div><h3>LTKM per Kelompok Pelapor, Jan-Sep</h3></div>' + badge('resmi') + '</div><p class="hint">LTKM: Laporan Transaksi Keuangan Mencurigakan yang diterima PPATK (seluruh jenis tindak pidana).</p><table class="mini mt8"><thead><tr><th>Pelapor</th><th class="r">2024</th><th class="r">2025</th><th class="r">2026</th></tr></thead><tbody>' + pel + '</tbody></table>' +
      (em ? '<p class="note">Laporan e-money/e-wallet turun ' + idn((1 - em['2026_jan_sep'] / em['2024_jan_sep']) * 100, 1) + '% (Jan-Sep 2024 ke 2026). Ini statistik nasional, bukan ukuran kinerja pemeriksa.</p>' : '') + A.src('PPATK, Buletin APUPPT September 2026, Tabel 2.') + '</div>';
  }
  function ppvCurve(prev, sens, mark) {
    var W = 340, Hh = 170, L = 30, Rr = 8, Tt = 10, B = 26, lo = Math.log10(0.001), hi = Math.log10(2);
    var X = function (f) { return L + (W - L - Rr) * (Math.log10(f) - lo) / (hi - lo); }, Y = function (p) { return Tt + (Hh - Tt - B) * (1 - p / 100); };
    function path(pv, col, w, cls) { var d = ''; for (var k = 0; k <= 80; k++) { var f = Math.pow(10, lo + (hi - lo) * k / 80); d += (k ? 'L' : 'M') + X(f).toFixed(1) + ',' + Y(100 * T.ppv(sens, pv / 100, f / 100)).toFixed(1); } return '<path ' + (cls ? 'class="ln" pathLength="1" ' : '') + 'd="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + w + '"/>'; }
    var g = [0, 25, 50, 75, 100].map(function (p) { return '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + Y(p) + '" y2="' + Y(p) + '" stroke="#E8EEF7"/><text x="' + (L - 4) + '" y="' + (Y(p) + 3) + '" font-size="8.5" text-anchor="end" fill="#94A3B8">' + p + '</text>'; }).join('');
    var xt = [0.001, 0.01, 0.1, 1].map(function (f) { return '<text x="' + X(f) + '" y="' + (Hh - 10) + '" font-size="8.5" text-anchor="middle" fill="#64748B">' + idn(f, f < 0.01 ? 3 : f < 0.1 ? 2 : f < 1 ? 1 : 0) + '%</text>'; }).join('');
    var mk = mark ? '<line x1="' + X(mark) + '" x2="' + X(mark) + '" y1="' + Tt + '" y2="' + (Hh - B) + '" stroke="#0B2A5B" stroke-dasharray="3 3"/><circle cx="' + X(mark) + '" cy="' + Y(100 * T.ppv(sens, prev / 100, mark / 100)) + '" r="4.5" fill="#0B2A5B"/>' : '';
    return '<svg class="chart risk-curve" role="img" aria-label="Grafik hubungan risiko salah menandai dan ketepatan hasil penapisan" viewBox="0 0 ' + W + ' ' + Hh + '">' + g + '<text x="8" y="85" font-size="8.5" text-anchor="middle" fill="#64748B" transform="rotate(-90 8 85)">Ketepatan (%)</text>' + '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + Y(50) + '" y2="' + Y(50) + '" stroke="#F5A524" stroke-dasharray="2 3"/>' + path(0.005, '#CBD5E1', 1.3) + path(0.05, '#33507F', 1.3) + path(prev, '#1E5BD8', 2.6, 1) + mk + xt + '<text x="' + ((W + L) / 2) + '" y="' + (Hh - 0) + '" font-size="8.5" text-anchor="middle" fill="#94A3B8">Risiko salah menandai per merchant (%)</text></svg>';
  }
  function bM3() {
    var m3 = H.m3, rows = m3.ppv_skenario, groups = {};
    rows.forEach(function (r) { (groups[r.skenario_prevalensi] = groups[r.skenario_prevalensi] || []).push(r); });
    var tbl = Object.keys(groups).map(function (k) {
      return '<h4 class="mt12" style="margin:12px 0 4px">' + esc(k) + '</h4><div class="tblwrap"><table class="mini"><thead><tr><th>Risiko salah menandai</th><th class="r">Terindikasi benar</th><th class="r">Salah ditandai</th><th class="r">Ketepatan</th></tr></thead><tbody>' + groups[k].map(function (r) { return '<tr><td class="num">' + idn(r['FPR_%'], 2) + '%</td><td class="r num">' + idn(r.true_positive_ekspektasian) + '</td><td class="r num">' + idn(r.false_positive_ekspektasian) + '</td><td class="r num">' + idn(r['PPV_%'], 1) + '%</td></tr>'; }).join('') + '</tbody></table></div>';
    }).join('');
    var imp = m3.dampak_transaksi_skenario;
    return '<div class="card"><div class="flex between"><div><div class="card-tag">SIMULASI BERBASIS TEOREMA BAYES</div><h3>Ketepatan Hasil Penapisan</h3></div>' + badge('asumsi') + '</div><p class="hint">Ketepatan: perkiraan proporsi merchant yang ditandai dan benar-benar bermasalah.</p>' + ppvCurve(m3.prevalensi_proxy_persen, m3.sensitivitas_asumsi) +
      '<div class="legend"><span><i style="background:#1E5BD8"></i>Skenario proksi</span><span><i style="background:#CBD5E1"></i>Skenario rendah</span><span><i style="background:#33507F"></i>Skenario tinggi</span><span><i style="background:#F5A524"></i>Garis ketepatan 50%</span></div>' + tbl +
      '<p class="note">Skenario proksi: 5.762 rekening judi dihentikan sementara (Jan-Jun 2026) dibagi ' + idn(m3.merchant_populasi) + ' merchant. Ini proksi kasar, bukan prevalensi aktual, karena satu merchant dapat terkait banyak rekening. FPR maksimum untuk ketepatan 50%: ' + idn(m3.fpr_maks_ppv50_skenario_proxy_persen, 4) + '%. Angka berlaku untuk satu siklus penapisan seluruh merchant.</p><details class="tech-note"><summary>Dasar perhitungan statistik</summary><p>PPV = (Sensitivitas × Prevalensi) / [(Sensitivitas × Prevalensi) + (FPR × (1 − Prevalensi))].</p></details>' + A.src('PPATK, Laporan Semester I 2026, hal. 21; BI 2026; Teorema Bayes; diolah di notebook.') + '</div>' +
      '<div class="card"><div class="flex between"><div><div class="card-tag">POTENSI DAMPAK TERHADAP UMKM</div><h3>Nilai Transaksi Bruto yang Tertunda</h3></div>' + badge('asumsi') + '</div><p class="hint">Skenario FPR 1% dan prevalensi proksi. Nilai ini adalah transaksi bruto yang berpotensi tertunda, bukan omzet hilang atau kerugian aktual; dana tetap milik merchant dan dapat dicairkan setelah pemeriksaan.</p><table class="mini mt8"><thead><tr><th>Lama</th><th class="r">Transaksi terganggu</th><th class="r">Nilai bruto (Rp miliar)</th></tr></thead><tbody>' + imp.map(function (r) { return '<tr><td>' + r.hari + ' hari</td><td class="r num">' + r['porsi_transaksi_terganggu_%'] + '%</td><td class="r num">' + idn(r.nilai_bruto_tengah_Rp_miliar, 1) + ' <span class="small muted">(' + idn(r.nilai_bruto_min_Rp_miliar, 1) + '-' + idn(r.nilai_bruto_maks_Rp_miliar, 1) + ')</span></td></tr>'; }).join('') + '</tbody></table>' +
      '<a class="btn sec mt12" href="#/simulator/risiko">Buka Simulasi Risiko</a></div>';
  }

  function bKlaster() {
    var clusters = [
      {
        id: 1, n: 292, pct: '56,81', color: '#013590', nama: 'Pertanian & Komoditas Primer',
        sectors: 'Pertanian (32,5%), Perdagangan (11,9%), Pertambangan (11,7%)',
        desc: 'Klaster terbesar. Perputaran transaksi mengikuti musim panen dan aktivitas komoditas primer.'
      },
      {
        id: 2, n: 17, pct: '3,31', color: '#dc88bf', nama: 'Konstruksi & Pemerintahan',
        sectors: 'Konstruksi (30,4%), Administrasi Pemerintahan (24,4%), Pertanian (20,4%)',
        desc: 'Wilayah dengan aktivitas konstruksi dan belanja pemerintahan yang menonjol.'
      },
      {
        id: 3, n: 162, pct: '31,52', color: '#b3cd7f', nama: 'Industri Manufaktur & Pengolahan',
        sectors: 'Industri Pengolahan (21,6%), Pertanian (17,6%), Perdagangan (16,2%)',
        desc: 'Sentra manufaktur dan kawasan industri regional, berpadu dengan pertanian dan perdagangan perantara.'
      },
      {
        id: 4, n: 43, pct: '8,37', color: '#e92e2e', nama: 'Perdagangan & Jasa Metropolitan',
        sectors: 'Perdagangan (21,5%), Industri Pengolahan (17,1%), Konstruksi (11,2%)',
        desc: 'Pusat kota metropolitan dengan perdagangan eceran, jasa komersial, dan konsumsi perkotaan tinggi.'
      }
    ];

    var cards = clusters.map(function (c) {
      return '<div class="card cluster-card">' +
        '<div class="flex between">' +
        '<div class="flex" style="gap:8px;align-items:center"><span class="cluster-dot" style="background:' + c.color + ';width:12px;height:12px;border-radius:50%;display:inline-block"></span><b style="font-size:13.5px">Klaster ' + c.id + '</b></div>' +
        '<span class="badge b-resmi">' + c.pct + '% Wilayah</span>' +
        '</div>' +
        '<div class="cluster-count num mt8" style="font-size:22px;font-weight:800;color:var(--navy-900)">' + c.n +
        '<small style="font-size:12px;font-weight:600;color:var(--muted)"> kabupaten/kota</small>' +
        '</div>' +
        '<div style="font-weight:700;color:var(--blue);font-size:13px;margin-top:2px">' + esc(c.nama) + '</div>' +
        '<p class="hint mt8" style="font-size:12px;line-height:1.5">' + c.desc + '</p>' +
        '<div class="cluster-sector" style="font-size:11.5px;background:var(--sky-2);padding:8px 10px;border-radius:8px;margin-top:8px;border:1px solid var(--line)"><b>Sektor dominan:</b> ' + c.sectors + '</div>' +
        '</div>';
    }).join('');

    var legend = '<div class="legend cluster-legend" style="display:flex;flex-wrap:wrap;gap:10px;margin-top:10px">' +
      clusters.map(function (c) {
        return '<span style="display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:600">' +
          '<i style="background:' + c.color + ';width:10px;height:10px;border-radius:3px;display:inline-block"></i>' +
          'Klaster ' + c.id + ' (' + c.pct + '%)' +
          '</span>';
      }).join('') +
      '</div>';

    var evalRows = [
      { alg: 'Agglomerative Ward', k: 2, sil: '0,4994', dbi: '0,7022', ch: '233,58', rank: '1,25', st: 'Optimal secara statistik' },
      { alg: 'K-Means++', k: 2, sil: '0,4631', dbi: '0,8598', ch: '244,73', rank: '2,50', st: 'Alternatif K=2' },
      { alg: 'Agglomerative Ward', k: 4, sil: '0,1643', dbi: '1,5032', ch: '153,05', rank: '4,875', st: 'Dipertahankan (eksploratif)' },
      { alg: 'K-Means++', k: 4, sil: '0,1836', dbi: '1,4821', ch: '167,88', rank: '3,75', st: 'Alternatif K=4' }
    ].map(function (r) {
      var isK4 = r.k === 4 && r.alg.indexOf('Ward') >= 0;
      var isK2 = r.k === 2 && r.alg.indexOf('Ward') >= 0;
      var rowStyle = isK4 ? 'background:rgba(240,122,26,.06);font-weight:600' : isK2 ? 'background:rgba(23,166,115,.05)' : '';
      return '<tr style="' + rowStyle + '"><td><b>' + r.alg + '</b></td><td class="r num">' + r.k + '</td><td class="r num">' + r.sil + '</td><td class="r num">' + r.dbi + '</td><td class="r num">' + r.ch + '</td><td class="r num"><b>' + r.rank + '</b></td><td class="small">' + r.st + '</td></tr>';
    }).join('');

    return '<div class="card">' +
      '<div class="flex between"><div><span class="card-tag">SEGMENTASI STRUKTUR EKONOMI</span><h3>Klaster Kabupaten/Kota Indonesia</h3></div><span class="badge b-resmi">514 Wilayah</span></div>' +
      '<p class="hint">Segmentasi 514 kabupaten/kota berdasarkan komposisi PDRB 17 lapangan usaha BPS (Sem I 2026), ditransformasi dengan Centered Log-Ratio (CLR) dan dikelompokkan dengan Agglomerative Clustering metode Ward.</p>' +

      '<div class="cluster-map-wrap mt8" style="background:#F8FAFC;border:1px solid var(--line);border-radius:14px;overflow:hidden;padding:6px;text-align:center">' +
      '<img class="cluster-map" src="assets/img/klaster_struktur_ekonomi.png" alt="Gambar 4. Peta persebaran klaster struktur ekonomi kabupaten/kota di Indonesia berdasarkan komposisi PDRB 17 lapangan usaha" style="width:100%;max-width:100%;height:auto;border-radius:10px;display:block" loading="lazy">' +
      '</div>' +

      legend +

      '<div class="note mt12" style="font-size:12px;line-height:1.55">' +
      '<b>Perlindungan UMKM.</b> Pola transaksi dipengaruhi jenis usaha dan kondisi ekonomi wilayah. Ambang yang sama untuk semua wilayah berisiko menandai keliru usaha yang wajar, sehingga 514 kabupaten/kota diklasterkan menjadi kelompok wilayah yang relatif serupa.' +
      '</div>' +

      A.src('BPS, PDRB 17 Lapangan Usaha 514 Kabupaten/Kota Semester I 2026; Agglomerative Clustering metode Ward; diolah dari notebook analisis TAPIS.') +
      '</div>' +

      '<div class="sec-title"><h2>Profil Sektoral Klaster</h2><span class="small muted">514 kabupaten/kota</span></div>' +
      '<div class="grid2">' + cards + '</div>' +

      '<div class="card">' +
      '<div class="card-tag">EVALUASI METODOLOGIS</div>' +
      '<h3>Diagnostik Model dan Pemilihan K=4</h3>' +
      '<p class="hint">Pangsa PDRB bersifat komposisional (total 100%), sehingga ditransformasi dengan CLR (nilai nol ditangani secara multiplikatif) sebelum pengelompokan Ward.</p>' +

      '<div class="grid2 mt12">' +
      '<div class="stat"><div class="lab">Hopkins Statistic (ruang CLR)</div><div class="val num">0,8087</div><span class="small muted">&gt; 0,75: kecenderungan mengelompok kuat</span></div>' +
      '<div class="stat"><div class="lab">Silhouette Score (K=4)</div><div class="val num">0,1643</div><span class="small muted">pemisahan antarklaster lemah</span></div>' +
      '<div class="stat"><div class="lab">Davies–Bouldin Index (K=4)</div><div class="val num">1,5032</div><span class="small muted">lebih rendah lebih baik</span></div>' +
      '<div class="stat"><div class="lab">Calinski–Harabasz (K=4)</div><div class="val num">153,05</div><span class="small muted">lebih tinggi lebih baik</span></div>' +
      '</div>' +

      '<div class="tblwrap mt12"><table class="mini"><thead><tr><th>Model</th><th class="r">K</th><th class="r">Silhouette</th><th class="r">Davies-Bouldin</th><th class="r">Calinski-H.</th><th class="r">Rank Gabungan</th><th>Status</th></tr></thead><tbody>' +
      evalRows +
      '</tbody></table></div>' +

      '<div class="note mt12" style="font-size:12px;line-height:1.55">' +
      '<b>Mengapa K=4.</b> Ward K=2 unggul secara statistik (rank 1,25 vs 4,875; Silhouette 0,4994 vs 0,1643). K=4 dipertahankan karena lebih rinci dan mudah diinterpretasikan, sehingga diposisikan sebagai <b>segmentasi eksploratif</b>.' +
      '</div>' +

      '<div class="note mt8" style="font-size:12px;line-height:1.55">' +
      '<b>Pembanding berlapis di TAPIS.</b> Klaster menjadi lapisan pertama, lalu dipersempit: <b>klaster wilayah &rarr; kategori usaha &rarr; skala merchant</b>. Warung di wilayah pertanian dibandingkan dengan warung sejenis dan sebesar di wilayah serupa.' +
      '</div>' +

      '<p class="warnnote mt12">' +
      '<b>Bukan indikator risiko perjudian.</b> Klaster tidak menunjukkan tingkat perjudian wilayah; hanya konteks bersama kategori usaha, skala, lokasi, dan riwayat transaksi. Manfaatnya perlu diuji lewat perbandingan false positive sebelum dan sesudah klaster diterapkan.' +
      '</p>' +
      '</div>';
  }

  // ---------- simulator ----------
  var sim = { J: false, P: false, K: false, jdata: true, malam: true, seragam: true, sesaat: false, preset: 'angkringan' };
  var PRESETS = {
    angkringan: { n: 'Angkringan dini hari', d: 'Ramai 21.00-03.00, Rp10-15 ribu, seragam', s: { J: false, P: false, K: false, jdata: true, malam: true, seragam: true, sesaat: false } },
    acara: { n: 'Warung lonjakan acara', d: 'Naik 2 hari saat pertandingan, lalu normal', s: { J: false, P: false, K: false, jdata: true, malam: false, seragam: false, sesaat: true } },
    baru: { n: 'Merchant baru melonjak + pembayar bersama', d: 'Baru buka, volume naik, pembayar sama dengan merchant lain', s: { J: true, P: true, K: true, jdata: true, malam: false, seragam: true, sesaat: false } },
    datakurang: { n: 'Data pembayar tidak lengkap', d: 'ID pembayar hilang; J tidak dapat dinilai', s: { J: false, P: false, K: false, jdata: false, malam: false, seragam: false, sesaat: false } },
    satu: { n: 'Satu kelompok saja', d: 'Perilaku naik tetapi profil dan jejaring wajar', s: { J: false, P: true, K: false, jdata: true, malam: false, seragam: false, sesaat: false } },
    pulsa: { n: 'Konter pulsa', d: 'Nominal tetap sepanjang hari', s: { J: false, P: false, K: false, jdata: true, malam: false, seragam: true, sesaat: false } }
  };
  var amb = { fpr: 1, sens: 80, prev: null, dua: false, porsi: 50, hari: 5 };
  function viewSimulator(tab) {
    tab = tab || 'level';
    if (tab === 'ambang') tab = 'risiko'; // kompatibilitas tautan lama
    var tabs = '<div class="tabs"><button class="' + (tab === 'level' ? 'on' : '') + '" data-t="level">Level merchant</button><button class="' + (tab === 'risiko' ? 'on' : '') + '" data-t="risiko">Simulasi Risiko</button></div>';
    shell(tab === 'level' ? 'Simulator' : 'Simulasi Risiko', tab === 'level' ? 'Aturan level penapisan TAPIS' : 'Memahami ketepatan dan dampak kesalahan penapisan', tabs + '<div id="simbody"></div>', { nav: 'simulator' });
    A.app.querySelectorAll('[data-t]').forEach(function (b) { b.onclick = function () { location.hash = '#/simulator/' + b.dataset.t; }; });
    if (tab === 'level') simLevel(); else simAmbang();
  }
  function simLevel() {
    var el = A.app.querySelector('#simbody'), J = sim.jdata && sim.J, n = (J ? 1 : 0) + (sim.P ? 1 : 0) + (sim.K ? 1 : 0);
    var r = T.tentukanLevel({ nGroups: n, weak: { malam: sim.malam, seragam: sim.seragam, sesaat: sim.sesaat } }), lv = r.level;
    var why = r.alasan + (lv === 'oranye' ? ' Pembatasan (Merah) tetap hanya lewat pemeriksaan manusia, bukti memadai, dan persetujuan dua pejabat.' : '') + (!sim.jdata ? ' Kelompok J berstatus "tidak cukup data", bukan aman dan bukan berisiko.' : '');
    var pres = Object.keys(PRESETS).map(function (k) { return '<button class="' + (sim.preset === k ? 'on' : '') + '" data-p="' + k + '"><b>' + PRESETS[k].n + '</b>' + PRESETS[k].d + '</button>'; }).join('');
    function tg(k, t, s, tag, dis) { return '<div class="toggle' + (dis ? ' dis' : '') + '"><div class="tx"><b>' + t + '<span class="tag ' + tag + '">' + (tag === 'w' ? 'lemah' : tag.toUpperCase()) + '</span></b><span>' + s + '</span></div><label class="switch"><input type="checkbox" data-k="' + k + '" ' + (sim[k] && !dis ? 'checked' : '') + (dis ? ' disabled' : '') + '><span></span></label></div>'; }
    el.innerHTML = '<div class="result r-' + lv + '"><div class="small" style="opacity:.8">Hasil penapisan otomatis</div><div class="lvname">' + U.LV[lv] + ' &middot; ' + U.LVDESC[lv] + '</div><p>' + why + '</p></div>' +
      '<div class="presets">' + pres + '</div>' +
      '<div class="card"><div class="card-tag">ATURAN LAPIS PERTAMA</div><h3>Kelompok Sinyal Kuat</h3><p class="hint">Oranye membutuhkan minimal dua kelompok. Satu kelompok menghasilkan Kuning.</p>' + tg('jdata', 'ID pembayar memadai', 'Cakupan dan jumlah pembayar cukup untuk analisis jejaring', 'j') + tg('J', 'Jejaring pembayar', 'Pembayar yang sama di banyak merchant, tautan dan komponen jaringan', 'j', !sim.jdata) + tg('P', 'Perilaku relatif sebaya', 'Robust Z terhadap sebaya dan riwayat sendiri, bertahan (bukan sesaat)', 'p') + tg('K', 'Profil, konteks, dan daftar rujukan', 'Umur, kategori, nominal tidak lazim, kecocokan daftar', 'k') + '</div>' +
      '<div class="card"><div class="card-tag">PRINSIP PERLINDUNGAN UMKM</div><h3>Sinyal Lemah (Bukan Alasan Tunggal)</h3><p class="hint">Tidak pernah menjadi alasan tunggal. Pada pengaturan awal, sinyal lemah saja tetap Hijau.</p>' + tg('malam', 'Ramai malam hingga dini hari', 'Pukul 22.00-05.00', 'w') + tg('seragam', 'Nominal seragam atau kecil', 'Banyak transaksi pada satu nilai', 'w') + tg('sesaat', 'Lonjakan sesaat', 'Akhir pekan atau acara lokal, lalu kembali normal', 'w') + '</div>' +
      '<p class="small muted">Simulator memakai fungsi tentukanLevel yang sama dengan mesin penapisan.</p>';
    el.querySelectorAll('[data-p]').forEach(function (b) { b.onclick = function () { var p = PRESETS[b.dataset.p]; Object.assign(sim, p.s); sim.preset = b.dataset.p; simLevel(); }; });
    el.querySelectorAll('[data-k]').forEach(function (c) { c.onchange = function () { sim[c.dataset.k] = c.checked; sim.preset = ''; simLevel(); }; });
  }
  // Rumus identik dengan notebook: PPV = Se*pi/(Se*pi + FPR*(1-pi)); FPR 2-dari-3 = 3p^2(1-p)+p^3 (asumsi independensi)
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
    var r = ambCalc(amb), K = A.kapasitas(), periksa = r.tp + r.fp;
    var sliderPos = Math.round((Math.log10(amb.fpr) + 3) / (Math.log10(2) + 3) * 1000);
    var prevOptions = [[0.005, 'Rendah'], [base, 'Proksi'], [0.05, 'Tinggi']];
    var prevDesc = Math.abs(amb.prev - 0.005) < 1e-9 ? 'Asumsi rendah' : (Math.abs(amb.prev - 0.05) < 1e-9 ? 'Asumsi tinggi' : 'Asumsi proksi');
    var tpShown = Math.round(r.tp), fpShown = Math.round(r.fp), total = tpShown + fpShown;
    el.innerHTML =
      '<div class="card risk-intro"><div class="card-tag">SIMULASI SATU SIKLUS PENAPISAN</div><h3>Seberapa tepat hasil penapisan?</h3><p class="hint">Simulasi ini memperlihatkan berapa banyak merchant yang mungkin benar-benar bermasalah dan berapa banyak UMKM yang berpotensi salah ditandai ketika seluruh merchant melewati penapisan.</p><p class="risk-purpose">Semakin besar risiko salah menandai UMKM, semakin besar pula potensi dampak kesalahan penapisan terhadap pelaku usaha yang sebenarnya tidak bermasalah.</p></div>' +
      '<div class="card risk-main"><div class="card-tag">INDIKATOR UTAMA · ' + prevDesc.toUpperCase() + '</div><div class="risk-primary"><div class="risk-primary-value num">' + idn(r.ppv * 100, 1) + '%</div><div class="risk-primary-label">Ketepatan hasil penapisan</div></div><p class="hint">Dari seluruh merchant yang ditandai, perkiraan bagian yang benar-benar bermasalah. Ini bukan akurasi keseluruhan sistem dan bukan prediksi aktual.</p>' +
      '<div class="risk-kpis"><div class="risk-kpi"><span>Merchant terindikasi benar</span><strong class="num">' + idn(tpShown) + '</strong></div><div class="risk-kpi risk-kpi-warn"><span>UMKM yang salah ditandai</span><strong class="num">' + idn(fpShown) + '</strong></div><div class="risk-kpi risk-kpi-total"><span>Total merchant yang ditandai</span><strong class="num">' + idn(total) + '</strong></div></div>' +
      '<p class="' + (r.fp > r.tp ? 'warnnote' : 'note') + '">Seluruh ' + idn(total) + ' merchant yang ditandai perlu diperiksa manusia. Perkiraan waktu pemeriksaan sekitar ' + idn(K > 0 ? Math.ceil(total / K) : 0) + ' hari kerja berdasarkan kapasitas ' + idn(K) + ' kasus baru per hari kerja yang diatur pada menu Antrean.</p></div>' +
      '<div class="card"><div class="card-tag">HUBUNGAN KESALAHAN DAN KETEPATAN</div><h3>Ketika risiko salah menandai meningkat</h3><p class="hint">Grafik menunjukkan bahwa semakin besar risiko UMKM tidak bermasalah ikut ditandai, semakin rendah ketepatan hasil penapisan.</p>' + ppvCurve(amb.prev, r.se, r.fe * 100) +
      '<div class="legend"><span><i style="background:#1E5BD8"></i>Skenario yang dipilih</span><span><i style="background:#CBD5E1"></i>Prevalensi rendah</span><span><i style="background:#33507F"></i>Prevalensi tinggi</span><span><i style="background:#F5A524"></i>Ketepatan 50%</span></div><details class="tech-note"><summary>Lihat istilah dan dasar statistik</summary><p>PPV (Positive Predictive Value) adalah proporsi hasil positif yang benar. FPR (False Positive Rate) adalah proporsi merchant yang sebenarnya tidak bermasalah tetapi ikut ditandai. Sensitivitas (Sensitivity) adalah proporsi merchant bermasalah yang berhasil ditemukan.</p></details></div>' +
      '<div class="card"><div class="card-tag">POTENSI DAMPAK TERHADAP UMKM</div><h3>Perkiraan transaksi bruto yang tertunda</h3><div class="stat mt8"><div class="lab">Nilai transaksi bruto yang berpotensi tertunda</div><div class="val num">Rp' + idn(r.bruto / 1e9, 1) + ' miliar</div></div><p class="note">Perhitungan menggunakan jumlah UMKM yang salah ditandai, rata-rata nilai transaksi QRIS harian per merchant, lama gangguan, dan porsi transaksi yang terganggu. Nilai ini bukan omzet hilang atau kerugian aktual. Dana tetap milik merchant dan dapat dicairkan setelah pemeriksaan.</p></div>' +
      '<div class="card"><div class="card-tag">PENGATURAN SIMULASI</div><h3>Ubah asumsi dan lihat dampaknya</h3><p class="hint">Setiap perubahan akan langsung memperbarui ketepatan, jumlah merchant, grafik, dan estimasi dampak.</p>' +
      '<div class="field mt8"><label>Risiko salah menandai UMKM <strong class="num">' + idn(amb.fpr, amb.fpr < 0.01 ? 4 : amb.fpr < 0.1 ? 3 : 2) + '%</strong></label><input type="range" id="fpr" min="0" max="1000" value="' + sliderPos + '"><p class="help">Semakin kecil nilainya, semakin sedikit UMKM yang tidak bermasalah ikut ditandai. Istilah statistik: FPR (False Positive Rate).</p></div>' +
      '<div class="field"><label>Kemampuan menemukan merchant bermasalah <strong class="num">' + amb.sens + '%</strong></label><input type="range" id="sens" min="50" max="95" value="' + amb.sens + '"><p class="help">Menunjukkan bagian merchant bermasalah yang dapat ditemukan. Nilai lebih tinggi meningkatkan temuan benar, tetapi di sini merupakan asumsi skenario. Istilah statistik: sensitivitas.</p></div>' +
      '<div class="field"><label>Perkiraan proporsi merchant bermasalah</label><div class="chips">' + prevOptions.map(function (p) { return '<button class="chip ' + (Math.abs(amb.prev - p[0]) < 1e-9 ? 'on' : '') + '" data-pv="' + p[0] + '">' + p[1] + (p[0] === base ? ' · ' + idn(base, 4) + '%' : ' · ' + idn(p[0], 3) + '%') + '</button>'; }).join('') + '</div><p class="help">Ketiganya adalah asumsi skenario, bukan prevalensi aktual merchant bermasalah. Nilai proksi dihitung dari rekening yang dihentikan sementara dibagi populasi merchant.</p></div>' +
      '<div class="risk-parameter-note"><b>Bagaimana parameter memengaruhi hasil?</b><ul class="small gaps"><li>Risiko salah menandai lebih tinggi → lebih banyak UMKM tidak bermasalah ikut ditandai dan ketepatan cenderung turun.</li><li>Kemampuan menemukan lebih tinggi → lebih banyak merchant bermasalah terdeteksi dan ketepatan cenderung naik.</li><li>Perkiraan proporsi merchant bermasalah lebih tinggi → bagian hasil penapisan yang benar cenderung meningkat.</li></ul></div>' +
      '<div class="field"><label>Porsi transaksi yang terganggu <strong>' + amb.porsi + '%</strong></label><div class="chips">' + [25, 50, 100].map(function (v) { return '<button class="chip ' + (amb.porsi === v ? 'on' : '') + '" data-po="' + v + '">' + v + '%</button>'; }).join('') + '</div><p class="help">Asumsi untuk menghitung potensi nilai transaksi bruto yang tertunda.</p></div>' +
      '<div class="field"><label>Lama gangguan <strong>' + amb.hari + ' hari</strong></label><input type="range" id="hari" min="1" max="10" value="' + amb.hari + '"><p class="help">Asumsi durasi sampai pemeriksaan selesai.</p></div>' +
      '<div class="toggle"><div class="tx"><b>Wajib dua dari tiga kelompok sinyal</b><span>Jika diaktifkan, perhitungan FPR dan kemampuan menemukan menggunakan rumus gabungan dua-dari-tiga dengan asumsi independensi antar kelompok sinyal. Hubungan antar kelompok belum diuji menggunakan data berlabel.</span></div><label class="switch"><input type="checkbox" id="dua" ' + (amb.dua ? 'checked' : '') + '><span></span></label></div>' +
      '<details class="tech-note"><summary>Rumus dan istilah statistik</summary><p>PPV = Se × π / [Se × π + FPR × (1 − π)]. Jika aturan dua dari tiga kelompok sinyal diaktifkan, peluang gabungan dihitung dengan 3p²(1−p) + p³. Perhitungan ini mempertahankan asumsi independensi seperti pada implementasi sebelumnya.</p><p>TP (True Positive) adalah merchant bermasalah yang terindikasi benar. FP (False Positive) adalah merchant yang sebenarnya tidak bermasalah tetapi ikut ditandai.</p></details></div>' +
      '<div class="card"><div class="card-tag">BATAS INTERPRETASI</div><h3>Simulasi bukan keputusan pelanggaran</h3><p class="note">Skor dan hasil penapisan bukan bukti pelanggaran. Merchant yang terindikasi harus melalui pemeriksaan bukti dan konteks oleh petugas. Keputusan pembatasan tetap memerlukan pemeriksaan serta persetujuan manusia sesuai prosedur.</p><ul class="small gaps"><li>Risiko salah menandai, kemampuan menemukan, dan porsi transaksi terganggu merupakan parameter asumsi, bukan hasil pengukuran kinerja.</li><li>Prevalensi proksi bukan prevalensi aktual merchant bermasalah.</li><li>Jumlah terindikasi benar dan salah ditandai berlaku untuk satu siklus penapisan seluruh merchant, bukan per bulan.</li><li>Jumlah LTKM nasional tidak digunakan sebagai ukuran kapasitas pemeriksaan.</li></ul></div>';
    var rg = el.querySelector('#fpr'); rg.oninput = function () { amb.fpr = Math.pow(10, -3 + (Math.log10(2) + 3) * rg.value / 1000); simAmbang(); var next = el.querySelector('#fpr'); if (next) next.focus(); };
    var sn = el.querySelector('#sens'); sn.oninput = function () { amb.sens = +sn.value; simAmbang(); var next = el.querySelector('#sens'); if (next) next.focus(); };
    var hr = el.querySelector('#hari'); hr.oninput = function () { amb.hari = +hr.value; simAmbang(); var next = el.querySelector('#hari'); if (next) next.focus(); };
    el.querySelectorAll('[data-pv]').forEach(function (b) { b.onclick = function () { amb.prev = +b.dataset.pv; simAmbang(); }; });
    el.querySelectorAll('[data-po]').forEach(function (b) { b.onclick = function () { amb.porsi = +b.dataset.po; simAmbang(); }; });
    el.querySelector('#dua').onchange = function () { amb.dua = this.checked; simAmbang(); };
  }
  A.viewBukti = viewBukti; A.viewSimulator = viewSimulator;

})();