/**
 * Image capture & session auth helpers.
 * Webcam frames arrive as base64 data-URLs from the React client.
 */

const express = require("express");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "jwt-secret-key";
const IMAGES_DIR = path.join(__dirname, "..", "images");

fs.mkdirSync(IMAGES_DIR, { recursive: true });

/** Middleware — require a valid visitor JWT cookie. */
const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json("Token is missing");
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error(err);
      return res.json("Error with the token");
    }
    if (decoded.role === "visitor") {
      return next();
    }
    return res.json("Not a User");
  });
};

router.get("/authenticate", verifyUser, (_req, res) => {
  return res.json("Success");
});

/** Persist a webcam screenshot (base64) under backend/images/. */
router.post("/capture", (req, res) => {
  const { faceImg } = req.body;
  if (!faceImg) {
    return res.status(400).json({ error: "No image data provided." });
  }

  const data = faceImg.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(data, "base64");
  const fileName = `Image_${Date.now()}.jpg`;
  const filePath = path.join(IMAGES_DIR, fileName);

  // Also keep a stable copy for the detector pipeline
  const uploadsDir = path.join(__dirname, "..", "uploads");
  fs.mkdirSync(uploadsDir, { recursive: true });
  const stablePath = path.join(uploadsDir, "realimage.jpg");

  fs.writeFile(filePath, buffer, (err) => {
    if (err) {
      console.error("Error saving the image:", err);
      return res.status(500).json({ error: "Error converting the image." });
    }
    fs.writeFileSync(stablePath, buffer);
    return res.json({ jpgImageUrl: `/images/${fileName}` });
  });
});

module.exports = router;
