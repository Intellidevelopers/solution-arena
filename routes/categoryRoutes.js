const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryControllers");

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *           description: Category title
 *         icon:
 *           type: string
 *           description: Category icon URL
 *         productCount:
 *           type: string
 *           description: Number of products in category
 *         subcategories:
 *           type: array
 *           items:
 *             type: object
 *       example:
 *         _id: 64df8f1bcf1a2c0
 *         title: Electronics
 *         icon: https://example.com/icon.png
 *         productCount: 2K+ products
 *         subcategories: []
 */

/**
 * @swagger
 * /category:
 *   post:
 *     summary: Create a new category
 *     tags: [Category]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       201:
 *         description: Category created successfully
 *       500:
 *         description: Server error
 */
router.post("/", categoryController.createCategory);

/**
 * @swagger
 * /category:
 *   get:
 *     summary: Get all categories with product count & subcategories
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
router.get("/", categoryController.getCategories);

/**
 * @swagger
 * /category/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: Category updated
 *       404:
 *         description: Category not found
 */
router.put("/:id", categoryController.updateCategory);

/**
 * @swagger
 * /category/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted
 *       404:
 *         description: Category not found
 */
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
