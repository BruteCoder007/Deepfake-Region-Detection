# Deepfake Region Detection

Final-year project that **localises manipulated (fake) regions** in face images using a DeepLabV3+ segmentation model, with a React web UI and Express API. Synthetic forgeries for training were produced with attribute-editing GANs ([AttGAN](https://github.com/LynnHo/AttGAN-Tensorflow)).

**Author:** [BruteCoder007](https://github.com/BruteCoder007)

---

## What it does

1. User signs up / logs in
2. Captures a face via webcam **or** uploads an image
3. Backend runs a **DeepLabV3+ (ResNet101)** model
4. UI shows a colour-coded mask — white ≈ fake / manipulated, black ≈ real

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────────┐
│  React UI   │────▶│  Express API │────▶│  Python detector    │
│  (frontend) │◀────│  + MongoDB   │◀────│  DeepLabV3+ / Torch │
└─────────────┘     └──────────────┘     └─────────────────────┘
```

---

## Repository layout

```
.
├── frontend/                 # React (Create React App) web client
│   └── src/components/       # Login, webcam, analyse, result screens
├── backend/                  # Express + MongoDB API
│   ├── server.js             # App entry, upload + detection orchestration
│   ├── routes/               # Auth & capture routes
│   └── models/               # Mongoose schemas
├── ml/
│   ├── inference/            # Portable DeepLabV3+ inference script
│   │   ├── detect.py
│   │   ├── label_class_dict.csv
│   │   └── requirements.txt
│   ├── attgan/               # AttGAN (TensorFlow) — synthetic data generation
│   └── data/                 # Label metadata & sample references
├── models/                   # Place best_model.pth here (not committed)
├── samples/                  # Example test images
├── docs/                     # Extra notes
├── .env.example
└── README.md
```

---

## Prerequisites

- **Node.js** 16+ and npm
- **Python** 3.9+ (3.10 recommended)
- **MongoDB** running locally (default `mongodb://127.0.0.1:27017`)
- Trained weights: `models/best_model.pth` (~175MB — not in Git)

---

## Setup

### 1. Clone

```bash
git clone https://github.com/BruteCoder007/Deepfake-Region-Detection.git
cd Deepfake-Region-Detection
```

### 2. Model weights

Copy your trained checkpoint:

```bash
cp /path/to/best_model.pth models/best_model.pth
```

### 3. Python detector

```bash
cd ml/inference
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Quick smoke test (no server):

```bash
python detect.py --image ../../samples/test-images/test7.jpg --show
```

### 4. Backend

```bash
cd backend
cp ../.env.example ../.env         # optional overrides
npm install
npm start                          # http://localhost:5000
```

### 5. Frontend

```bash
cd frontend
npm install
npm start                          # http://localhost:3000
```

Optional: set `REACT_APP_API_URL=http://localhost:5000` in `frontend/.env`.

---

## API overview

| Method | Path | Description |
|--------|------|-------------|
| POST | `/authenticationapi/signup` | Create visitor account |
| POST | `/authenticationapi/login` | Login → JWT cookie |
| GET | `/image/authenticate` | Check session |
| POST | `/image/capture` | Save webcam base64 frame |
| POST | `/api/upload` | Upload image + run detection |
| GET | `/api/result` | Latest input + mask URLs |
| GET | `/health` | Liveness check |

---

## Machine learning notes

| Piece | Detail |
|-------|--------|
| Task | Binary semantic segmentation (`real` / `fake`) |
| Architecture | DeepLabV3+ with **ResNet101** ImageNet encoder |
| Library | [`segmentation-models-pytorch`](https://github.com/qubvel/segmentation_models.pytorch) |
| Labels | `ml/inference/label_class_dict.csv` |
| Synthetic data | AttGAN / StarGAN attribute edits (see `ml/attgan/`) |

AttGAN code is a third-party TensorFlow implementation (LynnHo et al., TIP 2019). See `ml/attgan/LICENSE` and `ml/attgan/README.md`.

---

## Environment variables

See [`.env.example`](.env.example). Important keys:

- `MONGODB_URI` — Mongo connection string  
- `JWT_SECRET` — change in any real deployment  
- `MODEL_PATH` — override path to `best_model.pth`  
- `PYTHON_BIN` — interpreter used by the API (`python3` by default)

---

## Security notes

- Default JWT secret is for **local demos only** — set `JWT_SECRET` before any shared deployment
- Do not commit personal documents, credentials, or model weights
- Uploaded images stay under `backend/uploads/` (gitignored)

---

## License

Application code: MIT (unless noted otherwise).  
AttGAN subtree: see `ml/attgan/LICENSE`.
