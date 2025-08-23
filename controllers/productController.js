// controllers/productController.js
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

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
      poster,
    } = req.body;

    const thumbnailFile = req.files?.thumbnail?.[0];
    const imageFiles = req.files?.images || [];

    let thumbnailUrl = "";
    if (thumbnailFile) {
      thumbnailUrl = await uploadToCloudinary(thumbnailFile.buffer, "products/thumbnails");
    }

    const imageUrls = [];
    for (const file of imageFiles) {
      const url = await uploadToCloudinary(file.buffer, "products/images");
      imageUrls.push(url);
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
      thumbnail: thumbnailUrl,
      images: imageUrls,
      poster,
    });

    const savedProduct = await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: savedProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .populate("subCategory", "name")
      .populate("poster", "name email");

    res.json({
      success: true,
      message: "Products fetched successfully",
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

module.exports = {
  createProduct,
  getProducts,
  getUserListings,
};
