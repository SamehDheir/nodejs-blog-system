const express = require("express");
const upload = require("../middleware/uploadMiddleware");
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
  addLikePost,
  removeLikePost,
  addLikeComment,
  removeLikeComment,
  searchPostsByTag,
  publishPost,
  updateDraft,
} = require("../controllers/postController");
const { verifyToken } = require("../middleware/authMiddleware");
const router = express.Router();

router.post(
  "/posts/:categoryId",
  verifyToken,
  checkAdminOrEditor,
  upload.single("file"),
  createPost
);
router.put("/posts/publish/:postId", publishPost);

router.put("/posts/:postId", updateDraft);

router.get("/posts", getAllPosts);

router.get("/posts/search", searchPostsByTag);

router.get("/posts/postId", verifyToken, checkAdminOrEditor, getPostById);

router.put("/posts/postId", verifyToken, checkAdminOrEditor, updatePost);

router.delete("/posts/postId", verifyToken, checkAdmin, deletePost);

router.post("/posts/postId/comments", verifyToken, checkUser, addComment);

router.delete(
  "/posts/:postId/comments/:commentId",
  verifyToken,
  checkUser,
  deleteComment
);

router.post("/posts/postId/like", verifyToken, checkUser, addLikePost);

router.post("/posts/postId/unlike", verifyToken, checkUser, removeLikePost);

router.post(
  "/posts/:postId/comments/:commentId/like",
  verifyToken,
  checkUser,
  addLikeComment
);

router.post(
  "/posts/:postId/comments/:commentId/unlike",
  verifyToken,
  checkUser,
  removeLikeComment
);

module.exports = router;
