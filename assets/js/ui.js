/* TAPIS ui helpers: sistem ikon vektor, format numerik, tipologi penapisan, grafik analitik SVG publikasi */
(function () {
  'use strict';
  var I = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h5v-6h4v6h5V9.5"/>',
    queue: '<path d="M4 6h16M4 12h10M4 18h7"/><circle cx="18" cy="16" r="3"/><path d="m20.2 18.2 1.8 1.8"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M8 13h8"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    chev: '<path d="m9 6 6 6-6 6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    net: '<circle cx="5" cy="6" r="2.2"/><circle cx="19" cy="6" r="2.2"/><circle cx="12" cy="18" r="2.2"/><circle cx="12" cy="10" r="1.6"/><path d="M6.8 7.2 10.7 9.2M17.2 7.2l-3.9 2M12 11.6v4.2"/>',
    sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    map: '<path d="M9 4 3 6.5v13.5L9 17.5l6 2.5 6-2.5V4l-6 2.5Z"/><path d="M9 4v13.5M15 6.5V20"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 16l-4-4 4-4M6 12h10"/>',
    shield: '<path d="M12 3 4.5 6v5.5c0 4.7 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.8 7.5-9.5V6Z"/><path d="m9 12 2 2 4-4"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.6-5.5 6.5-5.5s5.5 2 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.8c1.5.8 2.5 2.6 3 5.2"/>',
    pulse: '<path d="M3 12h4l2.5-6 4 12 2.5-6H21"/>',
    id: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.2"/><path d="M5.8 16c.6-1.5 1.8-2.3 3.2-2.3s2.6.8 3.2 2.3M14.5 10h4M14.5 13.5h3"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5Z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/>',
    reset: '<path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v4h4"/>',
    send: '<path d="M21 3 10 14"/><path d="M21 3 14.5 21l-4.5-7-7-4.5Z"/>',
    store: '<path d="M4 9.5 5.5 4h13L20 9.5"/><path d="M4 9.5c0 1.4 1.1 2.5 2.7 2.5S9.3 10.9 9.3 9.5c0 1.4 1.2 2.5 2.7 2.5s2.7-1.1 2.7-2.5c0 1.4 1.1 2.5 2.6 2.5S20 10.9 20 9.5"/><path d="M5.5 12v8h13v-8M10 20v-4.5h4V20"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    building: '<path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/><path d="M16 9h2a2 2 0 0 1 2 2v10M2 21h20M8 7h4M8 11h4M8 15h4"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17v.5"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15Z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    alert: '<path d="M12 3 2 20h20Z"/><path d="M12 9.5v5M12 17.5v.5"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7Z"/><path d="m2 12 10 5 10-5"/><path d="m2 17 10 5 10-5"/>',
    download: '<path d="M12 3v12m0 0-4-4m4 4 4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3.6 9h16.8M3.6 15h16.8"/><path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    scale: '<path d="M12 3v18M5 21h14M6 7l-3 6h6ZM18 7l-3 6h6Z"/><path d="M4 7h16"/>',
    zoomIn: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/>',
    zoomOut: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M8 11h6"/>'
  };

  function icon(n, cls) {
    return '<svg class="ic-svg ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (I[n] || I.info) + '</svg>';
  }

  function idn(v, d) {
    if (v === null || v === undefined || isNaN(v)) return '-';
    return Number(v).toLocaleString('id-ID', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
  }
  function rp(v) { return 'Rp' + idn(Math.round(v)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function badge(kind) {
    var t = {
      resmi: 'Publikasi Resmi',
      hitungan: 'Komputasi Riset',
      asumsi: 'Parameter Model',
      demo: 'Data Terkalibrasi'
    }[kind] || kind;
    return '<span class="badge b-' + kind + '">' + t + '</span>';
  }

  var LV = { hijau: 'Hijau', kuning: 'Kuning', oranye: 'Oranye', merah: 'Merah' };
  var LVDESC = {
    hijau: 'Normal & Terlindungi',
    kuning: 'Pemantauan Otomatis',
    oranye: 'Antrean Verifikasi',
    merah: 'Penundaan Terverifikasi'
  };
  function level(l, long) {
    return '<span class="lv lv-' + l + '"><i></i>' + (LV[l] || l) + (long ? ' &middot; ' + LVDESC[l] : '') + '</span>';
  }

  // Tipologi penapisan realistis (menggantikan kode mentah seperti P_saja, JK, kuat)
  var TAG_LABELS = {
    normal: 'Operasional Reguler UMKM',
    malam: 'Usaha Malam Wajar (Angkringan/Kopi)',
    seragam: 'Harga Tetap Wajar (Pulsa/Token)',
    acara: 'Lonjakan Musiman / Acara Lokal',
    payer_kurang: 'Cakupan ID Pembayar Parsial',
    riwayat_pendek: 'Merchant Baru (<28 Hari Riwayat)',
    baru_wajar: 'Ekspansi Merchant Baru Wajar',
    data_hilang: 'Transmisi Data Harian Parsial',
    P_saja: 'Anomali Tunggal: Lonjakan Volume (P)',
    K_saja: 'Anomali Tunggal: Deviasi Tiket/Profil (K)',
    J_saja: 'Anomali Tunggal: Komunitas Pembayar (J)',
    PJ: 'Konvergensi 2 Pilar: Volume & Jejaring (P+J)',
    JK: 'Konvergensi 2 Pilar: Jejaring & Profil (J+K)',
    PK: 'Konvergensi 2 Pilar: Volume & Profil Baru (P+K)',
    kuat: 'Indikasi Kuat: Konvergensi 3 Pilar (J+P+K)'
  };
  function tagLabel(tag) {
    return TAG_LABELS[tag] || tag || 'Operasional Reguler';
  }

  var GROUP_LABELS = {
    normal: 'UMKM Normal / Wajar',
    anomali: 'Anomali Parsial / Verifikasi',
    kuat: 'Indikasi Kuat Multi-Pilar'
  };
  function groupLabel(g) {
    return GROUP_LABELS[g] || g || '';
  }

  // Emblem toko arsitektural (bersih, modern, khas perbankan/fintech)
  var AWN = {
    'Warung kelontong': ['#15459B', '#DBEAFE', '#1E3A8A'],
    'Angkringan': ['#78350F', '#FEF3C7', '#92400E'],
    'Kedai kopi': ['#1E293B', '#E2E8F0', '#334155'],
    'Konter pulsa': ['#0F4C81', '#E0F2FE', '#0369A1'],
    'Toko pakaian': ['#6B21A8', '#F3E8FF', '#7E22CE'],
    'Laundry kiloan': ['#0F766E', '#CCFBF1', '#115E59'],
    'Bengkel motor': ['#374151', '#F3F4F6', '#4B5563'],
    'Fotokopi': ['#1D4ED8', '#EFF6FF', '#1E40AF'],
    'Bakso dan mi ayam': ['#B45309', '#FFEDD5', '#9A3412'],
    'Toko sembako': ['#047857', '#D1FAE5', '#065F46']
  };
  function storefront(m, size) {
    var c = AWN[m.kategori] || ['#15459B', '#DBEAFE', '#1E3A8A'];
    var s = size || 44;
    var ini = m.nama
      .replace(/^(Toko|Warung|Kedai|Konter|Bakso|Mi|Angkringan|Kopi|Laundry|Bengkel|Fotokopi|Grosir|Sembako|Busana|Distro|Servis|Copy|Pulsa)\s+/i, '')
      .split(/\s+/).slice(0, 2).map(function (w) { return w[0] || ''; }).join('').toUpperCase() || 'MC';
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 60 60" role="img" aria-label="Identitas visual ' + esc(m.nama) + '">' +
      '<rect width="60" height="60" rx="14" fill="' + c[1] + '"/>' +
      '<path d="M0 14C0 6.268 6.268 0 14 0h32c7.732 0 14 6.268 14 14v7H0v-7Z" fill="' + c[0] + '"/>' +
      '<text x="30" y="14.5" font-size="9.5" font-weight="800" fill="#FFFFFF" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif" letter-spacing="0.06em">' + esc(ini) + '</text>' +
      '<rect x="9" y="25" width="42" height="27" rx="5" fill="#FFFFFF" stroke="' + c[0] + '" stroke-opacity="0.18" stroke-width="1.2"/>' +
      '<rect x="14" y="30" width="18" height="13" rx="2.5" fill="' + c[1] + '"/>' +
      '<rect x="35" y="30" width="11" height="22" rx="2" fill="' + c[2] + '" opacity="0.88"/>' +
      '<circle cx="43.5" cy="41" r="1" fill="#FFFFFF"/>' +
      '<rect x="14" y="46" width="18" height="2.5" rx="1.2" fill="' + c[0] + '" opacity="0.35"/>' +
      '</svg>';
  }

  // ---------- Grafik Analitik Publikasi ----------
  function axisY(min, max, n) {
    var diff = Math.max(1, max - min);
    var step = niceStep(diff / (n || 4)), out = [];
    for (var v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) out.push(v);
    return out;
  }
  function niceStep(raw) {
    if (!raw || raw <= 0) return 1;
    var p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
    return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
  }

  // Linimasa 56 hari dengan pita persentil P10-P90 sebaya, garis median, jendela acuan, dan penanda CUSUM
  function timeline(m) {
    var W = 580, H = 225, L = 44, R = 16, T = 20, B = 32, n = m.daily.length;
    var vals = m.daily.filter(function (v) { return v !== null && v !== undefined; }).concat(m.band.map(function (b) { return b[2]; }));
    var mx = Math.max(10, Math.max.apply(null, vals) * 1.12);
    var X = function (i) { return L + (W - L - R) * i / (n - 1); };
    var Y = function (v) { return T + (H - T - B) * (1 - v / mx); };

    var up = m.band.map(function (b, i) { return X(i).toFixed(1) + ',' + Y(b[2]).toFixed(1); }).join(' ');
    var lo = m.band.map(function (b, i) { return X(i).toFixed(1) + ',' + Y(b[0]).toFixed(1); }).reverse().join(' ');
    var med = m.band.map(function (b, i) { return (i ? 'L' : 'M') + X(i).toFixed(1) + ',' + Y(b[1]).toFixed(1); }).join('');

    var line = '', area = '', dots = '', pen = false, firstX = null, lastX = null;
    m.daily.forEach(function (v, i) {
      if (v === null || v === undefined) { pen = false; return; }
      var cx = X(i).toFixed(1), cy = Y(v).toFixed(1);
      line += (pen ? 'L' : 'M') + cx + ',' + cy;
      if (firstX === null) firstX = cx;
      lastX = cx;
      pen = true;
      if (i === n - 1 || i === m.cusum.alarmAt || (m._event && (i === m._event[0] || i === m._event[0] + 1))) {
        dots += '<circle cx="' + cx + '" cy="' + cy + '" r="3.6" fill="#FFFFFF" stroke="#091E42" stroke-width="2.2"><title>Hari ke-' + (i + 1) + ': ' + idn(v) + ' transaksi</title></circle>';
      }
    });

    var g = axisY(0, mx, 4).map(function (v) {
      return '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(v).toFixed(1) + '" y2="' + Y(v).toFixed(1) + '" stroke="#E2E8F0" stroke-dasharray="2 2"/>' +
        '<text x="' + (L - 8) + '" y="' + (Y(v) + 3.5).toFixed(1) + '" font-size="10" text-anchor="end" fill="#64748B" font-family="JetBrains Mono,monospace">' + idn(v) + '</text>';
    }).join('');

    var xl = [0, 14, 28, 42, 55].map(function (i) {
      var lbl = i === 55 ? 'Hari ke-56 (Kini)' : i === 28 ? 'H-28 (Batas Acuan)' : i === 42 ? 'H-14 (Evaluasi)' : 'H-' + (55 - i);
      return '<text x="' + X(i).toFixed(1) + '" y="' + (H - 8) + '" font-size="10" text-anchor="' + (i === 55 ? 'end' : i === 0 ? 'start' : 'middle') + '" fill="#64748B" font-weight="500">' + lbl + '</text>';
    }).join('');

    var baseZone = '<rect x="' + L + '" y="' + T + '" width="' + (X(27) - L).toFixed(1) + '" height="' + (H - T - B) + '" fill="#F1F5F9" opacity="0.75"/>' +
      '<text x="' + (L + 8) + '" y="' + (T + 14) + '" font-size="9.5" font-weight="700" fill="#475569" letter-spacing="0.03em">PERIODE ACUAN (28 HARI)</text>';

    var evalZone = '<rect x="' + X(42).toFixed(1) + '" y="' + T + '" width="' + (X(55) - X(42)).toFixed(1) + '" height="' + (H - T - B) + '" fill="#EFF6FF" opacity="0.55"/>' +
      '<line x1="' + X(42).toFixed(1) + '" x2="' + X(42).toFixed(1) + '" y1="' + T + '" y2="' + (H - B) + '" stroke="#93C5FD" stroke-dasharray="3 3"/>' +
      '<text x="' + (X(42) + 6).toFixed(1) + '" y="' + (T + 14) + '" font-size="9.5" font-weight="700" fill="#1D5BD8" letter-spacing="0.03em">EVALUASI 14H</text>';

    var al = m.cusum.alarmAt >= 0 ?
      '<line x1="' + X(m.cusum.alarmAt).toFixed(1) + '" x2="' + X(m.cusum.alarmAt).toFixed(1) + '" y1="' + T + '" y2="' + (H - B) + '" stroke="#EA580C" stroke-width="1.8" stroke-dasharray="4 3"/>' +
      '<rect x="' + Math.min(W - 118, Math.max(L + 4, X(m.cusum.alarmAt) - 52)).toFixed(1) + '" y="' + (T + 20) + '" width="108" height="18" rx="4" fill="#FFF7ED" stroke="#FDBA74"/>' +
      '<text x="' + Math.min(W - 64, Math.max(L + 58, X(m.cusum.alarmAt) + 2)).toFixed(1) + '" y="' + (T + 32) + '" font-size="9.5" font-weight="700" text-anchor="middle" fill="#9A3412">Alarm CUSUM (H' + (m.cusum.alarmAt + 1) + ')</text>' : '';

    return '<div class="chart-container"><svg class="chart" viewBox="0 0 ' + W + ' ' + H + '">' +
      baseZone + evalZone + g +
      '<polygon points="' + up + ' ' + lo + '" fill="#2563EB" opacity="0.13"/>' +
      '<path d="' + med + '" fill="none" stroke="#3B82F6" stroke-width="1.4" stroke-dasharray="4 3"/>' +
      '<path class="ln" pathLength="1" d="' + line + '" fill="none" stroke="#091E42" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>' +
      al + dots + xl +
      '</svg>' +
      '<div class="chart-legend">' +
      '<span><i style="background:#091E42;height:3px"></i>Transaksi Harian Merchant</span>' +
      '<span><i style="background:#3B82F6;border-bottom:2px dashed #3B82F6;height:0"></i>Median Sebaya Sejenis</span>' +
      '<span><i style="background:rgba(37,99,235,0.22)"></i>Pita Normal P10–P90 Sebaya</span>' +
      (m.cusum.alarmAt >= 0 ? '<span><i style="background:#EA580C"></i>Titik Alarm CUSUM Atas</span>' : '') +
      '</div></div>';
  }

  // Distribusi 24 jam transaksi
  function hours(m) {
    var W = 580, H = 148, L = 32, R = 12, T = 16, B = 26, mx = Math.max(0.05, Math.max.apply(null, m.hours) * 1.15), bw = (W - L - R) / 24;
    var bars = m.hours.map(function (v, h) {
      var y = T + (H - T - B) * (1 - v / mx), bh = Math.max(2, H - B - y);
      var night = h >= 22 || h <= 4;
      var pct = (v * 100).toFixed(1) + '%';
      return '<g><rect class="gb" x="' + (L + h * bw + 2).toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + (bw - 4).toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="3" fill="' + (night ? '#091E42' : '#3B82F6') + '" opacity="' + (night ? '0.92' : '0.78') + '"><title>Pukul ' + String(h).padStart(2, '0') + '.00: ' + pct + ' transaksi</title></rect></g>';
    }).join('');
    var xl = [0, 3, 6, 9, 12, 15, 18, 21, 23].map(function (h) {
      return '<text x="' + (L + h * bw + bw / 2).toFixed(1) + '" y="' + (H - 7) + '" font-size="9.5" text-anchor="middle" fill="#64748B" font-family="JetBrains Mono,monospace">' + String(h).padStart(2, '0') + ':00</text>';
    }).join('');
    var yl = [0, mx / 2, mx].map(function (v) {
      var y = T + (H - T - B) * (1 - v / mx);
      return '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="#E2E8F0" stroke-dasharray="2 2"/>' +
        '<text x="' + (L - 5) + '" y="' + (y + 3).toFixed(1) + '" font-size="9" text-anchor="end" fill="#94A3B8" font-family="JetBrains Mono,monospace">' + Math.round(v * 100) + '%</text>';
    }).join('');
    return '<div class="chart-container"><svg class="chart" viewBox="0 0 ' + W + ' ' + H + '">' + yl + bars + xl + '</svg>' +
      '<div class="chart-legend">' +
      '<span><i style="background:#3B82F6"></i>Jam Siang &amp; Sore (05.00–21.59)</span>' +
      '<span><i style="background:#091E42"></i>Jam Malam &amp; Dini Hari (22.00–04.59): <b>' + idn(m.nightShare * 100, 1) + '%</b></span>' +
      '</div></div>';
  }

  // Graf jejaring pembayar lintas merchant (deterministik, gaya pegas)
  function rnd2(i) { var x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); }
  function network(center, T) {
    var ms = [center].concat(Object.keys(center.links).map(T.byId)).slice(0, 9), ids = {}, nodes = [], edges = [];
    ms.forEach(function (m) { ids[m.id] = 1; });
    var payerHits = {};
    ms.forEach(function (m) { m.uniq.forEach(function (p) { (payerHits[p] = payerHits[p] || []).push(m.id); }); });
    var shared = Object.keys(payerHits).filter(function (p) { return payerHits[p].length >= 2; });
    shared.sort(function (a, b) { return payerHits[b].length - payerHits[a].length; });
    shared = shared.slice(0, 48);
    var own = center.uniq.filter(function (p) { return payerHits[p].length === 1; }).slice(0, 12);
    var CX = 260, CY = 185, RAD = 126;
    ms.forEach(function (m, i) {
      var a = -Math.PI / 2 + 2 * Math.PI * i / ms.length;
      var r = ms.length === 1 ? 0 : (i === 0 ? 0 : RAD);
      if (i > 0) a = -Math.PI / 2 + 2 * Math.PI * (i - 1) / (ms.length - 1);
      nodes.push({ id: m.id, t: 'm', m: m, a: a, fixed: true, x: i === 0 ? CX : CX + r * Math.cos(a), y: i === 0 ? CY : CY + r * Math.sin(a) });
    });
    var idx = {}; nodes.forEach(function (n, i) { idx[n.id] = i; });
    shared.concat(own).forEach(function (p, i) {
      var hs = payerHits[p], x = 0, y = 0;
      hs.forEach(function (mid) { x += nodes[idx[mid]].x; y += nodes[idx[mid]].y; });
      x /= hs.length; y /= hs.length;
      if (hs.length === 1) {
        var ang = (2 * Math.PI * i) / Math.max(1, own.length);
        x = CX + (RAD + 36) * Math.cos(ang);
        y = CY + (RAD + 36) * Math.sin(ang);
      }
      nodes.push({ id: p, t: 'p', shared: hs.length, listed: !!T.listed[p], x: x + (rnd2(i) - 0.5) * 42, y: y + (rnd2(i + 99) - 0.5) * 42 });
    });
    nodes.forEach(function (n, i) { idx[n.id] = i; });
    shared.concat(own).forEach(function (p) { payerHits[p].forEach(function (mid) { edges.push([idx[p], idx[mid]]); }); });
    for (var it = 0; it < 130; it++) {
      for (var i = 0; i < nodes.length; i++) for (var j = i + 1; j < nodes.length; j++) {
        var a = nodes[i], b = nodes[j]; if (a.t === 'm' && b.t === 'm') continue;
        var dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy + 0.01; if (d2 > 1100) continue; var f = 72 / d2;
        if (!a.fixed) { a.x += dx * f; a.y += dy * f; } if (!b.fixed) { b.x -= dx * f; b.y -= dy * f; }
      }
      nodes.forEach(function (n) {
        if (!n.fixed) {
          var r = Math.hypot(n.x - CX, n.y - CY);
          if (r > RAD + 44) { n.x = CX + (n.x - CX) * (RAD + 44) / r; n.y = CY + (n.y - CY) * (RAD + 44) / r; }
        }
      });
    }
    var rings = '<circle cx="' + CX + '" cy="' + CY + '" r="' + (RAD * 0.55).toFixed(1) + '" fill="none" stroke="#E2E8F0" stroke-dasharray="3 3"/>' +
      '<circle cx="' + CX + '" cy="' + CY + '" r="' + RAD + '" fill="none" stroke="#E2E8F0" stroke-dasharray="4 4"/>';
    var es = edges.map(function (e) {
      var a = nodes[e[0]], b = nodes[e[1]];
      var col = a.listed ? '#DC2626' : a.shared >= 3 ? '#EA580C' : '#CBD5E1';
      var op = a.listed ? 0.55 : a.shared >= 3 ? 0.42 : 0.35;
      return '<line x1="' + a.x.toFixed(1) + '" y1="' + a.y.toFixed(1) + '" x2="' + b.x.toFixed(1) + '" y2="' + b.y.toFixed(1) + '" stroke="' + col + '" stroke-opacity="' + op + '" stroke-width="' + (a.listed ? 1.4 : 1) + '"/>';
    }).join('');
    var ns = nodes.map(function (n) {
      if (n.t === 'p') {
        var r = n.listed ? 4.8 : n.shared >= 3 ? 4.0 : 2.8;
        var fill = n.listed ? '#DC2626' : n.shared >= 3 ? '#EA580C' : '#94A3B8';
        return '<circle cx="' + n.x.toFixed(1) + '" cy="' + n.y.toFixed(1) + '" r="' + r + '" fill="' + fill + '" stroke="#FFFFFF" stroke-width="1"><title>Pembayar ' + esc(n.id) + ' (' + n.shared + ' merchant' + (n.listed ? ', cocok daftar rujukan' : '') + ')</title></circle>';
      }
      var me = n.m === center;
      var col = { hijau: '#0F9D6E', kuning: '#D9820B', oranye: '#E05D10', merah: '#D92D20' }[n.m.level] || '#1D5BD8';
      var bw = me ? 24 : 20;
      var ty = me ? (n.y - 16) : (n.y + Math.sin(n.a) * 20 + 3);
      var tx = me ? n.x : (n.x + Math.cos(n.a) * 18);
      var anchor = me ? 'middle' : (Math.cos(n.a) > 0.3 ? 'start' : Math.cos(n.a) < -0.3 ? 'end' : 'middle');
      return '<g data-m="' + n.id + '" style="cursor:pointer">' +
        '<title>' + esc(n.m.nama) + ' (' + n.id + ') — Skor ' + n.m.score + '</title>' +
        '<rect x="' + (n.x - bw / 2).toFixed(1) + '" y="' + (n.y - bw / 2).toFixed(1) + '" width="' + bw + '" height="' + bw + '" rx="6" fill="' + (me ? '#091E42' : '#FFFFFF') + '" stroke="' + col + '" stroke-width="2.6"/>' +
        '<text x="' + n.x.toFixed(1) + '" y="' + (n.y + 3.5).toFixed(1) + '" font-size="8.5" font-weight="800" text-anchor="middle" fill="' + (me ? '#FFFFFF' : '#091E42') + '" font-family="JetBrains Mono,monospace">' + n.id + '</text>' +
        '<text x="' + tx.toFixed(1) + '" y="' + ty.toFixed(1) + '" font-size="10" text-anchor="' + anchor + '" fill="#091E42" font-weight="' + (me ? 800 : 600) + '">' + esc(n.m.nama.length > 22 ? n.m.nama.slice(0, 20) + '..' : n.m.nama) + '</text>' +
        '</g>';
    }).join('');
    return {
      svg: '<svg class="chart net-svg" viewBox="0 0 520 370">' + rings + es + ns + '</svg>',
      nMerchant: ms.length,
      nShared: shared.length,
      nListed: shared.filter(function (p) { return T.listed[p]; }).length
    };
  }

  function bars(data, o) {
    o = o || {};
    var W = 500, H = o.h || 195, L = o.left || 16, R = 16, T = 26, B = 30;
    var mx = o.max || Math.max.apply(null, data.map(function (d) { return d.v; })) * 1.15;
    var bw = (W - L - R) / data.length;
    var grid = [0.25, 0.5, 0.75, 1].map(function (f) {
      var y = T + (H - T - B) * (1 - f);
      return '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="#EEF2F7" stroke-dasharray="2 2"/>';
    }).join('');
    var s = data.map(function (d, i) {
      var y = T + (H - T - B) * (1 - d.v / mx), x = L + i * bw + bw * 0.2;
      var w = bw * 0.6;
      return '<g>' +
        '<rect class="gb" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + Math.max(2, H - B - y).toFixed(1) + '" rx="6" fill="' + (d.c || '#64748B') + '"/>' +
        '<text x="' + (x + w / 2).toFixed(1) + '" y="' + (y - 7).toFixed(1) + '" font-size="11" text-anchor="middle" font-weight="700" fill="#091E42" font-family="JetBrains Mono,monospace">' + (d.t || idn(d.v)) + '</text>' +
        '<text x="' + (x + w / 2).toFixed(1) + '" y="' + (H - 8) + '" font-size="10.5" font-weight="600" text-anchor="middle" fill="#475569">' + esc(d.l) + '</text>' +
        '</g>';
    }).join('');
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '">' + grid + '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + (H - B) + '" y2="' + (H - B) + '" stroke="#CBD5E1"/>' + s + '</svg>';
  }

  // Dekomposisi visual 5 komponen skor prioritas
  function scoreBreakdown(m, W) {
    var items = [
      { key: 'jaringan', label: 'Jejaring Pembayar Lintas Toko (J)', w: W.jaringan, val: m.parts.jaringan, col: '#1D5BD8' },
      { key: 'sebaya', label: 'Deviasi Volume vs Sebaya (P1)', w: W.sebaya, val: m.parts.sebaya, col: '#6366F1' },
      { key: 'perubahan', label: 'Perubahan Riwayat & CUSUM (P2)', w: W.perubahan, val: m.parts.perubahan, col: '#0284C7' },
      { key: 'profil', label: 'Anomali Umur & Tiket Rata-rata (K1)', w: W.profil, val: m.parts.profil, col: '#D97706' },
      { key: 'daftar', label: 'Kecocokan Daftar Rujukan (K2)', w: W.daftar, val: m.parts.daftar, col: '#DC2626' }
    ];
    return '<div class="score-breakdown">' + items.map(function (it) {
      var pct = Math.round((it.val || 0) * 100);
      var pts = ((it.w * (it.val || 0)) * 100).toFixed(1);
      return '<div class="sb-row">' +
        '<div class="sb-head">' +
          '<span class="sb-label">' + it.label + ' <small>(Bobot ' + Math.round(it.w * 100) + '%)</small></span>' +
          '<span class="sb-val num">+' + pts + ' pt <small>(P' + pct + ')</small></span>' +
        '</div>' +
        '<div class="sb-track"><div class="sb-fill" style="width:' + pct + '%;background:' + it.col + '"></div></div>' +
      '</div>';
    }).join('') + '</div>';
  }

  window.UI = {
    icon: icon, idn: idn, rp: rp, esc: esc, badge: badge, level: level,
    LV: LV, LVDESC: LVDESC, tagLabel: tagLabel, groupLabel: groupLabel,
    storefront: storefront, timeline: timeline, hours: hours, network: network,
    bars: bars, axisY: axisY, scoreBreakdown: scoreBreakdown
  };
})();
