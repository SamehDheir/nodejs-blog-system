const express = require("express");
const {
  checkAdmin,
  checkAdminOrEditor,
  checkUser,
} = require("../middleware/roleMiddleware");
const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  addComment,
  deleteComment,
  addLike,
  deleteLike,
} = require("../controllers/postController");
const { verifyToken } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/posts/:categoryId", verifyToken, checkAdminOrEditor, createPost);

router.get("/posts", getAllPosts);

router.get("/posts/:id", verifyToken, checkAdminOrEditor, getPostById);

router.put("/posts/:id", verifyToken, checkAdminOrEditor, updatePost);

router.delete("/posts/:id", verifyToken, checkAdmin, deletePost);

router.post("/posts/:id/comments", verifyToken, checkUser, addComment);

router.delete(
  "/posts/:postId/comments/:commentId",
  verifyToken,
  checkUser,
  deleteComment
);

router.post("/posts/:id/like", verifyToken, checkUser, addLike);

router.post("/posts/:id/unlike", verifyToken, checkUser, deleteLike);

module.exports = router;
