const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const measureSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  waist: Number,
  height: Number,
  weight: Number
});

module.exports = mongoose.model("User", measureSchema);
