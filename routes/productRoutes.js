// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const productController = require('../controllers/productController');
const { protect } = require('../middlewares/authMiddleware');


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

module.exports = router;
