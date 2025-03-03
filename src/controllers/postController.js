const Post = require("../models/postModel");
const Category = require("../models/categoryModel");
const { schedulePostPublish } = require("../utils/scheduler");

// Add a new post
const createPost = async (req, res) => {
  const { categoryId } = req.params;
  const { title, content, tags, publishAt, status } = req.body;

  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const isPublishedImmediately =
      !publishAt || new Date(publishAt) <= new Date();

    const newPost = new Post({
      title,
      content,
      author: req.user ? req.user._id : null,
      tags: tags || [],
      category: categoryId,
      media: req.file ? req.file.filename : null,
      published: status === "published" && isPublishedImmediately,
      publishAt: status === "published" ? publishAt : null,
      status: status || "draft",
    });

    await newPost.save();

    // If the article is published in the future
    if (
      status === "published" &&
      publishAt &&
      new Date(publishAt) > new Date()
    ) {
      schedulePostPublish(newPost, publishAt);
    }

    res.status(201).json({
      message: "Post created successfully",
      post: newPost,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res
      .status(500)
      .json({ message: "Error creating post", error: error.message });
  }
};

// Update article status from draft to published
const publishPost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Update post status to published
    post.status = "published";
    post.published = true;
    await post.save();

    res.status(200).json({
      message: "Post published successfully",
      post,
    });
  } catch (error) {
    console.error("Error publishing post:", error);
    res
      .status(500)
      .json({ message: "Error publishing post", error: error.message });
  }
};

// Update draft (edit article that was saved as draft)
const updateDraft = async (req, res) => {
  const { postId } = req.params;
  const { title, content, tags, media, publishAt, status } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (
      status === "published" &&
      publishAt &&
      new Date(publishAt) > new Date()
    ) {
      // Schedule the post if the post is in the future
      post.status = "published";
      post.publishAt = publishAt;
      schedulePostPublish(post, publishAt);
    } else {
      post.status = "draft";
      post.published = false;
    }

    // Update other field
    post.title = title || post.title;
    post.content = content || post.content;
    post.tags = tags || post.tags;
    post.media = media || req.file ? req.file.filename : null;
    await post.save();

    res.status(200).json({
      message: "Draft updated successfully",
      post,
    });
  } catch (error) {
    console.error("Error updating draft:", error);
    res
      .status(500)
      .json({ message: "Error updating draft", error: error.message });
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
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId).populate("author", "username");
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
  const { postId } = req.params;
  const { title, content, tags, media, publishAt, status } = req.body;

  try {
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { title, content, tags, media, publishAt, status },
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
  const { postId } = req.params;

  try {
    const post = await Post.findByIdAndDelete(postId);
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
  const { postId } = req.params;
  const { comment } = req.body;

  try {
    const post = await Post.findById(postId);
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
  updateDraft,
  publishPost,
};
