"""Bungkus dashboard/index.html menjadi halaman artifact yang bisa menerbitkan dirinya sendiri.

Isi halaman disimpan di <template id="dash-src">, data di <script id="dash-state">,
dan skrip kecil dash-boot menyalin template ke halaman lalu menjalankan skripnya berurutan.
Pemakaian: python3 dashboard/build_artifact.py OUT.html [STATE.json]
"""
import re, sys, pathlib
src = pathlib.Path(__file__).with_name("index.html").read_text()
page = src.split("<!--PAGE-START-->", 1)[1].split("<!--PAGE-END-->", 1)[0]
page = re.sub(r"\s*<title>.*?</title>\s*", "\n", page, count=1)
assert page.count("</script") == len(re.findall(r"<script[ >]", page)) - page.count("'<script "), "teks </script di dalam skrip akan memutus template"
assert "</template" not in page
boot = r"""(function () {
  try { window.__DASH_EMBED = JSON.parse(document.getElementById("dash-state").textContent) || {}; } catch (e) { window.__DASH_EMBED = {}; }
  var tpl = document.getElementById("dash-src");
  window.__DASH_TPL = tpl.innerHTML;
  var frag = tpl.content.cloneNode(true), list = [];
  [].slice.call(frag.querySelectorAll("script")).forEach(function (s) { var c = document.createComment("s"); s.parentNode.replaceChild(c, s); list.push([c, s]); });
  document.body.appendChild(frag);
  (function next(i) {
    if (i >= list.length) return;
    var o = list[i][1], n = document.createElement("script");
    for (var a = 0; a < o.attributes.length; a++) n.setAttribute(o.attributes[a].name, o.attributes[a].value);
    if (o.src) { n.onload = n.onerror = function () { next(i + 1); }; list[i][0].parentNode.replaceChild(n, list[i][0]); }
    else { n.textContent = o.textContent; list[i][0].parentNode.replaceChild(n, list[i][0]); next(i + 1); }
  })(0);
})();"""
out = ('<title>Dashboard Divisi Umum</title>\n'
       '<script type="application/json" id="dash-state">{"rev":0}</script>\n'
       '<template id="dash-src">' + page + '</template>\n'
       '<script id="dash-boot">' + boot + '</script>')
if len(sys.argv) > 2:  # data terbitan terakhir (isi #dash-state) agar tidak hilang saat halaman diperbarui
    state = pathlib.Path(sys.argv[2]).read_text().strip()
    assert "</" not in state
    out = out.replace('{"rev":0}', state, 1)
pathlib.Path(sys.argv[1]).write_text(out)
print("ok", len(out))
