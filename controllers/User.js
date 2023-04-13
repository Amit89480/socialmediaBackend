const User = require("../models/User");
const crypto = require("crypto");

const { sendEmail } = require("../middleware/sendEmail");

const Post = require("../models/Post");


//register user

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    user = await User.create({
      name,
      email,
      password,
      avatar: { public_id: "sample_id", url: "sampleurl" },
    });

    const token = await user.generateToken();
    res
      .status(201)
      .cookie("token", token, {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      })
      .json({
        success: true,
        user,
        token: token,
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = await user.generateToken();
    res
      .status(200)
      .cookie("token", token, {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      })
      .json({
        success: true,
        user,
        token: token,
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//folow and unfollow user

exports.followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const loggedInUser = await User.findById(req.user._id);

    if (!userToFollow || !loggedInUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (loggedInUser.following.includes(userToFollow._id)) {
      // Already following, unfollow
      const indexFollowing = loggedInUser.following.indexOf(userToFollow._id);
      const indexFollowers = userToFollow.followers.indexOf(loggedInUser._id);

      loggedInUser.following.splice(indexFollowing, 1);
      userToFollow.followers.splice(indexFollowers, 1);

      await loggedInUser.save();
      await userToFollow.save();

      res.status(200).json({
        success: true,
        message: "User unfollowed successfully",
      });
    } else {
      // Not following, follow
      loggedInUser.following.push(userToFollow._id);
      userToFollow.followers.push(loggedInUser._id);

      await loggedInUser.save();
      await userToFollow.save();

      res.status(200).json({
        success: true,
        message: "User followed successfully",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


//enpoint for unfollow user
exports.unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const loggedInUser = await User.findById(req.user._id);

    if (!userToUnfollow || !loggedInUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (loggedInUser.following.includes(userToUnfollow._id)) {
      // Already following, unfollow
      const indexFollowing = loggedInUser.following.indexOf(userToUnfollow._id);
      const indexFollowers = userToUnfollow.followers.indexOf(loggedInUser._id);

      loggedInUser.following.splice(indexFollowing, 1);
      userToUnfollow.followers.splice(indexFollowers, 1);

      await loggedInUser.save();
      await userToUnfollow.save();

      res.status(200).json({
        success: true,
        message: "User unfollowed successfully",
      });
    } else {
      // Not following, follow
      loggedInUser.following.push(userToUnfollow._id);
      userToUnfollow.followers.push(loggedInUser._id);

      await loggedInUser.save();
      await userToUnfollow.save();

      res.status(200).json({
        success: true,
        message: "User followed successfully",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//user Logout

exports.logout = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })
      .json({
        success: true,
        message: "Logged out successfully",
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


//update password
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please enter old and new password",
      });
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//update user profile

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const { name, email } = req.body;
    if (name) {
      user.name = name;
    }
    if (email) {
      user.email = email;
    }
    //user avatar to do

    await user.save();
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


//delete my profile
exports.deleteMyProfile = async (req, res) => {
  try {
    // Find the user by their ID
    const user = await User.findById(req.user._id);
    const posts = user.post; // Get the posts from the user object

    // Delete the user's posts
    for (let i = 0; i < posts.length; i++) {
      await Post.deleteOne({ _id: posts[i] }); // Use Post.deleteOne() to delete post
    }
    //removing user from followers's  following
    for (let i = 0; i < user.followers.length; i++) {
      const follower = await User.findById(user.followers[i]);
      const index = follower.following.indexOf(user._id);
      follower.following.splice(index, 1);
      await follower.save();
    }

    // removing user from following's followers
    for (let i = 0; i < user.following.length; i++) {
      const following = await User.findById(user.following[i]);
      const index = following.followers.indexOf(user._id);
      following.followers.splice(index, 1);
      await following.save();
    }

    // Delete the user from the database
    await User.deleteOne({ _id: req.user._id }); // Use User.deleteOne() to delete user

    // Logout user by clearing token cookie
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    // Send success response
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//get my profile with number of followers and following

exports.myProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("post");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

//get user profile

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("post");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//forgot password

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const resetPasswordtoken = user.getResetPasswordToken();
    await user.save();

    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/password/reset/${resetPasswordtoken}`;
    const message = `Reset your password by clicking on the link below:\n\n ${resetUrl}`;
    try {
      await sendEmail({
        email: user.email,
        subject: "Password reset request",
        message,
      });
      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email}`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({
        success: false,
        message: "Email could not be sent",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



exports.resetPassword = async (req, res) => {
  try {

    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
    const user=await User.findOne({
      resetPasswordToken,
      resetPasswordExpire:{$gt:Date.now()}
    });

    if(!user){
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    };
user.password=req.body.password;
user.resetPasswordToken=undefined;
user.resetPasswordExpire=undefined;
await user.save();

res.status(200).json({
  success: true,
  message: "Password reset successfully",
})
    if(req.body.password !== req.body.confirmPassword){
      return res.status(400).json({
        success: false,
        message: "Password does not match",
      });
    }



    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,

    });
    
  }
};
