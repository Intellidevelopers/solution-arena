// controllers/subCategoryController.js
const SubCategory = require("../models/subCategoryModel");
const Category = require("../models/Category");

// Create SubCategory
exports.createSubCategory = async (req, res) => {
  try {
    const { title, categoryId } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: "Parent category not found" });
    }

    const subCategory = new SubCategory({ title, category: categoryId });
    await subCategory.save();

    res.status(201).json({ success: true, data: subCategory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all subcategories for a category
exports.getSubCategories = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const subCategories = await SubCategory.find({ category: categoryId });
    res.json({ success: true, data: subCategories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update subcategory
exports.updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const updated = await SubCategory.findByIdAndUpdate(
      id,
      { title },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "SubCategory not found" });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete subcategory
exports.deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await SubCategory.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "SubCategory not found" });

    res.json({ success: true, message: "SubCategory deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
