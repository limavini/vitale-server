const mongoose = require("mongoose");
const Schema =  mongoose.Schema;
const mealSchema = new Schema({
  name: String,
  diet: { type: Schema.Types.ObjectId, ref: "Diet" },
  foods: [String],
  schedule: Date
});

module.exports = mongoose.model("Meal", mealSchema);
