/* Data menu Tugas — disalin dari "Dashboard Divisi Umum"
   (https://claude.ai/artifact/TCmwpA6VoqzphZwi5HQmLz) pada 13 Okt 2026.
   items   : 15 tugas pelaporan (bidang, frekuensi, satuan capaian)
   records : status/tautan/lampiran per periode ("W:<Sabtu>" mingguan, "M:<YYYY-MM>" bulanan, tenggat tgl 25)
   values  : angka capaian per periode dari Laporan_Dashboard_Direksi.xlsx
   Di versi claude.ai data aktif dibaca/ditulis di database (koleksi "tasks"); salinan ini dipakai bila database tidak tersedia. */
window.DU_DATA = window.DU_DATA || {};
window.DU_DATA.tasks = {
  source: { name: "Dashboard Divisi Umum", url: "https://claude.ai/artifact/TCmwpA6VoqzphZwi5HQmLz", report: {"source": "Laporan_Dashboard_Direksi.xlsx", "mulai": "2026-09-26", "selesai": "2026-10-25", "bulan": "2026-10-01", "sabtu1": "2026-10-10"}, copied: "2026-10-13" },
  bidang: ["GA", "Admin", "Finance", "HR", "Legal"],
  items: [
    {"no": 1, "name": "Jumlah Pengadaan & Pembelian", "bidang": ["GA"], "harian": false, "mingguan": true, "bulanan": true, "unit": "Transaksi", "mode": "Jumlah", "desc": "Jumlah transaksi pengadaan & pembelian (PO/nota) yang diproses"},
    {"no": 2, "name": "Database Aset, Inventaris & Stok", "bidang": ["GA"], "harian": false, "mingguan": true, "bulanan": true, "unit": "Item", "mode": "Akhir", "desc": "Jumlah item aset, inventaris & stok tercatat di database (posisi akhir periode)"},
    {"no": 3, "name": "Database Vendor & Subkon", "bidang": ["GA"], "harian": false, "mingguan": true, "bulanan": true, "unit": "Vendor", "mode": "Akhir", "desc": "Jumlah vendor & subkon aktif yang terdaftar di database (posisi akhir periode)"},
    {"no": 4, "name": "Jumlah Komplain / Klaim Garansi", "bidang": ["Admin", "GA"], "harian": false, "mingguan": true, "bulanan": true, "unit": "Kasus", "mode": "Jumlah", "desc": "Jumlah komplain / klaim garansi yang diterima"},
    {"no": 5, "name": "Jumlah Tamu Datang (Konsultasi / Meeting)", "bidang": ["Admin"], "harian": false, "mingguan": true, "bulanan": true, "unit": "Orang", "mode": "Jumlah", "desc": "Jumlah tamu yang datang untuk konsultasi / meeting"},
    {"no": 6, "name": "Jumlah Agenda Eksternal (Visit / Survei / Undangan)", "bidang": ["Admin"], "harian": false, "mingguan": true, "bulanan": true, "unit": "Agenda", "mode": "Jumlah", "desc": "Jumlah kegiatan visit, survei, dan undangan eksternal"},
    {"no": 7, "name": "Update Kalender Besar", "bidang": ["GA"], "harian": false, "mingguan": true, "bulanan": true, "unit": "Kali Update", "mode": "Jumlah", "desc": "Jumlah pembaruan kalender besar kegiatan"},
    {"no": 8, "name": "Rekonsiliasi Keuangan (harian)", "bidang": ["Finance"], "harian": true, "mingguan": false, "bulanan": false, "unit": "Rp", "mode": "Jumlah", "desc": "Selisih saldo buku vs kas/bank setiap selesai closing harian (detail di Tabel B)"},
    {"no": 9, "name": "Rekonsiliasi Keuangan (mingguan)", "bidang": ["Finance"], "harian": false, "mingguan": true, "bulanan": false, "unit": "Rp", "mode": "Jumlah", "desc": "Selisih rekonsiliasi keuangan per minggu"},
    {"no": 10, "name": "Rekonsiliasi Keuangan (bulanan)", "bidang": ["Finance"], "harian": false, "mingguan": false, "bulanan": true, "unit": "Rp", "mode": "Jumlah", "desc": "Selisih rekonsiliasi keuangan per bulan (closing tgl 25)"},
    {"no": 11, "name": "Laporan Tutup Buku", "bidang": ["Finance"], "harian": false, "mingguan": false, "bulanan": true, "unit": "Dokumen", "mode": "Jumlah", "desc": "Laporan tutup buku yang diselesaikan (1 = selesai)"},
    {"no": 12, "name": "Jumlah Surat Menyurat (FPP / SPH / SPK / BA / Garansi)", "bidang": ["Admin"], "harian": false, "mingguan": true, "bulanan": true, "unit": "Dokumen", "mode": "Jumlah", "desc": "Jumlah surat FPP / SPH / SPK / BA / Garansi yang diterbitkan"},
    {"no": 13, "name": "Jumlah Freelance", "bidang": ["HR"], "harian": false, "mingguan": true, "bulanan": true, "unit": "Orang", "mode": "Akhir", "desc": "Jumlah tenaga freelance aktif (posisi akhir periode)"},
    {"no": 14, "name": "Jumlah Kehadiran", "bidang": ["HR"], "harian": false, "mingguan": true, "bulanan": true, "unit": "%", "mode": "Rata-rata", "desc": "Persentase kehadiran karyawan"},
    {"no": 15, "name": "Jumlah Payroll", "bidang": ["HR"], "harian": false, "mingguan": false, "bulanan": true, "unit": "Rp", "mode": "Jumlah", "desc": "Total nilai payroll yang dibayarkan"}
  ],
  records: {"W:2026-10-10": {"1": {"status": "Selesai", "link": "", "att": []}, "2": {"status": "Selesai", "link": "https://claude.ai/artifact/XFvUmxw2DQcM4uCW6ZRZpo", "att": [{"type": "link", "name": "https://claude.ai/artifact/XFvUmxw2DQcM4uCW6ZRZpo", "url": "https://claude.ai/artifact/XFvUmxw2DQcM4uCW6ZRZpo"}]}, "3": {"status": "Proses", "link": "", "att": []}, "4": {"status": "Selesai", "link": "", "att": []}, "5": {"status": "Selesai", "link": "", "att": []}, "6": {"status": "Selesai", "link": "", "att": []}, "7": {"status": "Selesai", "link": "https://calendar.google.com/calendar/u/0/r/month/2026/10/1", "att": [{"type": "file", "name": "Calender 12 - 17 okt.pdf", "fname": "Calender 12 - 17 okt.pdf", "ext": "pdf", "size": 107905}]}, "8": {"status": "Selesai", "link": "", "att": []}, "9": {"status": "Selesai", "link": "", "att": []}, "12": {"status": "Selesai", "link": "", "att": []}, "13": {"status": "Selesai", "link": "", "att": []}, "14": {"status": "Selesai", "link": "", "att": []}}, "M:2026-10": {"10": {"status": "Belum", "link": "", "att": []}, "11": {"status": "Belum", "link": "", "att": []}, "15": {"status": "Belum", "link": "", "att": []}}},
  values: {"W:2026-10-10": {"1": 4, "4": 0, "5": 1, "12": 6, "13": 2}}
};
