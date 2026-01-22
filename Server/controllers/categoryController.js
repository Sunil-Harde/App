const Category = require('../models/Category');

// Get All
const getCategories = async (req, res) => {
  const categories = await Category.find({}).sort({ createdAt: -1 });
  res.json(categories);
};

// Create
const createCategory = async (req, res) => {
  const { name, color } = req.body;
  const categoryExists = await Category.findOne({ name });

  if (categoryExists) {
    res.status(400).json({ message: 'Category already exists' });
    return;
  }

  const category = await Category.create({ name, color });
  res.status(201).json(category);
};

// Delete
const deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (category) {
    await category.deleteOne();
    res.json({ message: 'Category removed' });
  } else {
    res.status(404).json({ message: 'Category not found' });
  }
};

// Update
const updateCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (category) {
    category.name = req.body.name || category.name;
    category.color = req.body.color || category.color;
    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } else {
    res.status(404).json({ message: 'Category not found' });
  }
};

module.exports = { getCategories, createCategory, deleteCategory, updateCategory };