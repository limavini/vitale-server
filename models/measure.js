const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const measureSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "Measure" },
  waist: Number,
  height: Number,
  weight: Number,
  hip: Number,
}, {
  timestamps: true
});

module.exports = mongoose.model("Measure", measureSchema);
