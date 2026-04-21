const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["ADMIN", "MANAGER", "VIEWER"],
    default: "VIEWER",
  },
}, { timestamps: true });

module.exports = mongoose.model("User", schema);