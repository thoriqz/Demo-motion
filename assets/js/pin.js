/* =========================================================
   Kunci PIN area Keuangan — hanya Divisi Umum & Direksi.
   Catatan: ini kunci TAMPILAN di sisi browser. Data tetap ada di
   kode halaman; untuk keamanan penuh data keuangan harus disajikan
   server dengan login. Lihat README bagian "Kunci PIN Keuangan".
   ========================================================= */
(function () {
  "use strict";

  const CFG = (window.DU_DATA && window.DU_DATA.access && window.DU_DATA.access.finance) || null;
  const fin = document.getElementById("fin");
  if (!CFG || !fin) return;

  const SALT = "du-fin:";
  const K_SESSION = "du-fin-session", K_TRIES = "du-fin-tries";
  const ss = { get(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } }, set(k, v) { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* abaikan */ } } };
  const ls = { get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* abaikan */ } } };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* SHA-256 ringkas (tanpa crypto.subtle supaya jalan juga di http biasa) */
  function sha256(str) {
    const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
    const bytes = new TextEncoder().encode(str);
    const len = bytes.length, words = new Uint32Array((((len + 9) >> 6) + 1) << 4);
    for (let i = 0; i < len; i++) words[i >> 2] |= bytes[i] << (24 - (i % 4) * 8);
    words[len >> 2] |= 0x80 << (24 - (len % 4) * 8);
    words[words.length - 1] = len * 8;
    const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    const r = (x, n) => (x >>> n) | (x << (32 - n));
    const w = new Uint32Array(64);
    for (let j = 0; j < words.length; j += 16) {
      for (let i = 0; i < 64; i++) {
        if (i < 16) w[i] = words[j + i];
        else {
          const s0 = r(w[i - 15], 7) ^ r(w[i - 15], 18) ^ (w[i - 15] >>> 3);
          const s1 = r(w[i - 2], 17) ^ r(w[i - 2], 19) ^ (w[i - 2] >>> 10);
          w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
        }
      }
      let [a, b, c, d, e, f, g, h] = H;
      for (let i = 0; i < 64; i++) {
        const t1 = (h + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0;
        const t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    return H.map((x) => (x >>> 0).toString(16).padStart(8, "0")).join("");
  }

  /* ---------- Markup gerbang ---------- */
  const gate = document.createElement("div");
  gate.className = "pin-gate";
  gate.innerHTML = `
    <div class="pin-card" role="dialog" aria-labelledby="pinTitle" aria-describedby="pinDesc">
      <div class="pin-lock" aria-hidden="true"><svg viewBox="0 0 48 48"><rect x="10" y="21" width="28" height="21" rx="4"/><path class="shackle" d="M16 21v-6a8 8 0 0 1 16 0v6"/><circle cx="24" cy="31" r="2.6"/><path d="M24 33.5v3.5"/></svg></div>
      <h3 id="pinTitle">Area Keuangan terkunci</h3>
      <p id="pinDesc">Khusus Divisi Umum dan Direksi. Masukkan PIN ${CFG.length} digit Anda.</p>
      <form class="pin-form" autocomplete="off">
        <label class="pin-field" for="pinInput">
          <span class="pin-dots" aria-hidden="true">${"<i></i>".repeat(CFG.length)}</span>
          <input id="pinInput" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="${CFG.length}" aria-label="PIN ${CFG.length} digit" autocomplete="off">
        </label>
        <p class="pin-msg" id="pinMsg" role="alert" aria-live="assertive"></p>
        <button class="btn btn--solid pin-btn" type="submit">Buka akses</button>
      </form>
    </div>`;
  const bar = document.createElement("div");
  bar.className = "pin-bar";
  bar.hidden = true;
  bar.innerHTML = `<span class="pin-bar__dot" aria-hidden="true"></span><span id="pinWho"></span><button type="button" class="mini-btn" id="pinLockNow">Kunci sekarang</button>`;
  const anchor = fin.querySelector(".modtabs");
  fin.insertBefore(gate, anchor);
  fin.insertBefore(bar, anchor);

  const form = gate.querySelector("form"), input = gate.querySelector("#pinInput"), msg = gate.querySelector("#pinMsg");
  const dots = Array.from(gate.querySelectorAll(".pin-dots i"));
  const card = gate.querySelector(".pin-card");

  /* ---------- Status ---------- */
  let lastActive = Date.now();
  let memSession = null; // cadangan bila sessionStorage diblokir browser
  const session = () => ss.get(K_SESSION) || memSession;
  const setSession = (v) => { memSession = v; ss.set(K_SESSION, v); };
  function apply() {
    const s = session();
    const open = !!s;
    document.body.classList.toggle("fin-locked", !open);
    gate.hidden = open;
    bar.hidden = !open;
    if (open) {
      const role = CFG.roles.find((r) => r.id === s.role);
      bar.querySelector("#pinWho").textContent = `Dibuka sebagai ${role ? role.label : s.role} · terkunci otomatis setelah ${CFG.idleMinutes} menit tidak aktif`;
    }
  }
  function lock(reason) {
    if (!session()) return;
    setSession(null);
    apply();
    document.dispatchEvent(new CustomEvent("du:fin-lock"));
    if (reason) say(reason);
  }
  function say(t) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = t;
    el.classList.add("is-on");
    clearTimeout(say._t);
    say._t = setTimeout(() => el.classList.remove("is-on"), 2600);
  }

  const paintDots = () => dots.forEach((d, i) => d.classList.toggle("on", i < input.value.length));
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(0, CFG.length);
    paintDots();
    msg.textContent = "";
    if (input.value.length === CFG.length) form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event("submit", { cancelable: true }));
  });

  let lockTimer = 0;
  function lockedOut() {
    const t = ls.get(K_TRIES);
    return t && t.until && t.until > Date.now() ? t.until : 0;
  }
  function showLockout(until) {
    input.disabled = true;
    const tick = () => {
      const left = Math.ceil((until - Date.now()) / 1000);
      if (left <= 0) { input.disabled = false; msg.textContent = ""; ls.set(K_TRIES, null); input.focus(); return; }
      msg.textContent = `Terlalu banyak percobaan. Coba lagi dalam ${left} detik.`;
      lockTimer = setTimeout(tick, 1000);
    };
    clearTimeout(lockTimer);
    tick();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (lockedOut()) return;
    if (input.value.length !== CFG.length) { msg.textContent = `PIN harus ${CFG.length} digit.`; return; }
    const h = sha256(SALT + input.value);
    const role = CFG.roles.find((r) => r.hash === h);
    if (role) {
      const roleId = role.id;
      ls.set(K_TRIES, null);
      setSession({ role: roleId, at: Date.now() });
      input.value = ""; paintDots();
      lastActive = Date.now();
      apply();
      fin.classList.remove("pin-opened"); void fin.offsetWidth; fin.classList.add("pin-opened");
      document.dispatchEvent(new CustomEvent("du:fin-unlock", { detail: { role: roleId } }));
      say(`Akses keuangan dibuka · ${role.label}`);
      return;
    }
    const t = ls.get(K_TRIES) || { n: 0 };
    t.n += 1;
    if (t.n >= CFG.maxTries) { t.until = Date.now() + CFG.lockSeconds * 1000; t.n = 0; }
    ls.set(K_TRIES, t);
    input.value = ""; paintDots();
    card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake");
    if (t.until) showLockout(t.until);
    else msg.textContent = `PIN salah. Sisa ${CFG.maxTries - t.n} percobaan.`;
  });

  bar.querySelector("#pinLockNow").addEventListener("click", () => lock("Area keuangan dikunci"));
  ["pointerdown", "keydown", "scroll"].forEach((ev) => addEventListener(ev, () => (lastActive = Date.now()), { passive: true }));
  setInterval(() => { if (session() && Date.now() - lastActive > CFG.idleMinutes * 60000) lock("Area keuangan terkunci otomatis karena tidak ada aktivitas"); }, 20000);

  /* Klik kartu keuangan yang tersamar di halaman lain → arahkan ke gerbang */
  document.addEventListener("click", (e) => {
    const s = e.target.closest('[data-secure="finance"]');
    if (!s || session()) return;
    if (s.tagName !== "A") { e.preventDefault(); location.hash = "fin"; }
    setTimeout(() => input.focus(), 400);
  });

  window.DUPin = { hash: (pin) => sha256(SALT + String(pin)), lock: () => lock(), isOpen: () => !!session() };
  const until = lockedOut();
  apply();
  if (until) showLockout(until);
})();
