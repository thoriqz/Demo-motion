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
        /* Satu PIN bersama untuk Divisi Umum & Direksi */
        { id: "keuangan", label: "Divisi Umum & Direksi", hash: "a58f06e9390a31930922cc1ed7467bd2a7e9ea55c77d423ec1ca9aa09b923de6" }
      ]
    }
  },

  /* =====================================================
     LT.01 GENERAL AFFAIRS
     ===================================================== */
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

  /* Kalender Google yang dipakai modul Kalender (lihat assets/js/gcal.js) */
  googleCalendar: { calendarId: "roemantaraindonesia@gmail.com", timeZone: "Asia/Jakarta" },

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
  /* Sumber: DATABASE_SDM_ROEMANTRA.xlsx (sheet DATA KARYAWAN) */
  employees: [
    { name: "Thoriq Ilham Zuhaldi", gender: "Laki-laki", age: 28, phone: "082281479117", role: "Head of General", email: "thoriqzuhaldi@gmail.com" },
    { name: "Ananda Tri Pamungkas", gender: "Laki-laki", age: 28, phone: "08989301726", role: "Head of Branding Marketing", email: "nandatri1020@gmail.com" },
    { name: "M Reyhanryan Daffa M", gender: "Laki-laki", age: 26, phone: "082374824392", role: "Head of Operational", email: "ryandaffar@gmail.com" },
    { name: "Muhammad Fahmi Alman", gender: "Laki-laki", age: 25, phone: "085809824153", role: "Pengawas Lapangan", email: "m.fahmialman15@gmail.com" }
  ],
  /* Sumber: DATABASE_FREELANCE.xlsx. Posisi tanpa nama tetap ditampilkan. */
  freelancePositions: ["3D Designer", "Drafter Estimator", "Content Creator"],
  freelancers: [
    { name: "Zaki", role: "3D Designer", phone: "0812-1840-7448" },
    { name: "Renaldi", role: "3D Designer", phone: "0822-8086-8952" },
    { name: "Nurul", role: "3D Designer", phone: "0812-1489-3641" },
    { name: "Febry", role: "3D Designer", phone: "0878-6946-4120" },
    { name: "Akbar", role: "Drafter Estimator", phone: "0857-6491-6822" },
    { name: "Arya", role: "Drafter Estimator", phone: "0831-2444-2158" }
  ],
  attendance: {
    url: "https://script.google.com/macros/s/AKfycbxWMYLpRaKjP7VHfIoNCNH_6mAZGoMG8zRIaoeLqfMxkY7fwvL5XLdSSeNZFgaEbswXJg/exec?page=dashboard",
    refreshMinutes: 5
  }
};
