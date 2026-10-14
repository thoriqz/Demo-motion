/* =========================================================
   GA → Procurement: input manual FPP (Formulir Permintaan Pembelian)
   Kategori: Material, Divisi, Kebutuhan Kantor. Tersimpan di koleksi "fpp".
   ========================================================= */
(function () {
  "use strict";

  const root = document.getElementById("fppApp");
  if (!root || !window.DUStore) return;
  const D = window.DU_DATA || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const SKIN = document.body.dataset.skin || "blueprint";
  const up = (s) => (SKIN === "blueprint" ? String(s).toUpperCase() : String(s));
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const rp = (n) => "Rp " + Math.round(n || 0).toLocaleString("id-ID");
  const fdate = (s) => new Date(s + "T00:00:00").toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  const toast = (t) => { const el = $("#toast"); if (!el) return; el.textContent = t; el.classList.add("is-on"); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove("is-on"), 2600); };
  const log = (t) => window.DULog && window.DULog.add("GA", t);

  const CATS = ["Material", "Divisi", "Kebutuhan Kantor"];
  const WHO = { Material: ["Proyek", "mis. Rumah Kemang"], Divisi: ["Divisi", "mis. Operational"], "Kebutuhan Kantor": ["Pemohon", "mis. Admin Kantor"] };
  const STATUS = ["Diajukan", "Disetujui", "Dibeli", "Ditolak"];
  const TONE = { Diajukan: "warn", Disetujui: "info", Dibeli: "ok", Ditolak: "danger" };
  const S = { rows: [], mode: "loading", cat: "Semua", q: "", pick: null };
  const vendors = [...new Set((D.vendors || []).map((v) => v.name))].sort((a, b) => a.localeCompare(b, "id"));

  root.innerHTML = `
    <div class="stat-row fpp__stats"></div>
    <div class="grid grid--2-1">
      <article class="panel">
        <div class="panel__head">
          <h3 class="panel__title mono">${esc(up("Daftar FPP"))}</h3>
          <input class="search" type="search" placeholder="Cari barang, pemohon, vendor…" aria-label="Cari FPP">
        </div>
        <div class="chips chips--wrap fpp__chips" role="group" aria-label="Filter kategori FPP"></div>
        <div class="table-wrap"><table class="table">
          <thead><tr><th>No. FPP</th><th>Tanggal</th><th>Kategori</th><th>Barang / Kebutuhan</th><th class="num">Jumlah</th><th class="num">Estimasi</th><th>Status</th><th></th></tr></thead>
          <tbody class="fpp__body"></tbody>
        </table></div>
        <p class="note mono fpp__note"></p>
      </article>
      <article class="panel">
        <h3 class="panel__title mono">${esc(up("Input FPP manual"))}</h3>
        <form class="form fpp__form" autocomplete="off">
          <label>Kategori FPP<select name="cat">${CATS.map((c) => `<option>${c}</option>`).join("")}</select></label>
          <div class="gc-row">
            <label>Tanggal<input name="date" type="date" required value="${ymd(new Date())}"></label>
            <label class="fpp__who"><span>${WHO.Material[0]}</span><input name="who" required placeholder="${WHO.Material[1]}"></label>
          </div>
          <label class="fpp__barang">Barang / kebutuhan<input name="barang" required placeholder="ketik mis. semen, hollo 4.4, keramik…" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="fppSug"></label>
          <ul class="fpp__sug" id="fppSug" role="listbox" hidden></ul>
          <div class="fpp__opts" hidden></div>
          <div class="gc-row">
            <label>Jumlah<input name="qty" type="number" min="0" step="any" required placeholder="0"></label>
            <label>Satuan<input name="unit" placeholder="sak / pcs / unit"></label>
          </div>
          <label>Harga satuan (Rp)<input name="price" type="number" min="0" step="any" placeholder="estimasi, opsional"></label>
          <label>Vendor<input name="vendor" list="fppVendors" placeholder="opsional"></label>
          <datalist id="fppVendors">${vendors.map((v) => `<option value="${esc(v)}">`).join("")}</datalist>
          <label>Keterangan<input name="note" placeholder="opsional"></label>
          <output class="form__preview mono fpp__preview">—</output>
          <button class="btn btn--solid" type="submit">Simpan FPP</button>
          <p class="note fpp__msg" role="status"></p>
        </form>
      </article>
    </div>`;

  const form = $(".fpp__form", root), body = $(".fpp__body", root), chips = $(".fpp__chips", root), search = $(".search", root);
  const total = (r) => (Number(r.qty) || 0) * (Number(r.price) || 0);
  const nextNo = (date) => {
    const ym = date.slice(0, 7).replace("-", "");
    const n = S.rows.filter((r) => (r.no || "").includes("/" + ym + "/")).length + 1;
    return `FPP/${ym}/${String(n).padStart(3, "0")}`;
  };

  function preview() {
    const f = form.elements;
    const t = (Number(f.qty.value) || 0) * (Number(f.price.value) || 0);
    $(".fpp__preview", root).textContent = `${nextNo(f.date.value || ymd(new Date()))} · ${f.cat.value}${t ? " · " + rp(t) : ""}`;
  }

  function draw() {
    const rows = S.rows;
    const by = (c) => rows.filter((r) => r.cat === c);
    $(".fpp__stats", root).innerHTML =
      `<div class="stat stat--ok"><span class="mono">${esc(up("Total FPP"))}</span><b>${rows.length}</b><small>${rows.length ? rp(rows.reduce((s, r) => s + total(r), 0)) + " estimasi" : "belum ada input"}</small></div>` +
      CATS.map((c) => { const l = by(c); return `<div class="stat"><span class="mono">${esc(up(c))}</span><b>${l.length}</b><small>${l.filter((r) => r.status === "Diajukan").length} menunggu · ${esc(rp(l.reduce((s, r) => s + total(r), 0)))}</small></div>`; }).join("");
    chips.innerHTML = ["Semua"].concat(CATS).map((c) => `<button type="button" aria-pressed="${c === S.cat}" data-cat="${esc(c)}">${esc(c)} <b>${c === "Semua" ? rows.length : by(c).length}</b></button>`).join("");
    const q = S.q.toLowerCase();
    const list = rows.filter((r) => (S.cat === "Semua" || r.cat === S.cat) && (!q || [r.no, r.item, r.who, r.vendor, r.note].join(" ").toLowerCase().includes(q)));
    const empty = S.mode === "loading" ? "Memuat data FPP…" : rows.length ? "Tidak ada FPP yang cocok." : "Belum ada FPP. Isi formulir di samping.";
    body.innerHTML = list.map((r) => `<tr>
        <td class="mono">${esc(r.no)}</td>
        <td>${esc(fdate(r.date))}</td>
        <td><span class="tag tag--plain">${esc(r.cat)}</span></td>
        <td>${esc(r.item)}<small class="mono sub">${r.kode ? esc(r.kode) + " · " : ""}${esc(WHO[r.cat] ? WHO[r.cat][0] : "Pemohon")}: ${esc(r.who)}${r.vendor ? " · " + esc(r.vendor) : ""}${r.note ? " · " + esc(r.note) : ""}</small></td>
        <td class="num">${esc(Number(r.qty).toLocaleString("id-ID"))} ${esc(r.unit || "")}</td>
        <td class="num">${r.price ? esc(rp(total(r))) : "—"}</td>
        <td><select class="select fpp__st pill--${TONE[r.status] || "muted"}" data-id="${esc(r.id)}" aria-label="Status ${esc(r.no)}">${STATUS.map((s) => `<option ${s === r.status ? "selected" : ""}>${s}</option>`).join("")}</select></td>
        <td><button class="mini-btn" type="button" data-del="${esc(r.id)}">Hapus</button></td>
      </tr>`).join("") || `<tr><td colspan="8" class="empty">${empty}</td></tr>`;
    $(".fpp__note", root).textContent = `${list.length} dari ${rows.length} FPP ditampilkan · ${S.mode === "live" ? "tersimpan di database bersama" : "mode lokal: tersimpan di browser ini saja"}`;
    preview();
  }

  form.addEventListener("input", (e) => {
    if (e.target.name === "cat") {
      const w = WHO[e.target.value];
      $(".fpp__who span", root).textContent = w[0];
      form.elements.who.placeholder = w[1];
    }
    preview();
  });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = form.elements, msg = $(".fpp__msg", root), btn = $("button[type=submit]", form);
    const row = {
      at: new Date().toISOString(), no: nextNo(f.date.value), date: f.date.value, cat: f.cat.value, who: f.who.value.trim(),
      item: f.barang.value.trim(), qty: Number(f.qty.value) || 0, unit: f.unit.value.trim(), price: Number(f.price.value) || 0,
      vendor: f.vendor.value.trim(), note: f.note.value.trim(), status: "Diajukan", kode: S.pick ? S.pick.id : ""
    };
    if (!row.item || !row.who || !row.date) { msg.textContent = "Lengkapi tanggal, pemohon, dan barang."; return; }
    btn.disabled = true; msg.textContent = "";
    try {
      await window.DUStore.add("fpp", row);
      log(`Input FPP ${row.cat}: ${row.item} (${[row.qty, row.unit].filter(Boolean).join(" ")}) · ${row.no}`);
      toast(`${row.no} tersimpan`);
      ["barang", "qty", "unit", "price", "vendor", "note"].forEach((k) => (f[k].value = ""));
      clearPick(); preview();
    } catch (er) {
      msg.textContent = "Gagal menyimpan. Anda mungkin hanya punya akses lihat.";
    }
    btn.disabled = false;
  });
  /* ---------- Sambungan ke daftar harga satuan material (DUHarga) ---------- */
  const H = window.DUHarga, sug = $(".fpp__sug", root), opts = $(".fpp__opts", root), bIn = form.elements.barang;
  let hits = [], sel = -1;
  const rpS = (n) => "Rp " + Math.round(n).toLocaleString("id-ID");
  function closeSug() { sug.hidden = true; bIn.setAttribute("aria-expanded", "false"); sel = -1; }
  function clearPick() { S.pick = null; opts.hidden = true; opts.innerHTML = ""; }
  function drawSug() {
    sug.innerHTML = hits.map((it, i) => {
      const o = H.options(it)[0];
      return `<li role="option" data-i="${i}" class="${i === sel ? "is-sel" : ""}" aria-selected="${i === sel}"><b>${esc(it.name)}</b><small>${esc(it.id)} · ${esc(it.unit || "—")} · ${o ? esc((o.vendor || "referensi") + " " + rpS(o.price)) : "tanpa harga"}</small></li>`;
    }).join("");
    sug.hidden = !hits.length; bIn.setAttribute("aria-expanded", String(!!hits.length));
  }
  function applyOpt(o) {
    form.elements.price.value = o.price;
    form.elements.vendor.value = o.vendor;
    $$(".fpp__opt", opts).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === o.vendor && +b.dataset.p === o.price)));
    preview();
  }
  function pick(it) {
    S.pick = it; closeSug();
    const f = form.elements;
    if (f.cat.value !== "Material") { f.cat.value = "Material"; form.dispatchEvent(new Event("input")); }
    f.barang.value = it.name; f.unit.value = it.unit || "";
    const list = H.options(it);
    opts.innerHTML = list.length ? `<span class="note mono">${esc(it.id)} · pilih harga:</span>` + list.map((o) =>
      `<button type="button" class="fpp__opt" data-v="${esc(o.vendor)}" data-p="${o.price}" aria-pressed="false">${esc(o.label)} <b>${rpS(o.price)}</b></button>`).join("")
      + (it.q ? `<span class="note">⚠ harga perlu dikonfirmasi ke vendor</span>` : "")
      : `<span class="note">Belum ada harga untuk ${esc(it.id)}. Isi harga manual.</span>`;
    opts.hidden = false;
    if (list.length) applyOpt(list[0]);
    preview();
  }
  if (H) {
    bIn.addEventListener("input", () => {
      if (S.pick && bIn.value !== S.pick.name) clearPick();
      hits = bIn.value.trim().length >= 2 ? H.search(bIn.value, 8) : []; sel = -1; drawSug();
    });
    bIn.addEventListener("keydown", (e) => {
      if (sug.hidden) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + hits.length) % hits.length; drawSug(); }
      else if (e.key === "Enter" && sel >= 0) { e.preventDefault(); pick(hits[sel]); }
      else if (e.key === "Escape") closeSug();
    });
    bIn.addEventListener("blur", () => setTimeout(closeSug, 150));
    sug.addEventListener("mousedown", (e) => { const li = e.target.closest("[data-i]"); if (li) { e.preventDefault(); pick(hits[+li.dataset.i]); } });
    opts.addEventListener("click", (e) => { const b = e.target.closest(".fpp__opt"); if (b) applyOpt({ vendor: b.dataset.v, price: +b.dataset.p }); });
  }
  /* dari tombol "+ FPP" di daftar harga */
  function prefill(it) {
    if (!it) return;
    const tab = document.getElementById("tab-ga-proc");
    if (tab) tab.click();
    pick(it);
    setTimeout(() => { root.scrollIntoView({ behavior: "smooth", block: "start" }); form.elements.qty.focus({ preventScroll: true }); }, 80);
    toast(`${it.name} dimasukkan ke form FPP — isi jumlahnya`);
  }

  chips.addEventListener("click", (e) => { const b = e.target.closest("[data-cat]"); if (b) { S.cat = b.dataset.cat; draw(); } });
  search.addEventListener("input", () => { S.q = search.value.trim(); draw(); });
  body.addEventListener("change", async (e) => {
    const sel = e.target.closest(".fpp__st");
    if (!sel) return;
    const r = S.rows.find((x) => x.id === sel.dataset.id);
    try {
      await window.DUStore.update("fpp", sel.dataset.id, { status: sel.value });
      log(`Status ${r ? r.no : "FPP"} → ${sel.value}${r ? " (" + r.item + ")" : ""}`);
    } catch (er) { toast("Gagal mengubah status."); draw(); }
  });
  body.addEventListener("click", async (e) => {
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
      log(`Menghapus ${r ? r.no + " (" + r.item + ")" : "FPP"}`);
    } catch (er) { toast("Gagal menghapus."); }
  });

  window.DUFpp = { rows: () => S.rows, prefill };
  draw();
  window.DUStore.watch("fpp", (rows, mode) => {
    S.mode = mode === "error" ? "local" : mode;
    if (rows) S.rows = rows;
    draw();
    document.dispatchEvent(new CustomEvent("du:fpp"));
  });
})();
