// controllers/productController.js
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const mongoose = require("mongoose");

// helper to upload buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, folder, resourceType = "image") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (result) resolve(result.secure_url);
        else reject(error);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// Create product
const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      negotiable,
      category,
      subCategory,
      state,
      city,
      country,
      purchaseYear,
      condition,
      thumbnail,
      images,
    } = req.body;

    const poster = req.user?._id; // ✅ get from auth middleware

    if (!poster) {
      return res.status(400).json({ success: false, message: "Poster is required" });
    }

    const product = new Product({
      title,
      description,
      price,
      negotiable,
      category,
      subCategory,
      state,
      city,
      country,
      purchaseYear,
      condition,
      thumbnail,
      images,
      poster, // ✅ set poster
      sold: false
    });

    const savedProduct = await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: savedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};


// Get all products
// Get all unsold products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({
  $or: [{ sold: false }, { sold: { $exists: false } }]
})
.populate("category", "name")
.populate("subCategory", "name")
.populate("poster", "firstName lastName email address avatar")
.sort({ createdAt: -1 });


    res.json({
      success: true,
      message: "Unsold products fetched successfully",
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


// Get listings of logged-in user
const getUserListings = async (req, res) => {
  try {
    const userId = req.user.id;

    const listings = await Product.find({ poster: userId })
      .populate("category", "name")
      .populate("subCategory", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "User listings fetched successfully",
      data: listings,
    });
  } catch (error) {
    console.error("Error fetching user listings:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ✅ Get products by subCategory only
const getProductsBySubCategory = async (req, res) => {
  try {
    const { subCategoryId } = req.params;

    console.log("Incoming subCategoryId:", subCategoryId);

    const products = await Product.find({ subCategory: subCategoryId });

    console.log("Found products:", products);

    if (!products.length) {
      return res.status(404).json({ success: false, message: "No products found" });
    }

    res.json({
      success: true,
      message: "Products fetched successfully",
      data: products
    });
  } catch (err) {
    console.error("Error fetching by subCategory:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// ✅ Mark product as sold
const markProductAsSold = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      { sold: true },   // ✅ corrected from isSold
      { new: true }
    ).populate("category subCategory poster");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product marked as sold", data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Delete product listing
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Only the poster can delete their product
    if (product.poster.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this product",
      });
    }

    await Product.findByIdAndDelete(id);

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};




// ✅ Edit product
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Only the poster can edit their product
    if (product.poster.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized to edit this product" });
    }

    const updates = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true,
    })
      .populate("category", "name")
      .populate("subCategory", "name")
      .populate("poster", "firstName lastName email avatar");

    res.json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (err) {
    console.error("Error editing product:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// ✅ Mark product as unsold
const markProductAsUnsold = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // ✅ Only the poster can mark as unsold
    if (product.poster.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    product.sold = false;
    await product.save();

    await product.populate("category subCategory poster");

    res.json({ success: true, message: "Product marked as unsold", data: product });
  } catch (err) {
    console.error("Error marking product as unsold:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};




module.exports = {
  createProduct,
  getProducts,
  getUserListings,
  getProductsBySubCategory,
  markProductAsSold,
  markProductAsUnsold,
  deleteProduct,
  editProduct
};

