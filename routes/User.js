const exress=require('express');
const { register ,login, followUser,logout,updatePassword,updateProfile,deleteMyProfile,getUserProfile,myProfile,getAllUsers,forgotPassword, resetPassword,unfollowUser} = require('../controllers/User');
const { isAuthenticated } = require('../middleware/auth');



const router=exress.Router();


router.route('/register').post(register);
router.route('/authenticate').post(login);
router.route('/follow/:id').get(isAuthenticated,followUser);
router.route('/unfollow/:id').get(isAuthenticated,unfollowUser);
router.route("/logout").get(isAuthenticated,logout);
router.route("/update/password").put(isAuthenticated,updatePassword);
router.route("/update/profile").put(isAuthenticated,updateProfile);
router.route("/delete/profile").delete(isAuthenticated,deleteMyProfile);

router.route("/user").get(isAuthenticated,myProfile);

router.route("/user/:id").get(isAuthenticated,getUserProfile);

router.route("/users").get(isAuthenticated,getAllUsers);

router.route("/forgot/password").post(forgotPassword);

router.route("/password/reset/:token").put(resetPassword);


module.exports=router;