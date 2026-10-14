/* =========================================================
   GA → Vendor & Subkon: daftar harga satuan material
   (DATABASE_VENDOR_by_ROEMANTARA.xlsx, assets/js/harga-data.js).
   window.DUHarga dipakai oleh FPP (isi otomatis barang/satuan/harga/vendor)
   dan oleh direktori vendor (tautan "daftar harga").
   ========================================================= */
(function () {
  "use strict";

  let H = (window.DU_DATA || {}).harga;
  if (!H) return;
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const SKIN = document.body.dataset.skin || "blueprint";
  const up = (s) => (SKIN === "blueprint" ? String(s).toUpperCase() : String(s));
  const rp = (n) => (n == null ? "—" : "Rp " + Math.round(n).toLocaleString("id-ID"));
  const norm = (s) => String(s || "").toLowerCase().replace(/^(tb|cv|pt|ud|toko)\s+/, "").replace(/[^a-z0-9.,/]+/g, " ").replace(/[.,]+(\s|$)/g, " ").trim();
  let SA = H.setia.vendor;
  /* file Excel asli: repo/GitHub Pages di assets/files/; versi claude.ai disisipkan saat build;
     versi unggahan terbaru dibawa oleh harga-upload.js (META.xlsx) */
  const FILE = "assets/files/" + H.source;
  let META = { name: H.source, at: H.copied, by: "", xlsx: null, live: false };
  /* Versi claude.ai: isi file disisipkan ke halaman (window.DU_XLSX_B64) saat build, byte-nya sama persis */
  async function fileBlob() {
    const type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const b64 = META.xlsx || window.DU_XLSX_B64;
    if (b64) {
      const bin = atob(b64), buf = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
      return new Blob([buf], { type });
    }
    const res = await fetch(FILE);
    if (!res.ok) throw { code: "missing" };
    return res.blob();
  }

  /* ---------- Indeks gabungan ---------- */
  let items = [], byId = new Map(), vendorCount = {}, VENDORS = [];
  function build() {
    SA = H.setia.vendor;
    items = [];
    H.ref.forEach((r) => items.push({
      id: r.c, src: "ref", name: r.n, unit: r.u, group: r.s, ref: r.p,
      vendors: Object.entries(r.v || {}).map(([v, p]) => ({ v, p })).sort((a, b) => a.p - b.p)
    }));
    H.setia.items.forEach((r) => items.push({
      id: r.c, src: "sa", name: r.n + (r.var ? " " + r.var : ""), unit: r.u, group: r.k, ref: null, date: r.t, ket: r.ket || "", q: !!r.q,
      vendors: r.p != null ? [{ v: SA, p: r.p }] : []
    }));
    /* kode di file bisa ganda (mis. M1383 dipakai 2 material) → kunci unik terpisah */
    const seen = {};
    items.forEach((it) => { it.key = norm(it.id + " " + it.name + " " + it.group); seen[it.id] = (seen[it.id] || 0) + 1; it.uid = seen[it.id] > 1 ? it.id + "~" + seen[it.id] : it.id; });
    byId = new Map(items.map((it) => [it.uid, it]));
    vendorCount = {};
    items.forEach((it) => it.vendors.forEach((o) => (vendorCount[o.v] = (vendorCount[o.v] || 0) + 1)));
    VENDORS = Object.keys(vendorCount).sort((a, b) => vendorCount[b] - vendorCount[a]);
  }
  build();

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
  /* Ganti seluruh data harga (dipakai harga-upload.js setelah unggah / saat versi terbaru dimuat) */
  function load(next, meta) {
    H = next; META = { ...META, ...meta };
    build();
    if (root) { shell(); S.group = "all"; S.vendor = VENDORS.includes(S.vendor) ? S.vendor : "all"; sync(); draw(); }
    document.dispatchEvent(new CustomEvent("du:harga"));
  }
  window.DUHarga = {
    search, options, get: (id) => byId.get(id), countFor, showVendor, vendors: () => VENDORS.slice(),
    data: () => H, meta: () => META, load, fileBlob
  };

  if (!root) return;
  const when = (iso) => { const d = new Date(iso); return isNaN(d) ? String(iso || "") : d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) + (String(iso).length > 10 ? " " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : ""); };
  function shell() {
  const qn = items.filter((it) => it.q).length;
  root.innerHTML = `
    <div class="panel__head">
      <h3 class="panel__title mono">${esc(up("Harga satuan material"))}</h3>
      <div class="toolbar">
        <a class="btn btn--solid hg-dl" href="${esc(FILE)}" download="${esc(META.name)}">⤓ Unduh file asli (.xlsx)</a>
        <span class="hg-up-slot"></span>
        <input class="search hg-q" type="search" placeholder="Cari material, kode, ukuran…" aria-label="Cari harga material">
      </div>
    </div>
    <p class="hg-ver note mono">Versi data: <b>${esc(META.name)}</b> · ${META.live ? "diunggah " + esc(when(META.at)) + (META.by ? " oleh " + esc(META.by) : "") : "bawaan webapp (" + esc(when(META.at)) + ")"}</p>
    <div class="hg-preview" hidden></div>
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
    <p class="note mono hg-note">Sumber: ${esc(H.source)} · ${esc(SA)} dari foto daftar harga toko (diterima ${esc(H.setia.received)}); harga bertanda ⚠ perlu dikonfirmasi ke vendor. ${qn} item bertanda. Harga belum termasuk ongkir/PPN kecuali disebut. Data lengkap (semua kolom vendor, keterangan, list harga subkon) ada di file asli.</p>`;
  body = $(".hg-body", root); srcSel = $(".hg-src", root); grpSel = $(".hg-group", root); venSel = $(".hg-vendor", root); qIn = $(".hg-q", root);
  bind();
  document.dispatchEvent(new CustomEvent("du:harga-shell"));
  }

  let body, srcSel, grpSel, venSel, qIn;
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
        <td>${best || it.ref != null ? `<button class="mini-btn" type="button" data-fpp="${esc(it.uid)}" title="Buat FPP material dengan harga ini">+ FPP</button>` : ""}</td>
      </tr>`;
    }).join("") || `<tr><td colspan="6" class="empty">Tidak ada material yang cocok.</td></tr>`;
    $(".hg-more", root).innerHTML = list.length > S.limit
      ? `<button class="mini-btn" type="button" data-more>Tampilkan ${Math.min(50, list.length - S.limit)} lagi · ${list.length.toLocaleString("id-ID")} hasil</button>`
      : `<span class="note mono">${list.length.toLocaleString("id-ID")} hasil</span>`;
  }
  function bind() {
  srcSel.addEventListener("change", () => { S.src = srcSel.value; S.group = "all"; S.limit = 25; sync(); draw(); });
  grpSel.addEventListener("change", () => { S.group = grpSel.value; S.limit = 25; draw(); });
  venSel.addEventListener("change", () => { S.vendor = venSel.value; S.limit = 25; draw(); });
  let t = 0;
  qIn.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { S.q = qIn.value; S.limit = 25; draw(); }, 150); });
  /* Unduh file asli: di claude.ai lewat kemampuan "downloads" (viewer mengonfirmasi),
     di salinan lokal / GitHub Pages lewat tautan biasa. */
  $(".hg-dl", root).addEventListener("click", async (e) => {
    if (!window.claude || typeof window.claude.use !== "function") return;
    e.preventDefault();
    const a = e.currentTarget, label = a.textContent;
    const toast = (t) => { const el = $("#toast"); if (!el) return; el.textContent = t; el.classList.add("is-on"); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove("is-on"), 3200); };
    const dl = await claude.use("downloads");
    if (!dl) { toast("Unduhan tidak tersedia di tampilan ini."); return; }
    a.textContent = "Menyiapkan file…";
    try {
      await dl.save({ filename: META.name, data: await fileBlob() });
      toast("File harga material tersimpan");
      if (window.DULog) window.DULog.add("GA", "Mengunduh file harga " + META.name);
    } catch (er) {
      const code = er && er.code;
      if (code !== "declined") toast(code === "missing" ? "File asli tidak ditemukan." : code === "rate_limited" ? "Tunggu sebentar lalu coba lagi." : "Gagal mengunduh file.");
    }
    a.textContent = label;
  });
  }
  root.addEventListener("click", (e) => {
    if (e.target.closest("[data-more]")) { S.limit += 50; draw(); return; }
    const b = e.target.closest("[data-fpp]");
    if (b && window.DUFpp && window.DUFpp.prefill) window.DUFpp.prefill(byId.get(b.dataset.fpp));
  });
  shell(); sync(); draw();
})();
