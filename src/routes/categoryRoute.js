const express = require("express");
const {
  checkAdmin,
  checkAdminOrEditor,
  checkUser,
} = require("../middleware/roleMiddleware");
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  deleteCategory,
  updateCategory,
} = require("../controllers/categoryController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/categories", verifyToken, checkAdminOrEditor, createCategory);
router.get("/categories", getAllCategories);
router.get("/categories/:id", verifyToken, checkUser, getCategoryById);
router.put("/categories/:id", verifyToken, checkAdminOrEditor, updateCategory);
router.delete(
  "/categories/:id",
  verifyToken,
  checkAdminOrEditor,
  deleteCategory
);

module.exports = router;
