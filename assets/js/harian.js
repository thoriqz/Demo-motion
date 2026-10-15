/* =========================================================
   Tugas → Tugas Harian: checklist pekerjaan harian yang diinput manual,
   berjenis Tugas Umum (di luar bidang, no = 0) atau terhubung ke salah satu dari 15 tugas pelaporan.
   Dicentang saat selesai, dengan keterangan detail pekerjaan.
   Tersimpan di koleksi "daily" (status "Selesai"/"Belum", note, doneAt).
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
  const isDone = (r) => r.status === "Selesai";
  /* Jenis "Tugas Umum": pekerjaan di luar bidang GA/Admin/Finance/HR/Legal (no = 0, tidak terhubung ke tugas pelaporan) */
  const UMUM = { no: 0, name: "Tugas Umum", bidang: ["Umum"], desc: "Pekerjaan umum di luar bidang GA, Admin, Finance, HR, dan Legal", unit: "" };
  const item = (no) => (String(no) === "0" ? UMUM : T.items.find((it) => String(it.no) === String(no)));
  const areaOf = (it) => (it ? it.bidang[0] : "Umum");
  const log = (it, text) => window.DULog && window.DULog.add(areaOf(it), text);

  const S = { rows: [], mode: "loading", day: ymd(new Date()), task: "" };

  /* Untuk tautan balik dari kartu tugas pelaporan */
  window.DUHarian = {
    count: (no, from, to) => S.rows.filter((r) => String(r.no) === String(no) && r.date >= from && r.date <= to).length,
    show: (no) => { S.task = String(no); draw(); const t = document.getElementById("tab-tg-daily"); if (t) t.click(); root.scrollIntoView({ behavior: "smooth", block: "start" }); }
  };

  const options = `<optgroup label="Umum"><option value="0">Tugas Umum (di luar bidang)</option></optgroup>` + T.bidang.map((b) => `<optgroup label="${esc(b)}">${T.items.filter((it) => it.bidang[0] === b).map((it) => `<option value="${it.no}">${pad(it.no)} · ${esc(it.name)}</option>`).join("")}</optgroup>`).join("");

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
          <label>Jenis tugas<select name="no" required>${options}</select></label>
          <p class="note hr-desc"></p>
          <label>Pekerjaan<input name="text" required placeholder="mis. Input PO material proyek Kemang"></label>
          <button class="btn btn--solid" type="submit">+ Tambah ke checklist</button>
          <p class="note">Centang di daftar saat pekerjaan selesai, lalu isi keterangan detailnya.</p>
          <p class="note hr-msg" role="status"></p>
        </form>
      </article>
    </div>`;

  const form = $(".hr-form", root), list = $(".hr-list", root), dateIn = $(".hr-date", root);
  form.elements.date.value = S.day;

  function describe() {
    const it = item(form.elements.no.value);
    $(".hr-desc", root).textContent = !it ? "" : it.no === 0 ? it.desc + " · tidak terhubung ke tugas pelaporan" : `Terhubung ke tugas pelaporan · ${it.bidang.join(", ")} · ${it.desc} (satuan: ${it.unit})`;
  }

  function draw() {
    dateIn.value = S.day;
    $(".hr-daylabel", root).textContent = fD(S.day, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const dayRows = S.rows.filter((r) => r.date === S.day);
    const done = dayRows.filter(isDone).length, pct = dayRows.length ? Math.round((done / dayRows.length) * 100) : 0;
    const touched = new Set(dayRows.filter((r) => String(r.no) !== "0").map((r) => String(r.no))).size;
    const umumN = dayRows.filter((r) => String(r.no) === "0").length;
    $(".hr-stats", root).innerHTML =
      `<div class="stat stat--ok"><span class="mono">${esc(up("Checklist"))}</span><b>${pct}%</b><small>${done} dari ${dayRows.length} pekerjaan ${S.day === ymd(new Date()) ? "hari ini" : "di tanggal ini"}</small><i class="hr-prog"><i style="width:${pct}%"></i></i></div>` +
      `<div class="stat stat--ok"><span class="mono">${esc(up("Sudah dikerjakan"))}</span><b>${done}</b><small>${dayRows.filter((r) => isDone(r) && r.note).length} dengan keterangan</small></div>` +
      `<div class="stat stat--warn"><span class="mono">${esc(up("Belum"))}</span><b>${dayRows.length - done}</b><small>belum dicentang</small></div>` +
      `<div class="stat"><span class="mono">${esc(up("Tugas pelaporan tersentuh"))}</span><b>${touched}/${T.items.length}</b><small>${umumN} tugas umum · terhubung dari entri harian</small></div>`;

    const it = S.task ? item(S.task) : null;
    const rows = (it ? S.rows.filter((r) => String(r.no) === S.task) : dayRows).slice().sort((x, y) => isDone(x) - isDone(y));
    $(".hr-title", root).textContent = up(it ? "Semua checklist · " + it.name : "Checklist pekerjaan");
    $(".hr-filter", root).innerHTML = it ? `<button type="button" class="mini-btn" data-clear>× Tampilkan per hari</button>` : "";
    const empty = S.mode === "loading" ? "Memuat tugas harian…" : it ? "Belum ada pekerjaan harian untuk tugas ini." : "Belum ada pekerjaan di tanggal ini. Tambahkan lewat formulir di samping.";
    /* jangan hilangkan ketikan keterangan yang sedang diisi saat data diperbarui */
    const act = document.activeElement, editing = act && act.classList.contains("hr-note-in") && list.contains(act)
      ? { id: act.closest(".hr-item").dataset.id, v: act.value, s: act.selectionStart, e: act.selectionEnd } : null;
    list.innerHTML = rows.map((r, k) => {
      const t = item(r.no), dn = isDone(r);
      return `<li class="hr-item hr-check ${dn ? "is-done" : ""}" style="--d:${k}" data-id="${esc(r.id)}">
        <label class="hr-box"><input type="checkbox" ${dn ? "checked" : ""} aria-label="Tandai selesai: ${esc(r.text)}"><span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span></label>
        <div class="hr-item__main">
          <b class="hr-text">${esc(r.text)}</b>
          ${String(r.no) === "0" ? `<span class="hr-link hr-link--umum">Tugas Umum</span>` : `<button type="button" class="hr-link" data-goto="${esc(r.no)}" data-date="${esc(r.date)}" title="Buka di Tugas Pelaporan">↗ ${pad(r.no)} · ${esc(t ? t.name : "Tugas pelaporan")}</button>`}
          <small class="mono">${it ? esc(fD(r.date, { weekday: "short", day: "numeric", month: "short" })) + " · " : ""}${dn && r.doneAt ? "selesai " + esc(hm(r.doneAt)) : "dibuat " + esc(hm(r.at))}${t ? " · " + esc(t.bidang.join(", ")) : ""}${r.link ? ` · <a class="lnk" href="${esc(r.link)}" target="_blank" rel="noopener">bukti</a>` : ""}</small>
          <textarea class="hr-note-in" rows="${r.note ? 2 : 1}" placeholder="Keterangan detail pekerjaan…" aria-label="Keterangan ${esc(r.text)}">${esc(r.note || "")}</textarea>
        </div>
        <button type="button" class="mini-btn" data-del>Hapus</button>
      </li>`;
    }).join("") || `<li class="hr-empty note">${empty}</li>`;
    if (editing) {
      const ta = list.querySelector(`.hr-item[data-id="${CSS.escape(editing.id)}"] .hr-note-in`);
      if (ta) { ta.value = editing.v; ta.focus(); ta.setSelectionRange(editing.s, editing.e); }
    }
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
  /* centang selesai & keterangan detail */
  list.addEventListener("change", async (e) => {
    const li = e.target.closest(".hr-item");
    const r = li && S.rows.find((x) => x.id === li.dataset.id);
    if (!r) return;
    if (e.target.type === "checkbox") {
      const dn = e.target.checked;
      li.classList.toggle("is-done", dn);
      try {
        await window.DUStore.update("daily", r.id, { status: dn ? "Selesai" : "Belum", doneAt: dn ? new Date().toISOString() : null });
        log(item(r.no), dn ? `✓ Selesai: ${r.text}${r.note ? " — " + r.note : ""}` : `Batal centang: ${r.text}`);
        if (dn && !r.note) { const ta = $(".hr-note-in", li); if (ta) { ta.focus(); toast("Selesai ✓ — tambahkan keterangan detailnya"); } }
      } catch (er) { e.target.checked = !dn; li.classList.toggle("is-done", !dn); toast("Gagal menyimpan. Anda mungkin hanya punya akses lihat."); }
      return;
    }
    if (e.target.classList.contains("hr-note-in")) {
      const note = e.target.value.trim();
      if (note === (r.note || "")) return;
      try {
        await window.DUStore.update("daily", r.id, { note });
        if (note) log(item(r.no), `Keterangan "${r.text}": ${note}`);
        toast("Keterangan tersimpan");
      } catch (er) { toast("Gagal menyimpan keterangan."); }
    }
  });
  list.addEventListener("input", (e) => {
    if (e.target.classList.contains("hr-note-in")) { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }
  });
  list.addEventListener("keydown", (e) => {
    if (e.target.classList.contains("hr-note-in") && e.key === "Enter" && (e.ctrlKey || e.metaKey)) e.target.blur();
  });
  dateIn.addEventListener("change", () => { if (dateIn.value) { S.day = dateIn.value; S.task = ""; form.elements.date.value = S.day; draw(); } });
  form.elements.no.addEventListener("change", describe);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = form.elements, msg = $(".hr-msg", root), btn = $("button[type=submit]", form);
    const row = { at: new Date().toISOString(), date: f.date.value, no: Number(f.no.value), text: f.text.value.trim(), status: "Belum", note: "", doneAt: null };
    if (!row.date || !row.text) { msg.textContent = "Isi tanggal dan nama pekerjaan."; return; }
    btn.disabled = true; msg.textContent = "";
    try {
      await window.DUStore.add("daily", row);
      const it = item(row.no);
      log(it, `Checklist baru: ${row.text} → ${row.no ? pad(row.no) + " " : ""}${it ? it.name : ""}`);
      toast("Ditambahkan ke checklist");
      f.text.value = ""; f.text.focus();
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
