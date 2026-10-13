/* =========================================================
   Integrasi Google Calendar (connector claude.ai "Google Calendar")
   - Modul GA → Kalender: tampilan bulan, agenda mendatang, tambah agenda.
   - Pengingat otomatis (perawatan aset, tutup buku) dibuat sebagai acara
     dengan pengingat pop-up → notifikasi muncul di ponsel lewat aplikasi
     Google Calendar.
   - Beranda Sage & lonceng notifikasi membaca agenda 14 hari ke depan.
   Hanya aktif di versi claude.ai (butuh izin connector dari penampil).
   ========================================================= */
(function () {
  "use strict";

  const D = window.DU_DATA || {};
  const CFG = D.googleCalendar || {};
  const SERVER = "Google Calendar";
  const CAL = CFG.calendarId || undefined;
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const SKIN = document.body.dataset.skin || "blueprint";
  const up = (s) => (SKIN === "blueprint" ? String(s).toUpperCase() : String(s));
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const local = (d) => `${ymd(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const dateOnly = (s) => new Date(String(s).slice(0, 10) + "T00:00:00");
  const today = new Date(new Date().toDateString());
  const fmt = (d, o) => d.toLocaleDateString("id-ID", o);
  const TZ = CFG.timeZone || undefined;
  const hm = (d) => d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
  /* tanggal kalender (00.00) dari waktu acara, menurut zona waktu kantor */
  const dayOf = (d) => { const p = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d); return new Date(p + "T00:00:00"); };
  const BIDANG = ["Umum", "GA", "Admin", "Finance", "HR", "Legal", "Proyek"];

  const ERR = {
    server_not_connected: "Google Calendar belum tersambung di akun Anda. Sambungkan di claude.ai → Settings → Connectors.",
    needs_reauth: "Sambungan Google Calendar kedaluwarsa. Sambungkan ulang di claude.ai → Settings → Connectors.",
    not_in_manifest: "Akses Google Calendar untuk webapp ini ditolak. Izinkan lewat menu Permissions artifact.",
    approval_required: "Perlu persetujuan untuk membaca Google Calendar.",
    blocked_by_policy: "Kebijakan organisasi memblokir akses Google Calendar.",
    selection_required: "Pilih akun Google Calendar yang dipakai saat diminta claude.ai.",
    tool_error: "Google Calendar menolak permintaan. Pastikan akun Google Anda punya akses ke kalender Roemantara.",
    server_unavailable: "Google Calendar sedang tidak bisa dihubungi. Coba lagi sebentar."
  };
  const errMsg = (e) => ERR[e && e.code] || "Gagal terhubung ke Google Calendar.";

  /* ---------- Normalisasi acara ---------- */
  const plain = (h) => String(h).replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|li)>/gi, "\n").replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\n{3,}/g, "\n\n").trim();
  function norm(ev) {
    if (!ev || ev.status === "cancelled") return null;
    const allDay = !!(ev.start && ev.start.date);
    const s = allDay ? dateOnly(ev.start.date) : new Date(ev.start && ev.start.dateTime);
    let e = allDay ? dateOnly(ev.end && ev.end.date) : new Date(ev.end && ev.end.dateTime);
    if (isNaN(s)) return null;
    if (isNaN(e)) e = allDay ? addDays(s, 1) : s;
    const firstDay = allDay ? s : dayOf(s);
    const lastDay = allDay ? addDays(e, -1) : dayOf(new Date(e - 1));
    const m = /^([^-–]{1,20}?)\s*[-–]\s+(.+)$/.exec(ev.summary || "");
    return {
      id: ev.id, title: ev.summary || "(tanpa judul)", tag: m ? m[1].trim() : "", short: m ? m[2] : ev.summary || "(tanpa judul)",
      allDay, start: s, end: e, firstDay, lastDay: lastDay < firstDay ? firstDay : lastDay, time: allDay ? "" : hm(s),
      link: ev.htmlLink, location: ev.location || "", desc: plain(ev.description || "")
    };
  }
  const events = (payload) => ((payload && payload.events) || []).map(norm).filter(Boolean).sort((x, y) => x.start - y.start);
  const timeLabel = (e) => (e.allDay
    ? (+e.firstDay === +e.lastDay ? "Seharian" : `${fmt(e.firstDay, { day: "numeric", month: "short" })} – ${fmt(e.lastDay, { day: "numeric", month: "short" })}`)
    : e.time);

  /* ---------- State bersama untuk modul lain ---------- */
  const S = { mcp: null, mode: "loading", month: new Date(today.getFullYear(), today.getMonth(), 1), monthEvents: [], upcoming: [], err: "", unwatchMonth: null, updated: null, day: today };
  const findEv = (id) => S.monthEvents.find((e) => e.id === id) || S.upcoming.find((e) => e.id === id);
  const onDay = (day) => {
    const seen = new Set();
    return S.monthEvents.concat(S.upcoming).filter((e) => day >= e.firstDay && day <= e.lastDay && !seen.has(e.id) && seen.add(e.id))
      .sort((a, b) => (b.allDay - a.allDay) || (a.start - b.start));
  };
  window.DUCal = { upcoming: () => S.upcoming, mode: () => S.mode, error: () => S.err, preview: (id) => openEvent(id) };
  const announce = () => document.dispatchEvent(new CustomEvent("du:cal"));

  /* ---------- Markup modul kalender ---------- */
  const panel = document.getElementById("ga-cal");
  if (panel) {
    panel.innerHTML = `
      <div class="gc-status" id="gcStatus"><span class="gc-dot"></span><span id="gcStatusText">Menghubungkan ke Google Calendar…</span></div>
      <div class="grid grid--2-1">
        <article class="panel">
          <div class="panel__head">
            <h3 class="panel__title mono" id="gcTitle">${esc(up("Kalender"))}</h3>
            <div class="tabs" role="group" aria-label="Pindah bulan">
              <button type="button" data-nav="-1" aria-label="Bulan sebelumnya">‹</button>
              <button type="button" data-nav="0">Hari ini</button>
              <button type="button" data-nav="1" aria-label="Bulan berikutnya">›</button>
            </div>
          </div>
          <div class="cal" id="gcGrid"></div>
          <p class="note mono">Klik tanggal untuk melihat semua jadwal hari itu, klik acara untuk pratinjau.</p>
        </article>
        <article class="panel">
          <h3 class="panel__title mono">${esc(up("Tambah agenda"))}</h3>
          <form class="form gc-form" id="gcForm" autocomplete="off">
            <label for="gcTitleIn">Judul<input id="gcTitleIn" name="title" required placeholder="mis. Rapat koordinasi mingguan"></label>
            <div class="gc-row">
              <label for="gcBidang">Bidang<select id="gcBidang" name="bidang">${BIDANG.map((b) => `<option>${b}</option>`).join("")}</select></label>
              <label for="gcDate">Tanggal<input id="gcDate" name="date" type="date" required value="${ymd(today)}"></label>
            </div>
            <label class="gc-check"><input type="checkbox" name="allDay" id="gcAllDay"> Seharian</label>
            <div class="gc-row" id="gcTimes">
              <label for="gcStart">Mulai<input id="gcStart" name="start" type="time" value="09:00"></label>
              <label for="gcEnd">Selesai<input id="gcEnd" name="end" type="time" value="10:00"></label>
            </div>
            <label for="gcLoc">Lokasi<input id="gcLoc" name="location" placeholder="opsional"></label>
            <label for="gcRem">Pengingat di ponsel
              <select id="gcRem" name="reminder">
                <option value="10">10 menit sebelumnya</option>
                <option value="30" selected>30 menit sebelumnya</option>
                <option value="60">1 jam sebelumnya</option>
                <option value="1440">1 hari sebelumnya</option>
                <option value="1440,60">1 hari &amp; 1 jam sebelumnya</option>
              </select>
            </label>
            <label for="gcDesc">Catatan<input id="gcDesc" name="desc" placeholder="opsional"></label>
            <button class="btn btn--solid" type="submit" id="gcSubmit">Simpan ke Google Calendar</button>
            <p class="note" id="gcFormMsg" role="status"></p>
          </form>
        </article>
      </div>
      <article class="panel gc-daypanel" id="gcDayPanel">
        <div class="panel__head">
          <h3 class="panel__title mono" id="gcDayTitle"></h3>
          <div class="tabs" role="group" aria-label="Pindah hari">
            <button type="button" data-dnav="-1" aria-label="Hari sebelumnya">‹</button>
            <button type="button" data-dnav="0">Hari ini</button>
            <button type="button" data-dnav="1" aria-label="Hari berikutnya">›</button>
          </div>
        </div>
        <ol class="gc-day" id="gcDay"></ol>
        <button class="mini-btn gc-dayadd" type="button" data-addday>+ Tambah agenda di tanggal ini</button>
      </article>
      <div class="grid grid--2">
        <article class="panel">
          <h3 class="panel__title mono">${esc(up("Agenda 14 hari ke depan"))}</h3>
          <ol class="timeline" id="gcUpcoming"></ol>
        </article>
        <article class="panel">
          <h3 class="panel__title mono">${esc(up("Pengingat otomatis ke ponsel"))}</h3>
          <p class="note gc-help">Pengingat dibuat sebagai acara seharian di Google Calendar dengan notifikasi H-2 dan H-1 pukul 09.00. Notifikasi muncul di ponsel lewat aplikasi Google Calendar.</p>
          <ul class="gc-auto" id="gcAuto"></ul>
        </article>
      </div>`;
  }

  /* ---------- Pratinjau acara (modal) ---------- */
  const modal = document.createElement("div");
  modal.className = "gc-modal";
  modal.hidden = true;
  modal.innerHTML = `<div class="gc-modal__box" role="dialog" aria-modal="true" aria-labelledby="gcmTitle" tabindex="-1"></div>`;
  document.body.appendChild(modal);
  const box = modal.firstElementChild;
  let lastFocus = null;
  function openEvent(id) {
    const e = findEv(id);
    if (!e) return;
    const range = e.allDay
      ? (+e.firstDay === +e.lastDay ? fmt(e.firstDay, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + " · seharian"
        : `${fmt(e.firstDay, { weekday: "short", day: "numeric", month: "long" })} – ${fmt(e.lastDay, { weekday: "short", day: "numeric", month: "long", year: "numeric" })}`)
      : `${fmt(e.firstDay, { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · ${hm(e.start)} – ${hm(e.end)}`;
    box.innerHTML = `
      <button class="gc-modal__x" type="button" data-close aria-label="Tutup">×</button>
      ${e.tag ? `<span class="tag">${esc(e.tag)}</span>` : ""}
      <h3 id="gcmTitle">${esc(e.short)}</h3>
      <dl class="gc-modal__dl">
        <div><dt>Waktu</dt><dd>${esc(range)}</dd></div>
        ${e.location ? `<div><dt>Lokasi</dt><dd><a class="lnk" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.location)}" target="_blank" rel="noopener">${esc(e.location)}</a></dd></div>` : ""}
        <div><dt>Catatan</dt><dd class="gc-modal__desc">${e.desc ? esc(e.desc) : "—"}</dd></div>
      </dl>
      <div class="gc-modal__act">
        <button class="mini-btn" type="button" data-showday="${ymd(e.firstDay)}">Semua jadwal hari ini</button>
        ${e.link ? `<a class="btn btn--solid" href="${esc(e.link)}" target="_blank" rel="noopener">Buka di Google Calendar ↗</a>` : ""}
      </div>`;
    if (modal.hidden) lastFocus = document.activeElement;
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add("is-on"));
    box.focus();
  }
  function closeModal() {
    modal.classList.remove("is-on");
    modal.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest("[data-close]")) { closeModal(); return; }
    const sd = e.target.closest("[data-showday]");
    if (sd) { closeModal(); selectDay(dateOnly(sd.dataset.showday), true); }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeModal(); });

  /* ---------- Render ---------- */
  function setStatus() {
    const box = $("#gcStatus");
    if (!box) return;
    box.dataset.state = S.mode;
    $("#gcStatusText").textContent =
      S.mode === "live" ? `Tersambung ke Google Calendar${S.updated ? " · diperbarui " + S.updated.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : ""}`
        : S.mode === "local" ? "Google Calendar hanya tampil saat webapp dibuka di claude.ai."
          : S.mode === "error" ? S.err : "Menghubungkan ke Google Calendar…";
  }

  function drawMonth() {
    const grid = $("#gcGrid");
    if (!grid) return;
    const m = S.month, first = new Date(m.getFullYear(), m.getMonth(), 1);
    const days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
    const lead = (first.getDay() + 6) % 7;
    $("#gcTitle").textContent = up("Kalender · " + fmt(first, { month: "long", year: "numeric" }));
    let html = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => `<div class="cal__hd mono">${d}</div>`).join("");
    for (let i = 0; i < lead; i++) html += `<div class="cal__day is-off"></div>`;
    for (let d = 1; d <= days; d++) {
      const day = new Date(m.getFullYear(), m.getMonth(), d);
      const evs = S.monthEvents.filter((e) => day >= e.firstDay && day <= e.lastDay);
      const isToday = +day === +today, isSel = +day === +S.day;
      html += `<div class="cal__day ${isToday ? "is-today" : ""} ${isSel ? "is-sel" : ""}" style="--d:${d}" data-day="${ymd(day)}"><button type="button" class="cal__num mono" data-day="${ymd(day)}" aria-label="Lihat jadwal ${esc(fmt(day, { weekday: "long", day: "numeric", month: "long" }))}${evs.length ? ", " + evs.length + " acara" : ""}">${d}</button>
        ${evs.slice(0, 3).map((e) => `<button type="button" class="cal__ev ${e.allDay ? "cal__ev--in" : "cal__ev--ex"}" data-ev="${esc(e.id)}" title="${esc(timeLabel(e) + " · " + e.title)}">${e.allDay ? "" : `<b>${esc(e.time)}</b> `}${esc(e.title)}</button>`).join("")}
        ${evs.length > 3 ? `<button type="button" class="cal__more mono" data-day="${ymd(day)}">+${evs.length - 3} lagi</button>` : ""}</div>`;
    }
    grid.innerHTML = html;
    drawDay();
  }

  /* Semua jadwal pada satu hari */
  function drawDay() {
    const ol = $("#gcDay");
    if (!ol) return;
    const evs = onDay(S.day);
    $("#gcDayTitle").textContent = up("Jadwal · " + fmt(S.day, { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
    ol.innerHTML = evs.length ? evs.map((e) => `<li><button type="button" data-ev="${esc(e.id)}">
        <span class="gc-day__time mono">${esc(e.allDay ? timeLabel(e) : hm(e.start) + " – " + hm(e.end))}</span>
        <span class="gc-day__txt"><b>${esc(e.short)}</b>${e.location ? `<small>${esc(e.location)}</small>` : ""}</span>
        ${e.tag ? `<span class="tag">${esc(e.tag)}</span>` : ""}</button></li>`).join("")
      : `<li class="gc-empty"><span class="note">${S.mode === "live" ? "Tidak ada jadwal di hari ini." : esc(S.mode === "error" ? S.err : S.mode === "local" ? "Jadwal Google Calendar tampil di versi claude.ai." : "Memuat jadwal…")}</span></li>`;
  }
  function selectDay(d, scroll) {
    const sameMonth = d.getFullYear() === S.month.getFullYear() && d.getMonth() === S.month.getMonth();
    S.day = d;
    if (!sameMonth) { S.month = new Date(d.getFullYear(), d.getMonth(), 1); S.monthEvents = []; drawMonth(); watchMonth(); }
    else drawMonth();
    if (scroll) { const p = $("#gcDayPanel"); if (p) p.scrollIntoView({ behavior: "smooth", block: "start" }); }
  }

  function drawUpcoming() {
    const ol = $("#gcUpcoming");
    if (ol) {
      ol.innerHTML = S.upcoming.length ? S.upcoming.slice(0, 10).map((e) => `
        <li><span class="t-date">${esc(up(fmt(e.firstDay, { weekday: "short", day: "2-digit", month: "short" })))} · ${esc(up(timeLabel(e)))}</span>
        <button type="button" class="t-title gc-link" data-ev="${esc(e.id)}">${esc(e.short)}${e.tag ? `<span class="tag">${esc(e.tag)}</span>` : ""}</button></li>`).join("")
        : `<li class="gc-empty"><span class="t-title">${S.mode === "live" ? "Tidak ada agenda dalam 14 hari ke depan." : esc(S.mode === "error" ? S.err : "Agenda Google Calendar tampil di sini.")}</span></li>`;
    }
    drawAuto();
    drawDay();
    announce();
  }

  /* Pengingat otomatis dari data webapp */
  function reminderCandidates() {
    const list = [];
    const inv = D.inventory;
    if (inv) {
      const by = {};
      inv.assets.filter((a) => a.perawatan && dateOnly(a.perawatan) >= today).forEach((a) => (by[a.perawatan] = (by[a.perawatan] || 0) + 1));
      Object.keys(by).sort().slice(0, 3).forEach((d) => list.push({ key: "aset-" + d, date: d, summary: `GA - Perawatan aset (${by[d]} aset)`, desc: `Jadwal perawatan ${by[d]} aset sesuai data Inventaris Aset. Cek daftar di webapp Divisi Umum → GA → Aset & Inventaris.` }));
    }
    if (D.closing && D.closing.deadline && dateOnly(D.closing.deadline) >= today) {
      list.push({ key: "close-" + D.closing.deadline, date: D.closing.deadline, summary: `Finance - Batas tutup buku ${D.closing.period}`, desc: "Selesaikan daftar periksa tutup buku di webapp Divisi Umum → Finance → Tutup Buku." });
    }
    return list;
  }
  function drawAuto() {
    const ul = $("#gcAuto");
    if (!ul) return;
    const known = new Set(S.monthEvents.concat(S.upcoming).map((e) => e.title + "|" + ymd(e.firstDay)));
    const items = reminderCandidates();
    ul.innerHTML = items.map((r) => {
      const done = known.has(r.summary + "|" + r.date);
      return `<li><div><b>${esc(r.summary.replace(/^[^-]+-\s*/, ""))}</b><small>${esc(fmt(dateOnly(r.date), { weekday: "long", day: "numeric", month: "long" }))}</small></div>
        ${done ? `<span class="pill pill--ok">Sudah di kalender</span>` : `<button class="mini-btn" type="button" data-rem="${esc(r.key)}" ${S.mode === "live" ? "" : "disabled"}>Buat pengingat</button>`}</li>`;
    }).join("") || `<li><span class="note">Belum ada tanggal penting yang bisa dijadikan pengingat.</span></li>`;
  }

  /* ---------- Sambungan ---------- */
  function watchMonth() {
    if (!S.mcp) return;
    if (S.unwatchMonth) S.unwatchMonth();
    const m = S.month;
    const input = { startTime: local(new Date(m.getFullYear(), m.getMonth(), 1)), endTime: local(new Date(m.getFullYear(), m.getMonth() + 1, 1)), orderBy: "startTime", pageSize: 250 };
    if (CAL) input.calendarId = CAL;
    S.unwatchMonth = S.mcp.watchTool(SERVER, "list_events", input, (ev) => {
      if (ev.type === "data") { S.monthEvents = events(ev.result.payload); S.mode = "live"; S.updated = new Date(); }
      else { S.mode = "error"; S.err = errMsg(ev.error); if (/needs_reauth|not_in_manifest|server_not_connected|blocked_by_policy/.test(ev.error.code)) S.monthEvents = []; }
      setStatus(); drawMonth(); drawAuto();
    }, { refetchInterval: 120000 });
  }
  function watchUpcoming() {
    const input = { startTime: local(new Date()), endTime: local(addDays(today, 15)), orderBy: "startTime", pageSize: 50 };
    if (CAL) input.calendarId = CAL;
    S.mcp.watchTool(SERVER, "list_events", input, (ev) => {
      if (ev.type === "data") { S.upcoming = events(ev.result.payload); S.mode = "live"; S.updated = new Date(); }
      else { S.mode = "error"; S.err = errMsg(ev.error); if (/needs_reauth|not_in_manifest|server_not_connected|blocked_by_policy/.test(ev.error.code)) S.upcoming = []; }
      setStatus(); drawUpcoming();
    }, { refetchInterval: 300000 });
  }
  const refresh = () => { if (S.mcp) S.mcp.invalidate(SERVER, "list_events"); };

  async function create(input) {
    if (CAL) input.calendarId = CAL;
    const res = await S.mcp.callTool(SERVER, "create_event", input);
    refresh();
    return res;
  }

  /* ---------- Interaksi ---------- */
  if (panel) {
    panel.addEventListener("click", async (e) => {
      const evb = e.target.closest("[data-ev]");
      if (evb) { openEvent(evb.dataset.ev); return; }
      const dn = e.target.closest("[data-dnav]");
      if (dn) { const n = +dn.dataset.dnav; selectDay(n === 0 ? today : addDays(S.day, n)); return; }
      if (e.target.closest("[data-addday]")) {
        $("#gcDate").value = ymd(S.day);
        $("#gcTitleIn").focus();
        $("#gcForm").scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      const dc = e.target.closest("[data-day]");
      if (dc) { selectDay(dateOnly(dc.dataset.day), e.target.closest("button") && matchMedia("(max-width: 860px)").matches); return; }
      const nav = e.target.closest("[data-nav]");
      if (nav) {
        const n = +nav.dataset.nav;
        S.month = n === 0 ? new Date(today.getFullYear(), today.getMonth(), 1) : new Date(S.month.getFullYear(), S.month.getMonth() + n, 1);
        S.day = n === 0 ? today : new Date(S.month);
        S.monthEvents = [];
        drawMonth();
        watchMonth();
        return;
      }
      const rb = e.target.closest("[data-rem]");
      if (rb && S.mcp) {
        const r = reminderCandidates().find((x) => x.key === rb.dataset.rem);
        if (!r) return;
        rb.disabled = true; rb.textContent = "Menyimpan…";
        try {
          const d = dateOnly(r.date);
          await create({ summary: r.summary, description: r.desc, allDay: true, startTime: local(d), endTime: local(addDays(d, 1)), overrideReminders: [{ method: "popup", minutes: 2340 }, { method: "popup", minutes: 900 }] });
          rb.outerHTML = `<span class="pill pill--ok">Sudah di kalender</span>`;
          if (window.DULog) window.DULog.add("GA", `Membuat pengingat ponsel: ${r.summary}`);
        } catch (err) {
          rb.disabled = false; rb.textContent = "Coba lagi";
          rb.title = errMsg(err);
        }
      }
    });
    const form = $("#gcForm"), allDay = $("#gcAllDay"), times = $("#gcTimes"), msg = $("#gcFormMsg"), btn = $("#gcSubmit");
    allDay.addEventListener("change", () => { times.hidden = allDay.checked; });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!S.mcp) { msg.textContent = "Google Calendar hanya bisa dipakai di versi claude.ai."; return; }
      const f = form.elements, d = new Date(f.date.value + "T00:00:00");
      if (isNaN(d) || !f.title.value.trim()) { msg.textContent = "Isi judul dan tanggal dulu."; return; }
      let start, end;
      if (allDay.checked) { start = local(d); end = local(addDays(d, 1)); }
      else {
        if (f.end.value <= f.start.value) { msg.textContent = "Jam selesai harus setelah jam mulai."; return; }
        start = `${f.date.value}T${f.start.value}:00`; end = `${f.date.value}T${f.end.value}:00`;
      }
      const input = { summary: `${f.bidang.value} - ${f.title.value.trim()}`, startTime: start, endTime: end, allDay: allDay.checked, overrideReminders: f.reminder.value.split(",").map((m) => ({ method: "popup", minutes: +m })) };
      if (f.location.value.trim()) input.location = f.location.value.trim();
      if (f.desc.value.trim()) input.description = f.desc.value.trim();
      btn.disabled = true; btn.textContent = "Menyimpan…"; msg.textContent = "";
      try {
        await create(input);
        msg.textContent = `Tersimpan di Google Calendar: ${input.summary}`;
        if (window.DULog) window.DULog.add(f.bidang.value, `Menambah agenda Google Calendar: ${f.title.value.trim()} (${fmt(d, { day: "numeric", month: "short" })})`);
        f.title.value = ""; f.location.value = ""; f.desc.value = "";
      } catch (err) {
        msg.textContent = errMsg(err);
      }
      btn.disabled = false; btn.textContent = "Simpan ke Google Calendar";
    });
  }

  async function boot() {
    drawMonth(); drawUpcoming(); setStatus();
    if (!window.claude || typeof window.claude.use !== "function") { S.mode = "local"; setStatus(); drawUpcoming(); return; }
    S.mcp = await claude.use("mcp");
    if (!S.mcp) { S.mode = "local"; setStatus(); drawUpcoming(); return; }
    watchMonth();
    watchUpcoming();
  }
  boot();
})();
