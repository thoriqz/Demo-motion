/* Data contoh (dummy) Divisi Umum — ganti dengan data riil atau sambungkan ke API/Spreadsheet. */
window.DU_DATA = {
  kpi: [
    { label: "Aset Tercatat", value: 248, unit: "unit", floor: "LT.01", href: "#ga" },
    { label: "Surat Bulan Ini", value: 64, unit: "dok", floor: "LT.02", href: "#adm" },
    { label: "Realisasi Anggaran", value: 72, unit: "%", floor: "LT.03", href: "#fin" },
    { label: "Total Karyawan", value: 58, unit: "orang", floor: "LT.04", href: "#hr" },
    { label: "Izin Aktif", value: 9, unit: "izin", floor: "LT.05", href: "#legal" }
  ],

  /* ---------- GENERAL AFFAIRS ---------- */
  assets: [
    { name: "Laptop & PC Desain", code: "IT", qty: 42, good: 38 },
    { name: "Kendaraan Operasional", code: "KND", qty: 6, good: 5 },
    { name: "Peralatan Survey (Total Station, Laser)", code: "SRV", qty: 11, good: 10 },
    { name: "Furnitur Kantor", code: "FRN", qty: 126, good: 119 },
    { name: "Plotter & Printer A0–A3", code: "PRN", qty: 5, good: 3 }
  ],
  maintenance: [
    { date: "14 Okt", title: "Servis AC Lt.2 & ruang meeting", tag: "Fasilitas", status: "terjadwal" },
    { date: "16 Okt", title: "Kalibrasi Total Station", tag: "Alat", status: "terjadwal" },
    { date: "20 Okt", title: "Servis berkala Hilux B 9123 RMT", tag: "Kendaraan", status: "terjadwal" },
    { date: "09 Okt", title: "Penggantian head plotter A0", tag: "IT", status: "selesai" },
    { date: "03 Okt", title: "Pemeriksaan APAR & jalur evakuasi", tag: "K3", status: "selesai" }
  ],
  stock: [
    { name: "Kertas A3 / A1", value: 34, min: 30 },
    { name: "Tinta Plotter", value: 18, min: 25 },
    { name: "APD Proyek (helm, rompi)", value: 76, min: 40 },
    { name: "Map Arsip & Ordner", value: 55, min: 30 },
    { name: "Materai & Stempel", value: 22, min: 20 }
  ],
  gaTickets: [
    { id: "GA-118", title: "Mess pekerja site Cibubur", by: "PM Proyek", status: "Proses" },
    { id: "GA-117", title: "Sewa genset event serah terima", by: "Marketing", status: "Baru" },
    { id: "GA-116", title: "Perbaikan kunci ruang arsip", by: "Admin", status: "Selesai" },
    { id: "GA-115", title: "Pengadaan meja gambar studio", by: "Tim Desain", status: "Proses" },
    { id: "GA-114", title: "Booking mobil survey lokasi", by: "Arsitek", status: "Selesai" }
  ],

  /* ---------- ADMINISTRASI ---------- */
  mails: [
    { no: "041/RMT-ADM/X/2026", subject: "Penawaran Desain Interior Kantor", party: "PT Graha Sentosa", type: "Keluar", date: "10 Okt" },
    { no: "IN-0287", subject: "Undangan Aanwijzing Tender", party: "Dinas PUPR", type: "Masuk", date: "09 Okt" },
    { no: "040/RMT-LGL/X/2026", subject: "Addendum Kontrak Termin 3", party: "CV Arunika", type: "Keluar", date: "08 Okt" },
    { no: "IN-0286", subject: "Konfirmasi Pengiriman Material", party: "PT Baja Prima", type: "Masuk", date: "07 Okt" },
    { no: "039/RMT-HR/X/2026", subject: "Surat Keterangan Kerja", party: "Internal", type: "Keluar", date: "06 Okt" },
    { no: "IN-0285", subject: "Tagihan Sewa Scaffolding", party: "PT Rangka Jaya", type: "Masuk", date: "03 Okt" }
  ],
  agenda: [
    { day: "SEN", date: "12", items: ["09.00 Rapat koordinasi mingguan", "14.00 Review RAB proyek Kemang"] },
    { day: "SEL", date: "13", items: ["10.00 Interview Drafter (2 kandidat)"] },
    { day: "RAB", date: "14", items: ["08.30 Servis AC", "13.00 Presentasi desain klien"] },
    { day: "KAM", date: "15", items: ["Batas bayar BPJS & PPh 21"] },
    { day: "JUM", date: "16", items: ["Kalibrasi alat survey", "15.00 Safety briefing site"] }
  ],

  /* ---------- FINANCE ---------- */
  cashflow: {
    months: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt"],
    in:  [820, 640, 910, 760, 1180, 980, 1250, 1100, 1320, 1040],
    out: [690, 720, 780, 810, 900, 870, 1010, 950, 1080, 920]
  },
  invoices: [
    { label: "Lunas", value: 18, color: "ok" },
    { label: "Jatuh Tempo < 14 hr", value: 5, color: "warn" },
    { label: "Terlambat", value: 2, color: "danger" },
    { label: "Belum Ditagih", value: 7, color: "muted" }
  ],
  budget: [
    { project: "Renovasi Kantor PT Graha Sentosa", type: "Interior", budget: 1850, actual: 1420, progress: 78 },
    { project: "Rumah Tinggal Kemang", type: "Konstruksi", budget: 3200, actual: 2560, progress: 74 },
    { project: "Fit-out Kafe Senopati", type: "Interior", budget: 780, actual: 812, progress: 95 },
    { project: "Gudang Logistik Cikarang", type: "Konstruksi", budget: 5400, actual: 2380, progress: 41 },
    { project: "Showroom Arunika", type: "Arsitektur", budget: 1250, actual: 540, progress: 38 }
  ],

  /* ---------- HUMAN RESOURCES ---------- */
  headcount: [
    { label: "Arsitek & Desainer", value: 14 },
    { label: "Drafter / BIM", value: 9 },
    { label: "Site Engineer & Pengawas", value: 16 },
    { label: "Quantity Surveyor", value: 5 },
    { label: "Divisi Umum & Support", value: 8 },
    { label: "Manajemen", value: 6 }
  ],
  training: [
    { title: "SKK Ahli Muda Arsitek", done: true },
    { title: "Sertifikasi K3 Konstruksi", done: true },
    { title: "Pelatihan BIM / Revit Lanjutan", done: false },
    { title: "Workshop Estimasi Biaya (RAB)", done: false },
    { title: "Refresh SOP Pengadaan", done: true }
  ],
  stages: ["Lamaran", "Screening", "Interview", "Offering", "Onboard"],
  candidates: [
    { name: "R. Pratama", role: "Drafter AutoCAD", stage: 0 },
    { name: "S. Lestari", role: "Interior Designer", stage: 1 },
    { name: "D. Nugroho", role: "Site Engineer", stage: 2 },
    { name: "A. Wibowo", role: "Drafter AutoCAD", stage: 2 },
    { name: "M. Hasanah", role: "Staff Finance", stage: 3 },
    { name: "F. Siregar", role: "Pengawas Lapangan", stage: 4 },
    { name: "N. Putri", role: "3D Visualizer", stage: 0 }
  ],

  /* ---------- LEGAL ---------- */
  /* daysLeft relatif terhadap hari ini supaya status selalu relevan saat demo */
  licenses: [
    { name: "NIB (OSS-RBA)", issuer: "Kementerian Investasi", daysLeft: null, note: "Berlaku selama usaha berjalan" },
    { name: "SBU Jasa Konstruksi — BG", issuer: "LPJK", daysLeft: 412 },
    { name: "SBU Konsultan Arsitektur", issuer: "LPJK", daysLeft: 38 },
    { name: "SKK Penanggung Jawab Teknik", issuer: "LPJK", daysLeft: 12 },
    { name: "Sertifikat ISO 9001:2015", issuer: "Badan Sertifikasi", daysLeft: 190 },
    { name: "Polis Asuransi CAR Proyek Cikarang", issuer: "Asuransi", daysLeft: 74 }
  ],
  contracts: [
    { title: "Kontrak Desain & Build — Rumah Kemang", party: "Bpk. H. Santoso", value: "Rp 3,2 M", stage: "Berjalan", step: 3 },
    { title: "SPK Fit-out Kafe Senopati", party: "PT Kopi Nusa", value: "Rp 780 jt", stage: "BAST", step: 4 },
    { title: "Kontrak Gudang Cikarang", party: "PT Logistik Andalan", value: "Rp 5,4 M", stage: "Addendum", step: 3 },
    { title: "Perjanjian Konsultan Showroom", party: "CV Arunika", value: "Rp 1,25 M", stage: "Review Draft", step: 1 }
  ],
  contractSteps: ["Draft", "Review", "TTD", "Berjalan", "BAST"]
};
