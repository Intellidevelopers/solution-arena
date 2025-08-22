// models/SubCategory.js
const mongoose = require("mongoose");

const SubCategorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true }, // parent category
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubCategory", SubCategorySchema);
