/* =========================================================
   Penyimpanan data input manual (FPP, tugas harian, riwayat aktivitas).
   Di claude.ai: database artifact bersama (koleksi per jenis data).
   Di salinan lokal: localStorage browser ini saja.
   ========================================================= */
(function () {
  "use strict";

  const S = { mode: "loading", db: null, user: null, uid: null, local: {} };
  const listeners = {};
  const lkey = (name) => "du-store-" + name;
  const readLocal = (name) => { try { return JSON.parse(localStorage.getItem(lkey(name))) || []; } catch (e) { return []; } };
  const writeLocal = (name, arr) => { try { localStorage.setItem(lkey(name), JSON.stringify(arr)); } catch (e) { /* abaikan */ } };
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  const ready = (async () => {
    if (!window.claude || typeof window.claude.use !== "function") { S.mode = "local"; return; }
    const [db, user] = await Promise.all([claude.use("db"), claude.use("user")]);
    S.user = user;
    if (user) { try { S.uid = await user.id(); } catch (e) { S.uid = null; } }
    if (!db) { S.mode = "local"; return; }
    S.db = db;
    S.mode = "live";
  })();

  function emitLocal(name, order) {
    const rows = readLocal(name).sort((a, b) => String(b[order] || "").localeCompare(String(a[order] || "")));
    (listeners[name] || []).forEach((fn) => fn(rows, "local"));
  }

  /* Berlangganan satu koleksi: fn(rows, mode). Urut menurun menurut `order`. */
  async function watch(name, fn, opts = {}) {
    const order = opts.order || "at";
    await ready;
    if (S.mode !== "live") {
      (listeners[name] = listeners[name] || []).push(fn);
      emitLocal(name, order);
      return;
    }
    S.db.collection(name).orderBy(order, "desc").limit(opts.limit || 500).onSnapshot(
      (snap) => fn(snap.docs.filter((d) => d.exists).map((d) => ({ id: d.id, ...d.data() })), "live"),
      (err) => fn(null, "error", err)
    );
  }

  async function add(name, data) {
    await ready;
    const row = { ...data, by: S.uid || "" };
    if (S.mode === "live") return (await S.db.collection(name).add(row)).id;
    const arr = readLocal(name);
    row.id = newId();
    arr.push(row);
    writeLocal(name, arr);
    emitLocal(name, "at");
    return row.id;
  }
  async function update(name, id, patch) {
    await ready;
    if (S.mode === "live") return S.db.collection(name).doc(id).update(patch);
    writeLocal(name, readLocal(name).map((r) => (r.id === id ? { ...r, ...patch } : r)));
    emitLocal(name, "at");
  }
  async function remove(name, id) {
    await ready;
    if (S.mode === "live") return S.db.collection(name).doc(id).delete();
    writeLocal(name, readLocal(name).filter((r) => r.id !== id));
    emitLocal(name, "at");
  }

  /* Nama penampil untuk id pengguna (tidak disimpan, selalu dibaca ulang) */
  async function names(ids) {
    await ready;
    const list = [...new Set(ids.filter(Boolean))];
    if (!S.user || !list.length) return {};
    try { return await S.user.profiles(list); } catch (e) { return {}; }
  }

  window.DUStore = { ready, mode: () => S.mode, watch, add, update, remove, names };

  /* ---------- Riwayat aktivitas harian ---------- */
  const pad = (n) => String(n).padStart(2, "0");
  const day = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  window.DULog = {
    add(area, text) {
      const now = new Date();
      add("activity", { at: now.toISOString(), day: day(now), area, text: String(text).slice(0, 240) }).catch(() => {});
    }
  };
})();
