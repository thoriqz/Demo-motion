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
    const proc = get("du-proc", null) || D.procurement;
    const letters = get("du-letters", []).length + D.letters.length;
    const closing = get("du-close", null) || D.closing.tasks.map((t) => t.done);
    const closePct = Math.round((closing.filter(Boolean).length / closing.length) * 100);
    const open = proc.filter((p) => p.step < 4);

    countTo($("#hPo"), open.length);
    $("#hPoSub").textContent = `${proc.filter((p) => p.step <= 1).length} menunggu approval`;
    $("#hPoBars").innerHTML = D.procurementSteps.map((s, k) => {
      const n = proc.filter((p) => p.step === k).length;
      return `<i style="--h:${20 + n * 26}%;--k:${k}" class="${k === 4 ? "lo" : ""}" title="${esc(s)}: ${n}"></i>`;
    }).join("");
    countTo($("#hLetters"), letters);
    countTo($("#hPeople"), 58 + D.freelancers.length);
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

    // Tugas terbuka: tindak lanjut notulen + tiket baru
    const mom = get("du-mom", {});
    let tasks = 0;
    D.minutes.forEach((m) => m.actions.forEach((a, i) => { if (!(mom[m.id + i] ?? a.done)) tasks++; }));
    tasks += (get("du-serv", null) || D.services).filter((s) => s.stage === 0).length;
    countTo($("#hTasks"), tasks);

    // Tumpukan kontrak
    const contracts = D.legalDocs.filter((d) => d.cat.startsWith("Kontrak")).slice(0, 3).reverse();
    $("#hIso").innerHTML = contracts.map((c, k) => `<div class="cd" style="--k:${k}">${esc(c.title)}<small>${esc(c.party)} · ${c.daysLeft} hari lagi</small></div>`).join("");

    // Aktivitas terbaru
    const acts = [
      ...D.letters.slice(0, 2).map((l) => ({ t: `${l.type} · ${l.subject}`, s: `${l.party} · ${l.date}`, p: l.value ? rpShort(l.value) : l.status, tone: l.type === "INV" ? "ok" : "info" })),
      ...D.clientRequests.filter((c) => c.status !== "Selesai").slice(0, 2).map((c) => ({ t: c.req, s: `${c.client} · ${c.channel}, ${c.at}`, p: c.status, tone: c.status === "Menunggu" ? "warn" : "info" }))
    ];
    $("#hAct").innerHTML = acts.map((a, k) => `<li style="--k:${k}"><div><b>${esc(a.t)}</b><small>${esc(a.s)}</small></div><span class="pill pill--${a.tone}">${esc(a.p)}</span></li>`).join("");

    // Izin terdekat
    const next = D.legalDocs.filter((d) => d.daysLeft != null).sort((a, b) => a.daysLeft - b.daysLeft)[0];
    $("#hSecTitle").textContent = next.daysLeft <= 30 ? "Segera perpanjang" : "Izin tetap aman";
    $("#hSecSub").textContent = `${next.title} berakhir dalam ${next.daysLeft} hari`;

    // Akses cepat
    $("#hMods").innerHTML = ["ga", "adm", "fin", "hr", "legal"].map((v) => `
      <div class="modgrp"><span class="lb">${esc(VIEWS[v].title)}</span>
        ${MODULES.filter((m) => m.view === v).map((m) => `<a href="#${v}" ${m.id ? `data-tab="${m.id}"` : ""}>${esc(m.name)}</a>`).join("")}</div>`).join("");
  }
  document.addEventListener("du:change", () => { if (current === "home") renderHome(); });

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
    D.legalDocs.filter((d) => d.daysLeft != null && d.daysLeft <= 45).forEach((d) => items.push({ t: `${d.title} berakhir ${d.daysLeft} hari lagi`, v: "legal", tone: d.daysLeft <= 30 ? "danger" : "warn" }));
    D.stock.filter((s) => s.value < s.min).forEach((s) => items.push({ t: `Stok ${s.name} di bawah minimum (${s.value}%)`, v: "ga", tab: "ga-asset", tone: "warn" }));
    D.clientRequests.filter((c) => c.status === "Menunggu").forEach((c) => items.push({ t: `${c.client} menunggu respons`, v: "ga", tab: "ga-client", tone: "warn" }));
    const proc = get("du-proc", null) || D.procurement;
    const wait = proc.filter((p) => p.step <= 1).length;
    if (wait) items.push({ t: `${wait} PR menunggu approval`, v: "ga", tab: "ga-proc", tone: "info" });
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
