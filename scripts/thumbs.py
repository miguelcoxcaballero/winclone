# Creates 320x180 thumbnails for every wallpaper in public/wallpapers (requires Pillow).
import glob, os
from PIL import Image
os.chdir(os.path.join(os.path.dirname(__file__), '..', 'public', 'wallpapers'))
for f in glob.glob('*.jpg'):
    if f.endswith('-thumb.jpg'):
        continue
    im = Image.open(f)
    im.thumbnail((320, 180), Image.LANCZOS)
    im.save(f.replace('.jpg', '-thumb.jpg'), quality=82)
