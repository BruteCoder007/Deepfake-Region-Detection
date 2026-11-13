/**
 * Express API for Facial Forgery / Deepfake Region Detection.
 *
 * Responsibilities:
 *  - Auth (signup / login via JWT cookie)
 *  - Webcam / file image upload
 *  - Trigger Python DeepLabV3+ inference on uploaded images
 */

const path = require("path");
const fs = require("fs");
const { execFile } = require("child_process");

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

// ---------------------------------------------------------------------------
// Configuration (env-overridable, portable defaults)
// ---------------------------------------------------------------------------
const REPO_ROOT = path.resolve(__dirname, "..");
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/FinalYearProject";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(__dirname, "uploads");
const DETECT_SCRIPT =
  process.env.DETECT_SCRIPT ||
  path.join(REPO_ROOT, "ml", "inference", "detect.py");
const PYTHON_BIN = process.env.PYTHON_BIN || "python3";
const MODEL_PATH =
  process.env.MODEL_PATH || path.join(REPO_ROOT, "models", "best_model.pth");

// Ensure upload directory exists
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const app = express();

app.use(
  cors({
    origin: [FRONTEND_ORIGIN],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json({ limit: "15mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(UPLOAD_DIR));
app.use("/images", express.static(path.join(__dirname, "images")));

// ---------------------------------------------------------------------------
// MongoDB
// ---------------------------------------------------------------------------
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

// ---------------------------------------------------------------------------
// Multer — store uploaded images for detection
// ---------------------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    // Stable name so the detector and frontend can find the latest upload
    cb(null, "realimage" + path.extname(file.originalname || ".jpg"));
  },
});
const upload = multer({ storage });

/**
 * Run the Python detection script against an image on disk.
 * Returns a Promise that resolves with { stdout, stderr, outputMask }.
 */
function runDetection(imagePath) {
  const outputMask = path.join(UPLOAD_DIR, "detected_region.jpg");
  const args = [
    DETECT_SCRIPT,
    "--image",
    imagePath,
    "--model",
    MODEL_PATH,
    "--output",
    outputMask,
  ];

  return new Promise((resolve, reject) => {
    execFile(PYTHON_BIN, args, { timeout: 120000 }, (error, stdout, stderr) => {
      if (error) {
        console.error("Detection failed:", error.message);
        console.error(stderr);
        return reject(error);
      }
      console.log(stdout);
      resolve({ stdout, stderr, outputMask });
    });
  });
}

// ---------------------------------------------------------------------------
// Detection / upload endpoints
// ---------------------------------------------------------------------------

/** Upload an image and run fake-region detection. */
app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded." });
    }
    console.log("[api/upload] received", req.file.filename);
    const result = await runDetection(req.file.path);
    return res.json({
      message: "Image uploaded and analysed successfully",
      input: `/uploads/${req.file.filename}`,
      mask: `/uploads/${path.basename(result.outputMask)}`,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Detection failed. Ensure model weights and Python deps are installed.",
      error: err.message,
    });
  }
});

/**
 * Stub for AttGAN / StarGAN-based fake generation.
 * Wire this to ml/attgan when generation checkpoints are available.
 */
app.post("/api/generate", (_req, res) => {
  return res.status(501).json({
    message:
      "Fake generation endpoint is reserved for AttGAN/StarGAN integration. Use /api/upload with an existing image for detection.",
  });
});

/** Return the latest detection mask if present. */
app.get("/api/result", (_req, res) => {
  const maskPath = path.join(UPLOAD_DIR, "detected_region.jpg");
  const inputPath = path.join(UPLOAD_DIR, "realimage.jpg");
  if (!fs.existsSync(maskPath)) {
    return res.status(404).json({ message: "No detection result yet." });
  }
  return res.json({
    input: fs.existsSync(inputPath) ? "/uploads/realimage.jpg" : null,
    mask: "/uploads/detected_region.jpg",
  });
});

// ---------------------------------------------------------------------------
// Feature routers
// ---------------------------------------------------------------------------
const imageUploadApi = require("./routes/imageuploadapi");
const loginApi = require("./routes/login");

app.use("/image", imageUploadApi);
app.use("/authenticationapi", loginApi);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Uploads → ${UPLOAD_DIR}`);
  console.log(`Detector → ${DETECT_SCRIPT}`);
});
