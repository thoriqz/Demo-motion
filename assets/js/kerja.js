/* =========================================================
   Tampilan Gambar Kerja: nomor lembar, garis dimensi, dan kop gambar
   mengikuti menu yang sedang dibuka.
   ========================================================= */
(function () {
  "use strict";

  if (document.body.dataset.look !== "kerja") return;
  const $ = (s) => document.querySelector(s);
  const SHEETS = { home: "A-00", ga: "GA-01", adm: "AD-02", fin: "FN-03", hr: "HR-04", legal: "LG-05", tugas: "TG-06" };
  const title = $("#viewTitle");
  if (!title) return;

  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  $("#gkKopDate").textContent = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()}`;

  const swap = (el, text) => {
    if (!el || el.textContent === text) return;
    el.textContent = text;
    el.classList.remove("is-swap"); void el.offsetWidth; el.classList.add("is-swap");
  };

  function sync() {
    const view = (document.querySelector("section.view:not([hidden])") || {}).id || "home";
    const code = SHEETS[view] || "A-00";
    const sec = document.getElementById(view);
    const tabs = sec ? sec.querySelectorAll(".modtabs [role=tab]").length : 0;
    const dim = view === "home" ? `${document.querySelectorAll(".modtabs [role=tab]").length + 1} MODUL · ${$("#gkKopDate").textContent}`
      : tabs ? `${tabs} MODUL` : "ARSIP PDF";
    const codeEl = $("#gkCode");
    if (codeEl && codeEl.firstElementChild.textContent !== code) {
      codeEl.firstElementChild.textContent = code;
      codeEl.classList.remove("is-swap"); void codeEl.offsetWidth; codeEl.classList.add("is-swap");
    }
    const dimEl = $("#gkDim");
    if (dimEl && $("#gkDimTxt").textContent !== dim) {
      $("#gkDimTxt").textContent = dim;
      dimEl.classList.remove("is-swap"); void dimEl.offsetWidth; dimEl.classList.add("is-swap");
    }
    swap($("#gkKopTitle"), view === "home" ? "Beranda" : title.textContent);
    swap($("#gkKopNo"), code);
  }

  new MutationObserver(sync).observe(title, { childList: true, characterData: true, subtree: true });
  sync();
})();
