/* =========================================================
   Menu Tugas — 15 tugas pelaporan Divisi Umum per periode
   (mingguan setiap Sabtu, bulanan tanggal 25). Data awal dari
   "Dashboard Divisi Umum" (assets/js/tugas-data.js); di claude.ai
   status, tautan, lampiran, dan capaian tersimpan di database
   (koleksi "tasks", satu dokumen per periode).
   ========================================================= */
(function () {
  "use strict";

  const T = (window.DU_DATA || {}).tasks;
  const root = document.getElementById("tugasApp");
  if (!T || !root) return;

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const SKIN = document.body.dataset.skin || "blueprint";
  const up = (s) => (SKIN === "blueprint" ? String(s).toUpperCase() : String(s));
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const pd = (iso) => { const a = iso.split("-"); return new Date(+a[0], a[1] - 1, +(a[2] || 1)); };
  const today = new Date(new Date().toDateString());
  const daysTo = (d) => Math.round((d - today) / 864e5);
  const fD = (d, o) => d.toLocaleDateString("id-ID", o);
  const STATUS = ["Belum", "Proses", "Selesai"];
  const MAXF = 20 * 1024 * 1024;
  const size = (b) => (b >= 1048576 ? (b / 1048576).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + " MB" : Math.max(1, Math.round(b / 1024)) + " KB");
  const num = (v) => (v == null || v === "" ? "" : Number(v).toLocaleString("id-ID", { maximumFractionDigits: 2 }));
  const toast = (t) => { const el = $("#toast"); if (!el) return; el.textContent = t; el.classList.add("is-on"); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove("is-on"), 2600); };

  /* ---------- Periode ---------- */
  function periods() {
    const list = [];
    const start = pd(T.source.report && T.source.report.sabtu1 ? T.source.report.sabtu1 : ymd(today));
    const nextSat = new Date(today); nextSat.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7));
    const lastSat = new Date(nextSat); lastSat.setDate(nextSat.getDate() + 14);
    for (let d = new Date(start); d <= lastSat; d.setDate(d.getDate() + 7)) {
      const date = new Date(d);
      list.push({ key: "W:" + ymd(date), type: "W", date, label: "Minggu " + fD(date, { day: "numeric", month: "short" }) });
    }
    const m0 = pd(T.source.report && T.source.report.bulan ? T.source.report.bulan : ymd(today));
    for (let i = 0; i < 3; i++) {
      const m = new Date(m0.getFullYear(), m0.getMonth() + i, 1);
      const due = new Date(m.getFullYear(), m.getMonth(), 25);
      if (i > 0 && due > new Date(today.getFullYear(), today.getMonth() + 2, 1)) break;
      list.push({ key: `M:${m.getFullYear()}-${pad(m.getMonth() + 1)}`, type: "M", date: due, label: "Bulan " + fD(m, { month: "long" }) });
    }
    return list;
  }
  const PERIODS = periods();
  const itemsOf = (p) => T.items.filter((it) => (p.type === "M" ? it.bulanan : it.mingguan || it.harian));

  /* ---------- State ---------- */
  const S = { db: null, assets: null, mode: "local", docs: {}, dbKeys: new Set(), per: null, bidang: "Semua", busy: new Set() };
  const recOf = (key, no) => {
    const d = S.docs[key] || {};
    const r = d[no] || {};
    const val = r.value != null ? r.value : (T.values[key] || {})[no];
    return { status: STATUS.includes(r.status) ? r.status : "Belum", link: r.link || "", att: Array.isArray(r.att) ? r.att : [], value: val };
  };
  const counts = (p, list) => list.reduce((c, it) => (c[recOf(p.key, String(it.no)).status]++, c), { Belum: 0, Proses: 0, Selesai: 0 });
  window.DUTasks = {
    current: () => S.per,
    summary: () => { const p = S.per || PERIODS[0]; const list = itemsOf(p); return { period: p, total: list.length, ...counts(p, list) }; },
    due: () => {
      const out = [];
      PERIODS.forEach((p) => {
        const n = daysTo(p.date);
        if (n < 0 || n > 2) return;
        itemsOf(p).forEach((it) => { if (recOf(p.key, String(it.no)).status !== "Selesai" && !(p.type === "W" && it.harian && !it.mingguan)) out.push({ p, it, n }); });
      });
      return out;
    }
  };
  const announce = () => document.dispatchEvent(new CustomEvent("du:tasks"));

  function pickDefault() {
    let saved = null;
    try { saved = localStorage.getItem("du-tugas-per"); } catch (e) { /* abaikan */ }
    const byKey = PERIODS.find((p) => p.key === saved);
    if (byKey) return byKey;
    const cur = PERIODS.find((p) => p.type === "W" && p.date >= today) || PERIODS[0];
    const has = (p) => Object.keys(S.docs[p.key] || T.records[p.key] || {}).length > 0;
    if (has(cur)) return cur;
    const prev = PERIODS.filter((p) => p.type === "W" && p.date < cur.date && has(p));
    return prev.length ? prev[prev.length - 1] : cur;
  }

  /* ---------- Markup ---------- */
  root.innerHTML = `
    <div class="tg-per" role="group" aria-label="Periode laporan"></div>
    <p class="note tg-src">Sumber: <a href="${esc(T.source.url)}" target="_blank" rel="noopener">${esc(T.source.name)}</a> · capaian dari ${esc(T.source.report.source || "")}<span class="tg-mode"></span></p>
    <div class="stat-row tg-stats"></div>
    <div class="tg-bidang" role="group" aria-label="Filter bidang"></div>
    <div class="tg-list"></div>`;
  const perBar = $(".tg-per", root), stats = $(".tg-stats", root), bidBar = $(".tg-bidang", root), listEl = $(".tg-list", root), modeEl = $(".tg-mode", root);

  function freq(it) {
    if (it.harian) return "Harian · sehabis closing";
    if (it.mingguan && it.bulanan) return "Mingguan (Sabtu) · Bulanan (25)";
    if (it.mingguan) return "Mingguan · Sabtu";
    return "Bulanan · tanggal 25";
  }
  function dueText(p, it) {
    if (p.type === "W" && it.harian) return "Harian, s.d. " + fD(p.date, { weekday: "short", day: "numeric", month: "short" });
    const n = daysTo(p.date);
    const rel = n < 0 ? `lewat ${-n} hari` : n === 0 ? "hari ini" : n === 1 ? "besok" : `${n} hari lagi`;
    return `${fD(p.date, { weekday: "short", day: "numeric", month: "short" })} · ${rel}`;
  }

  function render() {
    const p = S.per;
    // periode
    perBar.innerHTML = PERIODS.map((x) => {
      const lst = itemsOf(x), c = counts(x, lst), n = daysTo(x.date);
      const tag = x.type === "W" && n >= 0 && n < 7 ? "minggu ini" : x.type === "M" && n >= 0 && n < 31 && x.date.getMonth() === today.getMonth() ? "bulan ini" : "";
      return `<button type="button" class="tg-pchip" aria-pressed="${x.key === p.key}" data-per="${esc(x.key)}">
        <b>${esc(x.label)}</b><small>${c.Selesai}/${lst.length} selesai${tag ? " · " + tag : ""}</small></button>`;
    }).join("");
    modeEl.textContent = S.mode === "live" ? " · tersimpan di database bersama" : " · mode lihat (salinan data)";

    const all = itemsOf(p), c = counts(p, all), pct = all.length ? Math.round((c.Selesai / all.length) * 100) : 0;
    stats.innerHTML =
      `<div class="stat stat--ok"><span class="mono">${esc(up("Progres " + p.label.toLowerCase()))}</span><b>${pct}%</b><small>${c.Selesai} dari ${all.length} tugas selesai · tenggat ${esc(fD(p.date, { day: "numeric", month: "short" }))}</small></div>` +
      `<div class="stat stat--info"><span class="mono">${esc(up("Proses"))}</span><b>${c.Proses}</b><small>sedang dikerjakan</small></div>` +
      `<div class="stat stat--warn"><span class="mono">${esc(up("Belum"))}</span><b>${c.Belum}</b><small>${daysTo(p.date) < 0 ? "periode sudah lewat" : "belum dimulai"}</small></div>` +
      `<div class="stat"><span class="mono">${esc(up("Lampiran"))}</span><b>${all.reduce((s, it) => s + recOf(p.key, String(it.no)).att.length, 0)}</b><small>file & tautan bukti</small></div>`;

    // bidang
    bidBar.innerHTML = ["Semua"].concat(T.bidang).map((b) => {
      const lst = b === "Semua" ? all : all.filter((it) => it.bidang.includes(b));
      const cc = counts(p, lst), pp = lst.length ? Math.round((cc.Selesai / lst.length) * 100) : 0;
      return `<button type="button" class="tg-bcard" aria-pressed="${b === S.bidang}" data-b="${esc(b)}" ${lst.length ? "" : "disabled"}>
        <span><b>${esc(b)}</b><small>${lst.length ? `${cc.Selesai}/${lst.length} selesai` : "tidak ada tugas"}</small></span>
        <i class="tg-bar"><i style="width:${pp}%"></i></i></button>`;
    }).join("");

    // daftar
    const rows = S.bidang === "Semua" ? all : all.filter((it) => it.bidang.includes(S.bidang));
    const canWrite = S.mode === "live";
    listEl.innerHTML = rows.map((it, k) => {
      const r = recOf(p.key, String(it.no));
      const busy = S.busy.has(p.key + it.no);
      return `<article class="tg-card tg-card--${r.status.toLowerCase()}" style="--d:${k}" data-no="${it.no}">
        <div class="tg-card__main">
          <span class="tg-no mono">${pad(it.no)}</span>
          <div class="tg-card__txt">
            <h4>${esc(it.name)}</h4>
            <p>${esc(it.desc)}</p>
            <div class="tg-meta">${it.bidang.map((b) => `<span class="tag tag--plain">${esc(b)}</span>`).join("")}<span class="note">${esc(freq(it))}</span><span class="note">Tenggat: ${esc(dueText(p, it))}</span></div>
          </div>
          <div class="tg-val">
            <span class="mono">${esc(up("Capaian"))}</span>
            ${canWrite ? `<input type="number" step="any" inputmode="decimal" class="tg-valin" value="${r.value == null ? "" : esc(r.value)}" aria-label="Capaian ${esc(it.name)}" placeholder="—">` : `<b>${r.value == null ? "—" : esc(num(r.value))}</b>`}
            <small>${esc(it.unit)}${it.mode ? " · " + esc(it.mode.toLowerCase()) : ""}</small>
          </div>
          <div class="tg-seg" role="group" aria-label="Status ${esc(it.name)}">
            ${STATUS.map((s) => `<button type="button" data-st="${s}" aria-pressed="${r.status === s}" ${canWrite && !busy ? "" : "disabled"}>${s}</button>`).join("")}
          </div>
        </div>
        <div class="tg-att">
          ${r.link ? `<a class="tg-chip" href="${esc(r.link)}" target="_blank" rel="noopener">🔗 ${esc(r.link.replace(/^https?:\/\//, "").slice(0, 48))}</a>` : ""}
          ${r.att.filter((a) => a.type !== "link" || a.url !== r.link).map((a, i) => a.type === "link"
            ? `<a class="tg-chip" href="${esc(a.url)}" target="_blank" rel="noopener">🔗 ${esc(a.name.replace(/^https?:\/\//, "").slice(0, 48))}</a>`
            : a.assetId ? `<a class="tg-chip" href="/_blob/${esc(a.assetId)}" target="_blank" rel="noopener"><span class="doclib__ico" aria-hidden="true">${esc((a.ext || "pdf").toUpperCase().slice(0, 3))}</span>${esc(a.name)} <small>${a.size ? size(a.size) : ""}</small></a>`
              : `<span class="tg-chip tg-chip--off" title="File ada di dashboard sumber">📎 ${esc(a.name)}</span>`).join("")}
          ${canWrite ? `<button type="button" class="tg-add" data-act="link">+ Tautan</button>${S.assets ? `<label class="tg-add">+ File<input type="file" accept="application/pdf,image/png,image/jpeg,.pdf,.png,.jpg,.jpeg" hidden data-act="file"></label>` : ""}` : ""}
          ${!r.link && !r.att.length && !canWrite ? `<span class="note">Belum ada tautan atau lampiran.</span>` : ""}
        </div>
      </article>`;
    }).join("") || `<p class="note">Tidak ada tugas di periode ini.</p>`;
    announce();
  }

  /* ---------- Tulis ke database ---------- */
  async function write(no, patch) {
    const p = S.per, key = p.key, id = key + no;
    if (!S.db || S.busy.has(id)) return;
    S.busy.add(id);
    const cur = recOf(key, String(no));
    const next = { status: cur.status, link: cur.link, att: cur.att, ...patch };
    if (cur.value != null && next.value === undefined) next.value = cur.value;
    try {
      const ref = S.db.collection("tasks").doc(key);
      if (S.dbKeys.has(key)) await ref.update({ [no]: next });
      else await ref.set({ ...(S.docs[key] || {}), [no]: next }); // periode baru: tulis sekaligus salinan data periode itu
    } catch (e) {
      toast(e && e.code === "invalid_argument" ? "Gagal menyimpan. Muat ulang halaman." : "Gagal menyimpan. Anda mungkin hanya punya akses lihat.");
    }
    S.busy.delete(id);
    render();
  }

  root.addEventListener("click", (e) => {
    const pb = e.target.closest("[data-per]");
    if (pb) { S.per = PERIODS.find((x) => x.key === pb.dataset.per); try { localStorage.setItem("du-tugas-per", S.per.key); } catch (er) { /* abaikan */ } render(); return; }
    const bb = e.target.closest("[data-b]");
    if (bb) { S.bidang = bb.dataset.b; render(); return; }
    const card = e.target.closest(".tg-card");
    if (!card) return;
    const no = card.dataset.no;
    const sb = e.target.closest("[data-st]");
    if (sb) { write(no, { status: sb.dataset.st }); toast(`Tugas ${pad(no)} → ${sb.dataset.st}`); return; }
    if (e.target.closest('[data-act="link"]')) {
      const box = document.createElement("form");
      box.className = "tg-linkform";
      box.innerHTML = `<input type="url" placeholder="https://…" aria-label="Tautan bukti" required><button class="mini-btn" type="submit">Simpan</button><button class="mini-btn" type="button" data-cancel>Batal</button>`;
      $(".tg-att", card).appendChild(box);
      $("input", box).focus();
      box.addEventListener("submit", (ev) => {
        ev.preventDefault();
        const url = $("input", box).value.trim();
        if (!/^https:\/\//i.test(url)) { toast("Gunakan tautan yang diawali https://"); return; }
        const r = recOf(S.per.key, no);
        write(no, r.link ? { att: r.att.concat({ type: "link", name: url, url }) } : { link: url });
      });
      $("[data-cancel]", box).addEventListener("click", () => box.remove());
    }
  });
  root.addEventListener("change", async (e) => {
    const card = e.target.closest(".tg-card");
    if (!card) return;
    const no = card.dataset.no;
    if (e.target.classList.contains("tg-valin")) {
      const v = e.target.value === "" ? null : Number(e.target.value);
      if (v !== null && isNaN(v)) return;
      write(no, { value: v });
      return;
    }
    if (e.target.dataset.act === "file" && S.assets) {
      const f = e.target.files[0];
      e.target.value = "";
      if (!f) return;
      if (f.size > MAXF) { toast("Ukuran file melebihi 20 MB."); return; }
      const type = /\.pdf$/i.test(f.name) ? "application/pdf" : /\.png$/i.test(f.name) ? "image/png" : /\.jpe?g$/i.test(f.name) ? "image/jpeg" : f.type;
      toast(`Mengunggah ${f.name}…`);
      try {
        const res = await S.assets.upload(f, { type });
        const r = recOf(S.per.key, no);
        await write(no, { att: r.att.concat({ type: "file", name: f.name, ext: (f.name.split(".").pop() || "").toLowerCase(), size: res.sizeBytes, assetId: res.id }) });
        toast(`${f.name} terlampir`);
      } catch (er) {
        toast(er && er.code === "too_large" ? "Ukuran file melebihi 20 MB." : er && er.code === "unsupported_type" ? "Jenis file tidak didukung (PDF, PNG, JPG)." : "Gagal mengunggah file.");
      }
    }
  });

  /* ---------- Sambungan ---------- */
  async function boot() {
    S.docs = JSON.parse(JSON.stringify(T.records));
    S.per = pickDefault();
    render();
    if (!window.claude || typeof window.claude.use !== "function") return;
    const [db, assets] = await Promise.all([claude.use("db"), claude.use("assets")]);
    if (!db) return;
    S.db = db; S.assets = assets;
    db.collection("tasks").limit(200).onSnapshot((snap) => {
      const docs = JSON.parse(JSON.stringify(T.records)); // salinan sebagai dasar; data database menimpanya
      S.dbKeys = new Set();
      snap.docs.forEach((d) => { if (d.exists) { docs[d.id] = d.data(); S.dbKeys.add(d.id); } });
      S.docs = docs;
      S.mode = "live";
      if (!S.per) S.per = pickDefault();
      render();
    }, () => { S.mode = "local"; render(); });
  }
  boot();
})();
