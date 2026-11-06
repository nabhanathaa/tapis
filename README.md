# TAPIS: purwarupa penapisan merchant QRIS

Purwarupa aplikasi web bertampilan ponsel untuk esai GEIC 2026. Aplikasi ini dibuat dengan HTML, CSS, dan JavaScript murni, tanpa *framework* dan tanpa proses *build*. Folder ini dapat langsung diunggah ke GitHub Pages, Vercel, Netlify, atau InfinityFree.

## Isi folder

```
tapis/
  index.html            halaman utama (aplikasi satu halaman, rute memakai #/)
  assets/css/app.css    tampilan (palet, komponen, tata letak ponsel)
  assets/js/core.js     data DEMO + mesin penapisan (Robust Z, CUSUM, jejaring, 4 level, skor)
  assets/js/ui.js       ikon, format angka, grafik SVG, ilustrasi toko DEMO
  assets/js/app.js      akun, halaman, alur kasus, simulator
  assets/img/           logo TAPIS (logo.png), favicon, ikon aplikasi
  data/resmi.js         angka RESMI/HITUNGAN hasil notebook (jangan diedit manual)
  .nojekyll             agar GitHub Pages tidak memproses folder
```

## Asal angka

| Bagian aplikasi | Asal |
|---|---|
| Pusat Bukti (M1, M2, M3, peta), kartu "Angka resmi" di Beranda, Simulator Ambang | `data/resmi.js`, dihasilkan dari `03_notebook/hasil/hasil_utama.json` dan `02_data` |
| Merchant, transaksi, pembayar, foto toko, kasus, akun, nama PJP | DEMO, dibangkitkan di `core.js` dengan benih acak tetap (selalu sama setiap dibuka) |

Bila notebook dijalankan ulang dan angkanya berubah, perbarui `data/resmi.js` dengan:

```
python build_appdata.py
```

(skrip ada di folder `04_aplikasi`).

## Akun demo

Semua akun memakai kata sandi `demo1234`.

| Email | Peran | Yang dapat dilakukan |
|---|---|---|
| rani@arunika.demo | Analis pemantauan merchant PJP | Membuka kasus, mengajukan penundaan, mencatat keberatan, mengirim LTKM |
| dimas@arunika.demo | Pejabat kepatuhan PJP | Semua hak analis ditambah persetujuan penundaan |
| laras@bi.demo | Pengawas BI (simulasi) | Melihat kepatuhan PJP, pusat bukti, dan simulator |
| yoga@ppatk.demo | Analis PPATK (simulasi) | Melihat LTKM yang diteruskan PJP |

Akun baru dapat dibuat lewat tab **Daftar petugas**. Akun dan kasus disimpan di `localStorage` peramban (awalan `tapis2.`). Untuk mengembalikan data ke awal, buka **Menu > Akun > Kembalikan data demo ke awal**.

## Menjalankan di komputer

Cara paling mudah: klik dua kali `index.html`. Bila peramban memblokir penyimpanan lokal untuk berkas `file://` (akun tidak tersimpan setelah dimuat ulang), jalankan server lokal:

```
cd tapis
python -m http.server 8000
```

lalu buka `http://localhost:8000` di peramban. Untuk melihat tampilan ponsel di laptop, tekan F12, lalu pilih ikon perangkat (Toggle device toolbar) dan pilih ukuran ponsel.

Untuk membuka dari ponsel di jaringan Wi-Fi yang sama: jalankan perintah di atas, cari alamat IP laptop (`ipconfig` di Windows), lalu buka `http://ALAMAT-IP:8000` di ponsel.

## Deploy ke GitHub Pages (gratis)

1. Buat akun di github.com bila belum ada.
2. Klik **New repository**, beri nama misalnya `tapis`, pilih **Public**, lalu **Create repository**.
3. Pada halaman repositori, klik **uploading an existing file**. Seret **isi** folder `tapis` (bukan foldernya): `index.html`, `README.md`, `.nojekyll`, folder `assets`, folder `data`. Klik **Commit changes**.
   - Berkas `.nojekyll` tersembunyi di Windows. Bila tidak terlihat, lewati saja; aplikasi tetap berjalan.
4. Buka **Settings > Pages**. Pada **Source**, pilih **Deploy from a branch**, branch `main`, folder `/ (root)`, lalu **Save**.
5. Tunggu 1-2 menit. Alamat aplikasi muncul di bagian atas halaman Pages, berbentuk `https://NAMA-AKUN.github.io/tapis/`.

Dengan Git (bila sudah terpasang):

```
cd tapis
git init
git add .
git commit -m "TAPIS purwarupa GEIC 2026"
git branch -M main
git remote add origin https://github.com/NAMA-AKUN/tapis.git
git push -u origin main
```

lalu lakukan langkah 4.

## Deploy ke Vercel (gratis)

1. Masuk ke vercel.com dengan akun GitHub.
2. Klik **Add New > Project**, pilih repositori `tapis`, lalu **Import**.
3. Framework Preset: **Other**. Build Command dan Output Directory dibiarkan kosong. Klik **Deploy**.
4. Alamat berbentuk `https://tapis-xxxx.vercel.app`.

Tanpa GitHub: pasang Vercel CLI (`npm i -g vercel`), masuk ke folder `tapis`, jalankan `vercel`, dan ikuti pertanyaannya.

## Deploy ke InfinityFree

1. Daftar di infinityfree.com, buat akun hosting dan subdomain gratis.
2. Buka **Control Panel > Online File Manager** (atau FTP dengan FileZilla).
3. Masuk ke folder `htdocs`, hapus berkas bawaan `index2.html` bila ada.
4. Unggah isi folder `tapis` ke dalam `htdocs` (bukan foldernya).
5. Buka subdomain Anda. Perubahan DNS subdomain baru dapat memerlukan beberapa jam.

## Catatan penting untuk naskah dan presentasi

- Aplikasi ini **tidak** terhubung dengan sistem BI, PPATK, atau PJP mana pun. Nama PJP dan petugas adalah fiktif.
- Merchant dan transaksi adalah data DEMO dan tidak dipakai sebagai temuan empiris.
- Skor adalah peringkat relatif, bukan peluang. Bobot skor (0,35; 0,20; 0,20; 0,15; 0,10) adalah rancangan awal yang perlu dikalibrasi dengan data berlabel.
- Halaman Pusat Bukti hanya menampilkan angka resmi dan hasil hitungan dari data resmi.
