/* =========================================================
   GA → Procurement: FPP (Permohonan Persetujuan Pembelian)
   Format mengikuti template Roemantara: No. FPP/<KODE>/<NNN>/<BLN>/<TAHUN>,
   Divisi, Kebutuhan untuk, daftar item (Item · Satuan · Harga), Total,
   Catatan, Diajukan/Disetujui. Satu FPP berisi banyak item; bisa dicetak
   ke PDF (assets/js/fpp-pdf.js). Tersimpan di koleksi "fpp".
   ========================================================= */
(function () {
  "use strict";

  const root = document.getElementById("fppApp");
  if (!root || !window.DUStore) return;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const SKIN = document.body.dataset.skin || "blueprint";
  const up = (s) => (SKIN === "blueprint" ? String(s).toUpperCase() : String(s));
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const rp = (n) => "Rp " + Math.round(n || 0).toLocaleString("id-ID");
  const fdate = (s) => new Date(s + "T00:00:00").toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  const toast = (t) => { const el = $("#toast"); if (!el) return; el.textContent = t; el.classList.add("is-on"); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove("is-on"), 3000); };
  const log = (t) => window.DULog && window.DULog.add("GA", t);
  const num = (v) => { const n = parseFloat(String(v).replace(",", ".")); return isFinite(n) ? n : 0; };

  const CATS = ["Material", "Divisi", "Kebutuhan Kantor"];
  const DIVISI = ["Operasional", "General", "Branding Marketing", "Desain", "Keuangan"];
  const BLN = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];
  const STATUS = ["Diajukan", "Disetujui", "Dibeli", "Ditolak"];
  const TONE = { Diajukan: "warn", Disetujui: "info", Dibeli: "ok", Ditolak: "danger" };
  const S = { rows: [], mode: "loading", cat: "Semua", q: "", lines: [], active: -1 };
  const blank = () => ({ item: "", qty: "", unit: "", price: "", amount: "", vendor: "", kode: "", manual: false });

  /* FPP lama (satu barang) tetap terbaca */
  const itemsOf = (r) => (Array.isArray(r.items) && r.items.length ? r.items
    : r.item ? [{ item: r.item, qty: r.qty, unit: r.unit, price: r.price, amount: (Number(r.qty) || 0) * (Number(r.price) || 0), vendor: r.vendor, kode: r.kode }] : []);
  const totalOf = (r) => itemsOf(r).reduce((s, it) => s + (Number(it.amount) || 0), 0);
  const untukOf = (r) => r.untuk || r.who || "";

  function nextNo(kode, date) {
    const d = new Date((date || ymd(new Date())) + "T00:00:00");
    const k = (kode || "UMM").toUpperCase(), tail = `/${BLN[d.getMonth()]}/${d.getFullYear()}`;
    let n = 0;
    S.rows.forEach((r) => { const m = new RegExp(`^FPP/${k}/(\\d+)${tail}$`).exec(r.no || ""); if (m) n = Math.max(n, +m[1]); });
    return `FPP/${k}/${String(n + 1).padStart(3, "0")}${tail}`;
  }

  root.innerHTML = `
    <div class="stat-row fpp__stats"></div>
    <article class="panel panel--wide">
      <div class="panel__head">
        <h3 class="panel__title mono">${esc(up("Daftar FPP"))}</h3>
        <input class="search" type="search" placeholder="Cari no. FPP, proyek, item…" aria-label="Cari FPP">
      </div>
      <div class="chips chips--wrap fpp__chips" role="group" aria-label="Filter kategori FPP"></div>
      <div class="table-wrap"><table class="table">
        <thead><tr><th>No. FPP</th><th>Tanggal</th><th>Kebutuhan untuk</th><th>Item</th><th class="num">Total</th><th>Status</th><th></th></tr></thead>
        <tbody class="fpp__body"></tbody>
      </table></div>
      <p class="note mono fpp__note"></p>
    </article>
    <article class="panel panel--wide fpp__new">
      <h3 class="panel__title mono">${esc(up("Buat FPP · Permohonan Persetujuan Pembelian"))}</h3>
      <form class="form fpp__form" autocomplete="off">
        <div class="fpp__grid">
          <label>Kategori<select name="cat">${CATS.map((c) => `<option>${c}</option>`).join("")}</select></label>
          <label>Kode proyek / divisi<input name="kodeP" required maxlength="6" placeholder="mis. YGA" title="Dipakai di nomor FPP, 2–6 huruf"></label>
          <label>Tanggal<input name="date" type="date" required value="${ymd(new Date())}"></label>
          <label>Divisi<input name="divisi" list="fppDivisi" required value="Operasional"></label>
          <label class="fpp__wide">Kebutuhan untuk<input name="untuk" required placeholder="mis. Proyek Pelaksanaan Mr. Yoga"></label>
        </div>
        <datalist id="fppDivisi">${DIVISI.map((d) => `<option value="${esc(d)}">`).join("")}</datalist>
        <div class="table-wrap fpp__itemswrap"><table class="table fpp__items">
          <thead><tr><th>No</th><th>Item</th><th class="num">Jumlah</th><th>Satuan</th><th class="num">Harga satuan</th><th class="num">Harga</th><th></th></tr></thead>
          <tbody></tbody>
          <tfoot><tr><td></td><td><button type="button" class="mini-btn" data-add>+ Tambah item</button></td><td colspan="3" class="num"><b>Total</b></td><td class="num fpp__total">Rp 0</td><td></td></tr></tfoot>
        </table></div>
        <ul class="fpp__sug" role="listbox" hidden></ul>
        <div class="fpp__opts" hidden></div>
        <label>Catatan (foto/sample) — satu baris per poin<textarea name="note" rows="2">Pembayaran : Transfer &amp; Qr</textarea></label>
        <div class="fpp__grid fpp__sign">
          <label>Diajukan oleh (jabatan)<input name="ajuJab" value="Kepala Pelaksana"></label>
          <label>Nama pengaju<input name="ajuNama" placeholder="opsional"></label>
          <label>Disetujui oleh (jabatan)<input name="setJab" value="Head Of General Department"></label>
          <label>Nama penyetuju<input name="setNama" placeholder="opsional"></label>
        </div>
        <output class="form__preview mono fpp__preview">—</output>
        <div class="fpp__act">
          <button class="btn btn--solid" type="submit" data-pdf="1">Simpan &amp; unduh PDF</button>
          <button class="btn btn--ghost" type="submit">Simpan saja</button>
        </div>
        <p class="note fpp__msg" role="status"></p>
      </form>
    </article>`;

  const form = $(".fpp__form", root), body = $(".fpp__body", root), chips = $(".fpp__chips", root), search = $(".search", root);
  const ibody = $(".fpp__items tbody", root), sug = $(".fpp__sug", root), opts = $(".fpp__opts", root);

  /* ---------- Daftar item di formulir ---------- */
  function drawLines(focusIdx, field) {
    ibody.innerHTML = S.lines.map((l, i) => `<tr data-i="${i}">
        <td class="mono" data-l="No">${i + 1}.</td>
        <td data-l="Item"><input class="fpp__in fpp__item" data-f="item" value="${esc(l.item)}" placeholder="ketik mis. paku, semen, hollo 4.4…" aria-label="Item ${i + 1}" autocomplete="off"></td>
        <td data-l="Jumlah"><input class="fpp__in num" data-f="qty" type="number" min="0" step="any" value="${esc(l.qty)}" aria-label="Jumlah item ${i + 1}"></td>
        <td data-l="Satuan"><input class="fpp__in" data-f="unit" value="${esc(l.unit)}" placeholder="kg / btg / LS" aria-label="Satuan item ${i + 1}"></td>
        <td data-l="Harga satuan"><input class="fpp__in num" data-f="price" type="number" min="0" step="any" value="${esc(l.price)}" placeholder="opsional" aria-label="Harga satuan item ${i + 1}"></td>
        <td data-l="Harga"><input class="fpp__in num" data-f="amount" type="number" min="0" step="any" value="${esc(l.amount)}" aria-label="Harga item ${i + 1}"></td>
        <td class="fpp__rm">${S.lines.length > 1 ? `<button type="button" class="mini-btn" data-rm="${i}" aria-label="Hapus item ${i + 1}">×</button>` : ""}</td>
      </tr>`).join("");
    if (focusIdx != null) { const el = $(`tr[data-i="${focusIdx}"] [data-f="${field || "item"}"]`, ibody); if (el) el.focus(); }
    totals();
  }
  function totals() {
    const t = S.lines.reduce((s, l) => s + num(l.amount), 0);
    $(".fpp__total", root).textContent = rp(t);
    preview();
  }
  function preview() {
    const f = form.elements, n = S.lines.filter((l) => l.item.trim()).length;
    $(".fpp__preview", root).textContent = `No. ${nextNo(f.kodeP.value.trim() || "UMM", f.date.value)} · ${n} item · ${rp(S.lines.reduce((s, l) => s + num(l.amount), 0))}`;
  }
  ibody.addEventListener("input", (e) => {
    const tr = e.target.closest("tr[data-i]"); if (!tr) return;
    const i = +tr.dataset.i, f = e.target.dataset.f, l = S.lines[i];
    l[f] = e.target.value;
    if (f === "amount") l.manual = e.target.value !== "";
    if ((f === "qty" || f === "price") && !l.manual && num(l.price)) {
      l.amount = String(Math.round(num(l.qty) * num(l.price)));
      $('[data-f="amount"]', tr).value = l.amount;
    }
    if (f === "item") { l.kode = ""; S.active = i; suggest(e.target); }
    totals();
  });
  ibody.addEventListener("focusin", (e) => { const tr = e.target.closest("tr[data-i]"); if (tr) { S.active = +tr.dataset.i; if (e.target.dataset.f !== "item") closeSug(); } });
  ibody.addEventListener("keydown", (e) => {
    if (e.target.dataset.f === "item" && !sug.hidden) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + hits.length) % hits.length; drawSug(); return; }
      if (e.key === "Enter" && sel >= 0) { e.preventDefault(); pick(hits[sel]); return; }
      if (e.key === "Escape") { closeSug(); return; }
    }
    if (e.key === "Enter" && e.target.classList.contains("fpp__in")) { e.preventDefault(); }
  });
  root.addEventListener("click", (e) => {
    if (e.target.closest("[data-add]")) { S.lines.push(blank()); drawLines(S.lines.length - 1); return; }
    const rm = e.target.closest("[data-rm]");
    if (rm) { S.lines.splice(+rm.dataset.rm, 1); closeSug(); opts.hidden = true; drawLines(); }
  });

  /* ---------- Saran barang dari daftar harga satuan (DUHarga) ---------- */
  const H = window.DUHarga;
  let hits = [], sel = -1, anchor = null;
  function closeSug() { sug.hidden = true; sel = -1; }
  function place(el) {
    const wrap = form.getBoundingClientRect(), r = el.getBoundingClientRect();
    sug.style.top = (r.bottom - wrap.top + 2) + "px"; sug.style.left = Math.max(0, r.left - wrap.left) + "px"; sug.style.width = Math.max(260, r.width) + "px";
  }
  function suggest(el) {
    if (!H) return;
    anchor = el; hits = el.value.trim().length >= 2 ? H.search(el.value, 8) : []; sel = -1;
    place(el); drawSug();
  }
  function drawSug() {
    sug.innerHTML = hits.map((it, i) => {
      const o = H.options(it)[0];
      return `<li role="option" data-h="${i}" class="${i === sel ? "is-sel" : ""}" aria-selected="${i === sel}"><b>${esc(it.name)}</b><small>${esc(it.id)} · ${esc(it.unit || "—")} · ${o ? esc((o.vendor || "referensi") + " " + rp(o.price)) : "tanpa harga"}</small></li>`;
    }).join("");
    sug.hidden = !hits.length;
  }
  function showOpts(i, it) {
    const list = H ? H.options(it) : [];
    if (!list.length) { opts.hidden = true; return; }
    opts.innerHTML = `<span class="note mono">Item ${i + 1} · ${esc(it.id)} · pilih harga:</span>` + list.map((o) =>
      `<button type="button" class="fpp__opt" data-v="${esc(o.vendor)}" data-p="${o.price}" aria-pressed="${S.lines[i].vendor === o.vendor && num(S.lines[i].price) === o.price}">${esc(o.label)} <b>${rp(o.price)}</b></button>`).join("")
      + (it.q ? `<span class="note">⚠ harga perlu dikonfirmasi ke vendor</span>` : "");
    opts.dataset.i = i; opts.hidden = false;
  }
  function pick(it, i = S.active) {
    if (i < 0 || !S.lines[i]) return;
    closeSug();
    const l = S.lines[i], o = H ? H.options(it)[0] : null;
    Object.assign(l, { item: it.name, unit: it.unit || l.unit, kode: it.id, vendor: o ? o.vendor : "", price: o ? String(o.price) : l.price, manual: false });
    if (num(l.price)) l.amount = num(l.qty) ? String(Math.round(num(l.qty) * num(l.price))) : "";
    if (form.elements.cat.value !== "Material") form.elements.cat.value = "Material";
    drawLines(i, "qty"); showOpts(i, it);
  }
  sug.addEventListener("mousedown", (e) => { const li = e.target.closest("[data-h]"); if (li) { e.preventDefault(); pick(hits[+li.dataset.h]); } });
  document.addEventListener("click", (e) => { if (!e.target.closest(".fpp__sug") && e.target !== anchor) closeSug(); });
  opts.addEventListener("click", (e) => {
    const b = e.target.closest(".fpp__opt"); if (!b) return;
    const i = +opts.dataset.i, l = S.lines[i]; if (!l) return;
    l.vendor = b.dataset.v; l.price = b.dataset.p; l.manual = false;
    if (num(l.qty)) l.amount = String(Math.round(num(l.qty) * num(l.price)));
    $$(".fpp__opt", opts).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    drawLines();
  });

  /* ---------- Simpan & PDF ---------- */
  async function savePdf(r) {
    if (!window.DUFppPdf) { toast("Modul PDF tidak tersedia."); return; }
    toast("Menyiapkan PDF…");
    try {
      const blob = await window.DUFppPdf.build({ ...r, items: itemsOf(r), untuk: untukOf(r) });
      const name = window.DUFppPdf.fileName(r);
      const dl = window.claude && typeof window.claude.use === "function" ? await window.claude.use("downloads") : null;
      if (dl) await dl.save({ filename: name, data: blob });
      else { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); }
      toast(`${name} siap`);
      log(`Mencetak PDF ${r.no}`);
      return blob;
    } catch (er) {
      if (!er || er.code !== "declined") toast(er && er.message ? er.message : "Gagal membuat PDF.");
    }
  }
  form.addEventListener("input", (e) => { if (!e.target.closest(".fpp__items")) preview(); });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = form.elements, msg = $(".fpp__msg", root), wantPdf = e.submitter && e.submitter.dataset.pdf;
    const items = S.lines.filter((l) => l.item.trim()).map((l) => ({
      item: l.item.trim(), qty: num(l.qty), unit: l.unit.trim(), price: num(l.price), amount: num(l.amount), vendor: l.vendor || "", kode: l.kode || ""
    }));
    const kodeP = f.kodeP.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!kodeP || !f.untuk.value.trim() || !f.date.value) { msg.textContent = "Lengkapi kode proyek/divisi, tanggal, dan kebutuhan untuk."; return; }
    if (!items.length) { msg.textContent = "Isi minimal satu item."; return; }
    const row = {
      at: new Date().toISOString(), no: nextNo(kodeP, f.date.value), date: f.date.value, cat: f.cat.value, kodeP,
      divisi: f.divisi.value.trim(), untuk: f.untuk.value.trim(), items, total: items.reduce((s, it) => s + it.amount, 0),
      note: f.note.value.trim(), diajukan: { jabatan: f.ajuJab.value.trim(), nama: f.ajuNama.value.trim() },
      disetujui: { jabatan: f.setJab.value.trim(), nama: f.setNama.value.trim() }, status: "Diajukan"
    };
    $$("button[type=submit]", form).forEach((b) => (b.disabled = true)); msg.textContent = "";
    try {
      await window.DUStore.add("fpp", row);
      log(`Input ${row.no} (${row.cat}) · ${row.untuk} · ${items.length} item · ${rp(row.total)}`);
      toast(`${row.no} tersimpan`);
      if (wantPdf) await savePdf(row);
      S.lines = [blank()]; drawLines(); opts.hidden = true;
      f.untuk.value = ""; f.ajuNama.value = ""; f.setNama.value = "";
    } catch (er) {
      msg.textContent = "Gagal menyimpan. Anda mungkin hanya punya akses lihat.";
    }
    $$("button[type=submit]", form).forEach((b) => (b.disabled = false));
    preview();
  });

  /* ---------- Daftar FPP ---------- */
  function draw() {
    const rows = S.rows;
    const by = (c) => rows.filter((r) => r.cat === c);
    $(".fpp__stats", root).innerHTML =
      `<div class="stat stat--ok"><span class="mono">${esc(up("Total FPP"))}</span><b>${rows.length}</b><small>${rows.length ? rp(rows.reduce((s, r) => s + totalOf(r), 0)) + " total pengajuan" : "belum ada input"}</small></div>` +
      CATS.map((c) => { const l = by(c); return `<div class="stat"><span class="mono">${esc(up(c))}</span><b>${l.length}</b><small>${l.filter((r) => r.status === "Diajukan").length} menunggu · ${esc(rp(l.reduce((s, r) => s + totalOf(r), 0)))}</small></div>`; }).join("");
    chips.innerHTML = ["Semua"].concat(CATS).map((c) => `<button type="button" aria-pressed="${c === S.cat}" data-cat="${esc(c)}">${esc(c)} <b>${c === "Semua" ? rows.length : by(c).length}</b></button>`).join("");
    const q = S.q.toLowerCase();
    const list = rows.filter((r) => (S.cat === "Semua" || r.cat === S.cat) && (!q || [r.no, untukOf(r), r.divisi, r.note, ...itemsOf(r).map((it) => it.item)].join(" ").toLowerCase().includes(q)));
    const empty = S.mode === "loading" ? "Memuat data FPP…" : rows.length ? "Tidak ada FPP yang cocok." : "Belum ada FPP. Buat lewat formulir di bawah.";
    body.innerHTML = list.map((r) => {
      const its = itemsOf(r);
      return `<tr>
        <td class="mono">${esc(r.no)}<small class="mono sub">${esc(r.cat)}</small></td>
        <td>${esc(fdate(r.date))}</td>
        <td>${esc(untukOf(r))}<small class="mono sub">${esc(r.divisi || "—")}</small></td>
        <td>${its.slice(0, 2).map((it) => esc(it.item)).join(", ")}${its.length > 2 ? ` <small class="mono">+${its.length - 2} lagi</small>` : ""}<small class="mono sub">${its.length} item</small></td>
        <td class="num">${rp(totalOf(r))}</td>
        <td><select class="select fpp__st pill--${TONE[r.status] || "muted"}" data-id="${esc(r.id)}" aria-label="Status ${esc(r.no)}">${STATUS.map((s) => `<option ${s === r.status ? "selected" : ""}>${s}</option>`).join("")}</select></td>
        <td class="fpp__rowact"><button class="mini-btn" type="button" data-pdfrow="${esc(r.id)}">PDF</button><button class="mini-btn" type="button" data-del="${esc(r.id)}">Hapus</button></td>
      </tr>`;
    }).join("") || `<tr><td colspan="7" class="empty">${empty}</td></tr>`;
    $(".fpp__note", root).textContent = `${list.length} dari ${rows.length} FPP ditampilkan · ${S.mode === "live" ? "tersimpan di database bersama" : "mode lokal: tersimpan di browser ini saja"}`;
    preview();
  }
  chips.addEventListener("click", (e) => { const b = e.target.closest("[data-cat]"); if (b) { S.cat = b.dataset.cat; draw(); } });
  search.addEventListener("input", () => { S.q = search.value.trim(); draw(); });
  body.addEventListener("change", async (e) => {
    const s = e.target.closest(".fpp__st");
    if (!s) return;
    const r = S.rows.find((x) => x.id === s.dataset.id);
    try {
      await window.DUStore.update("fpp", s.dataset.id, { status: s.value });
      log(`Status ${r ? r.no : "FPP"} → ${s.value}${r ? " (" + untukOf(r) + ")" : ""}`);
    } catch (er) { toast("Gagal mengubah status."); draw(); }
  });
  body.addEventListener("click", async (e) => {
    const p = e.target.closest("[data-pdfrow]");
    if (p) { const r = S.rows.find((x) => x.id === p.dataset.pdfrow); if (r) savePdf(r); return; }
    const b = e.target.closest("[data-del]");
    if (!b) return;
    if (b.dataset.armed !== "1") {
      b.dataset.armed = "1"; b.textContent = "Yakin hapus?"; b.classList.add("is-armed");
      setTimeout(() => { if (b.isConnected) { b.dataset.armed = ""; b.textContent = "Hapus"; b.classList.remove("is-armed"); } }, 4000);
      return;
    }
    const r = S.rows.find((x) => x.id === b.dataset.del);
    try {
      await window.DUStore.remove("fpp", b.dataset.del);
      log(`Menghapus ${r ? r.no : "FPP"}`);
    } catch (er) { toast("Gagal menghapus."); }
  });

  /* dari tombol "+ FPP" di daftar harga: tambahkan sebagai item baru */
  function prefill(it) {
    if (!it) return;
    const tab = document.getElementById("tab-ga-proc");
    if (tab) tab.click();
    let i = S.lines.findIndex((l) => !l.item.trim());
    if (i < 0) { S.lines.push(blank()); i = S.lines.length - 1; }
    S.active = i; pick(it, i);
    setTimeout(() => { $(".fpp__new", root).scrollIntoView({ behavior: "smooth", block: "start" }); const q = $(`tr[data-i="${i}"] [data-f="qty"]`, ibody); if (q) q.focus({ preventScroll: true }); }, 80);
    toast(`${it.name} ditambahkan sebagai item ${i + 1} — isi jumlahnya`);
  }

  window.DUFpp = { rows: () => S.rows, prefill, pdf: savePdf };
  S.lines = [blank()];
  drawLines(); draw();
  window.DUStore.watch("fpp", (rows, mode) => {
    S.mode = mode === "error" ? "local" : mode;
    if (rows) S.rows = rows;
    draw();
    document.dispatchEvent(new CustomEvent("du:fpp"));
  });
})();
