# -*- coding: utf-8 -*-
"""耄耋图鉴图片生成器"""
import json, os
from PIL import Image, ImageDraw, ImageFont, ImageEnhance

PLUGIN_DIR = os.path.join('D:', os.sep, 'Yz', 'TRSS-Yunzai', 'plugins', 'rollmaodie')
IMG_DIR = os.path.join(PLUGIN_DIR, 'image')
COLLECT_FILE = os.path.join(PLUGIN_DIR, 'collector.json')
DATA_FILE = os.path.join(PLUGIN_DIR, 'maodie.json')

import sys
USER_ID = sys.argv[1] if len(sys.argv) > 1 else '0'

with open(DATA_FILE, 'r', encoding='utf-8-sig') as f:
    items = json.load(f)

collector = {}
if os.path.exists(COLLECT_FILE):
    with open(COLLECT_FILE, 'r', encoding='utf-8-sig') as f:
        collector = json.load(f)

collected_ids = {c['id'] for c in collector.get(USER_ID, [])}

def get_font(size):
    for name in ['msyh.ttc', 'msyhbd.ttc', 'simhei.ttf', 'simsun.ttc']:
        for prefix in [r'C:\Windows\Fonts', r'C:\Users\H\AppData\Local\Microsoft\Windows\Fonts']:
            p = os.path.join(prefix, name)
            if os.path.exists(p):
                try:
                    return ImageFont.truetype(p, size)
                except:
                    pass
    return ImageFont.load_default()

font_title = get_font(28)
font_name = get_font(11)
font_count = get_font(16)

COLS = 8
PAD = 6
CELL_W, CELL_H = 110, 120
TITLE_H = 70
FOOTER_H = 40
ROWS = (len(items) + COLS - 1) // COLS
W = COLS * (CELL_W + PAD) + PAD
H = TITLE_H + ROWS * (CELL_H + PAD) + PAD + FOOTER_H

canvas = Image.new('RGB', (W, H), (34, 34, 40))
draw = ImageDraw.Draw(canvas)

total = len(items)
done = len(collected_ids)
pct = round(done / total * 100) if total else 0
title = f'\U0001f431 耄耋图鉴  {done}/{total}\uff08{pct}%\uff09'
bbox = draw.textbbox((0, 0), title, font=font_title)
tw = bbox[2] - bbox[0]
draw.text(((W - tw) // 2, 16), title, fill=(255, 200, 60), font=font_title)

bar_y, bar_h, bar_w, bar_x = 52, 10, W - 80, 40
draw.rounded_rectangle([bar_x, bar_y, bar_x + bar_w, bar_y + bar_h], 5, fill=(60, 60, 70))
if done > 0:
    fill_w = max(10, int(bar_w * done / total))
    draw.rounded_rectangle([bar_x, bar_y, bar_x + fill_w, bar_y + bar_h], 5, fill=(100, 200, 100))

for i, item in enumerate(items):
    col, row = i % COLS, i // COLS
    x = PAD + col * (CELL_W + PAD)
    y = TITLE_H + PAD + row * (CELL_H + PAD)
    is_collected = item['id'] in collected_ids

    bg = (50, 50, 58) if is_collected else (40, 40, 48)
    draw.rounded_rectangle([x, y, x + CELL_W, y + CELL_H], 8, fill=bg,
                           outline=(100, 200, 100) if is_collected else (60, 60, 68), width=1)

    img_file = None
    for ext in ['png', 'jpg', 'jpeg', 'webp', 'gif']:
        # Try name first, then id for backward compatibility
        for fname in [f"{item['name']}.{ext}", f"{item['id']}.{ext}"]:
            p = os.path.join(IMG_DIR, fname)
            if os.path.exists(p):
                img_file = p
                break
        if img_file:
            break

    img_size = 60
    if img_file:
        try:
            pig_img = Image.open(img_file).convert('RGBA')
            pig_img = pig_img.resize((img_size, img_size), Image.LANCZOS)
            if not is_collected:
                pig_img = ImageEnhance.Color(pig_img).enhance(0)
                pig_img = ImageEnhance.Brightness(pig_img).enhance(0.4)
            ix = x + (CELL_W - img_size) // 2
            iy = y + 6
            canvas.paste(pig_img, (ix, iy), pig_img)
        except:
            draw.text((x + 10, y + 20), '?', fill=(120, 120, 130), font=font_title)
    else:
        draw.text((x + 10, y + 20), '?', fill=(80, 80, 90), font=font_name)

    name = item['name']
    nbbox = draw.textbbox((0, 0), name, font=font_name)
    nw = nbbox[2] - nbbox[0]
    nx = x + (CELL_W - nw) // 2
    ny = y + img_size + 12
    ncolor = (220, 220, 230) if is_collected else (100, 100, 110)
    draw.text((nx, ny), name, fill=ncolor, font=font_name)

footer = '\u7eff\u8272\u8fb9\u6846 = \u5df2\u6536\u96c6 | \u7070\u8272 = \u672a\u89e3\u9501'
fbbox = draw.textbbox((0, 0), footer, font=font_count)
fw = fbbox[2] - fbbox[0]
draw.text(((W - fw) // 2, H - 32), footer, fill=(130, 130, 140), font=font_count)

out = os.path.join(PLUGIN_DIR, f'collection_{USER_ID}.png')
canvas.save(out, 'PNG')
print(out)
