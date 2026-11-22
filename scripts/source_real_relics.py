#!/usr/bin/env python3
"""Crop genuine Wikimedia Commons object photographs into locally cached relic shots."""
from __future__ import annotations
import hashlib
import io
import pathlib
import time
import urllib.parse
import requests
from PIL import Image, ImageOps, ImageEnhance, ImageDraw

OUT=pathlib.Path("assets/objects-photography")
OUT.mkdir(parents=True,exist_ok=True)
SOURCES={
 "smartphone":"Galaxy Note 4 on White Table 1.jpg",
 "toilet":"Toilet Rolls (50845290776).jpg",
 "history":"OpenBook.jpg",
 "medical":"Standard First Aid Kit and Essential Emergency Medical Supplies 01.jpg",
 "worldmap":"Map of the world.jpg",
 "firearm":"S&W M&P 2.0 Handgun - 9mm Pistol.jpg",
 "led":"Led-flashlight.jpg",
 "condoms":"Overview condoms of different brands.jpg",
 "filter":"Water purification unit.JPG",
}
HEADERS={"User-Agent":"TheCrossing1473/1.1 (noncommercial LARP; photographer credits in PHOTOGRAPHY_CREDITS.md)"}
def fetch(name):
 canon=name.replace(" ","_")
 h=hashlib.md5(canon.encode("utf-8")).hexdigest()
 quoted=urllib.parse.quote(canon,safe="().,_'-")
 urls=[
   f"https://upload.wikimedia.org/wikipedia/commons/thumb/{h[0]}/{h[:2]}/{quoted}/960px-{quoted}",
   f"https://upload.wikimedia.org/wikipedia/commons/{h[0]}/{h[:2]}/{quoted}",
   "https://commons.wikimedia.org/wiki/Special:Redirect/file/"+quoted+"?width=960",
 ]
 failures=[]
 for url in urls:
  try:
   r=requests.get(url,headers=HEADERS,timeout=35)
   r.raise_for_status()
   if not r.headers.get("content-type","").startswith("image/"):raise ValueError("Not image")
   img=Image.open(io.BytesIO(r.content))
   return ImageOps.exif_transpose(img).convert("RGB")
  except Exception as e: failures.append(str(e)[:130]);time.sleep(.6)
 raise RuntimeError(name+": "+"; ".join(failures))
def process(im,file):
 # Square professional artifact portrait; actual photo rather than flat vector illustration.
 canvas=ImageOps.fit(im,(820,820),method=Image.Resampling.LANCZOS,centering=(.5,.48))
 canvas=ImageEnhance.Contrast(canvas).enhance(1.11)
 canvas=ImageEnhance.Color(canvas).enhance(.86)
 # Slight dark filmic vignette gives consistent exhibit lighting, no text/cards baked in.
 overlay=Image.new("RGBA",canvas.size,(0,0,0,0))
 pixels=overlay.load()
 for y in range(820):
  for x in range(820):
   dx=(x-410)/410;dy=(y-410)/410
   r=(dx*dx+dy*dy)**.5
   alpha=int(max(0,min(1,(r-.55)*.50))*100)
   pixels[x,y]=(4,11,14,alpha)
 canvas=Image.alpha_composite(canvas.convert("RGBA"),overlay).convert("RGB")
 canvas.save(file,"WEBP",quality=81,method=6)
 if file.stat().st_size<10000:raise ValueError("Photo too small "+str(file))
def main():
 for id,name in SOURCES.items():
  photo=fetch(name);target=OUT/(id+".webp")
  process(photo,target)
  print(id,name,photo.size,target.stat().st_size,flush=True)
 assert len(list(OUT.glob("*.webp")))==9

if __name__=="__main__":
 main()
