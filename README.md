# Divisi Umum — Roemantara Indonesia (Demo Motion)

Webapp motion untuk Divisi Umum dengan tema **gambar kerja / blueprint konstruksi arsitektur**.
Divisi digambarkan sebagai gedung 5 lantai — tiap lantai satu bidang:

| Lantai | Bidang | Isi |
|---|---|---|
| LT.01 | General Affairs | Inventaris aset, jadwal pemeliharaan, stok ATK & APD, tiket permintaan GA |
| LT.02 | Administrasi | Register surat masuk/keluar, generator nomor surat (`042/RMT-ADM/X/2026`), agenda mingguan |
| LT.03 | Finance & Accounting | Grafik arus kas, status termin, anggaran (RAB) vs realisasi per proyek |
| LT.04 | Human Resources | Komposisi karyawan, heatmap kehadiran, checklist pelatihan/SKK, pipeline rekrutmen |
| LT.05 | Legal | Masa berlaku perizinan (NIB, SBU, SKK, ISO) + peringatan, progres kontrak proyek |

## Motion & interaksi
- Loader denah yang tergambar garis demi garis, lalu gedung + tower crane digambar ala CAD
- Klik lantai gedung untuk menuju bidangnya; crane bergerak mengikuti scroll
- Kursor crosshair CAD dengan koordinat, indikator elevasi (lift) di sisi kanan
- Grafik, bar, ring, dan angka KPI beranimasi saat masuk layar
- Tema **Blueprint** (gelap) / **Kalkir** (terang)
- Responsif mobile & menghormati `prefers-reduced-motion`

## Menjalankan
Tanpa build. Buka `index.html` di browser, atau:

```bash
python3 -m http.server 8000   # lalu buka http://localhost:8000
```

## Mengganti data
Semua data contoh (dummy) ada di `assets/js/data.js`. Surat baru, centang pelatihan,
dan posisi kandidat tersimpan di `localStorage` browser masing-masing.

## Opsi desain
`design-options.html` berisi 9 arah desain bermotion untuk dibandingkan:
- Bertema konstruksi: A Blueprint CAD (versi saat ini), B Beton Brutalis, C Material Board, D Maket Isometrik
- Di luar tema konstruksi: E Swiss Grid, F Aurora Glass, G Nusantara Kawung, H Bento Pop, I Sage Soft Dashboard (dari referensi)
