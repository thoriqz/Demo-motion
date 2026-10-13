# Menara Laporan Divisi Umum

Web app bermotion bertema konstruksi/arsitektur untuk memantau 15 laporan Divisi Umum
(GA, Finance, HR, Admin, Legal) Roemantara Indonesia.

- Setiap laporan = satu lantai gedung. Status **Belum / Proses / Selesai** mengubah lantai
  (garis putus-putus → perancah → lantai jadi dengan jendela menyala).
- Crane bergerak ke lantai berikutnya yang belum selesai; bila semua selesai muncul bendera "Tutup Atap".
- Tenggat dihitung otomatis: mingguan (Sabtu terdekat), bulanan (tanggal 25), harian (sehabis closing).
- Kalender bulan berjalan, filter frekuensi & bidang, kolom keterangan.

Buka `index.html` langsung di browser. Status disimpan di browser (localStorage);
saat dibuka sebagai Artifact claude.ai, status tersinkron untuk semua yang membuka halaman.

Sumber data: `Laporan_Divisi_Umum_Okt2026.csv`.
