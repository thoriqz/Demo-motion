"""Buat ikon bookmark / layar utama ponsel dari logo.

Pakai:  python3 tools/make_icons.py [path-logo]
- path-logo boleh PNG/JPG (disarankan persegi, min. 512x512). Tanpa argumen
  dipakai assets/icons/logo.png bila ada, kalau tidak assets/icons/logo.svg
  (SVG dirender lewat Playwright/Chromium).
Hasil: assets/icons/apple-touch-icon.png (180), icon-192.png, icon-512.png,
icon-maskable-512.png, favicon-32.png.
"""
import os, sys, subprocess, tempfile
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "icons")
PAPER = (245, 243, 234)


def render_svg(svg):
    png = os.path.join(tempfile.mkdtemp(), "logo.png")
    js = (
        "const {chromium}=require(process.env.PW);(async()=>{const b=await chromium.launch();"
        "const p=await b.newPage({viewport:{width:512,height:512}});"
        f"await p.goto('file://{svg}');await p.screenshot({{path:'{png}'}});await b.close();}})()"
    )
    pw = os.environ.get("PW") or os.path.join(subprocess.check_output(["npm", "root", "-g"], text=True).strip(), "playwright")
    subprocess.run(["node", "-e", js], check=True, env={**os.environ, "PW": pw})
    return png


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else None
    if not src:
        png = os.path.join(OUT, "logo.png")
        src = png if os.path.exists(png) else os.path.join(OUT, "logo.svg")
    if src.lower().endswith(".svg"):
        src = render_svg(os.path.abspath(src))
    logo = Image.open(src).convert("RGBA")
    # tempel di atas kertas persegi agar logo tidak terpotong
    side = max(logo.size)
    sq = Image.new("RGBA", (side, side), PAPER + (255,))
    sq.paste(logo, ((side - logo.width) // 2, (side - logo.height) // 2), logo)
    for name, size in [("apple-touch-icon.png", 180), ("icon-192.png", 192), ("icon-512.png", 512), ("favicon-32.png", 32)]:
        sq.convert("RGB").resize((size, size), Image.LANCZOS).save(os.path.join(OUT, name))
    # versi maskable: logo diperkecil ke area aman 80%
    m = Image.new("RGB", (512, 512), PAPER)
    inner = sq.convert("RGB").resize((410, 410), Image.LANCZOS)
    m.paste(inner, (51, 51))
    m.save(os.path.join(OUT, "icon-maskable-512.png"))
    print("Ikon dibuat di", OUT)


if __name__ == "__main__":
    main()
