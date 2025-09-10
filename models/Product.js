const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    // Pricing
    price: { type: Number, required: true },
    negotiable: { type: Boolean, default: false },

    // Category relations
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory", required: true },

    // Location
    state: { type: String },
    city: { type: String },
    country: { type: String },

    // Product info
    purchaseYear: { type: String },
    condition: { type: String, enum: ["New", "Used", "Refurbished"], default: "Used" },

    // Media
    thumbnail: { type: String },
    images: [{ type: String }],

    // Link to user
    poster: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Product status
    sold: { type: Boolean, default: false },   // <-- Added
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
