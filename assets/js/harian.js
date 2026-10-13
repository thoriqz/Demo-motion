/* =========================================================
   Tugas → Tugas Harian: catatan kegiatan harian yang diinput manual,
   masing-masing terhubung ke salah satu tugas umum (15 tugas pelaporan).
   Tersimpan di koleksi "daily".
   ========================================================= */
(function () {
  "use strict";

  const T = (window.DU_DATA || {}).tasks;
  const root = document.getElementById("harianApp");
  if (!T || !root || !window.DUStore) return;

  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const SKIN = document.body.dataset.skin || "blueprint";
  const up = (s) => (SKIN === "blueprint" ? String(s).toUpperCase() : String(s));
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const pd = (s) => new Date(s + "T00:00:00");
  const fD = (s, o) => pd(s).toLocaleDateString("id-ID", o);
  const hm = (iso) => { const d = new Date(iso); return isNaN(d) ? "" : d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }); };
  const toast = (t) => { const el = $("#toast"); if (!el) return; el.textContent = t; el.classList.add("is-on"); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove("is-on"), 2600); };
  const STATUS = ["Belum", "Proses", "Selesai"];
  const item = (no) => T.items.find((it) => String(it.no) === String(no));
  const areaOf = (it) => (it ? it.bidang[0] : "Umum");
  const log = (it, text) => window.DULog && window.DULog.add(areaOf(it), text);

  const S = { rows: [], mode: "loading", day: ymd(new Date()), task: "" };

  /* Untuk tautan balik dari kartu tugas umum */
  window.DUHarian = {
    count: (no, from, to) => S.rows.filter((r) => String(r.no) === String(no) && r.date >= from && r.date <= to).length,
    show: (no) => { S.task = String(no); draw(); const t = document.getElementById("tab-tg-daily"); if (t) t.click(); root.scrollIntoView({ behavior: "smooth", block: "start" }); }
  };

  const options = T.bidang.map((b) => `<optgroup label="${esc(b)}">${T.items.filter((it) => it.bidang[0] === b).map((it) => `<option value="${it.no}">${pad(it.no)} · ${esc(it.name)}</option>`).join("")}</optgroup>`).join("");

  root.innerHTML = `
    <div class="hr-day">
      <div class="tabs" role="group" aria-label="Pindah hari">
        <button type="button" data-dn="-1" aria-label="Hari sebelumnya">‹</button>
        <button type="button" data-dn="0">Hari ini</button>
        <button type="button" data-dn="1" aria-label="Hari berikutnya">›</button>
      </div>
      <input class="search hr-date" type="date" aria-label="Pilih tanggal">
      <b class="hr-daylabel"></b>
    </div>
    <div class="stat-row hr-stats"></div>
    <div class="grid grid--2-1">
      <article class="panel">
        <div class="panel__head">
          <h3 class="panel__title mono hr-title"></h3>
          <span class="hr-filter"></span>
        </div>
        <ul class="hr-list"></ul>
        <p class="note mono hr-note"></p>
      </article>
      <article class="panel">
        <h3 class="panel__title mono">${esc(up("Input tugas harian"))}</h3>
        <form class="form hr-form" autocomplete="off">
          <label>Tanggal<input name="date" type="date" required></label>
          <label>Terhubung ke tugas umum<select name="no" required>${options}</select></label>
          <p class="note hr-desc"></p>
          <label>Uraian kegiatan<input name="text" required placeholder="mis. Input 3 PO material proyek Kemang"></label>
          <div class="gc-row">
            <label>Capaian<input name="value" type="number" min="0" step="any" placeholder="opsional"></label>
            <label>Status<select name="status">${STATUS.map((s) => `<option ${s === "Selesai" ? "selected" : ""}>${s}</option>`).join("")}</select></label>
          </div>
          <label>Tautan bukti<input name="link" type="url" placeholder="https://… (opsional)"></label>
          <button class="btn btn--solid" type="submit">Simpan tugas harian</button>
          <p class="note hr-msg" role="status"></p>
        </form>
      </article>
    </div>`;

  const form = $(".hr-form", root), list = $(".hr-list", root), dateIn = $(".hr-date", root);
  form.elements.date.value = S.day;

  function describe() {
    const it = item(form.elements.no.value);
    $(".hr-desc", root).textContent = it ? `${it.bidang.join(", ")} · ${it.desc} (satuan: ${it.unit})` : "";
    form.elements.value.placeholder = it ? `opsional, dalam ${it.unit.toLowerCase()}` : "opsional";
  }

  function draw() {
    dateIn.value = S.day;
    $(".hr-daylabel", root).textContent = fD(S.day, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const dayRows = S.rows.filter((r) => r.date === S.day);
    const c = dayRows.reduce((m, r) => (m[r.status] = (m[r.status] || 0) + 1, m), {});
    const touched = new Set(dayRows.map((r) => String(r.no))).size;
    $(".hr-stats", root).innerHTML =
      `<div class="stat stat--ok"><span class="mono">${esc(up("Tugas harian"))}</span><b>${dayRows.length}</b><small>${S.day === ymd(new Date()) ? "hari ini" : "di tanggal ini"}</small></div>` +
      `<div class="stat stat--ok"><span class="mono">${esc(up("Selesai"))}</span><b>${c.Selesai || 0}</b><small>${dayRows.length ? Math.round(((c.Selesai || 0) / dayRows.length) * 100) + "% dari entri" : "—"}</small></div>` +
      `<div class="stat stat--info"><span class="mono">${esc(up("Proses / belum"))}</span><b>${(c.Proses || 0) + (c.Belum || 0)}</b><small>${c.Proses || 0} proses · ${c.Belum || 0} belum</small></div>` +
      `<div class="stat"><span class="mono">${esc(up("Tugas umum tersentuh"))}</span><b>${touched}/${T.items.length}</b><small>terhubung dari entri harian</small></div>`;

    const it = S.task ? item(S.task) : null;
    const rows = it ? S.rows.filter((r) => String(r.no) === S.task) : dayRows;
    $(".hr-title", root).textContent = up(it ? "Semua catatan · " + it.name : "Daftar tugas harian");
    $(".hr-filter", root).innerHTML = it ? `<button type="button" class="mini-btn" data-clear>× Tampilkan per hari</button>` : "";
    const empty = S.mode === "loading" ? "Memuat tugas harian…" : it ? "Belum ada catatan harian untuk tugas ini." : "Belum ada tugas harian di tanggal ini. Isi formulir di samping.";
    list.innerHTML = rows.map((r, k) => {
      const t = item(r.no);
      return `<li class="hr-item hr-item--${esc(String(r.status).toLowerCase())}" style="--d:${k}" data-id="${esc(r.id)}">
        <div class="hr-item__main">
          <b>${esc(r.text)}</b>
          <button type="button" class="hr-link" data-goto="${esc(r.no)}" data-date="${esc(r.date)}" title="Buka di Tugas Umum">↗ ${pad(r.no)} · ${esc(t ? t.name : "Tugas umum")}</button>
          <small class="mono">${it ? esc(fD(r.date, { weekday: "short", day: "numeric", month: "short" })) + " · " : ""}${esc(hm(r.at))}${t ? " · " + esc(t.bidang.join(", ")) : ""}${r.value != null && r.value !== "" ? ` · capaian ${esc(Number(r.value).toLocaleString("id-ID"))} ${esc(t ? t.unit.toLowerCase() : "")}` : ""}${r.link ? ` · <a class="lnk" href="${esc(r.link)}" target="_blank" rel="noopener">bukti</a>` : ""}</small>
        </div>
        <div class="tg-seg" role="group" aria-label="Status">${STATUS.map((s) => `<button type="button" data-st="${s}" aria-pressed="${r.status === s}">${s}</button>`).join("")}</div>
        <button type="button" class="mini-btn" data-del>Hapus</button>
      </li>`;
    }).join("") || `<li class="hr-empty note">${empty}</li>`;
    $(".hr-note", root).textContent = S.mode === "live" ? "Tersimpan di database bersama · setiap input tercatat di riwayat aktivitas Beranda" : S.mode === "loading" ? "" : "Mode lokal: tersimpan di browser ini saja";
    document.dispatchEvent(new CustomEvent("du:harian"));
  }

  root.addEventListener("click", async (e) => {
    const dn = e.target.closest("[data-dn]");
    if (dn) {
      const n = +dn.dataset.dn, d = n === 0 ? new Date() : pd(S.day);
      if (n) d.setDate(d.getDate() + n);
      S.day = ymd(d); S.task = ""; form.elements.date.value = S.day; draw(); return;
    }
    if (e.target.closest("[data-clear]")) { S.task = ""; draw(); return; }
    const go = e.target.closest("[data-goto]");
    if (go) { if (window.DUTasks && window.DUTasks.focus) window.DUTasks.focus(go.dataset.goto, go.dataset.date); return; }
    const li = e.target.closest(".hr-item");
    if (!li) return;
    const r = S.rows.find((x) => x.id === li.dataset.id);
    if (!r) return;
    const st = e.target.closest("[data-st]");
    if (st && st.dataset.st !== r.status) {
      try {
        await window.DUStore.update("daily", r.id, { status: st.dataset.st });
        log(item(r.no), `Tugas harian "${r.text}" → ${st.dataset.st}`);
      } catch (er) { toast("Gagal mengubah status."); }
      return;
    }
    const del = e.target.closest("[data-del]");
    if (del) {
      if (del.dataset.armed !== "1") {
        del.dataset.armed = "1"; del.textContent = "Yakin hapus?"; del.classList.add("is-armed");
        setTimeout(() => { if (del.isConnected) { del.dataset.armed = ""; del.textContent = "Hapus"; del.classList.remove("is-armed"); } }, 4000);
        return;
      }
      try {
        await window.DUStore.remove("daily", r.id);
        log(item(r.no), `Menghapus tugas harian "${r.text}"`);
      } catch (er) { toast("Gagal menghapus."); }
    }
  });
  dateIn.addEventListener("change", () => { if (dateIn.value) { S.day = dateIn.value; S.task = ""; form.elements.date.value = S.day; draw(); } });
  form.elements.no.addEventListener("change", describe);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = form.elements, msg = $(".hr-msg", root), btn = $("button[type=submit]", form);
    const link = f.link.value.trim();
    if (link && !/^https:\/\//i.test(link)) { msg.textContent = "Gunakan tautan yang diawali https://"; return; }
    const row = { at: new Date().toISOString(), date: f.date.value, no: Number(f.no.value), text: f.text.value.trim(), status: f.status.value, value: f.value.value === "" ? null : Number(f.value.value), link };
    if (!row.date || !row.text) { msg.textContent = "Isi tanggal dan uraian kegiatan."; return; }
    btn.disabled = true; msg.textContent = "";
    try {
      await window.DUStore.add("daily", row);
      const it = item(row.no);
      log(it, `Tugas harian: ${row.text} → ${pad(row.no)} ${it ? it.name : ""} (${row.status})`);
      toast("Tugas harian tersimpan");
      f.text.value = ""; f.value.value = ""; f.link.value = "";
      if (row.date !== S.day) { S.day = row.date; }
      S.task = ""; draw();
    } catch (er) {
      msg.textContent = "Gagal menyimpan. Anda mungkin hanya punya akses lihat.";
    }
    btn.disabled = false;
  });

  describe();
  draw();
  window.DUStore.watch("daily", (rows, mode) => {
    S.mode = mode === "error" ? "local" : mode;
    if (rows) S.rows = rows;
    draw();
  });
})();
