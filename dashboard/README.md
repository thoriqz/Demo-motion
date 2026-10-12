# Dashboard Divisi Umum — Kawasan Proyek

Isi: menu Ringkasan, Lampiran, Jadwal; 15 laporan; status per bidang; tautan sumber;
lampiran berupa tautan, berkas (maks. 1 MB), dan foto (diperkecil otomatis).

Konsep visual: rencana tapak isometrik. Setiap bidang (GA, Finance, HR, Admin, Legal)
adalah satu gedung di kawasan proyek yang dibangun sesuai progres laporannya:
- belum ada progres: lahan dipatok,
- laporan Proses: rangka struktur + perancah,
- laporan Selesai: fasad dengan lampu menyala,
- semua selesai: atap + bendera serah terima.
Tower crane berputar ke gedung yang terakhir diubah dan kaitnya menurunkan material;
truk molen melintas di jalan proyek. Bila semua bidang selesai, papan nama
ROEMANTARA di direksi keet menyala.

Data disimpan di localStorage peramban. Logo: `assets/logo_roemantara.png`.

## Perbarui lewat Excel
Di bagian Daftar Laporan ada tombol **Unduh Excel** (berisi status dan tautan saat ini) dan
**Impor Excel** (.xlsx, .xls, atau .csv). Baris dicocokkan lewat kolom NO; kolom STATUS menerima
Belum / Proses / Selesai, kolom TAUTAN SUMBER harus diawali https://. Sebelum diterapkan,
dashboard menampilkan daftar perubahan untuk diperiksa. Template dengan dropdown status:
`Template_Laporan_Divisi_Umum.xlsx`.

## Hasil kegiatan (format Excel "Laporan Divisi Umum")
Menu **A-02 Hasil** dan kolom hasil di Daftar Laporan membaca angka dari file Excel
berformat "Laporan Hasil Kegiatan Divisi Umum" (Tabel A keterangan tugas, B rekonsiliasi
harian, C laporan mingguan per Sabtu, D laporan bulanan per tanggal 25). Tombol Impor Excel
mengenali format ini otomatis. Rekap dihitung seperti rumus di Excel: Jumlah = total,
Akhir = nilai terakhir yang terisi, Rata-rata = rata-rata nilai terisi. Data awal yang
tertanam diambil dari file Laporan_Dashboard_Direksi.xlsx (Minggu 1, 10 Okt 2026).

## Terbitkan ke semua (versi link claude.ai)
Versi artifact dibangun dengan `python3 dashboard/build_artifact.py OUT.html`. Data tertanam di
halaman; pemilik (atau Editor) mengubah data lalu klik **Terbitkan ke semua**, dan halaman di link
yang sama diperbarui untuk semua orang (yang sedang membuka ikut dimuat ulang otomatis).
Pengunjung lain melihat dalam **Mode lihat** dan tidak bisa mengubah data.
Bila file `index.html` dibuka langsung (tanpa claude.ai), dashboard tetap memakai localStorage.
