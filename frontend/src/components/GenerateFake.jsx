/**
 * Analyse step — upload an image (or reuse the webcam capture) and
 * trigger DeepLabV3+ fake-region detection on the backend.
 */

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/analyse.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function GenerateFake() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError("");
  };

  /** Upload a chosen file and run detection. */
  const analyseUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please choose an image first.");
      return;
    }
    navigate("/loading");
    const formData = new FormData();
    formData.append("image", file);
    try {
      await axios.post(`${API}/api/upload`, formData, {
        withCredentials: true,
      });
      navigate("/result");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Analysis failed");
      navigate("/generate");
    }
  };

  /**
   * Analyse the last webcam capture already stored as realimage.jpg
   * on the server (written by /image/capture).
   */
  const analyseCaptured = async () => {
    navigate("/loading");
    try {
      // Re-fetch result path by asking the server to re-run on the stable upload
      const response = await fetch(`${API}/uploads/realimage.jpg`);
      if (!response.ok) {
        throw new Error("No captured image found. Capture one first.");
      }
      const blob = await response.blob();
      const formData = new FormData();
      formData.append("image", blob, "realimage.jpg");
      await axios.post(`${API}/api/upload`, formData, { withCredentials: true });
      navigate("/result");
    } catch (err) {
      console.error(err);
      setError(err.message || "Analysis failed");
      navigate("/generate");
    }
  };

  return (
    <div className="analyse-page">
      <h1>Analyse Image</h1>
      <p>
        Upload a face image, or analyse the photo you just captured with the
        webcam. The DeepLabV3+ model highlights manipulated (fake) regions.
      </p>

      <form className="analyse-form" onSubmit={analyseUpload}>
        <input type="file" accept="image/*" onChange={onFileChange} />
        {preview && (
          <img src={preview} alt="Preview" className="analyse-preview" />
        )}
        <div className="analyse-actions">
          <button type="submit">Upload &amp; Detect</button>
          <button type="button" onClick={analyseCaptured}>
            Detect Last Capture
          </button>
          <button type="button" onClick={() => navigate("/capture")}>
            Back to Camera
          </button>
        </div>
      </form>

      {error && <p className="analyse-error">{error}</p>}
    </div>
  );
}
