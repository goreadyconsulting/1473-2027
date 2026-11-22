#!/usr/bin/env python3
"""Build licensed real-photo destination frames (NO AI-generated world images).

Sources are documented in PHOTOGRAPHY_CREDITS.md. All seven are real Wikimedia
photographs, downloaded only at build time; shipped WebPs live locally.
Three frames for each place are Ken-Burns crops of THE SAME physical photograph.
"""
from __future__ import annotations

import hashlib
import io
import json
import pathlib
import time
import urllib.parse

import requests
from PIL import Image, ImageEnhance, ImageOps

OUTPUT = pathlib.Path("assets/photography")
OUTPUT.mkdir(parents=True, exist_ok=True)
SOURCES = [
    ("emberfall", "Crook Hall medieval hall interior.jpg"),
    ("glasswind", "Grocery Store Aisle, vermont.jpg"),
    ("verdant", "Woodland path.jpg"),
    ("stormglass", "The lighthouse in the storm.jpg"),
    ("bleakwater", "Ponte de Lima-Ponte Medieval e Romana-Stones at end of bridge.jpg"),
    ("sanctum", "Interior of an apothecary's shop, c. 1625, WHMM Wellcome M0000661.jpg"),
    ("iron", "Intreior of abandoned factory.JPG"),
]
HEADERS = {"User-Agent": "TheCrossing1473/1.1 (noncommercial LARP; public repo goreadyconsulting/1473-2027; attribution in PHOTOGRAPHY_CREDITS.md)"}


def get_image(name: str) -> Image.Image:
    canonical = name.replace(" ", "_")
    digest = hashlib.md5(canonical.encode("utf-8")).hexdigest()
    quoted = urllib.parse.quote(canonical, safe="().,_'-")
    base = f"https://upload.wikimedia.org/wikipedia/commons/{digest[0]}/{digest[:2]}/{quoted}"
    urls = [
        f"https://upload.wikimedia.org/wikipedia/commons/thumb/{digest[0]}/{digest[:2]}/{quoted}/1280px-{quoted}",
        base,
        "https://commons.wikimedia.org/wiki/Special:Redirect/file/" + quoted + "?width=1280",
    ]
    issues = []
    for attempt, url in enumerate(urls):
        try:
            response = requests.get(url, headers=HEADERS, timeout=50, allow_redirects=True)
            response.raise_for_status()
            if "image/" not in response.headers.get("content-type", ""):
                raise ValueError("not an image: " + response.headers.get("content-type","?"))
            if len(response.content) < 12000:
                raise ValueError("image suspiciously small")
            im = Image.open(io.BytesIO(response.content))
            return ImageOps.exif_transpose(im).convert("RGB")
        except Exception as exc:
            issues.append(f"{attempt + 1}: {type(exc).__name__} {exc}")
            time.sleep(1.1)
    raise RuntimeError(f"Could not download Wikimedia photograph {name!r}: {issues}")


def render(im: Image.Image, number: int, filename: pathlib.Path):
    width, height = 1440, 810
    # The shots are different camera pushes on a single *real* place, not three
    # unrelated synthetic places. Different center points give a realistic reel.
    centers = [(0.49, .50), (0.54, .48), (0.45, .55)]
    zooms = [1.0, 1.17, 1.35]
    ratio = width / height
    iw, ih = im.size
    # Crop the real photograph at its native frame, then move the lens in.
    if iw / ih >= ratio:
        crop_h = ih / zooms[number]
        crop_w = crop_h * ratio
    else:
        crop_w = iw / zooms[number]
        crop_h = crop_w / ratio
    fx, fy = centers[number]
    left = min(max(iw * fx - crop_w / 2, 0), iw - crop_w)
    top = min(max(ih * fy - crop_h / 2, 0), ih - crop_h)
    box = (int(left), int(top), int(left + crop_w), int(top + crop_h))
    frame = im.crop(box).resize((width, height), Image.Resampling.LANCZOS)
    frame = ImageEnhance.Contrast(frame).enhance(1.07)
    frame = ImageEnhance.Color(frame).enhance(.83)
    frame = ImageEnhance.Brightness(frame).enhance(.92)
    frame.save(filename, "WEBP", quality=80, method=6)
    if filename.stat().st_size < 20000:
        raise ValueError(f"Invalid encoded photograph: {filename}")


def main():
    manifest = {}
    for place, name in SOURCES:
        original = get_image(name)
        outputs = []
        for shot in range(3):
            target = OUTPUT / f"{place}-{shot+1}.webp"
            render(original, shot, target)
            outputs.append(str(target))
            print(place, shot+1, original.size, target.stat().st_size, flush=True)
        manifest[place] = {"source_name": name, "frames": outputs}
    # Real masonry cropped from the credited Crook Hall photograph becomes the
    # stone's albedo and bump material in the continuous 3D walkway/altar.
    # This is a photographic texture: no generative image or procedural fake art.
    masonry=Image.open(OUTPUT / "emberfall-1.webp").convert("RGB")
    tw,th=masonry.size
    crop=masonry.crop((int(tw*.30),int(th*.11),int(tw*.64),int(th*.73)))
    crop=ImageOps.fit(crop,(1024,1024),method=Image.Resampling.LANCZOS)
    crop=ImageEnhance.Contrast(crop).enhance(1.18)
    crop=ImageEnhance.Sharpness(crop).enhance(1.4)
    textures=pathlib.Path("assets/textures")
    textures.mkdir(parents=True,exist_ok=True)
    crop.save(textures/"stone-masonry.webp","WEBP",quality=83,method=6)
    height=ImageEnhance.Contrast(crop.convert("L")).enhance(1.25)
    height.save(textures/"stone-height.webp","WEBP",quality=77,method=6)
    print("Photographic masonry textures", (textures/"stone-masonry.webp").stat().st_size, flush=True)
    (OUTPUT / "sources.json").write_text(json.dumps(manifest, indent=2)+"\n", encoding="utf-8")
    assert len(manifest) == 7 and sum(len(x["frames"]) for x in manifest.values()) == 21


if __name__ == "__main__":
    main()
