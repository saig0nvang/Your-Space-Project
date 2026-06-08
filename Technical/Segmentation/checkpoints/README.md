# SAM2 checkpoints

Dat checkpoint SAM2 trong folder nay.

Mac dinh service tim file:

```text
Segmentation/checkpoints/sam2.1_hiera_small.pt
```

Neu GPU 4GB bi thieu VRAM, tai checkpoint tiny va sua
`Segmentation/config/settings.json`:

```json
{
  "model_name": "sam2.1_hiera_tiny",
  "model_config": "configs/sam2.1/sam2.1_hiera_t.yaml",
  "checkpoint": "checkpoints/sam2.1_hiera_tiny.pt"
}
```

Nguon chinh thuc: https://github.com/facebookresearch/sam2

