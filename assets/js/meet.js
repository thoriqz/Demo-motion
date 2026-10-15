/* =========================================================
   GA → Pelayanan Umum & Tamu: jadwal meeting dengan klien dari
   Google Calendar (connector claude.ai "Google Calendar").
   Acara dianggap meeting klien bila judul/catatan/lokasinya memuat
   kata kunci (meeting, klien, tamu, konsultasi, presentasi, survei, …).
   ========================================================= */
(function () {
  "use strict";

  const root = document.getElementById("meetApp");
  if (!root) return;
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const SKIN = document.body.dataset.skin || "blueprint";
  const up = (s) => (SKIN === "blueprint" ? String(s).toUpperCase() : String(s));
  const KEY = /\b(meet(ing)?|klien|client|tamu|konsultasi|presentasi|kunjungan|visit|survei|survey|site ?visit|rapat dengan|pertemuan|serah terima|bast|owner)\b/i;
  const today = new Date(new Date().toDateString());
  const TZ = ((window.DU_DATA || {}).googleCalendar || {}).timeZone || undefined;
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const fmt = (d, o) => d.toLocaleDateString("id-ID", o);
  const S = { mode: "loading", err: "", all: [], filter: "meet", updated: null };

  root.innerHTML = `
    <div class="gc-status" id="mtStatus"><span class="gc-dot"></span><span class="mt-st">Menghubungkan ke Google Calendar…</span></div>
    <div class="stat-row mt-stats"></div>
    <article class="panel panel--wide">
      <div class="panel__head">
        <h3 class="panel__title mono">${esc(up("Jadwal meeting dengan klien"))}</h3>
        <div class="toolbar">
          <div class="tabs" role="group" aria-label="Jenis agenda">
            <button type="button" data-mf="meet" aria-pressed="true">Meeting klien</button>
            <button type="button" data-mf="all" aria-pressed="false">Semua agenda</button>
          </div>
          <button type="button" class="btn btn--solid mt-new">+ Jadwalkan meeting</button>
        </div>
      </div>
      <h4 class="mini-title mono">${esc(up("Akan datang · 60 hari"))}</h4>
      <ol class="gc-day mt-up"></ol>
      <h4 class="mini-title mono">${esc(up("Riwayat · 30 hari terakhir"))}</h4>
      <ol class="gc-day mt-past"></ol>
      <p class="note mono">Sumber: Google Calendar kantor. Meeting klien dikenali dari kata kunci di judul/catatan/lokasi (meeting, klien, tamu, konsultasi, presentasi, kunjungan, survei, serah terima). Klik acara untuk pratinjau.</p>
    </article>`;

  const isMeet = (e) => KEY.test(`${e.title} ${e.desc} ${e.location}`);
  const time = (e) => (e.allDay ? "Seharian" : e.time + (e.end && +e.end !== +e.start ? " – " + e.end.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: TZ }) : ""));
  const item = (e) => `<li><button type="button" data-mid="${esc(e.id)}">
      <span class="gc-day__time mono">${esc(fmt(e.firstDay, { weekday: "short", day: "2-digit", month: "short" }))}<br>${esc(time(e))}</span>
      <span class="gc-day__txt"><b>${esc(e.short)}</b>${e.location ? `<small>📍 ${esc(e.location)}</small>` : ""}</span>
      ${e.tag ? `<span class="tag">${esc(e.tag)}</span>` : ""}</button></li>`;

  function draw() {
    const st = $(".mt-st", root);
    $("#mtStatus").dataset.state = S.mode;
    st.textContent = S.mode === "live" ? `Tersambung ke Google Calendar${S.updated ? " · diperbarui " + S.updated.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : ""}`
      : S.mode === "local" ? "Jadwal meeting dari Google Calendar tampil saat webapp dibuka di claude.ai."
        : S.mode === "error" ? S.err : "Menghubungkan ke Google Calendar…";
    const meets = S.all.filter(isMeet), list = S.filter === "meet" ? meets : S.all;
    const upc = list.filter((e) => e.lastDay >= today), past = list.filter((e) => e.lastDay < today).reverse();
    const wk = addDays(today, 7);
    const m = (a) => a.filter(isMeet).length;
    $(".mt-stats", root).innerHTML =
      `<div class="stat stat--ok"><span class="mono">${esc(up("Meeting hari ini"))}</span><b>${meets.filter((e) => e.firstDay <= today && e.lastDay >= today).length}</b><small>${esc(fmt(today, { weekday: "long", day: "numeric", month: "long" }))}</small></div>` +
      `<div class="stat stat--info"><span class="mono">${esc(up("7 hari ke depan"))}</span><b>${meets.filter((e) => e.lastDay >= today && e.firstDay < wk).length}</b><small>meeting klien terjadwal</small></div>` +
      `<div class="stat"><span class="mono">${esc(up("60 hari ke depan"))}</span><b>${m(S.all.filter((e) => e.lastDay >= today))}</b><small>dari ${S.all.filter((e) => e.lastDay >= today).length} agenda</small></div>` +
      `<div class="stat"><span class="mono">${esc(up("Terlaksana 30 hari"))}</span><b>${m(S.all.filter((e) => e.lastDay < today))}</b><small>meeting klien selesai</small></div>`;
    const empty = (t) => `<li class="gc-empty"><span class="note">${esc(S.mode === "live" ? t : st.textContent)}</span></li>`;
    $(".mt-up", root).innerHTML = upc.map(item).join("") || empty(S.filter === "meet" ? "Belum ada meeting klien terjadwal. Tekan “+ Jadwalkan meeting”." : "Tidak ada agenda.");
    $(".mt-past", root).innerHTML = past.slice(0, 20).map(item).join("") || empty("Belum ada riwayat dalam 30 hari terakhir.");
  }

  root.addEventListener("click", (e) => {
    const f = e.target.closest("[data-mf]");
    if (f) { S.filter = f.dataset.mf; root.querySelectorAll("[data-mf]").forEach((b) => b.setAttribute("aria-pressed", String(b === f))); draw(); return; }
    const b = e.target.closest("[data-mid]");
    if (b) { const ev = S.all.find((x) => x.id === b.dataset.mid); if (ev && window.DUCal && window.DUCal.showEvent) window.DUCal.showEvent(ev); return; }
    if (e.target.closest(".mt-new")) {
      const tab = document.getElementById("tab-ga-cal");
      if (tab) tab.click();
      setTimeout(() => {
        const t = document.getElementById("gcTitleIn"), bd = document.getElementById("gcBidang");
        if (bd) bd.value = "Umum";
        if (t) { if (!t.value) t.value = "Meeting klien "; t.focus(); t.setSelectionRange(t.value.length, t.value.length); t.scrollIntoView({ behavior: "smooth", block: "center" }); }
      }, 120);
    }
  });

  async function boot() {
    draw();
    const C = window.DUCal;
    if (!C || !window.claude || typeof window.claude.use !== "function") { S.mode = "local"; draw(); return; }
    const mcp = await claude.use("mcp");
    if (!mcp) { S.mode = "local"; draw(); return; }
    const input = { startTime: C.local(addDays(today, -30)), endTime: C.local(addDays(today, 61)), orderBy: "startTime", pageSize: 250 };
    if (C.calendarId) input.calendarId = C.calendarId;
    mcp.watchTool("Google Calendar", "list_events", input, (ev) => {
      if (ev.type === "data") { S.all = C.events(ev.result.payload); S.mode = "live"; S.updated = new Date(); }
      else { S.mode = "error"; S.err = C.errMsg(ev.error); if (/needs_reauth|not_in_manifest|server_not_connected|blocked_by_policy/.test(ev.error && ev.error.code)) S.all = []; }
      draw();
      document.dispatchEvent(new CustomEvent("du:meet"));
    }, { refetchInterval: 300000 });
  }
  window.DUMeet = { today: () => S.all.filter((e) => isMeet(e) && e.firstDay <= today && e.lastDay >= today) };
  boot();
})();
