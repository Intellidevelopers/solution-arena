// models/Product.js
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    mainPrice: { type: Number, required: true },
    discountedPrice: { type: Number },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory", required: true },

    // Product extra info
    brand: { type: String },
    model: { type: String },
    type: { type: String },
    exchangePossible: { type: Boolean, default: false },
    description: { type: String },
    openToNegotiation: { type: Boolean, default: false },
    quantity: { type: Number, default: 1 },

    // Media
    images: [{ type: String }],
    videos: [{ type: String }],

    // Dynamic attributes (RAM, Storage, Warranty, etc.)
    attributes: [
      {
        name: String,  // e.g. "RAM"
        value: String, // e.g. "16GB"
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
