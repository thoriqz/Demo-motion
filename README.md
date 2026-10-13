# Divisi Umum — Roemantara Indonesia (Demo Motion)

Webapp motion untuk Divisi Umum dengan tema **gambar kerja / blueprint konstruksi arsitektur**.
Divisi digambarkan sebagai gedung 5 lantai — tiap lantai satu bidang:

| Lantai | Bidang | Modul |
|---|---|---|
| LT.01 | General Affairs | Procurement & Purchasing (PR → Approval → PO → Dikirim → Diterima, form PR baru) · Aset & Inventaris · Vendor & Subkon (rating, status, filter kategori) · Pelayanan Umum (papan tiket) · Layanan Klien (waktu respons & target SLA 30 menit) · Kalender Internal & Eksternal |
| LT.02 | Administrasi | Surat-menyurat SPK/SPH/Invoice/BA/Umum dengan penomoran otomatis (`022/SPH/RMT/X/2026`) · Pengarsipan internal & eksternal (surat, company profile, portofolio) · Notulen rapat + tindak lanjut |
| LT.03 | Finance & Accounting | Rekonsiliasi bank per rekening · Laporan keuangan harian/mingguan/bulanan + anggaran vs realisasi · Daftar periksa tutup buku + kunci periode |
| LT.04 | Human Resources | Database karyawan (cari & filter divisi, masa kerja otomatis) · Database freelancer · Absensi harian + rekap 4 minggu |
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
- `sage.html` — tampilan **Sage Soft** (Opsi I): sidebar, Beranda ringkas, satu bidang per halaman,
  pencarian modul, dan notifikasi. Isi dan logika 16 modul sama persis (`assets/js/app.js`).

## Lampiran PDF (Procurement & Legal)
Procurement dan Legal kini berupa arsip PDF: unggah satu atau beberapa PDF (maks. 20 MB per file), pilih jenis dokumen,
lalu jumlah file dan total ukuran dihitung otomatis. File disimpan di penyimpanan artifact claude.ai dan daftarnya di
database artifact (koleksi `files`), jadi **hanya berfungsi di versi claude.ai**. Mengunggah dan menghapus butuh akses
edit ke artifact; anggota lain bisa melihat dan membuka file. Logika ada di `assets/js/docs.js`.

## Google Calendar & notifikasi ponsel
Modul GA → Kalender Google membaca dan menulis langsung ke Google Calendar kantor
(`googleCalendar.calendarId` di `data.js`) lewat connector claude.ai "Google Calendar" (`assets/js/gcal.js`):
- tampilan bulan + agenda 14 hari ke depan (juga di Beranda Sage dan lonceng notifikasi),
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
