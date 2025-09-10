// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { 
  createProduct,
  getProducts,
  getUserListings,
  getProductsBySubCategory,   // ✅ add this
  markProductAsSold           // ✅ add this
} = require('../controllers/productController');

const { protect } = require('../middlewares/authMiddleware');
const Product = require('../models/Product');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management APIs
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *               - category
 *               - state
 *               - city
 *               - country
 *               - condition
 *               - thumbnail
 *             properties:
 *               title:
 *                 type: string
 *                 example: "iPhone 14 Pro"
 *               description:
 *                 type: string
 *                 example: "Brand new iPhone 14 Pro with warranty"
 *               price:
 *                 type: number
 *                 example: 1200
 *               negotiable:
 *                 type: boolean
 *                 example: true
 *               category:
 *                 type: string
 *                 example: "64e23f2c5a12b34234abcd12"
 *               subCategory:
 *                 type: string
 *                 example: "64e23f2c5a12b34234abcd34"
 *               state:
 *                 type: string
 *                 example: "California"
 *               city:
 *                 type: string
 *                 example: "San Francisco"
 *               country:
 *                 type: string
 *                 example: "USA"
 *               purchaseYear:
 *                 type: string
 *                 example: "2023"
 *               condition:
 *                 type: string
 *                 example: "New"
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Poster required or invalid data
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  protect,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 5 }
  ]),
  createProduct
);

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Products fetched successfully
 *       500:
 *         description: Server error
 */
router.get('/', getProducts);

/**
 * @swagger
 * /products/my-listings:
 *   get:
 *     summary: Get listings of logged-in user
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User listings fetched successfully
 *       500:
 *         description: Server error
 */
router.get("/my-listings", protect, getUserListings);

/**
 * @swagger
 * /products/product/{id}:
 *   get:
 *     summary: Get product details by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product fetched successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get("/product/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId)
      .populate("poster", "firstName lastName email address avatar state city businessName")
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

/**
 * @swagger
 * /products/seller/{sellerId}:
 *   get:
 *     summary: Get all products by a seller
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID
 *     responses:
 *       200:
 *         description: Products fetched successfully
 *       500:
 *         description: Failed to fetch products
 */
router.get("/seller/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;
    const products = await Product.find({ poster: sellerId }).sort({ createdAt: -1 });

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
});

/**
 * @swagger
 * /products/category/{categoryId}/{subCategoryId}:
 *   get:
 *     summary: Get products by category and subcategory
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *       - in: path
 *         name: subCategoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Subcategory ID
 *     responses:
 *       200:
 *         description: Products fetched successfully
 *       404:
 *         description: No products found
 *       500:
 *         description: Server error
 */
// GET products by category + subCategory
router.get("/subcategory/:subCategoryId", getProductsBySubCategory);


/**
 * @swagger
 * /products/sold/{productId}:
 *   put:
 *     summary: Mark a product as sold
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product marked as sold
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.put("/:id/sold", markProductAsSold);


module.exports = router;


