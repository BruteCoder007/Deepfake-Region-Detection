# Architecture

## End-to-end flow

1. **Frontend (`frontend/`)** — React Router screens for auth, webcam capture, upload/analyse, loading, and result.
2. **Backend (`backend/`)** — Express serves JSON APIs, stores users in MongoDB, accepts uploads via Multer, and shells out to Python.
3. **Inference (`ml/inference/detect.py`)** — Loads DeepLabV3+ weights, pads/normalises the image, predicts a real/fake mask, writes `detected_region.jpg`.
4. **Data generation (`ml/attgan/`)** — Offline AttGAN pipeline used historically to synthesise attribute-edited faces for training the segmenter.

## Detection preprocessing

- Pad to 1536×1536
- Encoder-specific ImageNet normalisation (ResNet101)
- Inference → argmax over classes → RGB colour coding
- Center-crop back to 1500×1500, then a face-focused window for the demo UI

## Class palette

| Class | RGB |
|-------|-----|
| real | (0, 0, 0) |
| fake | (255, 255, 255) |
