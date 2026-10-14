/* =========================================================
   Unggah data harga material terbaru (.xlsx, format sama dengan
   DATABASE_VENDOR_by_ROEMANTARA.xlsx).
   - File dibaca di browser (SheetJS, dimuat saat dibutuhkan).
   - Pratinjau perubahan harga ditampilkan sebelum diterapkan.
   - Di claude.ai: hasil olahan + file asli disimpan sebagai aset JSON,
     penunjuknya di database (harga/current, riwayat di hargaVersions),
     sehingga semua penampil otomatis memakai versi terbaru.
   ========================================================= */
(function () {
  "use strict";

  const HG = window.DUHarga;
  const root = document.getElementById("hargaApp");
  if (!HG || !root) return;
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const rp = (n) => (n == null ? "—" : "Rp " + Math.round(n).toLocaleString("id-ID"));
  const toast = (t) => { const el = $("#toast"); if (!el) return; el.textContent = t; el.classList.add("is-on"); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove("is-on"), 3400); };
  const SHEETJS = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
  const S = { db: null, assets: null, user: null, uid: null, mode: "local", pending: null, current: null };

  /* ---------- Pembaca workbook (port dari skrip konversi awal) ---------- */
  function loadSheetJS() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    return new Promise((ok, no) => {
      const sc = document.createElement("script");
      sc.src = SHEETJS; sc.onload = () => (window.XLSX ? ok(window.XLSX) : no(new Error("lib")));
      sc.onerror = () => no(new Error("Pustaka pembaca Excel gagal dimuat. Periksa koneksi lalu coba lagi."));
      document.head.appendChild(sc);
    });
  }
  const clean = (v) => String(v == null ? "" : v).replace(/\s+/g, " ").trim();
  const title = (s) => clean(s).toLowerCase().replace(/(^|[\s(/-])([a-z])/g, (m, a, b) => a + b.toUpperCase());
  const ALIAS = { YOSEPT: "Yoseph" };
  const vname = (v) => ALIAS[clean(v)] || title(v).replace(/^Tb /, "TB ");
  const pad = (n) => String(n).padStart(2, "0");
  const dstr = (v) => (v instanceof Date ? `${pad(v.getDate())}/${pad(v.getMonth() + 1)}/${v.getFullYear()}` : clean(v));
  const num = (v) => (typeof v === "number" && isFinite(v) ? Math.round(v) : null);

  function rowsOf(XLSX, sh) {
    const range = XLSX.utils.decode_range(sh["!ref"] || "A1");
    return XLSX.utils.sheet_to_json(sh, { header: 1, raw: true, defval: null, blankrows: true, range: { s: { r: 0, c: 0 }, e: range.e } });
  }
  function parse(XLSX, wb, fileName) {
    const prev = HG.data();
    const lh = wb.Sheets["List Harga"];
    if (!lh) throw new Error('Sheet "List Harga" tidak ditemukan. Pastikan format file sama dengan file asli.');
    const R = rowsOf(XLSX, lh);
    const hi = R.findIndex((r) => r && /material/i.test(clean(r[3])) && clean(r[8]));
    if (hi < 0) throw new Error('Baris judul vendor di sheet "List Harga" tidak ditemukan (kolom D "MATERIAL …", vendor mulai kolom I).');
    const hdr = R[hi];
    let sec = title(hdr[3]);
    const ref = [];
    for (let i = hi + 1; i < R.length; i++) {
      const r = R[i] || [];
      const code = clean(r[2]), name = clean(r[3]);
      if (!code || !name) continue;
      if (r[4] == null && r[5] == null) { sec = title(name); continue; }
      const it = { c: code, n: name, u: clean(r[4]), s: sec };
      const p = num(r[5]); if (p != null) it.p = p;
      const v = {};
      for (let j = 8; j < hdr.length; j++) { const vp = num(r[j]); if (vp != null && clean(hdr[j])) v[vname(hdr[j])] = vp; }
      if (Object.keys(v).length) it.v = v;
      ref.push(it);
    }
    if (!ref.length) throw new Error('Tidak ada baris material di sheet "List Harga".');

    const setia = { ...prev.setia, items: [] };
    const sa = wb.Sheets["Harga Setia Abadi"];
    if (sa) {
      const A = rowsOf(XLSX, sa);
      const t0 = clean((A[0] || [])[0]);
      if (t0.includes(" - ")) setia.vendor = title(t0.split(" - ").pop()).replace(/^Cv /, "CV ");
      const rec = /(\d{2}\/\d{2}\/\d{4})/.exec(clean((A[2] || [])[0])); if (rec) setia.received = rec[1];
      const h = A.findIndex((r) => r && clean(r[0]).toLowerCase() === "no");
      const notes = [];
      for (let i = h + 1; h >= 0 && i < A.length; i++) {
        const r = A[i] || [];
        if (r[9] && r[10] && notes.length < 12) notes.push([clean(r[9]), clean(r[10])]);
        if (r[0] == null && r[2] == null) continue;
        const it = { c: "SA" + String(parseInt(r[0], 10) || i).padStart(3, "0"), k: clean(r[1]), n: clean(dstr(r[2])), u: clean(r[5]).replace(/^-$/, ""), t: dstr(r[6]) };
        if (clean(r[3])) it.var = clean(r[3]);
        const p = num(r[4]); if (p != null) it.p = p;
        const ket = clean(r[7]); if (ket) it.ket = ket;
        if (p == null || /mohon cek|kurang jelas|tidak terbaca|konfirmasi/i.test(ket)) it.q = 1;
        setia.items.push(it);
      }
      if (notes.length) setia.notes = notes;
    } else setia.items = prev.setia.items;

    const subkon = [];
    const s1 = wb.Sheets["Sheet1"];
    if (s1) {
      const B = rowsOf(XLSX, s1);
      const h = B.findIndex((r) => r && /jenis subkon/i.test(clean(r[1])));
      for (let i = h + 1; h >= 0 && i < B.length; i++) { const r = B[i] || []; if (r[1] || r[2]) subkon.push({ jenis: clean(r[1]) || null, nama: clean(r[2]) || null, kerja: clean(r[3]) || null, harga: num(r[4]) }); }
    }
    return { source: fileName, copied: new Date().toISOString().slice(0, 10), ref, setia, subkon: subkon.length ? subkon : prev.subkon };
  }

  /* ---------- Perbandingan dengan data yang sedang dipakai ---------- */
  function diff(prev, next) {
    const key = (d) => {
      const m = new Map();
      const seen = {}, uid = (c) => { seen[c] = (seen[c] || 0) + 1; return c + "~" + seen[c]; };
      d.ref.forEach((r) => { const u = uid(r.c); m.set(u + "|ref", { n: r.n, p: r.p }); Object.entries(r.v || {}).forEach(([v, p]) => m.set(u + "|" + v, { n: r.n, p, v })); });
      d.setia.items.forEach((r) => m.set(uid(r.c) + "|sa", { n: r.n + (r.var ? " " + r.var : ""), p: r.p, v: d.setia.vendor }));
      return m;
    };
    const a = key(prev), b = key(next), changed = [], added = [], removed = [];
    b.forEach((x, k) => { const o = a.get(k); if (!o) added.push(x); else if (o.p !== x.p) changed.push({ ...x, old: o.p }); });
    a.forEach((x, k) => { if (!b.has(k)) removed.push(x); });
    return { changed, added, removed };
  }

  /* ---------- UI ---------- */
  function slot() {
    const el = $(".hg-up-slot", root);
    if (!el) return;
    const canWrite = S.mode === "local" || !!S.assets;
    el.innerHTML = canWrite
      ? `<label class="btn btn--ghost hg-up">⤒ Unggah data terbaru<input type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden></label>`
      : "";
    const inp = $("input[type=file]", el);
    if (inp) inp.addEventListener("change", () => { const f = inp.files[0]; inp.value = ""; if (f) read(f); });
    if (S.pending) showPreview();
  }
  async function read(file) {
    if (!/\.xlsx$/i.test(file.name)) { toast("Pilih file Excel .xlsx"); return; }
    if (file.size > 15 * 1024 * 1024) { toast("Ukuran file melebihi 15 MB."); return; }
    toast(`Membaca ${file.name}…`);
    try {
      const XLSX = await loadSheetJS();
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: true });
      const data = parse(XLSX, wb, file.name);
      S.pending = { data, buf, name: file.name, d: diff(HG.data(), data) };
      showPreview();
    } catch (er) {
      S.pending = null;
      showPreview(er && er.message ? er.message : "File tidak bisa dibaca.");
    }
  }
  function showPreview(err) {
    const box = $(".hg-preview", root);
    if (!box) return;
    if (err) { box.hidden = false; box.innerHTML = `<p class="hg-pv__err">⚠ ${esc(err)}</p><button type="button" class="mini-btn" data-pv="cancel">Tutup</button>`; return; }
    const P = S.pending;
    if (!P) { box.hidden = true; box.innerHTML = ""; return; }
    const { changed, added, removed } = P.d;
    const sample = changed.slice(0, 8);
    box.hidden = false;
    box.innerHTML = `
      <h4>Pratinjau data baru · ${esc(P.name)}</h4>
      <div class="hg-pv__stats">
        <span><b>${P.data.ref.length.toLocaleString("id-ID")}</b> material</span>
        <span><b>${P.data.setia.items.length}</b> item ${esc(P.data.setia.vendor)}</span>
        <span class="is-chg"><b>${changed.length}</b> harga berubah</span>
        <span class="is-add"><b>${added.length}</b> harga baru</span>
        <span class="is-del"><b>${removed.length}</b> hilang</span>
      </div>
      ${removed.length + changed.filter((c) => c.p == null).length > 15 ? `<p class="hg-pv__err">⚠ Banyak harga terbaca kosong. Jika harga di file memakai rumus, buka lalu simpan ulang file di Microsoft Excel/Google Sheets sebelum diunggah agar nilai rumusnya ikut tersimpan.</p>` : ""}
      ${sample.length ? `<ul class="hg-pv__list">${sample.map((c) => `<li>${esc(c.n)}${c.v ? ` <small>· ${esc(c.v)}</small>` : " <small>· referensi</small>"}<span>${rp(c.old)} → <b>${rp(c.p)}</b></span></li>`).join("")}${changed.length > sample.length ? `<li class="note">… dan ${changed.length - sample.length} perubahan lain</li>` : ""}</ul>` : `<p class="note">Tidak ada perubahan harga dibanding data yang sedang dipakai.</p>`}
      <div class="hg-pv__act">
        <button type="button" class="btn btn--solid" data-pv="apply">${S.mode === "live" ? "Terapkan untuk semua pengguna" : "Terapkan (sementara di browser ini)"}</button>
        <button type="button" class="mini-btn" data-pv="cancel">Batal</button>
      </div>`;
  }
  const toB64 = (buf) => { const u = new Uint8Array(buf); let s = ""; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };

  async function apply() {
    const P = S.pending;
    if (!P) return;
    const btn = $('[data-pv="apply"]', root);
    if (btn) { btn.disabled = true; btn.textContent = "Menyimpan…"; }
    const xlsx = toB64(P.buf);
    const counts = { ref: P.data.ref.length, sa: P.data.setia.items.length, changed: P.d.changed.length, added: P.d.added.length, removed: P.d.removed.length };
    try {
      if (S.mode === "live") {
        const blob = new Blob([JSON.stringify({ v: 1, name: P.name, data: P.data, xlsx })], { type: "application/json" });
        const res = await S.assets.upload(blob, { type: "application/json" });
        const doc = { assetId: res.id, name: P.name, at: new Date().toISOString(), by: S.uid || "", counts, prev: S.current ? S.current.assetId : "" };
        await S.db.collection("harga").doc("current").set(doc);
        await S.db.collection("hargaVersions").add(doc);
        if (window.DULog) window.DULog.add("GA", `Mengunggah data harga material terbaru: ${P.name} (${counts.changed} harga berubah, ${counts.added} baru)`);
      } else {
        HG.load(P.data, { name: P.name, at: new Date().toISOString(), by: "", xlsx, live: true });
      }
      S.pending = null;
      toast("Data harga material diperbarui");
      showPreview();
    } catch (er) {
      if (btn) { btn.disabled = false; btn.textContent = "Coba lagi"; }
      toast(er && er.code === "too_large" ? "File terlalu besar untuk disimpan." : er && er.code === "not_granted" ? "Akun ini tidak punya izin mengunggah." : "Gagal menyimpan data baru.");
    }
  }
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-pv]");
    if (!b) return;
    if (b.dataset.pv === "apply") apply();
    else { S.pending = null; showPreview(); }
  });
  document.addEventListener("du:harga-shell", slot);

  /* ---------- Versi terbaru dari database ---------- */
  async function useVersion(doc) {
    if (!doc || !doc.assetId || (S.current && S.current.assetId === doc.assetId)) return;
    try {
      const res = await fetch("/_blob/" + doc.assetId);
      if (!res.ok) throw new Error(String(res.status));
      const j = await res.json();
      if (!j || !j.data || !Array.isArray(j.data.ref)) throw new Error("format");
      S.current = doc;
      let by = "";
      if (doc.by && S.user) { try { const ps = await S.user.profiles([doc.by]); by = (ps[doc.by] && ps[doc.by].name) || ""; } catch (e) { by = ""; } }
      HG.load(j.data, { name: j.name || doc.name, at: doc.at, by, xlsx: j.xlsx || null, live: true });
    } catch (e) {
      toast("Versi harga terbaru gagal dimuat; memakai data bawaan.");
    }
  }
  async function boot() {
    slot();
    if (!window.claude || typeof window.claude.use !== "function") return;
    const [db, assets, user] = await Promise.all([claude.use("db"), claude.use("assets"), claude.use("user")]);
    if (!db) { S.mode = "view"; slot(); return; }
    S.db = db; S.assets = assets; S.user = user; S.mode = assets ? "live" : "view";
    if (user) { try { S.uid = await user.id(); } catch (e) { S.uid = null; } }
    slot();
    db.collection("harga").doc("current").onSnapshot((snap) => { if (snap && snap.exists) useVersion(snap.data()); }, () => {});
  }
  boot();
})();
