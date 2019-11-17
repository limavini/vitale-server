const mongoose = require("mongoose");
const Schema =  mongoose.Schema;
const userSchema = new Schema({
  name: String,
  email: String,
  password: String,
  type: String,
  doctor: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
