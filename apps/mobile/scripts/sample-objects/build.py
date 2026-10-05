#!/usr/bin/env python3
"""
Dựng dữ liệu "đồ có sẵn trong ảnh mẫu" cho công cụ Xóa đồ cũ của bản thử (apps/mobile), giả lập kết quả AI:

  1. segment  tách mask từng món bằng SAM (rembg, gợi ý theo khung + điểm)      → WORK/masks/<phòng>__<món>.png
  2. bake     từ mask dựng nét viền bám dáng (PNG) và mảng lấp inpainting LaMa (WebP) → WORK/assets, WORK/meta.json
  3. gen      chép ảnh vào assets/rooms/objects, sinh src/data/roomObjects.ts

Chạy trong venv có rembg[cpu], scipy, scikit-image, pillow (không cài vào hệ thống):
  U2NET_HOME=<thư mục mô hình> python build.py all --work <thư mục tạm>
Mô hình tải về U2NET_HOME: SAM vit_b (rembg tự tải), LaMa ONNX (Carve/LaMa-ONNX trên Hugging Face, tải ở bước bake).
Danh sách món và khung gợi ý: objects.json cạnh file này.
"""
import argparse, json, os, shutil, urllib.request

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
APP = os.path.abspath(os.path.join(HERE, '..', '..'))
ROOMS = os.path.join(APP, 'assets', 'rooms')
LAMA_URL = 'https://huggingface.co/Carve/LaMa-ONNX/resolve/main/lama_fp32.onnx'


def load_objects():
    data = json.load(open(os.path.join(HERE, 'objects.json'), encoding='utf-8'))
    return {k: v for k, v in data.items() if not k.startswith('_')}


def largest(m):
    lab, n = ndi.label(m)
    if n > 1:
        sizes = ndi.sum(m, lab, range(1, n + 1))
        m = lab == (1 + int(np.argmax(sizes)))
    return ndi.binary_fill_holes(m)


# ── 1. Tách mask bằng SAM ────────────────────────────────────────────────────
def segment(work, only):
    from rembg import new_session, remove

    os.makedirs(f'{work}/masks', exist_ok=True)
    sess = new_session('sam')
    for room, objs in load_objects().items():
        im = Image.open(f'{ROOMS}/{room}.jpg').convert('RGB')
        W, H = im.size
        # Món có "exclude" chạy sau để trừ mask của món kia (sofa trừ bàn trà).
        for o in sorted(objs, key=lambda o: 'exclude' in o):
            if only and o['id'] not in only:
                continue
            x0, y0, x1, y1 = o['box']
            prompt = [{'type': 'rectangle', 'data': [int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H)], 'label': 1}]
            prompt += [{'type': 'point', 'data': [int(x * W), int(y * H)], 'label': 1} for x, y in o.get('points', [])]
            m = np.array(remove(im, session=sess, sam_prompt=prompt, only_mask=True)) > 127
            pad = 0.04
            clip = np.zeros_like(m)
            clip[int(max(0, y0 - pad) * H):int(min(1, y1 + pad) * H), int(max(0, x0 - pad) * W):int(min(1, x1 + pad) * W)] = True
            m &= clip
            for other in o.get('exclude', []):
                m &= ~(np.asarray(Image.open(f'{work}/masks/{room}__{other}.png')) > 127)
            m = largest(m)
            Image.fromarray((m * 255).astype(np.uint8)).save(f'{work}/masks/{room}__{o["id"]}.png')
            ys, xs = np.nonzero(m)
            print(f'segment {room}/{o["id"]} area={int(m.sum())} bbox=({xs.min() / W:.3f},{ys.min() / H:.3f})–({(xs.max() + 1) / W:.3f},{(ys.max() + 1) / H:.3f})', flush=True)


# ── 2. Nét viền + mảng lấp ──────────────────────────────────────────────────
def lama_session():
    import onnxruntime as ort

    path = os.path.join(os.environ.get('U2NET_HOME', os.path.expanduser('~/.u2net')), 'lama', 'lama_fp32.onnx')
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        print('tải LaMa…', flush=True)
        urllib.request.urlretrieve(LAMA_URL, path)
    return ort.InferenceSession(path, providers=['CPUExecutionProvider'])


def lama_fill(sess, arr, mask, box):
    """Inpainting LaMa trên ô vuông quanh món (đủ ngữ cảnh tường / sàn), trả về cả ảnh với vùng mask đã lấp."""
    H, W = mask.shape
    x0, y0, x1, y1 = box
    side = int(min(max(max(x1 - x0, y1 - y0) * 2.0, 320), min(W, H)))
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    sx = min(max(cx - side // 2, 0), W - side)
    sy = min(max(cy - side // 2, 0), H - side)
    crop = arr[sy:sy + side, sx:sx + side]
    mc = mask[sy:sy + side, sx:sx + side]
    im = np.asarray(Image.fromarray((crop * 255).astype(np.uint8)).resize((512, 512), Image.BICUBIC)).astype(np.float32) / 255
    mk = np.asarray(Image.fromarray((mc * 255).astype(np.uint8)).resize((512, 512), Image.NEAREST)) > 127
    mk = ndi.binary_dilation(mk, iterations=2).astype(np.float32)
    out = sess.run(None, {'image': im.transpose(2, 0, 1)[None], 'mask': mk[None, None]})[0][0].transpose(1, 2, 0)
    if out.max() > 1.5:
        out = out / 255.0
    out = np.asarray(Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8)).resize((side, side), Image.BICUBIC)).astype(float) / 255
    full = arr.copy()
    full[sy:sy + side, sx:sx + side] = np.where(mc[..., None], out, crop)
    return full


def outline_rgba(sm):
    """Nét viền theo khoảng cách có dấu tới mép mask: lõi trắng (onImage) ~5 px, mép tối mảnh 40% hai bên."""
    sd = ndi.distance_transform_edt(~sm) - ndi.distance_transform_edt(sm)
    dist = np.abs(sd - 1.0)
    core = np.clip(3.0 - dist, 0, 1)
    edge = np.clip(4.4 - dist, 0, 1) - core
    a = np.clip(core + edge * 0.4, 0, 1)
    ys, xs = np.nonzero(a > 0)
    x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
    lum = np.where(a > 0, core / np.maximum(core + edge * 0.4, 1e-6), 0)
    rgba = np.zeros((y1 - y0, x1 - x0, 4), np.uint8)
    rgba[..., 0] = rgba[..., 1] = rgba[..., 2] = (np.clip(lum[y0:y1, x0:x1], 0, 1) * 255).astype(np.uint8)
    rgba[..., 3] = (a[y0:y1, x0:x1] * 255).astype(np.uint8)
    return rgba, (x0, y0, x1, y1)


def bake(work, only):
    os.makedirs(f'{work}/assets', exist_ok=True)
    sess = lama_session()
    meta = {}
    for room, objs in load_objects().items():
        img = Image.open(f'{ROOMS}/{room}.jpg').convert('RGB')
        W, H = img.size
        arr = np.asarray(img).astype(np.float64) / 255
        masks = {o['id']: np.asarray(Image.open(f'{work}/masks/{room}__{o["id"]}.png')) > 127 for o in objs}
        # Vùng lấp = mask nới xuống dưới cho món đứng trên sàn ("shadow"), để bóng đổ dưới chân món không bị kéo vào phần lấp.
        fills = {}
        for o in objs:
            m = masks[o['id']].copy()
            for dy in range(1, int(o.get('shadow', 0) * H) + 1):
                m[dy:] |= masks[o['id']][:-dy]
            fills[o['id']] = m
        # Che mọi món của phòng khỏi ngữ cảnh khi lấp: phần lấp của một món không lấy điểm ảnh của món khác,
        # nên xóa một món hay nhiều món chồng nhau (tivi trên kệ, sofa cạnh bàn trà) đều khớp, không còn bóng ma.
        everything = np.zeros((H, W), bool)
        for m in fills.values():
            everything |= ndi.binary_dilation(m, iterations=12)
        meta[room] = []
        for o in objs:
            sm = ndi.gaussian_filter(masks[o['id']].astype(float), 1.6) > 0.5
            ys, xs = np.nonzero(sm)
            bx0, by0, bx1, by1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
            r = lambda v, d: round(float(v) / d, 4)
            box = lambda a, b, c, e: [r(a, W), r(b, H), r(c - a, W), r(e - b, H)]
            entry = {'id': o['id'], 'label': o['label'], 'box': box(bx0, by0, bx1, by1)}

            ring, (ox0, oy0, ox1, oy1) = outline_rgba(sm)
            Image.fromarray(ring, 'RGBA').save(f'{work}/assets/{room}__{o["id"]}__outline.png', optimize=True)
            entry['outline'] = box(ox0, oy0, ox1, oy1)

            if not only or o['id'] in only:
                dil = ndi.binary_dilation(sm | fills[o['id']], iterations=12)
                mg = 32
                fy1 = np.nonzero(fills[o['id']].any(axis=1))[0].max() + 1
                px0, py0, px1, py1 = max(0, bx0 - mg), max(0, by0 - mg), min(W, bx1 + mg), min(H, max(by1, fy1) + mg)
                fill = lama_fill(sess, arr, everything, (bx0, by0, bx1, by1))[py0:py1, px0:px1]
                rng = np.random.default_rng(7)
                fill = np.clip(fill + rng.normal(0, 0.006, fill.shape), 0, 1)
                alpha = np.clip(ndi.gaussian_filter(dil[py0:py1, px0:px1].astype(float), 3.0) * 1.15, 0, 1)
                patch = np.zeros((py1 - py0, px1 - px0, 4), np.uint8)
                patch[..., :3] = (fill * 255).astype(np.uint8)
                patch[..., 3] = (alpha * 255).astype(np.uint8)
                Image.fromarray(patch, 'RGBA').save(f'{work}/assets/{room}__{o["id"]}__patch.webp', quality=88, method=6)
                entry['patch'] = box(px0, py0, px1, py1)
            meta[room].append(entry)
            print(f'bake {room}/{o["id"]}', flush=True)
    if only:
        old = json.load(open(f'{work}/meta.json', encoding='utf-8'))
        for room in meta:
            for e in meta[room]:
                if 'patch' not in e:
                    e['patch'] = next(x['patch'] for x in old[room] if x['id'] == e['id'])
    json.dump(meta, open(f'{work}/meta.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


# ── 3. Sinh dữ liệu cho app ──────────────────────────────────────────────────
def gen(work):
    meta = json.load(open(f'{work}/meta.json', encoding='utf-8'))
    dst = os.path.join(ROOMS, 'objects')
    os.makedirs(dst, exist_ok=True)
    fmt = lambda b: f'x: {b[0]}, y: {b[1]}, w: {b[2]}, h: {b[3]}'
    lines = [
        '/**',
        ' * Đồ có sẵn trong ba ảnh phòng mẫu, giả lập kết quả nhận diện của công cụ Xóa đồ cũ (bản thử).',
        ' * Tách bằng SAM (Segment Anything) rồi dựng sẵn nét viền bám dáng (`outline`) và mảng lấp inpainting LaMa (`patch`).',
        ' * Toạ độ chuẩn hoá theo ảnh phòng. FILE SINH TỰ ĐỘNG bởi scripts/sample-objects/build.py — không sửa tay.',
        ' */',
        "import type { SampleObject } from './samplePhotos';",
        '',
        'export const ROOM_OBJECTS: Record<string, SampleObject[]> = {',
    ]
    for room, objs in meta.items():
        lines.append(f"  '{room}': [")
        for o in objs:
            for kind, ext in (('outline', 'png'), ('patch', 'webp')):
                shutil.copy(f'{work}/assets/{room}__{o["id"]}__{kind}.{ext}', f'{dst}/{room}__{o["id"]}__{kind}.{ext}')
            lines += [
                '    {',
                f"      id: '{o['id']}',",
                f"      label: '{o['label']}',",
                f"      {fmt(o['box'])},",
                f"      outline: {{ source: require('../../assets/rooms/objects/{room}__{o['id']}__outline.png'), {fmt(o['outline'])} }},",
                f"      patch: {{ source: require('../../assets/rooms/objects/{room}__{o['id']}__patch.webp'), {fmt(o['patch'])} }},",
                '    },',
            ]
        lines.append('  ],')
    lines.append('};')
    open(os.path.join(APP, 'src', 'data', 'roomObjects.ts'), 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
    print('gen', sum(len(v) for v in meta.values()), 'món')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('stage', choices=['segment', 'bake', 'gen', 'all'])
    ap.add_argument('--work', required=True)
    ap.add_argument('--only', nargs='*', default=[])
    a = ap.parse_args()
    if a.stage in ('segment', 'all'):
        segment(a.work, a.only)
    if a.stage in ('bake', 'all'):
        bake(a.work, a.only)
    if a.stage in ('gen', 'all'):
        gen(a.work)
