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
  const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  const fmtDate = (d, opt = { day: "2-digit", month: "short", year: "numeric" }) => d.toLocaleDateString("id-ID", opt);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const rp = (n) => "Rp " + Math.round(n).toLocaleString("id-ID");
  const rpShort = (n) => {
    const a = Math.abs(n), sign = n < 0 ? "−" : "";
    if (a >= 1e9) return sign + "Rp " + (a / 1e9).toLocaleString("id-ID", { maximumFractionDigits: 2 }) + " M";
    if (a >= 1e6) return sign + "Rp " + (a / 1e6).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + " jt";
    return sign + rp(a);
  };
  const signed = (n) => (n == null ? "—" : (n < 0 ? "−" : "+") + rp(Math.abs(n)).replace("Rp ", "Rp "));
  const norm = (s) => String(s).toLowerCase();
  /* Tampilan Blueprint memakai huruf kapital teknis; tampilan lain (mis. Sage) memakai huruf biasa */
  const SKIN = document.body.dataset.skin || "blueprint";
  const up = (s) => (SKIN === "blueprint" ? String(s).toUpperCase() : String(s));

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
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  const onIn = (el, fn) => { if (!el) return; if (fn) inViewQueue.set(el, fn); io.observe(el); };

  /* Jalankan animasi isi (bar, cincin, grafik, angka) di dalam root */
  function animateIn(root) {
    requestAnimationFrame(() => {
      $$("[data-w]", root).forEach((i) => (i.style.width = i.dataset.w + "%"));
      $$("[data-p]", root).forEach((c) => (c.style.strokeDasharray = `${c.dataset.c * +c.dataset.p} ${c.dataset.c}`));
      $$(".chart, .heat", root).forEach((c) => c.classList.add("is-in"));
      $$("[data-count]", root).forEach((el) => countUp(el, +el.dataset.count));
    });
  }

  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("is-on"), 2400);
  }

  function countUp(el, to, dur = 1200) {
    if (reduceMotion) { el.textContent = to; return; }
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* Tombol filter berkelompok (aria-pressed) */
  function pressGroup(group, onPick) {
    group.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b || !group.contains(b)) return;
      $$("button", group).forEach((x) => x.setAttribute("aria-pressed", x === b));
      onPick(b);
    });
  }

  const pill = (text, tone) => `<span class="pill pill--${tone}">${esc(text)}</span>`;
  const ring = (p, tone, label, size = 54) => {
    const r = size / 2 - 5, c = (2 * Math.PI * r).toFixed(1);
    return `<svg class="ring" viewBox="0 0 ${size} ${size}" style="width:${size}px;height:${size}px"><circle class="track" r="${r}" cx="${size / 2}" cy="${size / 2}"/><circle class="val c-${tone}" r="${r}" cx="${size / 2}" cy="${size / 2}" data-p="${p}" data-c="${c}"/><text x="${size / 2}" y="${size / 2 + 4}">${label}</text></svg>`;
  };
  const stat = (label, value, sub = "", tone = "") => `<div class="stat ${tone ? "stat--" + tone : ""}"><span class="mono">${esc(label)}</span><b>${value}</b>${sub ? `<small>${sub}</small>` : ""}</div>`;

  /* ---------------- LOADER ---------------- */
  function boot() {
    if (!$("#loader")) { document.body.classList.add("is-ready"); return; }
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
    if (!label) return;
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
    if (!$("#cad") || reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;
    const cad = $("#cad"), h = $(".cad__h", cad), v = $(".cad__v", cad), box = $(".cad__box", cad), coord = $("#cadCoord");
    document.body.classList.add("has-cad");
    let x = 0, y = 0, raf = 0;
    const paint = () => {
      raf = 0;
      h.style.transform = `translateY(${y}px)`;
      v.style.transform = `translateX(${x}px)`;
      box.style.left = coord.style.left = x + "px";
      box.style.top = coord.style.top = y + "px";
      coord.textContent = `X ${String(Math.round(x + scrollX)).padStart(4, "0")} · Y ${String(Math.round(y + scrollY)).padStart(4, "0")}`;
    };
    addEventListener("pointermove", (e) => {
      x = e.clientX; y = e.clientY;
      cad.classList.add("is-on");
      cad.classList.toggle("is-hover", !!e.target.closest("a, button, .floor, .cand, .checklist li, input, select, .mom-item, .folder"));
      if (!raf) raf = requestAnimationFrame(paint);
    });
    document.addEventListener("pointerleave", () => cad.classList.remove("is-on"));
  }

  /* ---------------- GEDUNG HERO ---------------- */
  function initBuilding() {
    const hot = (n, on) => {
      $$(`.lbl[data-floor="${n}"], .floor[data-floor="${n}"]`).forEach((el) => el.classList.toggle("is-hot", on));
      $$(`.nav a[data-floor="${n}"]`).forEach((el) => el.classList.toggle("is-hover", on));
    };
    $$(".floor").forEach((f) => {
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
    if (!car) return;
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

  /* ---------------- TAB MODUL ---------------- */
  function initModTabs() {
    $$(".modtabs").forEach((bar) => {
      const tabs = $$("[role=tab]", bar);
      const panels = tabs.map((t) => document.getElementById(t.dataset.panel));
      const select = (tab, focus) => {
        tabs.forEach((t, i) => {
          const on = t === tab;
          t.setAttribute("aria-selected", on);
          t.tabIndex = on ? 0 : -1;
          panels[i].hidden = !on;
          if (on) {
            panels[i].classList.remove("is-shown");
            void panels[i].offsetWidth;
            panels[i].classList.add("is-shown");
            animateIn(panels[i]);
          }
        });
        if (focus) tab.focus();
        store.set("du-tab-" + bar.closest("section").id, tab.dataset.panel);
      };
      tabs.forEach((t, i) => {
        t.id = "tab-" + t.dataset.panel;
        t.setAttribute("aria-controls", t.dataset.panel);
        panels[i].setAttribute("aria-labelledby", t.id);
        t.addEventListener("click", () => select(t));
        t.addEventListener("keydown", (e) => {
          const k = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
          if (k) { e.preventDefault(); select(tabs[(i + k + tabs.length) % tabs.length], true); }
        });
      });
      const saved = store.get("du-tab-" + bar.closest("section").id, null);
      const first = tabs.find((t) => t.dataset.panel === saved) || tabs[0];
      tabs.forEach((t, i) => { const on = t === first; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; panels[i].hidden = !on; });
      onIn(bar.closest("section"), () => animateIn(document.getElementById(first.dataset.panel)));
    });
  }

  /* =========================================================
     RINGKASAN
     ========================================================= */
  const state = {
    closing: store.get("du-close", null) || D.closing.tasks.map((t) => t.done),
    recon: store.get("du-recon", {})
  };

  function renderKpi() {
    const docs = window.DUDocs;
    const procN = docs ? docs.count("procurement") : 0, admN = docs ? docs.count("admin") : 0, legalN = docs ? docs.count("legal") : 0;
    const closePct = Math.round((state.closing.filter(Boolean).length / state.closing.length) * 100);
    const kpi = [
      { label: "PDF Procurement", value: procN, unit: "file", floor: "LT.01 · GA", href: "#ga" },
      { label: "Arsip Admin (PDF)", value: admN, unit: "file", floor: "LT.02 · ADM", href: "#adm" },
      { label: "Progres Tutup Buku", value: closePct, unit: "%", floor: "LT.03 · FIN", href: "#fin" },
      { label: "Karyawan + Freelancer", value: D.employees.length + D.freelancers.length, unit: "orang", floor: "LT.04 · HR", href: "#hr" },
      { label: "Arsip Legal (PDF)", value: legalN, unit: "file", floor: "LT.05 · LGL", href: "#legal" }
    ];
    const grid = $("#kpiGrid");
    if (!grid) return;
    grid.innerHTML = kpi.map((k, i) => `
      <a class="kpi reveal" style="--d:${i}" href="${k.href}"${k.href === "#fin" ? ' data-secure="finance"' : ""}>
        <span class="kpi__floor mono">${k.floor}</span>
        <div class="kpi__value"><span data-count="${k.value}">${k.value}</span><small>${esc(k.unit)}</small></div>
        <span class="kpi__label">${esc(k.label)}</span>
      </a>`).join("");
    $$(".kpi", grid).forEach((el) => onIn(el, () => { const c = $("[data-count]", el); countUp(c, +c.dataset.count); }));
  }
  function refreshKpi() {
    renderKpi();
    $$(".kpi").forEach((el) => el.classList.add("is-in"));
    document.dispatchEvent(new CustomEvent("du:change"));
  }

  /* =========================================================
     LT.01 GENERAL AFFAIRS
     ========================================================= */
  function renderAssets() {
    const I = D.inventory;
    if (!I) return;
    const num = (n, d = 2) => (n == null ? "—" : Number(n).toLocaleString("id-ID", { maximumFractionDigits: d }));
    const dTo = (iso) => (iso ? Math.round((new Date(iso + "T00:00:00") - new Date(today.toDateString())) / 864e5) : null);
    const fd = (iso) => (iso ? fmtDate(new Date(iso + "T00:00:00"), { day: "2-digit", month: "short", year: "numeric" }) : "—");
    // stok saat ini = jumlah awal + masuk − keluar (dari riwayat transaksi sumber)
    const assets = I.assets.map((a) => {
      let q = a.qty;
      I.logs.filter((l) => l.code === a.code).forEach((l) => { if (q == null) q = 0; q += /^Masuk/.test(l.type) ? l.qty : /^Keluar/.test(l.type) ? -l.qty : 0; });
      return { ...a, now: q, moved: I.logs.filter((l) => l.code === a.code), due: dTo(a.perawatan) };
    });
    const named = assets.filter((a) => a.name);
    const dueSoon = assets.filter((a) => a.due != null && a.due <= 30);
    const noCond = assets.filter((a) => !a.kondisi).length;
    $("#invStats").innerHTML =
      stat("Aset tercatat", `<span data-count="${assets.length}">${assets.length}</span>`, I.groups.map((g) => `${g} ${assets.filter((a) => a.group === g).length}`).join(" · ")) +
      stat("Kondisi baik / cukup", `<span data-count="${assets.filter((a) => /Baik|Cukup/.test(a.kondisi)).length}">${assets.filter((a) => /Baik|Cukup/.test(a.kondisi)).length}</span>`, `${noCond} aset belum diisi kondisinya`, noCond ? "warn" : "ok") +
      stat("Perawatan ≤ 30 hari", `<span data-count="${dueSoon.length}">${dueSoon.length}</span>`, dueSoon.length ? `terdekat ${fd(dueSoon.map((a) => a.perawatan).sort()[0])}` : "tidak ada", dueSoon.length ? "warn" : "ok") +
      stat("Transaksi keluar-masuk", `<span data-count="${I.logs.length}">${I.logs.length}</span>`, I.logs.length ? `${I.logs[0].type.replace(/^(Masuk|Keluar) - /, "")} · ${I.logs[0].code}` : "belum ada");

    const chips = $("#invChips"), sel = $("#invCat"), search = $("#invSearch"), body = $("#invBody");
    chips.innerHTML = ["Semua"].concat(I.groups).map((g, i) => `<button type="button" aria-pressed="${i === 0}" data-g="${esc(g)}">${esc(g)} <b>${g === "Semua" ? assets.length : assets.filter((a) => a.group === g).length}</b></button>`).join("");
    let group = "Semua";
    const fillCats = () => {
      const cats = {};
      assets.filter((a) => group === "Semua" || a.group === group).forEach((a) => { const c = a.cat || "Belum dikategorikan"; cats[c] = (cats[c] || 0) + 1; });
      sel.innerHTML = `<option value="all">Semua kategori</option>` + Object.entries(cats).sort((x, y) => y[1] - x[1]).map(([c, n]) => `<option value="${esc(c)}">${esc(c)} (${n})</option>`).join("");
    };
    const kTone = { Baik: "ok", Cukup: "info", "Rusak Ringan": "warn", "Rusak Berat": "danger", Hilang: "danger" };
    const draw = () => {
      const q = norm(search.value), c = sel.value;
      const rows = assets.filter((a) => (group === "Semua" || a.group === group) && (c === "all" || (a.cat || "Belum dikategorikan") === c) && (!q || norm(a.code + " " + a.name).includes(q)));
      body.innerHTML = rows.map((a) => `<tr>
        <td class="mono">${a.code.startsWith("NOKODE") ? `<span class="t-warn">Belum ada kode</span>` : esc(a.code)}</td>
        <td>${a.name ? esc(a.name) : `<span class="t-warn">Tanpa nama</span>`}${a.moved.length ? `<small class="mono sub">${a.moved.map((l) => `${esc(l.type.split(" - ")[0])} ${num(l.qty)} · ${esc(l.project || l.to)}`).join("; ")}</small>` : ""}</td>
        <td>${a.cat ? esc(a.cat) : "—"}</td>
        <td class="num">${num(a.now)} ${esc(a.unit || "")}${a.moved.length ? `<small class="mono sub">awal ${num(a.qty)}</small>` : ""}</td>
        <td>${a.kondisi ? pill(a.kondisi, kTone[a.kondisi] || "muted") : `<span class="note">belum diisi</span>`}</td>
        <td>${esc(a.lokasi || "—")}</td>
        <td>${a.perawatan ? `<span class="${a.due < 0 ? "t-danger" : a.due <= 7 ? "t-warn" : ""}">${fd(a.perawatan)}</span>${a.due != null ? `<small class="mono sub">${a.due < 0 ? Math.abs(a.due) + " hari terlambat" : a.due === 0 ? "hari ini" : a.due + " hari lagi"}</small>` : ""}` : "—"}</td>
      </tr>`).join("") || `<tr><td colspan="7" class="empty">Tidak ada aset yang cocok.</td></tr>`;
      $("#invNote").textContent = `${rows.length} dari ${assets.length} aset ditampilkan`;
    };
    pressGroup(chips, (b) => { group = b.dataset.g; fillCats(); draw(); });
    sel.addEventListener("change", draw);
    search.addEventListener("input", draw);
    fillCats(); draw();

    // Perawatan terdekat, dikelompokkan per tanggal
    const byDate = {};
    assets.filter((a) => a.perawatan).forEach((a) => (byDate[a.perawatan] = (byDate[a.perawatan] || []).concat(a)));
    $("#invDue").innerHTML = Object.keys(byDate).length ? `<ol class="timeline">${Object.keys(byDate).sort().slice(0, 4).map((d) => {
      const xs = byDate[d], days = dTo(d), gs = {};
      xs.forEach((a) => (gs[a.group] = (gs[a.group] || 0) + 1));
      return `<li class="${days < 0 ? "" : ""}"><span class="t-date">${esc(up(fd(d)))} · ${days < 0 ? up(Math.abs(days) + " hari terlambat") : days === 0 ? up("hari ini") : up(days + " hari lagi")}</span>
        <span class="t-title">${xs.length} aset dijadwalkan perawatan<span class="tag">${Object.entries(gs).map(([g, n]) => `${esc(g)} ${n}`).join(" · ")}</span></span></li>`;
    }).join("")}</ol>` : `<p class="note">Belum ada jadwal perawatan.</p>`;

    // Kelengkapan kolom penting
    const fields = [["Nama aset", (a) => a.name], ["Kategori", (a) => a.cat], ["Kondisi", (a) => a.kondisi], ["Lokasi", (a) => a.lokasi], ["Status", (a) => a.status], ["Nilai perolehan", (a) => a.nilai]];
    $("#invGaps").innerHTML = fields.map(([n, f]) => {
      const filled = assets.filter(f).length, pct = Math.round((filled / assets.length) * 100);
      const cls = pct < 50 ? "danger" : pct < 90 ? "warn" : "";
      return `<div class="bar-row"><span>${n}</span><b class="${cls ? "t-" + cls : ""}">${filled}/${assets.length}</b><div class="meter"><i class="${cls}" data-w="${pct}"></i></div></div>`;
    }).join("");
    $("#invSource").innerHTML = `Disalin dari <a href="${esc(I.source.url)}" target="_blank" rel="noopener">${esc(I.source.name)}</a> · tanggal laporan ${fd(I.source.asOf)}. Perubahan di aplikasi sumber belum otomatis masuk ke sini.`;
  }


  function renderVendors() {
    const chips = $("#vendorChips"), body = $("#vendorBody"), search = $("#vendorSearch"), locSel = $("#vendorLoc");
    const tools = $(".vendor-tools", $("#ga-vendor"));
    const list = D.vendors, subs = D.subcontractors || [];
    const key = (v) => v.name + "|" + v.phone;
    const catsOf = {};
    list.forEach((v) => (catsOf[key(v)] = (catsOf[key(v)] || []).concat(v.cat)));
    const locCount = {};
    list.forEach((v) => (locCount[v.loc] = (locCount[v.loc] || 0) + 1));
    const topLoc = Object.entries(locCount).sort((x, y) => y[1] - x[1])[0];
    $("#vendorStats").innerHTML =
      stat("Vendor material", `<span data-count="${Object.keys(catsOf).length}">${Object.keys(catsOf).length}</span>`, `${list.length} entri, sebagian melayani beberapa jenis`) +
      stat("Jenis vendor", `<span data-count="${D.vendorCats.length}">${D.vendorCats.length}</span>`, "toko bangunan s.d. pre-cast") +
      stat("Lokasi terbanyak", esc(topLoc[0]), `${topLoc[1]} vendor · ${Object.keys(locCount).length} lokasi`) +
      stat("Subkontraktor", `<span data-count="${subs.length}">${subs.length}</span>`, subs.length ? "terdaftar" : "belum ada data", subs.length ? "" : "warn");

    chips.innerHTML = ["Semua"].concat(D.vendorCats).map((c, i) => `<button type="button" aria-pressed="${i === 0}" data-cat="${esc(c)}">${esc(c)} <b>${c === "Semua" ? list.length : list.filter((v) => v.cat === c).length}</b></button>`).join("");
    Object.keys(locCount).sort((x, y) => x.localeCompare(y, "id")).forEach((l) => locSel.insertAdjacentHTML("beforeend", `<option value="${esc(l)}">${esc(l)} (${locCount[l]})</option>`));

    const wa = (phone) => {
      const d = phone.replace(/\D/g, "");
      return d.startsWith("08") ? "https://wa.me/62" + d.slice(1) : null;
    };
    let group = "vendor", cat = "Semua";
    const draw = () => {
      tools.hidden = group !== "vendor";
      if (group === "subkon") {
        body.innerHTML = subs.length
          ? subs.map((v, i) => `<tr><td class="mono">${i + 1}</td><td>${esc(v.name)}</td><td>${esc(v.cat)}</td><td class="mono">${esc(v.phone)}</td><td>${esc(v.loc)}</td><td></td></tr>`).join("")
          : `<tr><td colspan="6" class="empty">Belum ada data subkontraktor. Kirim daftarnya dengan kolom yang sama (jenis, nama, kontak, lokasi) untuk ditambahkan.</td></tr>`;
        $("#vendorNote").textContent = "";
        return;
      }
      const q = norm(search.value), loc = locSel.value;
      const rows = list.filter((v) => (cat === "Semua" || v.cat === cat) && (loc === "all" || v.loc === loc) && (!q || norm(v.name + v.phone + v.loc + v.cat).includes(q)));
      body.innerHTML = rows.map((v, i) => {
        const others = catsOf[key(v)].filter((c) => c !== v.cat);
        const w = wa(v.phone);
        return `<tr><td class="mono">${i + 1}</td>
          <td>${esc(v.name)}${others.length ? `<small class="mono sub">juga: ${esc(others.join(", "))}</small>` : ""}</td>
          <td><span class="tag tag--plain">${esc(v.cat)}</span></td>
          <td class="mono"><a class="tel" href="tel:${v.phone.replace(/\D/g, "")}">${esc(v.phone)}</a></td>
          <td>${esc(v.loc)}</td>
          <td>${w ? `<a class="mini-btn" href="${w}" target="_blank" rel="noopener" aria-label="WhatsApp ${esc(v.name)}">WhatsApp</a>` : `<span class="note">telepon kantor</span>`}</td></tr>`;
      }).join("") || `<tr><td colspan="6" class="empty">Tidak ada vendor yang cocok.</td></tr>`;
      $("#vendorNote").textContent = `${rows.length} dari ${list.length} entri ditampilkan · sumber: Daftar Vendor Material (Excel)`;
    };
    pressGroup(chips, (b) => { cat = b.dataset.cat; draw(); });
    pressGroup($("#vendorGroup"), (b) => { group = b.dataset.group; draw(); });
    locSel.addEventListener("change", draw);
    search.addEventListener("input", draw);
    draw();
  }

  function renderServices() {
    const st = D.serviceStages;
    const items = store.get("du-serv", null) || D.services.map((s) => ({ ...s }));
    const board = $("#servBoard");
    const draw = () => {
      board.innerHTML = st.map((s, si) => {
        const list = items.filter((x) => x.stage === si);
        return `<div class="kanban__col"><h4>${up(s)} <b>${list.length}</b></h4>
          ${list.map((x) => `<button class="cand ${si === st.length - 1 ? "final" : ""}" type="button" data-id="${esc(x.id)}">
            <span class="mono cand__id">${esc(x.id)} · ${esc(x.cat)}</span>${esc(x.title)}<small>Pemohon: ${esc(x.by)}</small></button>`).join("")}</div>`;
      }).join("");
    };
    board.addEventListener("click", (e) => {
      const b = e.target.closest(".cand");
      if (!b || b.classList.contains("final")) return;
      const x = items.find((i) => i.id === b.dataset.id);
      x.stage++;
      store.set("du-serv", items);
      draw();
      toast(`${x.id} → ${st[x.stage]}`);
    });
    draw();
  }

  function renderClient() {
    const sla = D.slaMinutes;
    const reqs = D.clientRequests;
    const tone = { Selesai: "ok", Diproses: "info", Menunggu: "warn" };
    $("#clientBody").innerHTML = reqs.map((r) => {
      const t = r.mins == null ? pill("Belum direspons", "warn") : `<span class="${r.mins <= sla ? "t-ok" : "t-danger"} mono">${r.mins} mnt</span>`;
      return `<tr><td>${esc(r.client)}</td><td>${esc(r.req)}</td><td><span class="tag tag--plain">${esc(r.channel)}</span></td><td class="mono">${esc(r.at)}</td><td>${t}</td><td>${pill(r.status, tone[r.status])}</td></tr>`;
    }).join("");
    const answered = reqs.filter((r) => r.mins != null);
    const avg = Math.round(answered.reduce((s, r) => s + r.mins, 0) / answered.length);
    const inSla = answered.filter((r) => r.mins <= sla).length;
    const pct = Math.round((inSla / answered.length) * 100);
    const byCh = {};
    reqs.forEach((r) => (byCh[r.channel] = (byCh[r.channel] || 0) + 1));
    $("#slaBox").innerHTML = `
      <div class="sla">
        ${ring(pct / 100, pct >= 80 ? "ok" : "warn", pct + "%", 96)}
        <div><span class="mono note">${up("Dalam target " + sla + " menit")}</span><b class="big-num">${avg}<small> mnt</small></b><span class="note">rata-rata waktu respons</span></div>
      </div>
      <h4 class="mini-title mono">${up("Permintaan per kanal")}</h4>
      <div class="bars">${Object.entries(byCh).map(([k, v]) => `<div class="bar-row"><span>${esc(k)}</span><b>${v}</b><div class="meter"><i data-w="${(v / reqs.length) * 100}"></i></div></div>`).join("")}</div>`;
  }

  /* =========================================================
     LT.03 FINANCE
     ========================================================= */
  function reconStatus(r) {
    if (r.bank != null && r.book != null && r.bank === r.book) return { key: "match", label: "Cocok", tone: "ok" };
    if (r.book == null) return { key: "nobook", label: "Belum dicatat di buku", tone: "warn", action: "Catat jurnal" };
    if (r.bank == null) return { key: "transit", label: "Setoran dalam perjalanan", tone: "info", action: "Tandai dicek" };
    return { key: "diff", label: "Selisih " + rp(Math.abs(r.bank - r.book)), tone: "danger", action: "Koreksi buku" };
  }

  function renderRecon() {
    const accs = D.bankAccounts;
    let ai = 0;
    const tabs = $("#bankTabs");
    tabs.innerHTML = accs.map((a, i) => `<button type="button" aria-pressed="${i === 0}" data-i="${i}">${esc(a.name)}</button>`).join("");
    const draw = () => {
      const acc = accs[ai];
      const resolved = state.recon[acc.name] || [];
      let open = 0, openDiff = 0;
      $("#reconBody").innerHTML = acc.rows.map((r, i) => {
        const st = reconStatus(r);
        const done = resolved.includes(i);
        if (st.key !== "match" && !done) { open++; openDiff += (r.bank || 0) - (r.book || 0); }
        const cell = st.key === "match" ? pill("Cocok", "ok") : done ? pill("Sudah disesuaikan", "ok") : pill(st.label, st.tone);
        const act = st.key === "match" || done ? "" : `<button class="mini-btn" type="button" data-i="${i}">${st.action}</button>`;
        return `<tr class="${done ? "is-done" : ""}"><td>${esc(r.date)}</td><td>${esc(r.desc)}</td>
          <td class="num ${r.bank < 0 ? "t-out" : ""}">${signed(r.bank)}</td><td class="num ${r.book < 0 ? "t-out" : ""}">${signed(r.book)}</td><td>${cell}</td><td>${act}</td></tr>`;
      }).join("");
      const bookBal = acc.bankBalance - acc.rows.reduce((s, r) => s + ((r.bank || 0) - (r.book || 0)), 0);
      $("#reconStats").innerHTML =
        stat("Saldo menurut bank", rp(acc.bankBalance), `${esc(acc.name)} · ${esc(acc.no)}`) +
        stat("Saldo menurut buku", rp(bookBal), "sebelum penyesuaian") +
        stat("Selisih belum selesai", open ? rp(Math.abs(openDiff)) : "Rp 0", open ? `${open} transaksi perlu ditindaklanjuti` : "Rekening sudah rekonsiliasi ✓", open ? "danger" : "ok");
    };
    $("#reconBody").addEventListener("click", (e) => {
      const b = e.target.closest("[data-i]");
      if (!b) return;
      const name = accs[ai].name;
      state.recon[name] = (state.recon[name] || []).concat(+b.dataset.i);
      store.set("du-recon", state.recon);
      draw();
      toast("Transaksi ditandai sudah disesuaikan");
    });
    pressGroup(tabs, (b) => { ai = +b.dataset.i; draw(); });
    draw();
  }

  function drawChart(period) {
    const c = D.reports[period], W = 640, H = 280, P = { l: 44, r: 14, t: 16, b: 30 };
    const max = Math.max(100, Math.ceil(Math.max(...c.in, ...c.out) / 100) * 100);
    const x = (i) => P.l + (i * (W - P.l - P.r)) / (c.labels.length - 1);
    const y = (v) => H - P.b - (v / max) * (H - P.t - P.b);
    const path = (arr) => arr.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(max * t));
    const colW = (W - P.l - P.r) / (c.labels.length - 1);
    const chart = $("#cashChart");
    chart.classList.remove("is-in");
    chart.innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik arus kas ${period.toLowerCase()} masuk dan keluar">
        <g class="axis">
          ${ticks.map((t) => `<line x1="${P.l}" x2="${W - P.r}" y1="${y(t)}" y2="${y(t)}"/><text x="${P.l - 8}" y="${y(t) + 3}" text-anchor="end">${t}</text>`).join("")}
          ${c.labels.map((m, i) => `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${m}</text>`).join("")}
        </g>
        <path class="area" d="${path(c.in)} L${x(c.in.length - 1)} ${y(0)} L${x(0)} ${y(0)} Z"/>
        <line class="guide" y1="${P.t}" y2="${H - P.b}" x1="0" x2="0"/>
        <path class="ln ln--out" pathLength="1" d="${path(c.out)}"/>
        <path class="ln ln--in" pathLength="1" d="${path(c.in)}"/>
        ${c.in.map((v, i) => `<circle class="pt pt--in" r="4" cx="${x(i)}" cy="${y(v)}"/>`).join("")}
        ${c.out.map((v, i) => `<circle class="pt pt--out" r="4" cx="${x(i)}" cy="${y(v)}"/>`).join("")}
        ${c.labels.map((m, i) => `<rect class="hit" data-i="${i}" x="${x(i) - colW / 2}" y="${P.t}" width="${colW}" height="${H - P.t - P.b}"/>`).join("")}
      </svg>
      <div class="chart-tip"></div>`;
    const tip = $(".chart-tip", chart), guide = $(".guide", chart), svg = $("svg", chart);
    $$(".hit", chart).forEach((r) => {
      r.addEventListener("mouseenter", () => {
        const i = +r.dataset.i, net = c.in[i] - c.out[i];
        guide.setAttribute("x1", x(i)); guide.setAttribute("x2", x(i)); guide.style.opacity = 1;
        tip.innerHTML = `<b>${c.labels[i]}</b><br><span class="t-ok">Masuk ${c.in[i]}</span> · <span style="color:var(--accent-2)">Keluar ${c.out[i]}</span><br>Bersih <span class="${net >= 0 ? "t-ok" : "t-danger"}">${net >= 0 ? "+" : ""}${net}</span> jt`;
        const w = svg.getBoundingClientRect().width;
        tip.style.left = Math.min(x(i) * (w / W) + 12, w - 170) + "px";
        tip.style.top = "10px";
        tip.style.opacity = 1;
      });
      r.addEventListener("mouseleave", () => { tip.style.opacity = 0; guide.style.opacity = 0; });
    });
    requestAnimationFrame(() => requestAnimationFrame(() => chart.classList.add("is-in")));
  }

  function renderReports() {
    const tabs = $("#periodTabs");
    const notes = { Harian: "7 hari terakhir · juta Rp", Mingguan: "6 minggu terakhir · juta Rp", Bulanan: "Januari–Oktober 2026 · juta Rp" };
    tabs.innerHTML = Object.keys(D.reports).map((p) => `<button type="button" aria-pressed="${p === "Bulanan"}" data-p="${p}">${p}</button>`).join("");
    const show = (p) => {
      const r = D.reports[p];
      const tin = r.in.reduce((a, b) => a + b, 0), tout = r.out.reduce((a, b) => a + b, 0), net = tin - tout;
      $("#reportStats").innerHTML =
        stat("Pemasukan", rpShort(tin * 1e6), notes[p]) +
        stat("Pengeluaran", rpShort(tout * 1e6), `${Math.round((tout / Math.max(tin, 1)) * 100)}% dari pemasukan`) +
        stat("Arus kas bersih", rpShort(net * 1e6), net >= 0 ? "surplus" : "defisit", net >= 0 ? "ok" : "danger");
      $("#periodNote").textContent = "Laporan " + p.toLowerCase();
      $("#chartPeriod").textContent = up(p.toLowerCase());
      $("#budgetPanel").hidden = p !== "Bulanan";
      drawChart(p);
      if (p === "Bulanan") animateIn($("#budgetPanel"));
    };
    pressGroup(tabs, (b) => show(b.dataset.p));
    show("Bulanan");

    const maxB = Math.max(...D.budget.map((b) => Math.max(b.budget, b.actual)));
    $("#budget").innerHTML = D.budget.map((b) => {
      const pct = Math.round((b.actual / b.budget) * 100), over = b.actual > b.budget;
      return `<div class="budget__row">
        <div class="budget__name">${esc(b.project)}<small>${up(esc(b.type) + " · progres fisik " + b.progress + "%")}</small></div>
        <div class="budget__bars" title="Anggaran Rp ${b.budget} jt · Realisasi Rp ${b.actual} jt">
          <span class="b-plan" data-w="${(b.budget / maxB) * 100}"></span><span class="b-act ${over ? "over" : ""}" data-w="${(b.actual / maxB) * 100}"></span></div>
        <div class="budget__pct"><span class="${over ? "t-danger" : pct > 90 ? "t-warn" : "t-ok"}">${pct}% terserap</span><small>Rp ${b.actual.toLocaleString("id-ID")} / ${b.budget.toLocaleString("id-ID")} jt</small></div>
      </div>`;
    }).join("") + `<p class="note mono">▨ arsir = anggaran (RAB) · ▬ solid = realisasi · merah = melebihi anggaran</p>`;
  }

  function renderClosing() {
    const C = D.closing;
    const list = $("#closeList"), box = $("#closeStatus");
    let locked = store.get("du-close-locked", false);
    $("#closePeriod").textContent = up(C.period);
    const drawList = () => {
      list.innerHTML = C.tasks.map((t, i) => `
        <li class="${state.closing[i] ? "done" : ""}" data-i="${i}" role="checkbox" aria-checked="${state.closing[i]}" aria-disabled="${locked}" tabindex="0">
          <span class="box"><svg viewBox="0 0 16 16"><polyline points="3,8 7,12 13,4" pathLength="1"/></svg></span>
          <span class="ck__txt"><span class="mono ck__n">${String(i + 1).padStart(2, "0")}</span>${esc(t.task)}</span><span class="ck__pic mono">${esc(t.pic)}</span></li>`).join("");
    };
    const drawBox = () => {
      const done = state.closing.filter(Boolean).length, total = C.tasks.length, pct = done / total;
      const dl = new Date(C.deadline + "T00:00:00");
      const days = Math.ceil((dl - today) / 864e5);
      box.innerHTML = `
        <div class="sla">
          ${ring(pct, locked ? "ok" : pct === 1 ? "ok" : "warn", Math.round(pct * 100) + "%", 96)}
          <div><span class="mono note">${up("Periode")}</span><b class="big-num big-num--sm">${esc(C.period)}</b>
          <span class="note">${done}/${total} langkah selesai · batas ${fmtDate(dl)} (${days > 0 ? days + " hari lagi" : "hari ini"})</span></div>
        </div>
        <button class="btn ${locked ? "btn--ghost" : "btn--solid"} btn--block" type="button" id="lockBtn" ${pct < 1 && !locked ? "disabled" : ""}>
          ${locked ? "🔒 Periode terkunci · buka kembali" : pct < 1 ? "Selesaikan semua langkah untuk mengunci" : "Kunci periode " + esc(C.period)}</button>`;
      animateIn(box);
      $("#lockBtn").addEventListener("click", () => {
        locked = !locked;
        store.set("du-close-locked", locked);
        drawList(); drawBox();
        toast(locked ? `Periode ${C.period} dikunci` : `Periode ${C.period} dibuka kembali`);
      });
    };
    const toggle = (li) => {
      if (locked) { toast("Periode terkunci. Buka kembali untuk mengubah."); return; }
      const i = +li.dataset.i;
      state.closing[i] = !state.closing[i];
      store.set("du-close", state.closing);
      li.classList.toggle("done", state.closing[i]);
      li.setAttribute("aria-checked", state.closing[i]);
      drawBox(); refreshKpi();
    };
    list.addEventListener("click", (e) => { const li = e.target.closest("li"); if (li) toggle(li); });
    list.addEventListener("keydown", (e) => { const li = e.target.closest("li"); if (li && (e.key === " " || e.key === "Enter")) { e.preventDefault(); toggle(li); } });
    $("#closeHistory").innerHTML = C.history.map((h) => `<li class="done"><span class="t-date">${up("Ditutup " + esc(h.closed))}</span><span class="t-title">${esc(h.period)}<span class="tag">${esc(h.by)}</span></span></li>`).join("");
    drawList(); drawBox();
  }

  /* =========================================================
     LT.04 HUMAN RESOURCES
     ========================================================= */
  /* Nomor HP lokal (08…) → tautan WhatsApp 628… */
  const waLink = (p) => "https://wa.me/62" + String(p).replace(/\D/g, "").replace(/^0/, "");

  function renderEmployees() {
    const E = D.employees;
    const male = E.filter((e) => e.gender === "Laki-laki").length;
    const avg = E.length ? E.reduce((s, e) => s + e.age, 0) / E.length : 0;
    $("#empStats").innerHTML = [
      stat("Total karyawan", `<span data-count="${E.length}">${E.length}</span>`, "orang"),
      stat("Laki-laki", `<span data-count="${male}">${male}</span>`, "orang"),
      stat("Perempuan", `<span data-count="${E.length - male}">${E.length - male}</span>`, "orang"),
      stat("Rata-rata usia", `<span data-count="${Math.round(avg)}">${Math.round(avg)}</span>`, "tahun")
    ].join("");

    const sel = $("#empDiv"), search = $("#empSearch"), body = $("#empBody");
    [...new Set(E.map((e) => e.gender))].forEach((d) => sel.insertAdjacentHTML("beforeend", `<option>${esc(d)}</option>`));
    const draw = () => {
      const q = norm(search.value), dv = sel.value;
      const rows = E.filter((e) => (dv === "all" || e.gender === dv) && (!q || norm(e.name + e.role + e.email + e.phone).includes(q)));
      body.innerHTML = rows.map((e) => `<tr><td>${esc(e.name)}</td><td>${esc(e.gender)}</td><td class="mono">${e.age} th</td>
        <td class="mono"><a class="lnk" href="${waLink(e.phone)}" target="_blank" rel="noopener">${esc(e.phone)}</a></td>
        <td>${esc(e.role)}</td><td><a class="lnk" href="mailto:${esc(e.email)}">${esc(e.email)}</a></td></tr>`).join("")
        || `<tr><td colspan="6" class="empty">Tidak ada karyawan yang cocok.</td></tr>`;
      $("#empNote").textContent = `${rows.length} dari ${E.length} karyawan ditampilkan · sumber: Database SDM Roemantara`;
    };
    sel.addEventListener("change", draw);
    search.addEventListener("input", draw);
    draw();
  }

  function renderFreelancers() {
    const list = D.freelancers, pos = D.freelancePositions, chips = $("#freeChips"), body = $("#freeBody"), search = $("#freeSearch");
    const empty = pos.filter((p) => !list.some((x) => x.role === p));
    const top = pos.map((p) => [p, list.filter((x) => x.role === p).length]).sort((x, y) => y[1] - x[1])[0];
    $("#freeStats").innerHTML =
      stat("Freelancer", `<span data-count="${list.length}">${list.length}</span>`, "terdaftar") +
      stat("Posisi", `<span data-count="${pos.length}">${pos.length}</span>`, pos.join(" · ")) +
      stat("Posisi terbanyak", esc(top[0]), `${top[1]} orang`) +
      stat("Posisi kosong", `<span data-count="${empty.length}">${empty.length}</span>`, empty.length ? esc(empty.join(", ")) : "semua terisi", empty.length ? "warn" : "");
    let cat = "Semua";
    chips.innerHTML = ["Semua"].concat(pos).map((c, i) => `<button type="button" aria-pressed="${i === 0}" data-cat="${esc(c)}">${esc(c)} <b>${c === "Semua" ? list.length : list.filter((x) => x.role === c).length}</b></button>`).join("");
    const draw = () => {
      const q = norm(search.value);
      const rows = list.filter((x) => (cat === "Semua" || x.role === cat) && (!q || norm(x.name + x.role + x.phone).includes(q)));
      body.innerHTML = rows.map((x, i) => `<tr><td class="mono">${i + 1}</td><td>${esc(x.name)}</td><td><span class="tag tag--plain">${esc(x.role)}</span></td>
          <td class="mono"><a class="tel" href="tel:${x.phone.replace(/\D/g, "")}">${esc(x.phone)}</a></td>
          <td><a class="mini-btn" href="${waLink(x.phone)}" target="_blank" rel="noopener" aria-label="WhatsApp ${esc(x.name)}">WhatsApp</a></td></tr>`).join("")
        || `<tr><td colspan="5" class="empty">${cat !== "Semua" && !list.some((x) => x.role === cat) ? "Belum ada freelancer di posisi ini." : "Tidak ada freelancer yang cocok."}</td></tr>`;
      $("#freeNote").textContent = `${rows.length} dari ${list.length} freelancer ditampilkan · sumber: Database Freelance (Excel)`;
    };
    pressGroup(chips, (b) => { cat = b.dataset.cat; draw(); });
    search.addEventListener("input", draw);
    draw();
  }

  /* Absensi: dashboard Google Apps Script disematkan langsung, jadi selalu
     mengikuti data aslinya. Dimuat saat tab dibuka, dimuat ulang tiap 5 menit. */
  function renderAttendance() {
    const panel = $("#hr-att"), frame = $("#attFrame"), stamp = $("#attStamp");
    const url = D.attendance && D.attendance.url;
    if (!panel || !frame || !url) return;
    $("#attOpen").href = url;
    let timer = 0, loaded = false;
    const time = () => new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const load = () => {
      loaded = true;
      stamp.textContent = "Memuat…";
      frame.src = url + (url.includes("?") ? "&" : "?") + "_t=" + Date.now();
    };
    frame.addEventListener("load", () => { if (frame.src) stamp.textContent = up("Diperbarui " + time()); });
    $("#attReload").addEventListener("click", load);
    const sync = () => {
      clearInterval(timer);
      if (panel.hidden) return;
      if (!loaded) load();
      timer = setInterval(() => { if (!document.hidden) load(); }, (D.attendance.refreshMinutes || 5) * 60000);
    };
    new MutationObserver(sync).observe(panel, { attributes: true, attributeFilter: ["hidden"] });
    sync();
  }

  /* ---------------- INIT ---------------- */
  $$("[data-date]").forEach((el) => (el.textContent = up(fmtDate(today, { day: "2-digit", month: "long", year: "numeric" }))));
  initTheme();
  renderKpi();
  renderAssets(); renderVendors(); renderServices(); renderClient();
  renderRecon(); renderReports(); renderClosing();
  renderEmployees(); renderFreelancers(); renderAttendance();
  initModTabs();
  document.addEventListener("du:docs", () => refreshKpi());
  $$(".reveal, .sec-head").forEach((el) => onIn(el));
  initBuilding();
  initScroll();
  initCad();
  boot();
})();
