// controllers/postController.js
const Post = require("../models/postModel");
const Category = require("../models/categoryModel");

// Add a new post
const createPost = async (req, res) => {
  const { categoryId } = req.params;
  const { title, content, tags } = req.body;

  const category = await Category.findById(categoryId);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  try {
    const newPost = new Post({
      title,
      content,
      author: req.user._id,
      tags: tags,
      category: categoryId,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: "Error creating post" });
  }
};

// Get all posts
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username")
      .populate("category", "name");
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts" });
  }
};

// Get a single post by ID
const getPostById = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id).populate("author", "username");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Error fetching post" });
  }
};

// Update an existing post
const updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { title, content },
      { new: true, runValidators: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating post", error: error.message });
  }
};

// Delete a post
const deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findByIdAndDelete(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post" });
  }
};

// Add a comment to a post
const addComment = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      user: req.user._id,
      comment,
    });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: "Error adding comment" });
  }
};

// Delete comment to a post
const deleteComment = async (req, res) => {
  const { postId, commentId } = req.params;

  try {
    const post = await Post.findByIdAndUpdate(
      postId,
      { $pull: { comments: { _id: commentId } } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Comment deleted successfully", post });
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment", error });
  }
};

// Add like to post
const addLikePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user._id;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.likedBy.includes(userId)) {
      return res.status(400).json({ message: "You already liked this post" });
    }

    post.likes += 1;
    post.likedBy.push(userId);
    await post.save();

    res.json({ message: "Post liked", post });
  } catch (error) {
    res.status(500).json({ message: "Error liking the post", error });
  }
};

// Remove like to post
const removeLikePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user._id;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!post.likedBy.includes(userId)) {
      return res.status(400).json({ message: "You have not liked this post" });
    }

    post.likes -= 1;
    post.likedBy = post.likedBy.filter((id) => id.toString() !== userId);
    await post.save();

    res.json({ message: "Post unliked", post });
  } catch (error) {
    res.status(500).json({ message: "Error unliking the post", error });
  }
};

// Add like to comment
const addLikeComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const userId = req.user._id;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the user has already liked the comment
    if (comment.likedBy.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You already liked this comment" });
    }

    // Increment the like count and add the user to the likedBy list
    comment.likes += 1;
    comment.likedBy.push(userId);

    await post.save();

    res.json({ message: "Comment liked", comment });
  } catch (error) {
    res.status(500).json({ message: "Error liking the comment", error });
  }
};

// Remove like to comment
const removeLikeComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const { userId } = req.user._id;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the user has liked the comment
    if (!comment.likedBy.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You have not liked this comment" });
    }

    // Remove the like by decrementing the like count and removing the user from the likedBy array
    comment.likes -= 1;
    comment.likedBy = comment.likedBy.filter((id) => id.toString() !== userId);

    await post.save();

    res.json({ message: "Like removed from the comment", comment });
  } catch (error) {
    res.status(500).json({ message: "Error unliking the comment", error });
  }
};

// Search post by tags
const searchPostsByTag = async (req, res) => {
  const { tag } = req.query;

  if (!tag) {
    return res.status(400).json({ message: "Tag query parameter is required" });
  }

  try {
    // Search using regular expression ignoring case
    const posts = await Post.find({ tags: { $regex: new RegExp(tag, "i") } });

    if (posts.length === 0) {
      return res.status(404).json({ message: "No posts found with this tag" });
    }

    res.status(200).json({ posts });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error searching posts by tag", error: error.message });
  }
};

module.exports = {
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
};
