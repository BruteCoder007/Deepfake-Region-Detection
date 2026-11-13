/**
 * Authenticated webcam capture page.
 * Saves a screenshot to the backend, then continues to the analyse step.
 */

import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/WebcamGrid.css";
import blackscreen from "../assets/blackscreen.png";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function WebcamCapture() {
  axios.defaults.withCredentials = true;

  const [status, setStatus] = useState(false);
  const [faceImg, setFaceImg] = useState(blackscreen);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API}/image/authenticate`)
      .then((res) => {
        if (res.data === "Success") {
          setStatus(true);
        } else {
          setStatus(false);
          navigate("/login");
        }
      })
      .catch((err) => {
        console.error("Authorisation error", err);
        navigate("/login");
      });
  }, [navigate]);

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setFaceImg(imageSrc);
    axios
      .post(`${API}/image/capture`, { faceImg: imageSrc })
      .then((res) => console.log("Saved capture", res.data))
      .catch((err) => console.error(err));
  };

  if (!status) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        color: "white",
        padding: "2rem",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ textAlign: "center" }}>Capture Face Image</h2>
      <div className="webcam-grid" style={{ position: "relative", height: "auto" }}>
        <Webcam
          width={500}
          height={400}
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="webcam-video"
        />
        <div style={{ marginLeft: "5%", marginTop: "1rem" }}>
          <img
            src={faceImg}
            alt="Captured preview"
            width={500}
            height={400}
            style={{ borderRadius: 40, objectFit: "cover" }}
          />
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
        <button onClick={captureImage}>Capture Image</button>
        <button
          style={{ marginLeft: 16 }}
          onClick={() => navigate("/generate")}
        >
          Continue to Analyse
        </button>
      </div>
    </div>
  );
}
