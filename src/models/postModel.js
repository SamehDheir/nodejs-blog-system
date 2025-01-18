const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    media: {
      type: String,
      default: null,
    },
    published: {
      type: Boolean,
      default: false,
    },
    publishAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);

postSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    this.updatedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model("Post", postSchema);
