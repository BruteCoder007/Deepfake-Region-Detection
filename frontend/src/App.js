/**
 * App routes for the Deepfake Region Detection UI.
 *
 * Flow: Login → Webcam Capture → Upload / Analyse → Loading → Result
 */

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WebcamCapture from "./components/WebcamCapture";
import Login from "./components/Login";
import GenerateFake from "./components/GenerateFake";
import Result from "./components/Result";
import LoadingScreen from "./components/LoadingScreen";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/capture" element={<WebcamCapture />} />
        <Route path="/generate" element={<GenerateFake />} />
        <Route path="/loading" element={<LoadingScreen />} />
        <Route path="/result" element={<Result />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
