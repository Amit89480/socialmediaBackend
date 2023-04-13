const exress=require('express');
const {createPost,likepost,deletePost,getpostoffollwoing,addComment,updatePost, deleteComment,getallpost,unlikePost,getPost}=require('../controllers/Post');
const { isAuthenticated } = require('../middleware/auth');

const router=exress.Router();

router.route("/post/upload").post(isAuthenticated,createPost);
router.route("/post/like/:id").get(isAuthenticated,likepost);
router.route("/post/unlike/:id").get(isAuthenticated,unlikePost);
router.route("/post/:id").put(isAuthenticated,updatePost);
router.route("/post/:id").delete(isAuthenticated,deletePost);
router.route("/post").get(isAuthenticated,getpostoffollwoing);
router.route("/post/comment/:id").post(isAuthenticated,addComment).delete(isAuthenticated,deleteComment);
router.route("/post/allpost").get(isAuthenticated,getallpost);
router.route("/posts/:id").get(isAuthenticated,getPost);



module.exports=router;