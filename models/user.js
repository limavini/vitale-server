const mongoose = require("mongoose");
const Schema =  mongoose.Schema;
const userSchema = new Schema({
  name: String,
  email: String,
  password: String,
  type: String,
  crn: String,
  doctor: { type: Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("User", userSchema);
