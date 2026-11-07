/* TAPIS: Pusat Bukti (angka RESMI dan HITUNGAN dari notebook analisis_tapis_revisi_v2) dan Simulator (level + ambang Bayes). */
(function () {
  'use strict';
  var A = window.A, T = A.T, U = A.U, H = A.H, R = A.R, S = A.S, icon = U.icon, idn = U.idn, rp = U.rp, esc = U.esc, badge = U.badge, level = U.level;
  var shell = A.shell, cu = A.cu, BULAN = A.BULAN, app = A.app;
  var bTab = 'ringkas';
  function bln(s) { return A.bln(s); }
  function viewBukti(tab) {
    bTab = tab || bTab;
    var tabs = [['ringkas', 'Ringkasan'], ['m1', 'Deposit'], ['m2', 'Laporan'], ['m3', 'Ambang'], ['peta', 'Peta']].map(function (t) { return '<button class="' + (bTab === t[0] ? 'on' : '') + '" data-t="' + t[0] + '">' + t[1] + '</button>'; }).join('');
    var body = '<div class="tabs">' + tabs + '</div>' + ({ ringkas: bRingkas, m1: bM1, m2: bM2, m3: bM3, peta: bPeta }[bTab] || bRingkas)();
    shell('Pusat bukti', 'Angka resmi PPATK, Bank Indonesia, dan BPS', body, { nav: 'bukti' });
    A.app.querySelectorAll('[data-t]').forEach(function (b) { b.onclick = function () { location.hash = '#/bukti/' + b.dataset.t; }; });
    if (bTab === 'peta') bindPeta();
  }
  function bRingkas() {
    var d = H.deposit, m = H.m2, m3 = H.m3;
    return '<div class="grid2">' + A.stat('Merchant QRIS (96,68% UMKM)', cu(H.qris.merchant_juta, 2, '', ' juta'), 'resmi', 'BI 2026') + A.stat('Transaksi QRIS Sem I 2026', cu(H.qris.volume_miliar, 2, '', ' miliar'), 'resmi', 'BI 2026') +
      A.stat('Frekuensi deposit judi daring lewat QRIS', cu(87.66, 2, '', '%'), 'resmi', 'PPATK 2026') + A.stat('Rata-rata deposit lewat QRIS', cu(Math.round(d.rata2_qris_rp), 0, 'Rp'), 'hitungan', 'dari PPATK 2026') + '</div>' +
      '<div class="card mt12"><h3>Tiga temuan dari data resmi</h3>' +
      '<div class="reason"><span class="ic on">1</span><div><b>Deposit makin kecil dan makin sering (M1)</b><p>Frekuensi naik ' + idn((d.frek_sem1_2026_juta / d.frek_sem1_2025_juta - 1) * 100, 1) + '%, rata-rata turun ' + idn((1 - d.rata2_2026_rp / d.rata2_2025_rp) * 100, 1) + '%. Deposit QRIS rata-rata ' + rp(d.rata2_qris_rp) + ', di bawah rata-rata transaksi QRIS ' + rp(H.qris.rata2_transaksi_rp) + '.</p></div></div>' +
      '<div class="reason"><span class="ic on">2</span><div><b>Laporan indikasi Perjudian menurun (M2)</b><p>Mann-Kendall dengan koreksi ties Z = ' + idn(m.mk_Z_ties, 2) + ' (p = ' + idn(m.mk_p_ties, 4) + '); setelah prewhitening TFPW Z = ' + idn(m.mk_tfpw_Z, 2) + ' (p = ' + idn(m.mk_tfpw_p, 4) + '). Titik patah BIC: ' + m.patah_bic.map(bln).join(' dan ') + ' (eksploratif).</p></div></div>' +
      '<div class="reason"><span class="ic on">3</span><div><b>Ambang harus sangat ketat (M3)</b><p>Pada skenario prevalensi proksi ' + idn(m3.prevalensi_proxy_persen, 4) + '% dan sensitivitas 80% (asumsi), PPV 50% hanya tercapai bila FPR paling tinggi ' + idn(m3.fpr_maks_ppv50_skenario_proxy_persen, 4) + '%. Karena itu TAPIS menuntut dua kelompok sinyal dan pemeriksaan manusia.</p></div></div></div>' +
      '<p class="warnnote">Semua angka di halaman ini berasal dari data nasional agregat. Data tersebut tidak mengukur kinerja deteksi merchant dan tidak menunjukkan kapasitas pemeriksaan.</p>';
  }
  function bM1() {
    var dep = R.deposit.filter(function (r) { return r.kanal === 'Semua kanal'; });
    var yr = ['2023', '2024', '2025', 'Sem I 2026'].map(function (p) { var r = dep.filter(function (x) { return x.periode === p; })[0]; return { l: p, v: r.nilai_rp / 1e12, t: 'Rp' + idn(r.nilai_rp / 1e12, 1) + ' T', c: p === 'Sem I 2026' ? '#1E5BD8' : '#94A3B8' }; });
    var d = H.deposit, mx = Math.max(Math.abs(d.efek_frek_T), Math.abs(d.efek_rata2_T));
    function hb(lab, v, col) { var w = Math.abs(v) / mx * 130; return '<div style="display:flex;align-items:center;gap:8px;margin:8px 0"><span style="width:92px;font-size:11.5px">' + lab + '</span><div style="flex:1;position:relative;height:22px"><div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:#CBD5E1"></div><div class="hbar' + (v < 0 ? ' neg' : '') + '" style="position:absolute;top:2px;height:18px;border-radius:5px;background:' + col + ';' + (v >= 0 ? 'left:50%' : 'right:50%') + ';width:' + (Math.abs(v) / mx * 48) + '%"></div></div><b class="num" style="width:74px;text-align:right;font-size:12px">' + (v < 0 ? '-' : '+') + 'Rp' + idn(Math.abs(v), 2) + ' T</b></div>'; }
    var cmp = [{ l: 'Deposit QRIS', v: d.rata2_qris_rp, c: '#E0413A', t: rp(d.rata2_qris_rp) }, { l: 'Transaksi QRIS', v: H.qris.rata2_transaksi_rp, c: '#1E5BD8', t: rp(H.qris.rata2_transaksi_rp) }, { l: 'Batas MDR 0%', v: 100000, c: '#CBD5E1', t: 'Rp100.000' }];
    return '<div class="card"><div class="flex between"><h3>Nilai deposit judi daring</h3>' + badge('resmi') + '</div>' + U.bars(yr) + A.src('PPATK, Laporan Semester I 2026, hal. 29.') + '</div>' +
      '<div class="card"><div class="flex between"><h3>Dekomposisi perubahan nilai</h3>' + badge('hitungan') + '</div><p class="hint">Sem I 2025 ke Sem I 2026: nilai naik ' + idn((Math.exp(d.log_total) - 1) * 100, 1) + '%.</p>' +
      hb('Efek frekuensi', d.efek_frek_T, '#1E5BD8') + hb('Efek rata-rata', d.efek_rata2_T, '#E0413A') + hb('Perubahan total', d.efek_frek_T + d.efek_rata2_T, '#0B2A5B') +
      '<p class="note">Kenaikan frekuensi hampir seluruhnya dihapus oleh turunnya nominal per transaksi. Pola ini sesuai dengan modus "nominal kecil, berulang, dan tersebar" yang disebut PPATK.</p>' + A.src('PPATK, Siaran Pers B/04/HM.05/3.1/VIII/2026; dekomposisi Kitagawa (1955).') + '</div>' +
      '<div class="card"><div class="flex between"><h3>Nominal tidak dapat menjadi pembeda</h3>' + badge('hitungan') + '</div>' + U.bars(cmp, { max: 115000 }) +
      '<p class="note">Rata-rata deposit lewat QRIS lebih kecil daripada rata-rata belanja QRIS dan berada di bawah batas MDR 0% yang berlaku 1 Oktober 2026. Aturan berbasis nominal justru akan menandai warung.</p>' + A.src('PPATK 2026; BI, Siaran Pers 28/159/DKom; diolah.') + '</div>';
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
    return '<div class="card"><div class="flex between"><h3>Indikasi Perjudian per bulan</h3>' + badge('resmi') + '</div><p class="hint">Batang = jumlah laporan, garis = rata-rata geometrik segmen, pita = CI 95% (HAC), garis putus = awal segmen baru menurut BIC.</p>' + chart + A.src('PPATK, Buletin Statistik APUPPT edisi Juni 2025, Oktober 2025, dan September 2026, Tabel 5; diolah.') + '</div>' +
      '<div class="card"><div class="flex between"><h3>Hasil uji tren dan patahan</h3>' + badge('hitungan') + '</div><table class="mini mt8"><tbody>' +
      '<tr><td>Mann-Kendall, koreksi ties</td><td class="r num">Z = ' + idn(m.mk_Z_ties, 3) + '; p = ' + idn(m.mk_p_ties, 4) + '</td></tr>' +
      '<tr><td><b>Mann-Kendall TFPW</b> (prewhitening, uji utama bila ada autokorelasi)</td><td class="r num"><b>Z = ' + idn(m.mk_tfpw_Z, 3) + '; p = ' + idn(m.mk_tfpw_p, 4) + '</b></td></tr>' +
      '<tr><td>Autokorelasi untuk TFPW</td><td class="r num">rho = ' + idn(m.rho_tfpw, 3) + '</td></tr>' +
      '<tr><td>Kemiringan Sen</td><td class="r num">' + idn(m.sen_persen_per_bulan, 2) + '% per bulan</td></tr>' +
      '<tr><td>OLS-CUSUM</td><td class="r num">' + idn(m.cusum_ols_stat, 3) + '; p = ' + idn(m.cusum_ols_p, 4) + '</td></tr>' +
      '<tr><td>sup-F (Andrews)</td><td class="r num">' + idn(m.supF, 2) + ' pada ' + bln(m.supF_tanggal) + '</td></tr>' +
      '<tr><td>p bootstrap sup-F, IID</td><td class="r num">' + idn(m.supF_p_iid, 4) + '</td></tr>' +
      '<tr><td>p bootstrap sup-F, AR(1) di bawah H0 (rho = ' + idn(m.rho_ar1_null, 3) + ')</td><td class="r num">' + idn(m.supF_p_ar1_null, 4) + '</td></tr>' +
      '<tr><td>Titik patah BIC</td><td class="r num">' + m.patah_bic.map(bln).join(', ') + '</td></tr>' +
      '<tr><td>Jan-Sep 2025 dan 2026</td><td class="r num">' + idn(m.jan_sep_2025) + ' dan ' + idn(m.jan_sep_2026) + '</td></tr></tbody></table>' +
      '<p class="warnnote">Bukti tren menurun kuat, tetapi bukti patahan tunggal pada Desember 2024 tidak tahan terhadap bootstrap AR(1) di bawah H0 (p = ' + idn(m.supF_p_ar1_null, 2) + '). Titik patah BIC bersifat eksploratif, dipilih dari data yang sama, dan sensitif terhadap spesifikasi serta periode awal. Penurunan laporan tidak menilai kinerja lembaga dan tidak diuji sebagai akibat kebijakan tertentu; jumlah LTKM bukan jumlah pelaku dan bukan kapasitas pemeriksaan.</p></div>' +
      '<div class="card"><div class="flex between"><h3>CUSUM bawah 2026 terhadap acuan 2025</h3>' + badge('hitungan') + '</div><p class="hint">Alarm pertama: ' + bln(m.cusum_alarm_pertama) + '. Parameter k = 0,5 dan h = 4 bersifat <b>ilustratif</b> dan belum dikalibrasi dengan data berlabel. Alat serupa (CUSUM atas, k = ' + T.CONFIG.cusum.k + ', h = ' + T.CONFIG.cusum.h + ') dipakai TAPIS untuk tiap merchant dengan parameter yang juga belum dikalibrasi.</p>' + cchart + A.src('PPATK, Buletin APUPPT September 2026; CUSUM Page (1954).') + '</div>' +
      '<div class="card"><div class="flex between"><h3>LTKM per kelompok pelapor, Jan-Sep</h3>' + badge('resmi') + '</div><p class="hint">LTKM = Laporan Transaksi Keuangan Mencurigakan yang diterima PPATK (seluruh jenis tindak pidana).</p><table class="mini mt8"><thead><tr><th>Pelapor</th><th class="r">2024</th><th class="r">2025</th><th class="r">2026</th></tr></thead><tbody>' + pel + '</tbody></table>' +
      (em ? '<p class="note">Laporan penyelenggara e-money/e-wallet turun ' + idn((1 - em['2026_jan_sep'] / em['2024_jan_sep']) * 100, 1) + '% antara Jan-Sep 2024 dan 2026. Ini statistik nasional, bukan ukuran kapasitas atau kinerja pemeriksa.</p>' : '') + A.src('PPATK, Buletin APUPPT September 2026, Tabel 2.') + '</div>';
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
    var m3 = H.m3, rows = m3.ppv_skenario, groups = {};
    rows.forEach(function (r) { (groups[r.skenario_prevalensi] = groups[r.skenario_prevalensi] || []).push(r); });
    var tbl = Object.keys(groups).map(function (k) {
      return '<h4 class="mt12" style="margin:12px 0 4px">' + esc(k) + '</h4><div class="tblwrap"><table class="mini"><thead><tr><th>FPR</th><th class="r">TP</th><th class="r">FP</th><th class="r">PPV</th></tr></thead><tbody>' + groups[k].map(function (r) { return '<tr><td class="num">' + idn(r['FPR_%'], 2) + '%</td><td class="r num">' + idn(r.true_positive_ekspektasian) + '</td><td class="r num">' + idn(r.false_positive_ekspektasian) + '</td><td class="r num">' + idn(r['PPV_%'], 1) + '%</td></tr>'; }).join('') + '</tbody></table></div>';
    }).join('');
    var imp = m3.dampak_transaksi_skenario;
    return '<div class="card"><div class="flex between"><h3>Nilai prediktif positif (PPV)</h3>' + badge('asumsi') + '</div><p class="hint">PPV = Se x &pi; / (Se x &pi; + FPR x (1 - &pi;)). Sensitivitas ' + idn(m3.sensitivitas_asumsi * 100) + '% adalah asumsi skenario. Prevalensi adalah skenario, bukan angka pelaku sesungguhnya.</p>' + ppvCurve(m3.prevalensi_proxy_persen, m3.sensitivitas_asumsi) +
      '<div class="legend"><span><i style="background:#1E5BD8"></i>proksi ' + idn(m3.prevalensi_proxy_persen, 4) + '%</span><span><i style="background:#CBD5E1"></i>0,005%</span><span><i style="background:#33507F"></i>0,05%</span><span><i style="background:#F5A524"></i>PPV 50%</span></div>' + tbl +
      '<p class="note">Prevalensi proksi = 5.762 rekening perjudian yang dihentikan sementara (Jan-Jun 2026) dibagi ' + idn(m3.merchant_populasi) + ' merchant. Ini proksi kasar karena satu merchant bisa terkait banyak rekening dan sebaliknya. Agar PPV 50% pada skenario proksi, FPR paling tinggi ' + idn(m3.fpr_maks_ppv50_skenario_proxy_persen, 4) + '%. TP dan FP ditampilkan terpisah dan berlaku untuk satu siklus penapisan seluruh merchant.</p>' + A.src('PPATK, Laporan Semester I 2026, hal. 21; BI 2026; Teorema Bayes; diolah di notebook.') + '</div>' +
      '<div class="card"><div class="flex between"><h3>Nilai transaksi bruto yang tertunda</h3>' + badge('asumsi') + '</div><p class="hint">Skenario FPR 1%, prevalensi proksi. Nilai ini adalah <b>nilai transaksi bruto yang tertunda</b> pada merchant yang salah ditandai (merchant jujur), bukan omzet hilang dan bukan kerugian aktual. Dana tertunda tetap milik merchant dan dapat dicairkan setelah pemeriksaan.</p><table class="mini mt8"><thead><tr><th>Lama</th><th class="r">Porsi terganggu</th><th class="r">Nilai bruto (Rp miliar)</th></tr></thead><tbody>' + imp.map(function (r) { return '<tr><td>' + r.hari + ' hari</td><td class="r num">' + r['porsi_transaksi_terganggu_%'] + '%</td><td class="r num">' + idn(r.nilai_bruto_tengah_Rp_miliar, 1) + ' <span class="small muted">(' + idn(r.nilai_bruto_min_Rp_miliar, 1) + '-' + idn(r.nilai_bruto_maks_Rp_miliar, 1) + ')</span></td></tr>'; }).join('') + '</tbody></table>' +
      '<a class="btn sec mt12" href="#/simulator/ambang">Coba di simulator</a></div>';
  }
  function bPeta() {
    var P = R.peta, vals = P.prov.map(function (p) { return p.v; }).sort(function (a, b) { return a - b; }), lo = T.quantile(vals, 0.05), hi = T.quantile(vals, 0.95);
    function col(v) { var t = Math.max(0, Math.min(1, (v - lo) / (hi - lo))); var s = [[238, 243, 250], [141, 182, 245], [30, 91, 216], [11, 42, 91]], k = Math.min(2, Math.floor(t * 3)), f = t * 3 - k; var c = s[k].map(function (x, i) { return Math.round(x + (s[k + 1][i] - x) * f); }); return 'rgb(' + c.join(',') + ')'; }
    var paths = P.prov.map(function (p, i) { return '<path data-i="' + i + '" d="' + p.d + '" fill="' + col(p.v) + '" stroke="#fff" stroke-width=".8" style="cursor:pointer"/>'; }).join('');
    var sorted = P.prov.slice().sort(function (a, b) { return b.v - a.v; });
    return '<div class="card"><div class="flex between"><h3>PDRB per kapita ADHB 2024</h3>' + badge('resmi') + '</div><p class="hint">Ketuk provinsi untuk melihat nilai.</p><svg class="chart" viewBox="0 0 ' + P.w + ' ' + P.h + '">' + paths + '</svg>' +
      '<div style="height:8px;border-radius:4px;background:linear-gradient(90deg,#EEF3FA,#8DB6F5,#1E5BD8,#0B2A5B);margin-top:8px"></div><div class="flex between small muted"><span>Rp' + idn(lo / 1000) + ' juta</span><span>Rp' + idn(hi / 1000) + ' juta</span></div>' +
      '<div id="pinfo" class="note">Ketuk peta. Tertinggi ' + esc(sorted[0].n) + ' (Rp' + idn(sorted[0].v / 1000, 1) + ' juta), terendah ' + esc(sorted[sorted.length - 1].n) + ' (Rp' + idn(sorted[sorted.length - 1].v / 1000, 1) + ' juta), selisih ' + idn(sorted[0].v / sorted[sorted.length - 1].v, 1) + ' kali.</div>' +
      '<p class="warnnote"><b>Bukan peta risiko judi daring.</b> Peta ini menunjukkan bahwa kemampuan ekonomi daerah tidak merata, sehingga tampilan dan pelatihan petugas TAPIS harus ringan dan dapat dipakai di seluruh daerah.</p>' + A.src('BPS, PDRB per kapita ADHB menurut provinsi 2024; batas 38 provinsi; diolah.') + '</div>';
  }
  function bindPeta() { app.querySelectorAll('path[data-i]').forEach(function (p) { p.onclick = function () { var d = R.peta.prov[+p.dataset.i]; app.querySelectorAll('path[data-i]').forEach(function (q) { q.setAttribute('stroke', '#fff'); q.setAttribute('stroke-width', '.8'); }); p.setAttribute('stroke', '#E0413A'); p.setAttribute('stroke-width', '2.5'); app.querySelector('#pinfo').innerHTML = '<b>' + esc(d.n) + '</b>: PDRB per kapita Rp' + idn(d.v / 1000, 1) + ' juta (ADHB 2024); pertumbuhan riil per kapita 2025 ' + idn(d.g, 2) + '%.'; }; }); }
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
    var tabs = '<div class="tabs"><button class="' + (tab === 'level' ? 'on' : '') + '" data-t="level">Level merchant</button><button class="' + (tab === 'ambang' ? 'on' : '') + '" data-t="ambang">Ambang dan dampak</button></div>';
    shell('Simulator', tab === 'level' ? 'Aturan level penapisan TAPIS' : 'Teorema Bayes dengan angka resmi dan asumsi', tabs + '<div id="simbody"></div>', { nav: 'simulator' });
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
      '<div class="card"><h3>Kelompok sinyal kuat</h3><p class="hint">Oranye membutuhkan minimal dua kelompok. Satu kelompok menghasilkan Kuning.</p>' + tg('jdata', 'ID pembayar memadai', 'Cakupan dan jumlah pembayar cukup untuk analisis jejaring', 'j') + tg('J', 'Jejaring pembayar', 'Pembayar yang sama di banyak merchant, tautan dan komponen jaringan', 'j', !sim.jdata) + tg('P', 'Perilaku relatif sebaya', 'Robust Z terhadap sebaya dan riwayat sendiri, bertahan (bukan sesaat)', 'p') + tg('K', 'Profil, konteks, dan daftar rujukan', 'Umur, kategori, nominal tidak lazim, kecocokan daftar', 'k') + '</div>' +
      '<div class="card"><h3>Sinyal lemah</h3><p class="hint">Tidak pernah menjadi alasan tunggal. Pada pengaturan awal, sinyal lemah saja tetap Hijau.</p>' + tg('malam', 'Ramai malam hingga dini hari', 'Pukul 22.00-05.00', 'w') + tg('seragam', 'Nominal seragam atau kecil', 'Banyak transaksi pada satu nilai', 'w') + tg('sesaat', 'Lonjakan sesaat', 'Akhir pekan atau acara lokal, lalu kembali normal', 'w') + '</div>' +
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
    el.innerHTML = '<div class="card"><div class="flex between"><h3>Hasil satu siklus penapisan</h3>' + badge('asumsi') + '</div><p class="hint">Seluruh angka bergantung pada parameter skenario di bawah. Ini bukan prediksi dan bukan akurasi sistem.</p>' + ppvCurve(amb.prev, r.se, r.fe * 100) +
      '<div class="grid2 mt8"><div class="stat"><div class="lab">PPV (tanda yang benar)</div><div class="val num">' + idn(r.ppv * 100, 1) + '%</div></div><div class="stat"><div class="lab">Pelaku tertandai (TP)</div><div class="val num">' + idn(r.tp) + '</div></div>' +
      '<div class="stat"><div class="lab">Merchant jujur tertandai (FP)</div><div class="val num" style="color:' + (r.fp > r.tp ? '#E0413A' : 'inherit') + '">' + idn(r.fp) + '</div></div><div class="stat"><div class="lab">Perlu diperiksa manusia (TP + FP)</div><div class="val num">' + idn(periksa) + '</div></div></div>' +
      '<p class="' + (r.fp > r.tp ? 'warnnote' : 'note') + '">Dari ' + idn(periksa) + ' merchant yang ditandai, ' + idn(r.tp) + ' pelaku dan ' + idn(r.fp) + ' merchant jujur. Dengan kapasitas tim saat ini (' + K + ' kasus baru per hari kerja, parameter yang dapat diatur di Antrean), menuntaskan satu siklus memerlukan sekitar ' + idn(K > 0 ? Math.ceil(periksa / K) : 0) + ' hari kerja. Angka kapasitas ini bukan data nasional dan tidak diturunkan dari jumlah LTKM.</p></div>' +
      '<div class="card"><div class="flex between"><h3>Nilai transaksi bruto yang tertunda</h3>' + badge('asumsi') + '</div><div class="stat mt8"><div class="lab">FP x GMV harian per merchant x lama x porsi terganggu</div><div class="val num">Rp' + idn(r.bruto / 1e9, 1) + ' miliar</div></div>' +
      '<p class="note">Ini nilai transaksi <b>bruto</b> yang tertunda pada merchant jujur yang salah ditandai. Bukan omzet hilang, bukan kerugian aktual: dana milik merchant dan dicairkan kembali setelah pemeriksaan. GMV harian rata-rata per merchant Rp' + idn(r.gmvHari) + ' (hitungan dari nominal QRIS Sem I 2026, 181 hari, ' + idn(H.m3.merchant_populasi / 1e6, 2) + ' juta merchant).</p></div>' +
      '<div class="card"><h3>Atur parameter skenario</h3><div class="field mt8"><label>FPR per merchant: <span class="num">' + idn(amb.fpr, amb.fpr < 0.01 ? 4 : amb.fpr < 0.1 ? 3 : 2) + '%</span></label><input type="range" id="fpr" min="0" max="1000" value="' + sliderPos + '"></div>' +
      '<div class="field"><label>Sensitivitas: ' + amb.sens + '% ' + badge('asumsi') + '</label><input type="range" id="sens" min="50" max="95" value="' + amb.sens + '"></div>' +
      '<div class="field"><label>Prevalensi pelaku di antara merchant (skenario)</label><div class="chips">' + [[0.005, '0,005% (rendah)'], [base, idn(base, 4) + '% (proksi)'], [0.05, '0,05% (tinggi)']].map(function (p) { return '<button class="chip ' + (Math.abs(amb.prev - p[0]) < 1e-9 ? 'on' : '') + '" data-pv="' + p[0] + '">' + p[1] + '</button>'; }).join('') + '</div></div>' +
      '<div class="field"><label>Porsi transaksi terganggu: ' + amb.porsi + '% ' + badge('asumsi') + '</label><div class="chips">' + [25, 50, 100].map(function (p) { return '<button class="chip ' + (amb.porsi === p ? 'on' : '') + '" data-po="' + p + '">' + p + '%</button>'; }).join('') + '</div></div>' +
      '<div class="field"><label>Lama gangguan: ' + amb.hari + ' hari ' + badge('asumsi') + '</label><input type="range" id="hari" min="1" max="10" value="' + amb.hari + '"></div>' +
      '<div class="toggle"><div class="tx"><b>Wajib dua dari tiga kelompok sinyal</b><span>FPR = 3p&sup2;(1-p) + p&sup3; dan sensitivitas gabungan dengan rumus yang sama. ASUMSI independensi antar kelompok sinyal; korelasi nyata membuat hasil lebih buruk, dan independensi belum teruji pada data berlabel.</span></div><label class="switch"><input type="checkbox" id="dua" ' + (amb.dua ? 'checked' : '') + '><span></span></label></div></div>' +
      '<div class="card"><h3>Batas interpretasi</h3><ul class="small gaps"><li>Sensitivitas, FPR, porsi terganggu, dan lama gangguan adalah parameter skenario, bukan hasil pengukuran.</li><li>Prevalensi proksi berasal dari rekening yang dihentikan sementara dibagi jumlah merchant; bukan prevalensi merchant bermasalah.</li><li>TP dan FP berlaku untuk satu siklus penapisan seluruh merchant, bukan per bulan.</li><li>Jumlah LTKM nasional tidak menunjukkan kapasitas pemeriksaan dan tidak dipakai di sini.</li></ul></div>';
    var rg = el.querySelector('#fpr'); rg.oninput = function () { amb.fpr = Math.pow(10, -3 + (Math.log10(2) + 3) * rg.value / 1000); simAmbang(); el.querySelector('#fpr').focus(); };
    var sn = el.querySelector('#sens'); sn.oninput = function () { amb.sens = +sn.value; simAmbang(); el.querySelector('#sens').focus(); };
    var hr = el.querySelector('#hari'); hr.oninput = function () { amb.hari = +hr.value; simAmbang(); el.querySelector('#hari').focus(); };
    el.querySelectorAll('[data-pv]').forEach(function (b) { b.onclick = function () { amb.prev = +b.dataset.pv; simAmbang(); }; });
    el.querySelectorAll('[data-po]').forEach(function (b) { b.onclick = function () { amb.porsi = +b.dataset.po; simAmbang(); }; });
    el.querySelector('#dua').onchange = function () { amb.dua = this.checked; simAmbang(); };
  }
  A.viewBukti = viewBukti; A.viewSimulator = viewSimulator;

})();
