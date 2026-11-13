/**
 * Simple file-upload helper (optional / debugging).
 */

import React, { useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Upload = () => {
  const [faceImg, setFaceImg] = useState(null);

  const onFileChange = (e) => {
    setFaceImg(e.target.files[0]);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!faceImg) return;
    const formData = new FormData();
    formData.append("image", faceImg);
    axios
      .post(`${API}/api/upload`, formData, { withCredentials: true })
      .then((res) => console.log(res.data))
      .catch((err) => console.error(err));
  };

  return (
    <div className="container">
      <form onSubmit={onSubmit}>
        <input type="file" accept="image/*" onChange={onFileChange} />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default Upload;
