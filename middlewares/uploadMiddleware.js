const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Hardcode your Cloudinary credentials directly
cloudinary.config({
  cloud_name: "dtevbtlvj",
  api_key: "199679548174523",
  api_secret: "okWkYH1i6IguiQUfOwPrxIxuLM4",
});

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// File filter to allow only images or PDFs
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, JPEG, PNG, or PDF allowed."), false);
  }
};

const upload = multer({ storage, fileFilter });

// Upload to Cloudinary
const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "chat_attachments",
      resource_type: "auto", // handles both images and PDFs
    });
    fs.unlinkSync(filePath); // remove local file after upload
    return result.secure_url;
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    fs.unlinkSync(filePath); // remove file even on error
    throw err;
  }
};

module.exports = { upload, uploadToCloudinary };
