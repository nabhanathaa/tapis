# TAPIS — Sistem Penapisan Risiko & Surveilans Merchant QRIS

**TAPIS** adalah prototipe sistem pendukung keputusan (*Decision Support System* / *SupTech-RegTech*) untuk penapisan risiko dan prioritisasi pemeriksaan merchant QRIS guna memutus aliran deposit judi daring **tanpa menjerat UMKM yang jujur**. Dirancang dengan arsitektur web murni (HTML/CSS/JS tanpa *build step*) agar ringan, transparan, dan dapat dijalankan langsung di peramban maupun GitHub Pages.

## Cara Menjalankan
Jalankan peladen HTTP statis di folder ini:
```bash
python -m http.server 8765
```
Lalu buka `http://localhost:8765/` di peramban. Untuk publikasi di GitHub Pages, gunakan pengaturan **Deploy from a branch** (`main` / `root`).

---

## Arsitektur Modul & Berkas Utama
- `data/resmi.js` & `data/klaster_514.json` — Data makro resmi dan hasil komputasi ekonometrika dari *notebook* riset (`analisis_tapis.ipynb`): statistik QRIS BI, deposit & deret waktu LTKM PPATK, peta vektor 38 provinsi, serta hasil pengelompokan *Agglomerative Ward* pada ruang *Centered Log-Ratio* (CLR) 17 lapangan usaha PDRB 514 kabupaten/kota BPS.
- `assets/js/stats.js` — Fungsi statistik murni (*Robust Z-Score* Iglewicz-Hoaglin, *Tabular CUSUM* Page 1954, Teorema Bayes PPV, dan peluang binomial 2-dari-3).
- `assets/js/synth.js` — Pembangkit skenario terkalibrasi 100 merchant (80 operasional normal/wajar, 15 anomali parsial, 5 konvergensi kuat), deret 56 hari, dan buku besar (*ledger*) transaksi 14 hari terakhir dengan bibit acak tetap (*deterministic seed*).
- `assets/js/engine.js` — Mesin evaluasi 4 lapis: (1) Tiga pilar sinyal **J** (Jejaring Pembayar), **P** (Perilaku Relatif Sebaya 3-Lapis), dan **K** (Profil & Konteks Wilayah); (2) Skor Prioritas Komposit (0–100); (3) Level Penapisan Otomatis (Hijau, Kuning, Oranye — mesin **tidak pernah** menghasilkan Level Merah secara otomatis); dan (4) Antrean Pemeriksaan Sadar Kapasitas.
- `assets/js/ui.js` — Sistem komponen visual, ikonografi vektor, tipologi pengawasan perbankan, dekomposisi bobot skor, dan grafik SVG publikasi.
- `assets/js/app-core.js` — Kerangka aplikasi *enterprise* (*Sidebar* navigasi, *Top Command Bar* dengan pencarian instan global, *Role Switcher* 1-klik lintas instansi, indeks spasial 38 provinsi & 514 kabupaten/kota, serta manajemen berkas kasus).
- `assets/js/v-home.js`, `v-merchant.js`, `v-kasus.js`, `v-bukti.js`, `app.js` — Modul tampilan halaman dan *router*.

---

## Simulasi Lintas Peran Instansi (Kata Sandi: `demo1234`)
Pengguna atau dewan juri dapat beralih peran secara instan melalui **Dok Peran Aktif** di bagian kiri bawah *sidebar* atau melalui layar masuk:
1. **Analis PJP (`rani@arunika.demo`)** — Meninjau antrean Oranye, membuka berkas kasus, mencatat bukti kunjungan lapangan/dokumen, meminta klarifikasi merchant, dan mengajukan penundaan transaksi.
2. **Pejabat Kepatuhan PJP 1 & 2 (`dimas@arunika.demo` & `hana@arunika.demo`)** — Menjalankan mekanisme *Dual-Control* (otorisasi penundaan wajib disetujui oleh 2 pejabat kepatuhan berbeda), memutus keberatan merchant (UU No. 8 Tahun 2010 Pasal 67), mencabut pembatasan, atau meneruskan LTKM ke PPATK.
3. **Pengawas Bank Indonesia (`laras@bi.demo`)** — Mengawasi kepatuhan SLA PJP pengakuisisi, memantau rasio koreksi perlindungan UMKM, dan menelaah pusat bukti nasional.
4. **Analis PPATK (`yoga@ppatk.demo`)** — Meninjau dokumen LTKM yang diteruskan oleh PJP beserta topologi graf jejaring pembayar.

---

## Fitur Utama
- **Surveilans Multi-Layer (Tiga Pilar Sinyal J · P · K) & Perlindungan UMKM:** Memastikan usaha malam (*angkringan* / kopi), transaksi nominal seragam (konter pulsa / token listrik), dan lonjakan musiman/acara lokal tetap berada di **Level Hijau**.
- **Pembanding Kontekstual 3-Lapis & Peta Interaktif 514 Wilayah:** Menggabungkan peta vektor interaktif 38 provinsi dan peta *choropleth* 514 kabupaten/kota berbasis 17 lapangan usaha PDRB BPS (*Ward CLR K=4*, *Hopkins Statistic* = `0,8087`).
- **Simulasi Risiko Berbasis Teorema Bayes:** Menguji sensitivitas tingkat kesalahan positif palsu (*FPR*), kemampuan deteksi (*Sensitivity*), prevalensi, aturan gabungan 2-dari-3 sinyal, serta estimasi nilai transaksi bruto UMKM yang berpotensi tertunda.
- **Tata Kelola Kepatuhan Hukum:** Selaras dengan **UU No. 8 Tahun 2010** (Pasal 25 batas lapor LTKM 3 hari kerja, Pasal 26 batas penundaan 5 hari kerja, Pasal 67 hak keberatan), **PBI No. 10 Tahun 2024**, dan **PADG No. 15 Tahun 2025**.
