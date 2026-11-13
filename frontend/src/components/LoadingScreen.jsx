/**
 * Loading screen shown while the Python detector runs.
 */

import React from "react";
import Lottie from "lottie-react";
import worldLocations from "../assets/animations/world-locations.json";
import "../styles/analyse.css";

export default function LoadingScreen() {
  return (
    <div className="loading-page">
      <div style={{ width: 280, height: 280 }}>
        <Lottie animationData={worldLocations} loop />
      </div>
      <h2>Detecting forged regions…</h2>
      <p>Running DeepLabV3+ (ResNet101) on your image</p>
    </div>
  );
}
