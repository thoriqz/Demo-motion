/* =========================================================
   GA → Vendor & Subkon: daftar harga satuan material
   (DATABASE_VENDOR_by_ROEMANTARA.xlsx, assets/js/harga-data.js).
   window.DUHarga dipakai oleh FPP (isi otomatis barang/satuan/harga/vendor)
   dan oleh direktori vendor (tautan "daftar harga").
   ========================================================= */
(function () {
  "use strict";

  const H = (window.DU_DATA || {}).harga;
  if (!H) return;
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const SKIN = document.body.dataset.skin || "blueprint";
  const up = (s) => (SKIN === "blueprint" ? String(s).toUpperCase() : String(s));
  const rp = (n) => (n == null ? "—" : "Rp " + Math.round(n).toLocaleString("id-ID"));
  const norm = (s) => String(s || "").toLowerCase().replace(/^(tb|cv|pt|ud|toko)\s+/, "").replace(/[^a-z0-9.,/]+/g, " ").replace(/[.,]+(\s|$)/g, " ").trim();
  const SA = H.setia.vendor;

  /* ---------- Indeks gabungan ---------- */
  const items = [];
  H.ref.forEach((r) => items.push({
    id: r.c, src: "ref", name: r.n, unit: r.u, group: r.s, ref: r.p,
    vendors: Object.entries(r.v || {}).map(([v, p]) => ({ v, p })).sort((a, b) => a.p - b.p)
  }));
  H.setia.items.forEach((r) => items.push({
    id: r.c, src: "sa", name: r.n + (r.var ? " " + r.var : ""), unit: r.u, group: r.k, ref: null, date: r.t, ket: r.ket || "", q: !!r.q,
    vendors: r.p != null ? [{ v: SA, p: r.p }] : []
  }));
  items.forEach((it) => (it.key = norm(it.id + " " + it.name + " " + it.group)));
  const byId = new Map(items.map((it) => [it.id, it]));

  const vendorCount = {};
  items.forEach((it) => it.vendors.forEach((o) => (vendorCount[o.v] = (vendorCount[o.v] || 0) + 1)));
  const VENDORS = Object.keys(vendorCount).sort((a, b) => vendorCount[b] - vendorCount[a]);

  /* opsi harga untuk satu barang: vendor termurah dulu, lalu harga referensi */
  const options = (it) => it.vendors.map((o) => ({ vendor: o.v, price: o.p, label: o.v }))
    .concat(it.ref != null ? [{ vendor: "", price: it.ref, label: "Harga referensi" }] : []);
  function search(q, n = 8) {
    const words = norm(q).split(" ").filter(Boolean);
    if (!words.length) return [];
    const hits = [];
    for (const it of items) {
      if (words.every((w) => it.key.includes(w))) {
        const score = (norm(it.name).startsWith(words[0]) ? 0 : 1) + (it.vendors.length ? 0 : .5) + it.name.length / 200;
        hits.push([score, it]);
      }
    }
    return hits.sort((a, b) => a[0] - b[0]).slice(0, n).map((h) => h[1]);
  }
  const countFor = (name) => { const k = norm(name); const v = VENDORS.find((x) => norm(x) === k); return v ? vendorCount[v] : 0; };

  /* ---------- Panel daftar harga ---------- */
  const root = document.getElementById("hargaApp");
  const S = { src: "all", group: "all", vendor: "all", q: "", limit: 25 };
  const groups = (src) => [...new Set(items.filter((it) => src === "all" || it.src === src).map((it) => it.group))];

  function showVendor(name) {
    const v = VENDORS.find((x) => norm(x) === norm(name));
    if (!v || !root) return;
    S.vendor = v; S.group = "all"; S.src = "all"; S.q = ""; S.limit = 25;
    sync(); draw();
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  window.DUHarga = { search, options, get: (id) => byId.get(id), countFor, showVendor, vendors: () => VENDORS.slice() };

  if (!root) return;
  const qn = items.filter((it) => it.q).length;
  root.innerHTML = `
    <div class="panel__head">
      <h3 class="panel__title mono">${esc(up("Harga satuan material"))}</h3>
      <input class="search hg-q" type="search" placeholder="Cari material, kode, ukuran…" aria-label="Cari harga material">
    </div>
    <div class="toolbar hg-tools">
      <select class="select hg-src" aria-label="Sumber harga">
        <option value="all">Semua sumber (${items.length.toLocaleString("id-ID")})</option>
        <option value="ref">Daftar harga material (${H.ref.length.toLocaleString("id-ID")})</option>
        <option value="sa">${esc(SA)} (${H.setia.items.length})</option>
      </select>
      <select class="select hg-group" aria-label="Kelompok material"></select>
      <select class="select hg-vendor" aria-label="Vendor">
        <option value="all">Semua vendor</option>
        ${VENDORS.map((v) => `<option value="${esc(v)}">${esc(v)} (${vendorCount[v]})</option>`).join("")}
      </select>
    </div>
    <div class="table-wrap"><table class="table hg-table">
      <thead><tr><th>Kode</th><th>Material</th><th>Satuan</th><th class="num">Harga referensi</th><th>Harga vendor</th><th></th></tr></thead>
      <tbody class="hg-body"></tbody>
    </table></div>
    <div class="hg-more"></div>
    <p class="note mono hg-note">Sumber: ${esc(H.source)} · ${esc(SA)} dari foto daftar harga toko (diterima ${esc(H.setia.received)}); harga bertanda ⚠ perlu dikonfirmasi ke vendor. ${qn} item bertanda. Harga belum termasuk ongkir/PPN kecuali disebut.</p>`;

  const body = $(".hg-body", root), srcSel = $(".hg-src", root), grpSel = $(".hg-group", root), venSel = $(".hg-vendor", root), qIn = $(".hg-q", root);
  function sync() {
    srcSel.value = S.src; venSel.value = S.vendor; qIn.value = S.q;
    grpSel.innerHTML = `<option value="all">Semua kelompok</option>` + groups(S.src).map((g) => `<option value="${esc(g)}">${esc(g)}</option>`).join("");
    grpSel.value = S.group;
  }
  function rows() {
    const words = norm(S.q).split(" ").filter(Boolean);
    return items.filter((it) => (S.src === "all" || it.src === S.src) && (S.group === "all" || it.group === S.group)
      && (S.vendor === "all" || it.vendors.some((o) => o.v === S.vendor)) && words.every((w) => it.key.includes(w)));
  }
  function draw() {
    const list = rows();
    body.innerHTML = list.slice(0, S.limit).map((it) => {
      const best = it.vendors[0];
      return `<tr>
        <td class="mono">${esc(it.id)}</td>
        <td>${esc(it.name)}<small class="mono sub">${esc(it.group)}${it.date ? " · " + esc(it.date) : ""}${it.ket ? " · " + esc(it.ket) : ""}</small></td>
        <td>${esc(it.unit || "—")}</td>
        <td class="num">${rp(it.ref)}</td>
        <td>${it.vendors.length ? it.vendors.map((o, i) => `<span class="hg-vp${i === 0 && it.vendors.length > 1 ? " is-best" : ""}${it.q ? " is-q" : ""}" title="${it.q ? "Perlu konfirmasi ke vendor" : ""}">${esc(o.v)} <b>${rp(o.p)}</b>${it.q ? " ⚠" : ""}</span>`).join("") : `<span class="note">${it.src === "sa" ? "harga tidak terbaca ⚠" : "—"}</span>`}</td>
        <td>${best || it.ref != null ? `<button class="mini-btn" type="button" data-fpp="${esc(it.id)}" title="Buat FPP material dengan harga ini">+ FPP</button>` : ""}</td>
      </tr>`;
    }).join("") || `<tr><td colspan="6" class="empty">Tidak ada material yang cocok.</td></tr>`;
    $(".hg-more", root).innerHTML = list.length > S.limit
      ? `<button class="mini-btn" type="button" data-more>Tampilkan ${Math.min(50, list.length - S.limit)} lagi · ${list.length.toLocaleString("id-ID")} hasil</button>`
      : `<span class="note mono">${list.length.toLocaleString("id-ID")} hasil</span>`;
  }
  srcSel.addEventListener("change", () => { S.src = srcSel.value; S.group = "all"; S.limit = 25; sync(); draw(); });
  grpSel.addEventListener("change", () => { S.group = grpSel.value; S.limit = 25; draw(); });
  venSel.addEventListener("change", () => { S.vendor = venSel.value; S.limit = 25; draw(); });
  let t = 0;
  qIn.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { S.q = qIn.value; S.limit = 25; draw(); }, 150); });
  root.addEventListener("click", (e) => {
    if (e.target.closest("[data-more]")) { S.limit += 50; draw(); return; }
    const b = e.target.closest("[data-fpp]");
    if (b && window.DUFpp && window.DUFpp.prefill) window.DUFpp.prefill(byId.get(b.dataset.fpp));
  });
  sync(); draw();
})();
