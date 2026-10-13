/* Data contoh (dummy) Divisi Umum — ganti dengan data riil atau sambungkan ke API/Spreadsheet.
   Nilai uang dalam Rupiah penuh kecuali disebut lain. */
window.DU_DATA = {
  /* Kunci PIN area Keuangan (PIN 4–6 digit). Yang disimpan hanya hash SHA-256 dari "du-fin:" + PIN.
     Ganti PIN: buka halaman, jalankan DUPin.hash("PIN_BARU") di console browser,
     lalu tempel hasilnya ke "hash" peran yang sesuai. */
  access: {
    finance: {
      minLength: 4, maxLength: 6, idleMinutes: 15, maxTries: 5, lockSeconds: 60,
      roles: [
        { id: "umum", label: "Divisi Umum", hash: "a58f06e9390a31930922cc1ed7467bd2a7e9ea55c77d423ec1ca9aa09b923de6" },
        { id: "direksi", label: "Direksi", hash: "c6ec823c85c2ee7539f4137aabd360e6407ba29088a1ec54965106a5249feec9" }
      ]
    }
  },

  /* =====================================================
     LT.01 GENERAL AFFAIRS
     ===================================================== */
  procurementSteps: ["PR", "Approval", "PO", "Dikirim", "Diterima"],
  procurement: [
    { no: "PR-2026-118", item: "Besi beton D13 (2 ton)", project: "Gudang Cikarang", vendor: "PT Baja Prima", value: 38400000, step: 3 },
    { no: "PR-2026-117", item: "HPL & multiplek 18 mm (60 lbr)", project: "Fit-out Kafe Senopati", vendor: "CV Kayu Lestari", value: 27850000, step: 4 },
    { no: "PR-2026-116", item: "Tinta & head plotter A0", project: "Kantor", vendor: "PT Graphika Prima", value: 9600000, step: 2 },
    { no: "PR-2026-115", item: "Sewa scaffolding 3 bulan", project: "Rumah Kemang", vendor: "PT Rangka Jaya", value: 36000000, step: 4 },
    { no: "PR-2026-114", item: "Lampu downlight & track (120 pcs)", project: "Showroom Arunika", vendor: "PT Sinar Terang", value: 21300000, step: 1 },
    { no: "PR-2026-113", item: "APD proyek (helm, rompi, sepatu)", project: "Gudang Cikarang", vendor: "CV Safety Indo", value: 7450000, step: 0 }
  ],

  assets: [
    { name: "Laptop & PC Desain", qty: 42, good: 38 },
    { name: "Kendaraan Operasional", qty: 6, good: 5 },
    { name: "Peralatan Survey (Total Station, Laser)", qty: 11, good: 10 },
    { name: "Furnitur Kantor", qty: 126, good: 119 },
    { name: "Plotter & Printer A0–A3", qty: 5, good: 3 }
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

  /* Sumber: DAFTAR_VENDOR_MATERIAL.xlsx (66 baris, 18 jenis). Lokasi di Bandar Lampung. */
  vendorCats: ["Toko Bangunan", "Material Alam", "Panglong Kayu", "Toko Interior", "Toko Cat", "Toko Listrik", "Toko Keramik", "Sanitari", "Toko Atap", "Toko Kaca", "Toko Plafon PVC", "Toko Gypsum", "Toko Batu Alam", "Toko Elektronik", "Toko Kain & Karpet", "Toko Hordeng", "Toko Teknik", "Toko Pre-Cast"],
  vendors: [
    { cat: "Toko Bangunan", name: "TB Bersama Makmur", phone: "0852-6921-2448", loc: "Bataranila" },
    { cat: "Toko Bangunan", name: "TB Korpri Jaya", phone: "0813-7973-6872", loc: "Korpri" },
    { cat: "Toko Bangunan", name: "TB Serba Guna", phone: "0857-6839-7363", loc: "Sidosari" },
    { cat: "Toko Bangunan", name: "TB Sukabumi Jaya", phone: "0812-7332-5493", loc: "Bataranila" },
    { cat: "Toko Bangunan", name: "TB Alkautsar", phone: "0812-7261-3232", loc: "Kemiling" },
    { cat: "Material Alam", name: "Hendro", phone: "0812-7721-2729", loc: "Kedaton" },
    { cat: "Material Alam", name: "Yoseph", phone: "0813-6935-6598", loc: "Kemiling" },
    { cat: "Material Alam", name: "Slamet", phone: "0821-7665-8222", loc: "Rajabasa" },
    { cat: "Material Alam", name: "Kelana", phone: "0813-7922-9893", loc: "Kemiling" },
    { cat: "Material Alam", name: "Deni", phone: "0812-7910-3829", loc: "Labuhan Ratu" },
    { cat: "Panglong Kayu", name: "Pal 10", phone: "0852-6732-0016", loc: "Jatimulyo" },
    { cat: "Panglong Kayu", name: "Sam Panglong", phone: "0812-7834-8881", loc: "Kemiling" },
    { cat: "Panglong Kayu", name: "Akbar Panglong", phone: "0822-3775-1258", loc: "Kemiling" },
    { cat: "Panglong Kayu", name: "Pandawa 5", phone: "0823-7911-9607", loc: "Wayhuwi" },
    { cat: "Panglong Kayu", name: "Kujang Jaya", phone: "0813-6905-1021", loc: "Kemiling" },
    { cat: "Toko Interior", name: "Helina", phone: "0822-8153-8087", loc: "Kemiling" },
    { cat: "Toko Interior", name: "Sejahtera", phone: "0813-7952-5988", loc: "Kedamaian" },
    { cat: "Toko Interior", name: "Graha Solusi", phone: "0812-7721-3219", loc: "Kemiling" },
    { cat: "Toko Interior", name: "Sarana Solusi", phone: "0821-8207-7718", loc: "Kedamaian" },
    { cat: "Toko Interior", name: "Warung Interior", phone: "0821-7885-6866", loc: "Kedamaian" },
    { cat: "Toko Cat", name: "Mitra 10", phone: "0821-7681-3551", loc: "Antasari" },
    { cat: "Toko Cat", name: "Warna Abadi", phone: "0812-2122-5487", loc: "Tirtayasa" },
    { cat: "Toko Cat", name: "Mega Jaya", phone: "0721-7886-92", loc: "Antasari" },
    { cat: "Toko Cat", name: "Sinar Agung", phone: "0823-6336-7037", loc: "Tj. Karang" },
    { cat: "Toko Cat", name: "Master Warna", phone: "0896-7519-6071", loc: "Pagar Alam" },
    { cat: "Toko Listrik", name: "Mulia Jaya", phone: "0822-7993-8078", loc: "Antasari" },
    { cat: "Toko Listrik", name: "Rajawali", phone: "0813-8665-8015", loc: "Antasari" },
    { cat: "Toko Listrik", name: "Yanto", phone: "0852-7927-5888", loc: "Tj. Karang" },
    { cat: "Toko Listrik", name: "Bona Eletrik", phone: "0812-7119-8455", loc: "Sukarame" },
    { cat: "Toko Listrik", name: "Terang Jaya", phone: "0821-8351-1321", loc: "Antasari" },
    { cat: "Toko Keramik", name: "Muzani", phone: "0812-7224-875", loc: "Hajimena" },
    { cat: "Toko Keramik", name: "Archa Jaya", phone: "0823-7720-0281", loc: "Sukarame" },
    { cat: "Toko Keramik", name: "Keramik BDL", phone: "0822-8952-3299", loc: "Jalan PU" },
    { cat: "Toko Keramik", name: "Indo Keramik", phone: "0821-7743-4263", loc: "Bypass" },
    { cat: "Toko Keramik", name: "Abizar Keramik", phone: "0821-7685-7743", loc: "Antasari" },
    { cat: "Sanitari", name: "Mitra 10", phone: "0821-7681-3551", loc: "Antasari" },
    { cat: "Sanitari", name: "Depo Bangunan", phone: "0812-1300-0370", loc: "Bypass" },
    { cat: "Toko Atap", name: "Mitra Jaya", phone: "0812-7261-300", loc: "Antasari" },
    { cat: "Toko Atap", name: "Sentral Jaya", phone: "0811-722-023", loc: "Teluk Betung" },
    { cat: "Toko Atap", name: "Atap Baru", phone: "0851-7506-3377", loc: "Urip" },
    { cat: "Toko Kaca", name: "Cemerlang", phone: "0821-8329-8411", loc: "Morotai" },
    { cat: "Toko Kaca", name: "Cahaya Timur", phone: "0821-2259-2072", loc: "Urip" },
    { cat: "Toko Kaca", name: "Kaca Mandiri", phone: "0821-8182-3226", loc: "Kalibalau" },
    { cat: "Toko Plafon PVC", name: "Shankara", phone: "0813-1289-0808", loc: "Gunter" },
    { cat: "Toko Plafon PVC", name: "Riza PVC", phone: "0823-7720-0281", loc: "Sukarame" },
    { cat: "Toko Plafon PVC", name: "RRR Brother", phone: "0813-7333-1121", loc: "Korpri" },
    { cat: "Toko Gypsum", name: "Nur Gyp", phone: "0897-9346-507", loc: "Pulau Damar" },
    { cat: "Toko Gypsum", name: "Nuri Gyp", phone: "0821-8265-8850", loc: "Antasari" },
    { cat: "Toko Gypsum", name: "Agung Grc", phone: "0853-8380-4868", loc: "Pulau Damar" },
    { cat: "Toko Batu Alam", name: "Sulaiman Batu Alam", phone: "0838-4871-0070", loc: "Sultan Agung" },
    { cat: "Toko Batu Alam", name: "Sultan Batu Alam", phone: "0823-0222-2285", loc: "Kemiling" },
    { cat: "Toko Batu Alam", name: "Batu Alam Grosir", phone: "0821-7733-1103", loc: "Kedamaian" },
    { cat: "Toko Elektronik", name: "Mitra 10", phone: "0821-7681-3551", loc: "Antasari" },
    { cat: "Toko Elektronik", name: "Depo Bangunan", phone: "0812-1300-0370", loc: "Bypass" },
    { cat: "Toko Kain & Karpet", name: "Interna", phone: "0896-3525-9954", loc: "Tj. Karang" },
    { cat: "Toko Kain & Karpet", name: "Niko Furniture", phone: "0819-3355-5588", loc: "Sultan Agung" },
    { cat: "Toko Kain & Karpet", name: "Toko Kemajuan", phone: "0852-7915-0978", loc: "Teluk Betung" },
    { cat: "Toko Hordeng", name: "Andy Hordeng", phone: "0813-6903-3573", loc: "Tj. Karang" },
    { cat: "Toko Hordeng", name: "Hendry Gordeng", phone: "0813-7314-4305", loc: "Tj. Karang" },
    { cat: "Toko Hordeng", name: "Abimayu", phone: "0856-0031-3188", loc: "Tj. Karang" },
    { cat: "Toko Teknik", name: "Mega Teknik", phone: "0813-7777-7021", loc: "Antasari" },
    { cat: "Toko Teknik", name: "Maju teknik", phone: "0812-7298-1187", loc: "Antasari" },
    { cat: "Toko Teknik", name: "Mega baut", phone: "0721-269-649", loc: "Antasari" },
    { cat: "Toko Pre-Cast", name: "Sumber Berkah Jaya", phone: "0812-7975-107", loc: "Panjang" },
    { cat: "Toko Pre-Cast", name: "Paving Sakti", phone: "0823-1271-5072", loc: "Kemiling" },
    { cat: "Toko Pre-Cast", name: "Fathir Berkah", phone: "0811-147-619", loc: "Teluk Betung" }
  ],
  subcontractors: [],

  serviceStages: ["Baru", "Diproses", "Selesai"],
  services: [
    { id: "GA-121", title: "AC ruang studio desain bocor", cat: "Perbaikan", by: "Tim Desain", stage: 0 },
    { id: "GA-120", title: "Konsumsi rapat klien (12 org)", cat: "Konsumsi", by: "Marketing", stage: 0 },
    { id: "GA-119", title: "Booking mobil survey Bogor", cat: "Kendaraan", by: "Arsitek", stage: 1 },
    { id: "GA-118", title: "Mess pekerja site Cibubur", cat: "Akomodasi", by: "PM Proyek", stage: 1 },
    { id: "GA-117", title: "Isi ulang galon & pantry", cat: "Kebersihan", by: "Admin", stage: 2 },
    { id: "GA-116", title: "Perbaikan kunci ruang arsip", cat: "Perbaikan", by: "Admin", stage: 2 }
  ],

  slaMinutes: 30,
  clientRequests: [
    { client: "PT Graha Sentosa", req: "Minta revisi layout ruang direksi", channel: "WhatsApp", at: "08.12", mins: 9, status: "Selesai" },
    { client: "Bpk. H. Santoso", req: "Jadwal kunjungan progres Rumah Kemang", channel: "Telepon", at: "09.05", mins: 14, status: "Selesai" },
    { client: "PT Kopi Nusa", req: "Salinan BAST & garansi pekerjaan", channel: "Email", at: "10.20", mins: 42, status: "Selesai" },
    { client: "CV Arunika", req: "Konfirmasi jadwal presentasi 3D", channel: "WhatsApp", at: "11.47", mins: 6, status: "Diproses" },
    { client: "PT Logistik Andalan", req: "Laporan mingguan progres gudang", channel: "Email", at: "13.30", mins: 25, status: "Diproses" },
    { client: "Ibu Larasati", req: "Permintaan penawaran desain dapur", channel: "Instagram", at: "14.02", mins: null, status: "Menunggu" }
  ],

  calendar: {
    year: 2026, month: 9, // 0 = Januari
    events: [
      { d: 2, t: "10.00", title: "Termin 2 PT Graha Sentosa", type: "Eksternal" },
      { d: 5, t: "09.00", title: "Rapat koordinasi mingguan", type: "Internal" },
      { d: 7, t: "13.00", title: "Survey lokasi Showroom Arunika", type: "Eksternal" },
      { d: 9, t: "09.00", title: "Aanwijzing tender Dinas PUPR", type: "Eksternal" },
      { d: 12, t: "09.00", title: "Rapat koordinasi mingguan", type: "Internal" },
      { d: 12, t: "14.00", title: "Review RAB Rumah Kemang", type: "Internal" },
      { d: 14, t: "08.30", title: "Servis AC Lt.2", type: "Internal" },
      { d: 14, t: "13.00", title: "Presentasi desain PT Graha Sentosa", type: "Eksternal" },
      { d: 15, t: "—", title: "Batas bayar BPJS & PPh 21", type: "Internal" },
      { d: 16, t: "15.00", title: "Safety briefing site Cikarang", type: "Eksternal" },
      { d: 19, t: "09.00", title: "Rapat koordinasi mingguan", type: "Internal" },
      { d: 21, t: "10.00", title: "Serah terima Kafe Senopati", type: "Eksternal" },
      { d: 23, t: "15.00", title: "Town hall & ulang tahun karyawan", type: "Internal" },
      { d: 26, t: "09.00", title: "Rapat koordinasi mingguan", type: "Internal" },
      { d: 28, t: "10.00", title: "Audit ISO surveillance", type: "Eksternal" },
      { d: 30, t: "16.00", title: "Cut-off tutup buku Oktober", type: "Internal" }
    ]
  },

  /* =====================================================
     LT.02 ADMINISTRASI
     ===================================================== */
  letterTypes: [
    { code: "SPK", name: "Surat Perintah Kerja" },
    { code: "SPH", name: "Surat Penawaran Harga" },
    { code: "INV", name: "Invoice" },
    { code: "BA", name: "Berita Acara" },
    { code: "UM", name: "Surat Umum" }
  ],
  letters: [
    { no: "021/SPH/RMT/X/2026", type: "SPH", subject: "Penawaran desain interior kantor direksi", party: "PT Graha Sentosa", value: 245000000, date: "10 Okt", status: "Terkirim" },
    { no: "014/INV/RMT/X/2026", type: "INV", subject: "Tagihan termin 3 (30%)", party: "CV Arunika", value: 420000000, date: "09 Okt", status: "Lunas" },
    { no: "009/SPK/RMT/X/2026", type: "SPK", subject: "Pekerjaan instalasi MEP gudang", party: "PT Elektrika Nusa", value: 318000000, date: "08 Okt", status: "Ditandatangani" },
    { no: "011/BA/RMT/X/2026", type: "BA", subject: "BA Serah Terima Pekerjaan (BAST)", party: "PT Kopi Nusa", value: null, date: "07 Okt", status: "Ditandatangani" },
    { no: "013/INV/RMT/X/2026", type: "INV", subject: "Tagihan termin 2 (25%)", party: "PT Logistik Andalan", value: 1350000000, date: "05 Okt", status: "Terkirim" },
    { no: "010/BA/RMT/X/2026", type: "BA", subject: "BA Progres pekerjaan 60%", party: "Bpk. H. Santoso", value: null, date: "03 Okt", status: "Draft" },
    { no: "007/UM/RMT/X/2026", type: "UM", subject: "Surat keterangan kerja", party: "Internal", value: null, date: "02 Okt", status: "Terkirim" }
  ],

  archiveCats: ["Surat Menyurat", "Company Profile", "Portofolio", "Kontrak & Penawaran", "Memo Internal"],
  archives: [
    { code: "ARS-E-0412", title: "Undangan aanwijzing tender — Dinas PUPR", cat: "Surat Menyurat", scope: "Eksternal", date: "09 Okt 2026", loc: "Rak A-2 · Drive/Surat/2026-10" },
    { code: "ARS-E-0409", title: "SPH desain interior — PT Graha Sentosa", cat: "Kontrak & Penawaran", scope: "Eksternal", date: "10 Okt 2026", loc: "Rak B-1 · Drive/Penawaran" },
    { code: "ARS-E-0398", title: "Company Profile Roemantara 2026 (ID & EN)", cat: "Company Profile", scope: "Eksternal", date: "02 Sep 2026", loc: "Drive/Compro" },
    { code: "ARS-E-0377", title: "Portofolio — Rumah Tinggal Kemang", cat: "Portofolio", scope: "Eksternal", date: "18 Agu 2026", loc: "Drive/Porto/Residensial" },
    { code: "ARS-E-0371", title: "Portofolio — Fit-out Kafe Senopati", cat: "Portofolio", scope: "Eksternal", date: "12 Agu 2026", loc: "Drive/Porto/Komersial" },
    { code: "ARS-I-0215", title: "Memo kebijakan lembur tim lapangan", cat: "Memo Internal", scope: "Internal", date: "01 Okt 2026", loc: "Rak C-3 · Drive/Memo" },
    { code: "ARS-I-0211", title: "Surat tugas survey lokasi Bogor", cat: "Surat Menyurat", scope: "Internal", date: "28 Sep 2026", loc: "Rak C-1 · Drive/Surat" },
    { code: "ARS-I-0204", title: "SOP pengadaan barang & jasa rev.3", cat: "Memo Internal", scope: "Internal", date: "15 Sep 2026", loc: "Drive/SOP" },
    { code: "ARS-E-0352", title: "Company Profile ringkas (1 lembar)", cat: "Company Profile", scope: "Eksternal", date: "20 Jul 2026", loc: "Drive/Compro" }
  ],

  minutes: [
    {
      id: "MOM-041", title: "Rapat Koordinasi Mingguan", date: "12 Okt 2026", time: "09.00–10.30", place: "Ruang Rapat Lt.2", lead: "Head of General Dept.",
      attendees: ["Direktur", "PM Proyek", "Arsitek Utama", "Finance", "Admin Kantor"],
      points: ["Progres Gudang Cikarang 41%, material besi tiba 14 Okt", "Serapan anggaran Kafe Senopati melebihi RAB 4%", "SKK Penanggung Jawab Teknik berakhir 24 Okt"],
      decisions: ["Addendum biaya Kafe Senopati diajukan ke klien", "Perpanjangan SKK diproses minggu ini"],
      actions: [
        { task: "Siapkan draft addendum Kafe Senopati", pic: "Admin Kantor", due: "14 Okt", done: false },
        { task: "Ajukan perpanjangan SKK ke LPJK", pic: "Legal", due: "16 Okt", done: false },
        { task: "Kirim laporan progres mingguan ke klien", pic: "PM Proyek", due: "13 Okt", done: true }
      ]
    },
    {
      id: "MOM-040", title: "Kick-off Showroom Arunika", date: "07 Okt 2026", time: "13.00–15.00", place: "Lokasi proyek", lead: "Arsitek Utama",
      attendees: ["CV Arunika", "Arsitek Utama", "Drafter", "Admin Kantor"],
      points: ["Konsep fasad dan zonasi showroom disepakati", "Klien minta visual 3D sebelum 21 Okt"],
      decisions: ["Jadwal presentasi 3D: 20 Okt 2026"],
      actions: [
        { task: "Render 3D tiga sudut pandang", pic: "3D Visualizer", due: "18 Okt", done: false },
        { task: "Kirim notulen ke klien", pic: "Admin Kantor", due: "08 Okt", done: true }
      ]
    },
    {
      id: "MOM-039", title: "Evaluasi Vendor Q3", date: "30 Sep 2026", time: "10.00–11.30", place: "Ruang Rapat Lt.2", lead: "Head of General Dept.",
      attendees: ["GA", "Finance", "PM Proyek"],
      points: ["PT Elektrika Nusa terlambat 2 kali pengiriman", "Harga besi naik 6% dibanding Q2"],
      decisions: ["PT Elektrika Nusa masuk status evaluasi", "Cari 2 supplier besi pembanding"],
      actions: [
        { task: "Surat teguran ke PT Elektrika Nusa", pic: "Admin Kantor", due: "03 Okt", done: true },
        { task: "Minta penawaran 2 supplier besi baru", pic: "GA", due: "10 Okt", done: true }
      ]
    }
  ],

  /* =====================================================
     LT.03 FINANCE & ACCOUNTING
     ===================================================== */
  bankAccounts: [
    {
      name: "BCA Operasional", no: "123-***-890", bankBalance: 1042350000,
      rows: [
        { date: "02 Okt", desc: "Termin 2 PT Graha Sentosa", bank: 450000000, book: 450000000 },
        { date: "05 Okt", desc: "Pembayaran PT Baja Prima", bank: -38400000, book: -38400000 },
        { date: "07 Okt", desc: "Biaya administrasi bank", bank: -25000, book: null },
        { date: "08 Okt", desc: "Sewa scaffolding PT Rangka Jaya", bank: -36000000, book: -36000000 },
        { date: "09 Okt", desc: "Bunga jasa giro", bank: 182500, book: null },
        { date: "10 Okt", desc: "Transfer gaji karyawan", bank: -312450000, book: -312540000 },
        { date: "11 Okt", desc: "Setoran termin 3 CV Arunika", bank: null, book: 420000000 }
      ]
    },
    {
      name: "Mandiri Proyek", no: "137-***-221", bankBalance: 684900000,
      rows: [
        { date: "01 Okt", desc: "Uang muka PT Logistik Andalan", bank: 540000000, book: 540000000 },
        { date: "06 Okt", desc: "Pembayaran CV Mandiri Struktur", bank: -186000000, book: -186000000 },
        { date: "08 Okt", desc: "Pajak atas bunga", bank: -36500, book: null },
        { date: "10 Okt", desc: "Pembelian HPL CV Kayu Lestari", bank: -27850000, book: -27580000 }
      ]
    }
  ],

  reports: {
    Harian: { unit: "juta", labels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"], in: [42, 18, 96, 12, 420, 0, 0], out: [36, 22, 41, 312, 28, 4, 0] },
    Mingguan: { unit: "juta", labels: ["M1 Sep", "M2 Sep", "M3 Sep", "M4 Sep", "M1 Okt", "M2 Okt"], in: [310, 220, 405, 385, 450, 588], out: [240, 260, 290, 290, 410, 443] },
    Bulanan: { unit: "juta", labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt"], in: [820, 640, 910, 760, 1180, 980, 1250, 1100, 1320, 1040], out: [690, 720, 780, 810, 900, 870, 1010, 950, 1080, 920] }
  },
  budget: [
    { project: "Renovasi Kantor PT Graha Sentosa", type: "Interior", budget: 1850, actual: 1420, progress: 78 },
    { project: "Rumah Tinggal Kemang", type: "Konstruksi", budget: 3200, actual: 2560, progress: 74 },
    { project: "Fit-out Kafe Senopati", type: "Interior", budget: 780, actual: 812, progress: 95 },
    { project: "Gudang Logistik Cikarang", type: "Konstruksi", budget: 5400, actual: 2380, progress: 41 },
    { project: "Showroom Arunika", type: "Arsitektur", budget: 1250, actual: 540, progress: 38 }
  ],

  closing: {
    period: "Oktober 2026", deadline: "2026-11-05",
    tasks: [
      { task: "Rekonsiliasi semua rekening bank", pic: "Finance", done: false },
      { task: "Pencatatan seluruh invoice & termin", pic: "Finance", done: true },
      { task: "Rekap utang vendor & subkon", pic: "GA + Finance", done: true },
      { task: "Jurnal penyusutan aset tetap", pic: "Finance", done: false },
      { task: "Jurnal akrual & biaya dibayar di muka", pic: "Finance", done: false },
      { task: "Pencocokan kas kecil", pic: "Admin Kantor", done: true },
      { task: "Review laba rugi per proyek", pic: "Head of General Dept.", done: false },
      { task: "Persetujuan & kunci periode", pic: "Direktur", done: false }
    ],
    history: [
      { period: "September 2026", closed: "04 Okt 2026", by: "Head of General Dept." },
      { period: "Agustus 2026", closed: "05 Sep 2026", by: "Head of General Dept." },
      { period: "Juli 2026", closed: "06 Agu 2026", by: "Head of General Dept." }
    ]
  },

  /* =====================================================
     LT.04 HUMAN RESOURCES
     ===================================================== */
  headcount: [
    { label: "Arsitek & Desainer", value: 14 },
    { label: "Drafter / BIM", value: 9 },
    { label: "Site Engineer & Pengawas", value: 16 },
    { label: "Quantity Surveyor", value: 5 },
    { label: "Divisi Umum & Support", value: 8 },
    { label: "Manajemen", value: 6 }
  ],
  employees: [
    { nik: "RMT-0003", name: "Andika Pratama", role: "Direktur Operasional", div: "Manajemen", status: "Tetap", join: "2015-03-02" },
    { nik: "RMT-0008", name: "Sekar Ayuningtyas", role: "Arsitek Utama", div: "Desain", status: "Tetap", join: "2017-07-17" },
    { nik: "RMT-0014", name: "Bayu Saputra", role: "Site Manager", div: "Konstruksi", status: "Tetap", join: "2018-01-08" },
    { nik: "RMT-0021", name: "Dewi Kartika", role: "Interior Designer", div: "Desain", status: "Tetap", join: "2019-09-02" },
    { nik: "RMT-0027", name: "Rizal Hakim", role: "Quantity Surveyor", div: "QS", status: "Tetap", join: "2020-02-03" },
    { nik: "RMT-0033", name: "Putri Maharani", role: "Staff Finance", div: "Divisi Umum", status: "Tetap", join: "2021-04-12" },
    { nik: "RMT-0039", name: "Galih Permana", role: "Drafter BIM", div: "Desain", status: "PKWT", join: "2022-08-01" },
    { nik: "RMT-0044", name: "Yoga Firmansyah", role: "Pengawas Lapangan", div: "Konstruksi", status: "PKWT", join: "2023-03-06" },
    { nik: "RMT-0049", name: "Nadia Salsabila", role: "Admin Kantor", div: "Divisi Umum", status: "Tetap", join: "2023-10-02" },
    { nik: "RMT-0052", name: "Teguh Wibisono", role: "Site Engineer", div: "Konstruksi", status: "PKWT", join: "2024-05-13" },
    { nik: "RMT-0056", name: "Laras Wulandari", role: "3D Visualizer", div: "Desain", status: "PKWT", join: "2025-06-02" },
    { nik: "RMT-0058", name: "Fikri Ramadhan", role: "Drafter AutoCAD", div: "Desain", status: "Probation", join: "2026-09-01" }
  ],
  freelancers: [
    { name: "Arif Nugroho", skill: "Drafter AutoCAD", rate: "Rp 450 rb / lembar", project: "Gudang Cikarang", rating: 4.7, avail: "Bertugas" },
    { name: "Melati Kusuma", skill: "3D Visualizer", rate: "Rp 1,2 jt / view", project: "—", rating: 4.9, avail: "Tersedia" },
    { name: "Pak Slamet", skill: "Mandor Sipil", rate: "Rp 350 rb / hari", project: "Rumah Kemang", rating: 4.5, avail: "Bertugas" },
    { name: "Indra Lesmana", skill: "Tukang Kayu Interior", rate: "Rp 300 rb / hari", project: "—", rating: 4.3, avail: "Tersedia" },
    { name: "Citra Dewanti", skill: "Desainer Grafis (Compro)", rate: "Rp 4 jt / proyek", project: "Compro 2027", rating: 4.6, avail: "Bertugas" },
    { name: "Hadi Prasetyo", skill: "Surveyor Topografi", rate: "Rp 2,5 jt / lokasi", project: "—", rating: 4.4, avail: "Tersedia" }
  ],
  attendanceToday: [
    { name: "Andika Pratama", in: "07.52", out: "—", loc: "Kantor", status: "Hadir" },
    { name: "Sekar Ayuningtyas", in: "08.03", out: "—", loc: "Kantor", status: "Hadir" },
    { name: "Bayu Saputra", in: "07.10", out: "—", loc: "Site Cikarang", status: "Dinas Lapangan" },
    { name: "Dewi Kartika", in: "08.21", out: "—", loc: "Kantor", status: "Terlambat" },
    { name: "Rizal Hakim", in: "—", out: "—", loc: "—", status: "Izin" },
    { name: "Putri Maharani", in: "07.58", out: "—", loc: "Kantor", status: "Hadir" },
    { name: "Yoga Firmansyah", in: "07.05", out: "—", loc: "Site Kemang", status: "Dinas Lapangan" },
    { name: "Laras Wulandari", in: "—", out: "—", loc: "—", status: "Sakit" }
  ],
  attendanceSummary: { Hadir: 47, Terlambat: 3, "Dinas Lapangan": 5, Izin: 2, Sakit: 1 },

  /* =====================================================
     LT.05 LEGAL — arsip dokumen eksternal
     daysLeft relatif terhadap hari ini (null = tanpa masa berlaku)
     ===================================================== */
  legalCats: ["Perizinan", "Kontrak Klien", "Kontrak Vendor & Subkon", "Akta & Legalitas", "Asuransi & Jaminan", "Sertifikat"],
  legalDocs: [
    { no: "9120001234567", title: "NIB (OSS-RBA)", cat: "Perizinan", party: "Kementerian Investasi/BKPM", issued: "2021-03-15", daysLeft: null, loc: "Brankas L-1 · Drive/Legal/Izin" },
    { no: "SBU-BG-2024-0881", title: "SBU Jasa Konstruksi — Bangunan Gedung", cat: "Perizinan", party: "LPJK", issued: "2024-11-28", daysLeft: 412, loc: "Brankas L-1 · Drive/Legal/Izin" },
    { no: "SBU-AR-2023-1402", title: "SBU Konsultan Arsitektur", cat: "Perizinan", party: "LPJK", issued: "2023-11-19", daysLeft: 38, loc: "Brankas L-1 · Drive/Legal/Izin" },
    { no: "SKK-PJT-2023-5521", title: "SKK Penanggung Jawab Teknik", cat: "Perizinan", party: "LPJK", issued: "2023-10-24", daysLeft: 12, loc: "Brankas L-1 · Drive/Legal/Izin" },
    { no: "KTR/RMT/2026/014", title: "Kontrak Design & Build Rumah Kemang", cat: "Kontrak Klien", party: "Bpk. H. Santoso", issued: "2026-03-02", daysLeft: 141, loc: "Rak L-2 · Drive/Legal/Kontrak" },
    { no: "KTR/RMT/2026/019", title: "Kontrak Gudang Logistik Cikarang", cat: "Kontrak Klien", party: "PT Logistik Andalan", issued: "2026-06-10", daysLeft: 236, loc: "Rak L-2 · Drive/Legal/Kontrak" },
    { no: "SPK/SUB/2026/009", title: "SPK Subkon MEP Gudang", cat: "Kontrak Vendor & Subkon", party: "PT Elektrika Nusa", issued: "2026-10-08", daysLeft: 118, loc: "Rak L-3 · Drive/Legal/Subkon" },
    { no: "PKS/VEN/2026/004", title: "Perjanjian Kerja Sama Supply Besi", cat: "Kontrak Vendor & Subkon", party: "PT Baja Prima", issued: "2026-01-05", daysLeft: 85, loc: "Rak L-3 · Drive/Legal/Vendor" },
    { no: "AHU-0012345.AH.01.01", title: "Akta Pendirian & SK Kemenkumham", cat: "Akta & Legalitas", party: "Notaris R. Wijaya, S.H.", issued: "2015-02-10", daysLeft: null, loc: "Brankas L-1 (asli)" },
    { no: "NPWP 01.234.567.8-012.000", title: "NPWP & SPPKP Perusahaan", cat: "Akta & Legalitas", party: "DJP", issued: "2015-03-01", daysLeft: null, loc: "Brankas L-1 · Drive/Legal/Pajak" },
    { no: "CAR-2026-77812", title: "Polis Asuransi CAR Proyek Cikarang", cat: "Asuransi & Jaminan", party: "PT Asuransi Mitra", issued: "2026-06-12", daysLeft: 74, loc: "Rak L-4 · Drive/Legal/Asuransi" },
    { no: "JP-2026-0331", title: "Jaminan Pelaksanaan Gudang Cikarang", cat: "Asuransi & Jaminan", party: "Bank Mandiri", issued: "2026-06-15", daysLeft: 236, loc: "Rak L-4 · Drive/Legal/Jaminan" },
    { no: "QMS-ID-2024-889", title: "Sertifikat ISO 9001:2015", cat: "Sertifikat", party: "Badan Sertifikasi", issued: "2024-04-20", daysLeft: 190, loc: "Dinding lobi · Drive/Legal/Sertifikat" }
  ]
};
