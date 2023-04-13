const Post = require("../models/Post");
// const posts = require("../models/Post");
const User = require("../models/User");

//create post

exports.createPost = async (req, res, next) => {
  try {
    const newPostData = {
      title: req.body.title,
      description: req.body.description,
      image: {
        public_id: "req.body.image.public_id",
        URL: "req.body.url",
      },
      owner: req.user._id,
    };

    const newPost = await Post.create(newPostData);
    const user = await User.findById(req.user._id);
    user.post.push(newPost._id);
    await user.save();

    res.status(201).json({
      success: true,
      post: newPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized to delete this post",
      });
    }
    await post.deleteOne();
    const user = await User.findById(req.user._id);
    const index = user.post.indexOf(req.params.id);
    user.post.splice(index, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Here we are writing the code for like  post
exports.likepost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    if (post.likes.filter((like) => like.user.toString() === req.user._id).length > 0) {
      return res.status(401).json({
        success: false,
        message: "Post already liked",
      });
    }
    post.likes.unshift({ user: req.user._id });
    await post.save();
    res.status(200).json({
      success: true,
      message: "Post liked successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}


//Get all posts
exports.getpostoffollwoing = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const posts = await Post.find({
      owner: {
        $in: user.following,
      },
    });
    res.status(200).json({
      success: true,
      posts: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//updating post

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized to update this post",
      });
    }

    post.caption = req.body.caption;
    await post.save();
    res.status(200).json({
      success: true,
      message: "Post updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//add  comments
exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    const comment = {
      user: req.user._id, // Assuming the user ID is available in req.user._id after authentication
      text: req.body.text,
    };
    post.comments.unshift(comment);
    await post.save();
    res.status(200).json({
      success: true,
      message: "Comment added successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//delete comment
exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    if (post.owner.toString() === req.user._id.toString()) {
      if (req.body.commentId === undefined) {
        return res
          .status(404)
          .json({ success: false, message: "Comment not found" });
      }
      post.comments.forEach((item, index) => {
        if (item._id.toString() === req.body.commentId.toString()) {
          return post.comments.splice(index, 1);
        }
      });
      await post.save();
      return res
        .status(200)
        .json({ success: true, message: "Comment deleted successfully" });
    } else {
      post.comments.forEach((item, index) => {
        if (item.user.toString() === req.user._id.toString()) {
          return post.comments.splice(index, 1);
        }
      });
      await post.save();
      return res
        .status(200)
        .json({
          success: true,
          message: "selected Comment deleted successfully",
        });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete comment" });
  }
};


// get all posts



exports.getallpost = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming the user ID is available in req.user._id after authentication
    const posts = await Post.find({ userId: mongoose.Types.ObjectId(userId) }); // Convert userId to ObjectId
    res.status(200).json({
      success: true,
      posts: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//unlike a post

exports.unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const userId = req.user._id;

    // Check if the user has already liked the post
    if (!post.likes) {
      post.likes = [];
    }
    const likedIndex = post.likes.findIndex(
      (like) => like.user && like.user.toString() === userId
    );
    if (likedIndex !== -1) {
      // If so, remove the like
      post.likes.splice(likedIndex, 1);
      await post.save();
      return res.status(200).json({
        success: true,
        message: "Post unliked",
      });
    } else {
      // If not, add a new like
      post.likes.push({ user: userId });
      await post.save();
      return res.status(200).json({
        success: true,
        message: "Post liked",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    res.status(200).json({
      success: true,
      post: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}







