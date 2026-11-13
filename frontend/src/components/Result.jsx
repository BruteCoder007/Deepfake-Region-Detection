/**
 * Result page — shows the input image beside the predicted fake-region mask.
 */

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import successAnim from "../assets/animations/success.json";
import "../styles/analyse.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Result() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API}/api/result`)
      .then((res) => setResult(res.data))
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || "No result available");
      });
  }, []);

  const withCacheBust = (url) =>
    url ? `${API}${url}?t=${Date.now()}` : null;

  return (
    <div className="result-page">
      <div style={{ width: 160, height: 160 }}>
        <Lottie animationData={successAnim} loop={false} />
      </div>
      <h1>Detection Result</h1>
      <p>
        White pixels mark regions the model classified as{" "}
        <strong>fake / manipulated</strong>. Black marks authentic regions.
      </p>

      {error && <p className="analyse-error">{error}</p>}

      {result && (
        <div className="result-grid">
          {result.input && (
            <figure>
              <img src={withCacheBust(result.input)} alt="Input" />
              <figcaption>Input</figcaption>
            </figure>
          )}
          <figure>
            <img src={withCacheBust(result.mask)} alt="Fake region mask" />
            <figcaption>Predicted fake-region mask</figcaption>
          </figure>
        </div>
      )}

      <div className="analyse-actions">
        <button onClick={() => navigate("/generate")}>Analyse Another</button>
        <button onClick={() => navigate("/capture")}>Back to Camera</button>
      </div>
    </div>
  );
}
