# Divisi Umum — Roemantara Indonesia (Demo Motion)

Webapp motion untuk Divisi Umum dengan tema **gambar kerja / blueprint konstruksi arsitektur**.
Divisi digambarkan sebagai gedung 5 lantai — tiap lantai satu bidang:

| Lantai | Bidang | Modul |
|---|---|---|
| LT.01 | General Affairs | Procurement & Purchasing (input manual FPP kategori Material / Divisi / Kebutuhan Kantor + lampiran PDF) · Aset & Inventaris · Vendor & Subkon (rating, status, filter kategori) · Pelayanan Umum (papan tiket) · Layanan Klien (waktu respons & target SLA 30 menit) · Kalender Internal & Eksternal |
| LT.02 | Administrasi | Arsip PDF per kategori (SPK, SPH, Invoice, Berita Acara, surat masuk/keluar, company profile, portofolio, notulen, memo internal) |
| LT.03 | Finance & Accounting | Rekonsiliasi bank per rekening · Laporan keuangan harian/mingguan/bulanan + anggaran vs realisasi · Daftar periksa tutup buku + kunci periode |
| LT.04 | Human Resources | Database karyawan dari DATABASE_SDM_ROEMANTRA.xlsx (nama, jenis kelamin, usia, HP, posisi, email) · Direktori freelancer (tabel ala daftar vendor, filter posisi) dari DATABASE_FREELANCE.xlsx · Absensi live dari dashboard Google Apps Script (disematkan, muat ulang otomatis tiap 5 menit) |
| LT.05 | Legal | Arsip semua dokumen eksternal (perizinan, kontrak, akta, asuransi, sertifikat) + pengingat jatuh tempo |

## Motion & interaksi
- Loader denah yang tergambar garis demi garis, lalu gedung + tower crane digambar ala CAD
- Klik lantai gedung untuk menuju bidangnya; crane bergerak mengikuti scroll
- Kursor crosshair CAD dengan koordinat, indikator elevasi (lift) di sisi kanan
- Grafik, bar, ring, dan angka KPI beranimasi saat masuk layar
- Tema **Blueprint** (gelap) / **Kalkir** (terang)
- Responsif mobile & menghormati `prefers-reduced-motion`

## Dua tampilan
- `index.html` — tampilan **Blueprint CAD** (gambar kerja, gelap/kalkir).
- `sage.html` — tampilan **Gambar Kerja** (lembar gambar arsitek): kertas kalkir bergrid, bingkai lembar + sumbu,
  kop gambar dengan nomor lembar per menu (`A-00`, `GA-01`, … `TG-06`), judul detail bernomor, kursor CAD, dan
  bingkai kartu yang tergambar setiap kali tampil. Tata letaknya (sidebar, Beranda, satu bidang per halaman, pencarian,
  notifikasi) memakai kerangka Sage (`assets/css/sage.css`) dengan lapisan gaya `assets/css/kerja.css` + `assets/js/kerja.js`.
  Isi dan logika modul sama persis (`assets/js/app.js`).

## Lampiran PDF (Procurement, Admin & Legal)
Procurement, Admin, dan Legal punya arsip PDF: unggah satu atau beberapa PDF (maks. 20 MB per file), pilih jenis dokumen,
lalu jumlah file dan total ukuran dihitung otomatis. File disimpan di penyimpanan artifact claude.ai dan daftarnya di
database artifact (koleksi `files`), jadi **hanya berfungsi di versi claude.ai**. Mengunggah dan menghapus butuh akses
edit ke artifact; anggota lain bisa melihat dan membuka file. Logika ada di `assets/js/docs.js`.

## Google Calendar & notifikasi ponsel
Modul GA → Kalender Google membaca dan menulis langsung ke Google Calendar kantor
(`googleCalendar.calendarId` di `data.js`) lewat connector claude.ai "Google Calendar" (`assets/js/gcal.js`):
- tampilan bulan + agenda 14 hari ke depan (juga di Beranda Sage dan lonceng notifikasi),
- klik tanggal untuk melihat semua jadwal hari itu; klik acara untuk pratinjau (waktu, lokasi, catatan, tautan ke Google Calendar),
- form "Tambah agenda" langsung membuat acara di Google Calendar dengan pengingat pop-up,
- "Pengingat otomatis" membuat acara untuk jadwal perawatan aset dan batas tutup buku (notifikasi H-2 & H-1 pukul 09.00).

Notifikasi ponsel datang dari aplikasi Google Calendar di ponsel (login akun yang sama, notifikasi diizinkan).
Setiap penampil memakai connector Google Calendar miliknya sendiri, jadi akun Google-nya harus punya akses ke kalender kantor.
Hanya berfungsi di versi claude.ai.

## Menu Tugas
15 tugas pelaporan Divisi Umum (GA, Admin, Finance, HR) disalin dari "Dashboard Divisi Umum"
(`assets/js/tugas-data.js`, logika di `assets/js/tugas.js`). Per periode mingguan (Sabtu) dan bulanan (tanggal 25):
status Belum/Proses/Selesai, capaian (angka + satuan), tautan bukti, dan lampiran file (PDF/PNG/JPG).
Di claude.ai data tersimpan di database (koleksi `tasks`, satu dokumen per periode); tugas yang jatuh tempo
dalam 2 hari muncul di lonceng notifikasi Sage.

## Harga satuan material
`assets/js/harga-data.js` berisi data dari **DATABASE_VENDOR_by_ROEMANTARA.xlsx**: 2.014 material (kode M…, satuan,
harga referensi, harga per vendor) dan 719 item daftar harga CV Setia Abadi (harga bertanda ⚠ perlu konfirmasi).
Tampil di GA → Vendor & Subkon → *Harga satuan material* (cari, filter sumber/kelompok/vendor; vendor yang punya
daftar harga diberi tautan di direktori). Tersambung ke FPP: ketik nama barang di form FPP untuk memilih material,
lalu satuan, harga, dan vendor terisi otomatis (bisa pilih harga vendor lain); tombol **+ FPP** di daftar harga
langsung mengisi form. Logika di `assets/js/harga.js`.
File Excel asli ada di `assets/files/` dan bisa diunduh lewat tombol *Unduh file asli (.xlsx)* di panel tersebut
(di claude.ai memakai kemampuan `downloads`; isi file disisipkan ke halaman saat build karena artifact tidak menyajikan .xlsx).
Tombol **Unggah data terbaru** (khusus pengguna dengan akses edit) membaca file .xlsx berformat sama di browser
(SheetJS dari cdnjs), menampilkan pratinjau harga yang berubah/baru/hilang, lalu setelah diterapkan menyimpan hasilnya
+ file aslinya sebagai aset JSON dengan penunjuk di database (`harga/current`, riwayat `hargaVersions`). Semua penampil
otomatis memakai versi terbaru, dan tombol unduh memberikan file versi terbaru tersebut (`assets/js/harga-upload.js`).

## Input manual & riwayat aktivitas
`assets/js/store.js` menyimpan data input manual di database artifact claude.ai (di salinan lokal: `localStorage` browser):
- **FPP** (`assets/js/fpp.js`, koleksi `fpp`): GA → Procurement, format *Permohonan Persetujuan Pembelian* Roemantara —
  nomor otomatis `FPP/<KODE>/<NNN>/<BLN>/<TAHUN>` (mis. FPP/YGA/002/OKT/2026), Divisi, Kebutuhan untuk, banyak item
  (item · jumlah · satuan · harga satuan · harga), Total, Catatan, Diajukan/Disetujui; status Diajukan/Disetujui/Dibeli/Ditolak.
  Tombol **PDF** mencetak FPP ke PDF dengan tata letak template (`assets/js/fpp-pdf.js`, jsPDF dari cdnjs, logo di `fpp-logo.js`).
- **Tugas harian** (`assets/js/harian.js`, koleksi `daily`): Tugas → Tugas Harian berupa checklist — centang saat selesai
  dan isi keterangan detail pekerjaan; tiap entri terhubung ke salah satu tugas umum; kartu tugas umum menampilkan jumlah catatan harian di periodenya dan bisa saling melompat.
- **Riwayat aktivitas** (koleksi `activity`): unggah/hapus PDF, input/status FPP, tugas harian, status tugas umum,
  dan agenda Google Calendar baru tercatat otomatis; tampil per hari di Beranda Sage.

## Kunci PIN Keuangan
Menu Finance & Accounting (dan kartu angka keuangan di Beranda/Ringkasan) terkunci PIN 4–6 digit,
khusus **Divisi Umum** dan **Direksi**, memakai satu PIN bersama.
- Terkunci lagi otomatis setelah 15 menit tidak ada aktivitas, saat tab ditutup, atau lewat tombol "Kunci sekarang".
- 5 kali salah → input dikunci 60 detik.
- Yang disimpan di `assets/js/data.js` hanya hash PIN (`access.finance.roles`). Untuk mengganti PIN:
  buka halaman, jalankan `DUPin.hash("PIN_BARU")` di console browser, tempel hasilnya ke `hash` di `access.finance.roles`.

**Batasan:** ini kunci tampilan di browser. Data keuangan tetap ada di file `data.js` dan bisa dibaca
siapa pun yang membuka kode halaman. Untuk keamanan penuh, data keuangan harus disajikan dari server
yang memeriksa login (mis. Google Apps Script/Sheets dengan akses terbatas, atau backend sendiri).

## Menjalankan
Tanpa build. Buka `index.html` di browser, atau:

```bash
python3 -m http.server 8000   # lalu buka http://localhost:8000
```

## Mengganti data
Semua data contoh (dummy) ada di `assets/js/data.js`. Isian yang dibuat di halaman (PR baru, surat baru,
tahap tiket, rekonsiliasi, centang tutup buku & notulen, tab terakhir) tersimpan di `localStorage`
browser masing-masing, belum dibagikan antar pengguna.

## Opsi desain
`design-options.html` berisi 9 arah desain bermotion untuk dibandingkan:
- Bertema konstruksi: A Blueprint CAD (versi saat ini), B Beton Brutalis, C Material Board, D Maket Isometrik
- Di luar tema konstruksi: E Swiss Grid, F Aurora Glass, G Nusantara Kawung, H Bento Pop, I Sage Soft Dashboard (dari referensi)

## Ikon bookmark / layar utama ponsel
`sage.html` dan `index.html` memuat ikon (`apple-touch-icon`, favicon) dan `manifest.webmanifest`, jadi saat halaman
disimpan ke layar utama (iPhone: Bagikan → Tambah ke Layar Utama; Android/Chrome: ⋮ → Tambahkan ke layar utama)
ikon Roemantara dan nama "Roemantara" dipakai otomatis. Ini berlaku bila webapp dibuka dari hosting sendiri
(mis. GitHub Pages), bukan dari tautan claude.ai.

Tautan claude.ai selalu memakai ikon claude.ai. Untuk tetap memakai webapp claude.ai (database, PDF, Google Calendar)
dengan ikon Roemantara, pakai pintasan `buka.html` yang di-hosting di GitHub Pages:
1. Buka `https://thoriqz.github.io/Demo-motion/buka.html?pasang` di ponsel, lalu Tambah ke Layar Utama.
2. Ikon tersebut membuka `buka.html`, yang langsung mengalihkan ke webapp di claude.ai.
Alamat webapp tujuan diatur di variabel `APP` dalam `buka.html`.

Sumber ikon: logo Roemantara di `assets/icons/logo.png`. Bila logo berganti, timpa file itu lalu jalankan
`python3 tools/make_icons.py` untuk membuat ulang semua ukuran ikon.
