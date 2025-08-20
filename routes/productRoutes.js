// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const productController = require('../controllers/productController');

// Handle multiple fields: images[] and videos[]
router.post(
  '/',
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'videos', maxCount: 2 }
  ]),
  productController.createProduct
);

router.get('/', productController.getProducts);

module.exports = router;
