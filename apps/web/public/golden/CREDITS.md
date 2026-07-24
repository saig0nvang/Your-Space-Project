# Spike assets — sources & licenses (depth-placement spike, YourSpace)

Gathered 2026-07-24. All items are CC0 or a free/open license (CC-BY / CC-BY-SA).
NO copyrighted / IKEA / paid assets. Attribution required for CC-BY and CC-BY-SA
items if any image is redistributed — keep this file with the assets.

## Sofa model

### sofa.glb  (PRIMARY)
- Source page: https://poly.pizza/m/X5kQPKzAWp
- Direct file: https://static.poly.pizza/f627491f-7126-4323-8d01-0be933671078.glb
- Title: "Sofa"  | Author: Quaternius  | Host: Poly Pizza
- License: CC0 1.0 (Public Domain) — no attribution required, commercial OK
- Format: glTF-Binary v2, 206 KB, valid
- SCALE: NOT real-world / not metric. Native bounding box (default scene transform)
  is approx W=4.00 x H=1.45 x D=2.80 in model units (stylized low-poly proportions;
  depth is exaggerated vs a real sofa). To use as metric, NORMALIZE by target width:
  assume a typical 3-seat sofa width 2.0 m -> uniform scale factor ~= 2.0 / 4.00 = 0.50,
  which yields ~2.0 x 0.73 x 1.40 m. Height is plausible; depth stays too deep because
  the mesh proportions are stylized. Treat exact metric metadata as an ASSUMPTION.

### sofa_khronos.glb  (ALTERNATIVE — metric-accurate)
- Source: https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/GlamVelvetSofa
- Direct file: https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/GlamVelvetSofa/glTF-Binary/GlamVelvetSofa.glb
- Title: "Glam Velvet Sofa"  | Author: (c) 2021 Wayfair, LLC
- License: CC BY 4.0 — attribution REQUIRED ("Wayfair, LLC, CC BY 4.0"), commercial OK
- Format: glTF-Binary v2, 3.0 MB, valid, PBR materials
- SCALE: ALREADY real-world metric. World bounding box = W=2.19 x H=0.79 x D=1.02 m
  (a realistic 3-seat sofa). Use this one if you want correct metric size out-of-the-box
  and can carry the attribution string.

Recommended sofa metric metadata for the spike: width 2.0 m, height 0.8 m, depth 0.9 m
(typical 3-seat). sofa_khronos.glb matches this closely; sofa.glb must be normalized.

## Room images (rooms/) — 14 photos, all real photographs

| File | Type | Source page | Author | License |
|------|------|-------------|--------|---------|
| room-01.jpg | living room (bright, wide, cluttered) | https://commons.wikimedia.org/wiki/File:A_standard_living_room_in_Accra.jpg | Kwameghana | CC BY-SA 4.0 |
| room-02.jpg | living room | https://commons.wikimedia.org/wiki/File:At_La_Palma_2021_1854.jpg | Mike Peel (mikepeel.net) | CC BY-SA 4.0 |
| room-03.jpg | living room | https://commons.wikimedia.org/wiki/File:A_Kenya_(11).jpg | Olashxs | CC BY-SA 4.0 |
| room-04.jpg | living room (foreground office chair, CRT — occlusion) | https://commons.wikimedia.org/wiki/File:Aeichem_-_IMG_0080.JPG | Aleichem | CC BY-SA 3.0 |
| room-05.jpg | living room | https://commons.wikimedia.org/wiki/File:7.5_Wohnzimmer._Poliert.jpg | J.Stiegler | CC BY-SA 3.0 |
| room-06.jpg | living space, DARK/moody — art installation w/ translucent film across room | https://commons.wikimedia.org/wiki/File:Amplification_Site_A_Cross_Echo_In_A_Private_Living_Space_001.jpg | Shi Yong | CC0 |
| room-07.jpg | ground-floor room (Vietnam) | https://commons.wikimedia.org/wiki/File:1-_TANG_TRET_(2).jpg | Moc hoa binh | CC BY-SA 4.0 |
| room-08.jpg | bedroom — REAL messy phone shot, tilted, noisy (most representative) | https://commons.wikimedia.org/wiki/File:A_Bedroom_with_a_wooden_bed.jpg | Knites | CC0 |
| room-09.jpg | bedroom (natural window light) | https://commons.wikimedia.org/wiki/File:Bedroom_window_(Unsplash).jpg | Viktoria Hall-Waldhauser | CC0 |
| room-10.jpg | bedroom (dim/moody, foreground bedding — occlusion) | https://commons.wikimedia.org/wiki/File:Bekah_Russom_2017-04-02_(Unsplash).jpg | Bekah Russom | CC0 |
| room-11.jpg | bedroom (apartment, Dnipro UA) | https://commons.wikimedia.org/wiki/File:Bedroom_in_apartment;_Dnipro,_Ukraine;_15.12.19.jpg | VKras | CC BY-SA 4.0 |
| room-12.jpg | bedroom (king size) | https://commons.wikimedia.org/wiki/File:Bedroom_king_size.jpg | IFERREIRO | CC BY-SA 3.0 |
| room-13.jpg | bedroom (parents' room, phone photo) | https://commons.wikimedia.org/wiki/File:Beispiel_Elternschlafzimmer.jpg | HoffnungstraegerStift | CC BY-SA 4.0 |
| room-14.jpg | bedroom (wide) | https://commons.wikimedia.org/wiki/File:Bedroom_with_wooden_bed_(1133).jpg | linhvan | CC BY 3.0 |

All room images are hosted on Wikimedia Commons; the "(Unsplash)" ones were originally
CC0 Unsplash uploads mirrored to Commons. Full-res originals are at the source pages;
room-02..14 were downloaded at 1280px width (thumbnail render) to keep files small,
room-01 is full resolution.

## Representativeness caveat (READ BEFORE TRUSTING SPIKE RESULTS)
Most of these are curated/decent-light photos and skew cleaner than real user phone
photos (which are often blurry, low-light, extreme wide-angle, cluttered, tilted).
Exceptions that ARE realistically messy/hard: room-08 (messy tilted phone shot),
room-06 (dark, art film overlay), room-04 (clutter + cables), room-10 (dim).
This set validates the PIPELINE (does placement/depth run end-to-end), it does NOT
prove robustness on the real long tail of user photos. Collect true in-the-wild phone
photos before drawing quality conclusions.
