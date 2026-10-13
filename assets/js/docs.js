/* =========================================================
   Lampiran PDF (Procurement, Admin & Legal)
   File disimpan di penyimpanan artifact (assets), daftarnya di database
   artifact (db, koleksi "files"). Hanya aktif saat halaman dibuka sebagai
   artifact di claude.ai; di salinan lokal tampil pemberitahuan.
   ========================================================= */
(function () {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const SKIN = document.body.dataset.skin || "blueprint";
  const up = (s) => (SKIN === "blueprint" ? String(s).toUpperCase() : String(s));
  const MAX = 20 * 1024 * 1024;
  const size = (b) => (b >= 1048576 ? (b / 1048576).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + " MB" : Math.max(1, Math.round(b / 1024)) + " KB");
  const when = (iso) => { const d = new Date(iso); return isNaN(d) ? "—" : d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) + ", " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }); };
  const ERR = {
    too_large: "Ukuran file melebihi 20 MB.",
    unsupported_type: "File bukan PDF yang valid.",
    quota_or_state: "Kuota penyimpanan penuh. Hapus file yang tidak dipakai lalu coba lagi.",
    rate_limited: "Terlalu cepat. Tunggu sebentar lalu coba lagi.",
    upstream_auth: "Sesi berakhir. Muat ulang halaman lalu coba lagi.",
    not_granted: "Akun ini tidak punya izin mengunggah.",
    quota_exceeded: "Database penuh. Hapus beberapa data lalu coba lagi."
  };
  const errMsg = (e) => ERR[e && e.code] || "Gagal menyimpan. Coba lagi.";
  const AREA = { procurement: "GA", admin: "Admin", legal: "Legal" };
  const log = (area, text) => { if (window.DULog) window.DULog.add(AREA[area] || area, text); };

  const S = { db: null, assets: null, user: null, uid: null, files: [], ready: false, mode: "loading" };
  window.DUDocs = {
    count: (area) => S.files.filter((f) => f.area === area).length,
    latest: (area, n) => S.files.filter((f) => f.area === area).slice(0, n),
    byKind: (area) => S.files.filter((f) => f.area === area).reduce((m, f) => ((m[f.jenis] = (m[f.jenis] || 0) + 1), m), {}),
    url: (f) => "/_blob/" + f.assetId,
    ready: () => S.ready
  };
  const announce = () => document.dispatchEvent(new CustomEvent("du:docs"));

  function toast(t) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = t;
    el.classList.add("is-on");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("is-on"), 2800);
  }

  /* ---------- Satu perpustakaan per wadah .doclib ---------- */
  const libs = $$(".doclib").map((root) => {
    const area = root.dataset.area;
    const kinds = root.dataset.kinds.split("|");
    const label = root.dataset.label || "dokumen";
    root.innerHTML = `
      <div class="stat-row stat-row--3 doclib__stats"></div>
      <article class="panel panel--wide">
        <div class="panel__head">
          <h3 class="panel__title mono">${esc(up("Lampiran PDF " + label))}</h3>
          <input class="search" type="search" placeholder="Cari nama file…" aria-label="Cari file ${esc(label)}">
        </div>
        <div class="doclib__drop" hidden>
          <label class="doclib__zone">
            <input type="file" accept="application/pdf,.pdf" multiple hidden>
            <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M28 6H14a4 4 0 0 0-4 4v28a4 4 0 0 0 4 4h20a4 4 0 0 0 4-4V16z"/><path d="M28 6v10h10"/><path d="M24 34V22"/><path d="m19 27 5-5 5 5"/></svg>
            <span><b>Pilih atau tarik file PDF ke sini</b><small>Bisa beberapa file sekaligus · maks. 20 MB per file</small></span>
          </label>
          <label class="doclib__kind">Jenis dokumen
            <select class="select">${kinds.map((k) => `<option>${esc(k)}</option>`).join("")}</select>
          </label>
        </div>
        <ul class="doclib__queue" aria-live="polite"></ul>
        <p class="doclib__notice note" hidden></p>
        <div class="chips chips--wrap doclib__chips" role="group" aria-label="Filter jenis dokumen"></div>
        <div class="table-wrap"><table class="table">
          <thead><tr><th>Nama File</th><th>Jenis</th><th class="num">Ukuran</th><th>Diunggah</th><th>Oleh</th><th></th></tr></thead>
          <tbody></tbody>
        </table></div>
      </article>`;
    const L = {
      area, kinds, label, root, filter: "Semua",
      stats: $(".doclib__stats", root), drop: $(".doclib__drop", root), input: $("input[type=file]", root),
      kind: $(".doclib__kind select", root), queue: $(".doclib__queue", root), notice: $(".doclib__notice", root),
      chips: $(".doclib__chips", root), body: $("tbody", root), search: $(".search", root), zone: $(".doclib__zone", root)
    };
    L.search.addEventListener("input", () => draw(L));
    L.chips.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      L.filter = b.dataset.k;
      draw(L);
    });
    L.input.addEventListener("change", () => { uploadAll(L, Array.from(L.input.files)); L.input.value = ""; });
    ["dragenter", "dragover"].forEach((ev) => L.zone.addEventListener(ev, (e) => { e.preventDefault(); L.zone.classList.add("is-over"); }));
    ["dragleave", "drop"].forEach((ev) => L.zone.addEventListener(ev, () => L.zone.classList.remove("is-over")));
    L.zone.addEventListener("drop", (e) => { e.preventDefault(); uploadAll(L, Array.from(e.dataTransfer.files || [])); });
    L.body.addEventListener("click", (e) => {
      const b = e.target.closest("[data-del]");
      if (!b) return;
      if (b.dataset.armed !== "1") {
        b.dataset.armed = "1";
        b.textContent = "Yakin hapus?";
        b.classList.add("is-armed");
        setTimeout(() => { if (b.isConnected) { b.dataset.armed = ""; b.textContent = "Hapus"; b.classList.remove("is-armed"); } }, 4000);
        return;
      }
      remove(b.dataset.del);
    });
    return L;
  });
  if (!libs.length) return;

  function setNotice(L, text) { L.notice.hidden = !text; L.notice.textContent = text || ""; }

  async function draw(L) {
    const mine = S.files.filter((f) => f.area === L.area);
    const total = mine.reduce((s, f) => s + (f.size || 0), 0);
    const kinds = window.DUDocs.byKind(L.area);
    const last = mine[0];
    const top = Object.entries(kinds).sort((a, b) => b[1] - a[1])[0];
    L.stats.innerHTML =
      `<div class="stat stat--ok"><span class="mono">${esc(up("Total file PDF"))}</span><b>${mine.length}</b><small>${S.mode === "live" ? "tersimpan di arsip" : "—"}</small></div>` +
      `<div class="stat"><span class="mono">${esc(up("Total ukuran"))}</span><b>${mine.length ? size(total) : "0 KB"}</b><small>${top ? `terbanyak: ${esc(top[0])} (${top[1]})` : "belum ada file"}</small></div>` +
      `<div class="stat"><span class="mono">${esc(up("Terakhir diunggah"))}</span><b class="stat__sm">${last ? esc(when(last.uploadedAt)) : "—"}</b><small>${last ? esc(last.name) : "belum ada file"}</small></div>`;

    const list = ["Semua"].concat(L.kinds.filter((k) => kinds[k]));
    if (!list.includes(L.filter)) L.filter = "Semua";
    L.chips.innerHTML = list.map((k) => `<button type="button" aria-pressed="${k === L.filter}" data-k="${esc(k)}">${esc(k)} <b>${k === "Semua" ? mine.length : kinds[k]}</b></button>`).join("");

    const q = L.search.value.trim().toLowerCase();
    const rows = mine.filter((f) => (L.filter === "Semua" || f.jenis === L.filter) && (!q || f.name.toLowerCase().includes(q)));
    let names = {};
    if (S.user && rows.length) {
      try { names = await S.user.profiles([...new Set(rows.map((f) => f.by).filter(Boolean))]); } catch (e) { names = {}; }
    }
    const empty = S.mode === "local"
      ? "Lampiran PDF hanya aktif saat webapp dibuka di claude.ai."
      : S.mode === "loading" ? "Memuat daftar file…" : mine.length ? "Tidak ada file yang cocok." : "Belum ada PDF. Unggah file pertama di atas.";
    L.body.innerHTML = rows.map((f) => `<tr>
        <td><a class="doclib__file" href="${esc(window.DUDocs.url(f))}" target="_blank" rel="noopener"><span class="doclib__ico" aria-hidden="true">PDF</span>${esc(f.name)}</a></td>
        <td><span class="tag tag--plain">${esc(f.jenis)}</span></td>
        <td class="num">${size(f.size || 0)}</td>
        <td>${esc(when(f.uploadedAt))}</td>
        <td>${f.by ? esc((names[f.by] && names[f.by].name) || "Anggota tim") : "—"}</td>
        <td>${S.assets ? `<button class="mini-btn" type="button" data-del="${esc(f.id)}">Hapus</button>` : ""}</td>
      </tr>`).join("") || `<tr><td colspan="6" class="empty">${empty}</td></tr>`;
  }
  const drawAll = () => { libs.forEach(draw); announce(); };

  async function uploadAll(L, files) {
    if (!S.assets || !S.db) return;
    const kind = L.kind.value;
    for (const file of files) {
      const li = document.createElement("li");
      li.innerHTML = `<span class="doclib__ico" aria-hidden="true">PDF</span><span class="q-name">${esc(file.name)}</span><span class="q-state">Mengunggah…</span><i class="q-bar"></i>`;
      L.queue.prepend(li);
      const state = $(".q-state", li);
      const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
      if (!isPdf) { li.classList.add("is-err"); state.textContent = "Bukan PDF, dilewati"; continue; }
      if (file.size > MAX) { li.classList.add("is-err"); state.textContent = "Lebih dari 20 MB"; continue; }
      try {
        const res = await S.assets.upload(file, { type: "application/pdf" });
        await S.db.collection("files").add({ area: L.area, jenis: kind, name: file.name, size: res.sizeBytes, assetId: res.id, uploadedAt: new Date().toISOString(), by: S.uid || "" });
        li.classList.add("is-ok");
        state.textContent = "Tersimpan";
        log(L.area, `Mengunggah PDF ${L.label} (${kind}): ${file.name}`);
      } catch (e) {
        li.classList.add("is-err");
        state.textContent = errMsg(e);
      }
      setTimeout(() => li.remove(), 6000);
    }
  }

  async function remove(id) {
    const f = S.files.find((x) => x.id === id);
    if (!f) return;
    try {
      await S.db.collection("files").doc(id).delete();
      if (f.assetId && S.assets) await S.assets.delete(f.assetId).catch(() => {});
      toast(`${f.name} dihapus`);
      log(f.area, `Menghapus PDF (${f.jenis}): ${f.name}`);
    } catch (e) {
      toast(errMsg(e));
    }
  }

  /* ---------- Sambungan ke penyimpanan artifact ---------- */
  async function boot() {
    if (!window.claude || typeof window.claude.use !== "function") {
      S.mode = "local";
      libs.forEach((L) => setNotice(L, "Mode lokal: unggah dan arsip PDF hanya berfungsi di versi claude.ai."));
      drawAll();
      return;
    }
    libs.forEach(draw);
    const [db, assets, user] = await Promise.all([claude.use("db"), claude.use("assets"), claude.use("user")]);
    S.db = db; S.assets = assets; S.user = user;
    if (!db) {
      S.mode = "local";
      libs.forEach((L) => setNotice(L, "Arsip PDF tidak tersedia di tampilan ini. Masuk ke claude.ai untuk melihatnya."));
      drawAll();
      return;
    }
    if (user) { try { S.uid = await user.id(); } catch (e) { S.uid = null; } }
    libs.forEach((L) => {
      L.drop.hidden = !assets;
      setNotice(L, assets ? "" : "Anda bisa melihat dan membuka file. Untuk mengunggah atau menghapus, minta akses edit ke pemilik webapp.");
    });
    db.collection("files").orderBy("uploadedAt", "desc").limit(1000).onSnapshot((snap) => {
      S.files = snap.docs.filter((d) => d.exists).map((d) => ({ id: d.id, ...d.data() }));
      S.mode = "live"; S.ready = true;
      drawAll();
    }, () => {
      S.mode = "local";
      libs.forEach((L) => setNotice(L, "Koneksi ke arsip terputus. Muat ulang halaman."));
      drawAll();
    });
  }
  boot();
})();
