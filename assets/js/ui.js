/* TAPIS ui helpers: ikon, format angka, grafik SVG, foto toko DEMO */
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
    alert: '<path d="M12 3 2 20h20Z"/><path d="M12 9.5v5M12 17.5v.5"/>'
  };
  function icon(n, cls) { return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (I[n] || '') + '</svg>'; }

  function idn(v, d) { if (v === null || v === undefined || isNaN(v)) return '-'; return Number(v).toLocaleString('id-ID', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
  function rp(v) { return 'Rp' + idn(Math.round(v)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function badge(kind) { var t = { resmi: 'Resmi', hitungan: 'Hitungan', asumsi: 'Asumsi', demo: 'Demo' }[kind]; return '<span class="badge b-' + kind + '">' + t + '</span>'; }
  var LV = { hijau: 'Hijau', kuning: 'Kuning', oranye: 'Oranye', merah: 'Merah' };
  var LVDESC = { hijau: 'Normal', kuning: 'Pantau', oranye: 'Perlu verifikasi', merah: 'Dibatasi' };
  function level(l, long) { return '<span class="lv lv-' + l + '"><i></i>' + LV[l] + (long ? ' &middot; ' + LVDESC[l] : '') + '</span>'; }

  // foto toko DEMO (ilustrasi vektor)
  var AWN = { 'Warung kelontong': ['#1E5BD8', '#E6EEFB'], 'Angkringan': ['#7A4A2A', '#F3D9B5'], 'Kedai kopi': ['#3A2A22', '#C9A27A'], 'Konter pulsa': ['#2F3F6E', '#DCE2F0'],
    'Toko pakaian': ['#8A3E5C', '#F0DCE4'], 'Laundry kiloan': ['#2F7D8B', '#DCEEF1'], 'Bengkel motor': ['#4A4A4A', '#D9B84A'], 'Fotokopi': ['#55666A', '#E6E9EA'],
    'Bakso dan mi ayam': ['#E0413A', '#F3E1C8'], 'Toko sembako': ['#17A673', '#E8D9A8'] };
  function storefront(m, size) {
    var c = AWN[m.kategori] || ['#1E5BD8', '#E6EEFB'], s = size || 44, ini = m.nama.replace(/^(Toko|Warung|Kedai|Konter|Bakso|Mi|Angkringan|Kopi|Laundry|Bengkel|Fotokopi|Grosir|Sembako|Busana|Distro|Servis|Copy|Pulsa)\s+/i, '').split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
    var stripes = ''; for (var i = 0; i < 6; i++) stripes += '<rect x="' + (i * 10) + '" y="14" width="10" height="9" fill="' + (i % 2 ? c[1] : c[0]) + '"/>';
    var scal = ''; for (var j = 0; j < 6; j++) scal += '<circle cx="' + (j * 10 + 5) + '" cy="23" r="5" fill="' + (j % 2 ? c[1] : c[0]) + '"/>';
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 60 60" role="img" aria-label="Ilustrasi toko (demo)"><rect width="60" height="60" fill="#EEF3FA"/>' +
      '<rect x="0" y="0" width="60" height="14" fill="' + c[0] + '"/><text x="30" y="10.5" font-size="8" font-weight="700" fill="#fff" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif">' + esc(ini) + '</text>' +
      stripes + scal + '<rect x="6" y="30" width="48" height="30" fill="#FFFFFF"/><rect x="10" y="34" width="22" height="16" rx="1.5" fill="' + c[1] + '" opacity=".8"/>' +
      '<rect x="36" y="34" width="14" height="26" rx="1.5" fill="' + c[0] + '" opacity=".85"/><rect x="10" y="52" width="22" height="3" fill="' + c[0] + '" opacity=".4"/></svg>';
  }

  // ---------- grafik ----------
  function axisY(min, max, n) { var step = niceStep((max - min) / n), out = []; for (var v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) out.push(v); return out; }
  function niceStep(raw) { var p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p; }

  function timeline(m) {
    var W = 340, H = 170, L = 34, R = 8, T = 10, B = 22, n = m.daily.length;
    var mx = Math.max.apply(null, m.daily.concat(m.band.map(function (b) { return b[2]; }))) * 1.08;
    var X = function (i) { return L + (W - L - R) * i / (n - 1); }, Y = function (v) { return T + (H - T - B) * (1 - v / mx); };
    var up = m.band.map(function (b, i) { return X(i) + ',' + Y(b[2]); }).join(' '), lo = m.band.map(function (b, i) { return X(i) + ',' + Y(b[0]); }).reverse().join(' ');
    var med = m.band.map(function (b, i) { return (i ? 'L' : 'M') + X(i) + ',' + Y(b[1]); }).join('');
    var line = m.daily.map(function (v, i) { return (i ? 'L' : 'M') + X(i).toFixed(1) + ',' + Y(v).toFixed(1); }).join('');
    var g = axisY(0, mx, 4).map(function (v) { return '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke="#E8EEF7"/><text x="' + (L - 5) + '" y="' + (Y(v) + 3.5) + '" font-size="9" text-anchor="end" fill="#94A3B8">' + idn(v) + '</text>'; }).join('');
    var xl = [0, 14, 28, 42, 55].map(function (i) { return '<text x="' + X(i) + '" y="' + (H - 6) + '" font-size="9" text-anchor="' + (i === 55 ? 'end' : i === 0 ? 'start' : 'middle') + '" fill="#94A3B8">' + (i === 55 ? 'hari ini' : '-' + (55 - i) + ' hr') + '</text>'; }).join('');
    var base = '<rect x="' + L + '" y="' + T + '" width="' + (X(27) - L) + '" height="' + (H - T - B) + '" fill="#F4F7FC"/><text x="' + (L + 4) + '" y="' + (T + 10) + '" font-size="8.5" fill="#94A3B8">masa acuan 28 hari</text>';
    var al = m.cusum.alarmAt >= 0 ? '<line x1="' + X(m.cusum.alarmAt) + '" x2="' + X(m.cusum.alarmAt) + '" y1="' + T + '" y2="' + (H - B) + '" stroke="#F07A1A" stroke-dasharray="3 3"/><text x="' + (X(m.cusum.alarmAt) + 3) + '" y="' + (T + 22) + '" font-size="8.5" fill="#B4530F">CUSUM alarm</text>' : '';
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '">' + base + g + '<polygon points="' + up + ' ' + lo + '" fill="#3B82F6" opacity=".12"/><path d="' + med + '" fill="none" stroke="#1E5BD8" stroke-width="1" stroke-dasharray="3 3"/>' +
      '<path class="ln" pathLength="1" d="' + line + '" fill="none" stroke="#1E5BD8" stroke-width="2" stroke-linejoin="round"/>' + al + xl + '</svg>';
  }

  function hours(m) {
    var W = 340, H = 92, L = 6, R = 6, T = 6, B = 18, mx = Math.max.apply(null, m.hours), bw = (W - L - R) / 24;
    var bars = m.hours.map(function (v, h) { var y = T + (H - T - B) * (1 - v / mx), night = h >= 22 || h <= 4; return '<rect class="gb" x="' + (L + h * bw + 1) + '" y="' + y + '" width="' + (bw - 2) + '" height="' + (H - B - y) + '" rx="1.5" fill="' + (night ? '#0B2A5B' : '#BFD3F5') + '"/>'; }).join('');
    var xl = [0, 6, 12, 18, 23].map(function (h) { return '<text x="' + (L + h * bw + bw / 2) + '" y="' + (H - 5) + '" font-size="9" text-anchor="' + (h === 0 ? 'start' : h === 23 ? 'end' : 'middle') + '" fill="#94A3B8">' + String(h).padStart(2, '0') + '.00</text>'; }).join('');
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '">' + bars + xl + '</svg>';
  }

  // tata letak gaya-pegas sederhana (deterministik)
  function rnd2(i) { var x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); }
  function network(center, T) {
    var ms = [center].concat(Object.keys(center.links).map(T.byId)).slice(0, 9), ids = {}, nodes = [], edges = [];
    ms.forEach(function (m) { ids[m.id] = 1; });
    var payerHits = {};
    ms.forEach(function (m) { m.uniq.forEach(function (p) { (payerHits[p] = payerHits[p] || []).push(m.id); }); });
    var shared = Object.keys(payerHits).filter(function (p) { return payerHits[p].length >= 2; });
    shared.sort(function (a, b) { return payerHits[b].length - payerHits[a].length; }); shared = shared.slice(0, 46);
    var own = center.uniq.filter(function (p) { return payerHits[p].length === 1; }).slice(0, 10);
    var CX = 170, CY = 150, RAD = 108;
    ms.forEach(function (m, i) { var a = -Math.PI / 2 + 2 * Math.PI * i / ms.length; nodes.push({ id: m.id, t: 'm', m: m, a: a, fixed: true, x: CX + RAD * Math.cos(a), y: CY + RAD * Math.sin(a) }); });
    var idx = {}; nodes.forEach(function (n, i) { idx[n.id] = i; });
    shared.concat(own).forEach(function (p, i) {
      var hs = payerHits[p], x = 0, y = 0; hs.forEach(function (mid) { x += nodes[idx[mid]].x; y += nodes[idx[mid]].y; });
      x /= hs.length; y /= hs.length; if (hs.length === 1) { var mm = nodes[idx[hs[0]]]; x = CX + (RAD + 26) * Math.cos(mm.a + (i % 5 - 2) * 0.09); y = CY + (RAD + 26) * Math.sin(mm.a + (i % 5 - 2) * 0.09); }
      nodes.push({ id: p, t: 'p', shared: hs.length, listed: !!T.listed[p], x: x + (rnd2(i) - 0.5) * 30, y: y + (rnd2(i + 99) - 0.5) * 30 });
    });
    nodes.forEach(function (n, i) { idx[n.id] = i; });
    shared.concat(own).forEach(function (p) { payerHits[p].forEach(function (mid) { edges.push([idx[p], idx[mid]]); }); });
    for (var it = 0; it < 120; it++) {
      for (var i = 0; i < nodes.length; i++) for (var j = i + 1; j < nodes.length; j++) {
        var a = nodes[i], b = nodes[j]; if (a.t === 'm' && b.t === 'm') continue;
        var dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy + 0.01; if (d2 > 900) continue; var f = 60 / d2;
        if (!a.fixed) { a.x += dx * f; a.y += dy * f; } if (!b.fixed) { b.x -= dx * f; b.y -= dy * f; }
      }
      nodes.forEach(function (n) { if (!n.fixed) { var r = Math.hypot(n.x - CX, n.y - CY); if (r > RAD + 34) { n.x = CX + (n.x - CX) * (RAD + 34) / r; n.y = CY + (n.y - CY) * (RAD + 34) / r; } } });
    }
    var es = edges.map(function (e) { var a = nodes[e[0]], b = nodes[e[1]]; return '<line x1="' + a.x.toFixed(1) + '" y1="' + a.y.toFixed(1) + '" x2="' + b.x.toFixed(1) + '" y2="' + b.y.toFixed(1) + '" stroke="' + (a.shared >= 3 ? '#F07A1A' : '#CBD5E1') + '" stroke-opacity="' + (a.shared >= 3 ? .45 : .5) + '" stroke-width="1"/>'; }).join('');
    var ns = nodes.map(function (n) {
      if (n.t === 'p') return '<circle cx="' + n.x.toFixed(1) + '" cy="' + n.y.toFixed(1) + '" r="' + (n.shared >= 3 ? 3.6 : 2.6) + '" fill="' + (n.listed ? '#E0413A' : n.shared >= 3 ? '#F07A1A' : '#94A3B8') + '"/>';
      var me = n.m === center, col = { hijau: '#17A673', kuning: '#E0A100', oranye: '#F07A1A', merah: '#E0413A' }[n.m.level];
      return '<g data-m="' + n.id + '" style="cursor:pointer"><rect x="' + (n.x - 9) + '" y="' + (n.y - 9) + '" width="18" height="18" rx="4" fill="' + (me ? '#0B2A5B' : '#fff') + '" stroke="' + col + '" stroke-width="2.4"/>' +
        '<text x="' + (n.x + Math.cos(n.a) * 16).toFixed(1) + '" y="' + (n.y + Math.sin(n.a) * 16 + 3).toFixed(1) + '" font-size="8.5" text-anchor="' + (Math.cos(n.a) > 0.3 ? 'start' : Math.cos(n.a) < -0.3 ? 'end' : 'middle') + '" fill="#0B2A5B" font-weight="' + (me ? 700 : 500) + '">' + esc(n.m.nama.length > 18 ? n.m.nama.slice(0, 17) + '.' : n.m.nama) + '</text></g>';
    }).join('');
    return { svg: '<svg class="chart" viewBox="-62 -8 464 316">' + es + ns + '</svg>', nMerchant: ms.length, nShared: shared.length, nListed: shared.filter(function (p) { return T.listed[p]; }).length };
  }

  function bars(data, o) { // data: [{l, v, c, t}]
    o = o || {}; var W = 340, H = o.h || 160, L = o.left || 8, R = 8, T = 18, B = 22, mx = o.max || Math.max.apply(null, data.map(function (d) { return d.v; })) * 1.12, bw = (W - L - R) / data.length;
    var s = data.map(function (d, i) { var y = T + (H - T - B) * (1 - d.v / mx), x = L + i * bw + bw * 0.18; return '<rect class="gb" x="' + x + '" y="' + y + '" width="' + (bw * 0.64) + '" height="' + (H - B - y) + '" rx="3" fill="' + (d.c || '#94A3B8') + '"/>' +
      '<text x="' + (x + bw * 0.32) + '" y="' + (y - 5) + '" font-size="10" text-anchor="middle" font-weight="700" fill="#0B2A5B">' + (d.t || idn(d.v)) + '</text><text x="' + (x + bw * 0.32) + '" y="' + (H - 6) + '" font-size="9.5" text-anchor="middle" fill="#64748B">' + esc(d.l) + '</text>'; }).join('');
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '">' + s + '</svg>';
  }

  window.UI = { icon: icon, idn: idn, rp: rp, esc: esc, badge: badge, level: level, LV: LV, LVDESC: LVDESC, storefront: storefront, timeline: timeline, hours: hours, network: network, bars: bars, axisY: axisY };
})();
