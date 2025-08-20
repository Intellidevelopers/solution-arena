const Category = require("../models/Category");
const Product = require("../models/Product");

// Create Category
exports.createCategory = async (req, res) => {
  try {
    const { title, icon } = req.body;

    const category = new Category({ title, icon });
    await category.save();

    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get All Categories with Product Count
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    const data = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({ category: cat._id });
        let countDisplay;

        if (count >= 1_000_000) {
          countDisplay = `${(count / 1_000_000).toFixed(1)}M+ products`;
        } else if (count >= 1000) {
          countDisplay = `${(count / 1000).toFixed(0)}K+ products`;
        } else {
          countDisplay = `${count} products`;
        }

        return {
          _id: cat._id,
          title: cat.title,
          icon: cat.icon,
          productCount: countDisplay
        };
      })
    );

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update Category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, icon } = req.body;

    const updated = await Category.findByIdAndUpdate(
      id,
      { title, icon },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "Category not found" });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Category not found" });

    res.json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
