"""Produit les variantes WebP du nouveau portrait, sans modifier la source."""

from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
source = root / "docs" / "portrait-nexoslocal-v2.png"
with Image.open(source) as original:
    portrait = ImageOps.exif_transpose(original).convert("RGB")
    for width in (128, 320, 820):
        height = round(portrait.height * width / portrait.width)
        target = root / "assets" / f"portrait-nexoslocal-{width}-v2.webp"
        portrait.resize((width, height), Image.Resampling.LANCZOS).save(
            target, "WEBP", quality=82, method=6
        )
        print(f"{target.name}: {width} × {height}, {target.stat().st_size} octets")
print(f"Original conservé : {source.stat().st_size} octets")
