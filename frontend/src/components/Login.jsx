/**
 * Auth shell — toggles between Sign In and Sign Up panels.
 */

import React, { useState } from "react";
import "../styles/login.css";
import SignInForm from "./SignIn";
import SignUpForm from "./SignUp";

export default function Login() {
  const [type, setType] = useState("signIn");

  const handleOnClick = (text) => {
    if (text !== type) setType(text);
  };

  const containerClass =
    "container " + (type === "signUp" ? "right-panel-active" : "");

  return (
    <div
      className="App"
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "rgb(0,102,51)",
        paddingTop: "5%",
      }}
    >
      <h1 style={{ color: "white" }}>Deepfake Region Detection</h1>
      <p style={{ color: "#d7ffe8", marginTop: 8 }}>
        Sign in to capture or upload an image for forgery localisation
      </p>
      <div
        className={containerClass}
        id="container"
        style={{ marginLeft: "25%", marginTop: "3%" }}
      >
        <SignUpForm />
        <SignInForm />
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>Log in with your account to continue detection</p>
              <button
                className="ghost"
                id="signIn"
                onClick={() => handleOnClick("signIn")}
              >
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Hello, Friend!</h1>
              <p>Create an account to start analysing images</p>
              <button
                className="ghost"
                id="signUp"
                onClick={() => handleOnClick("signUp")}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
