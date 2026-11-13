/**
 * User schema for authentication.
 * Default role "visitor" unlocks the capture / detection flow.
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    default: "visitor",
  },
});

module.exports = mongoose.model("users", userSchema);
