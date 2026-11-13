/**
 * Optional image metadata schema (URL / path of uploaded face images).
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const imagesSchema = new Schema({
  faceImg: {
    type: String,
  },
});

module.exports = mongoose.model("Image", imagesSchema);
