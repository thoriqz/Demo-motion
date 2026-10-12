/* =========================================================
   Divisi Umum — Roemantara Indonesia : interaksi & motion
   ========================================================= */
(function () {
  "use strict";

  const D = window.DU_DATA;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const today = new Date();
  const fmtDate = (d, opt = { day: "2-digit", month: "short", year: "numeric" }) => d.toLocaleDateString("id-ID", opt);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const store = {
    get(k, fallback) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* abaikan */ } }
  };

  /* Panggil fn sekali saat elemen masuk viewport */
  const inViewQueue = new Map();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      const fn = inViewQueue.get(e.target);
      if (fn) { fn(e.target); inViewQueue.delete(e.target); }
      io.unobserve(e.target);
    });
  }, { threshold: 0.18, rootMargin: "0px 0px -40px 0px" });
  const onIn = (el, fn) => { if (!el) return; if (fn) inViewQueue.set(el, fn); io.observe(el); };

  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("is-on"), 2400);
  }

  function countUp(el, to, dur = 1400) {
    if (reduceMotion) { el.textContent = to; return; }
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------------- LOADER ---------------- */
  function boot() {
    document.body.classList.add("is-loading");
    const pct = $("#loaderPct");
    const dur = reduceMotion ? 1 : 1300;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      pct.textContent = String(Math.round(p * 100)).padStart(3, "0") + "%";
      if (p < 1) return requestAnimationFrame(tick);
      $("#loader").classList.add("is-done");
      document.body.classList.remove("is-loading");
      document.body.classList.add("is-ready");
    };
    requestAnimationFrame(tick);
  }

  /* ---------------- TEMA ---------------- */
  function initTheme() {
    const root = document.documentElement;
    const label = $("#themeLabel");
    const apply = (t) => {
      if (t === "light") root.setAttribute("data-theme", "light"); else root.removeAttribute("data-theme");
      label.textContent = t === "light" ? "KALKIR" : "BLUEPRINT";
    };
    apply(store.get("du-theme", "dark"));
    $("#themeToggle").addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      apply(next);
      store.set("du-theme", next);
    });
  }

  /* ---------------- KURSOR CAD ---------------- */
  function initCad() {
    if (reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;
    const cad = $("#cad"), h = $(".cad__h", cad), v = $(".cad__v", cad), box = $(".cad__box", cad), coord = $("#cadCoord");
    document.body.classList.add("has-cad");
    let x = 0, y = 0, raf = 0;
    const paint = () => {
      raf = 0;
      h.style.transform = `translateY(${y}px)`;
      v.style.transform = `translateX(${x}px)`;
      box.style.transform = coord.style.transform = "";
      box.style.left = coord.style.left = x + "px";
      box.style.top = coord.style.top = y + "px";
      coord.style.transform = "translate(14px, 12px)";
      coord.textContent = `X ${String(Math.round(x + scrollX)).padStart(4, "0")} · Y ${String(Math.round(y + scrollY)).padStart(4, "0")}`;
    };
    addEventListener("pointermove", (e) => {
      x = e.clientX; y = e.clientY;
      cad.classList.add("is-on");
      cad.classList.toggle("is-hover", !!e.target.closest("a, button, .floor, .cand, .checklist li, input, select"));
      if (!raf) raf = requestAnimationFrame(paint);
    });
    document.addEventListener("pointerleave", () => cad.classList.remove("is-on"));
  }

  /* ---------------- GEDUNG HERO ---------------- */
  function initBuilding() {
    const floors = $$(".floor");
    const hot = (n, on) => {
      $$(`.lbl[data-floor="${n}"], .floor[data-floor="${n}"]`).forEach((el) => el.classList.toggle("is-hot", on));
      $$(`.nav a[data-floor="${n}"]`).forEach((el) => el.classList.toggle("is-hover", on));
    };
    floors.forEach((f) => {
      const n = f.dataset.floor;
      const go = () => $(f.dataset.target).scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      f.addEventListener("mouseenter", () => hot(n, true));
      f.addEventListener("mouseleave", () => hot(n, false));
      f.addEventListener("focus", () => hot(n, true));
      f.addEventListener("blur", () => hot(n, false));
      f.addEventListener("click", go);
      f.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    });
    $$(".nav a").forEach((a) => {
      a.addEventListener("mouseenter", () => hot(a.dataset.floor, true));
      a.addEventListener("mouseleave", () => hot(a.dataset.floor, false));
    });
  }

  /* ---------------- SCROLL: nav aktif, elevator, crane ---------------- */
  function initScroll() {
    const car = $("#elevCar"), label = $("#elevLabel"), hook = $(".crane__hook");
    const secs = $$(".floor-sec");
    const navLinks = $$(".nav a");
    let ticking = false;
    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(1, scrollY / max) : 0;
      car.style.bottom = `calc(${p * 100}% - ${p * 18}px)`;
      label.textContent = (p * 17.5 >= 0.005 ? "+" : "±") + (p * 17.5).toFixed(2);
      if (hook && !reduceMotion) hook.style.setProperty("--trolley", `${-Math.min(1, scrollY / innerHeight) * 300}px`);

      let active = null;
      secs.forEach((s) => { if (s.getBoundingClientRect().top < innerHeight * 0.45) active = s.id; });
      navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + active));
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ---------------- RINGKASAN KPI ---------------- */
  function renderKpi() {
    const grid = $("#kpiGrid");
    grid.innerHTML = D.kpi.map((k, i) => `
      <a class="kpi reveal" style="--d:${i}" href="${k.href}">
        <span class="kpi__floor mono">${k.floor}</span>
        <div class="kpi__value"><span data-count="${k.value}">0</span><small>${esc(k.unit)}</small></div>
        <span class="kpi__label">${esc(k.label)}</span>
      </a>`).join("");
    $$(".kpi", grid).forEach((el) => onIn(el, () => countUp($("[data-count]", el), +$("[data-count]", el).dataset.count)));
  }

  /* ---------------- GENERAL AFFAIRS ---------------- */
  function renderGA() {
    const al = $("#assetList");
    al.innerHTML = D.assets.map((a) => {
      const pct = Math.round((a.good / a.qty) * 100);
      const cls = pct < 70 ? "danger" : pct < 90 ? "warn" : "";
      return `<div class="asset">
        <div class="asset__top"><span>${esc(a.name)}</span><b>${a.good}/${a.qty} baik</b></div>
        <div class="meter"><i class="${cls}" data-w="${pct}"></i></div>
      </div>`;
    }).join("");
    onIn(al.closest(".panel"), (p) => $$("[data-w]", p).forEach((i) => (i.style.width = i.dataset.w + "%")));

    $("#maintList").innerHTML = D.maintenance.map((m) => `
      <li class="${m.status === "selesai" ? "done" : ""}">
        <span class="t-date">${esc(m.date)} · ${m.status.toUpperCase()}</span>
        <span class="t-title">${esc(m.title)}<span class="tag">${esc(m.tag)}</span></span>
      </li>`).join("");

    const sb = $("#stockBars");
    sb.innerHTML = D.stock.map((s) => {
      const cls = s.value < s.min ? "danger" : s.value < s.min * 1.25 ? "warn" : "";
      return `<div class="bar-row">
        <span>${esc(s.name)}</span><b class="${cls ? "t-" + cls : ""}">${s.value}%</b>
        <div class="meter"><i class="${cls}" data-w="${s.value}"></i><span class="min" style="left:${s.min}%" title="Batas minimum ${s.min}%"></span></div>
      </div>`;
    }).join("") + `<p class="note mono">▮ garis = batas minimum stok</p>`;
    onIn(sb.closest(".panel"), (p) => $$("[data-w]", p).forEach((i) => (i.style.width = i.dataset.w + "%")));

    $("#gaTickets").innerHTML = D.gaTickets.map((t) => `
      <div class="ticket">
        <span class="ticket__id">${esc(t.id)}</span>
        <span class="status status--${esc(t.status)}">${esc(t.status).toUpperCase()}</span>
        <span class="ticket__title">${esc(t.title)}</span>
        <span class="ticket__by">Pemohon: ${esc(t.by)}</span>
      </div>`).join("");
  }

  /* ---------------- ADMINISTRASI ---------------- */
  const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  function renderAdmin() {
    const mails = store.get("du-mails", []).concat(D.mails);
    let filter = "all";
    const body = $("#mailBody");

    const draw = (newNo) => {
      body.innerHTML = mails.filter((m) => filter === "all" || m.type === filter).map((m) => `
        <tr class="${m.no === newNo ? "is-new" : ""}">
          <td>${esc(m.no)}</td><td>${esc(m.subject)}</td><td>${esc(m.party)}</td>
          <td><span class="${m.type === "Masuk" ? "badge-in" : "badge-out"}">${m.type.toUpperCase()}</span></td>
          <td>${esc(m.date)}</td>
        </tr>`).join("");
    };
    draw();

    $$("#mailTabs button").forEach((b) => b.addEventListener("click", () => {
      $$("#mailTabs button").forEach((x) => x.setAttribute("aria-selected", x === b));
      filter = b.dataset.filter;
      draw();
    }));

    const form = $("#mailForm"), preview = $("#mailPreview");
    const nextNo = () => {
      const type = form.type.value;
      if (type === "Masuk") {
        const n = Math.max(0, ...mails.filter((m) => m.type === "Masuk").map((m) => parseInt(m.no.replace(/\D/g, ""), 10) || 0)) + 1;
        return "IN-" + String(n).padStart(4, "0");
      }
      const n = Math.max(0, ...mails.filter((m) => m.type === "Keluar").map((m) => parseInt(m.no, 10) || 0)) + 1;
      return `${String(n).padStart(3, "0")}/RMT-${form.code.value}/${ROMAN[today.getMonth()]}/${today.getFullYear()}`;
    };
    const refresh = () => {
      preview.textContent = nextNo();
      form.code.disabled = form.type.value === "Masuk";
    };
    form.addEventListener("change", refresh);
    refresh();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const m = {
        no: nextNo(), subject: form.subject.value.trim(), party: form.party.value.trim(),
        type: form.type.value, date: fmtDate(today, { day: "2-digit", month: "short" })
      };
      if (!m.subject || !m.party) return;
      mails.unshift(m);
      store.set("du-mails", mails.slice(0, mails.length - D.mails.length));
      filter = "all";
      $$("#mailTabs button").forEach((x) => x.setAttribute("aria-selected", x.dataset.filter === "all"));
      draw(m.no);
      form.subject.value = form.party.value = "";
      refresh();
      toast(`Surat ${m.no} terdaftar`);
    });

    // Agenda: tempel ke Senin–Jumat minggu berjalan
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    $("#agenda").innerHTML = D.agenda.map((a, i) => {
      const d = new Date(monday); d.setDate(monday.getDate() + i);
      const isToday = d.toDateString() === today.toDateString();
      return `<div class="agenda__day ${isToday ? "is-today" : ""}">
        <div class="agenda__hd"><b>${String(d.getDate()).padStart(2, "0")}</b><span>${a.day}${isToday ? " · HARI INI" : ""}</span></div>
        ${a.items.map((it) => `<p>${esc(it)}</p>`).join("")}
      </div>`;
    }).join("");
  }

  /* ---------------- FINANCE ---------------- */
  function renderFinance() {
    const c = D.cashflow, W = 640, H = 280, P = { l: 44, r: 14, t: 16, b: 30 };
    const max = Math.ceil(Math.max(...c.in, ...c.out) / 200) * 200;
    const x = (i) => P.l + (i * (W - P.l - P.r)) / (c.months.length - 1);
    const y = (v) => H - P.b - (v / max) * (H - P.t - P.b);
    const path = (arr) => arr.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(max * t));
    const colW = (W - P.l - P.r) / (c.months.length - 1);

    const chart = $("#cashChart");
    chart.innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik arus kas masuk dan keluar per bulan">
        <g class="axis">
          ${ticks.map((t) => `<line x1="${P.l}" x2="${W - P.r}" y1="${y(t)}" y2="${y(t)}"/><text x="${P.l - 8}" y="${y(t) + 3}" text-anchor="end">${t}</text>`).join("")}
          ${c.months.map((m, i) => `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${m}</text>`).join("")}
        </g>
        <path class="area" d="${path(c.in)} L${x(c.in.length - 1)} ${y(0)} L${x(0)} ${y(0)} Z"/>
        <line class="guide" y1="${P.t}" y2="${H - P.b}" x1="0" x2="0"/>
        <path class="ln ln--out" pathLength="1" d="${path(c.out)}"/>
        <path class="ln ln--in" pathLength="1" d="${path(c.in)}"/>
        ${c.in.map((v, i) => `<circle class="pt pt--in" r="4" cx="${x(i)}" cy="${y(v)}"/>`).join("")}
        ${c.out.map((v, i) => `<circle class="pt pt--out" r="4" cx="${x(i)}" cy="${y(v)}"/>`).join("")}
        ${c.months.map((m, i) => `<rect class="hit" data-i="${i}" x="${x(i) - colW / 2}" y="${P.t}" width="${colW}" height="${H - P.t - P.b}"/>`).join("")}
      </svg>
      <div class="chart-tip" id="chartTip"></div>`;
    onIn(chart);

    const tip = $("#chartTip"), guide = $(".guide", chart), svg = $("svg", chart);
    $$(".hit", chart).forEach((r) => {
      r.addEventListener("mouseenter", () => {
        const i = +r.dataset.i, net = c.in[i] - c.out[i];
        guide.setAttribute("x1", x(i)); guide.setAttribute("x2", x(i)); guide.style.opacity = 1;
        tip.innerHTML = `<b>${c.months[i]} 2026</b><br><span class="t-ok">Masuk ${c.in[i]}</span> · <span style="color:var(--accent-2)">Keluar ${c.out[i]}</span><br>Net <span class="${net >= 0 ? "t-ok" : "t-danger"}">${net >= 0 ? "+" : ""}${net}</span>`;
        const scale = svg.getBoundingClientRect().width / W;
        const left = x(i) * scale;
        tip.style.left = Math.min(left + 12, svg.getBoundingClientRect().width - 170) + "px";
        tip.style.top = "10px";
        tip.style.opacity = 1;
      });
      r.addEventListener("mouseleave", () => { tip.style.opacity = 0; guide.style.opacity = 0; });
    });

    // Donut termin
    const total = D.invoices.reduce((s, v) => s + v.value, 0);
    const R = 70, C = 2 * Math.PI * R;
    let off = 0;
    const segs = D.invoices.map((v) => {
      const len = (v.value / total) * C;
      const s = `<circle class="c-${v.color}" r="${R}" cx="95" cy="95" style="stroke-dasharray:0 ${C}" data-da="${len - 2} ${C - len + 2}" stroke-dashoffset="${-off}" transform="rotate(-90 95 95)"/>`;
      off += len;
      return s;
    }).join("");
    const donut = $("#invoiceDonut");
    donut.innerHTML = `
      <svg class="donut" viewBox="0 0 190 190" role="img" aria-label="Status ${total} termin">
        <circle class="track" r="${R}" cx="95" cy="95"/>${segs}
        <text x="95" y="100" data-count="${total}">0</text>
        <text x="95" y="118" class="sub">TERMIN</text>
      </svg>
      <ul class="donut-legend">${D.invoices.map((v) => `<li><span class="sw c-${v.color}"></span>${esc(v.label)}<b>${v.value}</b></li>`).join("")}</ul>`;
    onIn(donut.closest(".panel"), () => {
      $$("[data-da]", donut).forEach((s) => s.style.strokeDasharray = s.dataset.da);
      countUp($("[data-count]", donut), total);
    });

    // Anggaran vs realisasi
    const maxB = Math.max(...D.budget.map((b) => Math.max(b.budget, b.actual)));
    const bud = $("#budget");
    bud.innerHTML = D.budget.map((b) => {
      const pct = Math.round((b.actual / b.budget) * 100);
      const over = b.actual > b.budget;
      return `<div class="budget__row">
        <div class="budget__name">${esc(b.project)}<small>${esc(b.type).toUpperCase()} · PROGRES FISIK ${b.progress}%</small></div>
        <div class="budget__bars" title="Anggaran Rp ${b.budget} jt · Realisasi Rp ${b.actual} jt">
          <span class="b-plan" data-w="${(b.budget / maxB) * 100}"></span>
          <span class="b-act ${over ? "over" : ""}" data-w="${(b.actual / maxB) * 100}"></span>
        </div>
        <div class="budget__pct"><span class="${over ? "t-danger" : pct > 90 ? "t-warn" : "t-ok"}">${pct}% terserap</span><small>Rp ${b.actual.toLocaleString("id-ID")} / ${b.budget.toLocaleString("id-ID")} jt</small></div>
      </div>`;
    }).join("") + `<p class="note mono">▨ arsir = anggaran (RAB) · ▬ solid = realisasi · merah = melebihi anggaran</p>`;
    onIn(bud.closest(".panel"), (p) => $$("[data-w]", p).forEach((i) => (i.style.width = i.dataset.w + "%")));
  }

  /* ---------------- HUMAN RESOURCES ---------------- */
  function renderHR() {
    const colors = ["var(--accent)", "var(--accent-2)", "var(--ok)", "var(--line)", "var(--muted)", "#7aa7ff"];
    const total = D.headcount.reduce((s, v) => s + v.value, 0);
    const hc = $("#headcount");
    hc.innerHTML = `
      <div class="stack__bar">${D.headcount.map((h, i) => `<i style="background:${colors[i]}" data-w="${(h.value / total) * 100}" title="${esc(h.label)}: ${h.value}"></i>`).join("")}</div>
      <ul class="stack__list">${D.headcount.map((h, i) => `<li><span class="sw" style="background:${colors[i]}"></span>${esc(h.label)}<b>${h.value}</b></li>`).join("")}</ul>
      <p class="note mono">TOTAL ${total} ORANG</p>`;
    onIn(hc.closest(".panel"), (p) => $$("[data-w]", p).forEach((i) => (i.style.width = i.dataset.w + "%")));

    // Heatmap kehadiran (deterministik)
    const days = ["S", "S", "R", "K", "J"];
    let seed = 7, sum = 0, n = 0;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    let html = `<span></span>${days.map((d) => `<span class="hd">${d}</span>`).join("")}`;
    for (let w = 1; w <= 4; w++) {
      html += `<span>M${w}</span>`;
      for (let d = 0; d < 5; d++) {
        const v = Math.round(86 + rnd() * 14);
        sum += v; n++;
        html += `<span class="cell" style="--o:${((v - 80) / 20).toFixed(2)};transition-delay:${(w * 5 + d) * 30}ms" title="Minggu ${w}: ${v}% hadir"></span>`;
      }
    }
    const heat = $("#attendance");
    heat.innerHTML = html;
    $("#attNote").textContent = `RATA-RATA KEHADIRAN ${(sum / n).toFixed(1)}%`;
    onIn(heat);

    // Pelatihan (checklist bisa dicentang)
    const saved = store.get("du-training", null);
    const training = D.training.map((t, i) => ({ ...t, done: saved ? !!saved[i] : t.done }));
    const tr = $("#training");
    const drawTr = () => {
      tr.innerHTML = training.map((t, i) => `
        <li class="${t.done ? "done" : ""}" data-i="${i}" role="checkbox" aria-checked="${t.done}" tabindex="0">
          <span class="box"><svg viewBox="0 0 16 16"><polyline points="3,8 7,12 13,4" pathLength="1"/></svg></span>
          <span>${esc(t.title)}</span>
        </li>`).join("");
    };
    const toggle = (li) => {
      const i = +li.dataset.i;
      training[i].done = !training[i].done;
      li.classList.toggle("done", training[i].done);
      li.setAttribute("aria-checked", training[i].done);
      store.set("du-training", training.map((t) => t.done));
    };
    tr.addEventListener("click", (e) => { const li = e.target.closest("li"); if (li) toggle(li); });
    tr.addEventListener("keydown", (e) => { const li = e.target.closest("li"); if (li && (e.key === " " || e.key === "Enter")) { e.preventDefault(); toggle(li); } });
    drawTr();

    // Kanban rekrutmen
    const cands = store.get("du-cands", null) || D.candidates.map((c) => ({ ...c }));
    const kb = $("#kanban");
    const drawKb = () => {
      kb.innerHTML = D.stages.map((st, si) => {
        const list = cands.filter((c) => c.stage === si);
        return `<div class="kanban__col"><h4>${st.toUpperCase()} <b>${list.length}</b></h4>
          ${list.map((c) => `<button class="cand ${si === D.stages.length - 1 ? "final" : ""}" data-name="${esc(c.name)}" type="button">${esc(c.name)}<small>${esc(c.role)}</small></button>`).join("")}
        </div>`;
      }).join("");
    };
    kb.addEventListener("click", (e) => {
      const b = e.target.closest(".cand");
      if (!b || b.classList.contains("final")) return;
      const c = cands.find((x) => x.name === b.dataset.name);
      c.stage++;
      store.set("du-cands", cands);
      drawKb();
      toast(`${c.name} → ${D.stages[c.stage]}`);
    });
    drawKb();
  }

  /* ---------------- LEGAL ---------------- */
  function renderLegal() {
    const lic = $("#licenses");
    lic.innerHTML = D.licenses.map((l) => {
      if (l.daysLeft == null) {
        return `<div class="lic">
          <svg class="ring" viewBox="0 0 54 54"><circle class="track" r="22" cx="27" cy="27"/><circle class="val c-ok" r="22" cx="27" cy="27" data-p="1"/><text x="27" y="31">∞</text></svg>
          <div class="lic__name">${esc(l.name)}<small>${esc(l.issuer)}</small></div>
          <div class="lic__left t-ok">AKTIF<small>${esc(l.note)}</small></div></div>`;
      }
      const exp = new Date(today); exp.setDate(today.getDate() + l.daysLeft);
      const cls = l.daysLeft <= 30 ? "danger" : l.daysLeft <= 90 ? "warn" : "ok";
      const p = Math.min(1, l.daysLeft / 365);
      return `<div class="lic ${cls === "danger" ? "is-urgent" : ""}">
        <svg class="ring" viewBox="0 0 54 54"><circle class="track" r="22" cx="27" cy="27"/><circle class="val c-${cls}" r="22" cx="27" cy="27" data-p="${p}"/><text x="27" y="31">${l.daysLeft}h</text></svg>
        <div class="lic__name">${esc(l.name)}<small>${esc(l.issuer)}</small></div>
        <div class="lic__left t-${cls}">${l.daysLeft} HARI<small>s.d. ${fmtDate(exp)}</small></div></div>`;
    }).join("");
    const C = 2 * Math.PI * 22;
    onIn(lic.closest(".panel"), (p) => $$("[data-p]", p).forEach((c) => c.style.strokeDasharray = `${C * +c.dataset.p} ${C}`));

    const steps = D.contractSteps;
    const ct = $("#contracts");
    ct.innerHTML = D.contracts.map((c) => `
      <div class="contract">
        <div class="contract__top"><span>${esc(c.title)}</span><b>${esc(c.value)}</b></div>
        <span class="contract__party">${esc(c.party)} · Status: ${esc(c.stage)}</span>
        <div class="steps">
          <i class="prog" data-w="${(c.step / (steps.length - 1)) * 80}"></i>
          ${steps.map((s, i) => `<span class="${i <= c.step ? "on" : ""}" style="--sd:${i * 0.25}s">${s.toUpperCase()}</span>`).join("")}
        </div>
      </div>`).join("");
    onIn(ct.closest(".panel"), (p) => $$("[data-w]", p).forEach((i) => (i.style.width = i.dataset.w + "%")));
  }

  /* ---------------- INIT ---------------- */
  $$("[data-date]").forEach((el) => (el.textContent = fmtDate(today, { day: "2-digit", month: "long", year: "numeric" }).toUpperCase()));
  initTheme();
  renderKpi();
  renderGA();
  renderAdmin();
  renderFinance();
  renderHR();
  renderLegal();
  $$(".reveal, .sec-head").forEach((el) => onIn(el));
  initBuilding();
  initScroll();
  initCad();
  boot();
})();
