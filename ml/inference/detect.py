"""
Fake-region detection inference.

Loads a DeepLabV3+ (ResNet101) segmentation model and predicts a pixel-wise
mask that highlights manipulated (fake) regions in an input face/image.

Usage:
    python detect.py --image path/to/image.jpg [--output path/to/mask.jpg]
"""

from __future__ import annotations

import argparse
import os
from pathlib import Path

import albumentations as album
import cv2
import numpy as np
import pandas as pd
import segmentation_models_pytorch as smp
import torch

# ---------------------------------------------------------------------------
# Paths — default to repo-relative locations so the project is portable
# ---------------------------------------------------------------------------
REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_MODEL = REPO_ROOT / "models" / "best_model.pth"
DEFAULT_LABELS = Path(__file__).resolve().parent / "label_class_dict.csv"
DEFAULT_OUTPUT = REPO_ROOT / "backend" / "uploads" / "detected_region.jpg"

ENCODER = "resnet101"
ENCODER_WEIGHTS = "imagenet"
PAD_SIZE = 1536
CROP_SIZE = 1500
# Optional center crop used by the original demo UI (face-focused region)
DISPLAY_CROP = (600, 900, 600, 900)  # y1, y2, x1, x2


def to_tensor(x: np.ndarray, **_kwargs) -> np.ndarray:
    """Convert HWC image to CHW float32 tensor layout."""
    return x.transpose(2, 0, 1).astype("float32")


def reverse_one_hot(image: np.ndarray) -> np.ndarray:
    """Collapse one-hot / multi-channel mask to a single class-index map."""
    return np.argmax(image, axis=-1)


def colour_code_segmentation(image: np.ndarray, label_values: np.ndarray) -> np.ndarray:
    """Map class indices to RGB colours using the label dictionary."""
    return np.array(label_values)[image.astype(int)]


def crop_image(image: np.ndarray, target_size: int = CROP_SIZE) -> np.ndarray:
    """Remove padding introduced by PadIfNeeded (center crop)."""
    image_size = len(image)
    padding = (image_size - target_size) // 2
    return image[padding : image_size - padding, padding : image_size - padding, :]


def load_label_palette(label_csv: Path):
    """Read class names and RGB values; keep only real / fake classes."""
    class_dict = pd.read_csv(label_csv)
    class_names = class_dict["name"].tolist()
    class_rgb_values = class_dict[["r", "g", "b"]].values.tolist()

    select_classes = ["real", "fake"]
    select_indices = [class_names.index(cls.lower()) for cls in select_classes]
    select_rgb = np.array(class_rgb_values)[select_indices]
    return select_classes, select_rgb


def preprocess_image(image_path: str, preprocessing_fn) -> np.ndarray:
    """Load, pad to PAD_SIZE, normalize with encoder preprocessing, to CHW."""
    image = cv2.cvtColor(cv2.imread(image_path), cv2.COLOR_BGR2RGB)

    padded = album.PadIfNeeded(
        min_height=PAD_SIZE,
        min_width=PAD_SIZE,
        always_apply=True,
        border_mode=0,
    )(image=image)["image"]

    transform = album.Compose(
        [
            album.Lambda(image=preprocessing_fn),
            album.Lambda(image=to_tensor),
        ]
    )
    return transform(image=padded)["image"]


def run_inference(
    image_path: str,
    model_path: Path,
    label_csv: Path,
    output_path: Path,
    device: str = "cpu",
    show_window: bool = False,
) -> np.ndarray:
    """Run DeepLabV3+ inference and write the colour-coded fake mask."""
    select_classes, select_rgb = load_label_palette(label_csv)
    torch_device = torch.device(device)

    print(f"[detect] device={torch_device}")
    print(f"[detect] loading model from {model_path}")
    model = torch.load(str(model_path), map_location=torch_device)
    model.eval()
    print("[detect] Loaded DeepLabV3+ (ResNet101) checkpoint.")

    preprocessing_fn = smp.encoders.get_preprocessing_fn(ENCODER, ENCODER_WEIGHTS)
    preprocessed = preprocess_image(image_path, preprocessing_fn)

    with torch.no_grad():
        x_tensor = torch.from_numpy(preprocessed).to(torch_device).unsqueeze(0)
        pred_mask = model(x_tensor)
        pred_mask = pred_mask.detach().squeeze().cpu().numpy()

    # CHW → HWC
    pred_mask = np.transpose(pred_mask, (1, 2, 0))
    colour_mask = crop_image(colour_code_segmentation(reverse_one_hot(pred_mask), select_rgb))

    # Face-focused crop for the demo UI (matches original notebook behaviour)
    y1, y2, x1, x2 = DISPLAY_CROP
    display_mask = colour_mask[y1:y2, x1:x2].astype(np.uint8)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    # OpenCV expects BGR
    cv2.imwrite(str(output_path), cv2.cvtColor(display_mask, cv2.COLOR_RGB2BGR))
    print(f"[detect] wrote mask → {output_path}")

    if show_window:
        cv2.imshow("detected fake region", display_mask)
        cv2.waitKey(4000)
        cv2.destroyAllWindows()

    return display_mask


def parse_args():
    parser = argparse.ArgumentParser(description="Detect fake/manipulated image regions.")
    parser.add_argument(
        "--image",
        required=True,
        help="Path to the input image",
    )
    parser.add_argument(
        "--model",
        default=os.environ.get("MODEL_PATH", str(DEFAULT_MODEL)),
        help="Path to best_model.pth",
    )
    parser.add_argument(
        "--labels",
        default=os.environ.get("LABEL_DICT_PATH", str(DEFAULT_LABELS)),
        help="Path to label_class_dict.csv",
    )
    parser.add_argument(
        "--output",
        default=os.environ.get("DETECT_OUTPUT", str(DEFAULT_OUTPUT)),
        help="Where to write the detection mask",
    )
    parser.add_argument(
        "--device",
        default="cuda" if torch.cuda.is_available() else "cpu",
        help="torch device (cpu or cuda)",
    )
    parser.add_argument(
        "--show",
        action="store_true",
        help="Open an OpenCV window with the result",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    if not Path(args.image).is_file():
        raise FileNotFoundError(f"Input image not found: {args.image}")
    if not Path(args.model).is_file():
        raise FileNotFoundError(
            f"Model weights not found: {args.model}\n"
            "Place best_model.pth under models/ (see models/README.md)."
        )

    run_inference(
        image_path=args.image,
        model_path=Path(args.model),
        label_csv=Path(args.labels),
        output_path=Path(args.output),
        device=args.device,
        show_window=args.show,
    )


if __name__ == "__main__":
    main()
