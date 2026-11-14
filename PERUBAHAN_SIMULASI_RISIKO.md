# Catatan Revisi TAPIS: Simulasi Risiko

## Ringkasan
Fitur Ambang pada aplikasi TAPIS telah diubah penyajian dan penamaannya menjadi **Simulasi Risiko**. Struktur aplikasi, mesin analisis, sumber data resmi, dan rumus statistik dipertahankan.

## File yang diubah
1. `assets/js/v-bukti.js`
   - Mengubah label tab Pusat Bukti dan tab Simulator.
   - Mengubah judul halaman menjadi Simulasi Risiko.
   - Menyusun ulang hierarki hasil: ketepatan, merchant terindikasi benar, UMKM salah ditandai, dan total merchant ditandai.
   - Menyederhanakan penjelasan grafik dan legenda.
   - Memberi penjelasan awam untuk parameter FPR, sensitivitas, dan prevalensi.
   - Menambahkan penjelasan teknis yang dapat dibuka, batas interpretasi, dan pernyataan perlindungan UMKM.
   - Mempertahankan `ambCalc()` tanpa perubahan.
2. `assets/css/app.css`
   - Menambahkan styling hierarki indikator, kartu hasil, penjelasan parameter, dan disclosure istilah teknis yang responsif.
3. `assets/js/v-kasus.js`
   - Memperbarui keterangan dan tautan menuju Simulasi Risiko.
4. `assets/js/v-home.js`
   - Memperbarui deskripsi menu simulator.
5. `index.html`
   - Memperbarui versi cache stylesheet.
6. `README.md`
   - Menambahkan dokumentasi singkat fitur Simulasi Risiko.

## Bagian yang sengaja tidak diubah
- `assets/js/engine.js`
- `assets/js/stats.js`
- `data/resmi.js`
- Sumber data dan angka resmi dari notebook.
- Rumus PPV: `Se*pi / (Se*pi + FPR*(1-pi))`.
- Rumus gabungan dua dari tiga: `3p^2(1-p) + p^3`.
- Perhitungan TP, FP, GMV harian, dan nilai transaksi bruto tertunda.

## Hasil pengujian
- Pemeriksaan sintaks dengan `node --check` untuk seluruh file JavaScript: **lulus**.
- Uji konsistensi formula pada 90 kombinasi parameter: **lulus**.
- Uji render komponen halaman menggunakan harness JavaScript: **lulus**.
- Uji perubahan sensitivitas dan FPR terhadap indikator ketepatan: **lulus**.
- Uji kompatibilitas rute lama `#/simulator/ambang`: dipertahankan melalui alias ke rute baru.
- Pemeriksaan perubahan file: hanya enam file aplikasi/dokumentasi di atas yang berubah; `engine.js` dan `data/resmi.js` tetap identik dengan arsip awal.

## Batas pengujian
Pengujian dilakukan pada pemeriksaan sintaks, fungsi perhitungan, dan render komponen dengan harness JavaScript. Pengujian lintas perangkat melalui browser nyata dan integrasi deployment belum dilakukan. Sebelum publikasi, lakukan uji manual pada browser desktop dan mobile, termasuk seluruh jalur navigasi dan akun demo.
