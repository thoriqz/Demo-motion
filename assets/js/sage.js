/* =========================================================
   Tampilan Sage Soft: navigasi per bidang, Beranda, pencarian, notifikasi.
   Modul tiap bidang dirender oleh app.js (logika sama dengan tampilan Blueprint).
   ========================================================= */
(function () {
  "use strict";

  const D = window.DU_DATA;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const today = new Date();
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const get = (k, f) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch (e) { return f; } };
  const rpShort = (n) => {
    const a = Math.abs(n), s = n < 0 ? "−" : "";
    if (a >= 1e9) return s + "Rp " + (a / 1e9).toLocaleString("id-ID", { maximumFractionDigits: 2 }) + " M";
    if (a >= 1e6) return s + "Rp " + (a / 1e6).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + " jt";
    return s + "Rp " + a.toLocaleString("id-ID");
  };

  const VIEWS = {
    home: { title: "Halo, Divisi Umum!", lead: "Pantau informasi dan aktivitas operasional kantor & proyek" }
  };
  $$("section.view").forEach((v) => {
    const h = $(".view-head", v);
    if (h) VIEWS[v.id] = { title: $("h2", h).textContent, lead: $("p", h).textContent };
  });

  /* ---------- Daftar modul (untuk akses cepat & pencarian) ---------- */
  const MODULES = $$(".modtabs [role=tab]").map((t) => ({
    id: t.dataset.panel,
    view: t.closest("section.view").id,
    name: t.textContent.replace(/^\s*\d+\s*/, "").trim(),
    division: VIEWS[t.closest("section.view").id].title
  }));
  MODULES.push({ id: null, view: "legal", name: "Arsip Dokumen Eksternal", division: "Legal" });

  /* ---------- Router ---------- */
  let current = null;
  function show(view, tab) {
    if (!VIEWS[view]) view = "home";
    if (view !== current) {
      $$("section.view").forEach((v) => { v.hidden = v.id !== view; });
      const sec = document.getElementById(view);
      sec.classList.remove("is-entering");
      void sec.offsetWidth;
      sec.classList.add("is-entering");
      $$(".s-side a[data-view]").forEach((a) => a.classList.toggle("is-active", a.dataset.view === view));
      $("#viewTitle").textContent = VIEWS[view].title;
      $("#viewLead").textContent = VIEWS[view].lead;
      $("#viewTitle").classList.remove("is-swap"); void $("#viewTitle").offsetWidth; $("#viewTitle").classList.add("is-swap");
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      current = view;
      if (view === "home") renderHome();
    }
    if (tab) { const b = $(`[data-panel="${tab}"]`); if (b) b.click(); }
  }
  const route = () => show(location.hash.replace("#", "") || "home");
  addEventListener("hashchange", route);
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-tab]");
    if (!a) return;
    e.preventDefault();
    const view = a.getAttribute("href").slice(1);
    if (location.hash !== "#" + view) history.pushState(null, "", "#" + view);
    show(view, a.dataset.tab);
  });

  /* ---------- Beranda ---------- */
  function wavePath(vals, W, H, pad) {
    const max = Math.max(...vals) * 1.1, min = Math.min(...vals) * 0.7;
    const pts = vals.map((v, i) => [(i * W) / (vals.length - 1), H - pad - ((v - min) / (max - min)) * (H - pad * 2)]);
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], cx = (x0 + x1) / 2;
      d += ` C${cx.toFixed(1)} ${y0.toFixed(1)}, ${cx.toFixed(1)} ${y1.toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    }
    return { d, pts };
  }

  function countTo(el, to, suffix = "") {
    if (reduceMotion) { el.textContent = to + suffix; return; }
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / 1100);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function renderHome() {
    const docs = window.DUDocs;
    const letters = docs ? docs.count("admin") : 0;
    const closing = get("du-close", null) || D.closing.tasks.map((t) => t.done);
    const closePct = Math.round((closing.filter(Boolean).length / closing.length) * 100);
    const procN = docs ? docs.count("procurement") : 0;
    const legalN = docs ? docs.count("legal") : 0;
    const kinds = docs ? docs.byKind("procurement") : {};
    $("#hPo").textContent = procN;
    $("#hPoSub").textContent = procN ? `${Object.keys(kinds).length} jenis dokumen` : "belum ada lampiran";
    const kv = Object.values(kinds), kmax = Math.max(1, ...kv);
    $("#hPoBars").innerHTML = (kv.length ? kv : [0, 0, 0, 0]).slice(0, 5).map((n, k) => `<i style="--h:${16 + (n / kmax) * 84}%;--k:${k}" class="${n ? "" : "lo"}"></i>`).join("");
    countTo($("#hLetters"), letters);
    countTo($("#hPeople"), D.employees.length + D.freelancers.length);
    countTo($("#hClose"), closePct, "%");

    // Arus kas bulanan
    const r = D.reports.Bulanan, last = r.in.length - 1;
    const net = r.in[last] - r.out[last], prevNet = r.in[last - 1] - r.out[last - 1];
    const delta = ((r.in[last] - r.in[last - 1]) / r.in[last - 1]) * 100;
    $("#hCashChips").innerHTML = `
      <div class="chip2" style="--k:0"><span class="lb">Pemasukan ${esc(r.labels[last])}</span><b>${rpShort(r.in[last] * 1e6)}</b><span class="pill pill--${delta >= 0 ? "ok" : "danger"}">${delta >= 0 ? "+" : "−"}${Math.abs(delta).toFixed(1).replace(".", ",")}%</span></div>
      <div class="chip2" style="--k:1"><span class="lb">Arus kas bersih</span><b>${rpShort(net * 1e6)}</b><span class="pill pill--${net >= prevNet ? "ok" : "danger"}">${net >= prevNet ? "naik" : "turun"}</span></div>`;
    const W = 300, H = 90, w = wavePath(r.in, W, H, 10);
    $("#hWave").innerHTML = `
      <defs><linearGradient id="sFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5e8a72" stop-opacity=".2"/><stop offset="1" stop-color="#5e8a72" stop-opacity="0"/></linearGradient></defs>
      <path class="ar" d="${w.d} L${W} ${H} L0 ${H} Z"/>
      <path class="ln" pathLength="1" d="${w.d}"/>
      <circle class="end" cx="${w.pts[last][0]}" cy="${w.pts[last][1]}" r="4"/>`;
    $("#hWaveX").innerHTML = r.labels.map((l) => `<span>${esc(l)}</span>`).join("");

    // Realisasi anggaran
    const bud = D.budget.reduce((s, b) => s + b.budget, 0), act = D.budget.reduce((s, b) => s + b.actual, 0);
    const pct = Math.round((act / bud) * 100);
    $("#hBudget").textContent = rpShort(act * 1e6);
    $("#hBudgetSub").textContent = `dari RAB ${rpShort(bud * 1e6)} di ${D.budget.length} proyek`;
    $("#hGaugeTxt").textContent = pct + "%";
    const g = $("#hGauge"), nd = $("#hNeedle");
    g.style.strokeDasharray = "0 100";
    nd.style.transform = "rotate(0deg)";
    requestAnimationFrame(() => requestAnimationFrame(() => {
      g.style.strokeDasharray = `${pct} 100`;
      nd.style.transform = `rotate(${(pct / 100) * 180}deg)`;
    }));

    // Tugas terbuka: tugas pelaporan periode berjalan yang belum selesai
    let tasks = 0;
    if (window.DUTasks) { const t = window.DUTasks.summary(); tasks += t.Belum + t.Proses; }
    countTo($("#hTasks"), tasks);
    $("#hModN").textContent = MODULES.length;

    buildModel();

    renderLog();

    // Arsip legal
    $("#hSecTitle").textContent = `${legalN} PDF legal`;
    const lastLegal = docs ? docs.latest("legal", 1)[0] : null;
    $("#hSecSub").textContent = lastLegal ? `Terakhir: ${lastLegal.name}` : "Belum ada dokumen yang diunggah";

    renderCal();

    // Akses cepat
    $("#hMods").innerHTML = ["ga", "adm", "fin", "hr", "legal", "tugas"].map((v) => `
      <div class="modgrp"><span class="lb">${esc(VIEWS[v].title)}</span>
        ${MODULES.filter((m) => m.view === v).map((m) => `<a href="#${v}" ${m.id ? `data-tab="${m.id}"` : ""}>${esc(m.name)}</a>`).join("")}</div>`).join("");
  }
  document.addEventListener("du:change", () => { if (current === "home") renderHome(); });
  document.addEventListener("du:docs", () => { if (current === "home") renderHome(); });
  document.addEventListener("du:tasks", () => buildNotes());
  document.addEventListener("du:meet", () => buildNotes());
  document.addEventListener("du:cal", () => { if (current === "home") renderCal(); buildNotes(); });

  /* Model bangunan 3D modern (aksonometri berputar) — murni dekorasi arsitektur.
     Menara berpilin: tiap lantai kotak kaca + pelat tipis, berputar 7° per lantai. */
  function buildModel() {
    const host = $("#hIso");
    if (!host || host.dataset.built) return;
    host.dataset.built = "1";
    const parts = [];
    let k = 0;
    const add = (m) => parts.push({ k: k++, r: 0, anim: "rise", ...m });
    // tapak: kolam & lansekap
    add({ kind: "pool", x: 70, z: -62, w: 92, d: 40, h: 2, y: 0 });
    // lobi kaca di atas kolom ramping
    add({ kind: "glass", x: -24, z: 4, w: 64, d: 48, h: 20, y: 0 });
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sz]) => add({ kind: "col", x: -24 + sx * 44, z: 4 + sz * 33, w: 4, d: 4, h: 20, y: 0 }));
    // menara berpilin
    const FL = 7, FH = 18, SH = 4;
    for (let i = 0; i < FL; i++) {
      const y = 20 + i * (FH + SH), r = i * 7;
      add({ kind: "slab", x: -24, z: 4, w: 100, d: 78, h: SH, y, r, anim: "drop" });
      add({ kind: "glass", x: -24, z: 4, w: 86, d: 64, h: FH, y: y + SH, r, anim: "drop" });
    }
    const top = 20 + FL * (FH + SH);
    add({ kind: "slab", x: -24, z: 4, w: 104, d: 82, h: 6, y: top, r: FL * 7, anim: "drop" });
    add({ kind: "core", x: -36, z: 0, w: 34, d: 26, h: 14, y: top + 6, r: FL * 7, anim: "drop" });
    // sayap kantilever beratap hijau
    add({ kind: "glass", x: 70, z: 34, w: 52, d: 44, h: 14, y: 0 });
    add({ kind: "solid", x: 78, z: 34, w: 96, d: 62, h: 24, y: 14, roof: "green" });
    const face = (cls, w, h, t) => `<i class="b3d__f b3d__f--${cls}" style="width:${w}px;height:${h}px;margin:${-h / 2}px 0 0 ${-w / 2}px;transform:${t}"></i>`;
    const box = (m) => `<div class="b3d__box b3d__box--${m.kind}${m.roof ? " b3d__box--roof-" + m.roof : ""}" style="transform:translate3d(${m.x}px,${-(m.y + m.h / 2)}px,${m.z}px) rotateY(${m.r}deg)">
        <div class="b3d__in b3d__in--${m.anim}" style="--h:${m.h}px;--k:${m.k}">
          ${face("fr", m.w, m.h, `translateZ(${m.d / 2}px)`)}${face("bk", m.w, m.h, `rotateY(180deg) translateZ(${m.d / 2}px)`)}
          ${face("lf", m.d, m.h, `rotateY(-90deg) translateZ(${m.w / 2}px)`)}${face("rt", m.d, m.h, `rotateY(90deg) translateZ(${m.w / 2}px)`)}
          ${face("tp", m.w, m.d, `rotateX(90deg) translateZ(${m.h / 2}px)`)}
        </div></div>`;
    const trees = [[-112, 70, 1], [-92, -78, .8], [138, -18, .9], [12, 96, .75]].map(([x, z, s], i) =>
      `<div class="b3d__tree" style="transform:translate3d(${x}px,0,${z}px) scale(${s});--t:${i}"><span class="b3d__tree-in"><i></i><i></i></span></div>`).join("");
    host.innerHTML = `<div class="b3d__scene"><div class="b3d__rot">
      <div class="b3d__ground"></div>${parts.map(box).join("")}${trees}
    </div></div><span class="b3d__tag">AKSONOMETRI · 1:200</span>`;
  }

  /* Riwayat aktivitas harian (koleksi "activity") */
  const LOG = { rows: [], mode: "loading", day: new Date(today.toDateString()), area: "Semua" };
  const AREAS = ["Semua", "GA", "Admin", "Finance", "HR", "Legal", "Umum", "Proyek"];
  const ymdL = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  async function renderLog() {
    const ol = $("#hLog");
    if (!ol) return;
    const key = ymdL(LOG.day), isToday = key === ymdL(new Date());
    const dayRows = LOG.rows.filter((r) => r.day === key);
    const present = AREAS.filter((a) => a === "Semua" || dayRows.some((r) => r.area === a));
    if (!present.includes(LOG.area)) LOG.area = "Semua";
    $("#hLogDay").textContent = isToday ? "Hari ini" : LOG.day.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" });
    $("#hLogState").textContent = LOG.mode === "live" ? `${dayRows.length} aktivitas` : LOG.mode === "local" ? "tersimpan di browser ini" : "memuat…";
    $("#hLogChips").innerHTML = present.map((a) => `<button type="button" aria-pressed="${a === LOG.area}" data-logarea="${esc(a)}">${esc(a)} <b>${a === "Semua" ? dayRows.length : dayRows.filter((r) => r.area === a).length}</b></button>`).join("");
    const rows = dayRows.filter((r) => LOG.area === "Semua" || r.area === LOG.area);
    const names = window.DUStore ? await window.DUStore.names(rows.map((r) => r.by)) : {};
    ol.innerHTML = rows.map((r, k) => `<li style="--k:${Math.min(k, 8)}">
        <span class="h-log__time">${esc(new Date(r.at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }))}</span>
        <span class="h-log__txt"><b>${esc(r.text)}</b><small>${r.by ? esc((names[r.by] && names[r.by].name) || "Anggota tim") : "—"}</small></span>
        <span class="tag">${esc(r.area)}</span></li>`).join("")
      || `<li class="h-log__empty">${LOG.mode === "loading" ? "Memuat riwayat…" : isToday ? "Belum ada aktivitas hari ini. Upload PDF, input FPP, atau tugas harian akan tercatat di sini." : "Tidak ada aktivitas di tanggal ini."}</li>`;
  }
  document.addEventListener("click", (e) => {
    const n = e.target.closest("[data-lognav]");
    if (n) {
      const k = +n.dataset.lognav;
      if (k === 0) LOG.day = new Date(new Date().toDateString());
      else { const d = new Date(LOG.day); d.setDate(d.getDate() + k); if (d <= new Date()) LOG.day = d; }
      renderLog(); return;
    }
    const a = e.target.closest("[data-logarea]");
    if (a) { LOG.area = a.dataset.logarea; renderLog(); }
  });
  if (window.DUStore) window.DUStore.watch("activity", (rows, mode) => {
    LOG.mode = mode === "error" ? "local" : mode;
    if (rows) LOG.rows = rows;
    if (current === "home") renderLog();
  }, { limit: 1000 });

  /* Agenda Google Calendar di Beranda */
  function renderCal() {
    const C = window.DUCal, ul = $("#hCal"), st = $("#hCalState");
    if (!C || !ul) return;
    const evs = C.upcoming().slice(0, 6), mode = C.mode();
    st.textContent = mode === "live" ? "14 hari ke depan" : mode === "local" ? "hanya di versi claude.ai" : mode === "error" ? "belum tersambung" : "memuat…";
    ul.innerHTML = evs.length ? evs.map((e, k) => {
      const d = e.firstDay;
      return `<li style="--k:${k}"><a href="${esc(e.link)}" target="_blank" rel="noopener" data-preview="${esc(e.id)}">
        <span class="h-cal__date"><b>${d.getDate()}</b><small>${esc(d.toLocaleDateString("id-ID", { month: "short" }))}</small></span>
        <span class="h-cal__txt"><b>${esc(e.short)}</b><small>${esc(e.allDay ? (+e.firstDay === +e.lastDay ? "Seharian" : "s.d. " + e.lastDay.toLocaleDateString("id-ID", { day: "numeric", month: "short" })) : e.time)}${e.tag ? " · " + esc(e.tag) : ""}</small></span></a></li>`;
    }).join("") : `<li class="h-cal__empty">${esc(mode === "live" ? "Tidak ada agenda dalam 14 hari ke depan." : mode === "error" ? C.error() : "Agenda dari Google Calendar akan tampil di sini.")}</li>`;
  }

  $("#hCal").addEventListener("click", (e) => {
    const a = e.target.closest("[data-preview]");
    if (a && window.DUCal && window.DUCal.preview) { e.preventDefault(); window.DUCal.preview(a.dataset.preview); }
  });

  /* ---------- Pencarian modul ---------- */
  const input = $("#sSearch"), results = $("#sResults");
  let hits = [], sel = 0;
  const drawResults = () => {
    const q = input.value.trim().toLowerCase();
    hits = q ? MODULES.filter((m) => (m.name + " " + m.division).toLowerCase().includes(q)).slice(0, 7) : [];
    results.hidden = !q;
    results.innerHTML = hits.length
      ? hits.map((m, i) => `<li><a href="#${m.view}" ${m.id ? `data-tab="${m.id}"` : ""} class="${i === sel ? "is-sel" : ""}"><b>${esc(m.name)}</b><small>${esc(m.division)}</small></a></li>`).join("")
      : `<li class="empty">Modul tidak ditemukan</li>`;
  };
  input.addEventListener("input", () => { sel = 0; drawResults(); });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + hits.length) % Math.max(hits.length, 1); drawResults(); }
    if (e.key === "Enter" && hits[sel]) { e.preventDefault(); $$("a", results)[sel].click(); }
    if (e.key === "Escape") { input.value = ""; drawResults(); }
  });
  results.addEventListener("click", (e) => { if (e.target.closest("a")) { input.value = ""; results.hidden = true; input.blur(); } });
  document.addEventListener("click", (e) => { if (!e.target.closest(".s-search")) results.hidden = true; });

  /* ---------- Notifikasi ---------- */
  const bell = $("#sBell"), notes = $("#sNotes");
  function buildNotes() {
    const items = [];
    if (D.inventory) {
      const t0 = new Date(today.toDateString());
      const due = D.inventory.assets.filter((a) => a.perawatan && (new Date(a.perawatan + "T00:00:00") - t0) / 864e5 <= 7);
      if (due.length) items.push({ t: `${due.length} aset jadwal perawatan dalam 7 hari`, v: "ga", tab: "ga-asset", tone: "warn" });
    }
    if (window.DUCal) {
      const t0 = new Date(today.toDateString()), t2 = new Date(t0); t2.setDate(t0.getDate() + 2);
      window.DUCal.upcoming().filter((e) => e.firstDay < t2 && e.lastDay >= t0).slice(0, 4).forEach((e) => items.push({ t: `${+e.firstDay <= +t0 ? "Hari ini" : "Besok"}: ${e.short}`, v: "ga", tab: "ga-cal", tone: "info" }));
    }
    if (window.DUTasks) {
      window.DUTasks.due().slice(0, 4).forEach((d) => items.push({ t: `Tugas ${d.n === 0 ? "hari ini" : d.n === 1 ? "besok" : d.n + " hari lagi"}: ${d.it.name}`, v: "tugas", tone: d.n === 0 ? "danger" : "warn" }));
    }
    if (window.DUMeet) window.DUMeet.today().slice(0, 3).forEach((e) => items.push({ t: `Meeting klien hari ini${e.time ? " " + e.time : ""}: ${e.short}`, v: "ga", tab: "ga-meet", tone: "info" }));
    $("#sNoteList").innerHTML = items.map((n) => `<li><a href="#${n.v}" ${n.tab ? `data-tab="${n.tab}"` : ""}><i class="tone tone--${n.tone}"></i>${esc(n.t)}</a></li>`).join("");
    $("#sDot").hidden = !items.length;
  }
  bell.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = notes.hidden;
    buildNotes();
    notes.hidden = !open;
    bell.setAttribute("aria-expanded", open);
  });
  notes.addEventListener("click", (e) => { if (e.target.closest("a")) { notes.hidden = true; bell.setAttribute("aria-expanded", false); } });
  document.addEventListener("click", (e) => { if (!e.target.closest(".s-notif")) { notes.hidden = true; bell.setAttribute("aria-expanded", false); } });
  $("#sCal").addEventListener("click", () => { history.pushState(null, "", "#ga"); show("ga", "ga-cal"); });

  buildNotes();
  route();
})();
