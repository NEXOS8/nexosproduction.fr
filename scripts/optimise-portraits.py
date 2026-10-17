"""Produit les variantes WebP du portrait existant, sans modifier l’original."""

from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
source = root / "Screenshot_20260703-171333.png"
with Image.open(source) as original:
    portrait = ImageOps.exif_transpose(original).convert("RGB")
    for width in (128, 320, portrait.width):
        height = round(portrait.height * width / portrait.width)
        target = root / "assets" / f"portrait-nexoslocal-{width}-v1.webp"
        portrait.resize((width, height), Image.Resampling.LANCZOS).save(
            target, "WEBP", quality=82, method=6
        )
        print(f"{target.name}: {width} × {height}, {target.stat().st_size} octets")
print(f"Original conservé : {source.stat().st_size} octets")
