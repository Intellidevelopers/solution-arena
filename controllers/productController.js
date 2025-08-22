// controllers/productController.js
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// ✅ helper to upload buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, folder, resourceType) => {
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

// ✅ Create product
exports.createProduct = async (req, res) => {
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
      condition
    } = req.body;

    let thumbnailUrl = "";
    let imageUrls = [];

    // 🔹 Upload thumbnail (first file field)
    if (req.files?.thumbnail && req.files.thumbnail[0]) {
      thumbnailUrl = await uploadToCloudinary(
        req.files.thumbnail[0].buffer,
        "products/thumbnail",
        "image"
      );
    }

    // 🔹 Upload images (array of files)
    if (req.files?.images) {
      for (let img of req.files.images) {
        const uploaded = await uploadToCloudinary(img.buffer, "products/images", "image");
        imageUrls.push(uploaded);
      }
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
      poster: req.user.id // 👈 logged-in user
    });

    await product.save();

    // Populate before sending back
    const savedProduct = await Product.findById(product._id)
      .populate("category", "name")
      .populate("subCategory", "name")
      .populate("poster", "name email");

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: savedProduct
    });
  } catch (error) {
    console.error("❌ Error creating product:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};


// ✅ Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .populate("subCategory", "name")
      .populate("poster", "name email");

    res.json({
      success: true,
      message: "Products fetched successfully",
      data: products
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// ✅ Get listings of logged-in user
exports.getUserListings = async (req, res) => {
  try {
    const userId = req.user.id;

    const listings = await Product.find({ poster: userId })
      .populate("category", "name")
      .populate("subCategory", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "User listings fetched successfully",
      data: listings
    });
  } catch (error) {
    console.error("❌ Error fetching user listings:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
