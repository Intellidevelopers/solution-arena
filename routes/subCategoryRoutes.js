// routes/subCategoryRoutes.js
const express = require("express");
const router = express.Router();
const subCategoryController = require("../controllers/subCategoryController");

/**
 * @swagger
 * tags:
 *   name: SubCategories
 *   description: API for managing subcategories
 */

/**
 * @swagger
 * /subcategories:
 *   post:
 *     summary: Create a new subcategory
 *     tags: [SubCategories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - categoryId
 *             properties:
 *               title:
 *                 type: string
 *               categoryId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subcategory created successfully
 *       404:
 *         description: Parent category not found
 *       500:
 *         description: Server error
 */
router.post("/", subCategoryController.createSubCategory);

/**
 * @swagger
 * /subcategories/{categoryId}:
 *   get:
 *     summary: Get all subcategories for a category
 *     tags: [SubCategories]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The parent category ID
 *     responses:
 *       200:
 *         description: List of subcategories
 *       500:
 *         description: Server error
 */
router.get("/:categoryId", subCategoryController.getSubCategories);

/**
 * @swagger
 * /subcategories/{id}:
 *   put:
 *     summary: Update a subcategory
 *     tags: [SubCategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The subcategory ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subcategory updated successfully
 *       404:
 *         description: Subcategory not found
 *       500:
 *         description: Server error
 */
router.put("/:id", subCategoryController.updateSubCategory);

/**
 * @swagger
 * /subcategories/{id}:
 *   delete:
 *     summary: Delete a subcategory
 *     tags: [SubCategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The subcategory ID
 *     responses:
 *       200:
 *         description: Subcategory deleted successfully
 *       404:
 *         description: Subcategory not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", subCategoryController.deleteSubCategory);

module.exports = router;
