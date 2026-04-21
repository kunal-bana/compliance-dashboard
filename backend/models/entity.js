const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: String,
  type: String,
  status: String,
}, { timestamps: true });

module.exports = mongoose.model("Entity", schema);