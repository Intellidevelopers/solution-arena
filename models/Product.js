const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    price: { type: Number, required: true },
    negotiable: { type: Boolean, default: false },

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory", required: true },

    state: { type: String },
    city: { type: String },
    country: { type: String },

    purchaseYear: { type: String },
    condition: { type: String, enum: ["New", "Used", "Refurbished"], default: "Used" },

    thumbnail: { type: String },
    images: [{ type: String }],

    poster: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    sold: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Product || mongoose.model("Product", ProductSchema);
