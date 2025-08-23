// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const productController = require('../controllers/productController');
const { protect } = require('../middlewares/authMiddleware');
const Product = require('../models/Product');


// Handle multiple fields: images[] and videos[]
router.post(
  "/",
  protect,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 5 }
  ]),
  productController.createProduct
);


router.get('/', productController.getProducts);
router.get("/my-listings", protect, productController.getUserListings);
router.get("/product/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId)
      .populate("poster", "firstName lastName email address avatar state city")
      .populate("category", "name")
      .populate("subCategory", "name");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});


module.exports = router;
