const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier'); // For buffer to stream

// Helper to upload buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, folder, resourceType) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      mainPrice,
      discountedPrice,
      category,
      subCategory,   // 👈 NEW
      city,
      state,
      brand,
      model,
      type,
      exchangePossible,
      description,
      openToNegotiation,
      quantity,
      attributes      // 👈 NEW (array of { name, value })
    } = req.body;

    let imageUrls = [];
    let videoUrls = [];

    // Upload images
    if (req.files?.images) {
      for (let img of req.files.images) {
        const uploadedImage = await uploadToCloudinary(img.buffer, "products/images", "image");
        imageUrls.push(uploadedImage.secure_url);
      }
    }

    // Upload videos
    if (req.files?.videos) {
      for (let vid of req.files.videos) {
        const uploadedVideo = await uploadToCloudinary(vid.buffer, "products/videos", "video");
        videoUrls.push(uploadedVideo.secure_url);
      }
    }

    const product = new Product({
      title,
      mainPrice,
      discountedPrice,
      category,
      subCategory,  // 👈 included
      city,
      state,
      brand,
      model,
      type,
      exchangePossible,
      description,
      openToNegotiation,
      quantity,
      images: imageUrls,
      videos: videoUrls,
      attributes   // 👈 included
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};


exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
