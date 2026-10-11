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
