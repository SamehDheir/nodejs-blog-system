const Category = require("../models/categoryModel");

// Create Category
exports.createCategory = async (req, res) => {
  const { name } = req.body;
  try {
    const newCategory = new Category({ name });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: "Error creating category" });
  }
};

// Get all Categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories" });
  }
};

// Get a single Category by ID
exports.getCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Error fetching post" });
  }
};

// Update Category
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );
    if (!updatedCategory)
      return res.status(404).json({ message: "Category not found" });

    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: "Category not found" });
  }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory)
      return res.status(404).json({ message: "Category not found" });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error deleting category" });
  }
};
