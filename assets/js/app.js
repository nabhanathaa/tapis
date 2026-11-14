/* TAPIS: router. Memuat modul tampilan yang terdaftar pada ruang nama window.A. */
(function () {
  'use strict';
  var A = window.A;
  function route() {
    document.querySelectorAll('.sheet-bg').forEach(function (x) { x.remove(); });
    var p = (location.hash || '#/').slice(2).split('/'), v = p[0] || 'beranda';
    if (!A.me()) { return A.viewAuth(v === 'daftar' ? 'daftar' : 'masuk'); }
    if (v === 'masuk' || v === 'daftar') { location.hash = '#/beranda'; return; }
    var u = A.me();
    var map = {
      beranda: A.viewBeranda,
      antrean: function () { return A.isPJP() ? A.viewAntrean() : A.viewPengawasan(); },
      merchant: function () { A.viewMerchant(p[1]); }, jejaring: function () { A.viewJejaring(p[1]); },
      kasus: function () { p[1] ? A.viewKasusDetail(p[1]) : A.viewKasus(); }, ltkm: A.viewKasus, pengawasan: A.viewPengawasan,
      bukti: function () { A.viewBukti(p[1]); }, simulator: function () { A.viewSimulator(p[1]); },
      data: A.viewData, menu: A.viewMenu, akun: A.viewAkun, panduan: A.viewPanduan, tentang: A.viewTentang
    };
    (map[v] || A.viewBeranda)();
  }
  A.route = route;
  window.addEventListener('hashchange', route);
  route();
})();
