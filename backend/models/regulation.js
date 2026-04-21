const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  title: String,
  code: String,
  status: String,
}, { timestamps: true });

module.exports = mongoose.model("Regulation", schema);