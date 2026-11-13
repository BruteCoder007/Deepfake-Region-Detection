/**
 * Sign-in form — posts credentials to the Express auth API.
 */

import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function SignInForm() {
  const navigate = useNavigate();
  const [state, setState] = React.useState({ email: "", password: "" });
  const [message, setMessage] = React.useState(" ");

  const handleChange = (evt) => {
    setState({ ...state, [evt.target.name]: evt.target.value });
  };

  axios.defaults.withCredentials = true;

  const handleOnSubmit = (evt) => {
    evt.preventDefault();
    axios
      .post(`${API}/authenticationapi/login`, state)
      .then((res) => {
        if (res.data.Status === "Success" && res.data.role === "visitor") {
          navigate("/capture");
        } else {
          setMessage("Login succeeded but role is not visitor.");
        }
      })
      .catch((err) => {
        setMessage(err.response?.data?.message || "Login failed");
        console.error(err);
      });
  };

  return (
    <div className="form-container sign-in-container">
      <form onSubmit={handleOnSubmit}>
        <h1>Sign in</h1>
        <span>Use your registered email</span>
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={state.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={state.password}
          onChange={handleChange}
          required
        />
        <div style={{ color: "#ff416c", fontSize: 15, paddingTop: 15 }}>
          {message}
        </div>
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}

export default SignInForm;
