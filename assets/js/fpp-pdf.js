/* =========================================================
   Cetak FPP (Permohonan Persetujuan Pembelian) ke PDF — tata letak
   mengikuti template Roemantara (FPP-YGA-003-OKT.pdf): kop + nomor,
   Divisi, Kebutuhan untuk, tabel item, Total, Catatan, tanda tangan.
   jsPDF dimuat dari cdnjs saat pertama kali dipakai.
   ========================================================= */
(function () {
  "use strict";

  const JSPDF = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
  const CO = {
    name: "ROEMANTARA INDONESIA",
    tag: "DESAIN INTERIOR, ARSITEKTUR & KONTRUKSI",
    addr: ["JL. Untung Suropati, Gg. Way Pios, Kec. Labuhan Ratu,", "Bandar Lampung Whatsapp: 0857-7114-3622 Email:"],
    mail: "roemantaraindonesia@gmail.com",
    web: "www.roemantara.odoo.com"
  };
  const BLN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const tgl = (iso) => { const d = new Date(iso + "T00:00:00"); return `${String(d.getDate()).padStart(2, "0")} ${BLN[d.getMonth()]} ${d.getFullYear()}`; };
  const rp = (n) => "Rp. " + Math.round(n || 0).toLocaleString("id-ID");
  const qty = (n) => {
    const v = Number(n) || 0;
    if (v === 0.5) return "½"; if (v === 0.25) return "¼"; if (v === 0.75) return "¾";
    return v.toLocaleString("id-ID", { maximumFractionDigits: 2 });
  };

  function load() {
    if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
    return new Promise((ok, no) => {
      const s = document.createElement("script");
      s.src = JSPDF;
      s.onload = () => (window.jspdf ? ok(window.jspdf.jsPDF) : no(new Error("lib")));
      s.onerror = () => no(new Error("Pustaka PDF gagal dimuat. Periksa koneksi lalu coba lagi."));
      document.head.appendChild(s);
    });
  }

  /* r = dokumen FPP: { no, date, divisi, untuk, items:[{item, qty, unit, amount}], note, diajukan:{jabatan,nama}, disetujui:{jabatan,nama} } */
  async function build(r) {
    const JsPDF = await load();
    const doc = new JsPDF({ unit: "mm", format: "a4" });
    const X = 20, W = 170, C = [X, X + 9, X + 77, X + 109, X + W]; // No | Item | Satuan | Harga
    const line = (x1, y1, x2, y2) => doc.line(x1, y1, x2, y2);
    const box = (x, y, w, h) => doc.rect(x, y, w, h);
    doc.setLineWidth(0.3);
    doc.setTextColor(0, 0, 0);

    /* ---- Kop ---- */
    let y = 20;
    const kopH = 26, mid = X + 89;
    box(X, y, W, kopH); line(mid, y, mid, y + kopH);
    const L = window.DU_FPP_LOGO;
    if (L) { const lh = 17, lw = (L.w / L.h) * lh; doc.addImage(L.src, "JPEG", X + 3, y + 4.5, lw, lh); }
    const tx = X + 50;
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(30, 110, 70); doc.text(CO.name, tx, y + 6.5, { align: "center" });
    doc.setTextColor(0, 0, 0); doc.setFontSize(5.2); doc.text(CO.tag, tx, y + 9.2, { align: "center" });
    doc.setFont("helvetica", "normal"); doc.text(CO.addr[0], tx, y + 11.8, { align: "center" }); doc.text(CO.addr[1], tx, y + 14.2, { align: "center" });
    doc.setTextColor(30, 80, 200); doc.text(CO.mail, tx, y + 16.6, { align: "center" }); doc.text(CO.web, tx, y + 19, { align: "center" });
    doc.setTextColor(0, 0, 0);
    const rx = mid, rw = X + W - mid, r1 = 9, r2 = 8;
    line(rx, y + r1, X + W, y + r1); line(rx, y + r1 + r2, X + W, y + r1 + r2);
    doc.setFont("times", "bold"); doc.setFontSize(11); doc.text("Standard Operating Procedure", rx + rw / 2, y + 6.2, { align: "center" });
    doc.setFontSize(9.5); doc.text("Permohonan Persetujuan Pembelian", rx + rw / 2, y + r1 + 5.5, { align: "center" });
    doc.setFont("times", "normal"); doc.setFontSize(9.5);
    const split = rx + 46;
    line(split, y + r1 + r2, split, y + kopH);
    doc.text("No. " + r.no, rx + 2, y + r1 + r2 + 6);
    doc.text("Tanggal : " + tgl(r.date), split + 2, y + r1 + r2 + 6);
    y += kopH + 1.5;

    /* ---- Divisi & kebutuhan ---- */
    const RH = 7.2;
    const cellText = (t, x, yy, opt) => doc.text(String(t), x, yy + RH / 2 + 1.3, opt);
    doc.setFontSize(10.8);
    [["Divisi", r.divisi], ["Kebutuhan untuk", r.untuk]].forEach(([k, v]) => {
      box(X, y, W, RH); line(C[2], y, C[2], y + RH);
      cellText(k, X + 1.5, y);
      const vv = doc.splitTextToSize(String(v || ""), C[4] - C[2] - 3)[0] || "";
      cellText(vv, C[2] + 1.5, y);
      y += RH;
    });

    /* ---- Tabel item ---- */
    const head = () => {
      box(X, y, W, RH); [1, 2, 3].forEach((i) => line(C[i], y, C[i], y + RH));
      cellText("No", X + 1.5, y); cellText("Item", (C[1] + C[2]) / 2, y, { align: "center" });
      cellText("Satuan", (C[2] + C[3]) / 2, y, { align: "center" }); cellText("Harga", (C[3] + C[4]) / 2, y, { align: "center" });
      y += RH;
    };
    head();
    const rows = (r.items || []).concat([null]); // satu baris kosong seperti template
    rows.forEach((it, i) => {
      const lines = it ? doc.splitTextToSize(String(it.item || ""), C[2] - C[1] - 3) : [""];
      const h = Math.max(RH, lines.length * 4.4 + 2.2);
      if (y + h > 250) { doc.addPage(); y = 20; head(); }
      box(X, y, W, h); [1, 2, 3].forEach((k) => line(C[k], y, C[k], y + h));
      if (it) {
        doc.text((i + 1) + ".", (C[0] + C[1]) / 2, y + 4.6, { align: "center" });
        doc.text(lines, C[1] + 1.5, y + 4.6);
        doc.text(`${qty(it.qty)} ${it.unit || ""}`.trim(), C[2] + 1.5, y + 4.2);
        doc.text(it.amount ? rp(it.amount) : "", C[3] + 1.5, y + 4.2);
      }
      y += h;
    });
    const total = (r.items || []).reduce((s, it) => s + (Number(it.amount) || 0), 0);
    box(X, y, W, RH + 0.6); line(C[2], y, C[2], y + RH + 0.6); line(C[3], y, C[3], y + RH + 0.6);
    doc.setFont("times", "bold"); doc.setFontSize(11.5);
    doc.text("Total", (C[0] + C[2]) / 2, y + 5, { align: "center" });
    doc.text("Rp.  " + Math.round(total).toLocaleString("id-ID"), C[3] + 1.5, y + 4.6);
    y += RH + 0.6;

    /* ---- Catatan ---- */
    const notes = String(r.note || "").split(/\n+/).map((s) => s.trim()).filter(Boolean);
    const nLines = notes.flatMap((n) => doc.splitTextToSize(n, W - 18));
    const noteH = Math.max(28, 9 + nLines.length * 4.6);
    if (y + noteH + 58 > 287) { doc.addPage(); y = 20; }
    box(X, y, W, noteH);
    doc.setFont("times", "bold"); doc.setFontSize(10.8); doc.text("Catatan (foto/sample) :", X + 4, y + 5);
    doc.setFont("times", "normal");
    let ny = y + 10;
    notes.forEach((n) => {
      const ls = doc.splitTextToSize(n, W - 18);
      doc.text("-", X + 7, ny); doc.text(ls, X + 13, ny); ny += ls.length * 4.6;
    });
    y += noteH;

    /* ---- Tanda tangan ---- */
    const sh = 56;
    box(X, y, W, sh);
    const lx = X + 40, rx2 = X + W - 45;
    doc.text("Diajukan oleh", lx, y + 8, { align: "center" });
    doc.text("Disetujui oleh", rx2, y + 8, { align: "center" });
    const who = (p, x) => {
      if (p && p.nama) { doc.setFont("times", "bold"); doc.text(`( ${p.nama} )`, x, y + 36, { align: "center" }); doc.setFont("times", "normal"); }
      doc.text((p && p.jabatan) || "", x, y + 42, { align: "center" });
    };
    who(r.diajukan, lx); who(r.disetujui, rx2);

    doc.setProperties({ title: "FPP " + r.no, subject: "Permohonan Persetujuan Pembelian", author: "Roemantara Indonesia", creator: "Webapp Divisi Umum" });
    return doc.output("blob");
  }

  const fileName = (r) => r.no.replace(/[\\/]+/g, "-") + ".pdf";
  window.DUFppPdf = { build, fileName };
})();
