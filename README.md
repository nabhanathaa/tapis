# TAPIS (prototipe)

Penapisan merchant QRIS untuk memutus deposit judi daring tanpa menjerat UMKM. HTML/CSS/JS murni, tanpa build.
Jalankan: `python3 -m http.server 8765` di folder ini lalu buka `http://localhost:8765/`. Untuk GitHub Pages: "Deploy from a branch", root.

TAPIS adalah prototipe riset, bukan sistem produksi, dan belum divalidasi dengan data berlabel.

## Struktur
- `data/resmi.js` angka RESMI/HITUNGAN dari `03_notebook/hasil/hasil_utama.json` (notebook revisi v2), dibangkitkan `../build_appdata.py`.
- `assets/js/stats.js` fungsi statistik (Robust Z, CUSUM, PPV, 2-dari-3). Dapat diuji di Node.
- `assets/js/synth.js` simulasi terpadu 100 merchant (80 normal, 15 anomali, 5 terindikasi kuat), 56 hari, ledger transaksi 14 hari. Bibit acak tetap.
- `assets/js/engine.js` sinyal J/P/K, skor prioritas, level penapisan (Hijau/Kuning/Oranye), antrean berkapasitas. Merah tidak pernah dihasilkan mesin.
- `assets/js/app-core.js` ruang nama `window.A`: penyimpanan demo, akun, model kasus, kerangka.
- `assets/js/v-home.js`, `v-merchant.js`, `v-kasus.js`, `v-bukti.js` halaman; `app.js` router; `ui.js` komponen dan grafik.

## Akun demo (kata sandi demo1234)
rani@arunika.demo (analis), dimas@arunika.demo dan hana@arunika.demo (pejabat; dua persetujuan harus dari dua orang), laras@bi.demo, yoga@ppatk.demo.
Akun dan peran disimpan di localStorage hanya untuk demonstrasi, bukan keamanan produksi.

## Jenis data
RESMI (publikasi PPATK/BI/BPS), HITUNGAN (notebook), ASUMSI (sensitivitas, bobot, k/h CUSUM, kapasitas, FPR), SIMULASI (merchant, transaksi, pembayar, kasus, daftar rujukan, akun).
Ekspor CSV simulasi: menu > Data simulasi.
