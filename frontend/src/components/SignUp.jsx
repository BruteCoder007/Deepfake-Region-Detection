/**
 * Sign-up form — creates a visitor account via the Express auth API.
 */

import React from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function SignUpForm() {
  const [state, setState] = React.useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = React.useState("");

  const handleChange = (evt) => {
    setState({ ...state, [evt.target.name]: evt.target.value });
  };

  const handleOnSubmit = (evt) => {
    evt.preventDefault();
    axios
      .post(`${API}/authenticationapi/signup`, { state })
      .then((res) => {
        setMessage(res.data.message);
        setState({ name: "", email: "", password: "" });
      })
      .catch((err) => {
        console.error(err);
        setMessage(err.response?.data?.message || "Error creating user");
      });
  };

  return (
    <div className="form-container sign-up-container">
      <form onSubmit={handleOnSubmit}>
        <h1>Create Account</h1>
        <span>Register with email</span>
        <input
          type="text"
          name="name"
          value={state.name}
          onChange={handleChange}
          placeholder="Name"
          required
        />
        <input
          type="email"
          name="email"
          value={state.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password"
          value={state.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        <button type="submit">Sign Up</button>
        <div
          style={{ color: "rgb(0,102,52)", fontSize: 15, paddingTop: 15 }}
        >
          {message}
        </div>
      </form>
    </div>
  );
}

export default SignUpForm;
